/**
 * Server-side helper to broadcast messages via the WebSocket server.
 *
 * The Next.js API route calls `broadcastMessage()` after persisting a
 * new chat message. This function POSTs to the WS server's internal
 * `/broadcast` endpoint, which fans the event out to all connected
 * WebSocket clients in the relevant rooms.
 */

const WS_INTERNAL_URL = process.env.WS_INTERNAL_URL || 'http://localhost:3001'
const WS_INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET || 'ws-internal-secret'

/**
 * Broadcast a new message to all relevant WebSocket rooms:
 *   - conv:{conversationId}  — active chat window
 *   - coach:{coachId}        — coach inbox / sidebar
 *   - user:{userId}          — user notification
 */
export async function broadcastMessage(
  conversationId: string,
  coachId: string,
  userId: string,
  data: object,
) {
  const rooms = [`conv:${conversationId}`, `coach:${coachId}`, `user:${userId}`]

  try {
    await fetch(`${WS_INTERNAL_URL}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WS_INTERNAL_SECRET}`,
      },
      body: JSON.stringify({ rooms, data }),
    })
  } catch (err) {
    // Log but don't throw — the message is already persisted in the DB.
    // The client will pick it up on next reconnect or history fetch.
    console.error('[broadcastMessage] Failed to reach WS server:', err)
  }
}
