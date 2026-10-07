"use client";
import { useEffect, useState } from "react";
import Label from "@/components/ui/RawLabel";
import Button from "@/components/ui/RawButton";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import PurchasePreview from "./PurchasePreview";
import moment from "moment";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import { MdKeyboardArrowDown } from "react-icons/md";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import PurchaseTable from "./PurchaseTable";
import { useMutation } from "@tanstack/react-query";
import { PostMultipart } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";
import { useRouter } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import { ConvertToBackendData } from "@/utils/ConvertExpenseData";
import SupplierSelectDropDown from "@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import EmailPopup from "@/app/dashboard/sales/all_sales/_components/EmailPopup";
import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import LocationSelectDropDown from "@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown";
import { useAppSelector } from "@/app/redux/store";
import { toast } from "@/lib/ToastService";
import { cn } from "@/lib/utils";
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from "@/components/violet";
import { ArrowLeft, Store, Truck, Paperclip, Loader2, Layers } from "lucide-react";
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

const CARRIERS = [
  { label: "FedEx", eta: "2–3 business days" },
  { label: "UPS", eta: "3–5 business days" },
  { label: "DHL", eta: "1–2 business days" },
  { label: "Courier", eta: "Same day" },
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

const PurchaseOrder = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [purchaseData, setPurchaseData] = useState<any>({
    discount_kind: "PERCENTAGE",
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "NO_TAX",
  });
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [estimateDate, setEstimateDate] = useState<any>(todayDate);
  const [shipDate, setShipDate] = useState<any>(todayDate);
  const [data, setData] = useState<any>({
    mailing_address: "",
    shipping_to: "",
    ship_via: "",
    location: { label: "", uid: "" },
  });
  const [files, setFiles] = useState<File[]>([]);
  const [estimationStatus, setEstimationStatus] = useState("open");
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const router = useRouter();
  const token = GetToken();
  const { Permissions } = useAppSelector((state) => state.Permissions);

  const {
    mutate: PostPurchase,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await PostMultipart(`we/purchases`, data, token);
      return res;
    },
    onSuccess: (res) => {
      toast.success("Purchase created.");
      router.push("/dashboard/expenses/expenses?tbl=purchase");
    },
    onError: (res: any) => {
      toast.error("An Error Occurred!");
    },
  });

  const handleSend = () => {
    const { PurArr, CatArr } = ConvertToBackendData(
      purchaseItems,
      CategoryItems,
    );
    if (!PurArr.length && !CatArr.length) {
      toast.error("Add Items or Category To Create Purchase");
      return;
    }
    const emailList = {
      email: emails.email,
      cc_emails: emails?.ccEmail?.split(",").join(","),
      bcc_emails: emails?.bcEmail?.split(",").join(","),
    };

    const linkedFiles = attachmentList.map((file) => file.uid);

    const Data = {
      date: estimateDate,
      email: emailList,
      status: estimationStatus.toUpperCase(),
      discount_kind: purchaseData.discount_kind,
      discount: Number(purchaseData.discount_amount).toFixed(3),
      shipping_fee: Number(purchaseData.shipping_fee).toFixed(3),
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      ship_date: moment(shipDate).format("YYYY-MM-DD"),
      is_bill: false,
      supplier_uid: selectedSupplier?.uid,
      full_billing_address: data.mailing_address,
      full_shipping_address: data.shipping_to,
      shipping_by: data.ship_via,
      shipping_date: shipDate,
      tag_title_list: tags,
      purchase_items: JSON.stringify(PurArr),
      custom_expense_items: JSON.stringify(CatArr),
      files: files,
      warehouse_uid: data.location.uid,
    };
    if (currency < 0) return toast.error("Currency is Required");
    if (!Data?.warehouse_uid || !Data?.full_billing_address) {
      const loopArr = [
        { property: "warehouse_uid", message: "Please Select A Warehouse" },
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

    try {
      const formData = new FormData();
      if (linkedFiles.length)
        formData.append("file_uids", JSON.stringify(linkedFiles));
      formData.append("email", JSON.stringify(Data.email));
      formData.append("status", Data?.status);
      formData.append("discount_kind", Data.discount_kind);
      formData.append("discount", Data.discount);
      formData.append("shipping_fee", Data.shipping_fee);
      formData.append("total_tax", Data.total_tax);
      formData.append("total", Data.total);
      formData.append("description", Data.description);
      formData.append("tax_kind", Data.tax_kind);
      formData.append("bill_date", estimateDate);
      formData.append("is_bill", "false");
      formData.append("supplier_uid", Data.supplier_uid);
      formData.append("full_billing_address", Data.full_billing_address);
      formData.append("full_shipping_address", Data.full_shipping_address);
      formData.append("shipping_by", Data.shipping_by);
      formData.append("shipping_date", Data.shipping_date);
      formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
      formData.append("purchase_items", Data.purchase_items);
      formData.append("custom_expense_items", Data.custom_expense_items);
      formData.append("warehouse_uid", Data.warehouse_uid);
      formData.append("currency_rate", currency);
      formData.append("currency_kind", selectedSupplier?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }

      PostPurchase(formData);
    } catch (err: any) {
      console.log(err);
    }
  };

  const OnSupplierSelect = (supplier: any) => {
    setEmails({ ...emails, email: supplier?.email || "" });
    setData({
      ...data,
      billing_address:
        !supplier?.address?.province &&
        !supplier?.address?.city &&
        !supplier?.address?.street
          ? ""
          : supplier?.address?.street ||
            "" + " " + supplier?.address?.city ||
            "" + " " + supplier?.address?.province ||
            "",
    });
  };

  useEffect(() => {
    if (!Permissions?.includes("add_purchase")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  useEffect(() => {
    try {
      if (isError) {
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
      }
    } catch (err) {
      toast.error("Something Went Wrong");
    }
  }, [error, isError]);

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  // derived for display only — does not affect any payload
  const supplierName = `${selectedSupplier?.first_name || ""} ${
    selectedSupplier?.last_name || ""
  }`.trim();
  const orderTotal = Number(purchaseData?.total) || 0;
  const orderTax = Number(purchaseData?.total_tax) || 0;
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
  const orderStatus = (data?.status || "OPEN").toUpperCase();
  const statusTone =
    orderStatus === "OPEN" || orderStatus === "ACCEPTED"
      ? "success"
      : orderStatus === "PENDING"
        ? "warn"
        : orderStatus === "REJECTED"
          ? "danger"
          : "neutral";
  const selectedCarrier = CARRIERS.find((c) => c.label === data?.ship_via);

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={[
                "Creating Purchase",
                "Sending Purchase",
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
          { label: "New purchase order" },
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
            New purchase order
          </h1>
          <Chip tone={statusTone as any}>{orderStatus}</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Order-from + logistics */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Store />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Order from
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Pick a supplier — contact details auto-fill.
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
                    onChange={(e) =>
                      setEmails({ ...emails, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setData({ ...data, mailing_address: e.target.value })
                    }
                    placeholder="Street, city, state ZIP"
                    className={V_FIELD}
                    type="text"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Ship to</label>
                  <input
                    value={data.shipping_to}
                    onChange={(e) =>
                      setData({ ...data, shipping_to: e.target.value })
                    }
                    placeholder="Delivery address"
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
                <div className="md:col-span-2">
                  <CurrencySelect
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
                      onClick={() =>
                        setData({ ...data, ship_via: carrier.label })
                      }
                      className={cn(
                        "flex-1 rounded-[11px] border px-3 py-2 text-center text-[12px] font-bold transition-colors",
                        active
                          ? "border-v-primary bg-v-tint100 text-v-primary"
                          : "border-v-border bg-white text-v-ink500 hover:border-v-primary/40",
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
                    Spread this order across expense accounts and add the items
                    you&apos;re ordering.
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <PurchaseTable
                  categoryItems={CategoryItems}
                  purchaseItems={purchaseItems}
                  setPurchaseData={setPurchaseData}
                  setPurchaseItems={setPurchaseItems}
                  purchaseData={purchaseData}
                  setCategoryItems={setCategoryItems}
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
                  <TagInput tags={tags} onChange={setTags} />
                </div>
                <div className="relative">
                  <TextEditor setTermsCondition={setTermsCondition} />
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
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
                  {selectedSupplier?.uid
                    ? `Ordered from ${supplierName} · `
                    : ""}
                  {orderStatus.charAt(0) + orderStatus.slice(1).toLowerCase()}
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <Truck className="h-3.5 w-3.5" />
                  {data?.ship_via
                    ? `via ${data.ship_via}${
                        selectedCarrier ? ` · ${selectedCarrier.eta}` : ""
                      }`
                    : "Choose a carrier for ETA"}
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
                  {isPending
                    ? "Saving…"
                    : isSend
                      ? "Save & send order"
                      : "Save — sends later"}
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
                  Save as draft
                </VioletButton>
              </div>
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
                    value={estimateDate}
                    onChange={setEstimateDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Ship date</label>
                  <DatePicker
                    value={shipDate}
                    onChange={(date: any) => {
                      if (
                        new Date(estimateDate).getTime() >
                        new Date(date).getTime()
                      ) {
                        return toast.info(
                          "Ship date can't be previous date of Purchase date",
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
                    value={data?.status || "OPEN"}
                    onChange={(e) =>
                      setData({ ...data, status: e.target.value })
                    }
                    className={V_FIELD}
                  >
                    <option value="OPEN">Open</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="CLOSED">Closed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-v-input border border-v-border px-3.5 py-2.5">
                  <span className="text-[12px] font-semibold text-v-ink700">
                    Email to supplier
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSend(!isSend)}
                    aria-pressed={isSend}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      isSend ? "bg-v-primary" : "bg-v-border",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                        isSend ? "left-[22px]" : "left-0.5",
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* preview */}
      <div className={` ${Preview ? "" : "hidden"}`}>
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
      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>
    </div>
  );
};
export default PurchaseOrder;
