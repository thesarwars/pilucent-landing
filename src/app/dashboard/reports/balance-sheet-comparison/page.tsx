"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import moment from "moment";

import { fetchBalanceSheets } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import LogoLoader from "@/components/MainLoader/logo-loader";
import { cn } from "@/lib/utils";
import ReportFilter from "../_components/filter";


interface AccountItem {
  id: string;
  name: string;
  amount?: number;
  children?: AccountItem[];
  isTotal?: boolean;
}

interface MergedItem {
  id: string;
  name: string;
  amount?: number;
  compareAmount?: number;
  children?: MergedItem[];
  isTotal?: boolean;
}

// One query per category, per period. `otherAssets` has no itemized accounts in the
// reference report — only a rolled-up total — so it isn't fetched here.
const ACCOUNT_QUERY_DEFS = [
  { key: "bank", kind: "ASSETS", account_type__title: "Bank" },
  { key: "receivable", kind: "ASSETS", account_type__title: "Accounts Receivable (A/R)" },
  { key: "otherCurrentAssets", kind: "ASSETS", account_type__title: "Other Current Assets" },
  { key: "fixedAssets", kind: "ASSETS", account_type__title: "Fixed Assets" },
  { key: "payable", kind: "LIABILITIES", account_type__title: "Accounts Payable (A/P)" },
  { key: "creditCards", kind: "LIABILITIES", account_type__title: "Credit Cards" },
  { key: "otherCurrentLiabilities", kind: "LIABILITIES", account_type__title: "Other Current Liabilities" },
  {
    key: "payroll",
    kind: "LIABILITIES",
    account_type__title: "Other Current Liabilities",
    detail_type__title: "Payroll Liabilities",
  },
  { key: "termLiabilities", kind: "LIABILITIES", account_type__title: "Long Term Liabilities" },
  { key: "equity", kind: "EQUITIES", account_type__title: "Equity" },
] as const;

type DateRange = { start_date?: string; end_date?: string };

const buildAccountQueries = (period: "current" | "compare", range: DateRange) =>
  ACCOUNT_QUERY_DEFS.map((def) => ({
    queryKey: ["balance-sheet-comparison", period, def.key, range.start_date, range.end_date],
    queryFn: () =>
      fetchBalanceSheets({
        kind: def.kind,
        account_type__title: def.account_type__title,
        ...("detail_type__title" in def ? { detail_type__title: def.detail_type__title } : {}),
        start_date: range.start_date,
        end_date: range.end_date,
      }),
  }));

const toItems = (list: any[] = []): AccountItem[] =>
  (list || []).map((account: any) => ({
    id: account?.title,
    name: account?.title,
    amount: Number(account?.opening_balance) || 0,
  }));

