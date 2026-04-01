"use client";

import './styles.css';
import { Toaster } from '@/app/(frontend)/components/ui/toaster';
import { Toaster as Sonner } from '@/app/(frontend)/components/ui/sonner';
import { TooltipProvider } from '@/app/(frontend)/components/ui/tooltip';
import { ReactQueryProvider } from './providers';
import { AuthProvider } from './context/AuthProvider';
import { CallProvider } from '@/app/(frontend)/context/CallProvider';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const scriptId = 'tidio-chat-widget';

    if (pathname === '/') {
      // Add the Tidio script dynamically
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '//code.tidio.co/sufi6tfkgpidyiz1iemzqkxubrogndxx.js';
        script.async = true;
        document.body.appendChild(script);
      } else if (window.tidioChatApi) {
        // Show the Tidio widget if it was previously hidden
        window.tidioChatApi.show();
      }
    } else {
      // Use Tidio API to hide the widget
      if (window.tidioChatApi) {
        window.tidioChatApi.hide();
      }
    }

    return () => {
      // Cleanup: Remove the script and reset Tidio API
      if (pathname !== '/' && window.tidioChatApi) {
        window.tidioChatApi.hide();
      }
    };
  }, [pathname]);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-maxfit-black">
        <meta name="google-site-verification" content="kuGxm8kjUNG2XA3BNnS_BfXWhSWSmdUXJz6KT7fL0mg" />
        <ReactQueryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <CallProvider>{children}</CallProvider>
            </AuthProvider>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
