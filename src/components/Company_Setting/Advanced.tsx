'use client';
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Currencies } from '../../lib/helpers/Customer';
import { GetData, PatchMultipart } from '@/services/FetchMethods';
import GetToken from '@/hooks/getToken';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/app/redux/store';
import { setCompanySettingsData } from '@/app/redux/CompanyData/CompanyData';
import MainLoader from '../MainLoader/MainLoader';
import { cn } from '@/lib/utils';
import { Chip, Toggle, VioletButton, VioletInput, VioletSelect } from '@/components/violet';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Tax-year months also accept the "follow the financial year" sentinel. */
const SAME_AS_FINANCIAL = 'Same as financial year';
const taxMonths = [SAME_AS_FINANCIAL, ...months];

const accountingMethods = ['CASH', 'ACCRUAL'];

const taxSelections = [
  'SOLO_PROPRIETOR',
  'PARTNERSHIP_LLC',
  'SMALL_BUSINESS_CORP',
  'CORPORATION',
  'NONPROFIT_ORG',
  'LIMITED_LIABILITY',
  'NOT_SURE_NONE',
  'TRUST',
];

interface AdvancedInfo {
  preffered_first_financial_month: any;
  preffered_first_tax_month: any;
  accounting_method: any;
  is_chart_of_account: any;
  tax_form: any;
  is_track_classes: any;
  is_track_location: any;
  prefill_forms: any;
  auto_invoice_unbilled_activity: any;
  auto_apply_bill_payments: any;
  is_organized_job_related_activity: any;
  language: any;
  home_currency: any;
  multi_currency: any;
  is_warn_duplicate_cheque_number: any;
  is_warn_duplicate_bill_number: any;
  is_warn_duplicate_journal_number: any;
  tax_id: any;
  preffered_first_day: any;
  is_service_field: any;
  is_allow_time_to_billable: any;
  sing_me_out: any;
  created_at: any;
  updated_at: any;
}

const EMPTY: AdvancedInfo = {
  preffered_first_financial_month: 'January',
  preffered_first_tax_month: SAME_AS_FINANCIAL,
  accounting_method: 'CASH',
  is_chart_of_account: false,
  tax_form: '',
  is_track_classes: false,
  is_track_location: false,
  prefill_forms: false,
  auto_invoice_unbilled_activity: false,
  auto_apply_bill_payments: false,
  is_organized_job_related_activity: false,
  language: 'English',
  home_currency: 'USD',
  multi_currency: 'USD',
  is_warn_duplicate_cheque_number: false,
  is_warn_duplicate_bill_number: false,
  is_warn_duplicate_journal_number: false,
  tax_id: '',
  preffered_first_day: 'Monday',
  is_service_field: false,
  is_allow_time_to_billable: false,
  sing_me_out: null,
  created_at: '',
  updated_at: '',
};