// Same scaffold as the single-column balance sheet report — group headings and their
// subtotals are always present; the account rows between them are data-driven.
const buildBalanceSheetTree = (totals: any, accounts: Record<string, any[]>): AccountItem[] => [
  {
    id: "assets",
    name: "Assets",
    children: [
      {
        id: "current-assets",
        name: "Current Assets",
        children: [
          {
            id: "bank-accounts",
            name: "Bank Accounts",
            children: [
              ...toItems(accounts.bank),
              {
                id: "total-banks",
                name: "Total for Bank Accounts",
                amount: totals?.total_for_bank_accounts ?? 0,
                isTotal: true,
              },
            ],
          },
          {
            id: "accounts-receivable",
            name: "Accounts Receivable",
            children: [
              ...toItems(accounts.receivable),
              {
                id: "total-accounts-receivable",
                name: "Total for Accounts Receivable",
                amount: totals?.total_for_account_receivables ?? 0,
                isTotal: true,
              },
            ],
          },
          {
            id: "other-current-assets",
            name: "Other Current Assets",
            children: [
              ...toItems(accounts.otherCurrentAssets),
              {
                id: "total-other-current-assets",
                name: "Total for Other Current Assets",
                amount: totals?.total_for_other_current_assets ?? 0,
                isTotal: true,
              },
            ],
          },
          {
            id: "total-current-assets",
            name: "Total for Current Assets",
            amount: totals?.total_for_current_asset ?? 0,
            isTotal: true,
          },
        ],
      },
      {
        id: "fixed-assets",
        name: "Fixed Assets",
        children: [
          ...toItems(accounts.fixedAssets),
          {
            id: "total-fixed-assets",
            name: "Total for Fixed Assets",
            amount: totals?.total_for_fixed_assets ?? 0,
            isTotal: true,
          },
        ],
      },
      { id: "other-assets", name: "Other Assets", amount: totals?.total_for_other_assets ?? 0 },
      {
        id: "total-assets",
        name: "Total for Assets",
        amount: totals?.total_for_assets ?? 0,
        isTotal: true,
      },
    ],
  },
  {
    id: "liabilities-equity",
    name: "Liabilities and Equity",
    children: [
      {
        id: "liabilities",
        name: "Liabilities",
        children: [
          {
            id: "current-liabilities",
            name: "Current Liabilities",
            children: [
              {
                id: "accounts-payable",
                name: "Accounts Payable",
                children: [
                  ...toItems(accounts.payable),
                  {
                    id: "total-accounts-payable",
                    name: "Total for Accounts Payable",
                    amount: totals?.total_for_account_payables ?? 0,
                    isTotal: true,
                  },
                ],
              },
              {
                id: "credit-cards",
                name: "Credit Cards",
                children: [
                  ...toItems(accounts.creditCards),
                  {
                    id: "total-credit-cards",
                    name: "Total for Credit Cards",
                    amount: totals?.total_for_credit_cards ?? 0,
                    isTotal: true,
                  },
                ],
              },
              {
                id: "other-current-liabilities",
                name: "Other Current Liabilities",
                children: [
                  ...toItems(accounts.otherCurrentLiabilities),
                  {
                    id: "payroll-liabilities",
                    name: "Payroll Liabilities",
                    children: [
                      ...toItems(accounts.payroll),
                      {
                        id: "total-payroll-liabilities",
                        name: "Total for Payroll Liabilities",
                        amount: totals?.total_for_payroll_liabilities ?? 0,
                        isTotal: true,
                      },
                    ],
                  },
                  {
                    id: "total-other-current-liabilities",
                    name: "Total for Other Current Liabilities",
                    amount: totals?.total_for_other_current_liabilities ?? 0,
                    isTotal: true,
                  },
                ],
              },
              {
                id: "total-current-liabilities",
                name: "Total for Current Liabilities",
                amount: totals?.total_for_current_liabilities ?? 0,
                isTotal: true,
              },
            ],
          },
          {
            id: "long-term-liabilities",
            name: "Long-term Liabilities",
            children: [
              ...toItems(accounts.termLiabilities),
              {
                id: "total-long-term-liabilities",
                name: "Total for Long-term Liabilities",
                amount: totals?.total_for_long_term_liabilities ?? 0,
                isTotal: true,
              },
            ],
          },
          {
            id: "total-liabilities",
            name: "Total for Liabilities",
            amount: totals?.total_for_liabilities ?? 0,
            isTotal: true,
          },
        ],
      },
      {
        id: "equity",
        name: "Equity",
        children: [
          ...toItems(accounts.equity),
          {
            id: "total-equity",
            name: "Total for Equity",
            amount: totals?.total_for_equity ?? 0,
            isTotal: true,
          },
        ],
      },
      {
        id: "total-liabilities-and-equity",
        name: "Total for Liabilities and Equity",
        amount: totals?.total_for_liabilities_and_equity ?? 0,
        isTotal: true,
      },
    ],
  },
];

