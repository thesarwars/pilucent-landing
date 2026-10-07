'use client';

import React, { useState } from 'react';
import { Lock, ReceiptText, ShieldCheck } from 'lucide-react';
import { Btn, Badge, Card, Eyebrow, Toggle } from '../ui';
import { company, currency } from '../data';
import { useNav } from '../nav';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ *
 * Local helpers
 * ------------------------------------------------------------------ */

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  mono,
  type = 'text',
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  type?: string;
  maxLength?: number;
}) => (
  <div className="flex flex-col">
    <label className="mb-1.5 text-[13px] font-semibold text-[#6F6A85]">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={cn(
        'h-11 w-full rounded-[14px] border border-[#D8D2EC] bg-white px-4 text-[14.5px] text-[#16172A] placeholder:text-[#9A95AE] focus:border-[#7C4DFF] focus:outline-none focus:ring-4 focus:ring-[rgba(124,77,255,.14)]',
        mono && 'font-mono'
      )}
    />
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-3 py-[10px]">
    <span className="text-[13.5px] text-[#9A95AE]">{label}</span>
    <span className="text-[14px] font-semibold text-[#16172A]">{value}</span>
  </div>
);

/* ------------------------------------------------------------------ *
 * Payment screen
 * ------------------------------------------------------------------ */

export default function Payment() {
  const nav = useNav();

  /* add-card form fields */
  const [holder, setHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  return (
    <div className="space-y-[22px]">
      {/* ---- Own header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.4px] text-[#16172A]">
            Payment Method
          </h1>
          <p className="mt-0.5 text-[14px] text-[#6F6A85]">
            Manage your billing cards and contact details.
          </p>
        </div>
        <Btn
          variant="secondary"
          icon={ReceiptText}
          onClick={() => nav.go('invoices')}
        >
          Billing history
        </Btn>
      </div>

      {/* ---- Two-column layout ---- */}
      <div className="grid gap-[22px] lg:grid-cols-[1.15fr_1fr]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-[22px]">
          {/* A) Default payment method */}
          <Card>
            <Eyebrow>Default payment method</Eyebrow>

            {/* Credit card visual */}
            <div
              className="relative mt-4 flex h-[200px] w-full flex-col overflow-hidden rounded-2xl p-6 text-white"
              style={{
                background:
                  'linear-gradient(135deg,#16172A 0%,#33245f 60%,#7C4DFF 130%)',
              }}
            >
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute -bottom-10 -left-6 h-44 w-44 rounded-full bg-white/5" />

              {/* Top row: chip + brand */}
              <div className="flex items-center justify-between">
                {/* Chip */}
                <div
                  className="h-8 w-11 rounded-[6px]"
                  style={{
                    background:
                      'linear-gradient(135deg,#e9d9a8,#b8923f)',
                  }}
                />
                {/* Brand */}
                <span className="text-[22px] font-bold italic tracking-wide text-white/90">
                  VISA
                </span>
              </div>

              {/* Card number */}
              <div className="mt-auto font-mono text-[20px] tracking-widest">
                &bull;&bull;&bull;&bull;&nbsp;&bull;&bull;&bull;&bull;&nbsp;&bull;&bull;&bull;&bull;&nbsp;
                {company.card.last4}
              </div>

              {/* Bottom row: holder + expiry */}
              <div className="mt-2 flex items-end justify-between">
                <span className="text-[13px] font-semibold uppercase tracking-widest text-white/80">
                  {company.card.holder}
                </span>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    Expires
                  </p>
                  <p className="text-[14px] font-mono font-semibold text-white/90">
                    {company.card.exp}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions below card */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn
                variant="secondary"
                onClick={() => nav.toast({ tone: 'info', title: 'Update card' })}
              >
                Update
              </Btn>
              <Btn
                variant="dangerghost"
                onClick={() => nav.toast({ tone: 'info', title: 'Card removed' })}
              >
                Remove
              </Btn>
            </div>
          </Card>

          {/* B) Add new card form */}
          <Card>
            <Eyebrow>Add a new card</Eyebrow>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="col-span-2">
                <Field
                  label="Cardholder name"
                  value={holder}
                  onChange={setHolder}
                  placeholder="Full name on card"
                />
              </div>
              <div className="col-span-2">
                <Field
                  label="Card number"
                  value={cardNumber}
                  onChange={setCardNumber}
                  placeholder="1234 5678 9012 3456"
                  mono
                  maxLength={19}
                />
              </div>
              <Field
                label="Expiry (MM/YY)"
                value={expiry}
                onChange={setExpiry}
                placeholder="MM/YY"
                maxLength={5}
              />
              <Field
                label="CVC"
                value={cvc}
                onChange={setCvc}
                placeholder="•••"
                maxLength={4}
              />
              <div className="col-span-2">
                <Field
                  label="Billing ZIP"
                  value={zip}
                  onChange={setZip}
                  placeholder="ZIP / postal code"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Set as default toggle */}
            <div className="mt-4 flex items-center gap-3">
              <Toggle checked={setAsDefault} onChange={setSetAsDefault} />
              <span className="text-[14px] font-semibold text-[#16172A]">
                Set as default
              </span>
            </div>

            {/* Encryption note */}
            <div className="mt-3 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 flex-shrink-0 text-[#9A95AE]" />
              <span className="text-[12.5px] text-[#6F6A85]">
                Encrypted &amp; tokenized — we never store full card numbers.
              </span>
            </div>

            {/* Save card button */}
            <div className="mt-4">
              <Btn
                variant="primary"
                icon={Lock}
                onClick={() => nav.toast({ tone: 'success', title: 'Card saved' })}
              >
                Save card
              </Btn>
            </div>
          </Card>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-[22px]">
          {/* C) Billing contact */}
          <Card>
            <Eyebrow>Billing contact</Eyebrow>
            <div className="mt-3 divide-y divide-[rgba(22,23,42,0.07)]">
              <InfoRow label="Company" value={company.name} />
              <InfoRow label="Email" value={company.email} />
              <InfoRow label="Country" value={company.country} />
              <InfoRow label="Currency" value={company.currency} />
            </div>
          </Card>

          {/* D) Tax profile */}
          <Card>
            <Eyebrow>Tax profile</Eyebrow>
            <div className="mt-3 divide-y divide-[rgba(22,23,42,0.07)]">
              <InfoRow label="Tax / VAT ID" value="—" />
              <InfoRow label="Billing address" value="—" />
              <InfoRow label="State" value="—" />
              <InfoRow label="ZIP" value="—" />
            </div>
          </Card>

          {/* E) Assurance (info-tinted) */}
          <Card className="border-0 bg-[#E6EEFE]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8]/10">
                <ShieldCheck className="h-5 w-5 text-[#1d4ed8]" />
              </div>
              <div>
                <p className="text-[14.5px] font-bold text-[#1d4ed8]">
                  Tokenized &amp; PCI-DSS Level 1
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#1d4ed8]/70">
                  Your card data is tokenized by our payment processor and never
                  stored in plaintext on our servers. All transactions are
                  encrypted end-to-end and audited annually for PCI-DSS Level 1
                  compliance.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
