'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  LineChart as LineChartIcon,
  Users,
  Clock,
  UserMinus,
  CreditCard,
  Gauge,
  TicketPercent,
  Sparkles,
  Tag,
  Award,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { ADMIN, SSegmented, SLinkBtn } from '../_components/ui';
import { fetchAdminKPIs, fetchAdminPlanDistribution, fetchAdminRecentActivity, fetchAdminRevenueTrend, fetchAdminTrialFunnel } from '../../../../helpers/backend';
import { useFetch } from '@/app/helpers/hooks';


interface RevenuePoint {
  month: string;
  mrr: number | null;
  arr: number | null;
}

interface PlanSlice {
  name: string;
  value: number;
  color: string;
}

interface OveragePoint {
  month: string;
  value: number;
}

interface FunnelStep {
  label: string;
  count: number;
  pct: number;
}

interface ActivityEvent {
  id: number;
  icon: React.ReactNode;
  iconBg: string;
  actor: string;
  action: string;
  object: string;
  time: string;
  tone: 'brand' | 'bad' | 'warn' | 'good' | 'gold' | 'mute';
  href: string;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface AdminKPIs {
  mrr: string;
  arr: string;
  active_subscriptions: number;
  trialing_subscriptions: number;
  past_due_subscriptions: number;
  canceled_last_30_days: number;
  expired_last_30_days: number;
  churn_rate_30d: string;
  trials_started_30d: number;
  trials_converted_30d: number;
  trial_conversion_rate_30d: string;
  overage_revenue_30d: string;
  status_breakdown: StatusBreakdown[];
}

const toNum = (v: string | number | undefined | null): number => Number(v ?? 0) || 0;

function fmtMoney(v: string | number | undefined | null): string {
  const n = toNum(v);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtRatePct(v: string | number | undefined | null): string {
  return `${(toNum(v) * 100).toFixed(1)}%`;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface RevenueTrend {
  months: number;
  revenue: Array<{ month: string; revenue: string }>;
  mrr: Array<{ month: string; mrr: string }>;
}

interface PlanDistribution {
  total: number;
  plans: Array<{ plan_title: string; subscriber_count: number; share: string }>;
}

const PLAN_COLORS: string[] = [
  ADMIN.brand, ADMIN.violet, ADMIN.good, ADMIN.gold, ADMIN.info, ADMIN.warn, ADMIN.bad,
];

interface TrialFunnel {
  period_days: number;
  started: number;
  active: number;
  converted: number;
  expired: number;
  conversion_rate: string;
  stages: Array<{ stage: string; count: number; rate: string }>;
}

const STAGE_LABELS: Record<string, string> = {
  started: 'Trials started',
  active: 'Activated',
  converted: 'Converted',
  expired: 'Expired',
};

interface ActivityLog {
  uid: string;
  event_type: string;
  title: string;
  company_name: string | null;
  actor_name: string | null;
  new_status: string | null;
  created_at: string;
}

interface ActivityResponse {
  count: number;
  results: ActivityLog[];
}

const TONE_BG: Record<ActivityEvent['tone'], string> = {
  brand: '#ECECFE',
  bad:   '#FDE5E9',
  warn:  '#FCF1DD',
  good:  '#E2F7EF',
  gold:  '#F6EFD7',
  mute:  '#EEF0F6',
};

function activityVisual(eventType: string): { icon: React.ReactNode; tone: ActivityEvent['tone'] } {
  const t = eventType.toUpperCase();
  if (t.includes('FAIL') || t.includes('CANCEL') || t.includes('PAST_DUE'))
    return { icon: <CreditCard size={14} />, tone: 'bad' };
  if (t.includes('TRIAL'))
    return { icon: <Clock size={14} />, tone: 'warn' };
  if (t.includes('COUPON') || t.includes('DISCOUNT'))
    return { icon: <Tag size={14} />, tone: 'brand' };
  if (t.includes('REFERRAL'))
    return { icon: <Award size={14} />, tone: 'gold' };
  if (t.includes('CHECKOUT') || t.includes('SUBSCRIPTION') || t.includes('ACTIVE'))
    return { icon: <Sparkles size={14} />, tone: 'good' };
  return { icon: <Settings size={14} />, tone: 'mute' };
}

const REVENUE_DATA: RevenuePoint[] = [
  { month: 'Jul', mrr: 98,  arr: 98  * 12 },
  { month: 'Aug', mrr: 103, arr: 103 * 12 },
  { month: 'Sep', mrr: 109, arr: 109 * 12 },
  { month: 'Oct', mrr: 112, arr: 112 * 12 },
  { month: 'Nov', mrr: 116, arr: 116 * 12 },
  { month: 'Dec', mrr: 119, arr: 119 * 12 },
  { month: 'Jan', mrr: 121, arr: 121 * 12 },
  { month: 'Feb', mrr: 123, arr: 123 * 12 },
  { month: 'Mar', mrr: 124, arr: 124 * 12 },
  { month: 'Apr', mrr: 126, arr: 126 * 12 },
  { month: 'May', mrr: 127, arr: 127 * 12 },
  { month: 'Jun', mrr: 129, arr: 129 * 12 },
];

const PLAN_DATA: PlanSlice[] = [
  { name: 'Starter',    value: 142, color: ADMIN.brand  },
  { name: 'Growth',     value: 86,  color: ADMIN.violet },
  { name: 'Scale',      value: 31,  color: ADMIN.good   },
  { name: 'Enterprise', value: 12,  color: ADMIN.gold   },
];

const OVERAGE_DATA: OveragePoint[] = [
  { month: 'Jan', value: 8  },
  { month: 'Feb', value: 9  },
  { month: 'Mar', value: 11 },
  { month: 'Apr', value: 10 },
  { month: 'May', value: 12 },
  { month: 'Jun', value: 14 },
];

const FUNNEL_STEPS: FunnelStep[] = [
  { label: 'Trials started',  count: 90, pct: 100 },
  { label: 'Activated',       count: 71, pct: 79  },
  { label: 'Added payment',   count: 48, pct: 53  },
  { label: 'Converted',       count: 38, pct: 42  },
];

/* ─── Sparkline helpers (static arrays — no Date.now/Math.random) ──── */
const SP_MRR:     number[] = [98,  103, 109, 112, 116, 119, 121, 129];
const SP_ARR:     number[] = SP_MRR.map(v => v * 12);
const SP_SUBS:    number[] = [230, 238, 244, 249, 252, 257, 263, 271];
const SP_TRIALS:  number[] = [28,  30,  32,  34,  36,  35,  37,  38 ];
const SP_FAILED:  number[] = [12,  10,  9,   11,  8,   7,   8,   7  ];
const SP_OVR:     number[] = [8,   9,   11,  10,  12,  14,  13,  14 ];
const SP_COUPONS: number[] = [48,  52,  55,  58,  60,  61,  63,  64 ];

function toPolyline(data: number[], w = 64, h = 28): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function Spark({ data, color = ADMIN.brand }: { data: number[]; color?: string }) {
  const pts = toPolyline(data);
  const fillPts = `0,28 ${pts} 64,28`;
  const gradId = `spark-${color.replace('#', '')}`;
  return (
    <svg width={64} height={28} viewBox="0 0 64 28" fill="none" className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#${gradId})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E7E8F2] p-5 shadow-[0_1px_3px_rgba(16,22,46,.05)] ${className}`}>
      {children}
    </div>
  );
}

function IconTile({ icon, bg, color }: { icon: React.ReactNode; bg: string; color: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
      style={{ background: bg, color }}
    >
      {icon}
    </div>
  );
}


function TrendChip({ up, pct, invertColor = false }: { up: boolean; pct: string; invertColor?: boolean }) {
  const isGood  = invertColor ? !up : up;
  const fgColor = isGood ? ADMIN.good  : ADMIN.bad;
  const bgColor = isGood ? '#E2F7EF'  : '#FCE7EA';
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: fgColor, background: bgColor }}
    >
      {up ? '▲' : '▼'} {pct}
    </span>
  );
}


