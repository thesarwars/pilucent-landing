'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';
import {
  ChevronRight,
  RefreshCw,
  Receipt,
  Landmark,
  Building2,
  Briefcase,
  AlertTriangle,
  CalendarClock,
  Banknote,
  FileText,
  Archive as ArchiveIcon,
  CheckCircle2,
} from 'lucide-react';
import { fetchPayrollTaxCenter, fetchPayrollTaxCenterFilling } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import {
  Breadcrumb,
  Chip,
  IconChip,
  StatTile,
  VioletButton,
  money,
  type VioletTone,
} from '@/components/violet';
import { cn } from '@/lib/utils';
import Filling from './_components/Filling';
import TaxPaymentDrawer, { amountOf, breakdownLines } from './_components/TaxPaymentDrawer';

const TABS = [
  { key: 'pay', label: 'Payment' },
  { key: 'filing', label: 'Filing' },
  { key: 'archive', label: 'Archive' },
] as const;

type Status = 'paid' | 'overdue' | 'upcoming' | 'scheduled';

const STATUS_META: Record<Status, { label: string; tone: VioletTone; accent: string }> = {
  paid: { label: 'Paid', tone: 'success', accent: '#1FA97A' },
  overdue: { label: 'Past due', tone: 'danger', accent: '#D2483E' },
  upcoming: { label: 'Upcoming', tone: 'warn', accent: '#B97608' },
  scheduled: { label: 'Scheduled', tone: 'teal', accent: '#0E7490' },
};

const statusOf = (p: any): Status => {
  if (p?.is_paid) return 'paid';
  const due = moment(p?.due_date);
  if (!due.isValid()) return 'scheduled';
  if (due.isBefore(moment(), 'day')) return 'overdue';
  if (due.diff(moment(), 'days') <= 14) return 'upcoming';
  return 'scheduled';
};

const isFederal = (p: any) =>
  p?.tax_breakdown?.federal_income_tax !== undefined || p?.tax_breakdown?.total_federal_taxes != null;

const rowIcon = (taxType?: string) => {
  const t = `${taxType || ''}`.toLowerCase();
  if (t.includes('unemployment') || t.includes('futa')) return <Briefcase />;
  if (t.includes('federal')) return <Building2 />;
  if (t.includes('state') || t.includes('ny') || t.includes('disability')) return <Landmark />;
  return <Receipt />;
};

const fmtDate = (d?: string) => (d && moment(d).isValid() ? moment(d).format('MMM DD, YYYY') : '—');

interface Group {
  key: string;
  q: string;
  year: string;
  label: string;
  annual: boolean;
  periods: any[];
  total: number;
  due: number;
  paidCount: number;
  pastDueCount: number;
  range: string;
}

const Q_RANK: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4, Annual: 5 };

const quarterMeta = (p: any) => {
  const label = `${p?.period_label || ''}`;
  const base = p?.period_start || p?.due_date;
  const m = moment(base);
  const year = label.match(/(20\d{2})/)?.[1] || (m.isValid() ? m.format('YYYY') : '');
  const annual = /annual/i.test(label);
  const qm = label.match(/Q([1-4])/i);
  let q = '—';
  if (annual) q = 'Annual';
  else if (qm) q = `Q${qm[1]}`;
  else if (m.isValid()) q = `Q${Math.floor(m.month() / 3) + 1}`;
  return { q, year, key: `${q}-${year}`, annual };
};

