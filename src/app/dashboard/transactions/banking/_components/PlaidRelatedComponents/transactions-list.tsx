import type { Account, Transaction } from "./account";
import Image from "next/image";
import { useState } from "react";
import { FiShoppingBag, FiArrowUp, FiArrowDown } from "react-icons/fi";

interface TransactionsListProps {
  accounts: any;
  AllAccounts: Account[];
  setAccounts: any;
}

export default function TransactionsList({
  accounts,
  AllAccounts,
  setAccounts,
}: TransactionsListProps) {
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleReverseTransaction = (value: string) => {
    const processedData = AllAccounts?.map((acc: any) => {
      if (accounts?.account_id == acc?.account_id) {
        if (value == acc?.transaction_value) {
          return acc;
        } else {
          const updatedTransactions = acc?.transactions?.map(
            (transaction: any) => {
              return {
                ...transaction,
                spent: transaction?.received,
                received: transaction?.spent,
              };
            },
          );
          return {
            ...acc,
            transactions: updatedTransactions,
            transaction_value: value,
          };
        }
      } else {
        return acc;
      }
    });
    console.log("Processed Data", processedData);
    setAccounts(processedData);
  };

  return (
    <div className="overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div className="mb-4 flex items-center">
          <label className="flex cursor-pointer items-center rounded-md p-3 hover:bg-white">
            <div className="relative mr-3 flex items-center justify-center">
              <input
                type="radio"
                name={"transactionValues" + accounts?.account_id}
                value="original"
                checked={accounts?.transaction_value === "original"}
                onChange={() => {
                  handleReverseTransaction("original");
                }}
                className="h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            <span className="text-gray-800">Original</span>
          </label>

          <label className="flex cursor-pointer items-center rounded-md p-3 hover:bg-white">
            <div className="relative mr-3 flex items-center justify-center">
              <input
                type="radio"
                name={"transactionValues" + accounts?.account_id}
                value="reversed"
                checked={accounts?.transaction_value === "reversed"}
                onChange={() => {
                  handleReverseTransaction("reversed");
                }}
                className="h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            <span className="text-gray-800">Reverse</span>
          </label>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="w-16 py-3">Img</th>
            <th className="px-4 py-3 text-left">Info</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {accounts?.transactions.map((transaction: any) => (
            <tr
              key={transaction.transaction_id}
              className="transition-colors hover:bg-gray-50"
            >
              <td className="py-4">
                {transaction.logo_url ? (
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                    <Image
                      src={transaction.logo_url || "/placeholder.svg"}
                      alt={transaction.merchant_name || ""}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <FiShoppingBag className="text-gray-500" />
                  </div>
                )}
              </td>
              <td className="px-4 py-4">
                <p className="truncate text-sm font-medium text-gray-900">
                  {transaction.merchant_name || transaction.name}
                </p>
                <p className="truncate text-sm text-gray-500">
                  {formatDate(transaction.date)}
                  {transaction.personal_finance_category && (
                    <span className="ml-2 inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {transaction.personal_finance_category.primary.replace(
                        /_/g,
                        " ",
                      )}
                    </span>
                  )}
                </p>
              </td>
              <td className="px-4 py-4 text-right">
                <p
                  className={`text-sm font-medium ${transaction.received > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {transaction?.spent > 0 ? "-" : ""}
                  {Math.abs(Number(transaction.received) || Number(transaction?.spent)).toFixed(2)} $
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
