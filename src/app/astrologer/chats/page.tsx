'use client';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { ChatList } from '@/components/chat/ChatList';
import { useChats } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageCircle } from 'lucide-react';

export default function AstrologerChatsPage() {
  useSocket();
  const { data: chats, isLoading } = useChats();

  return (
    <ProtectedRoute allowedRoles={['astrologer']}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            All Conversations
          </h1>
          {isLoading ? (
            <LoadingSpinner fullPage />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <ChatList chats={chats || []} basePath="/astrologer/chats" />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
