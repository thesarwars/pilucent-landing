'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchProductsOverview } from '@/app/helpers/backend';
import { Boxes, AlertTriangle, PackageX, CalendarX } from 'lucide-react';
import { StatTile, V, type VioletTone } from '@/components/violet';

const TONE_HEX: Record<VioletTone, string> = {
  violet: '#7C4DFF',
  success: '#1FA97A',
  warn: '#B97608',
  danger: '#D2483E',
  rose: '#B43A6B',
  teal: '#0E7490',
  neutral: '#9A95AE',
};

export default function ProductOverview() {
  const { data, isPending } = useQuery({
    queryKey: ['product_overview'],
    queryFn: fetchProductsOverview,
  });

  const total = Number(data?.stock_count) || 0;
  const low = Number(data?.low_stock_count) || 0;
  const out = Number(data?.out_of_stock_count) || 0;
  const expired = Number(data?.expired_stock_count) || 0;

  const tiles: { tone: VioletTone; icon: React.ReactNode; label: string; value: number }[] = [
    { tone: 'warn', icon: <AlertTriangle />, label: 'Low stock', value: low },
    { tone: 'danger', icon: <PackageX />, label: 'Out of stock', value: out },
    { tone: 'violet', icon: <CalendarX />, label: 'Expired stock', value: expired },
  ];

  const issueTotal = low + out + expired;
  const segments = tiles.map((t) => ({
    ...t,
    width: issueTotal > 0 ? (t.value / issueTotal) * 100 : 0,
  }));

  return (
    <div className="rounded-v-card bg-white p-3.5 font-jakarta shadow-v-card">
      <div className="grid gap-3.5 lg:grid-cols-[310px_1fr]">
        {/* ── dark inventory hero ── */}
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
              Inventory
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-2 py-1 text-[10px] font-bold tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
              LIVE
            </span>
          </div>

          <div className="relative mt-2 text-[27px] font-extrabold tabular-nums tracking-[-0.02em]">
            {total}
          </div>
          <div className="relative text-[11.5px] text-white/60">Total stock items tracked</div>

          {/* split bar — issue mix */}
          <div className="relative mt-3.5 flex h-[9px] gap-0.5 overflow-hidden rounded-full bg-white/[0.14]">
            {segments.map((seg, i) => (
              <div
                key={i}
                title={seg.label}
                className="h-full origin-left animate-v-grow rounded-full"
                style={{
                  width: `${seg.width}%`,
                  background: TONE_HEX[seg.tone],
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* legend */}
          <div className="relative mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {tiles.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_HEX[t.tone] }} />
                <span className="text-[10.5px] font-semibold text-white/70">
                  {t.value} {t.label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── stat-tile grid ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {isPending && !data
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[104px] animate-pulse rounded-v-tile border-[1.5px] border-[rgba(22,23,42,0.09)] bg-white"
                />
              ))
            : tiles.map((t, i) => {
                const pct = total > 0 ? Math.round((t.value / total) * 100) : 0;
                return (
                  <StatTile
                    key={i}
                    tone={t.tone}
                    icon={t.icon}
                    value={t.value}
                    label={t.label}
                    sub={`${pct}% of stock`}
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
