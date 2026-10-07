'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDmChat } from '../hooks/useDmChat';
import { useGroupChat } from '../hooks/useGroupChat';
import { useUserListSocket } from '../hooks/useUserListSocket';
import type { SnapExpenseContextValue, SnapGroupRoomDetail } from '../types/chat';
import { getUser } from '@/app/helpers/backend';
import { getChatRoom } from '@/services/chat';

const SnapExpenseContext = createContext<SnapExpenseContextValue | null>(null);

export function SnapExpenseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const userUid = (user?.uid ?? null) as string | null;
  const [activeDmUid, setActiveDmUid] = useState<string | null>(null);
  const [activeGroupRoomUid, setActiveGroupRoomUid] = useState<string | null>(null);
  const [groupRoomDetail, setGroupRoomDetail] = useState<SnapGroupRoomDetail | null>(null);
  const [groupRoomLoading, setGroupRoomLoading] = useState(false);
  const [currentUserGroupRole, setCurrentUserGroupRole] = useState<string | null>(null);
  const groupRoomRequestId = useRef(0);

  const setActiveDm = useCallback((uid: string | null) => {
    if (uid != null) setActiveGroupRoomUid(null);
    setActiveDmUid(uid);
  }, []);

  const setActiveGroupRoom = useCallback((uid: string | null) => {
    if (uid != null) setActiveDmUid(null);
    setActiveGroupRoomUid(uid);
  }, []);

  const {
    singleChats,
    roomChats,
    listReceived,
    status: userListStatus,
    patchRoomChatInList,
    removeRoomChatFromList,
  } = useUserListSocket(token, !!token && !userLoading);

  const isGroupChatView = !!activeGroupRoomUid;

  const dmEnabled = !!activeDmUid && !!token;
  const groupEnabled = !!activeGroupRoomUid && !!token;

  const dmChat = useDmChat({
    receiverUid: activeDmUid,
    token,
    currentUserUid: userUid,
    enabled: dmEnabled,
  });

  const groupChat = useGroupChat({
    roomUid: activeGroupRoomUid,
    token,
    currentUserUid: userUid,
    enabled: groupEnabled,
  });

  const hasActiveThread = !!activeDmUid || !!activeGroupRoomUid;

  const threadSlice = useMemo(() => {
    if (!hasActiveThread) {
      return {
        messages: [] as typeof dmChat.messages,
        status: 'disconnected' as const,
        sendMessage: dmChat.sendMessage,
        markAsRead: dmChat.markAsRead,
      };
    }
    if (isGroupChatView) {
      return {
        messages: groupChat.messages,
        status: groupChat.status,
        sendMessage: groupChat.sendMessage,
        markAsRead: groupChat.markAsRead,
      };
    }
    return {
      messages: dmChat.messages,
      status: dmChat.status,
      sendMessage: dmChat.sendMessage,
      markAsRead: dmChat.markAsRead,
    };
  }, [
    hasActiveThread,
    isGroupChatView,
    dmChat.messages,
    dmChat.status,
    dmChat.sendMessage,
    dmChat.markAsRead,
    groupChat.messages,
    groupChat.status,
    groupChat.sendMessage,
    groupChat.markAsRead,
  ]);

  const { messages, status, sendMessage, markAsRead } = threadSlice;
  const sendRoomAction = useCallback(
    (payload: unknown) => {
      if (!isGroupChatView) return false;
      return groupChat.sendJson(payload);
    },
    [groupChat, isGroupChatView]
  );

  const onLoad = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (accessToken && refreshToken) {
        const res = await getUser();
        setUser(res);
        setToken(accessToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error(error);
      setUser(null);
      setToken(null);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const loadGroupRoomInfo = useCallback(
    async (mode: 'initial' | 'refetch' = 'initial') => {
    if (!activeGroupRoomUid || !token || !userUid) {
      setGroupRoomDetail(null);
      setCurrentUserGroupRole(null);
      setGroupRoomLoading(false);
      return;
    }

    const reqId = ++groupRoomRequestId.current;
    setGroupRoomLoading(true);
    if (mode === 'initial') {
      setGroupRoomDetail(null);
      setCurrentUserGroupRole(null);
    }
    try {
      const res = await getChatRoom(token, activeGroupRoomUid);
      if (groupRoomRequestId.current !== reqId) return;

      if (!res?.success || !res.data) {
        setGroupRoomDetail(null);
        setCurrentUserGroupRole(null);
        return;
      }

      const data = res.data as SnapGroupRoomDetail;
      setGroupRoomDetail(data);
      const me = data.members?.find((m) => m.user_uid === userUid);
      setCurrentUserGroupRole(me?.role ?? null);
    } finally {
      if (groupRoomRequestId.current === reqId) {
        setGroupRoomLoading(false);
      }
    }
  },
    [activeGroupRoomUid, token, userUid]
  );

  useEffect(() => {
    if (!activeGroupRoomUid || !token || !userUid) {
      setGroupRoomDetail(null);
      setCurrentUserGroupRole(null);
      setGroupRoomLoading(false);
      return;
    }
    loadGroupRoomInfo('initial');
  }, [activeGroupRoomUid, token, userUid, loadGroupRoomInfo]);

  const refetchGroupRoom = useCallback(
    () => loadGroupRoomInfo('refetch'),
    [loadGroupRoomInfo]
  );

  const value = useMemo<SnapExpenseContextValue>(
    () => ({
      user,
      userLoading,
      userUid,
      token,
      singleChats,
      roomChats,
      patchRoomChatInList,
      removeRoomChatFromList,
      userListStatus,
      listReceived,
      activeDmUid,
      setActiveDm,
      activeGroupRoomUid,
      setActiveGroupRoom,
      isGroupChatView,
      groupRoomDetail,
      groupRoomLoading,
      currentUserGroupRole,
      refetchGroupRoom,
      messages,
      status,
      sendMessage,
      sendRoomAction,
      markAsRead,
    }),
    [
      user,
      userLoading,
      userUid,
      token,
      singleChats,
      roomChats,
      patchRoomChatInList,
      removeRoomChatFromList,
      userListStatus,
      listReceived,
      activeDmUid,
      activeGroupRoomUid,
      isGroupChatView,
      groupRoomDetail,
      groupRoomLoading,
      currentUserGroupRole,
      refetchGroupRoom,
      messages,
      status,
      sendMessage,
      sendRoomAction,
      markAsRead,
    ]
  );

  return <SnapExpenseContext.Provider value={value}>{children}</SnapExpenseContext.Provider>;
}

export function useSnapExpense() {
  const context = useContext(SnapExpenseContext);
  if (!context) {
    throw new Error('useSnapExpense must be used within a SnapExpenseProvider');
  }
  return context;
}
