'use client';

/**
 * The daily grid (spec §7): every employee × every day, two-axis sticky.
 *
 * Focus is roving: one cell is in the tab order, arrows move it, and a move
 * is an index into a flat ref array, never a DOM query (§7.6). Six letters
 * set a status; each write is an adjustment with the session's editing
 * reason, because the backend refuses a correction without one.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { STATUS, STATUS_KEYS, hoursDecimal, shortDate, weekdayName } from './defs';
import type { Cell, DayStatus, Grid, GridDay, GridRow } from './types';

export interface CellRef {
  code: string;
  date: string;
}

interface Props {
  grid: Grid;
  editable: boolean;
  today: string;
  busy: ReadonlySet<string>;
  excLabels: Record<string, string>;
  onOpen: (at: CellRef) => void;
  onSet: (at: CellRef, status: DayStatus) => void;
}

export function GridView({ grid, editable, today, busy, excLabels, onOpen, onSet }: Props) {
  const rows = grid.rows;
  const days = grid.days;
  const D = days.length;
  const [pos, setPos] = React.useState({ r: 0, c: Math.max(0, days.findIndex((d) => d.date === today)) });
  const cells = React.useRef<(HTMLButtonElement | null)[]>([]);
  const moved = React.useRef(false);

  // Keep the focus inside the grid when the roster or month changes under it.
  const r = Math.min(pos.r, Math.max(0, rows.length - 1));
  const c = Math.min(pos.c, Math.max(0, D - 1));

  React.useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const el = cells.current[r * D + c];
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [r, c, D]);

  const move = (nr: number, nc: number) => {
    moved.current = true;
    setPos({ r: Math.max(0, Math.min(rows.length - 1, nr)), c: Math.max(0, Math.min(D - 1, nc)) });
  };

  const focusCell = React.useCallback((ri: number, col: number) => setPos({ r: ri, c: col }), []);
  const register = React.useCallback((at: number, el: HTMLButtonElement | null) => {
    cells.current[at] = el;
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || !rows.length) return;
    if (!(e.target as HTMLElement).dataset.cell) return;
    const at = { code: rows[r].code, date: days[c].date };
    const moves: Record<string, [number, number]> = {
      ArrowRight: [r, c + 1],
      ArrowLeft: [r, c - 1],
      ArrowDown: [r + 1, c],
      ArrowUp: [r - 1, c],
      Home: [r, 0],
      End: [r, D - 1],
      PageDown: [r + 1, c],
      PageUp: [r - 1, c],
    };
    const to = moves[e.key];
    if (to) {
      e.preventDefault();
      move(to[0], to[1]);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(at);
      return;
    }
    const status = STATUS_KEYS[e.key.toLowerCase()];
    if (status && editable) {
      e.preventDefault();
      onSet(at, status);
    }
  };

  return (
    <div
      role="grid"
      aria-label="Attendance grid — arrow keys move, letters set status, Enter opens the day"
      aria-rowcount={rows.length + 1}
      aria-colcount={D + 2}
      className="bd-att-gridwrap"
      onKeyDown={onKeyDown}
    >
      <div className="bd-att-grid">
        <div role="row" className="bd-att-row is-head">
          <div role="columnheader" className="bd-att-emp">
            Employee
          </div>
          {days.map((d) => (
            <DayHead key={d.date} day={d} isToday={d.date === today} />
          ))}
          <div role="columnheader" className="bd-att-ot" title="Overtime hours this month">
            OT hrs
          </div>
        </div>
        {rows.map((row, i) => (
          <Row
            key={row.code}
            row={row}
            index={i}
            days={days}
            focusCol={i === r ? c : null}
            busy={busy}
            excLabels={excLabels}
            register={register}
            onFocusCell={focusCell}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

function DayHead({ day, isToday }: { day: GridDay; isToday: boolean }) {
  const kind = { WEEKLY: 'is-weekly', HOLIDAY: 'is-holiday', HALF: 'is-half', WORKING: '' }[day.kind];
  const what = day.name ?? (day.kind === 'WEEKLY' ? 'Weekly holiday' : day.kind === 'HALF' ? 'Half day' : '');
  return (
    <div role="columnheader" className={cn('bd-att-dh', kind, isToday && 'is-today')} title={[shortDate(day.date), what].filter(Boolean).join(' · ')}>
      <div className="bd-att-dh-num">{day.num}</div>
      <div className="bd-att-dh-dow" aria-hidden="true">
        {day.dow}
      </div>
      <span className="sr-only">{weekdayName(day.date)}</span>
    </div>
  );
}

const Row = React.memo(function Row({
  row,
  index,
  days,
  focusCol,
  busy,
  excLabels,
  register,
  onFocusCell,
  onOpen,
}: {
  row: GridRow;
  index: number;
  days: GridDay[];
  focusCol: number | null;
  busy: ReadonlySet<string>;
  excLabels: Record<string, string>;
  register: (at: number, el: HTMLButtonElement | null) => void;
  onFocusCell: (row: number, col: number) => void;
  onOpen: (at: CellRef) => void;
}) {
  const D = days.length;
  const kinds = row.exceptionKinds.map((k) => excLabels[k] ?? k).join(', ');
  return (
    <div role="row" className={cn('bd-att-row', index % 2 === 1 && 'is-odd')}>
      <div role="rowheader" className="bd-att-emp">
        <div className="bd-att-name">
          <span title={row.nameEn}>{row.nameEn}</span>
          {row.openExceptions > 0 && (
            <span className="bd-att-badge" title={kinds} aria-label={`${row.openExceptions} open: ${kinds}`}>
              {row.openExceptions}
            </span>
          )}
          {row.noShift && (
            <span className="bd-att-noshift" title="No shift for part of the month: those days cannot be computed">
              No shift
            </span>
          )}
        </div>
        <div className="bd-att-meta">{[row.code, row.department, row.shift?.code].filter(Boolean).join(' · ')}</div>
      </div>
      {row.days.map((cell, col) => (
        <DayCell
          key={days[col].date}
          cell={cell}
          day={days[col]}
          name={row.nameEn}
          focusable={focusCol === col}
          busy={busy.has(`${row.code}:${days[col].date}`)}
          excLabels={excLabels}
          refCb={(el) => register(index * D + col, el)}
          onFocus={() => onFocusCell(index, col)}
          onClick={() => onOpen({ code: row.code, date: days[col].date })}
        />
      ))}
      <div role="gridcell" className="bd-att-ot">
        {row.otMinutes ? hoursDecimal(row.otMinutes) : '—'}
      </div>
    </div>
  );
});

function describe(cell: Cell, excLabels: Record<string, string>): { glyph: string; label: string; bg?: string; ink?: string; cls?: string } {
  if (cell.p) return { glyph: '·', label: 'Not yet', cls: 'is-pending' };
  if (cell.n) return { glyph: '—', label: 'No shift: cannot be computed', ink: '#8A5A06' };
  if (!cell.s) return { glyph: '', label: 'Not employed', cls: 'is-off' };
  const [glyph, label, bg, ink] = STATUS[cell.s];
  const open = cell.x.map((k) => excLabels[k] ?? k);
  const text = [label, cell.ot ? `${hoursDecimal(cell.ot)}h overtime` : '', cell.a ? 'adjusted' : '', open.length ? `open: ${open.join(', ')}` : '']
    .filter(Boolean)
    .join(', ');
  // Only an exception that blocks the month recolours the day; the rest are a dot.
  if (cell.b) return { glyph, label: text, bg: STATUS.EXCEPTION[2], ink: STATUS.EXCEPTION[3] };
  return { glyph, label: text, bg, ink };
}

const DayCell = React.memo(function DayCell({
  cell,
  day,
  name,
  focusable,
  busy,
  excLabels,
  refCb,
  onFocus,
  onClick,
}: {
  cell: Cell;
  day: GridDay;
  name: string;
  focusable: boolean;
  busy: boolean;
  excLabels: Record<string, string>;
  refCb: (el: HTMLButtonElement | null) => void;
  onFocus: () => void;
  onClick: () => void;
}) {
  const d = describe(cell, excLabels);
  const medium = !cell.b && cell.x.length > 0;
  return (
    <button
      ref={refCb}
      type="button"
      role="gridcell"
      data-cell="1"
      tabIndex={focusable ? 0 : -1}
      aria-label={`${name}, ${shortDate(day.date)}: ${d.label}`}
      title={`${shortDate(day.date)} · ${d.label}`}
      className={cn('bd-att-cell', d.cls, cell.a && 'is-adjusted', busy && 'is-busy')}
      style={d.bg ? { background: d.bg, color: d.ink } : d.ink ? { color: d.ink } : undefined}
      onFocus={onFocus}
      onClick={onClick}
    >
      {d.glyph}
      {medium && <span aria-hidden="true" className="bd-att-flag" />}
    </button>
  );
});

/** The legend: what each glyph means, and the six letters that set one. */
export function Legend({ editable }: { editable: boolean }) {
  const keyOf = Object.fromEntries(Object.entries(STATUS_KEYS).map(([k, s]) => [s, k]));
  const order: DayStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'LEAVE_WITHOUT_PAY', 'ON_DUTY', 'HOLIDAY', 'WEEKLY_HOLIDAY', 'EXCEPTION'];
  return (
    <div className="bd-att-legend" aria-label="Legend">
      {order.map((s) => (
        <span key={s}>
          <span className="bd-att-key" style={{ background: STATUS[s][2], color: STATUS[s][3] }}>
            {STATUS[s][0]}
          </span>
          {STATUS[s][1]}
          {editable && keyOf[s] && <kbd className="bd-att-kbd">{keyOf[s]}</kbd>}
        </span>
      ))}
      <span>
        <span className="bd-att-key relative" style={{ background: 'rgba(22,23,42,0.05)' }}>
          <span aria-hidden="true" className="absolute right-0 top-0 h-0 w-0 border-l-[7px] border-t-[7px] border-l-transparent border-t-[#7C4DFF]" />
        </span>
        Adjusted
      </span>
      <span>
        <span className="bd-att-key relative" style={{ background: 'rgba(22,23,42,0.05)' }}>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#F5B22E]" />
        </span>
        Late or overtime to review
      </span>
    </div>
  );
}
