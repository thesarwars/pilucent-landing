'use client';

/**
 * The salary list (docs/frontend/salary-profile.md §9): who has a structure,
 * what it is built on, and whether basic still clears the gazetted grade
 * floor. Stacked rows, not a table: six columns clip at the embedded width.
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { initials, plural } from '@/app/dashboard/hris/employee/employees/_bd/format';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { Chip, ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useDebounced } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import { useSalaryList } from './hooks';
import { BdBadge, MASK, MoneyPair, PermissionPill } from './parts';
import type { SalaryFilter, SalaryListRow } from './types';

const FILTERS: { id: SalaryFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'ASSIGNED', label: 'With a structure' },
  { id: 'NONE', label: 'No structure' },
  { id: 'FLOOR', label: 'Below the floor' },
  { id: 'OVERRIDE', label: 'Overridden' },
];

export const SALARY_PROFILE = (code: string, setup = false) =>
  `/dashboard/hris/salary/${encodeURIComponent(code)}${setup ? '?setup=1' : ''}`;

export function SalaryList() {
  return (
    <LangProvider>
      <ListScreen />
    </LangProvider>
  );
}

function ListScreen() {
  const { n, lang, money, date } = useLang();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<SalaryFilter>('ALL');
  const [page, setPage] = React.useState(1);
  const q = useDebounced(query.trim(), 300);
  React.useEffect(() => setPage(1), [q, filter]);
  const list = useSalaryList({ q, filter, page });
  const data = list.data;
  const rows = data?.results ?? [];
  const pages = Math.max(1, Math.ceil((data?.count ?? 0) / 25));
  const masked = data?.masked ?? false;

  const stats = data
    ? [
        { label: 'With a structure', value: n(data.stats.withStructure), tone: '#16172A' },
        { label: 'No structure', value: n(data.stats.noStructure), tone: data.stats.noStructure ? '#8A5A06' : '#16172A' },
        { label: 'Below the floor', value: n(data.stats.belowFloor), tone: data.stats.belowFloor ? '#E11D48' : '#157A5B' },
        { label: 'Monthly gross total', value: masked ? MASK : money(data.stats.monthlyGrossTotal), tone: '#5A2BE0' },
      ]
    : [];

  return (
    <div className="bd" lang={lang}>
      <div className="bd-page !max-w-[1240px]">
        <header className="bd-list-head">
          <div className="min-w-[240px] flex-1">
            <h1 className="bd-title !text-[22px]">
              Salary profiles{' '}
              <span lang="bn" className="text-[14px] font-medium text-[#6E6883]">
                বেতন
              </span>
            </h1>
            <p className="bd-lede !max-w-[620px] !text-[12.5px]">
              Who has a structure, what it is built on, and whether basic still clears the gazetted grade floor. Open a record to revise, override or
              read its history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PermissionPill masked={masked} />
            <BdBadge />
          </div>
        </header>

        <div className="flex flex-wrap gap-2.5 px-5 pt-4 max-md:px-3" aria-live="polite">
          {stats.map((s) => (
            <div key={s.label} className="bd-stat">
              <div className="bd-stat-figure" style={{ color: s.tone }}>
                {s.value}
              </div>
              <div className="bd-stat-caption">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 pt-4 max-md:px-3">
          <div className="bd-search">
            <span>
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a name, code, template"
              aria-label="Search salary profiles"
              className="!w-[252px]"
            />
          </div>
          <div role="group" aria-label="Filter salary profiles" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className="bd-filter">
                {f.label}
                {data && <span className="bd-filter-count">{n(data.counts[f.id])}</span>}
              </button>
            ))}
          </div>
          <span className="flex-1" />
          {data && <span className="bd-mono text-[12.5px] text-[#6F6A85]">{plural(data.count, 'profile', 'profiles')} shown</span>}
        </div>

        {list.isPending ? (
          <LoadingBlock />
        ) : list.isError ? (
          <div className="bd-rows">
            <ErrorBlock error={list.error} onRetry={() => void list.refetch()} />
          </div>
        ) : (
          <div className={cn('bd-card bd-rows transition-opacity', list.isFetching && 'opacity-70')} aria-busy={list.isFetching}>
            {rows.length === 0 && (
              <div className="px-5 py-14 text-center">
                <div className="text-[14px] font-bold">Nobody matches</div>
                <div className="mt-1 text-[12.5px] text-[#6F6A85]">Clear the search or pick another filter.</div>
              </div>
            )}
            <ul className="m-0 list-none p-0">
              {rows.map((r, i) => (
                <li key={r.code}>
                  <Row row={r} odd={i % 2 === 1} date={date} />
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav aria-label="Pages" className="flex items-center justify-end gap-2 px-5 py-3 text-[12px] font-semibold text-[#6F6A85]">
                Page {n(page)} of {n(pages)}
                <button type="button" className="bd-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  ‹
                </button>
                <button type="button" className="bd-btn" aria-label="Next page" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  ›
                </button>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS: Record<SalaryListRow['floorStatus'], { tone: 'ok' | 'blocked' | 'warn'; label: string }> = {
  CLEARS: { tone: 'ok', label: 'Clears the floor' },
  BELOW: { tone: 'blocked', label: 'Below the floor' },
  NONE: { tone: 'warn', label: 'No structure' },
};

/**
 * One row. The name is the link and stretches over the whole row, so the
 * row is reachable by Tab and opened by Enter (spec defect #1); the inline
 * "Assign template" sits above it as its own button.
 */
