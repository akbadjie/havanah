import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDc1zaXU43KB94z0y9MWrU-kq7en01TwqM',
  authDomain: 'havanah-478715.firebaseapp.com',
  databaseURL: 'https://havanah-478715-default-rtdb.firebaseio.com',
  projectId: 'havanah-478715',
  storageBucket: 'havanah-478715.firebasestorage.app',
  messagingSenderId: '473870529702',
  appId: '1:473870529702:web:2f780b9f108bf4d2c5f067',
  measurementId: 'G-NT7QQ7S75M',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let realtimeDatabase: Database | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

// Initialize services only on client side
if (typeof window !== 'undefined') {
  auth = getAuth(app);
  firestore = getFirestore(app);
  realtimeDatabase = getDatabase(app);
  storage = getStorage(app);
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics might not be available in all environments
  }
}

export { app };
export const getAuthInstance = () => auth || getAuth(app);
export const getFirestoreInstance = () => firestore || getFirestore(app);
export const getRealtimeDatabaseInstance = () => realtimeDatabase || getDatabase(app);
export const getStorageInstance = () => storage || getStorage(app);