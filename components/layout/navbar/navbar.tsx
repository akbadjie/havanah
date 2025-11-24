'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  MdMenu, 
  MdClose, 
  MdDashboard, 
  MdApartment, 
  MdDirectionsCar, 
  MdExplore, 
  MdPerson 
} from 'react-icons/md';
import { useAuth } from '@/lib/auth-store';

export default function Navbar() {
  const { user } = useAuth(); // Session State
  const router = useRouter();
  const pathname = usePathname();
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Handle Scroll Effect
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Determine Dashboard Link based on Role
  const dashboardLink = user?.role === 'agent' ? '/agent/dashboard' : '/user/dashboard';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
        ${isScrolled || pathname !== '/' 
          ? 'h-[70px] bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : 'h-[80px] bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Replace with your logo image if you have one, or use text */}
          <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            HAVANAH
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
            Explore
          </Link>
          <Link href="/explore?type=house" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
            Apartments
          </Link>
          <Link href="/explore?type=car" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
            Cars
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            // LOGGED IN VIEW
            <div className="flex items-center gap-4">
              <Link 
                href={dashboardLink}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-transform hover:-translate-y-0.5"
              >
                <MdDashboard /> Dashboard
              </Link>
              <Link href={`/profile/${user.id}`}>
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 hover:border-emerald-500 transition-colors"
                />
              </Link>
            </div>
          ) : (
            // LOGGED OUT VIEW
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="text-sm font-bold text-gray-700 hover:text-emerald-600"
              >
                Log In
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[70px] left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl md:hidden"
          >
            <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-700">
              <MdExplore className="text-emerald-500" /> Explore All
            </Link>
            <Link href="/explore?type=house" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-700">
              <MdApartment className="text-emerald-500" /> Apartments
            </Link>
            <Link href="/explore?type=car" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-700">
              <MdDirectionsCar className="text-emerald-500" /> Cars
            </Link>
            
            <hr className="border-gray-100 my-2" />
            
            {user ? (
              <>
                <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-700">
                  <MdDashboard className="text-emerald-500" /> Go to Dashboard
                </Link>
                <Link href={`/profile/${user.id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-700">
                  <MdPerson className="text-emerald-500" /> My Profile
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center rounded-xl bg-gray-100 font-bold text-gray-700">
                  Log In
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center rounded-xl bg-emerald-500 text-white font-bold">
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}