'use client';

import React, { useState } from 'react';
import moment from 'moment';
import { Eye, FileText, FileCheck2, CheckCircle2, Loader2, Info } from 'lucide-react';
import {
  payrollTaxFillingPDFPreview,
  post941FormCreate,
  post941SignForm,
} from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { getRelativePath } from '@/app/helpers/crypto';
import { Chip, IconChip, VioletButton } from '@/components/violet';
import { cn } from '@/lib/utils';
import TaxReturnPreview from './TaxReturnPreview';

const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

interface FillingProps {
  data: any;
  isLoading: boolean;
  payQuarter: string;
  setPayQuarter: (quarter: string) => void;
  refetchFiling: () => void;
}

const formNo = (item: any) => `${item?.form_type || ''}`.match(/9\d{2}/)?.[0] || '941';
const filingId = (item: any, i: number) => `${item?.id ?? item?.form_type ?? i}`;

const Filling: React.FC<FillingProps> = ({ data, isLoading }) => {
  const [filed, setFiled] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);

  const filings: any[] = data?.filings || [];
  const total = filings.length;
  const filedCount = filings.filter((it, i) => filed.has(filingId(it, i))).length;
  const progress = total ? (filedCount / total) * 100 : 0;

  const isOverdue = (dueDate?: string) =>
    !!dueDate && new Date(dueDate).getTime() < new Date().getTime();

  /* ── real actions (preserved) ──────────────────────────────────────────── */
  const create941Payload = () => {
    const socialSecurityTax = (parseFloat(data?.wages_total?.total_wages || 0) * 0.124).toFixed(2);
    const medicareTax = (parseFloat(data?.wages_total?.total_wages || 0) * 0.029).toFixed(2);
    const totalSocialSecurityMedicare = (
      parseFloat(socialSecurityTax) + parseFloat(medicareTax)
    ).toFixed(2);
    const federalTaxTotal = parseFloat(data?.federal_tax_total?.total || 0).toFixed(2);
    const totalTaxLiability = (
      parseFloat(federalTaxTotal) + parseFloat(totalSocialSecurityMedicare)
    ).toFixed(2);
    const totalTaxAfterAdjustment = (
      parseFloat(totalTaxLiability) - parseFloat(data?.tax_adjustments?.total_adjustments || 0)
    ).toFixed(2);

    return {
      Form941Records: [
        {
          SequenceId: '0026',
          ReturnHeader: {
            ReturnType: 'FORM941',
            TaxYr: '2024',
            Qtr: 'Q1',
            Business: {},
            IsThirdPartyDesignee: false,
            SignatureDetails: {
              SignatureType: 'FORM_8453_EMP',
              Form8453EMP: {
                Customization: {
                  BusinessLogoUrl: `${redirectUrl}/Frame_1.webp`,
                  LogoPosition: 'LEFT',
                  PrimaryColor: '#E61A1A',
                  SecondaryColor: '#18F244',
                },
                RedirectUrls: {
                  ReturnUrl: 'https://example1.com',
                  CancelUrl: 'https://example2.com',
                },
              },
            },
          },
          ReturnData: {
            Form941: {
              EmployeeCnt: data?.employee_count || 0,
              WagesAmt: Number(parseFloat(data?.wages_total?.total_wages || 0).toFixed(2)),
              FedIncomeTaxWHAmt: Number(parseFloat(federalTaxTotal).toFixed(2)),
              WagesNotSubjToSSMedcrTaxInd: false,
              SocialSecurityTaxCashWagesAmt_Col1: Number(
                parseFloat(data?.wages_total?.total_wages || 0).toFixed(2)
              ),
              TaxableSocSecTipsAmt_Col1: 0.0,
              TaxableMedicareWagesTipsAmt_Col1: Number(
                parseFloat(data?.wages_total?.total_wages || 0).toFixed(2)
              ),
              TxblWageTipsSubjAddnlMedcrAmt_Col1: 0.0,
              SocialSecurityTaxAmt_Col2: Number(parseFloat(socialSecurityTax).toFixed(2)),
              TaxOnSocialSecurityTipsAmt_Col2: 0.0,
              TaxOnMedicareWagesTipsAmt_Col2: Number(parseFloat(medicareTax).toFixed(2)),
              TaxOnWageTipsSubjAddnlMedcrAmt_Col2: 0.0,
              TotSSMdcrTaxAmt: Number(parseFloat(totalSocialSecurityMedicare).toFixed(2)),
              TaxOnUnreportedTips3121qAmt: 0.0,
              TotalTaxBeforeAdjustmentAmt: Number(parseFloat(totalTaxLiability).toFixed(2)),
              CurrentQtrFractionsCentsAmt: 0.0,
              CurrentQuarterSickPaymentAmt: 0.0,
              CurrQtrTipGrpTermLifeInsAdjAmt: 0.0,
              TotalTaxAfterAdjustmentAmt: Number(parseFloat(totalTaxAfterAdjustment).toFixed(2)),
              PayrollTaxCreditAmt: 0.0,
              IsPayrollTaxCredit: false,
              TotTaxAfterAdjustmentAndNonRfdCr: Number(parseFloat(totalTaxAfterAdjustment).toFixed(2)),
              TotTaxDepositAmt: 0.0,
              BalanceDueAmt: Number(parseFloat(totalTaxAfterAdjustment).toFixed(2)),
              OverpaidAmt: 0.0,
              TotDepositAndRfdCrAmt: 0.0,
            },
            IRSPaymentType: 'EFTPS',
            DepositScheduleType: {
              DepositorType: 'MONTHLY',
              MonthlyDepositor: {
                TaxLiabilityMonth1: 47603.54,
                TaxLiabilityMonth2: 47603.54,
                TaxLiabilityMonth3: 47603.55,
              },
              TotalQuarterTaxLiabilityAmt: 142810.63,
            },
          },
        },
      ],
    };
  };

  const createSignPayload = (recordId: string, submissionId: string) => ({
    RecordId: recordId,
    Customization: {
      BusinessLogoUrl: `${redirectUrl}/Frame_1.webp`,
      LogoPosition: 'LEFT',
      PrimaryColor: '#E61A1A',
      SecondaryColor: '#18F244',
    },
    RedirectUrls: {
      ReturnUrl: `https://accounting.balanzify.com/taxbandits/success?recordId=${recordId}&submissionId=${submissionId}`,
      CancelUrl: `https://accounting.balanzify.com/taxbandits/cancel?recordId=${recordId}&submissionId=${submissionId}`,
    },
  });

  const handlePreviewPdf = async (item: any) => {
    try {
      setDownloadingId(filingId(item, filings.indexOf(item)));
      const isAnnual = item?.period_label?.includes('Annual');
      const response = await payrollTaxFillingPDFPreview(isAnnual ? 'Q4' : item?.quarter || 'Q4', item?.year);
      if (response) {
        window.open(`/view?href=${getRelativePath(response.pdf_url)}&base_type=s3`, '_blank');
      }
    } catch {
      toast.error('Could not generate the return PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRecordFiling = async (item: any) => {
    const id = filingId(item, filings.indexOf(item));
    try {
      setRecordingId(id);
      const res: any = await post941FormCreate(create941Payload());
      if (res?.StatusCode === 200) {
        toast.success('941 form submitted successfully!');
        const recordId = res?.Form941Records?.SuccessRecords?.[0]?.RecordId;
        const submissionId = res?.SubmissionId;
        if (recordId) {
          const signRes: any = await post941SignForm(createSignPayload(recordId, submissionId));
          if (signRes?.Form8453EMPUrlPayer) {
            toast.success('941 form signed successfully!');
            window.open(signRes.Form8453EMPUrlPayer, '_blank');
          } else {
            toast.error('Failed to sign 941 form.');
          }
        } else {
          toast.error('Failed to get RecordId from 941 submission.');
        }
        setFiled((prev) => new Set(prev).add(id));
      } else {
        toast.error('Failed to submit 941 form.');
      }
    } catch {
      toast.error('An error occurred while recording the filing.');
    } finally {
      setRecordingId(null);
    }
  };

  /* ── full-page preview ──────────────────────────────────────────────────── */
  if (previewItem) {
    const id = filingId(previewItem, filings.indexOf(previewItem));
    return (
      <TaxReturnPreview
        filing={previewItem}
        filingData={data}
        filed={filed.has(id)}
        recording={recordingId === id}
        downloading={downloadingId === id}
        onBack={() => setPreviewItem(null)}
        onRecord={() => handleRecordFiling(previewItem)}
        onDownload={() => handlePreviewPdf(previewItem)}
      />
    );
  }

  /* ── filings card ───────────────────────────────────────────────────────── */
  return (
    <div className="font-jakarta">
      {/* header */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
        <IconChip tone="violet">
          <FileText />
        </IconChip>
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-v-ink900">Tax Filings</div>
          <div className="text-[11.5px] text-v-ink400">Submit returns to federal &amp; state agencies</div>
        </div>
        <span className="flex-1" />
        {total > 0 && (
          <Chip tone="violet">
            {total} {total === 1 ? 'return' : 'returns'}
          </Chip>
        )}
      </div>

      {/* filing-progress banner */}
      {total > 0 && (
        <div
          className="flex flex-wrap items-center gap-3 px-[22px] py-3.5"
          style={{ backgroundImage: 'linear-gradient(120deg,#FBFAFF,#F5F1FF)' }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-v-primary shadow-v-card">
            <FileCheck2 className="h-[17px] w-[17px]" />
          </span>
          <span className="text-[12.5px] font-bold text-v-ink900">Filing progress</span>
          <div className="h-1.5 w-full max-w-[320px] flex-1 overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#A78BFF,#7C4DFF)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold tabular-nums text-v-ink500">
            {filedCount} of {total} returns filed
          </span>
        </div>
      )}

      {/* filing rows */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-v-tint100 border-t-v-primary" />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <IconChip tone="violet" size="lg">
            <FileText />
          </IconChip>
          <div className="text-sm font-semibold text-v-ink900">No returns to file</div>
          <div className="text-[13px] text-v-ink400">Federal filings will appear here once payroll is finalized.</div>
        </div>
      ) : (
        <div>
          {filings.map((item, index) => {
            const id = filingId(item, index);
            const no = formNo(item);
            const isFiled = filed.has(id);
            const overdue = !isFiled && isOverdue(item?.due_date);
            return (
              <div
                key={id}
                className="flex animate-v-pop flex-wrap items-center gap-3.5 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-[18px] transition-colors last:border-b-0 hover:bg-[#FAF8FF]"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                {/* form tile */}
                <span
                  className={cn(
                    'flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-[14px] leading-none transition-colors',
                    isFiled ? 'bg-v-success-bg text-v-success-fg' : 'bg-v-tint100 text-v-primary',
                  )}
                >
                  <span className="text-[8px] font-bold uppercase opacity-70">Form</span>
                  <span className="text-[19px] font-extrabold tabular-nums">{no}</span>
                </span>

                {/* title + status */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[14px] font-extrabold text-v-ink900">
                      {item?.form_title || (no === '940' ? 'Annual FUTA Tax Return' : "Employer's Quarterly Federal Tax Return")}
                    </span>
                    {isFiled ? (
                      <Chip tone="success" dot>
                        Filed
                      </Chip>
                    ) : overdue ? (
                      <Chip tone="danger" dot>
                        Past due
                      </Chip>
                    ) : (
                      <Chip tone="teal" dot>
                        Not due yet
                      </Chip>
                    )}
                  </div>
                  <div className="truncate text-[11.5px] text-v-ink400">
                    {item?.form_type}
                    {item?.period_label ? ` · ${item.period_label}` : ''}
                  </div>
                </div>

                {/* due date */}
                <div className="text-right">
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">Due date</div>
                  <div
                    className={cn(
                      'text-[12.5px] font-semibold tabular-nums',
                      overdue ? 'text-v-danger-fg' : 'text-v-ink700',
                    )}
                  >
                    {item?.due_date ? moment(item.due_date).format('MMM DD, YYYY') : '—'}
                  </div>
                </div>

                {/* actions */}
                <VioletButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => setPreviewItem(item)}
                  className="hover:border-v-primary hover:text-v-primary"
                >
                  Preview
                </VioletButton>
                <VioletButton
                  variant={isFiled ? 'soft' : 'dark'}
                  size="sm"
                  disabled={isFiled || recordingId === id}
                  onClick={() => handleRecordFiling(item)}
                  className={cn(
                    'min-w-[132px]',
                    isFiled ? 'bg-v-success-bg text-v-success-fg hover:bg-v-success-bg' : 'hover:bg-[#2A2440]',
                  )}
                  leftIcon={
                    isFiled ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : recordingId === id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )
                  }
                >
                  {isFiled ? 'Filed' : recordingId === id ? 'Recording…' : 'Record Filing'}
                </VioletButton>
              </div>
            );
          })}
        </div>
      )}

      {/* footer note */}
      {total > 0 && (
        <div
          className="flex items-center gap-2.5 px-[22px] py-3.5"
          style={{ backgroundImage: 'linear-gradient(120deg,#FBFAFF,#F5F1FF)' }}
        >
          <Info className="h-4 w-4 shrink-0 text-v-primary" />
          <span className="text-[11.5px] text-v-ink500">
            Preview each return before recording. Pilucent e-files supported forms to the IRS automatically once
            recorded.
          </span>
        </div>
      )}
    </div>
  );
};

export default Filling;
