'use client';
import { useEffect, useMemo, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import CustomerSupplierSelectDropdown from '@/components/ui/ScrollSelectDropDowns/CustomerSupplierSelectDropdown';
import PayMethodSelectDropdown from '@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import DatePicker from '@/components/ui/DatePicker';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import TextAnimation from '@/app/dashboard/sales/all_sales/_components/CustomTypewritter';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import {
  postRecurringTemplate,
  patchRecurringTemplate,
  fetchRecurringTemplate,
  postAttachment,
} from '@/app/helpers/backend';
import SavedAttachments from '../../../_components/SavedAttachments';
import { scheduleError, nextEndDate } from '../../../_utils/schedule';
import { Chip, IconChip, VioletButton, money } from '@/components/violet';
import {
  ArrowLeft,
  Landmark,
  Repeat,
  CalendarClock,
  Wallet,
  Paperclip,
  Loader2,
  ChevronDown,
  Trash2,
  Plus,
} from 'lucide-react';

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

/* compact violet <select> with a chevron */
function VSelect({
  value,
  onChange,
  children,
  className,
  ariaLabel,
}: {
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(V_FIELD, 'cursor-pointer appearance-none pr-9 font-medium')}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-v-ink400" />
    </div>
  );
}

/* schedule option vocabularies */
const TEMPLATE_TYPES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'REMINDER', label: 'Reminder' },
  { value: 'UNSCHEDULED', label: 'Unscheduled' },
];
const INTERVAL_KINDS = [
  { value: 'DAILY', label: 'Daily', unit: 'day' },
  { value: 'WEEKLY', label: 'Weekly', unit: 'week' },
  { value: 'MONTHLY', label: 'Monthly', unit: 'month' },
  { value: 'YEARLY', label: 'Yearly', unit: 'year' },
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_TO_API: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};
const END_TYPE_TO_API: Record<string, string> = {
  NONE: 'NONE',
  AFTER: 'AFTER_COUNT',
  BY: 'BY_DATE',
};
const API_TO_WEEKDAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const END_TYPE_TO_UI: Record<string, string> = {
  NONE: 'NONE',
  AFTER_COUNT: 'AFTER',
  BY_DATE: 'BY',
};

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};
const DAY_OPTIONS = [...Array.from({ length: 31 }, (_, i) => ordinal(i + 1)), 'last'];

const emptyFund = () => ({
  received_from: null as any,
  account: null as any,
  description: '',
  payment_method: null as any,
  ref_no: '',
  amount: '',
});

/* CATEGORY fund lines → editor rows. A deposit's payer is per line and comes back
   as whichever of customer/supplier is set, each with its *_name — from which we
   re-derive the dropdown's Customer/Supplier discriminator (§3/§6) */
const mapLinesToFunds = (lines: any[]) =>
  (lines || [])
    .filter((l: any) => l.line_type === 'CATEGORY')
    .map((l: any) => {
      let received_from: any = null;
      if (l.customer)
        received_from = { uid: l.customer, type: 'Customer', first_name: l.customer_name || '', middle_name: '', last_name: '' };
      else if (l.supplier)
        received_from = { uid: l.supplier, type: 'Supplier', first_name: l.supplier_name || '', middle_name: '', last_name: '' };
      return {
        received_from,
        account: l.charter_account
          ? { uid: l.charter_account, title: l.charter_account_title || '' }
          : null,
        description: l.description || '',
        payment_method: l.payment_method
          ? { uid: l.payment_method, title: l.payment_method_title || '' }
          : null,
        ref_no: l.reference_number || '',
        amount: `${Number(l.amount) || 0}`,
      };
    });

