'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import Navbar from '@/components/layout/navbar/navbar';
import Sidebar from '@/components/layout/sidebar/sidebar'; 
import { ToastProvider } from '@/components/toast/toast';

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
  
  const isSidebarRoute = 
    pathname?.startsWith('/agent') ||
    pathname?.startsWith('/user') ||
    pathname?.startsWith('/messaging') ||
    pathname?.startsWith('/connections') ||
    pathname?.startsWith('/account') || 
    pathname?.startsWith('/upgrade');

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
        {children}
      </ToastProvider>
    );
  }

  // CASE B: Private/Dashboard Pages - Sidebar + Content Area
  if (isSidebarRoute) {
    return (
      <ToastProvider>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          
          {/* 
             UPDATED MAIN CONTAINER:
             1. ml-0: No left margin on mobile.
             2. lg:ml-[280px]: Left margin on desktop for Sidebar.
             3. pb-24: Bottom padding on mobile so content isn't hidden behind Bottom Nav.
             4. lg:pb-0: No bottom padding on desktop.
          */}
          <main className="flex-1 ml-0 lg:ml-[280px] pb-24 lg:pb-0 p-0 transition-all duration-300">
            {children}
          </main>
        </div>
      </ToastProvider>
    );
  }

  // CASE C: Public Pages
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-[80px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}