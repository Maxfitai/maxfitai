import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const payload = await getPayload({ config })

        // Fetch all active coaches with public fields only
        const coaches = await payload.find({
            collection: 'coaches',
            where: {
                isActive: {
                    equals: true,
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                bio: true,
                specializations: true,
                yearsOfExperience: true,
                certifications: true,
                profileImage: true,
                calendlyUrl: true,
                pricePerSession: true,
                updatedAt: true,
                createdAt: true,
            },
        })

        // Transform data to match the frontend Coach interface
        const transformedCoaches = coaches.docs.map((coach) => ({
            id: coach.id,
            name: `${coach.firstName} ${coach.lastName}`,
            role: 'Fitness Coach',
            experience: `${coach.yearsOfExperience || 0}+ Years`,
            image: coach.profileImage || '/Coach/default-avatar.png',
            rating: 4.8, // Default rating (not stored in DB)
            reviews: 0, // Default reviews count (not stored in DB)
            bio: coach.bio || '',
            specializations: coach.specializations?.map((s) => s.specialization).filter(Boolean) || [],
            achievements: coach.certifications?.map((c) => c.certification).filter(Boolean) || [],
            pricePerSession: coach.pricePerSession || 50,
            availability: 'Contact for availability', // Default (not stored in DB)
            verified: true,
            calendlyUrl: coach.calendlyUrl || '',
            socialLinks: {}, // Not stored in DB currently
        }))

        return NextResponse.json(transformedCoaches, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            },
        })
    } catch (error) {
        console.error('Error fetching coaches:', error)
        return NextResponse.json(
            { error: 'Failed to fetch coaches' },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                },
            },
        )
    }
}
