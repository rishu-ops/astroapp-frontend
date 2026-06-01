'use client';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { adminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, truncate } from '@/lib/utils';
import { Chat, User, Astrologer } from '@/types';
import { MessageCircle } from 'lucide-react';

export default function AdminChatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: () => adminService.getChats().then((r) => r.data),
  });

  const chats: Chat[] = data?.data || [];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <h1 className="text-2xl font-bold mb-6">All Chats</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversations ({data?.meta?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : chats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No chats found</p>
              ) : (
                <div className="divide-y">
                  {chats.map((chat) => {
                    const chatUser = chat.userId as User;
                    const astrologer = chat.astrologerId as Astrologer;
                    return (
                      <div key={chat._id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              {chatUser?.name || 'User'} → {astrologer?.name || 'Astrologer'}
                            </p>
                            {chat.lastMessage && (
                              <p className="text-xs text-muted-foreground">{truncate(chat.lastMessage, 50)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground hidden md:block">
                            {formatDate(chat.createdAt)}
                          </span>
                          <Badge variant={chat.status === 'active' ? 'success' : 'outline'}>
                            {chat.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
