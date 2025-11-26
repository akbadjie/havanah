'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UserPlus, Users, Search, ChevronRight, Bell, Ban, ThumbsDown, 
  Trash2, Phone, Video, Image as ImageIcon, FileText, Link as LinkIcon
} from 'lucide-react';

import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';
import { 
  getConversations, 
  getOrCreateConversation, 
  blockUserInConversation 
} from '@/lib/realtime-service';
import { getFirestoreInstance } from '@/lib/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';

// Sub-components
import SidebarList from '@/components/messaging/SidebarList';
import ActiveChat from '@/components/messaging/ActiveChat';

// --- TYPES ---
interface UserSearchResult {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: 'user' | 'agent';
}

// --- SUB-COMPONENT: CONTACT INFO PANEL (Right Sidebar) ---
const ContactInfoPanel = ({ 
  conversationId, 
  participants, 
  onClose 
}: { 
  conversationId: string;
  participants: { [uid: string]: any };
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links'>('media');
  
  const otherId = Object.keys(participants).find(id => id !== user?.id) || '';
  const name = participants[otherId]?.name || 'User';
  const photo = participants[otherId]?.photo || '/default-avatar.png';

  const handleBlock = async () => {
    if (confirm(`Block ${name}? They won't be able to message you.`)) {
      await blockUserInConversation(conversationId, user!.id);
      toast.success('Blocked', `${name} has been blocked.`);
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full md:w-[350px] bg-white border-l border-gray-100 h-full flex flex-col z-30 shadow-2xl"
    >
      <div className="p-4 flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 h-[60px] shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        <h2 className="font-bold text-gray-800">Contact Info</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-amber-300 mb-4 shadow-lg">
             <img src={photo} className="w-full h-full rounded-full object-cover border-4 border-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">{name}</h2>
          
          <div className="flex gap-4 mt-6 w-full justify-center">
            <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Phone size={20} /></div>
              <span className="text-xs font-medium">Audio</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Video size={20} /></div>
              <span className="text-xs font-medium">Video</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Search size={20} /></div>
              <span className="text-xs font-medium">Search</span>
            </button>
          </div>
        </div>

        <div className="h-2 bg-gray-50 -mx-6 mb-6" />

        <div className="mb-6">
          <div className="flex gap-6 border-b border-gray-100 pb-2 mb-4">
            {['media', 'files', 'links'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t as any)}
                className={`text-sm font-bold capitalize pb-2 relative ${activeTab === t ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t}
                {activeTab === t && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />}
              </button>
            ))}
          </div>
          <div className="min-h-[150px]">
             {/* Mock Content */}
             {activeTab === 'media' && <div className="text-center text-sm text-gray-400 py-4">No shared media</div>}
             {activeTab === 'files' && <div className="text-center text-sm text-gray-400 py-4">No shared files</div>}
             {activeTab === 'links' && <div className="text-center text-sm text-gray-400 py-4">No shared links</div>}
          </div>
        </div>

        <div className="h-2 bg-gray-50 -mx-6 mb-6" />

        <div className="space-y-2">
          <button onClick={handleBlock} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-xl transition-colors font-medium">
            <Ban size={20} /> Block {name}
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors font-medium">
            <Trash2 size={20} /> Delete Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
};

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
        </div>

        <div className="flex-1 overflow-y-auto p-2">
           {loading ? <div className="text-center py-8 text-gray-400">Searching...</div> : (
             <div className="space-y-1">
                {results.map(u => (
                  <div key={u.uid} onClick={() => onStartChat(u)} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                    <img src={u.photoURL || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const paramId = searchParams.get('id');
    if (paramId) setActiveConvId(paramId);

    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams]);

  useEffect(() => {
    const loadConv = async () => {
      if (!activeConvId || !user) return;
      const convs = await getConversations(user.id);
      const found = convs.find(c => c.id === activeConvId);
      if (found) setActiveConversation(found);
    };
    loadConv();
  }, [activeConvId, user]);

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
    } catch (err) { console.error(err); }
  };

  if (!user) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    // FIX: Changed from relative to FIXED positioning to anchor below navbar (top-[64px])
    // 'top-[64px]' assumes your navbar is 64px. If it's 80px, change to 'top-[80px]'.
    // This forces the messaging UI to fill the rest of the screen exactly, preventing gaps.
    <div className="fixed inset-0 top-[64px] w-full bg-[#f0f2f5] z-0 overflow-hidden font-sans flex">
      
      {/* Background Ambient Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply animate-pulse z-0" />

      {/* --- LEFT SIDEBAR (List) --- */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isMobile && activeConvId ? '-100%' : '0%', 
          width: isMobile ? '100%' : 'auto' 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`z-20 h-full bg-white flex-shrink-0 shadow-xl border-r border-gray-100 ${isMobile && activeConvId ? 'absolute inset-0' : 'relative w-[380px]'}`}
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
      <main className={`flex-1 relative h-full flex flex-col bg-[#efeae2] z-10 ${isMobile && !activeConvId ? 'hidden' : 'flex'}`}>
        {activeConvId && activeConversation ? (
          <ActiveChat 
            conversation={activeConversation}
            currentUserId={user.id}
            onBack={() => {
              setActiveConvId(null);
              router.push('/messaging');
            }}
            onViewProfile={() => setShowProfilePanel(true)}
          />
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
                 <span className="text-6xl opacity-20">💬</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome to Messages</h1>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Send and receive messages securely.
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

      {/* --- RIGHT SIDEBAR (Profile Info) --- */}
      <AnimatePresence>
        {showProfilePanel && activeConversation && (
          <div className="absolute inset-y-0 right-0 z-40 md:relative md:z-20 flex h-full">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowProfilePanel(false)}
               className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
             />
             <ContactInfoPanel 
               conversationId={activeConversation.id}
               participants={{
                 [activeConversation.participants[0]]: { 
                    name: activeConversation.participantNames[activeConversation.participants[0]],
                    photo: activeConversation.participantPhotos[activeConversation.participants[0]]
                 },
                 [activeConversation.participants[1]]: { 
                    name: activeConversation.participantNames[activeConversation.participants[1]],
                    photo: activeConversation.participantPhotos[activeConversation.participants[1]]
                 }
               }}
               onClose={() => setShowProfilePanel(false)}
             />
          </div>
        )}
      </AnimatePresence>

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

export default function MessagingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-gray-50">Loading...</div>}>
      <MessagingContent />
    </Suspense>
  );
}