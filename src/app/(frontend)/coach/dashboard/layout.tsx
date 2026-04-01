'use client'

import { ReactNode } from 'react'
import { CoachSidebar } from './CoachSidebar'
import { CoachAuthProvider, useCoachAuth } from '@/app/(frontend)/context/CoachAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import Logo from '@/app/(frontend)/assets/maxfit.svg'

function CoachDashboardContent({ children }: { children: ReactNode }) {
  const { coach, loading } = useCoachAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !coach) {
      router.push('/coach')
    }
  }, [coach, loading, router])

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

  if (!coach) {
    return null
  }

  return (
    <div className="flex h-screen w-full bg-hero-gradient">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <CoachSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">{children}</main>
    </div>
  )
}

export default function CoachDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CoachAuthProvider>
      <CoachDashboardContent>{children}</CoachDashboardContent>
    </CoachAuthProvider>
  )
}
