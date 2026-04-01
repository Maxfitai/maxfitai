'use client'

import { useState, useEffect } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import Image from 'next/image'
import { fetchUserFitnessPrograms } from '@/app/(frontend)/lib/fetchFitnessPrograms'
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  Dumbbell,
  Download,
  Loader2,
  Search,
  RefreshCw,
} from 'lucide-react'
import { generatePDF } from '@/lib/pdf-generator'
import { useRouter } from 'next/navigation'

interface Exercise {
  name: string
  sets?: number | { $numberInt: string }
  reps: string
  //   weight: string
  restTime: string
  notes: string
  duration?: string
  intensity?: string
}

interface WorkoutDay {
  day: string
  workoutType: string
  exercises: Exercise[]
  duration: string
}

interface WorkoutPlan {
  overview: string
  duration: string
  frequency: string
  weeklySchedule: WorkoutDay[]
  progressionNotes: string
  safetyTips: string[]
}

interface FitnessProgram {
  id: string
  workoutPlan: WorkoutPlan
  dietPlan: any // Add this property to match the required structure
  generatedAt: string
  createdAt: string
}

export default function WorkoutPlansPage() {
  const { user, loading: authLoading } = useAuth()
  const [programs, setPrograms] = useState<FitnessProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [openProgram, setOpenProgram] = useState<string | null>(null)
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [openExercise, setOpenExercise] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio' | 'mixed'>('all')
  const router = useRouter()
  const loadPrograms = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    try {
      if (user?.email) {
        const fetchedPrograms = await fetchUserFitnessPrograms(user.email)
        {
          /* Filter to only include programs with workout plans*/
        }
        const workoutPrograms = fetchedPrograms.filter(
          (program: { workoutPlan: any }) => program.workoutPlan,
        )
        setPrograms(workoutPrograms)
      }
    } catch (error) {
      console.error('Error loading programs:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    loadPrograms()
  }, [user])
  if (authLoading) return null
  if (!user) return null
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  const getExerciseImage = (exerciseName: string): string => {
    const name = exerciseName.toLowerCase()

    // Cardio exercises
    if (name.includes('running') || name.includes('jog')) return '/running.jpg'
    if (name.includes('cycling') || name.includes('bike')) return '/cycling.jpg'
    if (name.includes('swimming')) return '/swimming.jpg'
    if (name.includes('walking-lunges')) return '/walking.jpg'
    if (name.includes('jumping jack')) return '/jumping-jacks.jpg'
    if (name.includes('burpee')) return '/burpees.jpg'

    // Upper body exercises
    if (name.includes('push-ups') || name.includes('pushup')) return '/push-ups.jpg'
    if (name.includes('pull up') || name.includes('pullup')) return '/pull-ups.jpg'
    if (name.includes('bench press')) return '/bench-press.jpg'
    if (name.includes('shoulder press') || name.includes('overhead press')) return '/shoulder-press.jpg'
    if (name.includes('lateral raise')) return '/lateral-raise.jpg'
    if (name.includes('bicep curl') || name.includes('curl')) return '/bicep-curls.jpg'
    if (name.includes('tricep')) return '/tricep-dips.jpg'
    if (name.includes('rows')) return '/rowing.jpg'
    if (name.includes('lat pulldown')) return '/lat-pulldown.jpg'

    // Lower body exercises
    if (name.includes('squat')) return '/squats.jpg'
    if (name.includes('deadlift')) return '/deadlifts.jpg'
    if (name.includes('lunge')) return '/lunges.jpg'
    if (name.includes('leg press')) return '/leg-press.jpg'
    if (name.includes('calf raise')) return '/calf-raises.jpg'
    if (name.includes('hip thrust')) return '/hip-thrust.jpg'
    if (name.includes('leg curl')) return '/leg-curls.jpg'
    if (name.includes('leg extension')) return '/leg-extension.jpg'

    // Core exercises
    if (name.includes('plank')) return '/plank.jpg'
    if (name.includes('crunch') || name.includes('sit up')) return '/crunches.jpg'
    if (name.includes('mountain climber')) return '/mountain-climbers.jpg'
    if (name.includes('russian twist')) return '/russian-twists.jpg'

    // Full body/compound exercises
    if (name.includes('clean') || name.includes('snatch')) return '/olympic-lifts.jpg'
    if (name.includes('kettlebell swing')) return '/kettlebell-swings.jpg'
    if (name.includes('battle rope')) return '/battle-ropes.jpg'

    // Default fallback
    return '/dumbbell.jpg'
  }


  const getSetsValue = (sets: number | { $numberInt: string } | undefined): number => {
    if (typeof sets === 'number') return sets
    if (sets && typeof sets === 'object' && '$numberInt' in sets) {
      return parseInt(sets.$numberInt)
    }
    return 0
  }

  const toggleProgram = (programId: string) => {
    setOpenProgram(openProgram === programId ? null : programId)
    setOpenDay(null)
    setOpenExercise(null)
  }

  const toggleDay = (dayId: string) => {
    setOpenDay(openDay === dayId ? null : dayId)
    setOpenExercise(null)
  }

  const toggleExercise = (exerciseId: string) => {
    setOpenExercise(openExercise === exerciseId ? null : exerciseId)
  }

  const handleDownloadPDF = async (program: FitnessProgram) => {
    if (!user) return

    setGeneratingPDF(program.id)
    try {
      const success = await generatePDF(program, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })

      if (!success) {
        console.error('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGeneratingPDF(null)
    }
  }

  const getWorkoutTypeFromSchedule = (schedule: WorkoutDay[]): string => {
    const types = schedule.map((day) => day.workoutType.toLowerCase())
    const hasStrength = types.some((type) => type.includes('strength') || type.includes('weight'))
    const hasCardio = types.some((type) => type.includes('cardio') || type.includes('running'))

    if (hasStrength && hasCardio) return 'mixed'
    if (hasStrength) return 'strength'
    if (hasCardio) return 'cardio'
    return 'mixed'
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.workoutPlan?.overview?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.workoutPlan?.weeklySchedule?.some((day) =>
        day.workoutType.toLowerCase().includes(searchTerm.toLowerCase()),
      )

    if (filterType === 'all') return matchesSearch

    const workoutType = getWorkoutTypeFromSchedule(program.workoutPlan?.weeklySchedule || [])
    return matchesSearch && workoutType === filterType
  })

  const getWorkoutStats = (program: FitnessProgram) => {
    const schedule = program.workoutPlan?.weeklySchedule || []
    const totalExercises = schedule.reduce((total, day) => total + day.exercises.length, 0)
    const avgDuration =
      schedule.length > 0
        ? schedule.reduce((total, day) => {
          const duration = parseInt(day.duration.replace(/\D/g, '')) || 0
          return total + duration
        }, 0) / schedule.length
        : 0

    return {
      totalWorkouts: schedule.length,
      totalExercises,
      avgDuration: Math.round(avgDuration),
      workoutType: getWorkoutTypeFromSchedule(schedule),
    }
  }

  if (loading) {
    return (
      <RequirePlanAccess>
        <div className="bg-black p-6">
          <div className="mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-700 rounded w-64 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-96"></div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-4 text-center min-w-[80px] animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-8 mx-auto"></div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-4 text-center min-w-[80px] animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-1"></div>
                    <div className="h-4 bg-gray-700 rounded w-12 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters Skeleton */}
            <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-2xl p-6 mb-6 animate-pulse">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="h-12 bg-gray-700 rounded-xl"></div>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-20 bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Program Cards Skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-2xl overflow-hidden animate-pulse">
                  {/* Program Header Skeleton */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-6 h-6 bg-gray-700 rounded"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-gray-700 rounded"></div>
                            <div className="h-5 bg-gray-700 rounded w-32"></div>
                            <div className="h-6 bg-gray-700 rounded-full w-16"></div>
                          </div>
                          <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-700 rounded w-16"></div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-700 rounded w-20"></div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 bg-gray-700 rounded"></div>
                              <div className="h-4 bg-gray-700 rounded w-18"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-32 bg-gray-700 rounded-lg"></div>
                        <div className="text-right">
                          <div className="h-6 bg-gray-700 rounded w-16 mb-1"></div>
                          <div className="h-4 bg-gray-700 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Program Details Skeleton */}
                  <div className="p-6 bg-gray-900/30">
                    {/* Overview Skeleton */}
                    <div className="mb-6">
                      <div className="h-6 bg-gray-700 rounded w-48 mb-3"></div>
                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-4">
                        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="text-center">
                              <div className="h-6 bg-gray-700 rounded w-12 mx-auto mb-1"></div>
                              <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Weekly Schedule Skeleton */}
                    <div className="mb-6">
                      <div className="h-6 bg-gray-700 rounded w-40 mb-3"></div>
                      <div className="grid gap-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((k) => (
                          <div key={k} className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-gray-700 rounded"></div>
                                <div>
                                  <div className="h-5 bg-gray-700 rounded w-20 mb-1"></div>
                                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                  <div className="h-4 bg-gray-700 rounded w-12"></div>
                                </div>
                                <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Section Skeleton */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-6">
                        <div className="h-6 bg-gray-700 rounded w-40 mb-3"></div>
                        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-4/5"></div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-6">
                        <div className="h-6 bg-gray-700 rounded w-32 mb-3"></div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((l) => (
                            <div key={l} className="flex items-start space-x-2">
                              <div className="w-3 h-3 bg-gray-700 rounded mt-1"></div>
                              <div className="h-4 bg-gray-700 rounded w-full"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RequirePlanAccess>
    )
  }

  return (
    <RequirePlanAccess>
      <div className="min-h-screen bg-black p-3 sm:p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between ">

              {/* Header Section */}
              <div className="mb-6 sm:mb-12 text-start items-start">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Workout Plans
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg">
                  Your personalized AI-generated workout programs and training schedules
                </p>
              </div>

              {/* Right Side - Refresh Button + Stats Cards */}
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => loadPrograms(true)}
                  disabled={refreshing}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-maxfit-neon-green/20 to-maxfit-neon-green/10 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 text-maxfit-neon-green hover:text-white hover:bg-maxfit-neon-green/30"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium hidden sm:inline">
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>

                {/* Stats Cards */}
                {programs.length > 0 && (
                  <>
                    <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-maxfit-neon-green/20 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                      <div className="text-maxfit-neon-green text-lg sm:text-2xl font-bold">
                        {programs.length}
                      </div>
                      <div className="text-maxfit-medium-grey text-[10px] sm:text-xs">Plans</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-maxfit-neon-green/20 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center min-w-[60px] sm:min-w-[80px]">
                      <div className="text-maxfit-neon-green text-lg sm:text-2xl font-bold">
                        {programs.reduce(
                          (total, p) => total + (p.workoutPlan?.weeklySchedule?.length || 0),
                          0,
                        )}
                      </div>
                      <div className="text-maxfit-medium-grey text-[10px] sm:text-xs">Workouts</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          {programs.length > 0 && (
            <div className="rounded-xl sm:rounded-2xl  mb-4 sm:mb-6">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 sm:w-5 h-4 sm:h-5 text-maxfit-medium-grey absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search workout plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-maxfit-darker-grey/50 border border-maxfit-medium-grey/30 rounded-lg sm:rounded-xl px-8 sm:px-10 py-2 sm:py-3 text-sm sm:text-base text-maxfit-white placeholder-maxfit-medium-grey focus:border-maxfit-neon-green focus:outline-none"
                  />
                </div>

                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
                  {(['all', 'strength', 'cardio', 'mixed'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${filterType === type
                        ? 'bg-maxfit-neon-green text-[#a8ff00]'
                        : 'bg-maxfit-darker-grey/50 text-maxfit-medium-grey hover:text-maxfit-white border border-maxfit-medium-grey/30'
                        }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {filteredPrograms.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-maxfit-neon-green/20 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center">
              <Dumbbell className="w-10 sm:w-16 h-10 sm:h-16 text-maxfit-medium-grey mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-maxfit-white mb-1.5 sm:mb-2">
                {programs.length === 0 ? 'No Workout Plans Yet' : 'No Plans Match Your Search'}
              </h3>
              <p className="text-maxfit-medium-grey text-sm sm:text-base mb-4 sm:mb-6">
                {programs.length === 0
                  ? 'Start a conversation with our AI assistant to generate your first personalized workout program.'
                  : "Try adjusting your search terms or filters to find the workout plans you're looking for."}
              </p>
              {programs.length === 0 && (
                // <Link href="/dashboard/maxi-ai">
                <button onClick={() => router.push("/dashboard/maxi-ai")} className="btn-neon px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base">Generate Workout Plan</button>
                // </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-6">
              {filteredPrograms.map((program, i) => {
                const stats = getWorkoutStats(program)
                return (
                  <div key={program.id} className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300  rounded-xl sm:rounded-2xl overflow-hidden">
                    {/* Program Header */}
                    <div className="p-3 sm:p-6 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors border-b border-maxfit-medium-grey/20">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center space-x-2 sm:space-x-4 flex-1"
                          onClick={() => toggleProgram(program.id)}
                        >
                          <div className="flex-shrink-0">
                            {openProgram === program.id ? (
                              <ChevronDown className="w-5 sm:w-6 h-5 sm:h-6 text-maxfit-neon-green" />
                            ) : (
                              <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6 text-maxfit-medium-grey" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                              <Calendar className="w-3 sm:w-4 h-3 sm:h-4 " />
                              <span className="text-maxfit-white font-semibold text-xs sm:text-base">
                                Plan {programs.length - i}
                              </span>
                              <span className="text-xs sm:text-sm">
                                {formatDate(program.createdAt)}
                              </span>
                              {/* <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-maxfit-neon-green/20 text-maxfit-neon-green capitalize">
                                {stats.workoutType}
                              </span> */}
                            </div>
                            {/* <p className="text-maxfit-medium-grey text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                              {program.workoutPlan?.overview}
                            </p> */}


                            {/* Stats */}
                            <div className="flex items-center flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm">
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-neon-green" />
                                <span className="text-maxfit-medium-grey">
                                  {stats.totalWorkouts} workouts
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 hidden sm:flex">
                                <Dumbbell className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-neon-green" />
                                <span className="text-maxfit-medium-grey">
                                  {stats.totalExercises} exercises
                                </span>
                              </div>
                              <div className="text-right hidden sm:block">
                                <div className="text-maxfit-neon-green font-semibold text-sm">
                                  {program.workoutPlan?.duration}
                                </div>
                                {/* <div className="text-maxfit-medium-grey text-xs">Duration</div> */}
                              </div>
                              {/* <div className="flex items-center space-x-1">
                                <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-maxfit-neon-green" />
                                <span className="text-maxfit-medium-grey">
                                  ~{stats.avgDuration} min
                                </span>
                              </div> */}
                            </div>

                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadPDF(program)
                            }}
                            disabled={generatingPDF === program.id}
                            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium bg-[#B8E30B] text-black hover:from-lime-500 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            {generatingPDF === program.id ? (
                              <>
                                <Loader2 className="w-3 sm:w-4 h-3 sm:h-4 animate-spin" />
                                <span className="hidden sm:inline">Generating...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3 sm:w-4 h-3 sm:h-4" />
                                <span className="hidden sm:inline">Download PDF</span>
                              </>
                            )}
                          </button>

                          {/* <div className="text-right hidden sm:block">
                            <div className="text-maxfit-neon-green font-semibold text-sm">
                              {program.workoutPlan?.duration}
                            </div>
                            <div className="text-maxfit-medium-grey text-xs">Duration</div>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Program Details */}
                    {openProgram === program.id && program.workoutPlan && (
                      <div className="p-3 sm:p-6 bg-maxfit-darker-grey/30">
                        {/* Program Overview */}
                        <div className="mb-6">
                          <h3 className="text-xs sm:text-lg sm:text-xl font-bold text-maxfit-white mb-3 flex items-center">
                            {/* <TrendingUp className="w-5 h-5 text-maxfit-neon-green mr-2" /> */}
                            Program Overview
                          </h3>
                          <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 rounded-xl p-4">
                            <p className="text-maxfit-medium-grey text-xs sm:text-sm leading-relaxed mb-4">
                              {program.workoutPlan.overview}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-maxfit-neon-green font-bold text-xs sm:text-lg">
                                  {program.workoutPlan.frequency}
                                </div>
                                <div className="text-maxfit-medium-grey text-xs sm:text-sm">Frequency</div>
                              </div>
                              <div className="text-center">
                                <div className="text-maxfit-neon-green font-bold text-xs sm:text-lg">
                                  {program.workoutPlan.duration}
                                </div>
                                <div className="text-maxfit-medium-grey text-xs sm:text-sm">Duration</div>
                              </div>
                              <div className="text-center">
                                <div className="text-maxfit-neon-green font-bold text-xs sm:text-lg">
                                  {stats.totalExercises}
                                </div>
                                <div className="text-maxfit-medium-grey text-xs sm:text-sm">
                                  Total Exercises
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Schedule */}
                        <div className="mb-6">
                          <h3 className="text-xs sm:text-lg sm:text-xl font-bold text-maxfit-white mb-3 flex items-center">
                            <Calendar className="w-5 h-5 text-maxfit-neon-green mr-2" />
                            Weekly Schedule
                          </h3>
                          <div className="grid gap-3">
                            {program.workoutPlan.weeklySchedule.map((day, dayIndex) => {
                              const dayId = `${program.id}-day-${dayIndex}`
                              return day.exercises.length !== 0 ? (
                                <div
                                  key={dayIndex}
                                  className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 rounded-xl overflow-hidden"
                                >
                                  <div
                                    className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                    onClick={() => toggleDay(dayId)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                          {openDay === dayId ? (
                                            <ChevronDown className="w-5 h-5 text-maxfit-neon-green" />
                                          ) : (
                                            <ChevronRight className="w-5 h-5 text-maxfit-medium-grey" />
                                          )}
                                        </div>
                                        <div>
                                          <div className="text-maxfit-white font-semibold text-xs sm:text-lg">
                                            {day.day}
                                          </div>
                                          <div className="text-maxfit-medium-grey text-xs sm:text-sm">
                                            {day.workoutType}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-4 text-xs sm:text-sm">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-4 h-4 text-maxfit-neon-green" />
                                          <span className="text-maxfit-medium-grey">
                                            {day.duration}
                                          </span>
                                        </div>
                                        <div className="bg-maxfit-neon-green/20 text-maxfit-neon-green px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                          {day.exercises.length} exercises
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Day Exercises */}
                                  {openDay === dayId && (
                                    <div className="p-4 pt-0 bg-maxfit-darker-grey/20">
                                      <div className="space-y-3">
                                        {day.exercises.map((exercise, exerciseIndex) => {
                                          const exerciseId = `${dayId}-exercise-${exerciseIndex}`
                                          return (
                                            <div
                                              key={exerciseIndex}
                                              className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 rounded-lg overflow-hidden"
                                            >
                                              <div
                                                className="p-4 cursor-pointer hover:bg-maxfit-medium-grey/5 transition-colors"
                                                onClick={() => toggleExercise(exerciseId)}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                      {openExercise === exerciseId ? (
                                                        <ChevronDown className="w-4 h-4 text-maxfit-neon-green" />
                                                      ) : (
                                                        <ChevronRight className="w-4 h-4 text-maxfit-medium-grey" />
                                                      )}
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                      <Dumbbell className="w-5 h-5 text-maxfit-neon-green" />
                                                    </div>
                                                    <div>
                                                      <div className="text-maxfit-white font-medium text-xs sm:text-base">
                                                        {exercise.name}
                                                      </div>
                                                      {exercise.sets && (
                                                        <div className="text-maxfit-medium-grey text-xs sm:text-sm">
                                                          {getSetsValue(exercise.sets)} sets × {exercise.reps}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="text-right">
                                                    {/* <div className="text-maxfit-neon-green font-semibold">
                                                      {exercise.weight}
                                                    </div> */}
                                                    {exercise.duration && (
                                                      <div className="text-maxfit-medium-grey text-xs">
                                                        {exercise.duration}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Exercise Details */}
                                              {openExercise === exerciseId && (
                                                <div className="p-4 pt-0 bg-maxfit-darker-grey/30">
                                                  {/* Conditional Exercise Media Based on User Plan */}
                                                  {user?.plan === 'starter' && (
                                                    <div className="mb-6">
                                                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 rounded-lg p-4 bg-maxfit-darker-grey/40">
                                                        <div className="flex justify-center">
                                                          <div className="relative">
                                                            <Image
                                                              src={getExerciseImage(exercise.name)}
                                                              alt={`How to perform ${exercise.name}`}
                                                              width={300}
                                                              height={200}
                                                              className="w-full max-w-md h-48 object-cover rounded-lg shadow-lg"
                                                              onError={(e) => {
                                                                e.currentTarget.src = '/dumbbell.jpg'
                                                              }}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                                                          </div>
                                                        </div>
                                                        <p className="text-maxfit-medium-grey text-xs sm:text-sm text-center mt-2">
                                                          Proper form demonstration for {exercise.name}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {user?.plan === 'free' && (
                                                    <div className="mb-6">
                                                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-lg p-4 bg-maxfit-darker-grey/40 border-2 border-dashed border-maxfit-medium-grey/30">
                                                        <div className="flex flex-col items-center justify-center py-8">
                                                          <Dumbbell className="w-12 h-12 text-maxfit-medium-grey mb-4" />
                                                          <p className="text-maxfit-medium-grey text-xs sm:text-sm text-center mb-2">
                                                            Exercise demonstration available with paid plans
                                                          </p>
                                                          <button className="btn-neon text-xs px-4 py-2 rounded-lg">
                                                            Upgrade Plan
                                                          </button>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {(user?.plan === 'proFit' || user?.plan === 'maxFlex') && (
                                                    <div className="mb-6">
                                                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-lg p-4 bg-maxfit-darker-grey/40">
                                                        <div className="flex justify-center">
                                                          <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden">
                                                            <iframe
                                                              width="100%"
                                                              height="100%"
                                                              src="https://www.youtube.com/embed/wIynl3at0Rs"
                                                              title={`How to perform ${exercise.name}`}
                                                              frameBorder="0"
                                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                              allowFullScreen
                                                              className="rounded-lg"
                                                            />
                                                          </div>
                                                        </div>
                                                        <p className="text-maxfit-medium-grey text-xs sm:text-sm text-center mt-2">
                                                          Professional video tutorial for {exercise.name}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}
                                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                                    {exercise.sets && (
                                                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-lg p-3 text-center">
                                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide mb-1">
                                                          Sets
                                                        </div>
                                                        <div className="text-maxfit-white font-bold text-xs sm:text-lg">
                                                          {getSetsValue(exercise.sets)}
                                                        </div>
                                                      </div>
                                                    )}
                                                    <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-lg p-3 text-center">
                                                      <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide mb-1">
                                                        Reps
                                                      </div>
                                                      <div className="text-maxfit-white font-bold text-xs sm:text-lg">
                                                        {exercise.reps}
                                                      </div>
                                                    </div>
                                                    {exercise.restTime && (
                                                      <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-lg p-3 text-center">
                                                        <div className="text-maxfit-medium-grey text-xs uppercase tracking-wide mb-1">
                                                          Rest
                                                        </div>
                                                        <div className="text-maxfit-white font-bold text-xs sm:text-lg">
                                                          {exercise.restTime}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                  {exercise.notes && (
                                                    <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-lg p-3">
                                                      <div className="flex items-start space-x-2">
                                                        <AlertCircle className="w-4 h-4 text-maxfit-neon-green mt-0.5 flex-shrink-0" />
                                                        <div>
                                                          <div className="text-maxfit-white font-medium text-xs sm:text-sm mb-1">
                                                            Exercise Notes
                                                          </div>
                                                          <p className="text-maxfit-medium-grey text-xs sm:text-sm leading-relaxed">
                                                            {exercise.notes}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>

                              ) : null
                            })}
                          </div>
                        </div>

                        {/* Progression Notes & Safety Tips */}
                        {/* <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 rounded-xl p-6">
                            <h4 className="text-xs sm:text-lg font-bold text-maxfit-white mb-3 flex items-center">
                              <TrendingUp className="w-5 h-5 text-maxfit-neon-green mr-2" />
                              Progression Notes
                            </h4>
                            <p className="text-maxfit-medium-grey text-xs sm:text-sm leading-relaxed">
                              {program.workoutPlan.progressionNotes}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300rounded-xl p-6">
                            <h4 className="text-xs sm:text-lg font-bold text-maxfit-white mb-3 flex items-center">
                              <AlertCircle className="w-5 h-5 text-maxfit-neon-green mr-2" />
                              Safety Tips
                            </h4>
                            <ul className="space-y-2">
                              {program.workoutPlan.safetyTips.map((tip, index) => (
                                <li
                                  key={index}
                                  className="text-maxfit-medium-grey text-xs sm:text-sm flex items-start space-x-2"
                                >
                                  <Star className="w-3 h-3 text-maxfit-neon-green mt-1 flex-shrink-0" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div> */}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </RequirePlanAccess>
  )
}
