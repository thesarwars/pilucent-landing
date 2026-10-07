'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import { useSnapExpense } from '../context/SnapExpense.Context';
import { createChatRoom, addChatRoomMember } from '@/services/chat';
import { cn } from '@/lib/utils';
import { SnapModalPortal } from './SnapModalPortal';

type CreateGroupModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const router = useRouter();
  const { token, setActiveGroupRoom } = useSnapExpense();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim()) {
      setError('Please sign in to create a group.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const createRes = await createChatRoom(token, {
        title: title.trim(),
        description: description.trim(),
      });
      if (!createRes?.data?.uid) {
        setError(createRes?.message ?? 'Failed to create group');
        return;
      }
      const roomUid = createRes.data.uid;
      setActiveGroupRoom(roomUid);
      onClose();
      router.push(`/dashboard/snap-expense/group/${roomUid}`);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <SnapModalPortal
      isOpen={open}
      onClose={handleClose}
      title="Create Group"
      disableClose={submitting}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#4F4F4F]">Group name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finance Team"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#4F4F4F] outline-none placeholder:text-[#9CA3AF] focus:border-[#3462FA]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#4F4F4F]">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={2}
              className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#4F4F4F] outline-none placeholder:text-[#9CA3AF] focus:border-[#3462FA]"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-white/60 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="medium"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="medium"
            className="bg-[#3462FA] text-white hover:bg-[#2A54E8]"
            disabled={submitting || !title.trim() || !token}
          >
            {submitting ? 'Creating...' : 'Create & Join'}
          </Button>
        </div>
      </form>
    </SnapModalPortal>
  );
}
