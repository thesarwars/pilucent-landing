"use client";

import MainLoader from "@/components/MainLoader/MainLoader";
import { Suspense, useState } from "react";
import ReportFilter from "../_components/filter";
import moment from "moment";
import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import { useRouter, useSearchParams } from "next/navigation";

interface AccountItem {
  id: string;
  name: string;
  amount?: number;
  children?: AccountItem[];
  isTotal?: boolean;
}

const invoices = [
  {
    vendorName: "Red Rock Diner",
    total: 226.0,
    invoices: [
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
    ],
  },
  {
    vendorName: "Rondonuwu Fruit and Vegi",
    total: 78.6,
    invoices: [
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
    ],
  },
  {
    vendorName: "Sonnenschein Family Store",
    total: 362.07,
    invoices: [
      {
        date: "06/14/2025",
        type: "Invoice",
        number: 1037,
        dueDate: "07/14/2025",
        amount: 362.07,
        balance: 362.07,
        total: 362.07,
      },
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
      {
        date: "06/13/2025",
        type: "Invoice",
        number: 1034,
        dueDate: "07/13/2025",
        amount: 78.6,
        balance: 78.6,
        total: 78.6,
      },
    ],
  },
  {
    vendorName: "Sushi by Katsuyuki",
    total: 160.0,
    invoices: [
      {
        date: "06/05/2025",
        type: "Invoice",
        number: 1018,
        dueDate: "07/05/2025",
        amount: 80.0,
        balance: 80.0,
        total: 80.0,
      },
      {
        date: "06/12/2025",
        type: "Invoice",
        number: 1019,
        dueDate: "07/12/2025",
        amount: 80.0,
        balance: 80.0,
        total: 160.0,
      },
    ],
  },
  {
    vendorName: "Travis Waldron",
    total: 414.72,
    invoices: [
      {
        date: "06/11/2025",
        type: "Invoice",
        number: 1032,
        dueDate: "07/11/2025",
        amount: 414.72,
        balance: 414.72,
        total: 414.72,
      },
    ],
  },
  {
    vendorName: "Weiskopf Consulting",
    total: 375.0,
    invoices: [
      {
        date: "06/12/2025",
        type: "Invoice",
        number: 1010,
        dueDate: "07/12/2025",
        amount: 375.0,
        balance: 375.0,
        total: 375.0,
      },
    ],
  },
  {
    vendorName: "Freeman Sporting Goods - 0969 Ocean View Road",
    total: 477.5,
    invoices: [
      {
        date: "06/14/2025",
        type: "Invoice",
        number: 1036,
        dueDate: "07/14/2025",
        amount: 477.5,
        balance: 477.5,
        total: 477.5,
      },
    ],
  },
];

