'use client';
import { useEffect, useMemo, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import CustomerSelectDropDown from '@/components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import TermSelectDropDown from '@/components/ui/ScrollSelectDropDowns/TermsSelectDropDown';
import LocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import TextAnimation from '@/app/dashboard/sales/all_sales/_components/CustomTypewritter';
import InvoiceTable from '@/app/dashboard/sales/all_sales/_components/InvoiceTable';
import InvoiceSummary from '@/app/dashboard/sales/all_sales/_components/InvoiceSummary';
import TaxCalculation from '@/app/dashboard/sales/all_sales/invoice/_components/TaxCalculation';
import Modal from '@/app/(admin)/_components/Modal';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import { useAppSelector } from '@/app/redux/store';
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
import { Chip, IconChip, Toggle, VioletButton } from '@/components/violet';
import {
  ArrowLeft,
  Repeat,
  RefreshCw,
  Store,
  Paperclip,
  Loader2,
  ChevronDown,
  AlertTriangle,
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

/* one row inside the "Template options" block */
function OptionRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-v-ink700">{label}</span>
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
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

const mapLinesToInvoiceItems = (lines: any[]) =>
  (lines || [])
    .filter((l: any) => l.line_type === 'ITEM')
    .map((l: any, idx: number) => {
      const product = {
        uid: l.product || '',
        title: l.product_title || '',
        sale_price: Number(l.rate) || 0,
      };
      return {
        id: `line-${idx}`,
        type: 'product',
        product_service: product,
        product,
        description: l.description || '',
        qty: Number(l.quantity) || 1,
        price: Number(l.rate) || 0,
        amount: Number(l.amount) || 0,
        is_tax: !!l.tax,
      };
    });

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};
const DAY_OPTIONS = [...Array.from({ length: 31 }, (_, i) => ordinal(i + 1)), 'last'];

const formatFullAddress = (addr: any) => {
  if (!addr) return '';
  return [addr.street, addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ');
};

const RecurringEstimate = ({ uid }: { uid?: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);

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
  /* a duration, not a date — each occurrence expires this many days after its own
     date, so a frozen absolute expiry would be meaningless on a long-running template */
  const [expiryDays, setExpiryDays] = useState<any>('');

  /* template options (estimates: auto-send + print later) */
  const [options, setOptions] = useState({ auto_send: false, print_later: false });

  /* customer state */
  const [selectedCustomer, setSelectedCustomer] = useState<any>({ first_name: '' });
  const [data, setData] = useState<any>({
    billing_address: '',
    terms: { title: '', uid: '' },
    location: { title: '', uid: '' },
  });
  /* set when an older template hydrates without a store — those now 400 on PATCH */
  const [needsStore, setNeedsStore] = useState(false);

  /* line-item state (re-uses the existing invoice engine) */
  const [invoiceItems, setInvoiceItems] = useState<any[]>([
    { type: 'product', product_service: '', description: '', qty: 1, price: 0, amount: 0, is_tax: false },
  ]);
  const [invoiceData, setInvoiceData] = useState<any>({
    discount_kind: 'PERCENTAGE',
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: 'EXCLUSIVE',
    deposit: 0,
    due_total: 0,
    sub_total: '',
  });
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);

  /* extras */
  const [tags, setTags] = useState<string[]>([]);
  const [noteToCustomer, setNoteToCustomer] = useState('Thank you for your business.');
  const [internalNote, setInternalNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);

  const handleFilesChange = (newFiles: File[]) => setFiles(newFiles);
  const set = (key: string, value: any) => setRecurring((p: any) => ({ ...p, [key]: value }));

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

        setOptions({ auto_send: !!t.auto_email, print_later: !!t.print_later });
        setSelectedCustomer(
          t.customer
            ? { uid: t.customer, first_name: t.customer_name || '', middle_name: '', last_name: '' }
            : { first_name: '' }
        );
        /* relations come back as bare uids with a sibling *_title */
        setData((p: any) => ({
          ...p,
          billing_address: t.mailing_address || '',
          terms: { uid: t.terms || '', title: t.terms_title || '' },
          location: { uid: t.warehouse || '', title: t.warehouse_title || '' },
        }));
        setNeedsStore(!t.warehouse);
        setExpiryDays(t.expiry_days ?? '');
        setNoteToCustomer(t.message_on_estimate || t.memo || '');

        setSavedFiles(t.files || []);
        const items = mapLinesToInvoiceItems(t.lines || []);
        if (items.length) setInvoiceItems(items);
        const firstTax = (t.lines || []).find((l: any) => l.line_type === 'ITEM' && l.tax)?.tax;
        if (firstTax) setInvoiceData((p: any) => ({ ...p, sales_tax: { uid: firstTax } }));
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

  /* "Repeats on 1st day of every 1 month." summary line */
  const repeatsText = useMemo(() => {
    const tail = `every ${everyN} ${unitLabel}`;
    if (recurring.interval_kind === 'MONTHLY')
      return `Repeats on ${recurring.day_of_month} day of ${tail}`;
    if (recurring.interval_kind === 'WEEKLY') return `Repeats on ${recurring.weekday} of ${tail}`;
    return `Repeats ${tail}`;
  }, [recurring.interval_kind, recurring.day_of_month, recurring.weekday, everyN, unitLabel]);

  const hasLine = invoiceItems.some((i: any) => i?.type === 'product' && i?.product_service?.uid);

  /* each occurrence expires N days after its own date — show that against the first one */
  const expiryPreview = useMemo(() => {
    const days = Number(expiryDays);
    if (!expiryDays || !Number.isFinite(days) || days <= 0) return '';
    return `The first estimate would expire ${moment(startDate)
      .add(days, 'days')
      .format('DD MMM, YYYY')}.`;
  }, [expiryDays, startDate]);

  /* company header (falls back gracefully when company data is not loaded) */
  const cAddr = Company?.company_addresses;
  const compLine1 = cAddr?.address;
  const compLine2 = [cAddr?.city, cAddr?.state, cAddr?.zip_code].filter(Boolean).join(' ');
  const compLogo =
    Company?.logo?.original || (typeof Company?.logo === 'string' ? Company?.logo : '');

  const OnCustomerSelect = (customer: any) => {
    setData((p: any) => ({ ...p, billing_address: formatFullAddress(customer?.address) }));
  };

  const handleSave = async () => {
    if (!recurring.template_name?.trim()) return toast.error('Please enter a template name');
    if (!selectedCustomer?.uid) return toast.error('Please select a customer first');
    if (!data?.location?.uid) return toast.error('Please select a store');
    if (!hasLine) return toast.error('Add at least one product line to the template');

    const badSchedule = scheduleError({
      type: recurring.type,
      every: recurring.every,
      endKind: recurring.end_kind,
      endAfter: recurring.end_after,
      startDate,
      endDate,
    });
    if (badSchedule) return toast.error(badSchedule);

    const salesTaxUid = invoiceData?.sales_tax?.uid || undefined;
    const lines = invoiceItems
      .filter((i: any) => i?.type === 'product' && i?.product_service?.uid)
      .map((i: any) => ({
        line_type: 'ITEM',
        product: i.product_service.uid,
        quantity: `${Number(i.qty) || 0}`,
        rate: `${Number(i.price) || 0}`,
        amount: `${Number(i.amount) || 0}`,
        description: i.description || '',
        is_billable: false,
        tax: i.is_tax ? salesTaxUid : undefined,
      }));

    const dayOfMonth =
      recurring.day_of_month === 'last' ? 31 : parseInt(recurring.day_of_month, 10) || 1;

    const payload: any = {
      name: recurring.template_name,
      txn_type: 'ESTIMATE',
      template_type: recurring.type,
      mailing_address: data.billing_address,
      memo: noteToCustomer,
      message_on_estimate: noteToCustomer,
      auto_email: options.auto_send,
      print_later: options.print_later,
      autopay_enabled: false,
      customer: selectedCustomer.uid,
      terms: data?.terms?.uid || undefined,
      warehouse: data.location.uid,
      lines,
    };

    /* a duration in days. null (not omitted) when blank, so clearing the field on an
       edit actually reverts the template to open-ended instead of keeping the old value */
    const days = Number(expiryDays);
    payload.expiry_days = expiryDays !== '' && Number.isFinite(days) && days > 0 ? days : null;

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
        toast.success(
          uid ? 'Recurring estimate template updated.' : 'Recurring estimate template saved.'
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
          Recurring estimate
        </h1>
        <Chip tone="violet">Template</Chip>
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

      {/* body: estimate document (left) + recurring settings (right) */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT — estimate document */}
        <div className="min-w-0 overflow-hidden rounded-v-card bg-white shadow-v-card">
          {/* document header band */}
          <div
            className="p-[26px]"
            style={{ backgroundImage: 'linear-gradient(135deg, #F3F0FF, #EAF1FF)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[24px] font-extrabold tracking-[-0.02em] text-v-primary">
                  RECURRING ESTIMATE
                </div>
                <div className="mt-3 text-[13px] font-bold text-v-ink900">
                  {Company?.name || 'Your company'}
                </div>
                {Company?.email && <div className="text-[12px] text-v-ink500">{Company.email}</div>}
                {compLine1 && <div className="text-[12px] text-v-ink500">{compLine1}</div>}
                {compLine2 && <div className="text-[12px] text-v-ink500">{compLine2}</div>}
                {Company?.phone && <div className="text-[12px] text-v-ink500">{Company.phone}</div>}
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/admin/company_settings')}
                  className="mt-1.5 text-[12px] font-semibold text-v-primary hover:underline"
                >
                  Edit company
                </button>
              </div>
              {compLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={compLogo}
                  alt="Company logo"
                  className="h-[74px] w-[74px] rounded-[14px] border border-white/70 object-cover"
                />
              ) : (
                <div className="flex h-[74px] w-[74px] items-center justify-center rounded-[14px] border border-white/70 bg-white/60 text-v-ink400">
                  <Store className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* customer + terms + expiration */}
            <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_170px_170px]">
              <div className="min-w-0">
                <label className={V_LABEL}>
                  Customer <span className="text-v-primary">*</span>
                </label>
                <CustomerSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary bg-white"
                  setValue={setSelectedCustomer}
                  value={selectedCustomer}
                  OnCustomerSelect={OnCustomerSelect}
                />
                {data.billing_address && (
                  <div className="mt-2 whitespace-pre-line text-[12px] text-v-ink500">
                    {data.billing_address}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <label className={V_LABEL}>Terms</label>
                <TermSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary bg-white"
                  setValue={(e: any) => setData({ ...data, terms: e })}
                  value={data.terms}
                />
              </div>
              <div className="min-w-0">
                <label className={V_LABEL}>Valid for (days)</label>
                <input
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  min={1}
                  placeholder="e.g. 30"
                  className={cn(V_FIELD, 'bg-white')}
                  type="number"
                />
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-v-ink500">
                  {expiryPreview || 'Leave blank to keep every estimate open-ended.'}
                </p>
              </div>
            </div>
          </div>

          {/* document body */}
          <div className="flex flex-col gap-6 p-[26px]">
            {needsStore && !data.location?.uid && (
              <div className="flex items-start gap-2.5 rounded-v-input border border-v-chip-border bg-v-warn-bg p-3">
                <AlertTriangle className="mt-px h-4 w-4 shrink-0 text-v-warn-fg" />
                <div className="text-[12px] leading-relaxed text-v-warn-deep">
                  This template needs a <span className="font-semibold">Store</span> before it can be
                  saved. Pick one below to continue.
                </div>
              </div>
            )}

            {/* tags + store */}
            <div className="grid gap-4 md:grid-cols-2 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Tags</label>
                <TagInput tags={tags} onChange={setTags} />
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

            {/* product or service */}
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-v-ink900">Product or service</div>
              <InvoiceTable
                setIsCalculation={setIsCalculationOpen}
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                setInvoiceData={setInvoiceData}
                invoiceData={invoiceData}
                showSummary={false}
              />
            </div>

            {/* notes (left) + totals (right) */}
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] [&>div]:min-w-0">
              <div className="flex flex-col gap-4">
                <div>
                  <label className={V_LABEL}>Message on estimate</label>
                  <textarea
                    value={noteToCustomer}
                    onChange={(e) => setNoteToCustomer(e.target.value)}
                    rows={3}
                    className={cn(V_FIELD, 'resize-y')}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Internal customer notes (hidden)</label>
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add notes about this customer. This is only visible to you."
                    rows={3}
                    className={cn(V_FIELD, 'resize-y')}
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-v-ink700">
                    <Paperclip className="h-3.5 w-3.5" /> Attachments
                  </div>
                  <FileUpload onLinkedFilesChange={setAttachmentList} onFilesChange={handleFilesChange} />
                  <SavedAttachments
                    files={savedFiles}
                    onRemove={(id) => setSavedFiles((prev) => prev.filter((f: any) => f.uid !== id))}
                  />
                </div>
              </div>

              {/* totals */}
              <div className="rounded-v-input border border-v-border bg-v-wash2 p-4">
                <InvoiceSummary
                  invoiceData={invoiceData}
                  setInvoiceData={setInvoiceData}
                  invoiceItems={invoiceItems}
                  setIsCalculation={setIsCalculationOpen}
                  isDepositShow={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — recurring settings */}
        <div className="rounded-v-card bg-white p-[22px] shadow-v-card lg:sticky lg:top-0">
          <div className="mb-4 flex items-center gap-2.5">
            <IconChip tone="violet">
              <Repeat />
            </IconChip>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-v-ink900">Recurring settings</div>
              <div className="text-[11.5px] text-v-ink400">How this template runs.</div>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div>
              <label className={V_LABEL}>
                Template name <span className="text-v-primary">*</span>
              </label>
              <input
                value={recurring.template_name}
                onChange={(e) => set('template_name', e.target.value)}
                placeholder="e.g. Monthly quote"
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
                  {recurring.type === 'REMINDER'
                    ? 'Remind number of days in advance'
                    : 'Create number of days in advance'}
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

          {/* template options */}
          <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
            Template options
          </div>
          <OptionRow
            label="Automatically send emails"
            checked={options.auto_send}
            onChange={(v) => setOptions((p) => ({ ...p, auto_send: v }))}
          />
          {options.auto_send && (
            <p className="-mt-0.5 mb-1 text-[11.5px] leading-relaxed text-v-warn-deep">
              Every occurrence is emailed to the customer&apos;s primary email address without
              further review.
            </p>
          )}
          <OptionRow
            label="Mark as print later"
            checked={options.print_later}
            onChange={(v) => setOptions((p) => ({ ...p, print_later: v }))}
          />

          {/* interval — only for Scheduled templates */}
          {recurring.type === 'SCHEDULED' && (
            <>
              <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Interval
              </div>

              <div className="flex items-center gap-2 rounded-v-input bg-v-tint100 px-3 py-2.5 text-[12.5px] text-v-primary">
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span>{repeatsText}.</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 [&>div]:min-w-0">
                <div className="col-span-2">
                  <label className={V_LABEL}>Repeats</label>
                  <VSelect
                    ariaLabel="Interval"
                    value={recurring.interval_kind}
                    onChange={(v) => set('interval_kind', v)}
                  >
                    {INTERVAL_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </VSelect>
                </div>

                {recurring.interval_kind === 'MONTHLY' && (
                  <div>
                    <label className={V_LABEL}>On day</label>
                    <VSelect
                      ariaLabel="Day of month"
                      value={recurring.day_of_month}
                      onChange={(v) => set('day_of_month', v)}
                    >
                      {DAY_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </VSelect>
                  </div>
                )}
                {recurring.interval_kind === 'WEEKLY' && (
                  <div>
                    <label className={V_LABEL}>On</label>
                    <VSelect
                      ariaLabel="Weekday"
                      value={recurring.weekday}
                      onChange={(v) => set('weekday', v)}
                    >
                      {WEEKDAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </VSelect>
                  </div>
                )}
                <div>
                  <label className={V_LABEL}>Every ({unitLabel})</label>
                  <input
                    value={recurring.every}
                    onChange={(e) => set('every', e.target.value)}
                    min={1}
                    className={cn(V_FIELD, 'text-center')}
                    type="number"
                  />
                </div>

                <div className="col-span-2">
                  <label className={V_LABEL}>Start date</label>
                  <DatePicker
                    onChange={setStartDate}
                    value={startDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="MM/DD/YYYY"
                  />
                </div>
                <div className="col-span-2">
                  <label className={V_LABEL}>End</label>
                  <VSelect ariaLabel="End" value={recurring.end_kind} onChange={setEndKind}>
                    <option value="NONE">None</option>
                    <option value="AFTER">After</option>
                    <option value="BY">By date</option>
                  </VSelect>
                </div>
                {recurring.end_kind === 'AFTER' && (
                  <div className="col-span-2">
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
                  <div className="col-span-2">
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
            </>
          )}

          <div className="mt-5 flex flex-col gap-2 border-t border-[rgba(22,23,42,0.07)] pt-4">
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
      </div>

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>

      <Modal
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        title="Tax Calculations"
        widthClass="w-full lg:w-[620px]"
      >
        <TaxCalculation invoiceData={invoiceData} invoiceItems={invoiceItems} />
      </Modal>
    </div>
  );
};

export default RecurringEstimate;