/** Enum values rendered for humans: SOLO_PROPRIETOR → "Solo proprietor". */
const pretty = (raw: any): string => {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  const words = v.split('_').join(' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** "USD" → "USD — United States Dollar". */
const currencyLabel = (code: any): string => {
  const v = String(code ?? '').trim();
  if (!v) return '';
  const match = Currencies.find((c) => c.value === v);
  return match ? `${match.value} — ${match.label}` : v;
};

const Advanced = () => {
  const [editSection, setEditSection] = useState<string | null>(null);
  const token = GetToken();
  const dispatch = useAppDispatch();
  const { data, isPending, refetch } = useQuery({
    queryKey: ['company_settings'],
    queryFn: async () => {
      const response = await GetData('we/settings', token);
      dispatch(setCompanySettingsData(response));
      return response;
    },
  });

  const [advancedInfo, setAdvancedInfo] = useState<AdvancedInfo>(EMPTY);
  /** Edits live here until Save, so Cancel discards them. */
  const [draft, setDraft] = useState<AdvancedInfo>(EMPTY);

  useEffect(() => {
    if (data) {
      const next: AdvancedInfo = {
        preffered_first_financial_month: data.preffered_first_financial_month,
        preffered_first_tax_month: data.preffered_first_tax_month,
        accounting_method: data.accounting_method,
        is_chart_of_account: data.is_chart_of_account,
        tax_form: data.tax_form,
        is_track_classes: data.is_track_classes,
        is_track_location: data.is_track_location,
        prefill_forms: data.prefill_forms,
        auto_invoice_unbilled_activity: data.auto_invoice_unbilled_activity,
        auto_apply_bill_payments: data.auto_apply_bill_payments,
        is_organized_job_related_activity: data.is_organized_job_related_activity,
        language: 'English',
        home_currency: data.home_currency,
        multi_currency: data.multi_currency,
        is_warn_duplicate_cheque_number: data.is_warn_duplicate_cheque_number,
        is_warn_duplicate_bill_number: data.is_warn_duplicate_bill_number,
        is_warn_duplicate_journal_number: data.is_warn_duplicate_journal_number,
        tax_id: data.tax_id,
        preffered_first_day: data.preffered_first_day,
        is_service_field: data.is_service_field,
        is_allow_time_to_billable: data.is_allow_time_to_billable,
        sing_me_out: data.sing_me_out,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      setAdvancedInfo(next);
      setDraft(next);
    }
  }, [data]);

  /* Escape closes the open band. Opening one always re-seeds the draft. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditSection(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeSection = () => {
    setDraft(advancedInfo);
    setEditSection(null);
  };

  const handleEditClick = (section: string) => {
    if (section === editSection) return closeSection();
    setDraft(advancedInfo);
    setEditSection(section);
  };

  const setField = (key: keyof AdvancedInfo, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate: updateSettings, isPending: isUpdating } = useMutation({
    mutationKey: ['update_company_settings'],
    mutationFn: async (data: any) => PatchMultipart('we/settings', data, token),
    onSuccess: () => {
      toast.success('Settings updated successfully!');
      setAdvancedInfo(draft);
      refetch();
      setEditSection(null);
    },
    onError: () => {
      toast.error('Failed to update settings.');
    },
  });

  const handleSave = () => {
    const payload = new FormData();
    (Object.keys(draft) as (keyof AdvancedInfo)[]).forEach((key) => {
      payload.append(key, draft[key]?.toString() || '');
    });
    updateSettings(payload);
  };

  if (isPending) {
    return <MainLoader color="#9ca3af" className="h-[50vh]" />;
  }

  const actions = <Actions onSave={handleSave} onCancel={closeSection} loading={isUpdating} />;

  return (
    <div className="flex flex-col gap-5 font-jakarta">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative animate-v-rise overflow-hidden rounded-v-card border border-v-border bg-[linear-gradient(120deg,#FFFFFF_0%,#F5F1FF_100%)] p-6 shadow-v-card">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#7C4DFF,#A78BFF_45%,#5B3BC4)]" />
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[15px] bg-v-tint100 text-v-primary shadow-[inset_0_0_0_1px_rgba(124,77,255,0.14)]">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div className="min-w-[220px] flex-1">
            <h2 className="m-0 text-[24px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
              Advanced
            </h2>
            <p className="mt-1.5 max-w-[460px] text-[13px] leading-[1.5] text-v-ink500">
              Financial year, currency, categories, automation, and the fine print that keeps your
              books precise.
            </p>
          </div>
          <Chip tone="warn" dot className="self-start">
            Power settings
          </Chip>
        </div>
      </section>

      {/* ── Bands ──────────────────────────────────────────────────────── */}
      <section className="animate-v-rise rounded-v-card bg-white shadow-v-card">
        <Band
          first
          label="Accounting"
          isEditing={editSection === 'accounting'}
          onEditClick={() => handleEditClick('accounting')}
        >
          {editSection === 'accounting' ? (
            <div className="animate-v-rise">
              <SelectRow first label="First month of financial year">
                <VioletSelect
                  value={draft.preffered_first_financial_month ?? ''}
                  onChange={(e) => setField('preffered_first_financial_month', e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </VioletSelect>
              </SelectRow>
              <SelectRow label="First month of tax year">
                <VioletSelect
                  value={draft.preffered_first_tax_month ?? ''}
                  onChange={(e) => setField('preffered_first_tax_month', e.target.value)}
                >
                  {taxMonths.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </VioletSelect>
              </SelectRow>
              <SelectRow label="Accounting method">
                <VioletSelect
                  value={draft.accounting_method ?? ''}
                  onChange={(e) => setField('accounting_method', e.target.value)}
                >
                  {accountingMethods.map((m) => (
                    <option key={m} value={m}>
                      {pretty(m)}
                    </option>
                  ))}
                </VioletSelect>
              </SelectRow>
              <SelectRow label="Default tax selection">
                <VioletSelect
                  value={draft.tax_form ?? ''}
                  onChange={(e) => setField('tax_form', e.target.value)}
                >
                  <option value="">Select a tax form</option>
                  {taxSelections.map((t) => (
                    <option key={t} value={t}>
                      {pretty(t)}
                    </option>
                  ))}
                </VioletSelect>
              </SelectRow>
              {actions}
            </div>
          ) : (
            <div>
              <ValueRow
                first
                label="First month of financial year"
                value={advancedInfo.preffered_first_financial_month}
              />
              <ValueRow
                label="First month of tax year"
                value={advancedInfo.preffered_first_tax_month}
              />
              <ValueRow label="Accounting method" value={pretty(advancedInfo.accounting_method)} />
              <ValueRow label="Default tax selection" value={pretty(advancedInfo.tax_form)} />
            </div>
          )}
        </Band>

        <Band
          label="Chart of accounts"
          isEditing={editSection === 'chartOfAccounts'}
          onEditClick={() => handleEditClick('chartOfAccounts')}
        >
          {editSection === 'chartOfAccounts' ? (
            <div className="animate-v-rise">
              <ToggleRow
                first
                label="Enable account numbers"
                checked={!!draft.is_chart_of_account}
                onChange={(v) => setField('is_chart_of_account', v)}
              />
              {actions}
            </div>
          ) : (
            <BoolRow first label="Enable account numbers" on={!!advancedInfo.is_chart_of_account} />
          )}
        </Band>

        <Band
          label="Categories"
          isEditing={editSection === 'categories'}
          onEditClick={() => handleEditClick('categories')}
        >
          {editSection === 'categories' ? (
            <div className="animate-v-rise">
              <ToggleRow
                first
                label="Track classes"
                checked={!!draft.is_track_classes}
                onChange={(v) => setField('is_track_classes', v)}
              />
              <ToggleRow
                label="Track locations"
                checked={!!draft.is_track_location}
                onChange={(v) => setField('is_track_location', v)}
              />
              {actions}
            </div>
          ) : (
            <div>
              <BoolRow first label="Track classes" on={!!advancedInfo.is_track_classes} />
              <BoolRow label="Track locations" on={!!advancedInfo.is_track_location} />
            </div>
          )}
        </Band>

        <Band
          label="Automation"
          isEditing={editSection === 'automations'}
          onEditClick={() => handleEditClick('automations')}
        >
          {editSection === 'automations' ? (
            <div className="animate-v-rise">
              <ToggleRow
                first
                label="Pre-fill forms with previously entered content"
                checked={!!draft.prefill_forms}
                onChange={(v) => setField('prefill_forms', v)}
              />
              <ToggleRow
                label="Automatically invoice unbilled activity"
                checked={!!draft.auto_invoice_unbilled_activity}
                onChange={(v) => setField('auto_invoice_unbilled_activity', v)}
              />
              <ToggleRow
                label="Automatically apply bill payments"
                checked={!!draft.auto_apply_bill_payments}
                onChange={(v) => setField('auto_apply_bill_payments', v)}
              />
              {actions}
            </div>
          ) : (
            <div>
              <BoolRow
                first
                label="Pre-fill forms with previously entered content"
                on={!!advancedInfo.prefill_forms}
              />
              <BoolRow
                label="Automatically invoice unbilled activity"
                on={!!advancedInfo.auto_invoice_unbilled_activity}
              />
              <BoolRow
                label="Automatically apply bill payments"
                on={!!advancedInfo.auto_apply_bill_payments}
              />
            </div>
          )}
        </Band>

        <Band
          label="Projects"
          isEditing={editSection === 'projects'}
          onEditClick={() => handleEditClick('projects')}
        >
          {editSection === 'projects' ? (
            <div className="animate-v-rise">
              <ToggleRow
                first
                label="Organise all job related activity in one place"
                checked={!!draft.is_organized_job_related_activity}
                onChange={(v) => setField('is_organized_job_related_activity', v)}
              />
              {actions}
            </div>
          ) : (
            <BoolRow
              first
              label="Organise all job related activity in one place"
              on={!!advancedInfo.is_organized_job_related_activity}
            />
          )}
        </Band>

        <Band
          label="Language"
          isEditing={editSection === 'language'}
          onEditClick={() => handleEditClick('language')}
        >
          {editSection === 'language' ? (
            <div className="animate-v-rise">
              <VioletInput
                wrapClassName="max-w-[280px]"
                label="Language"
                value={draft.language ?? ''}
                onChange={(e) => setField('language', e.target.value)}
              />
              {actions}
            </div>
          ) : (
            <ValueRow first label="Language" value={advancedInfo.language} />
          )}
        </Band>

        <Band
          label="Currency"
          isEditing={editSection === 'currency'}
          onEditClick={() => handleEditClick('currency')}
        >
          {editSection === 'currency' ? (
            <div className="animate-v-rise">
              <SelectRow first label="Home currency">
                <VioletSelect
                  value={draft.home_currency ?? ''}
                  onChange={(e) => setField('home_currency', e.target.value)}
                >
                  {Currencies.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.value} — {c.label}
                    </option>
                  ))}
                </VioletSelect>
              </SelectRow>
              <SelectRow label="Multi currency">
                <VioletSelect
                  value={draft.multi_currency ?? ''}
                  onChange={(e) => setField('multi_currency', e.target.value)}
                >
                  {Currencies.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.value} — {c.label}
                    </option>
                  ))}
                </VioletSelect>
              </SelectRow>
              {actions}
            </div>
          ) : (
            <div>
              <ValueRow
                first
                label="Home currency"
                value={currencyLabel(advancedInfo.home_currency)}
              />
              <ValueRow
                label="Multi currency"
                value={currencyLabel(advancedInfo.multi_currency)}
              />
            </div>
          )}
        </Band>

        <Band
          label="Other preferences"
          isEditing={editSection === 'otherPreferences'}
          onEditClick={() => handleEditClick('otherPreferences')}
        >
          {editSection === 'otherPreferences' ? (
            <div className="animate-v-rise">
              <ToggleRow
                first
                label="Warn if duplicate cheque number is used"
                checked={!!draft.is_warn_duplicate_cheque_number}
                onChange={(v) => setField('is_warn_duplicate_cheque_number', v)}
              />
              <ToggleRow
                label="Warn if a bill number has already been used for that supplier"
                checked={!!draft.is_warn_duplicate_bill_number}
                onChange={(v) => setField('is_warn_duplicate_bill_number', v)}
              />
              <ToggleRow
                label="Warn if duplicate journal number is used"
                checked={!!draft.is_warn_duplicate_journal_number}
                onChange={(v) => setField('is_warn_duplicate_journal_number', v)}
              />
              {actions}
            </div>
          ) : (
            <div>
              <BoolRow
                first
                label="Warn if duplicate cheque number is used"
                on={!!advancedInfo.is_warn_duplicate_cheque_number}
              />
              <BoolRow
                label="Warn if a bill number has already been used for that supplier"
                on={!!advancedInfo.is_warn_duplicate_bill_number}
              />
              <BoolRow
                label="Warn if duplicate journal number is used"
                on={!!advancedInfo.is_warn_duplicate_journal_number}
              />
            </div>
          )}
        </Band>
      </section>
    </div>
  );
};

