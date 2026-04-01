import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, context } = body

    if (!userEmail || !context) {
      return NextResponse.json({ error: 'User email and context are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const user = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: userEmail,
        },
      },
    })

    if (user.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.docs[0].id

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        lastPlanContext: context,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user context:', error)
    return NextResponse.json({ error: 'Failed to update user context' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const user = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: userEmail,
        },
      },
      select: {
        lastPlanContext: true,
      },
    })

    if (user.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const lastPlanContext = user.docs[0].lastPlanContext || null

    return NextResponse.json({ lastPlanContext })
  } catch (error) {
    console.error('Error fetching user context:', error)
    return NextResponse.json({ error: 'Failed to fetch user context' }, { status: 500 })
  }
}
