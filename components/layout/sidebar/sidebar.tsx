'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Users, 
  Store, 
  UserCircle, 
  LogOut, 
  Compass, 
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const dashboardLink = user?.role === 'agent' ? '/agent/dashboard' : '/user/dashboard';

  const navItems = [
    { 
      label: 'Dashboard', 
      href: dashboardLink, 
      icon: LayoutDashboard 
    },
    { 
      label: 'Messages', 
      href: '/messaging', 
      icon: MessageSquareText 
    },
    { 
      label: 'Connections', 
      href: '/connections', 
      icon: Users 
    },
    ...(user?.role === 'agent' ? [{
      label: 'My Listings',
      href: '/agent/listings',
      icon: Store
    }] : []),
    { 
      label: 'My Profile', 
      href: user ? `/profile/${user.id}` : '#', 
      icon: UserCircle 
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed top-0 left-0 z-50 overflow-hidden">
      
      {/* --- Liquid Ambient Background --- */}
      <div className="absolute inset-0 bg-white/40 z-0" />
      <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute bottom-[10%] right-[-10%] w-[250px] h-[250px] bg-amber-400/20 rounded-full blur-[60px] animate-pulse delay-1000" />
      
      {/* --- Glass Container --- */}
      <div className="relative z-10 flex flex-col h-full w-full bg-white/60 backdrop-blur-2xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-24 flex items-center px-8"
        >
          <Link href="/" className="group flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="relative w-10 h-10 bg-gradient-to-tr from-emerald-500 to-emerald-300 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
               {/* Replace with your Image logo if needed, using text H for now for style match */}
               <span className="text-white font-bold text-xl">H</span>
            </motion.div>
            <span className="font-bold text-xl tracking-tight text-gray-800 group-hover:text-emerald-600 transition-colors">
              HAVANAH
            </span>
          </Link>
        </motion.div>

        {/* User Profile Card - Floating Glass */}
        <div className="px-6 mb-2">
          <motion.div 
            whileHover={{ y: -2, scale: 1.02 }}
            className="p-4 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-amber-400 rounded-full blur-[2px]" />
                <img 
                  src={user?.photoURL || '/default-avatar.png'} 
                  alt="User" 
                  className="relative w-11 h-11 rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm truncate">{user?.displayName || 'Guest User'}</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-gray-500 font-medium capitalize">{user?.role || 'Visitor'}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-extrabold text-gray-400/80 uppercase tracking-[0.2em] mb-4">
            Menu
          </p>
          
          <AnimatePresence>
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="block relative group">
                  {/* Fluid Active Background Pill */}
                  {active && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-100/80 to-emerald-50/50 rounded-xl shadow-sm border border-emerald-100/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <motion.div 
                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 z-10
                      ${active ? 'text-emerald-800' : 'text-gray-500 hover:text-gray-900'}`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-1.5 rounded-lg transition-all duration-300 
                      ${active 
                        ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' 
                        : 'bg-transparent group-hover:bg-gray-100 group-hover:text-gray-700'}`
                    }>
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    
                    <span className={`font-medium tracking-wide ${active ? 'font-bold' : ''}`}>
                      {item.label}
                    </span>
                    
                    {active && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </AnimatePresence>

          {/* Separation Line */}
          <div className="my-6 border-t border-gray-100/80 mx-4" />

          {/* Explore Link */}
          <Link href="/explore">
            <motion.div 
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.5)' }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-amber-600 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:text-amber-500">
                <Compass size={20} />
              </div>
              <span className="font-medium">Explore</span>
            </motion.div>
          </Link>
        </nav>

        {/* Footer / Logout */}
        <div className="p-6">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="w-full relative overflow-hidden group flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:border-red-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 text-gray-600 group-hover:text-red-500 font-bold text-sm">
              <LogOut size={18} />
              Sign Out
            </span>
          </motion.button>
        </div>
      </div>
    </aside>
  );
}