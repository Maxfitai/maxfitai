import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const coachId = searchParams.get('coachId')
    const planId = searchParams.get('planId')

    if (!userId || !coachId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, coachId' },
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
        return NextResponse.json({ hasActiveEnrollment: false, enrollment: null })
      }
      resolvedUserId = userResult.docs[0].id as string
    }

    const whereConditions: any[] = [
      { user: { equals: resolvedUserId } },
      { coach: { equals: coachId } },
    ]
    if (planId) {
      whereConditions.push({ plan: { equals: planId } })
    }

    const enrollments = await payload.find({
      collection: 'enrollments' as any,
      where: { and: whereConditions },
      sort: '-createdAt',
    })

    if (enrollments.docs.length === 0) {
      return NextResponse.json({
        hasActiveEnrollment: false,
        enrollment: null,
      })
    }

    const activeEnrollment = enrollments.docs.find((e) => e.status === 'accepted')
    const pendingEnrollment = enrollments.docs.find((e) => e.status === 'pending')

    if (activeEnrollment) {
      return NextResponse.json({
        hasActiveEnrollment: true,
        enrollment: activeEnrollment,
        enrollmentStatus: 'accepted',
      })
    }

    if (pendingEnrollment) {
      return NextResponse.json({
        hasActiveEnrollment: false,
        enrollment: pendingEnrollment,
        enrollmentStatus: 'pending',
      })
    }

    return NextResponse.json({
      hasActiveEnrollment: false,
      enrollment: enrollments.docs[0],
      enrollmentStatus: enrollments.docs[0].status,
    })
  } catch (error) {
    console.error('Error checking enrollment status:', error)
    return NextResponse.json({ error: 'Failed to check enrollment status' }, { status: 500 })
  }
}
