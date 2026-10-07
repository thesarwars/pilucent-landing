'use client';

import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { SnapChatThreadView } from '../../_components/SnapChatThreadView';
import { useSnapExpense } from '../../_components/context/SnapExpense.Context';

export default function GroupChatPage() {
  const params = useParams();
  const roomUid = typeof params.roomUid === 'string' ? params.roomUid : null;
  const { setActiveGroupRoom } = useSnapExpense();

  const setActive = useCallback(
    (uid: string | null) => setActiveGroupRoom(uid),
    [setActiveGroupRoom]
  );

  return <SnapChatThreadView channelUid={roomUid} setActive={setActive} isGroup />;
}
