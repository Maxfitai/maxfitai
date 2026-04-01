import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.collection !== 'users') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!user.dodoSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const isTest = process.env.DODO_PAYMENTS_MODE !== 'live'
    const baseUrl = isTest ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com'
    const apiKey = isTest
      ? process.env.DODO_PAYMENTS_TEST_API_KEY
      : process.env.DODO_PAYMENTS_LIVE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Dodo Payments API Key not configured' }, { status: 500 })
    }

    const response = await fetch(`${baseUrl}/subscriptions/${user.dodoSubscriptionId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancel_at_next_billing_date: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Dodo cancel subscription error:', errorData)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: response.status },
      )
    }

    const subscriptionData = await response.json()
    const currentPeriodEnd = subscriptionData.current_period_end

    let endDate: Date
    if (currentPeriodEnd) {
      endDate = new Date(currentPeriodEnd * 1000)
    } else {
      const startDate = user.subscriptionStartDate
        ? new Date(user.subscriptionStartDate as string)
        : new Date()
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 30)
    }

    // Update user fields in database
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        subscriptionCanceled: true,
        subscriptionCanceledAt: new Date().toISOString(),
        subscriptionEndDate: endDate.toISOString(),
      },
    })
    console.log('User subscription fields updated for:', user.email)

    const expirationDateStr = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const planName =
      user.plan === 'proFit'
        ? 'Pro Fit'
        : user.plan === 'maxFlex'
          ? 'Max Flex'
          : (user.plan as string) || 'Premium'

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@maxfitai.com',
      to: user.email,
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
                Hi ${user.firstName || 'there'},
              </p>
              
              <p style="color: #ccc; line-height: 1.6;">
                Your subscription to the <strong style="color: #CFFF0F;">${planName}</strong> plan has been successfully canceled.
              </p>
              
              <div style="background-color: #222; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="color: #CFFF0F; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">
                  Your ${planName} plan will expire on:
                </p>
                <p style="color: #fff; font-size: 24px; margin: 0; font-weight: bold;">
                  ${expirationDateStr}
                </p>
              </div>
              
              <p style="color: #ccc; line-height: 1.6;">
                You will continue to have full access to your ${planName} plan until this date. 
                After this date, you will be automatically redirected to the <strong style="color: #CFFF0F;">Free Plan</strong>.
              </p>
              
              <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
                If you have any questions, reply to this email and we'll be happy to help!
              </p>
            </div>
          </body>
        </html>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log('Cancellation email sent to:', user.email)
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
