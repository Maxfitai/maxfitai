import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    // Fetch the coach
    const coach = await payload.findByID({
      collection: 'coaches',
      id,
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

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    // Fetch the coach's workout library (videos)
    const workouts = await payload.find({
      collection: 'workout-library',
      where: {
        coach: {
          equals: id,
        },
        isPublic: {
          equals: true,
        },
      },
      sort: '-createdAt',
    })

    // Transform workout library to video format
    const videos = workouts.docs.map((workout) => ({
      id: workout.id,
      title: workout.title,
      thumbnail: getVideoThumbnail(workout.videoUrl, workout.contentType, workout.thumbnailUrl),
      duration: '15:00', // Default duration since it's not stored
      views: '1k', // Default views since it's not tracked
      url: workout.videoUrl,
      contentType: workout.contentType,
    }))

    // Fetch the coach's plans
    const plans = await payload.find({
      collection: 'plans',
      where: {
        coach: {
          equals: id,
        },
        isActive: {
          equals: true,
        },
      },
      sort: '-createdAt',
    })

    // Transform plans to match frontend interface
    const transformedPlans = plans.docs.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      type: plan.type,
      duration: plan.duration,
      difficulty: plan.difficulty,
      price: plan.price || 0,
      workouts:
        plan.workouts?.map((w: any) => ({
          day: w.day,
          exercises:
            w.exercises?.map((e: any) => ({
              name: e.name,
              sets: e.sets,
              reps: e.reps,
              duration: e.duration,
              rest: e.rest,
              notes: e.notes,
            })) || [],
        })) || [],
      nutrition: plan.nutrition
        ? {
            calories: plan.nutrition.calories,
            protein: plan.nutrition.protein,
            carbs: plan.nutrition.carbs,
            fats: plan.nutrition.fats,
            meals:
              plan.nutrition.meals?.map((m: any) => ({
                mealType: m.mealType,
                description: m.description,
              })) || [],
          }
        : null,
      tags: plan.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }))

    // Transform data to match the frontend Coach interface
    const transformedCoach = {
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
      videos: videos,
      plans: transformedPlans,
      pricePerSession: coach.pricePerSession || 50,
      availability: 'Contact for availability', // Default (not stored in DB)
      verified: true,
      calendlyUrl: coach.calendlyUrl || '',
      socialLinks: {}, // Not stored in DB currently
    }

    return NextResponse.json(transformedCoach, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching coach:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coach' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      },
    )
  }
}

// Helper function to extract thumbnail from video URLs
function getVideoThumbnail(
  url: string,
  contentType: string,
  thumbnailUrl?: string | null,
): string | null {
  // If a custom thumbnail URL is provided, use it
  if (thumbnailUrl) {
    return thumbnailUrl
  }

  if (contentType === 'youtube') {
    // Extract YouTube video ID and return thumbnail
    const videoId = extractYouTubeId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
  }

  // For Instagram and TikTok, return null to show platform indicator
  // (These platforms don't allow easy thumbnail extraction)
  return null
}

function getPlaceholderThumbnail(contentType: string): string {
  switch (contentType) {
    case 'tiktok':
      // TikTok branded placeholder - using a fitness-themed image
      return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'
    case 'instagram':
      // Instagram branded placeholder - using a fitness-themed image
      return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop'
    default:
      return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop'
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
