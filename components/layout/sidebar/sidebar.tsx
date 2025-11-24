'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdMessage, 
  MdPeople, 
  MdExplore, 
  MdLogout, 
  MdPerson,
  MdSettings,
  MdAddBusiness
} from 'react-icons/md';
import { useAuth } from '@/lib/auth-store';

export default function Sidebar() {
  const { user, logout } = useAuth(); // Session Management
  const pathname = usePathname();
  const router = useRouter();

  // Determine Dashboard Link
  const dashboardLink = user?.role === 'agent' ? '/agent/dashboard' : '/user/dashboard';

  // Navigation Items
  const navItems = [
    { 
      label: 'Dashboard', 
      href: dashboardLink, 
      icon: <MdDashboard size={22} /> 
    },
    { 
      label: 'Messages', 
      href: '/messaging', 
      icon: <MdMessage size={22} /> 
    },
    { 
      label: 'Connections', 
      href: '/connections', 
      icon: <MdPeople size={22} /> 
    },
    // Only show "My Listings" if agent
    ...(user?.role === 'agent' ? [{
      label: 'My Listings',
      href: '/agent/listings',
      icon: <MdAddBusiness size={22} />
    }] : []),
    { 
      label: 'My Profile', 
      href: user ? `/profile/${user.id}` : '#', 
      icon: <MdPerson size={22} /> 
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex flex-col w-[280px] h-screen fixed top-0 left-0 bg-white border-r border-gray-100 z-40">
        
        {/* Header / Brand */}
        <div className="h-[80px] flex items-center px-8 border-b border-gray-50">
          <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            HAVANAH
          </Link>
        </div>

        {/* User Mini Profile */}
        <div className="p-6 pb-2">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
            <img 
              src={user?.photoURL || '/default-avatar.png'} 
              alt="User" 
              className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <h4 className="font-bold text-gray-900 text-sm truncate">{user?.displayName || 'User'}</h4>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Member'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
          
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive(item.href) 
                    ? 'bg-emerald-50 text-emerald-600 font-bold shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
              >
                <span className={isActive(item.href) ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600'}>
                  {item.icon}
                </span>
                {item.label}
              </div>
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-50">
            <Link href="/explore">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all">
                <MdExplore size={22} className="text-gray-400" />
                Back to Explore
              </div>
            </Link>
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <MdLogout size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (Optional, or rely on Hamburger in MainLayout if preferred) */}
      {/* For this specific request, we generally hide the sidebar on mobile and rely on the Navbar's mobile menu or a dedicated mobile drawer. 
          The MainLayout handles layout spacing. Since mobile layout often differs, usually we create a MobileDrawer component.
          However, for simplicity here, this Sidebar is strictly the Desktop Sidebar implementation.
       */}
    </>
  );
}