'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdSearch, 
  MdFilterList, 
  MdDirectionsCar, 
  MdHome, 
  MdClose,
  MdLocationOn,
  MdBed,
  MdBathtub,
  MdSpeed,
  MdCalendarToday,
  MdArrowForward
} from 'react-icons/md';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import Link from 'next/link';

// Types
interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  type: 'house' | 'car';
  category: 'rent' | 'sale';
  bedrooms?: number;
  bathrooms?: number;
  mileage?: number;
  year?: number;
}

interface FilterState {
  type: 'all' | 'house' | 'car';
  category: 'all' | 'rent' | 'sale';
  minPrice: string;
  maxPrice: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = getFirestoreInstance();

  // State
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    type: (searchParams.get('type') as 'house' | 'car') || 'all',
    category: 'all',
    minPrice: '',
    maxPrice: ''
  });

  // 1. Fetch Listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
        let q = query(listingsRef, where('status', '==', 'active'), limit(50));

        // Apply Type Filter (Database Level)
        if (filters.type !== 'all') {
          q = query(q, where('type', '==', filters.type));
        }
        
        // Apply Category Filter (Database Level)
        if (filters.category !== 'all') {
          q = query(q, where('category', '==', filters.category));
        }

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));

        // Apply Client-Side Filtering (Search & Price)
        // Note: Firestore text search is limited, so we filter basic text client-side for this demo
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          data = data.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.location.toLowerCase().includes(lowerQuery)
          );
        }

        if (filters.minPrice) {
          data = data.filter(item => item.price >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
          data = data.filter(item => item.price <= Number(filters.maxPrice));
        }

        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce fetch
    const timeoutId = setTimeout(() => fetchListings(), 500);
    return () => clearTimeout(timeoutId);
  }, [filters, searchQuery, db]);

  // Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: 'all', category: 'all', minPrice: '', maxPrice: '' });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* 1. Header & Search Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 pt-4 pb-4 px-4 sm:px-6 shadow-sm/50 backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input 
                type="text" 
                placeholder="Search by title, city, or zip code..." 
                className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border-transparent focus:bg-white border focus:border-emerald-500 rounded-xl outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Type Toggles */}
            <div className="flex gap-2 shrink-0 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => handleFilterChange('type', 'all')}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${filters.type === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => handleFilterChange('type', 'house')}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${filters.type === 'house' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <MdHome className="text-lg" /> Homes
              </button>
              <button 
                onClick={() => handleFilterChange('type', 'car')}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${filters.type === 'car' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <MdDirectionsCar className="text-lg" /> Cars
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-500'}`}
              >
                <MdFilterList className="text-lg" /> Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                    <select 
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="all">Any Category</option>
                      <option value="rent">For Rent</option>
                      <option value="sale">For Sale</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Min Price</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Max Price</label>
                    <input 
                      type="number" 
                      placeholder="Any" 
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button onClick={clearFilters} className="w-full p-2.5 text-red-500 font-bold text-sm hover:bg-red-50 rounded-lg transition-colors">
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Searching...' : `${listings.length} Results`}
            </h2>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white rounded-2xl h-80 border border-gray-100 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-t-2xl" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                            <div className="h-8 bg-gray-200 rounded mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MdSearch className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No results found</h3>
                <p className="text-gray-500 mt-2 max-w-sm">We couldn't find any listings matching your current filters. Try adjusting them.</p>
                <button onClick={clearFilters} className="mt-6 text-emerald-600 font-bold hover:underline">Clear all filters</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {listings.map((item) => (
                    <ListingCard key={item.id} listing={item} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: Listing Card ---
const ListingCard = ({ listing }: { listing: Listing }) => {
  const isHouse = listing.type === 'house';
  
  return (
    <Link href={`/explore/${listing.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-56 bg-gray-200 overflow-hidden">
          <img 
            src={listing.images?.[0] || '/placeholder.png'} 
            alt={listing.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-gray-900 uppercase tracking-wide">
             {listing.category}
          </div>
          <div className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm">
             {isHouse ? <MdHome /> : <MdDirectionsCar />}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
            <MdLocationOn className="text-emerald-500 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-2 mb-auto">
             {isHouse ? (
               <>
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md font-medium border border-gray-100">
                   <MdBed /> {listing.bedrooms}
                 </span>
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md font-medium border border-gray-100">
                   <MdBathtub /> {listing.bathrooms}
                 </span>
               </>
             ) : (
                <>
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md font-medium border border-gray-100">
                   <MdCalendarToday /> {listing.year}
                 </span>
                 <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md font-medium border border-gray-100">
                   <MdSpeed /> {listing.mileage ? Math.floor(listing.mileage/1000) + 'k' : '0'}
                 </span>
               </>
             )}
          </div>

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
                <span className="text-lg font-extrabold text-emerald-600">${listing.price.toLocaleString()}</span>
                {listing.category === 'rent' && <span className="text-xs text-gray-400 font-medium">/mo</span>}
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MdArrowForward />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};