"use client";

import { postSalesTax } from "@/app/helpers/backend";
import { Label } from "@/components/ui/label";
import Button from "@/components/ui/RawButton";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { toast } from "@/lib/ToastService";
import moment from "moment";
import { useState } from "react";

export default function TaxAdjustmentForm({ rowData, onClose }: { rowData?: any; onClose?: () => void }) {
  const [expenseAccountValue, setExpenseAccountValue] = useState<any>({});

  const handleAddPayment = async () => {
    console.log("Row Data received in form:", rowData);

    const payload = {
      sales_tax_period: rowData?.period || "",
      sales_tax_due_date: rowData?.due_date ? moment(rowData.due_date).format("YYYY-MM-DD") : null,
      total_sales_tax: rowData?.tax_amount ? parseFloat(rowData.tax_amount.replace('$', '').replace(',', '')) : null,
      status: "ACTIVE",
      agency_uid: rowData?.agency_uid || null,
      charter_account_uid: expenseAccountValue?.uid || null
    };

    const res = await postSalesTax(payload);
    console.log("Payment Response:", res);
    if (res.error) {
      toast.error("Failed to add sales tax adjustment.");
      return;
    } else {
      toast.success("Sales tax adjustment added successfully.");
    }

    console.log("Payment Payload:", payload);

    // Close the modal after logging
    if (onClose) {
      onClose();
    }
  };


  return (
    <div className="bg-white">
      {/* Description */}
      <p className="mb-8 text-sm leading-relaxed text-gray-700">
        An adjustment is an increase or decrease to the sales tax, including
        credits discounts, interest, penalties and corrections.
      </p>

      {/* Reason Dropdown */}
      {/* <div className="mb-6">
        <label
          htmlFor="reason"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Reason
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsReasonOpen(!isReasonOpen)}
            className="w-full rounded-md border bg-white px-3 py-2 text-left focus:outline-none"
          >
            <span className={reason ? "text-gray-900" : "text-gray-500"}>
              {reason || "Reason"}
            </span>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform ${isReasonOpen ? "rotate-180" : ""}`}
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
          </button>

          {isReasonOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              {reasonOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setReason(option);
                    setIsReasonOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left first:rounded-t-md last:rounded-b-md hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div> */}

      {/* Account Dropdown */}
      <Label className="mb- mt-4 block font-medium text-[#5A607F]">
        Expense account
      </Label>
      <AccountSelectDropDown
        value={expenseAccountValue}
        setValue={(e: any) => setExpenseAccountValue(e)}
        filters={{
          account_type__title: "Bank",
        }}
        ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
      />

      {/* Amount Input */}
      {/* <div className="mb-8">
        <label
          htmlFor="amount"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          id="amount"
          type="text"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div> */}

      {/* Total Tax Due */}
      <div className="mt-4">
        <label
          htmlFor="totalTaxDue"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Total tax due
        </label>
        <input
          id="totalTaxDue"
          type="text"
          value={rowData?.tax_amount || "$0.00"}
          disabled
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 cursor-not-allowed"
        />
      </div>

      {/* Help Link */}
      <div>
        <a
          href="#"
          className="rounded text-sm text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          How do sales tax adjustments work?
        </a>
      </div>
      <div className="mt-8 flex items-center gap-8">
        <Button
          onClick={onClose}
          className="mt-8 rounded-3xl border border-accent_soft_black bg-white py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white hover:brightness-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddPayment}
          className="mt-8 rounded-3xl border border-accent_soft_black bg-accent_soft_black py-2 text-white transition-all hover:bg-accent_soft_black hover:text-white hover:brightness-100"
        >
          Add Payment
        </Button>
      </div>
    </div>
  );
}
