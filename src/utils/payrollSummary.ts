/**
 * Single source of truth for turning a run's saved payroll components into the
 * money figures every screen prints.
 *
 * Before this module the review screen (Run-payroll2's `totalTaxCalculate`) and
 * the pay stub (`previewpayroll` -> paystab) each re-derived gross, net and
 * employer cost from different inputs, so the same run showed different totals
 * on each screen and the stub's own SUMMARY block did not add up. Every caller
 * must now go through `summarisePayroll` so the arithmetic can only be stated
 * once.
 *
 * The components are exactly what `handleSave` builds and posts as
 * `payroll_components`, i.e. what the employee's stub legally reflects.
 */

export const EMPLOYEE_DEDUCTIONS = 'EMPLOYEE_DEDUCTIONS';
export const COMPANY_PAID_CONTRIBUTIONS = 'COMPANY_PAID_CONTRIBUTIONS';

/**
 * Deliberately permissive: the callers build these rows inline and carry extra
 * per-category keys (tax_type, tax_option, garnishment caps…), and a couple of
 * the tax helpers hand back `current` as a pre-formatted string. Everything that
 * matters is coerced through `round2` before it is added up.
 */
export interface PayrollComponentRow {
  payroll_category?: string;
  payroll_type?: string;
  type?: string;
  hours?: number | string;
  rate?: number | string;
  current?: number | string;
  ytd?: number | string;
  [key: string]: any;
}

export interface PayrollComponents {
  /** Salary, overtime, double overtime, PTO, holiday, bonus, commission. */
  pay?: PayrollComponentRow[];
  /** Recurring earnings configured on the employee. Part of gross. */
  earnings?: PayrollComponentRow[];
  /** Employee-side statutory withholding. */
  employee?: PayrollComponentRow[];
  /** Employer-side statutory taxes. Never reduces net pay. */
  employeer?: PayrollComponentRow[];
  /** Mixed array — split by `payroll_category`. */
  deductionContribution?: PayrollComponentRow[];
  gharnishment?: PayrollComponentRow[];
}

/** Money must round at the cent, never floor/ceil — ceiling drifts a run by dollars. */
export const round2 = (value: any): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};

export const sumCurrent = (rows?: PayrollComponentRow[]): number =>
  round2((rows || []).reduce((sum, row) => sum + (Number(row?.current) || 0), 0));

export const sumYtd = (rows?: PayrollComponentRow[]): number =>
  round2((rows || []).reduce((sum, row) => sum + (Number(row?.ytd) || 0), 0));

const byCategory = (rows: PayrollComponentRow[] | undefined, category: string) =>
  (rows || []).filter((row) => row?.payroll_category === category);

export interface PayrollSummary {
  /** Every PAY row plus recurring earnings. The stub's "Gross Pay". */
  grossPay: number;
  employeeTaxes: number;
  employeeDeductions: number;
  garnishments: number;
  /** employeeTaxes + employeeDeductions + garnishments — what leaves the cheque. */
  totalWithheld: number;
  /** grossPay - totalWithheld. Guaranteed to balance against the stub rows. */
  netPay: number;
  employerTaxes: number;
  companyContributions: number;
  /** employerTaxes + companyContributions — never withheld from the employee. */
  employerCost: number;
  /** grossPay + employerCost — what the funding account is debited. */
  totalCost: number;
}

export function summarisePayroll(components: PayrollComponents): PayrollSummary {
  const grossPay = round2(sumCurrent(components?.pay) + sumCurrent(components?.earnings));

  const employeeTaxes = sumCurrent(components?.employee);
  const employeeDeductions = sumCurrent(
    byCategory(components?.deductionContribution, EMPLOYEE_DEDUCTIONS)
  );
  const companyContributions = sumCurrent(
    byCategory(components?.deductionContribution, COMPANY_PAID_CONTRIBUTIONS)
  );
  const garnishments = sumCurrent(components?.gharnishment);
  const employerTaxes = sumCurrent(components?.employeer);

  const totalWithheld = round2(employeeTaxes + employeeDeductions + garnishments);
  const netPay = round2(grossPay - totalWithheld);
  const employerCost = round2(employerTaxes + companyContributions);

  return {
    grossPay,
    employeeTaxes,
    employeeDeductions,
    garnishments,
    totalWithheld,
    netPay,
    employerTaxes,
    companyContributions,
    employerCost,
    totalCost: round2(grossPay + employerCost),
  };
}

/** Roll several employees' summaries into the run-level totals. */
export function aggregateSummaries(summaries: PayrollSummary[]): PayrollSummary {
  return (summaries || []).reduce<PayrollSummary>(
    (acc, s) => ({
      grossPay: round2(acc.grossPay + (s?.grossPay || 0)),
      employeeTaxes: round2(acc.employeeTaxes + (s?.employeeTaxes || 0)),
      employeeDeductions: round2(acc.employeeDeductions + (s?.employeeDeductions || 0)),
      garnishments: round2(acc.garnishments + (s?.garnishments || 0)),
      totalWithheld: round2(acc.totalWithheld + (s?.totalWithheld || 0)),
      netPay: round2(acc.netPay + (s?.netPay || 0)),
      employerTaxes: round2(acc.employerTaxes + (s?.employerTaxes || 0)),
      companyContributions: round2(acc.companyContributions + (s?.companyContributions || 0)),
      employerCost: round2(acc.employerCost + (s?.employerCost || 0)),
      totalCost: round2(acc.totalCost + (s?.totalCost || 0)),
    }),
    {
      grossPay: 0,
      employeeTaxes: 0,
      employeeDeductions: 0,
      garnishments: 0,
      totalWithheld: 0,
      netPay: 0,
      employerTaxes: 0,
      companyContributions: 0,
      employerCost: 0,
      totalCost: 0,
    }
  );
}
