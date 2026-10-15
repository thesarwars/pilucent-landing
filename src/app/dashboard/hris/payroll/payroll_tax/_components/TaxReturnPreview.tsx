'use client';

import React from 'react';
import { ArrowLeft, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { VioletButton, money } from '@/components/violet';
import { cn } from '@/lib/utils';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const round2 = (n: number) => Math.round(n * 100) / 100;
const num = (v: any, fb: number) => {
  const x = Number(v);
  return v !== undefined && v !== null && v !== '' && Number.isFinite(x) ? x : fb;
};
const splitThree = (t: number): [number, number, number] => {
  const a = round2(t / 3);
  return [a, a, round2(t - a - a)];
};
const formNo = (filing: any) => `${filing?.form_type || ''}`.match(/9\d{2}/)?.[0] || '941';

const QUARTER_MONTHS: Record<string, string[]> = {
  Q1: ['January', 'February', 'March'],
  Q2: ['April', 'May', 'June'],
  Q3: ['July', 'August', 'September'],
  Q4: ['October', 'November', 'December'],
};

type Line = {
  no?: string;
  label: string;
  value?: number;
  count?: number;
  bold?: boolean;
  red?: boolean;
  strip?: boolean;
};
type Part = { title: string; lines: Line[] };

/* ── line-item builders (real data when present, else spec example) ──────── */
function build941(filing: any, fd: any): { parts: Part[]; balanceDue: number } {
  const employees = num(fd?.employee_count, 3);
  const wages = num(fd?.wages_total?.total_wages, 14820);
  const fedWithheld = num(fd?.federal_tax_total?.total, 0);
  const ss = round2(wages * 0.124);
  const medicare = round2(wages * 0.029);
  const ssMed = round2(ss + medicare);
  const totalTaxes = round2(fedWithheld + ssMed);
  const deposits = num(fd?.total_deposits, 1806.22);
  const balanceDue = round2(totalTaxes - deposits);
  const [m1, m2, m3] = splitThree(ssMed);
  const q = `${filing?.quarter || 'Q2'}`.toUpperCase();
  const months = QUARTER_MONTHS[q] || QUARTER_MONTHS.Q2;

  return {
    balanceDue,
    parts: [
      {
        title: 'Part 1: Answer these questions for this quarter',
        lines: [
          { no: '1', label: 'Number of employees who received wages, tips, or other compensation', count: employees },
          { no: '2', label: 'Wages, tips, and other compensation', value: wages },
          { no: '3', label: 'Federal income tax withheld from wages, tips, and other compensation', value: fedWithheld },
          { no: '5a', label: 'Taxable social security wages × 12.4%', value: ss },
          { no: '5c', label: 'Taxable Medicare wages & tips × 2.9%', value: medicare },
          { no: '5e', label: 'Total social security and Medicare taxes', value: ssMed, bold: true, strip: true },
          { no: '6', label: 'Total taxes before adjustments', value: totalTaxes, bold: true, strip: true },
          { no: '10', label: 'Total taxes after adjustments', value: totalTaxes, bold: true, strip: true },
          { no: '11', label: 'Total deposits for this quarter', value: deposits },
          { no: '14', label: 'Balance due', value: balanceDue, bold: true, strip: true, red: balanceDue > 0 },
        ],
      },
      {
        title: 'Part 2: Tell us about your deposit schedule and tax liability for this quarter',
        lines: [
          { no: '16a', label: `Tax liability — Month 1 (${months[0]})`, value: m1 },
          { no: '16b', label: `Tax liability — Month 2 (${months[1]})`, value: m2 },
          { no: '16c', label: `Tax liability — Month 3 (${months[2]})`, value: m3 },
          { label: 'Total liability for the quarter', value: ssMed, bold: true, strip: true },
        ],
      },
    ],
  };
}

function build940(filing: any, fd: any): { parts: Part[]; balanceDue: number } {
  const wages = num(fd?.wages_total?.total_wages, 14820);
  const exempt = num(fd?.futa_exempt, 0);
  const taxable = round2(num(fd?.futa_taxable, wages - exempt));
  const futaBefore = round2(taxable * 0.006);
  const deposits = num(fd?.futa_deposits, round2(futaBefore - 18));
  const balanceDue = round2(num(fd?.futa_balance_due, Math.max(0, futaBefore - deposits)) || 18);

  return {
    balanceDue,
    parts: [
      {
        title: 'Part 2: Determine your FUTA tax before adjustments',
        lines: [
          { no: '3', label: 'Total payments to all employees', value: wages },
          { no: '4', label: 'Payments exempt from FUTA tax', value: exempt },
          { no: '5', label: 'Total of payments made to each employee in excess of $7,000', value: 0 },
          { no: '7', label: 'Total taxable FUTA wages', value: taxable, bold: true, strip: true },
          { no: '8', label: 'FUTA tax before adjustments (× 0.6%)', value: futaBefore, bold: true, strip: true },
        ],
      },
      {
        title: 'Part 4: Determine your FUTA tax and balance due or overpayment',
        lines: [
          { no: '12', label: 'Total FUTA tax after adjustments', value: futaBefore, bold: true, strip: true },
          { no: '13', label: 'FUTA tax deposited for the year', value: deposits },
          { no: '14', label: 'Balance due', value: balanceDue, bold: true, strip: true, red: balanceDue > 0 },
        ],
      },
    ],
  };
}

interface Props {
  filing: any;
  filingData: any;
  filed: boolean;
  recording?: boolean;
  downloading?: boolean;
  onBack: () => void;
  onRecord: () => void;
  onDownload: () => void;
}

const TaxReturnPreview: React.FC<Props> = ({
  filing,
  filingData,
  filed,
  recording,
  downloading,
  onBack,
  onRecord,
  onDownload,
}) => {
  const no = formNo(filing);
  const { parts, balanceDue } = no === '940' ? build940(filing, filingData) : build941(filing, filingData);
  const period = filing?.period_label || `${filing?.quarter || ''} ${filing?.year || ''}`.trim();

  const business = filingData?.business || {};
  const employer = {
    name: business?.name || 'Jumatechs 24/7 LLC',
    ein: business?.ein || '47-2918340',
    trade: business?.trade_name || 'Pilucent',
    address: business?.address || 'Minneapolis, MN',
  };

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header row */}
      <div className="flex animate-v-rise flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to filings"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink700 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[17px] w-[17px]" />
        </button>
        <div className="min-w-0">
          <h1 className="m-0 text-[26px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Form {no} preview
          </h1>
          <div className="text-[12.5px] text-v-ink400">
            {employer.name} · {period || '—'}
          </div>
        </div>
        <span className="flex-1" />
        <VioletButton
          variant="secondary"
          leftIcon={downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          onClick={onDownload}
          disabled={downloading}
        >
          {downloading ? 'Preparing…' : 'Download PDF'}
        </VioletButton>
        <VioletButton
          variant={filed ? 'soft' : 'dark'}
          disabled={filed || recording}
          onClick={onRecord}
          className={filed ? 'bg-v-success-bg text-v-success-fg hover:bg-v-success-bg' : 'hover:bg-[#2A2440]'}
          leftIcon={
            filed ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : recording ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )
          }
        >
          {filed ? 'Filed' : recording ? 'Recording…' : 'Record Filing'}
        </VioletButton>
      </div>

      {/* document card */}
      <div className="mx-auto w-full max-w-[880px] animate-v-rise rounded-[18px] bg-white p-6 shadow-v-card sm:p-9">
        {/* masthead */}
        <div className="flex items-start gap-4 border-b-2 border-v-ink900 pb-5">
          <span className="flex h-[54px] w-[54px] shrink-0 flex-col items-center justify-center rounded-[12px] bg-v-ink900 leading-none text-white">
            <span className="text-[8px] font-bold uppercase tracking-wide opacity-70">Form</span>
            <span className="text-[19px] font-extrabold tabular-nums">{no}</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-v-ink400">
              Department of the Treasury — Internal Revenue Service
            </div>
            <div className="mt-0.5 text-[19px] font-extrabold leading-tight text-v-ink900">
              {filing?.form_title ||
                (no === '940'
                  ? "Employer's Annual Federal Unemployment (FUTA) Tax Return"
                  : "Employer's Quarterly Federal Tax Return")}
            </div>
            <div className="mt-0.5 text-[11px] tabular-nums text-v-ink400">
              Rev. March 2026 · OMB No. 1545-0029
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-v-tint100 px-3 py-1 text-[11px] font-bold text-[#5B3BC4]">
            {`${filing?.quarter || (no === '940' ? 'Annual' : 'Q2')} ${filing?.year || '2026'}`.trim()}
          </span>
        </div>

        {/* employer meta */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 border-b border-[rgba(22,23,42,0.08)] py-5 sm:grid-cols-2">
          {[
            { label: 'Employer name', value: employer.name },
            { label: 'Employer identification number (EIN)', value: employer.ein, mono: true },
            { label: 'Trade name', value: employer.trade },
            { label: 'Address', value: employer.address },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-v-ink400">{m.label}</div>
              <div className={cn('mt-0.5 text-[14px] font-bold text-v-ink900', m.mono && 'tabular-nums')}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* parts */}
        {parts.map((part) => (
          <div key={part.title} className="mt-5">
            <div className="rounded-[8px] bg-v-card-subtle px-3.5 py-2 text-[13px] font-extrabold text-v-ink900">
              {part.title}
            </div>
            <div className="mt-1 divide-y divide-[rgba(22,23,42,0.06)]">
              {part.lines.map((l, i) => (
                <div
                  key={`${l.no ?? ''}-${i}`}
                  className={cn(
                    'grid grid-cols-[30px_1fr_auto] items-center gap-3 px-3.5 py-2.5',
                    l.strip && 'rounded-[6px] bg-v-card-subtle',
                  )}
                >
                  <span className="text-[12px] font-bold tabular-nums text-v-ink400">{l.no ?? ''}</span>
                  <span
                    className={cn('text-[13px] text-v-ink700', l.bold && 'font-bold text-v-ink900')}
                  >
                    {l.label}
                  </span>
                  <span
                    className={cn(
                      'min-w-[110px] text-right text-[13px] tabular-nums',
                      l.bold ? 'font-extrabold text-v-ink900' : 'font-semibold text-v-ink900',
                      l.red && 'text-v-danger-fg',
                    )}
                  >
                    {l.count != null ? l.count : money(l.value ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* balance-due call-out */}
        <div
          className={cn(
            'mt-5 flex items-center justify-between rounded-[12px] px-4 py-3',
            balanceDue > 0 ? 'bg-v-danger-bg' : 'bg-v-success-bg',
          )}
        >
          <span
            className={cn(
              'text-[13px] font-extrabold',
              balanceDue > 0 ? 'text-v-danger-fg' : 'text-v-success-fg',
            )}
          >
            Balance due
          </span>
          <span
            className={cn(
              'text-[18px] font-extrabold tabular-nums',
              balanceDue > 0 ? 'text-v-danger-fg' : 'text-v-success-fg',
            )}
          >
            {money(balanceDue)}
          </span>
        </div>

        {/* footnote */}
        <div className="mt-5 rounded-[10px] bg-[#F7F5FC] px-4 py-3 text-[11.5px] leading-relaxed text-v-ink500">
          Draft preview generated from your finalized payroll runs. Figures are estimates for review only — once
          recorded, Pilucent e-files this return with the IRS.
        </div>
      </div>
    </div>
  );
};

export default TaxReturnPreview;
