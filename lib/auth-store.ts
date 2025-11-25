import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '@/lib/firestore-service';

export type UserRole = 'user' | 'agent';

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  // Actions
  register: (email: string, password: string, role: UserRole, displayName?: string, phoneNumber?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>; // Removed role param, strictly handles Auth
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  initializeAuth: () => () => void; // Returns unsubscribe function
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  register: async (email: string, password: string, role: UserRole, displayName?: string, phoneNumber?: string) => {
    try {
      set({ error: null, loading: true });
      const auth = getAuthInstance();
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Standard Email/Pass registration still creates profile immediately
      await createUserProfile({
        uid: result.user.uid,
        email: result.user.email || email,
        displayName: displayName || result.user.displayName || 'New User',
        phoneNumber: phoneNumber || undefined,
        role,
        profileImage: result.user.photoURL || undefined,
      });

      set({ loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Registration failed', loading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ error: null, loading: true });
      const auth = getAuthInstance();
      await signInWithEmailAndPassword(auth, email, password);
      // initializeAuth listener will handle the state update
      set({ loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Login failed', loading: false });
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ error: null, loading: true });
      const auth = getAuthInstance();
      const provider = new GoogleAuthProvider();
      
      // We strictly perform Auth here. 
      // We do NOT create the firestore profile here anymore.
      // The UI will redirect to /auth/register to handle that.
      await signInWithPopup(auth, provider);

      set({ loading: false });
    } catch (error: any) {
      console.error("Google Login Error:", error);
      set({ error: error?.message || 'Google login failed', loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ error: null });
      const auth = getAuthInstance();
      await signOut(auth);
      set({ user: null });
    } catch (error: any) {
      set({ error: error?.message || 'Logout failed' });
      throw error;
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initializeAuth: () => {
    const auth = getAuthInstance();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      try {
        if (!firebaseUser) {
          set({ user: null, loading: false });
          return;
        }

        // Try to fetch profile, but don't crash if it doesn't exist yet
        // (This is important for the /auth/register page flow)
        let profile = await getUserProfile(firebaseUser.uid);

        const userObj: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          // If profile exists, use its role. If not, default to 'user' temporarily.
          // The /auth/register page will fix this.
          role: profile?.role || 'user', 
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
        };

        set({ user: userObj, loading: false });
      } catch (error: any) {
        console.error('Error in onAuthStateChanged:', error);
        set({ error: error?.message, loading: false });
      }
    });

    return unsubscribe;
  },
}));