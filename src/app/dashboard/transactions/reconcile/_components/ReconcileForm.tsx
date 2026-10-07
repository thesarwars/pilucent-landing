import { postReconcileForm } from '@/app/helpers/backend';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/RawButton';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { toast } from '@/lib/ToastService';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface ReconcileFormProps {
  data: any;
  setData: any;
}

const ReconcileForm: React.FC<ReconcileFormProps> = ({ data, setData }) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      const response = await postReconcileForm({
        ...data,
        bank_account_uid: data.bank_account_uid?.uid,
        beginning_balance: Number(data.bank_account_uid?.opening_balance)?.toFixed(2),
      });
      if (response.success) {
        toast.success('Reconcile started successfully');
        router.push(`/dashboard/transactions/reconcile?a=2&reconciliation_id=${response?.uid}`);
      }
    } catch (error) {
      setIsPending(false);
    }
    // onStartReconciling?.({ account, endingBalance, endingDate });
  };

  return (
    <div
      // style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
      className="mt-8 rounded-xl border-2 bg-white/60 p-6"
    >
      <h1 className="mb-6 text-3xl font-semibold">Reconcile</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="mb-2 block text-lg font-medium">
            Which account do you want to reconcile?
          </label>
          <div className="max-w-[300px] rounded-md border border-gray-300">
            <AccountSelectDropDown
              ClassName=" rounded-md"
              setValue={(e: any) => setData({ ...data, bank_account_uid: e })}
              value={data?.bank_account_uid}
            />
          </div>
        </div>

        <div>
          <label className="mb-4 block text-lg font-medium">
            Add the following information<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col items-end gap-4 md:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Beginning balance</label>
              <input
                type="text"
                value={data?.bank_account_uid?.opening_balance}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Statement ending balance</label>
              <input
                type="number"
                value={data?.statement_ending_balance}
                onChange={(e) => setData({ ...data, statement_ending_balance: e.target.value })}
                className="w-full rounded-lg border px-4 py-3 focus:outline-accent_soft_blue"
                required
                placeholder="Enter ending balance"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Statement ending date</label>
              <DatePicker
                isPrevious={true}
                value={data?.statement_ending_date}
                onChange={(e) => setData({ ...data, statement_ending_date: e })}
                ClassName=""
                calenderClassName="right-0 left-0 "
              />
            </div>
          </div>
        </div>

        <div>
          <Button
            disabled={isPending}
            isLoading={isPending}
            type="submit"
            className="rounded-lg bg-black px-6 py-2.5 text-base font-semibold text-white shadow-md transition hover:bg-black/80"
          >
            Start reconciling
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReconcileForm;
