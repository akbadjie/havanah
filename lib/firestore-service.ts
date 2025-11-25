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

// ==================== UTILS ====================

/**
 * HELPER: Removes keys with 'undefined' values from objects.
 * Firestore does not support 'undefined', only 'null' or omitted fields.
 */
const cleanData = (data: any) => {
  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
};

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
    
    // Sanitize input
    const sanitizedData = cleanData(listingData);

    const docRef = await addDoc(collection(db, 'listings'), {
      ...sanitizedData,
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
    
    const sanitizedUpdates = cleanData(updates);

    await updateDoc(docRef, { ...sanitizedUpdates, updatedAt: Timestamp.now() });
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
    area?: number; 
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

    // 1. Client-side Filter
    results = results.filter(l => {
      if (filters?.priceMin && l.price < filters.priceMin) return false;
      if (filters?.priceMax && l.price > filters.priceMax) return false;
      if (filters?.bedrooms !== undefined && l.bedrooms !== filters.bedrooms) return false;
      if (filters?.bathrooms !== undefined && l.bathrooms !== filters.bathrooms) return false;
      if (filters?.area && l.squareFeet) {
        if (Math.abs(l.squareFeet - filters.area) > (filters.area * 0.2)) return false;
      }
      return true;
    });

    // 2. Relevance Scoring
    const queryLower = searchQuery.toLowerCase();
    
    const scoredResults = results.map(listing => {
      let score = 0;

      if (searchQuery) {
        if (listing.title.toLowerCase().includes(queryLower)) score += 30;
        if (listing.location.toLowerCase().includes(queryLower)) score += 20;
        if (listing.description.toLowerCase().includes(queryLower)) score += 10;
        if (listing.brand?.toLowerCase().includes(queryLower)) score += 20; 
        if (listing.model?.toLowerCase().includes(queryLower)) score += 20;
      } else {
        score = 50; 
      }

      const daysOld = (Date.now() - listing.createdAt.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) score += 10;

      return { ...listing, relevance: score };
    });

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
    
    // Clean inputs (specifically userPhone which might be undefined)
    const data = cleanData({
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

    const docRef = await addDoc(collection(db, 'inquiries'), data);

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
    
    // IMPORTANT: Remove 'undefined' fields (like phoneNumber) before saving
    const sanitizedUserData = cleanData(userData);

    await setDoc(doc(db, 'users', userData.uid), {
      ...sanitizedUserData,
      favorites: [],
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
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
  
  // Sanitize updates
  const sanitizedData = cleanData(data);

  await updateDoc(doc(db, 'users', userId), {
    ...sanitizedData,
    updatedAt: Timestamp.now()
  });
};

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
      return !isFavorited; 
    }
    return false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId: string): Promise<Listing[]> => {
  try {
    const db = getFirestoreInstance();
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || !userProfile.favorites || userProfile.favorites.length === 0) {
      return [];
    }
    
    const listingPromises = userProfile.favorites.map(id => getListing(id));
    const listings = await Promise.all(listingPromises);
    
    return listings.filter(l => l !== null) as Listing[];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

// ==================== DASHBOARD STATS ====================

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

export default {
  createListing,
  getAgentListings,
  getAllListings,
  getListing,
  updateListing,
  deleteListing,
  incrementListingViews,
  advancedSearchListings,
  createInquiry,
  getAgentInquiries,
  getUserApplications,
  updateInquiryStatus,
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  toggleFavorite,
  getUserFavorites,
  getAgentStats,
};