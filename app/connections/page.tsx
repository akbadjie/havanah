'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdSearch, 
  MdMessage, 
  MdPerson, 
  MdPersonRemove, 
  MdVerified,
  MdOutlineSentimentDissatisfied
} from 'react-icons/md';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';
import { getUserConnections, toggleConnection, UserProfile } from '@/lib/user-service';
import { getOrCreateConversation } from '@/lib/realtime-service';

export default function ConnectionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  // 1. Fetch Connections on Load
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const data = await getUserConnections(user.id);
        setConnections(data);
      } catch (error) {
        console.error(error);
        toast.error('Error', 'Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, toast]);

  // 2. Handle Message Action
  const handleMessage = async (targetUser: UserProfile) => {
    if (!user?.id) return;
    try {
      // Create or retrieve existing conversation ID
      const conversationId = await getOrCreateConversation(
        user.id, 
        targetUser.uid, 
        user.displayName || 'User', 
        targetUser.displayName
      );
      // Redirect to the dynamic messaging route
      router.push(`/messaging?id=${conversationId}`);
    } catch (error) {
      toast.error('Error', 'Could not start conversation.');
    }
  };

  // 3. Handle Disconnect Action
  const handleRemove = async (targetUserId: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to remove this connection?')) return;

    setRemovingId(targetUserId);
    try {
      // Toggle connection to false (remove)
      await toggleConnection(user.id, targetUserId, true); // true = currently connected
      
      // Update UI locally
      setConnections(prev => prev.filter(c => c.uid !== targetUserId));
      toast.success('Removed', 'Connection removed successfully.');
    } catch (error) {
      toast.error('Error', 'Failed to remove connection.');
    } finally {
      setRemovingId(null);
    }
  };

  // Filter based on search
  const filteredConnections = connections.filter(c => 
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Connections</h1>
          <p className="text-gray-500">Manage your network of agents and clients.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input 
            type="text" 
            placeholder="Search connections..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredConnections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <MdOutlineSentimentDissatisfied className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-600">No connections found</h3>
          <p className="text-gray-400">
            {searchQuery ? "Try a different search term." : "Visit agent profiles to connect!"}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => router.push('/explore')}
              className="mt-6 px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Explore Agents
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredConnections.map((profile) => (
              <motion.div
                key={profile.uid}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
              >
                {/* Avatar */}
                <div className="relative w-24 h-24 mb-4">
                  <img 
                    src={profile.photoURL || '/default-avatar.png'} 
                    alt={profile.displayName} 
                    className="w-full h-full rounded-full object-cover border-4 border-gray-50 group-hover:border-emerald-50 transition-colors"
                  />
                  {profile.role === 'agent' && (
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm" title="Verified Agent">
                      <MdVerified className="text-emerald-500 text-xl" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate w-full">
                  {profile.displayName}
                </h3>
                <p className="text-sm text-gray-500 mb-6 capitalize bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                  {profile.role || 'Member'}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full mt-auto">
                  <button 
                    onClick={() => handleMessage(profile)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                  >
                    <MdMessage /> Chat
                  </button>
                  <button 
                    onClick={() => router.push(`/profile/${profile.uid}`)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                    title="View Profile"
                  >
                    <MdPerson className="text-lg" />
                  </button>
                  <button 
                    onClick={() => handleRemove(profile.uid)}
                    disabled={removingId === profile.uid}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove Connection"
                  >
                    <MdPersonRemove className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}