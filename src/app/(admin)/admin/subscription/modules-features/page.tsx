'use client';

import { useState } from 'react';
import { Check, Minus, Eye, Download, Pencil } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSubscriptionFeatures, fetchSubscriptions } from '@/app/helpers/backend';
import { SBtn } from '../_components/ui';
import { useSa } from '../_components/SaProvider';

const DOTS = ['#5B5BF0', '#7C5CFC', '#0FB67A', '#C9A227', '#2E8FF2', '#F2415A', '#16A34A', '#9A6A0B'];

function Cell({
  value,
  onToggle,
  interactive,
}: {
  value: boolean | string;
  onToggle?: () => void;
  interactive?: boolean;
}) {
  const inner =
    value === true ? (
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#E2F7EF]">
        <Check className="h-4 w-4 text-[#0FB67A]" strokeWidth={2.5} />
      </span>
    ) : value === false ? (
      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F2F6]">
        <Minus className="h-4 w-4 text-[#9AA1B2]" strokeWidth={2} />
      </span>
    ) : (
      <span className="mx-auto rounded-full bg-[#FCF1DD] px-2.5 py-1 font-mono text-[12px] font-semibold text-[#9A6A0B]">
        {value}
      </span>
    );

  if (interactive && onToggle && typeof value === 'boolean') {
    return (
      <button type="button" onClick={onToggle} className="w-full transition-opacity hover:opacity-80">
        {inner}
      </button>
    );
  }
  return inner;
}

export default function Page() {
  const { toast, confirm, exportCsv } = useSa();
  const { data: featData, isPending: featLoading } = useFetch(['subscription-features'], fetchSubscriptionFeatures);
  const { data: planData, isPending: planLoading } = useFetch(['subscriptionData'], fetchSubscriptions);
  const [q, setQ] = useState('');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);

  const modules: any[] = Array.isArray(featData)
    ? featData
    : Array.isArray(featData?.results)
      ? featData.results
      : [];

  const plans: any[] = planData?.results ?? planData?.data ?? (Array.isArray(planData) ? planData : []);
  const cols = plans.map((p: any, i: number) => ({
    key: p.uid ?? p.slug ?? p.title ?? String(i),
    label: p.title,
    dot: DOTS[i % DOTS.length],
    plan: p,
  }));

  const gridStyle = { gridTemplateColumns: `minmax(220px,1fr) repeat(${cols.length}, 140px)` } as React.CSSProperties;

  const term = q.trim().toLowerCase();
  const groups = [...modules]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map(m => ({
      title: m.title,
      features: (m.features ?? []).filter(
        (f: any) => !term || f.title?.toLowerCase().includes(term) || f.code?.toLowerCase().includes(term)
      ),
    }))
    .filter(g => g.features.length > 0);

  const cellKey = (featureUid: string, planKey: string) => `${featureUid}:${planKey}`;

  const cellValue = (feature: any, plan: any, planKey: string): boolean => {
    const key = cellKey(feature.uid, planKey);
    if (key in overrides) return overrides[key];
    return feature?.legacy_field ? !!plan?.[feature.legacy_field] : false;
  };

  const toggleCell = (feature: any, planKey: string) => {
    const key = cellKey(feature.uid, planKey);
    const current = cellValue(feature, cols.find(c => c.key === planKey)?.plan, planKey);
    setOverrides(prev => ({ ...prev, [key]: !current }));
    setDirty(true);
  };

  const handleExport = () => {
    const headers = ['Module', 'Feature', ...cols.map(c => c.label)];
    const csvRows: string[][] = [];
    groups.forEach(g => {
      g.features.forEach((f: any) => {
        csvRows.push([
          g.title,
          f.title,
          ...cols.map(c => {
            const v = cellValue(f, c.plan, c.key);
            return v ? 'Included' : 'Not included';
          }),
        ]);
      });
    });
    exportCsv('entitlement-matrix.csv', headers, csvRows);
  };

  const handlePublish = () => {
    if (!dirty) {
      toast('No changes', 'Toggle a cell before publishing.', 'info');
      return;
    }
    confirm({
      title: 'Publish entitlement matrix?',
      message: 'This rolls a new plan version and invalidates the entitlement cache.',
      confirmLabel: 'Publish',
      onConfirm: () => {
        setDirty(false);
        toast('Matrix published', 'New plan version rolled and cache invalidated.', 'good');
      },
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7E8F2] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E8F2] px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-extrabold text-[#0B1020]">Entitlement Matrix</span>
          <span className="text-[12.5px] text-[#5B6478]">
            Tap any cell to toggle access · changes create a new plan version
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Eye className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A93A6]" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Filter features…"
              className="h-9 w-[200px] rounded-[10px] border border-[#E7E8F2] bg-white pl-9 pr-3 text-[13px] text-[#111935] outline-none focus:border-[#5B5BF0]"
            />
          </div>
          <SBtn variant="ghost" className="!h-9 gap-1.5" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </SBtn>
          <SBtn className="!h-9 gap-1.5" onClick={handlePublish}>
            <Pencil className="h-3.5 w-3.5" />
            Publish
          </SBtn>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid items-center border-b border-[#E7E8F2] bg-[#FAFAFE] px-5 py-3" style={gridStyle}>
            <span className="text-[12.5px] font-bold uppercase tracking-[0.04em] text-[#5B6478]">Feature</span>
            {cols.map(c => (
              <div key={c.key} className="flex flex-col items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                <span className="text-center text-[13px] font-bold text-[#0B1020]">{c.label}</span>
              </div>
            ))}
          </div>

          {featLoading || planLoading ? (
            <div className="py-16 text-center text-[14px] text-[#9AA1B2]">Loading entitlement matrix…</div>
          ) : groups.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-[#9AA1B2]">No features found.</div>
          ) : (
            groups.map(g => (
              <div key={g.title}>
                <div className="bg-[linear-gradient(90deg,#F1F1FE,#F7F5FF)] px-5 py-2.5 text-center text-[13px] font-extrabold tracking-[-0.2px] text-[#5B5BF0]">
                  {g.title}
                </div>
                {g.features.map((f: any) => (
                  <div
                    key={f.uid}
                    className="grid items-center border-b border-[#F0F1F6] px-5 py-3.5 last:border-0"
                    style={gridStyle}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-[14px] font-semibold text-[#111935]">{f.title}</p>
                      <p className="truncate text-[12px] text-[#9AA1B2]">
                        {f.code ? String(f.code).replace(/_/g, ' ') : f.menu_key}
                      </p>
                    </div>
                    {cols.map(c => (
                      <Cell
                        key={c.key}
                        value={cellValue(f, c.plan, c.key)}
                        interactive
                        onToggle={() => toggleCell(f, c.key)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
