/* ------------------------------------------------------------------ *
 * Subscription module — dummy data + pricing logic (per design spec).
 * Wire to real billing endpoints when available; shapes are kept flat
 * so a single fetch can replace these constants.
 * ------------------------------------------------------------------ */

export const currency = (n: number, dp = 2) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(n);

export interface Plan {
  id: 'starter' | 'growth' | 'scale' | 'enterprise';
  name: string;
  price: number | null; // null = custom (Enterprise)
  empMin: number;
  empMax: number; // Infinity for enterprise
  users: number;
  extraEmp: number; // $ per extra employee
  branches: number;
  storage: number; // GB
  ai: number; // AI credits
  tagline: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 150,
    empMin: 1,
    empMax: 25,
    users: 10,
    extraEmp: 6,
    branches: 3,
    storage: 25,
    ai: 1000,
    tagline: 'For small teams getting their books in order.',
    features: ['Up to 25 employees', '10 users', '3 branches', '25GB storage', 'Email support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 250,
    empMin: 26,
    empMax: 100,
    users: 25,
    extraEmp: 5,
    branches: 8,
    storage: 100,
    ai: 5000,
    tagline: 'For scaling teams that need payroll & automation.',
    features: ['Up to 100 employees', '25 users', '8 branches', '100GB storage', 'Priority support'],
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 450,
    empMin: 101,
    empMax: 300,
    users: 75,
    extraEmp: 4,
    branches: 25,
    storage: 500,
    ai: 20000,
    tagline: 'For large operations with complex needs.',
    features: ['Up to 300 employees', '75 users', '25 branches', '500GB storage', '24/7 support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    empMin: 301,
    empMax: Infinity,
    users: Infinity,
    extraEmp: 0,
    branches: Infinity,
    storage: Infinity,
    ai: Infinity,
    tagline: 'Custom limits, dedicated support and SLAs.',
    features: ['Unlimited employees', 'Unlimited users', 'Unlimited branches', 'Custom storage', 'Dedicated manager'],
  },
];

export const planById = (id: Plan['id']) => PLANS.find((p) => p.id === id)!;

/* ---- pricing logic ---- */
export const overageFor = (plan: Plan, employees: number) =>
  plan.price === null ? 0 : Math.max(0, employees - plan.empMax);

export const projectedTotal = (plan: Plan, employees: number) =>
  plan.price === null ? 0 : plan.price + overageFor(plan, employees) * plan.extraEmp;

export const annual = (price: number) => Math.round(price * 0.8);

/* ---- company / current state ---- */
export const company = {
  name: 'Jumatechs LLC',
  email: 'billing@jumatechs.com',
  country: 'United States',
  currency: 'USD',
  planId: 'starter' as Plan['id'],
  status: 'Active',
  cycle: 'Monthly',
  renewsOn: 'Jul 08, 2026',
  card: { brand: 'Visa', last4: '4242', exp: '12/28', holder: 'Juma Kassim' },
  employees: 30,
};

/* ---- usage ---- */
export const usageRows = [
  { id: 'employees', label: 'Employees', used: 30, limit: 25, unit: '', note: '$30 overage' },
  { id: 'users', label: 'Users', used: 8, limit: 10, unit: '' },
  { id: 'branches', label: 'Branches', used: 2, limit: 3, unit: '' },
  { id: 'payroll', label: 'Payroll runs', used: 3, limit: 5, unit: '' },
  { id: 'storage', label: 'Storage', used: 14.6, limit: 25, unit: 'GB' },
  { id: 'ai', label: 'AI credits', used: 620, limit: 1000, unit: '' },
];

/* ---- add-ons ---- */
export type AddonControl = 'stepper' | 'chips' | 'toggle';
export interface Addon {
  id: string;
  name: string;
  price: number;
  unit: string; // e.g. '/emp', '/mo', '/1k', '/10GB', '/user'
  control: AddonControl;
  step?: number; // units added per stepper increment / chip
  start?: number; // initial qty
  desc: string;
  benefits: string[];
}

export const addons: Addon[] = [
  {
    id: 'employees',
    name: 'Extra Employees',
    price: 6,
    unit: '/emp',
    control: 'stepper',
    step: 1,
    start: 5,
    desc: 'Add headcount beyond your plan limit.',
    benefits: ['Billed per employee', 'Prorated this cycle', 'Remove anytime'],
  },
  {
    id: 'users',
    name: 'Extra Users',
    price: 8,
    unit: '/user',
    control: 'chips',
    step: 1,
    start: 0,
    desc: 'Seats for additional staff logins.',
    benefits: ['Role-based access', 'Activity logs', 'Quick add +1 / +5 / +10'],
  },
  {
    id: 'payroll',
    name: 'Payroll Automation',
    price: 49,
    unit: '/mo',
    control: 'toggle',
    desc: 'Automated payroll runs and filings.',
    benefits: ['Auto pay schedules', 'Direct deposit', 'Tax-ready exports'],
  },
  {
    id: 'tax',
    name: 'Tax Filing',
    price: 79,
    unit: '/mo',
    control: 'toggle',
    desc: 'Managed sales & payroll tax filing.',
    benefits: ['Agency e-file', 'Deadline reminders', 'Audit trail'],
  },
  {
    id: 'ai',
    name: 'AI Credits',
    price: 20,
    unit: '/1k',
    control: 'stepper',
    step: 1,
    start: 0,
    desc: 'Extra AI assistant credits, per 1,000.',
    benefits: ['Document insights', 'Smart categorization', 'Never expires this cycle'],
  },
  {
    id: 'support',
    name: 'Premium Support',
    price: 99,
    unit: '/mo',
    control: 'toggle',
    desc: '24/7 priority support with an SLA.',
    benefits: ['1-hour response', 'Dedicated channel', 'Onboarding help'],
  },
  {
    id: 'storage',
    name: 'Extra Storage',
    price: 10,
    unit: '/10GB',
    control: 'stepper',
    step: 1,
    start: 0,
    desc: 'Additional document storage, per 10GB.',
    benefits: ['Encrypted at rest', 'Unlimited retention', 'Fast retrieval'],
  },
];

/* ---- coupon ---- */
export const COUPON = { code: 'BALANZIFY20', label: '20% off for 3 months', off: 0.2 };

/* ---- offers ---- */
export const offers = [
  { id: 'annual', title: 'Switch to annual & save 20%', desc: 'Lock in a lower rate for the year.', cta: 'Switch' },
  { id: 'payroll', title: 'Upgrade to Growth, Payroll 50% off', desc: 'For your first 3 months on Growth.', cta: 'Claim' },
];

/* ---- referral ---- */
export const referral = {
  link: 'https://balanzify.com/ref/JUMA-2026',
  perConversion: 50,
  invited: 7,
  converted: 2,
  credits: 100,
};

export const referralRows = [
  { company: 'Northwind Traders', date: 'May 12, 2026', reward: 50, status: 'Paid' as const },
  { company: 'Acme Logistics', date: 'May 28, 2026', reward: 50, status: 'Approved' as const },
  { company: 'Brightside Cafe', date: 'Jun 02, 2026', reward: 50, status: 'Pending' as const },
  { company: 'Delta Build Group', date: 'Jun 06, 2026', reward: 50, status: 'Pending' as const },
];

/* ---- invoices ---- */
export const invoices = [
  { no: 'INV-2026-0712', period: 'Jul 08 – Aug 07, 2026', plan: 'Starter', amount: 180, status: 'Paid' as const, base: 150, overage: 30 },
  { no: 'INV-2026-0611', period: 'Jun 08 – Jul 07, 2026', plan: 'Starter', amount: 150, status: 'Paid' as const, base: 150, overage: 0 },
  { no: 'INV-2026-0510', period: 'May 08 – Jun 07, 2026', plan: 'Starter', amount: 150, status: 'Paid' as const, base: 150, overage: 0 },
  { no: 'INV-2026-0408', period: 'Apr 08 – May 07, 2026', plan: 'Trial', amount: 0, status: 'Trial' as const, base: 0, overage: 0 },
];

/* ---- comparison table (11 module rows) ---- */
// cell: true = included, false = not included, string = label
export const comparisonRows: { label: string; cells: [boolean | string, boolean | string, boolean | string, boolean | string] }[] = [
  { label: 'Accounting Core', cells: [true, true, true, true] },
  { label: 'Sales & Invoicing', cells: [true, true, true, true] },
  { label: 'Expenses & Bills', cells: [true, true, true, true] },
  { label: 'Inventory', cells: [false, true, true, true] },
  { label: 'Taxes & Agencies', cells: [false, true, true, true] },
  { label: 'HRIS', cells: ['Basic', true, true, true] },
  { label: 'Attendance & Leave', cells: [false, true, true, true] },
  { label: 'Payroll', cells: [false, true, true, true] },
  { label: 'Reports', cells: ['Basic', 'Advanced', 'Advanced', 'Custom'] },
  { label: 'AI Assistant', cells: ['1k', '5k', '20k', 'Unlimited'] },
  { label: 'Support Level', cells: ['Email', 'Priority', '24/7', 'Dedicated'] },
];

/* ---- past due ---- */
export const pastDue = {
  amount: 180,
  invoice: 'INV-2026-0712',
  base: 150,
  overage: 30,
  deadline: 'July 12, 2026',
  timeline: [
    { label: 'First charge failed', date: 'Jul 08', tone: 'error' as const },
    { label: 'Auto retry failed', date: 'Jul 10', tone: 'error' as const },
    { label: 'Next retry', date: 'Jul 12', tone: 'warning' as const },
    { label: 'Suspension', date: 'after Jul 12', tone: 'pending' as const },
  ],
};
