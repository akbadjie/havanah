'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  motion, 
  useScroll, 
  useMotionValueEvent, 
  AnimatePresence 
} from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Building2, 
  CarFront, 
  Compass, 
  UserCircle, 
  LogIn, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- CONFIGURATION (Not Hardcoded) ---
const NAV_LINKS = [
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Apartments', href: '/explore?type=house', icon: Building2 },
  { name: 'Cars', href: '/explore?type=car', icon: CarFront },
];

// --- THREE.JS COMPONENT: Floating Ethereal Gem ---
const EtherealGem = () => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if(meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 32, 32]} scale={2.4}>
        <MeshDistortMaterial
          color="#10b981" // Emerald
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#fbbf24" // Amber glow
          emissiveIntensity={0.2}
        />
      </Sphere>
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

  const dashboardLink = user?.role === 'agent' ? '/agent/dashboard' : '/user/dashboard';

  // Animation Variants
  const navContainerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    open: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        duration: 0.4, 
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={navContainerVariants}
        className={cn(
          "fixed top-4 left-0 right-0 z-50 mx-auto w-[95%] max-w-7xl transition-all duration-500 ease-out rounded-2xl border",
          isScrolled 
            ? "bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(16,185,129,0.1)] py-2" 
            : "bg-white/30 backdrop-blur-md border-transparent shadow-none py-4"
        )}
      >
        <div className="px-4 md:px-6 flex items-center justify-between relative">
          
          {/* --- LOGO SECTION --- */}
          <Link href="/" className="flex items-center gap-3 group relative z-10">
            {/* 3D Canvas wrapper - small and unobtrusive */}
            <div className="h-10 w-10 relative">
               <div className="absolute inset-0 z-0">
                  <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <ambientLight intensity={1} />
                    <directionalLight position={[10, 10, 5]} intensity={2} />
                    <EtherealGem />
                  </Canvas>
               </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 tracking-tight">
                HAVANAH
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold">
                Estates
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <nav className="hidden md:flex items-center bg-white/40 backdrop-blur-sm px-2 py-1.5 rounded-full border border-white/50 shadow-inner">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={cn(
                    "relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    isActive ? "text-emerald-700" : "text-slate-600 hover:text-emerald-600"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-white shadow-sm rounded-full border border-emerald-100/50"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={16} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* --- AUTH ACTIONS --- */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardLink}>
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </motion.button>
                </Link>
                <Link href={`/profile/${user.id}`}>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-300 to-emerald-500"
                  >
                    <img 
                      src={user.photoURL || '/default-avatar.png'} 
                      alt="Profile" 
                      className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    />
                  </motion.div>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/auth" 
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  Log In
                </Link>
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Sign Up <Sparkles size={14} className="text-amber-400" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-slate-700 bg-white/50 backdrop-blur-md rounded-lg border border-white/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>

        {/* --- MOBILE MENU --- */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden overflow-hidden bg-white/80 backdrop-blur-2xl border-t border-white/20 mx-2 mt-2 rounded-xl shadow-xl"
            >
              <div className="p-4 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <motion.div key={link.name} variants={itemVariants}>
                    <Link 
                      href={link.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 transition-colors text-slate-600 hover:text-emerald-700 font-medium"
                    >
                      <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500">
                        <link.icon size={20} />
                      </div>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2" />
                
                {user ? (
                  <>
                    <motion.div variants={itemVariants}>
                      <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500">
                          <LayoutDashboard size={20} />
                        </div>
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Link href={`/profile/${user.id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-500">
                          <UserCircle size={20} />
                        </div>
                        My Profile
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
                     <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-center shadow-sm">
                        Log In
                      </Link>
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-center shadow-lg shadow-emerald-500/20">
                        Sign Up Now
                      </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      
      {/* Spacer to prevent content jump since header is fixed/floating */}
      <div className={pathname === '/' ? '' : 'h-[100px]'} />
    </>
  );
}