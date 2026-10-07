'use client';
import { useEffect, useState } from 'react';
import Label from '@/components/ui/RawLabel';
import { IoIosArrowBack } from 'react-icons/io';
import Button from '@/components/ui/RawButton';
import { Temporal } from '@js-temporal/polyfill';
import dynamic from 'next/dynamic';
import moment from 'moment';
import SupplierSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/SupplierSelectDropDown';
import CurrencySelect from '@/app/dashboard/sales/all_sales/_components/CurrencySelect';
import DatePicker from '@/components/ui/DatePicker';
import EmailPopup from '@/app/dashboard/sales/all_sales/_components/EmailPopup';
import LocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import { MdKeyboardArrowDown } from 'react-icons/md';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import { useMutation } from '@tanstack/react-query';
import { GetData, PostMultipart } from '@/services/FetchMethods';
import { useRouter, useSearchParams } from 'next/navigation';
import TextAnimation from '@/app/dashboard/sales/all_sales/_components/CustomTypewritter';
import BillTable from './BillTable';
import SupplierPurchaseList from '../../_components/SupplierPurchaseList';
import BillPreview from './BillPreview';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import { convertToUsableArr } from '@/utils/ConvertExpenseData';
import TermSelectDropDown from '@/components/ui/ScrollSelectDropDowns/TermsSelectDropDown';
import { decryptData } from '@/app/helpers/crypto';
import { generateBillNumber } from '@/utils/GenerateNumber';
import CustomSecureRoutes from '@/components/PrivateRoute/CustomSecureRoutes';
import { toast } from '@/lib/ToastService';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { patchPurchase, postPurchases } from '@/app/helpers/backend';
import { cn } from '@/lib/utils';
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import { ArrowLeft, Store, Paperclip, Loader2 } from 'lucide-react';
const TextEditor = dynamic(() => import('../../../../sales/all_sales/_components/TextEditor'), {
  ssr: false,
});

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

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

