'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import PDFModal from '../../reports/_components/PDFModal';
import ReviewOpenSalesTax from './_components/ReviewOpenSalesTax';
import ReviewDueSalesTax from './_components/ReviewDueSalesTax';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAgencies, fetchAgencyTaxTracker } from '@/app/helpers/backend';
import type { TaxTrackerData } from './_components/TaxSlider';
import {
  Breadcrumb,
  Chip,
  StatTile,
  VioletButton,
  VioletListTable,
  money,
  V,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import {
  SlidersHorizontal,
  CalendarClock,
  ChevronDown,
  DollarSign,
  CircleSlash,
  Receipt,
  Info,
  FileCheck,
} from 'lucide-react';

function statusMeta(status: string): { tone: VioletTone; label: string } {
  const s = `${status || ''}`.toLowerCase();
  if (s.includes('paid')) return { tone: 'success', label: 'Paid' };
  if (s.includes('overdue') || s.includes('late')) return { tone: 'danger', label: 'Overdue' };
  if (s.includes('pending') || s.includes('due')) return { tone: 'warn', label: 'Pending' };
  if (s.includes('accru')) return { tone: 'violet', label: 'Accruing' };
  if (status) return { tone: 'neutral', label: status };
  return { tone: 'neutral', label: '—' };
}

function freqLabel(freq: string): string {
  const f = `${freq || ''}`.toUpperCase();
  if (f.includes('MONTH')) return 'monthly';
  if (f.includes('QUART')) return 'quarterly';
  if (f.includes('YEAR') || f.includes('ANNUAL')) return 'yearly';
  if (f.includes('WEEK')) return 'weekly';
  return `${freq || ''}`.toLowerCase().replace(/_/g, ' ');
}

const needsFiling = (status: string) =>
  /overdue|pending|due/i.test(`${status || ''}`) && !/paid/i.test(`${status || ''}`);

const Page = () => {
  const { data, isPending } = useFetch(['agency_list'], fetchAgencies);
  const agencies: any[] = data?.results || [];

  const [selectedAgencyUid, setSelectedAgencyUid] = useState('');
  const [taxTrackerData, setTaxTrackerData] = useState<TaxTrackerData[]>([]);
  const [agencyOpen, setAgencyOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDueOpen, setIsDueOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const agencyRef = useRef<HTMLDivElement>(null);

  const selectedAgency = agencies.find((a) => a.uid === selectedAgencyUid) || agencies[0];
  const selectedAgencyName = selectedAgency?.title || '';

  // fetch the per-agency tracker — same call/transform as the old slider
  const fetchTaxTracker = async (agencyUid: string) => {
    if (!agencyUid) return;
    try {
      const response = await fetchAgencyTaxTracker(agencyUid);
      if (response && !response.error && response.data) {
        setTaxTrackerData([...response.data.year_to_date_data].reverse());
      }
    } catch (error) {
      setTaxTrackerData([]);
    }
  };

  useEffect(() => {
    if (agencies.length > 0 && !selectedAgencyUid) {
      setSelectedAgencyUid(agencies[0].uid);
      fetchTaxTracker(agencies[0].uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencies]);

  useEffect(() => {
    if (refreshKey > 0 && selectedAgencyUid) fetchTaxTracker(selectedAgencyUid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (agencyRef.current && !agencyRef.current.contains(e.target as Node)) setAgencyOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const refetchTable = () => setRefreshKey((k) => k + 1);

  const handleAgencySelect = (agency: any) => {
    setSelectedAgencyUid(agency.uid);
    setAgencyOpen(false);
    fetchTaxTracker(agency.uid);
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const getCurrentMonthName = () =>
    new Date().toLocaleString('en-US', { month: 'long' });

  // table rows (unchanged transform logic)
  const transformedTableData = taxTrackerData.map((item) => {
    const currentMonth = getCurrentMonthName();
    const isCurrentMonth = item.month.toLowerCase() === currentMonth.toLowerCase();
    return {
      agency: selectedAgencyName,
      agency_uid: selectedAgencyUid,
      period: isCurrentMonth ? `${item.period} (Accruing)` : item.period,
      due_date: item.due_date,
      tax_amount: formatCurrency(item.total_tax_amount),
      status: item.status,
      month: item.month,
      action: 'Review Sales Tax',
    };
  });

  const openReview = (row: any) => {
    setSelectedRowData(row);
    row?.status == 'Overdue' ? setIsDueOpen(true) : setIsOpen(true);
  };

  // ── overview figures (sale_overview from the agency response) ──
  const so = selectedAgency?.sale_overview || {};
  const taxable = Number(so?.total_taxable_sale) || 0;
  const nonTaxable = Number(so?.total_non_taxable_sale) || 0;
  const gross = Number(so?.total_gross_sale) || 0;
  const combinedRate = Number(so?.combined_rate) || 0;
  // prefer the API-provided owed; fall back to taxable × combined rate
  const owed = Number(so?.tax_owed) || taxable * combinedRate;
  const sharePct = (v: number) => (gross > 0 ? Math.round((v / gross) * 100) : 0);
  const basis = `${selectedAgency?.reporting_method || 'Accrual'}`.toUpperCase();

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const progressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  const allCount = transformedTableData.length;
  const needsCount = transformedTableData.filter((r) => needsFiling(r.status)).length;
  const paidCount = transformedTableData.filter((r) => /paid/i.test(r.status)).length;
  const firstNeedsRow = transformedTableData.find((r) => needsFiling(r.status));

  const tiles: {
    tone: VioletTone;
    icon: React.ReactNode;
    label: string;
    value: number;
    sub: string;
    share: number;
  }[] = [
    {
      tone: 'violet',
      icon: <DollarSign />,
      label: 'Taxable sales',
      value: taxable,
      sub: 'of gross this period',
      share: sharePct(taxable),
    },
    {
      tone: 'teal',
      icon: <CircleSlash />,
      label: 'Non-taxable sales',
      value: nonTaxable,
      sub: 'exempt & zero-rated',
      share: sharePct(nonTaxable),
    },
    {
      tone: 'success',
      icon: <Receipt />,
      label: 'Tax owed this period',
      value: owed,
      sub: combinedRate > 0 ? `${(combinedRate * 100).toFixed(2)}% combined rate` : 'estimated to remit',
      share: sharePct(owed),
    },
  ];

  const columns: VListColumn[] = [
    {
      key: 'period',
      label: 'Period',
      w: 'minmax(0,1.4fr)',
      locked: true,
      render: (row) => {
        const mon = `${row?.month || ''}`.slice(0, 3).toUpperCase() || '—';
        const yr = `${row?.due_date || ''}`.match(/\d{4}/)?.[0] || '';
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-11 shrink-0 flex-col items-center justify-center rounded-[9px] bg-v-tint100 leading-none text-v-primary">
              <span className="text-[8px] font-bold uppercase tracking-wide">{mon}</span>
              <span className="text-[12px] font-extrabold tabular-nums">{yr.slice(2)}</span>
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-v-ink900">{row?.period || '—'}</div>
              {row?.agency && <div className="truncate text-[11px] text-v-ink400">{row.agency}</div>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'due_date',
      label: 'Due date',
      w: '130px',
      render: (row) => {
        const overdue = `${row?.status || ''}`.toLowerCase().includes('overdue');
        return (
          <div
            className={`text-[12.5px] tabular-nums ${overdue ? 'font-semibold text-v-danger-fg' : 'text-v-ink700'}`}
          >
            {row?.due_date || '—'}
            {overdue ? ' · late' : ''}
          </div>
        );
      },
    },
    {
      key: 'tax_amount',
      label: 'Tax',
      w: '120px',
      align: 'right',
      render: (row) => (
        <div className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
          {row?.tax_amount || '—'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '120px',
      render: (row) => {
        const m = statusMeta(row?.status);
        return <Chip tone={m.tone}>{m.label}</Chip>;
      },
    },
  ];

  const renderActions = (row: any) => {
    const s = `${row?.status || ''}`.toLowerCase();
    const label = s.includes('paid')
      ? 'View filing'
      : s.includes('overdue') || s.includes('pending') || s.includes('due')
        ? 'Record payment'
        : 'Review';
    return (
      <button
        type="button"
        onClick={() => openReview(row)}
        className="flex h-8 items-center gap-1.5 rounded-[9px] bg-v-tint100 px-3 text-[12.5px] font-semibold text-v-primary transition-colors hover:bg-v-primary hover:text-white"
      >
        {label}
      </button>
    );
  };

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Taxes', href: '/dashboard/taxes/taxes_agencies' },
          { label: 'Sales tax' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Sales tax
        </h1>

        {/* agency pill-select */}
        <div className="relative" ref={agencyRef}>
          <button
            type="button"
            onClick={() => setAgencyOpen((v) => !v)}
            className="flex min-w-[210px] items-center justify-between gap-2 rounded-[11px] border border-white/75 bg-white/60 px-3.5 py-2 text-[13px] font-semibold text-v-ink900 backdrop-blur-md transition-colors hover:border-v-primary"
          >
            <span className="truncate">{selectedAgencyName || 'Select agency'}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-v-ink400 transition-transform ${agencyOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {agencyOpen && agencies.length > 0 && (
            <div className="absolute left-0 z-[70] mt-2 w-[260px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal">
              {agencies.map((agency) => (
                <button
                  key={agency.uid}
                  type="button"
                  onClick={() => handleAgencySelect(agency)}
                  className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-[13px] transition-colors hover:bg-v-wash ${
                    agency.uid === selectedAgency?.uid
                      ? 'font-bold text-v-primary'
                      : 'font-medium text-v-ink700'
                  }`}
                >
                  <span className="truncate">{agency.title}</span>
                  {agency.state && <span className="text-[11px] text-v-ink400">{agency.state}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedAgency?.status && (
          <Chip tone={selectedAgency.status === 'ACTIVE' ? 'success' : 'neutral'}>
            {selectedAgency.status === 'ACTIVE' ? 'Active' : selectedAgency.status}
          </Chip>
        )}

        <span className="flex-1" />

        <Link href="/dashboard/taxes/taxes_agencies">
          <VioletButton variant="outline" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
            Manage rates
          </VioletButton>
        </Link>
        <VioletButton
          variant="primary"
          leftIcon={<FileCheck className="h-4 w-4" />}
          disabled={!firstNeedsRow}
          onClick={() => firstNeedsRow && openReview(firstNeedsRow)}
        >
          File return
        </VioletButton>
      </div>

      {/* overview strip */}
      <div className="mt-[18px] rounded-v-card bg-white p-3.5 shadow-v-card">
        <div className="grid gap-3.5 lg:grid-cols-[340px_1fr]">
          {/* dark period hero */}
          <div
            className="relative flex flex-col overflow-hidden rounded-v-hero px-[20px] pb-[16px] pt-4 text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroOverview }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[40px] -top-[40px] h-[170px] w-[170px] animate-v-float rounded-full"
              style={{ background: V.orb.violet }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-[30px] -left-[30px] h-[120px] w-[120px] rounded-full"
              style={{ background: V.orb.white }}
            />

            <div className="relative flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold uppercase tracking-[0.09em] text-white/60">
                Sales tax owed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" />
                {basis} · Live
              </span>
            </div>

            <div className="relative mt-1.5 text-[28px] font-extrabold tabular-nums tracking-[-0.02em]">
              {money(owed)}
            </div>
            <div className="relative text-[11.5px] text-white/60">
              {selectedAgency?.start_of_period ? `${selectedAgency.start_of_period} · ` : ''}
              {freqLabel(selectedAgency?.filling_frequency)} filer
            </div>

            {/* period progress */}
            <div className="relative mt-3.5">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-white/70">
                <span>Period progress</span>
                <span className="tabular-nums">
                  Day {dayOfMonth} of {daysInMonth}
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
              <span>Files {freqLabel(selectedAgency?.filling_frequency)}</span>
              <span className="tabular-nums">
                {selectedAgency?.date
                  ? `Period ends ${new Date(selectedAgency.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`
                  : ''}
              </span>
            </div>
          </div>

          {/* tiles + hint */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {isPending && !selectedAgency
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[104px] animate-pulse rounded-v-tile border-[1.5px] border-[rgba(22,23,42,0.09)] bg-white"
                    />
                  ))
                : tiles.map((t, i) => (
                    <StatTile
                      key={i}
                      tone={t.tone}
                      icon={t.icon}
                      value={money(t.value)}
                      label={t.label}
                      sub={t.sub}
                      share={`${t.share}%`}
                      bar={t.share}
                      delay={i * 0.05}
                    />
                  ))}
            </div>

            {/* smart hint strip */}
            <div className="flex items-center gap-2 rounded-v-tile bg-v-wash px-3.5 py-2.5 text-[12.5px] text-v-ink700">
              <Info className="h-4 w-4 shrink-0 text-v-ink400" />
              <span>
                Gross sales <span className="font-bold tabular-nums">{money(gross)}</span> this period
                {' · '}
                {needsCount > 0
                  ? `${needsCount} return${needsCount > 1 ? 's' : ''} need your attention below.`
                  : 'all returns settled.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* filing periods */}
      <div className="mt-4">
        <VioletListTable
          clientSide
          icon={<CalendarClock />}
          title="Filing periods"
          subtitle={(shown, total) =>
            selectedAgencyName
              ? `${selectedAgencyName} · ${total} periods · latest first`
              : `${total} periods · latest first`
          }
          data={{ results: transformedTableData, count: transformedTableData.length }}
          columns={columns}
          showColumns={false}
          searchPlaceholder="Search periods"
          searchFn={(row, q) => {
            const hay = `${row?.period || ''} ${row?.month || ''} ${row?.status || ''} ${
              row?.due_date || ''
            } ${row?.agency || ''}`.toLowerCase();
            return hay.includes(q.toLowerCase());
          }}
          filters={[
            { key: 'all', label: `All ${allCount}` },
            { key: 'needs', label: `Needs filing ${needsCount}` },
            { key: 'paid', label: `Paid ${paidCount}` },
          ]}
          filterFn={(row, key) => {
            if (key === 'paid') return /paid/i.test(`${row?.status || ''}`);
            if (key === 'needs') return needsFiling(row?.status);
            return true;
          }}
          renderActions={renderActions}
          actionLabel="Actions"
          actionWidth="140px"
          emptyIcon={<CalendarClock className="h-[19px] w-[19px]" />}
          emptyTitle="No filing periods"
          emptySub="Pick an agency above to see its periods."
        />ufg56 
      </div>

      <PDFModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Review Sales Tax">
        <ReviewOpenSalesTax
          refetch={refetchTable}
          onClose={() => setIsOpen(false)}
          rowData={selectedRowData}
        />
      </PDFModal>
      <PDFModal isOpen={isDueOpen} onClose={() => setIsDueOpen(false)} title="Review Sales Tax">
        <ReviewDueSalesTax
          refetch={refetchTable}
          onClose={() => setIsDueOpen(false)}
          rowData={selectedRowData}
        />
      </PDFModal>
    </div>
  );
};

export default Page;
