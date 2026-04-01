import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const { secret } = body

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    const expiredSubscriptions = await payload.find({
      collection: 'users',
      where: {
        and: [
          {
            subscriptionCanceled: {
              equals: true,
            },
          },
          {
            subscriptionEndDate: {
              less_than: now.toISOString(),
            },
          },
          {
            plan: {
              not_equals: 'free',
            },
          },
        ],
      },
    })

    console.log(`Found ${expiredSubscriptions.docs.length} expired subscriptions to process`)

    for (const user of expiredSubscriptions.docs) {
      try {
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
        console.log(`Expired subscription for user ${user.id} (${user.email})`)
      } catch (error) {
        console.error(`Error processing expired subscription for user ${user.id}:`, error)
      }
    }

    return NextResponse.json({
      processed: expiredSubscriptions.docs.length,
    })
  } catch (error) {
    console.error('Error checking expired subscriptions:', error)
    return NextResponse.json({ error: 'Failed to check expired subscriptions' }, { status: 500 })
  }
}
