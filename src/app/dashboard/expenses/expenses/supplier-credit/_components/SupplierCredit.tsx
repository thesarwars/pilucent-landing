"use client";
import { useEffect, useState } from "react";
import Label from "@/components/ui/RawLabel";
import { IoIosArrowBack } from "react-icons/io";
import Button from "@/components/ui/RawButton";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import moment from "moment";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import { MdKeyboardArrowDown } from "react-icons/md";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import { PostMultipart } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";
import { useRouter } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import SupplierCreditTable from "./SupplierCreditTable";
import SupplierCreditPreview from "./SupplierCreditPreview";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import { ConvertToSupplierCreditBackendData } from "@/utils/ConvertExpenseData";
import { generateBillNumber } from "@/utils/GenerateNumber";
import SupplierSelectDropDown from "@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import DatePicker from "@/components/ui/DatePicker";
import { useAppSelector } from "@/app/redux/store";
import { toast } from "@/lib/ToastService";
import { cn } from "@/lib/utils";
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from "@/components/violet";
import {
  ArrowLeft,
  Building2,
  ArrowUpRight,
  Layers,
  Paperclip,
  Loader2,
  Check,
} from "lucide-react";
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

const REASONS = [
  "Returned goods",
  "Overcharge correction",
  "Damaged in transit",
  "Service not delivered",
  "Goodwill credit",
];

const USAGE_OPTIONS = [
  { key: "hold", title: "Hold as credit", sub: "Use against future bills" },
  { key: "apply", title: "Apply to open bills", sub: "Reduce what you owe now" },
  { key: "refund", title: "Request a refund", sub: "Supplier pays it back" },
];

