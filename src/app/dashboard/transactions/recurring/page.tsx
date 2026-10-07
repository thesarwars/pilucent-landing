'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import {
  Repeat,
  CalendarClock,
  Bell,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Printer,
  ChevronDown,
  FileText,
  ReceiptText,
  Wallet,
  Banknote,
  BookOpen,
  ClipboardList,
  CreditCard,
} from 'lucide-react';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { fetchRecurringTemplates, deleteRecurringTemplate } from '@/app/helpers/backend';
import {
  Breadcrumb,
  Chip,
  IconChip,
  StatTile,
  VioletButton,
  VioletListTable,
  money,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';

/* ── domain ──────────────────────────────────────────────────────────────── */
type Mode = 'SCHEDULED' | 'REMINDER' | 'UNSCHEDULED';

interface Template {
  uid: string;
  name: string;
  mode: Mode;
  status: string;
  txn_type: string;
  interval: string;
  next_date: string | null;
  party: string;
  amount: number;
}

const MODE_META: Record<Mode, { label: string; tone: VioletTone }> = {
  SCHEDULED: { label: 'Scheduled', tone: 'success' },
  REMINDER: { label: 'Reminder', tone: 'warn' },
  UNSCHEDULED: { label: 'Unscheduled', tone: 'neutral' },
};

const txnMeta = (t?: string): { icon: React.ReactNode; tone: VioletTone } => {
  switch (`${t || ''}`) {
    case 'Invoice':
      return { icon: <FileText />, tone: 'violet' };
    case 'Estimate':
    case 'Purchase Order':
      return { icon: <ClipboardList />, tone: 'warn' };
    case 'Bill':
    case 'Sales Receipt':
      return { icon: <ReceiptText />, tone: 'teal' };
    case 'Expense':
      return { icon: <Wallet />, tone: 'teal' };
    case 'Payment':
      return { icon: <BookOpen />, tone: 'violet' };
    case 'Credit Memo':
    case 'Refund Receipt':
      return { icon: <CreditCard />, tone: 'rose' };
    default:
      return { icon: <Banknote />, tone: 'success' };
  }
};

/* Modal type options → the section each one routes to (all exist, no 404s). */
const TXN_TYPES = [
  'Invoice',
  'Bill',
  'Expense',
  'Cheque',
  'Sales Receipt',
  'Credit Memo',
  'Estimate',
  'Purchase Order',
  'Deposit',
  'Payment',
  'Refund Receipt',
] as const;

const TYPE_ROUTES: Record<string, string> = {
  Invoice: '/dashboard/transactions/recurring/sales/invoice',
  Estimate: '/dashboard/transactions/recurring/sales/estimate',
  'Sales Receipt': '/dashboard/transactions/recurring/sales/sales_receipt',
  'Credit Memo': '/dashboard/transactions/recurring/sales/credit_note',
  'Refund Receipt': '/dashboard/transactions/recurring/sales/refund',
  Bill: '/dashboard/transactions/recurring/sales/bill',
  Expense: '/dashboard/transactions/recurring/sales/expense',
  Cheque: '/dashboard/transactions/recurring/sales/cheque',
  'Purchase Order': '/dashboard/transactions/recurring/sales/purchase_order',
  Deposit: '/dashboard/transactions/recurring/sales/deposit',
  'Payment': '/dashboard/transactions/recurring/sales/payment',
};

const MODES: { value: Mode; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled List' },
  { value: 'REMINDER', label: 'Reminder List' },
  { value: 'UNSCHEDULED', label: 'Unscheduled List' },
];

const TXN_LABEL: Record<string, string> = {
  INVOICE: 'Invoice',
  BILL: 'Bill',
  EXPENSE: 'Expense',
  CHEQUE: 'Cheque',
  ESTIMATE: 'Estimate',
  PAYMENT: 'Payment',
  PURCHASE_ORDER: 'Purchase Order',
  SALES_RECEIPT: 'Sales Receipt',
  DEPOSIT: 'Deposit',
  REFUND_RECEIPT: 'Refund Receipt',
  CREDIT_MEMO: 'Credit Memo',
};

/* lifecycle statuses worth flagging in the row — active/normal ones render nothing */
const STATUS_META: Record<string, { label: string; tone: VioletTone }> = {
  PAUSED: { label: 'Paused', tone: 'warn' },
  EXPIRED: { label: 'Expired', tone: 'danger' },
  ENDED: { label: 'Ended', tone: 'neutral' },
};

const mapTemplate = (r: any): Template => ({
  uid: r.uid,
  name: r.name,
  mode: r.template_type,
  status: r.status || '',
  txn_type: TXN_LABEL[r.txn_type] || r.txn_type,
  interval: r.interval_display || '—',
  next_date: r.next_run_date,
  party: r.party_name || r.supplier_name || r.customer_name || '',
  amount: Number(r.total_amount) || 0,
});

const Page = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('SCHEDULED');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeOpen, setTypeOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetchRecurringTemplates({ limit: 100 });
      setTemplates((res?.results || []).map(mapTemplate));
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  /* close the New menu on outside click / Escape */
  useEffect(() => {
    if (!typeOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setTypeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setTypeOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [typeOpen]);

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* KPIs (across all modes) */
  const kpis = useMemo(() => {
    const active = templates.length;
    const scheduled = templates.filter((t) => t.mode === 'SCHEDULED').length;
    const reminders = templates.filter((t) => t.mode === 'REMINDER').length;
    const due = templates.filter(
      (t) => t.next_date && moment(t.next_date).isSame(moment(), 'month')
    ).length;
    return { active, scheduled, reminders, due };
  }, [templates]);

  /* the list shown is filtered by the selected mode */
  const list = useMemo(() => templates.filter((t) => t.mode === mode), [templates, mode]);

  const routeForType = (t: string) => {
    const r = TYPE_ROUTES[t];
    if (r) router.push(r);
    else toast.info(`${t} templates are coming soon.`);
  };

  const routeForEdit = (row: any) => {
    const base = TYPE_ROUTES[row.txn_type];
    if (base) router.push(`${base}/${row.uid}`);
    else toast.info(`${row.txn_type} templates are coming soon.`);
  };

  const handleDelete = async (uid: string) => {
    const res = await deleteRecurringTemplate(uid);
    if (res?.success) {
      setTemplates((prev) => prev.filter((t) => t.uid !== uid));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
      toast.success('Template removed.');
    }
  };

  const columns: VListColumn[] = [
    {
      key: 'select',
      label: '',
      w: '30px',
      locked: true,
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(row.uid)}
          onChange={() => toggleRow(row.uid)}
          aria-label="Select template"
          className="h-4 w-4 cursor-pointer rounded-[5px] border-v-border accent-[#7C4DFF]"
        />
      ),
    },
    {
      key: 'name',
      label: 'Template Name',
      w: 'minmax(0,1.5fr)',
      locked: true,
      render: (row) => {
        const m = txnMeta(row.txn_type);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <IconChip tone={m.tone}>{m.icon}</IconChip>
            <span className="truncate text-[13px] font-bold text-v-ink900">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'mode',
      label: 'Type',
      w: '150px',
      render: (row) => {
        const m = MODE_META[row.mode as Mode];
        const s = STATUS_META[row.status];
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip tone={m.tone} dot>
              {m.label}
            </Chip>
            {s && <Chip tone={s.tone}>{s.label}</Chip>}
          </div>
        );
      },
    },
    {
      key: 'txn_type',
      label: 'Txn Type',
      w: '130px',
      render: (row) => <span className="text-[12.5px] text-v-ink700">{row.txn_type}</span>,
    },
    {
      key: 'interval',
      label: 'Interval',
      w: '110px',
      render: (row) => <span className="text-[12.5px] text-v-ink700">{row.interval || '—'}</span>,
    },
    {
      key: 'next_date',
      label: 'Next Date',
      w: '120px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">
          {row.next_date ? moment(row.next_date).format('DD MMM, YYYY') : '—'}
        </span>
      ),
    },
    {
      key: 'party',
      label: 'Customer/Vendor',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <span className="truncate text-[12.5px] text-v-ink700">{row.party || '—'}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      w: '120px',
      align: 'right',
      render: (row) => (
        <span className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
          {money(Number(row.amount) || 0)}
        </span>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Edit template"
        onClick={() => routeForEdit(row)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete template"
        onClick={() => handleDelete(row.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const total = templates.length;

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions', href: '#' },
          { label: 'Recurring Transactions' },
        ]}
      />

      {/* header */}
      <div className="relative z-[60] flex animate-v-rise flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
          Recurring Transactions
        </h1>
        <Chip tone="violet">
          {total} {total === 1 ? 'template' : 'templates'}
        </Chip>
        <span className="flex-1" />
        <div className="relative">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="cursor-pointer appearance-none rounded-[12px] border border-white/60 bg-white/70 py-2.5 pl-3.5 pr-9 text-[13px] font-semibold text-v-ink900 outline-none backdrop-blur transition-shadow focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]"
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-v-ink400" />
        </div>
        <div className="relative" ref={menuRef}>
          <VioletButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setTypeOpen((o) => !o)}
          >
            New
          </VioletButton>
          {typeOpen && (
            <>
              {/* type menu */}
              <div className="absolute right-0 top-full z-[410] mt-2 max-h-[70vh] w-[248px] animate-v-pop overflow-y-auto rounded-[14px] border border-v-border bg-white p-1.5 shadow-v-modal">
                <div className="px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  New template
                </div>
                {TXN_TYPES.map((t) => {
                  const m = txnMeta(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTypeOpen(false);
                        routeForType(t);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-ink900"
                    >
                      <IconChip tone={m.tone}>{m.icon}</IconChip>
                      {t}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid animate-v-rise grid-cols-2 gap-3.5 lg:grid-cols-4" style={{ animationDelay: '0.06s' }}>
        <StatTile icon={<Repeat />} tone="violet" value={kpis.active} label="Active templates" delay={0.06} />
        <StatTile icon={<CalendarClock />} tone="success" value={kpis.scheduled} label="Scheduled" delay={0.1} />
        <StatTile icon={<Bell />} tone="warn" value={kpis.reminders} label="Reminders" delay={0.14} />
        <StatTile icon={<Clock />} tone="teal" value={kpis.due} label="Due this month" delay={0.18} />
      </div>

      {/* templates table */}
      <VioletListTable
        icon={<Repeat />}
        title="Templates"
        subtitle={(shown, t) => `${shown} of ${t} ${t === 1 ? 'template' : 'templates'}`}
        data={{ count: list.length, results: list }}
        loading={loading}
        clientSide
        searchFn={(row, q) => `${row.name}`.toLowerCase().includes(q.toLowerCase())}
        columns={columns}
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="80px"
        searchPlaceholder="Filter by name…"
        emptyIcon={<Repeat className="h-[19px] w-[19px]" />}
        emptyTitle="No recurring transactions yet"
        emptySub="Create a recurring template to automate your invoices, bills and more."
        toolbarExtra={
          <button
            type="button"
            title="Print"
            onClick={() => window.print()}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
          >
            <Printer className="h-[16px] w-[16px]" />
          </button>
        }
      />

    </div>
  );
};

export default Page;
