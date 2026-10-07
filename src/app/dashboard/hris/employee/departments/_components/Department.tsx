'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Drawer, VioletButton, VioletInput } from '@/components/violet';
import { fetchDepartment, patchDepartments, postDepartments } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';

const FORM_ID = 'department-form';

const Department = ({
  onSuccess,
  isOpen,
  setIsOpen,
  uid,
  refetch,
}: {
  onSuccess?: any;
  isOpen: boolean;
  setIsOpen: any;
  uid?: any;
  refetch?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [Data, setData] = useState({ title: '', code: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const data = await fetchDepartment(uid);
          if (data) setData({ title: data?.title ?? '', code: data?.code ?? '' });
        } catch (error) {
          // handled upstream
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    } else {
      setData({ title: '', code: '' });
    }
  }, [uid, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsPending(true);
      if (uid) {
        const res = await patchDepartments(uid, Data);
        if (res?.success) {
          refetch && refetch();
          setData({ title: '', code: '' });
          setIsOpen(false);
          toast.success('Department updated.');
          onSuccess && onSuccess(res);
        }
      } else {
        const res = await postDepartments(Data);
        if (res?.success) {
          refetch && refetch();
          setData({ title: '', code: '' });
          setIsOpen(false);
          toast.success('Department created.');
          onSuccess && onSuccess(res);
        }
      }
    } catch (error) {
      // handled upstream
    } finally {
      setIsPending(false);
    }
  };

  const canSave = !!Data.title.trim() && !!Data.code.trim() && !isLoading;

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<Building2 />}
      iconTone="violet"
      title={uid ? 'Edit department' : 'Create department'}
      sub="Group employees under a team"
      width={400}
      footer={
        <>
          <VioletButton
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </VioletButton>
          <VioletButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            className="flex-1"
            disabled={!canSave || isPending}
            leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Create department'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
          <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <VioletInput
            label="Department name"
            required
            value={Data.title}
            onChange={(e) => setData({ ...Data, title: e.target.value })}
            placeholder="e.g. Engineering"
          />
          <VioletInput
            label="Department code"
            required
            hideRequiredMark
            value={Data.code}
            onChange={(e) => setData({ ...Data, code: e.target.value.toUpperCase() })}
            placeholder="e.g. ENG"
            className="tabular-nums"
          />
        </form>
      )}
    </Drawer>
  );
};

export default Department;
