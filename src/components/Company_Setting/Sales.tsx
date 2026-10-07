'use client';
import React, { useState, useEffect } from 'react';
import { Pencil, ReceiptText } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GetData, Patch } from '@/services/FetchMethods';
import GetToken from '@/hooks/getToken';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/app/redux/store';
import { setSalesSettingsData } from '@/app/redux/SalesData/SalesData';
import MainLoader from '../MainLoader/MainLoader';
import { cn } from '@/lib/utils';
import { Chip, Toggle, VioletButton, VioletSelect } from '@/components/violet';

interface SalesInfo {
  preferred_delivery_method: any;
  is_shipping: any;
  is_customer_transaction_number: any;
  is_service_date: any;
  is_discount: any;
  is_deposit: any;
  is_tag: any;
  invoice_payment: any;
  is_product_and_service: any;
  is_sku: any;
  is_quantity_and_price: any;
  is_available_stock: any;
  is_reminder: any;
  is_show_transactions_as_single_line: any;
  is_include_transaction_details: any;
  prefered_term: any;
  prefered_payment_method: any;
}

const EMPTY: SalesInfo = {
  preferred_delivery_method: '',
  is_shipping: '',
  is_customer_transaction_number: '',
  is_service_date: '',
  is_discount: '',
  is_deposit: '',
  is_tag: '',
  invoice_payment: '',
  is_product_and_service: '',
  is_sku: '',
  is_quantity_and_price: '',
  is_available_stock: '',
  is_reminder: '',
  is_show_transactions_as_single_line: '',
  is_include_transaction_details: '',
  prefered_term: '',
  prefered_payment_method: '',
};

