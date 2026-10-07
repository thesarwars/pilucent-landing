'use client';

import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { ChevronDown, DollarSign } from 'lucide-react';
import { fetchChartOfAccounts, postTaxPayment } from '@/app/helpers/backend';
import DatePicker from '@/components/ui/DatePicker';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { toast } from '@/lib/ToastService';
import { Drawer, VioletButton, VioletInput, money } from '@/components/violet';
import { cn } from '@/lib/utils';

const getTitle = (title: string) => (title === 'NY Income Tax' ? 'Nys Income Tax' : title);

/** Component / Amount ledger lines for a tax period. */
export const breakdownLines = (p: any): { label: string; value: number }[] => {
  const b = p?.tax_breakdown || {};
  const out: { label: string; value: number }[] = [];
  if (b.federal_income_tax !== undefined) {
    out.push(
      { label: 'Federal Income Tax', value: b.federal_income_tax },
      { label: 'Social Security', value: b.social_security },
      { label: 'Social Security Employer', value: b.social_security_employer },
      { label: 'Medicare', value: b.medicare },
      { label: 'Medicare Employer', value: b.medicare_employer },
    );
  }
  if (b.state_income_tax !== undefined) {
    out.push(
      { label: 'State Income Tax', value: b.state_income_tax },
      { label: 'State Unemployment Tax', value: b.state_unemployment_tax },
      { label: 'State Disability Tax', value: b.state_disability_tax },
      { label: 'State Employment Security Assessment', value: b.state_employment_security_assessment },
    );
  }
  return out.filter((l) => l.value !== undefined && l.value !== null);
};

/** Sum of the rendered ledger lines — always reconciles with what's displayed. */
export const linesTotal = (p: any) =>
  breakdownLines(p).reduce((s, l) => s + (Number(l.value) || 0), 0);

/**
 * The period's payable amount: the precomputed rollup when present, otherwise
 * the sum of the component breakdown lines (totals are optional in the API).
 */
export const amountOf = (p: any) => {
  const b = p?.tax_breakdown || {};
  if (b.total_federal_taxes != null) return Number(b.total_federal_taxes) || 0;
  if (b.total_state_taxes != null) return Number(b.total_state_taxes) || 0;
  return linesTotal(p);
};

const getLiabilityAccount = async (taxType: string) => {
  try {
    const res = await fetchChartOfAccounts({ title: getTitle(taxType) });
    return res?.results?.[0] || {};
  } catch {
    return {};
  }
};

interface Props {
  open: boolean;
  onClose: () => void;
  /** single-period payment */
  period?: any;
  /** bulk payment: settle every overdue period at once */
  bulkPeriods?: any[];
  refetch: () => void;
}

