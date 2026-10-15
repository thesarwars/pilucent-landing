'use client';

/** Every structure, newest first — superseded ones stay queryable for the periods paid on them. */

import { History } from 'lucide-react';
import { Drawer } from '@/components/violet';
import { enumLabel } from '../enums';
import { formatMonthYear } from '../format';
import { useSalaryHistory } from '../hooks';
import { useLang } from '../i18n';
import { Chip, ErrorBlock, LoadingBlock } from '../ui';

export function SalaryHistoryDrawer({ code, onClose }: { code: string; onClose: () => void }) {
  const { money, date, lang } = useLang();
  const history = useSalaryHistory(code);

  return (
    <Drawer open onClose={onClose} width={460} title="Salary history" sub="A revision closes the structure before it; nothing is overwritten." icon={<History />}>
      {history.isPending && <LoadingBlock />}
      {history.isError && <ErrorBlock error={history.error} onRetry={() => void history.refetch()} />}
      {history.data?.empty && <div className="py-10 text-center text-[12.5px] text-[#6E6883]">{history.data.message}</div>}
      <ol className="space-y-3">
        {history.data?.structures.map((s, i) =>
          s ? (
            <li key={s.uid} className="rounded-2xl border border-[rgba(22,23,42,0.08)] p-3.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold bd-mono text-v-ink900">{money(s.gross)}</span>
                {i === 0 && !s.effectiveTo ? <Chip tone="ok">In force</Chip> : <Chip tone="neutral">Superseded</Chip>}
                <span className="flex-1" />
                <span className="text-[11px] font-semibold text-[#6E6883]">{s.templateName}</span>
              </div>
              <div className="mt-1 text-[12px] text-v-ink500">
                {date(s.effectiveFrom)} → {s.effectiveTo ? date(s.effectiveTo) : 'open'}
                {s.revisionType ? ` · ${enumLabel('revisionType', s.revisionType)}` : ''}
                {s.method ? ` · ${enumLabel('revisionMethod', s.method)}` : ''}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-v-ink500">
                {s.components.map((c) => (
                  <span key={c.code}>
                    {c.code} <span className="bd-mono text-v-ink700">{money(c.amount)}</span>
                  </span>
                ))}
              </div>
              {s.reason && <div className="mt-2 rounded-xl bg-v-wash px-2.5 py-1.5 text-[11.5px] text-v-ink700">{s.reason}</div>}
              {s.reopenedPeriods.length > 0 && Number(s.arrears) !== 0 && (
                <div className="mt-2 text-[11.5px] font-semibold text-[#5A2BE0]">
                  Reopened {s.reopenedPeriods.map((p) => formatMonthYear(p, lang)).join(', ')} · {money(s.arrears, 2)} arrears
                </div>
              )}
            </li>
          ) : null
        )}
      </ol>
    </Drawer>
  );
}
