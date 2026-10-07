'use client';

import React from 'react';
import {
  ReceiptText,
  ArrowUpRight,
  CreditCard,
  Users,
  ChevronRight,
  Gift,
  Building2,
  Wallet,
  Database,
  Sparkles,
  XCircle,
  HeartPulse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn, Badge, Card, Eyebrow, ProgressBar, IconChip, type Tone } from '../ui';
import {
  currency,
  company,
  usageRows,
  referral,
} from '../data';
import { useNav } from '../nav';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSubscriptionBillingCurrent } from '@/app/helpers/backend';

/* ------------------------------------------------------------------ *
 * Local helpers
 * ------------------------------------------------------------------ */

interface StatCardProps {
  icon: React.ElementType;
  badge: { tone: Tone; label: string };
  eyebrow: string;
  value: React.ReactNode;
  sub: string;
}

function StatCard({ icon, badge, eyebrow, value, sub }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <IconChip icon={icon} />
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <p className="mt-1 text-[30px] font-extrabold tracking-[-0.8px] text-[#16172A] [font-variant-numeric:tabular-nums]">
          {value}
        </p>
        <p className="mt-0.5 text-[13px] text-[#9A95AE]">{sub}</p>
      </div>
    </Card>
  );
}

const usageIcon: Record<string, React.ElementType> = {
  employees: Users,
  users: Users,
  branches: Building2,
  payroll: Wallet,
  storage: Database,
  ai: Sparkles,
};

// billing/current returns upper-cased metric codes (EMPLOYEE / USER / STORAGE …)
const metricIcon: Record<string, React.ElementType> = {
  EMPLOYEE: Users,
  USER: Users,
  STORAGE: Database,
  BRANCH: Building2,
  PAYROLL: Wallet,
  AI: Sparkles,
};