const TaxPaymentDrawer: React.FC<Props> = ({ open, onClose, period, bulkPeriods, refetch }) => {
  const [isPending, setIsPending] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [form, setForm] = useState<any>({});

  /* clear entered values whenever the drawer closes, so nothing leaks into the next period */
  useEffect(() => {
    if (!open) {
      setForm({});
      setShowBreakdown(false);
      setIsPending(false);
    }
  }, [open]);

  const bulk = !!bulkPeriods && bulkPeriods.length > 0;
  const periods = bulk ? bulkPeriods! : period ? [period] : [];
  const total = useMemo(() => periods.reduce((s, p) => s + amountOf(p), 0), [periods]);
  const ledgerTotal = !bulk && period ? linesTotal(period) : total;

  const heroTitle = bulk
    ? `${periods.length} overdue ${periods.length === 1 ? 'payment' : 'payments'}`
    : `${period?.tax_type || 'Tax'} Liability`;
  const lines = !bulk && period ? breakdownLines(period) : [];

  const canSubmit = !!form.record_account?.uid && !!form.payment_date && !isPending;
  const isUnemployment = !bulk && `${period?.tax_type || ''}`.includes('Unemployment');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setIsPending(true);
      let okCount = 0;
      for (const p of periods) {
        const liability = await getLiabilityAccount(p?.tax_type);
        if (!liability?.uid) {
          toast.error(`Liability account not found for ${p?.tax_type || 'tax'}.`);
          continue;
        }
        const res = await postTaxPayment({
          tax_amount: amountOf(p),
          tax_liability_account_uid: liability.uid,
          tax_record_account_uid: form.record_account.uid,
          payment_date: form.payment_date,
          check_number: form.check_number,
          notes: form.notes,
          liability_period_uid: `${p?.period_start}-${p?.period_end}`,
          is_paid: true,
        });
        if (res?.success) okCount += 1;
      }

      const failCount = periods.length - okCount;
      if (okCount === 0) {
        // total failure — keep the drawer open so the user can retry
        toast.error('Payment failed — please try again.');
        return;
      }
      if (failCount > 0) {
        // partial bulk failure — settle what worked, keep the drawer open for the rest
        toast.error(`Settled ${okCount} of ${periods.length}; ${failCount} failed — please retry.`);
        refetch?.();
        return;
      }
      toast.success(
        bulk ? `Settled ${okCount} ${okCount === 1 ? 'payment' : 'payments'}.` : 'Tax payment successful.',
      );
      setForm({});
      onClose();
      refetch?.();
    } catch {
      //error
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={432}
      iconTone="success"
      icon={<DollarSign />}
      title="Tax Payment"
      sub="Record a payment to the agency"
      footer={
        <>
          <VioletButton variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </VioletButton>
          <VioletButton
            variant="dark"
            className="flex-1 disabled:bg-[#C9C2DD] disabled:text-white"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isPending ? 'Saving…' : isUnemployment ? 'Record & file' : 'Record payment'}
          </VioletButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* dark mini-hero */}
        <div
          className="relative overflow-hidden rounded-[16px] p-4 text-white"
          style={{ backgroundImage: 'linear-gradient(135deg,#211B38,#463481)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-[130px] w-[130px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(31,169,122,0.4), transparent 70%)' }}
          />
          <div className="relative">
            <div className="text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-white/50">
              Payment
            </div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div className="min-w-0 text-[15px] font-extrabold leading-tight">{heroTitle}</div>
              <div className="shrink-0 text-[22px] font-extrabold tabular-nums">{money(total)}</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5 text-[11.5px]">
              <div>
                <div className="text-white/45">Liability period</div>
                <div className="font-semibold text-white/90">
                  {bulk ? 'Multiple periods' : period?.period_label || '—'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/45">Due date</div>
                <div className="font-semibold tabular-nums text-[#FDE2A8]">
                  {bulk
                    ? '—'
                    : period?.due_date && moment(period.due_date).isValid()
                      ? moment(period.due_date).format('MMM DD, YYYY')
                      : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* collapsible breakdown (single only) */}
        {lines.length > 0 && (
          <div className="overflow-hidden rounded-[12px] border border-v-border">
            <button
              type="button"
              onClick={() => setShowBreakdown((v) => !v)}
              className="flex w-full items-center justify-between bg-v-card-subtle px-3.5 py-2.5 text-[12.5px] font-semibold text-v-ink700 hover:bg-v-wash"
            >
              {showBreakdown ? 'Hide breakdown' : 'Show breakdown'}
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', showBreakdown && 'rotate-180')}
              />
            </button>
            {showBreakdown && (
              <div className="animate-v-pop divide-y divide-[rgba(22,23,42,0.06)]">
                {lines.map((l) => (
                  <div key={l.label} className="flex items-center justify-between px-3.5 py-2">
                    <span className="flex items-center gap-2 text-[12px] text-v-ink700">
                      <span className="h-1.5 w-1.5 rounded-full bg-v-primary" />
                      {l.label}
                    </span>
                    <span className="text-[12.5px] font-semibold tabular-nums text-v-ink900">
                      {money(Number(l.value) || 0)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-v-card-subtle px-3.5 py-2.5">
                  <span className="text-[12.5px] font-bold text-v-ink900">Total</span>
                  <span className="text-[13px] font-extrabold tabular-nums text-v-ink900">
                    {money(ledgerTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* record-to account */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
            Record to <span className="text-v-primary">*</span>
          </label>
          <AccountSelectDropDown
            required
            setValue={(value: any) => setForm((f: any) => ({ ...f, record_account: value }))}
            filters={{ account_type__title: 'Bank' }}
            ClassName="border rounded-md"
            value={form.record_account}
          />
          {form.record_account && (
            <p className="mt-1.5 text-[11px] text-v-ink400">
              Balance: {money(Number(form.record_account?.opening_balance) || 0)}
            </p>
          )}
        </div>

        {/* payment date */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
            Payment date <span className="text-v-primary">*</span>
          </label>
          <DatePicker
            required
            onChange={(value: any) => setForm((f: any) => ({ ...f, payment_date: value }))}
            ClassName="w-full rounded-md border"
            value={form.payment_date}
          />
        </div>

        <VioletInput
          label="Check number"
          placeholder="Optional"
          value={form.check_number || ''}
          onChange={(e) => setForm((f: any) => ({ ...f, check_number: e.target.value }))}
        />
        <VioletInput
          label="Note"
          placeholder="Optional"
          value={form.notes || ''}
          onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value }))}
        />
      </form>
    </Drawer>
  );
};

export default TaxPaymentDrawer;
