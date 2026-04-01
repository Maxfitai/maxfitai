import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil', // Match your webhook API version
})

export async function POST(req: NextRequest) {
  console.log('🚨 WEBHOOK HIT - Any webhook event received!')

  try {
    const payload = await getPayloadHMR({ config })
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    console.log('📝 Raw webhook body length:', body.length)
    console.log('🔑 Signature present:', !!signature)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Stripe webhook received:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, payload)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event, payload)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event, payload)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, payload)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, payload)
        break

      default:
        console.log('Unhandled Stripe webhook event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}

async function handleCheckoutCompleted(event: Stripe.Event, payload: any) {
  try {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const clientReferenceId = session.client_reference_id

    console.log('🎯 Checkout completed details:', {
      sessionId: session.id,
      customerId,
      subscriptionId,
      clientReferenceId,
      metadata: session.metadata,
      paymentStatus: session.payment_status,
      status: session.status,
    })

    if (!clientReferenceId) {
      console.error('❌ No client_reference_id found in session - this is required!')
      console.error('Session metadata:', session.metadata)
      return
    }

    // Only process if payment was successful
    // Temporarily commented out for debugging
    // if (session.payment_status !== 'paid') {
    //   console.log('⚠️ Payment not successful, skipping update')
    //   return
    // }

    // Get plan from metadata - SAME AS PAYPAL CUSTOM_ID LOGIC
    let plan = session.metadata?.plan
    console.log('📋 Plan from metadata:', plan)

    if (!plan) {
      console.log('⚠️ No plan in metadata, trying subscription...')
      // Try to get plan from subscription
      if (subscriptionId) {
        console.log('🔍 Retrieving subscription:', subscriptionId)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price?.id
        console.log('💰 Price ID from subscription:', priceId)

        const priceIdToPlan: Record<string, string> = {
          [process.env.STARTER_PRICE_ID!]: 'starter',
          [process.env.PROFIT_PRICE_ID!]: 'proFit',
          [process.env.MAXFLEX_PRICE_ID!]: 'maxFlex',
        }

        console.log('🗺️ Price ID mapping:', {
          priceId,
          starterPriceId: process.env.STARTER_PRICE_ID,
          profitPriceId: process.env.PROFIT_PRICE_ID,
          maxflexPriceId: process.env.MAXFLEX_PRICE_ID,
        })

        plan = priceIdToPlan[priceId!]
        console.log('📋 Plan from price mapping:', plan)
      } else {
        console.log('⚠️ No subscription ID found')
      }
    }

    if (!plan) {
      console.error('❌ Could not determine plan from session!')
      console.error('Available data:', {
        metadata: session.metadata,
        subscriptionId,
        priceIds: {
          starter: process.env.STARTER_PRICE_ID,
          profit: process.env.PROFIT_PRICE_ID,
          maxflex: process.env.MAXFLEX_PRICE_ID,
        },
      })
      return
    }

    console.log('✅ Final determined plan:', plan)
    console.log('🚀 Calling addAICallsForPlan...')

    // Add AI calls for the subscription - EXACT SAME LOGIC AS PAYPAL
    await addAICallsForPlan(clientReferenceId, plan, payload, customerId, subscriptionId)

    console.log('🎉 handleCheckoutCompleted finished successfully')
  } catch (error) {
    console.error('❌ Error handling checkout completed:', error)
    console.error('Error stack:', (error as Error).stack)
  }
}

async function handleSubscriptionCreated(event: Stripe.Event, payload: any) {
  try {
    const subscription = event.data.object as Stripe.Subscription
    console.log('Subscription created:', subscription.id)
    // This is handled by checkout.session.completed - SAME AS PAYPAL
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handlePaymentSucceeded(event: Stripe.Event, payload: any) {
  try {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription
    }
    const customerId = invoice.customer as string
    // Handle subscription properly - it can be string, Stripe.Subscription, or null
    const subscriptionId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id || null

    console.log('Payment succeeded:', {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      billingReason: invoice.billing_reason,
    })

    // Only handle recurring payments (not initial ones)
    if (invoice.billing_reason === 'subscription_cycle' && subscriptionId) {
      console.log('Recurring payment - adding AI calls')

      // Get subscription to determine plan
      // Get subscription to determine plan
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price?.id

      const priceIdToPlan: Record<string, string> = {
        [process.env.STARTER_PRICE_ID!]: 'starter',
        [process.env.PROFIT_PRICE_ID!]: 'proFit',
        [process.env.MAXFLEX_PRICE_ID!]: 'maxFlex',
      }

      const plan = priceIdToPlan[priceId!]

      if (plan) {
        // Find user by Stripe customer ID
        const user = await payload.find({
          collection: 'users',
          where: {
            stripeCustomerId: {
              equals: customerId,
            },
          },
        })

        if (user.docs.length > 0) {
          const userData = user.docs[0]
          // Add calls for recurring payment - SAME LOGIC AS PAYPAL
          await addAICallsForPlan(userData.id, plan, payload, customerId, subscriptionId)
        }
      }
    } else {
      console.log('Initial or other payment - handled by checkout completion')
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event, payload: any) {
  try {
    const subscription = event.data.object as Stripe.Subscription
    console.log('Subscription updated:', subscription.id)

    // Handle plan changes if needed
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price?.id

    const priceIdToPlan: Record<string, string> = {
      [process.env.STARTER_PRICE_ID!]: 'starter',
      [process.env.PROFIT_PRICE_ID!]: 'proFit',
      [process.env.MAXFLEX_PRICE_ID!]: 'maxFlex',
    }

    const plan = priceIdToPlan[priceId!]

    if (plan && customerId) {
      // Find user and update their plan
      const user = await payload.find({
        collection: 'users',
        where: {
          stripeCustomerId: {
            equals: customerId,
          },
        },
      })

      if (user.docs.length > 0) {
        const userData = user.docs[0]

        await payload.update({
          collection: 'users',
          id: userData.id,
          data: {
            plan: plan,
            stripeSubscriptionId: subscription.id,
          },
        })

        console.log(`Updated user ${userData.id} plan to ${plan}`)
      }
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event, payload: any) {
  try {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    console.log('Subscription deleted:', subscription.id)

    // Find user and update their plan to free
    const user = await payload.find({
      collection: 'users',
      where: {
        stripeCustomerId: {
          equals: customerId,
        },
      },
    })

    if (user.docs.length > 0) {
      const userData = user.docs[0]

      await payload.update({
        collection: 'users',
        id: userData.id,
        data: {
          plan: 'free',
          stripeSubscriptionId: null,
          minutesAllowed: 1, // Reset to free plan limit (1 session)
        },
      })

      console.log(`Updated user ${userData.id} to free plan after subscription cancellation`)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function addAICallsForPlan(
  userId: string,
  plan: string,
  payload: any,
  customerId?: string,
  subscriptionId?: string,
) {
  try {
    console.log('🔍 addAICallsForPlan called with:', { userId, plan, customerId, subscriptionId })

    // Updated to use sessions instead of minutes (1 session = 1 call)
    const planSessionsMap: Record<string, number> = {
      starter: 3, // 3 sessions
      proFit: 15, // 15 sessions
      maxFlex: 35, // 35 sessions
    }

    const minutesToSet = planSessionsMap[plan]
    console.log('📊 Plan mapping result:', {
      plan,
      minutesToSet,
      allPlans: Object.keys(planSessionsMap),
    })

    if (!minutesToSet) {
      console.error('❌ Invalid plan:', plan)
      return
    }

    // Find user by ID
    console.log('👤 Looking for user with ID:', userId)
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      console.error('❌ User not found:', userId)
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      currentMinutesAllowed: user.minutesAllowed,
      currentPlan: user.plan,
    })

    // Update user with new minutes allowed
    console.log('🔄 Attempting to update user with:', {
      minutesAllowed: minutesToSet,
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    })

    const updateResult = await payload.update({
      collection: 'users',
      id: userId,
      data: {
        minutesAllowed: minutesToSet, // Set to plan limit
        plan: plan,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        // Keep existing minutesUsed - don't reset
      },
    })

    console.log('✅ Update result:', {
      success: !!updateResult,
      updatedMinutesAllowed: updateResult?.minutesAllowed,
      updatedPlan: updateResult?.plan,
    })

    console.log(
      `🎉 Successfully updated user ${userId} with ${minutesToSet} minutes for ${plan} plan`,
    )
  } catch (error) {
    console.error('❌ Error in addAICallsForPlan:', error)
    console.error('Error stack:', (error as Error).stack)
  }
}
