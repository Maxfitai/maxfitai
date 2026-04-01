// Create a new file: src/app/(frontend)/context/IframeContext.tsx
'use client'
import { createContext, useContext, useState } from 'react'

const IframeContext = createContext<{ currentUrl: string; setCurrentUrl: (url: string) => void } | null>(null)

export const IframeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentUrl, setCurrentUrl] = useState('https://shop.maxfitai.com/')
    return (
        <IframeContext.Provider value={{ currentUrl, setCurrentUrl }}>
            {children}
        </IframeContext.Provider>
    )
}

export const useIframe = () => useContext(IframeContext)