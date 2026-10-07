'use client';

import { FileText, Receipt } from 'lucide-react';
import { useSnapExpense } from './context/SnapExpense.Context';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { pill: string; text: string }> = {
  DRAFT: { pill: 'bg-[#f9ebc1]', text: 'text-[#8c6b04]' },
  SUBMITTED: { pill: 'bg-[#dbeafe]', text: 'text-[#1d4ed8]' },
  REVIEW: { pill: 'bg-[#ede9fe]', text: 'text-[#5b21b6]' },
  REQUEST_CHANGES: { pill: 'bg-[#ffedd5]', text: 'text-[#c2410c]' },
  APPROVED: { pill: 'bg-[#d1fae5]', text: 'text-[#047857]' },
  REJECTED: { pill: 'bg-[#fee2e2]', text: 'text-[#b91c1c]' },
  PAID: { pill: 'bg-[#e0e7ff]', text: 'text-[#3730a3]' },
};

function statusLabel(s: string) {
  return s.replace(/_/g, ' ') ? s.replace(/_/g, ' ')?.toLowerCase() : '—';
}

type ExpenseReportChatCardProps = {
  report: Record<string, unknown>;
  handleScrollToMessage: (messageId: string) => void;
};

export function ExpenseReportChatCard({ report, handleScrollToMessage }: any) {
  const { sendRoomAction, currentUserGroupRole, isGroupChatView } = useSnapExpense();
  const [isOpen, setIsOpen] = useState(false);

  const styles = STATUS_STYLES[report?.status] ?? {
    pill: 'bg-[#F3F4F6]',
    text: 'text-[#374151]',
  };

  const can = (roles: string[]) =>
    isGroupChatView && currentUserGroupRole != null && roles.includes(currentUserGroupRole);

  const transitions: Array<{ to: string; label: string; roles: string[]; from: string[] }> = [
    {
      to: 'SUBMITTED',
      label: 'Submit',
      roles: ['EMPLOYEE', 'FINANCE', 'APPROVER', 'MODERATOR', 'GROUP_ADMIN'],
      from: ['DRAFT'],
    },
    // {
    //   to: 'REVIEW',
    //   label: 'Review',
    //   roles: ['MODERATOR', 'GROUP_ADMIN'],
    //   from: ['SUBMITTED', 'REQUEST_CHANGES', 'REVIEW'],
    // },
    // {
    //   to: 'REQUEST_CHANGES',
    //   label: 'Request changes',
    //   roles: ['MODERATOR', 'GROUP_ADMIN'],
    //   from: ['SUBMITTED', 'REQUEST_CHANGES', 'REVIEW'],
    // },
    {
      to: 'APPROVED',
      label: 'Approve',
      roles: ['APPROVER', 'GROUP_ADMIN'],
      from: ['SUBMITTED', 'REQUEST_CHANGES'],
    },
    {
      to: 'REJECTED',
      label: 'Reject',
      roles: ['APPROVER', 'GROUP_ADMIN'],
      from: ['SUBMITTED', 'REQUEST_CHANGES', 'REVIEW'],
    },
    { to: 'PAID', label: 'Pay', roles: ['FINANCE', 'GROUP_ADMIN'], from: ['APPROVED'] },
  ];

  return (
    <div className={cn('flex w-full max-w-[482px] flex-col overflow-hidden rounded-2xl')}>
      {report?.status_previous && Number(report?.origin_message_id) > 0 ? (
        <div className="flex flex-col pt-2">
          <p className="text-center text-sm capitalize text-[#685f5f]">
            Expense Report Status Changed from{' '}
            <span
              className={cn(
                'text-center font-medium capitalize',
                STATUS_STYLES[report?.status_previous]?.text
              )}
            >
              {report?.status_previous ? statusLabel(report?.status_previous) : '—'}
            </span>{' '}
            to{' '}
            <span
              className={cn(
                'text-center font-medium capitalize',
                STATUS_STYLES[report?.status]?.text
              )}
            >
              {report?.status ? statusLabel(report?.status) : '—'}
            </span>{' '}
            {report?.status == 'APPROVED' && ` by ${report?.approved_by}`}
            {report?.status == 'REJECTED' && ` by ${report?.rejected_by}`}
            {report?.status == 'PAID' && ` by ${report?.paid_by}`}
            {report?.status == 'SUBMITTED' && ` by ${report?.submitted_by}`}
          </p>
          <button
            onClick={() => {
              handleScrollToMessage(report?.origin_message_id as string);
            }}
            className="mx-2 mt-4 rounded-lg border border-blue-500 px-2 py-1 text-sm text-blue-500 transition-all duration-200 hover:bg-blue-500 hover:text-white"
          >
            View Details
          </button>
        </div>
      ) : (
        <>
          {' '}
          <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB]/90 px-4 py-2 text-sm">
            <p className="font-medium text-[#111827]">Expense Report</p>
            <div
              className={cn(
                'flex min-w-[80px] items-center justify-center rounded-lg px-4 py-2',
                styles.pill
              )}
            >
              <span className={cn('text-center font-medium capitalize', styles.text)}>
                {statusLabel(report?.status)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-[#E5E7EB]/90">
            <div className="mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white bg-[#dcdafa]">
              <Receipt className="h-8 w-8 text-[#6b5b95]" strokeWidth={1.25} />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium text-[#111827]">View Receipt</p>
              <p className="text-sm font-light text-[#9FAAB8]">
                {report?.description ? 'Details below' : 'No description'}
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[#111827]">Amount</span>
                <div className="flex h-10 items-center rounded border border-[#d7dbec] px-3.5 font-medium text-[#111827]">
                  {report?.currency} {Number(report?.amount)?.toFixed(2)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[#111827]">Vendor/Supplier</span>
                <div className="flex h-10 items-center truncate rounded border border-[#d7dbec] px-3.5 font-medium text-[#111827]">
                  {report?.supplier?.title || '—'}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[#111827]">Expense Date</span>
                <div className="flex h-10 items-center rounded border border-[#d7dbec] px-3.5 font-medium text-[#111827]">
                  {report?.expense_date || '—'}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-[#111827]">Reference</span>
                <div className="flex h-10 items-center truncate rounded border border-[#d7dbec] px-3.5 font-medium text-[#111827]">
                  {report?.reference_number || '—'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-medium text-[#111827]">Description</span>
              <div className="rounded border border-[#d7dbec] px-3.5 py-3 font-medium text-[#111827]">
                {report?.description || <span className="text-[#9FAAB8]">—</span>}
              </div>
            </div>
          </div>
          {/* {report?.status == 'REJECTED' && (
            <div className="mt-2 flex flex-col gap-2 bg-red-500 px-4 py-2">
              <p className="text-base text-white">Report was rejected.</p>
            </div>
          )} */}
        </>
      )}
      {report?.uid && isOpen && (
        <ChatExpenseModal open={isOpen} onClose={() => setIsOpen(false)} data={report} />
      )}
      {report?.uid && !report?.origin_message_id ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E5E7EB]/90 px-2 pt-3">
          {transitions
            .filter((t) => t.from.includes(report?.status) && can(t.roles))
            .map((t) => (
              <button
                key={t.to}
                type="button"
                onClick={() => {
                  if (t?.label == 'Submit') {
                    setIsOpen(true);
                  }
                  if (t?.label == 'Approve') {
                    setIsOpen(true);

                    return;
                  } else if (t?.label == 'Reject') {
                    setIsOpen(true);
                    return;
                  }
                  if (t?.label == 'Pay') {
                    setIsOpen(true);
                    return;
                  }
                }}
                className={cn(
                  'rounded-lg border border-[#e1e3e5] px-4 py-2 text-sm text-[#111827] transition-colors hover:bg-[#F9FAFB]',
                  t.label === 'Approve'
                    ? 'bg-[#d1fae5]'
                    : t.label === 'Reject'
                      ? 'bg-[#fee2e2]'
                      : t.label === 'Pay'
                        ? 'bg-gray-500 px-7 text-white hover:bg-gray-400'
                        : 'bg-white'
                )}
              >
                {t.label}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}

import { useState } from 'react';

import SupplierSelectDropDown from '@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown';
import { SnapModalPortal } from './modals/SnapModalPortal';
import Button from './ui/Button';
import Image from 'next/image';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import PayMethodSelectDropdown from '@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import { toast } from '@/lib/ToastService';

type ChatExpenseModalProps = {
  open: boolean;
  onClose: () => void;
  data: any;
};

export function ChatExpenseModal({ open, onClose, data }: ChatExpenseModalProps) {
  const { token, sendRoomAction, isGroupChatView } = useSnapExpense();
  const [paymentInfo, setPaymentInfo] = useState<{
    deposit_to: any;
    payment_date: any;
    payment_method: any;
  }>({
    deposit_to: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
  });
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const isDisabled = data?.status == 'APPROVED' || data?.status == 'REJECTED';
  const [ExpenseData, setExpenseData] = useState({
    amount: data?.amount,
    currency: data?.currency,
    description: data?.description?.trim() || undefined,
    expense_date: data?.expense_date,
    status: data?.status,
    supplier: data?.supplier,
    reference_number: data?.reference_no,
    category: data?.category,
  });

  const handleSubmitPayment = () => {
    if (paymentInfo?.deposit_to?.uid && paymentInfo?.payment_date && paymentInfo?.payment_method) {
      sendRoomAction({
        action: 'change_expense_report_status',
        data: {
          deposit_to: paymentInfo?.deposit_to?.uid,
          payment_date: paymentInfo?.payment_date,
          payment_method: paymentInfo?.payment_method?.uid,
          origin_message_id: data?.id,
          report_uid: data?.uid,
          purchase_uid: data?.purchase_uid,
          new_status: 'PAID',
        },
      });
      setIsPaymentOpen(false);
      onClose();
    } else {
      toast.error('Please fill in all the payment fields');
    }
  };

  return (
    <SnapModalPortal
      isOpen={open}
      onClose={onClose}
      hideHeader
      widthClass="w-full max-w-[1180px]"
      classNames="bg-white shadow-2xl"
    >
      <div className="flex max-h-[85vh] flex-col gap-0 overflow-y-auto p-0 font-inter md:flex-row">
        {/* Left: draft / receipt visual */}
        <div className="flex min-h-[200px] flex-1 items-center justify-center bg-[#F3F4F6] p-8 md:max-w-[380px]">
          {data?.file_path ? (
            <Image
              src={data?.file_path}
              alt="Receipt"
              width={400}
              height={560}
              className="max-h-[min(70vh,560px)] w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-[#9CA3AF]">
              <FileText className="h-24 w-24 stroke-1" />
              <p className="text-sm">Receipt preview</p>
            </div>
          )}
        </div>

        {/* Right: form card */}
        <div className="relative flex flex-1 flex-col border-l border-[#d7d7d7] bg-white">
          <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
            <h2 className="text-base font-normal text-[#685f5f]">Expense Report</h2>
            <span
              className={cn(
                'mr-10 rounded-lg px-5 py-2.5 text-base',
                STATUS_STYLES[data?.status]?.pill
              )}
            >
              <span
                className={cn(
                  'text-base font-semibold capitalize',
                  STATUS_STYLES[data?.status]?.text
                )}
              >
                {statusLabel(data?.status)}
              </span>
            </span>
          </div>

          <div
            className={cn(
              'mx-6 mt-4 rounded-2xl border-2 border-dashed p-4 transition-colors',
              'border-transparent'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-2xl bg-[#E5E7EB] text-sm text-[#685f5f]">
                Receipt
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Amount</label>
                <input
                  type="text"
                  value={ExpenseData?.amount}
                  onChange={(e) => setExpenseData({ ...ExpenseData, amount: e.target.value })}
                  disabled={isDisabled}
                  className="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                  placeholder="$0.00"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Vendor/Supplier</label>
                <div className="relative min-h-[44px]">
                  <SupplierSelectDropDown
                    ClassName="border border-[#d7d7d7] focus:border-[#3462FA]"
                    parentClassName="w-full"
                    setValue={(value: any) => {
                      setExpenseData({ ...ExpenseData, supplier: value });
                    }}
                    value={{
                      uid: ExpenseData?.supplier?.uid,
                      first_name:
                        ExpenseData?.supplier?.title ||
                        (ExpenseData?.supplier?.first_name || '') +
                          ' ' +
                          (ExpenseData?.supplier?.last_name || ''),
                    }}
                    view={isDisabled}
                    // OnSelect={onSupplierSelect}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Expense Date</label>
                <input
                  type="date"
                  value={ExpenseData?.expense_date}
                  onChange={(e) => setExpenseData({ ...ExpenseData, expense_date: e.target.value })}
                  disabled={isDisabled}
                  className="h-11 w-full border border-[#d7d7d7] px-3 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Category</label>
                <AccountSelectDropDown
                  setValue={(value: any) => setExpenseData({ ...ExpenseData, category: value })}
                  value={{
                    uid: ExpenseData?.category?.uid,
                    title: ExpenseData?.category?.title,
                  }}
                  view={isDisabled}
                  ClassName="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base text-[#685f5f]">Description</label>
              <textarea
                value={ExpenseData?.description}
                onChange={(e) => setExpenseData({ ...ExpenseData, description: e.target.value })}
                // onChange={(e) => setDescription(e.target.value)}
                disabled={isDisabled}
                rows={4}
                className="w-full resize-none border border-[#d7d7d7] px-3.5 py-3 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
              />
            </div>
          </div>

          <div
            className={`${isPaymentOpen ? 'visible' : 'invisible'} fixed inset-0 left-0 top-0 z-[200000000] flex h-full w-full items-center justify-center overflow-hidden bg-black/50 transition-all duration-300`}
          >
            <div
              className={`${isPaymentOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} fixed left-1/2 top-1/2 z-50 w-full max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/40 bg-white pb-5 shadow-2xl transition-all duration-300`}
            >
              <div className="flex items-center justify-end border-b border-[#E5E7EB] px-6 py-5">
                <button type="button" onClick={() => setIsPaymentOpen(false)}>
                  Close
                </button>
              </div>
              <div className="flex w-full max-w-[450px] flex-col gap-4 p-5 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-normal leading-5 text-[#685f5f]">Bank/Cash Account</label>
                  <AccountSelectDropDown
                    setValue={(value: any) => setPaymentInfo({ ...paymentInfo, deposit_to: value })}
                    value={{
                      uid: paymentInfo?.deposit_to?.uid,
                      title: paymentInfo?.deposit_to?.title,
                    }}
                    filters={{ account_type__title: 'Bank' }}
                    ClassName="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-normal leading-5 text-[#685f5f]">Payment Date</label>
                  <input
                    type="date"
                    value={paymentInfo?.payment_date}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, payment_date: e.target.value })
                    }
                    placeholder="mm/dd/yyyy"
                    className="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-normal leading-5 text-[#685f5f]">Payment Method</label>
                  <PayMethodSelectDropdown
                    ClassName="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                    parentClassName="w-full"
                    value={paymentInfo?.payment_method}
                    setValue={(value: any) =>
                      setPaymentInfo({ ...paymentInfo, payment_method: value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-normal leading-5 text-[#685f5f]">Amount</label>
                  <input
                    type="text"
                    value={data?.amount}
                    placeholder="$0.00"
                    className="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                  />
                </div>
                <div className="mt-4 text-center">
                  <Button
                    size="medium"
                    className="bg-blue-500 px-7 py-2.5 text-white hover:bg-blue-400"
                    onClick={() => {
                      handleSubmitPayment();
                    }}
                  >
                    Submit Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              {data?.status == 'SUBMITTED' && (
                <>
                  <Button
                    size="medium"
                    className="bg-green-500 px-7 py-2.5 text-white hover:bg-green-400"
                    // disabled={submitting}
                    onClick={() => {
                      sendRoomAction({
                        action: 'change_expense_report_status',
                        data: {
                          ...ExpenseData,
                          origin_message_id: data?.id,
                          report_uid: data?.uid,
                          supplier: ExpenseData?.supplier?.uid,
                          category: ExpenseData?.category?.uid,
                          new_status: 'APPROVED',
                        },
                      });
                      onClose();
                    }}
                  >
                    Approve
                  </Button>

                  <Button
                    size="medium"
                    className="bg-red-500 px-7 py-2.5 text-white hover:bg-red-400"
                    // disabled={submitting}
                    onClick={() => {
                      sendRoomAction({
                        action: 'change_expense_report_status',
                        data: {
                          ...ExpenseData,
                          origin_message_id: data?.id,
                          supplier: ExpenseData?.supplier?.uid,
                          category: ExpenseData?.category?.uid,
                          report_uid: data?.uid,
                          new_status: 'REJECTED',
                        },
                      });
                      onClose();
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              {data?.status == 'DRAFT' && (
                <Button
                  size="medium"
                  className="bg-green-500 px-7 py-2.5 text-white hover:bg-green-400"
                  // disabled={submitting}
                  onClick={() => {
                    sendRoomAction({
                      action: 'change_expense_report_status',
                      data: {
                        ...ExpenseData,
                        origin_message_id: data?.id,
                        supplier: ExpenseData?.supplier?.uid,
                        category: ExpenseData?.category?.uid,
                        report_uid: data?.uid,
                        new_status: 'SUBMITTED',
                      },
                    });
                    onClose();
                  }}
                >
                  Submit
                </Button>
              )}

              {data?.status == 'APPROVED' && (
                <>
                  <Button
                    size="medium"
                    className="rounded-lg bg-[#e5e7eb] px-5 py-2.5 text-base font-normal leading-5 text-[#685f5f] hover:bg-[#d7d7d7]"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="medium"
                    className="rounded-lg bg-[#16a34a] px-5 py-2.5 text-base font-normal leading-5 text-white hover:bg-[#15803d]"
                    onClick={() => {
                      setIsPaymentOpen(true);
                      return;
                    }}
                  >
                    Pay Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </SnapModalPortal>
  );
}
