'use client';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useChats } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { ChatList } from '@/components/chat/ChatList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { IncomingChatRequest } from '@/components/chat/IncomingChatRequest';
import { astrologerService } from '@/services/astrologer.service';
import {
  MessageCircle, Power, PowerOff, Star, X,
  Sparkles, ArrowRight, CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

export default function AstrologerDashboardPage() {
  useSocket();
  const { user } = useAuthStore();
  const { data: chats, isLoading } = useChats();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';
  const [showWelcome, setShowWelcome] = useState(isWelcome);

  const { data: appData } = useQuery({
    queryKey: ['my-application'],
    queryFn: () => astrologerService.getMyApplication().then(r => r.data.data),
  });

  const astrologer = appData?.astrologer;
  const [isOnline, setIsOnline] = useState(astrologer?.isOnline ?? false);

  useEffect(() => {
    if (astrologer?.isOnline !== undefined) setIsOnline(astrologer.isOnline);
  }, [astrologer?.isOnline]);

  const toggleStatus = useMutation({
    mutationFn: (status: boolean) => astrologerService.toggleStatus(status),
    onSuccess: (_, status) => {
      setIsOnline(status);
      queryClient.invalidateQueries({ queryKey: ['my-application'] });
      queryClient.invalidateQueries({ queryKey: ['astrologers'] });
    },
  });

  const activeChats = chats?.filter((c) => c.status === 'active') || [];
  const isLive = astrologer?.profileStatus === 'live';

  return (
    <ProtectedRoute allowedRoles={['astrologer']}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        {/* ── Welcome Banner (shown once after go-live) ── */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-brand-orange to-amber-500 text-white">
            <div className="container py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 fill-white text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-lg">
                    🎉 Welcome to NakshatraChat, {user?.name?.split(' ')[0]}!
                  </p>
                  <p className="text-white/80 text-sm">
                    Your profile is live. Toggle online to start receiving consultations.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowWelcome(false)} className="shrink-0 hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-brand-navy text-white py-6">
          <div className="container flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold">
                Welcome, {user?.name?.split(' ')[0] || 'Astrologer'} 👋
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {isLive ? (
                  <span className="flex items-center gap-1.5 text-sm text-white/70">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    Profile Live
                  </span>
                ) : (
                  <span className="text-sm text-amber-400 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" />
                    Profile not live yet —{' '}
                    <Link href="/astrologer/profile" className="underline">
                      Complete profile
                    </Link>
                  </span>
                )}
              </div>
            </div>

            {/* Online toggle */}
            {isLive && (
              <Button
                variant={isOnline ? 'destructive' : 'default'}
                className={isOnline ? '' : 'orange-gradient border-0 text-white'}
                onClick={() => toggleStatus.mutate(!isOnline)}
                disabled={toggleStatus.isPending}
              >
                {isOnline
                  ? <><PowerOff className="h-4 w-4 mr-2" />Go Offline</>
                  : <><Power className="h-4 w-4 mr-2" />Go Online</>
                }
              </Button>
            )}
          </div>
        </div>

        <main className="flex-1 container py-8">
          {/* Not live yet — CTA */}
          {!isLive && (
            <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-bold text-amber-800 text-lg">Your profile is not live yet</p>
                <p className="text-amber-700 text-sm mt-1">
                  Complete your profile (photo, about, pricing) to appear in the astrologers list.
                </p>
              </div>
              <Link href="/astrologer/profile">
                <Button className="orange-gradient border-0 text-white font-bold gap-2 shrink-0">
                  Complete Profile <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: MessageCircle,
                label: 'Active Chats',
                value: activeChats.length,
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: MessageCircle,
                label: 'Total Chats',
                value: chats?.length || 0,
                color: 'text-brand-orange',
                bg: 'bg-orange-50',
              },
              {
                icon: Star,
                label: 'Rating',
                value: astrologer?.rating ? astrologer.rating.toFixed(1) : '—',
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                icon: isOnline ? Power : PowerOff,
                label: 'Status',
                value: isOnline ? 'Online' : 'Offline',
                color: isOnline ? 'text-green-600' : 'text-muted-foreground',
                bg: isOnline ? 'bg-green-50' : 'bg-muted',
              },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <Card key={label} className="border-border shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="text-xl font-extrabold text-brand-navy">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <Link href="/astrologer/chats">
              <Button className="orange-gradient border-0 text-white font-semibold gap-2">
                <MessageCircle className="h-4 w-4" />
                View Chats
              </Button>
            </Link>
            <Link href="/astrologer/profile">
              <Button variant="outline" className="font-semibold gap-2">
                <Star className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Recent chats */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-navy">Recent Conversations</h2>
              <Link href="/astrologer/chats">
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
                <p className="text-sm text-muted-foreground">
                  {isLive && isOnline
                    ? 'Users will see you in the list. Stay online!'
                    : isLive
                    ? 'Go online to start receiving requests'
                    : 'Go live first to receive consultations'}
                </p>
              </div>
            ) : (
              <div className="border rounded-2xl overflow-hidden bg-white shadow-sm max-h-[420px]">
                <ChatList chats={chats?.slice(0, 5) || []} basePath="/astrologer/chats" />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Incoming chat request — floats top-right */}
      <IncomingChatRequest />
    </ProtectedRoute>
  );
}
