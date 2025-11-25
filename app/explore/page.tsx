"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { 
  ChevronDown, 
  Check, 
  Menu, 
  X, 
  ArrowRight, 
  Globe, 
  Lock, 
  ShoppingBag, 
  MessageCircle, 
  BarChart3 
} from "lucide-react";

// --- COMPONENTS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <Link href="/">
              <Image 
                src="https://framerusercontent.com/images/4CXYPd7p6Cp67HeP1q6EC5AZR0.png" 
                alt="Take App Logo" 
                width={117} 
                height={28} 
                className="h-7 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6 text-[15px] font-medium text-[#474747]">
              <div className="group relative cursor-pointer flex items-center gap-1 hover:text-blue-500 transition">
                Products <ChevronDown size={14} />
              </div>
              <div className="group relative cursor-pointer flex items-center gap-1 hover:text-blue-500 transition">
                Industry <ChevronDown size={14} />
              </div>
              <Link href="#pricing" className="hover:text-blue-500 transition">Pricing</Link>
              <Link href="/changelog" className="hover:text-blue-500 transition">Changelog</Link>
              <div className="group relative cursor-pointer flex items-center gap-1 hover:text-blue-500 transition">
                Resource <ChevronDown size={14} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="https://take.app/signin" className="text-[14px] font-medium text-[#242930] hover:text-blue-500">
                Log in
              </Link>
              <Link href="https://take.app/signup" className="bg-[#181c1f] text-white text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-black transition shadow-lg shadow-gray-200">
                Start free
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-4">
          <div className="flex flex-col space-y-4 font-medium text-[#474747]">
            <Link href="#" className="block py-2">Products</Link>
            <Link href="#" className="block py-2">Industry</Link>
            <Link href="#pricing" className="block py-2">Pricing</Link>
            <Link href="#" className="block py-2">Resources</Link>
            <div className="pt-4 flex flex-col gap-3">
              <Link href="https://take.app/signin" className="w-full text-center py-3 border rounded-lg">Log in</Link>
              <Link href="https://take.app/signup" className="w-full text-center py-3 bg-[#181c1f] text-white rounded-lg">Start free</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-white via-[#f6f9ff] to-[#edf3ff]">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Official Partner Badge */}
        <div className="relative mb-8">
          <div className="flex items-center gap-2 bg-white/50 border border-gray-200 rounded-full px-4 py-1">
             <Image 
                src="https://framerusercontent.com/images/NBem7yZtFuHaMOV4HXqEM26fmNw.png" 
                width={114} height={27} alt="Meta" className="h-6 w-auto" 
             />
             <span className="text-xs font-bold text-[#00d66b]">Official Partner</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#050505] mb-6">
          Create Ecommerce<br /> for WhatsApp
        </h1>
        
        <p className="text-lg md:text-xl text-[#707c8c] max-w-2xl mb-10 leading-relaxed">
          Simplify WhatsApp ordering. <br className="hidden md:block"/>
          Boost sales with better customer service.
        </p>

        <Link href="https://take.app/signup" className="bg-[#050505] text-white text-lg font-medium px-8 py-4 rounded-xl hover:scale-105 transition transform shadow-xl shadow-gray-300">
          Start for free
        </Link>

        {/* Hero Visual Mockup Cluster */}
        <div className="mt-20 relative w-full max-w-4xl">
            {/* This represents the cluster of floating UI elements in the hero */}
            <div className="relative z-10">
               <Image 
                  src="https://framerusercontent.com/images/1k5wqJ89zEgaEyF1e7qDCR8E9b8.png"
                  width={1004} height={812} 
                  alt="Dashboard UI"
                  className="w-full h-auto drop-shadow-2xl"
                  priority
               />
            </div>
            
            {/* Floating Elements (Simulated) */}
            <div className="absolute -left-12 top-1/4 bg-white p-3 rounded-2xl shadow-lg hidden md:flex items-center gap-3 animate-bounce duration-[3000ms]">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <MessageCircle size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-bold">New Order</p>
                    <p className="text-[10px] text-gray-500">via WhatsApp</p>
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};

