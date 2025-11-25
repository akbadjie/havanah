'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthInstance } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, createUserProfile, UserProfile } from '@/lib/firestore-service';
import { useToast } from '@/components/toast/toast';
import { MdLoop } from 'react-icons/md';

function RegisterProcess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('Verifying account...');

  useEffect(() => {
    const auth = getAuthInstance();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // If no user is found (e.g. direct access without logging in), go back to login
        router.replace('/auth');
        return;
      }

      try {
        await handleUserRegistration(currentUser);
      } catch (error: any) {
        console.error("Registration Error:", error);
        setStatus('error');
        setStatusMessage("Failed to setup account. Please try again.");
        toast.error("Error", error.message || "Account setup failed");
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const handleUserRegistration = async (firebaseUser: User) => {
    setStatusMessage("Checking profile...");
    
    // 1. Check if profile exists
    const existingProfile = await getUserProfile(firebaseUser.uid);

    if (existingProfile) {
      // --- USER EXISTS ---
      setStatusMessage("Welcome back! Redirecting...");
      setStatus('success');
      
      // Artificial delay for UX smoothness (optional)
      setTimeout(() => {
        const target = existingProfile.role === 'agent' ? '/agent/dashboard' : '/explore';
        router.replace(target);
      }, 800);
      return;
    }

    // --- NEW USER (CREATE PROFILE) ---
    setStatusMessage("Creating your profile...");
    
    // Get role from URL (default to 'user' if tampering occurred)
    const urlRole = searchParams.get('role');
    const assignedRole = (urlRole === 'agent' || urlRole === 'user') ? urlRole : 'user';

    const newProfile: any = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'New User',
      phoneNumber: firebaseUser.phoneNumber || undefined,
      role: assignedRole,
      profileImage: firebaseUser.photoURL || undefined,
    };

    // Create in Firestore
    await createUserProfile(newProfile);
    
    setStatusMessage("Account created! Taking you in...");
    setStatus('success');

    setTimeout(() => {
      const target = assignedRole === 'agent' ? '/agent/dashboard' : '/explore';
      router.replace(target);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full flex flex-col items-center gap-6">
        
        {/* Loading Spinner / Status Icon */}
        <div className="relative">
          {status === 'loading' && (
            <div className="animate-spin text-emerald-500">
              <MdLoop size={48} />
            </div>
          )}
          {status === 'success' && (
            <div className="text-emerald-500 animate-bounce">
              <img src="/logo.jpg" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
          )}
          {status === 'error' && (
            <div className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Text Status */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            {status === 'error' ? 'Something went wrong' : 'Just a moment'}
          </h2>
          <p className="text-sm text-gray-500 font-medium animate-pulse">
            {statusMessage}
          </p>
        </div>

        {/* Error Action */}
        {status === 'error' && (
          <button 
            onClick={() => router.replace('/auth')}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <RegisterProcess />
    </Suspense>
  );
}