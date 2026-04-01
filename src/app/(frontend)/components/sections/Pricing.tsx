'use client'

import { Check, Zap, Crown, Infinity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { PaymentProviderModal } from '@/app/(frontend)/components/ui/payment-provider-modal'
import { useAuth } from '../../context/AuthProvider'
import { useRouter } from 'next/navigation'

type AppPlan = 'free' | 'starter' | 'proFit' | 'maxFlex'

const Pricing = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<AppPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    key: Exclude<AppPlan, 'free'>
    name: string
  } | null>(null)

  // Fetch the logged-in user's current plan
  useEffect(() => {
    if (!user) return // user not logged in

    let mounted = true
      ; (async () => {
        try {
          const token = localStorage.getItem('user-token')
          const res = await fetch('/api/users/me', {
            credentials: 'include',
            headers: {
              ...(token && { Authorization: `JWT ${token}` }),
            },
          })
          if (!res.ok) return
          const data = await res.json().catch(() => null)
          const plan = data?.user?.plan as AppPlan | undefined
          if (mounted && plan) setCurrentPlan(plan)
        } catch (e) {
          console.error('Error fetching user plan:', e)
        }
      })()
    return () => {
      mounted = false
    }
  }, [user])

  // Handle plan selection
  function handlePlanSelection(plan: Exclude<AppPlan, 'free'>, planName: string) {
    if (!user) {
      router.push('/login') // redirect to login if not authenticated
      return
    }

    setSelectedPlan({ key: plan, name: planName })
    setShowPaymentModal(true)
  }

  // Stripe checkout
  async function startStripeCheckout(plan: Exclude<AppPlan, 'free'>) {
    try {
      setLoadingPlan(plan)
      const token = localStorage.getItem('user-token')
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Checkout init failed')
      window.location.href = data.url
    } catch (e) {
      console.error(e)
      alert('Unable to start checkout. Please try again.')
    } finally {
      setLoadingPlan(null)
      setShowPaymentModal(false)
    }
  }

  // PayPal checkout
  async function startPayPalCheckout(plan: Exclude<AppPlan, 'free'>) {
    try {
      setLoadingPlan(plan)
      const token = localStorage.getItem('user-token')
      const res = await fetch('/api/paypal/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ plan, isAnnual }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'PayPal subscription creation failed')
      window.location.href = data.approvalUrl
    } catch (e) {
      console.error(e)
      alert(`Unable to start PayPal checkout: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoadingPlan(null)
      setShowPaymentModal(false)
    }
  }

  const plans = [
    {
      key: 'free' as AppPlan,
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      icon: Zap,
      description: 'Perfect for trying out MAXFITAI',
      badge: '',
      features: [
        '1 session allowed',
        'Basic platform access',
        'Upgrade prompts after usage',
        'Community support',
        'Technical support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    // {
    //   key: 'starter' as AppPlan,
    //   name: 'Starter',
    //   price: { monthly: 9.99, annual: 99.99 },
    //   icon: Zap,
    //   description: 'Great for fitness beginners',
    //   badge: '',
    //   features: [
    //     '3 sessions allowed',
    //     'Workout summaries',
    //     'Meal summaries',
    //     'Basic plan generation',
    //     'Email support',
    //     '1x Week Coach Follow Up',
    //   ],
    //   cta: 'Choose Starter',
    //   popular: false,
    // },
    {
      key: 'proFit' as AppPlan,
      name: 'Pro Fit',
      price: { monthly: 21.99, annual: 219.99 },
      icon: Crown,
      description: 'Most popular for serious fitness enthusiasts',
      badge: 'Most Popular',
      features: [
        '4 sessions allowed',
        'Advanced workout plan generator',
        'AI Remembers previous plans and discussions',
        "History Tracking",
        "2x week Maxfit Ai coach follow up",
        "Access To Maxfit Ai Kitchen"
      ],
      cta: 'Choose Pro Fit',
      popular: true,
    },
    {
      key: 'maxFlex' as AppPlan,
      name: 'Max Flex',
      price: { monthly: 49.99, annual: 499.99 },
      icon: Infinity,
      description: 'Ultimate package for fitness professionals',
      badge: '',
      features: [
        '6 sessions allowed',
        'All Pro Fit features',
        'Maxfit Ai kitchen Calorie intake counting',
        'Advanced DashBoard Analytics priority support',
        '5x per week coach follow up',
        '1 free online session with coach'
      ],
      cta: 'Choose Max Flex',
      popular: false,
    },
  ]

  const formatPrice = (price: number) => (price === 0 ? 'Free' : `$${price.toFixed(2)}`)
  const getAnnualSavings = (plan: (typeof plans)[0]) =>
    plan.price.monthly === 0 || plan.price.annual === 0
      ? null
      : Math.max(plan.price.monthly * 12 - plan.price.annual, 0)

  // Dodo Payments checkout
  async function startDodoCheckout(plan: Exclude<AppPlan, 'free'>) {
    try {
      setLoadingPlan(plan)
      const token = localStorage.getItem('user-token')
      const res = await fetch('/api/dodo/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ plan, isAnnual }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Dodo checkout init failed')
      window.location.href = data.url
    } catch (e) {
      console.error(e)
      alert('Unable to start Dodo checkout. Please try again.')
    } finally {
      setLoadingPlan(null)
      setShowPaymentModal(false)
    }
  }

  return (
    <section id="pricing" className="py-8 sm:py-10 bg-maxfit-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6">
            Choose Your <span className="text-[#B9E810] text-glow ">Fitness Plan</span>
          </h2>
          <p className="text-sm sm:text-xl text-gray-300 max-w-3xl mx-auto mb-4 sm:mb-8">
            Start free and upgrade anytime. All plans include our core AI features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex-col sm:grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 px-7 sm:px-0">
          {plans.map((plan) => {
            const savings = getAnnualSavings(plan)
            const currentPrice = isAnnual ? plan.price.annual : plan.price.monthly
            const IconComponent = plan.icon
            const isCurrentPlan = currentPlan === plan.key
            const isLoading = loadingPlan === plan.key

            // Determine card styling based on plan status
            let cardClasses =
              'relative bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 hover-lift border-0 h-full flex flex-col '

            if (isCurrentPlan) {
              // User's current plan gets green glow
              cardClasses +=
                'ring-4 ring-[#CFFF0F] shadow-[0_0_20px_#CFFF0F,0_0_40px_#CFFF0F] scale-105'
            } else if (plan.key === 'free' && !currentPlan) {
              // Default to free plan if no plan selected
              cardClasses += 'ring-2 ring-[#CFFF0F] shadow-md scale-105'
            } else if (plan.popular) {
              // Popular badge styling
              cardClasses += ''
            }

            return (
              <Card key={plan.key} className={cardClasses}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-white text-black px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-bold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-2 sm:pb-4 pt-3 sm:pt-6 px-2 sm:px-6">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-maxfit-neon-green/20 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 sm:w-8 sm:h-8 text-maxfit-neon-green" />
                  </div>

                  <h3 className="text-base sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-[10px] sm:text-sm hidden sm:block">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col px-2 sm:px-6">
                  <div className="text-center mb-3 sm:mb-6">
                    <div className="text-xl sm:text-4xl font-bold text-white mb-1">
                      {formatPrice(currentPrice)}
                      {currentPrice > 0 && (
                        <span className="text-[10px] sm:text-lg font-normal text-gray-400">
                          /{isAnnual ? 'yr' : 'mo'}
                        </span>
                      )}
                    </div>
                    {isAnnual && savings && (
                      <p className="text-maxfit-neon-green text-[10px] sm:text-sm">
                        Save ${savings.toFixed(2)} per year
                      </p>
                    )}
                  </div>

                  {/* Features list with fixed height */}
                  <ul className="space-y-1 sm:space-y-3 mb-3 sm:mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <Check className="w-3 h-3 sm:w-5 sm:h-5 text-maxfit-neon-green mr-1 sm:mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button at bottom */}
                  <div className="mt-auto">
                    <Button
                      onClick={() => {
                        if (plan.key === 'free' || isCurrentPlan) return
                        handlePlanSelection(plan.key as Exclude<AppPlan, 'free'>, plan.name)
                      }}
                      disabled={isCurrentPlan || isLoading}
                      className={`w-full h-8 sm:h-12 text-[10px] cursor-pointer sm:text-base font-semibold transition-all 
            ${isCurrentPlan
                          ? 'bg-[#CFFF0F]  cursor-not-allowed text-gray-700 border border-[#CFFF0F]'
                          : 'bg-[#CFFF0F] hover:bg-maxfit-medium-grey text-black border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/50'
                        }
          `}
                    >
                      {isLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.cta}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <PaymentProviderModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedPlan(null)
          setLoadingPlan(null)
        }}
        plan={selectedPlan?.key || 'starter'}
        planName={selectedPlan?.name || ''}
        onStripeSelect={() => selectedPlan && startStripeCheckout(selectedPlan.key)}
        onPayPalSelect={() => selectedPlan && startPayPalCheckout(selectedPlan.key)}
        isLoading={!!loadingPlan}
        onDodoSelect={() => {
          if (selectedPlan) {
            startDodoCheckout(selectedPlan.key)
          }
        }}
      />
    </section>
  )
}

export default Pricing