const Page = () => {
  const tabParam = useSearchParams().get('tab');
  const tab = TABS.some((t) => t.key === tabParam) ? (tabParam as string) : 'pay';

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [spin, setSpin] = useState(false);
  const [drawer, setDrawer] = useState<{ open: boolean; period?: any; bulk?: any[] }>({ open: false });

  const { data, isPending, refetch } = useFetch(['tax-center'], fetchPayrollTaxCenter);
  const {
    data: filingData,
    isPending: isFilingPending,
    refetch: refetchFiling,
  } = useFetch(['tax-center-filing'], () => fetchPayrollTaxCenterFilling(), { enabled: tab === 'filing' });

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleRefresh = () => {
    setSpin(true);
    refetch();
    setTimeout(() => setSpin(false), 600);
  };

  const periods: any[] = data?.tax_periods || [];

  /* ── derived totals ──────────────────────────────────────────────────── */
  const {
    groups,
    allAmount,
    overduePeriods,
    overdueTotal,
    stateTotal,
    federalTotal,
    dueThisMonth,
    totalPeriods,
  } = useMemo(() => {
    const map = new Map<string, Group>();
    periods.forEach((p) => {
      const qm = quarterMeta(p);
      if (!map.has(qm.key)) {
        map.set(qm.key, {
          ...qm,
          label: `${qm.q} ${qm.year}`.trim(),
          periods: [],
          total: 0,
          due: 0,
          paidCount: 0,
          pastDueCount: 0,
          range: '',
        });
      }
      map.get(qm.key)!.periods.push(p);
    });

    const groups = [...map.values()]
      .map((g) => {
        const total = g.periods.reduce((s, p) => s + amountOf(p), 0);
        const paidCount = g.periods.filter((p) => p.is_paid).length;
        const due = g.periods.filter((p) => !p.is_paid).reduce((s, p) => s + amountOf(p), 0);
        const pastDueCount = g.periods.filter((p) => statusOf(p) === 'overdue').length;
        const starts = g.periods.map((p) => p.period_start).filter(Boolean).sort();
        const ends = g.periods.map((p) => p.period_end).filter(Boolean).sort();
        const range =
          starts.length && ends.length
            ? `${moment(starts[0]).format('MMM D')} – ${moment(ends[ends.length - 1]).format('MMM D, YYYY')}`
            : '';
        return { ...g, total, paidCount, due, pastDueCount, range };
      })
      .sort((a, b) =>
        a.year !== b.year ? (a.year < b.year ? -1 : 1) : (Q_RANK[a.q] ?? 99) - (Q_RANK[b.q] ?? 99),
      );

    const allAmount = periods.reduce((s, p) => s + amountOf(p), 0);
    const overduePeriods = periods.filter((p) => statusOf(p) === 'overdue');
    const overdueTotal = overduePeriods.reduce((s, p) => s + amountOf(p), 0);
    const stateTotal = periods.filter((p) => !isFederal(p)).reduce((s, p) => s + amountOf(p), 0);
    const federalTotal = periods.filter((p) => isFederal(p)).reduce((s, p) => s + amountOf(p), 0);
    const dueThisMonth = periods
      .filter((p) => !p.is_paid && moment(p.due_date).isValid() && moment(p.due_date).isSame(moment(), 'month'))
      .reduce((s, p) => s + amountOf(p), 0);

    return {
      groups,
      allAmount,
      overduePeriods,
      overdueTotal,
      stateTotal,
      federalTotal,
      dueThisMonth,
      totalPeriods: data?.total_periods ?? periods.length,
    };
  }, [periods, data?.total_periods]);

  const overdueCount = overduePeriods.length;
  const splitDenom = stateTotal + federalTotal || 1;
  const stateW = (stateTotal / splitDenom) * 100;

  /* ── tabs / header ───────────────────────────────────────────────────── */
  const header = (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Payroll Tax Center' },
        ]}
      />
      <div className="flex animate-v-rise flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
          Payroll Tax Center
        </h1>
        {overdueCount > 0 && (
          <Chip tone="danger" dot>
            {overdueCount} {overdueCount === 1 ? 'payment' : 'payments'} past due
          </Chip>
        )}
        <span className="flex-1" />
        <VioletButton
          variant="secondary"
          leftIcon={<RefreshCw className={cn('h-4 w-4 transition-transform', spin && 'rotate-[360deg] duration-500')} />}
          onClick={handleRefresh}
        >
          Refresh
        </VioletButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/hris/payroll/payroll_tax?tab=${t.key}`}
              className={cn(
                'rounded-full px-4 py-2 text-[13px] font-bold transition-colors',
                active
                  ? 'bg-v-ink900 text-white shadow-v-btn'
                  : 'border border-v-border bg-white text-v-ink500 hover:text-v-ink900',
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 pb-10 font-jakarta">
        {header}
        <div className="flex h-64 items-center justify-center rounded-v-card bg-white shadow-v-card">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-v-tint100 border-t-v-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {header}

      {tab === 'pay' && (
        <>
          {/* hero + stats */}
          <div
            className="grid animate-v-rise items-stretch gap-3.5 lg:grid-cols-[320px_1fr]"
            style={{ animationDelay: '0.06s' }}
          >
            {/* dark liability hero */}
            <div
              className="relative overflow-hidden rounded-v-card p-[22px] text-white"
              style={{ backgroundImage: 'linear-gradient(135deg,#211B38,#463481,#6E4BE0)' }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-[60px] -top-[60px] h-[180px] w-[180px] animate-v-float rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.42), transparent 70%)' }}
              />
              <div className="relative">
                <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white/55">
                  Total Tax Liability
                </div>
                <div className="mt-1.5 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(allAmount)}
                </div>
                <div className="mt-1.5 text-[12px] text-white/60">
                  {totalPeriods} tax periods · {overdueCount} past due
                </div>

                {/* state / federal split bar */}
                <div className="mt-4 flex h-[7px] overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full animate-v-grow origin-left bg-[#A78BFF]"
                    style={{ width: `${stateW}%` }}
                  />
                  <div className="h-full flex-1 bg-[#F77FA1]" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11.5px] text-white/70">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#A78BFF]" />
                    State
                    <span className="font-bold tabular-nums text-white/95">{money(stateTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11.5px] text-white/70">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-[#F77FA1]" />
                    Federal
                    <span className="font-bold tabular-nums text-white/95">{money(federalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2×2 stat grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <StatTile
                icon={<AlertTriangle />}
                tone="danger"
                value={money(overdueTotal)}
                label="Past due"
                sub={`${overdueCount} ${overdueCount === 1 ? 'payment' : 'payments'}`}
                bar={allAmount ? (overdueTotal / allAmount) * 100 : 0}
                delay={0.08}
              />
              <StatTile
                icon={<CalendarClock />}
                tone="warn"
                value={money(dueThisMonth)}
                label="Due this month"
                bar={allAmount ? (dueThisMonth / allAmount) * 100 : 0}
                delay={0.12}
              />
              <StatTile
                icon={<Landmark />}
                tone="violet"
                value={money(stateTotal)}
                label="State taxes"
                bar={stateW}
                delay={0.16}
              />
              <StatTile
                icon={<Building2 />}
                tone="teal"
                value={money(federalTotal)}
                label="Federal taxes"
                bar={allAmount ? (federalTotal / allAmount) * 100 : 0}
                delay={0.2}
              />
            </div>
          </div>

          {/* tax payments card */}
          <div
            className="animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card"
            style={{ animationDelay: '0.1s' }}
          >
            {/* card header */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
              <IconChip tone="violet">
                <Receipt />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-v-ink900">Tax Payments</div>
                <div className="text-[11.5px] text-v-ink400">Manage your payroll tax obligations</div>
              </div>
              <span className="flex-1" />
              {overdueCount > 0 && (
                <VioletButton
                  className="bg-[#1FA97A] text-white shadow-none hover:bg-[#188f67]"
                  leftIcon={<Banknote className="h-4 w-4" />}
                  onClick={() => setDrawer({ open: true, bulk: overduePeriods })}
                >
                  Pay all due · {money(overdueTotal)}
                </VioletButton>
              )}
              <Chip tone="violet">
                {totalPeriods} {totalPeriods === 1 ? 'period' : 'periods'}
              </Chip>
            </div>

            {/* quarterly tree */}
            {groups.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                <IconChip tone="violet" size="lg">
                  <Receipt />
                </IconChip>
                <div className="text-sm font-semibold text-v-ink900">No tax periods found</div>
                <div className="text-[13px] text-v-ink400">
                  Tax obligations will appear here once payroll is processed.
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {groups.map((g) => {
                  const gKey = `g:${g.key}`;
                  const open = expanded.has(gKey);
                  const settledPct = g.periods.length ? (g.paidCount / g.periods.length) * 100 : 0;
                  return (
                    <div key={g.key} className="border-b border-[rgba(22,23,42,0.06)] last:border-b-0">
                      {/* quarter head */}
                      <button
                        type="button"
                        onClick={() => toggle(gKey)}
                        className="flex w-full items-center gap-3 bg-v-card-subtle px-[22px] py-[15px] text-left transition-colors hover:bg-[#F2EFFA]"
                      >
                        <ChevronRight
                          className={cn('h-4 w-4 shrink-0 text-v-ink400 transition-transform', open && 'rotate-90')}
                        />
                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[10px] leading-none',
                            g.pastDueCount > 0 ? 'bg-v-danger-bg text-v-danger-fg' : 'bg-v-tint100 text-v-primary',
                          )}
                        >
                          <span className="text-[12px] font-extrabold">{g.q}</span>
                          <span className="text-[8.5px] font-bold tabular-nums opacity-70">{g.year}</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[14.5px] font-extrabold text-v-ink900">{g.label}</span>
                            {g.pastDueCount > 0 && (
                              <Chip tone="danger" dot className="px-2 py-0.5 text-[10.5px]">
                                {g.pastDueCount} past due
                              </Chip>
                            )}
                          </div>
                          <div className="truncate text-[11.5px] text-v-ink400">
                            {g.range ? `${g.range} · ` : ''}
                            {g.periods.length} {g.periods.length === 1 ? 'filing' : 'filings'}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">
                            Quarter due
                          </div>
                          <div className="text-[18px] font-extrabold tabular-nums text-v-ink900">
                            {money(g.due)}
                          </div>
                        </div>
                      </button>

                      {open && (
                        <div className="animate-v-pop">
                          {/* settled-progress meter */}
                          <div className="px-[22px] py-3">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-v-wash2">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#6EE7B7,#1FA97A)] transition-[width] duration-500"
                                style={{ width: `${settledPct}%` }}
                              />
                            </div>
                            <div className="mt-1.5 text-[11px] font-semibold text-v-ink500">
                              {g.paidCount} of {g.periods.length} settled · {Math.round(settledPct)}%
                            </div>
                          </div>

                          {/* tax rows */}
                          {g.periods.map((p, i) => {
                            const rKey = `r:${p.period_key ?? `${g.key}-${i}`}`;
                            const rOpen = expanded.has(rKey);
                            const st = statusOf(p);
                            const meta = STATUS_META[st];
                            const overdue = st === 'overdue';
                            const amount = amountOf(p);
                            const lines = breakdownLines(p);
                            const ledgerTotal = lines.reduce((s, l) => s + (Number(l.value) || 0), 0);
                            const payLabel = p.is_paid
                              ? 'Paid'
                              : `${p.tax_type || ''}`.includes('Unemployment')
                                ? 'Pay & file'
                                : 'Pay';
                            return (
                              <div
                                key={rKey}
                                className="relative border-t border-[rgba(22,23,42,0.05)]"
                              >
                                {/* tree elbow */}
                                <span
                                  aria-hidden
                                  className="absolute left-[34px] top-0 h-[28px] w-[14px] rounded-bl-[8px] border-b border-l border-[#DCD6EC]"
                                />
                                <div
                                  className="flex flex-wrap items-center gap-3 py-3 pl-[64px] pr-[22px] transition-colors hover:bg-[#FAF8FF]"
                                  style={{ boxShadow: `inset 3px 0 0 ${overdue ? '#F3C0BA' : 'transparent'}` }}
                                >
                                  <IconChip tone={meta.tone} size="lg">
                                    {rowIcon(p.tax_type)}
                                  </IconChip>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate text-[13.5px] font-extrabold text-v-ink900">
                                        {p.tax_type || 'Tax'}
                                      </span>
                                      <Chip tone={meta.tone} dot className="px-2 py-0.5 text-[10.5px]">
                                        {meta.label}
                                      </Chip>
                                    </div>
                                    <div className="truncate text-[11.5px] text-v-ink400">{p.period_label}</div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">
                                      {p.is_paid ? 'Settled' : 'Due'}
                                    </div>
                                    <div
                                      className={cn(
                                        'text-[12px] font-semibold tabular-nums',
                                        overdue ? 'text-v-danger-fg' : 'text-v-ink700',
                                      )}
                                    >
                                      {fmtDate(p.due_date)}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggle(rKey)}
                                    className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-wash2 hover:text-v-ink900"
                                    aria-label="Toggle breakdown"
                                  >
                                    <ChevronRight className={cn('h-4 w-4 transition-transform', rOpen && 'rotate-90')} />
                                  </button>

                                  <span className="h-7 w-px bg-[rgba(22,23,42,0.08)]" />

                                  <div className="w-[110px] text-right text-[18px] font-extrabold tabular-nums text-v-ink900">
                                    {money(amount)}
                                  </div>

                                  <VioletButton
                                    size="sm"
                                    disabled={p.is_paid}
                                    onClick={() => setDrawer({ open: true, period: p })}
                                    className={cn(
                                      'shadow-none',
                                      p.is_paid
                                        ? 'bg-v-success-bg text-v-success-fg hover:bg-v-success-bg'
                                        : 'bg-[#1FA97A] text-white hover:bg-[#188f67]',
                                    )}
                                    leftIcon={p.is_paid ? <CheckCircle2 className="h-3.5 w-3.5" /> : undefined}
                                  >
                                    {payLabel}
                                  </VioletButton>
                                </div>

                                {/* component / amount ledger */}
                                {rOpen && lines.length > 0 && (
                                  <div className="animate-v-pop px-[22px] pb-4 pl-[96px]">
                                    <div className="overflow-hidden rounded-[12px] border border-v-border">
                                      <div className="flex items-center justify-between bg-v-card-subtle px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.05em] text-v-ink400">
                                        <span>Component</span>
                                        <span>Amount</span>
                                      </div>
                                      <div className="divide-y divide-[rgba(22,23,42,0.06)]">
                                        {lines.map((l) => (
                                          <div
                                            key={l.label}
                                            className="flex items-center justify-between px-3.5 py-2"
                                          >
                                            <span className="flex items-center gap-2 text-[12px] text-v-ink700">
                                              <span className="h-1.5 w-1.5 rounded-full bg-v-primary" />
                                              {l.label}
                                            </span>
                                            <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
                                              {money(Number(l.value) || 0)}
                                            </span>
                                          </div>
                                        ))}
                                        <div className="flex items-center justify-between bg-v-card-subtle px-3.5 py-2.5">
                                          <span className="text-[12.5px] font-bold text-v-ink900">Total</span>
                                          <span className="text-[13px] font-extrabold tabular-nums text-v-ink900">
                                            {money(ledgerTotal)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* total liability footer */}
            {groups.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-3 px-[22px] py-4"
                style={{ backgroundImage: 'linear-gradient(120deg,#FBFAFF,#F5F1FF)' }}
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-v-ink900">Total Tax Liability</div>
                  <div className="text-[11.5px] text-v-ink400">
                    {totalPeriods} tax periods · {overdueCount} past due
                  </div>
                </div>
                <span className="flex-1" />
                <div className="text-[26px] font-extrabold tabular-nums text-v-ink900">{money(allAmount)}</div>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'filing' && (
        <div className="animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
          <Filling
            data={filingData}
            isLoading={isFilingPending}
            payQuarter="Q3"
            setPayQuarter={() => {}}
            refetchFiling={refetchFiling}
          />
        </div>
      )}

      {tab === 'archive' && (
        <div className="animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
          <div className="flex items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
            <IconChip tone="neutral">
              <ArchiveIcon />
            </IconChip>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-v-ink900">Archive</div>
              <div className="text-[11.5px] text-v-ink400">Settled tax payments</div>
            </div>
          </div>
          {periods.filter((p) => p.is_paid).length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
              <IconChip tone="neutral" size="lg">
                <FileText />
              </IconChip>
              <div className="text-sm font-semibold text-v-ink900">No settled payments yet</div>
              <div className="text-[13px] text-v-ink400">Paid tax periods will be archived here.</div>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(22,23,42,0.06)]">
              {periods
                .filter((p) => p.is_paid)
                .map((p, i) => (
                  <div key={p.period_key ?? i} className="flex items-center gap-3 px-[22px] py-3">
                    <IconChip tone="success" size="lg">
                      {rowIcon(p.tax_type)}
                    </IconChip>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-bold text-v-ink900">{p.tax_type}</div>
                      <div className="truncate text-[11.5px] text-v-ink400">{p.period_label}</div>
                    </div>
                    <Chip tone="success" dot>
                      Paid
                    </Chip>
                    <div className="w-[110px] text-right text-[15px] font-extrabold tabular-nums text-v-ink900">
                      {money(amountOf(p))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      <TaxPaymentDrawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false })}
        period={drawer.period}
        bulkPeriods={drawer.bulk}
        refetch={refetch}
      />
    </div>
  );
};

export default Page;
