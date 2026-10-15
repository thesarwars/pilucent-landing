'use client';

/**
 * The employee roster (backend §9 `GET /employees`), as stacked two-line rows
 * (spec §7). The blocker badge is the profile's own hard-block count — the
 * same `evaluate()` on the server, never a second implementation here
 * (acceptance test 11).
 */

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Modal, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from './api';
import { ENUMS, enumLabel } from './enums';
import { initials, plural } from './format';
import { keys, useRoster, useRosterCounts } from './hooks';
import { LangProvider, useLang } from './i18n';
import type { RosterFilter, RosterRow } from './types';
import { Chip, ErrorBlock, Field, LoadingBlock, TextInput, type Tone } from './ui';
import { useDebounced } from './salary/shared';
import { mobileValid } from './validate';

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'WORKER', label: 'Workers' },
  { id: 'NON_WORKER', label: 'Non-workers' },
  { id: 'PROBATION', label: 'Unconfirmed' },
  { id: 'BLOCKED', label: 'Blocks payroll' },
];

const CATEGORY_TONE: Record<string, Tone> = {
  PERMANENT: 'violet',
  PROBATIONER: 'warn',
  TEMPORARY: 'bd',
};

const PROFILE = (code: string) => `/dashboard/hris/employee/employees/${encodeURIComponent(code)}`;

export function EmployeeRoster() {
  return (
    <LangProvider>
      <RosterScreen />
    </LangProvider>
  );
}