/* ── Presentational primitives ───────────────────────────────────────── */

interface BandProps {
  label: string;
  isEditing: boolean;
  onEditClick: () => void;
  /** Skips the top divider on the first band of the card. */
  first?: boolean;
  children: React.ReactNode;
}

/** One settings band: fixed label column · content · Edit. */
const Band = ({ label, isEditing, onEditClick, first, children }: BandProps) => (
  <div
    className={cn(
      'px-6 py-5 transition-colors first:rounded-t-v-card last:rounded-b-v-card',
      !first && 'border-t border-v-border',
      isEditing && 'bg-v-tint50'
    )}
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="shrink-0 text-[14px] font-bold text-v-ink900 sm:w-[158px]">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
      {!isEditing && (
        <VioletButton variant="soft" size="sm" onClick={onEditClick} className="shrink-0">
          Edit
        </VioletButton>
      )}
    </div>
  </div>
);

const rowBase = (first?: boolean) =>
  cn(
    'grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-4 py-2.5',
    !first && 'border-t border-v-border/60'
  );

/** Read-only row with a free-text value. */
const ValueRow = ({ label, value, first }: { label: string; value: any; first?: boolean }) => {
  const text = String(value ?? '').trim();
  return (
    <div className={rowBase(first)}>
      <span className="text-[13.5px] text-v-ink500">{label}</span>
      <span className={cn('text-[13.5px] font-semibold', text ? 'text-v-ink900' : 'text-v-ink400')}>
        {text || 'Not set'}
      </span>
    </div>
  );
};

