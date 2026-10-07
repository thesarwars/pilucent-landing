import { X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Pages data - you can add all your pages here
const pages = [
  {
    id: "1",
    title: "Dashboard",
    url: "/dashboard",
    description: "Main dashboard overview",
    category: "Main",
    tags: "dashboard",
  },
  {
    id: "2787",
    title: "Sales",
    url: "/dashboard/sales/all_sales",
    description: "Manage invoices",
    tags: "sales, Invoices",
    category: "Finance",
  },
  {
    id: "26354",
    title: "Quantity Adjustments",
    url: "/dashboard/sales/product_services/quantity_adjustment",
    description: "Manage Adjustments",
    tags: "Quantity Adjustment",
    category: "Inventory",
  },
  {
    id: "26876758",
    title: "Add Quantity Adjustments",
    url: "/dashboard/sales/product_services/add_new_inventoryqa",
    description: "create quantity adjustment",
    tags: "create, Add quantity adjustment",
    category: "Finance",
  },
  {
    id: "2789789",
    title: "Warehouses",
    url: "/dashboard/sales/warehouse_location",
    description: "Manage warehouse locations",
    tags: "create Warehouse, warehouse, locations",
    category: "Finance",
  },
  {
    id: "28907",
    title: "Invoices",
    url: "/dashboard/sales/all_sales/invoice",
    description: "Manage invoices",
    tags: "create Invoices",
    category: "Finance",
  },
  {
    id: "38987676",
    title: "Expenses",
    url: "/dashboard/expenses/expenses/expense",
    description: "Track expenses",
    category: "Finance",
  },
  {
    id: "4",
    title: "Customers",
    url: "/dashboard/sales/customers",
    description: "Customer management",
    category: "CRM",
  },
  {
    id: "5",
    title: "Products",
    url: "/dashboard/sales/product_services",
    description: "Product catalog",
    category: "Inventory",
  },
  {
    id: "6",
    title: "Reports",
    url: "/dashboard/reports",
    description: "Financial reports",
    category: "Analytics",
  },
  {
    id: "7",
    title: "Settings",
    url: "/dashboard/admin/company_settings",
    description: "Application settings",
    category: "Admin",
  },
  {
    id: "8",
    title: "User Profile",
    url: "/dashboard/profile",
    description: "User account settings",
    category: "Account",
  },
  {
    id: "9",
    title: "Transactions",
    url: "/dashboard/transactions/banking",
    description: "Transaction history",
    category: "Finance",
  },
  {
    id: "10c",
    title: "Chart Of Accounts",
    url: "/dashboard/transactions/chart-of-accounts",
    description: "Accounts",
    category: "Finance",
  },
  {
    id: "11c",
    title: "COA Tree",
    url: "/dashboard/transactions/coa_tree",
    description: "Chart tree analytics",
    category: "Analytics",
  },
  {
    id: "12j",
    title: "Journal Entry",
    url: "/dashboard/transactions/journal",
    description: "Journal management",
    category: "Analytics",
  },
  {
    id: "13p",
    title: "Payment Setup",
    url: "/dashboard/transactions/payment-setup",
    description: "Billing and subscriptions",
    category: "Finance",
  },
  {
    id: "14",
    title: "Support",
    url: "/dashboard/support",
    description: "Help and support",
    category: "Help",
  },
  {
    id: "15",
    title: "AI Chat",
    url: "/dashboard/ai-chat",
    description: "AI Balanzify Chat",
    category: "Help",
  },
  {
    id: "16",
    title: "Journal Report",
    url: "/dashboard/reports/journal",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "255",
    title: "Standard | Trial Balance",
    url: "/dashboard/reports/trial_balance",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "366",
    title: "Standard | Balance Sheet",
    url: "/dashboard/reports/balance_sheet",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "477",
    title: "Standard | Profit Losses",
    url: "/dashboard/reports/profit&loss",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "588",
    title: "Standard | Profit and Loss Detail",
    url: "/dashboard/reports/profit&loss/month",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "996",
    title: "Standard | Profit and Loss by Month",
    url: "/dashboard/reports/profit&loss/month",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "/dashboard/sales/all_sales/estimate",
    title: "Sales| Estimate",
    url: "/dashboard/sales/all_sales/estimate",
    description: "Crate estimation",
    category: "Finance",
  },
 {
    id: "/dashboard/sales/all_sales/invoice",
    title: "Sales| Invoice",
    url: "/dashboard/sales/all_sales/invoice",
    description: "Generate and track invoices",
    category: "Finance",
  
  },
 {
    id: "/dashboard/sales/all_sales/payment",
    title: "Sales| Payment",
    url: "/dashboard/sales/all_sales/payment",
    description: "Record and manage customer payments",
    category: "Finance",
  
  },
 {
    id: "/dashboard/sales/all_sales/sales_receipt",
    title: "Sales| Sales Receipt",
    url: "/dashboard/sales/all_sales/sales_receipt",
    description: "Generate receipts for completed sales",
    category: "Finance",
  
  },
 {
    id: "/dashboard/sales/all_sales/credit_note",
    title: "Sales| Credit Note",
    url: "/dashboard/sales/all_sales/credit_note",
    description: "Create and manage credit notes for returns or adjustments",
    category: "Finance",
  
  },
{
    id: "/dashboard/sales/all_sales/refund_receipt",
    title: "Sales| Refund Receipt",
    url: "/dashboard/sales/all_sales/refund_receipt",
    description: "Manage and track customer refund receipts",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/expenses/bill",
    title: "Expenses| Bill",
    url: "/dashboard/expenses/expenses/bill",
    description: "Record and manage vendor bills",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/expenses/cheque",
    title: "Expenses| cheque",
    url: "/dashboard/expenses/expenses/cheque",
    description: "Record cheque transactions for expenses",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/expenses/purchase",
    title: "Expenses| Purchase",
    url: "/dashboard/expenses/expenses/purchase",
    description: "Record and manage purchase transactions",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/expenses/bill-payment",
    title: "Expenses| Bill Payment",
    url: "/dashboard/expenses/expenses/bill-payment",
    description: "Manage bill settlements and payment status",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/expenses/supplier-credit",
    title: "Expenses| Supplier Credit",
    url: "/dashboard/expenses/expenses/supplier-credit",
    description: "Manage supplier returns or adjustments",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/expenses/pay-bill",
    title: "Expenses| Pay Bills",
    url: "/dashboard/expenses/expenses/pay-bill",
    description: "Make payments for recorded bills",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/suppliers",
    title: "Expenses| Suppliers",
    url: "/dashboard/expenses/suppliers",
    description: "Manage and view supplier information",
    category: "Finance",
  
  },
{
    id: "/dashboard/expenses/suppliers/bulk-import",
    title: "Expenses| Suppliers | Bulk Import ",
    url: "/dashboard/expenses/suppliers/bulk-import",
    description: "Import multiple suppliers in bulk",
    category: "Finance",
  
  },
{
    id: "/dashboard/reports/cash_flow",
    title: "Standard | Statement of Cash Flows",
    url: "/dashboard/reports/cash_flow",
    description: "Track cash flow to monitor financial health",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/general-ledger",
    title: "Standard | General Ledger",
    url: "/dashboard/reports/general-ledger",
    description: "View detailed general ledger transactions",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/coa_accounts",
    title: "Standard | COA Accounts",
    url: "/dashboard/reports/coa_accounts",
    description: "Analyze account categories and financial data",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/open-invoices",
    title: "Standard | Open Invoices",
    url: "/dashboard/reports/open-invoices",
    description: "rack all outstanding customer invoices",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/terms",
    title: "Standard | Terms",
    url: "/dashboard/reports/terms",
    description: "Review payment terms and conditions",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/customers",
    title: "Standard | Customer information",
    url: "/dashboard/reports/customers",
    description: "View summarized customer contact information",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/pay_methods",
    title: "Standard | Payment methods",
    url: "/dashboard/reports/pay_methods",
    description: "Analyze different payment methods used",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/products",
    title: "Standard | Products| Services List",
    url: "/dashboard/reports/customers",
    description: "View product listings with sales price and stock levels",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/suppliers",
    title: "Standard | Supplier information",
    url: "/dashboard/reports/suppliers",
    description: "View supplier contact list and details",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/sales-tax-liability",
    title: "Standard | Sales Tax Liability",
    url: "/dashboard/reports/sales-tax-liability",
    description: "Track sales tax liabilities and payments",
    category: "Analytics",
  },
{
    id: "/dashboard/reports/taxable-sales-details",
    title: "Standard | Taxable sales details",
    url: "/dashboard/reports/taxable-sales-details",
    description: "Detailed report of taxable sales transactions",
    category: "Analytics",
  },
{
    id: "/dashboard/taxes/taxes_agencies",
    title: "Standard | Tax Agencies",
    url: "/dashboard/taxes/taxes_agencies",
    description: "Manage tax agencies and their details",
    category: "Admin",
  },
{
    id: "/dashboard/taxes/sales",
    title: "Standard | Sales Tax",
    url: "/dashboard/taxes/sales",
    description: "Track tax schedules across different agencies",
    category: "Admin",
  },
{
    id: "/dashboard/taxes/tax-process-tracker",
    title: "Standard | Tax Process Tracker",
    url: "/dashboard/taxes/tax-process-tracker",
    description: "Track the status of tax filing and payment processes",
    category: "Admin",
  },
{
    id: "/dashboard/admin/currency_management",
    title: "Currency Management",
    url: "/dashboard/admin/currency_management",
    description: "Manage system currencies and exchange rates",
    category: "Admin",
  },
{
    id: "/dashboard/admin/audit_log",
    title: "Audit log",
    url: "/dashboard/admin/audit_log",
    description: "Track user actions for security and compliance",
    category: "Admin",
  },
{
    id: "/dashboard/admin/terms",
    title: "Terms",
    url: "/dashboard/admin/terms",
    description: "Manage default payment terms and conditions",
    category: "Admin",
  },
{
    id: "/dashboard/admin/attachment",
    title: "Attachments",
    url: "/dashboard/admin/attachment",
    description: "Manage uploaded files and document attachments",
    category: "Admin",
  },
{
    id: "/dashboard/admin/roles",
    title: "Role management",
    url: "/dashboard/admin/roles",
    description: "Define and manage user roles and permissions",
    category: "Admin",
  },
{
    id: "/dashboard/admin/roles/create",
    title: "Permission based Roles",
    url: "/dashboard/admin/roles/create",
    description: "Create new user roles with custom permissions",
    category: "Admin",
  },
{
    id: "/dashboard/hris/employee/shift",
    title: "Employee Shift",
    url: "/dashboard/hris/employee/shift",
    description: "Manage employee work shifts and schedules",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/department",
    title: "Employee Departments",
    url: "/dashboard/hris/employee/department",
    description: "Manage and organize employee departments",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/designation",
    title: "Employee Designation",
    url: "/dashboard/hris/employee/designation",
    description: "Manage employee job titles and designations",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/employee_list",
    title: "Employee List",
    url: "/dashboard/hris/employee/employee_list",
    description: "View and manage employee records",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/employee-leaves",
    title: "Employee Leave",
    url: "/dashboard/hris/employee/employee-leaves",
    description: "Manage employee leave requests and balances",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/holiday",
    title: "Holiday List",
    url: "/dashboard/hris/employee/holiday",
    description: "Manage company holiday calendar",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/leave-type",
    title: "Employee Leave Type",
    url: "/dashboard/hris/employee/leave-type",
    description: "Define and manage types of employee leave",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/leave_balance",
    title: "Employee Leave Balance",
    url: "/dashboard/hris/employee/leave_balance",
    description: "Track employee leave balances and usage",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/leave_encashment",
    title: "Employee Leave Encashment",
    url: "/dashboard/hris/employee/leave_encashment",
    description: "Manage employee leave encashment requests",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/leave-approval",
    title: "Employee Leave Approval",
    url: "/dashboard/hris/employee/leave-approval",
    description: "Approve or reject employee leave requests",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/employee_salary_list",
    title: "Employee Salary List",
    url: "/dashboard/hris/payroll/employee_salary_list",
    description: "View and manage employee salary records",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/addition_deduction",
    title: "Payroll Addition and deduction",
    url: "/dashboard/hris/payroll/addition_deduction",
    description: "Manage payroll additions and deductions",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/salary_process",
    title: "Employee salary payments",
    url: "/dashboard/hris/payroll/salary_process",
    description: "Process employee salary payments",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/payroll_tax",
    title: "Payroll related tax",
    url: "/dashboard/hris/payroll/payroll_tax",
    description: "Manage payroll-related taxes and deductions",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/deduction_contribution",
    title: "Payroll deduction and contribution",
    url: "/dashboard/hris/payroll/deduction_contribution",
    description: "Manage payroll deductions and contributions",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/pay_schedule",
    title: "Payroll schedules",
    url: "/dashboard/hris/payroll/pay_schedule",
    description: "Manage employee payroll schedules",
    category: "CRM",
  },
{
    id: "/dashboard/hris/payroll/settings",
    title: "Payroll settings",
    url: "/dashboard/hris/payroll/settings",
    description: "Configure payroll system settings and rules",
    category: "CRM",
  },
{
    id: "/dashboard/hris/employee/leave-approval",
    title: "Employee Leave Approval",
    url: "/dashboard/hris/employee/leave-approval",
    description: "Approve or reject employee leave requests",
    category: "CRM",
  },
{
    id: "/dashboard/hris/attendance/attendance_list",
    title: "Employee Attendance Records",
    url: "/dashboard/hris/attendance/attendance_list",
    description: "View and manage employee attendance records",
    category: "CRM",
  },
{
    id: "/dashboard/hris/attendance/attendance_process",
    title: "Attendance Process",
    url: "/dashboard/hris/attendance/attendance_process",
    description: "Process and update employee attendance data",
    category: "CRM",
  },
{
    id: "/dashboard/hris/attendance/punch_data_import",
    title: "Punch Data Import",
    url: "/dashboard/hris/attendance/punch_data_import",
    description: "Upload and manage records",
    category: "CRM",
  },
{
    id: "/dashboard/hris/reports",
    title: "HR&Payroll related reports ",
    url: "/dashboard/hris/reports",
    description: "Generate and view HR-related reports",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/payroll/report/deduction&contribution",
    title: " Payroll deduction & contribution",
    url: "/dashboard/hris/payroll/report/deduction&contribution",
    description: "Report on payroll deductions and contributions",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/payroll/report/pay_check",
    title: "Reports on paycheck",
    url: "/dashboard/hris/payroll/report/pay_check",
    description: "Generate reports on employee paychecks",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/payroll/report/payroll_summary",
    title: "Payroll summary reports",
    url: "/dashboard/hris/payroll/report/payroll_summary",
    description: "View summarized payroll reports",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/payroll/report/payroll_summary_employee",
    title: "Payroll summary by employee report",
    url: "/dashboard/hris/payroll/report/payroll_summary_employee",
    description: "View detailed payroll summary by employee",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/reports/tax-liability",
    title: "Payroll Tax Liability",
    url: "/dashboard/hris/reports/tax-liability",
    description: "Monitor and report payroll tax liabilities",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/reports/payroll-details",
    title: "Payroll Details",
    url: "/dashboard/hris/reports/payroll-details",
    description: "Detailed report of payroll transactions and records",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/payroll/report/payroll_summary",
    title: "Payroll summary reports",
    url: "/dashboard/hris/payroll/report/payroll_summary",
    description: "View summarized payroll reports",
    category: "Analytics",
  },
{
    id: "/dashboard/hris/reports/vacancy-leave",
    title: "Vacancy And Sick Leaves",
    url: "/dashboard/hris/reports/vacancy-leave",
    description: "Report employee leave status and balance",
    category: "Analytics",
  }, 

{
    id: "/dashboard/accountants",
    title: "Vacancy And Sick Leaves",
    url: "/dashboard/accountants",
    description: "Manage and Hire accountants details",
    category: "Analytics",
  }, 

];

const searchSuggestions = [
  {
    id: "1",
    title: "Dashboard",
    url: "/dashboard",
    description: "Main dashboard overview",
    category: "Main",
  },
  {
    id: "2",
    title: "Invoices",
    url: "/dashboard/sales/all_sales/invoice",
    description: "Manage invoices",

    category: "Finance",
  },
  {
    id: "3",
    title: "Expenses",
    url: "/dashboard/expenses/expenses/expense",
    description: "Track expenses",
    category: "Finance",
  },
  {
    id: "4",
    title: "Customers",
    url: "/dashboard/sales/customers",
    description: "Customer management",
    category: "CRM",
  },
  {
    id: "5",
    title: "Products",
    url: "/dashboard/sales/product_services",
    description: "Product catalog",
    category: "Inventory",
  },
  {
    id: "15",
    title: "AI Chat",
    url: "/dashboard/ai-chat",
    description: "AI Balanzify Chat",
    category: "help",
    text: "Go to AI Chat",
  },
];

const reportItems = [
 {
    id: "16",
    title: "Journal Report",
    url: "/dashboard/reports/journal",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "255",
    title: "Standard | Trial Balance",
    url: "/dashboard/reports/trial_balance",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "366",
    title: "Standard | Balance Sheet",
    url: "/dashboard/reports/balance_sheet",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "477",
    title: "Standard | Profit Losses",
    url: "/dashboard/reports/profit&loss",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "588",
    title: "Standard | Profit and Loss Detail",
    url: "/dashboard/reports/profit&loss/month",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
  {
    id: "996",
    title: "Standard | Profit and Loss by Month",
    url: "/dashboard/reports/profit&loss/month",
    description: "AI Balanzify Chat",
    category: "Analytics",
  },
];

const GlobalSearch = () => {
  const inputRef = useRef<any>(null);
  const comRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);


  const [searchValue, setSearchValue] = useState("");

  // Filter pages based on search input
  const filteredPages = useMemo(() => {
    if (!searchValue.trim()) return [];

    const searchTerm = searchValue.toLowerCase();
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchTerm) ||
        page.url.toLowerCase().includes(searchTerm) ||
        page.description?.toLowerCase().includes(searchTerm) ||
        page.category.toLowerCase().includes(searchTerm) ||
        page?.tags?.toLowerCase().includes(searchTerm),
    );
  }, [searchValue, pages]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    inputRef.current.focus();
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Main: "🏠",
      Finance: "💰",
      CRM: "👥",
      Inventory: "📦",
      Analytics: "📊",
      Admin: "⚙️",
      Account: "👤",
      Help: "❓",
      Developer: "💻",
    };
    return icons[category] || "📄";
  };

  const showPages = searchValue.trim().length > 0 && filteredPages.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (comRef.current && !comRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={comRef}>
      <div className="flex items-center justify-center gap-2">
        <div
          className={"w-80 h-10 pl-3 pr-2 py-2 bg-white/30 rounded-[84px] outline outline-1 outline-white inline-flex justify-start items-center gap-2"}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Try searching for page like 'Dashboard', 'Settings'"
            className="h-full w-full pl-7 focus:outline-none justify-center text-slate-900/60 text-sm font-medium bg-transparent placeholder:text-slate-900/60 placeholder:text-sm placeholder:font-medium"
            onFocus={() => setIsOpen(true)}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
       
        {/* <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          className={`h-10 rounded-lg border bg-white px-4 py-1 text-sm text-accent_soft_black transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent_secondary ${
            isOpen ? "w-80 opacity-100" : "w-0 overflow-hidden opacity-0"
          }`}
        /> */}
      </div>
      {/* Search Results Container */}
      {
        isOpen && 
        <div
          className={`absolute top-11 z-50 h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out md:w-full `}
        >
          {showPages && searchValue && (
            /* Page Search Results */
            <div>
              <div className="p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-500">
                  Pages ({filteredPages.length} result
                  {filteredPages.length !== 1 ? "s" : ""})
                </h3>
                <div className="space-y-1">
                  {filteredPages.map((page) => (
                    <Link
                    
                      key={page.id}
                      href={page.url}
                      className="group flex cursor-pointer items-center justify-between rounded p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex flex-1 items-center space-x-3">
                        <div className="text-lg">
                          {getCategoryIcon(page.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 group-hover:text-blue-600">
                              {page.title}
                            </span>
                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              {page.category}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className="font-mono text-xs text-blue-600">
                              {page.url}
                            </span>
                          </div>
                          {page.description && (
                            <>
                              <span className="text-gray-300">•</span>{" "}
                              <span className="text-xs text-gray-500">
                                {page.description}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <svg
                          className="h-4 w-4 text-gray-400"
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
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!showPages && searchValue && (
            <div className="p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-500">
                Pages ({filteredPages.length} result
                {filteredPages.length !== 1 ? "s" : ""})
              </h3>
              <p className="mt-7 text-center text-black">No results!</p>
            </div>
          )}

          {!searchValue && (
            /* Transaction Search Results */
            <div>
              {/* Search Suggestions */}
              <div className="border-b border-gray-100 p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-500">
                  Search suggestions
                </h3>
                <div className="space-y-2">
                  {searchSuggestions.map((suggestion) => (
                    <Link
                      key={suggestion.id}
                      href={suggestion.url}
                      className="flex cursor-pointer items-center space-x-3 rounded p-2 hover:bg-gray-50"
                    >
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {suggestion.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-500">
                  Reports
                </h3>
                <div className="space-y-2">
                  {reportItems?.map((transaction) => (
                    <Link
                      href={transaction?.url}
                      key={transaction.id}
                      className="flex items-center justify-between rounded p-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <span className="font-medium">
                            {/* {transaction.type} */}
                          </span>
                            <>
                              {/* <span className="text-gray-400">|</span> */}
                              <span>{transaction.title}</span>
                            </>
                          {/* <span className="text-gray-400">|</span> */}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* <div className="mt-4 border-t border-gray-100 pt-3">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Advanced transactions search for more results
                  </button>
                </div> */}
              </div>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default GlobalSearch;
