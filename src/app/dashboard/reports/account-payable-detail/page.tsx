'use client';

import { Suspense, useEffect, useState } from 'react';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import { useAppSelector } from '@/app/redux/store';
import LogoLoader from '@/components/MainLoader/logo-loader';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLoader from '@/components/MainLoader/MainLoader';

interface AgingItem {
  id: string;
  name: string;
  date?: string;
  transactionType?: string;
  num?: string;
  vendorDisplayName?: string;
  dueDate?: string;
  pastDue?: number;
  amount?: number;
  openBalance?: number;
  children?: AgingItem[];
  isTotal?: boolean;
  isGroupHeader?: boolean;
}

interface TreeNodeProps {
  item: AgingItem;
  level: number;
}

// Mock data for A/P Aging Detail Report
const mockData = [
  {
    id: '31-60-days',
    name: '31 - 60 days past due (4)',
    isGroupHeader: true,
    children: [
      {
        id: '1',
        date: '04/23/2025',
        transactionType: 'Bill',
        num: '-',
        vendorDisplayName: 'PG&E',
        dueDate: '05/23/2025',
        pastDue: 52,
        amount: 86.44,
        openBalance: 86.44,
      },
      {
        id: '2',
        date: '05/07/2025',
        transactionType: 'Bill',
        num: '-',
        vendorDisplayName: 'Robertson & Associates',
        dueDate: '06/07/2025',
        pastDue: 37,
        amount: 315.0,
        openBalance: 315.0,
      },
      {
        id: '3',
        date: '06/07/2025',
        transactionType: 'Bill',
        num: '-',
        vendorDisplayName: 'Norton Lumber and Building Materials',
        dueDate: '06/07/2025',
        pastDue: 37,
        amount: 205.0,
        openBalance: 205.0,
      },
      {
        id: '4',
        date: '05/31/2025',
        transactionType: 'Bill',
        num: '-',
        vendorDisplayName: 'Brosnahan Insurance Agency',
        dueDate: '06/10/2025',
        pastDue: 34,
        amount: 241.23,
        openBalance: 241.23,
      },
      {
        id: 'total-31-60',
        name: 'Total for 31 - 60 days past due',
        amount: 847.67,
        openBalance: 847.67,
        isTotal: true,
      },
    ],
  },
  {
    id: '1-30-days',
    name: '1 - 30 days past due (1)',
    isGroupHeader: true,
    children: [
      {
        id: '5',
        date: '06/05/2025',
        transactionType: 'Bill',
        num: '-',
        vendorDisplayName: "Diego's Road Warrior Bodyshop",
        dueDate: '07/05/2025',
        pastDue: 9,
        amount: 755.0,
        openBalance: 755.0,
      },
      {
        id: 'total-1-30',
        name: 'Total for 1 - 30 days past due',
        amount: 755.0,
        openBalance: 755.0,
        isTotal: true,
      },
    ],
  },
  {
    id: 'total-overall',
    name: 'TOTAL',
    amount: 1602.67,
    openBalance: 1602.67,
    isTotal: true,
  },
];

