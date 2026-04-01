import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { broadcastMessage } from '@/lib/messageStream'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, senderId, senderType, content } = body

    if (!conversationId || !senderId || !senderType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, senderId, senderType, content' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Resolve senderId from email to ObjectId if needed
    let resolvedSenderId = senderId
    if (typeof senderId === 'string' && senderId.includes('@')) {
      const userResult = await payload.find({
        collection: 'users',
        where: { email: { equals: senderId } },
        limit: 1,
      })
      if (userResult.docs.length === 0) {
        return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
      }
      resolvedSenderId = userResult.docs[0].id as string
    }

    const conversation = await payload.findByID({
      collection: 'conversations' as any,
      id: conversationId,
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const message = await payload.create({
      collection: 'messages' as any,
      overrideAccess: true,
      data: {
        conversation: conversationId,
        sender: {
          relationTo: senderType === 'coach' ? 'coaches' : 'users',
          value: resolvedSenderId,
        },
        content,
        isRead: false,
      },
    })

    // Broadcast new message to all WebSocket subscribers:
    //   - conv:{conversationId}  — active chat window
    //   - coach:{coachId}        — coach inbox / sidebar
    //   - user:{userId}          — user notification
    const rawCoach = conversation.coach
    const rawUser = conversation.user
    const convCoachId = typeof rawCoach === 'object' ? (rawCoach as any).id : rawCoach
    const convUserId = typeof rawUser === 'object' ? (rawUser as any).id : rawUser

    // Fire-and-forget — message is already persisted
    broadcastMessage(conversationId, convCoachId, convUserId, {
      id: message.id,
      content: message.content,
      sender: message.sender,
      senderType,
      createdAt: message.createdAt,
    })

    // Update conversation metadata with retry for MongoDB WriteConflict
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await payload.update({
          collection: 'conversations' as any,
          id: conversationId,
          data: {
            lastMessage: content.substring(0, 100),
            lastMessageAt: new Date().toISOString(),
            userUnreadCount: senderType === 'user' ? 0 : (conversation.userUnreadCount || 0) + 1,
            coachUnreadCount: senderType === 'coach' ? 0 : (conversation.coachUnreadCount || 0) + 1,
          },
        })
        break
      } catch (err: any) {
        const isWriteConflict = err?.code === 112 || err?.codeName === 'WriteConflict'
        if (isWriteConflict && attempt < 2) {
          await new Promise((r) => setTimeout(r, 50 * (attempt + 1)))
          continue
        }
        throw err
      }
    }

    const rawRecipient = senderType === 'user' ? conversation.coach : conversation.user
    const recipientId = typeof rawRecipient === 'object' ? (rawRecipient as any).id : rawRecipient
    const recipientCollection = senderType === 'user' ? 'coaches' : 'users'

    await payload.create({
      collection: 'notifications' as any,
      overrideAccess: true,
      data: {
        user: { relationTo: recipientCollection, value: recipientId },
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message from ${senderType === 'user' ? 'a user' : 'your coach'}`,
        relatedId: conversationId,
        isRead: false,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: conversationId' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const messages = await payload.find({
      collection: 'messages' as any,
      where: {
        conversation: { equals: conversationId },
      },
      sort: 'createdAt',
    })

    return NextResponse.json({ messages: messages.docs })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
