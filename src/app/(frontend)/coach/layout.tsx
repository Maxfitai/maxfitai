'use client'

import { CoachAuthProvider } from '@/app/(frontend)/context/CoachAuthProvider'

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <CoachAuthProvider>{children}</CoachAuthProvider>
}
