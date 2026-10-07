"use client";

import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { toast } from "@/lib/ToastService";
import { useState } from "react";
import {
  FiCheckCircle,
  FiDollarSign,
  FiCreditCard,
  FiArrowRight,
  FiXCircle,
} from "react-icons/fi";

const AccountMatchVerification = ({
  accounts,
  setAccounts,
  setStep,
}: {
  setStep: any;
  accounts: any;
  setAccounts: any;
}) => {
  const [isError, setIsError] = useState(false);
  const handleSetValue = (account: any, accountId: any) => {
    // Handle setting the value for the account
    const isSelectedBefore =  accounts?.find((acc: any) => (acc.chart_of_account?.uid == account?.uid));
    if(isSelectedBefore?.chart_of_account?.uid){
      return toast.error("This account is already selected");
    }
    if(account?.bank_id){
       toast.warning("This account is already linked with another bank account. if you change it the previous one will be unlinked.");
    }
    const updatedAccounts = accounts.map((acc: any) => {
      if (acc.account_id === accountId) {
        return { ...acc, chart_of_account: account };
      }
      return acc; 
    });
    setAccounts(updatedAccounts);
  };

  const getAccountIcon = (type: string, subtype: string) => {
    if (type === "credit" || subtype === "credit card") {
      return <FiCreditCard className="h-5 w-5 text-blue-500" />;
    }
    return <FiDollarSign className="h-5 w-5 text-blue-500" />;
  };

  const handleContinue = () => {
    // Handle continue action
    const allAccountsMatched = accounts.every(
      (account: any) => account.chart_of_account
    );
    if (allAccountsMatched) {
      setStep(2);
    } else {
      setIsError(true);
      toast.error("Please match all accounts before proceeding.");
    }
  };

  return (
    <div className="rounded-lg bg-white font-lexend shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center">
            <div className="mr-3 rounded-full bg-blue-100 p-2">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Verify your account information
            </h2>
          </div>
          <p className="ml-12 text-gray-500">
            Please match each account with the appropriate chart of account
            before proceeding.
          </p>
        </div>

        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-700">
            Match Accounts
          </h3>

          <div className="space-y-4">
            {accounts?.map((account: any) => (
              <div
                key={account.account_id}
                className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getAccountIcon(account?.type, account?.subtype)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {account?.name}
                        </h4>
                        <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 text-sm text-gray-500 sm:grid-cols-2">
                          <p className="flex items-center">
                            <span className="w-32">Current Balance:</span>
                            <span className="font-medium text-gray-700">
                              ${account?.balances?.current}
                            </span>
                          </p>
                          <p className="flex items-center">
                            <span className="w-32">Available Balance:</span>
                            <span className="font-medium text-gray-700">
                              ${account?.balances?.available || 0}
                            </span>
                          </p>
                          <p className="flex items-center">
                            <span className="w-32">Currency:</span>
                            <span className="font-medium text-gray-700">
                              {account?.balances?.iso_currency_code}
                            </span>
                          </p>
                          <p className="flex items-center">
                            <span className="w-32">Account Type:</span>
                            <span className="font-medium capitalize text-gray-700">
                              {account?.subtype}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="hidden flex-col items-center md:flex">
                      <div className="h-0.5 w-12 bg-blue-500"></div>
                      <div className="my-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                        <FiArrowRight className="text-blue-600" />
                      </div>
                      <div className="h-0.5 w-12 bg-blue-500"></div>
                    </div>
                    <div className="my-2 flex items-center justify-center md:hidden">
                      <div className="h-8 w-0.5 bg-blue-500"></div>
                      <div className="mx-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                        <FiArrowRight className="rotate-90 transform text-blue-600" />
                      </div>
                      <div className="h-8 w-0.5 bg-blue-500"></div>
                    </div>
                  </div>

                  <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Chart of Account
                    </label>
                    <AccountSelectDropDown
                      value={account?.chart_of_account}
                      setValue={(e: any) =>
                        handleSetValue(e, account?.account_id)
                      }
                      parentClassName="w-full"
                      ClassName={`border ${isError && account?.chart_of_account === undefined ? "border-red-500" : "border-gray-300"} rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {account?.chart_of_account && (
                      <div className="mt-1 flex items-center text-xs text-blue-600">
                        <FiCheckCircle className="mr-1" />
                        <span>Account matched</span>
                      </div>
                    )}
                    {(!account?.chart_of_account?.uid && isError) && (
                      <div className="mt-1 flex items-center text-xs text-red-600">
                        <FiXCircle className="mr-1" />
                        <span>Account not matched</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => handleContinue()}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Continue
            <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountMatchVerification;
