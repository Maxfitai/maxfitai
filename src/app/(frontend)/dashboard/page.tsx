'use client'

import { useEffect, useMemo, useState, Suspense, use } from 'react'
import { Card, CardContent, CardHeader } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Phone,
  Clock,
  DollarSign,
  Zap,
  Sparkles,
  BadgeDollarSign,
  TrendingUp,
  Activity,
  Calendar as CalendarIcon,
  Users,
  Award,
} from 'lucide-react'
import MaxFitLogo from '@/app/(frontend)/assets/maxfit.svg'
import type { AppUser } from '@/types/app'
import Image from 'next/image'

type CallLog = {
  id: string
  assistantName: string
  createdAt: string
  duration: number
  status: string
  type: string
  cost: number
}

type CallHistoryResponse = {
  success: boolean
  data: CallLog[]
  pagination: { page: number; limit: number; total: number }
}

function Progress({
  value,
  max,
  className = '',
}: {
  value: number
  max: number
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0))
  return (
    <div
      className={`h-3 w-full rounded-full bg-gray-700 overflow-hidden border border-gray-600/40 shadow-inner ${className}`}
    >
      <div
        className="h-full bg-[#C8F80B] transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  gradient = 'from-maxfit-neon-green/20 to-green-500/20',
  onClick,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle: string
  gradient?: string
  onClick?: () => void
}) {
  return (
    <Card
      className={`bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-maxfit-neon-green/20 cursor-default group ${onClick ? 'cursor-pointer' : ''
        }`}
      onClick={onClick}
    >
      <CardHeader className="pb-1 sm:pb-3 pt-3 sm:pt-6 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`p-2 sm:p-1 rounded-lg sm:rounded-xl bg-gradient-to-r ${gradient} backdrop-blur-sm border border-maxfit-neon-green/20 group-hover:scale-110 transition-transform duration-300`}
            >
              {icon}
            </div>
            <div>
              <div className="text-gray-300 text-xs sm:text-sm font-medium">{title}</div>
            </div>
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-white mt-1 sm:mt-2 group-hover:text-maxfit-neon-green transition-colors duration-300">
          {value}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="text-gray-400 text-[10px] sm:text-sm">{subtitle}</div>
      </CardContent>
    </Card>
  )
}

