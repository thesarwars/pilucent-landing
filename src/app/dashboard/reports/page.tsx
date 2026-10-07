'use client';

import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import Link from 'next/link';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaHeart } from 'react-icons/fa';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { VscVscode, VscVscodeInsiders } from 'react-icons/vsc';
import { TbBrandVscode } from 'react-icons/tb';

type ReportItem = {
  id: string;
  title: string;
  isFavorite?: boolean;
  link?: string;
  in_dev?: boolean;
};

const favoriteItems: ReportItem[] = [
  { id: '1', title: 'Accounts receivable ageing detail', isFavorite: true },
  {
    id: '2',
    title: 'Account List',
    isFavorite: true,
    link: '/dashboard/reports/coa_accounts',
  },
  { id: '3', title: 'Accounts receivable ageing detail', isFavorite: true },
  // { id: "4", title: "Account List", isFavorite: true },
];

const whoOwesYouItems: ReportItem[] = [
  {
    id: '2',
    title: 'Account List',
    isFavorite: true,
    link: '/dashboard/reports/coa_accounts',
  },
  {
    id: '5',
    title: 'Accounts receivable ageing summary',
    isFavorite: true,
    link: '/dashboard/reports/ar_aging_summary',
    in_dev: true,
  },
  {
    id: '6',
    title: 'Invoices and received Payments',
    isFavorite: true,
    // link: "/dashboard/reports/1",
  },
  {
    id: '7',
    title: 'Accounts receivable ageing detail',
    isFavorite: true,
    link: '/dashboard/reports/ar_aging_detail',
    in_dev: true,
  },
  {
    id: '8',
    title: 'Open Invoices',
    isFavorite: true,
    link: '/dashboard/reports/open-invoices',
  },
  {
    id: '9',
    title: 'Collections Report',
    isFavorite: true,
    // link: "/dashboard/reports/1",
  },
  {
    id: '10',
    title: 'Statement List',
    isFavorite: true,
    // link: "/dashboard/reports/1",
  },
  {
    id: '11',
    title: 'Customer Balance Summary',
    isFavorite: true,
    link: '/dashboard/reports/customer-balance-summary',
    in_dev: true,
  },
  {
    id: '12',
    title: 'Terms List',
    isFavorite: true,
    link: '/dashboard/reports/terms',
  },
  {
    id: '13',
    title: 'Customer Balance Details',
    isFavorite: true,
    link: '/dashboard/reports/customer-balance-details',
    in_dev: true,
  },
  { id: '14', title: 'Unbilled charges', isFavorite: true },
  { id: '15', title: 'Invoice List', isFavorite: true },
  { id: '16', title: 'Unbilled time', isFavorite: true },
];

const whatYouOweItems: ReportItem[] = [
  { id: '17', link: '/dashboard/reports/ap_ageing_detail', title: 'Accounts payable ageing detail', isFavorite: false, in_dev: true,  },
  {
    id: '18',
    title: 'Accounts payable ageing Summary',
    isFavorite: true,
    link: '/dashboard/reports/ap_ageing_summary',
    in_dev: true,
  },
  { id: '19', title: 'Bill Payment List', isFavorite: false },
  {
    id: '20',
    title: 'Supplier Balance Details',
    isFavorite: false,
    link: '/dashboard/reports/supplier-balance-details',
    in_dev: true,
  },
  {
    id: '21',
    title: 'Supplier Balance Summary',
    isFavorite: true,
    link: '/dashboard/reports/supplier-balance-summary',
    in_dev: true,
  },
  { id: '22', title: 'Unpaid Bills', isFavorite: false },
];

const salesAndCustomerItems: ReportItem[] = [
  {
    id: '23',
    title: 'Customer Contact List',
    isFavorite: false,
    link: '/dashboard/reports/customers',
  },
  { id: '24', title: 'Deposit Detail', isFavorite: true },
  { id: '25', title: 'Estimates by Customer', isFavorite: false },
  { id: '26', title: 'Income by Customer Summary', isFavorite: true },
  { id: '27', title: 'Inventory Valuation Detail', isFavorite: false, link: "/dashboard/reports/inventory_valuation_detail" },
  { id: '28', title: 'Inventory Valuation Summary', isFavorite: false, link: "/dashboard/reports/inventory_valuation_summary" },
  {
    id: '29',
    title: 'Payment Method List',
    isFavorite: false,
    link: '/dashboard/reports/pay_methods',
  },
  {
    id: '30',
    title: 'Products/Services List',
    isFavorite: false,
    link: '/dashboard/reports/products',
  },
  { id: '31', title: 'Sales by Customer Detail', isFavorite: false, link: '/dashboard/reports/sales-customer-detail' },
  {
    id: '32',
    title: 'Sales by Customer Summary',
    isFavorite: false,
    link: '/dashboard/reports/sales-customer-summary',
  },
  { id: '33', title: 'Transaction List by Customer', isFavorite: false },
  {
    id: '34',
    title: 'Sales by Product/Service Summary',
    isFavorite: false,
    link: '/dashboard/reports/product-service-summary',
  },
  {
    id: '51',
    title: 'Sales by Product/Service Detail',
    isFavorite: false,
    link: '/dashboard/reports/product-service-detail',
  },
];

