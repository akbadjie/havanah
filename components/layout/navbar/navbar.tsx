'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { 
  motion, 
  useScroll, 
  useMotionValueEvent, 
  AnimatePresence,
  useSpring,
  useTransform
} from 'framer-motion';
import { 
  Compass, 
  Building2, 
  Car, 
  LayoutDashboard, 
  UserCircle, 
  Menu, 
  X, 
  LogIn, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility for cleaner tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Configuration (Not Hardcoded) ---
const NAV_LINKS = [
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Apartments', href: '/explore?type=house', icon: Building2 },
  { name: 'Cars', href: '/explore?type=car', icon: Car },
];

// --- Three.js Component: The "Liquid Emerald" ---
const LiquidGem = () => {
  const meshRef = React.useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial 
          color="#10b981" // Emerald
          attach="material" 
          distort={0.4} // Liquid effect
          speed={2}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
};

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Scroll Listener
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  // Dynamic Dashboard Link
  const dashboardLink = user?.role === 'agent' ? '/agent/dashboard' : '/user/dashboard';

  // Animation Variants
  const navContainerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.2 }
    }
  };

  const linkVariants = {
    hover: { scale: 1.05, y: -2 },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={navContainerVariants}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 py-4",
          isScrolled ? "pt-2" : "pt-6"
        )}
      >
        <div 
          className={cn(
            "max-w-7xl mx-auto rounded-2xl flex items-center justify-between px-6 transition-all duration-500",
            // THEME: Liquid Glass / Ethereal
            "bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg shadow-emerald-900/5 supports-[backdrop-filter]:bg-white/30",
            isScrolled ? "h-[65px]" : "h-[80px]"
          )}
        >
          {/* --- 1. Logo Section (With Three.js Gem) --- */}
          <Link href="/" className="group flex items-center gap-3 relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="h-10 w-10 relative"
            >
              {/* Fallback to simple div if WebGL fails, but here uses Canvas */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ alpha: true }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1.5} />
                  <Suspense fallback={null}>
                    <LiquidGem />
                  </Suspense>
                </Canvas>
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="text-xl font-bold tracking-tight text-gray-900"
              >
                HAVANAH
              </motion.span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold"
              >
                Estates & Motors
              </motion.span>
            </div>
          </Link>

          {/* --- 2. Desktop Navigation (Lucid Icons + Glass Hover) --- */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link key={link.name} href={link.href}>
                  <motion.div
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={cn(
                      "relative px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-300",
                      isActive 
                        ? "text-emerald-700 bg-emerald-50/50 shadow-inner" 
                        : "text-gray-600 hover:text-emerald-600 hover:bg-white/40"
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-emerald-500" : "text-gray-400"} />
                    {link.name}
                    
                    {/* Active State Glow */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 rounded-xl bg-emerald-400/10 border border-emerald-400/20 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* --- 3. Auth Actions (Emerald & Gold Theme) --- */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 pl-4 border-l border-gray-200/50"
              >
                <Link href={dashboardLink}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow-lg shadow-gray-900/20 hover:bg-black transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-emerald-400" />
                    <span>Dashboard</span>
                  </motion.button>
                </Link>
                
                <Link href={`/profile/${user.id}`}>
                  <motion.div whileHover={{ scale: 1.1 }} className="relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                    <img 
                      src={user.photoURL || '/default-avatar.png'} 
                      alt="User" 
                      className="relative w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <LogIn size={16} /> Log In
                  </motion.button>
                </Link>
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30"
                  >
                    {/* Gold sheen effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-10" />
                    <span className="relative z-20 flex items-center gap-2">
                      Get Started <Sparkles size={14} className="text-amber-300" />
                    </span>
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* --- Mobile Toggle --- */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </motion.header>

      {/* --- Mobile Menu (Slide & Blur) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Content */}
            <motion.div 
              initial={{ y: -50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="fixed top-[90px] left-4 right-4 z-50 rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl p-6 md:hidden overflow-hidden"
            >
              {/* Decorative Liquid background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none" />

              <div className="flex flex-col gap-2 relative z-10">
                {NAV_LINKS.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-transparent active:border-emerald-200 active:bg-emerald-50/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600">
                            <Icon size={20} />
                          </div>
                          <span className="font-semibold text-gray-700">{link.name}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </motion.div>
                    </Link>
                  )
                })}

                <div className="h-px bg-gray-200 my-4" />

                {user ? (
                   <div className="flex flex-col gap-3">
                     <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold flex justify-center items-center gap-2">
                          <LayoutDashboard size={18} /> Dashboard
                        </div>
                     </Link>
                   </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-center">
                        Log In
                      </div>
                    </Link>
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-center shadow-lg shadow-emerald-500/30">
                        Sign Up Now
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}