'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdShoppingBag, 
  MdMessage, 
  MdExplore, 
  MdTrendingUp,
  MdCalendarToday,
  MdCheckCircle,
  MdArrowForward
} from 'react-icons/md';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const db = getFirestoreInstance();

  // State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeBookings: 0,
    unreadMessages: 0
  });

  // 1. Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        // A. Fetch Transactions (Bookings)
        const transRef = collection(db, 'transactions');
        const q = query(
          transRef, 
          where('buyerId', '==', user.id), 
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        
        const transData = await Promise.all(snapshot.docs.map(async (docSnap) => {
           const data = docSnap.data();
           // Fetch Listing details for display
           let listingTitle = 'Unknown Item';
           let listingImage = '/placeholder.png';
           try {
             // We assume you might have a helper or just direct fetch
             // For speed in this dashboard, we might want to store basic snapshot in transaction
             // But here we'll fetch the listing doc for the title/image
             const { doc, getDoc } = await import('firebase/firestore');
             const listSnap = await getDoc(doc(db, 'listings', data.listingId));
             if (listSnap.exists()) {
               listingTitle = listSnap.data().title;
               listingImage = listSnap.data().images?.[0] || '/placeholder.png';
             }
           } catch(e) { console.log('Listing fetch error', e) }

           return {
             id: docSnap.id,
             ...data,
             listingTitle,
             listingImage,
             createdAt: data.createdAt?.toDate()
           };
        }));

        setTransactions(transData);

        // B. Calculate Stats
        const totalSpent = transData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        // Mock active bookings (logic would depend on dates)
        const activeBookings = transData.length; 

        // C. Fetch Unread Messages (Optional: Fetch real count from 'conversations')
        // For now, we'll placeholder this or you can reuse getConversations from realtime-service
        
        setStats({
          totalSpent,
          activeBookings,
          unreadMessages: 0 // You can plug in the realtime service here
        });

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, db]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome back, <span className="text-emerald-600">{user?.displayName?.split(' ')[0] || 'User'}</span>!
        </h1>
        <p className="text-gray-500">Here's what's happening with your account today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
            <MdShoppingBag />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeBookings}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
            <MdTrendingUp />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Spent</p>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-colors"
          onClick={() => router.push('/messaging')}
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-2xl">
            <MdMessage />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Messages</p>
            <h3 className="text-2xl font-bold text-gray-900">Check Inbox</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions / Bookings */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link href="/explore" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Browse More <MdArrowForward />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {transactions.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 mb-4">No recent bookings found.</p>
                <Link href="/explore" className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors">
                  Start Exploring
                </Link>
              </div>
            ) : (
              transactions.map((t) => (
                <motion.div 
                  key={t.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    <img src={t.listingImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-900 truncate">{t.listingTitle}</h4>
                      <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full capitalize">
                        {t.status || 'Completed'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Order ID: <span className="font-mono text-xs">{t.id.slice(0, 8)}...</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MdCalendarToday /> {t.createdAt?.toLocaleDateString()}</span>
                      <span className="font-bold text-emerald-600 text-sm">${t.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link href="/explore?type=house" className="p-3 bg-white/10 rounded-xl flex items-center gap-3 hover:bg-white/20 transition-colors">
                <div className="p-2 bg-emerald-500 rounded-lg"><MdDashboard /></div>
                <span className="font-medium">Rent Apartment</span>
              </Link>
              <Link href="/explore?type=car" className="p-3 bg-white/10 rounded-xl flex items-center gap-3 hover:bg-white/20 transition-colors">
                <div className="p-2 bg-blue-500 rounded-lg"><MdDashboard /></div>
                <span className="font-medium">Rent Car</span>
              </Link>
              <Link href="/connections" className="p-3 bg-white/10 rounded-xl flex items-center gap-3 hover:bg-white/20 transition-colors">
                <div className="p-2 bg-purple-500 rounded-lg"><MdDashboard /></div>
                <span className="font-medium">My Connections</span>
              </Link>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-2">Account Status</h3>
             <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
               <MdCheckCircle /> Active Member
             </div>
             <p className="text-sm text-gray-500 mb-4">
               Your profile is visible to agents. Complete your bio to build trust.
             </p>
             <button 
               onClick={() => router.push(`/profile/${user?.id}`)}
               className="w-full py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
             >
               Edit Profile
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}