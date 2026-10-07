'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useFetch } from '@/app/helpers/hooks';
import { fetchEmployees } from '@/app/helpers/backend';
import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import Employee from './_components/Employee';
import EmployeeOnboard from './_components/EmployeeOnboard';
import EmployeeOnboardWizard from './_components/EmployeeOnboardWizard';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  IconChip,
  StatTile,
  VioletButton,
  avatarGradient,
  initials,
  type VioletTone,
} from '@/components/violet';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Search,
  Pencil,
  Users,
  UserCheck,
  Briefcase,
  Building2,
  Printer,
  FileText,
  UserPlus,
  PenLine,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TooltipWarning = ({ Warning }: { Warning: boolean }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 256 256"
              fill="#9A95AE"
            >
              <path
                fill="#9A95AE"
                d="M24 104h24v64H32a8 8 0 0 0 0 16h192a8 8 0 0 0 0-16h-16v-64h24a8 8 0 0 0 4.19-14.81l-104-64a8 8 0 0 0-8.38 0l-104 64A8 8 0 0 0 24 104Zm40 0h32v64H64Zm80 0v64h-32v-64Zm48 64h-32v-64h32ZM128 41.39L203.74 88H52.26ZM248 208a8 8 0 0 1-8 8H16a8 8 0 0 1 0-16h224a8 8 0 0 1 8 8Z"
              />
            </svg>
            {Warning ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="#D2483E"
                className="absolute -right-1.5 -top-1"
              >
                <path
                  fill="#D2483E"
                  d="m8.746 8l3.1-3.1a.527.527 0 1 0-.746-.746L8 7.254l-3.1-3.1a.527.527 0 1 0-.746.746l3.1 3.1l-3.1 3.1a.527.527 0 1 0 .746.746l3.1-3.1l3.1 3.1a.527.527 0 1 0 .746-.746zM8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                className="absolute -right-1.5 -top-1"
                height="14"
                viewBox="0 0 15 15"
                fill="#1FA97A"
              >
                <path
                  fill="#1FA97A"
                  fillRule="evenodd"
                  d="M0 7.5a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1-15 0Zm7.072 3.21l4.318-5.398l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768l3.392 2.827Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </TooltipTrigger>
        {Warning && (
          <TooltipContent className="flex max-w-72 flex-col items-center justify-center gap-1 border bg-white py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#D2483E"
            >
              <path
                fill="#D2483E"
                d="m21.171 15.398l-5.912-9.854C14.483 4.251 13.296 3.511 12 3.511s-2.483.74-3.259 2.031l-5.912 9.856c-.786 1.309-.872 2.705-.235 3.83C3.23 20.354 4.472 21 6 21h12c1.528 0 2.77-.646 3.406-1.771c.637-1.125.551-2.521-.235-3.831zM12 17.549c-.854 0-1.55-.695-1.55-1.549c0-.855.695-1.551 1.55-1.551s1.55.696 1.55 1.551c0 .854-.696 1.549-1.55 1.549zm1.633-7.424c-.011.031-1.401 3.468-1.401 3.468c-.038.094-.13.156-.231.156s-.193-.062-.231-.156l-1.391-3.438a1.776 1.776 0 0 1-.129-.655c0-.965.785-1.75 1.75-1.75a1.752 1.752 0 0 1 1.633 2.375z"
              />
            </svg>
            <p className="text-center text-sm font-light text-black">
              Bank account not linked to direct deposit or may not verified
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

type EmpCol = {
  key: string;
  label: string;
  w: string;
  align?: 'left' | 'right' | 'center';
};
const COLUMNS: EmpCol[] = [
  { key: 'employee', label: 'Employee', w: 'minmax(0,1.6fr)' },
  { key: 'designation', label: 'Designation', w: 'minmax(0,1.1fr)' },
  { key: 'department', label: 'Department', w: 'minmax(0,1fr)' },
  { key: 'type', label: 'Type', w: '116px' },
  { key: 'joined', label: 'Joined', w: '110px' },
  { key: 'mobile', label: 'Mobile', w: '130px' },
  { key: 'status', label: 'Status', w: '100px' },
];
const GRID = `${COLUMNS.map((c) => c.w).join(' ')} 60px`;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const ADD_PATHS = [
  {
    key: 'SELF_ONBOARD_WITH_I9',
    icon: <FileText className="h-4 w-4" />,
    title: 'Self-onboard + I-9',
    sub: 'Send a link, collect Form I-9',
  },
  {
    key: 'SELF_ONBOARD',
    icon: <UserPlus className="h-4 w-4" />,
    title: 'Self-onboard',
    sub: 'They enter their own details',
  },
  {
    key: 'MANUAL',
    icon: <PenLine className="h-4 w-4" />,
    title: 'Enter all info myself',
    sub: 'Fill everything in now',
  },
];

function typeMeta(kind: string): { tone: VioletTone; label: string } {
  const k = `${kind || ''}`.toUpperCase();
  if (k === 'FULL_TIME') return { tone: 'success', label: 'Full-time' };
  if (k === 'PART_TIME') return { tone: 'warn', label: 'Part-time' };
  if (k === 'CONTRACT') return { tone: 'teal', label: 'Contract' };
  if (k)
    return {
      tone: 'neutral',
      label: k.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    };
  return { tone: 'neutral', label: '—' };
}

function statusMeta(status: string): { tone: VioletTone; label: string } {
  return status === 'ACTIVE'
    ? { tone: 'success', label: 'Active' }
    : { tone: 'neutral', label: 'Inactive' };
}

function pageRange(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', count];
  if (page >= count - 3) return [1, '…', count - 4, count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

const Page = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [selectOnboardType, setSelectOnboardType] = useState<any>('');
  const addRef = useRef<HTMLDivElement>(null);
  const { data, isPending, refetch, setQueryParams } = useFetch(['employees'], fetchEmployees);

  // table UI state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setQueryParams?.({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setShowOnboard(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    setQueryParams?.({ page: 1, limit, search: v });
  };
  const goPage = (p: number) => {
    setPage(p);
    setQueryParams?.({ page: p, limit, search });
  };
  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
    setQueryParams?.({ page: 1, limit: l, search });
  };

  const choosePath = (key: string) => {
    setShowOnboard(false);
    setSelectOnboardType(key);
    // "Enter all info myself" (MANUAL) → full 9-step wizard;
    // the self-onboard options keep the existing popup.
    if (key === 'MANUAL') {
      setWizardOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const results: any[] = data?.results || data?.data || [];
  const total = data?.count ?? results.length;
  const activeCount = results.filter((r) => r?.status === 'ACTIVE').length;
  const fullTimeCount = results.filter((r) => `${r?.kind}`.toUpperCase() === 'FULL_TIME').length;
  const deptCount = new Set(results.map((r) => r?.department?.title).filter(Boolean)).size;

  const filtered = results.filter((r) =>
    filter === 'active'
      ? r?.status === 'ACTIVE'
      : filter === 'inactive'
        ? r?.status !== 'ACTIVE'
        : true
  );

  const pageCount = Math.max(1, Math.ceil(total / limit));
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
      setQueryParams?.({ page: pageCount, limit, search });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  const pages = pageRange(page, pageCount);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const renderCell = (key: string, row: any) => {
    if (key === 'employee') {
      const name = `${row?.user?.first_name || ''} ${row?.user?.middle_name || ''} ${
        row?.user?.last_name || ''
      }`
        .replace(/\s+/g, ' ')
        .trim();
      const isWarning =
        row?.banaking_informations?.kind == 'BANK_TRANSFER' && !row?.is_banking_info_verified;
      return (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ backgroundImage: avatarGradient(name || row?.uid || '?') }}
          >
            {initials(name || '?')}
          </span>
          <Link
            href={`/dashboard/hris/employee/employees/summary/${row?.uid}`}
            className="min-w-0"
          >
            <span className="block truncate text-[13.5px] font-bold text-v-ink900 hover:text-v-primary">
              {name || '—'}
            </span>
            {row?.user?.email && (
              <span className="block truncate text-[11px] text-v-ink400">{row.user.email}</span>
            )}
          </Link>
          {row?.banaking_informations?.kind == 'BANK_TRANSFER' && (
            <span className="ml-1 shrink-0">
              <TooltipWarning Warning={isWarning} />
            </span>
          )}
        </div>
      );
    }
    if (key === 'designation') {
      return (
        <div className="truncate text-[12.5px] text-v-ink700">{row?.designation?.title || '—'}</div>
      );
    }
    if (key === 'department') {
      return (
        <div className="truncate text-[12.5px] text-v-ink500">{row?.department?.title || '—'}</div>
      );
    }
    if (key === 'type') {
      const m = typeMeta(row?.kind);
      return <Chip tone={m.tone}>{m.label}</Chip>;
    }
    if (key === 'joined') {
      return (
        <div className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.offer_date ? moment(row.offer_date).format('DD MMM YYYY') : '—'}
        </div>
      );
    }
    if (key === 'mobile') {
      return (
        <div className="truncate text-[12.5px] tabular-nums text-v-ink700">
          {row?.phone_number || '—'}
        </div>
      );
    }
    if (key === 'status') {
      const m = statusMeta(row?.status);
      return <Chip tone={m.tone}>{m.label}</Chip>;
    }
    return null;
  };

  return (
    <div className="relative font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Employees' },
        ]}
      />

      {/* header */}
      <div className="relative z-[60] mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Employees
        </h1>
        <Chip tone="violet">{total}</Chip>

        <span className="flex-1" />

        <button
          type="button"
          onClick={() => window.print()}
          title="Print"
          className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <Printer className="h-[18px] w-[18px]" />
        </button>

        {/* Add employee split button */}
        <div className="relative flex items-center" ref={addRef}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-l-v-btn bg-v-primary px-4 text-[13.5px] font-bold text-white shadow-v-btn transition-colors hover:bg-v-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add employee
          </button>
          <button
            type="button"
            onClick={() => setShowOnboard((v) => !v)}
            aria-label="Onboarding options"
            className="flex h-10 items-center rounded-r-v-btn bg-[#6B3FE8] px-2.5 text-white shadow-v-btn transition-colors hover:bg-[#5B33D6]"
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showOnboard && 'rotate-180')}
            />
          </button>

          {showOnboard && (
            <div className="absolute right-0 top-12 z-[70] w-[320px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-2 shadow-v-modal">
              {ADD_PATHS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => choosePath(p.key)}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-v-wash"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-v-tint100 text-v-primary">
                    {p.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-v-ink900">{p.title}</span>
                    <span className="block text-[11.5px] text-v-ink400">{p.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-[18px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatTile tone="violet" icon={<Users />} value={total} label="Total employees" sub="In roster" delay={0} />
        <StatTile
          tone="success"
          icon={<UserCheck />}
          value={activeCount}
          label="Active"
          sub="On this page"
          delay={0.05}
        />
        <StatTile
          tone="teal"
          icon={<Briefcase />}
          value={fullTimeCount}
          label="Full-time"
          sub="On this page"
          delay={0.1}
        />
        <StatTile
          tone="warn"
          icon={<Building2 />}
          value={deptCount}
          label="Departments"
          sub="On this page"
          delay={0.15}
        />
      </div>

      {/* table card */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Users />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-v-ink900">Employee list</div>
            <div className="text-[11.5px] text-v-ink400">
              {filtered.length} of {total} · {activeCount} active
            </div>
          </div>

          <span className="flex-1" />

          <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  filter === f.key
                    ? 'bg-white text-v-primary shadow-sm'
                    : 'text-v-ink500 hover:text-v-ink900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search name, email, role"
              className="w-[230px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>
        </div>

        {/* column strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5"
          style={{ gridTemplateColumns: GRID }}
        >
          {COLUMNS.map((c) => (
            <div
              key={c.key}
              className={cn(
                'text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400',
                c.align === 'right' && 'text-right'
              )}
            >
              {c.label}
            </div>
          ))}
          <div className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400">
            Edit
          </div>
        </div>

        {/* body */}
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
              style={{ gridTemplateColumns: GRID }}
            >
              {COLUMNS.map((c) => (
                <div key={c.key} className="h-4 w-3/4 rounded bg-v-wash2" />
              ))}
              <div className="ml-auto h-7 w-7 rounded bg-v-wash2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Users className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">No employees found</div>
            <div className="text-[13px] text-v-ink400">Try a different search or filter.</div>
          </div>
        ) : (
          filtered.map((row, i) => (
            <div
              key={row?.uid || i}
              className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors hover:bg-[#F7F5FC]"
              style={{ gridTemplateColumns: GRID, animationDelay: `${i * 0.03}s` }}
            >
              {COLUMNS.map((c) => (
                <div key={c.key} className="min-w-0">
                  {renderCell(c.key, row)}
                </div>
              ))}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  aria-label="Edit employee"
                  onClick={() => router.push(`/dashboard/hris/employee/employees/${row?.uid}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* footer / pager */}
        <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
          <span className="text-[12.5px] text-v-ink400">
            {total === 0 ? 'No employees' : `Showing ${start}–${end} of ${total}`}
          </span>
          <span className="flex-1" />
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-v-ink400">Rows</span>
            <select
              value={limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              className="cursor-pointer rounded-[8px] bg-v-wash2 px-2 py-1 text-[12.5px] font-semibold text-v-ink700 outline-none"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => page > 1 && goPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
            >
              ‹
            </button>
            {pages.map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="px-1 text-v-ink400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goPage(p)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[8px] text-[12.5px] font-semibold tabular-nums transition-colors',
                    p === page ? 'bg-v-primary text-white' : 'text-v-ink500 hover:bg-v-wash2'
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => page < pageCount && goPage(page + 1)}
              disabled={page >= pageCount}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <PDFModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bgClass="bg-accent_bluish_gray"
        title="Employee Self Onboard"
      >
        <Employee setIsOpen={setIsOpen} refetch={refetch} />
      </PDFModal>
      <EmployeeOnboard
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        refetch={refetch}
        onboardingKind={selectOnboardType}
        setOnboardingKind={setSelectOnboardType}
      />
      <EmployeeOnboardWizard
        isOpen={wizardOpen}
        setIsOpen={setWizardOpen}
        refetch={refetch}
        onboardingKind={selectOnboardType}
      />
    </div>
  );
};

export default Page;
