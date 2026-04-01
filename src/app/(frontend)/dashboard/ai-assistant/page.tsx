'use client'

import { Button } from '@/app/(frontend)/components/ui/button'
import { vapi } from '@/app/(frontend)/lib/vapi'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import MaleImage from '@/app/(frontend)/assets/male.png'
import FemaleImage from '@/app/(frontend)/assets/female.png'
import Image from 'next/image'
import { useCall } from '@/app/(frontend)/context/CallProvider'

type CallLog = {
  id: string
  assistantName: string
  createdAt: string
  duration: number
  status: string
  type: string
  cost: number
}

// Enhanced Voice Wave Component with smoother animations
const VoiceWave = ({
  isSpeaking,
  isUserSpeaking,
}: {
  isSpeaking: boolean
  isUserSpeaking: boolean
}) => {
  const bars = 5
  const [heights, setHeights] = useState(Array(bars).fill(4))

  useEffect(() => {
    if (!isSpeaking) {
      setHeights(Array(bars).fill(4))
      return
    }

    const interval = setInterval(() => {
      setHeights(
        Array(bars)
          .fill(0)
          .map(() => Math.random() * 30 + 15),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isSpeaking])

  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 bg-maxfit-neon-green rounded-full transition-all duration-100 ease-out"
          style={{
            height: `${height}px`,
            opacity: isSpeaking ? 1 : 0.3,
            boxShadow: isSpeaking ? '0 0 8px rgba(0, 255, 65, 0.6)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

// Floating Particles Background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-maxfit-neon-green/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  )
}

const AiAssistantPage = () => {
  const { callActive, setCallActive } = useCall()
  const [connecting, setConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [callEnded, setCallEnded] = useState(false)
  const [canMakeCall, setCanMakeCall] = useState(true)
  const [callLimitMessage, setCallLimitMessage] = useState('')
  const [calls, setCalls] = useState<CallLog[]>([])
  const [planCreatedSuccessfully, setPlanCreatedSuccessfully] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const messageContainerRef = useRef<HTMLDivElement>(null)

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
    const handleCallStart = () => {
      console.log('📞 Call started')
      setConnecting(false)
      setCallActive(true)
      setCallEnded(false)
      setIsSpeaking(false)
      setIsUserSpeaking(false)
    }

    const handleCallEnd = () => {
      console.log('📞 Call ended')
      setCallActive(false)
      setConnecting(false)
      setIsSpeaking(false)
      setIsUserSpeaking(false)
      setCallEnded(true)

      if (!planCreatedSuccessfully) {
        const noPlanMessage = {
          content:
            "📝 Your conversation has ended. If you'd like to create a fitness plan, please start a new call.",
          role: 'assistant',
        }
        setMessages((prev) => [...prev, noPlanMessage])
      }
    }

    const handleSpeechStart = () => {
      setIsSpeaking(true)
      setIsUserSpeaking(false)
    }

    const handleSpeechEnd = () => {
      setIsSpeaking(false)
      setTimeout(() => {
        if (callActive) {
          setIsUserSpeaking(true)
        }
      }, 200)
    }

    const handleMessage = (message: any) => {
      console.log('📨 Received message:', message)

      if (message.type === 'call-ended' && message.call?.duration) {
        updateMinutesUsed(message.call.duration)
      }

      if (message.type === 'transcript' && message.role === 'assistant') {
        setIsUserSpeaking(false)
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
      setIsSpeaking(false)
      setIsUserSpeaking(false)
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
  }, [planCreatedSuccessfully, callActive])

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

    const minutesUsed = user?.minutesUsed ?? 0
    const minutesAllowed = user?.minutesAllowed ?? 8

    if (minutesUsed >= minutesAllowed) {
      console.log('🚫 Call limit reached for free plan')
      setCanMakeCall(false)
      setCallLimitMessage('You have reached the limit for free plan. Please upgrade to continue.')
      return
    }

    if (callActive) {
      vapi.stop()
    } else {
      try {
        setConnecting(true)
        setMessages([])
        setCallEnded(false)
        setPlanCreatedSuccessfully(false)
        setIsSpeaking(false)
        setIsUserSpeaking(false)

        const userLanguage = user?.language?.toLowerCase() || 'english'
        const userGender = (user as any)?.gender?.toLowerCase() || 'male'

        const config = getLanguageConfig(userLanguage)

        console.log('🔍 User language:', userLanguage)
        console.log('🔍 Using workflow ID:', config.workflowId)

        if (!config.workflowId) {
          throw new Error(`No workflow ID available. Please check your environment variables.`)
        }

        const voiceId = userGender === 'female' ? config.voices.female : config.voices.male

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
  }

  return (
    <RequirePlanAccess>
      <div className="px-6 py-8 bg-black min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/10 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-maxfit-neon-green/5 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-maxfit-neon-green/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        <FloatingParticles />

        {/* Call Connecting Overlay - Enhanced */}
        {connecting && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
              {/* Outer glow rings */}
              <div className="absolute inset-0 -m-20">
                <div className="absolute inset-0 border-2 border-maxfit-neon-green/20 rounded-full animate-ping"></div>
                <div
                  className="absolute inset-0 border-2 border-maxfit-neon-green/30 rounded-full animate-ping"
                  style={{ animationDelay: '0.5s' }}
                ></div>
              </div>

              <div className="relative bg-gradient-to-br from-maxfit-darker-grey to-black border-2 border-maxfit-neon-green/50 p-12 rounded-3xl text-center max-w-md mx-4 shadow-2xl">
                {/* Animated spinner with multiple layers */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-maxfit-neon-green/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-maxfit-neon-green border-t-transparent rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-2 border-4 border-maxfit-neon-green/40 border-b-transparent rounded-full animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                  ></div>

                  {/* Pulsing center dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-maxfit-neon-green rounded-full animate-pulse"></div>
                  </div>
                </div>

                <h3 className="text-3xl font-bold bg-gradient-to-r from-maxfit-white to-maxfit-neon-green bg-clip-text text-transparent mb-4">
                  Connecting to Your Coach
                </h3>
                <p className="text-maxfit-medium-grey mb-3 text-lg">Initializing AI assistant...</p>
                <p className="text-sm text-maxfit-medium-grey/70 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-maxfit-neon-green rounded-full animate-pulse"></span>
                  Please do not navigate away
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="relative container mx-auto px-4 py-12 max-w-6xl">
          {/* HEADER SECTION - Enhanced */}
          <div className="text-center mb-16 animate-in slide-in-from-top duration-700">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-maxfit-darker-grey/80 to-maxfit-darker-grey/60 backdrop-blur-sm border border-maxfit-neon-green/30 rounded-full px-8 py-3 mb-8 hover:border-maxfit-neon-green/60 transition-all hover:scale-105 shadow-lg shadow-maxfit-neon-green/10">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-maxfit-neon-green rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-maxfit-neon-green rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-maxfit-neon-green text-sm font-bold tracking-wide">
                AI-POWERED FITNESS COACH
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span className="text-maxfit-white">Generate Your </span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-maxfit-neon-green via-green-400 to-maxfit-neon-green bg-clip-text text-transparent animate-pulse">
                  Fitness Program
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-maxfit-neon-green to-transparent"></div>
              </span>
            </h1>

            <p className="text-maxfit-medium-grey text-xl max-w-2xl mx-auto leading-relaxed">
              Have a{' '}
              <span className="text-maxfit-neon-green font-semibold">voice conversation</span> with
              our AI assistant to create your
              <span className="text-maxfit-white font-semibold">
                {' '}
                personalized workout and nutrition plan
              </span>
            </p>
          </div>

          {/* MAIN CONTENT - Enhanced Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* AI ASSISTANT CARD */}
            <div className="group relative">
              {/* Glow effect */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-maxfit-neon-green to-green-600 rounded-3xl blur-lg transition-all duration-500 ${
                  isSpeaking ? 'opacity-75 animate-pulse' : callActive ? 'opacity-30' : 'opacity-0'
                }`}
              ></div>

              <div className="relative glass-card rounded-3xl p-10 hover-lift transition-all duration-500 bg-gradient-to-br from-maxfit-darker-grey/90 to-black/90">
                <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity rounded-3xl"></div>

                <div className="relative flex flex-col items-center text-center">
                  {/* AI Avatar with enhanced effects */}
                  <div className="relative mb-8">
                    {/* Outer glow rings */}
                    {isSpeaking && (
                      <>
                        <div className="absolute -inset-8 border-2 border-maxfit-neon-green/30 rounded-full animate-ping"></div>
                        <div
                          className="absolute -inset-6 border-2 border-maxfit-neon-green/40 rounded-full animate-ping"
                          style={{ animationDelay: '0.3s' }}
                        ></div>
                        <div
                          className="absolute -inset-4 border-2 border-maxfit-neon-green/50 rounded-full animate-ping"
                          style={{ animationDelay: '0.6s' }}
                        ></div>
                      </>
                    )}

                    {/* Rotating ring */}
                    <div
                      className={`absolute -inset-2 rounded-full transition-all duration-500 ${
                        isSpeaking ? 'border-4 border-maxfit-neon-green/40 animate-spin' : ''
                      }`}
                      style={{ animationDuration: '3s' }}
                    ></div>

                    {/* Main glow */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        isSpeaking
                          ? 'bg-maxfit-neon-green/40 scale-150 blur-2xl'
                          : callActive
                            ? 'bg-maxfit-neon-green/20 scale-125 blur-xl'
                            : 'bg-maxfit-darker-grey/30'
                      }`}
                    ></div>

                    <div
                      className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-maxfit-darker-grey via-black to-maxfit-darker-grey border-4 transition-all duration-300 ${
                        isSpeaking
                          ? 'border-maxfit-neon-green shadow-lg shadow-maxfit-neon-green/50'
                          : 'border-maxfit-neon-green/30'
                      } flex items-center justify-center overflow-hidden`}
                    >
                      <Image
                        src={
                          (user as any)?.gender?.toLowerCase() === 'female'
                            ? FemaleImage
                            : MaleImage
                        }
                        alt="AI Avatar"
                        width={140}
                        height={140}
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-maxfit-white mb-3">
                    MaxFIT<span className="text-maxfit-neon-green">AI</span>
                  </h2>
                  <p className="text-maxfit-medium-grey mb-8 text-lg">
                    Your Personal Fitness & Diet Coach
                  </p>

                  {/* Voice Wave Visualization */}
                  {callActive && (
                    <div className="mb-6 bg-maxfit-darker-grey/50 rounded-2xl p-4 border border-maxfit-neon-green/20">
                      <VoiceWave isSpeaking={isSpeaking} isUserSpeaking={false} />
                    </div>
                  )}

                  {/* Enhanced Status Indicator */}
                  <div
                    className={`inline-flex items-center space-x-4 px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
                      isSpeaking
                        ? 'bg-maxfit-neon-green/30 border-2 border-maxfit-neon-green shadow-lg shadow-maxfit-neon-green/30'
                        : callActive
                          ? 'bg-blue-500/20 border-2 border-blue-500/50'
                          : callEnded
                            ? 'bg-green-500/20 border-2 border-green-500/50'
                            : 'bg-maxfit-darker-grey/70 border-2 border-maxfit-darker-grey'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        isSpeaking
                          ? 'bg-maxfit-neon-green animate-pulse shadow-lg shadow-maxfit-neon-green/50'
                          : callActive
                            ? 'bg-blue-500 animate-pulse'
                            : callEnded
                              ? 'bg-green-500'
                              : 'bg-maxfit-medium-grey'
                      }`}
                    ></div>
                    <span className="text-base font-bold text-maxfit-white tracking-wide">
                      {isSpeaking
                        ? '🎤 AI Speaking...'
                        : callActive
                          ? '👂 Listening...'
                          : callEnded
                            ? '✅ Session Complete'
                            : '⏳ Ready to Start'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* USER CARD */}
            <div className="group relative">
              {/* Glow effect */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-maxfit-neon-green to-green-600 rounded-3xl blur-lg transition-all duration-500 ${
                  isUserSpeaking ? 'opacity-75 animate-pulse' : 'opacity-0'
                }`}
              ></div>

              <div className="relative glass-card rounded-3xl p-10 hover-lift transition-all duration-500 bg-gradient-to-br from-maxfit-darker-grey/90 to-black/90">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity rounded-3xl"></div>

                <div className="relative flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    {/* User speaking rings */}
                    {isUserSpeaking && (
                      <>
                        <div className="absolute -inset-8 border-2 border-maxfit-neon-green/30 rounded-full animate-ping"></div>
                        <div
                          className="absolute -inset-6 border-2 border-maxfit-neon-green/40 rounded-full animate-ping"
                          style={{ animationDelay: '0.3s' }}
                        ></div>
                        <div
                          className="absolute -inset-4 border-2 border-maxfit-neon-green/50 rounded-full animate-ping"
                          style={{ animationDelay: '0.6s' }}
                        ></div>
                      </>
                    )}

                    {/* Rotating ring */}
                    <div
                      className={`absolute -inset-2 rounded-full transition-all duration-500 ${
                        isUserSpeaking ? 'border-4 border-maxfit-neon-green/40 animate-spin' : ''
                      }`}
                      style={{ animationDuration: '3s' }}
                    ></div>

                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        isUserSpeaking ? 'bg-maxfit-neon-green/30 scale-150 blur-2xl' : ''
                      }`}
                    ></div>

                    <div
                      className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-maxfit-darker-grey via-black to-maxfit-darker-grey border-4 transition-all duration-300 ${
                        isUserSpeaking
                          ? 'border-maxfit-neon-green shadow-lg shadow-maxfit-neon-green/50'
                          : 'border-maxfit-medium-grey/30'
                      } flex items-center justify-center overflow-hidden`}
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-maxfit-neon-green/30 to-maxfit-neon-green/10 rounded-full flex items-center justify-center">
                        <span className="text-5xl font-black text-maxfit-neon-green">
                          {user?.firstName?.charAt(0)?.toUpperCase() || '👤'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-black text-maxfit-white mb-3">You</h2>
                  <p className="text-maxfit-medium-grey mb-8 text-lg">
                    {user
                      ? `${user.firstName} ${user.lastName || ''}`.trim()
                      : 'Fitness Enthusiast'}
                  </p>

                  {/* Voice Wave for User */}
                  {callActive && (
                    <div className="mb-6 bg-maxfit-darker-grey/50 rounded-2xl p-4 border border-maxfit-neon-green/20">
                      <VoiceWave isSpeaking={isUserSpeaking} isUserSpeaking={true} />
                    </div>
                  )}

                  <div
                    className={`inline-flex items-center space-x-4 px-6 py-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
                      isUserSpeaking
                        ? 'bg-maxfit-neon-green/30 border-2 border-maxfit-neon-green shadow-lg shadow-maxfit-neon-green/30'
                        : 'bg-maxfit-darker-grey/70 border-2 border-maxfit-darker-grey'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        isUserSpeaking
                          ? 'bg-maxfit-neon-green animate-pulse shadow-lg shadow-maxfit-neon-green/50'
                          : 'bg-green-500'
                      }`}
                    ></div>
                    <span className="text-base font-bold text-maxfit-white tracking-wide">
                      {isUserSpeaking ? "🎤 You're Speaking..." : '💪 Ready to Transform'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONNECTION INDICATOR */}
          {callActive && (
            <div className="mb-8 flex justify-center animate-in fade-in duration-500">
              <div className="relative">
                {/* Animated connection line */}
                <div className="flex items-center space-x-2 bg-gradient-to-r from-maxfit-darker-grey via-maxfit-neon-green/20 to-maxfit-darker-grey backdrop-blur-sm border-2 border-maxfit-neon-green/30 rounded-full px-8 py-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-maxfit-neon-green rounded-full"></div>
                      <div className="absolute inset-0 bg-maxfit-neon-green rounded-full animate-ping"></div>
                    </div>

                    {/* Animated dots */}
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-maxfit-neon-green rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>

                    <span className="text-maxfit-white font-bold text-lg tracking-wide">
                      LIVE SESSION
                    </span>

                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-maxfit-neon-green rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="w-3 h-3 bg-maxfit-neon-green rounded-full"></div>
                      <div className="absolute inset-0 bg-maxfit-neon-green rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM MESSAGES */}
          {messages.length > 0 && (
            <div className="glass-card rounded-3xl p-8 mb-10 animate-in slide-in-from-bottom duration-500 border-2 border-maxfit-neon-green/20 bg-gradient-to-br from-maxfit-darker-grey/90 to-black/90">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-maxfit-neon-green to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <h3 className="text-2xl font-bold text-maxfit-white">Session Updates</h3>
                </div>
                <div className="flex items-center space-x-3 bg-maxfit-darker-grey/70 px-4 py-2 rounded-full border border-maxfit-neon-green/20">
                  <div
                    className={`w-3 h-3 rounded-full ${callActive ? 'bg-maxfit-neon-green animate-pulse' : 'bg-gray-500'}`}
                  ></div>
                  <span className="text-sm font-bold text-maxfit-white">
                    {callActive ? 'LIVE' : 'ENDED'}
                  </span>
                </div>
              </div>

              <div
                ref={messageContainerRef}
                className="space-y-4 overflow-y-auto pr-2 max-h-48"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#00ff41 transparent',
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className="flex justify-center animate-in slide-in-from-bottom duration-300"
                  >
                    <div className="bg-gradient-to-r from-maxfit-darker-grey to-maxfit-darker-grey/80 border-2 border-maxfit-neon-green/40 text-maxfit-white p-5 rounded-2xl text-center max-w-2xl backdrop-blur-sm shadow-lg">
                      <p className="text-base leading-relaxed font-medium">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CALL ACTION BUTTON - Enhanced */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Multiple glow layers */}
              {(connecting || callActive) && (
                <>
                  <div className="absolute -inset-4 bg-maxfit-neon-green/20 rounded-full blur-2xl animate-pulse"></div>
                  <div
                    className="absolute -inset-8 bg-maxfit-neon-green/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  ></div>
                </>
              )}

              <Button
                onClick={
                  callEnded && planCreatedSuccessfully
                    ? () => router.push('/dashboard/nutrition-plan')
                    : toggleCall
                }
                disabled={connecting}
                className={`relative px-16 py-8 text-xl font-black rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wider ${
                  callActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-2xl shadow-red-600/40 border-2 border-red-500'
                    : connecting
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-maxfit-black cursor-not-allowed border-2 border-yellow-400'
                      : callEnded
                        ? planCreatedSuccessfully
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-2xl shadow-green-600/40 border-2 border-green-500'
                          : 'bg-gradient-to-r from-maxfit-neon-green to-green-500 hover:from-green-500 hover:to-maxfit-neon-green text-maxfit-black shadow-2xl shadow-maxfit-neon-green/40 border-2 border-maxfit-neon-green'
                        : 'bg-gradient-to-r from-maxfit-neon-green to-green-500 hover:from-green-500 hover:to-maxfit-neon-green text-maxfit-black shadow-2xl shadow-maxfit-neon-green/40 border-2 border-maxfit-neon-green'
                }`}
              >
                {connecting && (
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 border-3 border-maxfit-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <span className={`flex items-center gap-3 ${connecting ? 'ml-8' : ''}`}>
                  <span className="text-2xl">
                    {connecting
                      ? '⏳'
                      : callActive
                        ? '🛑'
                        : callEnded
                          ? planCreatedSuccessfully
                            ? '📊'
                            : '🔄'
                          : '🎯'}
                  </span>
                  {connecting
                    ? 'Connecting...'
                    : callActive
                      ? 'End Call'
                      : callEnded
                        ? planCreatedSuccessfully
                          ? 'View Nutrition Plan'
                          : 'Start New Call'
                        : 'Start Your Journey'}
                </span>
              </Button>
            </div>
          </div>

          {/* CALL LIMIT MESSAGE - Enhanced */}
          {!canMakeCall && callLimitMessage && (
            <div className="text-center mt-10 animate-in slide-in-from-bottom duration-500">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-red-500/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-red-900/40 to-red-800/30 border-2 border-red-500/60 text-red-300 p-8 rounded-3xl max-w-md mx-auto backdrop-blur-sm shadow-2xl">
                  <div className="text-6xl mb-4 animate-bounce">⚠️</div>
                  <p className="font-black text-2xl mb-3 text-red-200">Call Limit Reached</p>
                  <p className="text-base mb-6 text-red-300/90">{callLimitMessage}</p>
                  <Button
                    onClick={() => router.push('/dashboard/pricing-plan')}
                    className="bg-gradient-to-r from-maxfit-neon-green to-green-500 text-maxfit-black hover:from-green-500 hover:to-maxfit-neon-green text-base px-8 py-4 rounded-xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wider"
                  >
                    ⚡ Upgrade Your Plan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Session Info - Enhanced */}
          {callActive && (
            <div className="mt-10 text-center animate-in fade-in duration-500">
              <div className="inline-flex items-center space-x-6 bg-gradient-to-r from-maxfit-darker-grey/80 via-maxfit-neon-green/10 to-maxfit-darker-grey/80 backdrop-blur-sm border-2 border-maxfit-neon-green/30 rounded-full px-10 py-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-maxfit-neon-green rounded-full"></div>
                    <div className="absolute inset-0 bg-maxfit-neon-green rounded-full animate-ping"></div>
                  </div>
                  <span className="text-maxfit-white text-base font-bold">LIVE SESSION</span>
                </div>
                <div className="w-px h-6 bg-maxfit-medium-grey/40"></div>
                <span className="text-maxfit-medium-grey text-base font-medium">
                  🎙️ Speak naturally with your AI coach
                </span>
              </div>
            </div>
          )}

          {/* Tips Section */}
          {!callActive && !connecting && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700">
              {[
                {
                  icon: '🎤',
                  title: 'Natural Conversation',
                  desc: 'Talk like you would with a real fitness coach',
                },
                {
                  icon: '📊',
                  title: 'Personalized Plans',
                  desc: 'Get workout & nutrition plans tailored to you',
                },
                {
                  icon: '⚡',
                  title: 'Instant Results',
                  desc: 'Your plan is created immediately after the call',
                },
              ].map((tip, i) => (
                <div
                  key={i}
                  className="group relative glass-card rounded-2xl p-6 hover-lift transition-all duration-500 bg-gradient-to-br from-maxfit-darker-grey/80 to-black/80 border border-maxfit-neon-green/10 hover:border-maxfit-neon-green/30"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-maxfit-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  <div className="relative text-center">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                      {tip.icon}
                    </div>
                    <h3 className="text-xl font-bold text-maxfit-white mb-2">{tip.title}</h3>
                    <p className="text-maxfit-medium-grey text-sm">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequirePlanAccess>
  )
}

export default AiAssistantPage
