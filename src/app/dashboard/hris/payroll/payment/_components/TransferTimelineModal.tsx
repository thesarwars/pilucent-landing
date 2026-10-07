'use client';

import moment from 'moment';
import { RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import RootPopup from '../../settings/_components/BankAccounts/PopupModal';
import { fetchMoovTransferDetail, fetchMoovTransferTimeline } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';

/* Overall transfer status -> chip. Amber for pending, red for failed: a red
   "pending" would read as an error, and ACH sitting pending for a day is normal. */
const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  completed: 'bg-green-100 text-green-800 ring-green-200',
  failed: 'bg-red-100 text-red-700 ring-red-200',
  canceled: 'bg-gray-100 text-gray-600 ring-gray-200',
};

export const TransferStatusChip = ({ status }: { status?: string }) => {
  const key = (status || '').toLowerCase();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        STATUS_TONE[key] || 'bg-gray-100 text-gray-600 ring-gray-200'
      }`}
    >
      {status || '—'}
    </span>
  );
};

export const usd = (cents: number) =>
  new Intl.NumberFormat('en-us', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);

/* Presentational timeline body. The caller owns the query (and its polling) and
   passes the result down, so the timeline modal and the transfer-detail modal
   render the exact same steps without duplicating the fetch logic. */
export const TransferTimeline = ({
  isPending,
  isError,
  error,
  timeline,
  isLive,
  onRetry,
  sourceLast4,
  destLast4,
}: {
  isPending: boolean;
  isError: boolean;
  error?: any;
  timeline: any[];
  isLive: boolean;
  onRetry: () => void;
  sourceLast4?: string;
  destLast4?: string;
}) => {
  const httpStatus = error?.response?.status;
  const body = error?.response?.data;
  const requestId = body?.moov_error?.request_id;

  const legLabel = (key: string) => {
    if (key.startsWith('debit')) return `ACH debit${sourceLast4 ? ` · ••••${sourceLast4}` : ''}`;
    if (key.startsWith('credit')) return `ACH credit${destLast4 ? ` · ••••${destLast4}` : ''}`;
    return null;
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading timeline…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-800">
              {httpStatus === 400
                ? 'No direct deposit account is linked to this company.'
                : 'Could not load the transfer timeline.'}
            </p>
            {body?.message && <p className="mt-1 text-sm text-red-700">{body.message}</p>}
            {requestId && (
              <p className="mt-1 break-all font-mono text-[11px] text-red-600">
                Moov request id: {requestId}
              </p>
            )}
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!timeline.length) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">
        No timeline steps reported for this transfer yet.
      </p>
    );
  }

  return (
    <>
      <ol className="relative pl-1">
        {timeline.map((step: any, i: number) => {
          const leg = legLabel(step?.key || '');
          const prevLeg = i > 0 ? legLabel(timeline[i - 1]?.key || '') : null;
          const isLast = i === timeline.length - 1;
          return (
            <li key={step?.key || i}>
              {leg && leg !== prevLeg && (
                <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 first:mt-0">
                  {leg}
                </p>
              )}
              <div className="relative flex gap-3 pb-5">
                {/* connector */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-[7px] top-4 h-full w-px ${
                      step?.done ? 'bg-green-500/40' : 'bg-gray-200'
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                    step?.done ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      step?.done ? 'font-medium text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step?.label}
                  </p>
                  {step?.done && step?.at ? (
                    <time className="mt-0.5 block text-xs text-gray-500">
                      {moment(step.at).format('MM/DD/YY, h:mm A')}
                    </time>
                  ) : (
                    <span className="mt-0.5 block text-xs text-gray-400">Pending</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {isLive && (
        <p className="flex items-center gap-1.5 border-t pt-3 text-xs text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Live — refreshing every 30s until this transfer settles.
        </p>
      )}
    </>
  );
};

/* Standalone timeline modal (status view). The transfer-detail modal reuses the
   <TransferTimeline> body above but wraps it with the full detail + cancel. */
const TransferTimelineModal = ({
  isOpen,
  onClose,
  transferUid,
  row,
}: {
  isOpen: boolean;
  onClose: () => void;
  transferUid?: string;
  row?: any;
}) => {
  const enabled = !!isOpen && !!transferUid;

  const {
    data: timelineRes,
    isPending: isTimelinePending,
    isError,
    error,
    refetch,
    isFetching,
  } = useFetch(
    ['moov-transfer-timeline', transferUid],
    fetchMoovTransferTimeline,
    {},
    {
      enabled,
      retry: 1,
      /* Poll only while the transfer is still pending — the ACH credit legs land
         minutes to a day after the debit. Reading the status off the cached query
         means polling stops on its own the moment it settles. */
      refetchInterval: (query: any) =>
        (query?.state?.data?.data?.status || '').toLowerCase() === 'pending' ? 30000 : false,
      refetchOnWindowFocus: true,
    },
    transferUid
  );

  const payload = timelineRes?.data;
  const status = (payload?.status || '').toLowerCase();
  const timeline: any[] = Array.isArray(payload?.timeline) ? payload.timeline : [];
  const isLive = status === 'pending';

  /* Detail gives the bank last-4 for the leg headers. Fetched alongside the
     timeline; the modal still renders fully if it fails. */
  const { data: detailRes } = useFetch(
    ['moov-transfer-detail', transferUid],
    fetchMoovTransferDetail,
    {},
    { enabled, retry: 1 },
    transferUid
  );
  const detail = detailRes?.details;

  const sourceLast4 =
    detail?.source?.last_four || row?.source?.bank_account?.last_four_account_number;
  const destLast4 =
    detail?.destination?.last_four || row?.destination?.bank_account?.last_four_account_number;

  return (
    <RootPopup
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-full md:max-w-[560px]"
      title="Transfer status"
    >
      {isOpen && (
        <div className="space-y-5 pb-2">
          {/* summary */}
          <div className="flex items-start justify-between gap-4 rounded-xl border bg-gray-50 p-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {row?.destination?.bank_account?.holder_name || 'Transfer'}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {usd(payload?.amount?.value ?? row?.amount?.value)}
              </p>
              {row?.description && (
                <p className="mt-1 text-sm font-light text-gray-600">{row.description}</p>
              )}
              <p className="mt-1 break-all font-mono text-[11px] text-gray-400">
                {payload?.transfer_uid || transferUid}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <TransferStatusChip status={payload?.status} />
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-white disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <TransferTimeline
            isPending={isTimelinePending}
            isError={isError}
            error={error}
            timeline={timeline}
            isLive={isLive}
            onRetry={refetch}
            sourceLast4={sourceLast4}
            destLast4={destLast4}
          />
        </div>
      )}
    </RootPopup>
  );
};

export default TransferTimelineModal;
