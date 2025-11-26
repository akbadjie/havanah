'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-store';
import { 
  createPeerConnection, 
  createCallDoc, 
  listenForAnswer, 
  saveOffer, 
  saveCandidate, 
  listenForIncomingCalls, 
  answerCallDoc, 
  listenToCandidates,
  endCallDoc,
  CallData
} from '@/lib/webrtc-service';
import ActiveCall from '@/components/messaging/ActiveCall';
import IncomingCall from '@/components/messaging/IncomingCall';

interface CallContextType {
  startCall: (calleeId: string, type: 'video' | 'audio') => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => useContext(CallContext)!;

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  // Call State
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  
  // Streams & PC
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  // 1. Initialize Peer Connection Helper
  const setupPeerConnection = () => {
    pc.current = createPeerConnection();

    // Handle Remote Stream
    pc.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        setRemoteStream((prev) => {
           if(!prev) return event.streams[0];
           // If stream already exists, ensure tracks are added (rare case)
           return prev; 
        });
      });
    };

    return pc.current;
  };

  // 2. Cleanup Function
  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
  };

  // 3. Start a Call (Caller)
  const startCall = async (calleeId: string, type: 'video' | 'audio') => {
    if (!user) return;
    
    // Setup Local Stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: type === 'video',
      audio: true
    });
    setLocalStream(stream);

    // Setup PC
    const connection = setupPeerConnection();
    stream.getTracks().forEach(track => connection.addTrack(track, stream));

    // Create Call Doc
    const callId = await createCallDoc(user.id, user.displayName || 'User', user.photoURL || '', calleeId, type);
    setActiveCall({ id: callId, callerId: user.id, callerName: 'Me', callerPhoto: '', calleeId, type, status: 'offering' });

    // Handle ICE Candidates (Caller Side)
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        saveCandidate(callId, event.candidate, 'caller');
      }
    };

    // Create Offer
    const offerDescription = await connection.createOffer();
    await connection.setLocalDescription(offerDescription);
    
    await saveOffer(callId, { type: offerDescription.type, sdp: offerDescription.sdp! });

    // Listen for Answer
    listenForAnswer(callId, (answer) => {
      if (!connection.currentRemoteDescription) {
        const rtcSession = new RTCSessionDescription(answer);
        connection.setRemoteDescription(rtcSession);
      }
    });

    // Listen for Callee Candidates
    listenToCandidates(callId, 'caller', connection);
  };

  // 4. Listen for Incoming (Global)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenForIncomingCalls(user.id, (data) => {
      // Only accept if not already in a call
      if (!activeCall && !incomingCall) {
        setIncomingCall(data);
        // Play Ringtone
        const audio = new Audio('/sounds/ringtone.mp3'); // Ensure file exists
        audio.loop = true;
        audio.play().catch(() => {});
        (window as any).ringtoneAudio = audio;
      }
    });
    return () => unsubscribe();
  }, [user, activeCall, incomingCall]);

  // 5. Answer Incoming Call
  const handleAnswer = async () => {
    if (!incomingCall || !user) return;
    
    // Stop Ringtone
    if ((window as any).ringtoneAudio) {
      (window as any).ringtoneAudio.pause();
      (window as any).ringtoneAudio = null;
    }

    // Setup Local Stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: incomingCall.type === 'video',
      audio: true
    });
    setLocalStream(stream);

    const connection = setupPeerConnection();
    stream.getTracks().forEach(track => connection.addTrack(track, stream));

    const callId = incomingCall.id!;
    setActiveCall({ ...incomingCall, status: 'answered' });
    setIncomingCall(null);

    // Handle ICE Candidates (Callee Side)
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        saveCandidate(callId, event.candidate, 'callee');
      }
    };

    // Set Remote Description (Offer)
    // It's possible the incoming call document was received before the caller saved the offer.
    // Poll the call document briefly until the offer exists (or timeout) to avoid passing null to RTCSessionDescription.
    try {
      const { getFirestoreInstance } = await import('@/lib/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      const db = getFirestoreInstance();
      const callRef = doc(db, 'calls', callId);

      let callSnap = await getDoc(callRef);
      let offer = callSnap.data()?.offer as RTCSessionDescriptionInit | undefined | null;

      const start = Date.now();
      while ((!offer || !offer.type) && Date.now() - start < 10000) {
        // wait 400ms then re-check
        await new Promise((r) => setTimeout(r, 400));
        callSnap = await getDoc(callRef);
        offer = callSnap.data()?.offer as RTCSessionDescriptionInit | undefined | null;
      }

      if (!offer || !offer.type) {
        console.error('No offer available on call document; cannot answer call', callId);
        // Clean up and bail out
        cleanupCall();
        return;
      }

      await connection.setRemoteDescription(new RTCSessionDescription(offer));
    } catch (err) {
      console.error('Error fetching offer for call', err);
      cleanupCall();
      return;
    }

    // Create Answer
    const answerDescription = await connection.createAnswer();
    await connection.setLocalDescription(answerDescription);

    await answerCallDoc(callId, { type: answerDescription.type, sdp: answerDescription.sdp! });

    // Listen for Caller Candidates
    listenToCandidates(callId, 'callee', connection);
  };

  const handleReject = async () => {
    if (incomingCall?.id) {
       await endCallDoc(incomingCall.id);
    }
    if ((window as any).ringtoneAudio) {
      (window as any).ringtoneAudio.pause();
      (window as any).ringtoneAudio = null;
    }
    setIncomingCall(null);
  };

  const handleEndCall = async () => {
    if (activeCall?.id) {
      await endCallDoc(activeCall.id);
    }
    cleanupCall();
  };

  return (
    <CallContext.Provider value={{ startCall }}>
      {children}
      
      {incomingCall && (
        <IncomingCall 
          callerName={incomingCall.callerName}
          callerPhoto={incomingCall.callerPhoto}
          type={incomingCall.type}
          onAnswer={handleAnswer}
          onReject={handleReject}
        />
      )}

      {activeCall && (
        <ActiveCall 
          localStream={localStream}
          remoteStream={remoteStream}
          isVideo={activeCall.type === 'video'}
          onEndCall={handleEndCall}
          callerName={activeCall.callerName === 'Me' ? 'Calling...' : activeCall.callerName}
          status={activeCall.status}
        />
      )}
    </CallContext.Provider>
  );
};