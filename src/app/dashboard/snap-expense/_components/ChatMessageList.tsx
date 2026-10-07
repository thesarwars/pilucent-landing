'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ChatMessage from './Chat';
import type { ChatMessage as ChatMessageType } from './types/chat';

export type ChatMessageListProps = {
  messages: ChatMessageType[];
  currentUserUid: string | null;
  onMarkAsRead: (messageIds?: number[]) => boolean;
  avatarBaseUrl?: string;
  emptyMessage?: string;
};

function ChatMessageList({
  messages,
  currentUserUid,
  onMarkAsRead,
  emptyMessage = 'No messages yet. Start the conversation!',
}: ChatMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (messages.length > prevLenRef.current) {
      const el = listRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }
    prevLenRef.current = messages.length;
  }, [messages.length]);

  const handleScrollToMessage = (messageId: string) => {
    if (!messageId) return;
    const container = listRef.current as HTMLDivElement | null;
    const target = container?.querySelector<HTMLDivElement>(`[data-message-id="${messageId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedMessageId(null);
        highlightTimeoutRef.current = null;
      }, 1800);
    }
  };

  useEffect(() => {
    const unreadFromOthers = messages
      .filter(
        (m) =>
          m.sender?.uid !== currentUserUid &&
          (m as { is_read?: boolean }).is_read !== true &&
          ((m as { read_count?: number }).read_count ?? 0) === 0
      )
      .map((m) => m.id);
    if (unreadFromOthers.length > 0) {
      onMarkAsRead(unreadFromOthers);
    }
  }, [messages, currentUserUid, onMarkAsRead]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 py-12">
        <p className="text-center text-sm text-[#9CA3AF]">{emptyMessage}</p>
      </div>
    );
  }

  console.log(messages, 'messages');

  return (
    <div
      ref={listRef}
      className="flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto overflow-x-hidden py-2"
    >
      {messages.map((msg) => (
        <ChatMessage
          handleScrollToMessage={handleScrollToMessage}
          key={msg.id}
          isHighlighted={highlightedMessageId == msg.id.toString()}
          message={msg}
          currentUserUid={currentUserUid}
          avatarBaseUrl={msg.sender.image}
        />
      ))}
    </div>
  );
}

export default ChatMessageList;
