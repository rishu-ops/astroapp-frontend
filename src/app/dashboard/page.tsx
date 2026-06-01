'use client';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useChats } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { ChatList } from '@/components/chat/ChatList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  useSocket();
  const { user } = useAuthStore();
  const { data: chats, isLoading } = useChats();

  const activeChats = chats?.filter((c) => c.status === 'active').length || 0;

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        {/* Header banner */}
        <div className="bg-brand-navy text-white py-8">
          <div className="container">
            <h1 className="text-2xl md:text-3xl font-extrabold">
              Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-white/50 mt-1 text-sm">Your personal astrology dashboard</p>
          </div>
        </div>

        <main className="flex-1 container py-8">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: MessageCircle, label: 'Total Chats', value: chats?.length || 0, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
              { icon: Clock, label: 'Active Chats', value: activeChats, color: 'text-green-600', bg: 'bg-green-50' },
              { icon: Star, label: 'Free Chats Left', value: 1, color: 'text-brand-gold', bg: 'bg-amber-50' },
              { icon: Users, label: 'Astrologers', value: '48K+', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <Card key={label} className="border-border shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="text-2xl font-extrabold text-brand-navy">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3 mb-8">
            <Link href="/astrologers">
              <Button className="orange-gradient border-0 text-white font-semibold shadow-sm gap-2">
                <Users className="h-4 w-4" />
                Find Astrologer
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button variant="outline" className="font-semibold gap-2">
                <MessageCircle className="h-4 w-4" />
                My Chats
              </Button>
            </Link>
          </div>

          {/* Recent chats */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy">Recent Conversations</h2>
              <Link href="/dashboard/chat">
                <Button variant="ghost" size="sm" className="text-brand-orange font-semibold text-sm">
                  View all →
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : chats?.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold text-foreground/60 mb-1">No conversations yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start chatting with an astrologer</p>
                <Link href="/astrologers">
                  <Button size="sm" className="orange-gradient border-0 text-white">Find Astrologer</Button>
                </Link>
              </div>
            ) : (
              <div className="border rounded-2xl overflow-hidden bg-white shadow-sm max-h-[420px]">
                <ChatList chats={chats?.slice(0, 5) || []} basePath="/dashboard/chat" />
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
