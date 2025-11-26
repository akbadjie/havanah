import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  limit, 
  Timestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

// --- Types ---

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string; // Cached for speed
  text: string;       // For media, this might be a caption or empty
  mediaUrl?: string;  // URL for image/video/audio
  mediaDuration?: number; // For audio/video
  type: MessageType;
  isOneTimeView?: boolean; // For "view once" media
  status: MessageStatus;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  } | null;
  reactions: Reaction[];
  isEdited?: boolean;
  isDeleted?: boolean;
  timestamp: any; // Firestore Timestamp
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [uid: string]: string }; // Map uid -> name
  participantPhotos: { [uid: string]: string }; // Map uid -> photoURL
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSenderId: string;
  lastMessageType: MessageType;
  unreadCount: { [uid: string]: number };
  typingUsers: { [uid: string]: boolean }; // Real-time typing status
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  groupAdmins?: string[];
  blockedBy?: string[]; // Array of userIDs who blocked this chat (for 1:1)
}

export interface UserStatus {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  type: 'text' | 'image' | 'video';
  content: string; // Text content or Media URL
  background?: string; // For text status (hex or gradient)
  viewers: string[]; // List of userIds who saw this
  createdAt: any;
  expiresAt: any; // usually 24h later
}

// --- PRESENCE & TYPING ---

/**
 * Updates the user's online status and last seen.
 * Call this in a useEffect on the main layout.
 */
export const updateUserPresence = async (userId: string, isOnline: boolean) => {
  const db = getFirestoreInstance();
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    isOnline,
    lastSeen: serverTimestamp(),
  });
};

/**
 * Sets typing status for a specific conversation.
 */
export const setTypingStatus = async (conversationId: string, userId: string, isTyping: boolean) => {
  const db = getFirestoreInstance();
  const convRef = doc(db, 'conversations', conversationId);
  // We use dot notation to update a specific key in the map
  await updateDoc(convRef, {
    [`typingUsers.${userId}`]: isTyping
  });
};

// --- MESSAGING ---

/**
 * Sends a message (Text, Media, Audio, etc.)
 */
export const sendMessage = async (
  conversationId: string, 
  senderId: string, 
  senderName: string, 
  receiverIds: string[], // For unread count updates
  content: string,
  type: MessageType = 'text',
  mediaUrl?: string,
  mediaDuration?: number,
  replyTo?: Message['replyTo'],
  isOneTimeView: boolean = false
) => {
  const db = getFirestoreInstance();

  // 1. Check if blocked (simple check, robust check should be security rule or distinct function)
  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  if (convSnap.exists()) {
    const data = convSnap.data() as Conversation;
    if (data.blockedBy && data.blockedBy.length > 0) {
      throw new Error("Cannot send message to this conversation.");
    }
  }

  // 2. Prepare Message Data
  const newMessage: any = {
    conversationId,
    senderId,
    senderName,
    text: content,
    type,
    status: 'sent', // Initial status
    reactions: [],
    timestamp: serverTimestamp(),
  };

  if (mediaUrl) newMessage.mediaUrl = mediaUrl;
  if (mediaDuration) newMessage.mediaDuration = mediaDuration;
  if (replyTo) newMessage.replyTo = replyTo;
  if (isOneTimeView) newMessage.isOneTimeView = true;

  // 3. Add to Subcollection
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(messagesRef, newMessage);

  // 4. Update Conversation Document (Last Message, Unread Counts)
  const updates: any = {
    lastMessage: type === 'text' ? content : `Sent a ${type}`,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: senderId,
    lastMessageType: type,
  };

  // Increment unread for all *other* participants
  // We need to fetch current unread counts first to increment atomicity or use `increment` (simpler)
  // For this demo, we assume we have the logic to map `receiverIds`
  receiverIds.forEach(id => {
    if (id !== senderId) {
      // Note: Firestore doesn't support dynamic key variable in increment easily inside one object 
      // without 'updateDoc' dot notation. 
      // Ideally, use a batch or separate update. 
      // For simplicity here, we rely on the UI to calculate or a cloud function.
      // But we can try dot notation:
      updates[`unreadCount.${id}`] = (convSnap.data()?.unreadCount?.[id] || 0) + 1;
    }
  });

  await updateDoc(convRef, updates);
};

/**
 * Listens to messages in real-time.
 */
export const listenToMessages = (conversationId: string, callback: (msgs: Message[]) => void) => {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};

/**
 * Marks specific messages as 'read' or 'delivered'.
 * 
 * Logic:
 * 1. When user opens chat -> mark 'delivered' messages from others as 'read'.
 * 2. When user loads chat list -> mark 'sent' messages from others as 'delivered'.
 */
