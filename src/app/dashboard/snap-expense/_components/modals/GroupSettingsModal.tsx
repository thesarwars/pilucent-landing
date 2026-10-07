'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SnapModalPortal } from './SnapModalPortal';
import Button from '../ui/Button';
import { useSnapExpense } from '../context/SnapExpense.Context';
import { addChatRoomMember, deleteChatRoom, updateChatRoom } from '@/services/chat';
import { fetchUserOnboardList } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { cn } from '@/lib/utils';
import { canDeleteGroup } from '../utils/groupRoomRole';

type GroupSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

type UserItem = {
  uid: string;
  name?: string;
  email?: string;
  image?: string;
};

const ADD_ROLES: Array<'EMPLOYEE' | 'APPROVER' | 'FINANCE' | 'MODERATOR' | 'GROUP_ADMIN'> = [
  'EMPLOYEE',
  'APPROVER',
  'FINANCE',
  'MODERATOR',
  'GROUP_ADMIN',
];

export function GroupSettingsModal({ open, onClose }: GroupSettingsModalProps) {
  const router = useRouter();
  const {
    token,
    userUid,
    activeGroupRoomUid,
    groupRoomDetail,
    groupRoomLoading,
    refetchGroupRoom,
    currentUserGroupRole,
    setActiveGroupRoom,
    patchRoomChatInList,
    removeRoomChatFromList,
  } = useSnapExpense();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set());
  const [newMemberRole, setNewMemberRole] = useState<(typeof ADD_ROLES)[number]>('EMPLOYEE');
  const [savingMeta, setSavingMeta] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: userListData, isPending: usersLoading } = useFetch(
    ['user_list'],
    fetchUserOnboardList,
    { limit: 500, search: '' }
  );

  const users: UserItem[] = useMemo(
    () => (userListData?.results ?? userListData?.data ?? []) as UserItem[],
    [userListData]
  );

  useEffect(() => {
    if (open && activeGroupRoomUid) {
      void refetchGroupRoom();
    }
  }, [open, activeGroupRoomUid, refetchGroupRoom]);

  useEffect(() => {
    if (open && groupRoomDetail) {
      setTitle(groupRoomDetail.title);
      setDescription(groupRoomDetail.description ?? '');
      setError(null);
      setSelectedUids(new Set());
    }
  }, [open, groupRoomDetail]);

  const memberUidSet = useMemo(
    () => new Set(groupRoomDetail?.members.map((m) => m.user_uid) ?? []),
    [groupRoomDetail]
  );

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => {
      const name = (u.name ?? '').toLowerCase();
      const email = (u.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const usersToInvite = useMemo(
    () => filteredUsers.filter((u) => !memberUidSet.has(u.uid) && u.uid !== userUid),
    [filteredUsers, memberUidSet, userUid]
  );

  const toggleInvite = (uid: string) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeGroupRoomUid || !title.trim()) return;
    setError(null);
    setSavingMeta(true);
    try {
      const res = await updateChatRoom(token, activeGroupRoomUid, {
        title: title.trim(),
        description: description.trim(),
      });
      if (!res?.success) {
        setError(res?.message ?? 'Failed to update group');
        return;
      }
      const listMatchExtras = [
        groupRoomDetail?.uid,
        groupRoomDetail?.slug,
      ].filter((k): k is string => typeof k === 'string' && k.length > 0);
      patchRoomChatInList(
        activeGroupRoomUid,
        {
          title: title.trim(),
          ...(res.data?.slug ? { slug: res.data.slug } : {}),
        },
        listMatchExtras
      );
      await refetchGroupRoom();
    } finally {
      setSavingMeta(false);
    }
  };

  const handleAddMembers = async () => {
    if (!token || !activeGroupRoomUid || selectedUids.size === 0) return;
    setError(null);
    setAddingMembers(true);
    try {
      const res = await addChatRoomMember(token, activeGroupRoomUid, {
        user_uids: Array.from(selectedUids),
        role: newMemberRole,
      });
      if (!res?.success) {
        setError(res?.message ?? 'Failed to add members');
        return;
      }
      setSelectedUids(new Set());
      await refetchGroupRoom();
    } finally {
      setAddingMembers(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!token || !activeGroupRoomUid) return;
    if (!window.confirm('Delete this group for everyone? This cannot be undone.')) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      const res = await deleteChatRoom(token, activeGroupRoomUid);
      if (!res?.success) {
        setError(res?.message ?? 'Failed to delete group');
        return;
      }
      removeRoomChatFromList(activeGroupRoomUid);
      setActiveGroupRoom(null);
      onClose();
      router.push('/dashboard/snap-expense');
    } finally {
      setDeleting(false);
    }
  };

  const busy = savingMeta || addingMembers || deleting;
  const canDelete = canDeleteGroup(currentUserGroupRole);
  const detailReady = !!groupRoomDetail;

  const handleClose = () => {
    if (!busy) {
      setSearch('');
      setError(null);
      onClose();
    }
  };

  return (
    <SnapModalPortal
      isOpen={open}
      onClose={handleClose}
      title="Group settings"
      disableClose={busy}
      widthClass="w-full max-w-lg"
    >
      <div className="flex max-h-[85vh] flex-col">
        {open && !detailReady && groupRoomLoading ? (
          <p className="px-6 py-12 text-center text-sm text-[#9CA3AF]">Loading group…</p>
        ) : null}
        {open && !detailReady && !groupRoomLoading ? (
          <p className="px-6 py-12 text-center text-sm text-red-600">
            Could not load this group. Close and try again.
          </p>
        ) : null}

        {detailReady ? (
          <>
            {/* <form
              onSubmit={handleSaveDetails}
              className="flex flex-col gap-4 border-b border-white/60 px-6 py-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4F4F4F]">Group name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#4F4F4F] outline-none focus:border-[#3462FA]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4F4F4F]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#4F4F4F] outline-none focus:border-[#3462FA]"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="medium"
                  className="bg-[#3462FA] text-white hover:bg-[#2A54E8]"
                  disabled={savingMeta || !token || !activeGroupRoomUid}
                >
                  {savingMeta ? 'Saving…' : 'Save details'}
                </Button>
              </div>
            </form> */}

            <div className="flex flex-col gap-3 px-6 py-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-[#1F2937]">Add members</h3>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-[#4F4F4F]">Role for new members</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as (typeof ADD_ROLES)[number])}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 text-sm text-[#4F4F4F]"
                  >
                    {ADD_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users to invite…"
                  className="mb-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#3462FA]"
                />
                <div className="max-h-40 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white">
                  {usersLoading ? (
                    <p className="p-4 text-center text-sm text-[#9CA3AF]">Loading users…</p>
                  ) : usersToInvite.length === 0 ? (
                    <p className="p-4 text-center text-sm text-[#9CA3AF]">
                      No users to add (everyone matching search is already in the group).
                    </p>
                  ) : (
                    usersToInvite.map((user) => {
                      const displayName = user.name || user.email || 'Unknown';
                      const isSelected = selectedUids.has(user.uid);
                      return (
                        <button
                          key={user.uid}
                          type="button"
                          onClick={() => toggleInvite(user.uid)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                            isSelected
                              ? 'bg-[#3462FA]/10 text-[#3462FA]'
                              : 'text-[#4F4F4F] hover:bg-[#F3F4F6]'
                          )}
                        >
                          <span
                            className={cn(
                              'h-4 w-4 shrink-0 rounded border',
                              isSelected ? 'border-[#3462FA] bg-[#3462FA]' : 'border-[#9CA3AF]'
                            )}
                          />
                          {displayName}
                        </button>
                      );
                    })
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="medium"
                    className="bg-[#3462FA] text-white hover:bg-[#2A54E8]"
                    disabled={
                      addingMembers || selectedUids.size === 0 || !token || !activeGroupRoomUid
                    }
                    onClick={() => void handleAddMembers()}
                  >
                    {addingMembers ? 'Adding…' : `Add selected (${selectedUids.size})`}
                  </Button>
                </div>
              </div>

              {canDelete ? (
                <div className="border-t border-[#FEE2E2] pt-4">
                  <h3 className="mb-2 text-sm font-semibold text-red-800">Danger zone</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="medium"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    disabled={deleting || !token || !activeGroupRoomUid}
                    onClick={() => void handleDeleteGroup()}
                  >
                    {deleting ? 'Deleting…' : 'Delete group'}
                  </Button>
                </div>
              ) : null}

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="flex justify-end border-t border-white/60 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={handleClose}
            disabled={busy}
          >
            Close
          </Button>
        </div>
      </div>
    </SnapModalPortal>
  );
}
