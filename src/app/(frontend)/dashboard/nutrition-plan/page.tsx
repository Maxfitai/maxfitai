'use client'

import { useState, useEffect, useCallback } from 'react'
import { RequirePlanAccess } from '../../lib/RequirePlanAccess'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import { fetchUserFitnessPrograms } from '@/app/(frontend)/lib/fetchFitnessPrograms'
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Target,
  Droplets,
  Zap,
  Download,
  Loader2,
  Lock,
  Sunrise,
  Sun,
  Moon,
  Apple,
  Crown,
  Sparkles,
  CircleArrowUp
} from 'lucide-react'
import { generatePDF } from '@/lib/pdf-generator'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface WorkoutPlan {
  overview: string
  duration: string
  frequency: string
  weeklySchedule: any[]
  progressionNotes: string
  safetyTips: string[]
}

interface Meal {
  meal: string
  calories: number | { $numberInt: string }
  protein: string
  carbs: string
  fats: string
}

interface Snack {
  snack: string
  calories: number | { $numberInt: string }
  timing: string
}

interface MealPlan {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Snack[]
}

interface DietPlan {
  overview: string
  calorieTarget: string
  macroBreakdown: {
    protein: string
    carbohydrates: string
    fats: string
  }
  mealPlan: MealPlan
  hydrationGoal: string
  supplementRecommendations: string[]
  nutritionTips: string[]
}

interface FitnessProgram {
  id: string
  workoutPlan: WorkoutPlan
  dietPlan: DietPlan
  generatedAt: string
  createdAt: string
}

// Meal card data config
const MEAL_CONFIG = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    icon: Sunrise,
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
    free: true,
  },
  {
    key: 'lunch',
    label: 'Lunch',
    icon: Sun,
    color: '#39ff14',
    gradient: 'from-lime-500/20 to-green-500/10',
    border: 'border-lime-500/30',
    glow: 'shadow-lime-500/10',
    free: false,
  },
  {
    key: 'dinner',
    label: 'Dinner',
    icon: Moon,
    color: '#818cf8',
    gradient: 'from-indigo-500/20 to-purple-500/10',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/10',
    free: false,
  },
  {
    key: 'snacks',
    label: 'Snacks',
    icon: Apple,
    color: '#fb7185',
    gradient: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-rose-500/10',
    free: false,
  },
]

