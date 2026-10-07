export type AddonControl = 'stepper' | 'chips' | 'toggle';

export interface CatalogAddon {
  id: string;
  name: string;
  price: number;
  unit: string;
  control: AddonControl;
  desc: string;
}

export const CATALOG_ADDONS: CatalogAddon[] = [
  { id: 'employees', name: 'Extra Employees', price: 6, unit: '/emp', control: 'stepper', desc: 'Add headcount beyond your plan limit.' },
  { id: 'users', name: 'Extra Users', price: 8, unit: '/user', control: 'chips', desc: 'Seats for additional staff logins.' },
  { id: 'payroll', name: 'Payroll Automation', price: 49, unit: '/mo', control: 'toggle', desc: 'Automated payroll runs and filings.' },
  { id: 'tax', name: 'Tax Filing', price: 79, unit: '/mo', control: 'toggle', desc: 'Managed sales and payroll tax filing.' },
  { id: 'ai', name: 'AI Credits', price: 20, unit: '/1k', control: 'stepper', desc: 'Extra AI assistant credits, per 1,000.' },
  { id: 'support', name: 'Premium Support', price: 99, unit: '/mo', control: 'toggle', desc: '24/7 priority support with an SLA.' },
  { id: 'storage', name: 'Extra Storage', price: 10, unit: '/10GB', control: 'stepper', desc: 'Additional document storage, per 10GB.' },
];

const LIMIT_KEYS: Record<string, string> = {
  employees: 'EMPLOYEE',
  users: 'USER',
  storage: 'STORAGE',
  ai: 'AI',
};

const CODE_MAP: Record<string, string> = {
  employees: 'EMP_CAP',
  users: 'USER_SEAT',
  payroll: 'PAYROLL_AUTO',
  tax: 'PAY_TAX',
  ai: 'AI_PACK',
  support: 'PREM_SUP',
  storage: 'STORAGE',
};

const num = (v: unknown) => Number(v ?? 0) || 0;

const prettyFreq = (s?: string | null) => {
  if (!s) return 'Monthly';
  const lower = s.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const pricingModel = (control: AddonControl) => {
  if (control === 'toggle') return 'Flat';
  return 'Per unit';
};

export interface AddonTableRow {
  uid: string;
  addon: string;
  code: string;
  pricingModel: string;
  price: string;
  cycle: string;
  linkedPlans: string;
  usage: string;
  status: { label: string; tone: 'good' | 'mute' | 'warn' };
  description: string;
}

export const mapBillingToAddonRows = (
  billing: Record<string, any> | null | undefined,
  planCount = 0
): AddonTableRow[] => {
  const limits = billing?.limits ?? {};
  const usage = billing?.usage ?? {};
  const cycle = prettyFreq(billing?.plan?.billing_frequency);
  const planTitle = billing?.plan?.title ?? '—';
  const linkedLabel = planCount > 0 ? `${planTitle} · ${planCount} plans` : planTitle;

  return CATALOG_ADDONS.map(addon => {
    const limitKey = LIMIT_KEYS[addon.id];
    const lim = limitKey ? limits[limitKey] : null;
    const used = limitKey ? num(usage[limitKey]) : 0;
    const included = limitKey ? num(lim?.included_quantity) : 0;
    const overagePrice = limitKey ? num(lim?.overage_unit_price) : 0;
    const unitPrice = overagePrice > 0 ? overagePrice : addon.price;
    const extraQty = limitKey ? Math.max(0, used - included) : 0;
    const hasOverage = extraQty > 0;
    const isMetered = !!limitKey && overagePrice > 0;

    let statusLabel = 'Available';
    let statusTone: AddonTableRow['status']['tone'] = 'mute';
    if (hasOverage) {
      statusLabel = 'In use';
      statusTone = 'warn';
    } else if (isMetered || addon.control === 'toggle') {
      statusLabel = 'Active';
      statusTone = 'good';
    }

    return {
      uid: addon.id,
      addon: addon.name,
      code: CODE_MAP[addon.id] ?? addon.id.toUpperCase(),
      pricingModel: pricingModel(addon.control),
      price: `$${unitPrice}${addon.unit}`,
      cycle,
      linkedPlans: linkedLabel,
      usage: limitKey ? `${used} / ${included}` : '—',
      status: { label: statusLabel, tone: statusTone },
      description: addon.desc,
    };
  });
};

export const billingSummary = (billing: Record<string, any> | null | undefined) => {
  const limits = billing?.limits ?? {};
  const usage = billing?.usage ?? {};
  const empLimit = num(limits?.EMPLOYEE?.included_quantity);
  const usrLimit = num(limits?.USER?.included_quantity);
  const empUsed = num(usage?.EMPLOYEE);
  const usrUsed = num(usage?.USER);
  const preview = billing?.preview;
  const baseLine = Array.isArray(preview?.lines)
    ? preview.lines.find((l: { line_type?: string }) => l.line_type === 'BASE')
    : undefined;
  const basePrice = num(baseLine?.amount ?? preview?.subtotal ?? billing?.plan?.price);

  return {
    planTitle: billing?.plan?.title ?? '—',
    status: billing?.status ?? '—',
    basePrice,
    empUsed,
    empLimit,
    usrUsed,
    usrLimit,
    currency: billing?.plan?.currency ?? 'USD',
  };
};
