'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdCheck, 
  MdStar, 
  MdBusiness, 
  MdRocketLaunch, 
  MdArrowBack, 
  MdLock, 
  MdAutoAwesome,
  MdDataUsage,
  MdDescription,
  MdCompareArrows
} from 'react-icons/md';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';

// --- Configuration ---

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
  description: string;
}

const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard Agent',
    price: 199,
    period: 'mo',
    icon: <MdBusiness />,
    color: 'text-gray-600 bg-gray-100',
    description: "Perfect for new agents starting their journey.",
    features: [
      'Up to 5 Active Listings',
      'Basic Profile Page',
      'Standard Support',
      'Direct Messaging',
      'Listing Analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Agent',
    price: 799,
    period: 'mo',
    icon: <MdStar />,
    color: 'text-emerald-600 bg-emerald-100',
    highlight: true,
    description: "For growing agencies needing more visibility.",
    features: [
      'Unlimited Listings',
      'Verified Agent Badge',
      'Priority Search Placement',
      'Advanced Analytics Dashboard',
      'Priority Support',
      'Custom Branding'
    ]
  },
  {
    id: 'pro_plus',
    name: 'Pro Plus AI',
    price: 1999,
    period: 'mo',
    icon: <MdRocketLaunch />,
    color: 'text-purple-600 bg-purple-100',
    description: "Full suite of AI tools & user data access.",
    features: [
      'Everything in Pro',
      'Access to User Data & Trends',
      'User Outreach Portals',
      'Automated Proposal Generation',
      'Competitor Stats Comparison',
      'Havanah Agentic AI Tools'
    ]
  }
];

export default function UpgradePage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const db = getFirestoreInstance();

  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Select Plan
  const selectPlan = (plan: Plan) => {
    if (!user) {
      toast.error("Login Required", "Please log in to upgrade your account.");
      router.push('/auth/login?redirect=/upgrade');
      return;
    }
    setSelectedPlan(plan);
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Process Payment (Mock)
  const handlePayment = async () => {
    if (!selectedPlan || !user?.id) return;
    
    setIsLoading(true);
    // Simulate API call delay
    const toastId = toast.loading("Processing", "Securely processing payment...");

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Update User Profile in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        role: 'agent',
        agentPlan: selectedPlan.id,
        planStatus: 'active',
        planUpdatedAt: serverTimestamp()
      });

      toast.remove(toastId);
      toast.success("Payment Successful", "Welcome to Havanah Premium!");
      setStep('success');

    } catch (error: any) {
      console.error(error);
      toast.remove(toastId);
      toast.error("Payment Failed", "Please check your card details.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Success View ---
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">
            <MdCheck />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Upgrade Complete!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            You are now subscribed to the <span className="font-bold text-emerald-600">{selectedPlan?.name}</span> plan.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
             <button 
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg"
                onClick={() => router.push('/agent/dashboard')}
             >
                Go to Agent Dashboard
             </button>
             {selectedPlan?.id === 'pro_plus' && (
               <button 
                  className="w-full py-4 bg-purple-50 text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-100 transition-all border border-purple-200 flex items-center justify-center gap-2"
                  onClick={() => router.push('/agent/ai-tools')}
               >
                  <MdAutoAwesome /> Access AI Tools
               </button>
             )}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Payment View ---
  if (step === 'payment') {
    return (
      <div className="flex flex-col items-center min-h-[80vh] p-6 max-w-6xl mx-auto">
        <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            className="w-full"
        >
          <button 
            className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
            onClick={() => setStep('plans')}
          >
            <MdArrowBack /> Choose a different plan
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
            {/* Order Summary */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <div>
                    <span className="text-2xl font-bold block">{selectedPlan?.name}</span>
                    <span className="text-sm text-gray-500">{selectedPlan?.description}</span>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600">D{selectedPlan?.price}</span>
                    <span className="text-xs text-gray-400 block">/month</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {selectedPlan?.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <MdCheck className="text-emerald-500 text-lg shrink-0 mt-0.5" /> 
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between font-extrabold text-xl pt-4 border-t-2 border-gray-100">
                <span>Total Due</span>
                <span>D{selectedPlan?.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Secure Checkout</h3>
              <p className="text-gray-500 mb-8">Complete your subscription to unlock features.</p>

              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-4 py-3 rounded-xl font-bold text-sm mb-8 border border-emerald-100">
                <MdLock /> 256-bit SSL Encrypted Payment
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cardholder Name</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="John Doe" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Card Number</label>
                    <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="0000 0000 0000 0000" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expiry Date</label>
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="MM/YY" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">CVV</label>
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="123" />
                    </div>
                 </div>
              </div>

              <button 
                className="w-full mt-8 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                    <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</span>
                ) : `Pay D${selectedPlan?.price.toLocaleString()}`}
              </button>
              
              <p className="text-xs text-gray-400 mt-6 text-center">
                Subscription auto-renews monthly. Cancel anytime from your dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Plans View (Default) ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50/50 pb-20">
      
      {/* Header */}
      <div className="w-full bg-white pt-28 pb-20 px-6 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Supercharge Your <span className="text-emerald-600">Business</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Access powerful AI tools, market data, and reach more customers with Havanah Premium.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-[2rem] p-8 flex flex-col items-center text-center transition-all duration-300
                ${plan.highlight 
                  ? 'border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105 z-10' 
                  : 'border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-2'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-1.5 rounded-full text-xs font-extrabold tracking-widest shadow-md uppercase">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm ${plan.color}`}>
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-6 px-4">{plan.description}</p>
              
              <div className="flex items-baseline justify-center mb-8">
                <span className="text-xl font-bold text-gray-400 mr-1">D</span>
                <span className="text-5xl font-extrabold text-gray-900">{plan.price.toLocaleString()}</span>
                <span className="text-gray-400 font-medium ml-1">/{plan.period}</span>
              </div>

              {/* AI Badge for Pro Plus */}
              {plan.id === 'pro_plus' && (
                  <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-lg text-xs font-bold mb-6 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30">
                      <MdAutoAwesome className="text-lg" /> Includes Agentic AI Tools
                  </div>
              )}

              <div className="w-full border-t border-gray-50 pt-8 mb-8 flex-1">
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature, i) => {
                    // Check for specific keywords to add icons
                    let icon = <MdCheck className="text-emerald-500 text-xl flex-shrink-0" />;
                    if (feature.includes('AI') || feature.includes('Automated')) icon = <MdAutoAwesome className="text-purple-500 text-xl flex-shrink-0" />;
                    if (feature.includes('Data') || feature.includes('Stats')) icon = <MdDataUsage className="text-blue-500 text-xl flex-shrink-0" />;
                    if (feature.includes('Proposals')) icon = <MdDescription className="text-orange-500 text-xl flex-shrink-0" />;
                    
                    return (
                        <li key={i} className="flex items-start gap-3 text-gray-600 text-sm font-medium">
                        {icon}
                        <span>{feature}</span>
                        </li>
                    );
                  })}
                </ul>
              </div>

              <button 
                onClick={() => selectPlan(plan)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-200 text-lg
                  ${plan.highlight 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/40' 
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-900 hover:text-white'}`}
              >
                {plan.price === 199 ? 'Start Standard' : 'Upgrade Now'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}