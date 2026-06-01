'use client';
import { Astrologer } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials } from '@/lib/utils';
import {
  Star, Clock, Globe2, MessageCircle, X, Award,
  CheckCircle, IndianRupee,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';

interface AstrologerDetailModalProps {
  astrologer: Astrologer;
  onClose: () => void;
  onStartChat: () => void;
  isUser: boolean;
}

export function AstrologerDetailModal({
  astrologer, onClose, onStartChat, isUser,
}: AstrologerDetailModalProps) {
  const { busyAstrologerIds } = useChatStore();
  const isBusy = busyAstrologerIds.has(astrologer._id || astrologer.id);
  const canChat = astrologer.isOnline && !isBusy && isUser;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cover / header */}
        <div className="relative h-28 bg-gradient-to-br from-brand-navy to-brand-purple shrink-0">
          {astrologer.coverPhoto && (
            <img src={astrologer.coverPhoto} alt="" className="w-full h-full object-cover opacity-60" />
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar overlap */}
        <div className="px-5 -mt-10 shrink-0">
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="rounded-full p-1 bg-white shadow-lg">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={astrologer.avatar} />
                  <AvatarFallback className="bg-brand-orange/10 text-brand-orange text-2xl font-bold">
                    {getInitials(astrologer.displayName || astrologer.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className={cn(
                'absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white',
                isBusy ? 'bg-amber-500' : astrologer.isOnline ? 'bg-green-500' : 'bg-gray-300'
              )} />
            </div>

            {/* Status badge */}
            <div className="pb-2">
              {isBusy ? (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">In Session</Badge>
              ) : astrologer.isOnline ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
              ) : (
                <Badge variant="outline">Offline</Badge>
              )}
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-xl font-extrabold text-brand-navy">
              {astrologer.displayName || astrologer.name}
            </h2>
            <p className="text-sm text-muted-foreground">{astrologer.primaryExpertise}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-brand-gold text-brand-gold" />
                <span className="font-bold text-sm">{astrologer.rating?.toFixed(2) || '0.00'}</span>
                <span className="text-xs text-muted-foreground">
                  ({astrologer.totalRatings >= 1000
                    ? `${(astrologer.totalRatings / 1000).toFixed(1)}k`
                    : astrologer.totalRatings} reviews)
                </span>
              </div>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {astrologer.experience} yrs
              </span>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                {astrologer.languages?.slice(0, 2).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 px-5 pb-5 mt-4">
          <div className="space-y-5">
            {/* Expertise tags */}
            {(astrologer.expertise?.length > 0 || astrologer.primaryExpertise) && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {(astrologer.expertise?.length > 0 ? astrologer.expertise : [astrologer.primaryExpertise]).map((e) => (
                    <span key={e} className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-semibold">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            {astrologer.aboutMe && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">About</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{astrologer.aboutMe}</p>
              </div>
            )}

            {/* Pricing */}
            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Rates</p>
              {[
                { label: 'Chat', value: astrologer.chatPricePerMin },
                { label: 'Voice Call', value: astrologer.callPricePerMin },
                { label: 'Video Call', value: astrologer.videoCallPricePerMin },
              ].filter(r => r.value > 0).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />{value}/min
                  </span>
                </div>
              ))}
            </div>

            {/* Skills */}
            {astrologer.skills?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {astrologer.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs">
                      <CheckCircle className="h-2.5 w-2.5 text-green-500" />{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* CTA */}
        <div className="p-5 border-t bg-white shrink-0">
          <Button
            className={cn(
              'w-full h-12 font-bold text-base gap-2',
              canChat ? 'orange-gradient border-0 text-white shadow-md' : 'bg-muted text-muted-foreground'
            )}
            disabled={!canChat}
            onClick={onStartChat}
          >
            <MessageCircle className="h-5 w-5" />
            {!isUser ? 'Login as user to chat'
              : isBusy ? 'Astrologer is in a session'
              : !astrologer.isOnline ? 'Astrologer is offline'
              : `Chat · ₹${astrologer.chatPricePerMin}/min`}
          </Button>
        </div>
      </div>
    </div>
  );
}
