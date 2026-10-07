'use client';

import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
  CalendarClock,
  Clock,
  Plus,
  Printer,
  Settings,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { delShift, getShifts } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
} from '@/components/violet';
import { V } from '@/components/violet';
import ShiftForm from './_components/Shift';
import {
  PERIOD_META,
  PERIOD_ORDER,
  fmtTime,
  kindMeta,
  periodOf,
  shiftBands,
  type Period,
} from './_components/shiftUtils';

/* ── type tile + chip helpers ────────────────────────────────────────── */

function TypeTile({ kind }: { kind?: string }) {
  const meta = kindMeta(kind);
  const Icon = meta.Icon;
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-white"
      style={{ backgroundImage: PERIOD_META[meta.period].gradient }}
    >
      <Icon className="h-[17px] w-[17px]" />
    </span>
  );
}

function TypeChip({ kind }: { kind?: string }) {
  const meta = kindMeta(kind);
  const c = PERIOD_META[meta.period];
  const Icon = meta.Icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
      style={{ backgroundColor: c.chipBg, color: c.chipFg }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: c.bar }} />
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/* ── coverage hero ───────────────────────────────────────────────────── */

function CoverageHero({
  totalHours,
  count,
  byPeriod,
}: {
  totalHours: number;
  count: number;
  byPeriod: Record<Period, number>;
}) {
  const total = PERIOD_ORDER.reduce((a, p) => a + byPeriod[p], 0) || 1;
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[16px] p-[22px] font-jakarta text-white"
      style={{ backgroundImage: V.gradients.heroOverview }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[60px] -top-[60px] h-[180px] w-[180px] animate-v-float rounded-full"
        style={{ background: V.orb.violet }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[70px] -left-[50px] h-[170px] w-[170px] animate-v-float rounded-full"
        style={{ background: V.orb.white }}
      />
      <div className="relative flex flex-1 flex-col">
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white/55">
          Shift coverage
        </div>
        <div className="mt-1.5 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
          {totalHours}
          <span className="ml-1 text-[16px] font-bold text-white/60">hrs/day</span>
        </div>
        <div className="mt-1 text-xs text-white/60">
          {count} {count === 1 ? 'shift' : 'shifts'} · per working day
        </div>

        <span className="flex-1" />

        {/* split bar */}
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/12">
          {PERIOD_ORDER.map((p) =>
            byPeriod[p] > 0 ? (
              <span
                key={p}
                className="h-full origin-left animate-v-grow"
                style={{ width: `${(byPeriod[p] / total) * 100}%`, backgroundColor: PERIOD_META[p].bar }}
              />
            ) : null
          )}
        </div>

        {/* legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {PERIOD_ORDER.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-[11.5px] text-white/70">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: PERIOD_META[p].bar }}
              />
              {PERIOD_META[p].label}
              <span className="font-bold tabular-nums text-white/90">{byPeriod[p]}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 24-hour coverage timeline ───────────────────────────────────────── */

const RULER = ['12a', '6a', '12p', '6p', '12a'];

function CoverageTimeline({ shifts }: { shifts: any[] }) {
  return (
    <div className="flex min-w-0 flex-col rounded-[16px] border-[1.5px] border-[rgba(22,23,42,0.08)] bg-white px-[18px] pb-4 pt-[15px]">
      <div className="flex items-center gap-2.5">
        <IconChip tone="violet" size="sm">
          <Clock />
        </IconChip>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-v-ink900">Coverage timeline</div>
          <div className="text-[11px] text-v-ink400">When each shift runs across a 24-hour day</div>
        </div>
        <div className="hidden items-center gap-2.5 sm:flex">
          {PERIOD_ORDER.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-[10.5px] font-bold text-v-ink500">
              <span
                className="h-2 w-2 rounded-[3px]"
                style={{ backgroundColor: PERIOD_META[p].bar }}
              />
              {PERIOD_META[p].label}
            </div>
          ))}
        </div>
      </div>

      {/* ruler */}
      <div className="mb-1 mt-3.5 flex pl-[92px]">
        <div className="relative h-3 flex-1">
          {RULER.map((r, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 text-[9.5px] font-bold tabular-nums text-v-ink400 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(i / (RULER.length - 1)) * 100}%` }}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {shifts.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-v-ink400">
          Add a shift to see live coverage.
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {shifts.map((s, idx) => {
            const meta = PERIOD_META[periodOf(s?.in_time)];
            const bands = shiftBands(s?.in_time, s?.out_time);
            return (
              <div key={s?.uid ?? idx} className="flex items-center">
                <div className="w-[92px] shrink-0 truncate pr-2 text-[11.5px] font-bold text-v-ink900">
                  {s?.title || '—'}
                </div>
                <div className="relative h-[22px] flex-1 overflow-hidden rounded-[7px] bg-v-wash2">
                  {/* hour grid lines */}
                  {[25, 50, 75].map((l) => (
                    <span
                      key={l}
                      className="absolute top-0 h-full w-px bg-[rgba(22,23,42,0.05)]"
                      style={{ left: `${l}%` }}
                    />
                  ))}
                  {bands.map((b, bi) => (
                    <span
                      key={bi}
                      title={`${fmtTime(s?.in_time)} – ${fmtTime(s?.out_time)}`}
                      className="absolute bottom-[3px] top-[3px] origin-left animate-v-grow rounded-[5px] shadow-[0_2px_6px_-2px_rgba(22,23,42,0.3)]"
                      style={{
                        left: `${b.left}%`,
                        width: `${b.width}%`,
                        backgroundImage: meta.gradient,
                        animationDelay: `${idx * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────── */

const Shift: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const { data, isPending, setQueryParams, refetch } = useFetch(['shifts'], getShifts);

  const shifts: any[] = data?.results || data?.data || [];
  const count = data?.count ?? shifts.length;

  const { totalHours, byPeriod, roundClock } = useMemo(() => {
    const by: Record<Period, number> = { day: 0, evening: 0, night: 0 };
    const coveredHours = new Array(24).fill(false);
    shifts.forEach((s) => {
      const hrs = Number(s?.regular_hour) || 0;
      by[periodOf(s?.in_time)] += hrs;
      const a = s?.in_time ? Number(String(s.in_time).split(':')[0]) : null;
      const o = s?.out_time ? Number(String(s.out_time).split(':')[0]) : null;
      if (a != null && o != null && !Number.isNaN(a) && !Number.isNaN(o)) {
        const end = o <= a ? o + 24 : o;
        for (let h = a; h < end; h++) coveredHours[h % 24] = true;
      }
    });
    return {
      totalHours: by.day + by.evening + by.night,
      byPeriod: by,
      roundClock: shifts.length > 0 && coveredHours.every(Boolean),
    };
  }, [shifts]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      timerProgressBar: true,
      timer: 20000,
      theme: 'dark',
      background: '#181640a1',
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await delShift(id);
          if (response.success) {
            refetch();
            return response;
          }
          throw new Error('Failed');
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          background: '#181640',
          title: 'Success!',
          text: 'Shift has been deleted.',
          icon: 'success',
          color: 'white',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const columns: VListColumn[] = [
    {
      key: 'title',
      label: 'Shift',
      w: 'minmax(0,1.4fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <TypeTile kind={row?.kind} />
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
            <div className="truncate text-[11px] tabular-nums text-v-ink400">
              Code {row?.code || '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      w: 'minmax(0,1.5fr)',
      render: (row) => (
        <p className="line-clamp-1 text-[12.5px] text-v-ink700">{row?.description || '—'}</p>
      ),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      w: '150px',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-v-wash2 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-v-ink700">
          <Clock className="h-3 w-3 text-v-ink400" />
          {fmtTime(row?.in_time)} – {fmtTime(row?.out_time)}
        </span>
      ),
    },
    {
      key: 'lunch_time',
      label: 'Lunch',
      w: '96px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.lunch_time ? `${row.lunch_time} min` : '—'}
        </span>
      ),
    },
    {
      key: 'regular_hour',
      label: 'Hours',
      w: '92px',
      render: (row) => (
        <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
          {row?.regular_hour ? `${row.regular_hour}h` : '—'}
        </span>
      ),
    },
    {
      key: 'kind',
      label: 'Type',
      w: '122px',
      render: (row) => <TypeChip kind={row?.kind} />,
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Edit shift"
        onClick={() => {
          setUid(row?.uid);
          setIsOpen(true);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete shift"
        onClick={() => handleDelete(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'HRIS', href: '#' },
            { label: 'Shifts' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Shifts
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'shift' : 'shifts'}
          </Chip>
          {roundClock && (
            <Chip tone="success" dot>
              Round-the-clock cover
            </Chip>
          )}
          <span className="flex-1" />
          <VioletButton
            variant="secondary"
            size="icon"
            aria-label="Print"
            onClick={() => window.print()}
          >
            <Printer className="h-[15px] w-[15px]" />
          </VioletButton>
          <VioletButton variant="secondary" size="icon" aria-label="Settings">
            <Settings className="h-[15px] w-[15px]" />
          </VioletButton>
          <VioletButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setUid('');
              setIsOpen(true);
            }}
          >
            Create shift
          </VioletButton>
        </div>
      </div>

      {/* coverage overview */}
      <div
        className="animate-v-rise rounded-v-card bg-white p-3.5 shadow-v-card"
        style={{ animationDelay: '0.06s' }}
      >
        <div className="grid items-stretch gap-3.5 lg:grid-cols-[310px_1fr]">
          <CoverageHero totalHours={totalHours} count={count} byPeriod={byPeriod} />
          <CoverageTimeline shifts={shifts} />
        </div>
      </div>

      {/* table */}
      <VioletListTable
        icon={<CalendarClock />}
        title="All shifts"
        subtitle={(_shown, total) => `${total} working ${total === 1 ? 'shift' : 'shifts'} defined`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search shifts"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="86px"
        emptyIcon={<CalendarClock className="h-[19px] w-[19px]" />}
        emptyTitle="No shifts yet"
        emptySub="Create your first shift to start building coverage."
      />

      {/* create / edit drawer */}
      <ShiftForm isOpen={isOpen} setIsOpen={setIsOpen} uid={uid} refetch={refetch} />
    </div>
  );
};

export default Shift;
