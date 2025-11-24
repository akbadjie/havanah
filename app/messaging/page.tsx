'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MdSearch, MdSend, MdArrowBack, MdPerson, MdImage, MdMoreVert, MdCheck
} from 'react-icons/md';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';
import { 
  listenToMessages, 
  sendMessage, 
  getConversations, 
  getOrCreateConversation, 
  markMessagesAsRead, 
  Message, 
  Conversation 
} from '@/lib/realtime-service';

interface UserSearchResult { 
  uid: string; 
  displayName: string; 
  photoURL?: string; 
  email: string; 
  role: 'user' | 'agent'; 
}

export default function MessagingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  // -- State --
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  
  // UI State
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);

  // 1. Handle Screen Resize (Mobile vs Desktop)
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Handle Deep Link (?id=...)
  useEffect(() => {
    const preSelectedId = searchParams.get('id');
    if (preSelectedId && user) {
      setActiveConvId(preSelectedId);
    }
  }, [searchParams, user]);

  // 3. Load Conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const convs = await getConversations(user.id);
      setConversations(convs);
    } catch (error) { 
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // 4. Listen to Active Chat Messages
  useEffect(() => {
    if (!activeConvId || !user?.id) return;
    
    // Cleanup previous listener
    if (unsubscribeMessagesRef.current) unsubscribeMessagesRef.current();

    // Start new listener
    unsubscribeMessagesRef.current = listenToMessages(activeConvId, (newMessages) => {
      setMessages(newMessages);
      markMessagesAsRead(activeConvId, user.id); // Mark as read immediately
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => { if (unsubscribeMessagesRef.current) unsubscribeMessagesRef.current(); };
  }, [activeConvId, user?.id]);

  // 5. Search Users logic
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) { 
        setSearchResults([]); 
        return; 
      }
      setIsSearching(true);
      try {
        const db = getFirestoreInstance();
        // Note: Full text search in Firestore is limited. 
        // We fetch a batch and filter client side for this demo, or rely on 'orderBy' if configured.
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(20)); // Limit to prevent massive reads
        const snapshot = await getDocs(q);
        
        const searchLower = searchQuery.toLowerCase();
        const results: UserSearchResult[] = [];

        snapshot.forEach((docSnap) => {
          if (docSnap.id !== user?.id) {
            const data = docSnap.data();
            const displayName = data.displayName || '';
            const email = data.email || '';
            
            if (displayName.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower)) {
              results.push({ 
                uid: docSnap.id, 
                displayName, 
                photoURL: data.photoURL || data.profileImage, 
                email, 
                role: data.role || 'user' 
              });
            }
          }
        });
        setSearchResults(results);
      } catch (error) { 
        console.error("Search error", error); 
      } finally { 
        setIsSearching(false); 
      }
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user?.id]);

  // 6. Actions
  const handleStartChat = async (targetUser: UserSearchResult) => {
    if (!user?.id) return;
    try {
      const convId = await getOrCreateConversation(
        user.id, 
        targetUser.uid, 
        user.displayName || 'User', 
        targetUser.displayName
      );
      
      setSearchQuery('');
      setSearchResults([]);
      await loadConversations(); // Refresh list
      setActiveConvId(convId);
    } catch (error) { 
      toast.error('Error', 'Could not start chat'); 
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || !user) return;
    
    const text = inputText;
    setInputText(''); // Optimistic clear

    try {
      // Find receiver ID
      let receiverId = conversations.find(c => c.id === activeConvId)?.participants.find(p => p !== user.id) || '';
      
      // Fallback if conversation just started and state isn't synced
      if (!receiverId) {
        await loadConversations();
        const updatedConv = conversations.find(c => c.id === activeConvId);
        receiverId = updatedConv?.participants.find(p => p !== user.id) || '';
      }

      await sendMessage(activeConvId, user.id, user.displayName || 'User', receiverId, text);
      
      // Refresh list to update 'last message' preview
      loadConversations();
    } catch (error) { 
      toast.error('Error', 'Failed to send'); 
      setInputText(text); // Revert on error
    }
  };

  const getOtherName = (conv: Conversation) => {
    if (!user?.id) return 'User';
    const otherId = conv.participants.find(p => p !== user.id);
    return otherId ? conv.participantNames[otherId] : 'User';
  };

  const handleViewProfile = () => {
    const activeConv = conversations.find(c => c.id === activeConvId);
    if (!activeConv || !user?.id) return;
    const otherId = activeConv.participants.find(p => p !== user.id);
    if (otherId) router.push(`/profile/${otherId}`);
  };

  if (!user) return <div className="flex items-center justify-center h-screen text-gray-500">Please log in to view messages.</div>;

  // -- Render --
  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white overflow-hidden relative">
      
      {/* SIDEBAR (Conversation List) */}
      <aside className={`
        w-full md:w-[380px] bg-white border-r border-gray-100 flex flex-col z-10 h-full
        ${activeConvId && isMobileView ? 'hidden' : 'block'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-2">
          {searchQuery ? (
            /* Search Results */
            <div className="flex flex-col gap-2 p-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Found Users</p>
              {isSearching ? (
                <div className="text-center py-4"><div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : searchResults.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">No users found.</p>
              ) : (
                searchResults.map(res => (
                  <div key={res.uid} onClick={() => handleStartChat(res)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <img src={res.photoURL || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{res.displayName}</h3>
                      <p className="text-xs text-emerald-600 capitalize">{res.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Conversation List */
            <div className="flex flex-col gap-1">
               {conversations.length === 0 && !isLoading ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                   <p className="text-gray-400 text-sm">No conversations yet.</p>
                   <p className="text-gray-300 text-xs mt-1">Search for a user to start chatting.</p>
                 </div>
               ) : (
                 conversations.map(conv => {
                   const otherName = getOtherName(conv);
                   const isUnread = (conv.unreadCount?.[user.id] || 0) > 0;
                   return (
                     <div 
                       key={conv.id} 
                       onClick={() => setActiveConvId(conv.id)} 
                       className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent
                         ${activeConvId === conv.id ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'hover:bg-gray-50'}
                       `}
                     >
                       {/* Avatar Placeholder/Initial */}
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                         {otherName[0]}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                           <h3 className={`text-sm truncate ${isUnread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-700'}`}>
                             {otherName}
                           </h3>
                           <span className="text-[10px] text-gray-400 whitespace-nowrap">
                             {new Date(conv.lastMessageTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </span>
                         </div>
                         <div className="flex justify-between items-center gap-2">
                           <p className={`text-xs truncate ${isUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                             {conv.lastMessage || 'Started a conversation'}
                           </p>
                           {isUnread && (
                             <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] rounded-full flex items-center justify-center shadow-sm">
                               {conv.unreadCount[user.id]}
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}
            </div>
          )}
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className={`
        flex-1 flex flex-col bg-slate-50 relative h-full
        ${!activeConvId && isMobileView ? 'hidden' : 'block'}
      `}>
        {activeConvId ? (
          <>
            {/* Chat Header */}
            <header className="px-6 py-3 bg-white border-b border-gray-100 flex justify-between items-center h-[70px] shadow-sm z-10">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900" onClick={() => setActiveConvId(null)}>
                    <MdArrowBack size={22} />
                  </button>
                )}
                <div>
                   <h3 className="font-bold text-gray-900 text-lg leading-tight">
                     {getOtherName(conversations.find(c => c.id === activeConvId)!)}
                   </h3>
                   <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                   </span>
                </div>
              </div>
              
              <div className="flex gap-1">
                 <button 
                   onClick={handleViewProfile}
                   className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors" 
                   title="View Profile"
                 >
                   <MdPerson size={22} />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                   <MdMoreVert size={22} />
                 </button>
              </div>
            </header>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 bg-[#f8f9fa] custom-scrollbar"
              style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user.id;
                const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                
                return (
                  <div key={msg.id} className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                    
                    {/* Tiny Avatar for Other */}
                    {!isMe && (
                       <div className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                          {msg.senderName[0]}
                       </div>
                    )}

                    <div className={`
                      p-3.5 rounded-2xl shadow-sm relative text-sm leading-relaxed
                      ${isMe 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                    `}>
                      <p>{msg.text}</p>
                      <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                         {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                         {isMe && <MdCheck className="text-sm" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2 bg-gray-100 rounded-3xl p-2 border border-transparent focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-md transition-all">
                <button type="button" className="p-3 text-gray-400 hover:text-emerald-500 transition-colors">
                  <MdImage size={24} />
                </button>
                
                <input 
                  type="text" 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm py-3 max-h-32" 
                />
                
                <button 
                  type="submit" 
                  disabled={!inputText.trim()} 
                  className="p-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg disabled:bg-gray-300 disabled:shadow-none transition-all"
                >
                  <MdSend size={20} className={inputText.trim() ? "translate-x-0.5" : ""} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
               <span className="text-6xl">👋</span>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Welcome to Messages</h2>
            <p className="text-gray-500 max-w-sm">
              Select a conversation from the sidebar or search for an agent to start chatting instantly.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}