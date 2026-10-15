'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { ENUMS, enumLabel } from '../enums';
import { useHistory } from '../hooks';
import { useLang } from '../i18n';
import type { HistoryEntry } from '../types';
import { ErrorBlock, LoadingBlock, Section } from '../ui';

const FILTERS = [{ value: 'ALL', label: 'All' }, ...ENUMS.trackedField];

export function HistoryList({ entries, showField = true }: { entries: HistoryEntry[]; showField?: boolean }) {
  const { date } = useLang();
  return (
    <ol className="relative space-y-3 border-l-2 border-[rgba(124,77,255,0.18)] pl-5">
      {entries.map((h) => (
        <li key={h.uid} className="relative">
          <span aria-hidden="true" className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#7C4DFF] shadow-[0_0_0_2px_rgba(124,77,255,0.25)]" />
          <div className="flex flex-wrap items-baseline gap-2">
            {showField && <span className="text-[13px] font-bold text-v-ink900">{enumLabel('trackedField', h.field, h.field)}</span>}
            <span className="text-[11.5px] font-semibold text-[#6E6883]">
              Effective <span className="bd-mono">{date(h.date)}</span>
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
            <span className="rounded-lg bg-v-wash2 px-2 py-0.5 text-v-ink500">{h.from || '—'}</span>
            <ArrowRight aria-label="to" className="h-3.5 w-3.5 text-[#6E6883]" />
            <span className="rounded-lg bg-v-tint100 px-2 py-0.5 font-semibold text-v-primary-deep">{h.to || '—'}</span>
          </div>
          <div className="mt-1 text-[11.5px] text-[#6E6883]">Changed by {h.by || '—'}</div>
          {h.reason && <div className="mt-1.5 rounded-xl bg-v-wash px-3 py-1.5 text-[12px] text-v-ink700">{h.reason}</div>}
        </li>
      ))}
    </ol>
  );
}

export function HistoryTab({ code }: { code: string }) {
  const [field, setField] = React.useState('ALL');
  const history = useHistory(code, field);

  return (
    <Section
      title="Change history"
      desc="Every effective-dated change and gated operation, newest first. Append-only: a correction is a new entry."
      right={
        <div role="group" aria-label="Show changes to" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" aria-pressed={field === f.value} onClick={() => setField(f.value)} className="bd-filter !h-8 !px-3 !text-[12px]">
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {history.isPending ? (
        <LoadingBlock />
      ) : history.isError ? (
        <ErrorBlock error={history.error} onRetry={() => void history.refetch()} />
      ) : history.data.empty ? (
        <div className="py-8 text-center text-[12.5px] text-[#6E6883]">{history.data.message}</div>
      ) : (
        <HistoryList entries={history.data.entries} showField={field === 'ALL'} />
      )}
    </Section>
  );
}
