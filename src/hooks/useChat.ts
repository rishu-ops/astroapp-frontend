'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from './useSocket';

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getMyChats().then((r) => r.data.data),
  });
};

export const useChatMessages = (chatId: string) => {
  const { setMessages } = useChatStore();

  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatService.getMessages(chatId).then((r) => r.data.data),
    enabled: !!chatId,
  });

  useEffect(() => {
    if (query.data) setMessages(chatId, query.data);
  }, [query.data, chatId, setMessages]);

  return query;
};

export const useTyping = (chatId: string) => {
  const { startTyping, stopTyping } = useSocket();
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTyping = useCallback(() => {
    startTyping(chatId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => stopTyping(chatId), 2000);
  }, [chatId, startTyping, stopTyping]);

  return { handleTyping };
};
