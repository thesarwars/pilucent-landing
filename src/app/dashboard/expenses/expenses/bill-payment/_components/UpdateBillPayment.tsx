"use client";
import { useEffect, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import { GetData, PatchMultipart } from "@/services/FetchMethods";
import { useRouter, useSearchParams } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import BillPaymentPreview from "./BillPaymentPreview";
import { convertBillPaymentToFrontendData } from "@/utils/ConvertExpenseData";
import BillPaymentUpdateTable from "./BillPaymentUpdateTable";
import { patchBillPaymentItem } from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import { toast } from "@/lib/ToastService";
import MainLoader from "@/components/MainLoader/MainLoader";
import SupplierSelectDropDown from "@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import EmailPopup from "@/app/dashboard/sales/all_sales/_components/EmailPopup";
import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  money,
  V,
} from "@/components/violet";
import { ArrowLeft, Wallet, Paperclip, Loader2, Receipt } from "lucide-react";

const TextEditor = dynamic(
  () => import("../../../../sales/all_sales/_components/TextEditor"),
  {
    ssr: false,
  },
);

/* violet field + label styles reused across the form */
const V_FIELD =
  "w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]";
const V_LABEL = "mb-1.5 block text-xs font-semibold text-v-ink700";

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
          "text-[13px]",
          violet
            ? "font-bold text-v-primary"
            : strong
              ? "font-bold text-v-ink900"
              : "text-v-ink500",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          violet
            ? "text-[14px] font-extrabold text-v-primary"
            : strong
              ? "text-[14px] font-extrabold text-v-ink900"
              : "text-[13px] font-semibold text-v-ink900",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const UpdateBillPayment = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CreditItems, setCreditItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [PaymentData, setPaymentData] = useState<any>({
    mailing_address: "",
    reference_number: "",
    total: 0,
    payment_method: { title: "", uid: "" },
    deposit_to: { title: "", uid: "" },
    bill_no: "",
  });
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [paymentDate, setPaymentDate] = useState<any>(todayDate);
  const [files, setFiles] = useState<File[]>([]);
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [isPending, setIsPending] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState<boolean>(true);
  const [fileList, setFileList] = useState<any>([]);
  const view = useSearchParams().get("view");
  const [isView, setIsView] = useState<any>();

  const handleConvertData = () => {
    let PurArr: any[] = [];
    let CrArr: any[] = [];
    purchaseItems.filter((data: any) => {
      if (data?.payment) {
        PurArr.push({
          uid: data?.uid,
          purchase_uid: data?.purchase_uid,
          total: data?.original_amount,
          used_total: data?.payment,
        });
      }
    });
    CreditItems.map((data: any) => {
      if (data?.payment) {
        CrArr.push({
          uid: data?.uid,
          credit_note_uid: data?.credit_uid,
          total: data?.original_amount,
          used_total: data?.payment,
        });
      }
    });
    return { PurArr, CrArr };
  };

  useEffect(() => {
    if (!Permissions?.includes("change_purchasepayment")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleSend = async () => {
    const { PurArr, CrArr } = handleConvertData();
    if (!PurArr?.length) {
      toast.error("Select Invoice To Make Payment");
      return;
    }
    const emailList = {
      email: emails.email,
      cc_emails: emails?.ccEmail?.split(",").join(","),
      bcc_emails: emails?.bcEmail?.split(",").join(","),
    };

    const linkedFiles = attachmentList.map((file) => file.uid);
    const Data = {
      date: paymentDate,
      email: emailList,
      bill_number: PaymentData?.bill_no,
      total: PaymentData.total,
      description: termsCondition,
      supplier_uid: selectedSupplier?.uid,
      full_billing_address: PaymentData.mailing_address,
      tag_title_list: tags,
      // purchase_payment_items: JSON.stringify(PurArr),
      // credit_note_payment_items: JSON.stringify(CrArr),
      files: files,
      deposit: PaymentData.total,
      payment_account_uid: PaymentData?.deposit_to?.uid,
    };
    if (currency < 0) return toast.error("Currency is Required");
    if (
      !Data?.payment_account_uid ||
      !Data?.full_billing_address ||
      !Data?.bill_number
    ) {
      const loopArr = [
        {
          property: "payment_account_uid",
          message: "Please Select A Payment Account",
        },
        { property: "bill_number", message: "Bill Number is Required" },
        {
          property: "full_billing_address",
          message: "Mailing Address is Required",
        },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 2000 + 1000 * idx });
        }
      });
      return;
    }

    setIsPending(true);

    try {
      const formData = new FormData();
      if (linkedFiles.length)
        formData.append("file_uids", JSON.stringify(linkedFiles));
      formData.append("date", Data.date);
      formData.append("email", JSON.stringify(Data.email));
      formData.append("bill_number", Data.bill_number);
      formData.append("total", Data.total);
      formData.append("description", Data.description);
      formData.append("supplier_uid", Data.supplier_uid);
      formData.append("full_billing_address", Data.full_billing_address);
      formData.append("payment_account_uid", Data.payment_account_uid);
      formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
      formData.append("deposit", Data.total);
      formData.append("currency_rate", currency);
      formData.append("currency_kind", selectedSupplier?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }
      const PayBillPromise = PatchMultipart(
        `we/purchases/payments/${uid}`,
        formData,
      );
      //Handle purchase items
      const PurchaseItemPromises = PurArr.map(
        (arr: any) =>
          arr?.uid && patchBillPaymentItem(uid, arr?.uid, JSON.stringify(arr)),
      );
      const CreditItemPromises = CrArr.map(
        (arr: any) =>
          arr?.uid && patchBillPaymentItem(uid, arr?.uid, JSON.stringify(arr)),
      );
      // Wait for all API calls to complete
      const results = await Promise.allSettled([
        PayBillPromise,
        ...PurchaseItemPromises,
        ...CreditItemPromises,
      ]);

      // Check if all requests were successful
      const allSuccess = results.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );
      if (allSuccess) {
        setIsPending(false);
        toast.success("Bill Payment Updated");
        router.push("/dashboard/expenses/expenses?tbl=payment");
      } else {
        setIsPending(false);
        toast.warning("Some Items Failed to Update. Please Check.");
      }
    } catch (err: any) {
      setIsPending(false);
      toast.error("Something went wrong!");
    }
  };

  const OnSupplierSelect = (supplier: any) => {
    setEmails({ ...emails, email: supplier?.email });
    setPaymentData({
      ...PaymentData,
      mailing_address: `${supplier?.address?.street} ${supplier?.address?.city} ${supplier?.address?.province}`,
    });
  };

  useEffect(() => {
    const loadData = () => {
      setIsPurchaseLoading(true);
      try {
        GetData(`we/purchases/payments/${uid}`)
          .then(async (PaymentData) => {
            const PaymentItems = await GetData(
              `we/purchases/payments/${uid}/items`,
            );
            const TagList = await GetData(`we/purchases/payments/${uid}/tags`);
            const FileList = await GetData(
              `we/purchases/payments/${uid}/files`,
            );
            const email = JSON.parse(PaymentData?.email || "{}");
            setFileList(FileList?.results);
            const tags = TagList?.results?.map((tag: any) => tag?.title);
            setSelectedSupplier(PaymentData?.supplier);
            setTags(tags);
            setEmails({
              ...emails,
              email: email?.email || "",
              ccEmail: email?.cc_emails,
              bcEmail: email?.bcc_emails,
            });
            setPaymentDate(PaymentData?.date);
            setTermsCondition(PaymentData?.description);
            setPaymentData({
              mailing_address: PaymentData?.billing_address?.full_address,
              total: PaymentData?.total,
              payment_method: PaymentData?.payment_method,
              deposit_to: PaymentData?.payment_account,
              bill_no: PaymentData?.bill_number,
            });
            const { Purchases, Credits } =
              convertBillPaymentToFrontendData(PaymentItems);
            setPurchaseItems(Purchases);
            setCreditItems(Credits);
          })
          .then(() => {
            setIsPurchaseLoading(false);
          })
          .catch((err) => {
            console.log(err);
            toast.error("An Error Occurred While Getting The Data");
          });
      } catch (err) {
        console.log(err);
        toast.error("An Error Occurred While Getting The Data");
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    if (view == "true") {
      setIsView(true);
    } else {
      setIsView(false);
    }
  }, [view]);

  if (isPurchaseLoading) {
    return <MainLoader color="#9ca3af" />;
  }

  // derived for the summary rail (display only — does not change any payload)
  const supplierName = `${selectedSupplier?.first_name || ""} ${
    selectedSupplier?.last_name || ""
  }`.trim();
  const paymentTotal = Number(PaymentData?.total) || 0;
  const selectedBills = (purchaseItems || []).filter(
    (p: any) => p?.payment,
  ).length;

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={[
                "Updating Bill Payment",
                "Saving Changes",
                "Uploading Attachments",
              ]}
              start={isPending}
            />
          </div>
        </div>
      )}

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Expenses", href: "/dashboard/expenses/expenses" },
          { label: "Update bill payment" },
        ]}
      />

      <div className={`${Preview ? "hidden" : ""}`}>
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
            Update bill payment
          </h1>
          {PaymentData?.bill_no && (
            <Chip tone="violet">{PaymentData.bill_no}</Chip>
          )}
          <Chip tone="neutral">Money out</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Pay to & from */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Wallet />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Pay to &amp; from
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Who you're paying and the account it comes out of.
                  </div>
                </div>
                <span className="flex-1" />
                {selectedSupplier?.uid && (
                  <span className="flex animate-v-pop items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                      {(selectedSupplier?.first_name?.[0] || "?").toUpperCase()}
                    </span>
                    <span className="text-[12px] font-semibold text-v-ink900">
                      {supplierName}
                    </span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>Supplier</label>
                  <input
                    value={supplierName}
                    readOnly
                    className={cn(V_FIELD, "bg-v-wash2")}
                    type="text"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Email</label>
                  <input
                    value={emails.email || ""}
                    onChange={(e) =>
                      setEmails({ ...emails, email: e.target.value })
                    }
                    placeholder="name@company.com"
                    className={V_FIELD}
                    type="email"
                    readOnly={isView}
                  />
                </div>
                <div className="md:col-span-2">
                  <EmailPopup emails={emails} setEmails={setEmails} />
                </div>
                <div className="md:col-span-2">
                  <label className={V_LABEL}>
                    Mailing address <span className="text-v-primary">*</span>
                  </label>
                  <input
                    value={PaymentData.mailing_address}
                    onChange={(e) =>
                      setPaymentData({
                        ...PaymentData,
                        mailing_address: e.target.value,
                      })
                    }
                    placeholder="Street, city, state ZIP"
                    className={V_FIELD}
                    type="text"
                    readOnly={isView}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Bill no <span className="text-v-primary">*</span>
                  </label>
                  <input
                    value={PaymentData.bill_no}
                    onChange={(e) =>
                      setPaymentData({
                        ...PaymentData,
                        bill_no: e.target.value,
                      })
                    }
                    className={V_FIELD}
                    type="text"
                    readOnly={isView}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Payment date</label>
                  <DatePicker
                    view={isView}
                    onChange={setPaymentDate}
                    value={paymentDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Payment account <span className="text-v-primary">*</span>
                  </label>
                  <AccountSelectDropDown
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) =>
                      setPaymentData({ ...PaymentData, deposit_to: e })
                    }
                    filters={{ account_type__title: "Bank" }}
                    value={PaymentData?.deposit_to}
                    view={isView}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Balance</label>
                  <input
                    value={`${PaymentData?.deposit_to?.opening_balance || 0} ${
                      PaymentData?.deposit_to?.currency || ""
                    }`}
                    readOnly
                    className={cn(V_FIELD, "bg-v-card-subtle text-v-ink500")}
                    type="text"
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
            </div>

            {/* Bills to pay */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-1 text-[13.5px] font-bold text-v-ink900">
                Outstanding bills
              </div>
              <div className="mb-3 text-[11.5px] text-v-ink400">
                Pick the bills this payment settles and enter how much to apply.
              </div>
              <BillPaymentUpdateTable
                view={isView}
                CreditItems={CreditItems}
                PurchaseItems={purchaseItems}
                setCreditItems={setCreditItems}
                PaymentData={PaymentData}
                setPaymentData={setPaymentData}
                setPurchaseItems={setPurchaseItems}
              />
            </div>

            {/* Memo + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Memo &amp; tags
                </div>
                <div className="mb-3">
                  <label className={V_LABEL}>Tags</label>
                  <TagInput view={isView} tags={tags} onChange={setTags} />
                </div>
                <div className="relative">
                  {!isPurchaseLoading && (
                    <TextEditor
                      view={isView}
                      setTermsCondition={setTermsCondition}
                      initialContent={termsCondition}
                    />
                  )}
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
                </div>
                <FileUpload
                  view={isView}
                  fileList={fileList}
                  setFileList={setFileList}
                  apiEndpoint={`we/purchases/payments/${uid}/files`}
                  onLinkedFilesChange={setAttachmentList}
                  onFilesChange={handleFilesChange}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — summary rail */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-0">
            {/* payment hero */}
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
                  Amount paying
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(paymentTotal)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {selectedSupplier?.uid
                    ? `Paid to ${supplierName}`
                    : "No supplier selected yet"}
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <Receipt className="h-3.5 w-3.5" />
                  {PaymentData?.deposit_to?.title
                    ? `From ${PaymentData.deposit_to.title}`
                    : "Choose a payment account"}
                </div>
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <TotalRow label="Bills selected" value={String(selectedBills)} />
              <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
              <TotalRow
                label="Total payment"
                value={money(paymentTotal)}
                violet
              />

              {!isView && (
                <div className="mt-3 flex flex-col gap-2">
                  <VioletButton
                    variant="primary"
                    className="w-full"
                    onClick={handleSend}
                    disabled={isPending}
                    leftIcon={
                      isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : undefined
                    }
                  >
                    {isPending ? "Updating…" : "Update payment"}
                  </VioletButton>
                  <VioletButton
                    variant="outline"
                    className="w-full"
                    onClick={() => setPreview(true)}
                  >
                    Preview
                  </VioletButton>
                  <VioletButton
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </VioletButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* preview */}
      <div className={` ${Preview ? "" : "hidden"}`}>
        <BillPaymentPreview
          handleSubmit={handleSend}
          isLoading={isPending}
          PurchaseData={{
            allDates: { paymentDate },
            Data: PaymentData,
            emails,
            tags,
            files,
            attachmentList,
            selectedSupplier,
          }}
          Items={{ purchaseItems, CreditItems }}
          setPreview={setPreview}
        />
      </div>
    </div>
  );
};
export default UpdateBillPayment;
