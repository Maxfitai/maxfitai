import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(request: NextRequest) {
    try {
        const { minutesUsed } = await request.json()
        const payload = await getPayloadHMR({ config })

        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]

        // Verify token and get user
        const headers = new Headers()
        headers.set('authorization', `Bearer ${token}`)
        const { user } = await payload.auth({ headers })

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Ensure user is from users collection (not admin)
        if (user.collection !== 'users') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Update user's minutes used
        const updatedUser = await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                minutesUsed: (user.minutesUsed || 0) + minutesUsed
            }
        })

        return NextResponse.json({
            success: true,
            newMinutesUsed: updatedUser.minutesUsed
        })
    } catch (error) {
        console.error('Update minutes error:', error)
        return NextResponse.json({ error: 'Failed to update minutes' }, { status: 500 })
    }
}