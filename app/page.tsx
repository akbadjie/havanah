'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Radio, Check, Star, Menu, Search, Home, Briefcase, MapPin , Car, Shield } from 'lucide-react';
import Head from 'next/head';

// --- Utility Components ---
const SectionSpacer = () => <div className="h-24 md:h-32 bg-transparent" />;

// --- 1. Navbar (Unchanged) ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-emerald-100 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200">H</div>
            <span className="font-display font-bold text-xl tracking-tight text-gray-900">Havanah</span>
          </div>
          <div className="hidden md:flex space-x-8">
            {['Real Estate', 'Vehicles', 'Pricing', 'About'].map((item) => (
              <a key={item} href="#" className="text-gray-500 hover:text-emerald-600 font-medium transition-colors text-sm">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-gray-500 hover:text-emerald-600">Log In</button>
            <a href="#" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-xl shadow-emerald-200">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- 2. UPDATED Hero Section ---
const HeroSection = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 1. Text Animation
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // 2. Phone Position (Y-Axis)
  const phoneY = useTransform(scrollYProgress, [0, 0.4, 0.8], ["85%", "0%", "0%"]);
  
  // 3. Phone Scale (Shrink to reveal side modals)
  const phoneScale = useTransform(scrollYProgress, [0.4, 0.6], [1, 0.9]);

  // 4. App Store Buttons (Fade in from BOTTOM)
  const btnOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
  const btnY = useTransform(scrollYProgress, [0.6, 0.75], [100, 0]); // Move up from bottom

  // 5. Side Modals Animation (Pop out from behind phone to sides)
  const modalOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  // Left side modals move left, Right side modals move right
  const leftModalX = useTransform(scrollYProgress, [0.45, 0.6], [0, -260]); 
  const rightModalX = useTransform(scrollYProgress, [0.45, 0.6], [0, 260]);
  const leftModalX2 = useTransform(scrollYProgress, [0.45, 0.6], [0, -290]); 
  const rightModalX2 = useTransform(scrollYProgress, [0.45, 0.6], [0, 290]);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-white w-full">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05] pointer-events-none" />
      
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        
        {/* --- TEXT LAYER --- */}
        <motion.div 
          style={{ opacity: textOpacity, scale: textScale, y: textY }}
          className="absolute top-[15%] z-10 text-center px-4 max-w-4xl mx-auto w-full"
        >
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
            
            {/* APP STORE BUTTONS (Bottom) - Now positioned absolute relative to center */}
            <motion.div 
                style={{ opacity: btnOpacity, y: btnY }}
                className="absolute top-[85%] z-10 flex gap-4" 
            >
                <a href="#" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium text-lg shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1">
                    <i className="fab fa-apple text-xl"></i> Download on iOS
                </a>
                <a href="#" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-full font-medium text-lg shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-1">
                    <i className="fab fa-google-play text-emerald-600 text-xl"></i> Get it on Android
                </a>
            </motion.div>

            {/* --- SIDE POP-UP MODALS --- */}
            
            {/* Left Side Group */}
            <motion.div style={{ opacity: modalOpacity, x: leftModalX }} className="absolute z-10 top-[20%]">
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><i className="fas fa-home"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Just Listed</p><p className="font-bold text-sm text-gray-900">Brufut Heights Villa</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftModalX2 }} className="absolute z-10 top-[35%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><i className="fas fa-comments"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">New Message</p><p className="font-bold text-sm text-gray-900">Is the price negotiable?</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftModalX }} className="absolute z-10 top-[50%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fas fa-car"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Price Drop</p><p className="font-bold text-sm text-gray-900">Lexus LX 570</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftModalX2 }} className="absolute z-10 top-[65%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><i className="fas fa-check-circle"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Verified</p><p className="font-bold text-sm text-gray-900">Bijilo Apartments</p></div>
                </div>
            </motion.div>

            {/* Right Side Group */}
            <motion.div style={{ opacity: modalOpacity, x: rightModalX }} className="absolute z-10 top-[25%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><i className="fas fa-car"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Vehicle Sold</p><p className="font-bold text-sm text-gray-900">Toyota Hilux 2022</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightModalX2 }} className="absolute z-10 top-[40%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><i className="fas fa-hand-holding-usd"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Offer Received</p><p className="font-bold text-sm text-gray-900">Senegambia Apt.</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightModalX }} className="absolute z-10 top-[55%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><i className="fas fa-heart"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Saved</p><p className="font-bold text-sm text-gray-900">Kerr Serign Land</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightModalX2 }} className="absolute z-10 top-[70%]">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"><i className="fas fa-user-check"></i></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Agent Joined</p><p className="font-bold text-sm text-gray-900">Modou Properties</p></div>
                </div>
            </motion.div>

            {/* THE PHONE - EXACT REFERENCE UI */}
            <motion.div 
                style={{ y: phoneY, scale: phoneScale }}
                className="relative z-20 w-[320px] h-[650px] shadow-2xl rounded-[3rem] border-[8px] border-gray-900 bg-gray-900 overflow-hidden"
            >
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30"></div>
                
                {/* Screen Content - Adapted to Emerald Theme */}
                <div className="w-full h-full bg-gray-50 flex flex-col relative font-sans overflow-y-auto no-scrollbar">
                     
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

                     {/* 3. Categories */}
                     <div className="px-5 mb-6">
                         <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
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