function Row({ row: r, odd, date }: { row: SalaryListRow; odd: boolean; date: (iso: string | null) => string }) {
  const router = useRouter();
  const status = STATUS[r.floorStatus];
  return (
    <div className={cn('bd-row relative', odd && 'is-odd')}>
      <span className="bd-row-ident">
        <span aria-hidden="true" className="bd-avatar bd-avatar-sm">
          {initials(r.nameEn)}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <Link href={SALARY_PROFILE(r.code)} className="bd-row-link text-[13.5px] font-bold tracking-[-0.01em] text-[#16172A] no-underline">
              {r.nameEn}
            </Link>
            {r.nameBn && (
              <span lang="bn" className="text-[12px] text-[#6F6A85]">
                {r.nameBn}
              </span>
            )}
            {r.fresh && <span className="bd-new">NEW</span>}
          </span>
          <span className="bd-mono block text-[10.5px] text-[#6E6883] max-md:text-[12px]">{r.code}</span>
        </span>
      </span>
      <span className="bd-row-info">
        <span className="text-[#44405C]">{[r.designation, r.department].filter(Boolean).join(' · ') || 'No designation'}</span>
        <span className={r.templateName ? 'text-[#44405C]' : 'text-[#8A5A06]'}>{r.templateName ?? 'No template'}</span>
        {r.hasStructure && <MoneyPair gross={r.gross} basic={r.basic} masked={r.masked} />}
        <Chip tone={status.tone} className="!py-0.5 !text-[10.5px]">
          {status.label}
        </Chip>
        {r.overrideCount > 0 && (
          <Chip tone="violet" className="!py-0.5 !text-[10.5px]">
            {plural(r.overrideCount, 'override', 'overrides')}
          </Chip>
        )}
        {r.scheduledFrom && (
          <Chip tone="warn" className="!py-0.5 !text-[10.5px]">
            Changes {date(r.scheduledFrom)}
          </Chip>
        )}
      </span>
      <span className="bd-row-actions">
        {!r.hasStructure && (
          <button type="button" className="bd-btn-primary relative z-[1] !h-8 !rounded-[10px] !px-3 !text-[12px]" onClick={() => router.push(SALARY_PROFILE(r.code, true))}>
            Assign template
          </button>
        )}
        <svg aria-hidden="true" className="shrink-0 text-[#6E6883]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>
    </div>
  );
}
