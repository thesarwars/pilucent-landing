import type { DashboardData } from "./types";

export const dashboardData: DashboardData = {
  kpis: [
    { id: "revenue", title: "Total Revenue", value: "$186,540.00", helper: "vs last 30 days", trend: "+18.7%", trendDirection: "up", tone: "purple" },
    { id: "cash", title: "Cash Balance", value: "$84,560.00", helper: "vs last 30 days", trend: "+12.4%", trendDirection: "up", tone: "green" },
    { id: "ar", title: "Accounts Receivable", value: "$248,750.00", helper: "open balance", trend: "+8.6%", trendDirection: "up", tone: "blue" },
    { id: "ap", title: "Accounts Payable", value: "$146,280.00", helper: "open supplier bills", trend: "-5.3%", trendDirection: "down", tone: "orange" },
    { id: "payroll", title: "Payroll Due", value: "$18,560.00", helper: "due May 31", trend: "in 7 days", trendDirection: "neutral", tone: "rose" },
    { id: "tax", title: "Tax Due", value: "$9,450.00", helper: "due Jun 15", trend: "in 22 days", trendDirection: "neutral", tone: "rose" },
    { id: "inventory", title: "Inventory Value", value: "$324,680.00", helper: "FIFO valuation", trend: "+9.1%", trendDirection: "up", tone: "cyan" },
    { id: "profit", title: "Net Profit", value: "$62,430.00", helper: "vs last month", trend: "+15.6%", trendDirection: "up", tone: "green" },
    { id: "attendance", title: "Attendance Rate", value: "92.3%", helper: "today", trend: "+3.7%", trendDirection: "up", tone: "green" }
  ],
  cashFlow: [
    { label: "Apr 24", inflow: 56000, outflow: 25500 },
    { label: "Apr 29", inflow: 70500, outflow: 39000 },
    { label: "May 04", inflow: 62500, outflow: 45500 },
    { label: "May 09", inflow: 80420, outflow: 32210 },
    { label: "May 14", inflow: 70600, outflow: 36500 },
    { label: "May 19", inflow: 87500, outflow: 34200 },
    { label: "May 24", inflow: 104200, outflow: 46300 }
  ],
  profitLoss: [
    { label: "Jan", revenue: 114000, expenses: 69000, profit: 45000 },
    { label: "Feb", revenue: 126000, expenses: 73500, profit: 52500 },
    { label: "Mar", revenue: 136000, expenses: 86000, profit: 50000 },
    { label: "Apr", revenue: 154000, expenses: 91000, profit: 63000 },
    { label: "May", revenue: 186540, expenses: 124110, profit: 62430 },
    { label: "Jun", revenue: 172000, expenses: 100500, profit: 71500 }
  ],
  incomeVsExpense: [
    { label: "Jan", income: 95000, expenses: 64000 },
    { label: "Feb", income: 112000, expenses: 72000 },
    { label: "Mar", income: 129000, expenses: 79500 },
    { label: "Apr", income: 151000, expenses: 98000 },
    { label: "May", income: 186540, expenses: 124110 }
  ],
  insights: [
    { title: "5 overdue invoices", message: "Total $32,040.00 from 3 customers", action: "View invoices", severity: "critical" },
    { title: "72 low-stock items", message: "Reorder soon to avoid stockouts", action: "View inventory", severity: "high" },
    { title: "Payroll due soon", message: "$18,560.00 due on May 31, 2025", action: "Run payroll", severity: "medium" },
    { title: "Tax filing due", message: "VAT return due on Jun 15, 2025", action: "Tax center", severity: "medium" },
    { title: "Cash flow forecast", message: "Cash may dip below $40K by Jun 5", action: "View forecast", severity: "info" }
  ],
  attendanceStats: [
    { label: "Present today", value: "92", helper: "74.2%", tone: "green" },
    { label: "Late check-ins", value: "8", helper: "6.5%", tone: "orange" },
    { label: "On leave", value: "16", helper: "12.9%", tone: "rose" },
    { label: "Attendance rate", value: "92.3%", helper: "+3.7% vs last 7 days", tone: "green" }
  ],
  employeeStats: [
    { label: "Total employees", value: "124", helper: "+6 vs last month", tone: "purple" },
    { label: "New joiners", value: "5", helper: "+5 this month", tone: "blue" },
    { label: "Open positions", value: "8", helper: "2 urgent hiring", tone: "orange" },
    { label: "Upcoming confirmations", value: "3", helper: "in next 30 days", tone: "purple" }
  ],
  leaveRequests: [
    { name: "John Doe", avatar: "JD", type: "Annual Leave", dates: "May 26 - May 28", days: "2 days" },
    { name: "Sarah Johnson", avatar: "SJ", type: "Sick Leave", dates: "May 27", days: "1 day" },
    { name: "Michael Brown", avatar: "MB", type: "Personal Leave", dates: "May 30 - May 31", days: "2 days" },
    { name: "John Doe", avatar: "JD", type: "Annual Leave", dates: "May 26 - May 28", days: "2 days" },
    { name: "Sarah Johnson", avatar: "SJ", type: "Sick Leave", dates: "May 27", days: "1 day" },
    { name: "Michael Brown", avatar: "MB", type: "Personal Leave", dates: "May 30 - May 31", days: "2 days" },
    { name: "John Doe", avatar: "JD", type: "Annual Leave", dates: "May 26 - May 28", days: "2 days" },
    { name: "Sarah Johnson", avatar: "SJ", type: "Sick Leave", dates: "May 27", days: "1 day" },
    { name: "Michael Brown", avatar: "MB", type: "Personal Leave", dates: "May 30 - May 31", days: "2 days" }
  ],
  workforce: [
    { name: "On Shift", value: 76, color: "#6c5ce7" },
    { name: "Yet to Check-in", value: 18, color: "#f59e0b" },
    { name: "On Leave", value: 16, color: "#22c55e" },
    { name: "Absent", value: 14, color: "#ef4444" }
  ],
  events: [
    { title: "James Smith", subtitle: "Birthday", date: "May 25", icon: "calendar" },
    { title: "Company Anniversary", subtitle: "Bean Enterprises", date: "May 27", icon: "party" },
    { title: "New Joiner", subtitle: "Emily Davis", date: "May 28", icon: "user" }
  ],
  invoiceStatus: [
    { name: "Paid", amount: 152430, label: "$152,430", color: "#10b981" },
    { name: "Pending", amount: 64280, label: "$64,280", color: "#f59e0b" },
    { name: "Overdue", amount: 32040, label: "$32,040", color: "#ef4444" }
  ],
  transactions: [
    { title: "Invoice Payment", meta: "INV-10023 • Acme Corp", amount: "+$12,450.00", direction: "in", date: "May 24" },
    { title: "Bill Payment", meta: "BILL-20045 • Office Supplies", amount: "-$2,350.00", direction: "out", date: "May 24" },
    { title: "Expense", meta: "EXP-30021 • Marketing", amount: "-$1,150.00", direction: "out", date: "May 23" },
    { title: "Customer Payment", meta: "INV-10024 • Globex Industries", amount: "+$8,750.00", direction: "in", date: "May 23" }
  ],
  bankAccounts: [
    { name: "Business Checking", masked: "•••• 4242", amount: "$84,560.00", sync: "2 min ago" },
    { name: "Savings Account", masked: "•••• 8858", amount: "$52,340.00", sync: "1 hour ago" },
    { name: "Payroll Account", masked: "•••• 2565", amount: "$21,780.00", sync: "Synced" }
  ],
  tickets: [
    { title: "Unable to generate report", code: "#TKT-3121", priority: "High", age: "2h ago" },
    { title: "Payroll calculation mismatch", code: "#TKT-3045", priority: "Medium", age: "4h ago" },
    { title: "Bank statement import issue", code: "#TKT-2610", priority: "Low", age: "1d ago" }
  ],
  activity: [
    { title: "Invoice INV-10023 paid by Acme Corp", meta: "May 24, 10:30 AM", amount: "+$12,450.00", type: "success" },
    { title: "Bill BILL-20045 paid", meta: "May 24, 09:15 AM", amount: "-$2,350.00", type: "danger" },
    { title: "Payment received from Globex Industries", meta: "May 24, 08:41 AM", amount: "+$8,750.00", type: "success" },
    { title: "Payroll for May 2025 processed", meta: "May 24, 04:20 PM", amount: "-$18,560.00", type: "warning" },
    { title: "New customer registered: Soylent Corp", meta: "May 23, 11:20 AM", type: "info" }
  ],
  topCustomers: [
    { name: "Acme Corporation", value: "$42,580", percent: 34 },
    { name: "Globex Industries", value: "$31,240", percent: 25 },
    { name: "Soylent Corp", value: "$21,430", percent: 17 },
    { name: "Initech", value: "$18,220", percent: 14 },
    { name: "Umbrella Corp", value: "$16,340", percent: 10 }
  ],
  topProducts: [
    { name: "Wireless Mouse", value: "1,248", secondary: "$12,480", percent: 38 },
    { name: "Ergonomic Chair", value: "896", secondary: "$10,752", percent: 29 },
    { name: "USB-C Hub", value: "768", secondary: "$9,640", percent: 22 },
    { name: "Monitor 24\"", value: "624", secondary: "$7,480", percent: 18 },
    { name: "Laptop Stand", value: "512", secondary: "$4,096", percent: 12 }
  ],
  approvals: [
    { count: "8", label: "Invoices", amount: "$24,580.00" },
    { count: "5", label: "Bills", amount: "$12,340.00" }
  ],
  payrollBreakdown: [
    { name: "Gross Salary", value: 15860, amount: "$15,860", color: "#6c5ce7" },
    { name: "Allowances", value: 2150, amount: "$2,150", color: "#10b981" },
    { name: "Deductions", value: 3780, amount: "$3,780", color: "#f59e0b" },
    { name: "Taxes", value: 2650, amount: "$2,650", color: "#3b82f6" },
    { name: "Net Pay", value: 12240, amount: "$12,240", color: "#ef4444" }
  ],
  taxBreakdown: [
    { name: "VAT", amount: 4350, label: "$4,350", color: "#6c5ce7" },
    { name: "Income Tax", amount: 3100, label: "$3,100", color: "#f59e0b" },
    { name: "Payroll Tax", amount: 2000, label: "$2,000", color: "#10b981" }
  ],
  arAging: [
    { name: "Current", amount: 153430, label: "$153,430", color: "#6c5ce7" },
    { name: "31-60 Days", amount: 44280, label: "$44,280", color: "#10b981" },
    { name: "61-90 Days", amount: 20460, label: "$20,460", color: "#f59e0b" },
    { name: "90+ Days", amount: 11000, label: "$11,000", color: "#ef4444" }
  ],
  apAging: [
    { name: "Current", amount: 92120, label: "$92,120", color: "#6c5ce7" },
    { name: "31-60 Days", amount: 36160, label: "$36,160", color: "#10b981" },
    { name: "61-90 Days", amount: 12400, label: "$12,400", color: "#f59e0b" },
    { name: "90+ Days", amount: 7600, label: "$7,600", color: "#ef4444" }
  ],
  expenseBreakdown: [
    { name: "Marketing", amount: 8420, label: "$8,420", color: "#d946ef" },
    { name: "Rent", amount: 7650, label: "$7,650", color: "#6c5ce7" },
    { name: "Salaries", amount: 7140, label: "$7,140", color: "#10b981" },
    { name: "Utilities", amount: 3260, label: "$3,260", color: "#f59e0b" },
    { name: "Other", amount: 6170, label: "$6,170", color: "#3b82f6" }
  ],
  quickActions: [
    { title: "Create Invoice", description: "Generate and send", tone: "purple" },
    { title: "Record Expense", description: "Add and categorize", tone: "green" },
    { title: "Run Payroll", description: "Process payslips", tone: "blue" },
    { title: "Reconcile Bank", description: "Match transactions", tone: "purple" },
    { title: "Add Product", description: "Inventory item", tone: "green" },
    { title: "Create Report", description: "Financial report", tone: "orange" },
    { title: "Invite User", description: "Team access", tone: "blue" }
  ],
  healthSnapshot: {
    totalExpense: {
      label: "Total Expense",
      value: "$32,640",
      trend: "+6.2%",
      trendDirection: "up",
      helper: "vs last month"
    },
    availableCash: {
      label: "Available Cash",
      value: "$158,680",
      trend: "+12.4%",
      trendDirection: "up",
      helper: "vs last month"
    },
    cashHealthScore: {
      score: 84,
      label: "Cash health score"
    }
  },
  cashRunway: {
    months: "8.4 months",
    untilDate: "Until Feb 28, 2026",
    radialValue: 74,
    monthlyBurn: "$18,750.00",
    burnPercent: 68
  }
};
