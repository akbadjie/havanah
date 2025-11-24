import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'agent' | 'admin';
  bio?: string;
  location?: string;
  phoneNumber?: string;
  createdAt?: any;
}

const db = getFirestoreInstance();

/**
 * Fetches a public user profile by ID.
 */
export const getProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { uid: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * Toggles connection status between two users.
 * If currently connected, it disconnects. If not, it connects.
 * 
 * NOTE: In a production app, you might want a "Request -> Accept" flow.
 * For this simplified version, clicking "Connect" instantly connects both ways.
 */
export const toggleConnection = async (currentUserId: string, targetUserId: string, isConnected: boolean) => {
  try {
    const myConnectionRef = doc(db, 'users', currentUserId, 'connections', targetUserId);
    // If you want mutual connections, you also update the other user's doc:
    // const theirConnectionRef = doc(db, 'users', targetUserId, 'connections', currentUserId);

    if (isConnected) {
      // Disconnect
      await deleteDoc(myConnectionRef);
      // await deleteDoc(theirConnectionRef); 
    } else {
      // Connect
      await setDoc(myConnectionRef, {
        connectedAt: serverTimestamp(),
        status: 'active'
      });
      // await setDoc(theirConnectionRef, { ... });
    }
    return !isConnected;
  } catch (error) {
    console.error("Error toggling connection:", error);
    throw error;
  }
};

/**
 * Checks if current user is connected to target user.
 */
export const checkConnectionStatus = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const ref = doc(db, 'users', currentUserId, 'connections', targetUserId);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (error) {
    console.error("Error checking connection:", error);
    return false;
  }
};

/**
 * Fetches all people the current user is connected to.
 */
export const getUserConnections = async (userId: string): Promise<UserProfile[]> => {
  try {
    const connectionsRef = collection(db, 'users', userId, 'connections');
    const q = query(connectionsRef);
    const querySnapshot = await getDocs(q);

    // 1. Get all connected User IDs
    const connectedUserIds = querySnapshot.docs.map(doc => doc.id);

    if (connectedUserIds.length === 0) return [];

    // 2. Fetch User Profiles for those IDs
    // Firestore "in" queries are limited to 10. For scalability, we map promises.
    const profilePromises = connectedUserIds.map(id => getProfileById(id));
    const profiles = await Promise.all(profilePromises);

    // Filter out nulls (in case a user was deleted)
    return profiles.filter(p => p !== null) as UserProfile[];

  } catch (error) {
    console.error("Error fetching connections:", error);
    return [];
  }
};

/**
 * Fetch public listings for a specific agent (for the Profile page)
 */
export const getAgentPublicListings = async (agentId: string) => {
    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const q = query(
            collection(db, 'listings'), 
            where('agentId', '==', agentId),
            where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error getting agent listings", error);
        return [];
    }
}