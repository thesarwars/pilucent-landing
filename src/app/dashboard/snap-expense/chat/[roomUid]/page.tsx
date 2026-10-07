'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSnapExpense } from '../../_components/context/SnapExpense.Context';

/** Legacy `/snap-expense/chat/:id` → `/dm` or `/group` based on user list. */
export default function LegacyChatRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { roomChats, listReceived } = useSnapExpense();
  const id = typeof params.roomUid === 'string' ? params.roomUid : null;

  useEffect(() => {
    if (!id) {
      router.replace('/dashboard/snap-expense');
      return;
    }
    if (!listReceived) return;
    const isGroup = roomChats.some((r) => r.room.uid === id);
    router.replace(isGroup ? `/dashboard/snap-expense/group/${id}` : `/dashboard/snap-expense/dm/${id}`);
  }, [id, listReceived, roomChats, router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
      Redirecting…
    </div>
  );
}