interface KpiProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  trendUp?: boolean;
  trendPct?: string;
  trendInvert?: boolean;
  context: string;
  sparkData?: number[];
  sparkColor?: string;
  href?: string;
  onNavigate?: (href: string) => void;
}

function KpiCard({
  icon, iconBg, iconColor,
  label, value,
  trendUp, trendPct, trendInvert,
  context, sparkData, sparkColor,
  href, onNavigate,
}: KpiProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <IconTile icon={icon} bg={iconBg} color={iconColor} />
        {sparkData && <Spark data={sparkData} color={sparkColor ?? iconColor} />}
      </div>
      <p className="mt-3 text-[12px] font-medium text-[#6B7090]">{label}</p>
      <p className="mt-0.5 text-[26px] font-extrabold tracking-[-0.6px] text-[#0B1020] [font-variant-numeric:tabular-nums]">
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {trendPct !== undefined && trendUp !== undefined && (
          <TrendChip up={trendUp} pct={trendPct} invertColor={trendInvert} />
        )}
        <span className="text-[12px] text-[#6B7090]">{context}</span>
      </div>
    </>
  );

  if (href && onNavigate) {
    return (
      <button
        type="button"
        onClick={() => onNavigate(href)}
        className="w-full rounded-2xl border border-[#E7E8F2] bg-white p-5 text-left shadow-[0_1px_3px_rgba(16,22,46,.05)] transition-all hover:border-[#D4D7E8] hover:shadow-[0_4px_12px_rgba(16,22,46,.08)] active:translate-y-px"
      >
        {inner}
      </button>
    );
  }

  return <Card>{inner}</Card>;
}

