// lib/webrtc-service.ts
import { 
  collection, doc, addDoc, setDoc, onSnapshot, updateDoc, 
  getDoc, DocumentReference, DocumentSnapshot, 
  collectionGroup, query, where, getDocs 
} from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase';

// Use Google's free STUN servers to punch through NATs
const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

export interface CallData {
  id?: string;
  callerId: string;
  callerName: string;
  callerPhoto: string;
  calleeId: string;
  type: 'video' | 'audio';
  status: 'offering' | 'answered' | 'ended' | 'denied';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
}

// Initialize Peer Connection
export const createPeerConnection = () => {
  return new RTCPeerConnection(servers);
};

// 1. Create a Call (Caller Side)
export const createCallDoc = async (
  callerId: string, 
  callerName: string, 
  callerPhoto: string,
  calleeId: string,
  type: 'video' | 'audio'
) => {
  const db = getFirestoreInstance();
  const callDocRef = doc(collection(db, 'calls'));
  
  await setDoc(callDocRef, {
    callerId,
    callerName,
    callerPhoto,
    calleeId,
    type,
    status: 'offering',
    createdAt: new Date(),
  });

  return callDocRef.id;
};

// 2. Save Offer (Caller Side)
export const saveOffer = async (callId: string, offer: RTCSessionDescriptionInit) => {
  const db = getFirestoreInstance();
  const callDocRef = doc(db, 'calls', callId);
  await updateDoc(callDocRef, { offer });
};

// 3. Listen for Remote Answer (Caller Side)
export const listenForAnswer = (callId: string, onAnswer: (answer: RTCSessionDescriptionInit) => void) => {
  const db = getFirestoreInstance();
  return onSnapshot(doc(db, 'calls', callId), (snapshot) => {
    const data = snapshot.data();
    if (data && data.answer && !data.answerProcessed) { // Ensure we process once
       onAnswer(data.answer);
    }
  });
};

// 4. Answer Call (Callee Side)
export const answerCallDoc = async (callId: string, answer: RTCSessionDescriptionInit) => {
  const db = getFirestoreInstance();
  const callDocRef = doc(db, 'calls', callId);
  await updateDoc(callDocRef, { 
    answer,
    status: 'answered' 
  });
};

// 5. ICE Candidates Handling
export const saveCandidate = async (callId: string, candidate: RTCIceCandidate, type: 'caller' | 'callee') => {
  const db = getFirestoreInstance();
  const collectionName = type === 'caller' ? 'offerCandidates' : 'answerCandidates';
  const candidateRef = collection(db, 'calls', callId, collectionName);
  await addDoc(candidateRef, candidate.toJSON());
};

export const listenToCandidates = (callId: string, type: 'caller' | 'callee', pc: RTCPeerConnection) => {
  const db = getFirestoreInstance();
  const collectionName = type === 'caller' ? 'answerCandidates' : 'offerCandidates'; // Listen to OPPOSITE
  const q = collection(db, 'calls', callId, collectionName);

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        const candidate = new RTCIceCandidate(data as any);
        pc.addIceCandidate(candidate).catch((e) => console.error("Error adding ice candidate", e));
      }
    });
  });
};

// 6. End Call
export const endCallDoc = async (callId: string) => {
  const db = getFirestoreInstance();
  await updateDoc(doc(db, 'calls', callId), { status: 'ended' });
};

// 7. Global Listener for Incoming Calls
export const listenForIncomingCalls = (userId: string, onCall: (data: CallData) => void) => {
  const db = getFirestoreInstance();
  const q = query(
    collection(db, 'calls'), 
    where('calleeId', '==', userId),
    where('status', '==', 'offering')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onCall({ id: change.doc.id, ...change.doc.data() } as CallData);
      }
    });
  });
};