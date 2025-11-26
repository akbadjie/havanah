'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Phone, Video, Search, Bell, 
  ImageIcon, Ban, ThumbsDown, Trash2, FileText, Link as LinkIcon,
  MoreVertical, X, Share2, Star
} from 'lucide-react';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';

// --- Local Imports ---
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';
import { useCall } from '@/context/CallContext'; // Importing Call Context
import { 
  blockUserInConversation, 
  deleteConversation, 
  reportUser, 
  Message 
} from '@/lib/firestore-service';
import ActionModal, { ActionType } from '../popup/ActionModal'; 

interface ContactInfoPanelProps {
  conversationId: string;
  participantId: string;
  onClose: () => void;
}

interface UserProfile {
  displayName: string;
  photoURL?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  bio?: string;
}

export default function ContactInfoPanel({ 
  conversationId, 
  participantId, 
  onClose 
}: ContactInfoPanelProps) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { startCall } = useCall(); // Hook for calling
  
  // --- Data State ---
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links'>('media');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sharedMedia, setSharedMedia] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI State ---
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- Modal State ---
  const [modalType, setModalType] = useState<ActionType>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // 0. Click Outside to Close Menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Fetch User Profile & Shared Media
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const db = getFirestoreInstance();
        
        // A. Fetch Profile
        const userDoc = await getDoc(doc(db, 'users', participantId));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }

        // B. Fetch Shared Media
        const msgsRef = collection(db, 'conversations', conversationId, 'messages');
        const mediaQuery = query(
          msgsRef, 
          where('type', 'in', ['image', 'video']),
          orderBy('timestamp', 'desc')
        );
        
        const mediaSnap = await getDocs(mediaQuery);
        const mediaData = mediaSnap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
        setSharedMedia(mediaData);

      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (participantId && conversationId) {
      fetchData();
    }
  }, [participantId, conversationId]);

  // 2. Unified Action Handler
  const handleConfirmAction = async (reportReason?: string) => {
    if (!profile || !user) return;
    
    setIsProcessingAction(true);

    try {
      if (modalType === 'block') {
        await blockUserInConversation(conversationId, user.id);
        toast.success('Blocked', `${profile.displayName} has been blocked.`);
        onClose(); 
      } 
      else if (modalType === 'delete') {
        await deleteConversation(conversationId);
        toast.success('Deleted', 'Conversation deleted successfully.');
        onClose(); 
        router.push('/messaging'); 
      } 
      else if (modalType === 'report') {
        if (!reportReason) {
            toast.error('Error', 'A reason is required to report.');
            return;
        }
        await reportUser(user.id, participantId, reportReason);
        toast.success('Report Sent', 'We have received your report.');
      }

    } catch (error) {
      console.error(error);
      toast.error('Error', `Failed to ${modalType} user.`);
    } finally {
      setIsProcessingAction(false);
      setModalType(null); 
    }
  };

  // 3. Swipe to Close Handler
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) onClose();
  };

  // 4. Fallback Display Data
  const displayName = profile?.displayName || 'User';
  const photoURL = profile?.photoURL || '/default-avatar.png';
  const subText = profile?.email || profile?.phoneNumber || 'No contact info';

  return (
    <>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }} 
        onDragEnd={handleDragEnd}
        className="absolute inset-0 z-40 bg-[#fafafa] flex flex-col h-full w-full shadow-2xl"
      >
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
              <ArrowLeft size={22} />
            </button>
            <h2 className="text-lg font-bold text-gray-800">Contact Info</h2>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-emerald-50 rounded-full text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <MoreVertical size={22} />
            </button>

            {/* Custom Dropdown */}
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 ring-1 ring-black/5 flex flex-col overflow-hidden z-50 origin-top-right"
                >
                   <button className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 transition-colors text-left">
                     <Share2 size={16} /> Share Contact
                   </button>
                   <button className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-sm text-gray-700 transition-colors text-left">
                     <Star size={16} /> Add to Favorites
                   </button>
                   <div className="h-px bg-gray-100 mx-2 my-1" />
                   <button 
                     onClick={() => { setModalType('block'); setShowMenu(false); }}
                     className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-medium transition-colors text-left"
                   >
                     <Ban size={16} /> Block User
                   </button>
                   <button 
                     onClick={() => { setModalType('report'); setShowMenu(false); }}
                     className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-medium transition-colors text-left"
                   >
                     <ThumbsDown size={16} /> Report
                   </button>
                   <button 
                     onClick={() => { setModalType('delete'); setShowMenu(false); }}
                     className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-medium transition-colors text-left"
                   >
                     <Trash2 size={16} /> Delete Chat
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[#fafafa]">
          
          {/* Profile Section with 3D-ish feel */}
          <div className="bg-white pb-8 pt-6 rounded-b-[40px] shadow-sm mb-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-100/50 to-amber-100/50" />

            <div className="flex flex-col items-center relative z-10 px-6">
              <motion.div 
                layoutId={`avatar-${participantId}`}
                className="w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-emerald-400 via-emerald-200 to-amber-300 mb-4 shadow-xl shadow-emerald-900/10"
              >
                 <img src={photoURL} className="w-full h-full rounded-full object-cover border-4 border-white bg-gray-100" alt={displayName} />
              </motion.div>
              
              {isLoading ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 text-center tracking-tight">{displayName}</h2>
                  <p className="text-gray-500 text-sm font-medium mt-1">{subText}</p>
                  {profile?.role && (
                    <span className="mt-3 px-4 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-white">
                      {profile.role}
                    </span>
                  )}
                </>
              )}
              
              {/* Quick Actions (Functional) */}
              <div className="flex gap-6 mt-8 w-full justify-center">
                <button 
                  onClick={() => startCall(participantId, 'audio')}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all shadow-lg shadow-gray-200/50 text-emerald-600">
                    <Phone size={24} className="fill-current" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-600">Audio</span>
                </button>

                <button 
                  onClick={() => startCall(participantId, 'video')}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all shadow-lg shadow-gray-200/50 text-emerald-600">
                    <Video size={24} className="fill-current" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-600">Video</span>
                </button>

                <button className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all shadow-lg shadow-gray-200/50 text-emerald-600">
                    <Search size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-600">Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs: Media / Files / Links */}
          <div className="px-6 mb-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-8 border-b border-gray-100 pb-0 mb-4">
                {['media', 'files', 'links'].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`text-sm font-bold capitalize pb-3 relative transition-colors ${activeTab === t ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {t}
                    {activeTab === t && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
                  </button>
                ))}
              </div>

              <div className="min-h-[150px]">
                {activeTab === 'media' && (
                  sharedMedia.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {sharedMedia.map(msg => (
                        <div key={msg.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group">
                          {msg.type === 'video' ? (
                            <video src={msg.mediaUrl} className="w-full h-full object-cover" />
                          ) : (
                            <img src={msg.mediaUrl} className="w-full h-full object-cover" alt="Media" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                         <ImageIcon size={20} className="opacity-50" />
                      </div>
                      <p className="text-xs font-medium">No shared media</p>
                    </div>
                  )
                )}

                {activeTab === 'files' && (
                   <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                     <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <FileText size={20} className="opacity-50" />
                     </div>
                     <p className="text-xs font-medium">No shared files</p>
                   </div>
                )}
                 {activeTab === 'links' && (
                   <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                     <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <LinkIcon size={20} className="opacity-50" />
                     </div>
                     <p className="text-xs font-medium">No shared links</p>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Buttons */}
          <div className="px-6 mb-8 space-y-3">
             <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
               <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                 <div className="flex items-center gap-4 text-gray-700">
                   <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Bell size={18} /></div>
                   <span className="font-semibold text-sm">Mute Notifications</span>
                 </div>
                 <div className="w-10 h-5 bg-gray-200 rounded-full relative transition-colors">
                   <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm transition-transform" />
                 </div>
               </button>
               <div className="h-px bg-gray-50 mx-4" />
               <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                 <div className="flex items-center gap-4 text-gray-700">
                   <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ImageIcon size={18} /></div>
                   <span className="font-semibold text-sm">Save to Camera Roll</span>
                 </div>
                 <div className="w-10 h-5 bg-emerald-500 rounded-full relative transition-colors">
                   <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm transition-transform" />
                 </div>
               </button>
             </div>
          </div>

          {/* Danger Zone (Secondary access if user misses the 3 dots) */}
          <div className="px-6 pb-12">
             <button 
                onClick={() => setModalType('block')}
                className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mb-2"
             >
                <Ban size={18} /> Block {displayName.split(' ')[0]}
             </button>
             <p className="text-[10px] text-center text-gray-400">
                Blocking this user will prevent them from messaging or calling you.
             </p>
          </div>
        </div>
      </motion.div>

      {/* --- RENDER MODAL --- */}
      <ActionModal 
        isOpen={!!modalType}
        type={modalType}
        displayName={displayName}
        isLoading={isProcessingAction}
        onClose={() => setModalType(null)}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}