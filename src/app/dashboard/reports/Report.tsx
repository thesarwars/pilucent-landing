"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FaChevronDown, FaChevronUp, FaHeart } from "react-icons/fa"

type ReportItem = {
  id: string
  title: string
  isFavorite?: boolean
  link?: string
}

const favoriteItems: ReportItem[] = [
  { id: "1", title: "Accounts receivable ageing detail", isFavorite: true },
  { id: "2", title: "Account List", isFavorite: true },
  { id: "3", title: "Accounts receivable ageing detail", isFavorite: true },
  { id: "4", title: "Account List", isFavorite: true },
]

const whoOwesYouItems: ReportItem[] = [
  { id: "5", title: "Accounts receivable ageing summery", isFavorite: true, link: "/dashboard/reports/1"},
  { id: "6", title: "Invoices and received Payments", isFavorite: true,link: "/dashboard/reports/1" },
  { id: "7", title: "Accounts receivable ageing detail", isFavorite: true },
  { id: "8", title: "Open Invoices", isFavorite: true, link: "/dashboard/reports/open-invoices" },
  { id: "9", title: "Collections Report", isFavorite: true,link: "/dashboard/reports/1" },
  { id: "10", title: "Statement List", isFavorite: true,link: "/dashboard/reports/1" },
  { id: "11", title: "Customer Balance Summary", isFavorite: true,link: "/dashboard/reports/1" },
  { id: "12", title: "Terms List", isFavorite: true },
  { id: "13", title: "Customer Balance Detail", isFavorite: true },
  { id: "14", title: "Unbilled charges", isFavorite: true },
  { id: "15", title: "Invoice List", isFavorite: true },
  { id: "16", title: "Unbilled time", isFavorite: true },
]

const whatYouOweItems: ReportItem[] = [
  { id: "17", title: "Accounts payable ageing detail", isFavorite: false },
  { id: "18", title: "Accounts payable ageing Summary", isFavorite: true },
  { id: "19", title: "Bill Payment List", isFavorite: false },
  { id: "20", title: "Supplier Balance Details", isFavorite: false },
  { id: "21", title: "Supplier Balance Summary", isFavorite: true },
  { id: "22", title: "Unpaid Bills", isFavorite: false },
]

const salesAndCustomerItems: ReportItem[] = [
  { id: "23", title: "Customer Contact List", isFavorite: false },
  { id: "24", title: "Deposit Detail", isFavorite: true },
  { id: "25", title: "Estimates by Customer", isFavorite: false },
  { id: "26", title: "Income by Customer Summary", isFavorite: true },
  { id: "27", title: "Inventory Valuation Detail", isFavorite: false },
  { id: "28", title: "Inventory Valuation Summary", isFavorite: false },
  { id: "29", title: "Payment Method List", isFavorite: false },
  { id: "30", title: "Product/Service List", isFavorite: false },
  { id: "31", title: "Sales by Customer Detail", isFavorite: false },
  { id: "32", title: "Sales by Customer Summary", isFavorite: false },
  { id: "33", title: "Transaction List by Customer", isFavorite: false },
  { id: "34", title: "Sales by Product/Service Summary", isFavorite: false },
]

const expensesAndSuppliersItems: ReportItem[] = [
  { id: "35", title: "Cheque Detail", isFavorite: false },
  { id: "36", title: "Expenses by Supplier Summary", isFavorite: true },
  { id: "37", title: "Open Purchase Order List", isFavorite: false },
  { id: "38", title: "Open Purchase Order Detail", isFavorite: false },
  { id: "39", title: "Purchases by Product/Service Detail", isFavorite: true },
  { id: "40", title: "Purchases by Supplier Detail", isFavorite: false },
  { id: "41", title: "Supplier Contact List", isFavorite: true },
  { id: "42", title: "Transaction List by Supplier", isFavorite: false },
]

const salesTaxItems: ReportItem[] = [
  { id: "43", title: "Multiple Tax Sale - Tax Summary Report", isFavorite: false },
  { id: "44", title: "Transaction Based by Tax Code", isFavorite: true },
  { id: "45", title: "Services Tax exception report", isFavorite: false },
  { id: "46", title: "Service - Tax Detail Report", isFavorite: true },
  { id: "47", title: "Tax Custom - Tax Detail Report", isFavorite: false },
  { id: "48", title: "Tax Liability Report", isFavorite: false },
  { id: "49", title: "Tax Custom - Tax Summary Report", isFavorite: false },
]

