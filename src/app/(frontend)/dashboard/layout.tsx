'use client'
import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from '@/app/(frontend)/components/ui/sidebar'
import { Sidebar } from '@/app/(frontend)/components/layout/Sidebar'
import MobileSidebar from '@/app/(frontend)/components/layout/MobileSidebar'
import { useAuth } from '../context/AuthProvider'
import { IframeProvider } from '../context/IframeContext'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <SidebarProvider>
      <IframeProvider>

        <div className="flex h-screen w-full">
          {/* Desktop Sidebar */}
          {user && (
            <div className="hidden md:block">
              <Sidebar />
            </div>
          )}

          {/* Mobile Navigation */}
          {user && <MobileSidebar />}

          {/* Main Content */}
          <SidebarInset className="flex-1 overflow-auto">
            <div className="pt-16 md:pt-0">{children}</div>
          </SidebarInset>
        </div>
      </IframeProvider>
    </SidebarProvider>
  )
}
