'use client';

import * as React from 'react';
import { X, Check, ShieldCheck, ArrowRight, Receipt, Landmark } from 'lucide-react';
import { VioletButton, money } from '@/components/violet';
import { NexusDrawer, MicroHeader, ThresholdMeter, RuleRow } from './NexusDrawer';
import {
  type NexusState,
  statusOf,
  statusMeta,
  meterTone,
  salesMet,
  txnMet,
  pct,
  verdict,
  shortMoney,
  COMBINATION_LABEL,
  HERO_GRAD,
  HERO_ORB,
  METER_COLOR,
} from './nexus-data';

export interface StateDetailDrawerProps {
  state: NexusState | null;
  open: boolean;
  registered: boolean;
  marked: boolean;
  onClose: () => void;
  onRegister: () => void;
  onToggleMark: () => void;
}

export function StateDetailDrawer({
  state,
  open,
  registered,
  marked,
  onClose,
  onRegister,
  onToggleMark,
}: StateDetailDrawerProps) {
  if (!state) return null;

  const st = statusOf(state, registered, marked);
  const meta = statusMeta(st);
  const isNa = st === 'na';

  const salesPct = pct(state.taxableSales, state.rule.salesThreshold);
  const salesColor = METER_COLOR[registered ? 'success' : meterTone(salesPct, salesMet(state))];
  const hasTxn = state.rule.txnThreshold != null;
  const txnPct = hasTxn ? pct(state.txnCount || 0, state.rule.txnThreshold) : 0;
  const txnColor = METER_COLOR[registered ? 'success' : meterTone(txnPct, txnMet(state))];

  const contributing = state.contributing ?? [];

  const header = (
    <div
      className="relative overflow-hidden px-5 pb-4 pt-[18px] text-white"
      style={{ backgroundImage: HERO_GRAD[st] }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-[170px] w-[170px] animate-v-float rounded-full"
        style={{ background: HERO_ORB[st] }}
      />
      <div className="relative flex items-start gap-3">
        <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-white/[0.16] text-[15px] font-extrabold tracking-wide backdrop-blur-sm">
          {state.code}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[20px] font-extrabold leading-tight tracking-[-0.01em]">
            {state.name}
          </div>
          <div className="text-[12px] text-white/70">{state.window}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.16] text-white/90 transition-colors hover:bg-white/25"
        >
          <X className="h-[15px] w-[15px]" />
        </button>
      </div>

      <div className="relative mt-3.5 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.18] px-3 py-1.5 text-[12.5px] font-bold backdrop-blur-sm">
          {st === 'registered' && <Check className="h-[14px] w-[14px]" strokeWidth={3} />}
          {meta.label}
        </span>
        <span className="text-[13px] font-medium text-white/85">{verdict(state, st)}</span>
      </div>
    </div>
  );

  const footer = (
    <div className="flex flex-col gap-2.5">
      {registered ? (
        <div className="flex items-center gap-2 rounded-v-tile bg-v-success-bg px-3.5 py-3 text-[13px] font-semibold text-v-success-fg">
          <Check className="h-[16px] w-[16px] shrink-0" strokeWidth={2.6} />
          Registered · collecting tax on new invoices shipped here
        </div>
      ) : isNa ? (
        <div className="flex items-center gap-2 rounded-v-tile bg-v-wash2 px-3.5 py-3 text-[12.5px] font-medium text-v-ink500">
          <ShieldCheck className="h-[16px] w-[16px] shrink-0 text-v-ink400" />
          No statewide sales tax — nothing to register at the state level.
        </div>
      ) : (
        <VioletButton
          variant="primary"
          className="w-full justify-center"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={onRegister}
        >
          Register &amp; start collecting
        </VioletButton>
      )}

      {/* Physical-nexus mark is meaningless where there's no statewide tax (§4 guardrail). */}
      {!isNa && (
        <VioletButton
          variant="outline"
          className="w-full justify-center"
          leftIcon={<Landmark className="h-4 w-4" />}
          onClick={onToggleMark}
        >
          {marked ? 'Remove manual mark' : 'Mark as having nexus here (physical)'}
        </VioletButton>
      )}
    </div>
  );

  return (
    <NexusDrawer open={open} onClose={onClose} width={560} header={header} footer={footer}>
      <div className="flex flex-col gap-3.5">
        {/* Activity vs threshold */}
        <section className="rounded-v-card bg-white p-4 shadow-v-card">
          <MicroHeader>Your activity vs threshold</MicroHeader>
          {isNa ? (
            <p className="mt-3 text-[13px] text-v-ink500">
              {state.name} has no statewide economic-nexus threshold. Sales here are tracked for
              reference only — local jurisdictions may still apply.
            </p>
          ) : (
            <div className="mt-3.5 flex flex-col gap-4">
              <ThresholdMeter
                label="Sales into state"
                percent={salesPct}
                percentLabel={`${Math.round(salesPct)}% of threshold`}
                valueLabel={money(state.taxableSales)}
                ofLabel={`of ${shortMoney(state.rule.salesThreshold)}`}
                color={salesColor}
              />
              {hasTxn && (
                <ThresholdMeter
                  label="Transactions into state"
                  percent={txnPct}
                  percentLabel={`${Math.round(txnPct)}% of threshold`}
                  valueLabel={`${(state.txnCount || 0).toLocaleString('en-US')}`}
                  ofLabel={`of ${state.rule.txnThreshold?.toLocaleString('en-US')}`}
                  color={txnColor}
                />
              )}
            </div>
          )}
        </section>

        {/* State rule */}
        <section className="rounded-v-card bg-white p-4 shadow-v-card">
          <MicroHeader>State rule</MicroHeader>
          <div className="mt-1.5">
            <RuleRow label="Sales threshold" value={shortMoney(state.rule.salesThreshold)} />
            <RuleRow
              label="Transaction threshold"
              value={
                state.rule.txnThreshold != null
                  ? state.rule.txnThreshold.toLocaleString('en-US')
                  : '—'
              }
            />
            <RuleRow label="Combination logic" value={COMBINATION_LABEL[state.rule.combination]} />
            <RuleRow label="Includable sales" value={state.rule.includableSales} />
            <RuleRow
              label="Measurement period"
              value={state.rule.measurementPeriod}
              last={!state.rule.note}
            />
            {state.rule.note && <RuleRow label="Note" value={state.rule.note} last />}
          </div>
        </section>

        {/* Contributing transactions */}
        {contributing.length > 0 && (
          <section className="rounded-v-card bg-white p-4 shadow-v-card">
            <div className="flex items-center justify-between">
              <MicroHeader>Contributing transactions</MicroHeader>
              <span className="text-[11px] text-v-ink400">top {contributing.length}</span>
            </div>
            <div className="mt-2.5 flex flex-col">
              {contributing.map((t, i) => (
                <div
                  key={t.ref}
                  className={`flex items-center gap-3 py-2.5 ${
                    i < contributing.length - 1 ? 'border-b border-[rgba(22,23,42,0.06)]' : ''
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-v-tint100 text-v-primary">
                    <Receipt className="h-[15px] w-[15px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-v-ink900">{t.customer}</div>
                    <div className="truncate text-[11px] text-v-ink400">
                      {t.ref} · {t.date}
                    </div>
                  </div>
                  <span className="shrink-0 text-[13px] font-bold tabular-nums text-v-ink900">
                    {money(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </NexusDrawer>
  );
}
