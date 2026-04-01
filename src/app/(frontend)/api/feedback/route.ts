import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export async function POST(req: NextRequest) {
    try {
        const payload = await getPayloadHMR({ config })
        const { user } = await payload.auth({ headers: req.headers })

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { subject, rating, feedback } = body

        if (!subject || !rating || !feedback) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            )
        }

        const newFeedback = await payload.create({
            collection: 'feedbacks',
            data: {
                user: user.id,
                subject,
                rating,
                feedback,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback: newFeedback,
        })
    } catch (error) {
        console.error('Error submitting feedback:', error)
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        )
    }
}
