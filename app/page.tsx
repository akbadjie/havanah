'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, Radio, Shield, Check, Star, Menu, X, Search, Home, Car, MapPin, Briefcase } from 'lucide-react';
import Head from 'next/head';

// --- Utility Components ---

const SectionSpacer = () => <div className="h-24 md:h-32 bg-transparent" />;

// --- 1. Navbar (Glassmorphism, Light Theme) ---
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

// --- 2. Advanced Hero Section (3D Phone + Scroll Animations) ---
const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Phone Animations: Starts zoomed in and low, moves to center and scales down
  const phoneScale = useTransform(scrollYProgress, [0, 0.4], [1.3, 0.9]); 
  const phoneY = useTransform(scrollYProgress, [0, 0.4], ["30%", "0%"]);
  
  // Cards Fan Out Animation (Triggered after phone settles)
  const cardSpread = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const buttonOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const buttonY = useTransform(scrollYProgress, [0.4, 0.6], [20, 0]);

  // Smoother springs
  const smoothSpread = useSpring(cardSpread, { stiffness: 100, damping: 20 });

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]"></div>
      
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Text Content (Fades out as phone takes over) */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]), scale: useTransform(scrollYProgress, [0, 0.2], [1, 0.9]) }}
          className="absolute top-32 text-center z-10 px-4 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-100 shadow-sm mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">Havanah Mobile App v2.0 Live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Find Your Dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-amber-400">Asset</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Scroll to explore the future of Gambian commerce. Real Estate and Vehicles in one unified marketplace.
          </p>
        </motion.div>

        {/* 3D Phone & Cards Container */}
        <motion.div 
          style={{ scale: phoneScale, y: phoneY }}
          className="relative z-20 mt-32 md:mt-0 w-[300px] md:w-[350px] h-[700px] perspective-1000"
        >
          {/* Floating Cards Behind Phone */}
          {[...Array(6)].map((_, i) => {
            // Calculate random-ish positions for the fanned out cards
            const rotateDeg = (i % 2 === 0 ? 1 : -1) * (15 + i * 5);
            const xVal = (i % 2 === 0 ? 1 : -1) * (180 + i * 40);
            const yVal = -100 + (i * 50);
            
            return (
              <motion.div
                key={i}
                style={{
                  rotate: useTransform(smoothSpread, [0, 1], [0, rotateDeg]),
                  x: useTransform(smoothSpread, [0, 1], [0, xVal]),
                  y: useTransform(smoothSpread, [0, 1], [0, yVal]),
                  opacity: smoothSpread,
                  zIndex: 10 - i // Behind phone
                }}
                className="absolute top-1/4 left-0 w-64 p-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {i % 2 === 0 ? <Home size={20} /> : <Car size={20} />}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{i % 2 === 0 ? 'Just Listed' : 'Sold'}</p>
                  <p className="font-bold text-sm text-gray-800">{i % 2 === 0 ? 'Senegambia Apt.' : 'Toyota Hilux 2024'}</p>
                  <p className="text-xs font-bold text-emerald-500">{i % 2 === 0 ? 'D4,500,000' : 'D1,200,000'}</p>
                </div>
              </motion.div>
            );
          })}

          {/* The Phone Itself */}
          <div className="relative w-full h-full bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden z-20">
            {/* Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-30"></div>
            
            {/* App Screen (Simplified for React) */}
            <div className="w-full h-full bg-gray-50 overflow-hidden flex flex-col">
              {/* App Header */}
              <div className="pt-12 px-5 pb-4 bg-white flex justify-between items-center shadow-sm">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200"></div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold">WELCOME</p>
                        <p className="text-xs font-bold text-gray-800">Alieu S.</p>
                    </div>
                 </div>
                 <Menu size={20} className="text-gray-400"/>
              </div>
              
              {/* App Search */}
              <div className="px-5 mt-4">
                  <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2 text-gray-400 text-xs">
                      <Search size={14} />
                      <span>Find homes, cars...</span>
                  </div>
              </div>

              {/* App Content */}
              <div className="p-5 grid gap-4 overflow-y-auto no-scrollbar pb-20">
                  <div className="h-40 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden relative group">
                      <img src="https://images.unsplash.com/photo-1600596542815-60c37c6525fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" className="w-full h-24 object-cover" alt="House"/>
                      <div className="p-3">
                          <p className="font-bold text-xs">Brusubi Phase 2</p>
                          <p className="text-[10px] text-emerald-500 font-bold">D8,500,000</p>
                      </div>
                  </div>
                  <div className="h-40 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" className="w-full h-24 object-cover" alt="Car"/>
                      <div className="p-3">
                          <p className="font-bold text-xs">Toyota Prado</p>
                          <p className="text-[10px] text-emerald-500 font-bold">D1,800,000</p>
                      </div>
                  </div>
              </div>

              {/* App Tab Bar */}
              <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur text-white rounded-2xl p-4 flex justify-between items-center">
                <Home size={18} className="text-emerald-400" />
                <Search size={18} className="text-gray-400" />
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center -mt-8 border-4 border-gray-50 shadow-lg">
                    <span className="text-xl font-light">+</span>
                </div>
                <Star size={18} className="text-gray-400" />
                <div className="w-5 h-5 rounded-full border border-gray-500"></div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* App Store Buttons (Fade In after Zoom) */}
        <motion.div 
            style={{ opacity: buttonOpacity, y: buttonY }}
            className="fixed bottom-12 z-30 flex flex-col sm:flex-row gap-4"
        >
             <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium text-sm flex items-center gap-3 shadow-xl hover:bg-gray-800 transition-colors">
                 <i className="fab fa-apple text-xl"></i> 
                 <div className="text-left">
                     <p className="text-[10px] uppercase text-gray-400 leading-none">Download on</p>
                     <p className="font-bold leading-none mt-1">App Store</p>
                 </div>
             </button>
             <button className="bg-white text-gray-900 border border-gray-200 px-8 py-3 rounded-full font-medium text-sm flex items-center gap-3 shadow-xl hover:bg-gray-50 transition-colors">
                 <i className="fab fa-google-play text-xl text-emerald-600"></i>
                 <div className="text-left">
                     <p className="text-[10px] uppercase text-gray-400 leading-none">Get it on</p>
                     <p className="font-bold leading-none mt-1">Google Play</p>
                 </div>
             </button>
        </motion.div>
      </div>
    </div>
  );
};

