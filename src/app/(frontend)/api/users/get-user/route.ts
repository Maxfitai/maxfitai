import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')

    const payload = await getPayload({ config })

    let user = null

    if (email) {
      const result = await payload.find({
        collection: 'users',
        where: {
          email: { equals: email },
        },
        limit: 1,
      })
      user = result.docs[0]
    } else if (id) {
      user = await payload.findByID({
        collection: 'users',
        id,
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
