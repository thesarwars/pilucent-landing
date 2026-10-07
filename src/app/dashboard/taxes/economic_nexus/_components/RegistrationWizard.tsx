'use client';

import * as React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Check,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  Sparkles,
  CalendarClock,
} from 'lucide-react';
import { Modal, VioletButton, VioletInput, Toggle, money } from '@/components/violet';
import { cn } from '@/lib/utils';
import { type NexusState, estTax } from './nexus-data';

export interface WizardForm {
  agency: string;
  taxId: string;
  effectiveDate: string;
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  autoCollect: boolean;
}

export interface RegistrationWizardProps {
  open: boolean;
  onClose: () => void;
  state: NexusState | null;
  /** Flip the state to Registered in the parent (does not close the wizard). */
  onRegistered: (code: string, form: WizardForm) => void;
}

const STEPS = ['Review', 'Details', 'Confirm'] as const;
const FREQS: WizardForm['frequency'][] = ['Monthly', 'Quarterly', 'Annual'];

/** Suggested filing cadence from the state's sales volume. */
function suggestFrequency(state: NexusState | null): WizardForm['frequency'] {
  if (!state) return 'Quarterly';
  if (state.taxableSales >= 400000) return 'Monthly';
  if (state.taxableSales >= 120000) return 'Quarterly';
  return 'Annual';
}

function initialForm(state: NexusState | null): WizardForm {
  return {
    agency: state ? `${state.name} Department of Revenue` : '',
    taxId: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    frequency: suggestFrequency(state),
    autoCollect: true,
  };
}

