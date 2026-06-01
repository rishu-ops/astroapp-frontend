'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatList } from '@/components/chat/ChatList';
import { useChats } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { chatService } from '@/services/chat.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { Astrologer } from '@/types';

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = use(params);
  useSocket();

  const { data: chats } = useChats();
  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatService.getChatById(chatId).then((r) => r.data.data),
    enabled: !!chatId,
  });

  const astrologer = chat?.astrologerId as Astrologer | undefined;

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-80 border-r hidden md:flex flex-col">
            <div className="p-4 border-b">
              <Link href="/dashboard/chat">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  All Chats
                </Button>
              </Link>
            </div>
            <ChatList chats={chats || []} activeChatId={chatId} basePath="/dashboard/chat" />
          </aside>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isLoading ? (
              <LoadingSpinner fullPage />
            ) : chat ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b bg-background">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={astrologer?.avatar} />
                    <AvatarFallback>{getInitials(astrologer?.name || 'A')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{astrologer?.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${astrologer?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground">
                        {astrologer?.isOnline ? 'Online' : 'Offline'}
                      </span>
                      {chat.status === 'closed' && <Badge variant="outline" className="text-xs">Closed</Badge>}
                    </div>
                  </div>
                </div>
                <ChatWindow chatId={chatId} chat={chat} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Chat not found
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
