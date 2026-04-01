import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { plan, isAnnual = false, coachId } = await req.json()

    // console.log(
    //   'Creating Dodo Payments checkout for plan:',
    //   plan,
    //   'Annual:',
    //   isAnnual,
    //   'CoachId:',
    //   coachId,
    // )

    // Validate plan
    const validPlans = ['starter', 'proFit', 'maxFlex', 'coach-session']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get the logged-in user
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Map plans to Dodo Product IDs
    const planToProductId: Record<string, string | undefined> = {
      starter: process.env.DODO_PAYMENTS_MODE === 'live' ? process.env.DODO_STARTER_MONTHLY_ID_LIVE : process.env.DODO_STARTER_MONTHLY_ID_TEST,
      proFit: process.env.DODO_PAYMENTS_MODE === 'live' ? process.env.DODO_PROFIT_MONTHLY_ID_LIVE : process.env.DODO_PROFIT_MONTHLY_ID_TEST,
      maxFlex: process.env.DODO_PAYMENTS_MODE === 'live' ? process.env.DODO_MAXFLEX_MONTHLY_ID_LIVE : process.env.DODO_MAXFLEX_MONTHLY_ID_TEST,
      'coach-session': process.env.DODO_COACH_SESSION_ID,
    }

    const productId = planToProductId[plan]
    if (!productId) {
      console.error('Dodo Product ID not found for plan:', plan)
      return NextResponse.json({ error: 'Dodo Product ID not configured' }, { status: 400 })
    }

    // Determine if we are in test mode or production
    const isTest = process.env.DODO_PAYMENTS_MODE !== 'live'
    const baseUrl = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com'

    // Use the appropriate API key based on the mode
    const apiKey = isTest
      ? process.env.DODO_PAYMENTS_TEST_API_KEY
      : process.env.DODO_PAYMENTS_LIVE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Dodo Payments API Key not configured' }, { status: 500 })
    }

    console.log(
      `Requesting Dodo Checkout from: ${baseUrl}/checkouts (Mode: ${isTest ? 'Test' : 'Live'})`,
    )

    const returnUrl =
      plan === 'coach-session' && coachId
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fitness-coaches/${coachId}?payment=success`
        : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`

    const response = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        customer: {
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        },
        return_url: returnUrl,
        metadata: {
          userId: user.id,
          plan: plan,
          isAnnual: String(isAnnual),
          coachId: coachId || '',
        },
      }),
    })

    const responseText = await response.text()
    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch (e) {
      console.error('Failed to parse Dodo response:', responseText)
      return NextResponse.json({ error: 'Invalid response from Dodo Payments' }, { status: 500 })
    }

    if (!response.ok) {
      console.error('Dodo Payments API error:', {
        status: response.status,
        data,
      })
      return NextResponse.json(
        { error: data.message || 'Failed to create Dodo checkout' },
        { status: response.status },
      )
    }

    const checkoutUrl = data.url || data.checkout_url

    if (!checkoutUrl) {
      console.error('No checkout URL in Dodo response:', data)
      throw new Error('No checkout URL returned from Dodo Payments')
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Dodo checkout creation error:', error)
    return NextResponse.json(
      {
        error: `Failed to create Dodo checkout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 },
    )
  }
}