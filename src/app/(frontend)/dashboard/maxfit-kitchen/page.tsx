'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Flame, Drumstick, Droplet, Wheat } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthProvider'

interface Ingredient {
  name: string
  grams?: number
}

interface Macro {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

interface Recipe {
  id: string
  title: string
  category: string
  ingredients: Ingredient[]
  prep_minutes: number
  imgUrl?: string
  macros?: Macro
  steps?: string[]
  tags?: string[]
}

const RECIPE_CATEGORIES = [
  'All',
  'High Protein Meals',
  'Protein Snacks',
  'Breakfast',
  'Smoothies & Drinks',
  'Vegetarian Meals',
  'Gluten-Free Meals',
  'Healthy Desserts',
  'Quick & Easy Meals',
]

// Add global styles for 3D flip effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
        .perspective-1000 {
            perspective: 1000px;
        }
        .transform-style-3d {
            transform-style: preserve-3d;
        }
        .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
            transform: rotateY(180deg);
        }
    `
  if (!document.querySelector('style[data-flip-card]')) {
    style.setAttribute('data-flip-card', 'true')
    document.head.appendChild(style)
  }
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="relative mt-24 sm:mt-32 w-full h-[500px] sm:h-[600px] perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-2xl sm:rounded-3xl text-center shadow-2xl hover:shadow-[#BBE810]/20 transition-all duration-500 border border-white/5 hover:border-[#BBE810]/30 group"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Show Steps Button - Top Right */}
          <button
            onClick={() => setIsFlipped(true)}
            className={`absolute top-4 right-4 z-20 p-2 bg-[#BBE810] hover:bg-[#9CC90F] rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isFlipped ? 'opacity-0 pointer-events-none' : ''}`}
            title="Show Cooking Steps"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </button>

          {/* Image Circle - positioned to overflow outside card */}
          <div className="absolute -top-16 sm:-top-24 left-1/2 -translate-x-1/2 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-[#BBE810] rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <img
                src={recipe.imgUrl || '/placeholder-recipe.png'}
                alt={recipe.title}
                className="relative w-28 sm:w-40 h-28 sm:h-40 object-cover rounded-full border-4 border-[#BBE810] shadow-xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="h-full overflow-y-auto overflow-x-visible pt-18 sm:pt-18 p-4 sm:p-7">
            {/* Category Badge */}
            <div className="mb-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#BBE810]/20 text-[#BBE810] border border-[#BBE810]/30">
                {recipe.category}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 leading-tight group-hover:text-[#BBE810] transition-colors duration-300">
              {recipe.title}
            </h2>

            {/* Ingredients */}
            <div className="text-gray-300 text-sm mb-3 sm:mb-5">
              <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                <span className="w-2 h-2 rounded-full bg-[#BBE810]"></span>
                <span className="text-sm sm:text-lg text-gray-400">
                  {recipe.ingredients.length} Ingredients
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {recipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-white/10 to-white/5 py-2 sm:py-4 px-1 sm:px-2 rounded-lg sm:rounded-xl border border-white/10 hover:border-[#BBE810]/30 transition-all duration-300"
                  >
                    <div className="text-[10px] sm:text-sm uppercase tracking-wider text-white font-semibold mb-0.5 sm:mb-1 leading-tight">
                      {ing.name}
                    </div>
                    {ing.grams !== undefined && (
                      <div className="text-sm sm:text-lg text-[#BBE810] mt-0.5 sm:mt-1">
                        {ing.grams}g
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3 sm:mb-5"></div>

            {/* Macros */}
            {recipe.macros && (
              <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                <div className="bg-gradient-to-br from-[#BBE810]/10 to-transparent p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#BBE810]/20 hover:border-[#BBE810]/40 transition-all duration-300 flex flex-col items-center">
                  <Flame className="text-[#BBE810] w-4 sm:w-6 h-4 sm:h-6 mb-0.5 sm:mb-1" />
                  <div className="font-bold text-sm sm:text-lg text-white">
                    {recipe.macros.kcal}
                  </div>
                  <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    kcal
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/5 to-transparent p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 hover:border-[#BBE810]/20 transition-all duration-300 flex flex-col items-center">
                  <Drumstick className="text-[#BBE810] w-4 sm:w-6 h-4 sm:h-6 mb-0.5 sm:mb-1" />
                  <div className="font-bold text-sm sm:text-lg text-white">
                    {recipe.macros.protein}g
                  </div>
                  <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Protein
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/5 to-transparent p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 hover:border-[#BBE810]/20 transition-all duration-300 flex flex-col items-center">
                  <Wheat className="text-[#BBE810] w-4 sm:w-6 h-4 sm:h-6 mb-0.5 sm:mb-1" />
                  <div className="font-bold text-sm sm:text-lg text-white">
                    {recipe.macros.carbs}g
                  </div>
                  <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Carbs
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white/5 to-transparent p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/10 hover:border-[#BBE810]/20 transition-all duration-300 flex flex-col items-center">
                  <Droplet className="text-[#BBE810] w-4 sm:w-6 h-4 sm:h-6 mb-0.5 sm:mb-1" />
                  <div className="font-bold text-sm sm:text-lg text-white">
                    {recipe.macros.fat}g
                  </div>
                  <div className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    Fat
                  </div>
                </div>
              </div>
            )}

            {/* Prep Time */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-[#BBE810]" />
              <span className="text-gray-300 text-sm font-semibold">{recipe.prep_minutes} min</span>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-3xl text-center shadow-2xl border border-[#BBE810]/50 overflow-hidden z-10"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Back Button - Top Right */}
          <button
            onClick={() => setIsFlipped(false)}
            className="absolute top-4 right-4 z-40 p-2 bg-gray-600 hover:bg-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            title="Back to Details"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Scrollable Content Container */}
          <div className="h-full overflow-y-auto pt-4 p-2">
            {/* Title on back */}
            <h2 className="text-lg sm:text-2xl font-bold text-[#BBE810] mb-6 leading-tight mt-13 sm:mt-20">
              Cooking Steps
            </h2>

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 ? (
              <div className="space-y-4 text-left">
                {recipe.steps.map((stepObj, index) => {
                  const stepText = typeof stepObj === 'string' ? stepObj : (stepObj as any).step
                  return (
                    <div
                      key={index}
                      className="flex gap-4 items-start bg-gradient-to-r from-white/5 to-transparent p-4 rounded-xl border border-white/10 hover:border-[#BBE810]/30 transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#BBE810] to-[#9CC90F] flex items-center justify-center font-bold text-black text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed pt-1">{stepText}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-400">No cooking steps available.</p>
            )}

            {/* Time and Price on back */}
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#BBE810]" />
                <span className="text-gray-300 text-sm font-semibold">
                  {recipe.prep_minutes} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MaxFitKitchen() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recipesLoading, setRecipesLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes?limit=100')
        if (response.ok) {
          const data = await response.json()
          setRecipes(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setRecipesLoading(false)
      }
    }

    if (user) {
      fetchRecipes()
    }
  }, [user])

  const filteredRecipes =
    selectedCategory === 'All'
      ? recipes
      : recipes.filter((recipe) => recipe.category === selectedCategory)

  if (loading || recipesLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BBE810]"></div>
      </div>
    )
  if (!user) return null

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 ">
      {/* Header Section */}
      <div className="text-start justify-start items-start self-start mb-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Maxfit Kitchen Meals
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg">
          Discover a variety of delicious, nutrient-dense meals designed to support your fitness
          journey and help you achieve your health goals.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="w-full mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {RECIPE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-[#BBE810] text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid - 2 columns, whole page scrollable */}
      <div className="w-full pb-4">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No recipes available yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon for delicious fitness meals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            {filteredRecipes.map((recipe, idx) => (
              <RecipeCard key={idx} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
