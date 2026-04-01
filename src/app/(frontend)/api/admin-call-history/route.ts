import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface VapiCallLog {
  id: string
  orgId: string
  createdAt: string
  updatedAt: string
  type: string
  status: string
  endedAt?: string
  startedAt?: string
  cost?: number
  costBreakdown?: {
    total: number
    transport?: number
    stt?: number
    llm?: number
    tts?: number
    vapi?: number
  }
  assistant?: {
    name?: string
    metadata?: any
    [key: string]: any
  }
  assistantId?: string
  assistantOverrides?: {
    variableValues?: {
      email?: string
      name?: string
      firstName?: string
      lastName?: string
      [key: string]: any
    }
    metadata?: any
    [key: string]: any
  }
  metadata?: {
    userEmail?: string
    [key: string]: any
  }
  artifact?: {
    transcript?: string
    messages?: any[]
  }
  analysis?: {
    summary?: string
    structuredData?: any
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== ADMIN CALL HISTORY API START ===')

    // Initialize Payload
    const payloadInstance = await getPayload({ config })

    // Try to authenticate - either via Authorization header or cookie
    let user: any = null
    const authHeader = request.headers.get('Authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Authorization header authentication
      const token = authHeader.split(' ')[1]
      try {
        const headers = new Headers()
        headers.set('authorization', `Bearer ${token}`)
        const authResult = await payloadInstance.auth({ headers })
        user = authResult.user
      } catch (authError) {
        console.error('Auth header validation failed:', authError)
      }
    } else {
      // Try cookie-based authentication (for admin panel)
      try {
        const headers = new Headers()
        // Copy cookies from request
        const cookieHeader = request.headers.get('cookie')
        if (cookieHeader) {
          headers.set('cookie', cookieHeader)
        }
        const authResult = await payloadInstance.auth({ headers })
        user = authResult.user
      } catch (authError) {
        console.error('Cookie authentication failed:', authError)
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
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

    // Fetch the user by ID to get their email
    const targetUser = await payloadInstance.findByID({
      collection: 'users',
      id: userId,
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userEmail = targetUser.email
    console.log('✅ Admin authenticated. Fetching calls for user:', userEmail)

    // Use server-side VAPI API key (more secure)
    const vapiApiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY_PRIVATE
    if (!vapiApiKey) {
      console.error('VAPI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'Vapi API key not configured' }, { status: 500 })
    }

    const endpoint = 'https://api.vapi.ai/call'

    console.log('Calling Vapi endpoint:', endpoint)

    try {
      const vapiResponse = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Vapi response status:', vapiResponse.status)

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text()
        console.error('Vapi API error:', vapiResponse.status, errorText)

        return NextResponse.json(
          {
            error: 'Vapi API error',
            details: `Status: ${vapiResponse.status}, Response: ${errorText}`,
            endpoint: endpoint,
          },
          { status: vapiResponse.status },
        )
      }

      const vapiData: VapiCallLog[] = await vapiResponse.json()

      // Filter calls by user email
      const userCalls = vapiData.filter((call) => {
        const callUserEmail = call.assistantOverrides?.variableValues?.email
        return callUserEmail === userEmail
      })

      // Calculate total minutes and calls
      let totalDurationSeconds = 0
      let totalCost = 0
      const totalCalls = userCalls.length

      userCalls.forEach((call) => {
        if (call.startedAt && call.endedAt) {
          const start = new Date(call.startedAt).getTime()
          const end = new Date(call.endedAt).getTime()
          totalDurationSeconds += Math.floor((end - start) / 1000)
        }
        totalCost += call.cost || 0
      })

      const totalMinutes = Math.round(totalDurationSeconds / 60)

      console.log(
        `✅ Returning call stats for user ${userEmail}: ${totalCalls} calls, ${totalMinutes} minutes`,
      )

      return NextResponse.json({
        success: true,
        userId: userId,
        userEmail: userEmail,
        totalCalls: totalCalls,
        totalMinutes: totalMinutes,
        totalCost: totalCost,
        calls: userCalls.map((call) => {
          let duration = 0
          if (call.startedAt && call.endedAt) {
            const start = new Date(call.startedAt).getTime()
            const end = new Date(call.endedAt).getTime()
            duration = Math.floor((end - start) / 1000)
          }
          return {
            id: call.id,
            assistantName: call.assistant?.name || 'MaxFit AI Assistant',
            createdAt: call.createdAt,
            duration: duration,
            status: call.status,
            type: call.type,
            cost: call.cost || 0,
          }
        }),
      })
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(
        {
          error: 'Network error calling Vapi API',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          endpoint: endpoint,
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    console.error('Error fetching admin call history:', error)
    return NextResponse.json({ error: 'Failed to fetch call history' }, { status: 500 })
  }
}
