"use client";
import { useEffect, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import moment from "moment";
import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import { GetData, PatchMultipart } from "@/services/FetchMethods";
import { useRouter, useSearchParams } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import ChequeTable from "./ChequeTable";
import ChequePreview from "./ChequePreview";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import {
  ConvertToBackendData,
  convertToUsableArr,
} from "@/utils/ConvertExpenseData";
import {
  deleteSingleChequeItem,
  patchSingleChequeItem,
  postSingleChequeItem,
} from "@/app/helpers/backend";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { useAppSelector } from "@/app/redux/store";
import { toast } from "@/lib/ToastService";
import MainLoader from "@/components/MainLoader/MainLoader";
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

const UpdateCheque = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [purchaseItems, setPurchaseItems] = useState<any[]>([]);
  const [CategoryItems, setCategoryItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [purchaseData, setPurchaseData] = useState<any>({
    discount_kind: "",
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "",
    sub_total: 0,
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
    cheque_no: "",
  });
  const [deleteItemsUID, setDeleteItemsUID] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(true);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const [isPending, setIsPending] = useState(false);
  const view = useSearchParams().get("view");
  const [isView, setIsView] = useState<any>();
  const [isTaxLoading, setIsTaxLoading] = useState(true);
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);

  const handleSend = async () => {
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
      file_uids: JSON.stringify(linkedFiles),
      date: moment(paymentDate).format("YYYY-MM-DD"),
      discount_kind: purchaseData.discount_kind,
      discount: Number(purchaseData.discount_amount).toFixed(3),
      shipping_fee: Number(purchaseData.shipping_fee).toFixed(3),
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      full_billing_address: data.mailing_address,
      tag_title_list: tags,
      files: files,
      cheque_number: data?.cheque_no,
      charter_account_uid: data?.deposit_to?.uid,
      currency_kind: selectedSupplier?.currency,
      currency_rate: currency,
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
          toast.error(item.message, { duration: 1000 + 1000 * idx });
        }
      });
      return;
    }
    const formData = new FormData();
    if (linkedFiles.length)
      formData.append("file_uids", JSON.stringify(linkedFiles));
    formData.append("discount_kind", Data.discount_kind);
    formData.append("discount", Data.discount);
    formData.append("shipping_fee", Data.shipping_fee);
    formData.append("total_tax", Data.total_tax);
    formData.append("total", Data.total);
    formData.append("description", Data.description);
    formData.append("tax_kind", Data.tax_kind);
    formData.append("date", Data.date);
    formData.append("full_billing_address", Data.full_billing_address);
    formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
    formData.append("charter_account_uid", Data.charter_account_uid);
    formData.append("deposit", Data?.total);
    formData.append("cheque_number", Data?.cheque_number);
    formData.append("currency_rate", currency);
    formData.append("currency_kind", selectedSupplier?.currency);
    if (files.length) {
      files.map((file) => {
        formData.append("files", file);
      });
    }
    setIsPending(true);

    try {
      const PurchasePromise = PatchMultipart(`we/purchases/${uid}`, formData);
      //Handle purchase items
      const purchasePromises = PurArr.map((arr: any) =>
        arr?.uid
          ? patchSingleChequeItem(uid, arr?.uid, JSON.stringify(arr))
          : postSingleChequeItem(uid, JSON.stringify(arr)),
      );

      // Handle category items
      const categoryPromises = CatArr.map((arr: any) =>
        arr?.uid
          ? patchSingleChequeItem(uid, arr?.uid, JSON.stringify(arr))
          : postSingleChequeItem(uid, JSON.stringify(arr)),
      );

      // Handle deleted items
      const deletePromises =
        deleteItemsUID?.map((itemUid) =>
          deleteSingleChequeItem(uid, itemUid),
        ) || [];

      // Wait for all API calls to complete
      const results = await Promise.allSettled([
        PurchasePromise,
        ...purchasePromises,
        ...categoryPromises,
        ...deletePromises,
      ]);

      // Check if all requests were successful
      const allSuccess = results.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );
      if (allSuccess) {
        setIsPending(false);
        toast.success("Cheque Updated.");
        router.push("/dashboard/expenses/expenses?tbl=cheque");
      } else {
        setIsPending(false);
        toast.warning("Some Items Failed to Update. Please Check.");
      }
    } catch (err: any) {
      toast.error("Something went wrong!");
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (!Permissions?.includes("change_purchase")) {
      router.push("/dashboard");
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
            const tagsList = TagList?.results?.map((tag: any) => tag?.title);
            setTags(tagsList);
            setPaymentDate(PurchaseData.date);
            setSelectedSupplier(PurchaseData?.supplier);
            setTermsCondition(PurchaseData?.description);
            setData({
              ...data,
              mailing_address:
                PurchaseData?.billing_address?.full_address || "",
              deposit_to: PurchaseData?.charter_account,
              cheque_no: PurchaseData?.cheque_number,
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
            const { PurchaseArray, CategoryArray } = convertToUsableArr(
              PurchaseItems,
              PurchaseData,
            );

            setCategoryItems(CategoryArray);
            setPurchaseItems(PurchaseArray);
          })
          .then(() => {
            setIsPurchaseLoading(false);
          })
          .catch((err) => {
            setIsPurchaseLoading(false);
            toast.error("An Error Occurred While Getting The Data");
          });
      } catch (err) {
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

  const supplierName = `${selectedSupplier?.first_name || ""} ${selectedSupplier?.last_name || ""}`.trim();
  const chequeTotal = Number(purchaseData?.total) || 0;
  const chequeSubtotal = Number(purchaseData?.sub_total) || 0;
  const chequeTax = Number(purchaseData?.total_tax) || 0;
  const bankAccount = data?.deposit_to?.title || data?.deposit_to?.label || "";

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={["Updating Cheque", "Saving Changes", "Uploading Attachments"]}
              start={isPending}
            />
          </div>
        </div>
      )}

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Expenses", href: "/dashboard/expenses/expenses" },
          { label: "Cheque" },
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
            Cheque {data?.cheque_no ? `· ${data.cheque_no}` : ""}
          </h1>
          <Chip tone={isView ? "neutral" : "warn"}>{isView ? "View" : "Editing"}</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {/* Cheque-preview launcher */}
            {!isView && (
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
            )}

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
                  <label className={V_LABEL}>Payee</label>
                  <input
                    value={supplierName}
                    readOnly
                    disabled
                    className={cn(V_FIELD, "bg-v-wash2")}
                    type="text"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Bank account <span className="text-v-primary">*</span>
                  </label>
                  <AccountSelectDropDown
                    view={isView}
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
                    readOnly={isView}
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
                <div className="md:col-span-2">
                  <label className={V_LABEL}>Tags</label>
                  <TagInput view={isView} tags={tags} onChange={setTags} />
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

            {/* Memo + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Memo &amp; notes
                </div>
                <div className="relative">
                  <TextEditor
                    view={isView}
                    initialContent={termsCondition}
                    setTermsCondition={setTermsCondition}
                  />
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
                </div>
                <FileUpload
                  apiEndpoint={`we/purchases/${uid}/files`}
                  onLinkedFilesChange={setAttachmentList}
                  onFilesChange={handleFilesChange}
                  fileList={fileList}
                  setFileList={setFileList}
                  view={isView}
                />
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

              {!isView && (
                <div className="mt-3 flex flex-col gap-2">
                  <VioletButton
                    variant="primary"
                    className="w-full"
                    onClick={handleSend}
                    disabled={isPending}
                    leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                  >
                    {isPending ? "Updating…" : "Update cheque"}
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
                    onClick={() => router.back()}
                  >
                    Cancel
                  </VioletButton>
                </div>
              )}
            </div>

            {/* cheque details */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card [&>div]:min-w-0">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Cheque details
              </div>
              <div className="mb-3">
                <label className={V_LABEL}>Payment date</label>
                <DatePicker
                  view={isView}
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
                  readOnly={isView}
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
      {!isView && (
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
      )}
    </div>
  );
};
export default UpdateCheque;
