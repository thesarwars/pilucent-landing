'use client';

/**
 * Salary history (docs/frontend/salary-profile.md §11.3): every structure,
 * newest first, read-only. A correction is a new record typed Correction —
 * history is never edited. The floor beside each row is the floor as at that
 * row's own date: a structure legal in 2024 can fall below a later gazette.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { DrawerHead, ErrorBlock, LoadingBlock, SideDrawer } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { Pills } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import { useSalaryProfileHistory } from './hooks';
import { MASK } from './parts';
import type { SalaryHistoryRow, SalaryProfileRead } from './types';

export function HistoryDrawer({ profile: p, onClose }: { profile: SalaryProfileRead; onClose: () => void }) {
  const titleId = React.useId();
  const history = useSalaryProfileHistory(p.employee.code);
  const [view, setView] = React.useState<'timeline' | 'chart'>('timeline');
  const rows = history.data?.structures ?? [];
  const masked = history.data?.masked ?? p.masked;

  return (
    <SideDrawer onClose={onClose} labelledBy={titleId} width={620}>
      <DrawerHead id={titleId} title="Salary history" sub={`${p.employee.nameEn} · read-only, effective-dated records`} onClose={onClose} />
      <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#F8F7FC] px-5 py-4">
        {!masked && rows.length > 0 && (
          <Pills
            options={[
              { value: 'timeline', label: 'Timeline' },
              { value: 'chart', label: 'Chart' },
            ]}
            value={view}
            onChange={setView}
            ariaLabel="History view"
          />
        )}
        {history.isPending && <LoadingBlock />}
        {history.isError && <ErrorBlock error={history.error} onRetry={() => void history.refetch()} />}
        {history.data?.empty && <div className="py-10 text-center text-[12.5px] text-[#6F6A85]">{history.data.message}</div>}
        {view === 'timeline' || masked ? (
          <ol className="m-0 list-none space-y-2.5 p-0">
            {rows.map((r) => (
              <HistoryCard key={r.uid} row={r} />
            ))}
          </ol>
        ) : (
          <HistoryChart rows={rows} gradeLabel={p.employee.gradeLabel} />
        )}
        {rows.length > 0 && (
          <p className="text-[11.5px] leading-relaxed text-[#6F6A85]">
            Read-only. A correction creates a new effective-dated record typed <strong className="text-[#16172A]">Correction</strong> — history is never
            edited, so every payslip already issued still reproduces.
          </p>
        )}
      </div>
    </SideDrawer>
  );
}

function HistoryCard({ row: r }: { row: SalaryHistoryRow }) {
  const { money, date, n } = useLang();
  const cancelled = r.status === 'CANCELLED';
  const up = Number(r.deltaAmount ?? 0) > 0;
  const facts: [string, React.ReactNode][] = [
    ['Template', r.templateName],
    ['Status', r.status.charAt(0) + r.status.slice(1).toLowerCase()],
    ['Approved by', r.approvedBy || '—'],
    ['Reason', r.reason || '—'],
  ];
  if (!r.masked) {
    if (r.arrears && Number(r.arrears)) facts.push(['Arrears', `${money(r.arrears, 2)}${r.arrearsFrom ? ` from ${r.arrearsFrom}` : ''}`]);
    if (r.overrideCount) facts.push(['Overrides', n(r.overrideCount)]);
  }
  facts.push([
    'Floor then',
    r.floorThen.clears === null ? '—' : `${r.floorThen.clears ? 'Cleared' : 'Below'}${r.floorThen.floor ? ` ${money(r.floorThen.floor)}` : ''}`,
  ]);
  return (
    <li className={cn('bd-panel !px-[17px] !py-[15px]', cancelled && 'opacity-70')}>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="bd-mono rounded-lg bg-[rgba(124,77,255,0.1)] px-2 py-1 text-[11.5px] font-bold text-[#6B3FE8]">{date(r.effectiveFrom)}</span>
        <span className={cn('text-[12.5px] font-bold', cancelled && 'line-through')}>{r.typeLabel}</span>
        <span className="flex-1" />
        {r.masked ? (
          <span className="bd-mono text-[12px] text-[#6E6883]">{MASK}</span>
        ) : (
          <>
            <span className="bd-mono text-[13px] font-bold">{money(r.gross)}</span>
            {r.deltaPct && (
              <span className={cn('bd-mono text-[11.5px] font-bold', up ? 'text-[#157A5B]' : 'text-[#E11D48]')}>
                {up ? '+' : ''}
                {n(r.deltaPct)}%
              </span>
            )}
          </>
        )}
      </div>
      <dl className="mt-2.5 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="bd-eyebrow !text-[10.5px]">{label}</dt>
            <dd className="m-0 mt-0.5 text-[12px] text-[#44405C]">{value}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

/** Gross and basic over time, with the floor as at each date as a dashed line. */
function HistoryChart({ rows, gradeLabel }: { rows: SalaryHistoryRow[]; gradeLabel: string }) {
  const { money, date } = useLang();
  const live = rows.filter((r) => r.status !== 'CANCELLED' && r.gross).slice().reverse();
  const max = Math.max(...live.map((r) => Number(r.gross)), ...live.map((r) => Number(r.floorThen.floor ?? 0)), 1);
  const h = (v: string | null | undefined) => `${Math.round((Number(v ?? 0) / max) * 100)}%`;
  return (
    <figure className="bd-panel m-0">
      <figcaption>
        <div className="text-[13px] font-bold">Gross and basic over time</div>
        <div className="mt-0.5 text-[11.5px] text-[#6F6A85]">The dashed line is the gazetted basic minimum for {gradeLabel}, as at each date.</div>
      </figcaption>
      <div className="mt-4 flex h-[210px] items-end gap-3.5 px-1" role="img" aria-label={`Gross by effective date: ${live.map((r) => `${date(r.effectiveFrom)} ${money(r.gross)}`).join(', ')}`}>
        {live.map((r) => (
          <div key={r.uid} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <span className="bd-mono text-[10.5px] font-bold text-[#5A2BE0]">{money(r.gross)}</span>
            <div className="relative w-full rounded-t-lg bg-gradient-to-b from-[#7C4DFF] to-[#5A2BE0]" style={{ height: h(r.gross) }}>
              <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-[rgba(34,211,238,0.55)]" style={{ height: `${Math.round((Number(r.basic ?? 0) / Number(r.gross)) * 100)}%` }} />
              {r.floorThen.floor && (
                <div
                  className="absolute -inset-x-1.5 h-0.5 [background:repeating-linear-gradient(90deg,#E11D48_0_5px,transparent_5px_9px)]"
                  style={{ bottom: `${Math.round((Number(r.floorThen.floor) / Number(r.gross)) * 100)}%` }}
                />
              )}
            </div>
            <span className="bd-mono text-[10px] text-[#6E6883]">{date(r.effectiveFrom)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 flex flex-wrap gap-4 text-[11.5px] text-[#44405C]">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded bg-[#6B3FE8]" /> Gross
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded bg-[rgba(34,211,238,0.55)]" /> Basic
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-3 bg-[#E11D48]" /> Basic floor
        </span>
      </div>
    </figure>
  );
}
