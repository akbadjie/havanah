'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdAdd, 
  MdDashboard, 
  MdHome, 
  MdDirectionsCar, 
  MdTrendingUp, 
  MdVisibility, 
  MdEdit, 
  MdDelete,
  MdMoreVert
} from 'react-icons/md';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';

interface AgentListing {
  id: string;
  title: string;
  price: number;
  type: 'house' | 'car';
  category: 'rent' | 'sale';
  status: 'active' | 'sold';
  views: number;
  image: string;
  createdAt: any;
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const db = getFirestoreInstance();

  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    totalRevenue: 0
  });

  // 1. Fetch Agent Data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const q = query(
          collection(db, 'listings'), 
          where('agentId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        
        const fetchedListings = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                price: data.price,
                type: data.type,
                category: data.category,
                status: data.status || 'active',
                views: data.views || 0, // Assuming you track views
                image: data.images?.[0] || '/placeholder.png',
                createdAt: data.createdAt?.toDate()
            } as AgentListing;
        });

        setListings(fetchedListings);

        // Calculate Stats
        const active = fetchedListings.filter(l => l.status === 'active').length;
        const views = fetchedListings.reduce((acc, curr) => acc + curr.views, 0);
        // Mock revenue calc (e.g., sold items)
        const revenue = fetchedListings
            .filter(l => l.status === 'sold')
            .reduce((acc, curr) => acc + curr.price, 0);

        setStats({
            activeListings: active,
            totalViews: views,
            totalRevenue: revenue
        });

      } catch (error) {
        console.error("Agent Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, db]);

  // 2. Delete Listing Action
  const handleDelete = async (listingId: string) => {
    if(!confirm("Are you sure you want to delete this listing?")) return;
    
    try {
        await deleteDoc(doc(db, 'listings', listingId));
        setListings(prev => prev.filter(l => l.id !== listingId));
        toast.success("Deleted", "Listing removed successfully");
    } catch (error) {
        toast.error("Error", "Failed to delete listing");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Agent Dashboard</h1>
          <p className="text-gray-500">Manage your portfolio and track performance.</p>
        </div>
        <Link 
            href="/agent/listings/add" 
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
        >
            <MdAdd size={22} /> Add New Listing
        </Link>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                <MdDashboard />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Active Listings</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeListings}</h3>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl">
                <MdVisibility />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Views</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</h3>
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
        >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
                <MdTrendingUp />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Sales Volume</p>
                <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
            </div>
        </motion.div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg">My Listings</h3>
            {/* Filter controls could go here */}
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-5 font-bold">Listing</th>
                        <th className="p-5 font-bold">Category</th>
                        <th className="p-5 font-bold">Price</th>
                        <th className="p-5 font-bold">Status</th>
                        <th className="p-5 font-bold">Views</th>
                        <th className="p-5 font-bold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {listings.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-10 text-center text-gray-400">
                                You haven't added any listings yet.
                            </td>
                        </tr>
                    ) : (
                        listings.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                                            <span className="text-xs text-gray-400">{item.createdAt?.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                                        {item.type === 'house' ? <MdHome className="text-emerald-500" /> : <MdDirectionsCar className="text-blue-500" />}
                                        {item.category}
                                    </div>
                                </td>
                                <td className="p-5 font-bold text-gray-900">
                                    ${item.price.toLocaleString()}
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                        ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-600">
                                    {item.views}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                            onClick={() => router.push(`/agent/listings/edit/${item.id}`)}
                                        >
                                            <MdEdit />
                                        </button>
                                        <button 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <MdDelete />
                                        </button>
                                        <button 
                                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                                            onClick={() => router.push(`/explore/${item.id}`)}
                                        >
                                            <MdMoreVert />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}