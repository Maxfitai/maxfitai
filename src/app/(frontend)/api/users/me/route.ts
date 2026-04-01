import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace(/^(Bearer|JWT)\s+/i, '').trim()

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    const result = await payload.auth({
      headers: req.headers,
    })

    if (!result || !result.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = result.user as any

    // Check if subscription has expired
    if (user.subscriptionCanceled && user.subscriptionEndDate) {
      const now = new Date()
      const endDate = new Date(user.subscriptionEndDate)

      if (now >= endDate && user.plan !== 'free') {
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            plan: 'free',
            maxAiCalls: 1,
            aiCallsUsed: 0,
            dodoSubscriptionId: null,
            dodoCustomerId: null,
            subscriptionCanceled: false,
            subscriptionCanceledAt: null,
            subscriptionStartDate: null,
            subscriptionEndDate: null,
          },
        })
        user.plan = 'free'
        user.maxAiCalls = 1
        user.aiCallsUsed = 0
        console.log(`User ${user.email} downgraded to free plan - subscription expired`)
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        plan: user.plan,
        aiCallsUsed: user.aiCallsUsed,
        language: user.language,
        maxAiCalls: user.maxAiCalls,
        minutesUsed: user.minutesUsed,
        minutesAllowed: user.minutesAllowed,
        IsPasswordUpdated: user.IsPasswordUpdated,
        profileImg: user.profileImg,
        subscriptionCanceled: user.subscriptionCanceled,
        subscriptionEndDate: user.subscriptionEndDate,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
