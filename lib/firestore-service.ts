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
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

// ==================== LISTINGS ====================

export interface Listing {
  id: string;
  agentId: string;
  title: string;
  description: string;
  type: 'house' | 'car'; // Type of property
  category: 'rent' | 'sale'; // Rent or Sale
  images: string[];
  price: number;
  location: string;
  status: 'active' | 'inactive' | 'sold';
  
  // House-specific fields
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  address?: string;
  
  // Car-specific fields
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  
  views: number;
  inquiries: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

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
 * Get agent's listings
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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];
  } catch (error) {
    console.error('Error fetching agent listings:', error);
    throw error;
  }
};

/**
 * Get all active listings (for explore feed)
 */
export const getAllListings = async (
  type?: 'house' | 'car',
  category?: 'rent' | 'sale',
  minPrice?: number,
  maxPrice?: number
): Promise<Listing[]> => {
  try {
    const db = getFirestoreInstance();
    let q: Query = collection(db, 'listings');
    const conditions = [where('status', '==', 'active')];
    
    if (type) conditions.push(where('type', '==', type));
    if (category) conditions.push(where('category', '==', category));
    
    q = query(collection(db, 'listings'), ...conditions, orderBy('createdAt', 'desc'));
    
    let snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];
    
    // Apply price filter on client-side
    if (minPrice || maxPrice) {
      results = results.filter(listing => {
        if (minPrice && listing.price < minPrice) return false;
        if (maxPrice && listing.price > maxPrice) return false;
        return true;
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

/**
 * Advanced search with relevance scoring
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
    
    // Get all active listings
    const conditions = [where('status', '==', 'active')];
    if (filters?.type) conditions.push(where('type', '==', filters.type));
    if (filters?.category) conditions.push(where('category', '==', filters.category));
    
    const q = query(collection(db, 'listings'), ...conditions);
    const snapshot = await getDocs(q);
    
    let results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];
    
    // Apply price filter
    if (filters?.priceMin || filters?.priceMax) {
      results = results.filter(listing => {
        if (filters.priceMin && listing.price < filters.priceMin) return false;
        if (filters.priceMax && listing.price > filters.priceMax) return false;
        return true;
      });
    }
    
    // Apply bedrooms/bathrooms filters for houses
    if (filters?.bedrooms !== undefined) {
      results = results.filter(l => l.bedrooms === filters.bedrooms);
    }
    if (filters?.bathrooms !== undefined) {
      results = results.filter(l => l.bathrooms === filters.bathrooms);
    }
    
    // Apply area filter
    if (filters?.area !== undefined) {
      results = results.filter(l => l.squareFeet !== undefined && Math.abs(l.squareFeet - filters.area) <= filters.area * 0.2);
    }
    
    // Calculate relevance scores
    const scoredResults = results.map(listing => {
      let relevanceScore = 0;
      
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const titleMatch = listing.title.toLowerCase().includes(queryLower) ? 10 : 0;
        const descMatch = listing.description?.toLowerCase().includes(queryLower) ? 5 : 0;
        const locationMatch = listing.location?.toLowerCase().includes(queryLower) ? 8 : 0;
        
        // Query matching: 40% weight
        relevanceScore += (titleMatch + descMatch + locationMatch) / 3;
      } else {
        relevanceScore = 50; // Base score if no query
      }
      
      // Type preference bonus
      if (filters?.type && listing.type === filters.type) {
        relevanceScore += 15;
      }
      
      // Price proximity bonus (20% weight)
      if (filters?.priceMin && filters?.priceMax) {
        const mid = (filters.priceMin + filters.priceMax) / 2;
        const diff = Math.abs(listing.price - mid);
        const range = filters.priceMax - filters.priceMin;
        const priceScore = Math.max(0, 20 - (diff / range) * 20);
        relevanceScore += priceScore;
      }
      
      // Recently updated bonus
      if (listing.updatedAt) {
        const daysSinceUpdate = (Date.now() - listing.updatedAt.toMillis()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 7) relevanceScore += 10;
      }
      
      return {
        ...listing,
        relevance: Math.min(100, relevanceScore),
      };
    });
    
    // Sort by relevance
    return scoredResults.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error('Error in advanced search:', error);
    throw error;
  }
};

/**
 * Get single listing
 */
export const getListing = async (listingId: string): Promise<Listing | null> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
};

/**
 * Update listing
 */
export const updateListing = async (listingId: string, updates: Partial<Listing>): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

/**
 * Delete listing
 */
export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

/**
 * Increment listing views
 */
export const incrementListingViews = async (listingId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    const listing = await getDoc(docRef);
    
    if (listing.exists()) {
      await updateDoc(docRef, {
        views: (listing.data().views || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};

// ==================== APPLICATIONS/INQUIRIES ====================

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

/**
 * Create inquiry (user applies to listing)
 */
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
    await incrementListingInquiries(listingId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

/**
 * Get agent's inquiries
 */
export const getAgentInquiries = async (agentId: string): Promise<Inquiry[]> => {
  try {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'inquiries'),
      where('agentId', '==', agentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Inquiry[];
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
};

/**
 * Get user's applications
 */
export const getUserApplications = async (userId: string): Promise<Inquiry[]> => {
  try {
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'inquiries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Inquiry[];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = async (inquiryId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
};

/**
 * Increment inquiry count on listing
 */
const incrementListingInquiries = async (listingId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'listings', listingId);
    const listing = await getDoc(docRef);
    
    if (listing.exists()) {
      await updateDoc(docRef, {
        inquiries: (listing.data().inquiries || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error incrementing inquiries:', error);
  }
};

// ==================== USER PROFILES ====================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: 'user' | 'agent';
  profileImage?: string;
  bio?: string;
  agentPlan?: 'basic' | 'pro' | 'premium'; // Only for agents
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Create user profile
 */
export const createUserProfile = async (userData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const now = Timestamp.now();
    
    await setDoc(doc(db, 'users', userData.uid), {
      ...userData,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      uid: docSnap.id,
      ...docSnap.data(),
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, data: any) => {
  const db = getFirestoreInstance();
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

/**
 * Get agent profile (with public info)
 */
export const getAgentProfile = async (agentId: string): Promise<UserProfile | null> => {
  return getUserProfile(agentId);
};

export default {
  // Listings
  createListing,
  getAgentListings,
  getAllListings,
  getListing,
  updateListing,
  deleteListing,
  incrementListingViews,
  
  // Inquiries
  createInquiry,
  getAgentInquiries,
  getUserApplications,
  updateInquiryStatus,
  
  // User Profiles
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getAgentProfile,
};