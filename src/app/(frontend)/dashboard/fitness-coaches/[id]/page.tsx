'use client'

import { Coach } from '../constants'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Card, CardContent } from '@/app/(frontend)/components/ui/card'
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitter,
  FaShareAlt,
} from 'react-icons/fa'

import {
  Clock,
  CheckCircle2,
  PlayCircle,
  Calendar,
  ChevronLeft,
  Award,
  CheckCircle,
  Dumbbell,
  Flame,
  Target,
  DollarSign,
  MessageCircle,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import ChatPopup from '@/app/(frontend)/components/chat/ChatPopup'

interface EnrollmentStatus {
  hasActiveEnrollment: boolean
  enrollment?: any
  enrollmentStatus?: string
}

export default function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [coach, setCoach] = useState<Coach | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<string, EnrollmentStatus>>({})
  const [enrollingPlanId, setEnrollingPlanId] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    fetchCoach()
  }, [id])

  useEffect(() => {
    if (coach && user && !authLoading) {
      checkEnrollmentStatuses()
    }
  }, [coach, user, authLoading])

  const fetchCoach = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/coaches/public/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setCoach(null)
          return
        }
        throw new Error('Failed to fetch coach')
      }
      const data = await response.json()
      setCoach(data)
    } catch (err) {
      console.error('Error fetching coach:', err)
      setError('Failed to load coach profile. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const checkEnrollmentStatuses = async () => {
    if (!user || !coach?.plans) return

    const statuses: Record<string, EnrollmentStatus> = {}

    for (const plan of coach.plans) {
      try {
        const response = await fetch(
          `/api/enrollments/status?userId=${user.email}&coachId=${id}&planId=${plan.id}`,
        )
        const data = await response.json()
        statuses[plan.id] = data
      } catch (error) {
        console.error('Error checking enrollment status:', error)
        statuses[plan.id] = { hasActiveEnrollment: false }
      }
    }

    setEnrollmentStatuses(statuses)
  }

  const handleEnroll = async (planId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setEnrollingPlanId(planId)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          coachId: id,
          planId: planId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEnrollmentStatuses((prev) => ({
          ...prev,
          [planId]: {
            hasActiveEnrollment: false,
            enrollment: data.enrollment,
            enrollmentStatus: 'pending',
          },
        }))
      } else {
        alert(data.error || 'Failed to enroll')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('Failed to enroll in plan')
    } finally {
      setEnrollingPlanId(null)
    }
  }

  const handleOpenChat = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          coachId: id,
        }),
      })

      const data = await response.json()
      if (data.conversation) {
        setConversationId(data.conversation.id)
        setIsChatOpen(true)
      }
    } catch (error) {
      console.error('Error opening chat:', error)
    }
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/dashboard/fitness-coaches/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)

    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maxfit-neon-green"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchCoach} variant="outline" className="text-black">
          Try Again
        </Button>
      </div>
    )
  }

  if (!coach) {
    return notFound()
  }

  const hasAnyActiveEnrollment = Object.values(enrollmentStatuses).some(
    (s) => s.hasActiveEnrollment,
  )

  const handleBookSession = () => {
    window.open(coach.calendlyUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {isChatOpen && conversationId && (
        <ChatPopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          conversationId={conversationId}
          coachId={id}
          coachName={coach.name}
          coachImage={coach.image}
        />
      )}

      {/* Chat Button for enrolled users */}
      {user && !authLoading && hasAnyActiveEnrollment && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleOpenChat}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#BEEA0C] to-[#9AC40A] text-black font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Coach
          </button>
        </div>
      )}

      {/* Back Button */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 mb-4 sm:mb-6">
          <Link
            href="/dashboard/fitness-coaches"
            className="inline-flex items-center text-gray-400 hover:text-[#BEEA0C] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Coaches
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-[#BEEA0C] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-8 sm:mb-16">
        {/* Left: Image */}
        <div className="relative h-64 sm:h-80 lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-800 shadow-2xl shadow-[#BEEA0C]/10">
          <Image src={coach.image} alt={coach.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
            <div className="flex items-center gap-2 mb-2"></div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">
                {coach.name}
              </h1>
              {coach.verified && <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#B0DA09]" />}
            </div>
          </div>
        </div>

        {/* Right: Info & Bio */}
        <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 sm:w-8 sm:h-1 bg-[#BEEA0C] rounded-full"></span>
              About Coach
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{coach.bio}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-900/50 p-3 sm:p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <span className="text-gray-400 text-xs sm:text-sm">Experience</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white">{coach.experience}</p>
            </div>
            <div className="bg-gray-900/50 p-3 sm:p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <span className="text-gray-400 text-xs sm:text-sm">Session Rate</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-white">${coach.pricePerSession}/hr</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {coach.specializations.map((spec, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 text-sm"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center w-full gap-4">
            <Button
              onClick={() => handleBookSession()}
              className="w-full h-14 text-lg font-bold bg-accent-gradient text-black hover:bg-white transition-all shadow-lg shadow-[#BEEA0C]/20 cursor-pointer"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Session via Calendly
            </Button>
            <button
              onClick={() => handleCopyLink(coach.id)}
              className="bg-accent-gradient text-black hover:bg-white h-14 w-14 rounded-full relative flex items-center justify-center"
              title="Copy Profile Link"
            >
              <FaShareAlt size={24} />
              {copiedId === coach.id && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  Link Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      {coach.plans && coach.plans.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-[#BEEA0C]" />
            Training Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coach.plans.map((plan) => {
              const status = enrollmentStatuses[plan.id]
              const isEnrolling = enrollingPlanId === plan.id

              return (
                <Card
                  key={plan.id}
                  className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-gray-800 hover:border-maxfit-neon-green/50 transition-all duration-300 group overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#BEEA0C] transition-colors">
                          {plan.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">{plan.type} Plan</p>
                      </div>
                      {plan.price > 0 && (
                        <span className="text-maxfit-neon-green font-bold">${plan.price}</span>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm line-clamp-2">{plan.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-800/50 text-gray-300 border border-gray-700/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.duration}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-800/50 text-gray-300 border border-gray-700/50 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {plan.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-800/50 text-gray-300 border border-gray-700/50 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {plan.workouts?.length || 0} workouts
                      </span>
                    </div>

                    {plan.tags && plan.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
                        {plan.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-maxfit-neon-green/10 text-maxfit-neon-green border border-maxfit-neon-green/20"
                          >
                            {tag}
                          </span>
                        ))}
                        {plan.tags.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400">
                            +{plan.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Enrollment Button */}
                    {user && !authLoading && (
                      <div className="pt-2">
                        {status?.hasActiveEnrollment ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Enrolled
                          </div>
                        ) : status?.enrollmentStatus === 'pending' ? (
                          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Pending Approval
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(plan.id)}
                            disabled={isEnrolling}
                            className="w-full py-2 px-4 bg-gradient-to-r from-[#BEEA0C] to-[#9AC40A] text-black font-bold rounded-lg hover:from-[#9AC40A] hover:to-[#7AA300] transition-all disabled:opacity-50"
                          >
                            {isEnrolling ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enrolling...
                              </span>
                            ) : (
                              'Enroll Now'
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {!user && !authLoading && (
                      <div className="pt-2">
                        <Link
                          href="/login"
                          className="block w-full py-2 px-4 bg-gradient-to-r from-[#BEEA0C] to-[#9AC40A] text-black font-bold rounded-lg text-center hover:from-[#9AC40A] hover:to-[#7AA300] transition-all"
                        >
                          Login to Enroll
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#BEEA0C]" />
          Certifications & Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {coach.achievements.map((achievement, i) => (
            <div
              key={i}
              className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-gray-900/30 border border-gray-800 hover:border-[#BEEA0C]/30 transition-colors"
            >
              <div className="mt-0.5 sm:mt-1">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#BEEA0C]" />
              </div>
              <p className="text-gray-300 font-medium text-sm sm:text-base">{achievement}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#BEEA0C]" />
            Workout Library
          </h2>
          <span className="text-gray-400 text-sm">{coach.videos?.length || 0} videos</span>
        </div>

        {coach.videos && coach.videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coach.videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="bg-gray-900/40 border-gray-800 hover:border-gray-700 group cursor-pointer overflow-hidden h-full">
                  <div className="relative h-40 sm:h-48 w-full">
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        {video.contentType === 'tiktok' ? (
                          <>
                            <div className="text-pink-500 mb-2">
                              <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                            </div>
                            <span className="text-pink-500 font-bold text-base sm:text-lg">
                              TikTok Video
                            </span>
                          </>
                        ) : video.contentType === 'instagram' ? (
                          <>
                            <div className="text-purple-500 mb-2">
                              <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                            </div>
                            <span className="text-purple-500 font-bold text-base sm:text-lg">
                              Instagram Video
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="text-gray-500 mb-2">
                              <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                            </div>
                            <span className="text-gray-500 font-bold text-base sm:text-lg">
                              Video
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/80 flex items-center justify-center transform scale-90 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    {video.contentType && (
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium backdrop-blur-sm ${video.contentType === 'youtube'
                            ? 'bg-red-500/80 text-white'
                            : video.contentType === 'tiktok'
                              ? 'bg-pink-500/80 text-white'
                              : video.contentType === 'instagram'
                                ? 'bg-purple-500/80 text-white'
                                : 'bg-gray-500/80 text-white'
                            }`}
                        >
                          {video.contentType.charAt(0).toUpperCase() + video.contentType.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-[#BEEA0C] transition-colors">
                      {video.title}
                    </h3>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/20 rounded-xl border border-gray-800">
            <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No workout videos available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  )
}
