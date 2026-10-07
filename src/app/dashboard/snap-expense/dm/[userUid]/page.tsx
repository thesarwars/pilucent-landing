'use client';

import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { SnapChatThreadView } from '../../_components/SnapChatThreadView';
import { useSnapExpense } from '../../_components/context/SnapExpense.Context';

export default function DmChatPage() {
  const params = useParams();
  const userUid = typeof params.userUid === 'string' ? params.userUid : null;
  const { setActiveDm } = useSnapExpense();

  const setActive = useCallback((uid: string | null) => setActiveDm(uid), [setActiveDm]);

  return <SnapChatThreadView channelUid={userUid} setActive={setActive} isGroup={false} />;
}
