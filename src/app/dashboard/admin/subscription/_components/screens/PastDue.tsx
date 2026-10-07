'use client';

import React from 'react';
import {
  AlertTriangle,
  LifeBuoy,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn, Badge, Card, Eyebrow } from '../ui';
import { currency } from '../data';
import { useNav } from '../nav';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchSubscriptionBillingCurrent,
  fetchSubscriptionLifecycleState,
  fetchSubscriptionEvents,
} from '@/app/helpers/backend';

/* ---- tone → dot color map for timeline ---- */
const timelineDotClass: Record<string, string> = {
  error: 'bg-[#EF4444] shadow-[0_0_0_3px_#FCE8E8]',
  warning: 'bg-[#F59E0B] shadow-[0_0_0_3px_#FDF2DE]',
  success: 'bg-[#1FA97A] shadow-[0_0_0_3px_#D4F5E9]',
  pending: 'border-2 border-[#9A95AE] bg-white',
};

const num = (v: unknown) => Number(v ?? 0) || 0;

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
};

const EVENT_LABELS: Record<string, string> = {
  CHECKOUT_COMPLETED: 'Checkout completed',
  TRIAL_CONVERTED: 'Trial converted to paid plan',
  TRIAL_STARTED: 'Trial started',
  PAYMENT_RECOVERED: 'Payment recovered',
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_SUCCEEDED: 'Payment succeeded',
  PAST_DUE: 'Account past due',
  GRACE_PERIOD: 'Grace period started',
  SUSPENDED: 'Account suspended',
  REACTIVATED: 'Account reactivated',
  CANCELED: 'Subscription canceled',
  CANCEL_SCHEDULED: 'Cancel scheduled',
  PLAN_CHANGED: 'Plan changed',
  RENEWED: 'Subscription renewed',
};

type TimelineNode = {
  uid: string;
  label: string;
  date: string;
  detail?: string;
  tone: 'error' | 'warning' | 'success' | 'pending';
};

const eventTone = (type: string): TimelineNode['tone'] => {
  if (type.includes('FAIL') || type.includes('PAST_DUE') || type.includes('SUSPEND') || type === 'CANCELED') {
    return 'error';
  }
  if (type.includes('GRACE') || type.includes('RETRY') || type === 'CANCEL_SCHEDULED') {
    return 'warning';
  }
  if (
    type.includes('COMPLETED') ||
    type.includes('RECOVERED') ||
    type.includes('CONVERTED') ||
    type.includes('SUCCEEDED') ||
    type.includes('REACTIVATED') ||
    type.includes('RENEWED')
  ) {
    return 'success';
  }
  return 'pending';
};

const statusTransition = (prev?: string | null, next?: string | null) => {
  const p = prev ? String(prev).toUpperCase() : null;
  const n = next ? String(next).toUpperCase() : null;
  if (p && n && p !== n) return `${p} → ${n}`;
  if (n) return n;
  return null;
};

const mapEventsToTimeline = (events: any[]): TimelineNode[] => {
  if (!events.length) return [];

  const sorted = [...events].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );

  return sorted.slice(0, 12).map((e) => {
    const type = String(e.event_type ?? e.type ?? '').toUpperCase();
    const payload = e.payload ?? {};
    const parts: string[] = [];

    const transition = statusTransition(e.previous_status, e.new_status);
    if (transition) parts.push(transition);
    if (payload.invoice_period) parts.push(`Invoice period ${payload.invoice_period}`);
    if (e.source) parts.push(String(e.source));
    if (payload.checkout_session_id) {
      const sid = String(payload.checkout_session_id);
      parts.push(`Session ${sid.slice(-8)}`);
    }

    return {
      uid: e.uid ?? `${type}-${e.created_at}`,
      label: EVENT_LABELS[type] ?? type.replace(/_/g, ' '),
      date: fmtDateTime(e.created_at ?? e.occurred_at ?? e.date),
      detail: parts.length ? parts.join(' · ') : undefined,
      tone: eventTone(type),
    };
  });
};

/** lifecycle/events API returns { events: [...] } or a bare array. */
const extractSubscriptionEvents = (resp: unknown): any[] => {
  if (!resp || typeof resp !== 'object') return [];
  if (Array.isArray(resp)) return resp;
  const obj = resp as Record<string, unknown>;
  if (Array.isArray(obj.events)) return obj.events;
  if (Array.isArray(obj.results)) return obj.results;
  return [];
};

