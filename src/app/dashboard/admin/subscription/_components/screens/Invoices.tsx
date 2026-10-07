'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Search,
  CreditCard,
  Receipt,
  ArrowUpRight,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn, Badge, Card, Eyebrow, Segmented, type Tone } from '../ui';
import { invoices, currency, company } from '../data';
import { useNav } from '../nav';
import { Drawer } from '../overlays';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSubscriptionInvoices, fetchSubscriptionInvoice } from '@/app/helpers/backend';

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */
type Invoice = {
  uid: string;
  no: string;
  period: string;
  plan: string;
  amount: number;
  base: number;
  discount: number;
  tax: number;
  status: string;
  hosted_invoice_url?: string | null;
};

type InvoiceDetail = {
  uid: string;
  status: string;
  currency?: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  period_start?: string;
  period_end?: string;
  hosted_invoice_url?: string | null;
  billing_reason?: string;
  created_at?: string;
  stripe_invoice_id?: string;
  lines: Array<{
    uid: string;
    line_type: string;
    description: string;
    quantity: number;
    unit_amount: number;
    amount: number;
  }>;
};

type StatusFilter = 'All' | 'Paid' | 'Open' | 'Past Due' | 'Refunded' | 'Trial';

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
const STATUS_TONE: Record<string, Tone> = {
  Paid: 'success',
  Trial: 'neutral',
  Open: 'info',
  'Past Due': 'error',
  Refunded: 'neutral',
};

const num = (v: unknown) => parseFloat(String(v ?? 0)) || 0;

