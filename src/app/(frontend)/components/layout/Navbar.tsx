'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Sparkles,
  UtensilsCrossed,
  Dumbbell,
  CreditCard,
  HistoryIcon,
  SettingsIcon,
  ShoppingCart,
  ShoppingCartIcon,
} from 'lucide-react'
import { Button } from '@/app/(frontend)/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/app/(frontend)/assets/maxfit.svg'
import { useAuth } from '@/app/(frontend)/context/AuthProvider'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout, loading } = useAuth()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  // Prevent scroll when loading
  useEffect(() => {
    const prev = document.body.style.overflow
    if (loading) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [loading])

  // ✅ Dashboard tabs (shown when logged in)
  const tabs = useMemo(
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
      {
        label: 'Nutrition Plan',
        href: '/dashboard/nutrition-plan',
        plans: ['maxFlex'],
        icon: <UtensilsCrossed className="w-5 h-5" />,
      },
      {
        label: 'Workout Plan',
        href: '/dashboard/workout-plan',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <Dumbbell className="w-5 h-5" />,
      },
      {
        label: 'Pricing Plan',
        href: '/dashboard/pricing-plan',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <CreditCard className="w-5 h-5" />,
      },
      // {
      //   label: 'Shop',
      //   href: '/dashboard/shop',
      //   plans: ['free', 'starter', 'proFit', 'maxFlex'],
      //   icon: <CreditCard className="w-5 h-5" />,
      // },
      {
        label: 'Maxfit Kitchen',
        href: '/dashboard/maxfit-kitchen',
        plans: ['free', 'starter', 'proFit', 'maxFlex'],
        icon: <CreditCard className="w-5 h-5" />,
      },
      {
        label: 'Call History',
        href: '/dashboard/call-history',
        plans: ['starter', 'proFit', 'maxFlex'],
        icon: <HistoryIcon className="w-5 h-5" />,
      },
      // {
      //   label: 'Settings',
      //   href: '/dashboard/settings',
      //   plans: ['free', 'starter', 'proFit', 'maxFlex'],
      //   icon: <SettingsIcon className="w-5 h-5" />,
      // },
    ],
    []
  )

  // ✅ Full-page loader while auth loads
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[10000] bg-hero-gradient flex flex-col items-center justify-center"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="relative">
          <Image
            src={Logo}
            alt="MAXFIT AI"
            width={88}
            height={88}
            className="object-contain drop-shadow-lg"
            priority
          />
          <div className="absolute inset-0 rounded-full border-2 border-maxfit-neon-green/30 border-t-maxfit-neon-green animate-spin" />
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-maxfit-black/90 border-b border-maxfit-neon-green/20">
      <div className="px-4 sm:px-6 lg:px-24">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="relative w-24 sm:w-28 md:w-44 h-10 sm:h-12">
            <Link href="/">
              <Image src={Logo} alt="MAXFITAI Logo" fill className="object-contain" priority />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['home', 'features', 'how it works', 'testimonials', 'pricing'].map((item) => (
                <a
                  key={item}
                  href={`/#${item.replace(/ /g, '-')}`}
                  className="relative pb-1 text-white hover:text-maxfit-neon-green transition-colors duration-300 group"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#CFFF0F] transition-all duration-300 group-hover:w-full block" />
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-maxfit-neon-green hover:bg-maxfit-neon-green/10 cursor-pointer"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-neon cursor-pointer rounded-xl hover:scale-105 hover:brightness-110 transform  transition-all">Register</Button>
                </Link>
              </>
            ) : (
              // <div className="relative flex items-center space-x-3">
              //   {/* 🛒 Shopping Cart Link */}
              //   <Link
              //     target='_blank'
              //     href="https://shop.maxfitai.com"
              //     className="text-white hover:text-maxfit-neon-green transition-colors duration-300"
              //   >
              //     <ShoppingCartIcon className="w-6 h-6" />
              //   </Link>

              //   {/* 👤 User Dropdown */}
              //   <button
              //     onClick={toggleDropdown}
              //     className="flex items-center bg-black text-white py-2 cursor-pointer rounded-full hover:bg-maxfit-neon-green/20 transition-colors"
              //   >
              //     <span>
              //       {user.firstName} {user.lastName}
              //     </span>
              //     <ChevronDown size={18} />
              //   </button>

              //   {/* Dropdown Menu */}
              //   {dropdownOpen && (
              //     <div className="absolute  top-10 mt-2 w-56 bg-black  rounded-md shadow-lg">
              //       <div className="p-4 text-sm text-white border-b border-maxfit-neon-green/10">
              //         <div className="font-medium overflow-x-hidden">{user.email}</div>
              //         <div className="text-xs capitalize text-maxfit-neon-green">{user.plan}</div>
              //       </div>
              //       <div className="py-2">
              //         <Link
              //           href="/dashboard"
              //           className="block px-4 py-2 text-sm text-white hover:bg-maxfit-neon-green/10"
              //         >
              //           Dashboard
              //         </Link>
              //         <button
              //           onClick={logout}
              //           className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 cursor-pointer"
              //         >
              //           Logout
              //         </button>
              //       </div>
              //     </div>
              //   )}
              // </div>
              <Link href="/dashboard">
                <Button className="btn-neon cursor-pointer hover:scale-105 hover:brightness-110 transform  transition-all rounded-xl">Go to Dashboard</Button>
              </Link>

            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-white hover:text-maxfit-neon-green"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden" id="mobile-nav">
            <div className="items-center justify-center text-center px-2 pt-2 pb-3 space-y-1 bg-maxfit-dark-grey/95 backdrop-blur-md rounded-b-lg border border-maxfit-neon-green/20">
              {['home', 'features', 'how it works', 'pricing', 'testimonials'].map((item) => (
                <a
                  key={item}
                  href={`/#${item.replace(/ /g, '-')}`}
                  className="relative pb-1 text-white hover:text-maxfit-neon-green transition-colors duration-300 group"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#CFFF0F] transition-all duration-300 group-hover:w-full block" /><br />
                </a>

              ))}

              <div className="items-center justify-center text-center pt-4 pb-2 w-full space-y-2 gap-2 flex ">
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button className="w-full">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full btn-neon">Register</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* <div className="text-white text-sm px-3 py-1 border-b border-maxfit-neon-green/20">
                      <div>
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-maxfit-neon-green">{user.email}</div>
                    </div> */}
                    <Link href="/dashboard">
                      <Button className="w-full btn-neon">Go to Dashboard</Button>
                    </Link>
                    <Button variant="ghost" onClick={logout}>
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
