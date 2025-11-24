'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdEdit, 
  MdSave, 
  MdCameraAlt, 
  MdPersonAdd, 
  MdPersonRemove,
  MdMessage, 
  MdVerified, 
  MdLocationOn, 
  MdCalendarToday, 
  MdWork, 
  MdGridOn, 
  MdInfo,
  MdCheck,
  MdArrowBack
} from 'react-icons/md';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';
import { 
  getProfileById, 
  toggleConnection, 
  checkConnectionStatus, 
  getAgentPublicListings,
  UserProfile 
} from '@/lib/user-service';
import { updateUserProfile } from '@/lib/firestore-service'; // We will define this small helper below
import { getOrCreateConversation } from '@/lib/realtime-service';
import { getStorageInstance } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams(); // Get [id] from URL
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ID Resolution
  const profileId = params?.id as string;
  
  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agentListings, setAgentListings] = useState<any[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'listings'>('about');
  
  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({ 
    displayName: '', 
    bio: '', 
    location: '', 
    phoneNumber: '' 
  });

  // 1. Fetch Data
  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      // Safety check
      if (!profileId) {
        if (isActive) setIsLoading(false);
        return;
      }

      if (isActive) setIsLoading(true);

      // Determine ownership
      const isOwn = user?.id === profileId;
      if (isActive) setIsOwnProfile(isOwn);

      try {
        // A. Fetch Profile
        const profileData = await getProfileById(profileId);

        if (!profileData) {
          if (isActive) {
            toast.error('Error', 'User not found');
            router.push('/explore');
          }
          return;
        }

        if (isActive) {
          setProfile(profileData);
          setEditForm({
            displayName: profileData.displayName || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            phoneNumber: profileData.phoneNumber || '',
          });
        }

        // B. If Agent, fetch listings
        if (profileData.role === 'agent') {
          const listings = await getAgentPublicListings(profileId);
          if (isActive) {
            setAgentListings(listings);
            setActiveTab('listings'); // Default to listings for agents
          }
        }

        // C. If Visitor, check connection status
        if (!isOwn && user?.id) {
          const status = await checkConnectionStatus(user.id, profileId);
          if (isActive) setIsConnected(status);
        }

      } catch (error) {
        console.error(error);
        if (isActive) toast.error('Error', 'Failed to load profile');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isActive = false; };
  }, [profileId, user?.id]);

  // 2. Actions
  const handleConnect = async () => {
    if (!user?.id || !profile) {
      toast.error("Auth Required", "Please log in to connect.");
      router.push('/auth/login');
      return;
    }

    // Optimistic UI Update
    const originalState = isConnected;
    setIsConnected(!isConnected);

    try {
      await toggleConnection(user.id, profile.uid, originalState);
      toast.success(
        originalState ? 'Disconnected' : 'Connected', 
        originalState ? `Removed connection with ${profile.displayName}` : `You are now connected with ${profile.displayName}`
      );
    } catch (error) {
      setIsConnected(originalState); // Revert on error
      toast.error('Error', 'Failed to update connection');
    }
  };

  const handleMessage = async () => {
    if (!user?.id || !profile) {
      toast.error("Auth Required", "Please log in to message.");
      router.push('/auth/login');
      return;
    }
    
    try {
      const convId = await getOrCreateConversation(
        user.id, 
        profile.uid, 
        user.displayName || 'User', 
        profile.displayName
      );
      router.push(`/messaging?id=${convId}`);
    } catch (error) { 
      toast.error('Error', 'Could not start chat'); 
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;
    const loadingId = toast.loading('Saving', 'Updating your profile...');
    
    try {
      // Use the helper from firestore-service (defined below if you don't have it)
      await updateUserProfile(user.id, editForm);
      
      setProfile((prev: any) => prev ? ({ ...prev, ...editForm }) : null);
      setIsEditing(false);
      
      toast.remove(loadingId);
      toast.success('Success', 'Profile updated');
    } catch (error) {
      toast.remove(loadingId);
      toast.error('Error', 'Failed to save changes');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user?.id) return;
    
    const file = e.target.files[0];
    const toastId = toast.loading("Uploading", "Updating avatar...");
    
    try {
      const storage = getStorageInstance();
      const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateUserProfile(user.id, { photoURL: url }); // Update User Doc
      
      setProfile((prev: any) => prev ? ({ ...prev, photoURL: url }) : null);
      
      toast.remove(toastId);
      toast.success("Success", "Avatar updated");
    } catch (error) {
      toast.remove(toastId);
      toast.error("Error", "Upload failed");
    }
  };

  // 3. Loading View
  if (isLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Banner Background */}
      <div className="h-64 bg-gradient-to-r from-emerald-600 to-teal-800 w-full relative">
        <button 
            onClick={() => router.back()}
            className="absolute top-6 left-6 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-colors backdrop-blur-md"
        >
            <MdArrowBack size={24} />
        </button>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Profile Card Overlay */}
        <div className="relative -mt-24 mb-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="relative shrink-0 mx-auto md:mx-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white shadow-md overflow-hidden bg-gray-100 relative">
                <img 
                  src={profile.photoURL || '/default-avatar.png'} 
                  alt={profile.displayName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Camera Icon for Owner */}
              {isOwnProfile && (
                <>
                  <button 
                    className="absolute bottom-2 right-2 bg-gray-900 text-white border-4 border-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-sm" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <MdCameraAlt />
                  </button>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full text-center md:text-left pt-2 md:pt-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <h1 className="flex flex-col md:flex-row md:items-center gap-2 text-3xl font-extrabold text-gray-900 mb-2 justify-center md:justify-start">
                    {isEditing ? (
                      <input 
                        className="border border-gray-300 rounded-lg px-3 py-1 text-2xl font-bold w-full md:w-auto" 
                        value={editForm.displayName} 
                        onChange={(e) => setEditForm({...editForm, displayName: e.target.value})} 
                      />
                    ) : (
                      <>
                        {profile.displayName}
                        {profile.role === 'agent' && <MdVerified className="text-emerald-500 text-2xl" title="Verified Agent" />}
                      </>
                    )}
                  </h1>
                  
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-gray-500 font-medium">
                     {isEditing ? (
                        <input 
                            placeholder="City, Country"
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm" 
                            value={editForm.location} 
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
                        />
                     ) : (
                        profile.location && <span className="flex items-center gap-1"><MdLocationOn /> {profile.location}</span>
                     )}
                     <span className="flex items-center gap-1"><MdWork /> {profile.role === 'agent' ? 'Real Estate Agent' : 'Member'}</span>
                     <span className="flex items-center gap-1"><MdCalendarToday /> Joined {new Date(profile.createdAt?.seconds * 1000 || Date.now()).getFullYear()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full md:w-auto justify-center">
                  {isOwnProfile ? (
                    !isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <span className="flex items-center gap-2"><MdEdit /> Edit Profile</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleSaveChanges}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                         <span className="flex items-center gap-2"><MdSave /> Save Changes</span>
                      </button>
                    )
                  ) : (
                    <>
                      <button 
                        onClick={handleConnect}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2
                          ${isConnected 
                            ? 'bg-white border border-gray-200 text-gray-700 hover:border-red-200 hover:text-red-500' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'}`}
                      >
                        {isConnected ? <><MdPersonRemove /> Disconnect</> : <><MdPersonAdd /> Connect</>}
                      </button>
                      
                      <button 
                        onClick={handleMessage}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors shadow-lg shadow-gray-900/20 flex items-center gap-2"
                      >
                        <MdMessage /> Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="max-w-2xl mx-auto md:mx-0">
                {isEditing ? (
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                    placeholder="Write a short bio about yourself..." 
                    rows={3} 
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    {profile.bio || "This user hasn't written a bio yet."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-t border-gray-100 mt-6 px-6 md:px-10 overflow-x-auto">
            {profile.role === 'agent' && (
              <button 
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-6 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2
                  ${activeTab === 'listings' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                <MdGridOn className="text-lg" /> Active Listings ({agentListings.length})
              </button>
            )}
            <button 
              onClick={() => setActiveTab('about')}
              className={`py-4 px-6 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2
                ${activeTab === 'about' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <MdInfo className="text-lg" /> More Details
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'listings' && profile.role === 'agent' && (
            <motion.div 
              key="listings"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {agentListings.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p>No active listings found for this agent.</p>
                </div>
              ) : (
                agentListings.map(listing => (
                  <Link href={`/explore/${listing.id}`} key={listing.id} className="group">
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden bg-gray-200">
                        <img 
                          src={listing.images?.[0] || '/placeholder.png'} 
                          alt={listing.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-900 capitalize">
                          {listing.type}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="font-bold text-gray-900 mb-2 truncate group-hover:text-emerald-600 transition-colors">
                            {listing.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-4 truncate">{listing.location}</p>
                        <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4">
                          <span className="font-bold text-lg text-emerald-600">${listing.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 font-medium capitalize">{listing.status}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                      <p className="text-gray-900 font-medium mt-1">{profile.email}</p>
                   </div>
                   {profile.phoneNumber && (
                     <div className="p-4 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                        <p className="text-gray-900 font-medium mt-1">{profile.phoneNumber}</p>
                     </div>
                   )}
                   <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Status</span>
                      <p className="text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        <MdCheck /> Verified Member
                      </p>
                   </div>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-fit">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Community Stats</h3>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Connections</span>
                        <span className="font-bold text-gray-900 text-lg">
                           {/* Ideally fetch count, placeholder for now */}
                           --
                        </span>
                    </div>
                    {profile.role === 'agent' && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Total Listings</span>
                            <span className="font-bold text-gray-900 text-lg">{agentListings.length}</span>
                        </div>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}