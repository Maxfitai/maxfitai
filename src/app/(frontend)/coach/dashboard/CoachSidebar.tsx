'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import Image from 'next/image'
import MaxFitLogo from '@/app/(frontend)/assets/maxfit.svg'
import { Home, User, ClipboardList, Library, LogOut, MessageCircle, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MenuItem {
  label: string
  href: string
  icon: any
  badge?: number
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/coach/dashboard',
    icon: Home,
  },
  {
    label: 'Enrollments',
    href: '/coach/dashboard/enrollments',
    icon: Users,
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
  {
    label: 'Messages',
    href: '/coach/dashboard/messages',
    icon: MessageCircle,
  },
]

export function CoachSidebar() {
  const { coach, logout } = useCoachAuth()
  const pathname = usePathname()

  if (!coach) {
    return (
      <aside className="w-72 h-screen bg-maxfit-black border-r border-maxfit-darker-grey/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-xs text-maxfit-medium-grey">Loading...</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-72 h-full bg-maxfit-black border-r border-maxfit-darker-grey/30 flex flex-col">
      {/* Header */}
      <div className="px-5 py-5 border-b border-maxfit-darker-grey/30">
        <Link href="/coach/dashboard" className="flex items-center gap-3">
          <div className="shrink-0">
            <Image
              src={MaxFitLogo}
              alt="MaxFit Logo"
              width={56}
              height={56}
              className="rounded-xl"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="text-maxfit-white font-semibold leading-tight">MAXFIT AI</div>
            <div className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700 text-gray-100">
              Coach Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname ? pathname === item.href : false

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 hover-lift ${
                  isActive
                    ? 'bg-accent-gradient text-maxfit-black font-semibold shadow-lg'
                    : 'text-maxfit-medium-grey hover:text-maxfit-white hover:bg-maxfit-darker-grey/60'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-md ${isActive ? 'text-black' : 'text-white'}`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span
                  className={`font-medium tracking-wide truncate ${isActive ? 'text-black' : 'text-white'}`}
                >
                  {item.label}
                </span>

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

      {/* Coach Info */}
      <div className="px-3 pt-4 border-t border-maxfit-darker-grey/30">
        <div className="p-4 rounded-xl">
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
            <div className="min-w-0">
              <p className="text-sm font-medium text-maxfit-white truncate">
                {coach?.firstName || 'Coach'} {coach?.lastName || ''}
              </p>
              <p className="text-xs text-maxfit-medium-grey truncate">
                {coach?.email || 'coach@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-3 py-4">
        <button
          onClick={logout}
          className="w-full py-3 cursor-pointer rounded-xl bg-[#232323] text-maxfit-white transition flex items-center justify-center gap-2 hover:bg-red-600/80"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