/* ─── Recharts tooltip ───────────────────────────────────────────────── */
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}

function ChartTooltip({ active, payload, label, prefix = '', suffix = '' }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E7E8F2] bg-white px-3 py-2 shadow-md text-[12px]">
      <p className="font-semibold text-[#0B1020]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[#5B6478]">
          {prefix}{p.value.toLocaleString()}{suffix}
        </p>
      ))}
    </div>
  );
}

/* ─── Activity feed data ─────────────────────────────────────────────── */
const TONE_COLOR: Record<string, string> = {
  brand: ADMIN.brand,
  bad:   ADMIN.bad,
  warn:  ADMIN.warn,
  good:  ADMIN.good,
  gold:  ADMIN.gold,
  mute:  '#8A93A6',
};

const ACTIVITIES: ActivityEvent[] = [
  {
    id: 1,
    icon: <Sparkles size={14} />,
    iconBg: '#ECECFE',
    actor: 'Anik Mahmud',
    action: 'published',
    object: 'Growth v2',
    time: '10:24',
    tone: 'brand',
    href: '/admin/subscription/plans',
  },
  {
    id: 2,
    icon: <CreditCard size={14} />,
    iconBg: '#FDE5E9',
    actor: 'Payment failed',
    action: '—',
    object: 'Vertex Media',
    time: '09:58',
    tone: 'bad',
    href: '/admin/subscription/invoices-payments',
  },
  {
    id: 3,
    icon: <Clock size={14} />,
    iconBg: '#FCF1DD',
    actor: 'Trial extended',
    action: '+7d —',
    object: 'Hooli',
    time: '09:12',
    tone: 'warn',
    href: '/admin/subscription/trials',
  },
  {
    id: 4,
    icon: <Tag size={14} />,
    iconBg: '#ECECFE',
    actor: 'Coupon',
    action: 'SPRINGOFF created',
    object: '',
    time: '08:40',
    tone: 'brand',
    href: '/admin/subscription/coupons-offers',
  },
  {
    id: 5,
    icon: <Award size={14} />,
    iconBg: '#F6EFD7',
    actor: 'Referral approved',
    action: '—',
    object: 'Acme',
    time: '08:05',
    tone: 'gold',
    href: '/admin/subscription/referral-program',
  },
  {
    id: 6,
    icon: <Settings size={14} />,
    iconBg: '#EEF0F6',
    actor: 'Overage rate edited',
    action: '—',
    object: 'employees',
    time: '07:30',
    tone: 'mute',
    href: '/admin/subscription/limits-metrics',
  },
];