const FeatureSection1 = () => {
  return (
    <section className="py-24 bg-[#fbfbfc]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simplify WhatsApp Ordering</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Left Card */}
          <div className="md:col-span-7 bg-gradient-to-b from-[#edf3ff] to-[#d1e0ff] rounded-[32px] p-8 md:p-12 flex flex-col justify-between min-h-[400px] md:min-h-[500px] overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">WhatsApp Order Form</h3>
              <p className="text-[#707c8c] text-lg mb-6 max-w-md">
                Customers independently place orders through WhatsApp, specifying their choices and scheduling, which minimizes repetitive inquiries.
              </p>
              <Link href="/features/whatsapp" className="text-[#242930] font-medium hover:text-blue-600 underline decoration-blue-400 underline-offset-4">
                Learn more
              </Link>
            </div>
            <div className="absolute bottom-0 right-0 w-3/4 translate-y-10 translate-x-10 transition group-hover:translate-y-5">
                <Image src="https://framerusercontent.com/images/3IgOMG4Hm2uIHmRuYD3MVw1VJNk.png" width={585} height={747} alt="Phone" className="w-full h-auto" />
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Top Card */}
            <div className="bg-gradient-to-b from-[#edf3ff] to-[#d1e0ff] rounded-[32px] p-8 flex-1 relative overflow-hidden">
                <h3 className="text-xl font-bold mb-2">Local Payment Methods</h3>
                <p className="text-[#707c8c] mb-4 text-sm">Accept QR payments and over 70 local methods.</p>
                <div className="flex gap-2 mt-4">
                   {/* Simplified Payment Icons simulation */}
                   <div className="h-8 w-12 bg-white rounded shadow-sm"></div>
                   <div className="h-8 w-12 bg-white rounded shadow-sm"></div>
                   <div className="h-8 w-12 bg-white rounded shadow-sm"></div>
                </div>
            </div>

            {/* Bottom Card */}
            <div className="bg-gradient-to-b from-[#edf3ff] to-[#d1e0ff] rounded-[32px] p-8 flex-1">
                <h3 className="text-xl font-bold mb-6">Flexible Ordering</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"><ShoppingBag size={16}/> Ecommerce</div>
                    <div className="bg-white/50 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"><BarChart3 size={16}/> Subscriptions</div>
                    <div className="bg-white/50 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"><Lock size={16}/> Digital</div>
                    <div className="bg-white/50 p-3 rounded-xl flex items-center gap-2 text-sm font-medium"><MessageCircle size={16}/> Booking</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const APISection = () => {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">WhatsApp Business API</h2>
            <p className="text-xl text-[#707c8c]">Boost customer engagement with automated, efficient messaging.</p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Card 1 */}
             <div className="bg-gradient-to-b from-[#effaed] to-[#dbf7d7] rounded-[32px] p-8 h-[400px] flex flex-col items-center text-center relative overflow-hidden">
                <h3 className="text-2xl font-bold mb-3">Broadcast Message</h3>
                <p className="text-[#707c8c] text-sm">Reach all customers at once without risking a ban.</p>
                <div className="absolute bottom-0 w-full left-0 flex justify-center">
                    <Image src="https://framerusercontent.com/images/1HfKm4gdCZRpnldDtfz5l5FkQE.png" width={799} height={161} alt="Broadcast" className="w-[120%]" />
                </div>
             </div>
  
             {/* Card 2 */}
             <div className="bg-gradient-to-b from-[#effaed] to-[#dbf7d7] rounded-[32px] p-8 h-[400px] flex flex-col items-center text-center relative overflow-hidden">
                <h3 className="text-2xl font-bold mb-3">Shared Team Inbox</h3>
                <p className="text-[#707c8c] text-sm">View and reply to all customer messages in one place.</p>
                <div className="absolute bottom-8 w-3/4 bg-white rounded-xl shadow-lg p-4 text-left">
                    <div className="flex gap-2 items-center mb-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        <div className="h-2 w-20 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded mb-1"></div>
                    <div className="h-2 w-2/3 bg-gray-50 rounded"></div>
                </div>
             </div>
  
             {/* Card 3 */}
             <div className="bg-gradient-to-b from-[#effaed] to-[#dbf7d7] rounded-[32px] p-8 h-[400px] flex flex-col items-center text-center relative overflow-hidden">
                <h3 className="text-2xl font-bold mb-3">WhatsApp Chatbot</h3>
                <p className="text-[#707c8c] text-sm">Automated flows for Welcome messages and Autoreplies.</p>
                <div className="mt-8 flex gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm text-xs font-bold">Workflow</div>
                    <div className="bg-white p-3 rounded-lg shadow-sm text-xs font-bold">Autoreply</div>
                </div>
             </div>
          </div>
        </div>
      </section>
    );
};