function RosterScreen() {
  const router = useRouter();
  const { t, n, lang } = useLang();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<RosterFilter>('ALL');
  const [page, setPage] = React.useState(1);
  const [creating, setCreating] = React.useState(false);
  const q = useDebounced(query.trim(), 300);
  React.useEffect(() => setPage(1), [q, filter]);
  const roster = useRoster({ q, filter, page });
  const counts = useRosterCounts(q);
  const rows = roster.data?.results ?? [];
  const count = roster.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / 25));

  return (
    <div className="bd" lang={lang}>
      <div className="bd-page">
        <header className="bd-list-head">
          <div className="min-w-0 flex-1">
            <h1 className="bd-title">{t('Employees', 'employees')}</h1>
            <p className="bd-lede">
              Everyone on the payroll. Open a record to work through its eight tabs; a record with an outstanding hard block cannot reach a payroll
              run.
            </p>
          </div>
          <button type="button" className="bd-btn-primary" onClick={() => setCreating(true)}>
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add employee
          </button>
        </header>

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
              placeholder="Search a name or code"
              aria-label="Search employees"
            />
          </div>
          <div role="group" aria-label="Filter employees" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className="bd-filter">
                {f.label}
                {counts[f.id] !== undefined && <span className="bd-filter-count">{n(counts[f.id]!)}</span>}
              </button>
            ))}
          </div>
        </div>

        {roster.isPending ? (
          <LoadingBlock />
        ) : roster.isError ? (
          <div className="bd-rows">
            <ErrorBlock error={roster.error} onRetry={() => void roster.refetch()} />
          </div>
        ) : (
          <div className={cn('bd-card bd-rows transition-opacity', roster.isFetching && 'opacity-70')} aria-busy={roster.isFetching}>
            <div className="sr-only" aria-live="polite">
              {plural(count, 'employee', 'employees')}
            </div>
            {rows.length === 0 && (
              <div className="px-5 py-14 text-center">
                <div className="text-[14px] font-bold">Nobody matches</div>
                <div className="mt-1 text-[12.5px] text-[#6F6A85]">Clear the search or pick another filter.</div>
              </div>
            )}
            <ul className="m-0 list-none p-0">
              {rows.map((r, i) => (
                <li key={r.code}>
                  <RosterRowLink row={r} odd={i % 2 === 1} />
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
      {creating && <AddEmployeeModal onClose={() => setCreating(false)} onCreated={(code) => router.push(PROFILE(code))} />}
    </div>
  );
}

/**
 * One row, as a link: reachable by Tab, opened by Enter, and openable in a new
 * tab — the screen's primary navigation must not be mouse-only (spec §17.1).
 */
function RosterRowLink({ row: r, odd }: { row: RosterRow; odd: boolean }) {
  const { money } = useLang();
  const classification = enumLabel('classification', r.classification, 'Unclassified');
  return (
    <Link href={PROFILE(r.code)} className={cn('bd-row no-underline', odd && 'is-odd')}>
      <span className="bd-row-line1">
        <span aria-hidden="true" className="bd-avatar bd-avatar-sm">
          {initials(r.nameEn)}
        </span>
        <span className="truncate text-[13.5px] font-bold text-[#16172A]">{r.nameEn}</span>
        {r.nameBn && (
          <span lang="bn" className="truncate text-[12.5px] text-[#6F6A85]">
            {r.nameBn}
          </span>
        )}
        {r.fresh && <span className="bd-new">NEW</span>}
        <svg aria-hidden="true" className="ml-auto shrink-0 text-[#6E6883]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>
      <span className="bd-row-line2">
        <span className="bd-mono text-[11.5px] text-[#6E6883]">{r.code}</span>
        <span className="min-w-0 truncate">{[r.designation, r.department].filter(Boolean).join(' · ') || 'No designation'}</span>
        {r.workerCategory && <Chip tone={CATEGORY_TONE[r.workerCategory] ?? 'neutral'}>{enumLabel('workerCategory', r.workerCategory)}</Chip>}
        <span className={cn('font-semibold', r.classification ? 'text-[#44405C]' : 'text-[#8A5A06]')}>{classification}</span>
        {r.grossMonthly ? (
          <span className="bd-mono font-semibold text-[#16172A]">{money(r.grossMonthly)}</span>
        ) : (
          <Chip tone="warn">No salary structure</Chip>
        )}
        <Chip
          tone={r.blockerCount ? 'blocked' : 'ok'}
          dot
          title={r.blockerCount ? 'Open the record to see what blocks payroll.' : 'Nothing blocks payroll.'}
        >
          {r.blockerCount ? `${plural(r.blockerCount, 'item blocks', 'items block')} payroll` : 'Ready for payroll'}
        </Chip>
      </span>
    </Link>
  );
}

function AddEmployeeModal({ onClose, onCreated }: { onClose: () => void; onCreated: (code: string) => void }) {
  const qc = useQueryClient();
  const [nameEn, setNameEn] = React.useState('');
  const [nameBn, setNameBn] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [classification, setClassification] = React.useState('WORKER');
  const [error, setError] = React.useState<api.ApiError | null>(null);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const created = await api.createEmployee({ nameEn, nameBn, mobile, classification });
      await qc.invalidateQueries({ queryKey: keys.roster });
      toast.success(`${created.code} created`);
      onCreated(created.code);
    } catch (err) {
      setError(err instanceof api.ApiError ? err : null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      width={560}
      title="Add employee"
      sub="Enough to create the record. Statutory details, the salary structure and nominees come next — the record stays out of payroll until they are filled."
      footer={
        <>
          <span className="flex-1" />
          <VioletButton variant="outline" size="sm" onClick={onClose}>
            Cancel
          </VioletButton>
          <button type="button" className="bd-btn-primary" disabled={!nameEn.trim() || saving} onClick={() => void save()}>
            {saving ? 'Creating…' : 'Create record'}
          </button>
        </>
      }
    >
      <div className="bd-grid">
        <Field htmlFor="new-nameEn" label="Full name (English)" required span={6} errors={error?.messagesFor('nameEn')}>
          <TextInput id="new-nameEn" autoFocus value={nameEn} onChange={setNameEn} placeholder="As it appears on the NID" />
        </Field>
        <Field htmlFor="new-nameBn" label="Full name (Bangla)" span={6} errors={error?.messagesFor('nameBn')}>
          <TextInput id="new-nameBn" lang="bn" value={nameBn} onChange={setNameBn} placeholder="বাংলায় নাম" />
        </Field>
        <Field
          htmlFor="new-mobile"
          label="Mobile"
          span={6}
          help="Payslips and payroll notices go here."
          errors={error?.messagesFor('mobile').length ? error.messagesFor('mobile') : mobile && !mobileValid(mobile) ? ['Mobile must be 11 digits starting 01.'] : []}
        >
          <TextInput id="new-mobile" inputMode="tel" className="bd-mono" value={mobile} onChange={setMobile} placeholder="01XXXXXXXXX" />
        </Field>
      </div>
      <fieldset className="mt-4 border-0 p-0">
        <legend className="bd-label">Classification</legend>
        <div className="bd-help !mt-1">Determined by the work performed, not the job title.</div>
        <div className="mt-2 flex gap-2">
          {ENUMS.classification.map((o) => (
            <button key={o.value} type="button" aria-pressed={classification === o.value} onClick={() => setClassification(o.value)} className="bd-filter">
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
      {error && !error.errors.length && <div className="bd-error mt-3">{error.message}</div>}
    </Modal>
  );
}
