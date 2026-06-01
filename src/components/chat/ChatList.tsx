'use client';
import { Chat, Astrologer, User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, timeAgo, truncate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChatListProps {
  chats: Chat[];
  activeChatId?: string;
  basePath: string;
}

export function ChatList({ chats, activeChatId, basePath }: ChatListProps) {
  const { user } = useAuthStore();

  const getOtherParty = (chat: Chat) => {
    if (user?.role === 'user') return chat.astrologerId as Astrologer;
    return chat.userId as User;
  };

  if (!chats.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground text-sm">
        No conversations yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {chats.map((chat) => {
          const other = getOtherParty(chat);
          const name = (other as Astrologer)?.name || (other as User)?.name || 'Unknown';
          const avatar = (other as Astrologer)?.avatar || (other as User)?.avatar;
          const isOnline = (other as Astrologer)?.isOnline;
          const isActive = chat._id === activeChatId;

          return (
            <Link key={chat._id} href={`${basePath}/${chat._id}`}>
              <div
                className={cn(
                  'flex items-center gap-3 p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors',
                  isActive && 'bg-muted'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  {isOnline !== undefined && (
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{name}</span>
                    {chat.lastMessageAt && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {timeAgo(chat.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {truncate(chat.lastMessage, 40)}
                    </p>
                  )}
                </div>

                {chat.status === 'closed' && (
                  <Badge variant="outline" className="text-xs shrink-0">Closed</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}
