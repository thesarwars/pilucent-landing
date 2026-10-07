'use client';

import { useCallback } from 'react';
import { getChatWsUrl } from '../constants';
import { useChatChannel } from './useChatChannel';

type UseDmChatOptions = {
  receiverUid: string | null;
  token: string | null;
  currentUserUid: string | null;
  enabled?: boolean;
};

export function useDmChat({
  receiverUid,
  token,
  currentUserUid,
  enabled = true,
}: UseDmChatOptions) {
  const getWsUrl = useCallback((uid: string, t: string) => getChatWsUrl(uid, t), []);

  return useChatChannel({
    channelUid: receiverUid,
    token,
    currentUserUid,
    enabled,
    channelKind: 'dm',
    getWsUrl,
  });
}
