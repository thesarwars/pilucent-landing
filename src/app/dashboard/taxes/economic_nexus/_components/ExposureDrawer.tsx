'use client';

import * as React from 'react';
import { X, FileDown, FileText, TrendingUp, Info } from 'lucide-react';
import { VioletButton, money } from '@/components/violet';
import { NexusDrawer, MicroHeader } from './NexusDrawer';
import {
  type NexusState,
  statusOf,
  resolveRegistered,
  estTax,
  pct,
  shortMoney,
} from './nexus-data';

export interface ExposureDrawerProps {
  open: boolean;
  onClose: () => void;
  states: NexusState[];
  registered: Record<string, boolean>;
  marked: Record<string, boolean>;
  onRegister: (code: string) => void;
}

export function ExposureDrawer({
  open,
  onClose,
  states,
  registered,
  marked,
  onRegister,
}: ExposureDrawerProps) {
  const rows = states.map((s) => {
    const reg = resolveRegistered(s, registered);
    const status = statusOf(s, reg, !!marked[s.code]);
    return { s, reg, status };
  });

  const exposure = rows.filter((r) => r.status === 'met');
  const watch = rows.filter((r) => r.status === 'approaching');
  const history = rows
    .filter((r) => r.status === 'registered' || r.status === 'met')
    .sort((a, b) => (a.status === 'registered' ? -1 : 1) - (b.status === 'registered' ? -1 : 1));

  const total = exposure.reduce((sum, r) => sum + estTax(r.s), 0);
  const regCount = rows.filter((r) => r.status === 'registered').length;

  const exportCsv = () => {
    const header = ['State', 'Code', 'Since', 'Taxable sales', 'Avg rate', 'Est. tax'];
    const lines = exposure.map((r) =>
      [
        r.s.name,
        r.s.code,
        r.s.since || '',
        r.s.taxableSales.toFixed(2),
        `${((r.s.avgRate || 0) * 100).toFixed(2)}%`,
        estTax(r.s).toFixed(2),
      ].join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'economic-nexus-exposure.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const header = (
    <div
      className="relative overflow-hidden px-5 pb-[18px] pt-[18px] text-white"
      style={{ backgroundImage: 'linear-gradient(135deg,#211B38,#463481,#6E4BE0)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-[190px] w-[190px] animate-v-float rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.4), transparent 70%)' }}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/[0.16] text-white/90 transition-colors hover:bg-white/25"
      >
        <X className="h-[15px] w-[15px]" />
      </button>
      <div className="relative">
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white/55">
          Estimated exposure
        </div>
        <div className="mt-1.5 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
          {money(total)}
        </div>
        <div className="mt-1.5 text-[12px] text-white/60">
          {exposure.length} to register · {regCount} registered · {watch.length} approaching
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center gap-2.5">
      <VioletButton
        variant="outline"
        className="flex-1 justify-center"
        leftIcon={<FileDown className="h-4 w-4" />}
        onClick={exportCsv}
      >
        Export CSV
      </VioletButton>
      <VioletButton
        variant="outline"
        className="flex-1 justify-center"
        leftIcon={<FileText className="h-4 w-4" />}
        onClick={() => window.print()}
      >
        Export PDF
      </VioletButton>
    </div>
  );

  return (
    <NexusDrawer open={open} onClose={onClose} width={560} header={header} footer={footer}>
      <div className="flex flex-col gap-3.5">
        {/* Exposure table */}
        <section className="rounded-v-card bg-white p-4 shadow-v-card">
          <MicroHeader>Open exposure · past threshold</MicroHeader>
          {exposure.length === 0 ? (
            <p className="mt-3 text-[13px] text-v-ink500">
              No open exposure — every state past a threshold is registered and collecting.
            </p>
          ) : (
            <div className="mt-2.5">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[rgba(22,23,42,0.07)] pb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
                <span>State</span>
                <span className="text-right">Est. tax</span>
              </div>
              {exposure.map((r) => (
                <div
                  key={r.s.code}
                  className="flex items-center gap-3 border-b border-[rgba(22,23,42,0.06)] py-2.5 last:border-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-v-danger-bg text-[11px] font-extrabold text-v-danger-fg">
                    {r.s.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-v-ink900">{r.s.name}</div>
                    <div className="truncate text-[11px] text-v-ink400">
                      since {r.s.since || '—'} · {money(r.s.taxableSales)} ·{' '}
                      {((r.s.avgRate || 0) * 100).toFixed(2)}% avg
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[13.5px] font-extrabold tabular-nums text-v-danger-fg">
                      {money(estTax(r.s))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRegister(r.s.code)}
                    className="shrink-0 rounded-full bg-v-tint100 px-3 py-1.5 text-[11.5px] font-bold text-v-primary transition-colors hover:bg-v-primary hover:text-white"
                  >
                    Register
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Watchlist */}
        <section className="rounded-v-card bg-white p-4 shadow-v-card">
          <MicroHeader>Watchlist · approaching</MicroHeader>
          {watch.length === 0 ? (
            <p className="mt-3 text-[13px] text-v-ink500">Nothing approaching a threshold.</p>
          ) : (
            <div className="mt-2.5 flex flex-col">
              {watch.map((r) => {
                const p = Math.round(pct(r.s.taxableSales, r.s.rule.salesThreshold));
                return (
                  <div
                    key={r.s.code}
                    className="flex items-center gap-3 border-b border-[rgba(22,23,42,0.06)] py-2.5 last:border-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-v-warn-bg text-[10.5px] font-extrabold text-v-warn-fg">
                      {r.s.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-v-ink900">{r.s.name}</div>
                      <div className="truncate text-[11px] tabular-nums text-v-ink400">
                        {money(r.s.taxableSales)} of {shortMoney(r.s.rule.salesThreshold)}
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-v-warn-bg px-2.5 py-1 text-[11px] font-bold tabular-nums text-v-warn-fg">
                      <TrendingUp className="h-3 w-3" />
                      {p}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Threshold history timeline */}
        <section className="rounded-v-card bg-white p-4 shadow-v-card">
          <MicroHeader>Threshold history</MicroHeader>
          <div className="relative mt-3 pl-1">
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-[rgba(22,23,42,0.10)]" />
            <div className="flex flex-col gap-3.5">
              {history.map((r) => {
                const reg = r.status === 'registered';
                return (
                  <div key={r.s.code} className="relative flex items-center gap-3 pl-6">
                    <span
                      className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-4 ring-white"
                      style={{ background: reg ? '#1FA97A' : '#D2483E' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-v-ink900">{r.s.name}</div>
                      <div className="text-[11px] text-v-ink400">crossed {r.s.since || '—'}</div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] ${
                        reg ? 'bg-v-success-bg text-v-success-fg' : 'bg-v-danger-bg text-v-danger-fg'
                      }`}
                    >
                      {reg ? 'Registered' : 'Met'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-v-tile bg-v-wash2 px-3.5 py-2.5 text-[11.5px] text-v-ink500">
          <Info className="mt-px h-3.5 w-3.5 shrink-0 text-v-ink400" />
          <span>
            Estimated figures for planning only — not a filing, remittance, or legal determination.
            Confirm registration duties with each state.
          </span>
        </div>
      </div>
    </NexusDrawer>
  );
}
