'use client';
import Modal from '@/app/(admin)/_components/Modal';
import { fetchCustomerTransactions } from '@/app/helpers/backend';
import { encryptData } from '@/app/helpers/crypto';
import { useFetch } from '@/app/helpers/hooks';
import Label from '@/components/ui/RawLabel';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Chip,
  IconChip,
  VioletButton,
  money,
  type VioletTone,
} from '@/components/violet';
import { Search, Receipt, Filter, MoreVertical } from 'lucide-react';

function txTypeMeta(row: any): { tone: VioletTone; label: string } {
  if (row?.is_invoice) return { tone: 'violet', label: 'Invoice' };
  if (row?.is_estimated) return { tone: 'warn', label: 'Estimate' };
  return { tone: 'success', label: 'Sale receipt' };
}

function txStatusMeta(status: string): { tone: VioletTone; label: string } {
  const s = `${status || ''}`.toUpperCase();
  if (s === 'PAID') return { tone: 'success', label: 'Paid' };
  if (s.includes('PARTIAL')) return { tone: 'warn', label: 'Partial' };
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

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'estimates', label: 'Estimates' },
  { key: 'receipts', label: 'Receipts' },
];

const LEDGER_COLS = 'minmax(0,1.05fr) 110px minmax(0,1.25fr) 120px 110px 56px';

