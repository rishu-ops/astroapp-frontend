'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, IncomingRequest, ChatEndedInfo } from '@/store/chatStore';
import { Message } from '@/types';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const store = useChatStore();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || initialized.current) return;
    initialized.current = true;

    socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      { auth: { token: accessToken }, withCredentials: true, transports: ['websocket', 'polling'] }
    );

    socketInstance.on('connect', () => {
      console.log('[Socket] connected', socketInstance?.id);
    });

    /* ── Incoming messages ── */
    socketInstance.on('message:new', (msg: Message) => {
      store.addMessage(msg.chatId, msg);
    });

    /* ── Typing ── */
    socketInstance.on('typing:start', ({ userId, chatId }: { userId: string; chatId: string }) => {
      store.setTyping(chatId, userId, true);
    });
    socketInstance.on('typing:stop', ({ userId, chatId }: { userId: string; chatId: string }) => {
      store.setTyping(chatId, userId, false);
    });

    /* ── Astrologer busy/free/status ── */
    socketInstance.on('astrologer:busy', ({ astrologerId }: { astrologerId: string }) => {
      store.markAstroBusy(astrologerId);
    });
    socketInstance.on('astrologer:free', ({ astrologerId }: { astrologerId: string }) => {
      store.markAstroFree(astrologerId);
    });
    socketInstance.on('astrologer:status', () => {
      // triggers re-render; consumers re-fetch astrologer list
    });

    /* ── USER: chat accepted by astrologer → session started ── */
    socketInstance.on('chat:started', ({ chatId, startedAt }: { chatId: string; startedAt: string }) => {
      store.clearPendingChat();
      store.setSessionStarted(chatId, startedAt);
      // Navigate to chat room
      if (user?.role === 'user') {
        router.push(`/dashboard/chat/${chatId}`);
      } else if (user?.role === 'astrologer') {
        router.push(`/astrologer/chats/${chatId}`);
      }
    });

    /* ── USER: astrologer declined ── */
    socketInstance.on('chat:declined', ({ chatId }: { chatId: string }) => {
      store.clearPendingChat();
      store.setChatEnded({ chatId, reason: 'declined', sessionDuration: 0 });
    });

    /* ── USER: request timed out (60s) ── */
    socketInstance.on('chat:timeout', ({ chatId }: { chatId: string }) => {
      store.clearPendingChat();
      store.setChatEnded({ chatId, reason: 'timeout', sessionDuration: 0 });
    });

    /* ── USER: own cancel confirmation ── */
    socketInstance.on('chat:cancelled', ({ chatId }: { chatId: string }) => {
      store.clearPendingChat();
    });

    /* ── ASTROLOGER: incoming chat request ── */
    socketInstance.on('chat:incoming', (req: IncomingRequest) => {
      store.setIncomingRequest(req);
    });

    /* ── ASTROLOGER: request expired/cancelled (dismiss notification) ── */
    socketInstance.on('chat:request_expired', ({ chatId }: { chatId: string }) => {
      if (store.incomingRequest?.chatId === chatId) {
        store.setIncomingRequest(null);
      }
    });

    /* ── BOTH: chat ended (by either party or disconnect) ── */
    socketInstance.on('chat:ended', (info: ChatEndedInfo) => {
      store.clearSession();
      store.markAstroFree(''); // triggered via astrologer:free too
      store.setChatEnded(info);
      // Navigate away from chat room
      if (user?.role === 'user') {
        router.push('/dashboard/chat');
      } else if (user?.role === 'astrologer') {
        router.push('/astrologer/chats');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket] disconnected');
    });

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
      initialized.current = false;
    };
  }, [isAuthenticated, accessToken]); // eslint-disable-line

  /* ── Actions ── */
  const joinChat = useCallback((chatId: string) => {
    socketInstance?.emit('chat:join', chatId);
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    socketInstance?.emit('chat:leave', chatId);
  }, []);

  const requestChat = useCallback(
    (astrologerId: string): Promise<{ success?: boolean; chatId?: string; expiresAt?: string; error?: string }> =>
      new Promise((resolve) => {
        if (!socketInstance?.connected) return resolve({ error: 'Not connected' });
        socketInstance.emit('chat:request', { astrologerId }, resolve);
      }),
    []
  );

  const cancelChat = useCallback((chatId: string) => {
    socketInstance?.emit('chat:cancel', { chatId });
  }, []);

  const acceptChat = useCallback(
    (chatId: string): Promise<{ success?: boolean; error?: string }> =>
      new Promise((resolve) => {
        if (!socketInstance?.connected) return resolve({ error: 'Not connected' });
        socketInstance.emit('chat:accept', { chatId }, resolve);
      }),
    []
  );

  const declineChat = useCallback((chatId: string) => {
    socketInstance?.emit('chat:decline', { chatId });
  }, []);

  const endChat = useCallback((chatId: string) => {
    socketInstance?.emit('chat:end', { chatId });
  }, []);

  const sendMessage = useCallback(
    (chatId: string, message: string): Promise<{ success?: boolean; error?: string }> =>
      new Promise((resolve) => {
        if (!socketInstance?.connected) return resolve({ error: 'Not connected' });
        socketInstance.emit('message:send', { chatId, message }, resolve);
      }),
    []
  );

  const startTyping = useCallback((chatId: string) => {
    socketInstance?.emit('typing:start', chatId);
  }, []);

  const stopTyping = useCallback((chatId: string) => {
    socketInstance?.emit('typing:stop', chatId);
  }, []);

  return {
    socket: socketInstance,
    joinChat, leaveChat,
    requestChat, cancelChat,
    acceptChat, declineChat, endChat,
    sendMessage, startTyping, stopTyping,
  };
};
