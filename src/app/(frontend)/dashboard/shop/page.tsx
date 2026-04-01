'use client'

import { useState, useEffect } from 'react'

export default function ShopPage() {
    const [currentIframeUrl, setCurrentIframeUrl] = useState('https://shop.maxfitai.com/')

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('Received message:', event.data)  // Debug log
            if (event.data.type === 'iframeUrl') {
                setCurrentIframeUrl(event.data.url)
                console.log('Current iframe URL:', event.data.url)  // Debug log
                // Check if it's the cart URL and open in new tab
                if (event.data.url === 'https://shop.maxfitai.com/index.php/cart/') {
                    console.log('Opening cart URL in new tab')  // Debug log
                    window.open(event.data.url, '_blank')
                }
                // Now you can pass this to sidebar via context, or trigger actions
            }
        }
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    return (
        <div className="h-screen w-full">
            <iframe
                src="https://shop.maxfitai.com/"
                className="w-full h-full border-0"
                title="MaxFit Shop"
                allowFullScreen
            />
            {/* Optional: Display or use currentIframeUrl */}
            <p>Current iframe URL: {currentIframeUrl}</p>
        </div>
    )
}
