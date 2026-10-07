'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Temporal } from '@js-temporal/polyfill';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import SupplierSelectDropDown from '@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown';
import TermSelectDropDown from '@/components/ui/ScrollSelectDropDowns/TermsSelectDropDown';
import LocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import TextAnimation from '@/app/dashboard/sales/all_sales/_components/CustomTypewritter';
import BillTable from '@/app/dashboard/expenses/expenses/bill/_components/BillTable';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
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
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import {
  ArrowLeft,
  Store,
  Repeat,
  CalendarClock,
  Paperclip,
  Loader2,
  ChevronDown,
  Zap,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const TextEditor = dynamic(
  () => import('@/app/dashboard/sales/all_sales/_components/TextEditor'),
  { ssr: false }
);

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

/* compact violet <select> with a chevron, used inline in the schedule row */
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

function ReadyCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className={cn(
          'flex h-[18px] w-[18px] items-center justify-center rounded-full transition-colors duration-300',
          ok ? 'bg-v-success-solid text-white' : 'bg-v-wash2 text-v-ink300'
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
      </span>
      <span
        className={cn(
          'text-[12.5px] transition-colors',
          ok ? 'font-semibold text-v-ink900' : 'text-v-ink400'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  strong,
  violet,
}: {
  label: string;
  value: string;
  strong?: boolean;
  violet?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span
        className={cn(
          'text-[13px]',
          violet ? 'font-bold text-v-primary' : strong ? 'font-bold text-v-ink900' : 'text-v-ink500'
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          violet
            ? 'text-[14px] font-extrabold text-v-primary'
            : strong
              ? 'text-[14px] font-extrabold text-v-ink900'
              : 'text-[13px] font-semibold text-v-ink900'
        )}
      >
        {value}
      </span>
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

const mapLinesToRows = (lines: any[]) => {
  const cat: any[] = [];
  const prod: any[] = [];
  (lines || []).forEach((l: any) => {
    if (l.line_type === 'CATEGORY') {
      cat.push({
        type: 'category',
        category: l.charter_account_title || '',
        category_uid: l.charter_account || '',
        description: l.description || '',
        amount: Number(l.amount) || 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: '', uid: l.tax || '' },
        productTaxRate: 0,
        productTaxType: 'NO_TAX',
        /* the tax the template was saved with — replayed on save so an edit
           can't silently wipe it while the "Amount are" select stays hidden */
        template_tax_uid: l.tax || '',
        isPopupOpen: false,
      });
    } else if (l.line_type === 'ITEM') {
      prod.push({
        type: 'product',
        product_uid: l.product || '',
        mainPrice: Number(l.rate) || 0,
        productService: l.product_title || '',
        description: l.description || '',
        qty: Number(l.quantity) || 1,
        price: Number(l.rate) || 0,
        amount: Number(l.amount) || 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: '', uid: l.tax || '' },
        productTaxRate: 0,
        productTaxType: 'NO_TAX',
        template_tax_uid: l.tax || '',
        productCode: 0,
        isPopupOpen: false,
      });
    }
  });
  return { cat, prod };
};

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};
const DAY_OPTIONS = [...Array.from({ length: 31 }, (_, i) => ordinal(i + 1)), 'last'];

const RecurringBill = ({ uid }: { uid?: string }) => {
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

  /* vendor / bill-from state */
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const [data, setData] = useState<any>({
    mailing_address: '',
    permit_no: '',
    terms: { title: '', uid: '' },
    location: { title: '', uid: '' },
  });
  /* set when an older template hydrates without terms/store — those now 400 on PATCH */
  const [needsRelations, setNeedsRelations] = useState(false);

  /* line-item state (re-uses the existing BillTable engine) */
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [purchaseData, setPurchaseData] = useState<any>({
    discount_kind: 'PERCENTAGE',
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: 'NO_TAX',
    deposit: 0,
    due_total: 0,
    sub_total: 0,
  });

  /* extras */
  const [tags, setTags] = useState<string[]>([]);
  const [memo, setMemo] = useState<any>();
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [showAutopay, setShowAutopay] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) div.innerHTML = memo;
  }, [memo]);

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

        setSelectedSupplier(
          t.supplier
            ? { uid: t.supplier, first_name: t.supplier_name || '', middle_name: '', last_name: '' }
            : undefined
        );
        setMemo(t.memo || '');

        /* relations come back as bare uids with a sibling *_title — no extra lookups */
        setData({
          mailing_address: t.mailing_address || '',
          permit_no: t.permit_number || '',
          terms: { uid: t.terms || '', title: t.terms_title || '' },
          location: { uid: t.warehouse || '', title: t.warehouse_title || '' },
        });
        setNeedsRelations(!t.terms || !t.warehouse);

        setSavedFiles(t.files || []);
        const { cat, prod } = mapLinesToRows(t.lines || []);
        setCategoryItems(cat);
        setPurchaseItems(prod);
      } catch {
        toast.error('Could not load the template.');
      } finally {
        setIsPending(false);
      }
    })();
  }, [uid]);

  const handleFilesChange = (newFiles: File[]) => setFiles(newFiles);

  const set = (key: string, value: any) => setRecurring((p: any) => ({ ...p, [key]: value }));

  /* both pickers default to today — move the end date past the start when "By date"
     is picked, otherwise the save 400s on an end date that isn't after the start */
  const setEndKind = (v: string) => {
    set('end_kind', v);
    if (v === 'BY') setEndDate(nextEndDate(startDate, endDate));
  };

  const intervalMeta = INTERVAL_KINDS.find((k) => k.value === recurring.interval_kind)!;
  const unit = intervalMeta.unit;
  const everyN = Number(recurring.every) || 1;
  const unitLabel = `${unit}${everyN === 1 ? '' : 's'}`;

  /* human-readable schedule line for the summary rail */
  const scheduleSummary = useMemo(() => {
    const every = everyN === 1 ? `every ${unit}` : `every ${everyN} ${unit}s`;
    if (recurring.interval_kind === 'MONTHLY') return `On the ${recurring.day_of_month}, ${every}`;
    if (recurring.interval_kind === 'WEEKLY') return `On ${recurring.weekday}, ${every}`;
    return `Repeats ${every}`;
  }, [recurring.interval_kind, recurring.day_of_month, recurring.weekday, everyN, unit]);

  const supplierName =
    `${selectedSupplier?.first_name || ''} ${selectedSupplier?.last_name || ''}`.trim();
  const billTotal = Number(purchaseData?.total) || 0;
  const billSubtotal = Number(purchaseData?.sub_total) || 0;
  const billTax = Number(purchaseData?.total_tax) || 0;

  const hasLine =
    purchaseItems.some((i: any) => i?.type === 'product' && i?.product_uid) ||
    CategoryItems.some((i: any) => i?.type === 'category' && i?.category_uid);

  const OnSupplierSelect = (supplier: any) => {
    const addr = supplier?.address;
    const mailing =
      !addr?.province && !addr?.city && !addr?.street
        ? ''
        : [addr?.street, addr?.city, addr?.province].filter(Boolean).join(' ');
    setData((p: any) => ({ ...p, mailing_address: mailing }));
  };

  const handleSave = async () => {
    if (!recurring.template_name?.trim()) return toast.error('Please enter a template name');
    if (!selectedSupplier?.uid) return toast.error('Please select a vendor first');
    if (!data?.terms?.uid) return toast.error('Please select terms');
    if (!data?.location?.uid) return toast.error('Please select a store');
    if (!hasLine) return toast.error('Add a category or item line to the template');

    const badSchedule = scheduleError({
      type: recurring.type,
      every: recurring.every,
      endKind: recurring.end_kind,
      endAfter: recurring.end_after,
      startDate,
      endDate,
    });
    if (badSchedule) return toast.error(badSchedule);

    /* while the "Amount are" select is hidden tax_kind is pinned to NO_TAX, so fall
       back to whatever tax the template already had rather than dropping it */
    const lineTax = (row: any) =>
      (purchaseData?.tax_kind !== 'NO_TAX' ? row?.productTaxInfo?.uid : row?.template_tax_uid) ||
      undefined;

    const lines = [
      ...CategoryItems.filter((i: any) => i?.type === 'category' && i?.category_uid).map(
        (i: any, idx: number) => ({
          line_type: 'CATEGORY',
          charter_account: i.category_uid,
          amount: `${Number(i.amount) || 0}`,
          description: i.description || '',
          is_billable: false,
          tax: lineTax(i),
          position: idx,
        })
      ),
      ...purchaseItems
        .filter((i: any) => i?.type === 'product' && i?.product_uid)
        .map((i: any) => ({
          line_type: 'ITEM',
          product: i.product_uid,
          quantity: `${Number(i.qty) || 0}`,
          rate: `${Number(i.price) || 0}`,
          amount: `${Number(i.amount) || 0}`,
          description: i.description || '',
          is_billable: false,
          tax: lineTax(i),
        })),
    ];

    const dayOfMonth =
      recurring.day_of_month === 'last' ? 31 : parseInt(recurring.day_of_month, 10) || 1;

    const payload: any = {
      name: recurring.template_name,
      txn_type: 'BILL',
      template_type: recurring.type,
      mailing_address: data.mailing_address,
      permit_number: data.permit_no || undefined,
      memo,
      autopay_enabled: false,
      supplier: selectedSupplier.uid,
      terms: data.terms.uid,
      warehouse: data.location.uid,
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

      /* upload freshly-picked files first (POST /we/attachments), then merge their
         uids with the already-linked and previously-saved ones — send as file_uids.
         Abort on a failed upload so attachments aren't dropped silently */
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
        toast.success(uid ? 'Recurring bill template updated.' : 'Recurring bill template saved.');
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
          Recurring bill
        </h1>
        <Chip tone="violet">Template</Chip>
        <Chip tone="neutral">{intervalMeta.label}</Chip>
      </div>

      {/* two-column body */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — work column */}
        <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
          {/* Recurring template */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <Repeat />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Recurring bill</div>
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
                  placeholder="e.g. Monthly office rent"
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
          </div>

          {/* Vendor / bill from */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <Store />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Vendor</div>
                <div className="text-[11.5px] text-v-ink400">
                  Who is this bill from? Address auto-fills.
                </div>
              </div>
              <span className="flex-1" />
              {selectedSupplier?.uid && (
                <span className="flex animate-v-pop items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                    {(selectedSupplier?.first_name?.[0] || '?').toUpperCase()}
                  </span>
                  <span className="text-[12px] font-semibold text-v-ink900">{supplierName}</span>
                </span>
              )}
            </div>

            {needsRelations && (!data.terms?.uid || !data.location?.uid) && (
              <div className="mb-4 flex items-start gap-2.5 rounded-v-input border border-v-chip-border bg-v-warn-bg p-3">
                <AlertTriangle className="mt-px h-4 w-4 shrink-0 text-v-warn-fg" />
                <div className="text-[12px] leading-relaxed text-v-warn-deep">
                  This template needs <span className="font-semibold">Terms</span> and a{' '}
                  <span className="font-semibold">Store</span> before it can be saved. Pick both
                  below to continue.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>
                  Vendor <span className="text-v-primary">*</span>
                </label>
                <SupplierSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={setSelectedSupplier}
                  value={selectedSupplier}
                  OnSelect={OnSupplierSelect}
                />
              </div>
              <div>
                <label className={V_LABEL}>Permit no.</label>
                <input
                  value={data.permit_no}
                  onChange={(e) => setData({ ...data, permit_no: e.target.value })}
                  className={V_FIELD}
                  type="text"
                />
              </div>
              <div className="md:col-span-2">
                <label className={V_LABEL}>Mailing address</label>
                <textarea
                  value={data.mailing_address}
                  onChange={(e) => setData({ ...data, mailing_address: e.target.value })}
                  placeholder="Street, city, state ZIP"
                  rows={3}
                  className={cn(V_FIELD, 'resize-y')}
                />
              </div>
              <div>
                <label className={V_LABEL}>
                  Terms <span className="text-v-primary">*</span>
                </label>
                <TermSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={(e: any) => setData({ ...data, terms: e })}
                  value={data.terms}
                />
              </div>
              <div>
                <label className={V_LABEL}>
                  Store <span className="text-v-primary">*</span>
                </label>
                <LocationSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={(e: any) => setData({ ...data, location: e })}
                  value={data.location}
                />
              </div>
            </div>
          </div>

          {/* Schedule / interval — only shown for Scheduled templates */}
          {recurring.type === 'SCHEDULED' && (
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <CalendarClock />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Interval</div>
                <div className="text-[11.5px] text-v-ink400">How often should this bill repeat?</div>
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
]
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

          {/* Autopay */}
          {showAutopay && (
            <div className="relative overflow-hidden rounded-v-card border border-v-border bg-v-wash p-[22px]">
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setShowAutopay(false)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-white hover:text-v-primary"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-3">
                <IconChip tone="teal">
                  <Zap />
                </IconChip>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-v-ink900">Autopay</span>
                    <Chip tone="rose">NEW</Chip>
                  </div>
                  <div className="mt-1 text-[12px] text-v-ink500">
                    Automate your spend. Set up automatic bill payments using Bill Pay.
                  </div>
                  <div className="mt-3">
                    <VioletButton variant="outline" onClick={() => toast.info('Bill Pay is coming soon.')}>
                      Get Bill Pay
                    </VioletButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <label className={V_LABEL}>Tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Category & item details */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-1 text-[13.5px] font-bold text-v-ink900">Category &amp; item details</div>
            <div className="mb-3 text-[11.5px] text-v-ink400">
              Split the bill across expense accounts and add any items received.
            </div>
            <BillTable
              categoryItems={CategoryItems}
              purchaseItems={purchaseItems}
              setPurchaseData={setPurchaseData}
              setPurchaseItems={setPurchaseItems}
              purchaseData={purchaseData}
              setCategoryItems={setCategoryItems}
            />
          </div>

          {/* Memo + attachments */}
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Memo &amp; notes
              </div>
              <div className="relative">
                <TextEditor setTermsCondition={setMemo} />
              </div>
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
        </div>

        {/* RIGHT — summary rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          {/* hero */}
          <div
            className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroViolet }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] animate-v-float rounded-full"
              style={{ background: V.orb.violet }}
            />
            <div className="relative">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                Amount per bill
              </div>
              <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                {money(billTotal)}
              </div>
              <div className="mt-1 text-[11.5px] text-white/60">
                {scheduleSummary} · starts {moment(startDate).format('DD MMM, YYYY')}
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                <Store className="h-3.5 w-3.5" />
                {selectedSupplier?.uid ? `Payable to ${supplierName}` : 'No vendor selected yet'}
              </div>
            </div>
          </div>

          {/* totals + actions */}
          <div className="rounded-v-card bg-white p-5 shadow-v-card">
            <TotalRow label="Subtotal" value={money(billSubtotal)} />
            <TotalRow label="Sales tax" value={money(billTax)} />
            <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
            <TotalRow label="Total" value={money(billTotal)} violet />

            <div className="mt-4 flex flex-col gap-2 border-t border-[rgba(22,23,42,0.07)] pt-4">
              <VioletButton
                variant="primary"
                className="w-full"
                onClick={handleSave}
                disabled={isPending}
                leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isPending ? 'Saving…' : uid ? 'Update template' : 'Save template'}
              </VioletButton>
              <VioletButton variant="ghost" className="w-full" onClick={() => router.back()}>
                Cancel
              </VioletButton>
            </div>
          </div>

          {/* ready to save */}
          <div className="rounded-v-card bg-white p-5 shadow-v-card">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Ready to save?
            </div>
            <ReadyCheck ok={!!recurring.template_name?.trim()} label="Template named" />
            <ReadyCheck ok={!!selectedSupplier?.uid} label="Vendor selected" />
            <ReadyCheck ok={!!data.terms?.uid} label="Terms selected" />
            <ReadyCheck ok={!!data.location?.uid} label="Store selected" />
            <ReadyCheck ok={hasLine} label="At least one line added" />
            <ReadyCheck ok={!!startDate} label="Start date set" />
          </div>
        </div>
      </div>

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>
    </div>
  );
};

export default RecurringBill;
