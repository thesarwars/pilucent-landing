'use client';

/**
 * The employee roster (backend §9 `GET /employees`). The blocker badge is the
 * profile's own hard-block count — the same `evaluate()` on the server, never
 * a second implementation here (acceptance test 11).
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, PageHeader, VioletButton, VioletSurface, avatarGradient } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from './api';
import { ENUMS, enumLabel } from './enums';
import { initials, plural } from './format';
import { keys, useRoster } from './hooks';
import { LangProvider, useLang } from './i18n';
import type { RosterFilter } from './types';
import { ErrorBlock, Field, LoadingBlock, TextInput } from './ui';
import { useDebounced } from './salary/shared';
import { mobileValid } from './validate';
import { useQueryClient } from '@tanstack/react-query';

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'WORKER', label: 'Workers' },
  { id: 'NON_WORKER', label: 'Non-workers' },
  { id: 'PROBATION', label: 'Unconfirmed' },
  { id: 'BLOCKED', label: 'Blocks payroll' },
];

const CATEGORY_TONE: Record<string, string> = {
  PERMANENT: 'bg-[rgba(124,77,255,0.12)] text-v-primary-deep',
  PROBATIONER: 'bg-[rgba(245,158,11,0.16)] text-[#92400E]',
  TEMPORARY: 'bg-[rgba(34,211,238,0.14)] text-[#0E7490]',
};

export function EmployeeRoster() {
  return (
    <LangProvider>
      <RosterScreen />
    </LangProvider>
  );
}

function RosterScreen() {
  const router = useRouter();
  const { money, date, t } = useLang();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<RosterFilter>('ALL');
  const [page, setPage] = React.useState(1);
  const [creating, setCreating] = React.useState(false);
  const q = useDebounced(query.trim(), 300);
  React.useEffect(() => setPage(1), [q, filter]);
  const roster = useRoster({ q, filter, page });
  const rows = roster.data?.results ?? [];
  const count = roster.data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / 25));
  const open = (code: string) => router.push(`/dashboard/hris/employee/employees/${encodeURIComponent(code)}`);

  return (
    <VioletSurface className="min-h-screen px-4 pb-16 pt-5 md:px-6">
      <div className="mx-auto max-w-[1280px] space-y-4">
        <PageHeader
          crumbs={[{ label: 'HRIS' }, { label: t('Employees', 'employees') }]}
          title={t('Employees', 'employees')}
          sub="Everyone on the payroll. Open a record to work through its eight tabs; a record with an outstanding hard block cannot reach a payroll run."
          right={
            <VioletButton leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              Add employee
            </VioletButton>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1 md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-v-ink400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a name or code"
              aria-label="Search employees"
              className="w-full rounded-v-input border border-white/90 bg-white/70 py-2.5 pl-9 pr-3.5 text-[13px] font-medium text-v-ink900 outline-none backdrop-blur-md placeholder:text-v-ink400 focus:border-v-primary"
            />
          </div>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[12px] transition-colors',
                filter === f.id ? 'border-v-ink900 bg-v-ink900 font-bold text-white' : 'border-white/90 bg-white/60 font-semibold text-v-ink700 hover:text-v-ink900'
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="flex-1" />
          <span className="text-[12px] font-semibold text-v-ink500">{roster.data ? plural(count, 'employee', 'employees') : ''}</span>
        </div>

        {roster.isPending ? (
          <LoadingBlock />
        ) : roster.isError ? (
          <ErrorBlock error={roster.error} onRetry={() => void roster.refetch()} />
        ) : (
          <div className={cn('overflow-hidden rounded-v-card bg-white shadow-v-card transition-opacity', roster.isFetching && 'opacity-70')}>
            <div className="hidden grid-cols-[2.2fr_1.6fr_1.2fr_1fr_1fr] gap-3 border-b border-[rgba(22,23,42,0.07)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.05em] text-v-ink400 md:grid">
              <span>Employee</span>
              <span>Role</span>
              <span>Category</span>
              <span className="text-right">Gross monthly</span>
              <span className="text-right">Payroll</span>
            </div>
            {rows.length === 0 && (
              <div className="px-5 py-14 text-center">
                <div className="text-[14px] font-bold text-v-ink900">Nobody matches</div>
                <div className="mt-1 text-[12.5px] text-v-ink500">Clear the search or pick another filter.</div>
              </div>
            )}
            {rows.map((r, i) => (
              <div
                key={r.code}
                role="button"
                tabIndex={0}
                onClick={() => open(r.code)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open(r.code)}
                className={cn(
                  'grid cursor-pointer grid-cols-1 gap-2 border-b border-[rgba(22,23,42,0.05)] px-5 py-3.5 outline-none transition-colors hover:bg-v-tint50 focus-visible:bg-v-tint50 md:grid-cols-[2.2fr_1.6fr_1.2fr_1fr_1fr] md:items-center md:gap-3',
                  i % 2 ? 'bg-white' : 'bg-[rgba(246,244,252,0.5)]'
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-[13px] font-extrabold text-white"
                    style={{ backgroundImage: avatarGradient(r.nameEn || r.code) }}
                  >
                    {initials(r.nameEn)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-bold text-v-ink900">{r.nameEn}</span>
                      {r.nameBn && (
                        <span lang="bn" className="truncate text-[12.5px] text-v-ink500">
                          {r.nameBn}
                        </span>
                      )}
                      {r.fresh && <span className="rounded-full bg-v-primary px-1.5 py-px text-[9.5px] font-extrabold text-white">NEW</span>}
                    </span>
                    <span className="block font-mono text-[11.5px] text-v-ink400">
                      {r.code}
                      {r.dateOfJoining ? ` · joined ${date(r.dateOfJoining)}` : ''}
                    </span>
                  </span>
                </div>
                <span className="truncate text-[12.5px] text-v-ink700">{[r.designation, r.department].filter(Boolean).join(' · ') || '—'}</span>
                <span className="flex flex-wrap items-center gap-1.5">
                  {r.workerCategory && (
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', CATEGORY_TONE[r.workerCategory] ?? 'bg-[rgba(22,23,42,0.07)] text-v-ink500')}>
                      {enumLabel('workerCategory', r.workerCategory)}
                    </span>
                  )}
                  <span className="text-[11.5px] font-semibold text-v-ink500">{enumLabel('classification', r.classification, 'Unclassified')}</span>
                </span>
                <span className={cn('text-[13px] font-bold tabular-nums md:text-right', r.grossMonthly ? 'text-v-ink900' : 'text-[#B45309]')}>
                  {r.grossMonthly ? money(r.grossMonthly) : 'No structure'}
                </span>
                <span className="md:text-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-bold',
                      r.blockerCount ? 'bg-[rgba(225,29,72,0.1)] text-[#BE123C]' : 'bg-[rgba(31,169,122,0.13)] text-[#157A5B]'
                    )}
                    title={r.blockerCount ? 'Open the record to see what blocks payroll.' : 'Nothing blocks payroll.'}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {r.blockerCount ? `${plural(r.blockerCount, 'block', 'blocks')}` : 'Clear'}
                  </span>
                </span>
              </div>
            ))}
            {pages > 1 && (
              <div className="flex items-center justify-end gap-2 px-5 py-3 text-[12px] font-semibold text-v-ink500">
                Page {page} of {pages}
                <VioletButton variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </VioletButton>
                <VioletButton variant="outline" size="icon" aria-label="Next page" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </VioletButton>
              </div>
            )}
          </div>
        )}
      </div>
      {creating && <AddEmployeeModal onClose={() => setCreating(false)} onCreated={open} />}
    </VioletSurface>
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
      icon={<Plus />}
      title="Add employee"
      sub="Enough to create the record. Statutory details, the salary structure and nominees come next — the record stays out of payroll until they are filled."
      footer={
        <>
          <span className="flex-1" />
          <VioletButton variant="outline" size="sm" onClick={onClose}>
            Cancel
          </VioletButton>
          <VioletButton size="sm" disabled={!nameEn.trim() || saving} onClick={() => void save()}>
            {saving ? 'Creating…' : 'Create record'}
          </VioletButton>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
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
          errors={error?.messagesFor('mobile').length ? error.messagesFor('mobile') : mobile && !mobileValid(mobile) ? ['Mobile must be 11 digits starting 01.'] : []}
        >
          <TextInput id="new-mobile" inputMode="tel" value={mobile} onChange={setMobile} placeholder="01XXXXXXXXX" />
        </Field>
      </div>
      <div className="mt-4">
        <div className="text-xs font-semibold text-v-ink700">Classification</div>
        <div className="mt-1 text-[11.5px] text-v-ink400">Determined by the work performed, not the job title.</div>
        <div className="mt-2 flex gap-2">
          {ENUMS.classification.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={classification === o.value}
              onClick={() => setClassification(o.value)}
              className={cn(
                'rounded-[11px] px-4 py-2 text-[12.5px] font-bold transition-colors',
                classification === o.value ? 'bg-v-primary text-white' : 'bg-v-wash2 text-v-ink700 hover:text-v-ink900'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {error && !error.errors.length && <div className="mt-3 text-[12px] font-semibold text-[#E11D48]">{error.message}</div>}
    </Modal>
  );
}
