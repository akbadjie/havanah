'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search } from 'lucide-react';

import { useAuth } from '@/lib/auth-store';
import {  
  getOrCreateConversation
} from '@/lib/firestore-service'; // NOTE: Path corrected based on typical project structure (previously realtime-service)
import { getConversations } from '@/lib/realtime-service';
import { getFirestoreInstance } from '@/lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

// Sub-components
import SidebarList from '@/components/messaging/SidebarList';
import ActiveChat from '@/components/messaging/ActiveChat';
import ContactInfoPanel from '@/components/messaging/ContactInfoPanel'; // IMPORTED HERE

// --- TYPES ---
interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: 'user' | 'agent';
}

// --- SUB-COMPONENT: NEW CHAT MODAL ---
const NewChatModal = ({ onClose, onStartChat }: { onClose: () => void; onStartChat: (user: UserSearchResult) => void }) => {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (queryText.length < 2) { setResults([]); return; }
    
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const db = getFirestoreInstance();
        // Simplified Client-side filtering for demo (production needs Algolia/Typesense)
        const q = query(collection(db, 'users'), limit(50));
        const snap = await getDocs(q);
        
        const hits: UserSearchResult[] = [];
        const lowerQ = queryText.toLowerCase();

        snap.forEach(doc => {
          const d = doc.data();
          if (doc.id !== user?.id && (d.displayName?.toLowerCase().includes(lowerQ) || d.email?.toLowerCase().includes(lowerQ))) {
            hits.push({ uid: doc.id, displayName: d.displayName, email: d.email, photoURL: d.photoURL || d.profileImage, role: d.role });
          }
        });
        setResults(hits);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }, 500);

    return () => clearTimeout(delay);
  }, [queryText, user?.id]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">New Conversation</h3>
          <button onClick={onClose}><X className="text-gray-500 hover:text-gray-800" /></button>
        </div>

        <div className="p-4 border-b">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input 
                autoFocus
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50"
                value={queryText}
                onChange={e => setQueryText(e.target.value)}
             />
           </div>
           
           <button className="flex items-center gap-3 w-full mt-4 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-emerald-700 font-semibold group">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
               <Users size={20} />
             </div>
             Create New Group
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
           {loading ? (
             <div className="text-center py-8 text-gray-400">Searching...</div>
           ) : results.length === 0 && queryText.length > 1 ? (
             <div className="text-center py-8 text-gray-400">No users found.</div>
           ) : (
             <div className="space-y-1">
                {results.map(u => (
                  <div key={u.uid} onClick={() => onStartChat(u)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <img src={u.photoURL || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover bg-gray-200" alt={u.displayName} />
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{u.displayName}</h4>
                      <p className="text-xs text-gray-500">{u.role}</p>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN PAGE CONTENT ---
function MessagingContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  
  // UI Flags
  const [isMobile, setIsMobile] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);

  // 1. Initial Load & Deep Links
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const paramId = searchParams.get('id');
    if (paramId) setActiveConvId(paramId);

    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams]);

  // 2. Load Conversation Data when ID changes
  useEffect(() => {
    const loadConv = async () => {
      if (!activeConvId || !user) return;
      const convs = await getConversations(user.id);
      const found = convs.find(c => c.id === activeConvId);
      if (found) setActiveConversation(found);
    };
    loadConv();
  }, [activeConvId, user]);

  // 3. Handlers
  const handleStartChat = async (target: UserSearchResult) => {
    if (!user) return;
    try {
      const convId = await getOrCreateConversation(
        user.id, 
        target.uid, 
        user.displayName || 'User', 
        target.displayName,
        user.photoURL || '',
        target.photoURL || ''
      );
      setShowNewChat(false);
      setActiveConvId(convId);
      router.push(`/messaging?id=${convId}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to find the other user's ID
  const getOtherParticipantId = () => {
    if (!activeConversation || !user) return '';
    return activeConversation.participants.find((p: string) => p !== user.id) || '';
  };

  if (!user) return <div className="h-full flex items-center justify-center">Loading Auth...</div>;

  return (
    <div className="absolute inset-0 flex h-full w-full bg-[#f0f2f5] overflow-hidden font-sans">
      
      {/* Background Ambient Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-400/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply animate-pulse" />

      {/* --- LEFT SIDEBAR (List) --- */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isMobile && activeConvId ? '-100%' : '0%', 
          width: isMobile ? '100%' : 'auto' 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`z-20 h-full bg-white flex-shrink-0 ${isMobile && activeConvId ? 'absolute inset-0' : 'relative'}`}
      >
        <SidebarList 
          activeConvId={activeConvId}
          onSelectConversation={(id) => {
            setActiveConvId(id);
            router.push(`/messaging?id=${id}`);
          }}
          onNewChat={() => setShowNewChat(true)}
        />
      </motion.aside>

      {/* --- MIDDLE (Active Chat) --- */}
      <main className={`flex-1 relative h-full flex flex-col bg-[#efeae2] ${isMobile && !activeConvId ? 'hidden' : 'flex'}`}>
        
        {/* Chat Content */}
        {activeConvId && activeConversation ? (
          <>
            <ActiveChat 
              conversation={activeConversation}
              currentUserId={user.id}
              onBack={() => {
                setActiveConvId(null);
                router.push('/messaging');
              }}
              onViewProfile={() => setShowProfilePanel(true)}
            />
            
            {/* PROFILE PANEL OVERLAY */}
            <AnimatePresence>
              {showProfilePanel && (
                 <ContactInfoPanel 
                   conversationId={activeConversation.id}
                   participantId={getOtherParticipantId()}
                   onClose={() => setShowProfilePanel(false)}
                 />
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Empty State */
          <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0" />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <div className="w-64 h-64 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mx-auto shadow-inner">
                <img src="/illustrations/chat-placeholder.svg" className="w-40 opacity-50" alt="" onError={(e) => e.currentTarget.style.display='none'} /> 
                <span className="text-6xl opacity-20">💬</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome to Messages</h1>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Send and receive messages with agents and clients securely. 
                End-to-end encrypted connection.
              </p>
              <button 
                onClick={() => setShowNewChat(true)}
                className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
              >
                Start a Conversation
              </button>
            </motion.div>
          </div>
        )}
      </main>

      {/* --- NEW CHAT MODAL --- */}
      <AnimatePresence>
        {showNewChat && (
          <NewChatModal 
            onClose={() => setShowNewChat(false)} 
            onStartChat={handleStartChat} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// --- PAGE WRAPPER (Suspense Boundary) ---
export default function MessagingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>}>
      <MessagingContent />
    </Suspense>
  );
}