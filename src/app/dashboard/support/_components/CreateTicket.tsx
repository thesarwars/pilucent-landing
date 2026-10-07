'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { postSupportTicket } from '@/app/helpers/backend';
import { VioletButton, VioletInput, VioletTextarea } from '@/components/violet';

const CreateTicket = ({ refetch, setIsOpen }: { refetch: any; setIsOpen: any }) => {
  const [data, setData] = useState({
    title: '',
    content: '',
  });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toaster = toast.loading('Creating Ticket');
    try {
      setIsPending(true);
      const result = await postSupportTicket(data);
      if (result.success) {
        refetch();
        setData({ title: '', content: '' });
        toast.update(toaster, {
          isLoading: false,
          type: 'success',
          render: 'Ticket Created',
          autoClose: 2000,
        });
        setIsOpen(false);
      } else {
        toast.update(toaster, {
          isLoading: false,
          type: 'error',
          render: 'Failed to Create Ticket Please Try Again',
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toaster, {
        isLoading: false,
        type: 'error',
        render: 'Something went wrong',
        autoClose: 2000,
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <VioletInput
        label="Subject"
        required
        placeholder="Brief summary of the issue"
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />
      <VioletTextarea
        label="Description"
        required
        rows={7}
        placeholder="Describe what's happening…"
        value={data.content}
        onChange={(e) => setData({ ...data, content: e.target.value })}
      />
      <div className="mt-1 flex items-center gap-2.5">
        <VioletButton type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
          Cancel
        </VioletButton>
        <VioletButton type="submit" variant="primary" className="flex-1" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create ticket'}
        </VioletButton>
      </div>
    </form>
  );
};

export default CreateTicket;