const ChevronIcon = ({
  isExpanded,
  className = "",
}: {
  isExpanded: boolean;
  className?: string;
}) => (
  <svg
    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const TreeNode = ({ item, level }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.invoices && item.invoices.length > 0;

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const getIndentClass = (level: number) => {
    const indentMap: { [key: number]: string } = {
      0: "pl-4",
      1: "pl-8",
      2: "pl-12",
      3: "pl-16",
      4: "pl-20",
    };
    return indentMap[level] || "pl-20";
  };

  const getTextColor = (amount?: number) => {
    if (amount === undefined) return "text-gray-900";
    return amount < 0 ? "text-red-600" : "text-gray-900";
  };

  return (
    <div className="select-none font-light">
      <div
        className={`group col-span-7 flex cursor-pointer items-center justify-between bg-gray-100 py-1.5 hover:bg-gray-50 ${getIndentClass(level)} ${item.isTotal ? "border-t border-t-gray-400" : ""}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className={`flex flex-1 items-center space-x-2`}>
          {hasChildren ? (
            <ChevronIcon
              isExpanded={isExpanded}
              className="text-gray-500 group-hover:text-gray-700"
            />
          ) : (
            <div className="w-4" />
          )}
          <span className={`text-sm font-normal`}>{item.vendorName}</span>
        </div>
        {item.amount !== undefined && (
          <div
            className={`min-w-[100px] pr-4 text-right text-sm ${item.isTotal ? "font-semibold" : "font-normal"} tracking-wide`}
          >
            <span className={getTextColor(item.amount)}>
              {formatAmount(item.amount)}
            </span>
          </div>
        )}
      </div>

      {hasChildren && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {item.invoices?.map((invoice: any, idx: number) => (
            <div
              key={idx}
              className="grid grid-cols-7 items-center justify-between px-4 py-2 pl-9"
            >
              <h2 className="text-sm text-gray-900">{invoice?.date}</h2>
              <h2 className="text-sm text-gray-900">Bill</h2>
              <h2 className="text-sm text-gray-900">{invoice?.number}</h2>
              <h2 className="text-sm text-gray-900">{invoice?.dueDate}</h2>
              <h2 className="text-sm text-gray-900">{invoice?.amount}</h2>
              <h2 className="text-sm text-gray-900">{invoice?.balance}</h2>
              <h2 className="text-right text-sm text-gray-900">
                $ {invoice?.total}
              </h2>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-t-[#0000002d] py-1 pl-9 pr-5">
            <p>
              Total For <span className="font-normal">{item?.vendorName}</span>
            </p>
            <p className="font-normal tracking-wide text-black">
              {new Intl.NumberFormat("en-us", {
                currency: "USD",
                style: "currency",
              }).format(
                item?.invoices?.reduce(
                  (prev: number, value: any) => prev + Number(value?.amount),
                  0,
                ),
              ) || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const FinancialStatement = () => {
  const from = useSearchParams().get("from");
  const to = useSearchParams().get("to");

  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    const printContent = document.getElementById("report-content")?.innerHTML;

    // Get all styles from the main document
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (error) {
          return ""; // Ignore cross-origin stylesheets
        }
      })
      .join("\n");

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // printWindow.close();
      };
    }
  };

  return (
    <div className="">
      <ReportFilter
        OnPdfClick={() => printReport()}
        params={{}}
        value={{ created_at_after: from, created_at_before: to }}
        setParams={(newParams: any) =>
          router.push(
            `?from=${newParams?.created_at_after || ""}&to=${newParams?.created_at_before || ""}`,
          )
        }
        onFilterChange={() => {
          // refetch();
        }}
      />
      <div
        id="report-content"
        className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white/40 p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">Supplier Balance Detail</h1>
          <h2 className="mb-1 text-lg">
            {Company?.name || "Binary Burst "} {"  "}
          </h2>
          <div className="mt-2 text-center text-sm font-medium text-gray-900">
            {from && to ? (
              <p>
                From{" "}
                {moment(
                  new Date(from || new Date().toLocaleDateString()),
                ).format("DD MMMM YYYY")}{" "}
                to{" "}
                {moment(
                  new Date(from || new Date().toLocaleDateString()),
                ).format("DD MMMM YYYY")}
              </p>
            ) : (
              <p className="text-gray-600">
                As of {new Date().toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {false ? (
          <div className="flex items-center justify-center">
            <LogoLoader size={50} color={"#16151c"} />
          </div>
        ) : (
          <div className="rounded bg-white">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">Date</h2>
              <h2 className="text-base font-semibold text-gray-900">
                Transaction type
              </h2>
              <h2 className="text-base font-semibold text-gray-900">Num</h2>
              <h2 className="text-base font-semibold text-gray-900">
                Due date
              </h2>
              <h2 className="text-base font-semibold text-gray-900">Amount</h2>
              <h2 className="text-base font-semibold text-gray-900">
                Open balance
              </h2>
              <h2 className="text-right text-base font-semibold text-gray-900">
                Balance
              </h2>
            </div>

            {/* Tree Content */}
            <div>
              {invoices.map((item, id) => (
                <TreeNode key={id} item={item} level={0} />
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-t-accent_soft_black py-1 pl-2 font-semibold text-accent_soft_black hover:bg-gray-50">
                <p className="flex flex-1 items-center space-x-2">Total</p>
                <p className="min-w-[100px] pr-4 text-right tracking-wide">
                  {new Intl.NumberFormat("en-us", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    invoices?.reduce(
                      (prev, current) => prev + Number(current?.total),
                      0,
                    ),
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <FinancialStatement />
    </Suspense>
  );
};

export default Page;
