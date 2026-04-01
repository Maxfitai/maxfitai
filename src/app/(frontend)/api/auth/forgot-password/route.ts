import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const payload = await getPayload({ config })

        const users = await payload.find({
            collection: 'users',
            where: { email: { equals: email } },
            limit: 1,
        })

        if (users.docs.length === 0) {
            // For security, don't reveal that email does not exist. Return 200.
            return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
        }

        const user = users.docs[0]

        // Generate a secure token
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Update user with token fields
        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                resetPasswordToken: token,
                resetPasswordExpiration: expiresAt.toISOString(),
                // IsPasswordUpdated: new Date().toISOString(),
            },
        })

        // Send reset email
        await sendResetEmail(email, token)

        return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent.' })
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}
