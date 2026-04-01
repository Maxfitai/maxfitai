import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('JWT ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const payload = await getPayload({ config })

    // Verify the token and get the current user
    const authResult = await payload.auth({
      headers: req.headers,
    })

    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Coaches can only update their own profile
    // Admins can update any coach
    const isAdmin = authResult.user.collection === 'admins'
    const isOwnProfile = authResult.user.id === id

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Update the coach
    const updatedCoach = await payload.update({
      collection: 'coaches',
      id,
      data: body,
    })

    return NextResponse.json(updatedCoach)
  } catch (error: any) {
    console.error('Coach update error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update coach' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('JWT ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const payload = await getPayload({ config })

    // Verify the token
    const authResult = await payload.auth({
      headers: req.headers,
    })

    if (!authResult || !authResult.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the coach
    const coach = await payload.findByID({
      collection: 'coaches',
      id,
    })

    return NextResponse.json(coach)
  } catch (error: any) {
    console.error('Coach fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch coach' }, { status: 500 })
  }
}
