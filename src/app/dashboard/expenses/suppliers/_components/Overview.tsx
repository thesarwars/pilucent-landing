'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, AlertCircle, CircleCheck } from 'lucide-react';
import { fetchExpenseOverview } from '@/app/helpers/backend';
import { StatTile, money, V, type VioletTone } from '@/components/violet';

/* tone meta, parallel to the 3 overview entries (total bills, overdue, paid) */
const STAT_META: { tone: VioletTone; icon: React.ReactNode; label: string }[] = [
  { tone: 'violet', icon: <FileText />, label: 'Total bills' },
  { tone: 'danger', icon: <AlertCircle />, label: 'Overdue' },
  { tone: 'success', icon: <CircleCheck />, label: 'Recently paid' },
];

const TONE_HEX: Record<VioletTone, string> = {
  violet: '#7C4DFF',
  success: '#1FA97A',
  warn: '#B97608',
  danger: '#D2483E',
  rose: '#B43A6B',
  teal: '#0E7490',
  neutral: '#9A95AE',
};

export default function SupplierOverviewCard() {
  const { isPending, data } = useQuery({
    queryKey: ['purchase_overview'],
    queryFn: () => fetchExpenseOverview(),
  });

  // same field mapping as before, derived synchronously (no empty-grid flash)
  const salesData = useMemo<any[]>(() => {
    if (!data) return [];
    return [
      {
        amount: `$${data.bill_total?.toFixed(2) || '0.00'}`,
        description: `${data.bill_count || 0} total bills`,
        value: data.bill_total || 0,
        color: 'cyan' as const,
      },
      {
        amount: `$${data.over_due_total?.toFixed(2) || '0.00'}`,
        description: `${data.over_due_count || 0} overdue`,
        value: data.over_due_total || 0,
        color: 'orange' as const,
      },
      {
        amount: `$${data.recently_paid_count ? data.recently_paid_count.toFixed(2) : '0.00'}`,
        description: `${data.recently_paid_count || 0} recently paid`,
        value: data.invoice_paid_total || 0,
        color: 'green' as const,
      },
    ];
  }, [data]);

  const totalAmount = salesData.reduce((sum, item) => sum + item.value, 0);
  const segments = salesData.map((item) => ({
    ...item,
    width: totalAmount > 0 && item.value > 0 ? (item.value / totalAmount) * 100 : 0,
  }));

  return (
    <div className="rounded-v-card bg-white p-3.5 font-jakarta shadow-v-card">
      <div className="grid gap-3.5 lg:grid-cols-[310px_1fr]">
        {/* ── dark PAYABLES hero ── */}
        <div
          className="relative flex flex-col overflow-hidden rounded-v-hero px-[18px] pb-[15px] pt-4 text-white shadow-v-hero"
          style={{ backgroundImage: V.gradients.heroOverview }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[40px] -top-[40px] h-[170px] w-[170px] animate-v-float rounded-full"
            style={{ background: V.orb.violet }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-[30px] -left-[30px] h-[120px] w-[120px] rounded-full"
            style={{ background: V.orb.white }}
          />

          <div className="relative flex items-center justify-between">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.09em] text-white/60">
              Payables
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-2 py-1 text-[10px] font-bold tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
              LIVE
            </span>
          </div>

          <div className="relative mt-2 text-[27px] font-extrabold tabular-nums tracking-[-0.02em]">
            {money(totalAmount)}
          </div>
          <div className="relative text-[11.5px] text-white/60">What you owe across bills</div>

          {/* split bar */}
          <div className="relative mt-3.5 flex h-[9px] gap-0.5 overflow-hidden rounded-full bg-white/[0.14]">
            {segments.map((seg, i) => (
              <div
                key={i}
                title={seg.description}
                className="h-full origin-left animate-v-grow rounded-full"
                style={{
                  width: `${seg.width}%`,
                  background: TONE_HEX[STAT_META[i]?.tone ?? 'violet'],
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* legend */}
          <div className="relative mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {salesData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: TONE_HEX[STAT_META[i]?.tone ?? 'violet'] }}
                />
                <span className="text-[10.5px] font-semibold text-white/70">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── stat-card grid ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {isPending && salesData.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[104px] animate-pulse rounded-v-tile border-[1.5px] border-[rgba(22,23,42,0.09)] bg-white"
                />
              ))
            : salesData.map((item, i) => {
                const meta = STAT_META[i];
                const pct = totalAmount > 0 ? Math.round((item.value / totalAmount) * 100) : 0;
                return (
                  <StatTile
                    key={i}
                    tone={meta.tone}
                    icon={meta.icon}
                    value={item.amount}
                    label={meta.label}
                    sub={item.description}
                    share={`${pct}%`}
                    bar={pct}
                    delay={i * 0.05}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
}
