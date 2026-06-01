import { Message } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwn = user?.id === message.senderId;

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
