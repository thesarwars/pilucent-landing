'use client';

/**
 * Attendance (docs/frontend/attendance.md): the month for one site, four
 * readings of one computation — the daily grid, the exceptions, month close
 * and compliance.
 *
 * Nothing derived is stored (§1.1): every figure here is recomputed by the
 * backend from punches, shifts, the published calendar and the adjustments,
 * on every read. A write is an adjustment or a decision; the screen then
 * refetches the month.
 */

import './att.css';
import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { useLookup } from '@/app/dashboard/hris/employee/employees/_bd/hooks';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useDebounced } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import { BdBadge } from '@/app/dashboard/hris/salary/_bd/parts';
import * as api from './api';
import { DayDrawer, type DayFocus } from './DayDrawer';
import { MIN_REASON, PERIOD, STATUS, monthLabel, monthOf, shiftMonth } from './defs';
import { GridView, Legend, type CellRef } from './GridView';
import { attendanceKeys, useAttendanceInvalidate, useCompliance, useGrid, useSites } from './hooks';
import { CalendarDrawer, ElectionsDrawer, ImportDrawer, ShiftsDrawer } from './Setup';
import type { DayStatus, Grid, View } from './types';
import { CloseView, ComplianceView, ExceptionsView } from './Views';

const EXCEPTION_LABELS: Record<string, string> = {
  MISSING_OUT_PUNCH: 'Missing out-punch',
  MISSING_IN_PUNCH: 'Missing in-punch',
  NO_PUNCH_ROSTERED: 'No punches but rostered',
  ABSENT_NO_LEAVE: 'Absent without leave application',
  DAILY_LIMIT_EXCEEDED: 'Daily hours above the statutory maximum',
  LATE_ARRIVAL: 'Late beyond grace',
  OT_UNAPPROVED: 'Overtime without pre-approval',
  WORKED_WEEKLY_HOLIDAY: 'Worked on weekly holiday',
  WORKED_FESTIVAL_HOLIDAY: 'Worked on festival holiday',
};

type Drawer = { kind: 'day'; at: CellRef; focus?: DayFocus } | { kind: 'calendar'; year: number } | { kind: 'shifts' } | { kind: 'import' } | { kind: 'elections' } | null;

export function Attendance() {
  return (
    <LangProvider>
      <Screen />
    </LangProvider>
  );
}

const todayISO = () => {
  const d = new Date();
  return `${monthOf(d)}-${String(d.getDate()).padStart(2, '0')}`;
};

