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

    // Attempt login for coaches
    const loginResult = await payload.login({
      collection: 'coaches',
      data: { email, password },
    })

    // Check if coach is active
    if (!loginResult.user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact admin.' },
        { status: 403 },
      )
    }

    // Create response with token
    const response = NextResponse.json({
      success: true,
      token: loginResult.token,
      coach: loginResult.user,
    })

    // Clear cookie to prevent interference with other auth
    response.cookies.delete('coach-token')
    response.cookies.set('coach-token', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
    })

    return response
  } catch (error: any) {
    console.error('Coach login error:', error)
    return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 })
  }
}