const businessOverviewItems: ReportItem[] = [
  { id: "bo1", title: "Bank Log", isFavorite: false },
  { id: "bo2", title: "Trial Balance Sheet", isFavorite: true, link: "/dashboard/reports/trial_balance" },
  { id: "bo3", title: "Balance Sheet Comparison", isFavorite: true },
  { id: "bo4", title: "Balance Sheet Detail", isFavorite: true, link: "/dashboard/reports/balance_sheet" },
  { id: "bo5", title: "Balance Sheet Summary", isFavorite: true },
  { id: "bo6", title: "Statement of Cash Flows", isFavorite: true },
  { id: "bo22", title: "Journal Report", isFavorite: true, link: "/dashboard/reports/journal" },
  { id: "bo7", title: "Business Snapshot", isFavorite: false },
  { id: "bo8", title: "Custom Summary Report", isFavorite: false },
  { id: "bo9", title: "Profit and Loss", isFavorite: true },
  { id: "bo10", title: "Profit and Loss by Customer", isFavorite: true },
  { id: "bo11", title: "Profit and Loss by Location", isFavorite: false },
  { id: "bo12", title: "Profit and Loss by Class", isFavorite: true },
  { id: "bo13", title: "Profit and Loss by Month", isFavorite: true },
  { id: "bo14", title: "Profit and Loss by Tag Group", isFavorite: false },
  { id: "bo15", title: "Profit and Loss Comparison", isFavorite: true },
  { id: "bo16", title: "Profit and Loss (New)", isFavorite: true },
  { id: "bo17", title: "Profit and Loss as % of total income", isFavorite: true },
  { id: "bo18", title: "Profit and Loss year-to-date comparison", isFavorite: false },
  { id: "bo19", title: "Quarterly Profit and Loss Summary", isFavorite: true },
  { id: "bo20", title: "Realised Exchange Gains & Losses", isFavorite: false },
  { id: "bo21", title: "Unrealised Exchange Gains & Losses", isFavorite: false },
]

export default function Report() {
  const [expandedSections, setExpandedSections] = useState({
    businessOverview: true,
    favorites: true,
    whoOwesYou: true,
    whatYouOwe: true,
    salesAndCustomer: true,
    expensesAndSuppliers: true,
    salesTax: true,
  })

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("")

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const filterItems = (items: ReportItem[]) => {
    return items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const ReportSection = ({
    title,
    items,
    sectionKey,
  }: {
    title: string
    items: ReportItem[]
    sectionKey: keyof typeof expandedSections
  }) => (
    <div className="mb-6">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-700">{title}</span>
        {expandedSections[sectionKey] ? (
          <FaChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <FaChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {filterItems(items).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FaHeart
                  className={`h-4 w-4 ${item.isFavorite ? "text-blue-500 fill-blue-500" : "text-gray-400"}`}
                  aria-hidden="true"
                />
                <span className="text-gray-700" onClick={() => item?.link && router.push(`${item?.link}`)}>{item.title}</span>
              </div>
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="  mx-auto py-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-2xl font-semibold">Standard Report</h1>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
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

      <ReportSection title="BUSINESS OVERVIEW" items={businessOverviewItems} sectionKey="businessOverview" />
      <ReportSection title="FAVORITE" items={favoriteItems} sectionKey="favorites" />
      <ReportSection title="WHO OWES YOU" items={whoOwesYouItems} sectionKey="whoOwesYou" />
      <ReportSection title="WHAT YOU OWE" items={whatYouOweItems} sectionKey="whatYouOwe" />
      <ReportSection title="SALES AND CUSTOMER" items={salesAndCustomerItems} sectionKey="salesAndCustomer" />
      <ReportSection
        title="EXPENSES AND SUPPLIERS"
        items={expensesAndSuppliersItems}
        sectionKey="expensesAndSuppliers"
      />
      <ReportSection title="SALES TAX" items={salesTaxItems} sectionKey="salesTax" />
    </div>
  )
}

