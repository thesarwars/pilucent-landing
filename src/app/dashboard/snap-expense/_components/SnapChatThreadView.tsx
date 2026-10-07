'use client';

import { useCallback, useEffect } from 'react';
import ChatInputBar from './ChatInputBar';
import ChatMessageList from './ChatMessageList';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import { useSnapExpense } from './context/SnapExpense.Context';

type SnapChatThreadViewProps = {
  channelUid: string | null;
  setActive: (uid: string | null) => void;
  isGroup?: boolean;
};

export function SnapChatThreadView({ channelUid, setActive, isGroup }: SnapChatThreadViewProps) {
  const {
    userUid: currentUserUid,
    token,
    messages,
    status,
    sendMessage,
    markAsRead,
  } = useSnapExpense();

  useEffect(() => {
    setActive(channelUid);
    return () => setActive(null);
  }, [channelUid, setActive]);

  const handleSend = useCallback(
    (content: string, messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE', fileData?: string) =>
      sendMessage(content, messageType ?? 'TEXT', fileData),
    [sendMessage]
  );

  const isConnecting = status === 'connecting';
  const isDisconnected = status === 'disconnected' || status === 'error' || status === 'closed';

  const emptyDefault = isGroup
    ? 'No messages yet. Say hello to the group!'
    : 'No messages yet. Start the conversation!';

  return (
    <div className="relative flex h-[calc(100vh-210px)] min-h-0 w-full flex-col gap-4 overflow-hidden">
      {/* <div className="flex h-4 shrink-0 justify-end">
        <ConnectionStatusBadge status={status} />
      </div> */}

      {isConnecting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="rounded-xl bg-white/90 px-6 py-3 shadow-md">
            <p className="text-sm font-medium text-[#4F4F4F]">Connecting...</p>
          </div>
        </div>
      )}

      {isDisconnected && channelUid && token && (
        <div className="shrink-0 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-2 text-sm text-amber-800">
          Connection lost. Reconnecting...
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ChatMessageList
          messages={messages}
          currentUserUid={currentUserUid}
          onMarkAsRead={markAsRead}
          emptyMessage={status === 'connected' ? emptyDefault : 'Loading...'}
        />
      </div>
      <div className="shrink-0">
        <ChatInputBar
          onSendMessage={handleSend}
          onMarkAsRead={() => markAsRead()}
          disabled={!channelUid || !token || isDisconnected}
          token={token}
          isExpenseEnabled={isGroup}
          placeholder={isGroup ? 'Message the group...' : 'Type a message...'}
        />
      </div>
    </div>
  );
}