const IndustrySection = () => {
    const industries = [
        { name: "Restaurants", img: "https://framerusercontent.com/images/MqIS5hMHiCOCwBNsrQYriSsVIBQ.png" },
        { name: "Ecommerce", img: "https://framerusercontent.com/images/OEnM1i4gz6XWrjtMbjAW4lcefqU.png" },
        { name: "Rental", img: "https://framerusercontent.com/images/BvGNpnGqAspvPV1GJKW7BLCPWqY.png" },
        { name: "Home-Based Food", img: "https://framerusercontent.com/images/hIcbJ2KzoLClEw4mGV8rN0eGA.png" },
        { name: "Grocer & Butcher", img: "https://framerusercontent.com/images/tPAH5YosyyDnNz1YFMPUHVevdDo.png" },
        { name: "And more...", img: "", isText: true },
    ];

    return (
        <section className="py-24 bg-[#fbfbfc]">
             <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Local Business</h2>
                    <p className="text-xl text-[#707c8c]">From restaurants and retail to rentals, we help local businesses grow online.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {industries.map((ind, idx) => (
                        ind.isText ? (
                            <Link key={idx} href="/industry" className="bg-[#eef0f4] rounded-3xl flex items-center justify-between p-8 group hover:bg-gray-200 transition">
                                <span className="text-xl font-semibold text-[#242930]">{ind.name}</span>
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <ArrowRight size={20} />
                                </div>
                            </Link>
                        ) : (
                            <Link key={idx} href={`/industry/${ind.name.toLowerCase()}`} className="relative h-64 rounded-3xl overflow-hidden group shadow-sm hover:shadow-md transition">
                                <Image src={ind.img} alt={ind.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="text-white text-xl font-bold">{ind.name}</span>
                                </div>
                            </Link>
                        )
                    ))}
                </div>
             </div>
        </section>
    )
}

const AllInOneSection = () => {
    return (
        <section className="py-24 bg-white">
             <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Create Your Website in Minutes</h2>
                </div>
                
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Left Card */}
                    <div className="md:col-span-2 bg-gradient-to-b from-[#f5edff] to-[#e9d6ff] rounded-[32px] p-8 min-h-[500px] relative overflow-hidden">
                        <h3 className="text-2xl font-bold mb-2">Beautiful product catalogs</h3>
                        <div className="absolute bottom-0 left-0 w-full h-3/4">
                            {/* Mockup of catalog scrolling */}
                            <Image src="https://framerusercontent.com/images/YB3nZPrM1znFbb3766OFtUukSU.png" width={539} height={807} alt="Catalog" className="absolute left-8 top-8 w-[200px] shadow-2xl rounded-xl" />
                            <Image src="https://framerusercontent.com/images/azyA8E6XXtHJpYLFxhMw276FDeQ.png" width={539} height={744} alt="Catalog" className="absolute left-[240px] top-20 w-[200px] shadow-2xl rounded-xl" />
                        </div>
                    </div>

                    {/* Right Column Stack */}
                    <div className="flex flex-col gap-6">
                        {/* Domain Card */}
                        <div className="bg-gradient-to-b from-[#f5edff] to-[#e9d6ff] rounded-[32px] p-8 flex-1 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-bold mb-4">Custom domain</h3>
                            <div className="bg-white rounded-full py-2 px-6 flex items-center gap-2 shadow-sm">
                                <Lock size={14} className="text-gray-400"/>
                                <span className="font-mono text-sm text-gray-600">https://yourstore.com</span>
                            </div>
                        </div>

                         {/* SEO Card */}
                         <div className="bg-gradient-to-b from-[#f5edff] to-[#e9d6ff] rounded-[32px] p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-4 z-10 relative">SEO Optimized</h3>
                            <div className="absolute bottom-0 w-full opacity-50">
                                <Image src="https://framerusercontent.com/images/6MyqvWcUVruDcZLIIbYr7Ws1mZU.png" width={1778} height={611} alt="SEO Graph" />
                            </div>
                        </div>
                    </div>

                     {/* Bottom Row */}
                     <div className="bg-[#f2f3f5] rounded-[32px] p-8 h-80 flex flex-col justify-center">
                        <h3 className="text-xl font-bold">CRM</h3>
                        <p className="text-gray-500 text-sm">Boost sales with better customer management</p>
                     </div>
                     <div className="bg-[#f2f3f5] rounded-[32px] p-8 h-80 flex flex-col justify-center">
                        <h3 className="text-xl font-bold">Inventory</h3>
                        <p className="text-gray-500 text-sm">Manage inventory online and prevent overselling</p>
                     </div>
                     <div className="bg-[#f2f3f5] rounded-[32px] p-8 h-80 flex flex-col justify-center">
                        <h3 className="text-xl font-bold">Analytics</h3>
                        <p className="text-gray-500 text-sm">Visitors and business insights</p>
                     </div>
                </div>
             </div>
        </section>
    )
}

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(true);

    return (
        <section id="pricing" className="py-24 bg-gradient-to-b from-[#fbfbfc] to-[#f0f0f2]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-8">Pricing</h2>
                    <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <button 
                            onClick={() => setIsYearly(true)}
                            className={`px-6 py-2 text-sm font-medium rounded-lg transition ${isYearly ? 'bg-[#242930] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Pay yearly <span className="font-normal opacity-80">(Save 25%)</span>
                        </button>
                        <button 
                            onClick={() => setIsYearly(false)}
                            className={`px-6 py-2 text-sm font-medium rounded-lg transition ${!isYearly ? 'bg-[#242930] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Pay monthly
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#242930]">Basic</h3>
                            <p className="text-gray-500 text-sm">For hobbyists</p>
                        </div>
                        <div className="text-4xl font-bold mb-8">$0</div>
                        <div className="flex-1 space-y-4 mb-8">
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-green-500"/> Unlimited WhatsApp orders</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-green-500"/> No commissions</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-green-500"/> Manual payments</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-green-500"/> Upload up to 20 images</div>
                        </div>
                        <Link href="https://take.app/signup" className="w-full block text-center py-3 bg-[#242930] text-white rounded-xl font-medium hover:bg-black transition">Get started</Link>
                    </div>

                    {/* Premium Plan */}
                    <div className="bg-white rounded-3xl p-8 border-2 border-blue-100 shadow-lg relative overflow-hidden flex flex-col transform md:-translate-y-4">
                         <div className="absolute top-0 right-0 bg-blue-50 px-4 py-1 rounded-bl-xl text-blue-600 text-xs font-bold">POPULAR</div>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#242930]">Premium</h3>
                            <p className="text-gray-500 text-sm">For solo entrepreneurs</p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-[#1b91f2]">${isYearly ? '14' : '19'}</span>
                                <span className="text-gray-400 text-sm">/ month</span>
                            </div>
                            {isYearly && <div className="text-xs text-blue-500 font-medium mt-2 bg-blue-50 inline-block px-2 py-1 rounded">$171 / year</div>}
                        </div>
                        <div className="flex-1 space-y-4 mb-8">
                             <p className="text-sm font-bold text-gray-900">Everything in Basic, plus:</p>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-blue-500"/> Unlimited images</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-blue-500"/> Custom domain</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-blue-500"/> Card payments (Stripe)</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-blue-500"/> Analytics & Pixel</div>
                        </div>
                        <Link href="https://take.app/signup" className="w-full block text-center py-3 bg-[#1b91f2] text-white rounded-xl font-medium hover:bg-blue-600 transition">Get started</Link>
                        <p className="text-center text-xs text-gray-400 mt-3">Cancel any time</p>
                    </div>

                     {/* Business Plan */}
                     <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#242930]">Business</h3>
                            <p className="text-gray-500 text-sm">For teams</p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-[#8c34eb]">${isYearly ? '38' : '50'}</span>
                                <span className="text-gray-400 text-sm">/ month</span>
                            </div>
                             {isYearly && <div className="text-xs text-purple-500 font-medium mt-2 bg-purple-50 inline-block px-2 py-1 rounded">$450 / year</div>}
                        </div>
                        <div className="flex-1 space-y-4 mb-8">
                             <p className="text-sm font-bold text-gray-900">Everything in Premium, plus:</p>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-purple-500"/> Take App logo removal</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-purple-500"/> WhatsApp Inbox & Broadcast</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-purple-500"/> Multiple stores & staff</div>
                             <div className="text-sm text-gray-600 flex gap-2"><Check size={16} className="text-purple-500"/> Wholesale pricing</div>
                        </div>
                        <Link href="https://take.app/signup" className="w-full block text-center py-3 bg-[#8c34eb] text-white rounded-xl font-medium hover:bg-purple-600 transition">Get started</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

const Footer = () => {
    return (
        <footer className="bg-[#242930] text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-20 border-b border-gray-700 pb-12">
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[#00d66b] font-bold">
                            <span className="w-2 h-2 bg-[#00d66b] rounded-full"></span> Official Partner
                        </div>
                        <h2 className="text-4xl font-bold">WhatsApp-first and <br/> <span className="text-white/50">Commissions-free</span> Ecommerce</h2>
                     </div>
                     <div className="mt-8 md:mt-0">
                        <Link href="https://take.app/signup" className="bg-[#36383b] border border-[#4e4f52] px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#4e4f52] transition">
                            Start free
                        </Link>
                     </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Product</h3>
                        <Link href="#pricing" className="text-gray-300 hover:text-white">Pricing</Link>
                        <Link href="/changelog" className="text-gray-300 hover:text-white">Changelog</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Resources</h3>
                        <Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link>
                        <Link href="/course" className="text-gray-300 hover:text-white">Learning course</Link>
                        <Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link>
                    </div>
                     <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Features</h3>
                        <Link href="/features/whatsapp" className="text-gray-300 hover:text-white">WhatsApp Order</Link>
                        <Link href="/features/payments" className="text-gray-300 hover:text-white">Payments</Link>
                        <Link href="/features/chatbot" className="text-gray-300 hover:text-white">Chatbot</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Download</h3>
                        <Link href="#" className="text-gray-300 hover:text-white">App Store</Link>
                        <Link href="#" className="text-gray-300 hover:text-white">Google Play</Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-8 gap-4">
                    <div className="text-gray-500 text-sm">© 2025 Take App Pte Ltd</div>
                    <div className="flex items-center gap-2 bg-[#2f3338] px-3 py-2 rounded-lg text-sm text-gray-300">
                        <Globe size={16} />
                        <span>English</span>
                        <ChevronDown size={14} />
                    </div>
                </div>
            </div>
        </footer>
    )
}

// --- MAIN PAGE COMPONENT ---

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeatureSection1 />
      <APISection />
      <IndustrySection />
      <AllInOneSection />
      <PricingSection />
      <Footer />
    </main>
  );
}