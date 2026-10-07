'use client';
import Button from '@/components/ui/RawButton';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { RiBankFill } from 'react-icons/ri';
import PayrollTable from './_components/payroll-table';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchLinkedBankAccount,
  fetchMoovAccount,
  fetchSalaryProcessHistory,
  fetchSalaryProcessTabCount,
  payMoovSalary,
} from '@/app/helpers/backend';
import PopupModal from './_components/PopupModal';
import Link from 'next/link';
import Table from '@/app/(admin)/_components/Table';
import RootPopup from '../settings/_components/BankAccounts/PopupModal';
import { toast } from '@/lib/ToastService';
import PaymentSuccessModal from './_components/payment-success-modal';
import {
  PaymentHistoryTable,
  PendingPaymentTable,
  CanceledPaymentTable,
} from './_components/PaymentHistoryTable';

const columns = [
  {
    text: 'Emp Name',
    dataField: 'employee.full_name',
  },
  {
    text: 'Pay Schedule',
    dataField: 'employee.schedule_name',
  },
  {
    text: 'Start Date',
    dataField: 'pay_period',
    formatter: (cell: any, row: any) => {
      if (row?.pay_period) {
        return moment(row?.pay_period?.split('-')?.[0]?.trim()).format('DD MMMM, YYYY');
      }
    },
  },
  {
    text: 'End Date',
    dataField: 'pay_period',
    formatter: (cell: any, row: any) => {
      if (row?.pay_period) {
        return moment(row?.pay_period?.split('-')?.[1]?.trim()).format('DD MMMM, YYYY');
      }
    },
  },
  {
    text: 'Pay Date',
    dataField: 'pay_date',
    formatter: (cell: any, row: any) => {
      return moment(cell).format('DD MMMM, YYYY');
    },
  },
  {
    text: 'Bank Account Number',
    dataField: 'employee.employee_bank_info.account_number',
  },
  {
    text: 'Amount',
    dataField: 'net_pay',
    formatter: (cell: any, row: any) => {
      return new Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: 'USD',
      }).format(cell || 0);
    },
  },
];

