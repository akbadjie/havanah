'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdPerson, 
  MdLock, 
  MdNotifications, 
  MdDelete, 
  MdSave, 
  MdCameraAlt,
  MdCheckCircle,
  MdWarning,
  MdLogout
} from 'react-icons/md';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestoreInstance, getAuthInstance, getStorageInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const db = getFirestoreInstance();
  const auth = getAuthInstance();
  const storage = getStorageInstance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- State --
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    location: '',
    bio: ''
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    browserPush: false,
    smsAlerts: true
  });

  // 1. Load Data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // -- Handlers --

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user?.id) return;
    const file = e.target.files[0];
    const toastId = toast.loading("Uploading", "Updating profile picture...");

    try {
      const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', user.id), { photoURL: url });
      
      toast.remove(toastId);
      toast.success("Success", "Avatar updated. Please refresh to see changes.");
    } catch (error) {
      toast.remove(toastId);
      toast.error("Error", "Failed to upload image.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        bio: formData.bio
      });
      toast.success("Saved", "Profile updated successfully.");
    } catch (error) {
      toast.error("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Email Sent", `Reset link sent to ${user.email}`);
    } catch (error: any) {
      toast.error("Error", error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure? This action cannot be undone and will delete all your data.");
    if (!confirmed || !auth.currentUser || !user?.id) return;

    try {
      // 1. Delete Firestore Data
      await deleteDoc(doc(db, 'users', user.id));
      // 2. Delete Auth User
      await deleteUser(auth.currentUser);
      
      router.push('/');
      toast.success("Goodbye", "Your account has been deleted.");
    } catch (error: any) {
      toast.error("Error", "Requires recent login. Please log out and log in again.");
    }
  };

  if (!user) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-500">Manage your profile, security preferences, and account data.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          
          {/* Sidebar Tabs */}
          <aside className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-white/50'}`}
            >
              <MdPerson size={20} /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-white/50'}`}
            >
              <MdLock size={20} /> Security
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:bg-white/50'}`}
            >
              <MdNotifications size={20} /> Notifications
            </button>
          </aside>

          {/* Main Content */}
          <main className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[500px]">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Public Profile</h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-24 h-24">
                    <img 
                      src={user.photoURL || '/default-avatar.png'} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover border-4 border-gray-50 shadow-inner" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full hover:scale-110 transition-transform cursor-pointer"
                    >
                      <MdCameraAlt />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Profile Picture</h3>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                      <input 
                        name="displayName" value={formData.displayName} onChange={handleInputChange} 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                      <input 
                        name="location" value={formData.location} onChange={handleInputChange} 
                        placeholder="City, Country"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                      <input 
                        disabled value={user.email || ''} 
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                      <input 
                        name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleInputChange} rows={4}
                      placeholder="Tell us a little about yourself..."
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none" 
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" disabled={loading}
                      className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Login & Security</h2>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Password</h3>
                      <p className="text-sm text-gray-500">Last changed: Never</p>
                    </div>
                    <button 
                      onClick={handlePasswordReset}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                    >
                      Reset Password
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    We will send a password reset link to <strong>{user.email}</strong>.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                  <h3 className="font-bold text-gray-900 mb-2">Account Type</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                      {user.role}
                    </span>
                    <span className="text-sm text-gray-500">
                      {user.role === 'agent' ? 'You have access to agent tools.' : 'You are a standard member.'}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2"><MdWarning /> Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
                
                <div className="space-y-4">
                   {/* Toggle Item */}
                   <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <h3 className="font-bold text-gray-900">Email Updates</h3>
                        <p className="text-sm text-gray-500">Receive booking confirmations and newsletters.</p>
                      </div>
                      <div 
                        onClick={() => setNotifications(p => ({...p, emailUpdates: !p.emailUpdates}))}
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications.emailUpdates ? 'bg-emerald-500' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${notifications.emailUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                   </div>

                   {/* Toggle Item */}
                   <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <h3 className="font-bold text-gray-900">SMS Alerts</h3>
                        <p className="text-sm text-gray-500">Get notified instantly for new messages.</p>
                      </div>
                      <div 
                        onClick={() => setNotifications(p => ({...p, smsAlerts: !p.smsAlerts}))}
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications.smsAlerts ? 'bg-emerald-500' : 'bg-gray-200'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${notifications.smsAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                   </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-xl flex items-start gap-3">
                   <MdCheckCircle className="text-xl shrink-0 mt-0.5" />
                   <p className="text-sm">Settings saved automatically to local preferences.</p>
                </div>
              </motion.div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}