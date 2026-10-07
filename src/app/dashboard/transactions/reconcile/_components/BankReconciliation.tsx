'use client';

import { fetchTransactions, postReconcileTransactions } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/ui/RawButton';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import { toast } from '@/lib/ToastService';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { FaCheck, FaSpinner } from 'react-icons/fa';

interface Transaction {
  id: string;
  date: string;
  clearedDate?: string;
  type: string;
  refNo: string;
  account: string;
  payee: string;
  memo?: string;
  payment?: number;
  deposit?: number;
  isCleared: boolean;
}

export default function BankReconciliation({ data }: { data: any }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'payments' | 'deposits'>('all');
  const [isReconcileSuccess, setIsReconcileSuccess] = useState(false);
  const reconciliationId = useSearchParams().get('reconciliation_id');
  const router = useRouter();
  const {
    data: reconciliationData,
    isPending,
    setQueryParams,
    params,
    refetch,
  } = useFetch(
    ['reconciliation_details'],
    fetchTransactions,
    { transaction_status: 'FOR_REVIEW' },
    { enabled: !!reconciliationId }
  );
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isReconciling, setIsReconciling] = useState(false);
  const [showSelectAllModal, setShowSelectAllModal] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    if (reconciliationData?.results && !isPending) {
      setTransactions(reconciliationData?.results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconciliationData]);

  const clearedPayments = useMemo(() => {
    return transactions
      .filter((t) => t.is_cleared && t.spent)
      .reduce((sum, t) => sum + Number(t.spent || 0), 0);
  }, [transactions]);

  const clearedDeposits = useMemo(() => {
    return transactions
      .filter((t) => t.is_cleared && t.received)
      .reduce((sum, t) => sum + Number(t.received || 0), 0);
  }, [transactions]);

  const clearedBalance =
    Number(data?.bank_account_uid?.opening_balance || 0) - clearedPayments + clearedDeposits;
  const difference = clearedBalance - Number(data?.statement_ending_balance || 0);

  const paymentsCount = transactions.filter((t) => t.is_cleared && t.spent).length;
  const depositsCount = transactions.filter((t) => t.is_cleared && t.received).length;

  // Filter transactions based on active tab
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (activeTab === 'payments') {
      filtered = transactions.filter((t) => t.spent);
    } else if (activeTab === 'deposits') {
      filtered = transactions.filter((t) => t.received);
    }

    // Sort transactions
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [transactions, activeTab, sortField, sortDirection]);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleTransactionCleared = (uid: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t?.uid === uid ? { ...t, is_cleared: !t?.is_cleared } : t))
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const handleSelectAll = () => {
    if (dontAskAgain) {
      selectAllTransactions();
    } else {
      setShowSelectAllModal(true);
    }
  };

  const selectAllTransactions = () => {
    setTransactions((prev) => prev.map((t) => ({ ...t, is_cleared: true })));
    setShowSelectAllModal(false);
  };

  const deselectAllTransactions = () => {
    setTransactions((prev) => prev.map((t) => ({ ...t, is_cleared: false })));
  };

  const isAllSelected = useMemo(() => {
    return filteredTransactions.length > 0 && filteredTransactions.every((t) => t.is_cleared);
  }, [filteredTransactions]);

  const isSomeSelected = useMemo(() => {
    return filteredTransactions.some((t) => t.is_cleared);
  }, [filteredTransactions]);

  const handleMasterCheckboxChange = () => {
    if (isAllSelected) {
      deselectAllTransactions();
    } else {
      handleSelectAll();
    }
  };

  const handleReconcile = async () => {
    try {
      if (difference < 0) {
        toast.error('Difference is less than 0, please check the transactions again');
        return;
      }
      if (transactions.filter((t) => t?.is_cleared)?.length === 0) {
        toast.error('No transactions selected');
        return;
      }
      setIsReconciling(true);
      const response = await postReconcileTransactions({
        reconciliation_id: reconciliationId,
        transaction_ids: transactions.filter((t) => t?.is_cleared)?.map((t) => t?.uid),
      });
      if (response?.success) {
        toast.success('Transactions reconciled successfully');
        refetch();
        setIsReconcileSuccess(true);
      }
    } catch (error) {
      // setIsReconciling(false);
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mb-8 rounded-xl border-2 bg-white/60 pb-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reconcile Checking</h1>
              <p className="mt-1 text-sm text-gray-600">
                Statement ending date:{' '}
                {moment(data?.statement_ending_date || '').format('MMMM DD, YYYY')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* <Button className="rounded-md border border-accent_soft_black px-4 py-2 text-accent_soft_black transition-colors">
                Edit info
              </Button> */}
              <div className="relative">
                <Button
                  disabled={isPending || difference > 0}
                  isLoading={isPending}
                  onClick={handleReconcile}
                  className="flex items-center gap-2 rounded-md bg-accent_soft_black px-4 py-2 text-white transition-colors disabled:opacity-50"
                >
                  Reconcile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="flex border-b border-gray-200 px-8 py-6">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-6">
              {/* Statement Ending Balance */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(data?.statement_ending_balance || 0))}
                </div>
                <div className="text-sm uppercase tracking-wide text-accent_soft_black">
                  Statement Ending Balance
                </div>
              </div>

              <div className="flex justify-center">
                <span className="text-2xl text-black">−</span>
              </div>

              {/* Cleared Balance */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(clearedBalance)}
                </div>
                <div className="text-sm uppercase tracking-wide text-accent_soft_black">
                  Cleared Balance
                </div>
              </div>
            </div>
            {/* Balance Details */}
            <div className="relative mt-6 flex items-center gap-6 px-5 pt-14">
              <div className="absolute -left-0 top-10 h-0.5 w-full bg-accent_soft_black" />
              <div className="absolute -left-0 top-10 h-12 w-0.5 bg-accent_soft_black" />
              <div className="absolute -top-2 right-20 h-12 w-0.5 bg-accent_soft_black" />
              <div className="absolute -right-0 top-10 h-12 w-0.5 bg-accent_soft_black" />
              <div className="flex flex-1 items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(Number(data?.bank_account_uid?.opening_balance || 0))}
                  </div>
                  <div className="text-sm text-gray-600">Beginning Balance</div>
                </div>
              </div>
              <span className="text-xl text-black">−</span>

              <div className="flex flex-1 items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(clearedPayments)}
                  </div>
                  <div className="text-sm text-gray-600">{paymentsCount} Payments</div>
                </div>
              </div>
              <span className="text-xl text-black">+</span>

              <div className="flex flex-1 items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(clearedDeposits)}
                  </div>
                  <div className="text-sm text-gray-600">{depositsCount} Deposit</div>
                </div>
              </div>
            </div>
          </div>
          {/* Difference */}
          <div className="ml-7 flex w-[450px] flex-col items-center justify-center border-l text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400">
                <span className="text-sm font-bold text-white">!</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(difference)}</div>
            </div>
            <div className="text-sm uppercase tracking-wide text-accent_soft_black">Difference</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4">
          <div className="flex w-fit gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('payments')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'deposits'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Deposits
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="max-w-full overflow-x-auto px-4">
          <table className="w-full">
            <thead className="border-y border-gray-200 bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  <button onClick={() => handleSort('date')} className="flex items-center gap-1">
                    Date
                    {sortField === 'date' && (
                      <svg
                        className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </button>
                </th>

                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Type
                    {sortField === 'type' && (
                      <svg
                        className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  Ref No.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  Account
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  Payee
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  Memo
                </th>
                {/* <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  <svg
                    className="mx-auto h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </th> */}
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  Payment (USD)
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  Deposit (USD)
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-accent_soft_black">
                  <SmoothCheckbox
                    checked={isAllSelected}
                    onCheckedChange={handleMasterCheckboxChange}
                    className="ml-4"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {transactions?.map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {formatDate(transaction?.date)}
                  </td>
                  {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {transaction.clearedDate
                      ? formatDate(transaction.clearedDate)
                      : ""}
                  </td> */}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {transaction?.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {transaction?.check_number || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {transaction?.chart_of_account?.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {transaction?.payee?.first_name || '-'} {transaction?.payee?.last_name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {transaction?.description || ''}
                  </td>
                  {/* <td className="whitespace-nowrap px-3 py-4 text-center">
                    <svg
                      className="mx-auto h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </td> */}
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                    {transaction?.spent ? formatCurrency(transaction?.spent) : ''}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                    {transaction?.received ? formatCurrency(transaction?.received) : ''}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-900">
                    <SmoothCheckbox
                      checked={transaction?.is_cleared}
                      onCheckedChange={() => toggleTransactionCleared(transaction?.uid)}
                      className="ml-4"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Select All Confirmation Modal */}
        {showSelectAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400">
                  <span className="text-lg font-bold text-white">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Are you sure you want to select all {filteredTransactions.length} transactions?
                  </h3>
                  <p className="mb-6 text-sm text-gray-600">
                    Some might already be selected. You won't be able to go back to these
                    selections.
                  </p>

                  <div className="mb-6 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dontAskAgain"
                      checked={dontAskAgain}
                      onChange={(e) => setDontAskAgain(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="dontAskAgain" className="text-sm text-gray-700">
                      Don't ask me again
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowSelectAllModal(false)}
                      className="rounded-md border border-accent_soft_black px-4 py-2 text-accent_soft_black transition-colors"
                    >
                      No, go back
                    </button>
                    <button
                      onClick={selectAllTransactions}
                      className="rounded-md bg-accent_soft_black px-4 py-2 text-white transition-colors"
                    >
                      Yes, select all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {isReconciling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent_soft_black">
                  <FaSpinner className="animate-spin text-lg font-bold text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Reconciling transactions...
                  </h3>
                  <p className="mb-6 text-sm text-gray-600">
                    Please wait while we reconcile the transactions. This may take a few minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {isReconcileSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
              <div className="mx-auto mb-3 flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-green-400">
                <FaCheck className="text-lg font-bold text-white" />
              </div>
              <div className="flex items-center gap-3 text-center">
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Transactions reconciled successfully
                  </h3>
                  <p className="mb-6 text-center text-sm text-gray-600">
                    The transactions have been reconciled successfully.
                  </p>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => router.push(`/dashboard/transactions/reconcile`)}
                  className="rounded-md border border-accent_soft_black px-4 py-2 text-accent_soft_black transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
