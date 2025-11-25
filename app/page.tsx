'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'; // Added useSpring if needed, though useTransform is smoother for scroll scrub
import { Zap, Radio, Check, Star, Menu, Search, Home, Briefcase, MapPin , Car, Shield } from 'lucide-react';
import Head from 'next/head';

// ... (Navbar remains the same)

// --- 2. UPDATED Hero Section ---
const HeroSection = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth Helper: Use a slightly eased scroll curve if desired, 
  // but for precise scroll scrubbing, direct transform is usually best.
  // We make the animation smoother by widening the range [start, end].

  // 1. Text Animation
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // 2. Phone Position (Y-Axis)
  const phoneY = useTransform(scrollYProgress, [0, 0.4, 0.8], ["85%", "0%", "0%"]);
  
  // 3. Phone Scale
  const phoneScale = useTransform(scrollYProgress, [0.4, 0.6], [1, 0.9]);

  // 4. App Store Buttons
  const btnOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
  const btnY = useTransform(scrollYProgress, [0.6, 0.75], [100, 0]);

  // 5. SIDE MODALS - SMOOTHER LOGIC
  // Widen the range (0.4 -> 0.65) so the animation is slower and less "jumpy"
  const popStart = 0.4;
  const popEnd = 0.65;

  const modalOpacity = useTransform(scrollYProgress, [popStart, popStart + 0.1], [0, 1]); // Fade in quickly first
  const modalScale = useTransform(scrollYProgress, [popStart, popEnd], [0.5, 1]); // Grow from 50% to 100% size

  // Movement & Rotation for "Fanning" effect
  // Left Group
  const leftX = useTransform(scrollYProgress, [popStart, popEnd], [0, -280]); 
  const leftRotate = useTransform(scrollYProgress, [popStart, popEnd], [0, -5]); // Slight tilt left
  
  // Right Group
  const rightX = useTransform(scrollYProgress, [popStart, popEnd], [0, 280]);
  const rightRotate = useTransform(scrollYProgress, [popStart, popEnd], [0, 5]); // Slight tilt right
  
  // Second layer (Further out)
  const leftX2 = useTransform(scrollYProgress, [popStart, popEnd], [0, -320]); 
  const rightX2 = useTransform(scrollYProgress, [popStart, popEnd], [0, 320]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-white w-full">
      {/* Hide Scrollbar Global Styles for this section */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Background Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05] pointer-events-none" />
      
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* --- TEXT LAYER --- */}
        <motion.div 
          style={{ opacity: textOpacity, scale: textScale, y: textY }}
          className="absolute top-[15%] z-10 text-center px-4 max-w-4xl mx-auto w-full"
        >
          {/* ... (Header content unchanged) ... */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-8 shadow-sm">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">Havanah Mobile App v2.0</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[0.9]">
            Find your dream <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">home today.</span>
          </h1>
          
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Reimagine how you rent, buy, and sell in the Gambian unified marketplace. 
            Connecting you to premium vehicles and properties.
          </p>
        </motion.div>


        {/* --- ANIMATION LAYER --- */}
        <div className="relative w-full flex items-center justify-center h-full">
            
            {/* APP STORE BUTTONS */}
            <motion.div 
                style={{ opacity: btnOpacity, y: btnY }}
                className="absolute top-[85%] z-10 flex gap-4" 
            >
                {/* ... (Buttons unchanged) ... */}
                <a href="#" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium text-lg shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1">
                    <i className="fab fa-apple text-xl"></i> Download on iOS
                </a>
                <a href="#" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-full font-medium text-lg shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-1">
                    <i className="fab fa-google-play text-emerald-600 text-xl"></i> Get it on Android
                </a>
            </motion.div>

            {/* --- SIDE POP-UP MODALS --- */}
            {/* 
                Update: Added 'scale: modalScale' and rotation to styles 
                Modals start small behind phone and scale up while moving out
            */}

            {/* Left Side Group */}
            <motion.div style={{ opacity: modalOpacity, x: leftX, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[20%] origin-right">
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><i className="fas fa-home"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Just Listed</p><p className="font-bold text-sm text-gray-900">Brufut Heights Villa</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftX2, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[35%] origin-right">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><i className="fas fa-comments"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">New Message</p><p className="font-bold text-sm text-gray-900">Is the price negotiable?</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftX, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[50%] origin-right">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fas fa-car"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Price Drop</p><p className="font-bold text-sm text-gray-900">Lexus LX 570</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftX2, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[65%] origin-right">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><i className="fas fa-check-circle"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Verified</p><p className="font-bold text-sm text-gray-900">Bijilo Apartments</p></div>
                </div>
            </motion.div>

            {/* Right Side Group */}
            <motion.div style={{ opacity: modalOpacity, x: rightX, scale: modalScale, rotate: rightRotate }} className="absolute z-10 top-[25%] origin-left">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fas fa-car"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Vehicle Sold</p><p className="font-bold text-sm text-gray-900">Toyota Hilux 2022</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightX2, scale: modalScale, rotate: rightRotate }} className="absolute z-10 top-[40%] origin-left">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><i className="fas fa-hand-holding-usd"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Offer Received</p><p className="font-bold text-sm text-gray-900">Senegambia Apt.</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightX, scale: modalScale, rotate: rightRotate }} className="absolute z-10 top-[55%] origin-left">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><i className="fas fa-heart"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Saved</p><p className="font-bold text-sm text-gray-900">Kerr Serign Land</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightX2, scale: modalScale, rotate: rightRotate }} className="absolute z-10 top-[70%] origin-left">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"><i className="fas fa-user-check"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Agent Joined</p><p className="font-bold text-sm text-gray-900">Modou Properties</p></div>
                </div>
            </motion.div>

            {/* THE PHONE */}
            <motion.div 
                style={{ y: phoneY, scale: phoneScale }}
                className="relative z-20 w-[320px] h-[650px] shadow-2xl rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 overflow-hidden"
            >
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30"></div>
                
                {/* Screen Content */}
                {/* Added 'no-scrollbar' class AND inline styles to force remove scroll wheel */}
                <div 
                    className="w-full h-full bg-gray-50 flex flex-col relative font-sans overflow-y-auto no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                     {/* 1. Header */}
                     <div className="pt-12 px-5 pb-4 bg-white flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover"/>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Welcome back</p>
                                <p className="text-sm font-bold text-gray-900">Alieu S.</p>
                            </div>
                        </div>
                        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                             <i className="fas fa-bell text-xs"></i>
                        </button>
                     </div>

                     {/* 2. Search */}
                     <div className="px-5 mb-4 bg-white pb-2">
                         <div className="relative">
                             <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                             <input type="text" placeholder="Search homes or cars..." className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-400 outline-none" />
                         </div>
                     </div>

                     {/* ... (Categories and Cards content remain identical) ... */}
                     {/* 3. Categories */}
                     <div className="px-5 mb-6">
                         <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                            <button className="flex-shrink-0 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-200">All</button>
                            <button className="flex-shrink-0 bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium">Homes</button>
                            <button className="flex-shrink-0 bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium">Cars</button>
                            <button className="flex-shrink-0 bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium">Land</button>
                         </div>
                     </div>

                     {/* 4. Content Feed */}
                     <div className="px-5 space-y-4 pb-24">
                        {/* Card 1 */}
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                            <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                                <img src="https://images.unsplash.com/photo-1600596542815-60c37c6525fa?auto=format&fit=crop&w=500&q=80" alt="House" className="w-full h-full object-cover" />
                                <span className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-emerald-600 shadow-sm">FOR SALE</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1">Modern Villa in Brusubi</h3>
                            <p className="text-emerald-500 font-bold text-sm mb-2">$185,000</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><i className="fas fa-bed text-[10px]"></i> 4</span>
                                <span className="flex items-center gap-1"><i className="fas fa-bath text-[10px]"></i> 3</span>
                                <span className="flex items-center gap-1"><i className="fas fa-ruler-combined text-[10px]"></i> 250m²</span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                            <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                                <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80" alt="Car" className="w-full h-full object-cover" />
                                <span className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-blue-500 shadow-sm">RENTAL</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1">Toyota Land Cruiser</h3>
                            <p className="text-emerald-500 font-bold text-sm mb-2">$85 / day</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><i className="fas fa-gas-pump text-[10px]"></i> Diesel</span>
                                <span className="flex items-center gap-1"><i className="fas fa-cog text-[10px]"></i> Auto</span>
                            </div>
                        </div>
                     </div>
                     
                     {/* 5. Bottom Nav */}
                     <div className="absolute bottom-5 left-4 right-4 bg-gray-900/95 text-white rounded-2xl p-4 flex justify-between items-center backdrop-blur-xl shadow-2xl">
                        <i className="fas fa-home text-emerald-400 text-lg"></i>
                        <i className="far fa-compass text-gray-500 text-lg"></i>
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center -mt-8 border-4 border-gray-50 shadow-lg">
                            <i className="fas fa-plus text-white text-sm"></i>
                        </div>
                        <i className="far fa-heart text-gray-500 text-lg"></i>
                        <i className="far fa-user text-gray-500 text-lg"></i>
                     </div>
                </div>
            </motion.div>

        </div>
      </div>
    </div>
  );
};