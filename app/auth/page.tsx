'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  MdEmail, 
  MdLock, 
  MdPerson, 
  MdPhone, 
  MdArrowForward, 
  MdBusinessCenter,
  MdCheck
} from 'react-icons/md';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, loginWithGoogle, loading } = useAuth();
  const toast = useToast();

  // --- State ---
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'user' | 'agent'>('user');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  // --- 3D Tilt Logic ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, fullName, phone } = formData;
    
    // Validation
    if (!email || !password) {
      toast.error("Missing Fields", "Please enter email and password.");
      return;
    }
    if (authMode === 'signup' && (!fullName || !phone)) {
      toast.error("Missing Fields", "Name and phone are required for signup.");
      return;
    }

    try {
      if (authMode === 'login') {
        const loadId = toast.loading("Signing In", "Verifying credentials...");
        await login(email, password);
        toast.remove(loadId);
        toast.success("Welcome Back", "Redirecting...");
      } else {
        const loadId = toast.loading("Creating Account", "Setting up profile...");
        await register(email, password, userType, fullName, phone);
        toast.remove(loadId);
        toast.success("Account Created", "Welcome to Havanah!");
      }

      // Redirect Logic
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(userType === 'agent' ? '/agent/dashboard' : '/explore');
      }

    } catch (error: any) {
      toast.error("Authentication Failed", error.message || "Something went wrong.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const loadId = toast.loading("Google Auth", "Connecting...");
      await loginWithGoogle(userType);
      toast.remove(loadId);
      toast.success("Success", "Redirecting...");
      router.push('/explore');
    } catch (error) {
      toast.error("Error", "Google authentication failed.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden font-sans">
      
      {/* --- Animated Background Blobs --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [0, -40, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[80px] bg-gradient-to-br from-emerald-200/40 to-cyan-200/40" 
        />
        <motion.div 
          animate={{ y: [0, 40, 0], rotate: [0, -10, 0], scale: [1, 1.2, 1] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[80px] bg-gradient-to-tr from-amber-200/30 to-orange-100/30" 
        />
      </div>

      {/* --- 3D Container --- */}
      <div 
        className="relative z-10 w-full max-w-[450px] p-6 perspective-[1000px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-3xl p-8 flex flex-col gap-6"
        >
          
          {/* Header & Logo */}
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
                HAVANAH
              </span>
            </Link>
            <h2 className="text-xl font-bold text-gray-900">
              {authMode === 'login' ? 'Welcome Back' : 'Join the Community'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {authMode === 'login' ? 'Enter your details to access your account.' : 'Start your premium journey today.'}
            </p>
          </div>

          {/* --- Toggles --- */}
          <div className="flex flex-col gap-4">
            
            {/* Login / Signup Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-xl relative">
              <motion.div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm z-0"
                layoutId="authToggle"
                initial={false}
                animate={{ x: authMode === 'login' ? 0 : '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${authMode === 'login' ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthMode('signup')}
                className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${authMode === 'signup' ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Sign Up
              </button>
            </div>

            {/* User Type Switcher */}
            <div className="flex justify-center gap-6 text-sm">
               <label className={`flex items-center gap-2 cursor-pointer transition-colors ${userType === 'user' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                 <input type="radio" name="type" className="hidden" checked={userType === 'user'} onChange={() => setUserType('user')} />
                 <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${userType === 'user' ? 'border-emerald-500' : 'border-gray-300'}`}>
                    {userType === 'user' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                 </span>
                 <MdPerson size={16} /> User
               </label>
               <label className={`flex items-center gap-2 cursor-pointer transition-colors ${userType === 'agent' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                 <input type="radio" name="type" className="hidden" checked={userType === 'agent'} onChange={() => setUserType('agent')} />
                 <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${userType === 'agent' ? 'border-emerald-500' : 'border-gray-300'}`}>
                    {userType === 'agent' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                 </span>
                 <MdBusinessCenter size={16} /> Agent
               </label>
            </div>
          </div>

          {/* --- Form --- */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {authMode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <div className="relative">
                    <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" name="fullName" placeholder="Full Name" required={authMode === 'signup'}
                      value={formData.fullName} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="tel" name="phone" placeholder="Phone Number" required={authMode === 'signup'}
                      value={formData.phone} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" name="email" placeholder="Email Address" required
                value={formData.email} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" name="password" placeholder="Password" required
                value={formData.password} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
              />
            </div>

            {authMode === 'login' && (
               <div className="flex justify-end">
                 <Link href="#" className="text-xs text-emerald-600 font-semibold hover:underline">Forgot Password?</Link>
               </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  <MdArrowForward className="text-lg" />
                </>
              )}
            </motion.button>
          </form>

          {/* --- Social --- */}
          <div className="flex flex-col gap-4">
            <div className="relative flex items-center justify-center">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
               <span className="relative bg-white/80 px-2 text-[10px] text-gray-400 uppercase tracking-widest backdrop-blur-xl">Or continue with</span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaGoogle className="text-gray-900" /> Google
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-2">
            By continuing, you agree to our <a href="#" className="underline hover:text-gray-600">Terms</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}