// Fixed scaffold nodes share the same id on both sides and merge cleanly. Individual
// account rows are data-driven and can exist on only one side (an account opened or
// closed between the two periods) — those are unioned by id, blank on the side that
// has no matching account, rather than misaligned or defaulted to zero.
const mergeNode = (current?: AccountItem, compare?: AccountItem): MergedItem => {
  const base = (current ?? compare) as AccountItem;
  const hasChildren = !!(current?.children?.length || compare?.children?.length);
  return {
    id: base.id,
    name: base.name,
    isTotal: base.isTotal,
    amount: current?.amount,
    compareAmount: compare?.amount,
    children: hasChildren ? mergeChildren(current?.children, compare?.children) : undefined,
  };
};

const mergeChildren = (current: AccountItem[] = [], compare: AccountItem[] = []): MergedItem[] => {
  const compareById = new Map(compare.map((item) => [item.id, item]));
  const seen = new Set<string>();

  const merged = current.map((item) => {
    seen.add(item.id);
    return mergeNode(item, compareById.get(item.id));
  });

  compare.forEach((item) => {
    if (!seen.has(item.id)) merged.push(mergeNode(undefined, item));
  });

  return merged;
};

const ChevronIcon = ({ isExpanded, className = "" }: { isExpanded: boolean; className?: string }) => (
  <svg
    className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-90", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const getIndentClass = (level: number) => {
  const indentMap: Record<number, string> = { 0: "pl-4", 1: "pl-8", 2: "pl-12", 3: "pl-16", 4: "pl-20" };
  return indentMap[level] || "pl-20";
};

const getTextColor = (amount?: number) => (amount !== undefined && amount < 0 ? "text-red-600" : "text-gray-900");

const formatAmount = (amount: number) => {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
};

const AmountCell = ({ amount, isTotal }: { amount?: number; isTotal?: boolean }) => (
  <div
    className={cn(
      "min-w-[120px] pr-4 text-right text-sm tracking-wide",
      isTotal ? "font-semibold" : "font-normal",
    )}
  >
    {amount !== undefined && <span className={getTextColor(amount)}>{formatAmount(amount)}</span>}
  </div>
);

