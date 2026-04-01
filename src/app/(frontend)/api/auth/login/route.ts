import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Attempt login
    const loginResult = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    // Create response with token
    const response = NextResponse.json({
      success: true,
      token: loginResult.token,
      user: loginResult.user,
    })

    // CRITICAL: Clear the cookie that payload.login() automatically sets
    // Frontend uses localStorage (user-token), not cookies
    // This prevents user auth from interfering with admin panel
    response.cookies.delete('payload-token')
    response.cookies.set('payload-token', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 })
  }
}