function periodStart(period: string): string {
  const year = period.match(/\d{4}/)?.[0] ?? '';
  const start = period.split('–')[0].trim();
  if (!start.includes(year)) return `${start}, ${year}`;
  return start;
}

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const year = e.getFullYear();
  return `${fmt(s)} – ${fmt(e)}, ${year}`;
};

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function planLabelFromRaw(raw: any): string {
  const baseLine = Array.isArray(raw.lines)
    ? raw.lines.find((l: any) => l.line_type === 'BASE')
    : null;
  if (baseLine?.description) {
    const m = baseLine.description.match(/×\s*([^(]+)/i);
    if (m?.[1]) return m[1].trim();
  }
  const reason = String(raw.billing_reason ?? '');
  if (reason === 'subscription_create') return 'New subscription';
  if (reason === 'subscription_cycle') return 'Subscription renewal';
  return 'Subscription';
}

function mapApiInvoice(raw: any): Invoice {
  const statusMap: Record<string, string> = {
    PAID: 'Paid',
    OPEN: 'Open',
    PAST_DUE: 'Past Due',
    REFUNDED: 'Refunded',
    TRIAL: 'Trial',
  };

  return {
    uid: raw.uid,
    no: raw.stripe_invoice_id
      ? `INV-${String(raw.stripe_invoice_id).slice(-8).toUpperCase()}`
      : `INV-${String(raw.uid).slice(0, 8).toUpperCase()}`,
    period: formatPeriod(raw.period_start, raw.period_end),
    plan: planLabelFromRaw(raw),
    amount: num(raw.total),
    base: num(raw.subtotal),
    discount: num(raw.discount_total),
    tax: num(raw.tax_total),
    status: statusMap[raw.status] ?? raw.status,
    hosted_invoice_url: raw.hosted_invoice_url ?? null,
  };
}

function mapApiDetail(raw: any): InvoiceDetail {
  return {
    uid: raw.uid,
    status: raw.status,
    currency: raw.currency,
    subtotal: num(raw.subtotal),
    discount_total: num(raw.discount_total),
    tax_total: num(raw.tax_total),
    total: num(raw.total),
    period_start: raw.period_start,
    period_end: raw.period_end,
    hosted_invoice_url: raw.hosted_invoice_url ?? null,
    billing_reason: raw.billing_reason,
    created_at: raw.created_at,
    stripe_invoice_id: raw.stripe_invoice_id,
    lines: Array.isArray(raw.lines)
      ? raw.lines.map((l: any) => ({
          uid: l.uid,
          line_type: l.line_type ?? '',
          description: l.description ?? l.line_type ?? 'Line item',
          quantity: num(l.quantity),
          unit_amount: num(l.unit_amount),
          amount: num(l.amount),
        }))
      : [],
  };
}

const SEG_OPTIONS: { value: StatusFilter; label: React.ReactNode }[] = [
  { value: 'All', label: 'All' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Open', label: 'Open' },
  { value: 'Past Due', label: 'Past Due' },
  { value: 'Refunded', label: 'Refunded' },
];

const openHostedInvoiceUrl = (url?: string | null, onMissing?: () => void) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
  onMissing?.();
  return false;
};

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */
export default function Invoices() {
  const nav = useNav();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [detail, setDetail] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: invoicesResp } = useFetch(['subscription-invoices'], fetchSubscriptionInvoices);

  const rawList: any[] = Array.isArray(invoicesResp)
    ? invoicesResp
    : Array.isArray((invoicesResp as any)?.results)
      ? (invoicesResp as any).results
      : null;

  const sourceInvoices: Invoice[] = rawList ? rawList.map(mapApiInvoice) : invoices.map((inv, i) => ({
    uid: `fallback-${i}`,
    no: inv.no,
    period: inv.period,
    plan: inv.plan,
    amount: inv.amount,
    base: inv.base,
    discount: 0,
    tax: 0,
    status: inv.status,
  }));

  const totalPaid = sourceInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const loadDetail = async (uid: string) => {
    setDetailLoading(true);
    try {
      const res = await fetchSubscriptionInvoice(uid);
      if (res && res.success !== false) {
        setDetail(mapApiDetail(res));
        return mapApiDetail(res);
      }
    } catch {
      nav.toast({ tone: 'error', title: 'Could not load invoice details' });
    } finally {
      setDetailLoading(false);
    }
    return null;
  };

  const openInvoice = async (row: Invoice) => {
    setSelected(row);
    setDetail(null);
    await loadDetail(row.uid);
  };

  const handleDownload = async (row: Invoice, existingDetail?: InvoiceDetail | null) => {
    const url =
      existingDetail?.hosted_invoice_url ?? row.hosted_invoice_url ?? detail?.hosted_invoice_url;

    if (openHostedInvoiceUrl(url, () => {})) return;

    const loaded = existingDetail ?? (await loadDetail(row.uid));
    if (!openHostedInvoiceUrl(loaded?.hosted_invoice_url)) {
      nav.toast({
        tone: 'error',
        title: 'Invoice link not available',
        msg: 'Stripe hosted invoice URL was not found for this invoice.',
      });
    }
  };

  const filtered = sourceInvoices.filter((inv) => {
    const matchesSearch =
      search.trim() === '' ||
      inv.no.toLowerCase().includes(search.toLowerCase()) ||
      inv.plan.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'All' || inv.status === status;
    return matchesSearch && matchesStatus;
  });

  const displayDetail = detail;
  const displayAmount = displayDetail?.total ?? selected?.amount ?? 0;
  const displayStatus = displayDetail?.status
    ? (STATUS_TONE[
        displayDetail.status === 'PAID'
          ? 'Paid'
          : displayDetail.status === 'OPEN'
            ? 'Open'
            : displayDetail.status === 'PAST_DUE'
              ? 'Past Due'
              : displayDetail.status
      ] ?? 'neutral')
    : selected
      ? STATUS_TONE[selected.status] ?? 'neutral'
      : 'neutral';
  const statusLabel = displayDetail?.status
    ? displayDetail.status === 'PAID'
      ? 'Paid'
      : displayDetail.status.replace('_', ' ')
    : selected?.status ?? '';

  return (
    <div className="space-y-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.4px] text-[#16172A]">Invoices</h1>
          <p className="mt-0.5 text-[14px] text-[#6F6A85]">
            Billing history and payment records for your account.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Btn
            variant="secondary"
            size="md"
            icon={Calendar}
            onClick={() => nav.toast({ tone: 'info', title: 'Date range', msg: 'Last 12 months' })}
          >
            Date range
          </Btn>
          <Btn
            variant="primary"
            size="md"
            icon={Download}
            onClick={() =>
              nav.toast({
                tone: 'success',
                title: 'Export started',
                msg: 'Well email your invoice archive.',
              })
            }
          >
            Export all
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <Eyebrow icon={Receipt}>Total paid (12 mo)</Eyebrow>
          <p className="text-[32px] font-extrabold tracking-[-0.6px] text-[#16172A] [font-variant-numeric:tabular-nums]">
            {currency(totalPaid)}
          </p>
        </Card>

        <Card className="flex flex-col gap-3">
          <Eyebrow icon={Calendar}>Next invoice</Eyebrow>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[32px] font-extrabold tracking-[-0.6px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {currency(180)}
              </p>
              <p className="mt-0.5 text-[13px] text-[#6F6A85]">Due Jul 08, 2026</p>
            </div>
            <Badge tone="info">Projected</Badge>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <Eyebrow icon={CreditCard}>Payment method</Eyebrow>
          <div className="flex items-end justify-between gap-2">
            <p className="text-[20px] font-bold tracking-[-0.2px] text-[#16172A]">
              Visa •••• 4242
            </p>
            <button
              onClick={() => nav.go('payment')}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#7C4DFF] hover:underline"
            >
              Manage
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(22,23,42,0.07)] px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A95AE]" />
            <input
              type="text"
              placeholder="Search by invoice no. or plan…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-[280px] max-w-full rounded-[14px] border border-[#D8D2EC] bg-white pl-10 pr-4 text-[14px] text-[#16172A] placeholder:text-[#9A95AE] outline-none transition-colors focus:border-[#7C4DFF] focus:ring-2 focus:ring-[#7C4DFF]/20"
            />
          </div>
          <Segmented
            options={SEG_OPTIONS}
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13.5px]">
            <thead>
              <tr className="border-b border-[rgba(22,23,42,0.07)]">
                {['Invoice No.', 'Billing Period', 'Plan', 'Amount', 'Status', 'Method', ''].map(
                  (col, i) => (
                    <th
                      key={i}
                      className={cn(
                        'px-5 py-3 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]',
                        col === 'Amount' && 'text-right'
                      )}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[14px] text-[#9A95AE]">
                    No invoices match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((inv) => (
                <tr
                  key={inv.uid}
                  onClick={() => openInvoice(inv)}
                  className="cursor-pointer border-b border-[rgba(22,23,42,0.07)] transition-colors last:border-0 hover:bg-[rgba(124,77,255,.05)]"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-[13px] font-semibold text-[#16172A]">
                      {inv.no}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6F6A85]">{inv.period}</td>
                  <td className="px-5 py-4 font-medium text-[#16172A]">{inv.plan}</td>
                  <td className="px-5 py-4 text-right font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                    {currency(inv.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={STATUS_TONE[inv.status] ?? 'neutral'}>{inv.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-[#6F6A85]">
                    {inv.status === 'Trial' ? '—' : 'Visa •••• 4242'}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(inv);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9A95AE] transition-colors hover:bg-[#EEE9FF] hover:text-[#7C4DFF]"
                      title="Open invoice on Stripe"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setDetail(null);
        }}
        title="Invoice"
        subtitle={selected?.no}
        width={480}
        footer={
          selected && (
            <div className="flex gap-2.5">
              <Btn
                variant="primary"
                size="md"
                icon={ExternalLink}
                disabled={detailLoading}
                onClick={() => handleDownload(selected, detail)}
              >
                Open on Stripe
              </Btn>
              <Btn
                variant="secondary"
                size="md"
                icon={Download}
                disabled={detailLoading || !displayDetail?.hosted_invoice_url}
                onClick={() => handleDownload(selected, detail)}
              >
                Download PDF
              </Btn>
              <Btn
                variant="secondary"
                size="md"
                icon={Mail}
                onClick={() =>
                  nav.toast({
                    tone: 'info',
                    title: 'Invoice emailed',
                    msg: company.email,
                  })
                }
              >
                Email
              </Btn>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-6">
            {detailLoading && (
              <p className="text-[13.5px] text-[#9A95AE]">Loading invoice details…</p>
            )}

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#EEE9FF] px-5 py-4">
              <p className="text-[34px] font-extrabold tracking-[-0.6px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {currency(displayAmount)}
              </p>
              <Badge tone={displayStatus as Tone} className="text-sm">
                {statusLabel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-[#D8D2EC] p-5">
              <div>
                <p className="mb-0.5 text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]">
                  Billed to
                </p>
                <p className="text-[14px] font-semibold text-[#16172A]">{company.name}</p>
              </div>
              <div>
                <p className="mb-0.5 text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]">
                  Method
                </p>
                <p className="text-[14px] font-semibold text-[#16172A]">
                  {selected.status === 'Trial' ? '—' : 'Visa •••• 4242'}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]">
                  Issue date
                </p>
                <p className="text-[14px] font-semibold text-[#16172A]">
                  {fmtDate(displayDetail?.created_at) || periodStart(selected.period)}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]">
                  Billing period
                </p>
                <p className="text-[14px] font-semibold text-[#16172A]">
                  {displayDetail?.period_start && displayDetail?.period_end
                    ? formatPeriod(displayDetail.period_start, displayDetail.period_end)
                    : selected.period}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8D2EC] p-5">
              <p className="mb-4 text-[12.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]">
                Line items
              </p>
              <div className="space-y-3">
                {displayDetail?.lines.length ? (
                  displayDetail.lines.map((line) => (
                    <div key={line.uid} className="flex items-start justify-between gap-3">
                      <span className="text-[14px] text-[#16172A] leading-snug">
                        {line.description}
                      </span>
                      <span className="shrink-0 text-[14px] font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                        {currency(line.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#16172A]">{selected.plan}</span>
                    <span className="text-[14px] font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                      {currency(selected.base)}
                    </span>
                  </div>
                )}

                {displayDetail && displayDetail.discount_total > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#6F6A85]">Discount</span>
                    <span className="text-[14px] font-semibold text-[#1FA97A] [font-variant-numeric:tabular-nums]">
                      −{currency(displayDetail.discount_total)}
                    </span>
                  </div>
                )}

                {displayDetail && displayDetail.tax_total > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#6F6A85]">Tax</span>
                    <span className="text-[14px] font-semibold text-[#6F6A85] [font-variant-numeric:tabular-nums]">
                      {currency(displayDetail.tax_total)}
                    </span>
                  </div>
                )}

                <div
                  className="my-1 border-0"
                  style={{ borderTop: '1.5px dashed rgba(22,23,42,0.12)' }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-[#16172A]">Total</span>
                  <span className="text-[16px] font-extrabold text-[#16172A] [font-variant-numeric:tabular-nums]">
                    {currency(displayAmount)}
                  </span>
                </div>
              </div>
            </div>

            {displayDetail?.hosted_invoice_url && (
              <a
                href={displayDetail.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#7C4DFF] hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View invoice on Stripe
              </a>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
