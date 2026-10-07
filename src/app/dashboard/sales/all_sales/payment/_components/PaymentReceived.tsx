'use client';
import Button from '@/components/ui/RawButton';
import Label from '@/components/ui/RawLabel';
import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import dynamic from 'next/dynamic';
import { Temporal } from '@js-temporal/polyfill';
import FileUpload from '../../_components/FileUpload';
import PaymentPreview from './PaymentPreview';
import CustomerSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import PaymentReceivedTable from './PaymentReceivedTable';
import CurrencySelect from '../../_components/CurrencySelect';
import EmailPopup from '../../_components/EmailPopup';
import moment from 'moment';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { PostMultipart } from '@/services/FetchMethods';
import { useMutation } from '@tanstack/react-query';
import TextAnimation from '../../_components/CustomTypewritter';
import { useRouter, useSearchParams } from 'next/navigation';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import PayMethodSelectDropdown from '../../../../../../components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import { decryptData } from '@/app/helpers/crypto';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import { ArrowLeft, User, CreditCard, Receipt, Paperclip, Loader2, CheckCircle2 } from 'lucide-react';

const TextEditor = dynamic(() => import('@/app/dashboard/sales/all_sales/_components/TextEditor'), {
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
  green,
}: {
  label: string;
  value: string;
  strong?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={cn('text-[13px]', strong ? 'font-bold text-v-ink900' : 'text-v-ink500')}>{label}</span>
      <span
        className={cn(
          'tabular-nums',
          green
            ? 'text-[13px] font-semibold text-v-success-fg'
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
      <span className={cn('text-[12.5px] transition-colors', ok ? 'font-semibold text-v-ink900' : 'text-v-ink400')}>
        {label}
      </span>
    </div>
  );
}

const PaymentReceived = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [creditItems, setCreditItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>('');
  const [files, setFiles] = useState<File[]>([]);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [isSend, setIsSend] = useState(false);
  const router = useRouter();
  const c = useSearchParams().get('c');
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [receiptDate, setReceiptDate] = useState<any>(todayDate);
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  useEffect(() => {
    if (!Permissions?.includes('add_salepaymentreceive')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: '',
  });
  const [PaymentData, setPaymentData] = useState<any>({
    billing_address: '',
    reference_number: '',
    total: 0,
    amount_to_credit: 0,
    payment_method: { title: '', uid: '' },
    deposit_to: { title: '', uid: '' },
  });

  const [emails, setEmails] = useState<any>({
    email: '',
    ccEmail: '',
    bcEmail: '',
  });

  const OnCustomerSelect = async (customer: any) => {
    setEmails({ ...emails, email: customer?.email || '' });
    setPaymentData({
      ...PaymentData,
      billing_address:
        !customer?.address?.province && !customer?.address?.province && !customer?.address?.province
          ? ''
          : customer?.address?.street ||
            '' + ' ' + customer?.address?.city ||
            '' + ' ' + customer?.address?.province ||
            '',
      note_no: '',
      location: { label: '', uid: '' },
    });

    setTags([]);
    setTermsCondition('');
    setInvoiceItems([]);
    setCreditItems([]);
    setFiles([]);
    //  console.log(customer);
  };

  const {
    mutate: PostPayment,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await PostMultipart(`we/sales/payment-received`, data, '');
      return res;
    },
    onSuccess: (res) => {
      toast.success('Payment completed.');
      router.push('/dashboard/sales/all_sales?sale_type=payment received');
    },
    // onError: (res: any) => {
    //   toast.error("Something went wrong!");
    // },
  });

  useEffect(() => {
    if (c) {
      const res = decryptData(c);
      if (res?.uid) {
        setSelectedCustomer(res);
        OnCustomerSelect(res);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c]);

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  const handleConvertData = () => {
    let InArr: any[] = [];
    let CrArr: any[] = [];
    invoiceItems.filter((data: any) => {
      if (Number(data?.payment) > 0) {
        InArr.push({
          sale_uid: data?.uid,
          model_kind: 'SALE',
          status: 'OPEN',
          total: data?.original_amount,
          used_total: data?.payment,
        });
      }
    });

    creditItems.map((data: any) => {
      if (Number(data?.payment) > 0) {
        CrArr.push({
          model_kind: 'CREDIT_NOTE',
          status: 'OPEN',
          credit_note_uid: data?.uid,
          total: data?.original_amount,
          used_total: data?.payment,
        });
      }
    });
    return [...InArr, ...CrArr];
  };

  const GetStatus = () => {
    const invoicePaymentItems = invoiceItems?.filter((i: any) => {
      if (Number(i?.payment) > 0) {
        return i;
      }
    });
    let invoiceItemsTotal = invoicePaymentItems?.reduce(
      (acc: any, row: any) => acc + Number(row?.due_total),
      0
    );
    let creditItemsTotal = creditItems.reduce(
      (acc: any, row: any) => acc + Number(row?.payment),
      0
    );
    const totalPayment = Number(PaymentData?.total || 0) + Number(creditItemsTotal);
    if (Number(totalPayment) == Number(invoiceItemsTotal)) {
      return 'COMPLETED';
    } else {
      return 'PARTIALLY';
    }
  };

  const handleSend = async () => {
    const convertedData = handleConvertData();
    if (!convertedData?.length) {
      toast.error('Select At least One Invoice To Make Payment');
      return;
    }
    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(',').join(','),
      bcc_emails: emails?.bcEmail?.split(',').join(','),
    };

    const linkedFiles = attachmentList.map((file) => file.uid);

    const Data = {
      date: new Date().toLocaleDateString(),
      email: emailList,
      reference_number: PaymentData?.reference_number,
      total: PaymentData?.total,
      amount_to_credit: PaymentData?.amount_to_credit,
      description: termsCondition,
      payment_method_uid: PaymentData?.payment_method?.uid,
      customer_uid: selectedCustomer.uid,
      deposit_to_uid: PaymentData?.deposit_to?.uid,
      sale_payment_receive_items: JSON.stringify(convertedData),
      full_billing_address: PaymentData.billing_address,
      tag_title_list: tags,
      files: files,
      currency_kind: selectedCustomer?.currency,
      currency_rate: currency,
    };
    if (currency < 0) return toast.error('Currency is Required');
    if (!Data?.full_billing_address || !Data?.payment_method_uid || !Data?.deposit_to_uid) {
      const loopArr = [
        {
          property: 'deposit_to_uid',
          message: 'Please Select Deposit to Account',
        },
        {
          property: 'payment_method_uid',
          message: 'Please Select Payment Method',
        },
        {
          property: 'full_billing_address',
          message: 'Billing Address is Required',
        },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 2000 + 1000 * idx });
        }
      });
      return;
    }

    // console.log("credit data" ,convertedData);
    // console.log("invoice items" ,invoiceItems);
    try {
      const formData = new FormData();
      if (linkedFiles.length) formData.append('file_uids', JSON.stringify(linkedFiles));
      // formData.append("date", Data.date);
      formData.append('email', JSON.stringify(Data.email));
      formData.append('status', GetStatus());
      formData.append('total', Data.total);
      formData.append('deposit', Data.total);
      formData.append('description', Data.description);
      formData.append('customer_uid', Data.customer_uid);
      formData.append('amount_to_credit', Data.amount_to_credit);
      formData.append('full_billing_address', Data.full_billing_address);
      formData.append('deposit_to_uid', Data?.deposit_to_uid);
      formData.append('sale_payment_receive_items', Data.sale_payment_receive_items);
      formData.append('reference_number', Data.reference_number);
      formData.append('payment_method_uid', Data.payment_method_uid);
      formData.append('currency_rate', currency);
      formData.append('currency_kind', selectedCustomer?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append('files', file);
        });
      }

      PostPayment(formData);
    } catch (error: any) {
      // console.log(error);
      // toast.error(`Something went wrong`);
    } finally {
    }
  };

  useEffect(() => {
    try {
      if (isError) {
        let errors: any;
        if (error?.message) errors = JSON.parse(error?.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(`${key.split('_').join(' ').toUpperCase()} :- ${message}`);
          });
        });
      }
    } catch (err) {
      toast.error('Something Went Wrong');
    }
  }, [error, isError]);

  const handlePreview = () => {
    if (!selectedCustomer?.uid) {
      return toast.error('Please Select A Customer First');
    }
    const convertedData = handleConvertData();
    if (!convertedData?.length) {
      return toast.error('Select At least One Invoice To Make Payment');
    }
    setPreview(true);
  };

  // derived for the summary rail (display only — does not change any payload)
  const appliedToInvoices =
    invoiceItems?.reduce((a: number, r: any) => a + Number(r?.payment || 0), 0) || 0;
  const creditsApplied =
    creditItems?.reduce((a: number, r: any) => a + Number(r?.payment || 0), 0) || 0;
  const received = Number(PaymentData?.total || 0);
  const coverage = received > 0 ? Math.min(100, (appliedToInvoices / received) * 100) : 0;
  const toCredit = Number(PaymentData?.amount_to_credit || 0);

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation messages={['Making Payment', 'Uploading Attachments']} start={isPending} />
          </div>
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
            Receive payment
          </h1>
          <Chip tone="warn">Draft</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {/* Received-from */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <User />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Received from</div>
                  <div className="text-[11.5px] text-v-ink400">
                    Who paid you? Contact details auto-fill.
                  </div>
                </div>
                <span className="flex-1" />
                {selectedCustomer?.uid && (
                  <span className="flex animate-v-pop items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                      {(selectedCustomer?.first_name?.[0] || '?').toUpperCase()}
                    </span>
                    <span className="text-[12px] font-semibold text-v-ink900">
                      {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
                    </span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
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
                    placeholder="name@company.com"
                    className={V_FIELD}
                    type="email"
                  />
                </div>
                <div className="md:col-span-2">
                  <EmailPopup emails={emails} setEmails={setEmails} />
                </div>
                <div className="md:col-span-2">
                  <label className={V_LABEL}>Billing address</label>
                  <input
                    value={PaymentData.billing_address}
                    onChange={(e) =>
                      setPaymentData({ ...PaymentData, billing_address: e.target.value })
                    }
                    placeholder="Street, city, state ZIP"
                    className={V_FIELD}
                    type="text"
                  />
                </div>
                <div className="md:col-span-2">
                  <CurrencySelect
                    customerCurrency={selectedCustomer?.currency}
                    setRate={setCurrency}
                    rate={currency}
                  />
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <CreditCard />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Payment details</div>
                  <div className="text-[11.5px] text-v-ink400">How and where the money landed.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>
                    Payment method <span className="text-v-primary">*</span>
                  </label>
                  <PayMethodSelectDropdown
                    filters={{ status: 'ACTIVE', account_type__title: 'Bank' }}
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) => setPaymentData({ ...PaymentData, payment_method: e })}
                    value={PaymentData.payment_method}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Deposit to <span className="text-v-primary">*</span>
                  </label>
                  <AccountSelectDropDown
                    filters={{ kind: 'ASSETS' }}
                    setValue={(e: any) => setPaymentData({ ...PaymentData, deposit_to: e })}
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    value={PaymentData.deposit_to}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Payment date</label>
                  <DatePicker
                    onChange={setReceiptDate}
                    value={receiptDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Reference number</label>
                  <input
                    value={PaymentData?.reference_number}
                    onChange={(e) =>
                      setPaymentData({ ...PaymentData, reference_number: e.target.value })
                    }
                    className={V_FIELD}
                    type="text"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={V_LABEL}>Deposit account balance</label>
                  <input
                    value={`${PaymentData?.deposit_to?.opening_balance || 0} ${PaymentData?.deposit_to?.currency || ''}`}
                    placeholder="0.0"
                    className={cn(V_FIELD, 'bg-v-wash2')}
                    type="text"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Outstanding invoices & credits */}
            <div className="overflow-hidden rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Receipt />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Outstanding invoices &amp; credits
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Tick an invoice to apply its balance, or type a partial amount.
                  </div>
                </div>
              </div>
              <PaymentReceivedTable
                customerUID={selectedCustomer?.uid}
                PaymentData={PaymentData}
                setPaymentData={setPaymentData}
                setCreditItems={setCreditItems}
                setInvoiceItems={setInvoiceItems}
              />
            </div>

            {/* Memo + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Memo / note
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
            {/* amount-received hero */}
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
                  Amount received
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(received)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {PaymentData?.payment_method?.title
                    ? `via ${PaymentData.payment_method.title} · `
                    : ''}
                  {moment(receiptDate).format('DD MMMM, YYYY')}
                </div>
                <div className="mt-3.5">
                  <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.14]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#A78BFF,#7C4DFF)] transition-[width] duration-300"
                      style={{ width: `${coverage}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-white/55">
                    {money(appliedToInvoices)} applied of {money(received)} received
                  </div>
                </div>
                {selectedCustomer?.uid && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <User className="h-3.5 w-3.5" />
                    From {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
                  </div>
                )}
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <TotalRow label="Applied to invoices" value={money(appliedToInvoices)} />
              {creditsApplied > 0 && (
                <TotalRow label="Credits applied" value={`−${money(creditsApplied)}`} green />
              )}
              <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
              <TotalRow label="Amount received" value={money(received)} strong />
              {toCredit > 0 && <TotalRow label="To credit" value={money(toCredit)} />}

              <div className="mt-3 flex flex-col gap-2">
                <VioletButton
                  variant="primary"
                  className="w-full"
                  onClick={handleSend}
                  disabled={isPending}
                  leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isPending ? 'Recording…' : 'Record payment'}
                </VioletButton>
                <VioletButton variant="outline" className="w-full" onClick={handlePreview}>
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

            {/* ready to record */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Ready to record?
              </div>
              <ReadyCheck ok={!!selectedCustomer?.uid} label="Customer selected" />
              <ReadyCheck ok={received > 0 || appliedToInvoices > 0} label="Amount applied" />
              <ReadyCheck ok={!!PaymentData?.deposit_to?.uid} label="Deposit account set" />
              <ReadyCheck ok={!!PaymentData?.payment_method?.uid} label="Payment method set" />
            </div>
          </div>
        </div>
      </div>

      <div className={`${Preview ? '' : 'hidden'}`}>
        <PaymentPreview
          handleSend={handleSend}
          isPending={isPending}
          creditItems={creditItems}
          invoiceItems={invoiceItems}
          tags={tags}
          files={files}
          PaymentData={{
            ...PaymentData,
            receiptDate,
            customer: selectedCustomer,
            emails,
          }}
          setPreview={setPreview}
        />
      </div>
    </div>
  );
};

export default PaymentReceived;
