'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { 
  Home, Car, MapPin, Search, Menu, Zap, Shield, 
  Check, Smartphone, User, Heart, ArrowRight 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 3D Background Elements ---
function FloatingGeometries() {
  const ref = useRef<any>();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if(ref.current) {
        ref.current.rotation.x = Math.sin(t / 4);
        ref.current.rotation.y = Math.sin(t / 4);
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[1, 32, 32]} position={[-3, 2, -5]}>
          <MeshDistortMaterial color="#FF5A1F" speed={2} distort={0.4} roughness={0.2} />
        </Sphere>
        <Sphere args={[0.5, 32, 32]} position={[4, -2, -6]}>
           <MeshDistortMaterial color="#10B981" speed={2} distort={0.5} transparent opacity={0.6} />
        </Sphere>
      </Float>
    </group>
  );
}

// --- Components ---

const Navbar = () => (
  <nav className="fixed w-full z-50 top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="font-display font-bold text-xl tracking-tight text-gray-900 dark:text-white">Havanah</span>
        </div>
        <div className="hidden md:flex space-x-8">
          {['Real Estate', 'Vehicles', 'Pricing', 'About'].map((item) => (
            <a key={item} href="#" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium">
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
             <Menu size={20} />
          </button>
          <a className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105 shadow-lg shadow-primary/20" href="#">
            Get Started
          </a>
        </div>
      </div>
    </div>
  </nav>
);

// --- The Complex Hero Animation Section ---
const HeroScrollSection = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // 1. Text Fade Out
    const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const textScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
    const textY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

    // 2. Phone Movement (Zoom Out effect)
    // Starts large (2.5 scale) and lower down (y: 40%), moves to center and normal scale
    const phoneScale = useTransform(scrollYProgress, [0, 0.35], [2.2, 1]); 
    const phoneY = useTransform(scrollYProgress, [0, 0.35], ["40%", "0%"]); 

    // 3. Modals Explosion (Appear from behind phone)
    // They start at 0,0 (center) and move outward
    const modalProgress = useTransform(scrollYProgress, [0.35, 0.6], [0, 1]);
    const modalOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);

    // 4. Store Buttons & Background Text Fade In
    const footerOpacity = useTransform(scrollYProgress, [0.6, 0.75], [0, 1]);
    const footerY = useTransform(scrollYProgress, [0.6, 0.75], [100, 0]);

    // Modal Data
    const modals = [
        { title: "Toyota Hilux", price: "D1.2M", icon: <Car size={16}/>, color: "bg-blue-100 text-blue-600", x: -350, y: -200, delay: 0 },
        { title: "Senegambia Apt", price: "D45k/mo", icon: <Home size={16}/>, color: "bg-green-100 text-green-600", x: 350, y: -200, delay: 0.1 },
        { title: "Brusubi Land", price: "D800k", icon: <MapPin size={16}/>, color: "bg-orange-100 text-orange-600", x: -400, y: 0, delay: 0.2 },
        { title: "Range Rover", price: "D3.5M", icon: <Car size={16}/>, color: "bg-purple-100 text-purple-600", x: 400, y: 0, delay: 0.3 },
        { title: "Bijilo Villa", price: "D12M", icon: <Home size={16}/>, color: "bg-teal-100 text-teal-600", x: -350, y: 250, delay: 0.4 },
        { title: "Commercial Office", price: "D150k/yr", icon: <Briefcase size={16}/>, color: "bg-pink-100 text-pink-600", x: 350, y: 250, delay: 0.5 },
        { title: "Kerr Serign Plot", price: "D2.1M", icon: <MapPin size={16}/>, color: "bg-yellow-100 text-yellow-600", x: 0, y: -320, delay: 0.6 },
        { title: "Taxi Fleet", price: "D500k", icon: <Car size={16}/>, color: "bg-red-100 text-red-600", x: 0, y: 350, delay: 0.7 },
    ];

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-gray-50 dark:bg-black">
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
                
                {/* 3D Canvas Background */}
                <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                    <Canvas>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <Environment preset="city" />
                        <FloatingGeometries />
                    </Canvas>
                </div>

                {/* Hero Text (Fades out on scroll) */}
                <motion.div 
                    style={{ opacity: textOpacity, scale: textScale, y: textY }}
                    className="absolute top-32 z-20 text-center px-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Havanah Mobile App v2.0 is live</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 max-w-4xl mx-auto leading-tight">
                        Find Your Dream Car or Home Today
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Reimagine how you rent, buy, and sell in The Gambia. A unified marketplace connecting you to premium vehicles and properties.
                    </p>
                </motion.div>

                {/* The Phone & Exploding Modals Wrapper */}
                <div className="relative z-30 w-full max-w-[1200px] h-full flex items-center justify-center">
                    
                    {/* Floating Modals */}
                    {modals.map((item, i) => (
                        <FloatingModal 
                            key={i} 
                            item={item} 
                            progress={modalProgress} 
                            opacity={modalOpacity} 
                        />
                    ))}

                    {/* The Phone */}
                    <motion.div 
                        style={{ scale: phoneScale, y: phoneY }}
                        className="relative z-40 w-[300px] h-[600px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>
                        {/* Internal App UI */}
                        <div className="w-full h-full bg-white dark:bg-gray-900 overflow-hidden relative">
                             {/* Mock App Header */}
                             <div className="pt-12 px-5 pb-4 flex justify-between items-center bg-white dark:bg-gray-900">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                    <div>
                                        <div className="h-2 w-20 bg-gray-200 rounded mb-1"></div>
                                        <div className="h-3 w-16 bg-gray-300 rounded font-bold"></div>
                                    </div>
                                </div>
                             </div>
                             {/* Mock Search */}
                             <div className="px-5 mb-6">
                                 <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl w-full flex items-center px-3">
                                     <Search size={16} className="text-gray-400 mr-2"/>
                                     <span className="text-xs text-gray-400">Search homes or cars...</span>
                                 </div>
                             </div>
                             {/* Mock Content */}
                             <div className="px-5 space-y-4">
                                <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl relative overflow-hidden group">
                                    <img src="https://images.unsplash.com/photo-1600596542815-9ad4dc7553e3?auto=format&fit=crop&q=80&w=500" className="object-cover w-full h-full opacity-80" alt="Home"/>
                                    <div className="absolute bottom-2 left-3">
                                        <div className="bg-white/90 px-2 py-1 rounded text-[10px] font-bold">D12M</div>
                                    </div>
                                </div>
                                <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl relative overflow-hidden">
                                     <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=500" className="object-cover w-full h-full opacity-80" alt="Car"/>
                                     <div className="absolute bottom-2 left-3">
                                        <div className="bg-primary text-white px-2 py-1 rounded text-[10px] font-bold">D800/day</div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </motion.div>

                </div>

                {/* Footer Elements (App Stores & Background Text) */}
                <motion.div 
                    style={{ opacity: footerOpacity, y: footerY }}
                    className="absolute bottom-10 z-50 flex flex-col items-center gap-8 w-full"
                >
                    <div className="flex gap-4">
                        <button className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                            <i className="fab fa-apple text-2xl"></i>
                            <div className="text-left">
                                <div className="text-[10px] uppercase">Download on the</div>
                                <div className="font-bold text-sm leading-none">App Store</div>
                            </div>
                        </button>
                        <button className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                            <i className="fab fa-google-play text-xl"></i>
                            <div className="text-left">
                                <div className="text-[10px] uppercase">Get it on</div>
                                <div className="font-bold text-sm leading-none">Google Play</div>
                            </div>
                        </button>
                    </div>

                    <div className="absolute bottom-20 -z-10 select-none">
                        <h2 className="text-[12vw] font-black leading-none tracking-tighter text-gray-200 dark:text-gray-800/50 opacity-50 whitespace-nowrap">
                            HAVANAH 2.0
                        </h2>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

// Sub-component for individual flying cards
const FloatingModal = ({ item, progress, opacity }: { item: any, progress: MotionValue<number>, opacity: MotionValue<number> }) => {
    const x = useTransform(progress, [0, 1], [0, item.x]);
    const y = useTransform(progress, [0, 1], [0, item.y]);
    
    return (
        <motion.div 
            style={{ x, y, opacity }}
            className="absolute z-20 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 w-48"
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                {item.icon}
            </div>
            <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Just Listed</p>
                <p className="font-bold text-xs dark:text-white">{item.title}</p>
                <p className="text-primary font-bold text-xs">{item.price}</p>
            </div>
        </motion.div>
    );
};


// --- Section: Infinite Marquee ---
const InfiniteScrollMarquee = () => {
    return (
        <section className="py-12 bg-white dark:bg-surface border-y border-gray-100 dark:border-gray-800 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-10"/>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-10"/>
            
            <motion.div 
                className="flex gap-16 w-max"
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
            >
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-16 items-center">
                        <span className="text-6xl font-black text-gray-200 dark:text-gray-800 uppercase tracking-tighter">Brusubi</span>
                        <div className="w-4 h-4 rounded-full bg-primary"/>
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 uppercase tracking-tighter">Senegambia</span>
                        <div className="w-4 h-4 rounded-full bg-green-500"/>
                        <span className="text-6xl font-black text-gray-200 dark:text-gray-800 uppercase tracking-tighter">Toyota</span>
                        <div className="w-4 h-4 rounded-full bg-primary"/>
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 uppercase tracking-tighter">Bijilo</span>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}

// --- Section: Marketplace Grid ---
const MarketplaceSection = () => (
    <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Explore Our Marketplace</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">From coastal villas to city sedans, find exactly what you need.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Residential", sub: "Apartments & Villas", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=500", icon: <Home/> },
                    { title: "Vehicles", sub: "Cars & Trucks", img: "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=500", icon: <Car/> },
                    { title: "Land", sub: "Plots & Farmland", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=500", icon: <MapPin/> },
                    { title: "Commercial", sub: "Office & Retail", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=500", icon: <Briefcase/> }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="group relative overflow-hidden rounded-3xl h-80 bg-gray-100 cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                        <img alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={item.img} />
                        <div className="absolute bottom-0 left-0 p-6 z-20">
                            <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center mb-3 text-white">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-gray-300 text-sm">{item.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

// --- Section: Vertical Scroller (Market Activity) ---
const VerticalScroller = () => {
    const list1 = [
        { title: "Brufut Villa", price: "D7.5M", type: "Home", color: "bg-blue-100 dark:bg-blue-900" },
        { title: "Lexus 570", price: "D3.2M", type: "Car", color: "bg-gray-200 dark:bg-gray-800" },
        { title: "Bijilo Land", price: "D450k", type: "Land", color: "bg-green-100 dark:bg-green-900" },
        { title: "Toyota Corolla", price: "D300k", type: "Car", color: "bg-red-100 dark:bg-red-900" },
    ];
    
    return (
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden h-[800px] flex items-center">
            <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
                <div className="flex flex-col justify-center">
                    <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4">Live Market Activity</span>
                    <h2 className="text-5xl md:text-6xl font-black mb-8">What's Trending in <br/><span className="text-primary">Real-time.</span></h2>
                    <p className="text-gray-400 mb-8 max-w-md">Our algorithm matches buyers and sellers across The Gambia instantly. Watch transactions happen.</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2 border border-gray-700">
                             <Zap className="text-yellow-400" size={18}/> <span className="text-xs font-bold">128 Sales Today</span>
                        </div>
                    </div>
                </div>

                <div className="h-[600px] relative flex gap-6 rotate-[-5deg] scale-100 opacity-80">
                     <div className="flex flex-col gap-6 w-64 overflow-hidden relative">
                         <div className="absolute top-0 z-20 w-full h-32 bg-gradient-to-b from-gray-900 to-transparent"/>
                         <motion.div 
                            className="flex flex-col gap-6"
                            animate={{ y: [0, -600] }}
                            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                         >
                            {[...list1, ...list1, ...list1].map((item, idx) => (
                                <div key={idx} className="bg-black/50 p-4 rounded-2xl border border-gray-800 hover:border-primary transition-colors">
                                    <div className={`h-24 ${item.color} rounded-xl mb-3 w-full opacity-50`}/>
                                    <h4 className="font-bold">{item.title}</h4>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm text-gray-400">{item.type}</span>
                                        <span className="text-primary font-bold text-sm">{item.price}</span>
                                    </div>
                                </div>
                            ))}
                         </motion.div>
                         <div className="absolute bottom-0 z-20 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"/>
                     </div>
                </div>
            </div>
        </section>
    );
}

// --- Section: Payment Ecosystem ---
const PaymentEcosystem = () => {
    return (
        <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
             {/* Abstract Decorators */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"/>

             <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
                 <div className="flex-1">
                     <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-6 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full">
                         <Shield size={14}/> Secure Local Transactions
                     </div>
                     <h2 className="text-5xl font-black leading-tight mb-8 text-gray-900 dark:text-white">
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
                                className="h-16 px-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl flex items-center justify-center font-bold text-gray-400 hover:text-primary transition-all cursor-pointer"
                             >
                                 {pay}
                             </motion.div>
                        ))}
                     </div>
                 </div>

                 <div className="flex-1 relative h-[400px] w-full perspective-1000">
                      {/* Floating credit card */}
                      <motion.div 
                        initial={{ rotateY: 20, rotateX: 20 }}
                        animate={{ rotateY: [20, -20, 20], rotateX: [10, 30, 10], y: [-10, 10, -10] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 m-auto w-full max-w-md h-64 bg-gradient-to-br from-gray-900 to-black rounded-[30px] shadow-2xl p-8 flex flex-col justify-between text-white border border-gray-800"
                      >
                           <div className="flex justify-between items-start">
                               <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <div className="w-8 h-8 bg-primary rounded-full opacity-80"/>
                               </div>
                               <Zap className="text-yellow-400 opacity-80" size={24}/>
                           </div>
                           
                           <div>
                                <div className="text-2xl font-mono tracking-widest mb-2 opacity-80">•••• •••• 4529</div>
                                <div className="flex justify-between items-end mt-4">
                                    <div>
                                        <p className="text-[10px] uppercase opacity-60">Card Holder</p>
                                        <p className="text-sm font-bold tracking-wider">ALIEU S.</p>
                                    </div>
                                    <div className="font-bold italic text-xl">VISA</div>
                                </div>
                           </div>
                      </motion.div>
                 </div>
             </div>
        </section>
    )
}

const Footer = () => (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                <div className="col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">H</div>
                        <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Havanah</span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-xs mb-6">
                        The #1 Marketplace in Gambia for trusted Real Estate and Vehicle transactions.
                    </p>
                    <div className="flex gap-4">
                         {[1,2,3,4].map((i) => (
                             <div key={i} className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors cursor-pointer">
                                 <Heart size={14} />
                             </div>
                         ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Marketplace</h4>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-primary">Homes for Sale</a></li>
                        <li><a href="#" className="hover:text-primary">Cars</a></li>
                        <li><a href="#" className="hover:text-primary">Land</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-primary">About Us</a></li>
                        <li><a href="#" className="hover:text-primary">Careers</a></li>
                        <li><a href="#" className="hover:text-primary">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="#" className="hover:text-primary">Help Center</a></li>
                        <li><a href="#" className="hover:text-primary">Safety Tips</a></li>
                        <li><a href="#" className="hover:text-primary">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">© 2024 Havanah Gambia. All rights reserved.</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-500">Systems Operational</span>
                </div>
            </div>
        </div>
    </footer>
);

// --- Dummy Icon for imports ---
const Briefcase = ({size, className}: {size?: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);


export default function Page() {
  return (
    <main className="min-h-screen font-body selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />
      <HeroScrollSection />
      <InfiniteScrollMarquee />
      <MarketplaceSection />
      <VerticalScroller />
      <PaymentEcosystem />
      <Footer />
    </main>
  );
}