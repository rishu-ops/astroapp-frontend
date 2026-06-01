'use client';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useChatMessages, useTyping } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { MessageBubble } from './MessageBubble';
import { SessionTimer } from './SessionTimer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, PhoneOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Chat } from '@/types';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  chatId: string;
  chat: Chat;
}

export function ChatWindow({ chatId, chat }: ChatWindowProps) {
  const { user } = useAuthStore();
  const messages = useChatStore((s) => s.messages[chatId] || []);
  const typingUsers = useChatStore((s) => s.typingUsers[chatId] || []);
  const sessionStartedAt = useChatStore((s) => s.sessionStartedAt);
  const sessionChatId = useChatStore((s) => s.sessionChatId);

  const { isLoading } = useChatMessages(chatId);
  const { sendMessage, endChat, joinChat, leaveChat } = useSocket();
  const { handleTyping } = useTyping(chatId);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [endConfirm, setEndConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isActive = chat.status === 'active';
  const isClosed = chat.status === 'closed';
  const isOwner = user?.role === 'user';
  const isTyping = typingUsers.filter((id) => id !== user?.id).length > 0;

  // Use session startedAt from store (real-time) or from chat document
  const startedAt = (sessionChatId === chatId ? sessionStartedAt : null) || chat.startedAt;

  useEffect(() => {
    joinChat(chatId);
    return () => leaveChat(chatId);
  }, [chatId, joinChat, leaveChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!text.trim() || sending || !isActive) return;
    const msg = text.trim();
    setText('');
    setSendError('');
    setSending(true);
    const result = await sendMessage(chatId, msg);
    setSending(false);
    if (result.error) setSendError(result.error);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndChat = () => {
    endChat(chatId);
    setEndConfirm(false);
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex flex-col h-full">
      {/* Session info bar */}
      {isActive && startedAt && (
        <div className="flex items-center justify-between px-4 py-2 bg-green-50 border-b border-green-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-700">Session Active</span>
          </div>
          <SessionTimer startedAt={startedAt} className="text-green-700" />
        </div>
      )}

      {isClosed && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b shrink-0">
          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Session ended
            {chat.sessionDuration != null && ` · ${formatDuration(chat.sessionDuration)}`}
            {chat.endedBy && ` · ${endedByLabel(chat.endedBy)}`}
          </span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && isActive && (
            <div className="text-center text-sm text-muted-foreground py-6">
              Chat started! Say hello 👋
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-0.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
              typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      {isClosed ? (
        <div className="p-4 border-t text-center text-sm text-muted-foreground shrink-0">
          This conversation has ended.
        </div>
      ) : (
        <div className="border-t p-3 shrink-0 space-y-2">
          {sendError && (
            <p className="text-xs text-destructive flex items-center gap-1 px-1">
              <AlertCircle className="h-3 w-3" /> {sendError}
            </p>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => { setText(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder={isActive ? 'Type a message... (Enter to send)' : 'Waiting for session to start...'}
              disabled={!isActive}
              rows={1}
              className={cn(
                'flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[40px] max-h-[120px] overflow-y-auto',
                !isActive && 'opacity-50 cursor-not-allowed'
              )}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />

            <Button
              size="icon"
              className="orange-gradient border-0 text-white shrink-0"
              onClick={handleSend}
              disabled={!text.trim() || sending || !isActive}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>

            {/* End chat — user only */}
            {isOwner && isActive && !endConfirm && (
              <Button
                size="icon"
                variant="outline"
                className="border-red-200 text-red-500 hover:bg-red-50 shrink-0"
                onClick={() => setEndConfirm(true)}
                title="End Chat"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* End chat confirmation */}
          {endConfirm && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="text-sm text-red-700 flex-1">End this chat session?</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEndConfirm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-red-500 hover:bg-red-600 text-white border-0"
                onClick={handleEndChat}
              >
                End Chat
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function endedByLabel(reason: string): string {
  const map: Record<string, string> = {
    user_ended: 'ended by you',
    astrologer_ended: 'ended by astrologer',
    user_disconnect: 'you disconnected',
    astrologer_disconnect: 'astrologer disconnected',
    timeout: 'timed out',
    cancelled: 'cancelled',
    declined: 'declined',
  };
  return map[reason] || reason;
}
