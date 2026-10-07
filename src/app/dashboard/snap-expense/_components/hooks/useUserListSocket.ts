'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getUserListWsUrl } from '../constants';
import type {
  ConnectionStatus,
  RoomChatItem,
  SingleChatItem,
  UserListEvent,
} from '../types/chat';
import {
  RECONNECT_BACKOFF_MULTIPLIER,
  RECONNECT_DELAY_MS,
  MAX_RECONNECT_DELAY_MS,
} from '../constants';

export function useUserListSocket(token: string | null, enabled = true) {
  const [singleChats, setSingleChats] = useState<SingleChatItem[]>([]);
  const [roomChats, setRoomChats] = useState<RoomChatItem[]>([]);
  const [listReceived, setListReceived] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS);
  const mountedRef = useRef(true);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const url = getUserListWsUrl(token);
    setStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setStatus('connected');
        reconnectDelayRef.current = RECONNECT_DELAY_MS;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data: UserListEvent = JSON.parse(event.data);
          if (data.event === 'user_list') {
            if (Array.isArray(data.single_chats)) setSingleChats(data.single_chats);
            if (Array.isArray(data.room_chats)) setRoomChats(data.room_chats);
            setListReceived(true);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = (ev) => {
        if (!mountedRef.current) return;
        setStatus(ev.code === 1000 ? 'closed' : 'disconnected');
        wsRef.current = null;

        if (ev.code !== 1000 && ev.code !== 4401 && ev.code !== 4403 && ev.code !== 4404) {
          const delay = Math.min(reconnectDelayRef.current, MAX_RECONNECT_DELAY_MS);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectDelayRef.current *= RECONNECT_BACKOFF_MULTIPLIER;
            connectRef.current();
          }, delay);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setStatus('error');
      };
    } catch {
      setStatus('error');
    }
  }, [token, enabled]);

  useEffect(() => {
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
    if (token && enabled) {
      connectRef.current();
    }
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [token, enabled, connect, disconnect]);

  /** Merge room fields into `room_chats` (e.g. after REST update when WS list is stale). */
  const patchRoomChatInList = useCallback(
    (
      roomUid: string,
      patch: Partial<Pick<RoomChatItem['room'], 'title' | 'slug'>>,
      extraMatchKeys: string[] = []
    ) => {
      const keys = new Set(
        [roomUid, ...extraMatchKeys].filter((k): k is string => typeof k === 'string' && k.length > 0)
      );
      setRoomChats((prev) =>
        prev.map((item) => {
          const u = item.room.uid;
          const s = item.room.slug;
          const hit =
            keys.has(u) || (typeof s === 'string' && s.length > 0 && keys.has(s));
          return hit ? { ...item, room: { ...item.room, ...patch } } : item;
        })
      );
    },
    []
  );

  const removeRoomChatFromList = useCallback(
    (roomUid: string, extraMatchKeys: string[] = []) => {
      const keys = new Set(
        [roomUid, ...extraMatchKeys].filter((k): k is string => typeof k === 'string' && k.length > 0)
      );
      setRoomChats((prev) =>
        prev.filter((item) => {
          const u = item.room.uid;
          const s = item.room.slug;
          const hit =
            keys.has(u) || (typeof s === 'string' && s.length > 0 && keys.has(s));
          return !hit;
        })
      );
    },
    []
  );

  return {
    singleChats,
    roomChats,
    listReceived,
    status,
    reconnect: connect,
    patchRoomChatInList,
    removeRoomChatFromList,
  };
}
