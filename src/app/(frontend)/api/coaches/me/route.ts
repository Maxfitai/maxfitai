import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('JWT ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Verify token and get coach
    const result = await payload.auth({
      headers: req.headers,
    })

    if (!result || !result.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if the user is a coach
    if (result.user.collection !== 'coaches') {
      return NextResponse.json({ error: 'Unauthorized - Not a coach' }, { status: 403 })
    }

    // Check if coach is still active
    const coach = result.user as any
    if (!coach.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    return NextResponse.json({ coach: coach })
  } catch (error: any) {
    console.error('Coach auth error:', error)
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 })
  }
}
