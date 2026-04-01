'use client'

import { Check, Zap, Crown, Infinity, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { PaymentProviderModal } from '@/app/(frontend)/components/ui/payment-provider-modal'
import { useAuth } from '../../context/AuthProvider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog'

type AppPlan = 'free' | 'starter' | 'proFit' | 'maxFlex'

const Pricing = () => {
  const { user, setUser } = useAuth()
  const [isAnnual, setIsAnnual] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<AppPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [subscriptionCanceled, setSubscriptionCanceled] = useState(false)
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null)
  console.log('Hello from User', user)

  // Payment provider modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    key: Exclude<AppPlan, 'free'>
    name: string
  } | null>(null)

  // Fetch the logged-in user's current plan from Payload
  useEffect(() => {
    let mounted = true
    ;(async () => {
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
        const canceled = data?.user?.subscriptionCanceled as boolean | undefined
        const endDate = data?.user?.subscriptionEndDate as string | undefined
        if (mounted && plan) setCurrentPlan(plan)
        if (mounted && canceled !== undefined) setSubscriptionCanceled(canceled)
        if (mounted && endDate) setSubscriptionEndDate(endDate)
      } catch {
        // ignore; not logged in or endpoint not available
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Handle plan selection - open payment provider modal
  function handlePlanSelection(plan: Exclude<AppPlan, 'free'>, planName: string) {
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

      // Create PayPal subscription using new API
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

      console.log('PayPal subscription created:', data)

      // Redirect to PayPal for approval
      window.location.href = data.approvalUrl
    } catch (e) {
      console.error('PayPal checkout error:', e)
      alert(`Unable to start PayPal checkout: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoadingPlan(null)
      setShowPaymentModal(false)
    }
  }

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

  // Cancel subscription
  async function handleCancelSubscription() {
    try {
      setCanceling(true)
      const token = localStorage.getItem('user-token')
      const res = await fetch('/api/dodo/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to cancel subscription')
      setSubscriptionCanceled(true)
      if (data.subscriptionEndDate) {
        setSubscriptionEndDate(data.subscriptionEndDate)
      }
      alert('Subscription canceled successfully! You will receive an email with details.')
      setShowCancelModal(false)
    } catch (e) {
      console.error(e)
      alert('Unable to cancel subscription. Please try again.')
    } finally {
      setCanceling(false)
    }
  }

  const plans = [
    {
      plan: 'free',
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
    //   plan: 'starter',
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
      plan: 'proFit',
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
        'History Tracking',
        '2x week Maxfit Ai coach follow up',
        'Access To Maxfit Ai Kitchen',
      ],
      cta: 'Choose Pro Fit',
      popular: true,
    },
    {
      plan: 'maxFlex',
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
        '1 free online session with coach',
      ],
      cta: 'Choose Max Flex',
      popular: false,
    },
  ]

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  const getAnnualSavings = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0 || plan.price.annual === 0) return null
    const annualSavings = plan.price.monthly * 12 - plan.price.annual
    return annualSavings > 0 ? annualSavings : null
  }

  return (
    <section id="pricing" className="py-4 sm:py-10 bg-black min-h-screen">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-16 text-left items-start">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6">
            Choose Your <span className="text-maxfit-neon-green">Fitness Plan</span>
          </h2>
          <p className="text-xs sm:text-xl text-gray-300  max-w-3xl mb-4 sm:mb-8">
            Start free and upgrade anytime. All plans include our core AI features.
          </p>
          {/* Billing Toggle */}
          {/* <div className="inline-flex items-center bg-[#232323] rounded-full p-2 mb-8 border border-[#B6E10B]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 
                ${!isAnnual
                  ? 'bg-[#B6E10B] text-gray-900 shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white'
                }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${isAnnual
                  ? 'bg-[#B6E10B] text-gray-900 shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white'
                }`}
            >
              Annual
              <span className="text-[10px] bg-orange-500 text-white px-2 py-[3px] rounded-full">
                Save 17%
              </span>
            </button>
          </div> */}
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
              'relative bg-gradient-to-br from-gray-900/20 to-gray-800/60 border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-maxfit-neon-green/20 hover-lift border-0 h-full flex flex-col '

            if (isCurrentPlan) {
              // User's current plan gets green glow
              cardClasses +=
                'ring-4 ring-[#B6E10B] shadow-[0_0_20px_#B6E10B,0_0_40px_#B6E10B] scale-105'
            } else if (plan.key === 'free' && !currentPlan) {
              // Default to free plan if no plan selected
              cardClasses += 'ring-2 ring-green-400/50 shadow-md scale-105'
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
                  <div className="mt-auto space-y-2">
                    <Button
                      onClick={() => {
                        if (plan.key === 'free' || isCurrentPlan) return
                        handlePlanSelection(plan.key as Exclude<AppPlan, 'free'>, plan.name)
                      }}
                      disabled={isCurrentPlan || isLoading}
                      className={`w-full h-8 sm:h-12 text-[10px] sm:text-base font-semibold transition-all cursor-pointer 
            ${
              isCurrentPlan
                ? 'bg-[#CFFF0F]  cursor-not-allowed text-gray-700 border border-[#CFFF0F]'
                : 'bg-[#CFFF0F] hover:bg-maxfit-medium-grey text-black border border-maxfit-neon-green/30 hover:border-maxfit-neon-green/50'
            }
          `}
                    >
                      {isLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.cta}
                    </Button>

                    {isCurrentPlan && plan.key !== 'free' && !subscriptionCanceled && (
                      <Button
                        onClick={() => setShowCancelModal(true)}
                        variant="outline"
                        className="w-full h-8 sm:h-10 text-[10px] sm:text-sm border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    )}

                    {isCurrentPlan && subscriptionCanceled && subscriptionEndDate && (
                      <p className="text-xs text-yellow-500 text-center mt-2">
                        Subscription ends on {new Date(subscriptionEndDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Provider Modal */}
      <PaymentProviderModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setSelectedPlan(null)
          setLoadingPlan(null)
        }}
        plan={selectedPlan?.key || 'starter'}
        planName={selectedPlan?.name || ''}
        onStripeSelect={() => {
          if (selectedPlan) {
            startStripeCheckout(selectedPlan.key)
          }
        }}
        onPayPalSelect={() => {
          if (selectedPlan) {
            startPayPalCheckout(selectedPlan.key)
          }
        }}
        onDodoSelect={() => {
          if (selectedPlan) {
            startDodoCheckout(selectedPlan.key)
          }
        }}
        isLoading={!!loadingPlan}
      />

      {/* Cancel Subscription Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-300">
              Your subscription will remain active until the end of your billing period. After that,
              you will be moved to the free plan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {canceling ? 'Canceling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default Pricing
