import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.text()
    const signature = req.headers.get('x-dodo-signature')

    // Verify signature
    const webhookKey =
      process.env.DODO_PAYMENTS_MODE === 'live'
        ? process.env.DODO_PAYMENTS_LIVE_WEBHOOK_KEY
        : process.env.DODO_PAYMENTS_TEST_WEBHOOK_KEY
    if (webhookKey && signature) {
      const hmac = crypto.createHmac('sha256', webhookKey)
      const digest = hmac.update(body).digest('hex')
      if (signature !== digest) {
        console.error('Dodo webhook signature verification failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    console.log('Dodo Payments webhook received:', event.type)
    console.log('Dodo webhook data:', JSON.stringify(event.data, null, 2))

    const data = event.data

    // Handle events based on the provided list
    switch (event.type) {
      // Subscription events - only process if status is actually active
      case 'subscription.active':
      case 'subscription.renewed':
      case 'subscription.plan_changed':
        // Additional check to ensure subscription is actually active
        if (data.status === 'active' || event.type === 'subscription.active') {
          console.log(`Processing ${event.type} for user:`, data.metadata?.userId)
          await handleSubscriptionUpdate(data, payload)
        } else {
          console.log(`Skipping ${event.type} - subscription status is not active:`, data.status)
        }
        break

      case 'subscription.updated':
        // Check if this is a cancellation update
        if (data.cancel_at_next_billing_date === true || data.status === 'cancelled') {
          console.log(`Processing cancellation via ${event.type} for user:`, data.metadata?.userId)
          await handleSubscriptionCancellation(data, payload)
        } else if (data.status === 'active') {
          console.log(`Processing ${event.type} for user:`, data.metadata?.userId)
          await handleSubscriptionUpdate(data, payload)
        }
        break

      case 'subscription.cancelled':
        console.log(`Processing cancellation for ${event.type}:`, data.metadata?.userId)
        await handleSubscriptionCancellation(data, payload)
        break

      case 'subscription.expired':
      case 'subscription.failed':
        console.log(`Processing deactivation for ${event.type}:`, data.metadata?.userId)
        await handleSubscriptionDeactivation(data, payload)
        break

      // Payment events - verify payment was actually successful
      case 'payment.succeeded':
        // Verify this is a real success and not a failed payment
        if (data.status === 'succeeded' || data.payment_status === 'succeeded') {
          console.log('Processing successful payment for user:', data.metadata?.userId)
          await handlePaymentSuccess(data, payload)
        } else {
          console.log(
            'Skipping payment.succeeded - actual status:',
            data.status || data.payment_status,
          )
        }
        break

      case 'payment.failed':
      case 'payment.cancelled':
        console.log(
          `Payment ${event.type} for customer:`,
          data.customer_id,
          'User:',
          data.metadata?.userId,
        )
        // Do NOT update user plan on failed payments
        break

      default:
        console.log('Unhandled Dodo Payments event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Dodo webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}

async function handleSubscriptionUpdate(data: any, payload: any) {
  try {
    const userId = data.metadata?.userId
    const plan = data.metadata?.plan
    const subscriptionId = data.subscription_id
    const customerId = data.customer_id

    console.log('Dodo subscription update:', { userId, plan, subscriptionId, customerId })

    if (userId && plan) {
      await addAICallsForPlan(userId, plan, payload, subscriptionId, customerId)
    }
  } catch (error) {
    console.error('Error handling Dodo subscription update:', error)
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function handleSubscriptionCancellation(data: any, payload: any) {
  try {
    const userId = data.metadata?.userId

    if (!userId) {
      console.log('No userId in metadata for cancellation')
      return
    }

    const currentUser = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!currentUser) {
      console.error('User not found for cancellation:', userId)
      return
    }

    let endDate: Date
    const dodoPeriodEnd = data.current_period_end || data.billing_period_end

    if (dodoPeriodEnd) {
      endDate = new Date(dodoPeriodEnd * 1000)
    } else {
      const subscriptionStartDate = currentUser.subscriptionStartDate || new Date().toISOString()
      const startDate = new Date(subscriptionStartDate)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 30)
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        subscriptionCanceled: true,
        subscriptionCanceledAt: new Date().toISOString(),
        subscriptionEndDate: endDate.toISOString(),
      },
    })

    const expirationDateStr = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    await sendCancellationEmail(
      currentUser.email,
      currentUser.firstName,
      expirationDateStr,
      currentUser.plan,
    )

    console.log(`Subscription canceled for user ${userId}. Will expire on ${endDate.toISOString()}`)
  } catch (error) {
    console.error('Error handling Dodo subscription cancellation:', error)
  }
}

async function sendCancellationEmail(
  email: string,
  firstName: string | null | undefined,
  expirationDate: string,
  currentPlan: string | null | undefined,
) {
  const planName =
    currentPlan === 'proFit'
      ? 'Pro Fit'
      : currentPlan === 'maxFlex'
        ? 'Max Flex'
        : currentPlan || 'Premium'

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@maxfitai.com',
    to: email,
    subject: 'Your MAXFITAI Subscription Cancellation Confirmed',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Cancellation Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 12px; padding: 30px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #CFFF0F; margin: 0; font-size: 28px;">MAXFITAI</h1>
            </div>
            
            <h2 style="color: #fff; margin-top: 0;">Subscription Cancellation Confirmed</h2>
            
            <p style="color: #ccc; line-height: 1.6;">
              Hi ${firstName || 'there'},
            </p>
            
            <p style="color: #ccc; line-height: 1.6;">
              Your subscription to the <strong style="color: #CFFF0F;">${planName}</strong> plan has been successfully canceled.
            </p>
            
            <div style="background-color: #222; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #CFFF0F; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">
                Your ${planName} plan will expire on:
              </p>
              <p style="color: #fff; font-size: 24px; margin: 0; font-weight: bold;">
                ${expirationDate}
              </p>
            </div>
            
            <p style="color: #ccc; line-height: 1.6;">
              You will continue to have full access to your ${planName} plan until this date. 
              After this date, you will be automatically redirected to the <strong style="color: #CFFF0F;">Free Plan</strong>.
            </p>
            
            <p style="color: #ccc; line-height: 1.6;">
              We hope you enjoyed your time with MAXFITAI! If you'd like to resubscribe anytime, 
              simply visit our pricing page.
            </p>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing-plan" 
                 style="display: inline-block; background-color: #CFFF0F; color: #000; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View Plans
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              If you have any questions, reply to this email and we'll be happy to help!
            </p>
          </div>
        </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
  console.log(`Cancellation email sent to ${email}`)
}

async function handlePaymentSuccess(data: any, payload: any) {
  try {
    const userId = data.metadata?.userId
    const plan = data.metadata?.plan
    const customerId = data.customer_id
    const subscriptionId = data.subscription_id // Might be present if it's a subscription payment

    // Process if it's an independent payment or we haven't processed the subscription yet
    if (userId && plan) {
      if (plan === 'coach-session') {
        const coachId = data.metadata?.coachId
        if (coachId) {
          // Fetch existing user to get current unlocked list
          const user = await payload.findByID({
            collection: 'users',
            id: userId,
          })

          const currentUnlocked = user.unlockedCoachIds || []
          // Check if already unlocked to avoid duplicates
          if (!currentUnlocked.some((item: any) => item.coachId === coachId)) {
            await payload.update({
              collection: 'users',
              id: userId,
              data: {
                unlockedCoachIds: [...currentUnlocked, { coachId }],
              },
            })
            console.log(`User ${userId} unlocked coach ${coachId} via Dodo`)
          }
        }
      } else {
        await addAICallsForPlan(userId, plan, payload, subscriptionId, customerId)
      }
    }
  } catch (error) {
    console.error('Error handling Dodo payment success:', error)
  }
}

async function handleSubscriptionDeactivation(data: any, payload: any) {
  try {
    const userId = data.metadata?.userId
    const subscriptionId = data.subscription_id

    if (userId) {
      // Fetch current user to check if they actually have an active subscription
      const currentUser = await payload.findByID({
        collection: 'users',
        id: userId,
      })

      if (!currentUser) {
        console.error('User not found for deactivation:', userId)
        return
      }

      // Only deactivate if the user has a dodo subscription ID
      // If they don't have one, it means they never completed checkout successfully
      // and we should NOT change their plan
      if (!currentUser.dodoSubscriptionId) {
        console.log(`Skipping deactivation for user ${userId} - no active Dodo subscription found`)
        return
      }

      // Also verify the subscription ID matches if provided
      if (subscriptionId && currentUser.dodoSubscriptionId !== subscriptionId) {
        console.log(`Skipping deactivation for user ${userId} - subscription ID mismatch`)
        return
      }

      await payload.update({
        collection: 'users',
        id: userId,
        data: {
          plan: 'free',
          minutesAllowed: 1, // Reset to free plan limit (1 session)
          dodoSubscriptionId: null,
          dodoCustomerId: null,
        },
      })
      console.log(`Updated user ${userId} to free plan after Dodo subscription deactivation`)
    }
  } catch (error) {
    console.error('Error handling Dodo subscription deactivation:', error)
  }
}

async function addAICallsForPlan(
  userId: string,
  plan: string,
  payload: any,
  subscriptionId?: string,
  customerId?: string,
) {
  try {
    console.log(
      `addAICallsForPlan called: userId=${userId}, plan=${plan}, subscriptionId=${subscriptionId}`,
    )

    const planSessionsMap: Record<string, number> = {
      starter: 3, // 3 sessions
      proFit: 4, // 15 sessions
      maxFlex: 6, // 35 sessions
    }

    const sessionsToSet = planSessionsMap[plan]
    if (!sessionsToSet) {
      console.error('Invalid plan:', plan)
      return
    }

    // Fetch current user to verify we're not downgrading or causing issues
    const currentUser = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!currentUser) {
      console.error('User not found:', userId)
      return
    }

    console.log(
      `Current user state: plan=${currentUser.plan}, maxAiCalls=${currentUser.maxAiCalls}, aiCallsUsed=${currentUser.aiCallsUsed}`,
    )

    // Only update if user is on free plan or the same plan, or upgrading
    const currentPlan = currentUser.plan || 'free'
    const planHierarchy: Record<string, number> = {
      free: 0,
      starter: 1,
      proFit: 2,
      maxFlex: 3,
    }

    const currentLevel = planHierarchy[currentPlan] ?? 0
    const newLevel = planHierarchy[plan] ?? 0

    if (newLevel < currentLevel && currentPlan !== 'free') {
      console.log(
        `Skipping plan update for user ${userId} - would downgrade from ${currentPlan} to ${plan}`,
      )
      return
    }

    // Calculate new maxAiCalls - add new plan sessions to existing ones
    const currentMaxAiCalls = currentUser.maxAiCalls || 0
    const currentPlanSessions = planSessionsMap[currentPlan] || 0
    // const sessionsToAdd = sessionsToSet - currentPlanSessions
    // const newMaxAiCalls = Math.max(currentMaxAiCalls + sessionsToAdd, sessionsToSet)

    const now = new Date()
    const subscriptionEndDate = new Date(now)
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30)

    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        AiCallsUsed: 0, // Reset used calls when changing plan
        maxAiCalls: sessionsToSet,
        plan: plan,
        dodoSubscriptionId: subscriptionId || undefined,
        dodoCustomerId: customerId || undefined,
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: subscriptionEndDate.toISOString(),
        subscriptionCanceled: false,
        subscriptionCanceledAt: null,
      },
    })

    console.log(
      `Successfully updated user ${userId} from ${currentPlan} to ${plan} with ${sessionsToSet} max AI calls via Dodo`,
    )
  } catch (error) {
    console.error('Error in addAICallsForPlan (Dodo):', error)
  }
}
