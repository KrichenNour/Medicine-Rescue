'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import SidebarNext from './SidebarNext'
import BottomNavNext from './BottomNavNext'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavPaths = ['/', '/auth', '/map']

  const isFullScreenRoute =
    hideNavPaths.includes(pathname) ||
    pathname.startsWith('/route/') ||
    (pathname.startsWith('/messages/') && pathname !== '/messages')

  const showNav = !isFullScreenRoute

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display">
      {/* Desktop Sidebar */}
      {showNav && (
        <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64">
          <SidebarNext />
        </div>
      )}

      {/* Main Content Area */}
      <div className={`${showNav ? 'md:pl-64' : ''} min-h-screen flex flex-col transition-all duration-300`}>
        <div className={`flex-1 ${showNav ? 'pb-16 md:pb-0' : ''}`}>
          {children}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {showNav && (
        <div className="md:hidden">
          <BottomNavNext />
        </div>
      )}
    </div>
  )
}