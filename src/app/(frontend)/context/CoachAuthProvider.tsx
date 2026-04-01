'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Coach = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  bio?: string
  specializations?: { specialization: string }[]
  yearsOfExperience?: number
  certifications?: { certification: string }[]
  profileImage?: string
  isActive: boolean
  calendlyUrl?: string
  pricePerSession?: number
}

type CoachAuthContextType = {
  coach: Coach | null
  loading: boolean
  setCoach: React.Dispatch<React.SetStateAction<Coach | null>>
  logout: () => void
}

const CoachAuthContext = createContext<CoachAuthContextType>({
  coach: null,
  loading: true,
  setCoach: () => {},
  logout: () => {},
})

export const CoachAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('coach-token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/coaches/me', {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.coach && data.coach.isActive) {
          setCoach(data.coach)
        } else {
          localStorage.removeItem('coach-token')
          setCoach(null)
        }
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('coach-token')
        setCoach(null)
        setLoading(false)
      })
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/coaches/logout', { method: 'POST' })
    } catch (err) {
      console.error('Coach logout failed', err)
    } finally {
      localStorage.removeItem('coach-token')
      setCoach(null)
      window.location.href = '/coach'
    }
  }

  return (
    <CoachAuthContext.Provider value={{ coach, setCoach, loading, logout }}>
      {children}
    </CoachAuthContext.Provider>
  )
}

export const useCoachAuth = () => useContext(CoachAuthContext)
