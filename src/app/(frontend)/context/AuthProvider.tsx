'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type User = {
  email: string
  firstName: string
  lastName: string
  gender: string
  plan: 'free' | 'starter' | 'proFit' | 'maxFlex'
  aiCallsUsed: number
  language: string
  maxAiCalls: number
  minutesUsed: number
  minutesAllowed: number
  IsPasswordUpdated: string
  profileImg?: string
  unlockedCoachIds?: string[]
}

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>> // ✅ add this
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {}, // ✅ default no-op
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('user-token')
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/users/me', {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data?.user || null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  const logout = async () => {
    try {
      // Call custom logout endpoint (doesn't clear cookies, just for consistency)
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      // Clear localStorage - this is the main auth mechanism for frontend
      localStorage.removeItem('user-token')
      setUser(null)
      window.location.href = '/'
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
