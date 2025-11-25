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
import { createUserProfile, getUserProfile } from '@/lib/firestore-service';

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
  register: (email: string, password: string, role: UserRole, displayName?: string, phoneNumber?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  initializeAuth: () => void;
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

      // Create Firestore user profile
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
      // onAuthStateChanged will handle the rest
      set({ loading: false });
    } catch (error: any) {
      set({ error: error?.message || 'Login failed', loading: false });
      throw error;
    }
  },

  loginWithGoogle: async (role: UserRole) => {
    try {
      set({ error: null, loading: true });
      const auth = getAuthInstance();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Create Firestore profile if it doesn't exist
      const existing = await getUserProfile(result.user.uid);

      if (!existing) {
        await createUserProfile({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'New User',
          phoneNumber: result.user.phoneNumber || undefined,
          role,
          profileImage: result.user.photoURL || undefined,
        });
      }

      set({ loading: false });
    } catch (error: any) {
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

    onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      try {
        if (!firebaseUser) {
          set({ user: null, loading: false });
          return;
        }

        // Load Firestore profile
        const profile = await getUserProfile(firebaseUser.uid);

        // Ensure profile exists (fallback for users who signed up before this fix)
        if (!profile) {
          await createUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'New User',
            phoneNumber: firebaseUser.phoneNumber || undefined,
            role: 'user',
            profileImage: firebaseUser.photoURL || undefined,
          });
        }

        const userObj: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          role: profile?.role || 'user',
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
        };

        set({ user: userObj, loading: false });
      } catch (error: any) {
        console.error('Error in onAuthStateChanged:', error);
        set({ error: error?.message || 'Auth initialization failed', loading: false });
      }
    });
  },
}));