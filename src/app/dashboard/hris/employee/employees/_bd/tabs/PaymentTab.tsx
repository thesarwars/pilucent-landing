'use client';

import * as React from 'react';
import { Banknote, Landmark, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as api from '../api';
import { ENUMS } from '../enums';
import { useEmployeeMutation } from '../hooks';
import { useLang } from '../i18n';
import type { Payment, Profile } from '../types';
import { Chip, Field, FieldGrid, Note, SaveBar, Section, SelectInput, SwitchRow, TextInput, errs, useSectionForm } from '../ui';
import { mobileValid } from '../validate';

const METHODS: { value: string; title: string; icon: React.ReactNode; note?: string; bad?: boolean }[] = [
  { value: 'BANK_TRANSFER', title: 'Bank transfer', icon: <Landmark className="h-4 w-4" />, note: 'Recommended' },
  { value: 'MFS', title: 'Mobile wallet', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'CASH', title: 'Cash', icon: <Banknote className="h-4 w-4" />, note: 'Not recommended', bad: true },
];

const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CURRENT', label: 'Current' },
  { value: 'SALARY', label: 'Salary' },
];

export function PaymentTab({ profile }: { profile: Profile }) {
  const { date } = useLang();
  const code = profile.code;
  const mutation = useEmployeeMutation(code, (changes: Partial<Payment>) => api.patchSection(code, 'payment', changes));
  const form = useSectionForm<Payment>(profile.payment, (changes) => mutation.mutateAsync(changes));
  const v = form.values;
  const set = form.set;
  const e = form.errors;

  return (
    <div className="space-y-4">
      {profile.payment.onHold && (
        <Note tone="danger">
          Salary on hold{profile.payment.holdSince ? ` since ${date(profile.payment.holdSince)}` : ''}
          {profile.payment.holdReason ? ` — ${profile.payment.holdReason}` : ' — reason not recorded'}.
        </Note>
      )}
      <Section title="Payment method" desc="How this employee's net pay leaves the company. Banking channels keep the expense deductible.">
        <div role="radiogroup" aria-label="Payment method" className="grid gap-2.5 sm:grid-cols-3">
          {METHODS.map((m) => {
            const selected = v.method === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set('method', m.value)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4DFF]',
                  selected
                    ? 'border-[#7C4DFF] bg-[rgba(124,77,255,0.08)] shadow-[0_10px_26px_-14px_rgba(124,77,255,0.8)]'
                    : 'border-[rgba(22,23,42,0.1)] bg-white/90 hover:border-[rgba(124,77,255,0.3)]'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('flex h-9 w-9 items-center justify-center rounded-xl', selected ? 'bg-[rgba(124,77,255,0.14)] text-[#6B3FE8]' : 'bg-[rgba(22,23,42,0.05)] text-[#6F6A85]')}
                >
                  {m.icon}
                </span>
                <span className="min-w-0">
                  <span className={cn('block text-[13px] font-bold', selected ? 'text-[#6B3FE8]' : 'text-[#16172A]')}>{m.title}</span>
                  {m.note && <span className={cn('block text-[11px] font-semibold', m.bad ? 'text-[#E11D48]' : 'text-[#157A5B]')}>{m.note}</span>}
                </span>
              </button>
            );
          })}
        </div>

        {v.method === 'CASH' && (
          <div className="mt-4 rounded-2xl border border-[rgba(245,178,46,0.36)] bg-[rgba(245,178,46,0.06)] p-4">
            <div aria-live="polite">
              <Chip
                tone="warn"
                icon={
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                }
              >
                Lawful under the Labour Act · costs the employer the tax deduction (s.55)
              </Chip>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#44405C]">
              Cash wages are lawful, but salary paid outside banking channels is disallowed as a business expense. With a reason it is a risk; without one it blocks payroll.
            </p>
            <FieldGrid className="mt-3">
              <Field htmlFor="f-cashreason" label="Reason for cash payment" required span={6} errors={errs(e, 'cashReason')}>
                <TextInput id="f-cashreason" value={v.cashReason} onChange={(x) => set('cashReason', x)} placeholder="Why is this employee paid in cash?" invalid={!v.cashReason.trim()} />
              </Field>
            </FieldGrid>
          </div>
        )}

        {v.method === 'BANK_TRANSFER' && (
          <FieldGrid className="mt-4">
            <Field htmlFor="f-bank" label="Bank" span={3} errors={errs(e, 'bank')}>
              <TextInput id="f-bank" value={v.bank} onChange={(x) => set('bank', x)} />
            </Field>
            <Field htmlFor="f-branch" label="Branch" span={3} errors={errs(e, 'branch')}>
              <TextInput id="f-branch" value={v.branch} onChange={(x) => set('branch', x)} />
            </Field>
            <Field htmlFor="f-routing" label="Routing number" span={2} errors={errs(e, 'routing')}>
              <TextInput id="f-routing" inputMode="numeric" value={v.routing} onChange={(x) => set('routing', x)} className="bd-mono" />
            </Field>
            <Field htmlFor="f-accname" label="Account name" span={2} errors={errs(e, 'accountName')}>
              <TextInput id="f-accname" value={v.accountName} onChange={(x) => set('accountName', x)} />
            </Field>
            <Field htmlFor="f-accnum" label="Account number" span={2} errors={errs(e, 'accountNumber')}>
              <TextInput id="f-accnum" inputMode="numeric" value={v.accountNumber} onChange={(x) => set('accountNumber', x)} className="bd-mono" />
            </Field>
            <Field htmlFor="f-acctype" label="Account type" span={2} errors={errs(e, 'accountType')}>
              <SelectInput id="f-acctype" value={v.accountType} onChange={(x) => set('accountType', x)} options={ACCOUNT_TYPES} />
            </Field>
          </FieldGrid>
        )}

        {v.method === 'MFS' && (
          <FieldGrid className="mt-4">
            <Field htmlFor="f-mfsprov" label="Provider" span={2} errors={errs(e, 'mfsProvider')}>
              <SelectInput id="f-mfsprov" value={v.mfsProvider} onChange={(x) => set('mfsProvider', x)} options={ENUMS.mfsProvider} />
            </Field>
            <Field
              htmlFor="f-wallet"
              label="Wallet number"
              required
              span={2}
              errors={errs(e, 'walletNumber').length ? errs(e, 'walletNumber') : v.walletNumber && !mobileValid(v.walletNumber) ? ['Wallet number must be 11 digits starting 01.'] : []}
            >
              <TextInput id="f-wallet" inputMode="tel" value={v.walletNumber} onChange={(x) => set('walletNumber', x)} placeholder="01XXXXXXXXX" className="bd-mono" invalid={!mobileValid(v.walletNumber)} />
            </Field>
            <Field htmlFor="f-wallettype" label="Account type" span={2} errors={errs(e, 'walletType')}>
              <SelectInput id="f-wallettype" value={v.walletType} onChange={(x) => set('walletType', x)} options={ENUMS.walletType} />
            </Field>
          </FieldGrid>
        )}
      </Section>

      <Section
        title="Salary hold"
        desc="Excludes this employee from payroll runs until the hold is lifted."
        right={<SwitchRow id="f-hold" checked={v.onHold} onChange={(x) => set('onHold', x)} title="Salary hold" />}
      >
        {v.onHold ? (
          <FieldGrid>
            <Field htmlFor="f-holdreason" label="Reason" required span={3} errors={errs(e, 'holdReason')}>
              <TextInput id="f-holdreason" value={v.holdReason} onChange={(x) => set('holdReason', x)} placeholder="Why is pay being held?" />
            </Field>
            <Field htmlFor="f-holdapprover" label="Approver" required span={3} errors={errs(e, 'holdApprover')}>
              <TextInput id="f-holdapprover" value={v.holdApprover} onChange={(x) => set('holdApprover', x)} placeholder="Who signed off?" />
            </Field>
          </FieldGrid>
        ) : (
          <p className="text-[12.5px] text-v-ink500">Not on hold.</p>
        )}
      </Section>
      <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => void form.submit()} onDiscard={form.reset} />
    </div>
  );
}