// --- 3. Infinite Scroll Marquee (Adapted) ---
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

// --- 4. Original Marketplace Grid (Styled) ---
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

// --- 5. Experience Banner ---
const HavanaExperienceBanner = () => {
    return (
        <section className="py-20 md:py-32 bg-white flex items-center justify-center overflow-hidden border-t border-gray-100">
            <div className="text-center w-full relative">
                {/* Background glow for effect */}
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

// --- 6. Features Section (Original HTML converted) ---
const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-500 font-bold tracking-widest text-sm uppercase">Why Choose Havanah</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 text-gray-900">Trade with absolute confidence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="md:col-span-2 bg-emerald-50 rounded-[2.5rem] p-10 relative overflow-hidden border border-emerald-100 group">
             <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Shield size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Verified Listings Only</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">We manually verify every vehicle and property listed on Havanah to ensure you never encounter scams or fake listings in The Gambia.</p>
             </div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          </div>

          {/* Feature 2 */}
          <div className="bg-amber-50 rounded-[2.5rem] p-10 relative overflow-hidden border border-amber-100">
             <div className="w-14 h-14 bg-white text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                 <div className="relative">
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    <i className="fas fa-comments text-lg"></i>
                 </div>
             </div>
             <h3 className="text-xl font-bold mb-3 text-gray-900">Direct Chat</h3>
             <p className="text-gray-600 text-sm mb-6">Negotiate directly with sellers or agents using our secure in-app messaging system.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- 7. Vertical Scroller (Adapted to Light Theme) ---
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
            {/* Background blobs */}
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
                     {/* Column 1 (Up) */}
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

                     {/* Column 2 (Down) */}
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

// --- 8. Pricing Section (Original HTML converted) ---
const PricingSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Simple Pricing for Sellers</h2>
          <p className="text-gray-500">Buyers are always free.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Free */}
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

            {/* Agent */}
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

            {/* Dealership */}
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

// --- 9. Payment Ecosystem (Glass/Light Theme) ---
const PaymentEcosystem = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
             {/* Abstract Decorators */}
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
                      {/* Floating credit card/payment abstract visual */}
                      <motion.div 
                        initial={{ rotateY: 20, rotateX: 20 }}
                        animate={{ rotateY: [20, -20, 20], rotateX: [10, 30, 10], y: [-10, 10, -10] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 top-10 left-10 md:left-20 w-[350px] h-[220px] bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] shadow-2xl shadow-emerald-200 p-8 flex flex-col justify-between text-white border-t border-white/20 overflow-hidden"
                      >
                           {/* Shine Effect */}
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

// --- 10. Footer (Original HTML converted) ---
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
               {/* Using FA classes for social icons as in original, assuming FontAwesome is loaded via Head */}
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
        {/* The New Hero with 3D Scroll Logic */}
        <HeroSection />
        
        {/* Infinite Scroll Marquee (New) */}
        <InfiniteScrollMarquee />
        
        {/* Original Marketplace Grid (Styled) */}
        <MarketplaceGrid />
        
        {/* Experience Banner (New) */}
        <HavanaExperienceBanner />
        
        {/* Original Features */}
        <FeaturesSection />
        
        {/* Vertical Scroller (New - Light Theme) */}
        <VerticalScroller />
        
        {/* Original Pricing */}
        <PricingSection />
        
        {/* Payment Ecosystem (New) */}
        <PaymentEcosystem />
      </main>

      <Footer />
    </div>
  );
}