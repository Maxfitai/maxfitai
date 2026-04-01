import { NextRequest, NextResponse } from 'next/server'
import { CollectionSlug, getPayload } from 'payload'
import config from '@payload-config'
import { stringify } from 'querystring'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, coachId, enrollmentId } = body

    if (!userId || !coachId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, coachId' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Resolve email to ObjectId if needed
    let resolvedUserId = userId
    if (userId.includes('@')) {
      const userResult = await payload.find({
        collection: 'users',
        where: { email: { equals: userId } },
        limit: 1,
      })
      if (userResult.docs.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      resolvedUserId = userResult.docs[0].id as string
    }

    const existingConversation = await payload.find({
      collection: 'conversations' as any,
      where: {
        and: [{ user: { equals: resolvedUserId } }, { coach: { equals: coachId } }],
      },
    })

    if (existingConversation.docs.length > 0) {
      return NextResponse.json({ conversation: existingConversation.docs[0] })
    }

    const conversation = await payload.create({
      collection: 'conversations' as any,
      data: {
        user: resolvedUserId,
        coach: coachId,
        enrollment: enrollmentId || null,
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        userUnreadCount: 0,
        coachUnreadCount: 0,
      } as any,
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const coachId = searchParams.get('coachId')

    const payload = await getPayload({ config })

    const where: any = {}

    if (userId) {
      let resolvedUserId = userId
      if (userId.includes('@')) {
        const userResult = await payload.find({
          collection: 'users',
          where: { email: { equals: userId } },
          limit: 1,
        })
        resolvedUserId = userResult.docs.length > 0 ? (userResult.docs[0].id as string) : userId
      }
      where.user = { equals: resolvedUserId }
    }

    if (coachId) {
      where.coach = { equals: coachId }
    }

    const conversations = await payload.find({
      collection: 'conversations' as any,
      where,
      sort: '-lastMessageAt',
    })

    const enrichedConversations = await Promise.all(
      conversations.docs.map(async (conv) => {
        const convAny = conv as any
        const userId = typeof convAny.user === 'object' ? convAny.user.id : convAny.user
        const coachId = typeof convAny.coach === 'object' ? convAny.coach.id : convAny.coach
        const user = await payload.findByID({
          collection: 'users',
          id: userId,
          select: { firstName: true, lastName: true, email: true },
        })
        const coach = await payload.findByID({
          collection: 'coaches',
          id: coachId,
          select: { firstName: true, lastName: true },
        })
        return {
          ...conv,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          coachName: coach ? `${coach.firstName} ${coach.lastName}` : 'Unknown Coach',
        }
      }),
    )

    return NextResponse.json({ conversations: enrichedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