export default function NutritionPlanPage() {
  const { user } = useAuth()
  const [programs, setPrograms] = useState<FitnessProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openProgram, setOpenProgram] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)
  const router = useRouter()

  const isFree = user?.plan === 'free'

  const loadPrograms = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }
    try {
      setError(null)
      const fetchedPrograms = await fetchUserFitnessPrograms(user.email)
      setPrograms(fetchedPrograms.filter((p: { dietPlan: any }) => p.dietPlan))
    } catch (err) {
      console.error('Error loading programs:', err)
      setError('Failed to load nutrition plans')
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    loadPrograms()
  }, [loadPrograms])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const getCaloriesValue = useCallback((calories: number | { $numberInt: string }): number => {
    if (typeof calories === 'number') return calories
    if (calories && typeof calories === 'object' && '$numberInt' in calories) {
      return parseInt(calories.$numberInt)
    }
    return 0
  }, [])

  const toggleProgram = useCallback((programId: string) => {
    setOpenProgram((prev) => (prev === programId ? null : programId))
  }, [])

  const handleDownloadPDF = useCallback(
    async (program: FitnessProgram) => {
      if (!user) return
      setGeneratingPDF(program.id)
      try {
        const success = await generatePDF(program, {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        })
        if (!success) setError('Failed to generate PDF')
      } catch {
        setError('Error generating PDF')
      } finally {
        setGeneratingPDF(null)
      }
    },
    [user],
  )

  // ─── Loading Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <RequirePlanAccess>
        <div className="min-h-screen bg-black p-4 sm:p-8">
          <div className="mx-auto">
            <div className="animate-pulse mb-10">
              <div className="h-10 bg-gray-800 rounded-lg w-56 mb-3" />
              <div className="h-5 bg-gray-800 rounded w-80" />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="mb-6 bg-gray-900/50 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-800 rounded w-40 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-gray-800 rounded-xl h-48" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </RequirePlanAccess>
    )
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <RequirePlanAccess>
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="text-center">
            <Target className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Plans</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadPrograms}
              className="px-6 py-2.5 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </RequirePlanAccess>
    )
  }

  // ─── Meal Card Component ──────────────────────────────────────────────────
  const MealCard = ({
    config,
    program,
    isLocked,
  }: {
    config: (typeof MEAL_CONFIG)[0]
    program: FitnessProgram
    isLocked: boolean
  }) => {
    const Icon = config.icon
    const dp = program.dietPlan

    const getMealData = () => {
      if (config.key === 'breakfast') return dp.mealPlan.breakfast
      if (config.key === 'lunch') return dp.mealPlan.lunch
      if (config.key === 'dinner') return dp.mealPlan.dinner
      return null
    }

    const meal = config.key !== 'snacks' ? getMealData() : null
    const snacks = config.key === 'snacks' ? dp.mealPlan.snacks : null
    const totalSnackCals = snacks
      ? snacks.reduce((t, s) => t + getCaloriesValue(s.calories), 0)
      : 0

    return (
      <div
        className={`relative rounded-2xl flex flex-col bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 overflow-hidden shadow-lg ${config.glow}`}
        style={{ minHeight: 220 }}
      >
        {isLocked && (
          <div className="absolute inset-0 z-20 rounded-2xl overflow-hidden">
            {/* Layer 1: solid base — blocks all text from showing through during animation */}
            <div className="absolute inset-0 bg-gray-950/80 rounded-2xl" />
            {/* Layer 2: your original blur + gradient on top */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-800/60 backdrop-blur-lg rounded-2xl border border-maxfit-neon-green/30" />
            {/* Layer 3: content centered above both */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-[#B7E20B] text-gray-500">
                <Lock className="w-5 h-5 text-black" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">{config.label} Locked</p>
              <p className="text-gray-400 text-xs text-center px-4 mb-4">
                Upgrade to Premium to unlock all meals
              </p>
              <button
                onClick={() => router.push('/dashboard/pricing-plan')}
                className="flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#B7E20B] transition-all hover:scale-105"
              >
                <CircleArrowUp className="w-3.5 h-3.5" />
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Card Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white font-bold text-sm">{config.label}</span>
            {!isLocked && config.key !== 'snacks' && meal && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border border-gray-700">
                {getCaloriesValue(meal.calories)} cal
              </span>
            )}
            {!isLocked && config.key === 'snacks' && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full border border-gray-700">
                {totalSnackCals} cal
              </span>
            )}
          </div>

          {/* Meal description */}
          {config.key !== 'snacks' && meal && (
            <p className="text-gray-300 text-xs leading-relaxed mb-3">
              {meal.meal}
            </p>
          )}
          {config.key === 'snacks' && snacks && (
            <div className="space-y-1.5 mb-3">
              {snacks.map((snack, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-lime-400 text-xs mt-0.5">•</span>
                  <span className="text-gray-300 text-xs ">{snack.snack}</span>
                </div>
              ))}
              {/* {snacks.length > 2 && (
                <p className="text-xs">+{snacks.length - 2} more</p>
              )} */}
            </div>
          )}
        </div>

        {/* Macros row — mt-auto pins it to the bottom */}
        {config.key !== 'snacks' && meal && (
          <div className="px-4 pb-4 mt-auto">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Protein', value: meal.protein },
                { label: 'Carbs', value: meal.carbs },
                { label: 'Fats', value: meal.fats },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg p-2 text-center"
                  style={{ background: `${config.color}11` }}
                >
                  <div className="text-white font-bold text-xs">{value}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {config.key === 'snacks' && snacks && (
          <div className="px-4 pb-4 mt-auto">
            <div
              className="rounded-lg p-2 text-center"
              style={{ background: `${config.color}11` }}
            >
              <div className="text-white font-bold text-xs">{snacks.length} snacks</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wide">Total items</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <RequirePlanAccess>
      <div className="min-h-screen bg-black p-4 sm:p-8">
        <div className="mx-auto">

          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-1">
                  Nutrition Plans
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Your AI-generated meal plans, tailored to your goals
                </p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {programs.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-maxfit-neon-green/20 rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center">
              <Calendar className="w-10 sm:w-16 h-10 sm:h-16 text-maxfit-medium-grey mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-maxfit-white mb-1.5 sm:mb-2">
                {programs.length === 0 ? 'No Nutrition Plans Yet' : 'No Plans Match Your Search'}
              </h3>
              <p className="text-maxfit-medium-grey text-sm sm:text-base mb-4 sm:mb-6">
                {programs.length === 0
                  ? 'Start a conversation with our AI assistant to generate your first personalized nutrition plan.'
                  : "Try adjusting your search terms or filters to find the nutrition plans you're looking for."}
              </p>
              {programs.length === 0 && (
                // <Link href="/dashboard/maxi-ai">
                <button onClick={() => router.push("/dashboard/maxi-ai")} className="btn-neon px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base">Generate Nutrition Plan</button>
                // </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {programs.map((program, i) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 overflow-hidden"
                >
                  {/* Program header row */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => toggleProgram(program.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 " />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold text-sm">
                            Plan {programs.length - i}
                          </span>
                          <span className="text-gray-500 text-xs">{formatDate(program.createdAt)}</span>
                        </div>
                        <div className=" text-xs font-semibold mt-0.5">
                          {program.dietPlan?.calorieTarget || 'Nutrition Plan'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* PDF download – locked for free */}
                      {isFree ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/dashboard/pricing-plan')
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-700 text-gray-500  hover:border-gray-500 hover:text-gray-300 transition-colors"
                        >
                          <Lock className="w-3 h-3" />
                          <span className="hidden sm:inline">Download PDF</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPDF(program)
                          }}
                          disabled={generatingPDF === program.id}
                          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium bg-[#B8E30B] text-black hover:from-lime-500 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                        // style={{ background: 'linear-gradient(135deg, #39ff14, #00e5a0)' }}
                        >
                          {generatingPDF === program.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {generatingPDF === program.id ? 'Generating...' : 'Download PDF'}
                          </span>
                        </button>
                      )}

                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-800">
                        {openProgram === program.id ? (
                          <ChevronDown className="w-4 h-4 text-lime-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded plan details */}
                  <AnimatePresence>
                    {openProgram === program.id && program.dietPlan && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                        className="border-t border-gray-800"
                      >
                        <div className="p-5 space-y-6">

                          {/* Macro strip */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Calories', value: program.dietPlan.calorieTarget, color: '#39ff14', icon: Zap },
                              { label: 'Protein', value: program.dietPlan.macroBreakdown.protein, color: '#60a5fa', icon: null },
                              { label: 'Carbs', value: program.dietPlan.macroBreakdown.carbohydrates, color: '#34d399', icon: null },
                              { label: 'Fats', value: program.dietPlan.macroBreakdown.fats, color: '#fbbf24', icon: null },
                            ].map(({ label, value, color, icon: Icon2 }) => (
                              <div
                                key={label}
                                className="rounded-xl p-3 text-center border"
                                style={{ background: `${color}0d`, borderColor: `${color}30` }}
                              >
                                <div className="text-white font-bold text-sm">{label}: {value}</div>
                                {/* <div className="text-gray-500 text-[10px] uppercase tracking-wide">{label}</div> */}
                              </div>
                            ))}
                          </div>

                          {/* Overview */}
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {program.dietPlan.overview}
                          </p>

                          {/* ── Meal Cards Grid ── */}
                          <div>
                            <h3 className="text-white font-bold text-base mb-3">Daily Meals</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {MEAL_CONFIG.map((config) => {
                                const isLocked = isFree && !config.free
                                return (
                                  <MealCard
                                    key={config.key}
                                    config={config}
                                    program={program}
                                    isLocked={isLocked}
                                  />
                                )
                              })}
                            </div>
                          </div>

                          {/* Hydration + Supplements + Tips – locked for free */}
                          {isFree ? (
                            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-5 flex flex-col items-center text-center">
                              {/* <Lock className="w-6 h-6  mb-2" /> */}
                              <p className="text-white font-semibold text-sm mb-1">
                                Supplements & Tips Locked
                              </p>
                              <p className="text-gray-500 text-xs mb-4">
                                Premium members get full access to supplement
                                recommendations and personalised nutrition tips.
                              </p>
                              <button
                                onClick={() => router.push('/dashboard/pricing-plan')}
                                className="flex items-center cursor-pointer gap-2 px-5 py-2 rounded-xl text-sm font-bold text-black hover:scale-105 transition-transform bg-[#B7E20B]"
                              >
                                <CircleArrowUp className="w-4 h-4" />
                                Unlock Now
                              </button>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-5">
                              {/* Hydration */}
                              {/* <div className="rounded-xl  bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 p-4">
                                <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                                  <Droplets className="w-4 h-4 text-cyan-400" />
                                  Hydration Goal
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                  {program.dietPlan.hydrationGoal}
                                </p>
                              </div> */}

                              {/* Supplements */}
                              <div className="rounded-xl  bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 p-4">
                                <h4 className="text-white font-bold text-sm mb-2">Supplements</h4>
                                <ul className="space-y-1">
                                  {program.dietPlan.supplementRecommendations.slice(0, 4).map(
                                    (s, idx) => (
                                      <li key={idx} className="text-gray-400 text-xs flex gap-2">
                                        <span className="text-lime-400 flex-shrink-0">•</span>
                                        {s}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              </div>

                              {/* Tips */}
                              <div className="rounded-xl  bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30   p-4">
                                <h4 className="text-white font-bold text-sm mb-2">Nutrition Tips</h4>
                                <ul className="space-y-1">
                                  {program.dietPlan.nutritionTips.slice(0, 3).map((tip, idx) => (
                                    <li key={idx} className="text-gray-400 text-xs flex gap-2">
                                      <span className="text-lime-400 flex-shrink-0">•</span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequirePlanAccess>
  )
}