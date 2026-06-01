import api from '@/lib/axios';
import { ApiResponse, Chat, Message } from '@/types';

export const chatService = {
  createChat: (astrologerId: string) =>
    api.post<ApiResponse<Chat>>('/chats', { astrologerId }),

  getMyChats: () =>
    api.get<ApiResponse<Chat[]>>('/chats'),

  getChatById: (chatId: string) =>
    api.get<ApiResponse<Chat>>(`/chats/${chatId}`),

  closeChat: (chatId: string) =>
    api.patch<ApiResponse<Chat>>(`/chats/${chatId}/close`),

  getMessages: (chatId: string, page = 1) =>
    api.get<ApiResponse<Message[]>>(`/chats/${chatId}/messages`, { params: { page } }),

  sendMessage: (chatId: string, message: string) =>
    api.post<ApiResponse<Message>>('/messages', { chatId, message }),
};
