'use client';

import moment from 'moment';
import { useEffect, useState } from 'react';
import { RefreshCw, Loader2, AlertTriangle, Ban } from 'lucide-react';
import RootPopup from '../../settings/_components/BankAccounts/PopupModal';
import {
  cancelMoovTransfer,
  fetchMoovTransferDetail,
  fetchMoovTransferTimeline,
} from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { toast } from '@/lib/ToastService';
import { TransferStatusChip, TransferTimeline } from './TransferTimelineModal';

/* Any field in `details` can be null — especially the ACH-debit block before the
   debit originates, and completed_on until it settles. Render null as "—". */
const DASH = '—';
const dash = (v: any) => (v === null || v === undefined || v === '' ? DASH : v);

// Null/empty → "—" (per the null rule) so a missing amount never renders as a
// fabricated "$0.00" on a money-movement screen.
const money = (val?: string | number | null, currency = 'USD') => {
  if (val === null || val === undefined || val === '') return DASH;
  return new Intl.NumberFormat('en-us', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(val));
};

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const fmtDate = (iso?: string | null) => (iso ? moment(iso).format('MMM D, YYYY · h:mm A') : DASH);

/* Truncate a long Moov transfer id in the middle so both ends stay recognisable. */
const truncMid = (s?: string, head = 8, tail = 6) => {
  if (!s) return DASH;
  return s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;
};

const acctLine = (acct?: any) => {
  if (!acct) return DASH;
  const type = cap(acct.account_type);
  const last4 = acct.last_four ? `••••${acct.last_four}` : '';
  return [type, last4].filter(Boolean).join(' · ') || DASH;
};

const Row = ({ label, value }: { label: string; value: any }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="max-w-[60%] break-words text-right font-medium text-gray-900">{value}</span>
  </div>
);

const PartyCard = ({ title, leg, acct }: { title: string; leg?: string; acct?: any }) => (
  <div className="flex-1 rounded-xl border bg-gray-50 p-4">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {leg && (
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200">
          {leg}
        </span>
      )}
    </div>
    <p className="mt-2 text-sm font-semibold text-gray-900">{dash(acct?.name)}</p>
    <p className="mt-0.5 text-xs text-gray-600">{acctLine(acct)}</p>
    <p className="mt-0.5 text-xs text-gray-500">{dash(acct?.bank_name)}</p>
  </div>
);

