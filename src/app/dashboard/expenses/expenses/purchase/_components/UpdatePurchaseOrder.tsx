'use client';
import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';
import dynamic from 'next/dynamic';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Store, Truck, Paperclip, Loader2, Layers } from 'lucide-react';
import PurchasePreview from './PurchasePreview';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import PurchaseTable from './PurchaseTable';
import { GetData, PatchMultipart } from '@/services/FetchMethods';
import TextAnimation from '@/app/dashboard/sales/all_sales/_components/CustomTypewritter';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import { ConvertToBackendData, convertToUsableArr } from '@/utils/ConvertExpenseData';
import {
  deleteSinglePurchaseItem,
  patchSinglePurchaseItem,
  postSinglePurchaseItem,
} from '@/app/helpers/backend';
import SupplierSelectDropDown from '@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown';
import EmailPopup from '@/app/dashboard/sales/all_sales/_components/EmailPopup';
import CurrencySelect from '@/app/dashboard/sales/all_sales/_components/CurrencySelect';
import DatePicker from '@/components/ui/DatePicker';
import LocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';
import MainLoader from '@/components/MainLoader/MainLoader';
import { cn } from '@/lib/utils';
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from '@/components/violet';
const TextEditor = dynamic(() => import('../../../../sales/all_sales/_components/TextEditor'), {
  ssr: false,
});

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

const CARRIERS = [
  { label: 'FedEx', eta: '2–3 business days' },
  { label: 'UPS', eta: '3–5 business days' },
  { label: 'DHL', eta: '1–2 business days' },
  { label: 'Courier', eta: 'Same day' },
];

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
          violet
            ? 'font-bold text-v-primary'
            : strong
              ? 'font-bold text-v-ink900'
              : 'text-v-ink500'
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