function Screen() {
  const { lang } = useLang();
  const [today] = React.useState(todayISO);
  const [view, setView] = React.useState<View>('grid');
  const [month, setMonth] = React.useState(() => monthOf(new Date()));
  const [site, setSite] = React.useState('');
  const [dept, setDept] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [excOnly, setExcOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [drawer, setDrawer] = React.useState<Drawer>(null);
  const [reason, setReason] = React.useState('');
  const reasonRef = React.useRef<HTMLInputElement>(null);
  const q = useDebounced(query.trim(), 300);
  React.useEffect(() => setPage(1), [q, dept, excOnly, month, site]);

  const m = { site, month };
  const sites = useSites();
  const departments = useLookup('departments');
  const grid = useGrid(m, { dept, q, exceptionsOnly: excOnly, page });
  const calendarMissing = grid.error instanceof ApiError && grid.error.status === 409 && grid.error.messagesFor('calendar').length > 0;
  const compliance = useCompliance(m, !calendarMissing && !grid.isPending);
  const data = grid.data && !grid.isError ? grid.data : null;
  const period = data?.period ?? null;
  const can = data?.can;
  const editable = !!can?.write && period?.status !== 'LOCKED';

  const write = useCellWrite(m, { dept, q, exceptionsOnly: excOnly, page }, reason);

  const onSet = React.useCallback(
    (at: CellRef, status: DayStatus) => {
      if (reason.trim().length < MIN_REASON) {
        toast.warning(`Give an editing reason first (at least ${MIN_REASON} characters). Every keyboard entry is saved with it.`);
        reasonRef.current?.focus();
        return;
      }
      if (at.date > today) {
        toast.warning('A day that has not happened cannot be set.');
        return;
      }
      void write(at, status);
    },
    [reason, today, write]
  );
  const onOpen = React.useCallback((at: CellRef) => setDrawer({ kind: 'day', at }), []);
  const openDay = (code: string, date: string, focus?: DayFocus) => setDrawer({ kind: 'day', at: { code, date }, focus });

  const tabs: { id: View; label: string; count?: number }[] = [
    { id: 'grid', label: 'Daily grid' },
    { id: 'exceptions', label: 'Exceptions', count: data?.counts.exceptions },
    { id: 'close', label: 'Month close' },
    { id: 'compliance', label: 'Compliance', count: compliance.data?.count },
  ];
  const p = period ? PERIOD[period.status] : null;
  const year = Number(month.slice(0, 4));
  const missingYear = (calendarMissing && (grid.error as ApiError).consequence?.calendarYear) as number | undefined;

  return (
    <div className="bd" lang={lang}>
      <div className="bd-page !max-w-none">
        <header className="bd-list-head">
          <div className="min-w-[240px] flex-1">
            <h1 className="bd-title !text-[22px]">
              Attendance{' '}
              <span lang="bn" className="text-[14px] font-medium text-[#6E6883]">
                উপস্থিতি
              </span>
            </h1>
            <p className="bd-lede !max-w-[680px] !text-[12.5px]">
              Attendance is the input to three statutory calculations: earned-leave accrual counts days worked (s.117), overtime is paid on it (s.108), and it is the DIFE
              register. A gap here is not cosmetic.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(sites.data?.rows.length ?? 0) > 1 && (
              <select className="bd-att-select" aria-label="Site" value={site} onChange={(e) => setSite(e.target.value)}>
                {sites.data!.rows.map((s) => (
                  <option key={s.uid} value={s.isDefault ? '' : s.uid}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="bd-btn" onClick={() => setDrawer({ kind: 'calendar', year })}>
              Holiday calendar
            </button>
            <button type="button" className="bd-btn" onClick={() => setDrawer({ kind: 'shifts' })}>
              Shifts
            </button>
            <button type="button" className="bd-btn" onClick={() => setDrawer({ kind: 'import' })} disabled={can ? !can.write : false}>
              Import punches
            </button>
            <button type="button" className="bd-btn" onClick={() => setDrawer({ kind: 'elections' })} title="The overtime base and the days-worked elections">
              Payroll elections
            </button>
            <BdBadge />
          </div>
        </header>

        <div className="bd-att-controls">
          {p && period && (
            <div className="bd-att-period" title={`Attendance period state: ${p.meaning}`} style={{ background: p.bg, borderColor: p.bd }}>
              <span style={{ background: p.dot }} />
              <span style={{ color: p.c }}>{p.label}</span>
            </div>
          )}
          <div className="bd-att-tabs" role="tablist" aria-label="Views">
            {tabs.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={view === t.id} className="bd-att-tab" onClick={() => setView(t.id)}>
                {t.label}
                {t.count !== undefined && (
                  <span
                    className="bd-att-count"
                    style={t.count ? { background: 'rgba(244,63,94,0.12)', color: '#E11D48' } : { background: 'rgba(31,169,122,0.12)', color: '#157A5B' }}
                    aria-label={`${t.count} open`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="bd-att-stepper">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <span aria-live="polite">{monthLabel(month)}</span>
            <button type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
          {view === 'grid' && (
            <>
              <select className="bd-att-select" aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="">All departments</option>
                {(departments.data ?? []).map((d) => (
                  <option key={d.uid} value={d.uid}>
                    {d.title}
                  </option>
                ))}
              </select>
              <button type="button" className="bd-att-toggle" aria-pressed={excOnly} onClick={() => setExcOnly(!excOnly)}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0M12 9v4M12 17h.01" />
                </svg>
                Exceptions only
              </button>
            </>
          )}
          {(view === 'grid' || view === 'exceptions') && (
            <div className="bd-att-search">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" />
              </svg>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or code" aria-label="Search employees" />
            </div>
          )}
        </div>

        <div className="bd-att-body">
          {grid.isPending ? (
            <LoadingBlock />
          ) : calendarMissing ? (
            <CalendarMissing year={missingYear ?? year} message={(grid.error as ApiError).message} onSetUp={(y) => setDrawer({ kind: 'calendar', year: y })} />
          ) : grid.isError ? (
            <ErrorBlock error={grid.error} onRetry={() => void grid.refetch()} />
          ) : (
            data && (
              <>
                <Banners grid={data} onShifts={() => setDrawer({ kind: 'shifts' })} />
                {view === 'grid' && (
                  <GridBody
                    grid={data}
                    fetching={grid.isFetching}
                    editable={editable}
                    today={today}
                    reason={reason}
                    setReason={setReason}
                    reasonRef={reasonRef}
                    onOpen={onOpen}
                    onSet={onSet}
                    page={page}
                    setPage={setPage}
                  />
                )}
                {view === 'exceptions' && <ExceptionsView m={m} q={q} canWrite={!!can?.write} onOpen={openDay} />}
                {view === 'close' && <CloseView m={m} onOpen={openDay} onElections={() => setDrawer({ kind: 'elections' })} />}
                {view === 'compliance' && <ComplianceView m={m} onOpen={openDay} />}
              </>
            )
          )}
        </div>
      </div>

      {drawer?.kind === 'day' && <DayDrawer code={drawer.at.code} date={drawer.at.date} focus={drawer.focus} sessionReason={reason} onClose={() => setDrawer(null)} />}
      {drawer?.kind === 'calendar' && <CalendarDrawer site={site} year={drawer.year} onClose={() => setDrawer(null)} />}
      {drawer?.kind === 'shifts' && <ShiftsDrawer site={site} month={month} onClose={() => setDrawer(null)} />}
      {drawer?.kind === 'import' && <ImportDrawer site={site} onClose={() => setDrawer(null)} />}
      {drawer?.kind === 'elections' && <ElectionsDrawer canWrite={!!can?.write} onClose={() => setDrawer(null)} />}
    </div>
  );
}

/**
 * A letter typed on a cell: the cell shows the new status at once, then the
 * month refetches with what the backend computed (an absence raises its own
 * exception, for one). A refusal puts the cell back and says why.
 */
function useCellWrite(m: { site: string; month: string }, filters: { dept: string; q: string; exceptionsOnly: boolean; page: number }, reason: string) {
  const qc = useQueryClient();
  const invalidate = useAttendanceInvalidate();
  return React.useCallback(
    async (at: CellRef, status: DayStatus) => {
      const key = [...attendanceKeys.month(m.site, m.month), 'grid', filters];
      const before = qc.getQueryData<Grid>(key);
      if (before) {
        const col = before.days.findIndex((d) => d.date === at.date);
        qc.setQueryData<Grid>(key, {
          ...before,
          rows: before.rows.map((r) =>
            r.code !== at.code ? r : { ...r, days: r.days.map((c, i) => (i !== col ? c : { ...c, s: status, a: true, x: [], b: false })) }
          ),
        });
      }
      try {
        await api.adjust({ employeeCode: at.code, date: at.date, newStatus: status, reason });
      } catch (err) {
        if (before) qc.setQueryData(key, before);
        toast.error(err instanceof ApiError ? err.message : `Could not set ${STATUS[status][1].toLowerCase()}.`);
      } finally {
        void invalidate();
      }
    },
    [qc, invalidate, m.site, m.month, filters, reason]
  );
}

function GridBody({
  grid,
  fetching,
  editable,
  today,
  reason,
  setReason,
  reasonRef,
  onOpen,
  onSet,
  page,
  setPage,
}: {
  grid: Grid;
  fetching: boolean;
  editable: boolean;
  today: string;
  reason: string;
  setReason: (v: string) => void;
  reasonRef: React.RefObject<HTMLInputElement | null>;
  onOpen: (at: CellRef) => void;
  onSet: (at: CellRef, status: DayStatus) => void;
  page: number;
  setPage: (p: number) => void;
}) {
  const busy = React.useMemo(() => new Set<string>(), []);
  const locked = grid.period.status === 'LOCKED';
  const short = reason.trim().length < MIN_REASON;
  return (
    <>
      {editable && (
        <div className="bd-att-reason">
          <label htmlFor="att-reason" className="font-bold text-[#44405C]">
            Editing reason
          </label>
          <input
            ref={reasonRef}
            id="att-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Saved with every letter you type on the grid, e.g. Supervisor’s register for the week"
          />
          <span className={short ? 'text-[#8A5A06]' : 'text-[#157A5B]'}>
            {short ? `At least ${MIN_REASON} characters to set days with the keyboard` : 'Letters set the focused day'}
          </span>
        </div>
      )}
      {locked && (
        <div className="bd-att-reason">
          {monthLabel(grid.period.month)} is locked{grid.period.lockedBy ? ` by ${grid.period.lockedBy}` : ''}. The grid is read-only until the month is reopened, with a reason.
        </div>
      )}
      {grid.rows.length === 0 ? (
        grid.rosterEmpty ? null : (
          <div className="bd-section text-center">
            <div className="text-[14px] font-bold">Nobody matches</div>
            <div className="mt-1 text-[12.5px] text-[#6F6A85]">Clear the search, the department or the exceptions filter.</div>
          </div>
        )
      ) : (
        <div className={fetching ? 'opacity-80 transition-opacity' : undefined} aria-busy={fetching}>
          <GridView grid={grid} editable={editable && !short} today={today} busy={busy} excLabels={EXCEPTION_LABELS} onOpen={onOpen} onSet={onSet} />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Legend editable={editable} />
        {grid.pages > 1 && (
          <nav aria-label="Pages" className="mt-2 flex items-center gap-2 text-[12px] font-semibold text-[#6F6A85]">
            {grid.count} employees · page {page} of {grid.pages}
            <button type="button" className="bd-btn" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ‹
            </button>
            <button type="button" className="bd-btn" aria-label="Next page" disabled={page >= grid.pages} onClick={() => setPage(page + 1)}>
              ›
            </button>
          </nav>
        )}
      </div>
    </>
  );
}

/** §12: an empty month reads as “nobody worked”, which is a different claim from “no data”. */
function Banners({ grid, onShifts }: { grid: Grid; onShifts: () => void }) {
  const noShift = grid.rows.filter((r) => r.noShift).length;
  return (
    <>
      {grid.rosterEmpty && (
        <div role="status" className="bd-att-banner">
          <Triangle />
          <div>
            <strong>Roster not loaded</strong>
            <p>
              Nothing below is a statement about the month — there is no one on this site’s roster yet. Every figure reads zero because there is no roster to compute against, not
              because nobody worked.
            </p>
          </div>
        </div>
      )}
      {noShift > 0 && (
        <div role="status" className="bd-att-banner">
          <Triangle />
          <div className="flex-1">
            <strong>
              {noShift} {noShift === 1 ? 'employee has' : 'employees have'} no shift for part of the month
            </strong>
            <p>Those days cannot be computed, and the month cannot lock until each has one.</p>
          </div>
          <button type="button" className="bd-btn !border-[rgba(138,90,6,0.3)] !bg-white" onClick={onShifts}>
            Assign shifts
          </button>
        </div>
      )}
    </>
  );
}

function CalendarMissing({ year, message, onSetUp }: { year: number; message: string; onSetUp: (year: number) => void }) {
  return (
    <div className="bd-section max-w-[680px]">
      <div className="bd-eyebrow !text-[#8A5A06]">No published calendar</div>
      <h2 className="bd-section-title mt-1.5">Publish the {year} holiday calendar</h2>
      <p className="bd-section-desc">{message}</p>
      <button type="button" className="bd-btn-primary mt-4" onClick={() => onSetUp(year)}>
        Set up {year}
      </button>
    </div>
  );
}

function Triangle() {
  return (
    <svg aria-hidden="true" className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A5A06" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0M12 9v4M12 17h.01" />
    </svg>
  );
}
