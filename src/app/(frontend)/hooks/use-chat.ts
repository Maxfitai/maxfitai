'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Lightweight WebSocket hook for real-time chat.
 *
 * Features:
 *   - Auto-reconnect with exponential back-off (max 10 s)
 *   - Application-level ping/pong keep-alive
 *   - Room join/leave management
 *   - Message deduplication (by message id)
 *   - Connection-status tracking
 */

export interface ChatMessage {
  id: string
  content: string
  sender: string | { id: string; value?: string }
  senderType?: string
  createdAt: string
  conversationId?: string
}

type MessageHandler = (msg: ChatMessage) => void

interface UseChatOptions {
  /** Rooms to join immediately on connect (e.g. ["conv:abc", "coach:xyz"]) */
  rooms: string[]
  /** Called for every incoming message from joined rooms */
  onMessage: MessageHandler
  /** Whether the hook should connect at all (default: true) */
  enabled?: boolean
}

const WS_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_WS_URL ??
      (window.location.protocol === 'https:'
        ? `wss://${window.location.host}/ws`
        : `ws://${window.location.hostname}:3001`))
    : ''

const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 10_000
const PING_INTERVAL_MS = 25_000

export function useChat({ rooms, onMessage, enabled = true }: UseChatOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const attemptRef = useRef(0)
  const [isConnected, setIsConnected] = useState(false)

  // Keep latest callback ref so effect doesn't re-fire when handler changes
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  // Keep latest rooms ref
  const roomsRef = useRef(rooms)
  roomsRef.current = rooms

  // Track which rooms we've successfully joined
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  // Deduplication: remember last N message IDs
  const seenIdsRef = useRef<Set<string>>(new Set())
  const seenQueueRef = useRef<string[]>([])
  const MAX_SEEN = 500

  const markSeen = useCallback((id: string): boolean => {
    if (seenIdsRef.current.has(id)) return false // duplicate
    seenIdsRef.current.add(id)
    seenQueueRef.current.push(id)
    if (seenQueueRef.current.length > MAX_SEEN) {
      const old = seenQueueRef.current.shift()!
      seenIdsRef.current.delete(old)
    }
    return true // new
  }, [])

  const cleanup = useCallback(() => {
    if (pingTimer.current) clearInterval(pingTimer.current)
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    pingTimer.current = null
    reconnectTimer.current = null
  }, [])

  const joinRooms = useCallback((ws: WebSocket, targetRooms: string[]) => {
    if (ws.readyState === WebSocket.OPEN && targetRooms.length > 0) {
      ws.send(JSON.stringify({ type: 'join', rooms: targetRooms }))
    }
  }, [])

  const leaveRooms = useCallback((ws: WebSocket, targetRooms: string[]) => {
    if (ws.readyState === WebSocket.OPEN && targetRooms.length > 0) {
      ws.send(JSON.stringify({ type: 'leave', rooms: targetRooms }))
    }
  }, [])

  const connect = useCallback(() => {
    if (!WS_URL) return

    cleanup()

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        attemptRef.current = 0
        setIsConnected(true)

        // Join requested rooms
        joinRooms(ws, roomsRef.current)

        // Application-level ping keep-alive
        pingTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, PING_INTERVAL_MS)
      }

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data)
          if (envelope.type === 'message' && envelope.data) {
            const msg: ChatMessage = envelope.data
            if (msg.id && markSeen(msg.id)) {
              onMessageRef.current(msg)
            }
          } else if (envelope.type === 'joined' && Array.isArray(envelope.rooms)) {
            for (const r of envelope.rooms) joinedRoomsRef.current.add(r)
          }
          // 'connected' and 'pong' are silently consumed
        } catch {
          // ignore malformed frames
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        joinedRoomsRef.current.clear()
        cleanup()

        // Exponential back-off reconnect
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attemptRef.current, RECONNECT_MAX_MS)
        attemptRef.current++
        reconnectTimer.current = setTimeout(connect, delay)
      }

      ws.onerror = () => {
        // onclose will fire after onerror — reconnect handled there
        ws.close()
      }
    } catch {
      // schedule reconnect
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attemptRef.current, RECONNECT_MAX_MS)
      attemptRef.current++
      reconnectTimer.current = setTimeout(connect, delay)
    }
  }, [cleanup, joinRooms, markSeen])

  // Connect / disconnect based on `enabled`
  useEffect(() => {
    if (!enabled) {
      cleanup()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setIsConnected(false)
      return
    }

    connect()

    return () => {
      cleanup()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      joinedRoomsRef.current.clear()
      setIsConnected(false)
    }
  }, [enabled, connect, cleanup])

  // When rooms array changes, compute diff and join/leave accordingly
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    const current = new Set(rooms)
    const joined = joinedRoomsRef.current

    const toJoin = rooms.filter((r) => !joined.has(r))
    const toLeave = Array.from(joined).filter((r) => !current.has(r))

    if (toLeave.length > 0) leaveRooms(ws, toLeave)
    if (toJoin.length > 0) joinRooms(ws, toJoin)

    // Optimistically update joined set
    for (const r of toLeave) joined.delete(r)
    for (const r of toJoin) joined.add(r)
  }, [rooms, isConnected, joinRooms, leaveRooms])

  /** Manually clear the dedup cache (useful when switching conversations) */
  const clearSeenCache = useCallback(() => {
    seenIdsRef.current.clear()
    seenQueueRef.current = []
  }, [])

  return { isConnected, clearSeenCache }
}
