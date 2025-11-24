'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiClock, 
  FiStar, 
  FiTrendingUp,
  FiArrowRight 
} from 'react-icons/fi';
import { 
  MdApartment, 
  MdDirectionsCar,
  MdFavoriteBorder, 
  MdFavorite, 
  MdLocationOn, 
  MdBed, 
  MdBathtub, 
  MdElectricCar 
} from 'react-icons/md';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

// --- Interfaces ---
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

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
  brand?: string;
  model?: string;
  year?: number;
}

// --- Constants ---
const features: Feature[] = [
  {
    icon: <FiShield />, 
    title: 'Verified Listings',
    description: 'All properties and vehicles are verified for your safety',
  },
  {
    icon: <FiClock />, 
    title: 'Instant Booking',
    description: 'Book apartments and cars in just a few clicks',
  },
  {
    icon: <FiStar />, 
    title: 'Quality Service',
    description: 'Top-rated hosts and car owners with excellent reviews',
  },
  {
    icon: <FiTrendingUp />, 
    title: 'Best Prices',
    description: 'Competitive rates with transparent pricing',
  },
];

// --- Sub Component: Listing Card ---
const ListingCard = ({ listing }: { listing: Listing }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const imageUrl = listing.images?.[0] || '/placeholder.png';
  const isHouse = listing.type === 'house';
  const isRent = listing.category === 'rent';

  return (
    <Link href={`/explore/${listing.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
      >
        {/* Image Container */}
        <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm uppercase tracking-wider">
            {isRent ? 'For Rent' : 'For Sale'}
          </div>

          {/* Favorite Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            {isFavorite ? 
              <MdFavorite className="w-5 h-5 text-red-500" /> :
              <MdFavoriteBorder className="w-5 h-5 text-gray-600" />
            }
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {listing.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <MdLocationOn className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Features Chips */}
          <div className="flex flex-wrap gap-2 mb-auto">
            {isHouse ? (
              <>
                {listing.bedrooms && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <MdBed className="w-4 h-4 text-emerald-500" />
                    <span>{listing.bedrooms} Bed</span>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <MdBathtub className="w-4 h-4 text-emerald-500" />
                    <span>{listing.bathrooms} Bath</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {listing.brand && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <MdElectricCar className="w-4 h-4 text-emerald-500" />
                    <span>{listing.brand} {listing.model}</span>
                  </div>
                )}
                {listing.year && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    <FiClock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{listing.year}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Price Footer */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-emerald-600">${listing.price.toLocaleString()}</span>
            <span className="text-sm text-gray-500 font-medium">{isRent ? '/month' : 'total'}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// --- Main Landing Page Component ---
export default function LandingPage() {
  const [apartments, setApartments] = useState<Listing[]>([]);
  const [cars, setCars] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const db = getFirestoreInstance();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        
        // Fetch 4 recent items for simplicity (In prod, use specific queries)
        const q = query(listingsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        
        const allListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        
        setApartments(allListings.filter(l => l.type === 'house').slice(0, 3));
        setCars(allListings.filter(l => l.type === 'car').slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [db]);

  return (
    <div className="w-full bg-white">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
        {/* Background Image - Replace with your own */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80" 
                alt="Luxury Home" 
                className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 py-20 w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
              Live Better. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Drive Faster.</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-12 text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
              The premier marketplace for luxury apartments and premium vehicles. Experience Havanah today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/explore?type=house" 
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-gray-900 bg-white hover:bg-emerald-50 transition-all w-full sm:w-auto min-w-[200px]"
              >
                <MdApartment className="text-xl text-emerald-600" />
                Find Apartment
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/explore?type=car" 
                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all w-full sm:w-auto min-w-[200px]"
              >
                <MdDirectionsCar className="text-xl" />
                Rent a Car
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-emerald-50 rounded-xl mb-6 text-emerald-600 text-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Apartments */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Trending Apartments</h2>
              <p className="text-lg text-gray-500">Discover the most popular properties this week.</p>
            </div>
            <Link href="/explore?type=house" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl h-[420px] animate-pulse" />
              ))}
            </div>
          ) : apartments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {apartments.map((apartment, index) => (
                <motion.div
                  key={apartment.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <ListingCard listing={apartment} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-400">
              <p>No active apartments found. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Featured Vehicles</h2>
              <p className="text-lg text-gray-500">Hit the road with our premium selection.</p>
            </div>
            <Link href="/explore?type=car" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
              View All <FiArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 rounded-2xl h-[420px] animate-pulse" />
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car, index) => (
                <motion.div
                  key={car.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <ListingCard listing={car} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl text-gray-400">
              <p>No active vehicles found. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-900/20 blur-3xl rounded-full translate-x-1/2" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
              Join thousands of happy customers who found their perfect apartment or car with Havanah.
            </p>
            <Link 
              href="/auth/signup" 
              className="inline-block px-10 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-lg shadow-emerald-500/30"
            >
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-extrabold text-white">HAVANAH</div>
            <div className="flex gap-8 text-sm font-medium">
                <Link href="/explore" className="hover:text-white transition-colors">Search</Link>
                <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
                <Link href="/auth/signup" className="hover:text-white transition-colors">Signup</Link>
            </div>
            <p className="text-sm">&copy; 2024 Havanah Inc.</p>
        </div>
      </footer>
    </div>
  );
}