"use client";
import { useEffect, useState } from "react";
import Label from "@/components/ui/RawLabel";
import { IoIosArrowBack } from "react-icons/io";
import Button from "@/components/ui/RawButton";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import moment from "moment";
import SupplierSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import { MdKeyboardArrowDown } from "react-icons/md";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import { GetData, PostMultipart } from "@/services/FetchMethods";
import { useRouter } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import SupplierPurchaseList from "../../_components/SupplierPurchaseList";
import ChequeTable from "./ChequeTable";
import ChequePreview from "./ChequePreview";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import {
  ConvertToBackendData,
  convertToUsableArr,
} from "@/utils/ConvertExpenseData";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { generateBillNumber } from "@/utils/GenerateNumber";
import { useAppSelector } from "@/app/redux/store";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import { toast } from "@/lib/ToastService";
import { cn } from "@/lib/utils";
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from "@/components/violet";
import { ArrowLeft, Wallet, Eye, Paperclip, Loader2, FileCheck } from "lucide-react";
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

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={cn("text-[13px]", strong ? "font-bold text-v-ink900" : "text-v-ink500")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          strong ? "text-[14px] font-extrabold text-v-ink900" : "text-[13px] font-semibold text-v-ink900",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const Cheque = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [modalTitle, setModalTitle] = useState("");
  const [modalSMType, setModalSMType] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [purchaseData, setPurchaseData] = useState<any>({
    discount_kind: "PERCENTAGE",
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "NO_TAX",
    deposit: 0,
    due_total: 0,
  });
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [paymentDate, setPaymentDate] = useState<any>(todayDate);
  const [data, setData] = useState<any>({
    mailing_address: "",
    deposit_to: "",
    location: { title: "", uid: "" },
    payment_method: { title: "", uid: "" },
    cheque_no: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const [isPending, setIsPending] = useState(false);
  const [purchaseUID, setPurchaseUID] = useState("");
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);

  const handleSend = () => {
    const { PurArr, CatArr } = ConvertToBackendData(
      purchaseItems,
      CategoryItems,
    );
    if (!PurArr.length && !CatArr.length) {
      toast.error("Add Items or Category To Create Purchase");
      return;
    }

    const linkedFiles = attachmentList.map((file) => file.uid);

    const Data = {
      date: moment(paymentDate).format("YYYY-MM-DD"),
      email: selectedSupplier?.email,
      status: "OPEN",
      discount_kind: purchaseData.discount_kind,
      discount: Number(purchaseData.discount_amount).toFixed(3),
      shipping_fee: Number(purchaseData.shipping_fee).toFixed(3),
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      // is_bill: true,
      supplier_uid: selectedSupplier?.uid,
      full_billing_address: data.mailing_address,
      tracking_number: data.reference_no,
      tag_title_list: tags,
      purchase_items: JSON.stringify(PurArr),
      custom_expense_items: JSON.stringify(CatArr),
      files: files,
      warehouse_uid: data.location.uid,
      deposit: Number(purchaseData?.total).toFixed(3),
      due_total: "0",
      cheque_number: data?.cheque_no,
      charter_account_uid: data?.deposit_to?.uid,
    };
    if (currency < 0) return toast.error("Currency is Required");
    if (!Data?.charter_account_uid || !Data?.cheque_number) {
      const loopArr = [
        {
          property: "charter_account_uid",
          message: "Please Select A Payment Account",
        },
        { property: "cheque_number", message: "Cheque Number is Required" },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message);
        }
      });
      return;
    }

    setIsPending(true);

    try {
      const formData = new FormData();
      if (linkedFiles.length)
        formData.append("file_uids", JSON.stringify(linkedFiles));
      formData.append("status", "OPEN");
      formData.append("email", Data?.email);
      formData.append("discount_kind", Data.discount_kind);
      formData.append("discount", Data.discount);
      formData.append("shipping_fee", Data.shipping_fee);
      formData.append("total_tax", Data.total_tax);
      formData.append("total", Data.total);
      formData.append("description", Data.description);
      formData.append("tax_kind", Data.tax_kind);
      formData.append("date", Data.date);
      formData.append("is_cheque", "true");
      formData.append("supplier_uid", Data.supplier_uid);
      formData.append("full_billing_address", Data.full_billing_address);
      formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
      formData.append("purchase_items", Data.purchase_items);
      formData.append("custom_expense_items", Data.custom_expense_items);
      formData.append("charter_account_uid", Data.charter_account_uid);
      formData.append("deposit", Data?.total);
      formData.append("cheque_number", Data?.cheque_number);
      formData.append("due_total", "0");
      formData.append("currency_rate", currency);
      formData.append("currency_kind", selectedSupplier?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }

      PostMultipart("we/purchases", formData, "")
        .then((res: any) => {
          if (res) {
            toast.success("Cheque Created");
            setIsPending(false);
            router.push("/dashboard/expenses/expenses?tbl=cheque");
          }
        })
        .catch((error) => {
          setIsPending(false);
          try {
            let errors: any;
            if (error?.message) errors = JSON.parse(error?.message);
            Object.keys(errors)?.forEach((key) => {
              const errorMessages = errors[key];
              errorMessages?.forEach((message: string) => {
                toast.error(
                  `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
                );
              });
            });
          } catch (err) {
            toast.error("Something Went Wrong");
          }
        });
    } catch (err: any) {
      toast.error("Something Went Wrong");
      setIsPending(false);
    }
  };

  const OnSupplierSelect = (supplier: any) => {
    setEmails({ ...emails, email: supplier?.email || "" });
    const number = generateBillNumber(supplier?.first_name || "", "CHQ");
    setData({
      ...data,
      mailing_address:
        !supplier?.address?.province &&
        !supplier?.address?.city &&
        !supplier?.address?.street
          ? ""
          : supplier?.address?.street ||
            "" + " " + supplier?.address?.city ||
            "" + " " + supplier?.address?.province ||
            "",
      cheque_no: number,
    });

    setModalSMType("purchaseList");
    setModalTitle("Add to Expense");
    // setIsOpen(true);
  };

  useEffect(() => {
    if (!Permissions?.includes("change_purchase")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleAddClick = async (uid: string) => {
    setIsPurchaseLoading(true);
    setIsOpen(false);
    try {
      const PurchaseData = await GetData(`we/purchases/${uid}`, "");
      const PurchaseItems = await GetData(`we/purchases/${uid}/items`, "");
      const TagList = await GetData(`we/purchases/${uid}/tags`, "");
      const FileList = await GetData(`we/purchases/${uid}/files`, "");
      // setAttachmentList(FileList.results);
      TagList?.results?.map((tag: any) => {
        setTags((prev) => [...prev, tag.title]);
      });
      const email = JSON.parse(PurchaseData.email || "{}");
      setTermsCondition(PurchaseData?.description);
      setPurchaseUID(PurchaseData?.uid);
      setEmails({
        ...emails,
        email: email?.supplier_email,
        ccEmail: email?.cc_emails,
        bcEmail: email?.bcc_emails,
      });
      setData({
        ...data,
        mailing_address: PurchaseData?.billing_address?.full_address,
        shipping_to: PurchaseData?.shipping_address?.full_address,
        ship_via: PurchaseData?.shipping_address?.shipping_by,
        ship: PurchaseData?.tracking_number,
        reference_no: PurchaseData?.tracking_number,
        location: {
          title: PurchaseData?.warehouse?.title,
          uid: PurchaseData?.warehouse?.uid,
        },
      });
      setPurchaseData({
        ...purchaseData,
        discount_kind: purchaseData?.discount_kind,
        discount_amount: PurchaseData?.discount,
        shipping_fee: PurchaseData?.shipping_fee,
        total_tax: PurchaseData.total_tax,
        total: PurchaseData.total,
        tax_kind: PurchaseData.tax_kind,
      });

      //purchase items
      const { PurchaseArray, CategoryArray } = convertToUsableArr(
        PurchaseItems,
        PurchaseData,
      );

      setPurchaseItems(PurchaseArray);
      setCategoryItems(CategoryArray);
    } catch (err) {
      toast.error("An Error Occurred While Getting The Data");
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  const supplierName = `${selectedSupplier?.first_name || ""} ${selectedSupplier?.last_name || ""}`.trim();
  const chequeTotal = Number(purchaseData?.total) || 0;
  const chequeSubtotal = Number(purchaseData?.sub_total) || 0;
  const chequeTax = Number(purchaseData?.total_tax) || 0;
  const bankAccount = data?.deposit_to?.title || data?.deposit_to?.label || "";

  return (
    <div className="relative font-jakarta text-v-ink900">
      {(isPurchaseLoading || isPending) && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          {isPending && (
            <div className="mt-2">
              <TextAnimation
                messages={["Creating Cheque", "Sending Cheque", "Uploading Attachments"]}
                start={isPending}
              />
            </div>
          )}
        </div>
      )}

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Expenses", href: "/dashboard/expenses/expenses" },
          { label: "New cheque" },
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
            New cheque
          </h1>
          {data?.cheque_no && <Chip tone="violet">{data.cheque_no}</Chip>}
          <Chip tone="success">Print-ready</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Cheque-preview launcher */}
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="group flex items-center gap-3 rounded-[18px] bg-white p-[14px_18px] px-[18px] py-[14px] text-left shadow-v-card transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-20px_rgba(124,77,255,0.5)]"
            >
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] bg-v-primary text-white" style={{ backgroundImage: V.gradients.primary }}>
                <FileCheck className="h-[17px] w-[17px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-v-ink900">Cheque preview</span>
                <span className="block text-[11.5px] text-v-ink400">
                  See exactly what will print — it fills in as you type.
                </span>
              </span>
              <span className="flex-1" />
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-v-tint150 px-3 py-1.5 text-[12px] font-semibold text-v-primary transition-colors group-hover:bg-v-tint100">
                <Eye className="h-[14px] w-[14px]" /> Open preview
              </span>
            </button>

            {/* Pay to & from */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Wallet />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Pay to &amp; from</div>
                  <div className="text-[11.5px] text-v-ink400">
                    The payee and the bank account this cheque draws on.
                  </div>
                </div>
                <span className="flex-1" />
                {selectedSupplier?.uid && (
                  <span className="flex animate-v-pop items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                      {(selectedSupplier?.first_name?.[0] || "?").toUpperCase()}
                    </span>
                    <span className="text-[12px] font-semibold text-v-ink900">{supplierName}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>
                    Payee <span className="text-v-primary">*</span>
                  </label>
                  <SupplierSelectDropDown
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={setSelectedSupplier}
                    value={selectedSupplier}
                    OnSelect={OnSupplierSelect}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Bank account <span className="text-v-primary">*</span>
                  </label>
                  <AccountSelectDropDown
                    filters={{ account_type__title: "Bank" }}
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) => setData({ ...data, deposit_to: e })}
                    value={data?.deposit_to}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Balance</label>
                  <input
                    value={data?.deposit_to?.opening_balance || 0}
                    readOnly
                    className={cn(V_FIELD, "bg-v-wash2")}
                    type="text"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Mailing address</label>
                  <input
                    value={data.mailing_address}
                    onChange={(e) => setData({ ...data, mailing_address: e.target.value })}
                    placeholder="Street, city, state ZIP"
                    className={V_FIELD}
                    type="text"
                  />
                </div>
                <div className="md:col-span-2">
                  <CurrencySelect
                    customerCurrency={selectedSupplier?.currency}
                    setRate={setCurrency}
                    rate={currency}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={V_LABEL}>Tags</label>
                  <TagInput tags={tags} onChange={setTags} />
                </div>
              </div>
            </div>

            {/* Category + item details */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-1 text-[13.5px] font-bold text-v-ink900">Category &amp; item details</div>
              <div className="mb-3 text-[11.5px] text-v-ink400">
                Split the cheque across expense accounts and add any items.
              </div>
              <ChequeTable
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
            {/* cheque-amount hero */}
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
                  Cheque amount
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(chequeTotal)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {supplierName ? `Pay to ${supplierName} · ` : ""}
                  {moment(paymentDate).format("DD MMMM, YYYY")}
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <Wallet className="h-3.5 w-3.5" />
                  {bankAccount ? `Drawn on ${bankAccount}` : "No bank account selected"}
                </div>
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <TotalRow label="Subtotal" value={money(chequeSubtotal)} />
              <TotalRow label="Sales tax" value={money(chequeTax)} />
              <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
              <TotalRow label="Cheque total" value={money(chequeTotal)} strong />

              <div className="mt-3 flex flex-col gap-2">
                <VioletButton
                  variant="primary"
                  className="w-full"
                  onClick={handleSend}
                  disabled={isPending}
                  leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isPending ? "Saving…" : "Save"}
                </VioletButton>
                <VioletButton
                  variant="outline"
                  className="w-full"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => setPreview(true)}
                >
                  Print cheque
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

            {/* cheque details */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card [&>div]:min-w-0">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Cheque details
              </div>
              <div className="mb-3">
                <label className={V_LABEL}>Payment date</label>
                <DatePicker
                  value={paymentDate}
                  onChange={setPaymentDate}
                  ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className={V_LABEL}>Cheque no.</label>
                <input
                  value={data.cheque_no}
                  onChange={(e) => setData({ ...data, cheque_no: e.target.value })}
                  className={V_FIELD}
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>

        <ProductModalSkeleton title="Add Products And Services">
          <CreateProductAndService />
        </ProductModalSkeleton>
      </div>

      {/* preview */}
      <div className={`${Preview ? "" : "hidden"}`}>
        <ChequePreview
          handleSubmit={handleSend}
          isLoading={isPending}
          PurchaseData={{
            allDates: { paymentDate },
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

      <SupplierPurchaseList
        IsOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Add to Cheque"}
        uid={selectedSupplier?.uid}
        handleAddClick={handleAddClick}
      />
    </div>
  );
};
export default Cheque;