const ChevronIcon = ({
  isExpanded,
  className = '',
}: {
  isExpanded: boolean;
  className?: string;
}) => (
  <svg
    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const TreeNode = ({ item, level }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const getIndentClass = (level: number) => {
    const indentMap: { [key: number]: string } = {
      0: 'pl-4',
      1: 'pl-8',
      2: 'pl-12',
      3: 'pl-16',
      4: 'pl-20',
    };
    return indentMap[level] || 'pl-20';
  };

  const getTextColor = (amount?: number) => {
    if (amount === undefined) return 'text-gray-900';
    return amount < 0 ? 'text-red-600' : 'text-gray-900';
  };

  if (item.isGroupHeader) {
    return (
      <div className="select-none font-light">
        <div
          className={`group mx-4 flex cursor-pointer items-center justify-between bg-gray-50 py-2 hover:bg-gray-100 ${getIndentClass(level)}`}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          <div className="flex flex-1 items-center space-x-2">
            {hasChildren ? (
              <ChevronIcon
                isExpanded={isExpanded}
                className="text-gray-500 group-hover:text-gray-700"
              />
            ) : (
              <div className="w-4" />
            )}
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
          </div>
        </div>

        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {item.children?.map((child) => (
              <TreeNode key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.isTotal) {
    return (
      <div className="select-none font-light">
        <div
          className={`mx-4 grid grid-cols-8 gap-4 border-t border-gray-300 bg-gray-50 py-2 ${getIndentClass(level)}`}
        >
          <div className="col-span-4 flex items-center space-x-2">
            <div className="w-4" />
            <span className="text-sm font-semibold text-gray-900">{item.name}</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-gray-900">-</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-gray-900">-</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900">
              {item.amount !== undefined ? formatAmount(item.amount) : '-'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900">
              {item.openBalance !== undefined ? formatAmount(item.openBalance) : '-'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none font-light">
      <div className={`mx-4 grid grid-cols-8 gap-4 py-1 hover:bg-gray-50 ${getIndentClass(level)}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4" />
          <span className="text-sm font-normal text-gray-900">{item.date || '-'}</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-normal text-gray-900">{item.transactionType || '-'}</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-normal text-gray-900">{item.num || '-'}</span>
        </div>
        <div>
          <span className="text-sm font-normal text-gray-900">{item.vendorDisplayName || '-'}</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-normal text-gray-900">{item.dueDate || '-'}</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-normal text-gray-900">{item.pastDue || '-'}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-normal ${getTextColor(item.amount)}`}>
            {item.amount !== undefined ? formatAmount(item.amount) : '-'}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-normal ${getTextColor(item.openBalance)}`}>
            {item.openBalance !== undefined ? formatAmount(item.openBalance) : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

const APAgingDetailReport = () => {
  const [accountData, setAccountData] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const from = useSearchParams().get('from');
  const to = useSearchParams().get('to');
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAccountData(mockData);
      setIsPending(false);
    }, 1000);
  }, []);

  const refetch = () => {
    setIsPending(true);
    setTimeout(() => {
      setAccountData(mockData);
      setIsPending(false);
    }, 1000);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('report-content')?.innerHTML;

    // Get all styles from the main document
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (error) {
          return ''; // Ignore cross-origin stylesheets
        }
      })
      .join('\n');

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
        refetch={refetch}
        value={{ created_at_after: from, created_at_before: to }}
        setParams={(newParams: any) =>
          router.push(
            `?from=${newParams?.created_at_after || ''}&to=${newParams?.created_at_before || ''}`
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
        <div className="mb-4 border-b border-b-gray-300 pb-4 text-center">
          <h1 className="mb-2 text-3xl font-bold">A/P Aging Detail Report</h1>
          <h2 className="mb-1 text-lg">
            {Company?.name || "Craig's Design and Landscaping Services"}
          </h2>
          <div className="mt-2 text-center text-sm font-medium text-gray-900">
            {from && to ? (
              <p>
                From{' '}
                {moment(new Date(from || new Date().toLocaleDateString())).format('DD MMMM YYYY')}{' '}
                to {moment(new Date(to || new Date().toLocaleDateString())).format('DD MMMM YYYY')}
              </p>
            ) : (
              <p className="text-gray-600">As of July 14, 2025</p>
            )}
          </div>
        </div>
        {isPending ? (
          <div className="flex items-center justify-center">
            <LogoLoader size={50} color={'#16151c'} />
          </div>
        ) : (
          <div className="rounded bg-white">
            {/* Header */}
            <div className="grid grid-cols-8 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">Date </h3>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900">Transaction Type </h3>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900">Num </h3>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">Vendor Display Name </h3>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900">Due Date ↑</h3>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900">Past Due </h3>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-semibold text-gray-900"> Amount</h3>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-semibold text-gray-900"> Open Balance</h3>
              </div>
            </div>

            {/* Tree Content */}
            <div className="divide-y divide-gray-100">
              {accountData.map((item, id) => (
                <TreeNode key={id} item={item} level={0} />
              ))}
            </div>

            {/* Footer with timestamp */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Monday, July 14, 2025 01:10 PM GMT-06:00</p>
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
      <APAgingDetailReport />
    </Suspense>
  );
};

export default Page;