export const updateMessageStatus = async (
  conversationId: string, 
  userId: string, // Current user
  status: 'delivered' | 'read'
) => {
  const db = getFirestoreInstance();
  const msgsRef = collection(db, 'conversations', conversationId, 'messages');
  
  // Find messages NOT sent by me, and status is 'less' than current status
  // Note: Firestore limitations on inequality operators.
  // We'll fetch the last 20 messages and update them client side filtering
  
  const q = query(msgsRef, orderBy('timestamp', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  
  const batch = []; // In real app use writeBatch()
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as Message;
    if (data.senderId !== userId) {
      // Logic for status progression: sent -> delivered -> read
      if (status === 'read' && data.status !== 'read') {
        await updateDoc(docSnap.ref, { status: 'read' });
      } else if (status === 'delivered' && data.status === 'sent') {
        await updateDoc(docSnap.ref, { status: 'delivered' });
      }
    }
  }

  // Reset unread count if reading
  if (status === 'read') {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unreadCount.${userId}`]: 0
    });
  }
};

/**
 * Delete a message (Soft delete)
 */
export const deleteMessage = async (conversationId: string, messageId: string) => {
  const db = getFirestoreInstance();
  const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await updateDoc(msgRef, {
    isDeleted: true,
    text: 'This message was deleted',
    mediaUrl: null,
    type: 'text' // reset type
  });
};

// --- CONVERSATIONS ---

export const getOrCreateConversation = async (
  currentUserId: string, 
  targetUserId: string,
  currentUserName: string,
  targetUserName: string,
  currentUserPhoto?: string,
  targetUserPhoto?: string
) => {
  const db = getFirestoreInstance();
  // 1. Check if exists (query for array-contains won't work perfectly for exact match of 2 arrays)
  // We query where 'participants' array-contains currentUserId, then filter client side
  const q = query(
    collection(db, 'conversations'), 
    where('participants', 'array-contains', currentUserId),
    where('isGroup', '==', false)
  );
  
  const snapshot = await getDocs(q);
  const existing = snapshot.docs.find(doc => {
    const data = doc.data();
    return data.participants.includes(targetUserId);
  });

  if (existing) return existing.id;

  // 2. Create New
  const newConv = {
    participants: [currentUserId, targetUserId],
    participantNames: {
      [currentUserId]: currentUserName,
      [targetUserId]: targetUserName
    },
    participantPhotos: {
      [currentUserId]: currentUserPhoto || '',
      [targetUserId]: targetUserPhoto || ''
    },
    lastMessage: '',
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: '',
    lastMessageType: 'text',
    unreadCount: {
      [currentUserId]: 0,
      [targetUserId]: 0
    },
    typingUsers: {},
    isGroup: false,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'conversations'), newConv);
  return docRef.id;
};

export const createGroupConversation = async (
  adminId: string, 
  userIds: string[], 
  userNames: { [id: string]: string },
  userPhotos: { [id: string]: string },
  groupName: string,
  groupImage?: string
) => {
  const db = getFirestoreInstance();
  const allParticipants = [adminId, ...userIds];
  
  const newGroup = {
    participants: allParticipants,
    participantNames: userNames,
    participantPhotos: userPhotos,
    lastMessage: `${userNames[adminId]} created group "${groupName}"`,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: adminId,
    lastMessageType: 'text',
    unreadCount: allParticipants.reduce((acc, id) => ({...acc, [id]: 0}), {}),
    typingUsers: {},
    isGroup: true,
    groupName,
    groupImage: groupImage || '',
    groupAdmins: [adminId],
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'conversations'), newGroup);
  return docRef.id;
};

export const listenToConversations = (userId: string, callback: (convs: Conversation[]) => void) => {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const convs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[];
    callback(convs);
  });
};

/**
 * Fetch conversations once (non-real-time) for the given user.
 * Useful for initial data loading.
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Conversation[];
};

// --- STATUS / STORIES ---

export const addStatus = async (
  userId: string,
  userName: string,
  userPhoto: string,
  content: string, // Text or URL
  type: 'text' | 'image' | 'video',
  background?: string
) => {
  const db = getFirestoreInstance();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  await addDoc(collection(db, 'statuses'), {
    userId,
    userName,
    userPhoto,
    content,
    type,
    background: background || null,
    viewers: [],
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expires)
  });
};

/**
 * Get statuses for all my connections (simplified: fetching all active statuses)
 * In production, you would filter by connections.
 */
export const listenToStatuses = (callback: (statuses: UserStatus[]) => void) => {
  const db = getFirestoreInstance();
  const now = Timestamp.now();

  const q = query(
    collection(db, 'statuses'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc') // Firestore requires index for this
  );

  return onSnapshot(q, (snapshot) => {
    const statuses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserStatus[];
    callback(statuses);
  });
};

export const viewStatus = async (statusId: string, userId: string) => {
  const db = getFirestoreInstance();
  const statusRef = doc(db, 'statuses', statusId);
  await updateDoc(statusRef, {
    viewers: arrayUnion(userId)
  });
};

// --- BLOCKING ---

export const blockUserInConversation = async (conversationId: string, userId: string) => {
  const db = getFirestoreInstance();
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    blockedBy: arrayUnion(userId)
  });
};

export const unblockUserInConversation = async (conversationId: string, userId: string) => {
  const db = getFirestoreInstance();
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    blockedBy: arrayRemove(userId)
  });
};