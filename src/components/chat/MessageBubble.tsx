import { Message } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { IndianRupee, ExternalLink } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const CATEGORY_EMOJI: Record<string, string> = {
  remedy: '🌿', puja: '🪔', chadhava: '🌸', gemstone: '💎',
  rudraksha: '📿', yantra: '🔯', report: '📊', service: '⭐',
  digital_product: '💻', other: '✨',
};

function OfferingCard({ snapshot }: { snapshot: NonNullable<Message['offeringSnapshot']> }) {
  return (
    <Link href={`/offerings/${snapshot.slug}`} className="block">
      <div className="inline-flex gap-3 bg-white border-l-4 border-brand-orange rounded-xl shadow-sm p-3 max-w-xs hover:shadow-md transition-shadow">
        {snapshot.thumbnail ? (
          <img src={snapshot.thumbnail} alt={snapshot.title} className="h-14 w-14 object-cover rounded-lg shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-brand-orange/10 flex items-center justify-center text-2xl shrink-0">
            {CATEGORY_EMOJI[snapshot.category] || '✨'}
          </div>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brand-orange">{snapshot.category.replace(/_/g, ' ')}</span>
          <span className="text-sm font-bold text-foreground line-clamp-1">{snapshot.title}</span>
          <span className="flex items-center gap-0.5 text-brand-orange font-bold text-sm">
            <IndianRupee className="h-3 w-3" />{snapshot.price}
            <span className="text-xs text-muted-foreground font-normal">/{snapshot.currency}</span>
          </span>
          <span className="text-xs text-brand-orange flex items-center gap-1 mt-0.5">
            View Details <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwn = user?.id === message.senderId;

  if (message.messageType === 'offering' && message.offeringSnapshot) {
    return (
      <div className="flex flex-col items-center my-2">
        <span className="text-xs text-muted-foreground mb-1.5">
          {isOwn ? 'You recommended' : 'Astrologer recommended'}
        </span>
        <OfferingCard snapshot={message.offeringSnapshot} />
        <span className="text-xs text-muted-foreground mt-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
      <div className={isOwn ? 'chat-bubble-user' : 'chat-bubble-astrologer'}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
      </div>
      <span className="text-xs text-muted-foreground mt-1 px-1">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
}
