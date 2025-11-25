'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-store';
import Navbar from '@/components/layout/navbar/navbar';
import Sidebar from '@/components/layout/sidebar/sidebar'; // Assuming your sidebar file name
import { ToastProvider } from '@/components/toast/toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, initializeAuth } = useAuth();

  // 0. Initialize Auth on Mount (Firebase onAuthStateChanged)
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Define Route Groups
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Routes that require the Sidebar (Private / Dashboard views)
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
      // If user tries to access a sidebar route without being logged in
      if (isSidebarRoute && !user) {
        router.push('/auth?redirect=' + pathname);
      }
      // Optional: If user is logged in and tries to access login page
      if (isAuthPage && user) {
        router.push('/explore');
      }
    }
  }, [user, loading, isSidebarRoute, isAuthPage, router, pathname]);

  // 3. Loading State (Prevents flickering)
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

  // 4. Render Logic based on Route Type

  // CASE A: Auth Pages (Login/Signup) - Full Screen, No Nav
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
             Sidebar is fixed width (approx 280px). 
             We add margin-left to main content so it doesn't overlap.
             We also hide sidebar on mobile (handled in Sidebar component), 
             so we adjust margin for mobile accordingly.
          */}
          <main className="flex-1 lg:ml-[280px] p-0 transition-all duration-300">
            {children}
          </main>
        </div>
      </ToastProvider>
    );
  }

  // CASE C: Public Pages (Landing, Explore, Listings, Agent Profiles) - Navbar + Content
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {/* Navbar is fixed/sticky, add padding-top to prevent content hiding behind it */}
        <main className="flex-1 pt-[80px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}