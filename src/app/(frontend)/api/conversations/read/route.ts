import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

/**
 * POST /api/conversations/read
 * Body: { conversationId: string, role: 'coach' | 'user' }
 *
 * Resets the unread counter for the given role to 0.
 * Called when a coach or user opens a conversation to clear the badge.
 *
 * Uses retry logic to handle MongoDB WriteConflict errors that occur
 * when this runs concurrently with /api/messages updating the same doc.
 */
export async function POST(req: NextRequest) {
  try {
    const { conversationId, role } = await req.json()

    if (!conversationId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, role' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    const field = role === 'coach' ? 'coachUnreadCount' : 'userUnreadCount'

    const MAX_RETRIES = 3
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await payload.update({
          collection: 'conversations' as any,
          id: conversationId,
          overrideAccess: true,
          data: { [field]: 0 } as any,
        })
        return NextResponse.json({ ok: true })
      } catch (err: any) {
        const isWriteConflict = err?.code === 112 || err?.codeName === 'WriteConflict'
        if (isWriteConflict && attempt < MAX_RETRIES - 1) {
          // Wait a short time before retrying (50ms, 100ms, ...)
          await new Promise((r) => setTimeout(r, 50 * (attempt + 1)))
          continue
        }
        throw err
      }
    }

    // Should not reach here, but just in case
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error resetting unread count:', error)
    return NextResponse.json({ error: 'Failed to reset unread count' }, { status: 500 })
  }
}
