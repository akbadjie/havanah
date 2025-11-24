'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { 
  MdArrowBack, MdLocationOn, MdStar, MdBed, MdBathtub, MdSquareFoot, 
  MdSpeed, MdSettings, MdCalendarToday, MdMessage, MdVerified, MdCheckCircle, 
  MdCreditCard, MdAccountBalance, MdPerson, MdShare
} from 'react-icons/md';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';
import { getOrCreateConversation } from '@/lib/realtime-service';
import { getProfileById, UserProfile } from '@/lib/user-service';

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '16px' };

export default function ListingPage() {
  const params = useParams(); // Listing ID from URL
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const db = getFirestoreInstance();

  // Data State
  const [listing, setListing] = useState<any>(null);
  const [agent, setAgent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeImage, setActiveImage] = useState(0);
  const [viewMode, setViewMode] = useState<'details' | 'checkout'>('details');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  
  // Checkout Form State
  const [rentalDays, setRentalDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  // 1. Fetch Listing & Agent Data
  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return;
      try {
        // Fetch Listing
        const snap = await getDoc(doc(db, 'listings', params.id as string));
        if (snap.exists()) {
          const data = snap.data();
          setListing({ id: snap.id, ...data });

          // Fetch Agent Profile
          if (data.agentId) {
            const agentData = await getProfileById(data.agentId);
            setAgent(agentData);
          }
        } else {
          toast.error("Not Found", "Listing does not exist");
          router.push('/explore');
        }
      } catch (e) { 
        console.error(e);
        toast.error("Error", "Failed to load listing");
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [params?.id, db, router, toast]);

  // 2. Actions
  const handleMessageAgent = async () => {
    if (!user) { toast.error("Auth Required", "Please log in to message."); return router.push('/auth/login'); }
    if (!agent) return;

    try {
      const convId = await getOrCreateConversation(user.id, agent.uid, user.displayName || 'User', agent.displayName);
      router.push(`/messaging?id=${convId}`);
    } catch (e) {
      toast.error("Error", "Could not start chat.");
    }
  };

  const handleStartCheckout = () => {
    if (!user) { toast.error("Auth Required", "Please log in to book."); return router.push('/auth/login'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewMode('checkout');
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('processing');
    
    // Simulate Payment Delay
    setTimeout(async () => {
      try {
        // Record Transaction in Firestore
        await addDoc(collection(db, 'transactions'), {
            listingId: listing.id,
            buyerId: user!.id,
            sellerId: agent?.uid,
            amount: calculateTotal().total,
            status: 'completed',
            createdAt: serverTimestamp()
        });

        setCheckoutStep('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        setCheckoutStep('form');
        toast.error("Payment Failed", "Please try again.");
      }
    }, 2000);
  };

  const calculateTotal = () => {
    if (!listing) return { base: 0, tax: 0, fee: 0, total: 0 };
    const base = listing.price * (listing.category === 'rent' ? rentalDays : 1);
    const tax = base * 0.05; // 5% Tax
    const fee = base * 0.02; // 2% Platform Fee
    return { base, tax, fee, total: base + tax + fee };
  };

  if (loading || !listing) return <div className="min-h-screen flex items-center justify-center pt-[80px]">Loading...</div>;
  const totals = calculateTotal();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 min-h-screen bg-gray-50">
      
      {/* Top Navigation Bar for Page */}
      <div className="flex justify-between items-center mb-6">
        <button 
          className="flex items-center gap-2 text-gray-500 font-bold hover:text-emerald-600 transition-colors" 
          onClick={viewMode === 'checkout' ? () => setViewMode('details') : () => router.back()}
        >
          <MdArrowBack size={20} /> {viewMode === 'checkout' ? 'Back to Details' : 'Back'}
        </button>
        <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-emerald-600 bg-white rounded-full shadow-sm">
                <MdShare />
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: LISTING DETAILS */}
        {viewMode === 'details' ? (
          <motion.div 
            key="details" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12"
          >
            {/* LEFT COLUMN: Content */}
            <div>
              {/* Image Gallery */}
              <div className="mb-4 w-full aspect-[16/10] rounded-3xl overflow-hidden bg-gray-200 shadow-sm relative group">
                <img src={listing.images[activeImage]} alt={listing.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-800">
                    {listing.category}
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 mb-8 no-scrollbar">
                {listing.images.map((img: string, i: number) => (
                  <div key={i} className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${i === activeImage ? 'border-emerald-500 opacity-100 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`} onClick={() => setActiveImage(i)}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Title & Stats */}
              <div className="flex flex-col gap-2 mb-6">
                 <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{listing.title}</h1>
                 <div className="flex items-center gap-2 text-gray-500 font-medium"><MdLocationOn className="text-emerald-500" /> {listing.location}</div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {listing.type === 'house' ? (
                  <>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
                        <MdBed className="text-2xl text-emerald-500" /> 
                        <span className="font-bold text-gray-700">{listing.bedrooms} Beds</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
                        <MdBathtub className="text-2xl text-emerald-500" /> 
                        <span className="font-bold text-gray-700">{listing.bathrooms} Baths</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
                        <MdSquareFoot className="text-2xl text-emerald-500" /> 
                        <span className="font-bold text-gray-700">{listing.sqft} sqft</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
                        <MdSpeed className="text-2xl text-emerald-500" /> 
                        <span className="font-bold text-gray-700">{listing.mileage} mi</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
                        <MdCalendarToday className="text-2xl text-emerald-500" /> 
                        <span className="font-bold text-gray-700">{listing.year}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1 text-center shadow-sm">
                        <MdSettings className="text-2xl text-emerald-500" /> 
                        <span className="font-bold text-gray-700">Auto</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Map Section */}
              <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 mb-8">
                 <div className="rounded-2xl overflow-hidden">
                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}>
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: listing.latitude || 25.7617, lng: listing.longitude || -80.1918 }} zoom={14}>
                        <Marker position={{ lat: listing.latitude || 25.7617, lng: listing.longitude || -80.1918 }} />
                        </GoogleMap>
                    </LoadScript>
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Action Card (Sticky) */}
            <aside className="relative h-fit">
              <div className="sticky top-24 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100">
                
                {/* Price */}
                <div className="mb-6 pb-6 border-b border-gray-50">
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">${listing.price.toLocaleString()}</span>
                  {listing.category === 'rent' && <span className="text-gray-500 font-medium">/night</span>}
                </div>

                {/* Agent Info */}
                {agent && (
                    <div 
                        className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors group"
                        onClick={() => router.push(`/profile/${agent.uid}`)}
                    >
                        <img src={agent.photoURL || '/default-avatar.png'} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Listed by</p>
                            <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 flex items-center gap-1">
                                {agent.displayName} {agent.role === 'agent' && <MdVerified className="text-emerald-500 text-sm" />}
                            </h4>
                        </div>
                        <MdArrowBack className="rotate-180 text-gray-400 group-hover:text-emerald-500" />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button 
                    className="w-full py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all" 
                    onClick={handleStartCheckout}
                  >
                    {listing.category === 'rent' ? 'Book Now' : 'Buy Now'}
                  </button>
                  <button 
                    className="w-full py-3 bg-white border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all flex justify-center items-center gap-2" 
                    onClick={handleMessageAgent}
                  >
                    <MdMessage /> Chat with Agent
                  </button>
                </div>
                
                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                   Secure payment via ModemPay. No hidden fees.
                </p>
              </div>
            </aside>
          </motion.div>
        ) : (
        
        /* VIEW 2: CHECKOUT FLOW */
          <motion.div 
            key="checkout" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 50 }}
            className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12 items-start"
          >
            {checkoutStep === 'success' ? (
                // SUCCESS STATE
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <MdCheckCircle className="text-6xl text-emerald-500" />
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Your transaction has been confirmed. You can now view your receipt or connect with the agent to arrange the handover.
                </p>
                
                {/* Specific requirement: Move to Agent Profile / Connect */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button 
                        className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                        onClick={() => router.push(`/profile/${agent?.uid}`)}
                    >
                        <MdPerson /> Go to Agent Profile
                    </button>
                    <button 
                        className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all"
                        onClick={() => { setViewMode('details'); setCheckoutStep('form'); }}
                    >
                        Return to Listing
                    </button>
                </div>
              </div>
            ) : (
                // CHECKOUT FORM
              <>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm & Pay</h2>
                  <p className="text-gray-500 mb-8">Complete your secure transaction.</p>
                  
                  {listing.category === 'rent' && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                      <h3 className="text-lg font-bold mb-4 text-gray-800">Rental Duration</h3>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-gray-600">Total Nights</span>
                        <strong className="text-emerald-600 text-2xl">{rentalDays}</strong>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="30" 
                        value={rentalDays} 
                        onChange={(e) => setRentalDays(Number(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                      />
                    </div>
                  )}

                  <form onSubmit={processPayment}>
                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-4">Payment Method</h3>
                      <div className="flex gap-4 mb-6">
                        {['card', 'bank'].map(m => (
                          <div 
                            key={m} 
                            onClick={() => setPaymentMethod(m as any)} 
                            className={`flex-1 p-4 border-2 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 font-bold capitalize transition-all
                                ${paymentMethod === m 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                                    : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
                          >
                            {m === 'card' ? <MdCreditCard className="text-2xl" /> : <MdAccountBalance className="text-2xl" />} 
                            {m === 'card' ? 'Credit Card' : 'Bank Transfer'}
                          </div>
                        ))}
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Card Number</label>
                            <input required placeholder="0000 0000 0000 0000" className="p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Expiry</label>
                                <input required placeholder="MM/YY" className="p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">CVV</label>
                                <input required placeholder="123" className="p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={checkoutStep === 'processing'} 
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                    >
                      {checkoutStep === 'processing' ? (
                          <span className="flex items-center justify-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                          </span>
                      ) : `Pay $${totals.total.toLocaleString()}`}
                    </button>
                  </form>
                </div>

                {/* Right Column: Order Summary */}
                <aside className="sticky top-24">
                   <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h3>
                        
                        <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                            <img src={listing.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover" />
                            <div>
                                <h4 className="font-bold text-gray-900 line-clamp-1">{listing.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{listing.category === 'rent' ? `${rentalDays} nights` : 'One-time payment'}</p>
                                <p className="text-xs text-emerald-600 font-bold mt-1 uppercase">{listing.type}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Base Price</span>
                                <span className="font-medium text-gray-900">${totals.base.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes (5%)</span>
                                <span className="font-medium text-gray-900">${totals.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee (2%)</span>
                                <span className="font-medium text-gray-900">${totals.fee.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between font-extrabold text-xl text-emerald-600 pt-4 border-t border-gray-100 mt-4">
                                <span>Total Due</span>
                                <span>${totals.total.toLocaleString()}</span>
                            </div>
                        </div>
                   </div>
                   
                   <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                        <MdCheckCircle className="text-xl shrink-0" />
                        <div>Free cancellation up to 24 hours before check-in.</div>
                   </div>
                </aside>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}