import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      where: {
        and: [
          { email: { equals: email } },
          { resetPasswordToken: { equals: token } },
          { resetPasswordExpiration: { greater_than: new Date() } },
        ],
      },
      limit: 1,
    })

    console.log('Found users:', users)

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const user = users.docs[0]

    // Update the user's password using Payload's update (Payload will hash if configured)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password,
        resetPasswordToken: null,
        resetPasswordExpiration: null,
        // IsPasswordUpdated: new Date().toISOString(),
      },
    })

    // Login user and return token
    const loginRes = await payload.login({ collection: 'users', data: { email, password } })

    // Create response and CLEAR the cookie
    // Frontend uses localStorage (user-token), so we don't need the cookie
    const response = NextResponse.json({ success: true, token: loginRes.token })

    // Clear the cookie that payload.login() sets
    response.cookies.delete('payload-token')
    response.cookies.set('payload-token', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
