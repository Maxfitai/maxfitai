'use client'

import { Button } from '@/app/(frontend)/components/ui/button'
import { vapi } from '@/app/(frontend)/lib/vapi'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import RobotPic from '@/app/(frontend)/assets/RobotPic.webp'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { useCall } from '@/app/(frontend)/context/CallProvider'
import { useIsMobile } from '../../hooks/use-mobile'

type CallLog = {
  id: string
  assistantName: string
  createdAt: string
  duration: number
  status: string
  type: string
  cost: number
}

// Enhanced Voice Wave Component with continuous animation during speech
const VoiceWave = ({ isActive, isUser = false }: { isActive: boolean; isUser?: boolean }) => {
  const bars = 7
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(4))

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(bars).fill(4))
      return
    }

    const interval = setInterval(() => {
      setHeights(
        Array(bars)
          .fill(0)
          .map(() => {
            const baseHeight = isUser ? 8 : 6
            const variation = Math.random() * 20 + 10
            return baseHeight + variation
          }),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isActive, bars, isUser])

  const activeColor = 'hsl(72 100% 53%)'
  const inactiveColor = 'hsl(0 0% 40%)'

  return (
    <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-10 sm:h-16 px-2 sm:px-4">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 sm:w-2 rounded-full transition-all duration-200 ease-out"
          style={{
            height: `${height}px`,
            backgroundColor: isActive ? activeColor : inactiveColor,
            opacity: isActive ? 0.7 + Math.sin(Date.now() / 200 + i * 0.5) * 0.3 : 0.3,
            transform: `scaleY(${isActive ? 1 + Math.sin(Date.now() / 150 + i) * 0.2 : 1})`,
            boxShadow: isActive
              ? `0 0 8px hsl(72 100% 53% / 0.4), 0 0 16px hsl(72 100% 53% / 0.2)`
              : 'none',
          }}
        />
      ))}
    </div>
  )
}

// Enhanced Audio Visualization with continuous animation
const AudioVisualizer = ({
  isActive,
  isUser = false,
  intensity = 1,
}: {
  isActive: boolean
  isUser?: boolean
  intensity?: number
}) => {
  const particles = 12
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (!isActive) {
      return
    }

    let frameId: number
    const animate = () => {
      setAnimationFrame((prev) => prev + 1)
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [isActive])

  const baseColor = 'hsl(72 100% 53%)'

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {Array.from({ length: particles }).map((_, i) => {
        const angle = (i * 360) / particles
        const time = Date.now() / 1000
        const pulse = (Math.sin(time * 2 + i * 0.5) + 1) * 0.5
        const distance = 60 + pulse * 40 * intensity
        const size = 4 + pulse * 8 * intensity

        return (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: baseColor,
              opacity: 0.3 + pulse * 0.4,
              transform: `rotate(${angle}deg) translate(${distance}px) rotate(-${angle}deg)`,
              boxShadow: `0 0 ${8 + pulse * 16}px hsl(72 100% 53% / 0.6)`,
            }}
          />
        )
      })}
    </div>
  )
}

