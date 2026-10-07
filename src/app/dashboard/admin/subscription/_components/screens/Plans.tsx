'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Minus,
  Lock,
  RefreshCw,
  LifeBuoy,
  MoveRight,
  ShieldCheck,
} from 'lucide-react';
import {
  fetchPublicSubscriptions,
  fetchPublicSubscriptionsPrices,
  fetchSubscriptionBillingCurrent,
} from '@/app/helpers/backend';
import { runBillingPreview, runCheckout, startStripeCheckout } from '../checkoutFlow';
import { cn } from '@/lib/utils';
import { Btn, Badge, Card, Segmented } from '../ui';
import { PLANS, planById, currency, comparisonRows, company } from '../data';
import { useNav } from '../nav';
import { useFetch } from '@/app/helpers/hooks';
import { Drawer } from '../overlays';

/* ------------------------------------------------------------------ *
 * Public plan catalog helpers (GET /public/subscription-plans).
 * Feature bullets are derived from the is_* flags on each plan.
 * ------------------------------------------------------------------ */
const FEATURE_LABELS: [string, string][] = [
  // company features
  ['is_chart_of_account', 'Chart of Accounts'],
  ['is_chart_of_account_tree', 'COA Tree'],
  ['is_journal_entry', 'Journal Entry'],
  ['is_bank_transaction', 'Bank Transactions'],
  ['is_sales', 'Sales & Invoicing'],
  ['is_customer', 'Customers'],
  ['is_inventory', 'Inventory'],
  ['is_warehouse', 'Warehouses'],
  ['is_expense', 'Expenses & Bills'],
  ['is_supplier_management', 'Supplier Management'],
  ['is_standard_report', 'Reports'],
  ['is_agency_tax', 'Taxes & Agencies'],
  ['is_employees', 'Employees'],
  ['is_payroll', 'Payroll'],
  ['is_attendance', 'Attendance & Leave'],
  ['is_punch_data_import', 'Punch Data Import'],
  ['is_multicurrency', 'Multi-currency'],
  ['is_company_setting', 'Company Settings'],
  ['is_audit_log', 'Audit Logs'],
  ['is_attachment', 'Attachments'],
  ['is_user_role_management', 'Roles & Permissions'],
  ['is_terms', 'Terms'],
  ['is_payment_management', 'Payments'],
  ['is_configuration', 'Configuration'],
  ['is_user_profile', 'User Profile'],
  ['is_support_ticket', 'Support Tickets'],
  ['is_ai_finzify', 'AI Assistant'],
  // accountant features
  ['is_monthly_bookkeeping_and_reconciliations', 'Monthly bookkeeping & reconciliations'],
  ['is_reports', 'Financial reports'],
  ['is_annual_tax_filing', 'Annual tax filing'],
  ['is_1099_preparation_filing', '1099 preparation & filing'],
  ['is_30_minute_consultation_per_quarter', '30-min quarterly consultation'],
  ['is_monthly_or_biweekly_payroll_processing', 'Monthly / biweekly payroll'],
  ['is_quarterly_tax_planning_reviews', 'Quarterly tax planning'],
  ['is_budgeting_and_cash_flow_forecasting', 'Budgeting & cash-flow forecasting'],
  ['is_sales_tax_filing', 'Sales tax filing'],
  ['is_unlimited_email_support', 'Unlimited email support'],
  ['is_dedicated_accountant', 'Dedicated accountant'],
  ['is_Virtual_CFO_services', 'Virtual CFO services'],
  ['is_financial_modeling_and_custom_dashboards', 'Financial modeling & dashboards'],
  ['is_investo_ready_financial_statements', 'Investor-ready statements'],
  ['is_audit_support_and_representation', 'Audit support & representation'],
  ['is_year_end_planning_for_tax_minimization', 'Year-end tax planning'],
  ['is_multi_entity_or_multi_state_handling', 'Multi-entity / multi-state'],
  ['is_priority_support', 'Priority support'],
];

const planFeatures = (plan: any): string[] => {
  const out: string[] = [];
  if (plan?.user_limit != null) out.push(`${plan.user_limit} user${plan.user_limit === 1 ? '' : 's'}`);
  if (plan?.storage_limit != null) out.push(`${plan.storage_limit}GB storage`);
  if (plan?.trial_period) out.push(`${plan.trial_period}-day free trial`);
  for (const [key, label] of FEATURE_LABELS) if (plan?.[key]) out.push(label);
  return out;
};

