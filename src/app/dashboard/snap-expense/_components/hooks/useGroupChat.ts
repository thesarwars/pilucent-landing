'use client';

import { useCallback } from 'react';
import { getGroupChatWsUrl } from '../constants';
import { useChatChannel, type ChatChannelMessageContext } from './useChatChannel';
import type { ChatMessage } from '../types/chat';
import {
  chatMessageFromExpenseReportSaved,
  messagesShareExpenseReportUid,
} from '../utils/wsChatMessage';

type UseGroupChatOptions = {
  roomUid: string | null;
  token: string | null;
  currentUserUid: string | null;
  enabled?: boolean;
};

function handleGroupSocketPayload(
  data: unknown,
  { setMessages, channelUid }: ChatChannelMessageContext
): boolean {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (d.event === 'expense_report_saved') {
    if (!channelUid) return true;
    const msg = chatMessageFromExpenseReportSaved(d, channelUid);
    if (!msg) return true;
    const reportUid = String(
      (d.result && typeof d.result === 'object'
        ? (d.result as Record<string, unknown>).uid
        : '') ?? ''
    );
    setMessages((prev) => {
      if (reportUid && messagesShareExpenseReportUid(prev, reportUid)) return prev;
      const existsId = prev.some((m) => m.id === msg.id);
      if (existsId) return prev;
      return [...prev, msg].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
    return true;
  }

  if (d.event === 'room_messages_read' && d.read_info && typeof d.read_info === 'object') {
    const readInfo = d.read_info as Record<
      string,
      { read_count: number; read_by: { user_id: number; read_at: string }[] }
    >;
    setMessages((msgs: ChatMessage[]) =>
      msgs.map((m) => {
        const info = readInfo[String(m.id)];
        if (info) {
          return {
            ...m,
            read_count: info.read_count,
            read_by: info.read_by ?? [],
          };
        }
        return m;
      })
    );
    return true;
  }

  return false;
}

export function useGroupChat({
  roomUid,
  token,
  currentUserUid,
  enabled = true,
}: UseGroupChatOptions) {
  const getWsUrl = useCallback((uid: string, t: string) => getGroupChatWsUrl(uid, t), []);

  const onSocketMessage = useCallback(
    (data: unknown, ctx: ChatChannelMessageContext) => handleGroupSocketPayload(data, ctx),
    []
  );

  return useChatChannel({
    channelUid: roomUid,
    token,
    currentUserUid,
    enabled,
    channelKind: 'group',
    getWsUrl,
    onSocketMessage,
  });
}