// Unified AI Assistant Card for both Mobile and Desktop
const AIAssistantCard = ({
  isAssistantSpeaking,
  isUserSpeaking,
  callActive,
  callEnded,
  user,
  connecting,
  planCreatedSuccessfully,
  onToggleCall,
  router,
}: {
  isAssistantSpeaking: boolean
  isUserSpeaking: boolean
  callActive: boolean
  callEnded: boolean
  user: any
  connecting: boolean
  planCreatedSuccessfully: boolean
  onToggleCall: () => void
  router: any
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 hover-lift relative overflow-hidden group transition-all duration-500 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/3 via-transparent to-transparent  transition-opacity"></div>

      <div className="relative flex flex-col items-center text-center">
        {/* Combined Avatar - Shows AI or User based on who's speaking */}
        <div className="relative mb-3 sm:mb-6">
          {(isAssistantSpeaking || isUserSpeaking) && (
            <AudioVisualizer
              isActive={isAssistantSpeaking || isUserSpeaking}
              isUser={isUserSpeaking}
              intensity={0.5}
            />
          )}

          <div
            className={`relative w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-maxfit-darker-grey to-maxfit-dark-grey border-2 flex items-center justify-center overflow-hidden transition-all duration-500 ${isAssistantSpeaking
                ? 'border-maxfit-neon-green scale-105'
                : isUserSpeaking
                  ? 'border-blue-400 scale-105'
                  : callActive
                    ? 'border-maxfit-neon-green/40'
                    : 'border-maxfit-neon-green/20'
              }`}
            style={{
              boxShadow: isAssistantSpeaking
                ? '0 0 30px hsl(72 100% 53% / 0.3), inset 0 0 15px hsl(72 100% 53% / 0.1)'
                : isUserSpeaking
                  ? '0 0 30px hsl(221 100% 53% / 0.3), inset 0 0 15px hsl(221 100% 53% / 0.1)'
                  : callActive
                    ? '0 0 20px hsl(72 100% 53% / 0.2), inset 0 0 10px hsl(72 100% 53% / 0.05)'
                    : '0 0 10px hsl(72 100% 53% / 0.1), inset 0 0 5px hsl(72 100% 53% / 0.02)',
            }}
          >
            {isUserSpeaking ? (
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-full flex items-center justify-center border border-blue-400/20">
                <span className="text-xl sm:text-3xl font-bold text-white">
                  {user?.firstName?.charAt(0)?.toUpperCase() || '👤'}
                </span>
              </div>
            ) : (
              <Image
                src={(user as any)?.gender?.toLowerCase() === 'female' ? RobotPic : RobotPic}
                alt="AI Avatar"
                width={250}
                height={250}
                className="object-cover w-20 h-20 sm:w-32 sm:h-32 rounded-full border-2 border-maxfit-neon-green/30"
              />
            )}
          </div>

          {/* Pulse rings */}
          {(isAssistantSpeaking || isUserSpeaking) && (
            <>
              <div className="absolute inset-2 sm:inset-4 rounded-full border-2 border-maxfit-neon-green animate-ping opacity-60"></div>
              <div
                className="absolute inset-4 sm:inset-8 rounded-full border-2 border-maxfit-neon-green animate-ping opacity-40"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </>
          )}
        </div>

        {/* Dynamic Title based on who's speaking */}
        <h2 className="text-xl sm:text-2xl font-bold text-maxfit-white mb-1 sm:mb-2">
          {isUserSpeaking ? 'You' : 'Maxi '}
          <span className="text-maxfit-neon-green">{isUserSpeaking ? '' : 'AI'}</span>
        </h2>

        <p className="text-maxfit-medium-grey text-xs sm:text-base mb-2 sm:mb-4 text-left">
          {isUserSpeaking
            ? 'Speaking...'
            : isAssistantSpeaking
              ? 'AI is responding...'
              : 'Your Personal Fitness & Diet Coach'}
        </p>

        {/* Combined Voice Wave */}
        <div className="w-full max-w-xs mb-2 sm:mb-4">
          <VoiceWave isActive={isAssistantSpeaking || isUserSpeaking} isUser={isUserSpeaking} />
        </div>

        {/* Status Indicator */}
        <div
          className={`inline-flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 backdrop-blur-sm border mb-3 sm:mb-6 ${isAssistantSpeaking
              ? 'bg-maxfit-neon-green/10 border-maxfit-neon-green/40 text-maxfit-neon-green'
              : isUserSpeaking
                ? 'bg-blue-400/10 border-blue-400/40 text-blue-400'
                : callActive
                  ? 'bg-maxfit-neon-green/5 border-maxfit-neon-green/20 text-maxfit-medium-grey'
                  : callEnded
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-maxfit-darker-grey/30 border-maxfit-darker-grey text-maxfit-medium-grey'
            }`}
        >
          <div
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${isAssistantSpeaking
                ? 'bg-maxfit-neon-green animate-pulse'
                : isUserSpeaking
                  ? 'bg-blue-400 animate-pulse'
                  : callActive
                    ? 'bg-maxfit-neon-green/60'
                    : callEnded
                      ? 'bg-green-500'
                      : 'bg-maxfit-medium-grey'
              }`}
          ></div>
          <span className="text-xs sm:text-sm font-medium">
            {isAssistantSpeaking
              ? '🎤 AI Speaking...'
              : isUserSpeaking
                ? "🎤 You're Speaking..."
                : callActive
                  ? '👂 Listening...'
                  : callEnded
                    ? '✅ Session Complete'
                    : ''}
          </span>
        </div>

        {/* CALL ACTION BUTTON - Integrated into the card */}
        <div className="relative w-full max-w-xs">
          {/* Enhanced Glow effects */}
          {(connecting || callActive) && (
            <>
              <div className="absolute inset-0 bg-maxfit-neon-green/20 rounded-full blur-xl animate-pulse"></div>
              <div
                className="absolute inset-0 bg-maxfit-neon-green/15 rounded-full blur-lg animate-ping"
                style={{ animationDuration: '2s' }}
              ></div>
            </>
          )}

          <button
            onClick={
              callEnded && planCreatedSuccessfully
                ? () => router.push('/dashboard/nutrition-plan')
                : onToggleCall
            }
            disabled={connecting}
            className={`relative w-full px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-bold rounded-full transition-all duration-500 transform hover:scale-105 active:scale-95 backdrop-blur-sm border-2 overflow-hidden ${callActive
                ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white shadow-2xl shadow-red-600/50 border-red-400/60 animate-pulse'
                : connecting
                  ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 text-maxfit-black cursor-not-allowed border-yellow-400/60 shadow-xl shadow-yellow-500/40'
                  : callEnded
                    ? planCreatedSuccessfully
                      ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:from-green-600 hover:via-green-700 hover:to-green-600 text-white shadow-2xl shadow-green-500/50 border-green-400/60'
                      : 'bg-gradient-to-r from-maxfit-neon-green via-maxfit-neon-green-dark to-maxfit-neon-green hover:from-maxfit-neon-green-dark hover:via-maxfit-neon-green hover:to-maxfit-neon-green-dark text-maxfit-black shadow-2xl shadow-maxfit-neon-green/50 border-maxfit-neon-green/70'
                    : 'bg-[#B6E10A] text-black shadow-2xl shadow-maxfit-neon-green/50 border-maxfit-neon-green/70'
              }`}
          >
            {/* Animated background shimmer effect */}

            {/* Loading spinner */}
            {connecting && (
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}

            {/* Button text with subtle animation */}
            <span className="relative z-10 inline-flex items-center gap-2 transition-transform duration-300">
              {connecting ? (
                'Connecting...'
              ) : callActive ? (
                '🛑 End Call'
              ) : callEnded ? (
                planCreatedSuccessfully ? (
                  '📊 View Nutrition Plan'
                ) : (
                  '🔄 Start New Call'
                )
              ) : (
                <>
                  <Phone className="w-4 h-4" /> Start Your Journey
                </>
              )}
            </span>

            {/* Glow effect on hover */}
          </button>
        </div>
      </div>
    </div>
  )
}

const AiAssistantPage = () => {
  const { callActive, setCallActive } = useCall()
  const [connecting, setConnecting] = useState(false)
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [callEnded, setCallEnded] = useState(false)
  const [canMakeCall, setCanMakeCall] = useState(true)
  const [callLimitMessage, setCallLimitMessage] = useState('')
  const [calls, setCalls] = useState<CallLog[]>([])
  const [planCreatedSuccessfully, setPlanCreatedSuccessfully] = useState(false)
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'arabic'>('english')
  const [callDuration, setCallDuration] = useState(0)
  const [showOneMinuteWarning, setShowOneMinuteWarning] = useState(false)
  const [sessionExtensionCount, setSessionExtensionCount] = useState(0)
  const [availableSessions, setAvailableSessions] = useState(0)
  const [currentAiCallsUsed, setCurrentAiCallsUsed] = useState(0)
  const [warningCountdown, setWarningCountdown] = useState(10)
  const [lastPlanContext, setLastPlanContext] = useState<any>(null)
  // Full plan history array for passing comprehensive context to VAPI
  const [planHistory, setPlanHistory] = useState<any[]>([])
  const router = useRouter()
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const getLanguageConfig = (language: string) => {
    const normalizedLang = language?.toLowerCase() || 'english'

    const workflowIds: Record<string, string | undefined> = {
      english:
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID_EN || process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
      spanish:
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID_ES || process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
      french:
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID_FR || process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
      arabic:
        process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID_AR || process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
      urdu: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID_UR || process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID,
    }

    const voiceConfigs: Record<
      string,
      {
        male:
        | 'Elliot'
        | 'Paige'
        | 'Kylie'
        | 'Rohan'
        | 'Lily'
        | 'Savannah'
        | 'Hana'
        | 'Neha'
        | 'Cole'
        | 'Harry'
        | 'Spencer'
        female:
        | 'Elliot'
        | 'Paige'
        | 'Kylie'
        | 'Rohan'
        | 'Lily'
        | 'Savannah'
        | 'Hana'
        | 'Neha'
        | 'Cole'
        | 'Harry'
        | 'Spencer'
      }
    > = {
      english: { male: 'Elliot', female: 'Paige' },
      spanish: { male: 'Elliot', female: 'Paige' },
      french: { male: 'Elliot', female: 'Paige' },
      arabic: { male: 'Elliot', female: 'Paige' },
      urdu: { male: 'Elliot', female: 'Paige' },
    }

    const workflowId = workflowIds[normalizedLang] || workflowIds.english
    const voices = voiceConfigs[normalizedLang] || voiceConfigs.english

    return {
      workflowId,
      voices,
      language: normalizedLang,
    }
  }

  useEffect(() => {
    const originalError = console.error
    console.error = function (msg, ...args) {
      if (
        msg?.includes?.('Meeting has ended') ||
        args[0]?.toString?.().includes?.('Meeting has ended')
      ) {
        return
      }
      return originalError.call(console, msg, ...args)
    }
    return () => {
      console.error = originalError
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (connecting) {
        e.preventDefault()
        e.returnValue =
          'You have a call connecting. Please wait for the connection to complete or cancel the call.'
        return 'You have a call connecting. Please wait for the connection to complete or cancel the call.'
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (connecting) {
        const confirmLeave = window.confirm(
          'You have a call connecting. Please wait for the connection to complete. Do you want to cancel the connection and leave?',
        )
        if (confirmLeave) {
          // Allow navigation
        } else {
          window.history.pushState(null, '', window.location.href)
          e.preventDefault()
        }
      }
    }

    if (connecting) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [connecting])

  useEffect(() => {
    if (!user) return

    const fetchCallHistory = async () => {
      const token = localStorage.getItem('user-token')
      if (!token) {
        console.log('No token found for fetching call history.')
        return
      }

      try {
        const res = await fetch('/api/call-history?limit=1000', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setCalls(data.data || [])
        } else {
          console.error('Failed to fetch call history')
        }
      } catch (error) {
        console.error('Error fetching call history:', error)
      }
    }

    fetchCallHistory()
  }, [user])

  useEffect(() => {
    const fetchUserContext = async () => {
      if (!user?.email) return

      try {
        const token = localStorage.getItem('user-token')
        const res = await fetch(`/api/user-context?email=${encodeURIComponent(user.email)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.lastPlanContext) {
            // lastPlanContext is now an array — store full history + extract latest for backward compat
            const contextArray = Array.isArray(data.lastPlanContext)
              ? data.lastPlanContext
              : [data.lastPlanContext]
            setPlanHistory(contextArray)
            const latestPlan = contextArray[contextArray.length - 1] || null
            setLastPlanContext(latestPlan)
          }
        }
      } catch (error) {
        console.error('Error fetching user context:', error)
      }
    }

    fetchUserContext()
  }, [user])

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (callEnded && planCreatedSuccessfully) {
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard/nutrition-plan')
      }, 1500)
      return () => clearTimeout(redirectTimer)
    }
  }, [callEnded, planCreatedSuccessfully, router])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (callActive && !callEnded) {
      interval = setInterval(() => {
        setCallDuration((prev) => {
          const newDuration = prev + 1
          if (newDuration >= 300 && !showOneMinuteWarning) {
            const token = localStorage.getItem('user-token')
            fetch('/api/users/me', {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((data) => {
                const currentCalls = data?.user?.aiCallsUsed ?? 0
                const maxCalls = data?.user?.maxAiCalls ?? 0
                setCurrentAiCallsUsed(currentCalls)
                setAvailableSessions(maxCalls - currentCalls)
              })
              .catch(console.error)
            setShowOneMinuteWarning(true)
          }
          return newDuration
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callActive, callEnded, showOneMinuteWarning])

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null

    if (showOneMinuteWarning) {
      setWarningCountdown(10)

      countdownInterval = setInterval(() => {
        setWarningCountdown((prev) => {
          if (prev <= 1) {
            setShowOneMinuteWarning(false)
            vapi.stop()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [showOneMinuteWarning])

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && connecting) {
        e.preventDefault()
        const confirmLeave = window.confirm(
          'You have a call connecting. Please wait for the connection to complete. Do you want to cancel the connection and continue?',
        )
        if (confirmLeave) {
          window.location.href = link.href
        }
      }
    }

    if (connecting) {
      document.addEventListener('click', handleLinkClick, true)
    }

    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [connecting])

  useEffect(() => {
    const handleCallStart = async () => {
      console.log('📞 Call started')
      setConnecting(false)
      setCallActive(true)
      setCallEnded(false)
      setCallDuration(0)
      setShowOneMinuteWarning(false)
      setSessionExtensionCount(0)

      // Increment aiCallsUsed when call starts
      try {
        const token = localStorage.getItem('user-token')
        if (token && user?.email) {
          await fetch('/api/users/increment-ai-calls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email }),
          })
        }
      } catch (error) {
        console.error('Failed to increment AI calls:', error)
      }
    }

    const handleCallEnd = () => {
      console.log('📞 Call ended')
      setCallActive(false)
      setConnecting(false)
      setIsAssistantSpeaking(false)
      setIsUserSpeaking(false)
      setCallEnded(true)
      setShowOneMinuteWarning(false)
      setSessionExtensionCount(0)

      if (!planCreatedSuccessfully) {
        const noPlanMessage = {
          content:
            "📝 Your conversation has ended. If you'd like to create a fitness plan, please start a new call.",
          role: 'assistant',
        }
        setMessages((prev) => [...prev, noPlanMessage])
      }
    }

    // When speech starts, assume the call is live and clear "connecting"
    const handleSpeechStart = () => {
      console.log('🎤 AI Speech started')
      setIsAssistantSpeaking(true)
      setIsUserSpeaking(false)
      setConnecting(false) // <-- clear connecting overlay immediately
      setCallActive(true) // <-- treat speech as an active call
      setCallEnded(false)
    }

    const handleSpeechEnd = () => {
      console.log('🎤 AI Speech ended')
      setIsAssistantSpeaking(false)
    }

    const handleMessage = (message: any) => {
      console.log('📨 Received message:', message)

      // If we receive transcript activity, assume the call has connected.
      if (message?.type === 'transcript' && message?.transcript?.trim()) {
        setConnecting(false) // <-- clear connecting overlay on first transcript
        setCallActive(true) // <-- treat transcript as an active call
      }

      if (message.type === 'call-ended' && message.call?.duration) {
        updateMinutesUsed(message.call.duration)
      }

      // Enhanced speech detection with continuous animation
      if (message.type === 'transcript' && message.role === 'user') {
        if (message.transcriptType === 'partial' && message.transcript?.trim()) {
          setIsUserSpeaking(true)
          setIsAssistantSpeaking(false)
        } else if (message.transcriptType === 'final') {
          // Keep animation for a moment after speech ends
          setTimeout(() => setIsUserSpeaking(false), 800)
        }
      }

      // Enhanced assistant speech detection
      if (message.type === 'transcript' && message.role === 'assistant') {
        if (message.transcriptType === 'partial' && message.transcript?.trim()) {
          setIsAssistantSpeaking(true)
          setIsUserSpeaking(false)
        } else if (message.transcriptType === 'final') {
          // Keep animation for a moment after speech ends
          setTimeout(() => setIsAssistantSpeaking(false), 800)
        }
      }

      if (
        message.type === 'transcript' &&
        message.transcriptType === 'final' &&
        message.transcript
      ) {
        return
      } else if (message.type === 'function-call' && message.functionCall) {
        console.log('🔧 Function call:', message.functionCall)

        const functionName = message.functionCall.name || ''
        const isPlanCreationCall =
          functionName.toLowerCase().includes('create') &&
          functionName.toLowerCase().includes('plan')

        if (isPlanCreationCall) {
          const hasResult = message.functionCall.result !== undefined
          const hasError = message.functionCall.error !== undefined

          if (hasResult && !hasError) {
            console.log('✅ Plan creation successful')
            setPlanCreatedSuccessfully(true)

            const successMessage = {
              content:
                '🎉 Your personalized fitness and nutrition plan has been created successfully!',
              role: 'system',
            }
            setMessages((prev) => [...prev, successMessage])
          } else if (hasError) {
            console.log('❌ Plan creation failed:', message.functionCall.error)

            const errorMessage = {
              content:
                '❌ Sorry, I encountered an issue creating your plan. Please try again or contact support.',
              role: 'system',
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        }
      }
    }

    const handleError = (error: any) => {
      console.error('❌ VAPI Error:', error)
      setConnecting(false)
      setCallActive(false)
    }

    vapi
      .on('call-start', handleCallStart)
      .on('call-end', handleCallEnd)
      .on('speech-start', handleSpeechStart)
      .on('speech-end', handleSpeechEnd)
      .on('message', handleMessage)
      .on('error', handleError)

    return () => {
      vapi
        .off('call-start', handleCallStart)
        .off('call-end', handleCallEnd)
        .off('speech-start', handleSpeechStart)
        .off('speech-end', handleSpeechEnd)
        .off('message', handleMessage)
        .off('error', handleError)
    }
  }, [planCreatedSuccessfully])

  const totals = useMemo(() => {
    const totalCalls = calls.length
    const totalMinutes = Math.round(
      calls.reduce((acc, c) => acc + (Number.isFinite(c.duration) ? c.duration / 60 : 0), 0),
    )
    const totalCost = Number(
      calls.reduce((acc, c) => acc + (Number.isFinite(c.cost) ? c.cost : 0), 0).toFixed(2),
    )
    return { totalCalls, totalMinutes, totalCost }
  }, [calls])

  const updateMinutesUsed = async (durationInSeconds: number) => {
    const minutesUsed = Math.ceil(durationInSeconds / 60)

    try {
      const token = localStorage.getItem('user-token')
      await fetch('/api/users/update-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ minutesUsed }),
      })

      window.location.reload()
    } catch (error) {
      console.error('Failed to update minutes:', error)
    }
  }

  const toggleCall = async () => {
    if (connecting) {
      alert('Please wait, call is connecting...')
      return
    }

    if (callActive) {
      vapi.stop()
      return
    }

    try {
      const token = localStorage.getItem('user-token')
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        const aiCallsUsed = userData?.aiCallsUsed ?? 0
        const maxAiCalls = userData?.maxAiCalls ?? 0
        // console.log('----------------------------------------')
        // console.log('AI Calls Used:', aiCallsUsed, '/', maxAiCalls)

        if (aiCallsUsed >= maxAiCalls || aiCallsUsed > maxAiCalls) {
          console.log('🚫 AI call limit reached')
          setCanMakeCall(false)
          setCallLimitMessage(
            'You have reached your AI call limit. Please upgrade your plan or buy more sessions to continue.',
          )
          return
        }

        startCallWithLanguage('english')
      } else {
        console.error('Failed to fetch user data')
        startCallWithLanguage('english')
      }
    } catch (error) {
      console.error('Error checking session limit:', error)
      startCallWithLanguage('english')
    }
  }

  const startCallWithLanguage = async (language: 'english' | 'arabic') => {
    setShowLanguageDialog(false)

    try {
      setConnecting(true)
      setMessages([])
      setCallEnded(false)
      setPlanCreatedSuccessfully(false)
      setIsAssistantSpeaking(false)
      setIsUserSpeaking(false)

      const userGender = (user as any)?.gender?.toLowerCase() || 'male'
      const config = getLanguageConfig(language)

      console.log('🔍 Selected language:', language)
      console.log('🔍 Using workflow ID:', config.workflowId)

      if (!config.workflowId) {
        throw new Error(`No workflow ID available. Please check your environment variables.`)
      }

      const voiceId = userGender === 'female' ? config.voices.female : config.voices.male

      // Build comprehensive previous plans summary for VAPI voice AI context
      const buildPlanHistorySummary = (plans: any[]): string => {
        if (!plans || plans.length === 0) return 'No previous plans.'

        return plans
          .map((plan: any, i: number) => {
            const exercises =
              plan.workoutPlan?.weeklySchedule
                ?.flatMap((day: any) => (day.exercises || []).map((ex: any) => ex.name))
                .filter(Boolean)
                .join(', ') || 'none'

            const meals = [
              plan.dietPlan?.mealPlan?.breakfast?.meal,
              plan.dietPlan?.mealPlan?.lunch?.meal,
              plan.dietPlan?.mealPlan?.dinner?.meal,
            ]
              .filter(Boolean)
              .join('; ')

            return `Plan ${i + 1} (${plan.generatedAt || 'unknown date'}): Goal=${plan.userDetails?.fitnessGoals || '?'}, Exercises=[${exercises}], Meals=[${meals || 'none'}], Calories=${plan.dietPlan?.calorieTarget || '?'}`
          })
          .join(' | ')
      }

      const allPlansContext = buildPlanHistorySummary(planHistory)

      // Extract last plan's exercise list for quick reference
      const lastPlanExercises =
        lastPlanContext?.workoutPlan?.weeklySchedule
          ?.flatMap((day: any) =>
            (day.exercises || []).map((ex: any) => `${ex.name} (${ex.sets}x${ex.reps})`),
          )
          .join(', ') || 'none'

      // Extract last plan's meals for quick reference
      const lastPlanMeals =
        [
          lastPlanContext?.dietPlan?.mealPlan?.breakfast?.meal,
          lastPlanContext?.dietPlan?.mealPlan?.lunch?.meal,
          lastPlanContext?.dietPlan?.mealPlan?.dinner?.meal,
        ]
          .filter(Boolean)
          .join('; ') || 'none'

      await vapi.start(config.workflowId, {
        voice: {
          voiceId: voiceId,
          provider: 'vapi',
        },
        variableValues: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest',
          email: user?.email || 'anonymous',
          firstName: user?.firstName || 'Guest',
          lastName: user?.lastName || '',
          gender: (user as any)?.gender || 'male',
          language: config.language,
          hasExistingPlan: lastPlanContext ? 'yes' : 'no',
          totalPlansGenerated: String(planHistory.length),
          lastPlanDate: lastPlanContext?.generatedAt
            ? new Date(lastPlanContext.generatedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            : 'none',
          lastPlanOverview:
            lastPlanContext?.workoutPlan?.overview ||
            lastPlanContext?.dietPlan?.overview ||
            // Backward compat with old single-object format
            lastPlanContext?.workoutPlanSummary?.overview ||
            lastPlanContext?.dietPlanSummary?.overview ||
            'none',
          lastPlanExercises: lastPlanExercises,
          lastPlanMeals: lastPlanMeals,
          lastPlanCalories: lastPlanContext?.dietPlan?.calorieTarget || 'not specified',
          lastPlanMacros: lastPlanContext?.dietPlan?.macroBreakdown
            ? `Protein: ${lastPlanContext.dietPlan.macroBreakdown.protein}, Carbs: ${lastPlanContext.dietPlan.macroBreakdown.carbohydrates}, Fats: ${lastPlanContext.dietPlan.macroBreakdown.fats}`
            : 'not specified',
          allPreviousPlans: allPlansContext,
          lastTimeUserAge: lastPlanContext?.userDetails?.age || 'not specified',
          lastTimeUserWeight: lastPlanContext?.userDetails?.weight || 'not specified',
          lastTimeUserHeight: lastPlanContext?.userDetails?.height || 'not specified',
          userFitnessLevel: lastPlanContext?.userDetails?.fitnessLevel || 'not specified',
          userFitnessGoals: lastPlanContext?.userDetails?.fitnessGoals || 'not specified',
          userWorkoutDays: lastPlanContext?.userDetails?.workoutDaysPerWeek || 'not specified',
        },
      })
    } catch (error: any) {
      console.error('❌ Failed to start VAPI call:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: `Failed to start call: ${error.message || 'Please check your connection and try again.'}`,
        },
      ])
      setConnecting(false)
      setCallActive(false)
    }
  }

  const isMobile = useIsMobile()
  if (loading) return null
  if (!user) return null
  return (
    <RequirePlanAccess>
      <div className="px-3 sm:px-6 py-3 sm:py-8 bg-black min-h-screen relative overflow-hidden">
        {/* Enhanced Background with reduced opacity */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-maxfit-neon-green/5 via-transparent to-transparent"></div>
        </div>

        {/* Animated Grid Background with reduced opacity */}
        <div className="absolute inset-0 opacity-[0.01]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        </div>

        {/* Call Connecting Overlay */}
        {connecting && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center animate-in fade-in duration-500">
            <div className="bg-maxfit-darker-grey/95 border border-maxfit-neon-green/30 p-6 sm:p-8 rounded-2xl text-center max-w-md mx-4 shadow-2xl relative overflow-hidden">
              {/* Animated background with reduced opacity */}
              <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/3 to-maxfit-neon-green/1 opacity-30"></div>

              <div className="relative">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
                  <div className="absolute inset-0 border-4 border-maxfit-neon-green/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-maxfit-neon-green border-t-transparent rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-4 border-2 border-maxfit-neon-green/30 border-b-transparent rounded-full animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                  ></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 bg-gradient-to-r from-maxfit-neon-green to-maxfit-neon-green-dark bg-clip-text text-transparent">
                  Connecting to Your Coach
                </h3>
                <p className="text-maxfit-medium-grey text-sm sm:text-base mb-2">
                  Initializing AI assistant...
                </p>
                <p className="text-xs sm:text-sm text-maxfit-medium-grey/60">
                  Please do not navigate away
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Language Selection Dialog */}
        {showLanguageDialog && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-maxfit-darker-grey/95 border border-maxfit-neon-green/30 p-6 sm:p-8 rounded-2xl text-center max-w-md mx-4 shadow-2xl relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/5 to-transparent opacity-50"></div>

              <div className="relative">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Select Your Language
                </h3>
                <p className="text-maxfit-medium-grey text-sm sm:text-base mb-6">
                  Choose your preferred language for the AI coach
                </p>

                <div className="space-y-3">
                  {/* English Button */}
                  <button
                    onClick={() => startCallWithLanguage('english')}
                    className="w-full group relative px-6 py-4 bg-gradient-to-r from-maxfit-neon-green/10 to-maxfit-neon-green/5 hover:from-maxfit-neon-green/20 hover:to-maxfit-neon-green/10 border-2 border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🇬🇧</div>
                        <div className="text-left">
                          <div className="text-white font-bold text-lg">English</div>
                          <div className="text-maxfit-medium-grey text-sm">
                            Start conversation in English
                          </div>
                        </div>
                      </div>
                      <div className="text-maxfit-neon-green opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Arabic Button */}
                  <button
                    onClick={() => startCallWithLanguage('arabic')}
                    className="w-full group relative px-6 py-4 bg-gradient-to-r from-maxfit-neon-green/10 to-maxfit-neon-green/5 hover:from-maxfit-neon-green/20 hover:to-maxfit-neon-green/10 border-2 border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🇦🇪</div>
                        <div className="text-left">
                          <div className="text-white font-bold text-lg">Arabic</div>
                          <div className="text-maxfit-medium-grey text-sm">
                            ابدأ المحادثة بالعربية
                          </div>
                        </div>
                      </div>
                      <div className="text-maxfit-neon-green opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Cancel Button */}
                <button
                  onClick={() => setShowLanguageDialog(false)}
                  className="mt-6 w-full px-6 py-3 bg-maxfit-darker-grey/50 hover:bg-maxfit-darker-grey border border-maxfit-medium-grey/30 hover:border-maxfit-medium-grey/50 rounded-xl text-maxfit-medium-grey hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative px-2 sm:px-4 py-2 sm:py-4">
          {/* HEADER SECTION */}
          <div className="text-center mb-2 sm:mb-12 animate-in slide-in-from-top duration-700 text-start">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6">
              <span className="text-maxfit-neon-green ">Generate Your Fitness Program</span>
            </h2>
            <p className="text-maxfit-medium-grey text-xs sm:text-lg leading-relaxed sm:block">
              Have a voice conversation with our AI assistant to create your personalized workout
              and nutrition plan
            </p>
          </div>

          {/* MAIN CONTENT - Single AI Assistant Card for both mobile and desktop */}
          <div className="mb-2 sm:mb-0 flex justify-center items-center min-h-[60vh] sm:min-h-0">
            <div className="w-full max-w-md">
              <AIAssistantCard
                isAssistantSpeaking={isAssistantSpeaking}
                isUserSpeaking={isUserSpeaking}
                callActive={callActive}
                callEnded={callEnded}
                user={user}
                connecting={connecting}
                planCreatedSuccessfully={planCreatedSuccessfully}
                onToggleCall={toggleCall}
                router={router}
              />
            </div>
          </div>

          {/* SYSTEM MESSAGES */}
          {messages.length > 0 && (
            <div className="bg-maxfit-darker-grey/40 border border-maxfit-neon-green/10 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 animate-in slide-in-from-bottom duration-500 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-maxfit-white">
                  Session Updates
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${callActive ? 'bg-maxfit-neon-green animate-pulse' : 'bg-maxfit-medium-grey'}`}
                  ></div>
                  <span className="text-xs text-maxfit-medium-grey">
                    {callActive ? 'Live Session' : 'Session Ended'}
                  </span>
                </div>
              </div>

              <div
                ref={messageContainerRef}
                className="space-y-3 overflow-y-auto pr-2 max-h-32 sm:max-h-40 custom-scrollbar"
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className="flex justify-center animate-in slide-in-from-bottom duration-300"
                  >
                    <div className="bg-maxfit-darker-grey/50 border border-maxfit-neon-green/20 text-maxfit-white p-3 sm:p-4 rounded-xl text-center max-w-md backdrop-blur-sm">
                      <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1-MINUTE WARNING MODAL */}
          {showOneMinuteWarning && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center animate-in fade-in duration-500">
              <div className="bg-maxfit-darker-grey/95 border border-yellow-500/30 p-6 sm:p-10 rounded-2xl text-center max-w-md mx-4 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-500/2"></div>

                <div className="relative">
                  <div className="text-5xl sm:text-6xl mb-4">⏰</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Time Limit Reached
                  </h3>
                  <p className="text-maxfit-medium-grey text-sm sm:text-base mb-2">
                    Your call has exceeded 1 minute.
                  </p>
                  <p className="text-maxfit-medium-grey text-sm sm:text-base mb-2">
                    You have used{' '}
                    <span className="text-yellow-400 font-bold">{currentAiCallsUsed}</span> of{' '}
                    <span className="text-white font-bold">
                      {currentAiCallsUsed + availableSessions}
                    </span>{' '}
                    sessions.
                  </p>
                  <p className="text-maxfit-medium-grey text-sm sm:text-base mb-2">
                    Available sessions:{' '}
                    <span
                      className={`font-bold ${availableSessions > 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {availableSessions}
                    </span>
                  </p>
                  <p className="text-red-400 text-sm sm:text-base mb-6 font-semibold">
                    The call is ending in{' '}
                    <span className="text-red-500 font-bold text-lg">{warningCountdown}</span>{' '}
                    seconds.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={async () => {
                        if (availableSessions <= 0) {
                          setShowOneMinuteWarning(false)
                          vapi.stop()
                          setCanMakeCall(false)
                          setCallLimitMessage(
                            'You have reached your AI call limit. Please upgrade your plan or buy more sessions to continue.',
                          )
                          return
                        }

                        try {
                          const token = localStorage.getItem('user-token')

                          const response = await fetch('/api/users/me', {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          })

                          if (response.ok) {
                            const userData = await response.json()
                            const currentAiCallsUsed = userData?.user?.aiCallsUsed ?? 0
                            const maxAiCalls = userData?.user?.maxAiCalls ?? 0

                            if (currentAiCallsUsed >= maxAiCalls) {
                              setShowOneMinuteWarning(false)
                              vapi.stop()
                              setCanMakeCall(false)
                              setCallLimitMessage(
                                'You have reached your AI call limit. Please upgrade your plan or buy more sessions to continue.',
                              )
                              return
                            }

                            await fetch('/api/users/increment-ai-calls', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ email: user?.email }),
                            })
                            setSessionExtensionCount((prev) => prev + 1)
                            setShowOneMinuteWarning(false)
                            setCallDuration(0)
                          }
                        } catch (error) {
                          console.error('Failed to check session limit:', error)
                        }
                      }}
                      disabled={availableSessions <= 0}
                      className={`w-full text-sm sm:text-base px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg ${availableSessions <= 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#B6E10A] text-black cursor-pointer hover:from-maxfit-neon-green-dark hover:to-maxfit-neon-green shadow-maxfit-neon-green/30'}`}
                    >
                      {availableSessions <= 0
                        ? 'No Sessions Left - Upgrade'
                        : 'Use +1 Session (Continue Call)'}
                    </Button>
                    <button
                      onClick={() => {
                        setShowOneMinuteWarning(false)
                        vapi.stop()
                      }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white border border-red-400/60 rounded-xl transition-all duration-300 text-sm sm:text-base font-semibold"
                    >
                      End Call
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALL LIMIT MODAL */}
          {!canMakeCall && callLimitMessage && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center animate-in fade-in duration-500">
              <div className="bg-maxfit-darker-grey/95 border border-red-500/30 p-6 sm:p-10 rounded-2xl text-center max-w-md mx-4 shadow-2xl relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-500/2"></div>

                <div className="relative">
                  <div className="text-5xl sm:text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Call Limit Reached
                  </h3>
                  <p className="text-maxfit-medium-grey text-sm sm:text-base mb-8">
                    {callLimitMessage}
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push('/dashboard/pricing-plan')}
                      className="w-full bg-[#B6E10A] text-black cursor-pointer hover:from-maxfit-neon-green-dark hover:to-maxfit-neon-green text-sm sm:text-base px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-maxfit-neon-green/30"
                    >
                      Upgrade Your Plan
                    </Button>
                    <button
                      onClick={() => setCanMakeCall(true)}
                      className="w-full px-6 py-3 bg-maxfit-darker-grey/50 cursor-pointer hover:bg-maxfit-darker-grey border border-maxfit-medium-grey/30 hover:border-maxfit-medium-grey/50 rounded-xl text-maxfit-medium-grey hover:scale-105 hover:text-white transition-all duration-300 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: hsl(72 100% 53% / 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: hsl(72 100% 53% / 0.5);
          }
        `}</style>
      </div>
    </RequirePlanAccess>
  )
}

export default AiAssistantPage