const UpdatePurchaseOrder = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState<boolean>(true);
  const [isTaxLoading, setIsTaxLoading] = useState<boolean>(true);
  const [purchaseData, setPurchaseData] = useState<any>({
    discount_kind: '',
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: '',
    sub_total: 0,
  });
  const [emails, setEmails] = useState<any>({
    email: '',
    ccEmail: '',
    bcEmail: '',
  });
  const [estimateDate, setEstimateDate] = useState<any>(todayDate);
  const [fileList, setFileList] = useState<any>([]);
  const [shipDate, setShipDate] = useState<any>(todayDate);
  const [data, setData] = useState<any>({
    mailing_address: '',
    shipping_to: '',
    ship_via: '',
    location: { label: '', uid: '' },
  });
  const [files, setFiles] = useState<File[]>([]);
  const [estimationStatus, setEstimationStatus] = useState('open');
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const view = useSearchParams().get('view');
  const [isView, setIsView] = useState<any>();
  const router = useRouter();
  const [deleteItemsUID, setDeleteItemsUID] = useState<any[]>([]);
  const { Permissions } = useAppSelector((state) => state.Permissions);

  const handleSend = async () => {
    const { PurArr, CatArr } = ConvertToBackendData(purchaseItems, CategoryItems);
    if (!PurArr.length && !CatArr.length) {
      toast.error('Add Items or Category To Create Purchase');
      return;
    }
    const emailList = {
      email: emails.email,
      cc_emails: emails?.ccEmail?.split(',').join(','),
      bcc_emails: emails?.bcEmail?.split(',').join(','),
    };

    const linkedFiles = attachmentList.map((file) => file.uid);

    const Data = {
      file_uids: JSON.stringify(linkedFiles),
      bill_date: estimateDate,
      email: JSON.stringify(emailList),
      status: estimationStatus.toUpperCase(),
      discount_kind: purchaseData.discount_kind,
      discount: Number(purchaseData.discount_amount).toFixed(3),
      shipping_fee: Number(purchaseData.shipping_fee).toFixed(3),
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      full_billing_address: data.mailing_address,
      full_shipping_address: data.shipping_to,
      shipping_by: data.ship_via,
      shipping_date: moment(shipDate).format('YYYY-MM-DD'),
      tag_title_list: JSON.stringify(tags),
      warehouse_uid: data.location.uid,
      currency_kind: selectedSupplier?.currency,
      currency_rate: currency,
    };
    if (currency < 0) return toast.error('Currency is Required');
    if (!Data?.warehouse_uid || !Data?.full_billing_address) {
      const loopArr = [
        { property: 'warehouse_uid', message: 'Please Select A Warehouse' },
        {
          property: 'full_billing_address',
          message: 'Mailing Address is Required',
        },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 1000 + 1000 * idx });
        }
      });
      return;
    }
    const formData = new FormData();
    if (linkedFiles.length) formData.append('file_uids', JSON.stringify(linkedFiles));
    formData.append('email', Data.email);
    formData.append('status', Data?.status);
    formData.append('discount_kind', Data.discount_kind);
    formData.append('discount', Data.discount);
    formData.append('shipping_fee', Data.shipping_fee);
    formData.append('total_tax', Data.total_tax);
    formData.append('total', Data.total);
    formData.append('description', Data.description);
    formData.append('tax_kind', Data.tax_kind);
    formData.append('bill_date', estimateDate);
    formData.append('full_billing_address', Data.full_billing_address);
    formData.append('full_shipping_address', Data.full_shipping_address);
    formData.append('shipping_by', Data.shipping_by);
    formData.append('shipping_date', Data.shipping_date);
    formData.append('tag_title_list', Data.tag_title_list);
    formData.append('warehouse_uid', Data.warehouse_uid);
    formData.append('currency_rate', currency);
    formData.append('currency_kind', selectedSupplier?.currency);
    if (files.length) {
      files?.map((file) => {
        formData.append('files', file);
      });
    }
    setIsPending(true);
    try {
      //Patch Bill
      const PurchasePromise = PatchMultipart(`we/purchases/${uid}`, formData);
      //Handle purchase items
      const purchasePromises = PurArr.map((arr: any) =>
        arr?.uid
          ? patchSinglePurchaseItem(uid, arr?.uid, JSON.stringify(arr))
          : postSinglePurchaseItem(uid, JSON.stringify(arr))
      );

      // Handle category items
      const categoryPromises = CatArr.map((arr: any) =>
        arr?.uid
          ? patchSinglePurchaseItem(uid, arr?.uid, JSON.stringify(arr))
          : postSinglePurchaseItem(uid, JSON.stringify(arr))
      );

      // Handle deleted items
      const deletePromises =
        deleteItemsUID?.map((itemUid) => deleteSinglePurchaseItem(uid, itemUid)) || [];

      // Wait for all API calls to complete
      const results = await Promise.allSettled([
        PurchasePromise,
        ...purchasePromises,
        ...categoryPromises,
        ...deletePromises,
      ]);
      // Check if all requests were successful
      const allSuccess = results.every((res) => res.status === 'fulfilled' && Boolean(res.value));
      if (allSuccess) {
        setIsPending(false);
        toast.success('Purchase Updated');
        router.push('/dashboard/expenses/expenses?tbl=purchase');
      } else {
        setIsPending(false);
        toast.warning('Some Items Failed to Update. Please Check.');
      }
    } catch (err: any) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!Permissions?.includes('change_purchase')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  useEffect(() => {
    const loadData = () => {
      setIsPurchaseLoading(true);
      try {
        GetData(`we/purchases/${uid}`)
          .then(async (PurchaseData) => {
            const PurchaseItems = await GetData(`we/purchases/${uid}/items`);
            const TagList = await GetData(`we/purchases/${uid}/tags`);
            const FileList = await GetData(`we/purchases/${uid}/files`);

            setFileList(FileList?.results);
            const tags = TagList?.results?.map((tag: any) => tag?.title);
            setTags(tags);
            setEstimationStatus(PurchaseData?.status);
            setShipDate(PurchaseData?.shipping_address?.shipping_date);
            const email = PurchaseData?.email;
            setEstimateDate(PurchaseData?.bill_date);
            setSelectedSupplier(PurchaseData?.supplier);
            setTermsCondition(PurchaseData?.description);
            setData({
              ...data,
              mailing_address: PurchaseData?.billing_address?.full_address,
              shipping_to: PurchaseData?.shipping_address?.full_address,
              ship_via: PurchaseData?.shipping_address?.shipping_by,
              location: PurchaseData?.warehouse,
            });
            setEmails({
              ...emails,
              email: email?.email || '',
              ccEmail: email?.cc_emails,
              bcEmail: email?.bcc_emails,
            });
            setPurchaseData({
              ...purchaseData,
              discount_kind: PurchaseData?.discount_kind,
              discount_amount: PurchaseData?.discount,
              shipping_fee: PurchaseData?.shipping_fee,
              total_tax: PurchaseData?.total_tax,
              total: PurchaseData?.total,
              tax_kind: PurchaseData?.tax_kind,
            });
            const { PurchaseArray, CategoryArray } = convertToUsableArr(
              PurchaseItems,
              PurchaseData
            );

            setCategoryItems(CategoryArray);
            setPurchaseItems(PurchaseArray);
          })
          .then(() => {
            setIsPurchaseLoading(false);
          })
          .catch((err) => {
            console.log(err);
            toast.error('An Error Occurred While Getting The Data');
          });
      } catch (err) {
        console.log(err);
        toast.error('An Error Occurred While Getting The Data');
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    if (view == 'true') {
      setIsView(true);
    } else {
      setIsView(false);
    }
  }, [view]);

  if (isPurchaseLoading) {
    return <MainLoader color="#9ca3af" />;
  }

  // derived for display only — does not affect any payload
  const supplierName = `${selectedSupplier?.first_name || ''} ${
    selectedSupplier?.last_name || ''
  }`.trim();
  const orderTotal = Number(purchaseData?.total) || 0;
  const orderTax = Number(purchaseData?.total_tax) || 0;
  const categoriesTotal = (CategoryItems || []).reduce(
    (s: number, c: any) => (c?.type === 'category' ? s + (Number(c?.amount) || 0) : s),
    0
  );
  const itemsTotal = (purchaseItems || []).reduce(
    (s: number, p: any) =>
      p?.type === 'product' ? s + (Number(p?.price) || 0) * (Number(p?.qty) || 0) : s,
    0
  );
  const orderStatus = (estimationStatus || 'OPEN').toUpperCase();
  const statusTone =
    orderStatus === 'OPEN' || orderStatus === 'ACCEPTED'
      ? 'success'
      : orderStatus === 'PENDING'
        ? 'warn'
        : orderStatus === 'REJECTED'
          ? 'danger'
          : 'neutral';
  const selectedCarrier = CARRIERS.find((c) => c.label === data?.ship_via);

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={['Updating Purchase', 'Saving Changes', 'Uploading Attachments']}
              start={isPending}
            />
          </div>
        </div>
      )}

      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Expenses', href: '/dashboard/expenses/expenses' },
          { label: 'Purchase order' },
        ]}
      />

      <div className={`${Preview ? 'hidden' : ''}`}>
        {/* header */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
            {isView ? 'Purchase order' : 'Update purchase order'}
          </h1>
          <Chip tone={statusTone as any}>{orderStatus}</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {/* Order-from + logistics */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Store />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Order from</div>
                  <div className="text-[11.5px] text-v-ink400">Supplier &amp; contact details.</div>
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

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>
                    Supplier <span className="text-v-primary">*</span>
                  </label>
                  {isView ? (
                    <input
                      value={supplierName}
                      readOnly
                      className={cn(V_FIELD, 'bg-v-wash2')}
                      type="text"
                    />
                  ) : (
                    <SupplierSelectDropDown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={setSelectedSupplier}
                      value={selectedSupplier}
                    />
                  )}
                </div>
                <div>
                  <label className={V_LABEL}>Email</label>
                  <input
                    value={emails.email}
                    onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                    placeholder="name@company.com"
                    className={V_FIELD}
                    type="email"
                    readOnly={isView}
                  />
                </div>
                <div className="md:col-span-2">
                  <EmailPopup view={isView} emails={emails} setEmails={setEmails} />
                </div>
                <div className="md:col-span-2">
                  <label className={V_LABEL}>Mailing address</label>
                  <input
                    value={data.mailing_address}
                    onChange={(e) => setData({ ...data, mailing_address: e.target.value })}
                    placeholder="Street, city, state ZIP"
                    className={V_FIELD}
                    type="text"
                    readOnly={isView}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Ship to</label>
                  <input
                    value={data.shipping_to}
                    onChange={(e) => setData({ ...data, shipping_to: e.target.value })}
                    placeholder="Delivery address"
                    className={V_FIELD}
                    type="text"
                    readOnly={isView}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Location</label>
                  <LocationSelectDropDown
                    view={isView}
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) => setData({ ...data, location: e })}
                    value={data.location}
                  />
                </div>
                <div className="md:col-span-2">
                  <CurrencySelect
                    view={isView}
                    customerCurrency={selectedSupplier?.currency}
                    setRate={setCurrency}
                    rate={currency}
                  />
                </div>
              </div>

              <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Ship via
              </div>
              <div className="flex flex-wrap gap-2">
                {CARRIERS.map((carrier) => {
                  const active = data?.ship_via === carrier.label;
                  return (
                    <button
                      key={carrier.label}
                      type="button"
                      disabled={isView}
                      onClick={() => setData({ ...data, ship_via: carrier.label })}
                      className={cn(
                        'flex-1 rounded-[11px] border px-3 py-2 text-center text-[12px] font-bold transition-colors',
                        active
                          ? 'border-v-primary bg-v-tint100 text-v-primary'
                          : 'border-v-border bg-white text-v-ink500 hover:border-v-primary/40'
                      )}
                    >
                      {carrier.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category + item details */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-1 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Layers />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Category &amp; item details
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Spread this order across expense accounts and add the items you&apos;re
                    ordering.
                  </div>
                </div>
              </div>
              <div className="mt-3 min-w-0">
                <PurchaseTable
                  deleteItems={deleteItemsUID}
                  isEdit={true}
                  setDeleteItems={setDeleteItemsUID}
                  view={isView}
                  categoryItems={CategoryItems}
                  purchaseItems={purchaseItems}
                  setPurchaseData={setPurchaseData}
                  setPurchaseItems={setPurchaseItems}
                  purchaseData={purchaseData}
                  setCategoryItems={setCategoryItems}
                  setIsTaxLoading={setIsTaxLoading}
                />
              </div>
            </div>

            {/* Memo + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Memo to supplier
                </div>
                <div className="mb-3">
                  <label className={V_LABEL}>Tags</label>
                  <TagInput view={isView} tags={tags} onChange={setTags} />
                </div>
                <div className="relative">
                  {!isPurchaseLoading && (
                    <TextEditor
                      view={isView}
                      initialContent={termsCondition}
                      setTermsCondition={setTermsCondition}
                    />
                  )}
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
                </div>
                <FileUpload
                  apiEndpoint={`we/purchases/${uid}/files`}
                  view={isView}
                  fileList={fileList}
                  setFileList={setFileList}
                  onLinkedFilesChange={setAttachmentList}
                  onFilesChange={handleFilesChange}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — summary rail */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-0">
            {/* order-total hero */}
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
                  Order total
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(orderTotal)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {selectedSupplier?.uid ? `Ordered from ${supplierName} · ` : ''}
                  {orderStatus.charAt(0) + orderStatus.slice(1).toLowerCase()}
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <Truck className="h-3.5 w-3.5" />
                  {data?.ship_via
                    ? `via ${data.ship_via}${selectedCarrier ? ` · ${selectedCarrier.eta}` : ''}`
                    : 'Choose a carrier for ETA'}
                </div>
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <TotalRow label="Categories" value={money(categoriesTotal)} />
              <TotalRow label="Items" value={money(itemsTotal)} />
              <TotalRow label="Sales tax" value={money(orderTax)} />
              <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
              <TotalRow label="Order total" value={money(orderTotal)} violet />

              {!isView && (
                <div className="mt-3 flex flex-col gap-2">
                  <VioletButton
                    variant="primary"
                    className="w-full"
                    onClick={handleSend}
                    disabled={isPending}
                    leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                  >
                    {isPending ? 'Updating…' : 'Update purchase order'}
                  </VioletButton>
                  <VioletButton
                    variant="outline"
                    className="w-full"
                    onClick={() => setPreview(true)}
                  >
                    Preview
                  </VioletButton>
                  <VioletButton variant="ghost" className="w-full" onClick={() => router.back()}>
                    Cancel
                  </VioletButton>
                </div>
              )}
            </div>

            {/* order details */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Order details
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={V_LABEL}>Purchase order date</label>
                  <DatePicker
                    view={isView}
                    value={estimateDate}
                    onChange={setEstimateDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Ship date</label>
                  <DatePicker
                    view={isView}
                    value={shipDate}
                    onChange={(date: any) => {
                      if (new Date(estimateDate).getTime() > new Date(date).getTime()) {
                        return toast.info(
                          "Ship date can't be previous date of Purchase date"
                        );
                      } else {
                        setShipDate(date);
                      }
                    }}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Status</label>
                  <select
                    value={estimationStatus?.toUpperCase() || 'OPEN'}
                    onChange={(e) => setEstimationStatus(e.target.value)}
                    className={V_FIELD}
                    disabled={isView}
                  >
                    <option value="OPEN">Open</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                {!isView && (
                  <div className="flex items-center justify-between rounded-v-input border border-v-border px-3.5 py-2.5">
                    <span className="text-[12px] font-semibold text-v-ink700">
                      Email to supplier
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSend(!isSend)}
                      aria-pressed={isSend}
                      className={cn(
                        'relative h-6 w-11 rounded-full transition-colors',
                        isSend ? 'bg-v-primary' : 'bg-v-border'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                          isSend ? 'left-[22px]' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* preview */}
      {!isView && (
        <div className={` ${Preview ? '' : 'hidden'}`}>
          <PurchasePreview
            handleSubmit={handleSend}
            isLoading={isPending}
            PurchaseData={{
              allDates: { estimateDate, shipDate },
              status: estimationStatus,
              Data: data,
              emails,
              expenseData: purchaseData,
              tags,
              files,
              attachmentList,
              selectedSupplier,
            }}
            Items={{ purchaseItems, CategoryItems }}
            setPreview={setPreview}
          />
        </div>
      )}

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>
    </div>
  );
};
export default UpdatePurchaseOrder;
