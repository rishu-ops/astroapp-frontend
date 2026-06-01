import { create } from 'zustand';
import { Message } from '@/types';

export interface IncomingRequest {
  chatId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  requestedAt: string;
  expiresAt: string;
}

export interface ChatEndedInfo {
  chatId: string;
  reason: string;
  sessionDuration: number;
}

interface ChatState {
  /* Messaging */
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;

  /* Chat request flow — USER side */
  pendingChatId: string | null;
  pendingAstrologerId: string | null;
  pendingExpiresAt: string | null;

  /* Active session */
  sessionChatId: string | null;
  sessionStartedAt: string | null;

  /* End notification */
  chatEndedInfo: ChatEndedInfo | null;

  /* ASTROLOGER side */
  incomingRequest: IncomingRequest | null;

  /* Busy astrologers (real-time from socket) */
  busyAstrologerIds: Set<string>;

  /* Actions */
  setActiveChatId: (id: string | null) => void;
  addMessage: (chatId: string, msg: Message) => void;
  setMessages: (chatId: string, msgs: Message[]) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;

  setPendingChat: (chatId: string, astrologerId: string, expiresAt: string) => void;
  clearPendingChat: () => void;

  setSessionStarted: (chatId: string, startedAt: string) => void;
  clearSession: () => void;

  setChatEnded: (info: ChatEndedInfo) => void;
  clearChatEnded: () => void;

  setIncomingRequest: (req: IncomingRequest | null) => void;

  markAstroBusy: (astrologerId: string) => void;
  markAstroFree: (astrologerId: string) => void;
  setAstroOnline: (astrologerId: string, online: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  messages: {},
  typingUsers: {},
  pendingChatId: null,
  pendingAstrologerId: null,
  pendingExpiresAt: null,
  sessionChatId: null,
  sessionStartedAt: null,
  chatEndedInfo: null,
  incomingRequest: null,
  busyAstrologerIds: new Set(),

  setActiveChatId: (id) => set({ activeChatId: id }),

  addMessage: (chatId, msg) =>
    set((s) => {
      const existing = s.messages[chatId] || [];
      if (existing.some((m) => m._id === msg._id)) return s;
      return { messages: { ...s.messages, [chatId]: [...existing, msg] } };
    }),

  setMessages: (chatId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [chatId]: msgs } })),

  setTyping: (chatId, userId, isTyping) =>
    set((s) => {
      const cur = s.typingUsers[chatId] || [];
      const updated = isTyping ? [...new Set([...cur, userId])] : cur.filter((id) => id !== userId);
      return { typingUsers: { ...s.typingUsers, [chatId]: updated } };
    }),

  setPendingChat: (chatId, astrologerId, expiresAt) =>
    set({ pendingChatId: chatId, pendingAstrologerId: astrologerId, pendingExpiresAt: expiresAt }),

  clearPendingChat: () =>
    set({ pendingChatId: null, pendingAstrologerId: null, pendingExpiresAt: null }),

  setSessionStarted: (chatId, startedAt) =>
    set({ sessionChatId: chatId, sessionStartedAt: startedAt }),

  clearSession: () =>
    set({ sessionChatId: null, sessionStartedAt: null }),

  setChatEnded: (info) => set({ chatEndedInfo: info }),
  clearChatEnded: () => set({ chatEndedInfo: null }),

  setIncomingRequest: (req) => set({ incomingRequest: req }),

  markAstroBusy: (astrologerId) =>
    set((s) => ({ busyAstrologerIds: new Set([...s.busyAstrologerIds, astrologerId]) })),

  markAstroFree: (astrologerId) =>
    set((s) => {
      const next = new Set(s.busyAstrologerIds);
      next.delete(astrologerId);
      return { busyAstrologerIds: next };
    }),

  setAstroOnline: () => set({}), // triggers re-render; actual isOnline comes from astrologer query
}));
