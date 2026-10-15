export const permissions = [
  {
    path: '/dashboard/profile',
    codeName: '',
    isPass: true,
  },
  {
    path: '/dashboard/transactions/chart-of-accounts',
    codeName: 'view_chartofaccount',
  },
  {
    path: '/dashboard/sales/tax',
    codeName: 'view_salestax',
    isPass: true,
  },
  {
    path: '/dashboard/transactions/coa_tree',
    codeName: 'view_chartofaccount',
  },
  {
    path: '/dashboard/transactions/banking',
    codeName: 'view_transactioninformation',
  },
  {
    path: '/dashboard/transactions/journal',
    codeName: 'view_journalentry',
  },
  {
    path: '/dashboard/transactions/recurring',
    codeName: 'view_recurring',
    // Backend doesn't emit `view_recurring` yet — allow the route from the frontend.
    isPass: true,
  },
  {
    path: '/dashboard/sales/all_sales',
    codeName: 'view_sale',
  },
  {
    path: '/dashboard/sales/customers',
    codeName: 'view_customer',
  },
  {
    path: '/dashboard/sales/product_services',
    codeName: 'view_product',
  },
  {
    path: '/dashboard/sales/warehouse_location',
    codeName: 'view_warehouse',
  },
  {
    path: '/dashboard/expenses/expenses',
    codeName: 'view_expense',
  },
  {
    path: '/dashboard/expenses/suppliers',
    codeName: 'view_supplier',
  },
  {
    path: '/dashboard/taxes/taxes_agencies',
    codeName: 'view_agencytax',
  },
  {
    path: '/dashboard/taxes/economic_nexus',
    isPass: true,
  },
  {
    path: '/dashboard/admin/currency_management',
    codeName: 'view_currency',
  },
  {
    path: '/dashboard/admin/audit_log',
    codeName: 'view_logentry',
  },
   {
    path: '/dashboard/admin/subscription',
    codeName: 'view_companysubscription',
  },
  {
    path: '/dashboard/admin/terms',
    codeName: 'view_term',
  },
  {
    path: '/dashboard/admin/company_settings',
    codeName: 'view_companysetting',
  },
  {
    path: '/dashboard/admin/attachment',
    codeName: 'view_fileitem',
  },
  {
    path: '/dashboard/admin/roles',
    codeName: 'view_companyrole',
  },
  {
    path: '/dashboard/admin/payment_management',
    codeName: 'view_paymentmethod',
  },
  {
    path: '/dashboard/admin/migrate',
    codeName: 'view_datamigrationjob',
  },
  {
    path: '/dashboard/hris/employee/shifts',
    codeName: 'view_companyshift',
  },
  {
    path: '/dashboard/hris/employee/departments',
    codeName: 'view_companydepartment',
  },
  {
    path: '/dashboard/hris/employee/designations',
    codeName: 'view_companydesignation',
  },
  {
    path: '/dashboard/hris/employee/employees',
    codeName: 'view_employee',
  },
  {
    path: '/dashboard/hris/employee/employees/summary',
    isPass: true,
  },
  // The salary profiles open to whoever may see employees; the figures in them
  // are masked by the server for anyone without `view_salary_figures`.
  {
    path: '/dashboard/hris/salary',
    codeName: 'view_employee',
  },
  {
    path: '/dashboard/hris/profile',
    isPass: true,
  },
  {
    path: '/dashboard/hris/employee/employee-leaves',
    codeName: 'view_leaverequests',
  },
  {
    path: '/dashboard/hris/employee/leave-type',
    codeName: 'view_leavetype',
  },
  {
    path: '/dashboard/hris/employee/leave-balance',
    codeName: 'view_leavebalance',
  },
  {
    path: '/dashboard/hris/employee/leave-encashments',
    codeName: 'view_leaveencashment',
  },
  {
    path: '/dashboard/hris/employee/leave-approval',
    codeName: 'view_leaveapproval',
  },
  {
    path: '/dashboard/hris/employee/holiday',
    codeName: 'view_holiday',
  },
  {
    path: '/dashboard/hris/payroll/salaries',
    codeName: 'view_employeesalary',
  },
  {
    path: '/dashboard/hris/payroll/addition-deductions',
    codeName: 'view_salaryadjustment',
  },
  {
    path: '/dashboard/hris/payroll/salary_process',
    codeName: 'view_payrollsalaryprocess',
  },
  {
    path: '/dashboard/hris/payroll/run_payroll',
    codeName: 'view_payrollsalaryprocess',
  },
  {
    path: '/dashboard/hris/payroll/preview_details/previewpayroll',
    codeName: 'view_payrollsalaryprocess',
  },
  {
    path: '/dashboard/hris/payroll/payroll_tax',
    codeName: 'view_payrollstatetaxpaymentschedule',
  },
  {
    path: '/dashboard/hris/payroll/deduction_contribution',
    codeName: 'view_employeedeductioncontribution',
  },
  {
    path: '/dashboard/hris/payroll/pay-schedules',
    codeName: 'view_payschedule',
  },
  {
    path: '/dashboard/hris/payroll/payment',
    codeName: 'view_payrollsalaryprocess',
  },
  {
    path: '/dashboard/hris/payroll/settings',
    codeName: 'view_payrollgeneralsettings',
  },
  {
    path: '/dashboard/hris/payroll/general_settings',
    codeName: 'view_payrollgeneralsettings',
  },
  {
    path: '/dashboard/hris/payroll/accounting_preference',
    codeName: 'view_payrollaccountingpreferencessetting',
  },
  {
    path: '/dashboard/hris/attendance/attendance_list',
    codeName: 'view_attendance',
  },
  {
    path: '/dashboard/hris/attendance/manual_attendance',
    codeName: 'view_attendance',
  },
  {
    path: '/dashboard/hris/attendance/attendance_process',
    codeName: 'view_attendanceprocess',
  },
  {
    path: '/dashboard/hris/attendance/daily_attendance',
    codeName: 'view_dailytimetracking',
  },
  {
    path: '/dashboard/hris/attendance/punch_data_import',
    codeName: 'view_punchdatadailytime',
  },
  {
    path: '/dashboard/reports',
    codeName: 'view_reports',
  },
  {
    path: '/dashboard/support',
    codeName: 'view_inbox',
  },
  {
    path: '/dashboard/ai-chat',
    codeName: '',
    isPass: true,
  },
  {
    path: '/dashboard/accountants',
    codeName: '',
    isPass: true,
  },
  {
    path: '/dashboard/taxes/tax-process-tracker',
    codeName: '',
    isPass: true,
  },
  {
    path: '/dashboard/taxes/sales',
    codeName: 'view_salestax',
  },
  {
    path: '/dashboard/transactions/payment-setup',
    codeName: '',
    isPass: true,
  },
  {
    path: '/dashboard/transactions/reconcile',
    codeName: 'view_bankreconciliation',
  },
  {
    path: '/dashboard/admin/documents',
    codeName: '',
    isPass: true,
  },
  {
    path: '/dashboard/hris/reports',
    codeName: 'view_reports',
  },
  {
    path: '/dashboard/hris/payroll/report',
    codeName: 'view_reports',
  },
  {
    path: '/dashboard/snap-expense',
    codeName: 'view_chatroom',
  },
  {
    path: '/dashboard/hris/payroll/paystab',
    codeName: 'view_payrollsalaryprocess',
  },
];
