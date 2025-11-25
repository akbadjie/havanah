'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Zap, Radio, Check, Star, Menu, Search, Home, Briefcase, MapPin, 
  Car, Shield, ShieldCheck, MessageSquareText, BarChart3, CheckCircle2, 
  ArrowRight, X 
} from 'lucide-react';
import Head from 'next/head';

// --- Utility Components ---
const SectionSpacer = () => <div className="h-24 md:h-32 bg-transparent" />;

// --- 1. UPDATED Hero Section (Navbar Removed) ---
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

  // 2. Phone Position (Y-Axis) - Moves up and stays pinned
  const phoneY = useTransform(scrollYProgress, [0, 0.4, 0.8], ["85%", "0%", "0%"]);
  
  // 3. Phone Scale (Shrink slightly)
  const phoneScale = useTransform(scrollYProgress, [0.4, 0.6], [1, 0.9]);

  // 4. App Store Buttons (Fade in from BOTTOM)
  const btnOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
  const btnY = useTransform(scrollYProgress, [0.6, 0.75], [100, 0]);

  // 5. Side Modals Animation
  const animStart = 0.4;
  const animEnd = 0.65;
  const modalOpacity = useTransform(scrollYProgress, [animStart, animStart + 0.1], [0, 1]); 
  const modalScale = useTransform(scrollYProgress, [animStart, animEnd], [0.5, 1]); 

  const leftX = useTransform(scrollYProgress, [animStart, animEnd], [0, -280]); 
  const leftX2 = useTransform(scrollYProgress, [animStart, animEnd], [0, -320]);
  const leftRotate = useTransform(scrollYProgress, [animStart, animEnd], [0, -8]); 

  const rightX = useTransform(scrollYProgress, [animStart, animEnd], [0, 280]);
  const rightX2 = useTransform(scrollYProgress, [animStart, animEnd], [0, 320]);
  const rightRotate = useTransform(scrollYProgress, [animStart, animEnd], [0, 8]); 

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-white w-full">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05] pointer-events-none" />
      
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
            
            {/* APP STORE BUTTONS */}
            <motion.div 
                style={{ opacity: btnOpacity, y: btnY }}
                className="absolute top-[85%] z-10 flex gap-4" 
            >
                <a href="#" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium text-lg shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1">
                    Download on iOS
                </a>
                <a href="#" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-full font-medium text-lg shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-1">
                    Get it on Android
                </a>
            </motion.div>

            {/* --- SIDE POP-UP MODALS --- */}
            {/* Left Side Group */}
            <motion.div style={{ opacity: modalOpacity, x: leftX, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[20%] origin-right">
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Home size={18} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Just Listed</p><p className="font-bold text-sm text-gray-900">Brufut Heights Villa</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftX2, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[35%] origin-right">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><MessageSquareText size={18} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">New Message</p><p className="font-bold text-sm text-gray-900">Is the price negotiable?</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftX, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[50%] origin-right">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Car size={18} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Price Drop</p><p className="font-bold text-sm text-gray-900">Lexus LX 570</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: leftX2, scale: modalScale, rotate: leftRotate }} className="absolute z-10 top-[65%] origin-right">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><ShieldCheck size={18} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Verified</p><p className="font-bold text-sm text-gray-900">Bijilo Apartments</p></div>
                </div>
            </motion.div>

            {/* Right Side Group */}
            <motion.div style={{ opacity: modalOpacity, x: rightX, scale: modalScale, rotate: rightRotate }} className="absolute z-10 top-[25%] origin-left">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-60">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Car size={18} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Vehicle Sold</p><p className="font-bold text-sm text-gray-900">Toyota Hilux 2022</p></div>
                </div>
            </motion.div>
            <motion.div style={{ opacity: modalOpacity, x: rightX2, scale: modalScale, rotate: rightRotate }} className="absolute z-10 top-[40%] origin-left">
                 <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 w-64">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Zap size={18} /></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase">Offer Received</p><p className="font-bold text-sm text-gray-900">Senegambia Apt.</p></div>
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
                <div className="w-full h-full bg-gray-50 flex flex-col relative font-sans overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                     
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
                     </div>

                     {/* 2. Search */}
                     <div className="px-5 mb-4 bg-white pb-2">
                         <div className="relative">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                             <input type="text" placeholder="Search homes or cars..." className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 placeholder-gray-400 outline-none" />
                         </div>
                     </div>

                     {/* 3. Categories */}
                     <div className="px-5 mb-6">
                         <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                            <button className="flex-shrink-0 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-200">All</button>
                            <button className="flex-shrink-0 bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium">Homes</button>
                            <button className="flex-shrink-0 bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-medium">Cars</button>
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
                            <p className="text-emerald-500 font-bold text-sm mb-2">D7,500,000</p>
                        </div>
                     </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

// --- 2. Infinite Scroll Marquee ---
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
                    </div>
                ))}
            </motion.div>
        </section>
    )
}

// --- 3. Marketplace Grid ---
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

// --- 4. Experience Banner ---
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