function PaymentReturnHandler() {
  const searchParams = useSearchParams()
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<'paypal' | 'dodo' | null>(null)

  useEffect(() => {
    const handleReturn = async () => {
      // Check for PayPal params - PayPal uses token or ba_token specifically
      const token = searchParams?.get('token')
      const baToken = searchParams?.get('ba_token')

      // Check for Dodo params - Dodo returns with ?payment=success&status=success or status=failed
      const dodoPayment = searchParams?.get('payment')
      const dodoStatus = searchParams?.get('status')
      const isDodoSuccess = dodoPayment === 'success' && dodoStatus === 'success'
      const isDodoFailed = dodoPayment === 'success' && dodoStatus === 'failed'
      const isDodoReturn = dodoPayment === 'success'

      // Only trigger PayPal flow if we have PayPal-specific params (token/ba_token)
      // AND it's not a Dodo return
      if ((token || baToken) && !paymentProcessing && !isDodoReturn) {
        setProcessingType('paypal')
        setPaymentProcessing(true)
        try {
          const actualSubscriptionId = baToken || token
          const res = await fetch('/api/billing/activate-paypal-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ subscriptionId: actualSubscriptionId }),
          })

          const data = await res.json()
          if (res.ok) {
            alert(`Subscription activated! ${data.callsAdded} AI calls added to your account.`)
            window.history.replaceState({}, '', '/dashboard')
            window.location.reload()
          } else {
            alert(`Subscription activation failed`)
            window.history.replaceState({}, '', '/dashboard')
          }
        } catch (error) {
          console.error('PayPal activation error:', error)
          alert('Subscription activation failed.')
          window.history.replaceState({}, '', '/dashboard')
        } finally {
          setPaymentProcessing(false)
        }
      } else if (isDodoSuccess && !paymentProcessing) {
        // Handle Dodo Success
        setProcessingType('dodo')
        setPaymentProcessing(true)
        // Dodo is handled by webhooks, so we just show a success message and clear the URL
        setTimeout(() => {
          alert('Payment successful! Your plan will be updated shortly.')
          window.history.replaceState({}, '', '/dashboard')
          window.location.reload()
          setPaymentProcessing(false)
        }, 1500)
      } else if (isDodoFailed && !paymentProcessing) {
        // Handle failed Dodo payment - show error and clear URL
        alert('Payment failed. Please try again or contact support.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (isDodoReturn && !isDodoSuccess && !isDodoFailed && !paymentProcessing) {
        // Handle cancelled/unknown Dodo payment - clear the URL to prevent alert loop
        window.history.replaceState({}, '', '/dashboard')
      }
    }

    handleReturn()
  }, [searchParams, paymentProcessing])

  if (paymentProcessing) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-8 rounded-2xl border border-maxfit-neon-green/40 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-maxfit-neon-green border-t-transparent"></div>
            <div>
              <p className="text-white text-lg font-medium">
                {processingType === 'paypal'
                  ? 'Processing subscription...'
                  : 'Processing Dodo payment...'}
              </p>
              <p className="text-gray-400 text-sm">Please wait while we update your account</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function DashboardContent() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AppUser | null>(null)
  const [calls, setCalls] = useState<CallLog[]>([])
  const [callsLoading, setCallsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          console.log('🔄 Loading dashboard data...')

          const token = typeof window !== 'undefined' ? localStorage.getItem('user-token') : null
          console.log('🔑 Token available:', !!token)

          if (!token) {
            console.log('❌ No token found, redirecting to login')
            setLoading(false)
            setUser(null)
            return
          }

          try {
            console.log('👤 Fetching user with token...')
            const userRes = await fetch('/api/users/me', {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            })

            console.log('👤 User API response:', userRes.status, userRes.ok)

            if (!userRes.ok) {
              console.log('❌ User fetch failed, token might be invalid')
              localStorage.removeItem('user-token')
              setLoading(false)
              setUser(null)
              return
            }

            const userData = await userRes.json()
            console.log('👤 User data received:', userData?.user ? 'Found' : 'Not found')

            if (!mounted) return

            const fetchedUser = userData?.user as AppUser | undefined
            setUser(fetchedUser ?? null)
            setLoading(false)
            if (fetchedUser) {
              try {
                setCallsLoading(true)

                const normalize = (c: CallLog): CallLog => ({
                  id: c.id,
                  assistantName: c.assistantName,
                  createdAt: c.createdAt,
                  duration: Number(c.duration ?? 0),
                  status: c.status,
                  type: c.type,
                  cost: Number(c.cost ?? 0),
                })

                const pageSize = 100
                let page = 1
                let total = 0
                let all: CallLog[] = []

                console.log('📞 Fetching call history...')

                do {
                  const res = await fetch(
                    `/api/call-history?refresh=false&page=${page}&limit=${pageSize}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    },
                  )

                  console.log(`📞 Call history page ${page} response:`, res.status, res.ok)

                  if (!res.ok) {
                    console.log('❌ Call history fetch failed:', res.status, res.statusText)
                    break
                  }

                  const data: CallHistoryResponse = await res.json()
                  console.log('📞 Call history data:', data)

                  const pageData = Array.isArray(data?.data) ? data.data.map(normalize) : []
                  all = all.concat(pageData)
                  total = data?.pagination?.total ?? all.length
                  page += 1

                  // Safety break to prevent infinite loop
                  if (page > 10) {
                    console.log('⚠️ Breaking call history loop after 10 pages')
                    break
                  }
                } while (all.length < total && total > 0)

                if (!mounted) return
                console.log('✅ Call history loaded:', all.length, 'calls')
                setCalls(all)
              } catch (callError) {
                console.error('❌ Error loading calls:', callError)
                setCalls([]) // Set empty array on error
              } finally {
                if (mounted) {
                  setCallsLoading(false)
                }
              }
            } else {
              // No user, no calls
              setCalls([])
              setCallsLoading(false)
            }
          } catch (userError) {
            console.error('❌ Error fetching user:', userError)
            localStorage.removeItem('user-token')
            if (mounted) {
              setLoading(false)
              setUser(null)
              setCallsLoading(false)
            }
          }
        } catch (e) {
          console.error('❌ Dashboard load failed:', e)
          if (mounted) {
            setLoading(false)
            setCallsLoading(false)
          }
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

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

  const used = user?.minutesUsed ?? 0
  const quota = user?.minutesAllowed ?? 8
  const maxVal = quota

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.max(0, Math.floor(seconds % 60))
    return `${m}m ${s}s`
  }

  function go(path: string) {
    window.location.href = path
  }

  if (loading) {
    return (
      <div className="px-3 sm:px-6 py-4 sm:py-8 bg-black min-h-screen">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 sm:gap-6 md:flex-row md:items-center md:justify-between mb-4 sm:mb-8">
          <div className="space-y-1 sm:space-y-2">
            <div className="h-8 sm:h-12 md:h-14 bg-gray-800/60 rounded-lg animate-pulse w-64 sm:w-80"></div>
            <div className="h-4 sm:h-6 bg-gray-800/40 rounded animate-pulse w-80 sm:w-96"></div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800/40 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-800/40 rounded animate-pulse w-48"></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="h-10 sm:h-12 bg-gray-800/60 rounded-lg sm:rounded-xl animate-pulse w-28 sm:w-36"></div>
            <div className="h-10 sm:h-12 bg-gray-800/60 rounded-lg sm:rounded-xl animate-pulse w-24 sm:w-32"></div>
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-6 mb-4 sm:mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`bg-gray-900/40 border border-gray-800/60 rounded-xl p-3 sm:p-6 ${i === 3 ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-800/60 rounded-lg animate-pulse"></div>
                <div className="h-4 sm:h-5 bg-gray-800/60 rounded animate-pulse w-20 sm:w-24"></div>
              </div>
              <div className="h-6 sm:h-8 bg-gray-800/60 rounded animate-pulse w-16 sm:w-20 mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-24 sm:w-32"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
          {/* Usage Progress Card Skeleton */}
          <div className="xl:col-span-2 bg-gray-900/40 border border-gray-800/60 rounded-xl p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-800/60 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-5 sm:h-6 bg-gray-800/60 rounded animate-pulse w-24 sm:w-32 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-32 sm:w-40"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 sm:h-8 bg-gray-800/60 rounded animate-pulse w-12 sm:w-16 mb-1"></div>
                <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-16 sm:w-20"></div>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-4">
              <div className="h-3 bg-gray-800/60 rounded-full animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-16 sm:w-20"></div>
                <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-20 sm:w-24"></div>
              </div>
            </div>
          </div>

          {/* Stats Summary Card Skeleton */}
          <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800/60 rounded animate-pulse"></div>
              <div className="h-4 sm:h-5 bg-gray-800/60 rounded animate-pulse w-20 sm:w-24"></div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-16 sm:w-20"></div>
                  <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-8 sm:w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Card Skeleton */}
        <div className="bg-gray-900/40 border border-gray-800/60 rounded-xl p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800/60 rounded animate-pulse"></div>
            <div className="h-4 sm:h-6 bg-gray-800/60 rounded animate-pulse w-28 sm:w-36"></div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-2 sm:p-4 rounded-lg bg-gray-800/40 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-800/60 rounded animate-pulse"></div>
                    <div>
                      <div className="h-3 sm:h-4 bg-gray-800/60 rounded animate-pulse w-20 sm:w-24 mb-1"></div>
                      <div className="h-2 sm:h-3 bg-gray-800/40 rounded animate-pulse w-16 sm:w-20"></div>
                    </div>
                  </div>
                  <div className="h-3 sm:h-4 bg-gray-800/40 rounded animate-pulse w-12 sm:w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-md mx-auto p-8">
          <Image src={MaxFitLogo} alt="Locked" width={120} height={120} className="mb-4" />
          <div>
            <div className="text-2xl font-bold text-white mb-2">Authentication Required</div>
            <div className="text-gray-400 mb-6">
              Please log in to access your dashboard and manage your AI assistant calls
            </div>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem('user-token')
              window.location.href = '/login'
            }}
            className="bg-[#CFFF0F] text-gray-900 font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-maxfit-neon-green/25"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-6 py-4 sm:py-8 bg-black min-h-screen">
      {/* Enhanced Header with better typography and spacing */}
      <div className="flex flex-col gap-3 sm:gap-6 md:flex-row md:items-center md:justify-between mb-4 sm:mb-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            <div className='flex'>
              {user.profileImg && (
                <Image src={user.profileImg!} alt="Profile Image" width={40} height={40} className="w-10 h-10 rounded-full object-cover border-2 border-maxfit-neon-green" />
              )}
              Welcome {user.firstName ? user.firstName + "!" : 'to your Dashboard'}
            </div>
          </h1>
          <p className="text-gray-400 text-xs sm:text-lg">
            Track your AI assistant usage and manage your subscription
          </p>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Button
            className="bg-[#B6E10A] text-black font-bold px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:brightness-110 shadow-lg shadow-maxfit-neon-green/30 hover:shadow-maxfit-neon-green/50"
            onClick={() => router.push('/dashboard/maxi-ai')}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Start AI Calls
          </Button>
          <Button
            variant="outline"
            className="border-maxfit-neon-green/40 text-maxfit-neon-green hover:bg-maxfit-neon-green/10 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:border-maxfit-neon-green/60"
            onClick={() => go('/dashboard/pricing-plan')}
          >
            <BadgeDollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Upgrade
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
        {/* <MetricCard
          icon={<Phone className="w-4 h-4 sm:w-6 sm:h-6 text-maxfit-neon-green" />}
          title="Total Calls"
          value={user?.aiCallsUsed ?? 0}
          subtitle="All time AI assistant calls"
          gradient="from-maxfit-neon-green/20 to-green-500/20"
        /> */}



        <MetricCard
          icon={<Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />}
          title="Total Sessions"
          value={user?.aiCallsUsed ?? 0}
          subtitle="Sum of all call sessions"
          gradient="from-blue-500/20 to-cyan-500/20"
        />

        <MetricCard
          icon={<Award className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />}
          title="Current Plan"
          value={callsLoading ? '—' : `${user?.plan ?? 'Free'}`}
          subtitle="Upgrade for more sessions"
          gradient="from-purple-500/20 to-pink-500/20"
          onClick={() => go('/dashboard/pricing-plan')}
        />
        <Card className="hidden md:block bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-maxfit-neon-green/20 to-green-500/20">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green" />
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-lg">Quick Stats</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs sm:text-sm">Today's Calls</span>
              <span className="text-white font-medium text-xs sm:text-sm">
                {
                  calls.filter(
                    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString(),
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs sm:text-sm">This Week</span>
              <span className="text-white font-medium text-xs sm:text-sm">
                {
                  calls.filter(
                    (c) => new Date(c.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs sm:text-sm">Avg Duration</span>
              <span className="text-white font-medium text-xs sm:text-sm">
                {calls.length > 0
                  ? formatDuration(calls.reduce((acc, c) => acc + c.duration, 0) / calls.length)
                  : '0m 0s'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="md:hidden bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-maxfit-neon-green/20 to-green-500/20">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green" />
            </div>
            <h3 className="text-white font-semibold text-sm sm:text-lg">Quick Stats</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs sm:text-sm">Today's Calls</span>
            <span className="text-white font-medium text-xs sm:text-sm">
              {
                calls.filter(
                  (c) => new Date(c.createdAt).toDateString() === new Date().toDateString(),
                ).length
              }
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs sm:text-sm">This Week</span>
            <span className="text-white font-medium text-xs sm:text-sm">
              {
                calls.filter(
                  (c) => new Date(c.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ).length
              }
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs sm:text-sm">Avg Duration</span>
            <span className="text-white font-medium text-xs sm:text-sm">
              {calls.length > 0
                ? formatDuration(calls.reduce((acc, c) => acc + c.duration, 0) / calls.length)
                : '0m 0s'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Main Content Grid */}
      {/* <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-3 mb-2 sm:mb-3"> */}
      {/* Usage Progress Card - Takes 2 columns on xl screens */}
      <Card className="xl:col-span-2 bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/40 hover:border-maxfit-neon-green/60 transition-all duration-300">
        <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-maxfit-neon-green/20 to-green-500/20 backdrop-blur-sm border border-maxfit-neon-green/20">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-maxfit-neon-green" />
              </div>
              <div>
                <div className="text-gray-300 text-sm sm:text-lg font-semibold">
                  Sessions Used
                </div>
                <div className="text-[10px] sm:text-sm text-gray-500 flex items-center gap-2 sm:gap-4">
                  {user?.currentPeriodEnd && (
                    <span className="hidden sm:flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      Renews {new Date(user.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-2xl font-bold text-white">
                {user?.aiCallsUsed ?? 0}
              </div>
              <div className="text-[10px] sm:text-sm text-gray-400">
                of {user?.maxAiCalls ?? 0} sessions
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          {callsLoading ? (
            <div className="h-3 w-full animate-pulse bg-gray-800/80 rounded-full" />
          ) : (
            <>
              <Progress value={user?.aiCallsUsed ?? 0} max={user?.maxAiCalls ?? 1} />
              <div className="flex justify-between items-center">
                <div className="text-[10px] sm:text-sm text-gray-400">
                  {Math.min(
                    100,
                    Math.round(((user?.aiCallsUsed ?? 0) / (user?.maxAiCalls || 1)) * 100),
                  )}
                  % used
                </div>
                <div className="text-[10px] sm:text-sm text-maxfit-neon-green font-medium">
                  {Math.max(0, (user?.maxAiCalls ?? 0) - (user?.aiCallsUsed ?? 0))} sessions
                  remaining
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary Card */}
      {/* <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30">
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-maxfit-neon-green/20 to-green-500/20">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green" />
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-lg">Quick Stats</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs sm:text-sm">Today's Calls</span>
              <span className="text-white font-medium text-xs sm:text-sm">
                {
                  calls.filter(
                    (c) => new Date(c.createdAt).toDateString() === new Date().toDateString(),
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs sm:text-sm">This Week</span>
              <span className="text-white font-medium text-xs sm:text-sm">
                {
                  calls.filter(
                    (c) => new Date(c.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs sm:text-sm">Avg Duration</span>
              <span className="text-white font-medium text-xs sm:text-sm">
                {calls.length > 0
                  ? formatDuration(calls.reduce((acc, c) => acc + c.duration, 0) / calls.length)
                  : '0m 0s'}
              </span>
            </div>
          </CardContent>
        </Card> */}
      {/* </div> */}

      {/* Enhanced Recent Calls Card */}
      <Card className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-maxfit-neon-green/20 to-green-500/20">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-maxfit-neon-green" />
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-lg">Recent Activity</h3>
            </div>
            {/* <Button
              variant="ghost"
              className="text-maxfit-neon-green hover:text-maxfit-neon-green/80 hover:bg-maxfit-neon-green/10 rounded-lg transition-all duration-300"
              onClick={() => go('/dashboard/call-history')}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          {callsLoading ? (
            <div className="space-y-2 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 sm:h-16 bg-gradient-to-r from-gray-800/40 to-gray-700/20 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-6 sm:py-12">
              <div className="p-3 sm:p-4 rounded-full bg-gray-800/40 w-fit mx-auto mb-3 sm:mb-4">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              </div>
              <div className="text-gray-400 text-sm sm:text-lg mb-1 sm:mb-2">No calls yet</div>
              <div className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
                Start your first AI assistant call
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {calls.slice(0, 5).map((c, index) => (
                <div
                  key={c.id}
                  className="p-2 sm:p-4 rounded-lg bg-gradient-to-r from-gray-800/40 to-gray-700/20 border border-gray-700/30 hover:border-maxfit-neon-green/40 transition-all duration-300 hover:bg-gray-700/30"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-maxfit-neon-green/20 to-green-500/20">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-maxfit-neon-green" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-xs sm:text-base">
                          {c.assistantName}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 sm:gap-2">
                          <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm">
                      <div className="text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#B7E20B]" />
                        {formatDuration(c.duration || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-8 rounded-2xl border border-maxfit-neon-green/40 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-maxfit-neon-green border-t-transparent"></div>
                <div>
                  <p className="text-white text-lg font-medium">Loading...</p>
                  <p className="text-gray-400 text-sm">Please wait</p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <PaymentReturnHandler />
      </Suspense>

      <DashboardContent />
    </div>
  )
}
