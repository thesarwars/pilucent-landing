'use client';

import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from './ui/Avatar';
import type { ChatMessage } from './types/chat';
import {
  attachmentTitle,
  attachmentUrl,
  isProbablyImageFileUrl,
  parseAttachmentData,
} from './utils/chatAttachment';
import { parseExpenseReportPayload } from './utils/wsChatMessage';
import { ExpenseReportChatCard } from './ExpenseReportChatCard';

export type ChatMessageProps = {
  isHighlighted: boolean;
  /** Real-time message from WebSocket */
  message: ChatMessage;
  /** Current user's UID - messages from this user appear on right */
  currentUserUid: string | null;
  /** Avatar base URL for user images */
  avatarBaseUrl?: string;
  handleScrollToMessage: (messageId: string) => void;
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

function MessageBody({
  message,
  handleScrollToMessage,
}: {
  message: ChatMessage;
  handleScrollToMessage: (messageId: string) => void;
}) {
  const parsed = parseAttachmentData(message.file_data);
  const url = parsed ? attachmentUrl(parsed).trim() : '';
  const title = parsed ? attachmentTitle(parsed, message.content || 'Attachment') : '';

  const expensePayload = parseExpenseReportPayload(message);
  if (expensePayload) {
    return (
      <ExpenseReportChatCard
        handleScrollToMessage={handleScrollToMessage}
        report={{
          ...expensePayload,
          id: message.id,
          origin_message_id: message.origin_message_id,
        }}
      />
    );
  }

  /** Socket contract: `FILE` + `file_data` is the file URL string (legacy `IMAGE` still supported). */
  if (message.message_type === 'IMAGE' && message.file_data && url) {
    return (
      <div className="flex max-w-full flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- dynamic API URLs */}
        <img src={url} alt="" className="max-h-52 max-w-full rounded-lg object-contain" />
        {message.content ? (
          <p className="whitespace-pre-wrap text-sm text-[#374151]">{message.content}</p>
        ) : null}
      </div>
    );
  }

  if (message.message_type === 'FILE' && message.file_data && url) {
    if (isProbablyImageFileUrl(url)) {
      return (
        <div className="flex max-w-full flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic file URLs */}
          <img src={url} alt="" className="max-h-52 max-w-full rounded-lg object-contain" />
          {message.content ? (
            <p className="whitespace-pre-wrap text-sm text-[#374151]">{message.content}</p>
          ) : null}
        </div>
      );
    }
    return (
      <div className="flex max-w-full flex-col gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm font-medium text-[#3462FA] transition-colors hover:bg-[#F3F4F6]"
        >
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{title}</span>
        </a>
        {message.content && message.content !== title ? (
          <p className="whitespace-pre-wrap text-sm text-[#374151]">{message.content}</p>
        ) : null}
      </div>
    );
  }

  if (message.message_type === 'IMAGE' && message.file_data && !url) {
    return <span className="text-sm text-[#6B7280]">{message.content || '(image)'}</span>;
  }

  return (
    <div className="max-w-full whitespace-pre-wrap text-sm text-[#374151]">
      {message.content || message?.file_data?.error || '(empty)'}
    </div>
  );
}

function ChatMessage({
  message,
  isHighlighted,
  currentUserUid,
  avatarBaseUrl,
  handleScrollToMessage,
}: ChatMessageProps) {
  const isOwn = currentUserUid != null && message.sender?.uid === currentUserUid;
  const displayName =
    [message.sender?.first_name, message.sender?.last_name].filter(Boolean).join(' ') || 'Unknown';

  return (
    <div
      data-message-id={message?.id}
      className={cn(
        'inline-flex items-start justify-start gap-4 rounded-xl p-1 transition-all duration-700',
        isOwn ? 'ml-auto flex-row-reverse' : 'justify-start',
        isHighlighted ? 'bg-[rgba(69,127,243,0.18)]' : ''
      )}
    >
      <Avatar image={avatarBaseUrl} className="h-12 w-12 shrink-0 bg-[#9B98C5]/40" />
      <div
        className={cn(
          'inline-flex max-w-[75%] flex-col gap-1 rounded-2xl  bg-white px-4 py-1 shadow-sm',
          isOwn ? 'items-end rounded-tr-none' : 'items-start rounded-lr-none'
        )}
      >
        {!isOwn && <span className="text-xs font-medium text-[#6B7280]">{displayName}</span>}
        <MessageBody handleScrollToMessage={handleScrollToMessage} message={message} />
        <div className="flex items-center gap-2">
          <span className="font-['Inter'] text-xs font-normal leading-4 text-[#9CA3AF]">
            {formatTime(
              (message as { created_time?: string; timestamp?: string }).created_time ??
                (message as { timestamp?: string }).timestamp ??
                ''
            )}
          </span>
          {((message.read_count ?? 0) > 0 || (message as { is_read?: boolean }).is_read) && (
            <span className="text-xs text-[#10B981]">Read</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
