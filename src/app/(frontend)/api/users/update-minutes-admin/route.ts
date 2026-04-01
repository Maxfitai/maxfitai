import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PATCH(request: NextRequest) {
  try {
    console.log('=== UPDATE USER MINUTES API START ===')

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Initialize Payload
    const payloadInstance = await getPayload({ config })

    // Authenticate the request
    let user: any
    try {
      const headers = new Headers()
      headers.set('authorization', `Bearer ${token}`)
      const authResult = await payloadInstance.auth({
        headers,
      })

      user = authResult.user

      if (!user) {
        return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
      }
    } catch (authError: unknown) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is an admin
    if (user.collection !== 'admins') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 })
    }

    const body = await request.json()
    const { minutesUsed } = body

    if (typeof minutesUsed !== 'number') {
      return NextResponse.json({ error: 'minutesUsed must be a number' }, { status: 400 })
    }

    // Update the user's minutesUsed
    const updatedUser = await payloadInstance.update({
      collection: 'users',
      id: userId,
      data: {
        minutesUsed,
      },
    })

    console.log(`✅ Updated user ${userId} minutesUsed to ${minutesUsed}`)

    return NextResponse.json({
      success: true,
      userId: userId,
      minutesUsed: updatedUser.minutesUsed,
    })
  } catch (error: unknown) {
    console.error('Error updating user minutes:', error)
    return NextResponse.json({ error: 'Failed to update user minutes' }, { status: 500 })
  }
}
