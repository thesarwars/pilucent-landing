"use client";

import { useState } from "react";
import AccountTabs from "./account-tabs";
import AccountDetails from "./account-details";
import { patchChartOfAccount, postTransactions } from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";

export default function TransactionsPreview({
  accounts,
  setStep,
  setAccounts,
}: {
  accounts: any;
  setStep: (step: number) => void;
  setAccounts: any;
}) {
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleUpdateCOA = () => {
    const UpdatePromises = accounts?.map((account: any) => {
      const data = {
        bank_balance:
          Number(account?.chart_of_account?.bank_balance) +
          Number(account?.balances?.available || 0),
        bank_id: account?.account_id,
      };
      return patchChartOfAccount(account?.chart_of_account?.uid, data);
    });
    return Promise.allSettled([...UpdatePromises]);
  };

  const handleImportTransactions = () => {
    const importPromises = accounts?.map((account: any) => {
      const transactionData = account?.transactions?.map((d: any) => {
        if (Number(d?.received > 0)) {
          return {
            date: d?.date,
            description: d?.name,
            received: d?.received,
          };
        } else {
          return {
            date: d?.date,
            description: d?.name,
            spent: d?.spent,
          };
        }
      });
      const data = {
        transactions: transactionData,
        chart_of_account: account?.chart_of_account?.uid,
      };
      return postTransactions(data);
    });
    return Promise.allSettled([...importPromises]);
  };

  const handleSubmit = async () => {
    try {
      setIsPending(true);
      const result = await handleUpdateCOA();
      const allSettled = result.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );
      if (allSettled) {
        toast.success("Accounts updated.");
        const res = await handleImportTransactions();
        const allSettledTransactions = res.every(
          (res) => res.status === "fulfilled" && Boolean(res.value),
        );
        if (allSettledTransactions) {
          toast.success("Transactions imported.");
          setStep(3);
        } else {
          toast.error("Some transactions couldn't be imported");
        }
      } else {
        // toast.error("Error updating accounts");
      }
    } catch (error) {
      //error handling
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="bg-gray-50 pb-8 font-lexend">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] h-[100vh] w-full bg-white bg-opacity-60">
          <div
            style={{ boxShadow: "0 0 100vw 100vh rgba(255, 255, 255, 0.5)" }}
            className="flex h-full w-full flex-col items-center justify-center"
          >
            <div className="h-16 w-16 animate-spin rounded-full border-b-[5px] border-t-[5px] border-b-accent_soft_blue border-t-primary"></div>
          </div>
        </div>
      )}
      <div className="  mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Accounts Summary
        </h1>

        <AccountTabs
          accounts={accounts}
          activeIndex={activeAccountIndex}
          onTabChange={setActiveAccountIndex}
        />

        <div className="mt-6">
          <AccountDetails
            account={accounts[activeAccountIndex]}
            AllAccounts={accounts}
            setAccounts={setAccounts}
          />
        </div>
      </div>
      <div className="flex justify-center gap-16">
        <button
          onClick={() => setStep(1)}
          className="mt-4 w-36 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Back
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-36 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Continue
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 top-20 z-[50] flex h-screen items-center justify-center border">
          <div
            style={{ boxShadow: "0 0 100vw 100vh rgba(0, 0, 0, 0.4)" }}
            className="w-full max-w-2xl rounded-lg border bg-white p-8"
          >
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">Are you sure you?</h2>
              <p className="mb-6 text-gray-600">
                You have full control over how your banking information is added
                to Pilucent. Transactions will only appear in your records once{" "}
                {"you've "}
                reviewed and approved them
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-12 rounded-md border border-green-500 bg-transparent px-12 py-2 text-green-500 transition-colors hover:bg-green-500 hover:text-white"
              >
                Close
              </button>
              <button
                disabled={isPending}
                onClick={() => {
                  handleSubmit();
                  // setStep(5);
                }}
                className="ml-2 mt-4 rounded bg-green-500 px-12 py-2 text-white hover:bg-green-600"
              >
                {isPending ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
