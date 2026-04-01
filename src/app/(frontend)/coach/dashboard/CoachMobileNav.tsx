'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import Image from 'next/image'
import MaxFitLogo from '@/app/(frontend)/assets/maxfit.svg'
import { Menu, X, Home, User, ClipboardList, Library, LogOut } from 'lucide-react'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/coach/dashboard',
    icon: Home,
  },
  {
    label: 'My Profile',
    href: '/coach/dashboard/profile',
    icon: User,
  },
  {
    label: 'My Plans',
    href: '/coach/dashboard/plans',
    icon: ClipboardList,
  },
  {
    label: 'Workout Library',
    href: '/coach/dashboard/library',
    icon: Library,
  },
]

export default function CoachMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { coach, logout } = useCoachAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  if (!mounted || !coach) {
    return null
  }

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-maxfit-darker-grey/90 backdrop-blur-sm border border-maxfit-medium-grey/20 rounded-lg text-maxfit-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[90vw] bg-maxfit-black/95 backdrop-blur-md border-r border-maxfit-darker-grey/30 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-maxfit-darker-grey/30">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <Image
                    src={MaxFitLogo}
                    alt="MaxFit Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-maxfit-white font-semibold text-sm">MAXFIT AI</div>
                  <div className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700 text-gray-100">
                    Coach Portal
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-maxfit-medium-grey hover:text-maxfit-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname ? pathname === item.href : false

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-accent-gradient text-maxfit-black font-semibold shadow-lg text-black'
                        : 'text-maxfit-medium-grey hover:text-maxfit-white hover:bg-maxfit-darker-grey/60'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center ${
                        isActive ? 'text-black' : 'text-maxfit-neon-green/80'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span
                      className={`font-medium ${
                        isActive ? 'text-black' : 'text-maxfit-medium-grey'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* Coach Info Section */}
            <div className="p-4 border-t border-maxfit-darker-grey/30">
              <div className="glass-card p-4 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-card-gradient rounded-full flex items-center justify-center overflow-hidden">
                    {coach?.profileImage ? (
                      <Image
                        src={coach.profileImage}
                        alt={`${coach?.firstName} ${coach?.lastName}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-maxfit-neon-green font-bold text-sm">
                        {coach?.firstName?.[0]?.toUpperCase() || 'C'}
                        {coach?.lastName?.[0]?.toUpperCase() || ''}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-maxfit-white truncate">
                      {coach?.firstName || 'Coach'} {coach?.lastName || ''}
                    </p>
                    <p className="text-xs text-maxfit-medium-grey truncate">
                      {coach?.email || 'coach@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
