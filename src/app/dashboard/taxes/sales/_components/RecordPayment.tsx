"use client";

import Button from "@/components/ui/RawButton";
import { useState } from "react";

export default function TaxPaymentForm({ onClose }: { onClose: () => void }) {
  const [taxAmount, setTaxAmount] = useState("32.50");
  const [paymentDate, setPaymentDate] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [memo, setMemo] = useState("");
  const [printCheck, setPrintCheck] = useState(false);

  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      {/* Header */}
      <h1 className="mb-8 text-2xl font-medium text-gray-800">
        Record what you paid to the tax agency
      </h1>

      {/* Summary Section */}
      <div className="mb-8 rounded-lg bg-gray-50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-medium text-gray-700">Total tax payment</span>
          <span className="font-semibold text-gray-900">$32.50</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700">Tax due</span>
          <span className="text-lg font-semibold text-gray-900">$32.50</span>
        </div>
      </div>

      {/* Bullet Points */}
      <ul className="mb-12 space-y-2">
        <li className="flex items-start">
          <span className="mr-3 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
          <span className="text-gray-700">
            Save a copy of what you filed and paid.
          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-3 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
          <span className="text-gray-700">
            Record what you paid to the tax agency.
          </span>
        </li>
      </ul>

      {/* Record Payment Form */}
      <div>
        <h2 className="mb-6 text-xl font-medium text-gray-800">
          Record payment
        </h2>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tax Amount */}
          <div>
            <label
              htmlFor="tax-amount"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Tax amount
            </label>
            <input
              id="tax-amount"
              type="text"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              className="w-full rounded-md border-2 border-green-500 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Payment Date */}
          <div>
            <label
              htmlFor="payment-date"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Payment date
            </label>
            <div className="relative">
              <input
                id="payment-date"
                type="text"
                placeholder="Select date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div>
            <label
              htmlFor="bank-account"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Bank account
            </label>
            <div className="relative">
              <select
                id="bank-account"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select account</option>
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Memo */}
        <div className="mb-6">
          <label
            htmlFor="memo"
            className="mb-2 block text-sm font-medium text-gray-600"
          >
            Memo
          </label>
          <textarea
            id="memo"
            rows={4}
            placeholder="Enter memo text here"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Print Check */}
        <div className="mb-8">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={printCheck}
              onChange={(e) => setPrintCheck(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-600">Print check</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={onClose}
            type="button"
            className="mt-8 rounded-3xl border border-accent_soft_black bg-white py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white hover:brightness-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
                className="mt-8 rounded-3xl border border-accent_soft_black bg-accent_soft_black py-2 text-white transition-all hover:bg-accent_soft_black hover:text-white hover:brightness-100"
          >
            Record payment
          </Button>
        </div>
      </div>
    </div>
  );
}