const TransactionsTable = ({ uid, customer }: { uid: string; customer?: any }) => {
  const router = useRouter();
  const [filterData, setFilterData] = useState<any>({
    transactionType: '',
    status: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const { data, isPending, setQueryParams, params } = useFetch(
    ['customer_transaction_list', uid],
    () => fetchCustomerTransactions(uid)
  );

  // ledger UI state (client-side — the query is keyed by uid only)
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 8;

  const handleApplyFilter = () => {
    setIsModalOpen(false);
    setQueryParams({
      ...params,
      is_estimated: filterData.transactionType == 'estimate' ? true : '',
      is_invoice: filterData.transactionType == 'invoice' ? true : '',
      status: filterData.status,
    });
  };

  // close the row kebab on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-tx-menu]')) setSelectedRowId(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // shared encrypted-customer payload — identical to before
  const encCustomer = () =>
    encryptData({
      uid: customer?.uid,
      address: customer?.address,
      first_name: customer?.first_name,
      middle_name: customer?.middle_name || '',
      last_name: customer?.last_name || '',
      email: customer?.email || '',
      currency: customer?.currency || '',
    });

  const allRows: any[] = data?.results || data?.data || [];
  const byType = allRows.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'invoices') return !!r?.is_invoice;
    if (filter === 'estimates') return !!r?.is_estimated;
    return !r?.is_invoice && !r?.is_estimated; // receipts
  });
  const bySearch = byType.filter((r) => {
    if (!search.trim()) return true;
    const hay = `${r?.invoice_id || ''} ${r?.description || ''}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });
  const total = bySearch.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const curPage = Math.min(page, pageCount);
  const pageRows = bySearch.slice((curPage - 1) * limit, curPage * limit);
  const pages = pageRange(curPage, pageCount);
  const start = total === 0 ? 0 : (curPage - 1) * limit + 1;
  const end = Math.min(curPage * limit, total);

  /* per-row action kebab — preserves the original routing conditions verbatim */
  const RowMenu = ({ row }: { row: any }) => {
    const triggerRef = useRef<any>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const open = selectedRowId === row.uid;

    useEffect(() => {
      const update = () => {
        if (selectedRowId === row.uid && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setPos({ x: rect.right - 184, y: rect.bottom + window.scrollY + 6 });
        }
      };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [row.uid, open]);

    const menuItem =
      'block w-full px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary';

    const showReceive = row?.status == 'OPEN' && row?.is_invoice;
    const showCreate = row?.status == 'PAID' || (!row?.is_invoice && !row?.is_estimate);

    return (
      <div className="relative" data-tx-menu>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Row actions"
          onClick={() => setSelectedRowId((prev) => (prev === row.uid ? null : row.uid))}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary',
            open && 'bg-v-tint100 text-v-primary'
          )}
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>

        {open && (
          <div
            className="fixed z-[120] w-[184px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal"
            style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
          >
            {showReceive && (
              <button
                type="button"
                onClick={() => {
                  router.push(`/dashboard/sales/all_sales/payment?c=${encCustomer()}`);
                  setSelectedRowId(null);
                }}
                className={menuItem}
              >
                Receive payment
              </button>
            )}
            {showCreate && (
              <button
                type="button"
                onClick={() => {
                  router.push(`/dashboard/sales/all_sales/invoice?c=${encCustomer()}`);
                  setSelectedRowId(null);
                }}
                className={menuItem}
              >
                Create invoice
              </button>
            )}
            {row?.is_invoice && (
              <button
                type="button"
                onClick={() => {
                  router.push(`/dashboard/sales/all_sales/invoice/${row?.uid}`);
                  setSelectedRowId(null);
                }}
                className={menuItem}
              >
                Edit
              </button>
            )}
            {row?.is_estimate && (
              <button
                type="button"
                onClick={() => {
                  router.push(`/dashboard/sales/all_sales/estimate/${row?.uid}`);
                  setSelectedRowId(null);
                }}
                className={menuItem}
              >
                Edit
              </button>
            )}
            {!showReceive && !showCreate && !row?.is_invoice && !row?.is_estimate && (
              <div className="px-3.5 py-2 text-[12px] text-v-ink400">No actions</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="animate-v-rise overflow-hidden rounded-v-card bg-white font-jakarta text-v-ink900 shadow-v-card">
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
              className="w-[210px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Filter"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
          >
            <Filter className="h-[16px] w-[16px]" />
          </button>
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
          <div className="text-right">Action</div>
        </div>

        {/* body */}
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
              style={{ gridTemplateColumns: LEDGER_COLS }}
            >
              {Array.from({ length: 6 }).map((__, j) => (
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
              Invoices, estimates and receipts will show up here.
            </div>
          </div>
        ) : (
          pageRows.map((row, i) => {
            const type = txTypeMeta(row);
            const st = txStatusMeta(row?.status);
            const reference =
              row?.invoice_id || (row?.uid ? `#${String(row.uid).slice(0, 8)}` : '—');
            const amount = Number(row?.total) || 0;
            return (
              <div
                key={row?.uid || i}
                className="grid animate-v-pop items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 transition-colors hover:bg-[#F7F5FC]"
                style={{
                  gridTemplateColumns: LEDGER_COLS,
                  animationDelay: `${i * 0.03}s`,
                  zIndex: selectedRowId === row.uid ? 120 : undefined,
                  position: selectedRowId === row.uid ? 'relative' : undefined,
                }}
              >
                <div className="text-[12.5px] tabular-nums text-v-ink700">
                  {row?.date ? moment(row.date).format('ll') : '—'}
                </div>
                <div>
                  <Chip tone={type.tone}>{type.label}</Chip>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-v-ink900">{reference}</div>
                  {row?.description && (
                    <div className="truncate text-[11.5px] text-v-ink400">{row.description}</div>
                  )}
                </div>
                <div
                  className={cn(
                    'text-right text-[13px] font-bold tabular-nums',
                    type.label === 'Sale receipt'
                      ? 'text-v-success-fg'
                      : type.label === 'Estimate'
                        ? 'text-v-warn-fg'
                        : 'text-v-ink900'
                  )}
                >
                  {money(amount)}
                </div>
                <div>
                  <Chip tone={st.tone}>{st.label}</Chip>
                </div>
                <div className="flex items-center justify-end">
                  <RowMenu row={row} />
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        widthClass="w-full md:w-[550px]"
        title="Filter"
      >
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <div>
            <Label className="block font-medium text-[#5A607F]">Transaction Type</Label>
            <select
              value={filterData.transactionType}
              onChange={(e) =>
                setFilterData((prev: any) => ({
                  ...prev,
                  transactionType: e.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
            >
              <option value="">Select Transaction Type</option>
              <option value="sales_receipt">Sales Receipt</option>
              <option value="invoice">Invoice</option>
              <option value="estimate">Estimate</option>
            </select>
          </div>
          <div>
            <Label className="block font-medium text-[#5A607F]">Status</Label>
            <select
              value={filterData.status}
              onChange={(e) =>
                setFilterData((prev: any) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
            >
              <option value="">Select Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="mx-auto mt-10 flex max-w-[325px] items-center justify-center gap-6">
            <VioletButton
              type="button"
              variant="outline"
              className="min-w-40"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </VioletButton>
            <VioletButton
              type="submit"
              variant="primary"
              className="min-w-40"
              onClick={handleApplyFilter}
            >
              Apply
            </VioletButton>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TransactionsTable;
