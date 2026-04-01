import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, paymentStatus } = body

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: 'Missing required field: status or paymentStatus' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const enrollment = await payload.findByID({
      collection: 'enrollments' as any,
      id,
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const updatedEnrollment = await payload.update({
      collection: 'enrollments' as any,
      id,
      data: updateData,
    })

    if (status === 'accepted') {
      const userId =
        typeof enrollment.user === 'object' ? (enrollment.user as any).id : enrollment.user
      const coachId =
        typeof enrollment.coach === 'object' ? (enrollment.coach as any).id : enrollment.coach

      await payload.create({
        collection: 'notifications' as any,
        overrideAccess: true,
        data: {
          user: { relationTo: 'users', value: userId },
          type: 'enrollment_accepted',
          title: 'Enrollment Accepted',
          message: 'Your enrollment request has been accepted! You can now chat with your coach.',
          relatedId: id,
          isRead: false,
        },
      })

      const existingConversation = await payload.find({
        collection: 'conversations' as any,
        where: {
          and: [{ user: { equals: userId } }, { coach: { equals: coachId } }],
        },
      })

      if (existingConversation.docs.length === 0) {
        await payload.create({
          collection: 'conversations' as any,
          data: {
            user: userId,
            coach: coachId,
            enrollment: id,
            lastMessage: '',
            lastMessageAt: new Date().toISOString(),
            userUnreadCount: 0,
            coachUnreadCount: 0,
          },
        })
      }
    } else if (status === 'rejected') {
      const userId =
        typeof enrollment.user === 'object' ? (enrollment.user as any).id : enrollment.user

      await payload.create({
        collection: 'notifications' as any,
        overrideAccess: true,
        data: {
          user: { relationTo: 'users', value: userId },
          type: 'enrollment_rejected',
          title: 'Enrollment Rejected',
          message: 'Your enrollment request has been rejected.',
          relatedId: id,
          isRead: false,
        },
      })
    }

    return NextResponse.json({ enrollment: updatedEnrollment })
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const payload = await getPayload({ config })

    const enrollment = await payload.findByID({
      collection: 'enrollments' as any,
      id,
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    return NextResponse.json({ enrollment })
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    return NextResponse.json({ error: 'Failed to fetch enrollment' }, { status: 500 })
  }
}