// --- 5. UPDATED Features Section (With React/Lucide Icons) ---
const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-500 font-semibold tracking-wider text-sm uppercase">Why Choose Havanah</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-gray-900">Everything you need to trade with confidence</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Verified Listings */}
            <div className="md:col-span-2 bg-purple-50 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-purple-100">
                <div className="relative z-10 max-w-md">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">Verified Listings Only</h3>
                    <p className="text-gray-600 mb-6">We manually verify every vehicle and property listed on Havanah to ensure you never encounter scams or fake listings.</p>
                    <a href="#" className="text-purple-600 font-medium hover:underline flex items-center gap-1">Learn about our verification process <ArrowRight className="w-4 h-4" /></a>
                </div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            </div>

            {/* Box 2: Direct Chat */}
            <div className="bg-blue-50 rounded-3xl p-8 relative overflow-hidden border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <MessageSquareText className="w-6 h-6" />
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
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Search</h3>
                <p className="text-gray-600 text-sm">Filter by location, price, make, model, or number of bedrooms to find your perfect match instantly.</p>
            </div>

            {/* Box 4: Seller Dashboard */}
            <div className="md:col-span-2 bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <BarChart3 className="w-6 h-6" />
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
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

// --- 6. Vertical Scroller ---
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

// --- 7. UPDATED Pricing Section ---
const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Membership Plans</h2>
          <p className="text-gray-500 mb-8">Choose the right plan for your real estate or vehicle needs.</p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-white rounded-full border border-gray-200 mb-8 shadow-sm">
             <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
             >
                Monthly
             </button>
             <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
             >
                Yearly
             </button>
          </div>
          {billingCycle === 'yearly' && <p className="text-emerald-600 text-xs font-bold animate-pulse">Save up to 17% with yearly billing!</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            
            {/* PLAN A: NORMAL (Standard Access) */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-lg transition-shadow relative">
                <div className="mb-6">
                    <h3 className="font-bold text-xl text-gray-900">Normal Plan</h3>
                    <p className="text-gray-500 text-xs mt-1">Standard Access</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-gray-900">D{billingCycle === 'monthly' ? '200' : '2,000'}</span>
                    <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="space-y-4 mb-8">
                    {[
                        'Full platform access', 
                        'Rent cars & apartments', 
                        'Contact 5 agents per day', 
                        'Basic Support'
                    ].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0"/> {item}
                        </li>
                    ))}
                </ul>
                <button className="w-full py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition">Select Normal</button>
            </div>

            {/* PLAN B: PRO (Active Users) */}
            <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-200 shadow-xl relative transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-[2rem]">BEST VALUE</div>
                <div className="mb-6">
                    <h3 className="font-bold text-xl text-gray-900">Pro Plan</h3>
                    <p className="text-emerald-600 text-xs mt-1 font-bold">For Active Users</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-gray-900">D{billingCycle === 'monthly' ? '700' : '7,000'}</span>
                    <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="space-y-4 mb-8">
                    {[
                        'Everything in Normal Plan',
                        'Unlimited Agent Contacts',
                        'List 1 item for sale (Free)',
                        'Priority Listings',
                        'Priority Support'
                    ].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0"/> {item}
                        </li>
                    ))}
                </ul>
                <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200">Get Pro Access</button>
            </div>

            {/* PLAN C: PRO PLUS (Agents & Dealers) */}
            <div className="bg-gray-900 p-8 rounded-[2rem] shadow-2xl relative">
                <div className="mb-6">
                    <h3 className="font-bold text-xl text-white">Pro Plus</h3>
                    <p className="text-gray-400 text-xs mt-1">Agents & Dealerships</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold text-white">D{billingCycle === 'monthly' ? '2,000' : '20,000'}</span>
                    <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <ul className="space-y-4 mb-8">
                    {[
                        'Access to User Data/Trends',
                        'Outreach Marketing Tools',
                        'Competitor Price Analysis',
                        'Verified Agent Badge',
                        'Banner Ad Eligibility',
                        'Branded Profile'
                    ].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                            <Star size={18} className="text-amber-400 flex-shrink-0"/> {item}
                        </li>
                    ))}
                </ul>
                <button className="w-full py-3 rounded-xl bg-white/10 text-white border border-white/20 font-semibold hover:bg-white/20 transition">Contact Sales</button>
            </div>

        </div>
      </div>
    </section>
  );
};

// --- 8. Payment Ecosystem ---
const PaymentEcosystem = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"/>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"/>

             <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
                 <div className="flex-1">
                     <div className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs mb-6 border border-emerald-100 bg-emerald-50 px-4 py-2 rounded-full">
                         <ShieldCheck size={14}/> Secure Local Transactions
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

// --- 9. Footer ---
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
               {/* Social Icons Placeholder */}
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white transition cursor-pointer">X</div>
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white transition cursor-pointer">In</div>
               <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white transition cursor-pointer">Fb</div>
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
          <p className="text-sm text-gray-400">© 2025 Havanah Gambia. All rights reserved.</p>
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
      </Head>
      
      {/* Navbar Removed as requested */}
      
      <main>
        <HeroSection />
        <InfiniteScrollMarquee />
        <MarketplaceGrid />
        <HavanaExperienceBanner />
        <FeaturesSection />
        <VerticalScroller />
        <PricingSection />
        <PaymentEcosystem />
      </main>

      <Footer />
    </div>
  );
}