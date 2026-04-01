import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')
    const isRead = searchParams.get('isRead')

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, userType' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const where: any = {
      user: { equals: userId },
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = { equals: isRead === 'true' }
    }

    const notifications = await payload.find({
      collection: 'notifications' as any,
      where,
      sort: '-createdAt',
    })

    const unreadCount = notifications.docs.filter((n) => !n.isRead).length

    return NextResponse.json({
      notifications: notifications.docs,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { notificationId, isRead } = body

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing required field: notificationId' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const notification = await payload.update({
      collection: 'notifications' as any,
      id: notificationId,
      data: {
        isRead: isRead !== undefined ? isRead : true,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
