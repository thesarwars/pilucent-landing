"use client";

import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaHeart } from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { VscVscode, VscVscodeInsiders } from "react-icons/vsc";

type ReportItem = {
  id: string;
  title: string;
  isFavorite?: boolean;
  link?: string;
  in_dev?: boolean;
  active?: boolean;
};

const salesTaxItems: ReportItem[] = [
  //   {
  //     id: "43",
  //     title: "Multiple Tax Sale - Tax Summary Report",
  //     isFavorite: false,
  //   },
  //   { id: "44", title: "Transaction Based by Tax Code", isFavorite: true },
  //   { id: "45", title: "Services Tax exception report", isFavorite: false },
  //   { id: "46", title: "Service - Tax Detail Report", isFavorite: true },
  {
    id: "48089-8",
    title: "Deductions & Contributions",
    isFavorite: false,
    link: "/dashboard/hris/payroll/report/deduction&contribution",
  },
  //   { id: "47", title: "Tax Custom - Tax Detail Report", isFavorite: false },
  {
    id: "48089",
    title: "Pay Check",
    isFavorite: false,
    link: "/dashboard/hris/reports/pay_check",
  },
  {
    id: "499870",
    title: "Payroll Summary By Employee",
    link: "/dashboard/hris/payroll/report/payroll_summary",
  },
  {
    id: "49856",
    title: "Employee Summary",
    link: "/dashboard/hris/payroll/report/payroll_summary_employee",
  },
  {
    id: "49756",
    title: "Payroll Tax Liability",
    link: "/dashboard/hris/reports/tax-liability",
  },
  {
    id: "49665",
    title: "Payroll Details",
    link: "/dashboard/hris/reports/payroll-details",
  },
  {
    id: "4965",
    title: "Leave And Vacancy",
    link: "/dashboard/hris/reports/vacancy-leave",
  },
  // {
  //   id: "49457",
  //   title: "Payroll Summary",
  //   link: "/dashboard/hris/payroll/report/payroll_summary",
  // },
  {
    id: "50",
    title: "Payroll Summary",
    link: "/dashboard/hris/payroll/report/pay_summary",
  },
  // {
  //   id: "51",
  //   title: "Employee Summary",
  //   link: "/dashboard/hris/payroll/report/payroll_summary_employee",
  // },
  {
    id: "52",
    title: "Employee Total Pay",
    link: "/dashboard/hris/payroll/report/total_pay",
  },
  {
    id: "5344",
    title: "Payroll Tax and Wage Summary",
    link: "/dashboard/hris/payroll/report/wage_summary",
  },
  {
    id: "53",
    title: "Time Details For Employee",
    link: "/dashboard/hris/payroll/report/time_details",
  },
  {
    id: "54",
    title: "Attendance Daily Report",
    link: "/dashboard/hris/reports/attendance_daily_report",
  },
  {
    id: "55",
    title: "Employee Details Report",
    link: "/dashboard/hris/reports/employee-details-report",
  },
  {
    id: "56",
    title: "Payroll Cost Reports",
    link: "/dashboard/hris/payroll/report/payroll_cost",
  },
  {
    id: "55",
    title: "Multiple Worksite",
    link: "/dashboard/hris/payroll/report/multiple_worksite",
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

  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filterItems = (items: ReportItem[]) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
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
          className="flex w-full items-center justify-between rounded-lg border bg-gray-50 p-4 transition-colors hover:bg-gray-100"
        >
          <span className="font-semibold text-black">{title}</span>
          {expandedSections[sectionKey] ? (
            <FaChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <FaChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections[sectionKey] && (
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filterItems(items).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // transition={{ duration: 0.3, delay: item.id * 0.1 }}
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
              >
                <Link
                  href={item?.link || "#"}
                  className={`group relative block overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    item?.link
                      ? "cursor-pointer border-gray-200 bg-white hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                      : "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  {/* Background gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-transparent to-gray-50 opacity-0 transition-opacity duration-300 ${
                      item?.link ? "group-hover:opacity-100" : ""
                    }`}
                  />

                  {/* Status indicator */}
                  <div className="absolute right-4 top-4">
                    {item?.link && item.active ? (
                      <motion.div
                        animate={{ scale: hoveredId === item.id ? 1.1 : 1 }}
                        className="flex items-center gap-1 text-green-600"
                      >
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 duration-75" />
                        <span className="text-[11px]">Active</span>
                        {/* <BiLinkExternal className="h-3 w-3" /> */}
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-1 text-blue-500">
                        <VscVscodeInsiders className="rounded-full text-base text-blue-500 duration-150" />
                        <span className="text-[10px] font-medium">In Dev</span>
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
                            ? "bg-gray-100 text-gray-700 group-hover:bg-gray-800 group-hover:text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <HiOutlineDocumentReport className="h-5 w-5" />
                      </motion.div>

                      {/* Content */}
                      <h3
                        className={`text-base font-normal leading-tight transition-colors duration-300 ${
                          item?.link
                            ? "text-gray-900 group-hover:text-gray-800"
                            : "text-gray-500"
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
        items={[{ label: "Reports", href: "/dashboard/reports" }]}
        className="mb-5 mt-0"
      />
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="mx-auto rounded-xl bg-white p-6"
      >
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <h1 className="text-bl text-2xl font-semibold">Payroll Reports</h1>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* <ReportSection
            title="BUSINESS OVERVIEW"
            items={businessOverviewItems}
            sectionKey="businessOverview"
          />
          <ReportSection
            title="FAVORITE"
            items={favoriteItems}
            sectionKey="favorites"
          />
          <ReportSection
            title="WHO OWES YOU"
            items={whoOwesYouItems}
            sectionKey="whoOwesYou"
          />
          <ReportSection
            title="WHAT YOU OWE"
            items={whatYouOweItems}
            sectionKey="whatYouOwe"
          />
          <ReportSection
            title="SALES AND CUSTOMER"
            items={salesAndCustomerItems}
            sectionKey="salesAndCustomer"
          />
          <ReportSection
            title="EXPENSES AND SUPPLIERS"
            items={expensesAndSuppliersItems}
            sectionKey="expensesAndSuppliers"
          /> */}
        <ReportSection
          title="PAYROLL"
          items={salesTaxItems}
          sectionKey="salesTax"
        />
      </div>
    </>
  );
}
