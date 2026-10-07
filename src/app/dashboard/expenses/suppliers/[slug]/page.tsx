'use client';
import { useState, use } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { useQueries } from '@tanstack/react-query';
import { GetData } from '@/services/FetchMethods';
import { useRouter } from 'next/navigation';
import MainLoader from '@/components/MainLoader/MainLoader';
import SupplierCreateUpdate from '../_components/SupplierCreateUpdate';
import Modal from '@/app/(admin)/_components/Modal';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSupplierTransactions } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import { encryptData } from '@/app/helpers/crypto';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  IconChip,
  StatTile,
  VioletButton,
  money,
  avatarGradient,
  initials,
  type VioletTone,
} from '@/components/violet';
import {
  ArrowLeft,
  Plus,
  Pencil,
  CreditCard,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  StickyNote,
  Copy,
  Check,
  Search,
  Receipt,
} from 'lucide-react';

function supplierStatusMeta(status: string): { tone: VioletTone; label: string } {
  if (status === 'ACTIVE') return { tone: 'success', label: 'Active' };
  if (status === 'PENDING') return { tone: 'warn', label: 'On hold' };
  return { tone: 'neutral', label: 'Inactive' };
}

function txTypeMeta(row: any): { tone: VioletTone; label: string } {
  const t = `${row?.type || row?.kind || row?.transaction_type || ''}`.toUpperCase();
  if (t.includes('PAYMENT')) return { tone: 'success', label: 'Payment' };
  if (t.includes('CREDIT')) return { tone: 'warn', label: 'Credit' };
  return { tone: 'violet', label: 'Bill' };
}

function txStatusMeta(status: string): { tone: VioletTone; label: string } {
  const s = `${status || ''}`.toUpperCase();
  if (s === 'PAID' || s === 'ACTIVE') return { tone: 'success', label: s === 'PAID' ? 'Paid' : 'Active' };
  if (s.includes('PARTIAL') || s === 'PENDING') return { tone: 'warn', label: 'Pending' };
  if (s === 'OPEN') return { tone: 'violet', label: 'Open' };
  if (s) return { tone: 'neutral', label: s.charAt(0) + s.slice(1).toLowerCase() };
  return { tone: 'neutral', label: '—' };
}