const TransferDetailModal = ({
  isOpen,
  onClose,
  transferUid,
  row,
  onCanceled,
}: {
  isOpen: boolean;
  onClose: () => void;
  transferUid?: string;
  row?: any;
  /* Fired after a successful cancel so the caller can refresh its list + counts. */
  onCanceled?: () => void;
}) => {
  const enabled = !!isOpen && !!transferUid;

  const [confirming, setConfirming] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelReqId, setCancelReqId] = useState('');

  // Reset the cancel-flow state whenever the modal opens, closes, or switches to a
  // different transfer. Without this the reused single instance would carry a prior
  // transfer's confirm panel + request id onto the next one — pre-arming the
  // destructive "Yes, cancel" and showing the wrong Moov request id.
  useEffect(() => {
    setConfirming(false);
    setCanceling(false);
    setCancelReqId('');
  }, [transferUid, isOpen]);

  /* Detail — poll while pending so the ACH-debit block + completion fill in. */
  const {
    data: detailRes,
    isPending: isDetailPending,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
    isFetching: isDetailFetching,
  } = useFetch(
    ['moov-transfer-detail', transferUid],
    fetchMoovTransferDetail,
    {},
    {
      enabled,
      retry: 1,
      refetchInterval: (query: any) =>
        (query?.state?.data?.details?.status || '').toLowerCase() === 'pending' ? 45000 : false,
      refetchOnWindowFocus: true,
    },
    transferUid
  );

  /* Timeline — shown on the same page; owns its own polling. */
  const {
    data: timelineRes,
    isPending: isTimelinePending,
    isError: isTimelineError,
    error: timelineError,
    refetch: refetchTimeline,
  } = useFetch(
    ['moov-transfer-timeline', transferUid],
    fetchMoovTransferTimeline,
    {},
    {
      enabled,
      retry: 1,
      refetchInterval: (query: any) =>
        (query?.state?.data?.data?.status || '').toLowerCase() === 'pending' ? 30000 : false,
      refetchOnWindowFocus: true,
    },
    transferUid
  );

  const d = detailRes?.details;
  const status = (d?.status || '').toLowerCase();
  const cancellable = status === 'pending'; // only in flight, before the ACH debit originates

  const tlPayload = timelineRes?.data;
  const tlStatus = (tlPayload?.status || '').toLowerCase();
  const timeline: any[] = Array.isArray(tlPayload?.timeline) ? tlPayload.timeline : [];

  const httpStatus = (detailError as any)?.response?.status;
  const body = (detailError as any)?.response?.data;
  const requestId = body?.moov_error?.request_id;

  const ps = d?.payment_summary;
  const ach = d?.ach_debit;
  const metaEntries = d?.metadata ? Object.entries(d.metadata) : [];

  const doCancel = async () => {
    if (canceling || !transferUid) return;
    setCanceling(true);
    setCancelReqId('');
    try {
      const res = await cancelMoovTransfer(transferUid);
      if (res?.success || res?.error === false) {
        toast.success('Transfer canceled.');
        setConfirming(false);
        // Backend flips the local status to `canceled` — refetch so the chip and
        // the cancel button update, and let the caller refresh its list + counts.
        refetchDetail();
        refetchTimeline();
        onCanceled?.();
      } else {
        toast.error('This transfer can no longer be canceled.');
      }
    } catch (e: any) {
      const reqId = e?.response?.data?.moov_error?.request_id;
      if (reqId) setCancelReqId(reqId);
      // 500 while too late (after the ACH debit originates) → say so plainly.
      toast.error(e?.response?.data?.message || 'This transfer can no longer be canceled.');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <RootPopup
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-full md:max-w-[640px]"
      title="Transfer detail"
    >
      {isOpen && (
        <div className="max-h-[76vh] space-y-5 overflow-y-auto pb-2 pr-1">
          {isDetailPending && !d ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading transfer…
            </div>
          ) : isDetailError && !d ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-800">
                    {httpStatus === 400
                      ? 'No direct deposit account is linked to this company.'
                      : 'Could not load this transfer.'}
                  </p>
                  {body?.message && <p className="mt-1 text-sm text-red-700">{body.message}</p>}
                  {requestId && (
                    <p className="mt-1 break-all font-mono text-[11px] text-red-600">
                      Moov request id: {requestId}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => refetchDetail()}
                    className="mt-2 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{dash(d?.description)}</p>
                    <p
                      className="mt-1 break-all font-mono text-[11px] text-gray-400"
                      title={d?.transfer_uid || transferUid}
                    >
                      {truncMid(d?.transfer_uid || transferUid)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <TransferStatusChip status={d?.status} />
                    <button
                      type="button"
                      onClick={() => refetchDetail()}
                      disabled={isDetailFetching}
                      className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-white disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${isDetailFetching ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-3xl font-semibold text-gray-900">
                  {money(
                    // Prefer the ready-made decimal string; fall back to value (cents)
                    // for math when decimal is null so a real amount never shows as $0.00.
                    d?.amount?.decimal ??
                      (d?.amount?.value != null ? d.amount.value / 100 : null),
                    d?.amount?.currency
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Created {fmtDate(d?.created_on)}
                  {d?.completed_on ? ` · Completed ${fmtDate(d?.completed_on)}` : ''}
                </p>
              </div>

              {/* From / To */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <PartyCard title="From" leg={d?.source?.leg} acct={d?.source} />
                <PartyCard title="To" leg={d?.destination?.leg} acct={d?.destination} />
              </div>

              {/* Payment summary */}
              <div className="rounded-xl border p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment summary
                </p>
                <Row label="Amount" value={money(ps?.amount, ps?.currency)} />
                <Row
                  label="Fees"
                  value={
                    ps?.fees === null || ps?.fees === undefined || ps?.fees === ''
                      ? DASH
                      : `-${money(ps.fees, ps.currency)}`
                  }
                />
                <div className="mt-1 border-t pt-2">
                  <Row label="Net amount" value={money(ps?.net_amount, ps?.currency)} />
                </div>
              </div>

              {/* ACH debit */}
              <div className="rounded-xl border p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  ACH debit
                  {d?.source?.account_type || d?.source?.last_four
                    ? ` · ${acctLine(d?.source)}`
                    : ''}
                </p>
                {ach ? (
                  <>
                    <Row label="Company name" value={dash(ach.company_name)} />
                    <Row label="ACH hold" value={dash(ach.ach_hold)} />
                    <Row label="SEC code" value={dash(ach.sec_code)} />
                    <Row
                      label="Trace number"
                      value={
                        ach.trace_number ? (
                          <span className="font-mono">{ach.trace_number}</span>
                        ) : (
                          DASH
                        )
                      }
                    />
                  </>
                ) : (
                  <p className="py-2 text-sm text-gray-500">
                    Pending — fills in once the ACH debit originates.
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="rounded-xl border p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Metadata
                </p>
                {metaEntries.length ? (
                  metaEntries.map(([k, v]) => <Row key={k} label={k} value={dash(v as any)} />)
                ) : (
                  <p className="py-2 text-sm text-gray-500">No metadata.</p>
                )}
              </div>

              {/* Timeline (same page) */}
              <div className="rounded-xl border p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status timeline
                </p>
                <TransferTimeline
                  isPending={isTimelinePending}
                  isError={isTimelineError}
                  error={timelineError}
                  timeline={timeline}
                  isLive={tlStatus === 'pending'}
                  onRetry={refetchTimeline}
                  sourceLast4={d?.source?.last_four}
                  destLast4={d?.destination?.last_four}
                />
              </div>

              {/* Cancel — only while the transfer is still in flight */}
              {cancellable && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  {!confirming ? (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-red-800">
                        This transfer can still be canceled while it’s pending.
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                      >
                        <Ban className="h-4 w-4" />
                        Cancel transfer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-800">
                        Cancel this transfer? Money movement will be stopped — this can only be
                        done while it’s still pending.
                      </p>
                      {cancelReqId && (
                        <p className="break-all font-mono text-[11px] text-red-600">
                          Moov request id: {cancelReqId}
                        </p>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setConfirming(false)}
                          disabled={canceling}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                          Keep transfer
                        </button>
                        <button
                          type="button"
                          onClick={doCancel}
                          disabled={canceling}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {canceling ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Canceling…
                            </>
                          ) : (
                            'Yes, cancel'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </RootPopup>
  );
};

export default TransferDetailModal;
