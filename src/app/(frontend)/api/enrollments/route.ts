import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, coachId, planId, notes } = body

    if (!userId || !coachId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, coachId, planId' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // If userId is an email, resolve it to the user's ObjectId
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

    const existingEnrollment = await payload.find({
      collection: 'enrollments' as any,
      where: {
        and: [
          { user: { equals: resolvedUserId } },
          { coach: { equals: coachId } },
          { plan: { equals: planId } },
        ],
      },
    })

    if (existingEnrollment.docs.length > 0) {
      const existing = existingEnrollment.docs[0]
      if (existing.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending enrollment request for this plan' },
          { status: 400 },
        )
      }
      if (existing.status === 'accepted') {
        return NextResponse.json(
          { error: 'You are already enrolled in this plan' },
          { status: 400 },
        )
      }
    }

    const enrollment = await payload.create({
      collection: 'enrollments' as any,
      data: {
        user: resolvedUserId,
        coach: coachId,
        plan: planId,
        status: 'pending',
        paymentStatus: 'pending',
        notes: notes || '',
      },
    })

    await payload.create({
      collection: 'notifications' as any,
      overrideAccess: true,
      data: {
        user: { relationTo: 'coaches', value: coachId },
        type: 'enrollment_request',
        title: 'New Enrollment Request',
        message: 'You have a new enrollment request from a user',
        relatedId: enrollment.id,
        isRead: false,
      },
    })

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      })
    }
    return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const coachId = searchParams.get('coachId')
    const status = searchParams.get('status')

    const payload = await getPayload({ config })

    const where: any = {}

    if (userId) {
      where.user = { equals: userId }
    }

    if (coachId) {
      where.coach = { equals: coachId }
    }

    if (status) {
      where.status = { equals: status }
    }

    const enrollments = await payload.find({
      collection: 'enrollments' as any,
      where,
      sort: '-createdAt',
    })

    return NextResponse.json({ enrollments: enrollments.docs })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}