export default function Page() {
  const router = useRouter();
  const [metric, setMetric] = useState<'mrr' | 'arr'>('mrr');
  const go = (href: string) => router.push(href);

  const { data, isPending } = useFetch(['kpis-data'], fetchAdminKPIs);
  const { data: revenueData } = useFetch(['revenue-data'], fetchAdminRevenueTrend);
  const { data: plansData } = useFetch(['plan-distribution'], fetchAdminPlanDistribution);
  const { data: funnelData } = useFetch(['trial-funnel'], fetchAdminTrialFunnel);
  const { data: activityData } = useFetch(['activity'], fetchAdminRecentActivity);
  const k = data as AdminKPIs | undefined;
  const dash = (v: string) => (isPending || !k ? '—' : v);

  /* Revenue trend → always 12 calendar months (Jan–Dec); months without
     data stay null so the axis label shows but no point/line is drawn. */
  const revenue = revenueData as RevenueTrend | undefined;
  const revenueChart: RevenuePoint[] = (() => {
    const series = revenue?.mrr ?? [];
    if (!series.length) return REVENUE_DATA;
    const year = series[series.length - 1].month.split('-')[0];
    const byMonth = new Map(series.map(p => [p.month, toNum(p.mrr)]));
    return MONTH_LABELS.map((label, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      const mrr = byMonth.has(key) ? (byMonth.get(key) as number) : null;
      return { month: label, mrr, arr: mrr === null ? null : mrr * 12 };
    });
  })();
  const revenueMonths = revenue?.months ?? 12;

  /* Plan distribution → donut slices + total */
  const plans = plansData as PlanDistribution | undefined;
  const planSlices: PlanSlice[] =
    plans?.plans?.length
      ? plans.plans.map((p, i) => ({
          name: p.plan_title,
          value: toNum(p.subscriber_count),
          color: PLAN_COLORS[i % PLAN_COLORS.length],
        }))
      : PLAN_DATA;
  const totalSubs = plans?.total ?? planSlices.reduce((acc, p) => acc + p.value, 0);

  /* Trial funnel → steps (rate is a 0–1 proportion of trials started) */
  const funnel = funnelData as TrialFunnel | undefined;
  const funnelSteps: FunnelStep[] =
    funnel?.stages?.length
      ? funnel.stages.map(s => ({
          label: STAGE_LABELS[s.stage] ?? s.stage,
          count: toNum(s.count),
          pct: Math.round(toNum(s.rate) * 100),
        }))
      : FUNNEL_STEPS;

  /* Recent activity → audit-log feed */
  const activityResults = (activityData as ActivityResponse | undefined)?.results ?? [];
  const activities: ActivityEvent[] =
    activityResults.length
      ? activityResults.map((a, i) => {
          const v = activityVisual(a.event_type);
          return {
            id: i,
            icon: v.icon,
            iconBg: TONE_BG[v.tone],
            tone: v.tone,
            actor: a.title || a.event_type,
            action: a.company_name || a.actor_name ? '—' : '',
            object: a.company_name || a.actor_name || '',
            time: (a.created_at ?? '').slice(11, 16),
            href: '/admin/subscription/audit-logs',
          };
        })
      : ACTIVITIES;

  return (
    <div className="space-y-[22px]">
        {/* ══════════════ ROW 1 — 8 KPI tiles ══════════════ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<TrendingUp size={16} />}
            iconBg="#ECECFE" iconColor={ADMIN.brand}
            label="Monthly Recurring Revenue"
            value={dash(fmtMoney(k?.mrr))}
            context="recurring"
            sparkData={SP_MRR} sparkColor={ADMIN.brand}
          />
          <KpiCard
            icon={<LineChartIcon size={16} />}
            iconBg="#E6F1FD" iconColor={ADMIN.info}
            label="Annual Recurring Revenue"
            value={dash(fmtMoney(k?.arr))}
            context="annualized"
            sparkData={SP_ARR} sparkColor={ADMIN.info}
          />
          <KpiCard
            icon={<Users size={16} />}
            iconBg="#E2F7EF" iconColor={ADMIN.good}
            label="Active Subscriptions"
            value={dash(String(toNum(k?.active_subscriptions)))}
            context="currently active"
            sparkData={SP_SUBS} sparkColor={ADMIN.good}
            href="/admin/subscription/tenant-subscriptions"
            onNavigate={go}
          />
          <KpiCard
            icon={<Clock size={16} />}
            iconBg="#FCF1DD" iconColor={ADMIN.warn}
            label="Active Trials"
            value={dash(String(toNum(k?.trialing_subscriptions)))}
            context={`${fmtRatePct(k?.trial_conversion_rate_30d)} conv. rate`}
            sparkData={SP_TRIALS} sparkColor={ADMIN.warn}
            href="/admin/subscription/trials"
            onNavigate={go}
          />
          <KpiCard
            icon={<UserMinus size={16} />}
            iconBg="#FDE5E9" iconColor={ADMIN.bad}
            label="Monthly Churn"
            value={dash(fmtRatePct(k?.churn_rate_30d))}
            context="last 30 days"
            href="/admin/subscription/tenant-subscriptions"
            onNavigate={go}
          />
          <KpiCard
            icon={<CreditCard size={16} />}
            iconBg="#FDE5E9" iconColor={ADMIN.bad}
            label="Failed Payments"
            value={dash(String(toNum(k?.past_due_subscriptions)))}
            context="past due"
            sparkData={SP_FAILED} sparkColor={ADMIN.bad}
            href="/admin/subscription/invoices-payments"
            onNavigate={go}
          />
          <KpiCard
            icon={<Gauge size={16} />}
            iconBg="#EFEAFE" iconColor={ADMIN.violet}
            label="Overage Revenue"
            value={dash(fmtMoney(k?.overage_revenue_30d))}
            context="last 30 days"
            sparkData={SP_OVR} sparkColor={ADMIN.violet}
            href="/admin/subscription/limits-metrics"
            onNavigate={go}
          />
          <KpiCard
            icon={<TicketPercent size={16} />}
            iconBg="#F6EFD7" iconColor={ADMIN.gold}
            label="Coupon Redemptions"
            value="64"
            trendUp trendPct="+9"
            context="this cycle"
            sparkData={SP_COUPONS} sparkColor={ADMIN.gold}
            href="/admin/subscription/coupons-offers"
            onNavigate={go}
          />
        </div>

        {/* ══════════════ ROW 2 — Revenue Trend + Donut ══════════════ */}
        <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          {/* Recurring Revenue Trend */}
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-bold tracking-[-0.2px] text-[#0B1020]">Recurring Revenue Trend</p>
                <p className="text-[12.5px] text-[#6B7090]">Last {revenueMonths} months</p>
              </div>
              <SSegmented
                value={metric}
                options={[
                  { id: 'mrr', label: 'MRR' },
                  { id: 'arr', label: 'ARR' },
                ]}
                onChange={setMetric}
              />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart key={metric} data={revenueChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={ADMIN.brand} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={ADMIN.brand} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#8A93A6' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A93A6' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => fmtMoney(v as number)}
                />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={ADMIN.brand}
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: ADMIN.brand, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Plan Distribution Donut */}
          <Card>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[16px] font-bold tracking-[-0.2px] text-[#0B1020]">Plan Distribution</p>
                <p className="text-[12.5px] text-[#6B7090]">Active subscriptions by plan</p>
              </div>
              <SLinkBtn onClick={() => go('/admin/subscription/plans')}>
                Manage plans
              </SLinkBtn>
            </div>
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={planSlices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {planSlices.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as PlanSlice;
                      return (
                        <div className="rounded-xl border border-[#E7E8F2] bg-white px-3 py-2 shadow-md text-[12px]">
                          <p className="font-semibold text-[#0B1020]">{d.name}</p>
                          <p className="text-[#5B6478]">{d.value} subs</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label — absolutely positioned over the donut hole */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] font-extrabold tracking-[-0.4px] text-[#0B1020] [font-variant-numeric:tabular-nums]">
                  {totalSubs}
                </span>
                <span className="text-[11px] text-[#5B6478]">total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
              {planSlices.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => go('/admin/subscription/plans')}
                  className="flex items-center gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-[#FAFAFE]"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: p.color }}
                  />
                  <span className="min-w-0 truncate text-[12px] text-[#6B7090]">{p.name}</span>
                  <span className="ml-auto font-mono text-[12px] font-semibold text-[#0B1020] [font-variant-numeric:tabular-nums]">
                    {p.value}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* ══════════════ ROW 3 — Overage · Funnel · Activity ══════════════ */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Overage Revenue Bar Chart */}
          <Card>
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[16px] font-bold tracking-[-0.2px] text-[#0B1020]">Overage Revenue</p>
                <p className="text-[12.5px] text-[#6B7090]">Last 6 months ($k)</p>
              </div>
              <SLinkBtn onClick={() => go('/admin/subscription/limits-metrics')}>
                View metrics
              </SLinkBtn>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={OVERAGE_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={ADMIN.brand}  />
                    <stop offset="100%" stopColor={ADMIN.violet} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#8A93A6' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A93A6' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v}k`}
                />
                <Tooltip content={<ChartTooltip prefix="$" suffix="k" />} />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Trial → Paid Funnel */}
          <Card>
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[16px] font-bold tracking-[-0.2px] text-[#0B1020]">Trial → Paid Funnel</p>
                <p className="text-[12.5px] text-[#6B7090]">Current cohort conversion</p>
              </div>
              <SLinkBtn onClick={() => go('/admin/subscription/trials')}>
                View trials
              </SLinkBtn>
            </div>
            <div className="space-y-3.5">
              {funnelSteps.map((step, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go('/admin/subscription/trials')}
                  className="block w-full rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-[#FAFAFE]"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#6B7090]">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-[#0B1020] [font-variant-numeric:tabular-nums]">
                        {step.count}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#9AA0BF]">
                        {step.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF0F6]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#5B5BF0] to-[#7C5CFC]"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Activity — live feed from audit trail */}
          <Card>
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[16px] font-bold tracking-[-0.2px] text-[#0B1020]">Recent Activity</p>
                <p className="text-[12.5px] text-[#6B7090]">Latest admin events</p>
              </div>
              <button
                type="button"
                onClick={() => go('/admin/subscription/audit-logs')}
                className="inline-flex items-center gap-0.5 text-[12.5px] font-semibold text-[#5B5BF0] transition-colors hover:text-[#4B4BD4]"
              >
                View all
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {activities.map((ev, idx) => (
                <React.Fragment key={ev.id}>
                  <button
                    type="button"
                    onClick={() => go(ev.href)}
                    className="flex w-full items-start gap-3 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-[#FAFAFE]"
                  >
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ background: ev.iconBg, color: TONE_COLOR[ev.tone] }}
                    >
                      {ev.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] leading-snug">
                        <span className="font-semibold text-[#0B1020]">{ev.actor}</span>
                        {ev.action && (
                          <span className="text-[#6B7090]"> {ev.action} </span>
                        )}
                        {ev.object && (
                          <span className="font-medium text-[#0B1020]">{ev.object}</span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-[#9AA0BF]">
                      {ev.time}
                    </span>
                  </button>
                  {idx < activities.length - 1 && (
                    <div className="ml-10 h-px bg-[#E7E8F2]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>
    </div>
  );
}
