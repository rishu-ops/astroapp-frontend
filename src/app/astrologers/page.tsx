'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AstrologerCard } from '@/components/astrologer/AstrologerCard';
import { ChatRequestModal } from '@/components/chat/ChatRequestModal';
import { astrologerService } from '@/services/astrologer.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Search } from 'lucide-react';
import { Astrologer } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/chatStore';

const EXPERTISE = ['All', 'Vedic', 'Tarot', 'Numerology', 'Palmistry', 'Vastu', 'KP', 'Nadi', 'Prashna'];

export default function AstrologersPage() {
  useSocket(); // connect socket to receive busy/free updates

  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('All');
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Chat request flow
  const [requestingAstrologer, setRequestingAstrologer] = useState<Astrologer | null>(null);
  const { requestChat } = useSocket();
  const { setPendingChat: storePendingChat } = useChatStore();

  const params: Record<string, string> = {};
  if (expertise !== 'All') params.expertise = expertise;
  if (onlineOnly) params.isOnline = 'true';

  const { data, isLoading } = useQuery({
    queryKey: ['astrologers', params],
    queryFn: () => astrologerService.getAll(params).then((r) => r.data),
    refetchInterval: 30_000, // refresh every 30s to catch online status changes
  });

  const astrologers: Astrologer[] = data?.data || [];
  const filtered = search
    ? astrologers.filter(
        (a) =>
          (a.displayName || a.name).toLowerCase().includes(search.toLowerCase()) ||
          a.primaryExpertise?.toLowerCase().includes(search.toLowerCase()) ||
          a.expertise?.some((e) => e.toLowerCase().includes(search.toLowerCase()))
      )
    : astrologers;

  const onlineCount = filtered.filter((a) => a.isOnline).length;

  const handleStartChat = async (astrologer: Astrologer) => {
    setRequestingAstrologer(astrologer);
    const astroId = astrologer._id || astrologer.id;
    const result = await requestChat(astroId);
    if (result.success && result.chatId && result.expiresAt) {
      storePendingChat(result.chatId, astroId, result.expiresAt);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Page header */}
      <div className="bg-brand-navy text-white py-10">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Talk to Astrologers</h1>
          <p className="text-white/60 text-base">
            48,000+ verified experts ·{' '}
            <span className="text-green-400 font-semibold">{onlineCount} available now</span>
          </p>
        </div>
      </div>

      <main className="flex-1 container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-white"
              placeholder="Search by name or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={onlineOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`gap-2 font-semibold ${onlineOnly ? 'orange-gradient border-0 text-white' : ''}`}
          >
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Online Now
          </Button>
        </div>

        {/* Expertise chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {EXPERTISE.map((e) => (
            <button
              key={e}
              onClick={() => setExpertise(e)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                expertise === e
                  ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                  : 'bg-white text-foreground/70 border-border hover:border-brand-orange/50'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No astrologers found.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              Showing {filtered.length} astrologer{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((a) => (
                <AstrologerCard
                  key={a._id || a.id}
                  astrologer={a}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Chat request modal */}
      {requestingAstrologer && (
        <ChatRequestModal
          astrologer={requestingAstrologer}
          onClose={() => setRequestingAstrologer(null)}
        />
      )}
    </div>
  );
}
