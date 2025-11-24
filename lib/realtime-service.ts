import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc,
  increment,
  Timestamp,
  limit
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

const db = getFirestoreInstance();

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: any;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantNames: { [uid: string]: string }; // { uid1: "Name", uid2: "Name" }
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: { [uid: string]: number };
}

/**
 * 1. Get or Create Conversation
 * Checks if a chat exists between two users. If not, creates it.
 * Uses a sorted ID (uid1_uid2) to ensure uniqueness.
 */
export const getOrCreateConversation = async (
  currentUserId: string, 
  targetUserId: string, 
  currentUserName: string, 
  targetUserName: string
): Promise<string> => {
  try {
    // Create a unique ID by sorting user IDs alphabetically
    const sortedIds = [currentUserId, targetUserId].sort();
    const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;
    
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);

    if (convSnap.exists()) {
      return convSnap.id;
    } else {
      // Create new conversation document
      await setDoc(convRef, {
        participants: [currentUserId, targetUserId],
        participantNames: {
          [currentUserId]: currentUserName,
          [targetUserId]: targetUserName
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [targetUserId]: 0
        },
        createdAt: serverTimestamp()
      });
      return conversationId;
    }
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * 2. Send Message
 * Adds a message to the subcollection and updates the parent conversation stats.
 */
export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  senderName: string, 
  receiverId: string,
  text: string
) => {
  try {
    // Add message to subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      conversationId,
      senderId,
      senderName,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      read: false
    });

    // Update parent conversation (Last message + Increment unread count for receiver)
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      [`unreadCount.${receiverId}`]: increment(1)
    });

  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * 3. Listen to Messages (Real-time)
 * Returns an unsubscribe function to clean up the listener.
 */
export const listenToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date() // Handle pending server writes
      } as Message;
    });
    callback(messages);
  });

  return unsubscribe;
};

/**
 * 4. Get User's Conversation List
 * Fetches the list of chats for the sidebar.
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const convsRef = collection(db, 'conversations');
    // Query where the user is a participant
    const q = query(convsRef, where('participants', 'array-contains', userId), orderBy('lastMessageTime', 'desc'));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastMessageTime: data.lastMessageTime ? data.lastMessageTime.toDate() : new Date()
      } as Conversation;
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

/**
 * 5. Mark Messages as Read
 * Resets the unread count for the current user in a conversation.
 */
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unreadCount.${userId}`]: 0
    });
  } catch (error) {
    console.error("Error marking read:", error);
  }
};