/** Read-only row rendering a boolean as On/Off. */
const BoolRow = ({ label, on, first }: { label: string; on: boolean; first?: boolean }) => (
  <div className={rowBase(first)}>
    <span className="text-[13.5px] text-v-ink500">{label}</span>
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[13.5px] font-bold',
        on ? 'text-v-success-fg' : 'text-v-ink400'
      )}
    >
      <span
        className={cn(
          'h-[5px] w-[5px] shrink-0 rounded-full',
          on ? 'bg-v-success-solid' : 'bg-v-ink300'
        )}
      />
      {on ? 'On' : 'Off'}
    </span>
  </div>
);

/** Edit row with a switch. */
const ToggleRow = ({
  label,
  checked,
  onChange,
  first,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  first?: boolean;
}) => (
  <div
    className={cn(
      'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3',
      !first && 'border-t border-v-border/60'
    )}
  >
    <span className="text-[13.5px] font-medium text-v-ink900">{label}</span>
    <Toggle checked={checked} onChange={onChange} aria-label={label} />
  </div>
);

/** Edit row holding a select in the right-hand column. */
const SelectRow = ({
  label,
  first,
  children,
}: {
  label: string;
  first?: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      'grid grid-cols-1 items-center gap-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(150px,240px)]',
      !first && 'border-t border-v-border/60'
    )}
  >
    <span className="text-[13.5px] font-medium text-v-ink900">{label}</span>
    {children}
  </div>
);

const Actions = ({
  onSave,
  onCancel,
  loading,
}: {
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}) => (
  <div className="mt-5 flex items-center gap-3">
    <VioletButton variant="outline" size="sm" onClick={onCancel}>
      Cancel
    </VioletButton>
    <VioletButton variant="primary" size="sm" onClick={onSave} disabled={loading}>
      {loading ? 'Saving…' : 'Save'}
    </VioletButton>
  </div>
);

export default Advanced;