export default function PastDue() {
  const nav = useNav();

  const { data: lifecycle } = useFetch(['subscription-lifecycle-state'], fetchSubscriptionLifecycleState);
  const { data: billing } = useFetch(['subscription-billing-current'], fetchSubscriptionBillingCurrent);
  const { data: eventsResp } = useFetch(['subscription-events'], fetchSubscriptionEvents);

  const status = String(lifecycle?.status ?? billing?.status ?? 'ACTIVE').toUpperCase();
  const failedCount = num(lifecycle?.failed_payment_count);
  const preview = billing?.preview;
  const planTitle = billing?.plan?.title ?? 'Your plan';

  const previewLines: { label: string; amount: number }[] = Array.isArray(preview?.lines)
    ? preview.lines.map((l: any) => ({
        label: l.description ?? l.line_type ?? 'Line item',
        amount: num(l.amount),
      }))
    : [];

  const baseLine = previewLines.find((l) =>
    l.label.toUpperCase().includes('BASE') || l.label.toLowerCase().includes('plan')
  );
  const overageTotal = previewLines
    .filter((l) => l.label.toUpperCase().includes('OVERAGE') || l.label.toLowerCase().includes('employee'))
    .reduce((s, l) => s + l.amount, 0);

  const projectedTotal = num(preview?.total) || previewLines.reduce((s, l) => s + l.amount, 0);
  const amountDue = num(lifecycle?.amount_due) || (status === 'PAST_DUE' || status === 'GRACE' ? projectedTotal : 0);

  const invoiceRef =
    lifecycle?.invoice_number ??
    lifecycle?.invoice ??
    billing?.latest_invoice?.number ??
    billing?.latest_invoice?.uid ??
    null;

  const graceDeadline = lifecycle?.grace_ends_at ?? lifecycle?.suspend_ends_at;
  const periodEnd = lifecycle?.current_period_end ?? billing?.billing_period?.end;

  const eventList = extractSubscriptionEvents(eventsResp);
  const timeline = mapEventsToTimeline(eventList);

  const isHealthy =
    (status === 'ACTIVE' || status === 'TRIALING') && failedCount === 0 && !lifecycle?.dunning_started_at;
  const isPastDue = status === 'PAST_DUE' || status === 'GRACE';
  const isSuspended = status === 'SUSPENDED' || status === 'EXPIRED';

  const retriesUsed = failedCount;
  const maxRetries = num(lifecycle?.max_retry_attempts) || 3;

  return (
    <div className="space-y-[22px]">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.6px] text-[#16172A]">
            Account Health
          </h1>
          <p className="mt-0.5 text-[14px] text-[#6F6A85]">
            Review your payment status and take action to keep your account active.
          </p>
        </div>
        <Btn
          variant="secondary"
          icon={LifeBuoy}
          onClick={() => nav.toast({ tone: 'info', title: 'Support notified' })}
        >
          Contact Support
        </Btn>
      </div>

      {/* ── Status banner ── */}
      {isHealthy ? (
        <div
          className={cn(
            'rounded-2xl border border-[#1FA97A]/20 p-6',
            'bg-[linear-gradient(135deg,#D4F5E9,#e8faf3)]'
          )}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1FA97A]/15 text-[#1FA97A]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Healthy</Badge>
                <span className="text-[17px] font-bold text-[#16172A]">
                  {status === 'TRIALING' ? 'Trial active' : 'Payments on track'}
                </span>
              </div>
              <p className="text-[14px] leading-relaxed text-[#16172A]/70">
                Your <span className="font-semibold text-[#16172A]">{planTitle}</span> subscription
                is <span className="font-semibold text-[#1FA97A]">{status}</span>.
                {periodEnd && (
                  <>
                    {' '}
                    Next billing date:{' '}
                    <span className="font-semibold text-[#16172A]">{fmtDate(periodEnd)}</span>.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'rounded-2xl border p-6',
            isSuspended
              ? 'border-[#EF4444]/30 bg-[linear-gradient(135deg,#FCE8E8,#fde4e4)]'
              : 'border-[#F59E0B]/25 bg-[linear-gradient(135deg,#FDF2DE,#fef6e8)]'
          )}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  isSuspended ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                )}
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={isSuspended ? 'error' : 'warning'}>
                    {status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[17px] font-bold text-[#16172A]">Payment action needed</span>
                </div>
                <p className="text-[14px] leading-relaxed text-[#16172A]/70">
                  {invoiceRef
                    ? `Outstanding invoice ${invoiceRef}. `
                    : 'A recent payment could not be processed. '}
                  {graceDeadline
                    ? `Update your payment method before ${fmtDate(graceDeadline)} to avoid suspension.`
                    : 'Update your payment method to restore full access.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3 sm:flex-col sm:items-end">
              <Btn variant="danger" onClick={() => nav.go('payment')}>
                Update Payment Method
              </Btn>
              {isPastDue && (
                <Btn
                  variant="secondary"
                  icon={RefreshCw}
                  onClick={() =>
                    nav.toast({
                      tone: 'info',
                      title: 'Retrying payment…',
                      msg: 'This can take a moment.',
                    })
                  }
                >
                  Retry payment now
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column grid (equal height + scrollable body) ── */}
      <div className="grid gap-[22px] lg:grid-cols-2 lg:items-stretch">
        {/* A) Timeline / activity */}
        <Card className="flex h-[480px] flex-col overflow-hidden">
          <div className="mb-5 flex shrink-0 items-center justify-between">
            <span className="text-[15px] font-bold text-[#16172A]">
              {isHealthy ? 'Recent activity' : 'Retry schedule'}
            </span>
            {!isHealthy && retriesUsed > 0 && (
              <Badge tone="warning">
                {retriesUsed} of {maxRetries} retries used
              </Badge>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {timeline.length > 0 ? (
            <ol className="relative ml-[9px] space-y-0">
              {timeline.map((node, i) => {
                const isLast = i === timeline.length - 1;
                return (
                  <li key={node.uid} className="relative flex gap-4 pb-0">
                    <div className="relative flex flex-col items-center">
                      <span
                        className={cn(
                          'relative z-10 mt-[3px] h-3 w-3 shrink-0 rounded-full',
                          timelineDotClass[node.tone]
                        )}
                      />
                      {!isLast && (
                        <span
                          className="mt-1 w-px flex-1 bg-[rgba(22,23,42,0.12)]"
                          style={{ minHeight: 44 }}
                        />
                      )}
                    </div>
                    <div className={cn('pb-7', isLast && 'pb-0')}>
                      <p
                        className={cn(
                          'text-[14px] font-semibold',
                          node.tone === 'pending' ? 'text-[#9A95AE]' : 'text-[#16172A]'
                        )}
                      >
                        {node.label}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-[12.5px]',
                          node.tone === 'pending' ? 'text-[#9A95AE]' : 'text-[#6F6A85]'
                        )}
                      >
                        {node.date}
                      </p>
                      {node.detail && (
                        <p className="mt-0.5 text-[12px] leading-snug text-[#9A95AE]">
                          {node.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-[#F8F6FF] px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1FA97A]" />
              <p className="text-[13.5px] text-[#6F6A85]">
                {isHealthy
                  ? 'No payment issues on record. Your subscription events will appear here when available.'
                  : 'No dunning events yet. Check back after the next billing attempt.'}
              </p>
            </div>
          )}
          </div>
        </Card>

        {/* B) Billing summary */}
        <Card className="flex h-[480px] flex-col overflow-hidden">
          <div className="shrink-0">
            <Eyebrow>{isHealthy ? 'Upcoming charge' : 'Amount due'}</Eyebrow>
            <div className="mt-5">
              <p className="text-[44px] font-extrabold leading-none tracking-[-1.6px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {currency(isHealthy ? projectedTotal : amountDue)}
              </p>
              {invoiceRef && !isHealthy && (
                <p className="mt-1.5 font-mono text-[13px] text-[#6F6A85]">{invoiceRef}</p>
              )}
              {isHealthy && periodEnd && (
                <p className="mt-1.5 text-[13px] text-[#6F6A85]">
                  Estimated for {fmtDate(periodEnd)}
                </p>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pt-5 pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
          {previewLines.length > 0 ? (
            <div className="space-y-2.5">
              {previewLines.map((line, i) => (
                <div
                  key={`${line.label}-${i}`}
                  className="flex items-center justify-between text-[14px] text-[#16172A]"
                >
                  <span className="text-[#6F6A85]">{line.label}</span>
                  <span className="[font-variant-numeric:tabular-nums]">
                    {currency(line.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-dashed border-[#D8D2EC]" />
              <div className="flex items-center justify-between text-[15px] font-bold text-[#16172A]">
                <span>Total</span>
                <span className="[font-variant-numeric:tabular-nums]">
                  {currency(isHealthy ? projectedTotal : amountDue)}
                </span>
              </div>
            </div>
          ) : baseLine || overageTotal ? (
            <div className="space-y-2.5">
              {baseLine && (
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#6F6A85]">Plan</span>
                  <span className="[font-variant-numeric:tabular-nums]">
                    {currency(baseLine.amount)}
                  </span>
                </div>
              )}
              {overageTotal > 0 && (
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#6F6A85]">Employee overage</span>
                  <span className="[font-variant-numeric:tabular-nums]">
                    {currency(overageTotal)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13.5px] text-[#9A95AE]">
              Billing breakdown will appear when preview data is available from billing/current.
            </p>
          )}
          </div>

          <div className="shrink-0 space-y-3 border-t border-[rgba(22,23,42,0.06)] pt-5">
            {!isHealthy && amountDue > 0 && (
              <Btn variant="primary" className="w-full" onClick={() => nav.go('payment')}>
                Pay {currency(amountDue)} now
              </Btn>
            )}

            {isHealthy && (
              <Btn variant="secondary" className="w-full" onClick={() => nav.go('payment')}>
                Manage payment method
              </Btn>
            )}

            {graceDeadline && !isHealthy && (
              <div className="flex items-center gap-3 rounded-xl bg-[#FDF2DE] px-4 py-3 text-[#B97608]">
                <Clock className="h-4 w-4 shrink-0" />
                <p className="text-[13px] font-medium leading-snug">
                  Service continues until {fmtDate(graceDeadline)} unless payment is resolved.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
