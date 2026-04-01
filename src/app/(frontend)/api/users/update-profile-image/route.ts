import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { email, profileImg } = await req.json()

    if (!email || !profileImg) {
      return NextResponse.json(
        { error: 'Email and profile image URL are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]

    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        profileImg: profileImg,
      } as any,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: (updatedUser as any).id,
        email: (updatedUser as any).email,
        firstName: (updatedUser as any).firstName,
        lastName: (updatedUser as any).lastName,
        profileImg: (updatedUser as any).profileImg,
      },
      message: 'Profile image updated successfully',
    })
  } catch (error) {
    console.error('Error updating profile image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
