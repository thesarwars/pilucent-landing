import type { Account } from "./account";
import ChartOfAccount from "./chart-of-account";
import TransactionsList from "./transactions-list";
import {
  FiArrowRight,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
  FiBarChart2,
  FiHome,
  FiBook,
} from "react-icons/fi";

interface AccountDetailsProps {
  account: any;
  AllAccounts: Account[];
  setAccounts: any;
}

export default function AccountDetails({ account, AllAccounts,setAccounts }: AccountDetailsProps) {
  // Function to get the appropriate icon based on account type
  const getAccountIcon = (type: string, subtype: string) => {
    switch (type) {
      case "depository":
        return subtype === "checking" ? (
          <FiDollarSign className="h-5 w-5 text-blue-600" />
        ) : (
          <FiPieChart className="h-5 w-5 text-blue-600" />
        );
      case "investment":
        return <FiBarChart2 className="h-5 w-5 text-blue-600" />;
      case "loan":
        return subtype === "mortgage" ? (
          <FiHome className="h-5 w-5 text-blue-600" />
        ) : (
          <FiBook className="h-5 w-5 text-blue-600" />
        );
      case "credit":
        return <FiCreditCard className="h-5 w-5 text-blue-600" />;
      default:
        return <FiDollarSign className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-6 flex flex-col justify-between md:flex-row">
          <div className="flex items-center">
            <div className="mr-3">
              {getAccountIcon(account.type, account.subtype || "")}
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {account.name}
                </h2>
                <div className="mx-4 flex items-center">
                  <div className="h-0.5 w-8 bg-blue-500"></div>
                  <div className="mx-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                    <FiArrowRight className="text-blue-600" />
                  </div>
                  <div className="h-0.5 w-8 bg-blue-500"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">
                    {account.chart_of_account?.title || "No Chart of Account"}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-gray-500">
                {account.official_name || account.name} •{" "}
                {account.mask && `****${account.mask}`}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-gray-800">
                $
                {account.balances.current?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </p>
              {account.balances.available !== null && (
                <p className="mt-1 text-sm text-gray-500">
                  Available: $
                  {account.balances.available?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </p>
              )}
              {account.balances.limit !== null && (
                <p className="mt-1 text-sm text-gray-500">
                  Limit: $
                  {account.balances.limit?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {account.chart_of_account && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">
                    Account Information
                  </h3>
                </div>
                <div className="mx-4 flex items-center">
                  <div className="h-0.5 w-8 bg-blue-500"></div>
                  <div className="mx-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                    <FiArrowRight className="text-blue-600" />
                  </div>
                  <div className="h-0.5 w-8 bg-blue-500"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-800">
                    Chart of Account
                  </h3>
                </div>
              </div>
              <ChartOfAccount chartOfAccount={account.chart_of_account} />
            </div>
          )}

          {account.transactions && account.transactions.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-medium text-gray-800">
                Recent Transactions
              </h3>
              <TransactionsList key={account?.account_id} setAccounts={setAccounts} accounts={account} AllAccounts={AllAccounts} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
