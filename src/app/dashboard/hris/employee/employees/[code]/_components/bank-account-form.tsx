"use client";

import DotSpinner from "@/app/dashboard/hris/employee/employees/_components/dot-spinner";
import { postBankAccount } from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";
import { collectErrorMessages } from "@/utils/flattenErrors";
import type React from "react";

import { useState } from "react";

export default function BankAccountForm({
  data,
  bankAccount,
  refetch,
  isPending,
  setIsOpen,
  setIsVerificationOpen,
}: {
  data: any;
  setIsVerificationOpen: any;
  bankAccount: any;
  refetch: any;
  isPending: any;
  setIsOpen: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  // ) => {
  //   const { name, value } = e.target;
  //   setData((prev: any) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const handleError = (error: any) => {
    try {
      if (error?.response?.data?.message) {
        const errors = JSON.parse(error?.response?.data?.message);
        const messages = collectErrorMessages(errors);
        messages?.map((message) => {
          return toast.error(message);
        });
      }
    } catch (err) {
      // console.log(err);
      toast.error("Something went wrong");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.accountNumber) return toast.error("Account number not given!");
    if (!data?.routingNumber) return toast.error("Routing number not given!");
    if (!data?.bankAccountType) return toast.error("account type not given!");
    try {
      setIsLoading(true);
      const data1 = {
        link_bank_account: {
          account: {
            accountNumber: data?.accountNumber,
            routingNumber: data?.routingNumber,
            bankAccountType: data?.bankAccountType?.toLowerCase(),
            holderName: holderName,
            holderType: "individual",
          },
        },
        bank_account_kind: "DESTINATION",
        employee_uid: data?.EmpUID,
      };

      const res = await postBankAccount(data1);
      if (res?.success) {
        toast.success("Bank account linked.");
        refetch();
        setIsOpen(false);
        setIsVerificationOpen(true);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(data);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return "******" + accountNumber;
    return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  if (isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center py-12">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <h1 className="mb-8 text-center text-xl text-gray-900">
          Link your Bank Account{" "}
        </h1>

        {!bankAccount?.uid ? (
          <div className="">
            <h2 className="mb-4 font-semibold text-gray-800">
              Enter Account Details
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 text-sm font-light"
            >
              <div>
                <label
                  htmlFor="holderName"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Account Holder Name
                </label>
                <input
                  type="text"
                  id="holderName"
                  name="holderName"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label
                  htmlFor="accountNumber"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  disabled
                  value={data.accountNumber}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label
                  htmlFor="routingNumber"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Routing Number
                </label>
                <input
                  type="text"
                  id="routingNumber"
                  name="routingNumber"
                  value={data?.routingNumber}
                  required
                  minLength={9}
                  disabled
                  maxLength={9}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9-digit routing number"
                />
              </div>

              <div>
                <label
                  htmlFor="bankAccountType"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Account Type
                </label>
                <select
                  disabled
                  value={data.bankAccountType}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Account type</option>
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? "Saving info..." : "Save Account Information"}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Account Information
              </h2>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Account Holder
                </label>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {bankAccount.account_holder_name}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Account Number
                </label>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-gray-900">
                    {showAccountNumber
                      ? bankAccount.account_number
                      : maskAccountNumber(bankAccount.account_number)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {showAccountNumber ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => copyToClipboard(data.accountNumber)}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Routing Number
                </label>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-gray-900">
                    {bankAccount.routing_number}
                  </p>
                  <button
                    onClick={() => copyToClipboard(bankAccount.routing_number)}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Account Type
                </label>
                <div className="flex items-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      bankAccount?.account_type === "checking"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {bankAccount?.account_type?.charAt(0).toUpperCase() +
                      bankAccount?.account_type?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="mt-4 rounded-lg bg-muted p-3">
          <p className="text-center text-sm text-muted-foreground">
            🔒 Your information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
