'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CallContextType {
  callActive: boolean
  setCallActive: (active: boolean) => void
}

const CallContext = createContext<CallContextType | undefined>(undefined)

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [callActive, setCallActive] = useState(false)

  return (
    <CallContext.Provider value={{ callActive, setCallActive }}>
      {children}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallProvider')
  }
  return context
}