export default function Overview() {
  const nav = useNav();
  // Live plan/usage/billing snapshot. Mapped from GET /api/v2/we/subscriptions/billing/current.
  const { data: billing } = useFetch(['subscription-billing-current'], fetchSubscriptionBillingCurrent);

  const num = (v: any) => Number(v ?? 0) || 0;
  const pretty = (s?: string | null) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const apiLimits: Record<string, any> | undefined = billing?.limits;
  const apiUsage: Record<string, any> | undefined = billing?.usage;
  const preview = billing?.preview;

  const METRIC_META: Record<string, { label: string; unit: string }> = {
    EMPLOYEE: { label: 'Employees', unit: '' },
    USER: { label: 'Users', unit: '' },
    STORAGE: { label: 'Storage', unit: 'GB' },
    BRANCH: { label: 'Branches', unit: '' },
    PAYROLL: { label: 'Payroll runs', unit: '' },
    AI: { label: 'AI credits', unit: '' },
  };
  const METRIC_ORDER = ['EMPLOYEE', 'USER', 'STORAGE', 'BRANCH', 'PAYROLL', 'AI'];
  const rank = (k: string) => {
    const i = METRIC_ORDER.indexOf(k);
    return i < 0 ? 99 : i;
  };

  // Usage rows built from limits + usage maps; falls back to placeholders pre-load.
  const apiUsageRows = apiLimits
    ? Object.keys(apiLimits)
        .sort((a, b) => rank(a) - rank(b))
        .map((code) => {
          const lim = apiLimits[code] || {};
          const used = num(apiUsage?.[code]);
          const limit = num(lim.included_quantity);
          const overPrice = num(lim.overage_unit_price);
          const over = used - limit;
          const note = over > 0 && overPrice > 0 ? `${currency(over * overPrice)} overage` : undefined;
          const meta = METRIC_META[code] || { label: code, unit: '' };
          return { id: code, label: meta.label, used, limit, unit: meta.unit, note };
        })
    : usageRows;
  const overCount = apiUsageRows.filter((r) => r.used > r.limit).length;

  // Stat values
  const hasEmp = !!apiLimits?.EMPLOYEE;
  const hasUsr = !!apiLimits?.USER;
  const empUsed = num(apiUsage?.EMPLOYEE);
  const empLimit = num(apiLimits?.EMPLOYEE?.included_quantity);
  const usrUsed = num(apiUsage?.USER);
  const usrLimit = num(apiLimits?.USER?.included_quantity);
  const empOver = empUsed - empLimit;
  const usrOver = usrUsed - usrLimit;
  const empOverFlag = hasEmp ? empOver > 0 : true;
  const usrOverFlag = hasUsr ? usrOver > 0 : false;

  // Plan / lifecycle
  const planName = billing?.plan?.title ?? 'Starter';
  const statusLabel = pretty(billing?.status) || 'Active';
  const billingFreq = pretty(billing?.plan?.billing_frequency) || company.cycle;
  const planCurrency = billing?.plan?.currency ?? company.currency;
  const renews = fmtDate(billing?.billing_period?.end ?? billing?.lifecycle?.current_period_end);

  // Billing math (from preview)
  const baseLine = Array.isArray(preview?.lines)
    ? preview.lines.find((l: any) => l.line_type === 'BASE')
    : undefined;
  const monthlyPrice = preview ? num(baseLine?.amount ?? preview.subtotal) : 150;
  const projectedTotal = preview ? num(preview.total) : 180;
  const summaryLines: { label: string; value: number }[] = preview
    ? [
        ...(Array.isArray(preview.lines)
          ? preview.lines.map((l: any) => ({
              label: l.description ?? l.line_type ?? '',
              value: num(l.amount),
            }))
          : []),
        { label: 'Tax', value: num(preview.tax_total) },
      ]
    : [
        { label: 'Base plan · Starter', value: 150 },
        { label: 'Extra employees · 5 × $6', value: 30 },
        { label: 'Coupon discount', value: 0 },
        { label: 'Tax', value: 0 },
      ];

  return (
    <div className="space-y-[22px]">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.8px] text-[#16172A]">
            Subscription Overview
          </h1>
          <p className="mt-1 max-w-[720px] text-[15px] font-medium leading-[1.5] text-[#6F6A85]">
            Manage your plan, monitor usage limits, review billing projections, and keep your
            account in good standing — all from one place.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <Btn
            variant="secondary"
            icon={ReceiptText}
            onClick={() => nav.go('invoices')}
          >
            Statement
          </Btn>
          <Btn
            variant="primary"
            iconRight={ArrowUpRight}
            onClick={() => nav.go('plans')}
          >
            Upgrade Plan
          </Btn>
        </div>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CreditCard}
          badge={{ tone: 'success', label: statusLabel }}
          eyebrow="Current Plan"
          value={planName}
          sub={`${billingFreq} · renews ${renews}`}
        />
        <StatCard
          icon={ReceiptText}
          badge={{ tone: 'info', label: 'Projected' }}
          eyebrow="Next Invoice"
          value={currency(projectedTotal)}
          sub={`Due ${renews}`}
        />
        <StatCard
          icon={Users}
          badge={{
            tone: empOverFlag ? 'warning' : 'success',
            label: empOverFlag ? 'Over Limit' : 'Within Limit',
          }}
          eyebrow="Employees"
          value={hasEmp ? `${empUsed} / ${empLimit}` : '30 / 25'}
          sub={
            hasEmp
              ? empOver > 0
                ? `${empOver} over limit`
                : 'Within plan limit'
              : '5 over limit'
          }
        />
        <StatCard
          icon={Users}
          badge={{
            tone: usrOverFlag ? 'warning' : 'success',
            label: usrOverFlag ? 'Over Limit' : 'Within Limit',
          }}
          eyebrow="Users"
          value={hasUsr ? `${usrUsed} / ${usrLimit}` : '8 / 10'}
          sub={
            hasUsr
              ? usrOver > 0
                ? `${usrOver} over limit`
                : 'Within plan limit'
              : 'Within plan limit'
          }
        />
      </div>

      {/* ── Plan hero card ── */}
      <div className="overflow-hidden rounded-2xl shadow-[0_2px_8px_rgba(22,23,42,.10),0_24px_56px_-20px_rgba(22,23,42,.22)]">
        <div className="grid lg:grid-cols-[1fr_380px]">
          {/* LEFT: dark gradient panel */}
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#13142a,#2a1f55)] p-7 text-white">
            {/* Decorative glow orb */}
            <span
              className="pointer-events-none absolute -right-16 -top-16 h-[340px] w-[340px] rounded-full"
              style={{
                background: 'radial-gradient(circle,#7C4DFF55,transparent 70%)',
              }}
            />

            {/* Plan name + badge */}
            <Eyebrow>
              <span className="text-white/60">Your Plan</span>
            </Eyebrow>
            <div className="mt-3 flex items-center gap-3">
              <h2 className="text-[34px] font-extrabold tracking-[-1px]">{planName}</h2>
              <Badge tone="success">{statusLabel}</Badge>
            </div>

            {/* Price */}
            <p className="mt-2">
              <span className="text-[40px] font-extrabold tracking-[-1.2px] [font-variant-numeric:tabular-nums]">
                {currency(monthlyPrice)}
              </span>
              <span className="ml-1.5 text-[16px] font-medium text-white/60">
                / {billingFreq.toLowerCase() === 'annual' ? 'year' : 'month'}
              </span>
            </p>

            {/* Fact grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Renews', value: renews },
                { label: 'Billing', value: `${billingFreq} · ${planCurrency}` },
                { label: 'Next charge', value: currency(projectedTotal) },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-white/45">
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-[14.5px] font-semibold text-white [font-variant-numeric:tabular-nums]">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Btn variant="primary" onClick={() => nav.go('plans')}>
                Upgrade Plan
              </Btn>
              <button
                onClick={() => nav.go('addons')}
                className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-white/10 px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-white/20"
              >
                Buy Add-ons
              </button>
              <button
                onClick={() => nav.go('payment')}
                className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-white/10 px-5 text-[14.5px] font-semibold text-white transition-colors hover:bg-white/20"
              >
                Manage Payment
              </button>
            </div>
          </div>

          {/* RIGHT: recommendation panel */}
          <div className="bg-[#E9E5F5] p-7 flex flex-col gap-4">
            <div>
              <Eyebrow>
                <span className="text-[#7C4DFF]">Smart Recommendation</span>
              </Eyebrow>
              <h3 className="mt-2 text-[18px] font-extrabold tracking-[-0.4px] text-[#16172A]">
                You&apos;re 5 employees over Starter
              </h3>
              <p className="mt-1 text-[13.5px] leading-[1.5] text-[#6F6A85]">
                Growth covers up to 100 employees at a flat rate — cheaper than paying overage
                fees on Starter each month.
              </p>
            </div>

            {/* Compare rows */}
            <div className="flex flex-col gap-2.5 mt-1">
              {/* Starter row */}
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(22,23,42,.06)]">
                <div>
                  <p className="text-[13px] font-bold text-[#16172A]">Starter</p>
                  <p className="text-[12px] text-[#9A95AE]">projected (with overage)</p>
                </div>
                <p className="text-[18px] font-extrabold text-[#16172A] [font-variant-numeric:tabular-nums]">
                  {currency(180, 0)}
                </p>
              </div>

              {/* Growth row */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: '#EEE9FF',
                  border: '1.5px solid #7C4DFF',
                }}
              >
                <div>
                  <p className="text-[13px] font-bold text-[#7C4DFF]">Growth</p>
                  <p className="text-[12px] text-[#7C4DFF]/60">flat rate · no overage</p>
                </div>
                <p className="text-[18px] font-extrabold text-[#7C4DFF] [font-variant-numeric:tabular-nums]">
                  {currency(250, 0)}
                </p>
              </div>
            </div>

            <Btn
              variant="dark"
              iconRight={ChevronRight}
              className="w-full mt-auto"
              onClick={() => nav.go('plans')}
            >
              Compare Plans
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Usage + Billing ── */}
      <div className="grid gap-[22px] lg:grid-cols-[1.55fr_1fr]">
        {/* Usage Monitor */}
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="text-[18px] font-extrabold text-[#16172A]">Usage Monitor</h3>
            <Badge tone={overCount > 0 ? 'warning' : 'success'}>
              {overCount > 0
                ? `${overCount} metric${overCount > 1 ? 's' : ''} over limit`
                : 'All within limits'}
            </Badge>
          </div>

          <div className="divide-y divide-[rgba(22,23,42,0.07)]">
            {apiUsageRows.map((row) => {
              const RowIcon = metricIcon[row.id] ?? usageIcon[row.id] ?? Database;
              const isOver = row.used > row.limit;
              return (
                <div key={row.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-[14px] font-semibold text-[#16172A]">
                      <RowIcon className="h-4 w-4 text-[#7C4DFF]" />
                      {row.label}
                    </span>
                    <span
                      className={cn(
                        'text-[13.5px] font-semibold [font-variant-numeric:tabular-nums]',
                        isOver ? 'text-[#EF4444]' : 'text-[#6F6A85]'
                      )}
                    >
                      {row.used}
                      {row.unit} / {row.limit}
                      {row.unit}
                      {row.note && (
                        <span className="ml-2 font-bold text-[#EF4444]">· {row.note}</span>
                      )}
                    </span>
                  </div>
                  <ProgressBar used={row.used} limit={row.limit} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-[22px]">
          {/* Billing Summary */}
          <Card>
            <h3 className="text-[18px] font-extrabold text-[#16172A] mb-4">Billing Summary</h3>
            <div className="divide-y divide-[rgba(22,23,42,0.07)]">
              {summaryLines.map((line) => (
                <div key={line.label} className="flex items-center justify-between py-2.5">
                  <span className="text-[13.5px] font-medium text-[#6F6A85]">{line.label}</span>
                  <span className="text-[13.5px] font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                    {currency(line.value)}
                  </span>
                </div>
              ))}
            </div>

            {/* Projected total */}
            <div className="mt-1 border-t border-dashed border-[#D8D2EC] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-[#16172A]">Projected total</span>
                <span className="text-[22px] font-extrabold text-[#16172A] [font-variant-numeric:tabular-nums]">
                  {currency(projectedTotal)}
                </span>
              </div>
            </div>

            {/* Info note */}
            <div className="mt-3 rounded-lg bg-[#E6EEFE] px-3 py-2">
              <p className="text-[13px] font-semibold text-[#1d4ed8]">
                {renews === '—' ? 'Finalizes at period end' : `Finalizes ${renews}`}
              </p>
            </div>
          </Card>

          {/* Referral Credits */}
          <div className="rounded-2xl bg-[linear-gradient(135deg,#7C4DFF,#5A2BE0)] p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Gift className="h-5 w-5 text-white" />
              </span>
              <Badge tone="success">${referral.credits} earned</Badge>
            </div>
            <h3 className="text-[20px] font-extrabold tracking-[-0.4px]">Referral Credits</h3>
            <p className="mt-1 text-[13.5px] leading-[1.5] text-white/75">
              You&apos;ve referred {referral.invited} companies and earned{' '}
              <span className="font-bold text-white">{currency(referral.credits, 0)}</span> in
              credits. Keep sharing to unlock more savings.
            </p>
            <div className="mt-5">
              <Btn
                variant="secondary"
                iconRight={ChevronRight}
                className="bg-white text-[#7C4DFF] hover:bg-white/90 ring-0 shadow-none"
                onClick={() => nav.go('referral')}
              >
                Referral Center
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center gap-6 mt-8 pt-4 border-t border-[rgba(22,23,42,0.07)]">
        <button
          onClick={() => nav.openModal('cancellation')}
          className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#6F6A85] transition-colors hover:text-[#EF4444]"
        >
          <XCircle className="h-4 w-4" />
          Cancel subscription
        </button>
        <button
          onClick={() => nav.go('pastdue')}
          className="flex items-center gap-1.5 text-[13.5px] font-medium text-[#6F6A85] transition-colors hover:text-[#7C4DFF]"
        >
          <HeartPulse className="h-4 w-4" />
          View account health
        </button>
      </div>
    </div>
  );
}
