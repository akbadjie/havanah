import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  Query,
  serverTimestamp
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

// ==================== TYPES & INTERFACES ====================

export interface Listing {
  id: string;
  agentId: string;
  title: string;
  description: string;
  type: 'house' | 'car';
  category: 'rent' | 'sale';
  images: string[];
  price: number;
  location: string;
  status: 'active' | 'inactive' | 'sold';
  
  // House specifics
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  address?: string;

  // Car specifics
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;

  views: number;
  inquiries: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  agentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: 'user' | 'agent';
  profileImage?: string;
  bio?: string;
  favorites?: string[]; // Array of Listing IDs
  agentPlan?: 'basic' | 'pro' | 'premium';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AgentStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  recentInquiries: number; // Count of pending inquiries
}

// ==================== LISTINGS SERVICE ====================

/**
 * Create a new listing
 */
export const createListing = async (agentId: string, listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'inquiries'>): Promise<string> => {
  try {
    const db = getFirestoreInstance();
    const now = Timestamp.now();
    
    const docRef = await addDoc(collection(db, 'listings'), {
      ...listingData,
      agentId,
      views: 0,
      inquiries: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

/**
 * Get all listings for a specific agent
 */
export const getAgentListings = async (agentId: string): Promise<Listing[]> => {
  try {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'listings'), 
      where('agentId', '==', agentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[];
  } catch (error) {
    console.error('Error fetching agent listings:', error);
    throw error;
  }
};

/**
 * Get specific listing by ID
 */
export const getListing = async (listingId: string): Promise<Listing | null> => {
  try {
    const db = getFirestoreInstance();
    const docSnap = await getDoc(doc(db, 'listings', listingId));
    
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

/**
 * Update a listing
 */
export const updateListing = async (listingId: string, updates: Partial<Listing>): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

/**
 * Delete a listing
 */
export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    await deleteDoc(doc(db, 'listings', listingId));
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

/**
 * Increment view count
 */
export const incrementListingViews = async (listingId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    // Note: In high traffic, utilize increment() from firestore, but reading first allows for view throttling logic if needed
    const listing = await getDoc(docRef);
    if (listing.exists()) {
      await updateDoc(docRef, { views: (listing.data().views || 0) + 1 });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

// ==================== SEARCH & EXPLORE ====================

/**
 * Get all active listings with optional filtering
 */
export const getAllListings = async (
  type?: 'house' | 'car',
  category?: 'rent' | 'sale',
  limitCount: number = 20
): Promise<Listing[]> => {
  try {
    const db = getFirestoreInstance();
    const conditions = [where('status', '==', 'active')];

    if (type) conditions.push(where('type', '==', type));
    if (category) conditions.push(where('category', '==', category));

    // Note: Firestore requires composite indexes for complex queries.
    // If this fails, check browser console for the index creation link.
    const q = query(
      collection(db, 'listings'),
      ...conditions,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[];
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

/**
 * Advanced Search with Relevance Scoring
 */
export const advancedSearchListings = async (
  searchQuery: string,
  filters?: {
    type?: 'house' | 'car';
    category?: 'rent' | 'sale';
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number; // squareFeet
  }
): Promise<Array<Listing & { relevance: number }>> => {
  try {
    const db = getFirestoreInstance();
    
    // Base Query
    const conditions = [where('status', '==', 'active')];
    if (filters?.type) conditions.push(where('type', '==', filters.type));
    if (filters?.category) conditions.push(where('category', '==', filters.category));

    const q = query(collection(db, 'listings'), ...conditions);
    const snapshot = await getDocs(q);

    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Listing[];

    // 1. Client-side Filter (Price, Area, Beds)
    results = results.filter(l => {
      if (filters?.priceMin && l.price < filters.priceMin) return false;
      if (filters?.priceMax && l.price > filters.priceMax) return false;
      if (filters?.bedrooms !== undefined && l.bedrooms !== filters.bedrooms) return false;
      if (filters?.bathrooms !== undefined && l.bathrooms !== filters.bathrooms) return false;
      if (filters?.area && l.squareFeet) {
        // Allow 20% variance in area size
        if (Math.abs(l.squareFeet - filters.area) > (filters.area * 0.2)) return false;
      }
      return true;
    });

    // 2. Relevance Scoring
    const queryLower = searchQuery.toLowerCase();
    
    const scoredResults = results.map(listing => {
      let score = 0;

      // Text Match
      if (searchQuery) {
        if (listing.title.toLowerCase().includes(queryLower)) score += 30;
        if (listing.location.toLowerCase().includes(queryLower)) score += 20;
        if (listing.description.toLowerCase().includes(queryLower)) score += 10;
        if (listing.brand?.toLowerCase().includes(queryLower)) score += 20; // Car brand
        if (listing.model?.toLowerCase().includes(queryLower)) score += 20; // Car model
      } else {
        score = 50; // Default score to keep sort stable
      }

      // Recency Boost
      const daysOld = (Date.now() - listing.createdAt.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 10;

      return { ...listing, relevance: score };
    });

    // 3. Sort by Relevance
    return scoredResults.sort((a, b) => b.relevance - a.relevance);

  } catch (error) {
    console.error('Advanced search error:', error);
    throw error;
  }
};

// ==================== INQUIRIES & APPLICATIONS ====================

export const createInquiry = async (
  listingId: string,
  agentId: string,
  listingTitle: string,
  userId: string,
  userName: string,
  userEmail: string,
  message: string,
  userPhone?: string
): Promise<string> => {
  try {
    const db = getFirestoreInstance();
    
    const docRef = await addDoc(collection(db, 'inquiries'), {
      listingId,
      agentId,
      listingTitle,
      userId,
      userName,
      userEmail,
      userPhone,
      message,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // Increment inquiry count on listing
    const listingRef = doc(db, 'listings', listingId);
    const listingSnap = await getDoc(listingRef);
    if (listingSnap.exists()) {
      await updateDoc(listingRef, { inquiries: (listingSnap.data().inquiries || 0) + 1 });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

export const getAgentInquiries = async (agentId: string): Promise<Inquiry[]> => {
  try {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'inquiries'),
      where('agentId', '==', agentId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Inquiry[];
  } catch (error) {
    console.error('Error fetching agent inquiries:', error);
    throw error;
  }
};

export const getUserApplications = async (userId: string): Promise<Inquiry[]> => {
  try {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'inquiries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Inquiry[];
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

export const updateInquiryStatus = async (inquiryId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, 'inquiries', inquiryId), { status });
};

// ==================== USER PROFILES & FAVORITES ====================

export const createUserProfile = async (userData: Omit<UserProfile, 'createdAt' | 'updatedAt' | 'favorites'>): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const now = Timestamp.now();
    await setDoc(doc(db, 'users', userData.uid), {
      ...userData,
      favorites: [],
      createdAt: now,
      updatedAt: now,
    }, { merge: true }); // merge: true prevents overwriting if somehow exists
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirestoreInstance();
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (!docSnap.exists()) return null;
    return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: Timestamp.now()
  });
};

/**
 * Toggle Favorite Listing for a User
 */
export const toggleFavorite = async (userId: string, listingId: string): Promise<boolean> => {
  try {
    const db = getFirestoreInstance();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentFavorites = userSnap.data().favorites || [];
      const isFavorited = currentFavorites.includes(listingId);
      
      let newFavorites;
      if (isFavorited) {
        newFavorites = currentFavorites.filter((id: string) => id !== listingId);
      } else {
        newFavorites = [...currentFavorites, listingId];
      }
      
      await updateDoc(userRef, { favorites: newFavorites });
      return !isFavorited; // Return the new state (true = added, false = removed)
    }
    return false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

/**
 * Get a user's favorite listings (Full objects)
 */
export const getUserFavorites = async (userId: string): Promise<Listing[]> => {
  try {
    const db = getFirestoreInstance();
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.favorites || userProfile.favorites.length === 0) {
      return [];
    }

    // Firestore 'in' query supports up to 10 items. 
    // For production scaling, you might need to batch this or fetch by ID individually.
    // Here we implement the "Fetch by ID" method which is safer for >10 items.
    
    const listingPromises = userProfile.favorites.map(id => getListing(id));
    const listings = await Promise.all(listingPromises);
    
    return listings.filter(l => l !== null) as Listing[];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

// ==================== DASHBOARD STATS ====================

/**
 * Calculate stats for Agent Dashboard
 */
export const getAgentStats = async (agentId: string): Promise<AgentStats> => {
  try {
    const listings = await getAgentListings(agentId);
    const inquiries = await getAgentInquiries(agentId);

    const activeListings = listings.filter(l => l.status === 'active').length;
    const totalViews = listings.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalInquiries = inquiries.length;
    const recentInquiries = inquiries.filter(i => i.status === 'pending').length;

    return {
      totalListings: listings.length,
      activeListings,
      totalViews,
      totalInquiries,
      recentInquiries
    };
  } catch (error) {
    console.error('Error calculating agent stats:', error);
    return {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 0,
      recentInquiries: 0
    };
  }
};

// Export Default Object for convenience
export default {
  // Listings
  createListing,
  getAgentListings,
  getAllListings,
  getListing,
  updateListing,
  deleteListing,
  incrementListingViews,
  advancedSearchListings,
  
  // Inquiries
  createInquiry,
  getAgentInquiries,
  getUserApplications,
  updateInquiryStatus,

  // Profiles & User Actions
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  toggleFavorite,
  getUserFavorites,

  // Dashboard
  getAgentStats,
};