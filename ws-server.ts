/**
 * Standalone WebSocket server for real-time chat.
 *
 * Runs alongside Next.js on a separate port (default 3001).
 * Manages room-based messaging so every participant receives messages
 * instantly — whether or not they have a specific conversation open.
 *
 * Rooms:
 *   conv:{conversationId}  — per-conversation (active chat window)
 *   coach:{coachId}        — coach-level (sidebar / inbox updates)
 *   user:{userId}          — user-level  (popup notification)
 *
 * Clients join rooms by sending:
 *   { type: "join", rooms: ["conv:abc", "coach:xyz"] }
 *
 * Clients leave rooms by sending:
 *   { type: "leave", rooms: ["conv:abc"] }
 *
 * The Next.js API route broadcasts new messages by POSTing to the
 * internal HTTP endpoint:
 *   POST http://localhost:3001/broadcast
 *   Body: { rooms: ["conv:abc", "coach:xyz", "user:123"], data: {...} }
 */

import { WebSocketServer, WebSocket } from 'ws'
import { createServer, IncomingMessage, ServerResponse } from 'http'

const WS_PORT = parseInt(process.env.WS_PORT || '3001', 10)
const INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET || 'ws-internal-secret'

// ─── Room management ───────────────────────────────────────────────────────
const rooms = new Map<string, Set<WebSocket>>()

function joinRoom(room: string, ws: WebSocket) {
  if (!rooms.has(room)) rooms.set(room, new Set())
  rooms.get(room)!.add(ws)
}

function leaveRoom(room: string, ws: WebSocket) {
  rooms.get(room)?.delete(ws)
  if (rooms.get(room)?.size === 0) rooms.delete(room)
}

function leaveAllRooms(ws: WebSocket) {
  for (const [room, members] of rooms) {
    members.delete(ws)
    if (members.size === 0) rooms.delete(room)
  }
}

function broadcastToRoom(room: string, data: string, exclude?: WebSocket) {
  const members = rooms.get(room)
  if (!members) return
  for (const ws of members) {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  }
}

// ─── HTTP server (for internal broadcast endpoint + WS upgrade) ────────────
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    res.end()
    return
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', connections: wss.clients.size, rooms: rooms.size }))
    return
  }

  // Internal broadcast endpoint — called by Next.js API routes
  if (req.method === 'POST' && req.url === '/broadcast') {
    // Verify internal secret
    const auth = req.headers.authorization
    if (auth !== `Bearer ${INTERNAL_SECRET}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unauthorized' }))
      return
    }

    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        const { rooms: targetRooms, data } = JSON.parse(body)
        const payload = JSON.stringify({ type: 'message', data })

        for (const room of targetRooms) {
          broadcastToRoom(room, payload)
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end()
})

// ─── WebSocket server ──────────────────────────────────────────────────────
const wss = new WebSocketServer({ server })

wss.on('connection', (ws: WebSocket) => {
  // Send a welcome message so the client knows the connection is live
  ws.send(JSON.stringify({ type: 'connected' }))

  // Heartbeat: detect dead connections
  let isAlive = true
  ws.on('pong', () => {
    isAlive = true
  })

  const pingInterval = setInterval(() => {
    if (!isAlive) {
      clearInterval(pingInterval)
      ws.terminate()
      return
    }
    isAlive = false
    ws.ping()
  }, 30_000)

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'join':
          if (Array.isArray(msg.rooms)) {
            for (const room of msg.rooms) {
              if (typeof room === 'string') {
                joinRoom(room, ws)
              }
            }
          }
          ws.send(JSON.stringify({ type: 'joined', rooms: msg.rooms }))
          break

        case 'leave':
          if (Array.isArray(msg.rooms)) {
            for (const room of msg.rooms) {
              if (typeof room === 'string') {
                leaveRoom(room, ws)
              }
            }
          }
          break

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }))
          break

        default:
          break
      }
    } catch {
      // ignore malformed messages
    }
  })

  ws.on('close', () => {
    clearInterval(pingInterval)
    leaveAllRooms(ws)
  })

  ws.on('error', () => {
    clearInterval(pingInterval)
    leaveAllRooms(ws)
  })
})

server.listen(WS_PORT, () => {
  console.log(`[WS] WebSocket server running on port ${WS_PORT}`)
})