// --- 3. Infinite Scroll Marquee (Unchanged) ---
const InfiniteScrollMarquee = () => {
    return (
        <section className="py-12 bg-white overflow-hidden relative border-y border-gray-100">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10"/>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10"/>
            
            <motion.div 
                className="flex gap-16 w-max"
                animate={{ x: [0, -2000] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
            >
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-16 items-center">
                        <span className="text-6xl md:text-8xl font-black text-gray-100 uppercase tracking-tighter">Brusubi</span>
                        <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-200"/> 
                        <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-gray-200 uppercase tracking-tighter">Senegambia</span>
                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"/> 
                        <span className="text-6xl md:text-8xl font-black text-gray-100 uppercase tracking-tighter">Range Rover</span>
                        <div className="w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-200"/>
                        <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-gray-200 uppercase tracking-tighter">Brufut Heights</span>
                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"/>
                        <span className="text-6xl md:text-8xl font-black text-gray-100 uppercase tracking-tighter">Toyota</span>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}

// --- 4. Marketplace Grid (Unchanged) ---
const MarketplaceGrid = () => {
  const categories = [
    { title: "Residential", subtitle: "Apartments & Villas", icon: <Home className="text-white" />, img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { title: "Vehicles", subtitle: "Cars, Trucks & Bikes", icon: <Car className="text-white" />, img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { title: "Land", subtitle: "Plots & Farmland", icon: <MapPin className="text-white" />, img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { title: "Commercial", subtitle: "Office & Retail", icon: <Briefcase className="text-white" />, img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">Explore Our Marketplace</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">From coastal villas to city sedans, find exactly what you need.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-[2rem] h-96 bg-gray-200 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-gray-200 text-sm font-medium">{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- 5. Experience Banner (Unchanged) ---
const HavanaExperienceBanner = () => {
    return (
        <section className="py-20 md:py-32 bg-white flex items-center justify-center overflow-hidden border-t border-gray-100">
            <div className="text-center w-full relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-200/30 to-amber-200/30 rounded-full blur-[100px] -z-10" />
                
                <h2 className="text-[12vw] font-black leading-none tracking-tighter text-gray-100 select-none">
                    EXPERIENCE
                </h2>
                <h2 className="text-[12vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-emerald-600 to-emerald-400 select-none -mt-4 md:-mt-10 relative z-10">
                    HAVANA 2.0
                </h2>
            </div>
        </section>
    );
};

// --- 6. UPDATED Features Section ("Why Choose Havanah") ---
const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-500 font-semibold tracking-wider text-sm uppercase">Why Choose Havanah</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-gray-900">Everything you need to trade with confidence</h2>
        </div>
        
        {/* REPLACED GRID STRUCTURE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Verified Listings */}
            <div className="md:col-span-2 bg-purple-50 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-purple-100">
                <div className="relative z-10 max-w-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 text-xl shadow-sm">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Verified Listings Only</h3>
                    <p className="text-gray-600 mb-6">We manually verify every vehicle and property listed on Havanah to ensure you never encounter scams or fake listings.</p>
                    <a href="#" className="text-purple-600 font-medium hover:underline flex items-center gap-1">Learn about our verification process <i className="fas fa-arrow-right text-xs"></i></a>
                </div>
                {/* Decorative Image/Pattern */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

            {/* Box 2: Direct Chat */}
            <div className="bg-blue-50 rounded-3xl p-8 relative overflow-hidden border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-xl shadow-sm">
                    <i className="fas fa-comments"></i>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Direct Chat</h3>
                <p className="text-gray-600 text-sm mb-6">Negotiate directly with sellers or agents using our secure in-app messaging system.</p>
                <div className="mt-8 bg-white rounded-2xl p-4 shadow-lg transform rotate-3 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                        <div className="bg-gray-100 p-2 rounded-lg rounded-tl-none text-xs text-gray-800">Is the price negotiable?</div>
                    </div>
                    <div className="flex items-center gap-3 flex-row-reverse">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Me</div>
                        <div className="bg-blue-500 p-2 rounded-lg rounded-tr-none text-xs text-white">Yes, open to offers!</div>
                    </div>
                </div>
            </div>

            {/* Box 3: Smart Search */}
            <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 text-xl shadow-sm">
                    <i className="fas fa-search-location"></i>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Search</h3>
                <p className="text-gray-600 text-sm">Filter by location, price, make, model, or number of bedrooms to find your perfect match instantly.</p>
            </div>

            {/* Box 4: Seller Dashboard */}
            <div className="md:col-span-2 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-xl shadow-sm">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Seller Dashboard</h3>
                    <p className="text-gray-600 text-sm mb-4">Track views, messages, and engagement on your listings. Perfect for agents and dealerships.</p>
                    <button className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">View Demo</button>
                </div>
                <div className="flex-1 w-full">
                    <div className="bg-white rounded-xl p-4 shadow-lg w-full border border-gray-100">
                        <div className="flex justify-between items-end h-24 gap-2">
                            <div className="w-1/5 bg-emerald-100 rounded-t-lg h-12"></div>
                            <div className="w-1/5 bg-emerald-200 rounded-t-lg h-16"></div>
                            <div className="w-1/5 bg-emerald-500 rounded-t-lg h-24 relative group">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-100 transition shadow-sm">1.2k Views</div>
                            </div>
                            <div className="w-1/5 bg-emerald-200 rounded-t-lg h-14"></div>
                            <div className="w-1/5 bg-emerald-100 rounded-t-lg h-10"></div>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between text-[10px] text-gray-400 font-medium">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

// --- 7. Vertical Scroller (Unchanged) ---
const VerticalScroller = () => {
    const list1 = [
        { title: "Brufut Villa", price: "D7.5M", type: "Home", color: "bg-emerald-100" },
        { title: "Lexus 570", price: "D3.2M", type: "Car", color: "bg-gray-200" },
        { title: "Bijilo Land", price: "D450k", type: "Land", color: "bg-amber-100" },
        { title: "Toyota Corolla", price: "D300k", type: "Car", color: "bg-red-100" },
        { title: "Kerr Serign Apt", price: "D25k/mo", type: "Rent", color: "bg-blue-100" },
    ];
    
    return (
        <section className="py-24 bg-white relative overflow-hidden h-[800px] flex items-center border-y border-gray-100">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-50 translate-x-1/2"></div>
            
            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="flex flex-col justify-center">
                    <span className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-4">Live Market Activity</span>
                    <h2 className="text-5xl md:text-6xl font-black mb-8 text-gray-900">What's Trending in <br/><span className="text-emerald-500">Real-time.</span></h2>
                    <p className="text-gray-500 mb-8 max-w-md text-lg">Our algorithm matches buyers and sellers across The Gambia instantly. Watch transactions happen.</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-xl shadow-gray-100">
                             <Zap className="text-amber-500 fill-amber-500" size={18}/> <span className="text-sm font-bold text-gray-800">128 Sales Today</span>
                        </div>
                         <div className="flex items-center gap-2 bg-white rounded-xl px-5 py-3 border border-gray-100 shadow-xl shadow-gray-100">
                             <Radio className="text-emerald-500" size={18}/> <span className="text-sm font-bold text-gray-800">2.4k Active Users</span>
                        </div>
                    </div>
                </div>

                <div className="h-[600px] relative flex gap-6 rotate-[-5deg] scale-110 md:scale-100 opacity-90">
                     <div className="flex flex-col gap-6 w-64 overflow-hidden relative">
                         <div className="absolute top-0 z-20 w-full h-32 bg-gradient-to-b from-white to-transparent"/>
                         <motion.div 
                            className="flex flex-col gap-6"
                            animate={{ y: [0, -1000] }}
                            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                         >
                            {[...list1, ...list1, ...list1].map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:shadow-emerald-100/50 transition-all">
                                    <div className={`h-32 ${item.color} rounded-2xl mb-4 w-full`}/>
                                    <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                    <div className="flex justify-between mt-2 items-center">
                                        <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">{item.type}</span>
                                        <span className="text-emerald-600 font-bold text-sm">{item.price}</span>
                                    </div>
                                </div>
                            ))}
                         </motion.div>
                         <div className="absolute bottom-0 z-20 w-full h-32 bg-gradient-to-t from-white to-transparent"/>
                     </div>

                     <div className="flex flex-col gap-6 w-64 overflow-hidden relative mt-20">
                         <div className="absolute top-0 z-20 w-full h-32 bg-gradient-to-b from-white to-transparent"/>
                         <motion.div 
                            className="flex flex-col gap-6"
                            animate={{ y: [-1000, 0] }}
                            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                         >
                            {[...list1, ...list1, ...list1].reverse().map((item, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:shadow-emerald-100/50 transition-all">
                                    <div className={`h-32 ${item.color} rounded-2xl mb-4 w-full`}/>
                                    <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                    <div className="flex justify-between mt-2 items-center">
                                        <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">{item.type}</span>
                                        <span className="text-emerald-600 font-bold text-sm">{item.price}</span>
                                    </div>
                                </div>
                            ))}
                         </motion.div>
                         <div className="absolute bottom-0 z-20 w-full h-32 bg-gradient-to-t from-white to-transparent"/>
                     </div>
                </div>
            </div>
        </section>
    );
}

// --- 8. Pricing Section (Unchanged) ---
const PricingSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple Pricing for Sellers</h2>
          <p className="text-gray-500">Buyers are always free.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-xl text-gray-900">Individual</h3>
                <div className="text-4xl font-bold my-6 text-gray-900">Free</div>
                <ul className="space-y-4 mb-8">
                    {['Up to 3 listings', 'Basic chat support', 'Standard visibility'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                            <Check size={16} className="text-emerald-500"/> {item}
                        </li>
                    ))}
                </ul>
                <button className="w-full py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition">Get Started</button>
            </div>

            <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl relative transform md:-translate-y-6">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-[2rem]">POPULAR</div>
                <h3 className="font-bold text-xl text-white">Agent</h3>
                <div className="text-4xl font-bold my-6 text-white">$29<span className="text-lg font-normal text-gray-400">/mo</span></div>
                <ul className="space-y-4 mb-8">
                    {['Up to 20 listings', 'Featured listings (2/mo)', 'Verified Badge', 'Priority Support'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                            <Check size={16} className="text-emerald-500"/> {item}
                        </li>
                    ))}
                </ul>
                <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/30">Start Free Trial</button>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-xl text-gray-900">Dealership</h3>
                <div className="text-4xl font-bold my-6 text-gray-900">$99<span className="text-lg font-normal text-gray-500">/mo</span></div>
                <ul className="space-y-4 mb-8">
                    {['Unlimited listings', 'Dealer Dashboard', 'CRM Integration'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                            <Check size={16} className="text-emerald-500"/> {item}
                        </li>
                    ))}
                </ul>
                <button className="w-full py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition">Contact Sales</button>
            </div>
        </div>
      </div>
    </section>
  );
};

// --- 9. Payment Ecosystem (Unchanged) ---
const PaymentEcosystem = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"/>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"/>

             <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
                 <div className="flex-1">
                     <div className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs mb-6 border border-emerald-100 bg-emerald-50 px-4 py-2 rounded-full">
                         <Shield size={14}/> Secure Local Transactions
                     </div>
                     <h2 className="text-5xl font-black leading-tight mb-8 text-gray-900">
                         Local Payments, <br/>
                         Global Standard.
                     </h2>
                     <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                         Don't carry cash. Havanah is integrated with the payment systems you use everyday in Gambia. Verify identity and pay safely.
                     </p>
                     
                     <div className="flex gap-4">
                        {['Wave', 'AfriMoney', 'QMoney'].map((pay) => (
                             <motion.div 
                                key={pay}
                                whileHover={{ y: -5 }}
                                className="h-16 px-6 bg-white border border-gray-100 shadow-xl shadow-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-400 hover:text-emerald-600 hover:border-emerald-100 transition-all cursor-pointer"
                             >
                                 {pay}
                             </motion.div>
                        ))}
                     </div>
                 </div>

                 <div className="flex-1 relative h-[500px] w-full perspective-1000">
                      <motion.div 
                        initial={{ rotateY: 20, rotateX: 20 }}
                        animate={{ rotateY: [20, -20, 20], rotateX: [10, 30, 10], y: [-10, 10, -10] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 top-10 left-10 md:left-20 w-[350px] h-[220px] bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] shadow-2xl shadow-emerald-200 p-8 flex flex-col justify-between text-white border-t border-white/20 overflow-hidden"
                      >
                           <div className="absolute top-0 -left-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"/>
                           
                           <div className="flex justify-between items-start">
                               <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <div className="w-8 h-8 bg-amber-400 rounded-full opacity-90"/>
                               </div>
                               <Zap className="text-amber-300 opacity-90" size={28}/>
                           </div>
                           
                           <div>
                                <div className="text-2xl font-mono tracking-widest mb-2 opacity-90">•••• •••• 4529</div>
                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-[10px] uppercase opacity-70">Card Holder</p>
                                        <p className="text-sm font-bold tracking-wider">MODOU LAMIN J.</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="font-bold italic">VISA</span>
                                    </div>
                                </div>
                           </div>
                      </motion.div>
                 </div>
             </div>
        </section>
    )
}

// --- 10. Footer (Unchanged) ---
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">H</div>
              <span className="font-display font-bold text-xl text-gray-900">Havanah</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              The #1 Marketplace in Gambia for trusted Real Estate and Vehicle transactions.
            </p>
            <div className="flex gap-4">
               <i className="fab fa-twitter text-gray-400 hover:text-emerald-500 text-xl transition cursor-pointer"></i>
               <i className="fab fa-instagram text-gray-400 hover:text-emerald-500 text-xl transition cursor-pointer"></i>
               <i className="fab fa-facebook text-gray-400 hover:text-emerald-500 text-xl transition cursor-pointer"></i>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {['Homes for Sale', 'Rentals', 'Cars', 'Commercial'].map(i => <li key={i}><a href="#" className="hover:text-emerald-500 transition">{i}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {['About Us', 'Careers', 'Blog', 'Contact'].map(i => <li key={i}><a href="#" className="hover:text-emerald-500 transition">{i}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {['Help Center', 'Safety Tips', 'Terms', 'Privacy'].map(i => <li key={i}><a href="#" className="hover:text-emerald-500 transition">{i}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 Havanah Gambia. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-500">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main Page Component ---
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Head>
        <title>Havanah Gambia - Real Estate & Vehicle Marketplace</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
      </Head>
      
      <Navbar />
      
      <main>
        {/* REVISED HERO: App store buttons fade up from bottom + 8 Side Modals */}
        <HeroSection />
        
        {/* Infinite Scroll Marquee */}
        <InfiniteScrollMarquee />
        
        {/* Original Marketplace Grid */}
        <MarketplaceGrid />
        
        {/* Experience Banner */}
        <HavanaExperienceBanner />
        
        {/* REPLACED Features Section (Matches Reference) */}
        <FeaturesSection />
        
        {/* Vertical Scroller */}
        <VerticalScroller />
        
        {/* Pricing */}
        <PricingSection />
        
        {/* Payment Ecosystem */}
        <PaymentEcosystem />
      </main>

      <Footer />
    </div>
  );
}