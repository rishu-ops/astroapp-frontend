'use client';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import { Phone, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IncomingChatRequest() {
  const { incomingRequest, setIncomingRequest } = useChatStore();
  const { acceptChat, declineChat } = useSocket();
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!incomingRequest) return;

    const expiresAt = new Date(incomingRequest.expiresAt).getTime();
    const tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(tick);
        setIncomingRequest(null);
      }
    }, 500);

    // Reset counter when new request comes
    setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));

    return () => clearInterval(tick);
  }, [incomingRequest, setIncomingRequest]);

  if (!incomingRequest) return null;

  const handleAccept = async () => {
    setAccepting(true);
    const result = await acceptChat(incomingRequest.chatId);
    if (result.error) {
      setAccepting(false);
      setIncomingRequest(null);
    }
    // On success, chat:started event will fire and navigate
  };

  const handleDecline = () => {
    declineChat(incomingRequest.chatId);
    setIncomingRequest(null);
  };

  const circumference = 2 * Math.PI * 18;
  const progress = (secondsLeft / 60) * circumference;

  return (
    <div className="fixed top-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-right-4 duration-300">
      {/* Progress bar at top */}
      <div
        className="h-1 bg-brand-orange transition-all duration-500"
        style={{ width: `${(secondsLeft / 60) * 100}%` }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wide">
              Incoming Chat Request
            </span>
          </div>
          <button onClick={handleDecline} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-brand-orange/20">
            <AvatarFallback className="bg-brand-orange/10 text-brand-orange font-bold">
              {getInitials(incomingRequest.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{incomingRequest.userName}</p>
            <p className="text-xs text-muted-foreground">wants to chat with you</p>
          </div>

          {/* Countdown ring */}
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#f1f1f1" strokeWidth="3" />
              <circle
                cx="20" cy="20" r="18"
                fill="none"
                stroke={secondsLeft > 15 ? '#F97316' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <span className={cn(
              'absolute inset-0 flex items-center justify-center text-xs font-extrabold',
              secondsLeft > 15 ? 'text-brand-orange' : 'text-red-500'
            )}>
              {secondsLeft}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
            onClick={handleDecline}
            disabled={accepting}
          >
            <X className="h-3.5 w-3.5" />
            Decline
          </Button>
          <Button
            size="sm"
            className="flex-1 orange-gradient border-0 text-white font-bold gap-1.5"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Phone className="h-3.5 w-3.5" />
            )}
            {accepting ? 'Joining...' : 'Accept'}
          </Button>
        </div>
      </div>
    </div>
  );
}
