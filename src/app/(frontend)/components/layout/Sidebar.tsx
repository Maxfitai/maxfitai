'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'
import Image from 'next/image'
import MaxFitLogo from '@/app/(frontend)/assets/maxfit.svg'
import {
  Home,
  Sparkles,
  History as HistoryIcon,
  Settings as SettingsIcon,
  LogOut,
  UtensilsCrossed,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  Utensils,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCall } from '@/app/(frontend)/context/CallProvider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/(frontend)/components/ui/dialog'
import { Button } from '@/app/(frontend)/components/ui/button'

type Plan = 'free' | 'starter' | 'proFit' | 'maxFlex'
type TabEntry = {
  label: string
  href: string
  plans: Plan[]
  icon: React.ReactNode
}

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const { callActive } = useCall() // Get call state
  const plan = user?.plan as Plan | undefined

  const tabs: TabEntry[] = useMemo(
    () => [
      {
        label: 'Overview',
        href: '/dashboard',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Home className="w-5 h-5" />,
      },
      // {
      //   label: 'Max AI',
      //   href: '/dashboard/ai-assistant',
      //   plans: ['free', 'starter', 'proFit', 'maxFlex'],
      //   icon: <Sparkles className="w-5 h-5" />,
      // },
      {
        label: 'Maxi AI',
        href: '/dashboard/maxi-ai',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Sparkles className="w-5 h-5" />,
      },
      // {
      //   label: 'Plan Summaries',
      //   href: '/dashboard/plan-summary',
      //   plans: ['free', 'starter', 'proFit', 'maxFlex'],
      //   icon: <ClipboardList className="w-5 h-5" />,
      // },
      {
        label: 'Pricing Plan',
        href: '/dashboard/pricing-plan',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <CreditCard className="w-5 h-5" />,
      },
      {
        label: 'Fitness Coaches',
        href: '/dashboard/fitness-coaches',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Dumbbell className="w-5 h-5" />,
      },
      {
        label: 'Shop',
        href: 'https://shop.maxfitai.com',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <ShoppingBag className="w-5 h-5" />,
      },
      {
        label: 'Maxfit Kitchen',
        href: '/dashboard/maxfit-kitchen',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Utensils className="w-5 h-5" />,
      },
      {
        label: 'Nutrition Plan',
        href: '/dashboard/nutrition-plan',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <UtensilsCrossed className="w-5 h-5" />,
      },
      {
        label: 'Workout Plan',
        href: '/dashboard/workout-plan',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Dumbbell className="w-5 h-5" />,
      },

      // {
      //   label: 'Custom Plans',
      //   href: '/dashboard/custom-plans',
      //   plans: ['proFit', 'maxFlex'],
      //   icon: <ListChecks className="w-5 h-5" />,
      // },
      {
        label: 'AI Call History',
        href: '/dashboard/call-history',
        plans: ['starter', 'proFit', 'maxFlex'],
        icon: <HistoryIcon className="w-5 h-5" />,
      },
      // {
      //   label: 'Regular Updates',
      //   href: '/dashboard/regular-updates',
      //   plans: ['maxFlex'],
      //   icon: <RefreshCw className="w-5 h-5" />,
      // },

      {
        label: 'Feedback',
        href: '/dashboard/feedback',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Sparkles className="w-5 h-5" />,
      },

      {
        label: 'Settings',
        href: '/dashboard/settings',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <SettingsIcon className="w-5 h-5" />,
      },
    ],
    [],
  )

  if (!user) {
    return (
      <aside className="w-72 h-screen bg-maxfit-black border-r border-maxfit-darker-grey/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-xs text-maxfit-medium-grey">Loading…</div>
        </div>
      </aside>
    )
  }

  const filteredTabs = tabs.filter((tab) => plan && tab.plans.includes(plan))

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-700 text-gray-100'
      case 'starter':
        return 'bg-gray-700 text-gray-100'
      case 'proFit':
        return 'bg-gray-700 text-gray-100'
      case 'maxFlex':
        return 'bg-gray-700 text-gray-100'
      default:
        return 'bg-gray-700 text-gray-100'
    }
  }

  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = async () => {
    await logout()
    setShowLogoutDialog(false)
    router.push('/')
  }

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    if (callActive && href !== '/dashboard/ai-assistant') {
      e.preventDefault()
      alert('Please end the call first!!')
      return
    }
    // Allow navigation if call is not active or staying on ai-assistant page
  }

  return (
    <aside className="w-72 h-full bg-maxfit-black border-r border-maxfit-darker-grey/30 flex flex-col">
      {/* Header */}
      <div
        className="px-5 py-5 border-b border-maxfit-darker-grey/30"
        onClick={() => router.push('/')}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <Image
              src={MaxFitLogo}
              alt="MaxFit Logo"
              width={56}
              height={56}
              className="rounded-xl cursor-pointer"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="text-maxfit-white font-semibold leading-tight">MAXFIT AI</div>
            {plan && (
              <div
                className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getPlanBadgeColor(
                  plan,
                )}`}
                title={`${plan} plan`}
              >
                <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5 opacity-70"></span>
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredTabs.map((tab) => {
            const isActive =
              tab.href === '/dashboard' ? pathname === tab.href : pathname?.startsWith(tab.href)
            const isExternal = tab.href.startsWith('http')
            return isExternal ? (
              <a
                key={tab.href}
                href={tab.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleNavigation(tab.href, e)}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover-lift ${isActive
                  ? 'bg-accent-gradient text-maxfit-black font-semibold shadow-lg text-black'
                  : 'text-maxfit-medium-grey hover:text-maxfit-white hover:bg-maxfit-darker-grey/60'
                  }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-md ${isActive ? 'text-maxfit-black' : 'text-maxfit-neon-green/80'
                    }`}
                >
                  {tab.icon}
                </span>
                <span className="font-medium tracking-wide truncate">{tab.label}</span>

                {isActive ? (
                  <div className="ml-auto w-1.5 h-1.5 bg-maxfit-black rounded-full"></div>
                ) : (
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-4 bg-maxfit-neon-green rounded-full"></div>
                  </div>
                )}
              </a>
            ) : (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={(e: any) => handleNavigation(tab.href, e)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover-lift ${isActive
                  ? 'bg-accent-gradient text-maxfit-black font-semibold shadow-lg text-black'
                  : 'text-maxfit-medium-grey hover:text-maxfit-white hover:bg-maxfit-darker-grey/60'
                  }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-md ${isActive ? 'text-maxfit-black' : 'text-maxfit-neon-green/80'
                    }`}
                >
                  {tab.icon}
                </span>
                <span className="font-medium tracking-wide truncate">{tab.label}</span>

                {isActive ? (
                  <div className="ml-auto w-1.5 h-1.5 bg-maxfit-black rounded-full"></div>
                ) : (
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-4 bg-maxfit-neon-green rounded-full"></div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="px-3 pt-4 border-t border-maxfit-darker-grey/30">
        <div className=" p-4 rounded-xl">
          <div className="flex items-center gap-3">
            {user?.profileImg ? (
              <Image
                src={user.profileImg}
                alt={user.firstName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-maxfit-neon-green"
              />
            ) : (
              <User className="w-5 h-5 text-maxfit-white" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-maxfit-white truncate">
                {user?.firstName || 'User'}
              </p>
              <p className="text-xs text-maxfit-medium-grey truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-3 py-4 ">
        <button
          onClick={handleLogout}
          className="w-full py-3 cursor-pointer rounded-xl bg-[#232323] text-maxfit-white transition flex items-center justify-center gap-2 hover:bg-red-600/80"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-900/20 to-gray-800 border border-maxfit-neon-green/30 text-maxfit-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-maxfit-white">Confirm Logout</DialogTitle>
            <DialogDescription className="text-maxfit-medium-grey">
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-maxfit-darker-grey text-maxfit-medium-grey hover:bg-maxfit-darker-grey hover:text-maxfit-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
