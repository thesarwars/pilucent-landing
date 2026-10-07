"use client";

import RootPopup from "../../settings/_components/BankAccounts/PopupModal";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  recipient: string;
  transactionId: string;
  /** Moov transfer status. PENDING until the backend's webhook settles it. */
  status?: string;
  /** True when a prior attempt had already paid this run — not a double charge. */
  alreadyPaid?: boolean;
  /**
   * Server-generated receipt. Replaces the old client-side jsPDF receipt, which
   * was built from props the caller never filled in and printed $0.00 as a
   * record of a real payment.
   */
  receiptUrl?: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  amount,
  recipient,
  transactionId,
  status,
  alreadyPaid,
  receiptUrl,
}: PaymentSuccessModalProps) {
  return (
    <RootPopup isOpen={isOpen}>
      {/* Modal */}
      <div className="relative w-full transform rounded-2xl bg-white transition-all duration-300 ease-out dark:bg-gray-900">
        {/* Success Icon */}
        <div className="flex justify-center pb-4 pt-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {alreadyPaid ? "Already Paid" : "Payment Sent"}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {alreadyPaid
              ? "This run had already been paid — no second payment was made."
              : "The transfer is on its way to the employee's bank."}
          </p>

          {/* Payment Details */}
          <div className="mb-6 space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {amount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">To</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {recipient}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Transaction ID
              </span>
              <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                {transactionId}
              </span>
            </div>
            {status && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-medium text-gray-900 dark:text-white">{status}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date</span>
              <span className="text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {status === "PENDING" && (
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              The bank settles this in the background — the status updates on its own, nothing
              else is needed from you.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
            >
              Done
            </button>
            {/* Only offer a receipt the server actually produced — never fabricate
                one client-side for a payment that really happened. */}
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-nowrap rounded-lg bg-gray-100 px-6 py-3 text-center font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                View Receipt
              </a>
            )}
          </div>
        </div>
      </div>
    </RootPopup>
  );
}