/** Enum values rendered for humans: PRINT_LATER → "Print later". */
const pretty = (raw: any): string => {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  const words = v.split('_').join(' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const DELIVERY_OPTIONS = [
  { value: 'PRINT_LATER', label: 'Print later' },
  { value: 'SEND_LATER', label: 'Send later' },
];

/** Sections in the sticky jump nav, grouped as in the design. */
const NAV = [
  {
    group: 'Sales forms',
    items: [
      { id: 'sec-sfc', label: 'Sales form content' },
      { id: 'sec-cust', label: 'Customize' },
    ],
  },
  {
    group: 'Payments & products',
    items: [
      { id: 'sec-pay', label: 'Invoice payments' },
      { id: 'sec-prod', label: 'Products & services' },
    ],
  },
  {
    group: 'Communication',
    items: [
      { id: 'sec-rem', label: 'Reminders' },
      { id: 'sec-stmt', label: 'Statements' },
    ],
  },
];

const Sales = () => {
  const [editSection, setEditSection] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const token = GetToken();
  const { data, isPending, refetch } = useQuery({
    queryKey: ['sales_settings'],
    queryFn: async () => {
      const response = await GetData(`we/sales/settings`, token);
      dispatch(setSalesSettingsData(response));
      return response;
    },
  });

  const [salesInfo, setSalesInfo] = useState<SalesInfo>(EMPTY);
  /** Edits live here until Save, so Cancel discards them. */
  const [draft, setDraft] = useState<SalesInfo>(EMPTY);

  useEffect(() => {
    if (data) {
      const next: SalesInfo = {
        preferred_delivery_method: data?.preferred_delivery_method,
        is_shipping: data?.is_shipping,
        is_customer_transaction_number: data?.is_customer_transaction_number,
        is_service_date: data?.is_service_date,
        is_discount: data?.is_discount,
        is_deposit: data?.is_deposit,
        is_tag: data?.is_tag,
        invoice_payment: data?.invoice_payment,
        is_product_and_service: data?.is_product_and_service,
        is_sku: data?.is_sku,
        is_quantity_and_price: data?.is_quantity_and_price,
        is_available_stock: data?.is_available_stock,
        is_reminder: data?.is_reminder,
        is_show_transactions_as_single_line: data?.is_show_transactions_as_single_line,
        is_include_transaction_details: data?.is_include_transaction_details,
        prefered_term: data?.prefered_term,
        prefered_payment_method: data?.prefered_payment_method,
      };
      setSalesInfo(next);
      setDraft(next);
    }
  }, [data]);

  /* Escape closes the open band. Opening one always re-seeds the draft, so
     abandoned edits never leak into the next section. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditSection(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeSection = () => {
    setDraft(salesInfo);
    setEditSection(null);
  };

  const handleEditClick = (section: string) => {
    if (section === editSection) return closeSection();
    setDraft(salesInfo);
    setEditSection(section);
  };

  const setField = (key: keyof SalesInfo, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate: updateSales, isPending: isUpdating } = useMutation({
    mutationKey: ['update_sales_settings'],
    mutationFn: async (data: any) => Patch(`we/sales/settings`, data, token),
    onSuccess: () => {
      toast.success('Sales settings updated!');
      setSalesInfo(draft);
      refetch();
      setEditSection(null);
    },
    onError: () => {
      toast.error('An error occurred while updating sales settings.');
    },
  });

  const handleSave = () => {
    updateSales(draft);
  };

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <ReceiptText className="h-6 w-6" />
          </div>
          <div className="min-w-[220px] flex-1">
            <h2 className="m-0 text-[24px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
              Sales
            </h2>
            <p className="mt-1.5 max-w-[440px] text-[13px] leading-[1.5] text-v-ink500">
              Everything customers see — sales forms, invoice payments, reminders, and statements.
            </p>
          </div>
          <Chip tone="success" dot className="self-start">
            Customer-facing
          </Chip>
        </div>
      </section>

      <div className="flex items-start gap-5">
        {/* ── Sticky jump nav ──────────────────────────────────────────── */}
        <aside className="sticky top-0 hidden w-[178px] shrink-0 flex-col gap-px rounded-v-card bg-white p-2.5 shadow-v-card lg:flex">
          {NAV.map((section) => (
            <React.Fragment key={section.group}>
              <div className="px-2.5 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-v-ink400 first:pt-1">
                {section.group}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpTo(item.id)}
                  className="rounded-[9px] px-2.5 py-1.5 text-left text-[12.5px] font-semibold text-v-ink700 transition-colors hover:bg-v-wash2 hover:text-v-primary"
                >
                  {item.label}
                </button>
              ))}
            </React.Fragment>
          ))}
        </aside>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <GroupCard title="Sales forms" sub="What appears on every invoice, estimate, and receipt.">
            <Band
              id="sec-sfc"
              label="Sales form content"
              isEditing={editSection === 'salesContent'}
              onEditClick={() => handleEditClick('salesContent')}
            >
              {editSection === 'salesContent' ? (
                <div className="animate-v-rise">
                  <SelectRow first label="Preferred term">
                    <VioletSelect
                      value={draft.prefered_term ?? ''}
                      onChange={(e) => setField('prefered_term', e.target.value)}
                    >
                      <option value="">Select a term</option>
                      {DELIVERY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </VioletSelect>
                  </SelectRow>
                  <SelectRow label="Preferred delivery method">
                    <VioletSelect
                      value={draft.preferred_delivery_method ?? ''}
                      onChange={(e) => setField('preferred_delivery_method', e.target.value)}
                    >
                      <option value="">Select a method</option>
                      {DELIVERY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </VioletSelect>
                  </SelectRow>
                  <ToggleRow
                    label="Shipping"
                    checked={!!draft.is_shipping}
                    onChange={(v) => setField('is_shipping', v)}
                  />
                  <SubHead note="Extra columns and fields shown on sales forms.">Custom fields</SubHead>
                  <ToggleRow
                    first
                    label="Custom transaction numbers"
                    checked={!!draft.is_customer_transaction_number}
                    onChange={(v) => setField('is_customer_transaction_number', v)}
                  />
                  <ToggleRow
                    label="Service date"
                    checked={!!draft.is_service_date}
                    onChange={(v) => setField('is_service_date', v)}
                  />
                  <ToggleRow
                    label="Discount"
                    checked={!!draft.is_discount}
                    onChange={(v) => setField('is_discount', v)}
                  />
                  <ToggleRow
                    label="Deposit"
                    checked={!!draft.is_deposit}
                    onChange={(v) => setField('is_deposit', v)}
                  />
                  <ToggleRow
                    label="Tags"
                    checked={!!draft.is_tag}
                    onChange={(v) => setField('is_tag', v)}
                  />
                  {actions}
                </div>
              ) : (
                <div>
                  <ValueRow
                    first
                    label="Preferred term"
                    value={pretty(salesInfo.prefered_term)}
                  />
                  <ValueRow
                    label="Preferred delivery method"
                    value={pretty(salesInfo.preferred_delivery_method)}
                  />
                  <BoolRow label="Shipping" on={!!salesInfo.is_shipping} />
                  <SubHead>Custom fields</SubHead>
                  <BoolRow
                    first
                    label="Custom transaction numbers"
                    on={!!salesInfo.is_customer_transaction_number}
                  />
                  <BoolRow label="Service date" on={!!salesInfo.is_service_date} />
                  <BoolRow label="Discount" on={!!salesInfo.is_discount} />
                  <BoolRow label="Deposit" on={!!salesInfo.is_deposit} />
                  <BoolRow label="Tags" on={!!salesInfo.is_tag} />
                </div>
              )}
            </Band>

            <Band
              id="sec-cust"
              label="Customize"
              isEditing={editSection === 'customize'}
              onEditClick={() => handleEditClick('customize')}
            >
              <p className="text-[13.5px] text-v-ink500">
                Choose which lines and fees appear on your sales forms.
              </p>
              <div className="mt-3">
                <VioletButton
                  variant="outline"
                  size="sm"
                  disabled={editSection !== 'customize'}
                >
                  Customize line and fee
                </VioletButton>
              </div>
              {editSection === 'customize' && actions}
            </Band>
          </GroupCard>

          <GroupCard
            title="Payments & products"
            sub="How customers pay, and what you sell them."
          >
            <Band
              id="sec-pay"
              label="Invoice payments"
              isEditing={editSection === 'invoicePayments'}
              onEditClick={() => handleEditClick('invoicePayments')}
            >
              {editSection === 'invoicePayments' ? (
                <div className="animate-v-rise">
                  <SelectRow first label="Invoice payment basis">
                    <VioletSelect
                      value={draft.invoice_payment ?? ''}
                      onChange={(e) => setField('invoice_payment', e.target.value)}
                    >
                      <option value="ACCRUAL">Accrual</option>
                      <option value="CASH">Cash</option>
                    </VioletSelect>
                  </SelectRow>
                  <SelectRow label="Preferred payment method">
                    <VioletSelect
                      value={draft.prefered_payment_method ?? ''}
                      onChange={(e) => setField('prefered_payment_method', e.target.value)}
                    >
                      <option value="">Select a method</option>
                      {DELIVERY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
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
                    label="Invoice payment basis"
                    value={pretty(salesInfo.invoice_payment)}
                  />
                  <ValueRow
                    label="Preferred payment method"
                    value={pretty(salesInfo.prefered_payment_method)}
                  />
                </div>
              )}
            </Band>

            <Band
              id="sec-prod"
              label="Products and services"
              isEditing={editSection === 'productService'}
              onEditClick={() => handleEditClick('productService')}
            >
              {editSection === 'productService' ? (
                <div className="animate-v-rise">
                  <ToggleRow
                    first
                    label="Show Product/Service column on sales forms"
                    checked={!!draft.is_product_and_service}
                    onChange={(v) => setField('is_product_and_service', v)}
                  />
                  <ToggleRow
                    indent
                    label="Show SKU column"
                    checked={!!draft.is_sku}
                    onChange={(v) => setField('is_sku', v)}
                  />
                  <ToggleRow
                    label="Track quantity and price/rate"
                    checked={!!draft.is_quantity_and_price}
                    onChange={(v) => setField('is_quantity_and_price', v)}
                  />
                  <ToggleRow
                    label="Track inventory quantity on hand"
                    checked={!!draft.is_available_stock}
                    onChange={(v) => setField('is_available_stock', v)}
                  />
                  {actions}
                </div>
              ) : (
                <div>
                  <BoolRow
                    first
                    label="Show Product/Service column on sales forms"
                    on={!!salesInfo.is_product_and_service}
                  />
                  <BoolRow indent label="Show SKU column" on={!!salesInfo.is_sku} />
                  <BoolRow
                    label="Track quantity and price/rate"
                    on={!!salesInfo.is_quantity_and_price}
                  />
                  <BoolRow
                    label="Track inventory quantity on hand"
                    on={!!salesInfo.is_available_stock}
                  />
                </div>
              )}
            </Band>
          </GroupCard>

          <GroupCard
            title="Communication & statements"
            sub="Reminder emails, and how statements read."
          >
            <Band
              id="sec-rem"
              label="Reminders"
              isEditing={editSection === 'reminders'}
              onEditClick={() => handleEditClick('reminders')}
            >
              <p className="text-[13.5px] text-v-ink500">Set up invoice reminder emails.</p>
              {editSection === 'reminders' ? (
                <div className="mt-2 animate-v-rise">
                  <ToggleRow
                    first
                    label="Automatic invoice reminders"
                    checked={!!draft.is_reminder}
                    onChange={(v) => setField('is_reminder', v)}
                  />
                  {actions}
                </div>
              ) : (
                <div className="mt-2">
                  <BoolRow first label="Automatic invoice reminders" on={!!salesInfo.is_reminder} />
                </div>
              )}
            </Band>

            <Band
              id="sec-stmt"
              label="Statements"
              isEditing={editSection === 'statements'}
              onEditClick={() => handleEditClick('statements')}
            >
              {editSection === 'statements' ? (
                <div className="animate-v-rise">
                  <ToggleRow
                    first
                    label="List each transaction as a single line"
                    checked={!!draft.is_show_transactions_as_single_line}
                    onChange={(v) => setField('is_show_transactions_as_single_line', v)}
                  />
                  <ToggleRow
                    label="Include transaction details"
                    checked={!!draft.is_include_transaction_details}
                    onChange={(v) => setField('is_include_transaction_details', v)}
                  />
                  {actions}
                </div>
              ) : (
                <div>
                  <BoolRow
                    first
                    label="List each transaction as a single line"
                    on={!!salesInfo.is_show_transactions_as_single_line}
                  />
                  <BoolRow
                    label="Include transaction details"
                    on={!!salesInfo.is_include_transaction_details}
                  />
                </div>
              )}
            </Band>
          </GroupCard>
        </div>
      </div>
    </div>
  );
};

/* ── Presentational primitives ───────────────────────────────────────── */

const GroupCard = ({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) => (
  <section className="animate-v-rise rounded-v-card bg-white shadow-v-card">
    <div className="px-6 pb-2 pt-5">
      <h3 className="m-0 text-[16px] font-bold tracking-[-0.01em] text-v-ink900">{title}</h3>
      <p className="mt-0.5 text-[12px] text-v-ink400">{sub}</p>
    </div>
    {children}
  </section>
);

interface BandProps {
  id: string;
  label: string;
  isEditing: boolean;
  onEditClick: () => void;
  children: React.ReactNode;
}

/** One settings band: fixed label column · content · Edit. */
const Band = ({ id, label, isEditing, onEditClick, children }: BandProps) => (
  <div
    id={id}
    className={cn(
      'scroll-mt-3 border-t border-v-border px-6 py-5 transition-colors last:rounded-b-v-card',
      isEditing && 'bg-v-tint50'
    )}
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
      <div className="shrink-0 text-[13.5px] font-bold text-v-ink900 sm:w-[124px]">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
      {!isEditing && (
        <button
          type="button"
          onClick={onEditClick}
          aria-label={`Edit ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-v-ink400 transition-colors hover:bg-v-wash2 hover:text-v-primary"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);

/** Uppercase divider heading inside a band. */
const SubHead = ({ children, note }: { children: React.ReactNode; note?: string }) => (
  <div className="mt-1 border-t border-v-border/60 pb-1 pt-3.5">
    <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-v-ink500">{children}</div>
    {note && <p className="mt-1 text-[12px] text-v-ink400">{note}</p>}
  </div>
);

const rowBase = (first?: boolean) =>
  cn('grid items-center gap-4 py-2.5', !first && 'border-t border-v-border/60');

const rowLabel = (indent?: boolean) => cn('text-[13.5px] text-v-ink500', indent && 'pl-5');

/** Read-only row with a free-text value. */
const ValueRow = ({
  label,
  value,
  first,
  indent,
}: {
  label: string;
  value: string;
  first?: boolean;
  indent?: boolean;
}) => (
  <div className={cn(rowBase(first), 'grid-cols-[minmax(0,1fr)_auto]')}>
    <span className={rowLabel(indent)}>{label}</span>
    <span className={cn('text-[13.5px] font-semibold', value ? 'text-v-ink900' : 'text-v-ink400')}>
      {value || 'Not set'}
    </span>
  </div>
);

/** Read-only row rendering a boolean as On/Off. */
const BoolRow = ({
  label,
  on,
  first,
  indent,
}: {
  label: string;
  on: boolean;
  first?: boolean;
  indent?: boolean;
}) => (
  <div className={cn(rowBase(first), 'grid-cols-[minmax(0,1fr)_auto]')}>
    <span className={rowLabel(indent)}>{label}</span>
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
  indent,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  first?: boolean;
  indent?: boolean;
}) => (
  <div className={cn(rowBase(first), 'grid-cols-[minmax(0,1fr)_auto] py-3')}>
    <span
      className={cn('text-[13.5px] font-medium text-v-ink900', indent && 'pl-5')}
    >
      {label}
    </span>
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
      rowBase(first),
      'grid-cols-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(150px,220px)]'
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
  <div className="mt-5 flex items-center justify-end gap-3">
    <VioletButton variant="outline" size="sm" onClick={onCancel}>
      Cancel
    </VioletButton>
    <VioletButton variant="primary" size="sm" onClick={onSave} disabled={loading}>
      {loading ? 'Saving…' : 'Save'}
    </VioletButton>
  </div>
);

export default Sales;
