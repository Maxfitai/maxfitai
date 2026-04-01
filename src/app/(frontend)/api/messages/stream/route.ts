import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * This SSE endpoint has been replaced by a WebSocket server (ws-server.ts).
 * Return 410 Gone so any stale clients know to switch.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'SSE stream has been replaced by WebSocket. Connect to the WS server instead.' },
    { status: 410 },
  )
}
