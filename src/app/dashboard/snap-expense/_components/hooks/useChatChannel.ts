'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { getChatDMMessages, getChatGroupMessages } from '@/services/chat';
import type { ConnectionStatus, ChatMessage } from '../types/chat';
import {
  RECONNECT_BACKOFF_MULTIPLIER,
  RECONNECT_DELAY_MS,
  MAX_RECONNECT_DELAY_MS,
} from '../constants';
import { tryExtractChatMessage } from '../utils/wsChatMessage';

export type ChatChannelMessageContext = {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  /** Active channel uid (group room uid or DM peer uid). */
  channelUid: string | null;
};

export type UseChatChannelOptions = {
  channelUid: string | null;
  token: string | null;
  currentUserUid: string | null;
  enabled?: boolean;
  /** DM uses `chat/messages?user_uid=…`; group uses `chat/rooms/:uid/messages`. */
  channelKind: 'dm' | 'group';
  getWsUrl: (uid: string, token: string) => string;
  /** Return true if handled (skip default handlers for this message). */
  onSocketMessage?: (data: unknown, ctx: ChatChannelMessageContext) => boolean;
};

function mapHistoryResults(
  results: {
    id: number;
    sender: { uid: string; first_name?: string; last_name?: string; image?: string };
    receiver: { uid: string; first_name?: string; last_name?: string; image?: string };
    content: string;
    message_type: string;
    file_data: string | null;
    is_read?: boolean;
    timestamp: string;
  }[]
): ChatMessage[] {
  return results.map((m) => ({
    id: m.id,
    sender: {
      id: 0,
      uid: m.sender.uid,
      first_name: m.sender.first_name,
      last_name: m.sender.last_name,
      image: m.sender.image,
    },
    receiver: {
      id: 0,
      uid: m.receiver.uid,
      first_name: m.receiver.first_name,
      last_name: m.receiver.last_name,
      image: m.receiver.image,
    },
    content: m.content,
    message_type: m.message_type,
    file_data: m.file_data,
    is_read: m.is_read,
    timestamp: m.timestamp,
    created_time: m.timestamp,
    read_count: m.is_read ? 1 : 0,
    read_by: [],
  }));
}

