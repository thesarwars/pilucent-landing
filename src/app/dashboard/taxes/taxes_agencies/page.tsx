'use client';
import { useQuery } from '@tanstack/react-query';
import { GetData } from '@/services/FetchMethods';
import Taxes from '../_components/Taxes';
import Agency from '../_components/Agency';
import { Breadcrumb, StatTile, money, V, type VioletTone } from '@/components/violet';
import { TrendingUp, TrendingDown, Scale, CalendarClock } from 'lucide-react';

const TONE_HEX: Record<VioletTone, string> = {
  violet: '#7C4DFF',
  success: '#1FA97A',
  warn: '#B97608',
  danger: '#D2483E',
  rose: '#B43A6B',
  teal: '#0E7490',
  neutral: '#9A95AE',
};

const Page = () => {
  const { data: taxOverview, isPending } = useQuery({
    queryKey: ['tax_overview'],
    queryFn: () => GetData('we/agencies/taxes?keywords=overview', ''),
  });

  const collected = Number(taxOverview?.total_sale_tax) || 0;
  const paid = Number(taxOverview?.total_purchases_tax) || 0;
  const adj = Number(taxOverview?.total_adjustments) || 0;
  const last30 = Number(taxOverview?.total_tax_last_30_days) || 0;
  const net = collected - paid;

  const tiles: {
    tone: VioletTone;
    icon: React.ReactNode;
    label: string;
    value: number;
    sub: string;
  }[] = [
    { tone: 'violet', icon: <TrendingUp />, label: 'Collected on sales', value: collected, sub: 'Output tax' },
    { tone: 'teal', icon: <TrendingDown />, label: 'Paid on purchases', value: paid, sub: 'Input tax' },
    { tone: 'warn', icon: <Scale />, label: 'Adjustments', value: adj, sub: 'Corrections' },
    { tone: 'success', icon: <CalendarClock />, label: 'Last 30 days', value: last30, sub: 'Rolling total' },
  ];

  const barTotal = collected + paid;
  const bars = [
    { tone: 'violet' as VioletTone, value: collected, label: 'Collected' },
    { tone: 'teal' as VioletTone, value: paid, label: 'Paid' },
  ];

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Taxes & agencies' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Taxes &amp; agencies
        </h1>
      </div>

      {/* overview strip */}
      <div className="mt-[18px] rounded-v-card bg-white p-3.5 shadow-v-card">
        <div className="grid gap-3.5 lg:grid-cols-[310px_1fr]">
          {/* dark net-tax hero */}
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
                Net tax owed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-2 py-1 text-[10px] font-bold tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
                LIVE
              </span>
            </div>

            <div className="relative mt-2 text-[27px] font-extrabold tabular-nums tracking-[-0.02em]">
              {money(net)}
            </div>
            <div className="relative text-[11.5px] text-white/60">
              To remit this period · accrual basis
            </div>

            {/* collected vs paid split bar */}
            <div className="relative mt-3.5 flex h-[9px] gap-0.5 overflow-hidden rounded-full bg-white/[0.14]">
              {bars.map((b, i) => (
                <div
                  key={i}
                  title={b.label}
                  className="h-full origin-left animate-v-grow rounded-full"
                  style={{
                    width: `${barTotal > 0 ? (b.value / barTotal) * 100 : 0}%`,
                    background: TONE_HEX[b.tone],
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            <div className="relative mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
              {bars.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_HEX[b.tone] }} />
                  <span className="text-[10.5px] font-semibold text-white/70">
                    {b.label} {money(b.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 stat tiles */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {isPending && !taxOverview
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[104px] animate-pulse rounded-v-tile border-[1.5px] border-[rgba(22,23,42,0.09)] bg-white"
                  />
                ))
              : tiles.map((t, i) => (
                  <StatTile
                    key={i}
                    tone={t.tone}
                    icon={t.icon}
                    value={money(t.value)}
                    label={t.label}
                    sub={t.sub}
                    delay={i * 0.05}
                  />
                ))}
          </div>
        </div>
      </div>

      {/* agencies */}
      <div className="mt-4">
        <Agency />
      </div>

      {/* custom tax rates */}
      <div className="mt-4">
        <Taxes />
      </div>
    </div>
  );
};

export default Page;
