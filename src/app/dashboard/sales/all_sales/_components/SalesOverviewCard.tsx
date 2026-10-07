'use client';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FileText, ReceiptText, AlertCircle, FileClock, CircleCheck } from 'lucide-react';
import { fetchSalesOverview } from '@/app/helpers/backend';
import { cn } from '@/lib/utils';
import { StatTile, money, V, type VioletTone } from '@/components/violet';

/* tone meta, parallel to the 5 salesData entries (estimate, sale receipt, overdue, open, paid) */
const STAT_META: { tone: VioletTone; icon: React.ReactNode; label: string }[] = [
  { tone: 'violet', icon: <FileText />, label: 'Estimates' },
  { tone: 'teal', icon: <ReceiptText />, label: 'Sale receipts' },
  { tone: 'danger', icon: <AlertCircle />, label: 'Overdue' },
  { tone: 'warn', icon: <FileClock />, label: 'Open invoices' },
  { tone: 'success', icon: <CircleCheck />, label: 'Paid' },
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

/** 'invoice&overdue=true' -> { sale_type:'invoice', flags:{overdue:'true'} } */
function parseParam(param: string) {
  const [base, ...rest] = param.split('&');
  const flags: Record<string, string> = {};
  rest.forEach((kv) => {
    const [k, v] = kv.split('=');
    if (k) flags[k] = v;
  });
  return { sale_type: base, flags };
}

export default function SalesOverviewCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending, data } = useQuery({
    queryKey: ['sales_overview_data'],
    queryFn: () => fetchSalesOverview(),
  });

  // Derive synchronously from the query result so there is no empty-grid flash
  // between isPending flipping false and the data being mapped.
  const salesData = useMemo<any[]>(() => {
    if (!data) return [];
    return [
      {
        amount: `$${data.estimated_total?.toFixed(2) || '0.00'}`,
        description: `${data.estimated_count || 0} estimates`,
        value: data.estimated_total || 0,
        color: 'cyan' as const,
        param: 'estimate',
      },
      {
        amount: `$${data.sale_receipt_total?.toFixed(2) || '0.00'}`,
        description: `${data.sale_receipt_count || 0} sale receipts`,
        value: data.sale_receipt_total || 0,
        color: 'blue' as const,
        param: 'sale receipt',
      },
      {
        amount: `$${data.over_due_total?.toFixed(2) || '0.00'}`,
        description: `${data.over_due_count || 0} overdue invoices`,
        value: data.over_due_total || 0,
        color: 'orange' as const,
        param: 'invoice&overdue=true',
      },
      {
        amount: `$${data.invoice_total?.toFixed(2) || '0.00'}`,
        description: `${data.invoice_count || 0} open invoices and credits`,
        value: data.invoice_total || 0,
        color: 'lavender' as const,
        param: 'invoice&open=true',
      },
      {
        amount: `$${data.recently_paid_count ? data.recently_paid_count.toFixed(2) : '0.00'}`,
        description: `${data.recently_paid_count || 0} recently paid`,
        value: data.invoice_paid_total || 0,
        color: 'green' as const,
        param: 'invoice&recent=true',
      },
    ];
  }, [data]);

  // Totals + segment widths (same maths as before)
  const totalAmount = salesData.reduce((sum, item) => sum + item.value, 0);
  const segments = salesData.map((item) => ({
    ...item,
    width: totalAmount > 0 && item.value > 0 ? (item.value / totalAmount) * 100 : 0,
  }));

  const isActive = (param: string) => {
    const { sale_type, flags } = parseParam(param);
    if ((searchParams.get('sale_type') || 'all') !== sale_type) return false;
    for (const k of ['overdue', 'open', 'recent']) {
      if ((flags[k] || null) !== (searchParams.get(k) || null)) return false;
    }
    return true;
  };

  const anyActive = salesData.some((item) => isActive(item.param));

  const onFilter = (param: string) => {
    if (isActive(param)) {
      router.push('/dashboard/sales/all_sales');
    } else {
      router.push(`/dashboard/sales/all_sales?sale_type=${param}`);
    }
  };

  return (
    <div className="rounded-v-card bg-white p-3.5 font-jakarta shadow-v-card">
      <div className="grid gap-3.5 lg:grid-cols-[310px_1fr]">
        {/* ── dark receivables hero ── */}
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
              Receivables
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-2 py-1 text-[10px] font-bold tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
              LIVE
            </span>
          </div>

          <div className="relative mt-2 text-[27px] font-extrabold tabular-nums tracking-[-0.02em]">
            {money(totalAmount)}
          </div>
          <div className="relative text-[11.5px] text-white/60">
            Across estimates, invoices &amp; receipts
          </div>

          {/* split bar */}
          <div className="relative mt-3.5 flex h-[9px] gap-0.5 overflow-hidden rounded-full bg-white/[0.14]">
            {segments.map((seg, i) => {
              const hex = TONE_HEX[STAT_META[i]?.tone ?? 'violet'];
              const active = isActive(seg.param);
              return (
                <button
                  key={i}
                  type="button"
                  title={seg.description}
                  onClick={() => onFilter(seg.param)}
                  className="h-full origin-left animate-v-grow rounded-full transition-opacity duration-300"
                  style={{
                    width: `${seg.width}%`,
                    background: hex,
                    opacity: anyActive && !active ? 0.3 : 1,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              );
            })}
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
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {isPending && salesData.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[104px] animate-pulse rounded-v-tile border-[1.5px] border-[rgba(22,23,42,0.09)] bg-white"
                  />
                ))
              : salesData.map((item, i) => {
                  const meta = STAT_META[i];
                  const active = isActive(item.param);
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
                      active={active}
                      onClick={() => onFilter(item.param)}
                      delay={i * 0.04}
                      className={cn(!active && anyActive && 'opacity-60')}
                    />
                  );
                })}
          </div>
          <p className="mt-2.5 text-right text-[11px] text-v-ink400">
            Click a card or a bar segment to filter the list below — click again to clear.
          </p>
        </div>
      </div>
    </div>
  );
}