const TreeNode = ({ item, level }: { item: MergedItem; level: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = !!item.children?.length;

  return (
    <div className="select-none font-light">
      <div
        className={cn(
          "group mx-4 flex cursor-pointer items-center py-1 hover:bg-gray-50",
          getIndentClass(level),
          item.isTotal && "border-t border-t-gray-400",
        )}
        onClick={() => hasChildren && setIsExpanded((prev) => !prev)}
      >
        <div className="flex flex-1 items-center space-x-2">
          {hasChildren ? (
            <ChevronIcon isExpanded={isExpanded} className="text-gray-500 group-hover:text-gray-700" />
          ) : (
            <div className="w-4" />
          )}
          <span className={cn("text-sm", item.isTotal ? "font-semibold" : "font-normal", getTextColor(item.amount))}>
            {item.name}
          </span>
        </div>
        <AmountCell amount={item.amount} isTotal={item.isTotal} />
        <AmountCell amount={item.compareAmount} isTotal={item.isTotal} />
      </div>

      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {item.children!.map((child) => (
            <TreeNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const BalanceSheetComparison = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);

  // Local state, not the URL — same choice balance-sheet-details makes. ReportFilter's
  // own param names (created_at_after/before) are adapted to what this endpoint actually
  // takes (start_date/end_date), the same mapping the single-column balance sheet pages use.
  const [currentRange, setCurrentRange] = useState<DateRange>({});

  // "Compare to: previous year" — the same range, shifted back exactly one year, matching
  // how the reference report pairs "As of Jun 30, 2026" with "As of Jun 30, 2025 (PY)".
  const priorYearRange: DateRange = useMemo(() => {
    if (!currentRange.start_date || !currentRange.end_date) return {};
    return {
      start_date: moment(currentRange.start_date).subtract(1, "year").format("YYYY-MM-DD"),
      end_date: moment(currentRange.end_date).subtract(1, "year").format("YYYY-MM-DD"),
    };
  }, [currentRange.start_date, currentRange.end_date]);

  const currentTotalsQuery = useQuery({
    queryKey: ["balance-sheet-comparison-overview", "current", currentRange.start_date, currentRange.end_date],
    queryFn: () => fetchBalanceSheets({ keywords: "overview", ...currentRange }),
  });
  const compareTotalsQuery = useQuery({
    queryKey: ["balance-sheet-comparison-overview", "compare", priorYearRange.start_date, priorYearRange.end_date],
    queryFn: () => fetchBalanceSheets({ keywords: "overview", ...priorYearRange }),
  });

  const currentAccountQueries = useQueries({ queries: buildAccountQueries("current", currentRange) });
  const compareAccountQueries = useQueries({ queries: buildAccountQueries("compare", priorYearRange) });

  // Recomputed on every render rather than memoized: useQueries returns a new array
  // reference each time regardless, so memoizing here would never actually skip work.
  const currentAccounts = Object.fromEntries(
    ACCOUNT_QUERY_DEFS.map((def, i) => [def.key, currentAccountQueries[i]?.data]),
  );
  const compareAccounts = Object.fromEntries(
    ACCOUNT_QUERY_DEFS.map((def, i) => [def.key, compareAccountQueries[i]?.data]),
  );

  const isPending =
    currentTotalsQuery.isPending ||
    compareTotalsQuery.isPending ||
    currentAccountQueries.some((q) => q.isPending) ||
    compareAccountQueries.some((q) => q.isPending);

  const currentTree = buildBalanceSheetTree(currentTotalsQuery.data, currentAccounts);
  const compareTree = buildBalanceSheetTree(compareTotalsQuery.data, compareAccounts);
  const mergedTree = currentTree.map((node, index) => mergeNode(node, compareTree[index]));

  const printReport = () => {
    const printContent = document.getElementById("report-content")?.innerHTML;
    const printWindow = window.open("", "_blank");

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            return "";
          }
        })
        .join("\n");

      printWindow.document.write(`
        <html>
          <head>
            <title>Balance Sheet Comparison</title>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const asOfLabel = currentRange.end_date
    ? moment(currentRange.end_date).format("MMM D, YYYY")
    : "Total";
  const priorYearLabel = priorYearRange.end_date
    ? `${moment(priorYearRange.end_date).format("MMM D, YYYY")} (PY)`
    : "Previous year";

  return (
    <div>
      <ReportFilter
        OnPdfClick={printReport}
        params={{}}
        value={{ created_at_after: currentRange.start_date, created_at_before: currentRange.end_date }}
        setParams={(newParams: any) =>
          setCurrentRange({
            start_date: newParams?.created_at_after || undefined,
            end_date: newParams?.created_at_before || undefined,
          })
        }
      />

      <div
        id="report-content"
        className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white/40 p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">Balance Sheet Comparison</h1>
          <h2 className="mb-1 text-xl">{Company?.name || "Binary Burst"}</h2>
          <p className="text-gray-600">
            As of {currentRange.end_date ? moment(currentRange.end_date).format("MMMM D, YYYY") : new Date().toLocaleDateString()}
          </p>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center">
            <LogoLoader size={50} color={"#16151c"} />
          </div>
        ) : (
          <div className="rounded bg-white/60">
            <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h2 className="flex-1 text-base font-semibold text-gray-900">Account</h2>
              <h2 className="min-w-[120px] pr-4 text-right text-base font-semibold text-gray-900">
                {asOfLabel}
              </h2>
              <h2 className="min-w-[120px] pr-4 text-right text-base font-semibold text-gray-900">
                {priorYearLabel}
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {mergedTree.map((item) => (
                <TreeNode key={item.id} item={item} level={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceSheetComparison;
