"use client";

import Link from "next/link";

export default function ImportCompleted({ onClose }: { onClose?: any }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
        <div className="space-y-6">
          {/* Header section */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-800">
              Transactions Import completed
            </h1>
            <h2 className="text-lg text-gray-700">
              Next step: Review, Categorize or Accept your transactions
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600">
            You have full control over how your banking information is added to
            Pilucent. Transactions will only appear in your records once{" "}
            {"you've "}
            reviewed and approved them
          </p>

          {/* Button container - aligned to the right */}
          <div className="flex justify-end pt-4">
            <Link
              onClick={onClose}
              href="/dashboard/transactions/banking"
              className="rounded bg-green-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
