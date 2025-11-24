import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

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

  const STORAGE_KEY = 'havanah_user';

  const saveUserToStorage = (user: AuthUser | null) => {
    if (typeof window === 'undefined') return;
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not access localStorage for auth persistence', e);
    }
  };

  const loadUserFromStorage = (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch (e) {
      console.warn('Failed to parse stored user', e);
      return null;
    }
  };

  export const useAuth = create<AuthState>((set) => ({
    user: loadUserFromStorage(),
    loading: false,
    error: null,

    register: async (email: string, password: string, role: UserRole, displayName?: string, phoneNumber?: string) => {
      try {
        set({ error: null, loading: true });
        const auth = getAuthInstance();
        const result = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName) {
          await updateProfile(result.user, { displayName });
        }

        const userObj: AuthUser = {
          id: result.user.uid,
          email: result.user.email,
          role,
          displayName: displayName || result.user.displayName,
          phoneNumber,
          photoURL: result.user.photoURL || null,
        };

        set({ user: userObj, loading: false });
        saveUserToStorage(userObj);
      } catch (error: any) {
        set({ error: error?.message || 'Registration failed', loading: false });
        throw error;
      }
    },

    login: async (email: string, password: string) => {
      try {
        set({ error: null, loading: true });
        const auth = getAuthInstance();
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Fetch role from Firestore
        const db = getFirestoreInstance();
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);

        let role: UserRole = 'user';
        if (docSnap.exists()) {
          const data = docSnap.data();
          role = (data.role as UserRole) || 'user';
        }

        const userObj: AuthUser = {
          id: result.user.uid,
          email: result.user.email,
          role,
          displayName: result.user.displayName,
          phoneNumber: result.user.phoneNumber,
          photoURL: result.user.photoURL || null,
        };

        set({ user: userObj, loading: false });
        saveUserToStorage(userObj);
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

        // Fetch role from Firestore (or use provided role if first login)
        const db = getFirestoreInstance();
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);

        let userRole: UserRole = role;
        if (docSnap.exists()) {
          const data = docSnap.data();
          userRole = (data.role as UserRole) || role;
        }

        const userObj: AuthUser = {
          id: result.user.uid,
          email: result.user.email,
          role: userRole,
          displayName: result.user.displayName,
          phoneNumber: result.user.phoneNumber,
          photoURL: result.user.photoURL || null,
        };

        set({ user: userObj, loading: false });
        saveUserToStorage(userObj);
      } catch (error: any) {
        set({ error: error?.message || 'Google login failed', loading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        set({ error: null, loading: true });
        const auth = getAuthInstance();
        await signOut(auth);
        set({ user: null, loading: false });
        saveUserToStorage(null);
      } catch (error: any) {
        set({ error: error?.message || 'Logout failed', loading: false });
        throw error;
      }
    },

    setError: (error: string | null) => {
      set({ error });
    },

    initializeAuth: () => {
      // No-op: we persist/load user from localStorage instead of relying on
      // firebase onAuthStateChanged. Call this to trigger any side-effects if needed.
    },
  }));