const RecurringDeposit = ({ uid }: { uid?: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const router = useRouter();

  /* recurring schedule state */
  const [recurring, setRecurring] = useState<any>({
    template_name: '',
    type: 'SCHEDULED',
    days_in_advance: 0,
    interval_kind: 'MONTHLY',
    day_of_month: '1st',
    weekday: 'Monday',
    every: 1,
    end_kind: 'NONE',
    end_after: 12,
  });
  const [startDate, setStartDate] = useState<any>(todayDate);
  const [endDate, setEndDate] = useState<any>(todayDate);

  /* deposit-to account + funds */
  const [account, setAccount] = useState<any>(null);
  const [funds, setFunds] = useState<any[]>([emptyFund(), emptyFund()]);
  const [trackReturns, setTrackReturns] = useState(false);
  const [cashBack, setCashBack] = useState<any>({ account: null, memo: '', amount: '' });

  /* extras */
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);

  const set = (key: string, value: any) => setRecurring((p: any) => ({ ...p, [key]: value }));
  const handleFilesChange = (newFiles: File[]) => setFiles(newFiles);

  /* both pickers default to today — move the end date past the start when "By date"
     is picked, otherwise the save 400s on an end date that isn't after the start */
  const setEndKind = (v: string) => {
    set('end_kind', v);
    if (v === 'BY') setEndDate(nextEndDate(startDate, endDate));
  };

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        setIsPending(true);
        const t = await fetchRecurringTemplate(uid);
        if (!t?.uid) return;

        setRecurring({
          template_name: t.name || '',
          type: t.template_type || 'SCHEDULED',
          days_in_advance:
            t.template_type === 'REMINDER'
              ? t.remind_days_before ?? 0
              : t.create_days_in_advance ?? 0,
          interval_kind: t.frequency || 'MONTHLY',
          day_of_month: t.day_of_month ? ordinal(t.day_of_month) : '1st',
          weekday: API_TO_WEEKDAY[t.weekday] || 'Monday',
          every: t.interval_count || 1,
          end_kind: END_TYPE_TO_UI[t.end_type] || 'NONE',
          end_after: t.end_after_occurrences || 12,
        });
        if (t.start_date) setStartDate(t.start_date);
        if (t.end_date) setEndDate(t.end_date);

        /* sent as deposit_to, but reads back on the shared payment_account column
           (same one PAYMENT uses) — the title rides as payment_account_title */
        setAccount(
          t.payment_account
            ? { uid: t.payment_account, title: t.payment_account_title || '' }
            : null
        );
        const rows = mapLinesToFunds(t.lines || []);
        setFunds(rows.length ? rows : [emptyFund()]);
        setTrackReturns(!!t.track_returns);
        setCashBack({
          account: t.cash_back_account
            ? { uid: t.cash_back_account, title: t.cash_back_account_title || '' }
            : null,
          memo: t.cash_back_memo || '',
          amount: t.cash_back_amount ? `${Number(t.cash_back_amount)}` : '',
        });
        setMemo(t.memo || '');
        setSavedFiles(t.files || []);
      } catch {
        toast.error('Could not load the template.');
      } finally {
        setIsPending(false);
      }
    })();
  }, [uid]);

  const intervalMeta = INTERVAL_KINDS.find((k) => k.value === recurring.interval_kind)!;
  const unit = intervalMeta.unit;
  const everyN = Number(recurring.every) || 1;
  const unitLabel = `${unit}${everyN === 1 ? '' : 's'}`;

  const scheduleSummary = useMemo(() => {
    const every = everyN === 1 ? `every ${unit}` : `every ${everyN} ${unit}s`;
    if (recurring.interval_kind === 'MONTHLY') return `On the ${recurring.day_of_month}, ${every}`;
    if (recurring.interval_kind === 'WEEKLY') return `On ${recurring.weekday}, ${every}`;
    return `Repeats ${every}`;
  }, [recurring.interval_kind, recurring.day_of_month, recurring.weekday, everyN, unit]);

  const otherFundsTotal = funds.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const cashBackAmount = Number(cashBack.amount) || 0;
  const total = otherFundsTotal - cashBackAmount;

  const updateFund = (index: number, key: string, value: any) =>
    setFunds((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  const addLine = () => setFunds((prev) => [...prev, emptyFund()]);
  const removeLine = (index: number) => setFunds((prev) => prev.filter((_, i) => i !== index));
  const clearAllLines = () => setFunds([emptyFund()]);

  const validFunds = funds.filter((f) => f.account?.uid && Number(f.amount) > 0);

  const handleSave = async () => {
    if (!recurring.template_name?.trim()) return toast.error('Please enter a template name');
    if (!account?.uid) return toast.error('Please select an account to deposit to');
    if (!validFunds.length) return toast.error('Add at least one fund line with an account and amount');
    if (cashBackAmount > 0 && !cashBack.account?.uid)
      return toast.error('Please choose where the cash back goes');
    /* a deposit can't net negative — the backend rejects this too, cash-back first */
    if (cashBackAmount > otherFundsTotal)
      return toast.error('Cash back cannot exceed the deposit total.');

    const badSchedule = scheduleError({
      type: recurring.type,
      every: recurring.every,
      endKind: recurring.end_kind,
      endAfter: recurring.end_after,
      startDate,
      endDate,
    });
    if (badSchedule) return toast.error(badSchedule);

    /* each fund row becomes one CATEGORY line. The payer is per line and is
       exactly one of customer / supplier (never both) — omit both when unset (§3) */
    const lines = validFunds.map((f, idx) => {
      const line: any = {
        line_type: 'CATEGORY',
        charter_account: f.account.uid,
        amount: `${Number(f.amount) || 0}`,
        description: f.description || '',
        is_billable: false,
        position: idx,
        payment_method: f.payment_method?.uid || undefined,
        reference_number: f.ref_no || '',
      };
      if (f.received_from?.uid && f.received_from.type === 'Customer')
        line.customer = f.received_from.uid;
      else if (f.received_from?.uid && f.received_from.type === 'Supplier')
        line.supplier = f.received_from.uid;
      return line;
    });

    const dayOfMonth =
      recurring.day_of_month === 'last' ? 31 : parseInt(recurring.day_of_month, 10) || 1;

    /* no document-level party on this type — the payer lives on each line */
    const payload: any = {
      name: recurring.template_name,
      txn_type: 'DEPOSIT',
      template_type: recurring.type,
      autopay_enabled: false,
      deposit_to: account.uid,
      /* cash-back trio is flat and always sent (even when zero) */
      cash_back_account: cashBack.account?.uid || '',
      cash_back_amount: cashBackAmount.toFixed(2),
      cash_back_memo: cashBack.memo || '',
      track_returns: trackReturns,
      memo,
      lines,
    };

    if (recurring.type === 'SCHEDULED')
      payload.create_days_in_advance = Number(recurring.days_in_advance) || 0;
    if (recurring.type === 'REMINDER')
      payload.remind_days_before = Number(recurring.days_in_advance) || 0;

    if (recurring.type !== 'UNSCHEDULED') {
      payload.frequency = recurring.interval_kind;
      payload.interval_count = everyN;
      payload.start_date = moment(startDate).format('YYYY-MM-DD');
      payload.end_type = END_TYPE_TO_API[recurring.end_kind] || 'NONE';
      if (recurring.interval_kind === 'MONTHLY') {
        payload.day_mode = 'DAY_OF_MONTH';
        payload.day_of_month = dayOfMonth;
      }
      if (recurring.interval_kind === 'WEEKLY') {
        payload.weekday = WEEKDAY_TO_API[recurring.weekday] ?? 0;
      }
      if (recurring.end_kind === 'AFTER')
        payload.end_after_occurrences = Number(recurring.end_after) || 1;
      if (recurring.end_kind === 'BY') payload.end_date = moment(endDate).format('YYYY-MM-DD');
    }

    try {
      setIsPending(true);

      /* upload any freshly-picked files first (POST /we/attachments), collect their
         uids, then merge with the already-linked ones — same flow as JournalCreate.
         Abort the save if an upload fails so we don't drop attachments silently */
      const uploadedUids: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const up = await postAttachment(formData);
        if (up?.success && up?.uid) uploadedUids.push(up.uid);
        else return;
      }
      const linkedUids = attachmentList.map((a: any) => a?.uid).filter(Boolean);
      const keptUids = savedFiles.map((f: any) => f?.uid).filter(Boolean);
      payload.file_uids = Array.from(new Set([...uploadedUids, ...linkedUids, ...keptUids]));

      const res = uid
        ? await patchRecurringTemplate(uid, payload)
        : await postRecurringTemplate(payload);
      if (res?.success) {
        toast.success(
          uid ? 'Recurring bank deposit template updated.' : 'Recurring bank deposit template saved.'
        );
        router.push('/dashboard/transactions/recurring');
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation messages={['Saving template', 'Scheduling recurrence']} start={isPending} />
          </div>
        </div>
      )}

      {/* header */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Recurring bank deposit
        </h1>
        <Chip tone="violet">Template</Chip>
        <Chip tone="neutral">{intervalMeta.label}</Chip>
        <span className="flex-1" />
        <VioletButton
          variant="primary"
          onClick={handleSave}
          disabled={isPending}
          leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
        >
          {isPending ? 'Saving…' : uid ? 'Update template' : 'Save template'}
        </VioletButton>
      </div>

      <div className="mt-[18px] flex flex-col gap-4">
        {/* Recurring deposit + account */}
        <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
          <div className="mb-4 flex items-center gap-2.5">
            <IconChip tone="violet">
              <Repeat />
            </IconChip>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-v-ink900">Recurring bank deposit</div>
              <div className="text-[11.5px] text-v-ink400">
                Name this template and choose how it runs.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={V_LABEL}>
                Template name <span className="text-v-primary">*</span>
              </label>
              <input
                value={recurring.template_name}
                onChange={(e) => set('template_name', e.target.value)}
                placeholder="e.g. Monthly cash deposit"
                className={V_FIELD}
                type="text"
              />
            </div>
            <div>
              <label className={V_LABEL}>Type</label>
              <VSelect ariaLabel="Template type" value={recurring.type} onChange={(v) => set('type', v)}>
                {TEMPLATE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </VSelect>
            </div>
            {recurring.type !== 'UNSCHEDULED' && (
              <div>
                <label className={V_LABEL}>
                  {recurring.type === 'REMINDER' ? 'Remind days before' : 'Create days in advance'}
                </label>
                <input
                  value={recurring.days_in_advance}
                  onChange={(e) => set('days_in_advance', e.target.value)}
                  min={0}
                  className={V_FIELD}
                  type="number"
                />
              </div>
            )}
          </div>

          <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
            <div>
              <label className={V_LABEL}>
                Account <span className="text-v-primary">*</span>
              </label>
              <AccountSelectDropDown
                filters={{ account_type__title: 'Bank' }}
                ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                setValue={setAccount}
                value={account}
              />
            </div>
          </div>
        </div>

        {/* Interval — only for Scheduled templates */}
        {recurring.type === 'SCHEDULED' && (
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <CalendarClock />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Interval</div>
                <div className="text-[11.5px] text-v-ink400">How often should this deposit repeat?</div>
              </div>
            </div>

            {/* interval row */}
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-v-ink500">
              <VSelect
                ariaLabel="Interval"
                className="w-[130px]"
                value={recurring.interval_kind}
                onChange={(v) => set('interval_kind', v)}
              >
                {INTERVAL_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </VSelect>

              {recurring.interval_kind === 'MONTHLY' && (
                <>
                  <span>on day</span>
                  <VSelect
                    ariaLabel="Day of month"
                    className="w-[92px]"
                    value={recurring.day_of_month}
                    onChange={(v) => set('day_of_month', v)}
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </VSelect>
                </>
              )}

              {recurring.interval_kind === 'WEEKLY' && (
                <>
                  <span>on</span>
                  <VSelect
                    ariaLabel="Weekday"
                    className="w-[130px]"
                    value={recurring.weekday}
                    onChange={(v) => set('weekday', v)}
                  >
                    {WEEKDAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </VSelect>
                </>
              )}

              <span>of every</span>
              <input
                value={recurring.every}
                onChange={(e) => set('every', e.target.value)}
                min={1}
                className={cn(V_FIELD, 'w-[68px] text-center')}
                type="number"
              />
              <span>{unitLabel}</span>
            </div>

            {/* start / end */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Start date</label>
                <DatePicker
                  onChange={setStartDate}
                  value={startDate}
                  ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                  placeholder="MM/DD/YYYY"
                />
              </div>
              <div>
                <label className={V_LABEL}>End</label>
                <VSelect ariaLabel="End" value={recurring.end_kind} onChange={setEndKind}>
                  <option value="NONE">None</option>
                  <option value="AFTER">After</option>
                  <option value="BY">By date</option>
                </VSelect>
              </div>
              {recurring.end_kind === 'AFTER' && (
                <div>
                  <label className={V_LABEL}>Occurrences</label>
                  <input
                    value={recurring.end_after}
                    onChange={(e) => set('end_after', e.target.value)}
                    min={1}
                    className={V_FIELD}
                    type="number"
                  />
                </div>
              )}
              {recurring.end_kind === 'BY' && (
                <div>
                  <label className={V_LABEL}>End date</label>
                  <DatePicker
                    onChange={setEndDate}
                    value={endDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {/* <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
          <label className={V_LABEL}>Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div> */}

        {/* Add funds to this deposit */}
        <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
          <div className="mb-4 flex items-center gap-2.5">
            <IconChip tone="violet">
              <Wallet />
            </IconChip>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-v-ink900">Add funds to this deposit</div>
              <div className="text-[11.5px] text-v-ink400">
                List each payment being deposited into the account.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {funds.map((row, index) => (
              <div key={index} className="rounded-v-input border border-v-border bg-v-wash2/50 p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] font-bold text-v-ink500">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-v-tint100 text-[11px] font-bold text-v-primary">
                      {index + 1}
                    </span>
                    Line {index + 1}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => removeLine(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
                  <div>
                    <label className={V_LABEL}>Received from</label>
                    <CustomerSupplierSelectDropdown
                      type="both"
                      placeholder="Select a supplier/customer"
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      value={row.received_from}
                      setValue={(v: any) => updateFund(index, 'received_from', v)}
                      required={false}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Account</label>
                    <AccountSelectDropDown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      value={row.account}
                      setValue={(v: any) => updateFund(index, 'account', v)}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Payment method</label>
                    <PayMethodSelectDropdown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      value={row.payment_method}
                      setValue={(v: any) => updateFund(index, 'payment_method', v)}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Description</label>
                    <input
                      value={row.description}
                      onChange={(e) => updateFund(index, 'description', e.target.value)}
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Ref no.</label>
                    <input
                      value={row.ref_no}
                      onChange={(e) => updateFund(index, 'ref_no', e.target.value)}
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Amount</label>
                    <input
                      value={row.amount}
                      onChange={(e) => updateFund(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      className={cn(V_FIELD, 'text-right tabular-nums')}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* actions + other funds total */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <VioletButton variant="outline" onClick={addLine} leftIcon={<Plus className="h-4 w-4" />}>
                Add lines
              </VioletButton>
              <VioletButton variant="ghost" onClick={clearAllLines}>
                Clear all lines
              </VioletButton>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="font-semibold text-v-ink500">Other funds total</span>
              <span className="text-[14px] font-extrabold tabular-nums text-v-ink900">
                {money(otherFundsTotal)}
              </span>
            </div>
          </div>

          {/* track returns — stored today but has no fire-time behaviour yet (§6) */}
          <div className="mt-4">
            <label className="flex w-fit cursor-pointer items-center gap-2 text-[13px] text-v-ink700">
              <input
                type="checkbox"
                checked={trackReturns}
                onChange={(e) => setTrackReturns(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded-[5px] border-v-border accent-[#7C4DFF]"
              />
              Track returns for customers
            </label>
            <p className="mt-1 text-[11px] text-v-ink400">
              Saved on the template, but doesn&apos;t affect generated deposits yet.
            </p>
          </div>

          {/* cash back */}
          <div className="mt-4 border-t border-[rgba(22,23,42,0.07)] pt-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Cash back
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Cash back goes to</label>
                <AccountSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  value={cashBack.account}
                  setValue={(v: any) => setCashBack({ ...cashBack, account: v })}
                />
              </div>
              <div>
                <label className={V_LABEL}>Cash back memo</label>
                <input
                  value={cashBack.memo}
                  onChange={(e) => setCashBack({ ...cashBack, memo: e.target.value })}
                  className={V_FIELD}
                  type="text"
                />
              </div>
              <div>
                <label className={V_LABEL}>Cash back amount</label>
                <input
                  value={cashBack.amount}
                  onChange={(e) => setCashBack({ ...cashBack, amount: e.target.value })}
                  placeholder="0.00"
                  className={cn(V_FIELD, 'text-right tabular-nums')}
                  type="number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Memo + attachments */}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Memo
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              className={cn(V_FIELD, 'resize-y')}
            />
          </div>
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              <Paperclip className="h-3.5 w-3.5" /> Attachments
            </div>
            <FileUpload onLinkedFilesChange={setAttachmentList} onFilesChange={handleFilesChange} />
            <SavedAttachments
              files={savedFiles}
              onRemove={(id) => setSavedFiles((prev) => prev.filter((f: any) => f.uid !== id))}
            />
          </div>
        </div>

        {/* footer summary + actions */}
        <div className="rounded-v-card bg-white p-5 shadow-v-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[12px] text-v-ink500">
              <Landmark className="h-4 w-4 text-v-primary" />
              {account?.uid ? `Deposit to ${account?.title}` : 'No account selected yet'}
              <span className="text-v-ink300">·</span>
              {scheduleSummary}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-v-ink900">Total</span>
                <span className="text-[20px] font-extrabold tabular-nums text-v-primary">
                  {money(total)}
                </span>
              </div>
              <div className="flex gap-2">
                <VioletButton variant="ghost" onClick={() => router.back()}>
                  Cancel
                </VioletButton>
                <VioletButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={isPending}
                  leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isPending ? 'Saving…' : uid ? 'Update template' : 'Save template'}
                </VioletButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringDeposit;
