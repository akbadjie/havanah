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
  getAdditionalUserInfo // Import this to check if user is new
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

  // ... (register and login functions remain the same) ...
  register: async (email: string, password: string, role: UserRole, displayName?: string, phoneNumber?: string) => {
    try {
      set({ error: null, loading: true });
      const auth = getAuthInstance();
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // CRITICAL: Await this before finishing
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
      // We rely on initializeAuth to fetch the profile
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
      
      // 1. Perform the Popup Sign In
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Check if Firestore Profile Exists
      let profile = await getUserProfile(user.uid);

      // 3. If NO profile exists, CREATE one immediately.
      // We do not rely on "isNewUser" alone, because sometimes a previous creation might have failed.
      if (!profile) {
        console.log('Creating new Firestore profile for Google user...');
        
        const newProfileData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Google User',
          phoneNumber: user.phoneNumber || undefined,
          role: role, // Use the role selected in the UI
          profileImage: user.photoURL || undefined,
        };

        await createUserProfile(newProfileData);
        
        // Update local variable so we can set state immediately
        profile = { ...newProfileData, createdAt: new Date(), updatedAt: new Date() } as unknown as UserProfile;
      }

      // 4. Manually update state immediately (don't wait for listener) to prevent UI flash
      const userObj: AuthUser = {
        id: user.uid,
        email: user.email,
        role: profile.role || role,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
      };

      set({ user: userObj, loading: false });
      
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

        // 1. Fetch Profile
        let profile = await getUserProfile(firebaseUser.uid);

        // 2. SELF-HEALING: If Auth exists but Firestore is missing (e.g. previous error), create it now.
        if (!profile) {
          console.warn('⚠️ User exists in Auth but missing in Firestore. Attempting repair...');
          try {
            const fallbackData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Recovered User',
              phoneNumber: firebaseUser.phoneNumber || undefined,
              role: 'user' as UserRole, // Default to 'user' if recovering
              profileImage: firebaseUser.photoURL || undefined,
            };
            await createUserProfile(fallbackData);
            profile = fallbackData as any;
          } catch (createError) {
            console.error('Failed to auto-repair user profile:', createError);
          }
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
        set({ error: error?.message, loading: false });
      }
    });

    return unsubscribe;
  },
}));