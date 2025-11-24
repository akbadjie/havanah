'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/toast/toast';
import { listenToNotifications, listenToUnreadMessages, listenToMessages, Notification, Message } from '@/lib/realtime-service';
import { useAuth } from '@/lib/auth-store';

/**
 * Hook to listen to notifications and show toast
 */
export const useNotificationListener = (userId?: string) => {
  const toast = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    // Listen to notifications
    unsubscribeRef.current = listenToNotifications(userId, (notifications) => {
      notifications.forEach((notification) => {
        // Only show toast once per notification
        if (!shownNotificationsRef.current.has(notification.id)) {
          shownNotificationsRef.current.add(notification.id);

          if (notification.type === 'inquiry') {
            toast.success(
              `New Inquiry`,
              notification.message,
              5000
            );
          } else if (notification.type === 'message') {
            toast.info(
              `New Message`,
              notification.message,
              5000
            );
          } else if (notification.type === 'application') {
            toast.success(
              `New Application`,
              notification.message,
              5000
            );
          } else {
            toast.info(
              `${icon} ${notification.title}`,
              notification.message,
              5000
            );
          }
        }
      });
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, toast]);
};

/**
 * Hook to listen to unread message count
 */
export const useUnreadMessagesCount = (userId?: string) => {
  const toast = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (!userId) return;

    unsubscribeRef.current = listenToUnreadMessages(userId, (count) => {
      if (count > lastCountRef.current && count > 0) {
        // Show notification only when count increases
        if (count === 1) {
          toast.info('💬 New Message', 'You have a new message');
        } else {
          toast.info('💬 New Messages', `You have ${count} new messages`);
        }
      }
      lastCountRef.current = count;
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, toast]);
};


/**
 * Hook to listen to messages in a conversation and show toast for new messages
 */
export const useConversationMessages = (
  conversationId: string,
  currentUserId?: string,
  onMessage?: (message: Message) => void
) => {
  const toast = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    unsubscribeRef.current = listenToMessages(conversationId, (messages) => {
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];

        // Show toast only for new incoming messages from other users
        if (
          latestMessage.id !== lastMessageIdRef.current &&
          latestMessage.senderId !== currentUserId
        ) {
          toast.success(
            `💬 ${latestMessage.senderName}`,
            latestMessage.text,
            4000
          );
        }

        lastMessageIdRef.current = latestMessage.id;

        if (onMessage) {
          onMessage(latestMessage);
        }
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, currentUserId, toast, onMessage]);
};

/**
 * Hook to show inquiry notification (watches Firestore for new inquiries)
 */
export const useInquiryNotification = () => {
  const { user } = useAuth();
  const toast = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastInquiryIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || user.role !== 'agent') return;

    // Import here to avoid circular dependencies
    import('@/lib/firestore-service').then(({ getFirestoreInstance }) => {
      import('firebase/firestore').then(({ onSnapshot, collection, query, where, orderBy }) => {
        const db = getFirestoreInstance();
        
        try {
          const q = query(
            collection(db, 'inquiries'),
            where('agentId', '==', user.id),
            orderBy('createdAt', 'desc')
          );

          unsubscribeRef.current = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const inquiry = change.doc.data() as any;
                
                // Show toast only for truly new inquiries (not on first load)
                if (lastInquiryIdRef.current && change.doc.id !== lastInquiryIdRef.current) {
                  toast.success(
                    '🎯 New Inquiry!',
                    `${inquiry.userName} is interested in "${inquiry.listingTitle}"`,
                    6000
                  );
                }
                
                lastInquiryIdRef.current = change.doc.id;
              }
            });
          });
        } catch (error) {
          console.error('Error setting up inquiry notification:', error);
        }
      });
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, user?.role, toast]);
};

/**
 * Hook to show message notification
 */
export const useMessageNotification = () => {
  const toast = useToast();

  const showMessageNotification = useCallback((messageData: any) => {
    toast.info(
      '💬 New Message',
      `${messageData.senderName}: ${messageData.text.substring(0, 50)}...`,
      5000
    );
  }, [toast]);

  return { showMessageNotification };
};

export default {
  useNotificationListener,
  useUnreadMessagesCount,
  useConversationMessages,
  useInquiryNotification,
  useMessageNotification,
};