function pageRange(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', count];
  if (page >= count - 3) return [1, '…', count - 4, count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

/* copyable contact row — clipboard write wrapped so an unfocused-iframe rejection is swallowed */
function CopyRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  const [copied, setCopied] = useState(false);
  const clean = (value || '').trim();
  const canCopy = !!clean && clean !== '—';
  const onCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* swallow clipboard rejection (e.g. unfocused iframe) */
    }
  };
  return (
    <div className="group flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
          {label}
        </div>
        <div className="break-words text-[13px] font-medium text-v-ink900">
          {clean || '—'}
        </div>
      </div>
      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          title="Copy"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-v-ink400 opacity-0 transition-all hover:bg-v-tint100 hover:text-v-primary group-hover:opacity-100"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-v-success-fg" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

const Page = (props: { params: Promise<any> }) => {
  const params = use(props.params);
  const results = useQueries({
    queries: [
      {
        queryKey: ['supplier_details', params?.slug],
        queryFn: () => GetData(`we/suppliers/${params?.slug}`),
      },
    ],
  });
  const [CustomerDetails] = results;
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const { data: Customer, isPending, refetch } = CustomerDetails;
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data, isPending: transactionPending } = useFetch(
    ['supplier transactions', params?.slug],
    () => fetchSupplierTransactions(params?.slug)
  );

  // ledger UI state (client-side — the transactions query is keyed by slug only)
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 8;

  if (isPending) {
    return <MainLoader color="#9ca3af" />;
  }

  const name = `${Customer?.first_name || ''} ${Customer?.middle_name || ''} ${
    Customer?.last_name || ''
  }`
    .replace(/\s+/g, ' ')
    .trim();
  const status = supplierStatusMeta(Customer?.status);
  const openBalance = Number(Customer?.opening_balance) || 0;
  const addressLine = [
    Customer?.address?.street,
    Customer?.address?.city,
    Customer?.address?.province,
    Customer?.address?.postal_code,
    Customer?.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const routeWithSupplier = (path: string) => {
    const enc = encryptData({
      uid: Customer?.uid,
      address: Customer?.address,
      first_name: Customer?.first_name,
      middle_name: Customer?.middle_name || '',
      last_name: Customer?.last_name || '',
      email: Customer?.email || '',
      currency: Customer?.currency || '',
    });
    router.push(`${path}?c=${enc}`);
  };

  // ledger derivation (display only)
  const allRows: any[] = data?.results || data?.data || [];
  const byType = allRows.filter((r) => {
    if (filter === 'all') return true;
    const m = txTypeMeta(r).label.toLowerCase();
    return filter === 'bills' ? m === 'bill' : filter === 'payments' ? m === 'payment' : m === 'credit';
  });
  const bySearch = byType.filter((r) => {
    if (!search.trim()) return true;
    const hay = `${r?.tracking_number || ''} ${r?.reference || ''} ${r?.bill_number || ''} ${
      r?.credit_no || ''
    } ${r?.description || ''}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });
  const total = bySearch.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const curPage = Math.min(page, pageCount);
  const pageRows = bySearch.slice((curPage - 1) * limit, curPage * limit);
  const pages = pageRange(curPage, pageCount);
  const start = total === 0 ? 0 : (curPage - 1) * limit + 1;
  const end = Math.min(curPage * limit, total);
  const LEDGER_COLS = 'minmax(0,1.05fr) 110px minmax(0,1.25fr) 120px 110px';

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'bills', label: 'Bills' },
    { key: 'payments', label: 'Payments' },
    { key: 'credits', label: 'Credits' },
  ];

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Expenses', href: '/dashboard/expenses/expenses' },
          { label: 'Suppliers', href: '/dashboard/expenses/suppliers' },
          { label: name || 'Supplier' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          {name || 'Supplier'}
        </h1>
        <Chip tone={status.tone}>{status.label}</Chip>

        <span className="flex-1" />

        {Permissions?.includes('change_supplier') && (
          <VioletButton
            variant="outline"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setIsOpen(true)}
          >
            Edit
          </VioletButton>
        )}
        <VioletButton
          variant="outline"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => routeWithSupplier('/dashboard/expenses/expenses/bill')}
        >
          New bill
        </VioletButton>
        <VioletButton
          variant="primary"
          leftIcon={<CreditCard className="h-4 w-4" />}
          onClick={() => routeWithSupplier('/dashboard/expenses/expenses/bill-payment')}
        >
          Record payment
        </VioletButton>
      </div>

      {/* two-column body */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* LEFT — sticky rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          {/* profile card */}
          <div className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card">
            <div className="flex flex-col items-center text-center">
              {Customer?.image ? (
                <Image
                  src={Customer.image}
                  width={160}
                  height={160}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-extrabold text-white ring-4 ring-white"
                  style={{ backgroundImage: avatarGradient(name || Customer?.uid || '?') }}
                >
                  {initials(name || '?')}
                </span>
              )}
              <div className="mt-3 text-[16px] font-extrabold text-v-ink900">
                {name || '—'}
              </div>
              {Customer?.company_name && (
                <div className="text-[12px] text-v-ink400">{Customer.company_name}</div>
              )}
            </div>

            <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />

            <div className="flex flex-col gap-3.5">
              <CopyRow icon={<Mail className="h-4 w-4" />} label="Email" value={Customer?.email} />
              <CopyRow icon={<Phone className="h-4 w-4" />} label="Phone" value={Customer?.mobile_number} />
              <CopyRow icon={<Globe className="h-4 w-4" />} label="Website" value={Customer?.website} />
              <CopyRow icon={<MapPin className="h-4 w-4" />} label="Address" value={addressLine} />
              <CopyRow
                icon={<Building2 className="h-4 w-4" />}
                label="Company"
                value={Customer?.company_name}
              />
              <CopyRow
                icon={<StickyNote className="h-4 w-4" />}
                label="Notes"
                value={Customer?.description}
              />
            </div>
          </div>

          {/* quick details */}
          <div className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Quick details
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Currency', value: Customer?.currency || '—' },
                { label: 'Open balance', value: money(openBalance) },
                { label: 'Country', value: Customer?.address?.country || '—' },
                {
                  label: 'Status',
                  value: status.label,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-v-ink400">{row.label}</span>
                  <span className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — main */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* position stats */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <StatTile
              tone="danger"
              icon={<CreditCard />}
              value={money(openBalance)}
              label="Open balance"
              sub="What you owe"
              delay={0}
            />
            <StatTile
              tone="violet"
              icon={<Receipt />}
              value={data?.count ?? allRows.length}
              label="Transactions"
              sub="All records"
              delay={0.05}
            />
            <StatTile
              tone="teal"
              icon={<Globe />}
              value={Customer?.currency || '—'}
              label="Currency"
              sub="Billing currency"
              delay={0.1}
            />
          </div>

          {/* transactions ledger */}
          <div className="animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
              <IconChip tone="violet">
                <Receipt />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[14px] font-bold text-v-ink900">Transactions</div>
                <div className="text-[11.5px] text-v-ink400">
                  {total} of {allRows.length} shown
                </div>
              </div>

              <span className="flex-1" />

              <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setFilter(f.key);
                      setPage(1);
                    }}
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search reference or memo"
                  className="w-[220px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
                />
              </div>
            </div>

            {/* column strip */}
            <div
              className="grid items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400"
              style={{ gridTemplateColumns: LEDGER_COLS }}
            >
              <div>Date</div>
              <div>Type</div>
              <div>Reference</div>
              <div className="text-right">Amount</div>
              <div>Status</div>
            </div>

            {/* body */}
            {transactionPending ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="grid items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
                  style={{ gridTemplateColumns: LEDGER_COLS }}
                >
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div key={j} className="h-4 w-3/4 rounded bg-v-wash2" />
                  ))}
                </div>
              ))
            ) : pageRows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
                  <Receipt className="h-[19px] w-[19px]" />
                </span>
                <div className="text-sm font-semibold text-v-ink900">No transactions yet</div>
                <div className="text-[13px] text-v-ink400">
                  Bills, payments and credits will show up here.
                </div>
              </div>
            ) : (
              pageRows.map((row, i) => {
                const type = txTypeMeta(row);
                const st = txStatusMeta(row?.status);
                const reference =
                  row?.tracking_number ||
                  row?.reference ||
                  row?.bill_number ||
                  row?.credit_no ||
                  (row?.uid ? `#${String(row.uid).slice(0, 8)}` : '—');
                const amount = Number(row?.total) || 0;
                return (
                  <div
                    key={row?.uid || i}
                    className="grid animate-v-pop items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 transition-colors hover:bg-[#F7F5FC]"
                    style={{ gridTemplateColumns: LEDGER_COLS, animationDelay: `${i * 0.03}s` }}
                  >
                    <div className="text-[12.5px] tabular-nums text-v-ink700">
                      {row?.date ? moment(row.date).format('DD MMM YYYY') : '—'}
                    </div>
                    <div>
                      <Chip tone={type.tone}>{type.label}</Chip>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-v-ink900">
                        {reference}
                      </div>
                      {row?.description && (
                        <div className="truncate text-[11.5px] text-v-ink400">
                          {row.description}
                        </div>
                      )}
                    </div>
                    <div
                      className={cn(
                        'text-right text-[13px] font-bold tabular-nums',
                        type.label === 'Payment'
                          ? 'text-v-success-fg'
                          : type.label === 'Credit'
                            ? 'text-v-warn-fg'
                            : 'text-v-ink900'
                      )}
                    >
                      {money(amount)}
                    </div>
                    <div>
                      <Chip tone={st.tone}>{st.label}</Chip>
                    </div>
                  </div>
                );
              })
            )}

            {/* footer / pager */}
            <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
              <span className="text-[12.5px] text-v-ink400">
                {total === 0 ? 'No transactions' : `Showing ${start}–${end} of ${total}`}
              </span>
              <span className="flex-1" />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => curPage > 1 && setPage(curPage - 1)}
                  disabled={curPage <= 1}
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
                      onClick={() => setPage(p)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-[8px] text-[12.5px] font-semibold tabular-nums transition-colors',
                        p === curPage ? 'bg-v-primary text-white' : 'text-v-ink500 hover:bg-v-wash2'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => curPage < pageCount && setPage(curPage + 1)}
                  disabled={curPage >= pageCount}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit Supplier"
        widthClass="w-full md:w-[980px]"
      >
        <SupplierCreateUpdate setIsOpen={setIsOpen} refetchData={refetch} uid={Customer?.uid} />
      </Modal>
    </div>
  );
};

export default Page;
