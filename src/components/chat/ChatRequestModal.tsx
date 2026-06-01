'use client';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import { Astrologer } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { Loader2, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRequestModalProps {
  astrologer: Astrologer;
  onClose: () => void;
}

export function ChatRequestModal({ astrologer, onClose }: ChatRequestModalProps) {
  const { pendingChatId, pendingExpiresAt, chatEndedInfo, clearChatEnded } = useChatStore();
  const { cancelChat } = useSocket();
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [phase, setPhase] = useState<'requesting' | 'waiting' | 'declined' | 'timeout'>('requesting');

  // Countdown timer
  useEffect(() => {
    if (!pendingExpiresAt || phase !== 'waiting') return;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((new Date(pendingExpiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) clearInterval(tick);
    }, 500);
    return () => clearInterval(tick);
  }, [pendingExpiresAt, phase]);

  // When pendingChatId is set, move to waiting
  useEffect(() => {
    if (pendingChatId) setPhase('waiting');
  }, [pendingChatId]);

  // Watch for declined / timeout
  useEffect(() => {
    if (!chatEndedInfo) return;
    if (chatEndedInfo.reason === 'declined') setPhase('declined');
    if (chatEndedInfo.reason === 'timeout') setPhase('timeout');
  }, [chatEndedInfo]);

  const handleCancel = () => {
    if (pendingChatId) cancelChat(pendingChatId);
    clearChatEnded();
    onClose();
  };

  const handleClose = () => {
    clearChatEnded();
    onClose();
  };

  const circumference = 2 * Math.PI * 26; // r=26
  const progress = (secondsLeft / 60) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={phase !== 'waiting' ? handleClose : undefined} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6">
        {/* Astrologer info */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-brand-orange/20">
              <AvatarImage src={astrologer.avatar} />
              <AvatarFallback className="bg-brand-orange/10 text-brand-orange text-2xl font-bold">
                {getInitials(astrologer.displayName || astrologer.name)}
              </AvatarFallback>
            </Avatar>
            {phase === 'waiting' && (
              <span className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <p className="font-bold text-lg text-brand-navy">{astrologer.displayName || astrologer.name}</p>
            <p className="text-sm text-muted-foreground">{astrologer.primaryExpertise}</p>
          </div>
        </div>

        {/* Phase content */}
        {phase === 'requesting' && (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange mx-auto" />
            <p className="font-semibold text-foreground">Connecting...</p>
            <p className="text-sm text-muted-foreground">Setting up your chat request</p>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="space-y-4">
            {/* SVG countdown ring */}
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#f1f1f1" strokeWidth="5" />
                <circle
                  cx="30" cy="30" r="26"
                  fill="none"
                  stroke={secondsLeft > 15 ? '#F97316' : '#ef4444'}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }}
                />
              </svg>
              <span className={cn(
                'absolute inset-0 flex items-center justify-center font-extrabold text-xl',
                secondsLeft > 15 ? 'text-brand-orange' : 'text-red-500'
              )}>
                {secondsLeft}
              </span>
            </div>

            <div>
              <p className="font-bold text-foreground">Waiting for astrologer...</p>
              <p className="text-sm text-muted-foreground mt-1">
                {astrologer.displayName || astrologer.name} will accept your request
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-2"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              Cancel Request
            </Button>
          </div>
        )}

        {phase === 'declined' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-foreground">Request Declined</p>
              <p className="text-sm text-muted-foreground mt-1">
                {astrologer.displayName || astrologer.name} is not available right now
              </p>
            </div>
            <Button className="w-full orange-gradient border-0 text-white font-bold" onClick={handleClose}>
              Try Another Astrologer
            </Button>
          </div>
        )}

        {phase === 'timeout' && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-foreground">No Response</p>
              <p className="text-sm text-muted-foreground mt-1">
                The astrologer didn't respond within 60 seconds
              </p>
            </div>
            <Button className="w-full orange-gradient border-0 text-white font-bold" onClick={handleClose}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
