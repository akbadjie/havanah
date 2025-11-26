'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import Navbar from '@/components/layout/navbar/navbar';
import Sidebar from '@/components/layout/sidebar/sidebar'; 
import { ToastProvider } from '@/components/toast/toast';
import GlobalNotificationListener from '@/components/messaging/GlobalNotificationListener';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, initializeAuth } = useAuth();

  // 0. Initialize Auth on Mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Define Route Groups
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Routes that use the Sidebar (Dashboard, Messaging, etc.)
  const isSidebarRoute = 
    pathname?.startsWith('/agent') ||
    pathname?.startsWith('/user') ||
    pathname?.startsWith('/messaging') ||
    pathname?.startsWith('/connections') ||
    pathname?.startsWith('/account') || 
    pathname?.startsWith('/upgrade');

  // Check specifically for messaging to alter layout behavior
  const isMessagingPage = pathname?.startsWith('/messaging');

  // 2. Auth Protection Logic
  useEffect(() => {
    if (!loading) {
      if (isSidebarRoute && !user) {
        router.push('/auth?redirect=' + pathname);
      }
      if (isAuthPage && user) {
        router.push('/explore');
      }
    }
  }, [user, loading, isSidebarRoute, isAuthPage, router, pathname]);

  // 3. Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading Havanah...</p>
        </div>
      </div>
    );
  }

  // 4. Render Logic

  // CASE A: Auth Pages
  if (isAuthPage) {
    return (
      <ToastProvider>
        <GlobalNotificationListener />
        {children}
      </ToastProvider>
    );
  }

  // CASE B: Private/Dashboard Pages - Sidebar + Content Area
  if (isSidebarRoute) {
    return (
      <ToastProvider>
        <GlobalNotificationListener />
        <div className="flex min-h-screen bg-gray-50 overflow-hidden">
          <Sidebar />
          
          {/* 
             FIXED MAIN CONTAINER:
             1. Logic: If it's the Messaging Page, we REMOVE the bottom padding (pb-24) 
                and constrain the height to the viewport.
             2. On Mobile: Height is 100dvh minus the Bottom Nav height (approx 70px-80px).
             3. On Desktop: Height is 100vh.
          */}
          <main 
            className={`
              flex-1 ml-0 lg:ml-[280px] transition-all duration-300 relative
              ${isMessagingPage 
                ? 'h-[calc(100dvh-80px)] lg:h-screen p-0 overflow-hidden' // Mobile: Fit above nav. Desktop: Full screen.
                : 'min-h-screen pb-24 lg:pb-0 p-0' // Standard scrolling behavior for other pages
              }
            `}
          >
            {children}
          </main>
        </div>
      </ToastProvider>
    );
  }

  // CASE C: Public Pages
  return (
    <ToastProvider>
      <GlobalNotificationListener />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-[80px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}