const Bill = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [modalTitle, setModalTitle] = useState('');
  const [modalSMType, setModalSMType] = useState('');
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
  const [emails, setEmails] = useState<any>({
    email: '',
    ccEmail: '',
    bcEmail: '',
  });
  const [billDate, setBillDate] = useState<any>(todayDate);
  const [dueDate, setDueDate] = useState<any>(todayDate);
  const [isPending, setIsPending] = useState<any>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [data, setData] = useState<any>({
    mailing_address: '',
    shipping_to: '',
    ship_via: '',
    location: { label: '', uid: '' },
    terms: { label: '', uid: '' },
    bill_no: '',
    charter_account: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isSend, setIsSend] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any>([]);
  const c = useSearchParams().get('c');
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const router = useRouter();
  const [purchaseUID, setPurchaseUID] = useState('');

  useEffect(() => {
    if (c) {
      const res = decryptData(c);
      if (res?.uid) {
        setSelectedSupplier(res);
        OnSupplierSelect(res);
      }
    }
  }, [c]);

  const handleConvertData = () => {
    const PurArr: any = [];
    let note = '';
    let section = '';
    purchaseItems.map((data: any) => {
      if (data.type === 'product' && data?.product_uid) {
        PurArr.push({
          product_uid: data.product_uid,
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(2),
          // tax_uid: data.productTaxInfo.uid,
          purchase_price: data?.price,
          note: note ? note : '',
          section: section ? section : '',
          description: data.description,
        });

        note = '';
        section = '';
      } else if (data.type === 'note') {
        note = data.description;
      } else if (data.type === 'section') {
        section = data.description;
      }
    });
    const CatArr: any = [];
    let note1 = '';
    let section1 = '';
    CategoryItems.map((data: any) => {
      if (data.type === 'category' && data.category_uid) {
        CatArr.push({
          charter_account_uid: data.category_uid,
          total: data?.amount,
          // tax_uid: data.productTaxInfo.uid,
          note: note1 ? note1 : '',
          section: section1 ? section1 : '',
          description: data.description,
        });

        note1 = '';
        section1 = '';
      } else if (data.type === 'note') {
        note1 = data.description;
      } else if (data.type === 'section') {
        section1 = data.description;
      }
    });

    return { CatArr, PurArr };
  };

  useEffect(() => {
    if (data?.terms?.days) {
      const date = moment(
        new Date(new Date(billDate).setDate(new Date(billDate).getDate() + data?.terms?.days || 0))
      ).format('YYYY-MM-DD');
      setDueDate(date);
    }
  }, [data?.terms, new Date(billDate)]);

  // const {
  //   mutate: PostPurchase,
  //   isPending,
  //   error,
  //   isError,
  // } = useMutation({
  //   mutationFn: async (data: any) => {
  //     const res = await PostMultipart(`we/purchases`, data);
  //     return res;
  //   },
  //   onSuccess: (res) => {

  //   },
  //   onError: (res: any) => {

  //   },
  // });

  const handleSend = async () => {
    const { PurArr, CatArr } = handleConvertData();
    if (!data?.charter_account?.uid && purchaseData?.deposit > 0) {
      return toast.error('Please select a deposit account');
    }
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
      charter_account_uid: data?.charter_account?.uid,
      bill_date: billDate,
      due_date: moment(dueDate).format('YYYY-MM-DD'),
      email: emailList,
      status: 'OPEN',
      discount_kind: purchaseData.discount_kind,
      discount: Number(purchaseData.discount_amount).toFixed(3),
      shipping_fee: Number(purchaseData.shipping_fee).toFixed(3),
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      term_uid: data?.terms?.uid,
      is_bill: true,
      supplier_uid: selectedSupplier?.uid,
      full_billing_address: data.mailing_address,
      tracking_number: data.bill_no,
      tag_title_list: tags,
      purchase_items: JSON.stringify(PurArr),
      custom_expense_items: JSON.stringify(CatArr),
      files: files,
      warehouse_uid: data.location.uid,
      deposit: Number(purchaseData?.deposit).toFixed(3),
      due_total: Number(purchaseData?.due_total).toFixed(3),
    };
    if (currency < 0) return toast.error('Currency is Required');
    if (!Data?.warehouse_uid || !Data?.term_uid) {
      const loopArr = [
        { property: 'warehouse_uid', message: 'Please Select A Warehouse' },
        { property: 'term_uid', message: 'Please Select A Term' },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 2000 + 1000 * idx });
        }
      });
      return;
    }

    const formData = new FormData();
    if (linkedFiles.length) formData.append('file_uids', JSON.stringify(linkedFiles));
    formData.append('bill_date', Data.bill_date);
    formData.append('email', JSON.stringify(Data.email));
    formData.append('status', Data?.status);
    // formData.append("tracking_number", Data.tracking_number);
    formData.append('discount_kind', Data.discount_kind);
    formData.append('discount', Data.discount);
    formData.append('shipping_fee', Data.shipping_fee);
    formData.append('total_tax', Data.total_tax);
    formData.append('total', Data.total);
    formData.append('description', Data.description);
    formData.append('tax_kind', Data.tax_kind);
    // formData.append("bill_date", billDate);
    formData.append('due_date', Data.due_date);
    formData.append('is_bill', 'true');
    formData.append('supplier_uid', Data.supplier_uid);
    formData.append('full_billing_address', Data.full_billing_address);
    // formData.append("full_shipping_address", Data.full_shipping_address);
    // formData.append("shipping_by", Data.shipping_by);
    formData.append('tracking_number', Data.tracking_number);
    formData.append('tag_title_list', JSON.stringify(Data.tag_title_list));
    formData.append('purchase_items', Data.purchase_items);
    formData.append('custom_expense_items', Data.custom_expense_items);
    formData.append('warehouse_uid', Data.warehouse_uid);
    formData.append('term_uid', Data.term_uid);
    formData.append('deposit', Data.deposit);
    formData.append('due_total', Data.due_total);
    formData.append('currency_rate', currency);
    formData.append('currency_kind', selectedSupplier?.currency);
    Data?.charter_account_uid && formData.append('charter_account_uid', Data.charter_account_uid);
    if (files.length) {
      files.map((file) => {
        formData.append('files', file);
      });
    }
    try {
      setIsPending(true);
      const res = await postPurchases(formData);
      if (res?.success) {
        const res2 = await patchPurchase(purchaseUID, { status: 'CLOSED' });
        toast.success('Bill Created.');
        router.push('/dashboard/expenses/expenses?tbl=bill');
      }
    } catch (err: any) {
      //  toast.error("Something went wrong!");
    } finally {
      setIsPending(false);
    }
  };

  const OnSupplierSelect = (supplier: any) => {
    const number = generateBillNumber(supplier?.first_name || '');
    setEmails({ ...emails, email: supplier?.email || '' });
    setData({
      ...data,
      mailing_address:
        !supplier?.address?.province && !supplier?.address?.city && !supplier?.address?.street
          ? ''
          : supplier?.address?.street ||
            '' + ' ' + supplier?.address?.city ||
            '' + ' ' + supplier?.address?.province ||
            '',
      bill_no: number,
    });

    setModalSMType('purchaseList');
    setModalTitle('Add to Bill');
    setIsOpen(true);
  };

  const handleAddClick = async (uid: string) => {
    setIsPurchaseLoading(true);
    setIsOpen(false);
    try {
      const PurchaseData = await GetData(`we/purchases/${uid}`);
      const PurchaseItems = await GetData(`we/purchases/${uid}/items`);
      const TagList = await GetData(`we/purchases/${uid}/tags`);
      const FileList = await GetData(`we/purchases/${uid}/files`);
      setFileList(FileList?.results);
      TagList?.results?.map((tag: any) => {
        setTags((prev) => [...prev, tag.title]);
      });
      const email = PurchaseData.email;
      setTermsCondition(PurchaseData?.description);
      setPurchaseUID(PurchaseData?.uid);
      setEmails({
        ...emails,
        email: selectedSupplier?.email,
        ccEmail: email?.cc_emails,
        bcEmail: email?.bcc_emails,
      });
      setData({
        ...data,
        mailing_address: PurchaseData?.billing_address?.full_address || '',
        shipping_to: PurchaseData?.shipping_address?.full_address,
        ship_via: PurchaseData?.shipping_address?.shipping_by,
        location: {
          title: PurchaseData?.warehouse?.title,
          uid: PurchaseData?.warehouse?.uid,
        },
      });
      setPurchaseData({
        ...purchaseData,
        discount_kind: PurchaseData?.discount_kind,
        discount_amount: PurchaseData?.discount,
        shipping_fee: PurchaseData?.shipping_fee,
        total_tax: PurchaseData.total_tax,
        total: PurchaseData.total,
        tax_kind: PurchaseData.tax_kind,
      });

      const { PurchaseArray, CategoryArray } = convertToUsableArr(PurchaseItems, PurchaseData);

      setPurchaseItems(PurchaseArray);
      setCategoryItems(CategoryArray);
    } catch (err) {
      console.log(err);
      toast.error("Couldn't retrieve purchase data.");
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  // derived for the summary rail (display only — does not change any payload)
  const supplierName = `${selectedSupplier?.first_name || ''} ${selectedSupplier?.last_name || ''}`.trim();
  const billTotal = Number(purchaseData?.total) || 0;
  const billSubtotal = Number(purchaseData?.sub_total) || 0;
  const billTax = Number(purchaseData?.total_tax) || 0;
  const billDeposit = Number(purchaseData?.deposit) || 0;
  const billBalance = Number(purchaseData?.due_total) || Math.max(0, billTotal - billDeposit);

  return (
    <CustomSecureRoutes codeName="add_purchase">
      <div className="relative font-jakarta text-v-ink900">
        {(isPurchaseLoading || isPending) && (
          <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
            <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
            {isPending && (
              <div className="mt-2">
                <TextAnimation
                  messages={['Creating Bill', 'Sending Bill', 'Uploading Attachments']}
                  start={isPending}
                />
              </div>
            )}
          </div>
        )}

        <div className={`${Preview ? 'hidden' : ''}`}>
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
              New bill
            </h1>
            {data?.bill_no && <Chip tone="violet">{data.bill_no}</Chip>}
            <Chip tone="neutral">Draft</Chip>
            <Chip tone="warn">Due {moment(dueDate).format('DD MMM YYYY')}</Chip>
          </div>

          {/* two-column body */}
          <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* LEFT — work column */}
            <div className="flex min-w-0 flex-col gap-4">
              {/* Bill-from + details */}
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-4 flex items-center gap-2.5">
                  <IconChip tone="violet">
                    <Store />
                  </IconChip>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-v-ink900">Bill from</div>
                    <div className="text-[11.5px] text-v-ink400">
                      Pick a supplier — contact details auto-fill.
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

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
                  <div>
                    <label className={V_LABEL}>
                      Supplier <span className="text-v-primary">*</span>
                    </label>
                    <SupplierSelectDropDown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={setSelectedSupplier}
                      value={selectedSupplier}
                      OnSelect={OnSupplierSelect}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Email</label>
                    <input
                      value={emails.email}
                      onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                      placeholder="name@company.com"
                      className={V_FIELD}
                      type="email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <EmailPopup emails={emails} setEmails={setEmails} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={V_LABEL}>Mailing address</label>
                    <input
                      value={data.mailing_address}
                      onChange={(e) => setData({ ...data, mailing_address: e.target.value })}
                      placeholder="Street, city, state ZIP"
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Location</label>
                    <LocationSelectDropDown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={(e: any) => setData({ ...data, location: e })}
                      value={data.location}
                    />
                  </div>
                  <div>
                    <CurrencySelect
                      customerCurrency={selectedSupplier?.currency}
                      setRate={setCurrency}
                      rate={currency}
                    />
                  </div>
                  {purchaseData?.deposit > 0 && (
                    <div className="md:col-span-2">
                      <label className={V_LABEL}>
                        Deposit account <span className="text-v-primary">*</span>
                      </label>
                      <AccountSelectDropDown
                        filters={{ account_type__title: 'Bank' }}
                        ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                        setValue={(e: any) => setData({ ...data, charter_account: e })}
                        value={data?.charter_account}
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className={V_LABEL}>Tags</label>
                    <TagInput tags={tags} onChange={setTags} />
                  </div>
                </div>

                <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Bill details
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
                  <div>
                    <label className={V_LABEL}>Bill date</label>
                    <DatePicker
                      value={billDate}
                      onChange={setBillDate}
                      ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Due date</label>
                    <DatePicker
                      onChange={setDueDate}
                      value={dueDate}
                      ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Terms</label>
                    <TermSelectDropDown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={(e: any) => setData({ ...data, terms: e })}
                      value={data.terms}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Bill no</label>
                    <input
                      value={data.bill_no}
                      onChange={(e) => setData({ ...data, bill_no: e.target.value })}
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* Category + item details */}
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

              {/* Memo + Attachments */}
              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
                <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                    Memo &amp; notes
                  </div>
                  <div className="relative">
                    <TextEditor setTermsCondition={setTermsCondition} />
                  </div>
                </div>
                <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                    <Paperclip className="h-3.5 w-3.5" /> Attachments
                  </div>
                  <FileUpload onLinkedFilesChange={setAttachmentList} onFilesChange={handleFilesChange} />
                </div>
              </div>
            </div>

            {/* RIGHT — summary rail */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-0">
              {/* amount-due hero */}
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
                    Amount due
                  </div>
                  <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                    {money(billBalance)}
                  </div>
                  <div className="mt-1 text-[11.5px] text-white/60">
                    {data?.terms?.label ? `${data.terms.label} · ` : ''}due{' '}
                    {moment(dueDate).format('DD MMMM, YYYY')}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <Store className="h-3.5 w-3.5" />
                    {selectedSupplier?.uid ? `Payable to ${supplierName}` : 'No supplier selected yet'}
                  </div>
                </div>
              </div>

              {/* totals + actions */}
              <div className="rounded-v-card bg-white p-5 shadow-v-card">
                <TotalRow label="Subtotal" value={money(billSubtotal)} />
                <TotalRow label="Sales tax" value={money(billTax)} />
                <TotalRow label="Total" value={money(billTotal)} strong />
                {billDeposit > 0 && <TotalRow label="Deposit / paid now" value={`−${money(billDeposit)}`} />}
                <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
                <TotalRow label="Balance due" value={money(billBalance)} violet />

                <div className="mt-3 flex flex-col gap-2">
                  <VioletButton
                    variant="primary"
                    className="w-full"
                    onClick={handleSend}
                    disabled={isPending}
                    leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                  >
                    {isPending ? 'Saving…' : 'Save'}
                  </VioletButton>
                  <VioletButton variant="outline" className="w-full" onClick={() => setPreview(true)}>
                    Preview
                  </VioletButton>
                  <VioletButton
                    variant="ghost"
                    className="w-full"
                    onClick={handleSend}
                    disabled={isPending}
                  >
                    Save as draft
                  </VioletButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* preview */}
      <div className={` ${Preview ? '' : 'hidden'}`}>
        <BillPreview
          handleSubmit={handleSend}
          isLoading={isPending}
          PurchaseData={{
            allDates: { billDate, dueDate },
            Data: data,
            emails,
            expenseData: purchaseData,
            tags,
            files,
            fileList,
            attachmentList,
            selectedSupplier,
          }}
          Items={{ purchaseItems, CategoryItems }}
          setPreview={setPreview}
        />
      </div>
      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>

      <SupplierPurchaseList
        IsOpen={isOpen}
        setIsOpen={setIsOpen}
        title={'Add to bill'}
        uid={selectedSupplier?.uid}
        handleAddClick={handleAddClick}
      />
    </CustomSecureRoutes>
  );
};
export default Bill;
