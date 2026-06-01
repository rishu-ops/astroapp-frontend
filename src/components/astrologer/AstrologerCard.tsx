'use client';
import { useState } from 'react';
import { Astrologer } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, Clock, Globe2, Award, Info } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';
import { AstrologerDetailModal } from './AstrologerDetailModal';

interface AstrologerCardProps {
  astrologer: Astrologer;
  onStartChat?: (astrologer: Astrologer) => void;
}

export function AstrologerCard({ astrologer, onStartChat }: AstrologerCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { busyAstrologerIds } = useChatStore();
  const [showDetail, setShowDetail] = useState(false);

  const isUser = user?.role === 'user';
  const isBusy = busyAstrologerIds.has(astrologer._id || astrologer.id);
  const isAvailable = astrologer.isOnline && !isBusy;

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (isUser && isAvailable) {
      onStartChat?.(astrologer);
    }
  };

  return (
    <>
      <div
        className="astro-card cursor-pointer group"
        onClick={() => setShowDetail(true)}
      >
        {/* Online strip */}
        <div className={cn('h-0.5 w-full', isAvailable ? 'bg-green-500' : isBusy ? 'bg-amber-500' : 'bg-gray-200')} />

        <div className="p-5">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={cn(
                'rounded-full p-0.5',
                isAvailable ? 'bg-gradient-to-br from-brand-orange to-brand-gold' : 'bg-border'
              )}>
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarImage src={astrologer.avatar} />
                  <AvatarFallback className="bg-brand-orange/10 text-brand-orange font-bold text-lg">
                    {getInitials(astrologer.displayName || astrologer.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className={cn(
                'absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white',
                isBusy ? 'bg-amber-500' : isAvailable ? 'bg-green-500' : 'bg-gray-300'
              )} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-bold text-sm text-brand-navy truncate group-hover:text-brand-orange transition-colors">
                  {astrologer.displayName || astrologer.name}
                </h3>
                {astrologer.totalRatings > 500 && (
                  <Award className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-0.5 truncate">{astrologer.primaryExpertise}</p>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
                <span className="text-sm font-bold">{astrologer.rating?.toFixed(2) || '0.00'}</span>
                <span className="text-xs text-muted-foreground">
                  · {astrologer.totalRatings >= 1000
                    ? `${(astrologer.totalRatings / 1000).toFixed(1)}k`
                    : astrologer.totalRatings} orders
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />{astrologer.experience} yrs
                </span>
                <span className="text-border">·</span>
                <span className="truncate">{astrologer.languages?.slice(0, 2).join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {(astrologer.expertise?.length > 0 ? astrologer.expertise : [astrologer.primaryExpertise])
              .slice(0, 3)
              .map((e) => (
                <span key={e} className="px-2 py-0.5 bg-muted rounded-full text-[11px] font-medium text-foreground/70">
                  {e}
                </span>
              ))}
          </div>

          <div className="border-t border-border my-3" />

          {/* CTA row */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs">
              {isBusy ? (
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  In Session
                </span>
              ) : isAvailable ? (
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Available Now
                </span>
              ) : (
                <span className="text-muted-foreground">Offline</span>
              )}
            </div>

            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs h-8 px-2"
                onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
              >
                <Info className="h-3 w-3" />
                View
              </Button>

              <Button
                size="sm"
                className={cn(
                  'gap-1.5 text-xs h-8 font-semibold px-3',
                  isAvailable && isUser
                    ? 'orange-gradient border-0 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground'
                )}
                disabled={!isAvailable || !isUser}
                onClick={handleChatClick}
              >
                <MessageCircle className="h-3 w-3" />
                {isBusy ? 'Busy' : isAvailable ? 'Chat' : 'Offline'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <AstrologerDetailModal
          astrologer={astrologer}
          isUser={isUser}
          onClose={() => setShowDetail(false)}
          onStartChat={() => {
            setShowDetail(false);
            if (isUser && isAvailable) onStartChat?.(astrologer);
          }}
        />
      )}
    </>
  );
}
