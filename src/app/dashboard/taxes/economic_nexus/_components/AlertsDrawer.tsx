'use client';

import * as React from 'react';
import { X, Bell, AlertTriangle, TrendingUp, Check, ArrowUpRight } from 'lucide-react';
import { IconChip } from '@/components/violet';
import { NexusDrawer } from './NexusDrawer';
import type { NexusAlert } from './nexus-data';

export interface AlertsDrawerProps {
  open: boolean;
  onClose: () => void;
  alerts: NexusAlert[];
  ack: Record<string, boolean>;
  onAck: (code: string) => void;
  onMarkAll: () => void;
  onViewState: (code: string) => void;
}

export function AlertsDrawer({
  open,
  onClose,
  alerts,
  ack,
  onAck,
  onMarkAll,
  onViewState,
}: AlertsDrawerProps) {
  // crossed first, then approaching; acknowledged sink to the bottom of each group
  const sorted = [...alerts].sort((a, b) => {
    const ackA = ack[a.code] ? 1 : 0;
    const ackB = ack[b.code] ? 1 : 0;
    if (ackA !== ackB) return ackA - ackB;
    const rank = (k: NexusAlert['kind']) => (k === 'crossed' ? 0 : 1);
    return rank(a.kind) - rank(b.kind);
  });
  const unread = alerts.filter((a) => !ack[a.code]).length;

  const header = (
    <div className="flex items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] bg-white px-5 pb-3.5 pt-[18px]">
      <IconChip tone={unread > 0 ? 'danger' : 'violet'}>
        <Bell />
      </IconChip>
      <div className="min-w-0">
        <div className="text-[14.5px] font-bold text-v-ink900">Nexus alerts</div>
        <div className="text-[11px] text-v-ink400">
          {unread} unread · {alerts.length} total
        </div>
      </div>
      <span className="flex-1" />
      <button
        type="button"
        onClick={onMarkAll}
        disabled={unread === 0}
        className="rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold text-v-primary transition-colors hover:bg-v-tint100 disabled:text-v-ink300 disabled:hover:bg-transparent"
      >
        Mark all read
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-7 w-7 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-wash2 hover:text-v-ink900"
      >
        <X className="h-[13px] w-[13px]" />
      </button>
    </div>
  );

  return (
    <NexusDrawer open={open} onClose={onClose} width={468} header={header}>
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-v-success-bg text-v-success-fg">
            <Check className="h-6 w-6" strokeWidth={2.4} />
          </span>
          <div className="text-sm font-bold text-v-ink900">All clear</div>
          <div className="text-[12.5px] text-v-ink400">
            No states are crossing or approaching a threshold right now.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((a) => {
            const acked = !!ack[a.code];
            const crossed = a.kind === 'crossed';
            return (
              <div
                key={a.code}
                className={`rounded-v-tile border bg-white p-3.5 transition-opacity ${
                  acked ? 'border-[rgba(22,23,42,0.06)] opacity-60' : 'border-[rgba(22,23,42,0.09)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <IconChip tone={crossed ? 'danger' : 'warn'}>
                    {crossed ? <AlertTriangle /> : <TrendingUp />}
                  </IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-bold text-v-ink900">{a.name}</span>
                      <span
                        className={`rounded-full px-2 py-[3px] text-[9.5px] font-extrabold uppercase tracking-[0.05em] ${
                          crossed
                            ? 'bg-v-danger-bg text-v-danger-fg'
                            : 'bg-v-warn-bg text-v-warn-fg'
                        }`}
                      >
                        {crossed ? 'Crossed' : 'Approaching'}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] tabular-nums text-v-ink400">
                      {a.pct}% of threshold · {a.when}
                    </div>
                  </div>
                  {acked && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-v-success-bg px-2.5 py-1 text-[10.5px] font-bold text-v-success-fg">
                      <Check className="h-3 w-3" strokeWidth={3} />
                      Acknowledged
                    </span>
                  )}
                </div>

                {!acked && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewState(a.code)}
                      className="inline-flex items-center gap-1.5 rounded-[9px] bg-v-wash2 px-3 py-1.5 text-[12px] font-semibold text-v-ink700 transition-colors hover:bg-v-tint100 hover:text-v-primary"
                    >
                      View state
                      <ArrowUpRight className="h-[13px] w-[13px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAck(a.code)}
                      className="inline-flex items-center gap-1.5 rounded-[9px] bg-v-tint100 px-3 py-1.5 text-[12px] font-semibold text-v-primary transition-colors hover:bg-v-primary hover:text-white"
                    >
                      <Check className="h-[13px] w-[13px]" strokeWidth={2.6} />
                      Acknowledge
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </NexusDrawer>
  );
}