/** Review · Details · Confirm progress rail; dots fill green as steps complete. */
function Stepper({ step, done }: { step: number; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const complete = done || i < step;
        const current = !done && i === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors',
                  complete
                    ? 'bg-v-success-solid text-white'
                    : current
                      ? 'bg-v-primary text-white'
                      : 'bg-v-wash2 text-v-ink400'
                )}
              >
                {complete ? <Check className="h-[13px] w-[13px]" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-[12px] font-bold',
                  complete || current ? 'text-v-ink900' : 'text-v-ink400'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1 transition-colors',
                  done || i < step ? 'bg-v-success-solid' : 'bg-v-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function RegistrationWizard({ open, onClose, state, onRegistered }: RegistrationWizardProps) {
  const suggested = suggestFrequency(state);
  const [step, setStep] = useState(0); // 0..2 = steps, 3 = done
  const [form, setForm] = useState<WizardForm>(() => initialForm(state));

  if (!state) return null;

  const set = <K extends keyof WizardForm>(k: K, v: WizardForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const prettyDate = (iso: string) =>
    iso
      ? new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  const done = step === 3;

  const confirmRegister = () => {
    onRegistered(state.code, form);
    setStep(3);
  };

  /* ── Footer per step ─────────────────────────────────────────────── */
  let footer: React.ReactNode;
  if (done) {
    footer = (
      <>
        <VioletButton variant="outline" onClick={onClose}>
          Close
        </VioletButton>
        <span className="flex-1" />
        <Link href="/dashboard/taxes/sales">
          <VioletButton variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
            View in Sales tax
          </VioletButton>
        </Link>
      </>
    );
  } else if (step === 0) {
    footer = (
      <>
        <VioletButton variant="outline" onClick={onClose}>
          Cancel
        </VioletButton>
        <span className="flex-1" />
        <VioletButton
          variant="primary"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => setStep(1)}
        >
          Continue
        </VioletButton>
      </>
    );
  } else if (step === 1) {
    footer = (
      <>
        <VioletButton
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => setStep(0)}
        >
          Back
        </VioletButton>
        <span className="flex-1" />
        <VioletButton
          variant="primary"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => setStep(2)}
        >
          Continue
        </VioletButton>
      </>
    );
  } else {
    footer = (
      <>
        <VioletButton
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => setStep(1)}
        >
          Back
        </VioletButton>
        <span className="flex-1" />
        <VioletButton
          variant="primary"
          leftIcon={<Check className="h-4 w-4" strokeWidth={2.6} />}
          onClick={confirmRegister}
        >
          Confirm &amp; register
        </VioletButton>
      </>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={560}
      icon={<Building2 />}
      title={done ? 'Registration complete' : 'Register & collect'}
      sub={`${state.name} · ${state.window}`}
      footer={footer}
    >
      {!done && (
        <div className="mb-5">
          <Stepper step={step} done={done} />
        </div>
      )}

      {/* Step 0 — Review */}
      {step === 0 && (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start gap-2.5 rounded-v-tile bg-v-tint150 px-3.5 py-3 text-[12.5px] text-v-ink700">
            <Sparkles className="mt-px h-4 w-4 shrink-0 text-v-primary" />
            <span>
              You&apos;ve crossed <b className="text-v-ink900">{state.name}</b>&apos;s economic-nexus
              threshold. Registering lets you collect and remit sales tax legally from your effective
              date forward.
            </span>
          </div>

          <div>
            <div className="mb-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-v-ink400">
              What registering sets up
            </div>
            <div className="rounded-v-tile border border-[rgba(22,23,42,0.09)] bg-white">
              {[
                `Collect tax on taxable sales shipped to ${state.name}`,
                `File ${suggested.toLowerCase()} returns with the state`,
                'Remit collected tax by each filing due date',
              ].map((t, i, arr) => (
                <div
                  key={t}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] text-v-ink700',
                    i < arr.length - 1 && 'border-b border-[rgba(22,23,42,0.06)]'
                  )}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-v-success-bg text-v-success-fg">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-v-hero p-4 text-white"
            style={{ backgroundImage: 'linear-gradient(135deg,#211B38,#463481,#6E4BE0)' }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/55">
              Estimated back exposure
            </div>
            <div className="mt-1 text-[26px] font-extrabold tabular-nums tracking-[-0.02em]">
              {money(estTax(state))}
            </div>
            <div className="mt-1 text-[11.5px] text-white/60">
              on {money(state.taxableSales)} taxable · {((state.avgRate || 0) * 100).toFixed(2)}% avg
              rate
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="flex flex-col gap-3.5">
          <VioletInput
            label="Tax agency"
            value={form.agency}
            onChange={(e) => set('agency', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <VioletInput
              label="State permit / tax ID"
              placeholder="e.g. 123-456-789"
              value={form.taxId}
              onChange={(e) => set('taxId', e.target.value)}
            />
            <VioletInput
              label="Effective date"
              type="date"
              value={form.effectiveDate}
              onChange={(e) => set('effectiveDate', e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-v-ink700">Filing frequency</div>
            <div className="grid grid-cols-3 gap-2.5">
              {FREQS.map((f) => {
                const active = form.frequency === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set('frequency', f)}
                    className={cn(
                      'relative rounded-v-tile border-[1.5px] px-3 py-3 text-center transition-all',
                      active
                        ? 'border-v-primary bg-v-tint150'
                        : 'border-[rgba(22,23,42,0.09)] bg-white hover:border-v-primary/40'
                    )}
                  >
                    {f === suggested && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-v-primary px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wide text-white">
                        Suggested
                      </span>
                    )}
                    <div
                      className={cn(
                        'text-[13px] font-bold',
                        active ? 'text-v-primary' : 'text-v-ink900'
                      )}
                    >
                      {f}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-v-tile border border-[rgba(22,23,42,0.09)] bg-white px-3.5 py-3">
            <div className="flex-1">
              <div className="text-[12.5px] font-bold text-v-ink900">
                Auto-collect on new invoices
              </div>
              <div className="text-[11px] text-v-ink400">
                Apply {state.name} tax automatically to invoices shipped there.
              </div>
            </div>
            <Toggle
              checked={form.autoCollect}
              onChange={(v) => set('autoCollect', v)}
              aria-label="Auto-collect on new invoices"
            />
          </div>
        </div>
      )}

      {/* Step 2 — Confirm */}
      {step === 2 && (
        <div className="flex flex-col gap-3.5">
          <div className="rounded-v-tile border border-[rgba(22,23,42,0.09)] bg-white px-4 py-1">
            {[
              ['State', `${state.name} (${state.code})`],
              ['Tax agency', form.agency],
              ['State permit / tax ID', form.taxId || '—'],
              ['Effective date', prettyDate(form.effectiveDate)],
              ['Filing frequency', form.frequency],
              ['Auto-collect', form.autoCollect ? 'On' : 'Off'],
            ].map(([label, value], i, arr) => (
              <div
                key={label}
                className={cn(
                  'flex items-center justify-between gap-4 py-2.5',
                  i < arr.length - 1 && 'border-b border-[rgba(22,23,42,0.06)]'
                )}
              >
                <span className="text-[12.5px] text-v-ink500">{label}</span>
                <span className="text-right text-[12.5px] font-bold text-v-ink900">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2.5 rounded-v-tile bg-v-tint150 px-3.5 py-3 text-[12.5px] text-v-ink700">
            <Info className="mt-px h-4 w-4 shrink-0 text-v-primary" />
            <span>
              Registering flips <b className="text-v-ink900">{state.name}</b> to Registered and
              starts collection on new invoices from your effective date.
            </span>
          </div>
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-v-success-bg text-v-success-fg">
            <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
          </span>
          <div>
            <div className="text-[17px] font-extrabold text-v-ink900">
              You&apos;re registered in {state.name}
            </div>
            <div className="mt-1 text-[13px] text-v-ink500">
              Collection starts on invoices shipped there from {prettyDate(form.effectiveDate)}.
            </div>
          </div>
          <div className="w-full rounded-v-tile border border-[rgba(22,23,42,0.09)] bg-white">
            {[
              ['Tax agency created', form.agency],
              ['Auto-collect', form.autoCollect ? 'Enabled' : 'Off'],
              ['Filing scheduled', `${form.frequency} returns`],
            ].map(([label, value], i, arr) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2.5 text-left',
                  i < arr.length - 1 && 'border-b border-[rgba(22,23,42,0.06)]'
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-v-success-bg text-v-success-fg">
                  {label === 'Filing scheduled' ? (
                    <CalendarClock className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  )}
                </span>
                <span className="flex-1 text-[12px] text-v-ink500">{label}</span>
                <span className="text-[12.5px] font-bold text-v-ink900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