function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span
        className={cn(
          "text-[13px]",
          strong ? "font-bold text-v-ink900" : "text-v-ink500",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          strong
            ? "text-[14px] font-extrabold text-v-ink900"
            : "text-[13px] font-semibold text-v-ink900",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const SupplierCredit = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [purchaseData, setPurchaseData] = useState<any>({
    // discount_kind: "",
    // discount_amount: 0,
    // shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "NO_TAX",
    // deposit: 0,
    // due_total: 0
  });
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [paymentDate, setPaymentDate] = useState<any>(todayDate);
  const [data, setData] = useState<any>({
    deposit_to: "",
    payment_method: { title: "", uid: "" },
    credit_no: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const [reason, setReason] = useState<string>(""); // UI only — not part of the credit payload
  const [creditUsage, setCreditUsage] = useState<string>("hold"); // UI only — not part of the credit payload
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const router = useRouter();
  const token = GetToken();
  const [isPending, setIsPending] = useState<boolean>(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);

  useEffect(() => {
    if (!Permissions?.includes("add_creditnote")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleSend = () => {
    const { PurArr, CatArr } = ConvertToSupplierCreditBackendData(
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
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      supplier_uid: selectedSupplier?.uid,
      full_address: data.billing_address,
      credit_no: data.credit_no,
      tag_title_list: tags,
      credit_note_items: JSON.stringify(PurArr),
      custom_expense_items: JSON.stringify(CatArr),
      files: files,
    };
    if (currency < 0) return toast.error("Currency is Required");
    if (!data?.credit_no) {
      const loopArr = [
        { property: "credit_no", message: "Credit Number is Required" },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 1000 + 1000 * idx });
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
      formData.append("credit_note_number", Data?.credit_no);
      // formData.append("email", Data?.email);
      formData.append("total_tax", Data.total_tax);
      formData.append("total", Data.total);
      formData.append("kind", "PURCHASE");
      formData.append("description", Data.description);
      formData.append("tax_kind", Data.tax_kind);
      formData.append("supplier_uid", Data.supplier_uid);
      formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
      formData.append("credit_note_items", Data.credit_note_items);
      formData.append("custom_expense_items", Data.custom_expense_items);
      // formData.append("currency_rate", currency);
      // formData.append("currency_kind", selectedSupplier?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }

      PostMultipart("we/credit-notes", formData, token)
        .then((res: any) => {
          if (res) {
            toast.success("Credit Has Been Added to the Supplier");
            setIsPending(false);
            router.push(`/dashboard/expenses/expenses?tbl=credit`);
          }
        })
        .catch((error) => {
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
          setIsPending(false);
        });
    } catch (error: any) {
      // toast.error("An Error Occurred");
    }
  };

  const OnSupplierSelect = (supplier: any) => {
    setEmails({ ...emails, email: supplier?.email || "" });
    const number = generateBillNumber(supplier?.first_name || "", "CRDT");
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
      credit_no: number,
    });
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  // derived for display only — does not affect the credit payload
  const supplierName = `${selectedSupplier?.first_name || ""} ${
    selectedSupplier?.last_name || ""
  }`.trim();
  const creditTotal = Number(purchaseData?.total) || 0;
  const creditTax = Number(purchaseData?.total_tax) || 0;
  const categoriesTotal = (CategoryItems || []).reduce(
    (s: number, c: any) =>
      c?.type === "category" ? s + (Number(c?.amount) || 0) : s,
    0,
  );
  const itemsTotal = (purchaseItems || []).reduce(
    (s: number, p: any) =>
      p?.type === "product"
        ? s + (Number(p?.price) || 0) * (Number(p?.qty) || 0)
        : s,
    0,
  );
  const payable = Number(selectedSupplier?.opening_balance) || 0;
  const afterCredit = Math.max(0, payable - creditTotal);
  const canSave = !!selectedSupplier?.uid && creditTotal > 0;
  const checklist = [
    { label: "Supplier selected", done: !!selectedSupplier?.uid },
    { label: "Credit amount above zero", done: creditTotal > 0 },
    { label: "Credit note number assigned", done: !!data?.credit_no },
  ];

  return (
    <div className="relative font-jakarta text-v-ink900">
      {(isPurchaseLoading || isPending) && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          {isPending && (
            <div className="mt-2">
              <TextAnimation
                messages={[
                  "Creating Credit Note",
                  "Sending Credit Note",
                  "Uploading Attachments",
                ]}
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
          { label: "Supplier credit" },
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
            Supplier credit
          </h1>
          {data?.credit_no && <Chip tone="violet">{data.credit_no}</Chip>}
          <Chip tone="warn">
            <ArrowUpRight className="mr-1 inline h-3 w-3" />
            Money back
          </Chip>
          <Chip tone="neutral">{moment(paymentDate).format("DD MMM YYYY")}</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Credit-from */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="warn">
                  <Building2 />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Credit from
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    The supplier giving this credit — returns, overcharges,
                    goodwill.
                  </div>
                </div>
                <span className="flex-1" />
                {selectedSupplier?.uid && (
                  <Chip tone="rose">You owe them {money(payable)}</Chip>
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
                  <label className={V_LABEL}>Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={V_FIELD}
                  >
                    <option value="">Select a reason</option>
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={V_LABEL}>Email</label>
                  <input
                    value={emails.email}
                    onChange={(e) =>
                      setEmails({ ...emails, email: e.target.value })
                    }
                    placeholder="name@company.com"
                    className={V_FIELD}
                    type="email"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Open balance</label>
                  <input
                    value={`${selectedSupplier?.opening_balance || 0} ${
                      selectedSupplier?.currency || ""
                    }`}
                    readOnly
                    className={cn(V_FIELD, "bg-v-card-subtle text-v-ink500")}
                    type="text"
                  />
                </div>
              </div>
            </div>

            {/* Category + items returned */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-1 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Layers />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Category &amp; items returned
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Which expense accounts this credit reverses, and any products
                    going back.
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <SupplierCreditTable
                  categoryItems={CategoryItems}
                  purchaseItems={purchaseItems}
                  setPurchaseData={setPurchaseData}
                  setPurchaseItems={setPurchaseItems}
                  purchaseData={purchaseData}
                  setCategoryItems={setCategoryItems}
                />
              </div>
            </div>

            {/* Memo & tags + Documents */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Memo &amp; tags
                </div>
                <div className="mb-3">
                  <label className={V_LABEL}>Tags</label>
                  <TagInput tags={tags} onChange={setTags} />
                </div>
                <div className="relative">
                  <TextEditor setTermsCondition={setTermsCondition} />
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Documents
                </div>
                <FileUpload
                  onLinkedFilesChange={setAttachmentList}
                  onFilesChange={handleFilesChange}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — summary rail */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-0">
            {/* amber money-back hero */}
            <div
              className="relative overflow-hidden rounded-v-card p-[22px] text-white"
              style={{
                backgroundImage: V.gradients.heroAmber,
                boxShadow: "0 28px 60px -26px rgba(185,118,8,0.6)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] animate-v-float rounded-full"
                style={{ background: V.orb.amber }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                    Amount to credit
                  </div>
                  <span className="rounded-full bg-[#F5B22E] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#16172A]">
                    Credit
                  </span>
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(creditTotal)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {selectedSupplier?.uid
                    ? `From ${supplierName}`
                    : "No supplier selected yet"}
                  {reason ? ` · ${reason}` : ""}
                </div>
                <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[12px]">
                  <div className="flex items-center justify-between text-white/75">
                    <span>You owe {selectedSupplier?.uid ? supplierName : "them"}</span>
                    <span className="tabular-nums">{money(payable)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-white/75">After this credit</span>
                    <span className="tabular-nums text-[#FDE2A8]">
                      {money(afterCredit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <TotalRow label="Categories" value={money(categoriesTotal)} />
              <TotalRow label="Items" value={money(itemsTotal)} />
              <TotalRow label="Sales tax" value={money(creditTax)} />
              <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
              <div className="flex items-center justify-between rounded-v-input bg-v-warn-bg px-3 py-2">
                <span className="text-[13px] font-bold text-v-warn-deep">
                  Total credit
                </span>
                <span className="text-[14px] font-extrabold tabular-nums text-v-warn-deep">
                  {money(creditTotal)}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <VioletButton
                  variant="primary"
                  className={cn("w-full", !canSave && "opacity-60")}
                  onClick={handleSend}
                  disabled={isPending}
                  leftIcon={
                    isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : undefined
                  }
                >
                  {isPending ? "Saving…" : "Save credit"}
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
                  onClick={handleSend}
                  disabled={isPending}
                >
                  Save &amp; new
                </VioletButton>
              </div>
            </div>

            {/* how to use it */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                How to use it
              </div>
              <div className="flex flex-col gap-2">
                {USAGE_OPTIONS.map((opt) => {
                  const active = creditUsage === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setCreditUsage(opt.key)}
                      className={cn(
                        "flex items-start gap-2.5 rounded-[11px] border p-3 text-left transition-colors",
                        active
                          ? "border-v-primary bg-v-tint100"
                          : "border-v-border hover:border-v-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border",
                          active ? "border-v-primary" : "border-v-ink300",
                        )}
                      >
                        {active && (
                          <span className="h-2 w-2 rounded-full bg-v-primary" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-bold text-v-ink900">
                          {opt.title}
                        </span>
                        <span className="block text-[11px] text-v-ink400">
                          {opt.sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* credit details */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Credit details
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={V_LABEL}>Credit date</label>
                  <DatePicker
                    value={paymentDate}
                    onChange={setPaymentDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Credit note no</label>
                  <input
                    value={data.credit_no}
                    onChange={(e) =>
                      setData({ ...data, credit_no: e.target.value })
                    }
                    className={V_FIELD}
                    type="text"
                  />
                </div>
                <div className="mt-1 flex flex-col gap-2 border-t border-[rgba(22,23,42,0.07)] pt-3">
                  {checklist.map((c) => (
                    <div
                      key={c.label}
                      className="flex items-center gap-2 text-[12px]"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                          c.done
                            ? "bg-v-success-solid text-white"
                            : "bg-v-border text-transparent",
                        )}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span className={cn(c.done ? "text-v-ink700" : "text-v-ink400")}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* preview */}
      <div className={` ${Preview ? "" : "hidden"}`}>
        <SupplierCreditPreview
          handleSubmit={handleSend}
          isLoading={isPending}
          PurchaseData={{
            allDates: { paymentDate },
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
      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>
    </div>
  );
};
export default SupplierCredit;