const expensesAndSuppliersItems: ReportItem[] = [
  { id: '35', title: 'Cheque Detail', isFavorite: false },
  { id: '36', title: 'Expenses by Supplier Summary', isFavorite: true },
  { id: '37', title: 'Open Purchase Order List', isFavorite: false },
  { id: '38', title: 'Open Purchase Order Detail', isFavorite: false },
  {
    id: '39',
    title: 'Purchases by Products/Services Detail',
    isFavorite: true,
  },
  { id: '40', title: 'Purchases by Supplier Detail', isFavorite: false },
  {
    id: '41',
    title: 'Supplier Contact List',
    isFavorite: true,
    link: '/dashboard/reports/suppliers',
  },
  { id: '42', title: 'Transaction List by Supplier', isFavorite: false },
];

const salesTaxItems: ReportItem[] = [
  {
    id: '43',
    title: 'Multiple Tax Sale - Tax Summary Report',
    isFavorite: false,
  },
  { id: '44', title: 'Transaction Based by Tax Code', isFavorite: true },
  { id: '45', title: 'Services Tax exception report', isFavorite: false },
  { id: '46', title: 'Service - Tax Detail Report', isFavorite: true },
  {
    id: '48',
    title: 'Tax Liability Report',
    isFavorite: false,
    link: '/dashboard/reports/sales-tax-liability',
    in_dev: true,
  },
  { id: '47', title: 'Tax Custom - Tax Detail Report', isFavorite: false },
  {
    id: '48',
    title: 'Taxable Sales Details',
    isFavorite: false,
    link: '/dashboard/reports/taxable-sales-details',
    in_dev: true,
  },
  {
    id: '49',
    title: 'Taxable Sales Summary',
    isFavorite: false,
    link: '/dashboard/reports/taxable_sales_summary',
    in_dev: true,
  },
  { id: '50', title: 'Tax Custom - Tax Summary Report', isFavorite: false },
];

const businessOverviewItems: ReportItem[] = [
  { id: 'bo1', title: 'Bank Log', isFavorite: false },
  {
    id: 'bo2',
    title: 'Trial Balance',
    isFavorite: true,
    link: '/dashboard/reports/trial_balance',
  },
  {
    id: 'bo3',
    title: 'Balance Sheet',
    link: '/dashboard/reports/balance-sheet',
    isFavorite: true,
  },
  { id: 'bo3', title: 'Balance Sheet Comparison', link: '/dashboard/reports/balance-sheet-comparison', isFavorite: true },
  {
    id: 'bo4',
    title: 'Balance Sheet Detail',
    isFavorite: true,
    link: '/dashboard/reports/balance-sheet-details',
  },
  {
    id: 'bo5',
    title: 'Balance Sheet Summary',
    isFavorite: true,
    link: '/dashboard/reports/balance-sheet-summary',
  },
  {
    id: 'bo6',
    title: 'Statement of Cash Flows',
    isFavorite: true,
    link: '/dashboard/reports/cash_flow',
  },
  {
    id: 'bo22',
    title: 'Journal Report',
    isFavorite: true,
    link: '/dashboard/reports/journal',
  },
  { id: 'bo7', title: 'Business Snapshot', isFavorite: false },
  { id: 'bo8', title: 'Custom Summary Report', link: '/dashboard/reports/custom-summary-report', isFavorite: false },
  {
    id: 'bo9',
    title: 'Profit and Loss',
    isFavorite: true,
    link: '/dashboard/reports/profit&loss',
  },
  { id: 'bo10', title: 'Profit and Loss by Customer', link: '/dashboard/reports/profit&loss-by-customer', isFavorite: true },
  { id: 'bo11', title: 'Profit and Loss by Location', link: '/dashboard/reports/profit&loss-by-store', isFavorite: false },
  { id: 'bo12', title: 'Profit and Loss by Class', isFavorite: true },
  {
    id: 'bo13',
    title: 'Profit and Loss by Month',
    isFavorite: true,
    link: '/dashboard/reports/profit&loss/month',
  },
  { id: 'bo14', title: 'Profit and Loss by Tag Group', isFavorite: false },
  { id: 'bo15', title: 'Profit and Loss Comparison', link: '/dashboard/reports/profit-loss-comparison', isFavorite: true },
  {
    id: 'bo17',
    title: 'Profit and Loss as % of total income',
    isFavorite: true,
  },
  {
    id: 'bo18',
    title: 'Profit and Loss year-to-date comparison',
    isFavorite: false,
  },
  {
    id: 'bo19',
    title: 'Quarterly Profit and Loss Summary',
    link: '/dashboard/reports/profit-loss-quarterly',
    isFavorite: true,
  },
  { id: 'bo20', title: 'Realized Exchange Gains & Losses', isFavorite: false },
  {
    id: 'bo21',
    title: 'Unrealized Exchange Gains & Losses',
    isFavorite: false,
  },
  {
    id: 'bo21',
    title: 'General Ledger',
    isFavorite: true,
    link: '/dashboard/reports/general-ledger',
  },
];

