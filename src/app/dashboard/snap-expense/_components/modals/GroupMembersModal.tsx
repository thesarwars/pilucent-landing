'use client';

import { useEffect, useState } from 'react';
import { SnapModalPortal } from './SnapModalPortal';
import { useSnapExpense } from '../context/SnapExpense.Context';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import {
  deleteChatRoomMember,
  fetchChatDetails,
  patchChatRoom,
  patchChatRoomMember,
  postAttachment,
} from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import Swal from 'sweetalert2';
import Image from 'next/image';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';

type GroupMembersModalProps = {
  open: boolean;
  onClose: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'APPROVER', label: 'Approver' },
  { value: 'FINANCE', label: 'Finance' },
  // { value: 'MODERATOR', label: 'Moderator' },
  { value: 'GROUP_ADMIN', label: 'Group Admin' },
] as const;

export function GroupMembersModal({ open, onClose, setIsOpen }: GroupMembersModalProps) {
  // const { roomUid } = useParams();
  const { groupRoomDetail } = useSnapExpense();
  const { UserData } = useAppSelector((state) => state.userData);
  const [detachUserId, setDetachUserId] = useState('');
  const {
    data: chatDetails,
    refetch,
    isPending,
  } = useFetch(
    ['chat_details', groupRoomDetail?.uid],
    () => fetchChatDetails(groupRoomDetail?.uid),
    {
      enabled: !!groupRoomDetail?.uid,
    }
  );
  const [data, setData] = useState({
    title: '',
    description: '',
    room_icon_url: '',
    is_expense_policy_enabled: true,
  });
  const [pending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isPending) return;
    setData({
      title: chatDetails?.title ?? '',
      description: chatDetails?.description ?? '',
      room_icon_url: chatDetails?.room_icon_url ?? '',
      is_expense_policy_enabled: chatDetails?.is_expense_policy_enabled ?? true,
    });
  }, [isPending, chatDetails]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsPending(true);
      const res = await patchChatRoom(groupRoomDetail?.uid as string, data);
      if (res?.success) {
        toast.success('Group info updated.');
        refetch();
        setIsOpen(false);
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file as any);
      const res = await postAttachment(formData);
      if (res?.file) {
        setData((prev) => ({ ...prev, room_icon_url: res.file }));
      }
    } catch (error) {
      //err
    } finally {
      setIsUploading(false);
    }
  };

  const handleDetach = async (userId: string) => {
    try {
      setDetachUserId(userId);
      const response = await deleteChatRoomMember(groupRoomDetail?.uid ?? '', userId);
      if (response.success) {
        refetch();
        toast.success('Member detached successfully.');
      }
    } catch (error) {
      //err
    } finally {
      setDetachUserId('');
    }
  };

  return (
    <SnapModalPortal
      isOpen={open}
      onClose={onClose}
      widthClass="w-full max-w-[640px]"
      classNames="bg-white shadow-xl"
      hideHeader
    >
      <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col gap-6 p-6">
        <h2 className="text-2xl font-semibold leading-[30px] text-[#2E2E2E]">Group Settings</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <label className="text-base font-medium leading-5 text-[#2E2E2E]">Group Name</label>
            <input
              name="title"
              type="text"
              value={data.title}
              onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
              className="h-12 w-full rounded-[10px] border border-[#D1D1D1] bg-white px-4 text-base font-normal leading-5 text-[#535353] outline-none transition-colors focus:border-[#3462FA]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium leading-5 text-[#2E2E2E]">Group Icon</label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-[#E5E7EB]">
                {data.room_icon_url ? (
                  <Image
                    src={data.room_icon_url}
                    alt="Group Icon"
                    width={100}
                    height={100}
                    priority
                    loading="eager"
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <button
                disabled={isUploading}
                onClick={() => document.getElementById('icon-input')?.click()}
                type="button"
                className="flex items-center justify-center rounded-lg border border-[#D1D1D1] bg-white px-5 py-[14px] text-base font-normal leading-5 text-[#685F5F] transition-colors hover:bg-[#F9FAFB]"
              >
                {isUploading ? 'Uploading...' : 'Change Icon'}
              </button>
              <input
                name="room_icon_url"
                type="file"
                id="icon-input"
                className="hidden"
                onChange={handleIconChange}
                accept="image/*"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium leading-5 text-[#2E2E2E]">Department Tag</label>
            <input
              name="description"
              type="text"
              value={data.description}
              onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
              className="h-12 w-full rounded-[10px] border border-[#D1D1D1] bg-white px-5 text-base font-normal leading-5 text-[#535353] outline-none transition-colors focus:border-[#3462FA]"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-medium leading-5 text-[#2E2E2E]">
                Expense Policy Enabled
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={data.is_expense_policy_enabled}
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    is_expense_policy_enabled: !prev.is_expense_policy_enabled,
                  }))
                }
                className={cn(
                  'relative h-[18px] w-8 shrink-0 rounded-full transition-colors',
                  data.is_expense_policy_enabled ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1/2 h-[14px] w-[14px] -translate-y-1/2 rounded-full bg-white shadow-sm transition-all',
                    data.is_expense_policy_enabled ? 'left-[16px]' : 'left-[2px]'
                  )}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base font-medium leading-5 text-[#2E2E2E]">Members</label>

            <div className="flex flex-col">
              <div className="flex h-12 items-center bg-[#E5E7EB] px-4">
                <span className="text-base font-normal leading-5 text-[#535353]">Member</span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {isPending ? (
                  <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">Loading members…</p>
                ) : chatDetails?.members?.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">No members found</p>
                ) : (
                  chatDetails?.members?.map((m: any) => (
                    <MemberRow
                      detachUserId={detachUserId}
                      onDetach={(userId) => handleDetach(userId)}
                      setIsOpen={setIsOpen}
                      key={m.user_uid}
                      m={m}
                      userUid={UserData?.uid ?? ''}
                      roomUid={groupRoomDetail?.uid as string}
                      refetch={refetch}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg bg-[#6A6EF6] px-4 py-2 text-white"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </SnapModalPortal>
  );
}

const MemberRow = ({
  detachUserId,
  onDetach,
  m,
  userUid,
  roomUid,
  refetch,
  setIsOpen,
}: {
  detachUserId: string;
  onDetach: (userUid: string) => void;
  m: any;
  userUid: string;
  roomUid: string;
  refetch: () => void;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const isSelf = m.user_uid === userUid;
  const name = [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;
  const [selectedRole, setSelectedRole] = useState(m?.role);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setIsOpen(false);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the role of this member?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, Change it!`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          console.log(e.target.value, '------value');
          const response = await patchChatRoomMember(roomUid ?? '', m.user_uid, {
            role: e.target.value,
          });
          if (response.success) {
            return response;
          }
          setIsOpen(true);
          throw new Error('Failed to change role');
        } catch (error) {
          setIsOpen(true);
          Swal.showValidationMessage(`${error}`);
        }
      },
    }).then((result) => {
      if (result.isDismissed) {
        setIsOpen(true);
        setSelectedRole(m?.role);
        return;
      }
      if (result.isConfirmed) {
        refetch();
        setIsOpen(true);
      }
    });
  };

  return (
    <>
      <div className="flex h-12 items-center px-4 font-inter">
        <span className="flex-1 truncate text-base font-normal leading-5 text-[#535353]">
          {name}
          {isSelf ? <span className="ml-1 text-sm text-[#9CA3AF]">(you)</span> : null}
        </span>

        <div className="w-[250px]">
          <select
            className="w-[180px] rounded-lg border border-[#D1D1D1] bg-white px-4 py-2 text-base font-normal leading-5 text-[#535353] outline-none transition-colors focus:border-[#3462FA]"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} className="text-nowrap" value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[80px] shrink-0 text-right">
          <button
            type="button"
            className="text-base font-normal leading-5 text-[#535353] transition-colors hover:text-red-600 disabled:opacity-50"
            onClick={() => onDetach(m.user_uid)}
            disabled={isSelf}
          >
            {detachUserId == m.user_uid ? 'Detaching...' : 'Detach'}
          </button>
        </div>
      </div>
    </>
  );
};
