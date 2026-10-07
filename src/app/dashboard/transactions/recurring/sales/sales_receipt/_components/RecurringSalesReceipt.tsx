'use client';
import { useEffect, useMemo, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import CustomerSelectDropDown from '@/components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import LocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import PayMethodSelectDropdown from '@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import EmailPopup from '@/app/dashboard/sales/all_sales/_components/EmailPopup';
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
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import {
  ArrowLeft,
  User,
  Repeat,
  CalendarClock,
  ListPlus,
  Paperclip,
  Loader2,
  ChevronDown,
  CheckCircle2,
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

const formatFullAddress = (addr: any) => {
  if (!addr) return '';
  return [addr.street, addr.city, addr.province, addr.postal_code].filter(Boolean).join(', ');
};

/* a sales receipt is ITEM-only — a stray CATEGORY line is dropped (the backend
   rejects them too). Mirrors the estimate/payment mapper */
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

const RecurringSalesReceipt = ({ uid }: { uid?: string }) => {
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

  /* customer / receipt state */
  const [selectedCustomer, setSelectedCustomer] = useState<any>({ first_name: '' });
  const [emails, setEmails] = useState<any>({ email: '', ccEmail: '', bcEmail: '' });
  const [options, setOptions] = useState({ auto_send: false, print_later: false });
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [depositTo, setDepositTo] = useState<any>(null);
  const [data, setData] = useState<any>({
    billing_address: '',
    shipping_from: '',
    reference_no: '',
    location: { title: '', uid: '' },
  });

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
  const [messageOnReceipt, setMessageOnReceipt] = useState('');
  const [messageOnStatement, setMessageOnStatement] = useState('');
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

  /* prefill "Shipping from" with the company address once it loads. Create-only —
     on edit the stored value wins, even if blank */
  const cAddr = Company?.company_addresses;
  const companyAddr = [cAddr?.address, cAddr?.city, cAddr?.state, cAddr?.zip_code]
    .filter(Boolean)
    .join(' ');
  useEffect(() => {
    if (!uid && companyAddr && !data.shipping_from) {
      setData((p: any) => ({ ...p, shipping_from: companyAddr }));
    }
  }, [companyAddr]);

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

        setSelectedCustomer(
          t.customer
            ? { uid: t.customer, first_name: t.customer_name || '', middle_name: '', last_name: '' }
            : { first_name: '' }
        );
        /* email reads back nested, symmetric with what we send */
        setEmails({
          email: t.email?.customer_email || '',
          ccEmail: t.email?.cc_emails || '',
          bcEmail: t.email?.bcc_emails || '',
        });
        setOptions({ auto_send: !!t.auto_email, print_later: !!t.print_later });
        setPaymentMethod(
          t.payment_method ? { uid: t.payment_method, title: t.payment_method_title || '' } : null
        );
        /* sent as deposit_to but reads back on the shared payment_account column */
        setDepositTo(
          t.payment_account || t.deposit_to
            ? {
                uid: t.payment_account || t.deposit_to,
                title: t.payment_account_title || t.deposit_to_title || '',
              }
            : null
        );
        /* relations come back as bare uids with a sibling *_title — no extra lookups */
        setData({
          billing_address: t.mailing_address || '',
          shipping_from: t.shipping_from || '',
          reference_no: t.reference_number || '',
          location: { uid: t.warehouse || '', title: t.warehouse_title || '' },
        });
        setMessageOnReceipt(t.message_on_receipt || t.memo || '');
        setMessageOnStatement(t.statement_memo || '');
        if (t.tax_kind) setInvoiceData((p: any) => ({ ...p, tax_kind: t.tax_kind }));
        if (t.tax) setInvoiceData((p: any) => ({ ...p, sales_tax: { uid: t.tax } }));

        setSavedFiles(t.files || []);
        const items = mapLinesToInvoiceItems(t.lines || []);
        if (items.length) setInvoiceItems(items);
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

  const customerName =
    `${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim();
  const receiptTotal = Number(invoiceData?.total) || 0;
  const hasLine = invoiceItems.some((i: any) => i?.type === 'product' && i?.product_service?.uid);

  const OnCustomerSelect = (customer: any) => {
    setEmails((p: any) => ({ ...p, email: customer?.email || '' }));
    setData((p: any) => ({ ...p, billing_address: formatFullAddress(customer?.address) }));
  };

  const handleSave = async () => {
    if (!recurring.template_name?.trim()) return toast.error('Please enter a template name');
    if (!selectedCustomer?.uid) return toast.error('Please select a customer first');
    if (!paymentMethod?.uid) return toast.error('Please Select Payment Method');
    if (!depositTo?.uid) return toast.error('Please Select Deposit To Account');
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

    /* one page-level tax rate, stamped onto every line whose is_tax flag is on */
    const salesTaxUid = invoiceData?.sales_tax?.uid || undefined;

    /* ITEM lines only — a sales receipt takes no category lines */
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
      txn_type: 'SALES_RECEIPT',
      template_type: recurring.type,
      autopay_enabled: false,
      customer: selectedCustomer.uid,
      mailing_address: data.billing_address,
      warehouse: data?.location?.uid || '',
      payment_method: paymentMethod.uid,
      deposit_to: depositTo.uid,
      reference_number: data.reference_no || '',
      tax_kind: invoiceData.tax_kind,
      tax: salesTaxUid,
      /* memo and message_on_receipt carry the same text (per §7) */
      memo: messageOnReceipt,
      message_on_receipt: messageOnReceipt,
      statement_memo: messageOnStatement,
      auto_email: options.auto_send,
      print_later: options.print_later,
      /* stored template metadata — dropped at fire time, no live counterpart */
      shipping_from: data.shipping_from || '',
      /* email stays a nested object on this type (unlike the PO's flat string) */
      email: {
        customer_email: emails.email || '',
        cc_emails: emails.ccEmail || '',
        bcc_emails: emails.bcEmail || '',
      },
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
        toast.success(
          uid ? 'Recurring sales receipt template updated.' : 'Recurring sales receipt template saved.'
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
          Recurring sales receipt
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
                <div className="text-[13.5px] font-bold text-v-ink900">Recurring sales receipt</div>
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
                  placeholder="e.g. Monthly membership"
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

          {/* Customer */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <User />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Customer</div>
                <div className="text-[11.5px] text-v-ink400">Who is this receipt for?</div>
              </div>
              <span className="flex-1" />
              {selectedCustomer?.uid && (
                <span className="flex animate-v-pop items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                    {(selectedCustomer?.first_name?.[0] || '?').toUpperCase()}
                  </span>
                  <span className="text-[12px] font-semibold text-v-ink900">{customerName}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>
                  Customer <span className="text-v-primary">*</span>
                </label>
                <CustomerSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={setSelectedCustomer}
                  value={selectedCustomer}
                  OnCustomerSelect={OnCustomerSelect}
                />
              </div>
              <div>
                <label className={V_LABEL}>Email</label>
                <input
                  value={emails.email}
                  onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                  placeholder="Separate emails with a comma"
                  className={V_FIELD}
                  type="email"
                />
                <div className="mt-1">
                  <EmailPopup emails={emails} setEmails={setEmails} />
                </div>
              </div>
              <div>
                <label className={V_LABEL}>Options</label>
                <label className="flex cursor-pointer items-center gap-2 py-1 text-[13px] text-v-ink700">
                  <input
                    type="checkbox"
                    checked={options.auto_send}
                    onChange={(e) => setOptions({ ...options, auto_send: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded-[5px] border-v-border accent-[#7C4DFF]"
                  />
                  Automatically send emails
                </label>
                <label className="flex cursor-pointer items-center gap-2 py-1 text-[13px] text-v-ink700">
                  <input
                    type="checkbox"
                    checked={options.print_later}
                    onChange={(e) => setOptions({ ...options, print_later: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded-[5px] border-v-border accent-[#7C4DFF]"
                  />
                  Print later
                </label>
              </div>

              <div className="md:col-span-2">
                <label className={V_LABEL}>Billing address</label>
                <textarea
                  value={data.billing_address}
                  onChange={(e) => setData({ ...data, billing_address: e.target.value })}
                  placeholder="Street, city, state ZIP"
                  rows={3}
                  className={cn(V_FIELD, 'resize-y')}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={V_LABEL}>Store</label>
                  <LocationSelectDropDown
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) => setData({ ...data, location: e })}
                    value={data.location}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Shipping from</label>
                  <input
                    value={data.shipping_from}
                    onChange={(e) => setData({ ...data, shipping_from: e.target.value })}
                    className={V_FIELD}
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Payment
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>
                  Payment method <span className="text-v-primary">*</span>
                </label>
                <PayMethodSelectDropdown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={setPaymentMethod}
                  value={paymentMethod}
                />
              </div>
              <div>
                <label className={V_LABEL}>Reference no.</label>
                <input
                  value={data.reference_no}
                  onChange={(e) => setData({ ...data, reference_no: e.target.value })}
                  className={V_FIELD}
                  type="text"
                />
              </div>
              <div>
                <label className={V_LABEL}>
                  Deposit to <span className="text-v-primary">*</span>
                </label>
                <AccountSelectDropDown
                  filters={{ account_type__title: 'Bank' }}
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={setDepositTo}
                  value={depositTo}
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
                  <div className="text-[11.5px] text-v-ink400">How often should this receipt repeat?</div>
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
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <label className={V_LABEL}>Tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Line items */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <ListPlus />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Product or service</div>
                <div className="text-[11.5px] text-v-ink400">
                  Add the products and services sold each cycle.
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <InvoiceTable
                setIsCalculation={setIsCalculationOpen}
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                setInvoiceData={setInvoiceData}
                invoiceData={invoiceData}
                showSummary={false}
                isDepositShow={false}
              />
            </div>
          </div>

          {/* Messages + attachments */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="grid gap-4 md:grid-cols-2 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Message displayed on sales receipt</label>
                <textarea
                  value={messageOnReceipt}
                  onChange={(e) => setMessageOnReceipt(e.target.value)}
                  rows={3}
                  className={cn(V_FIELD, 'resize-y')}
                />
              </div>
              <div>
                <label className={V_LABEL}>Message displayed on statement</label>
                <textarea
                  value={messageOnStatement}
                  onChange={(e) => setMessageOnStatement(e.target.value)}
                  rows={3}
                  className={cn(V_FIELD, 'resize-y')}
                />
              </div>
            </div>
            <div className="mt-4">
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
                Amount per receipt
              </div>
              <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                {money(receiptTotal)}
              </div>
              <div className="mt-1 text-[11.5px] text-white/60">
                {scheduleSummary} · starts {moment(startDate).format('DD MMM, YYYY')}
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                <User className="h-3.5 w-3.5" />
                {selectedCustomer?.uid ? `Billed to ${customerName}` : 'No customer selected yet'}
              </div>
            </div>
          </div>

          {/* totals + actions */}
          <div className="rounded-v-card bg-white p-5 shadow-v-card">
            <InvoiceSummary
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              invoiceItems={invoiceItems}
              setIsCalculation={setIsCalculationOpen}
              isDepositShow={false}
            />

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
            <ReadyCheck ok={!!selectedCustomer?.uid} label="Customer selected" />
            <ReadyCheck ok={!!paymentMethod?.uid} label="Payment method selected" />
            <ReadyCheck ok={!!depositTo?.uid} label="Deposit account selected" />
            <ReadyCheck ok={hasLine} label="At least one priced line" />
            <ReadyCheck ok={!!startDate} label="Start date set" />
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

export default RecurringSalesReceipt;
