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
      label: 'Home', // Shortened for mobile
      href: dashboardLink, 
      icon: LayoutDashboard 
    },
    { 
      label: 'Chat', 
      href: '/messaging', 
      icon: MessageSquareText 
    },
    { 
      label: 'Network', 
      href: '/connections', 
      icon: Users 
    },
    ...(user?.role === 'agent' ? [{
      label: 'Listings',
      href: '/agent/listings',
      icon: Store
    }] : []),
    // We add Explore here specifically for Mobile to fit it in the flow
    {
      label: 'Explore',
      href: '/explore',
      icon: Compass
    },
    { 
      label: 'Profile', 
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
    <>
      {/* =================================================================================
          DESKTOP SIDEBAR (Large Screens > 1024px)
      ================================================================================= */}
      <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed top-0 left-0 z-50 overflow-hidden font-sans">
        
        {/* --- Ambient Liquid Background --- */}
        <div className="absolute inset-0 bg-white/60 z-0" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-emerald-400/30 rounded-full blur-[80px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[-10%] w-[250px] h-[250px] bg-amber-400/20 rounded-full blur-[60px]" 
        />
        
        {/* --- Glass Container --- */}
        <div className="relative z-10 flex flex-col h-full w-full bg-white/40 backdrop-blur-xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          
          {/* Header */}
          <div className="h-24 flex items-center px-8">
            <Link href="/" className="group flex items-center gap-3 w-full">
              <motion.div whileHover={{ rotate: 5, scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src="/logo.jpg" alt="HAVANAH" className="relative z-10 h-10 w-auto object-contain drop-shadow-sm"/>
              </motion.div>
            </Link>
          </div>

          {/* User Card */}
          <div className="px-5 mb-4">
            <motion.div 
              whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.8)' }}
              className="p-3.5 rounded-2xl bg-white/60 border border-white shadow-sm backdrop-blur-md cursor-pointer group relative overflow-hidden transition-colors"
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-400 to-amber-300 rounded-full blur-[2px] opacity-70" />
                  <img src={user?.photoURL || '/default-avatar.png'} alt="User" className="relative w-10 h-10 rounded-full object-cover border-2 border-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{user?.displayName || 'Guest'}</h4>
                  <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">{user?.role || 'Member'}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide py-2">
            <p className="px-4 text-[10px] font-extrabold text-gray-400/80 uppercase tracking-[0.2em] mb-3">Menu</p>
            
            <AnimatePresence mode='wait'>
              {/* Filter out 'Explore' from main loop on desktop as it has a special spot below, 
                  but we kept it in navItems array for Mobile convenience */}
              {navItems.filter(i => i.label !== 'Explore').map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="block relative group">
                    {active && (
                      <motion.div
                        layoutId="active-pill-desktop"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-100/90 to-white/50 rounded-xl border border-emerald-200/50 shadow-sm"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <motion.div 
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 z-10
                        ${active ? 'text-emerald-900' : 'text-gray-500 hover:text-gray-900'}`}
                      whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                    >
                      <span className={`transition-colors duration-300 ${active ? 'text-emerald-600' : 'group-hover:text-amber-500'}`}>
                        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                      </span>
                      <span className={`text-sm font-medium tracking-wide ${active ? 'font-bold' : ''}`}>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </AnimatePresence>

            <div className="my-4 border-t border-gray-100/60 mx-4" />

            <Link href="/explore">
              <motion.div 
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.4)' }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 group transition-colors ${isActive('/explore') ? 'bg-white/50 text-emerald-900 font-bold' : ''}`}
              >
                <Compass size={20} className="group-hover:text-amber-500 transition-colors" />
                <span className="text-sm font-medium group-hover:text-gray-900">Explore</span>
              </motion.div>
            </Link>
          </nav>

          {/* Logout */}
          <div className="p-5 border-t border-white/50">
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#FEF2F2' }} whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/80 border border-gray-100 text-gray-600 hover:text-red-500 hover:border-red-100 font-bold text-sm shadow-sm transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </motion.button>
          </div>
        </div>
      </aside>


      {/* =================================================================================
          MOBILE BOTTOM NAVIGATION (Small Screens < 1024px)
      ================================================================================= */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-white/60 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
      >
        {/* Subtle Gradient Line Top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="relative group w-full">
                <div className="flex flex-col items-center justify-center w-full gap-1">
                  
                  {/* Icon Container */}
                  <div className="relative p-1.5">
                    {active && (
                      <motion.div
                        layoutId="mobile-active-glow"
                        className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-amber-100 rounded-full blur-[5px]"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      animate={active ? { y: -2 } : { y: 0 }}
                      className={`relative z-10 ${active ? 'text-emerald-600' : 'text-gray-400'}`}
                    >
                      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                    </motion.div>
                  </div>

                  {/* Tiny Label */}
                  <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? 'text-emerald-800' : 'text-gray-400'}`}>
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {active && (
                    <motion.div 
                      layoutId="mobile-indicator"
                      className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}