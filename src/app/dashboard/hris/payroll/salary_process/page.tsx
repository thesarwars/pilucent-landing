/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import {
  fetchPayrollGeneralSettings,
  fetchPayScheduleListOnSalaryProcess,
  getSavedSalary,
} from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addsetings } from '@/app/redux/Employee/EmployeeSlice';
import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import PaycheckDetails from '../../reports/pay_check/_components/PaycheckDetails';
import {
  Breadcrumb,
  Chip,
  IconChip,
  StatTile,
  VioletButton,
  VioletListTable,
  money,
  avatarGradient,
  V,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import {
  Users,
  Play,
  Eye,
  CalendarDays,
  CalendarClock,
  Wallet,
  DollarSign,
  Percent,
  CheckCircle2,
  Plus,
  Settings,
} from 'lucide-react';

function humanizeFreq(freq: string): string {
  if (!freq) return '—';
  const map: Record<string, string> = {
    EVERY_MONTH: 'Monthly',
    EVERY_WEEK: 'Weekly',
    OTHER_WEEK: 'Bi-weekly',
    EVERY_TWO_WEEK: 'Bi-weekly',
    EVERY_TWO_WEEKS: 'Bi-weekly',
    TWICE_A_MONTH: 'Semi-monthly',
    EVERY_DAY: 'Daily',
    EVERY_YEAR: 'Yearly',
  };
  return (
    map[freq] ||
    freq
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function historyStatusMeta(status: string): { tone: VioletTone; label: string } {
  const s = `${status || ''}`.toUpperCase();
  if (s === 'FINALIZED' || s === 'PAID') return { tone: 'success', label: 'Finalized' };
  if (s === 'VOIDED' || s === 'VOID') return { tone: 'rose', label: 'Voided' };
  if (s === 'DRAFT') return { tone: 'warn', label: 'Draft' };
  if (s === 'PROCESSING') return { tone: 'violet', label: 'Processing' };
  if (s) return { tone: 'neutral', label: s.charAt(0) + s.slice(1).toLowerCase() };
  return { tone: 'neutral', label: '—' };
}

/** first finite numeric among candidates (no fabrication — returns 0 if none present) */
const num = (...vals: any[]) => {
  for (const v of vals) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};
const runTotal = (r: any) =>
  num(r?.total_cost, r?.total, r?.total_salary, r?.net_pay, r?.total_amount, r?.amount);
const runNet = (r: any) => num(r?.net_pay, r?.net, r?.net_amount, r?.total_net);
const runTax = (r: any) =>
  num(r?.total_tax, r?.total_deduction, r?.tax, r?.total_tax_amount);

const SCHEDULE_COLS = 'minmax(0,1.5fr) 130px 140px 140px 130px 90px';

const Page: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [employeeUID, setEmployeeUID] = useState<string | null>(null);
  const [payCheckUID, setPayCheckUID] = useState<string | null>(null);

  const { data, isPending, refetch } = useFetch(
    ['pay-schedules-list-on-salary-process'],
    fetchPayScheduleListOnSalaryProcess
  );
  const {
    data: historyData,
    isPending: historyIsPending,
    setQueryParams: historySetQueryParams,
  } = useFetch(['history-list-on-salary-process'], getSavedSalary);
  const { data: settingData, refetch: settingRefetch } = useFetch(
    ['generalSettings'],
    fetchPayrollGeneralSettings
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (settingData) {
      dispatch(addsetings(settingData));
    } else {
      settingRefetch();
    }
  }, [settingData]);

  useEffect(() => {
    refetch();
  }, [data]);

  const schedules: any[] = (data?.results || []).filter((row: any) => row.employee_count > 0);
  const historyRows: any[] = historyData?.results || historyData?.data || [];

  // nearest upcoming schedule = the "next payroll"
  const sortedSchedules = [...schedules].sort(
    (a, b) => new Date(a?.next_pay_date || 0).getTime() - new Date(b?.next_pay_date || 0).getTime()
  );
  const nextSchedule = sortedSchedules[0];
  const employees = Number(nextSchedule?.employee_count) || 0;
  const freq = `${nextSchedule?.pay_frequency || ''}`.toUpperCase();
  const payDate = nextSchedule?.next_pay_date;
  const daysLeft = payDate
    ? Math.max(0, Math.ceil((new Date(payDate).getTime() - Date.now()) / 86400000))
    : null;
  const cycle = /WEEK/.test(freq) ? (/TWO|OTHER/.test(freq) ? 14 : 7) : /YEAR/.test(freq) ? 365 : 30;
  const progressPct =
    daysLeft != null ? Math.max(2, Math.min(100, Math.round(((cycle - daysLeft) / cycle) * 100))) : 0;

  const acct = nextSchedule?.pay_account ?? nextSchedule?.payment_account;
  const acctLabel =
    acct && typeof acct === 'object' ? acct?.account_number || acct?.title || '' : acct || '';
  const acctLast4 = `${acctLabel}`.replace(/\D/g, '').slice(-4);

  // next-run cost estimated from the most recent finalized run (clearly an estimate)
  const lastFinalized =
    historyRows.find((r) => /finalized|paid/i.test(`${r?.status || ''}`)) || historyRows[0];
  const estCost = runTotal(lastFinalized);
  const estTax = runTax(lastFinalized);
  const estNet = runNet(lastFinalized) || Math.max(0, estCost - estTax);
  const pct = (v: number) => (estCost > 0 ? Math.round((v / estCost) * 100) : 0);

  const goRun = (uid?: string) => {
    if (uid) router.push('/dashboard/hris/payroll/run_payroll?pay_schedule_id=' + uid);
  };

  // history pill counts (current page)
  const histAll = historyRows.length;
  const histFinal = historyRows.filter((r) => /finalized|paid/i.test(`${r?.status || ''}`)).length;
  const histVoid = historyRows.filter((r) => /void/i.test(`${r?.status || ''}`)).length;

  const historyColumns: VListColumn[] = [
    {
      key: 'run',
      label: 'Run',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => {
        const mon = row?.pay_date ? moment(row.pay_date).format('MMM').toUpperCase() : '—';
        const yr = row?.pay_date ? moment(row.pay_date).format('YY') : '';
        const id =
          row?.process_no || row?.serial_number || row?.serial || (row?.uid ? `${String(row.uid).slice(0, 4)}` : '');
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-11 shrink-0 flex-col items-center justify-center rounded-[9px] bg-v-tint100 leading-none text-v-primary">
              <span className="text-[8px] font-bold uppercase tracking-wide">{mon}</span>
              <span className="text-[12px] font-extrabold tabular-nums">{yr}</span>
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-v-ink900">
                {row?.title || 'Payroll run'}
              </div>
              <div className="truncate text-[11px] text-v-ink400">
                {row?.pay_date ? `Run ${moment(row.pay_date).format('MMM D')}` : 'Run'}
                {id ? ` · #${id}` : ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'pay_date',
      label: 'Pay date',
      w: '120px',
      render: (row) => (
        <div className="text-[12.5px] tabular-nums text-v-ink700">{row?.pay_date || '—'}</div>
      ),
    },
    {
      key: 'pay_period',
      label: 'Pay period',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <div className="truncate text-[12.5px] text-v-ink700">{row?.pay_period || '—'}</div>
      ),
    },
    {
      key: 'total',
      label: 'Total cost',
      w: '130px',
      align: 'right',
      render: (row) => (
        <div className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
          {money(runTotal(row))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '120px',
      render: (row) => {
        const m = historyStatusMeta(row?.status);
        return <Chip tone={m.tone}>{m.label}</Chip>;
      },
    },
  ];

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Run payroll' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Run payroll
        </h1>
        {nextSchedule?.pay_frequency && <Chip tone="violet">{humanizeFreq(freq)} schedule</Chip>}
        <Chip tone="success">Auto taxes on</Chip>

        <span className="flex-1" />

        <Link href="/dashboard/hris/payroll/general_settings">
          <VioletButton variant="outline" leftIcon={<Settings className="h-4 w-4" />}>
            Payroll settings
          </VioletButton>
        </Link>
        <VioletButton
          variant="primary"
          leftIcon={<Play className="h-4 w-4" />}
          disabled={!nextSchedule?.uid}
          onClick={() => goRun(nextSchedule?.uid)}
        >
          Run payroll
        </VioletButton>
      </div>

      {/* overview: next-payroll hero + KPI tiles + hint */}
      <div className="mt-[18px] rounded-v-card bg-white p-3.5 shadow-v-card">
        <div className="grid gap-3.5 lg:grid-cols-[310px_1fr]">
          {/* dark next-payroll hero */}
          <div
            className="relative flex flex-col overflow-hidden rounded-v-hero px-[20px] pb-[16px] pt-4 text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroViolet }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[50px] -top-[50px] h-[180px] w-[180px] animate-v-float rounded-full"
              style={{ background: V.orb.violet }}
            />
            <div className="relative flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold uppercase tracking-[0.09em] text-white/60">
                Next payroll
              </span>
              {nextSchedule && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
                  Ready
                </span>
              )}
            </div>

            <div className="relative mt-1 text-[28px] font-extrabold tabular-nums tracking-[-0.02em]">
              {money(estCost)}
            </div>
            <div className="relative text-[11.5px] text-white/60">
              Pays {employees} employee{employees === 1 ? '' : 's'}
              {nextSchedule ? ` · ${humanizeFreq(freq)} schedule` : ''}
            </div>

            <div className="relative mt-3.5">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-white/70">
                <span>{daysLeft != null ? `Runs in ${daysLeft} days` : 'No upcoming run'}</span>
                <span className="tabular-nums">
                  {payDate ? `Pay date ${moment(payDate).format('MMM D, YYYY')}` : ''}
                </span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-white/[0.14]">
                <div
                  className="h-full origin-left animate-v-grow rounded-full bg-v-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[11.5px] text-white/70">
              <span className="truncate">
                {acctLast4 ? `Pays from account ·· ${acctLast4}` : 'Pay account on file'}
              </span>
              <span className="tabular-nums">
                {employees} employee{employees === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* KPI tiles + hint */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile
                tone="violet"
                icon={<DollarSign />}
                value={money(estCost)}
                label="Gross pay"
                sub="before taxes & deductions"
                share={`${employees} emp`}
                bar={100}
                delay={0}
              />
              <StatTile
                tone="teal"
                icon={<Percent />}
                value={money(estTax)}
                label="Taxes & deductions"
                sub="withheld automatically"
                share={`${pct(estTax)}%`}
                bar={pct(estTax)}
                delay={0.05}
              />
              <StatTile
                tone="success"
                icon={<Wallet />}
                value={money(estNet)}
                label="Net take-home"
                sub="paid to employees"
                share={`${pct(estNet)}%`}
                bar={pct(estNet)}
                delay={0.1}
              />
            </div>

            <div className="flex items-center gap-2 rounded-v-tile bg-v-wash px-3.5 py-2.5 text-[12.5px] text-v-ink700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-v-success-fg" />
              <span>
                {nextSchedule
                  ? `Everything looks ready — ${employees} salar${employees === 1 ? 'y' : 'ies'} confirmed and the account covers this run.`
                  : 'Add an active pay schedule to run payroll.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* pay schedules */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <CalendarClock />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-v-ink900">Pay schedules</div>
            <div className="text-[11.5px] text-v-ink400">Each schedule runs on its own cadence</div>
          </div>
          <span className="flex-1" />
          <Link href="/dashboard/hris/payroll/pay-schedules">
            <VioletButton variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              New schedule
            </VioletButton>
          </Link>
        </div>

        {/* column strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400"
          style={{ gridTemplateColumns: SCHEDULE_COLS }}
        >
          <div>Schedule</div>
          <div>Employees</div>
          <div>Frequency</div>
          <div>Next pay date</div>
          <div>Pay account</div>
          <div className="text-right">Action</div>
        </div>

        {isPending ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3.5"
              style={{ gridTemplateColumns: SCHEDULE_COLS }}
            >
              {Array.from({ length: 6 }).map((__, j) => (
                <div key={j} className="h-4 w-3/4 rounded bg-v-wash2" />
              ))}
            </div>
          ))
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <CalendarClock className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">No pay schedules ready</div>
            <div className="text-[13px] text-v-ink400">
              Schedules with at least one assigned employee appear here.
            </div>
          </div>
        ) : (
          schedules.map((row: any, i: number) => {
            const count = Number(row?.employee_count) || 0;
            const a = row?.pay_account ?? row?.payment_account;
            const aLabel = a && typeof a === 'object' ? a?.account_number || a?.title || '' : a || '';
            const last4 = `${aLabel}`.replace(/\D/g, '').slice(-4);
            return (
              <div
                key={row?.uid || i}
                className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 transition-colors hover:bg-[#F7F5FC]"
                style={{ gridTemplateColumns: SCHEDULE_COLS, animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-v-tint100 text-v-primary">
                    <CalendarDays className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-v-ink900">
                      {row?.title || 'Schedule'}
                    </div>
                    <div className="truncate text-[11px] text-v-ink400">
                      Salaried staff · taxes auto-calculated
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(3, count) }).map((_, k) => (
                      <span
                        key={k}
                        className="h-6 w-6 rounded-full ring-2 ring-white"
                        style={{ backgroundImage: avatarGradient(`${row?.uid}-${k}`) }}
                      />
                    ))}
                  </div>
                  <span className="text-[13px] font-bold tabular-nums text-v-ink900">{count}</span>
                </div>
                <div>
                  <Chip tone="violet">{humanizeFreq(`${row?.pay_frequency || ''}`.toUpperCase())}</Chip>
                </div>
                <div className="text-[12.5px] tabular-nums text-v-ink700">
                  {row?.next_pay_date ? moment(row.next_pay_date).format('MMM D, YYYY') : '—'}
                </div>
                <div className="text-[12.5px] tabular-nums text-v-ink700">
                  {last4 ? `·· ${last4}` : '—'}
                </div>
                <div className="flex justify-end">
                  <VioletButton
                    variant="primary"
                    size="sm"
                    leftIcon={<Play className="h-3.5 w-3.5" />}
                    onClick={() => goRun(row?.uid)}
                  >
                    Run
                  </VioletButton>
                </div>
              </div>
            );
          })
        )}

        <div className="px-[22px] py-3 text-[12px] text-v-ink400">
          {schedules.length} schedule{schedules.length === 1 ? '' : 's'} ·{' '}
          {schedules.reduce((s: number, r: any) => s + (Number(r?.employee_count) || 0), 0)} employees
          enrolled
        </div>
      </div>

      {/* process history */}
      <div className="mt-4">
        <VioletListTable
          icon={<Eye />}
          title="Process history"
          subtitle={() => 'Every payroll run, newest first'}
          data={historyData}
          loading={historyIsPending}
          setParams={historySetQueryParams}
          columns={historyColumns}
          showColumns={false}
          searchPlaceholder="Search runs"
          filters={[
            { key: 'all', label: `All ${histAll}` },
            { key: 'finalized', label: `Finalized ${histFinal}` },
            { key: 'voided', label: `Voided ${histVoid}` },
          ]}
          filterFn={(row, key) => {
            const s = `${row?.status || ''}`.toLowerCase();
            if (key === 'finalized') return /finalized|paid/.test(s);
            if (key === 'voided') return /void/.test(s);
            return true;
          }}
          renderActions={(row) => (
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setEmployeeUID(row?.employee?.uid);
                setPayCheckUID(row?.uid);
              }}
              className="flex h-8 items-center gap-1.5 rounded-[9px] bg-v-tint100 px-3 text-[12.5px] font-semibold text-v-primary transition-colors hover:bg-v-primary hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          )}
          actionLabel="Actions"
          actionWidth="96px"
          emptyIcon={<Eye className="h-[19px] w-[19px]" />}
          emptyTitle="No process history available"
          emptySub="Completed payroll runs will show up here."
        />
      </div>

      <PDFModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Paycheck History">
        <PaycheckDetails
          onClose={() => {
            setIsOpen(false);
            setEmployeeUID(null);
            setPayCheckUID(null);
          }}
          employeeUID={employeeUID as string}
          payCheckUID={payCheckUID as string}
        />
      </PDFModal>
    </div>
  );
};

export default Page;