// Pick the price row matching the selected billing cycle (else the first row).
const pickPriceRow = (rows: any[], cycle: 'monthly' | 'annual') => {
  if (!rows?.length) return undefined;
  const key = cycle === 'annual' ? 'ANNUAL' : 'MONTHLY';
  return rows.find((r) => r.billing_frequency === key) ?? rows[0];
};

// Net price after a FLAT or PERCENT discount.
const netPrice = (row: any): number => {
  if (!row) return 0;
  const price = Number(row.price ?? 0) || 0;
  const discount = Number(row.discount ?? 0) || 0;
  if (!discount) return price;
  return row.discount_kind === 'PERCENT'
    ? Math.max(0, price * (1 - discount / 100))
    : Math.max(0, price - discount);
};

const money = (n: number) => currency(n, n % 1 === 0 ? 0 : 2);

/* ------------------------------------------------------------------ *
 * Plan card — fetches its own price by slug.
 * ------------------------------------------------------------------ */
function PlanCard({
  plan,
  cycle,
  isCurrent,
  onUpgrade,
}: {
  plan: any;
  cycle: 'monthly' | 'annual';
  isCurrent: boolean;
  onUpgrade: (plan: any) => void;
}) {
  const nav = useNav();
  const { data: pricesResp } = useFetch(
    ['plan-prices', plan.slug],
    fetchPublicSubscriptionsPrices,
    {},
    {},
    plan.slug
  );
  const rows = pricesResp?.results ?? [];
  const row = pickPriceRow(rows, cycle);
  const hasPrice = !!row;
  const gross = Number(row?.price ?? 0) || 0;
  const net = netPrice(row);
  const freqLabel = (row?.billing_frequency ?? 'MONTHLY') === 'ANNUAL' ? '/yr' : '/mo';
  const features = planFeatures(plan);
  const shown = features.slice(0, 8);
  const extra = features.length - shown.length;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(22,23,42,.04),0_18px_40px_-24px_rgba(22,23,42,.26)]',
        isCurrent ? 'border-[#7C4DFF] ring-1 ring-[#7C4DFF]/40' : 'border-white/90'
      )}
    >
      {/* Top: name + badge */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-[18px] font-extrabold tracking-[-0.3px] text-[#16172A]">{plan.title}</h3>
        {isCurrent ? (
          <Badge tone="neutral">Current Plan</Badge>
        ) : plan.trial_period ? (
          <Badge tone="primary">{plan.trial_period}-day trial</Badge>
        ) : null}
      </div>

      {/* Description */}
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[#6F6A85]">
        {plan.description || plan.note || '—'}
      </p>

      {/* Price */}
      <div className="mt-5">
        {hasPrice ? (
          <>
            <div className="flex items-end gap-1">
              <span className="text-[42px] font-extrabold tracking-[-1.4px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {money(net)}
              </span>
              <span className="mb-2.5 text-[14px] text-[#9A95AE]">{freqLabel}</span>
            </div>
            {net < gross && (
              <p className="text-[13px] text-[#9A95AE] line-through [font-variant-numeric:tabular-nums]">
                {money(gross)}
                {freqLabel}
              </p>
            )}
          </>
        ) : (
          <p className="text-[42px] font-extrabold tracking-[-1.4px] text-[#16172A]">Custom</p>
        )}
      </div>

      {/* Meta line */}
      <p className="mt-2 text-[11.5px] text-[#9A95AE]">
        {plan.currency ?? 'USD'} · {plan.kind === 'ACCOUNTANT_SUBSCRIPTION' ? 'Accountant plan' : 'Company plan'}
      </p>

      {/* Divider */}
      <div className="my-5 h-px bg-[rgba(22,23,42,0.07)]" />

      {/* Feature bullets */}
      <ul className="flex flex-1 flex-col gap-2.5">
        {shown.length === 0 && <li className="text-[13px] text-[#9A95AE]">Core features included</li>}
        {shown.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7C4DFF]" />
            <span className="text-[13px] text-[#16172A]">{feat}</span>
          </li>
        ))}
        {extra > 0 && <li className="text-[12.5px] font-semibold text-[#7C4DFF]">+ {extra} more features</li>}
      </ul>

      {/* CTA */}
      <div className="mt-6">
        {isCurrent ? (
          <Btn variant="secondary" className="w-full" disabled>
            Current Plan
          </Btn>
        ) : hasPrice ? (
          <Btn variant="primary" className="w-full" onClick={() => onUpgrade(plan)}>
            Upgrade
          </Btn>
        ) : (
          <Btn
            variant="dark"
            className="w-full"
            onClick={() => nav.toast({ tone: 'info', title: 'Sales team notified' })}
          >
            Contact Sales
          </Btn>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Plans() {
  const nav = useNav();
  const queryClient = useQueryClient();

  /* Local state */
  const [employees, setEmployees] = useState<number>(company.employees);
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  /* Live plan catalog + prices */
  const { data: plansResp } = useFetch(['public-subscription-plans'], fetchPublicSubscriptions);
  const plans: any[] = plansResp?.results ?? [];

  const { data: billing } = useFetch(['subscription-billing-current'], fetchSubscriptionBillingCurrent);
  const currentTitle: string = billing?.plan?.title ?? planById(company.planId).name;
  const isCurrentPlan = (p: any) =>
    !!p?.title && p.title.toLowerCase() === String(currentTitle).toLowerCase();

  const selectedPlan = plans.find((p) => p.slug === previewSlug) ?? null;
  // Prices for the plan selected in the drawer (for the From → To summary).
  const { data: selPricesResp } = useFetch(
    ['plan-prices-selected', previewSlug ?? ''],
    fetchPublicSubscriptionsPrices,
    {},
    { enabled: !!previewSlug },
    previewSlug ?? ''
  );
  const selNet = netPrice(pickPriceRow(selPricesResp?.results ?? [], cycle));

  // preview/checkout bodies follow SUBSCRIPTION_ENGINE.md.
  const { mutate: runPreview, data: previewData, isPending: previewLoading } = useMutation({
    mutationFn: runBillingPreview,
  });

  const { mutate: startCheckout, isPending: checkoutLoading } = useMutation({
    mutationFn: (body: Parameters<typeof runCheckout>[0]) => runCheckout(body, 'plans'),
    onSuccess: async (res) => {
      if (res?.checkout_url) {
        setConfirmingPayment(true);
        const result = await startStripeCheckout(res.checkout_url, 'plans');
        setConfirmingPayment(false);
        if (!result.usedPopup) return;
        if (result.ok) {
          queryClient.invalidateQueries({ queryKey: ['subscription-billing-current'] });
          queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });
          nav.toast({
            tone: 'success',
            title: 'Upgrade confirmed',
            msg: `You're now on ${selectedPlan?.title ?? 'your new plan'}.`,
          });
          setPreviewSlug(null);
        } else if (!result.cancelled) {
          nav.toast({
            tone: 'info',
            title: 'Still processing',
            msg: 'Payment may take a moment. Refresh if your plan does not update.',
          });
        }
        return;
      }
      nav.toast({
        tone: 'success',
        title: 'Upgrade confirmed',
        msg: `You're now on ${selectedPlan?.title ?? 'your new plan'}.`,
      });
      setPreviewSlug(null);
    },
    onError: () => nav.toast({ tone: 'error', title: 'Checkout failed', msg: 'Please try again.' }),
  });

  const openPreview = (plan: any) => {
    setPreviewSlug(plan.slug);
    runPreview({
      plan_title: plan.title,
      billing_frequency: cycle === 'annual' ? 'ANNUAL' : 'MONTHLY',
      employee_count: employees,
    });
  };

  return (
    <div className="space-y-[22px]">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.8px] text-[#16172A]">Plans</h1>
          <p className="mt-1 text-[14px] text-[#6F6A85]">
            Compare and upgrade your subscription plan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Btn variant="secondary" icon={ArrowLeft} onClick={() => nav.go('overview')}>
            Back to Overview
          </Btn>
          <Btn
            variant="dark"
            onClick={() =>
              nav.toast({
                tone: 'info',
                title: 'Sales team notified',
                msg: "We'll reach out within one business day.",
              })
            }
          >
            Talk to Sales
          </Btn>
        </div>
      </div>

      {/* ── 1. Control bar ── */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-6">
          {/* Employees slider */}
          <div className="flex min-w-[220px] flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#16172A]">Employees</span>
              <span className="text-[28px] font-extrabold tracking-[-0.8px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {employees}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={300}
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#7C4DFF]"
            />
            <p className="text-[11.5px] text-[#9A95AE]">
              Used to estimate overage on your billing preview.
            </p>
          </div>

          {/* Vertical divider */}
          <div className="hidden h-14 w-px bg-[#D8D2EC] md:block" />

          {/* Billing cycle */}
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={cycle}
              onChange={(v) => setCycle(v as 'monthly' | 'annual')}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'annual', label: 'Annual' },
              ]}
            />
            <Badge tone="success">Save 20%</Badge>
          </div>
        </div>
      </Card>

      {/* ── 2. Plan cards ── */}
      {plans.length === 0 ? (
        <Card className="py-16 text-center text-[14px] text-[#9A95AE]">Loading plans…</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              cycle={cycle}
              isCurrent={isCurrentPlan(plan)}
              onUpgrade={openPreview}
            />
          ))}
        </div>
      )}

      {/* ── 3. Comparison table ── */}
      <Card className="overflow-x-auto p-0">
        <div className="px-6 pb-4 pt-6">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.6px] text-[#6F6A85]">
            Feature Comparison
          </p>
        </div>
        <table className="w-full min-w-[560px] text-[13.5px]">
          <thead>
            <tr className="border-b border-[rgba(22,23,42,0.07)]">
              <th className="w-[200px] py-3 pl-6 text-left text-[12.5px] font-bold uppercase tracking-[0.6px] text-[#6F6A85]">
                Feature
              </th>
              {PLANS.map((plan) => {
                const isGrowthCol = plan.id === 'growth';
                const isCurrentCol = plan.id === company.planId;
                return (
                  <th
                    key={plan.id}
                    className={cn(
                      'px-4 py-3 text-center text-[13px] font-bold text-[#16172A]',
                      isGrowthCol && 'bg-[rgba(124,77,255,.05)]'
                    )}
                    style={
                      isGrowthCol
                        ? { borderTop: '3px solid #7C4DFF' }
                        : { borderTop: '3px solid transparent' }
                    }
                  >
                    <span className="block">{plan.name}</span>
                    {isGrowthCol && (
                      <span className="mt-0.5 inline-block rounded-md bg-[#EEE9FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.4px] text-[#7C4DFF]">
                        Recommended
                      </span>
                    )}
                    {isCurrentCol && !isGrowthCol && (
                      <span className="mt-0.5 inline-block rounded-md bg-[rgba(22,23,42,0.05)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.4px] text-[#6F6A85]">
                        Current
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, i) => (
              <tr
                key={row.label}
                className={cn(
                  'border-b border-[rgba(22,23,42,0.07)] last:border-0',
                  i % 2 === 1 && 'bg-[rgba(22,23,42,0.015)]'
                )}
              >
                <td className="py-3 pl-6 text-[13.5px] font-semibold text-[#16172A]">{row.label}</td>
                {row.cells.map((cell, ci) => {
                  const isGrowthCol = PLANS[ci].id === 'growth';
                  return (
                    <td
                      key={ci}
                      className={cn(
                        'px-4 py-3 text-center',
                        isGrowthCol && 'bg-[rgba(124,77,255,.05)]'
                      )}
                    >
                      {cell === true ? (
                        <Check className="mx-auto h-4 w-4 text-[#1FA97A]" />
                      ) : cell === false ? (
                        <Minus className="mx-auto h-4 w-4 text-[#9A95AE]" />
                      ) : (
                        <span className="text-[13px] font-medium text-[#16172A]">{cell}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="h-4" />
      </Card>

      {/* ── 4. Assurance row ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: RefreshCw, title: 'Cancel anytime', desc: 'No lock-ins, cancel with one click.' },
            { icon: MoveRight, title: 'Prorated billing', desc: 'Pay only for days used when switching.' },
            { icon: Lock, title: 'End-to-end encryption', desc: 'Your data is encrypted at rest and in transit.' },
            { icon: LifeBuoy, title: 'Migration help', desc: 'Our team handles your plan transition.' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-xl border border-[#E9E5F5] bg-[#F8F6FF] p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEE9FF] text-[#7C4DFF]">
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#16172A]">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-[#6F6A85]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Downgrade entry */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E5F5] bg-white px-5 py-4">
          <p className="text-[13.5px] text-[#6F6A85]">
            Need to scale down?{' '}
            <span className="font-semibold text-[#16172A]">Review a downgrade to Starter</span>
          </p>
          <Btn variant="secondary" size="sm" onClick={() => nav.openModal('downgrade')}>
            Review downgrade
          </Btn>
        </div>
      </div>

      {/* ── 5. Billing Preview Drawer ── */}
      <Drawer
        open={!!previewSlug}
        onClose={() => setPreviewSlug(null)}
        title="Billing preview"
        subtitle="Review charges before confirming"
        width={520}
        footer={
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Btn
                variant="primary"
                className="flex-1"
                disabled={checkoutLoading || confirmingPayment}
                onClick={() => {
                  if (selectedPlan) {
                    startCheckout({
                      plan_title: selectedPlan.title,
                      billing_frequency: cycle === 'annual' ? 'ANNUAL' : 'MONTHLY',
                      employee_count: employees,
                    });
                  }
                }}
              >
                {checkoutLoading || confirmingPayment ? 'Processing…' : 'Confirm Upgrade'}
              </Btn>
              <Btn variant="secondary" onClick={() => setPreviewSlug(null)}>
                Cancel
              </Btn>
            </div>
            <p className="text-center text-[11px] text-[#9A95AE]">
              <ShieldCheck className="mb-0.5 mr-1 inline h-3 w-3" />
              Secured by Balanzify Payments · PCI-DSS
            </p>
          </div>
        }
      >
        {selectedPlan && (
          <div className="space-y-5">
            {/* From → To cards */}
            <div className="flex items-center gap-3">
              <div className="flex flex-1 flex-col items-center rounded-xl border border-[#E9E5F5] bg-[#F8F6FF] px-3 py-4 text-center">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]">
                  From
                </span>
                <p className="mt-1 text-[16px] font-extrabold text-[#16172A]">{currentTitle}</p>
              </div>

              <MoveRight className="h-5 w-5 shrink-0 text-[#7C4DFF]" />

              <div className="flex flex-1 flex-col items-center rounded-xl border border-[#7C4DFF]/30 bg-[#EEE9FF] px-3 py-4 text-center">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.5px] text-[#7C4DFF]">
                  To
                </span>
                <p className="mt-1 text-[16px] font-extrabold text-[#16172A]">{selectedPlan.title}</p>
                <p className="text-[12px] font-semibold text-[#7C4DFF] [font-variant-numeric:tabular-nums]">
                  {money(selNet)}/mo
                </p>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-[#E6EEFE] px-4 py-3">
              <span className="mt-0.5 text-[#1d4ed8]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="5" r="0.75" fill="currentColor" />
                </svg>
              </span>
              <p className="text-[13px] text-[#1d4ed8]">
                Effective immediately, prorated for the remaining days in your billing cycle.
              </p>
            </div>

            {/* Charge summary */}
            <div
              className={cn(
                'overflow-hidden rounded-xl border border-[#E9E5F5] bg-white',
                previewLoading && 'opacity-60'
              )}
            >
              <div className="space-y-3 px-5 py-4">
                {(Array.isArray(previewData?.lines)
                  ? previewData.lines.map((l: any) => ({
                      label: l.description ?? l.line_type ?? '',
                      amount: Number(l.amount ?? 0) || 0,
                    }))
                  : [
                      { label: 'Current plan', amount: 150 },
                      { label: 'Prorated credit', amount: -72 },
                      { label: 'New plan prorated', amount: 120 },
                      { label: 'Overage removed', amount: -30 },
                      { label: 'Coupon', amount: 0 },
                      { label: 'Tax', amount: 0 },
                    ]
                ).map((line: { label: string; amount: number }, idx: number) => (
                  <div key={`${line.label}-${idx}`} className="flex items-center justify-between text-[13.5px]">
                    <span className="text-[#6F6A85]">{line.label}</span>
                    <span
                      className={cn(
                        '[font-variant-numeric:tabular-nums]',
                        line.amount < 0
                          ? 'font-semibold text-[#1FA97A]'
                          : line.amount === 0
                            ? 'text-[#9A95AE]'
                            : 'text-[#16172A]'
                      )}
                    >
                      {line.amount < 0
                        ? `−${currency(Math.abs(line.amount))}`
                        : currency(line.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dashed rule */}
              <div className="mx-5 border-t border-dashed border-[#D8D2EC]" />

              {/* Total */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-[14px] font-bold text-[#16172A]">Total due today</span>
                <span className="text-[24px] font-extrabold tracking-[-0.6px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                  {currency(Number(previewData?.total ?? selNet) || 0)}
                </span>
              </div>
            </div>

            {/* Next cycle note */}
            <p className="text-center text-[12.5px] text-[#6F6A85] [font-variant-numeric:tabular-nums]">
              Then{' '}
              <span className="font-semibold text-[#16172A]">{money(selNet)}/mo</span> starting next
              billing cycle.
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