export default function Page() {
  const [expandedSections, setExpandedSections] = useState({
    businessOverview: true,
    favorites: true,
    whoOwesYou: true,
    whatYouOwe: true,
    salesAndCustomer: true,
    expensesAndSuppliers: true,
    salesTax: true,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filterItems = (items: ReportItem[]) => {
    return items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const ReportSection = ({
    title,
    items,
    sectionKey,
  }: {
    title: string;
    items: ReportItem[];
    sectionKey: keyof typeof expandedSections;
  }) => {
    const [hoveredId, setHoveredId] = useState<any>(null);
    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex w-full items-center justify-between rounded-lg border bg-transparent p-4 outline outline-1 outline-offset-[-1px] outline-white transition-colors hover:bg-white/20 hover:outline-gray-50"
        >
          <span className="font-inter font-semibold text-black">{title}</span>
          {expandedSections[sectionKey] ? (
            <FaChevronUp className="h-5 w-5" />
          ) : (
            <FaChevronDown className="h-5 w-5" />
          )}
        </button>
        {expandedSections[sectionKey] && (
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filterItems(items).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // transition={{ duration: 0.3, delay: item.id * 0.1 }}
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
              >
                <Link
                  href={item?.link || '#'}
                  className={`group relative block overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    item?.link
                      ? 'cursor-pointer border-gray-200 bg-white hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Background gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent to-gray-50 opacity-0 transition-opacity duration-300 ${
                      item?.link ? 'group-hover:opacity-100' : ''
                    }`}
                  />

                  {/* Status indicator */}
                  <div className="absolute right-4 top-4">
                    {item?.link && !item.in_dev ? (
                      <motion.div
                        animate={{ scale: hoveredId === item.id ? 1.1 : 1 }}
                        className="flex items-center gap-1 text-green-500"
                      >
                        <VscVscode className="rounded-full text-base text-green-500 duration-150" />
                        <span className="text-[10px]">Active</span>
                      </motion.div>
                    ) : item.in_dev ? (
                      <div className="flex items-center gap-1 text-blue-500">
                        <VscVscodeInsiders className="rounded-full text-base text-blue-500 duration-150" />
                        <span className="text-[10px] font-medium">In Dev</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-500">
                        <TbBrandVscode className="rounded-full text-base text-amber-500 duration-150" />
                        <span className="text-[10px] font-medium">Pending</span>
                      </div>
                    )}
                  </div>

                  <div className="relative px-4 py-3">
                    <div className="flex items-center gap-4">
                      {/* Icon with enhanced styling */}
                      <motion.div
                        animate={{
                          scale: hoveredId === item.id ? 1.1 : 1,
                          rotate: hoveredId === item.id ? 5 : 0,
                        }}
                        className={`flex-shrink-0 rounded-lg p-2 transition-colors duration-300 ${
                          item?.link
                            ? 'bg-gray-100 text-gray-700 group-hover:bg-gray-800 group-hover:text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <HiOutlineDocumentReport className="h-5 w-5" />
                      </motion.div>

                      {/* Content */}
                      <h3
                        className={`text-base font-normal leading-tight transition-colors duration-300 ${
                          item?.link ? 'text-gray-900 group-hover:text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  {item?.link && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredId === item.id ? 1 : 0 }}
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <ManualBreadcrumbs
        items={[{ label: 'Reports', href: '/dashboard/reports' }]}
        className="mb-5 mt-0"
      />
      <div className="mx-auto rounded-xl bg-white/60 p-6 font-inter">
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <h1 className="text-2xl font-semibold">Standard Report</h1>
            <div className="relative md:w-[350px]">
              <input
                type="text"
                placeholder="Search"
                className="inline-flex w-full min-w-[300px] items-start justify-start rounded-[10px] bg-transparent px-5 py-4 pl-10 text-base font-normal leading-6 text-slate-400 outline outline-1 outline-offset-[-1px] outline-gray-200 placeholder:font-normal placeholder:text-slate-400 hover:outline-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 transform">
                <svg
                  className="h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <ReportSection
          title="BUSINESS OVERVIEW"
          items={businessOverviewItems}
          sectionKey="businessOverview"
        />
        {/* <ReportSection title="FAVORITE" items={favoriteItems} sectionKey="favorites" /> */}
        <ReportSection title="WHO OWES YOU" items={whoOwesYouItems} sectionKey="whoOwesYou" />
        <ReportSection title="WHAT YOU OWE" items={whatYouOweItems} sectionKey="whatYouOwe" />
        <ReportSection
          title="SALES AND CUSTOMER"
          items={salesAndCustomerItems}
          sectionKey="salesAndCustomer"
        />
        <ReportSection
          title="EXPENSES AND SUPPLIERS"
          items={expensesAndSuppliersItems}
          sectionKey="expensesAndSuppliers"
        />
        <ReportSection title="SALES TAX" items={salesTaxItems} sectionKey="salesTax" />
      </div>
    </>
  );
}