const Page = () => {
  const { isPending, data, isError, error } = useFetch(
    ['moov-info'],
    fetchMoovAccount,
    {},
    { retry: 1 }
  );
  const { data: bankData, isPending: isBankPending } = useFetch(
    ['source-bank-account'],
    fetchLinkedBankAccount,
    {},
    { retry: 1 }
  );
  const {
    data: salaryData,
    isPending: isSalaryPending,
    setQueryParams,
    params,
    refetch,
  } = useFetch(['salary-process'], fetchSalaryProcessHistory, {
    is_salary_done: false,
  });
  const [warnings, setWarnings] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'process' | 'pending' | 'history' | 'canceled'>(
    'process'
  );
  const [paymentData, setPaymentData] = useState<any>({});
  // The 200 body from the pay endpoint: { already_paid, transfer, receipt }.
  const [payoutResult, setPayoutResult] = useState<any>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isConfirmEnabled = confirmText.toLowerCase() === 'confirm';

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setIsLoading(false);
    }
  }, [isOpen]);

  /**
   * 400, 404 and 502 all mean the transfer did NOT go out, so say that plainly.
   * An ambiguous "the payment may have gone through" is exactly what made people
   * retry blind and pay twice under the old two-call flow.
   */
  const payoutErrorMessage = (error: any) => {
    const status = error?.response?.status;
    const body = error?.response?.data;
    // The API returns both `{ error: true, message }` and `{ error: "…" }`.
    const detail =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.error === 'string' && body.error) ||
      '';
    if (status === 404) {
      return detail || 'This payroll run no longer exists.';
    }
    if (status === 400 || status === 502) {
      return `${detail || 'The payment could not be sent.'} No money has moved — it is safe to try again.`;
    }
    return detail || 'Could not complete the payment. Please try again.';
  };

  const handleConfirm = async () => {
    if (!isConfirmEnabled || isLoading) return;
    if (!(Number(paymentData?.net_pay || 0) > 0)) {
      return toast.error('This run has no net pay to send.');
    }
    try {
      setIsLoading(true);
      // One atomic server-side call: it resolves both banks, moves the money,
      // marks the run paid and returns the receipt. The frontend no longer
      // creates the Moov transfer or sets is_salary_done — doing both from here
      // is what allowed a run to be paid twice when the second call failed.
      const res = await payMoovSalary(paymentData?.uid);
      setPayoutResult(res);
      setIsPaymentOpen(false);
      setIsSuccessOpen(true);
      toast.success(
        res?.already_paid ? 'This run was already paid — showing the receipt.' : 'Payment sent.'
      );
      refetch();
      refetchTabCount();
    } catch (error) {
      toast.error(payoutErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isConfirmEnabled && !isLoading) {
      handleConfirm();
    }
    if (e.key === 'Escape') {
      setIsPaymentOpen(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!isPending || isError || error) {
      let errors = [];
      if (!data?.data?.uid) {
        const err = {
          title: 'Direct deposit account not found!',
          message:
            'We couldn’t find a direct deposit account linked to your business. Please add your account details to continue.',
        };
        errors.push(err);
      }
      if (
        data?.data?.uid &&
        (!data?.data?.moov_account_uid || !data?.data?.moov_representative_uid)
      ) {
        const err = {
          title: 'Your direct deposit setup isn’t complete',
          message:
            'We couldn’t find a direct deposit account linked to your business. Please add your account details to finish setting up and ensure payments are processed smoothly.',
        };
        errors.push(err);
      }
      if (data?.data?.uid && !data?.data?.moov_bank_accounts?.length) {
        const err = {
          title: 'No bank account found associated to your direct deposit',
          message: 'A valid bank account must be linked before direct deposit can be activated.',
        };

        errors.push(err);
      }
      setWarnings(errors);
      if (
        !isPending &&
        (!data?.data?.moov_bank_accounts?.length ||
          !data?.data?.moov_representative_uid ||
          !data?.data?.uid ||
          !data?.data?.moov_account_uid)
      ) {
        setIsOpen(true);
      }
    }
  }, [isPending, data]);

  const handlePay = (data: any) => {
    setPaymentData(data);
    setIsPaymentOpen(true);
  };

  const {data: tabCountData, isPending: isTabCountPending, refetch: refetchTabCount} = useFetch(
    ['salary-process-tab-counts'],
    fetchSalaryProcessTabCount,
    {},
    { retry: 1 }
  );

  const tabCounts = tabCountData?.data || {};
  const TabBadge = ({ count, active }: { count?: number; active: boolean }) => {
    if (isTabCountPending) {
      return <span className="ml-2 h-4 w-5 animate-pulse rounded-full bg-gray-200" />;
    }
    if (count === undefined || count === null) return null;
    return (
      <span
        className={`ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold transition-colors ${
          active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {count}
      </span>
    );
  };

  return (
    <div className="my-7 max-w-screen-2xl rounded-xl p-7">
      <div className="">
        <div className="">
          {/* Header */}
          <div className="mb-7 rounded-xl border bg-white/60 p-7">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Direct Deposit</h1>
              <Button className="rounded bg-accent_soft_black py-2.5 text-white transition-colors">
                Link account
              </Button>
            </div>
            {/* Bank Cards */}
            {isBankPending ? (
              <div className="h-[168px] w-full animate-pulse rounded-xl bg-[#e0eefc] md:w-[350px]" />
            ) : bankData?.results?.length ? (
              <div className="flex flex-wrap gap-4">
                {bankData?.results?.map((bank: any) => {
                  const isActive = bank?.status === 'ACTIVE';
                  return (
                    <div
                      key={bank?.uid}
                      className="w-full cursor-pointer rounded-xl border border-accent_soft_blue bg-[#e0eefc] md:w-[350px]"
                    >
                      <div className="z-[10] flex flex-col justify-between rounded-xl bg-accent_soft_blue p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-blue-900 p-2">
                              <RiBankFill className="text-2xl" />
                            </div>

                            <span className="text-lg">{bank?.bank_name || 'Your Bank'}</span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="mt-4 flex flex-col">
                            <span className="text-xl font-medium">
                              {'****' + (bank?.account_number || '')}
                            </span>
                            <span className="text-sm uppercase">
                              {bank?.account_type} account
                            </span>
                          </p>
                          <p className="text-sm font-light">
                            Added On: {moment(bank?.created_at).format('DD/MM/YYYY')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue flex items-end justify-between p-4">
                        <p className="flex flex-col">
                          <span className="text-xl font-medium text-[#131523]">
                            {bank?.account_holder_name}
                          </span>
                          <span className="text-sm font-light uppercase">
                            Routing: {bank?.routing_number}
                          </span>
                        </p>
                        {isActive ? (
                          <p className="text-lg font-medium text-accent_soft_blue">
                            <IoCheckmarkCircleSharp className="text-3xl text-accent_soft_blue" />
                          </p>
                        ) : (
                          <p className="roundetd-md bg-red-600 px-3 py-1 text-sm font-light text-white">
                            {bank?.status || 'INACTIVE'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex w-full flex-col items-start gap-3 rounded-xl border border-dashed border-accent_soft_blue bg-[#e0eefc] p-4 md:w-[350px]">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-900 p-2 text-white">
                    <RiBankFill className="text-2xl" />
                  </div>
                  <span className="text-lg text-accent_soft_black">No bank account linked</span>
                </div>
                <p className="text-sm font-light text-gray-600">
                  Link a bank account to start paying your employees.
                </p>
                <Link
                  href={'/dashboard/hris/payroll/settings#bankSection'}
                  className="rounded-md border border-accent_soft_blue bg-white/60 px-4 py-2 text-sm font-medium text-accent_soft_blue transition-colors hover:bg-white"
                >
                  Add bank account
                </Link>
              </div>
            )}
          </div>
          {/* Tabs */}
          <div className="mb-6 flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('process')}
              className={`flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'process'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              On process
              <TabBadge count={tabCounts?.on_process} active={activeTab === 'process'} />
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
              <TabBadge count={tabCounts?.pending} active={activeTab === 'pending'} />
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment History
              <TabBadge
                count={tabCounts?.paid ?? tabCounts?.completed ?? tabCounts?.history}
                active={activeTab === 'history'}
              />
            </button>

            <button
              onClick={() => setActiveTab('canceled')}
              className={`flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === 'canceled'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Canceled
              <TabBadge count={tabCounts?.canceled} active={activeTab === 'canceled'} />
            </button>
          </div>
          {activeTab == 'process' && (
            <Table
              ActionFormatter={(row: any) => {
                return (
                  <button
                    onClick={() => handlePay(row)}
                    className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    Send
                  </button>
                );
              }}
              isCheckbox={false}
              isScreen={false}
              headerShown={false}
              data={salaryData}
              loading={isSalaryPending}
              setParams={setQueryParams}
              params={params}
              refetch={refetch}
              columns={columns}
            />
          )}
          {activeTab == 'history' && <PaymentHistoryTable />}
          {activeTab == 'pending' && <PendingPaymentTable />}
          {activeTab == 'canceled' && <CanceledPaymentTable />}
          {/* <PayrollTable /> */}
        </div>
      </div>
      <PopupModal classNames="bg-gradient-to-b from-red-500 via-white to-white" isOpen={isOpen}>
        <div className="relative w-full bg-white/60 p-7">
          <div className="z-50">
            {/* Modal Header */}
            <h2 className="mb-6 text-center text-2xl font-bold text-black">Warning!</h2>

            {/* Confirmation Message */}
            <p className="mb-6 text-center text-xl text-gray-800">
              Didn't found
              <span className="font-semibold"> direct deposit</span> info!
            </p>

            {/* Warning Section */}
            {warnings?.map((data, index) => {
              return (
                <div key={index} className="mb-4 border-l-4 border-orange-400 bg-orange-50 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {/* Warning Triangle Icon */}
                      <svg
                        className="mt-0.5 h-5 w-5 text-red-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-medium text-red-800">{data.title}</h3>
                      <p className="mt-1 text-sm text-red-700">{data.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Action Buttons */}
            <div className="mt-7 flex gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 text-nowrap bg-teal-800 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-teal-900"
              >
                Close
              </button>
              <Link
                href={'/dashboard/hris/payroll/settings#bankSection'}
                className="flex-1 text-nowrap border-2 border-gray-800 bg-white/60 px-5 py-2.5 text-base font-medium text-gray-800 transition-colors hover:bg-gray-50"
              >
                Go to Direct Deposit Setup
              </Link>
            </div>
          </div>
        </div>
      </PopupModal>

      <RootPopup
        widthClass="w-full md:max-w-[580px]"
        // onClose={() => setIsOpen(false)}
        isOpen={isPaymentOpen}
        // title="Check your bank account now"
      >
        {isPaymentOpen && (
          <div className="w-full space-y-6 rounded-2xl bg-white/60 duration-200 animate-in fade-in-0">
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="size-16 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Confirm Payment</h2>
              <p className="text-sm font-light text-gray-700">
                You are about to send money. This action cannot be undone.
              </p>
            </div>

            {/* Payment Details */}
            <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-normal text-accent_soft_black">Amount:</span>
                <span className="text-xl font-medium text-accent_soft_black">
                  {new Intl.NumberFormat('en-us', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(paymentData?.net_pay || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-normal text-accent_soft_black">To:</span>
                <span className="text-base font-normal text-gray-900">
                  {paymentData?.employee?.full_name}
                </span>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-3">
              <label className="block text-sm font-normal text-gray-700">
                Type <span className="font-medium text-blue-600">CONFIRM</span> to proceed:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type CONFIRM here..."
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-normal outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsPaymentOpen(false)}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmEnabled || isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  'Send Payment'
                )}
              </button>
            </div>
          </div>
        )}
      </RootPopup>
      <PaymentSuccessModal
        recipient={paymentData?.employee?.full_name || '—'}
        transactionId={payoutResult?.transfer?.moov_transfer_uid || payoutResult?.transfer?.uid || '—'}
        amount={new Intl.NumberFormat('en-us', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(payoutResult?.transfer?.amount ?? paymentData?.net_pay ?? 0))}
        status={payoutResult?.transfer?.status}
        alreadyPaid={!!payoutResult?.already_paid}
        receiptUrl={payoutResult?.receipt?.url}
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          setPayoutResult(null);
        }}
      />
    </div>
  );
};

export default Page;
