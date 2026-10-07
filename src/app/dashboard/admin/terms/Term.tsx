'use client';

import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchTerm, patchTerm, postTerm } from '@/app/helpers/backend';
import { Toggle, VioletButton, VioletInput } from '@/components/violet';

const Term = ({
  setValue,
  uid,
  setIsOpen,
  refetch,
  onSuccess,
}: {
  setValue?: any;
  onSuccess?: any;
  uid?: string;
  setIsOpen: any;
  refetch?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [termData, setTermData] = useState({
    title: '',
    days: '',
    is_active: true,
  });

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          const res = await fetchTerm(uid);
          if (res?.uid) {
            setTermData({
              title: res?.title,
              days: res?.days,
              is_active: res?.is_active,
            });
          }
        } catch (error) {
          toast.error('Error occurred while getting data');
        }
      };
      fn();
    }
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();
    try {
      if (uid) {
        const result = await patchTerm(uid, termData);
        if (result.success) {
          toast.success('Terms Updated');
          setIsOpen(false);
          refetch && refetch();
        }
      } else {
        const result = await postTerm(termData);
        if (result.success) {
          toast.success('Terms Created');
          setIsOpen(false);
          refetch && refetch();
          setValue && setValue(result);
          onSuccess && onSuccess();
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!uid)
      setTermData({
        title: '',
        days: '',
        is_active: true,
      });
  }, [uid]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <VioletInput
        label="Title"
        required
        maxLength={100}
        placeholder="Enter term title"
        value={termData?.title}
        onChange={(e) => setTermData({ ...termData, title: e.target.value })}
      />

      <VioletInput
        label="Days"
        required
        type="number"
        min={1}
        placeholder="Enter days"
        value={termData?.days}
        onChange={(e) => setTermData({ ...termData, days: e.target.value })}
      />

      <div className="flex items-center justify-between rounded-v-input border border-v-border bg-v-card-subtle px-3.5 py-2.5">
        <div>
          <div className="text-[13px] font-semibold text-v-ink900">Active</div>
          <div className="text-[11.5px] text-v-ink400">Make this term selectable on documents</div>
        </div>
        <Toggle
          checked={termData.is_active}
          onChange={(next) => setTermData({ ...termData, is_active: next })}
          aria-label="Active"
        />
      </div>

      <div className="mt-1 flex items-center gap-2.5">
        <VioletButton
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </VioletButton>
        <VioletButton type="submit" variant="primary" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save term'}
        </VioletButton>
      </div>
    </form>
  );
};

export default Term;