/** Stable numeric id when group history rows omit `id` (avoids React key collisions). */
function fallbackGroupMessageId(
  m: {
    timestamp: string;
    sender: { uid: string };
    content: string;
  },
  index: number
): number {
  const s = `${m.timestamp}|${m.sender.uid}|${m.content}|${index}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h) + 1;
}

function mapGroupHistoryResults(
  results: {
    id?: number;
    room_uid: string;
    sender: { uid: string; first_name?: string; last_name?: string; image?: string };
    content: string;
    message_type: string;
    file_data: string | null;
    timestamp: string;
    created_time?: string;
    is_read?: boolean;
    read_count?: number;
    read_by?: { user_id: number; read_at: string }[];
  }[],
  roomUid: string
): ChatMessage[] {
  return results.map((m: any, index) => {
    const id = typeof m.id === 'number' ? m.id : fallbackGroupMessageId(m, index);
    const ts = m.created_time ?? m.timestamp;
    const rc = m.read_count ?? (m.is_read ? 1 : 0);
    return {
      id,
      sender: {
        id: 0,
        uid: m.sender.uid,
        first_name: m.sender.first_name,
        last_name: m.sender.last_name,
        image: m.sender.image,
      },
      receiver: {
        id: 0,
        uid: roomUid,
        first_name: undefined,
        last_name: undefined,
        image: undefined,
      },
      content: m.content,
      message_type: m.message_type,
      file_data: m.file_data,
      origin_message_id: m.origin_message_id,
      is_read: m.is_read,
      timestamp: ts,
      created_time: ts,
      read_count: rc,
      read_by: m.read_by ?? [],
    };
  });
}

/**
 * Shared WebSocket + history for DM and group channels (different REST history + WS URL).
 */
export function useChatChannel({
  channelUid,
  token,
  currentUserUid,
  enabled = true,
  channelKind,
  getWsUrl,
  onSocketMessage,
}: UseChatChannelOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS);
  const mountedRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});
  const onSocketMessageRef = useRef(onSocketMessage);

  const connect = useCallback(() => {
    if (!channelUid || !token || !enabled) return;

    const url = getWsUrl(channelUid, token);
    setStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current || wsRef.current !== ws) return;
        setStatus('connected');
        reconnectDelayRef.current = RECONNECT_DELAY_MS;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current || wsRef.current !== ws) return;
        try {
          const data: any = JSON.parse(event.data);
          console.log(data, 'data for expense from socket');
          if (
            (data?.event == 'expense_report_saved' ||
              data?.event == 'expense_report_status_changed') &&
            data?.result?.uid
          ) {
            setMessages((prev) => {
              const exists = prev.some(
                (m: any) => m?.file_data?.uid == data?.result?.uid && !m?.origin_message_id
              );
              console.log(exists, 'exists');
              if (exists) {
                const updatedMessages = prev.map((m: any) => {
                  if ((m?.file_data?.uid == data?.result?.uid) && !m?.origin_message_id) {
                    return {
                      ...m,
                      content: '',
                      file_data: data?.result,
                      message_type: 'EXPENSE_DATA',
                      read_by: [],
                      read_count: 0,
                      receiver: {
                        id: 0,
                        uid: '',
                        first_name: '',
                        last_name: '',
                        image: '',
                      },
                      sender: {
                        first_name: data?.first_name,
                        id: 0,
                        image: data?.user_image,
                        last_name: data?.last_name,
                        uid: data?.user_uid,
                      },
                    };
                  }
                  return m;
                });
                return [
                  ...updatedMessages,
                  {
                    id: data?.message_id,
                    content: '',
                    origin_message_id: data?.origin_message_id,
                    created_time: new Date().toISOString(), //2026-04-22T23:28:35.423117+06:00
                    file_data: data?.result,
                    is_read: false,
                    message_type: 'EXPENSE_DATA',
                    read_by: [],
                    read_count: 0,
                    sender: {
                      first_name: data?.first_name,
                      id: 0,
                      image: data?.user_image,
                      last_name: data?.last_name,
                      uid: data?.user_uid,
                    },
                    receiver: {
                      first_name: '',
                      id: 0,
                      image: '',
                      last_name: '',
                      uid: '',
                    },
                  },
                ];
              }
              return [
                ...prev,
                {
                  content: '',
                  created_time: new Date().toISOString(), //2026-04-22T23:28:35.423117+06:00
                  file_data: data.result,
                  id: data?.message_id,
                  is_read: false,
                  message_type: 'EXPENSE_DATA',
                  read_by: [],
                  read_count: 0,
                  sender: {
                    first_name: data?.first_name,
                    id: 0,
                    image: data?.user_image,
                    last_name: data?.last_name,
                    uid: data?.user_uid,
                  },
                  receiver: {
                    first_name: '',
                    id: 0,
                    image: '',
                    last_name: '',
                    uid: '',
                  },
                },
              ];
            });
            return;
          }
          if (onSocketMessageRef.current?.(data, { setMessages, channelUid }) === true) {
            return;
          }
          const d = data as { event?: string };
          if (d.event === 'messages_read') {
            setMessages((msgs) => msgs.map((m) => ({ ...m, read_count: 1, read_by: [] })));
            return;
          }

          const msg = tryExtractChatMessage(data);
          if (msg) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.id);
              if (exists) return prev;
              const withoutPending = prev.filter(
                (m) => m.id >= 0 || m.sender?.uid !== msg.sender?.uid
              );
              return [...withoutPending, msg].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            });
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = (ev) => {
        // Another socket replaced this one — ignore stale close events.
        if (wsRef.current != null && wsRef.current !== ws) return;
        if (wsRef.current === ws) wsRef.current = null;

        if (!mountedRef.current) return;

        setStatus(ev.code === 1000 ? 'closed' : 'disconnected');

        if (ev.code !== 1000 && ev.code !== 4401 && ev.code !== 4403 && ev.code !== 4404) {
          const delay = Math.min(reconnectDelayRef.current, MAX_RECONNECT_DELAY_MS);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            reconnectDelayRef.current *= RECONNECT_BACKOFF_MULTIPLIER;
            connectRef.current();
          }, delay);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current || wsRef.current !== ws) return;
        setStatus('error');
      };
    } catch {
      setStatus('error');
    }
  }, [channelUid, token, enabled, getWsUrl]);

  useEffect(() => {
    onSocketMessageRef.current = onSocketMessage;
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (channelUid && token && enabled) {
      startTransition(() => setMessages([]));
      queueMicrotask(() => connect());
    } else {
      startTransition(() => setStatus('disconnected'));
    }
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [channelUid, token, enabled, connect, disconnect]);

  useEffect(() => {
    if (status !== 'connected' || !channelUid || !token) return;

    let cancelled = false;
    const loadHistory = async () => {
      if (channelKind === 'group') {
        const res = await getChatGroupMessages({
          uid: channelUid,
          page: 1,
          limit: 200,
          token,
        });
        if (!res?.data?.results || cancelled || !mountedRef.current) return;
        const mapped = mapGroupHistoryResults(res.data.results as any[], channelUid);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newOnes = mapped.filter((x) => !existingIds.has(x.id));
          return [...prev, ...newOnes].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
        return;
      }

      const res = await getChatDMMessages({
        uid: channelUid,
        page: 1,
        limit: 200,
        token,
      });
      if (!res?.data?.results || cancelled || !mountedRef.current) return;

      const mapped = mapHistoryResults(res.data.results as any[]);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = mapped.filter((x) => !existingIds.has(x.id));
        return [...prev, ...newOnes].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [status, channelUid, token, channelKind]);

  const sendMessage = useCallback(
    (
      content: string,
      messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' = 'TEXT',
      fileData?: string
    ) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !channelUid || !currentUserUid) return false;
      const payload = {
        message: content,
        message_type: messageType,
        ...(fileData != null && { file_data: fileData }),
      };

      const tempId = -Date.now();
      const optimistic: ChatMessage = {
        id: tempId,
        sender: { id: 0, uid: currentUserUid },
        receiver: { id: 0, uid: channelUid },
        content,
        message_type: messageType,
        file_data: fileData ?? null,
        is_read: false,
        timestamp: new Date().toISOString(),
        created_time: new Date().toISOString(),
        read_count: 0,
        read_by: [],
      };
      setMessages((prev) =>
        [...prev, optimistic].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      );

      ws.send(JSON.stringify(payload));

      return true;
    },
    [channelUid, currentUserUid]
  );

  const sendJson = useCallback(
    (payload: unknown) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !channelUid) return false;
      ws.send(JSON.stringify(payload));
      return true;
    },
    [channelUid]
  );

  const markAsRead = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify({ action: 'mark_read' }));
    return true;
  }, []);

  return {
    messages,
    status,
    sendMessage,
    sendJson,
    markAsRead,
  };
}
