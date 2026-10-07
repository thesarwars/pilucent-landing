'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapExpense } from '../context/SnapExpense.Context';
import { fetchUserOnboardList } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import Avatar from '../ui/Avatar';
import { SnapModalPortal } from './SnapModalPortal';

type DirectChatModalProps = {
  open: boolean;
  onClose: () => void;
};

type UserItem = {
  uid: string;
  name?: string;
  email?: string;
  image?: string;
};

export function DirectChatModal({ open, onClose }: DirectChatModalProps) {
  const router = useRouter();
  const { userUid, setActiveDm } = useSnapExpense();
  const [search, setSearch] = useState('');

  const {
    data: userListData,
    isPending: usersLoading,
    setQueryParams,
  } = useFetch(['user_list'], fetchUserOnboardList, { limit: 500, search: '' });

  const users: UserItem[] = useMemo(
    () => (userListData?.results ?? userListData?.data ?? []) as UserItem[],
    [userListData]
  );

  const getUserUid = (user: UserItem) => user.uid;

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => {
      const name = (u.name ?? '').toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const handleSelect = (selectedUserUid: string) => {
    setActiveDm(selectedUserUid);
    onClose();
    router.push(`/dashboard/snap-expense/dm/${selectedUserUid}`);
  };

  return (
    <SnapModalPortal
      isOpen={open}
      onClose={onClose}
      title="New Direct Chat"
      widthClass="w-full max-w-md"
    >
      <div className="flex max-h-[85vh] flex-col overflow-hidden p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="mb-3 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#4F4F4F] outline-none placeholder:text-[#9CA3AF] focus:border-[#3462FA]"
        />
        <div className="flex-1 overflow-y-auto">
          {usersLoading ? (
            <p className="py-6 text-center text-sm text-[#9CA3AF]">Loading...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#9CA3AF]">No employees found</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filteredUsers.map((user) => {
                const uid = getUserUid(user);
                const name = user.name || user.email || 'Unknown';
                return (
                  <li key={uid}>
                    <button
                      type="button"
                      onClick={() => handleSelect(uid)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#F3F4F6]"
                    >
                      <Avatar image={user.image} className="h-10 w-10 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#4F4F4F]">
                        {name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </SnapModalPortal>
  );
}
