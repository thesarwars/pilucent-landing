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
import { GetData, Post, PostMultipart } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";
import { useRouter } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import SupplierPurchaseList from "../../_components/SupplierPurchaseList";
import ExpenseTable from "./ExpenseTable";
import ExpensePreview from "./ExpensePreview";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import {
  ConvertToBackendData,
  convertToUsableArr,
} from "@/utils/ConvertExpenseData";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import PayMethodSelectDropdown from "@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown";
import { generateBillNumber } from "@/utils/GenerateNumber";
import { useAppSelector } from "@/app/redux/store";
import { toast } from "@/lib/ToastService";
import AutofillSidebar from "./AutofillSidebar";
import Image from "next/image";
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

const AI_GIF =
  "https://i.ibb.co.com/tPPFJjgj/Star-AI-loader-activated-state.gif";

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

const Expense = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
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
    deposit: 0,
    due_total: 0,
  });
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [billDate, setBillDate] = useState<any>(todayDate);
  const [paymentDate, setPaymentDate] = useState<any>(todayDate);
  const [data, setData] = useState<any>({
    deposit_to: "",
    location: { title: "", uid: "" },
    payment_method: { title: "", uid: "" },
    reference_no: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const [fileList, setFileList] = useState<any>([]);
  const router = useRouter();
  const token = GetToken();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, setIsPending] = useState(false);
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
      file_uids: JSON.stringify(linkedFiles),
      bill_date: billDate,
      due_date: moment(paymentDate).format("YYYY-MM-DD"),
      email: selectedSupplier?.email,
      status: "OPEN",
      discount_kind: purchaseData.discount_kind,
      discount: Number(purchaseData.discount_amount).toFixed(3),
      shipping_fee: Number(purchaseData.shipping_fee).toFixed(3),
      total_tax: Number(purchaseData.total_tax).toFixed(3),
      total: Number(purchaseData.total).toFixed(3),
      description: termsCondition,
      tax_kind: purchaseData.tax_kind,
      supplier_uid: selectedSupplier?.uid,
      full_billing_address: data.billing_address,
      tracking_number: data.reference_no,
      tag_title_list: tags,
      purchase_items: JSON.stringify(PurArr),
      custom_expense_items: JSON.stringify(CatArr),
      files: files,
      warehouse_uid: data.location.uid,
      deposit: 0,
      due_total: Number(purchaseData.total).toFixed(3),
    };
    if (currency < 0) return toast.error("Currency is Required");
    if (!data?.deposit_to || !data?.payment_method) {
      const loopArr = [
        { property: "deposit_to", message: "Please Select A Payment Account" },
        {
          property: "payment_method",
          message: "Please Select A Payment Method",
        },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 2000 + 1000 * idx });
        }
      });
      return;
    }

    const emailList = {
      email: selectedSupplier.email,
      cc_emails: "",
      bc_emails: "",
    };
    setIsPending(true);
    try {
      const formData = new FormData();
      if (linkedFiles.length)
        formData.append("file_uids", JSON.stringify(linkedFiles));
      formData.append("status", "OPEN");
      formData.append("email", JSON.stringify(emailList));
      formData.append("discount_kind", Data.discount_kind);
      formData.append("discount", Data.discount);
      formData.append("shipping_fee", Data.shipping_fee);
      formData.append("total_tax", Data.total_tax);
      formData.append("total", Data.total);
      formData.append("description", Data.description);
      formData.append("tax_kind", Data.tax_kind);
      formData.append("due_date", Data.due_date);
      formData.append("is_via_expense", "true");
      formData.append("supplier_uid", Data.supplier_uid);
      formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
      formData.append("purchase_items", Data.purchase_items);
      formData.append("custom_expense_items", Data.custom_expense_items);
      formData.append("deposit", "0");
      formData.append("due_total", Data.due_total);
      formData.append("currency_rate", currency);
      formData.append("currency_kind", selectedSupplier?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }

      PostMultipart("we/purchases", formData, token)
        .then((res: any) => {
          if (res?.uid) {
            const ExpenseData = {
              reference_number: data?.reference_number,
              discount: purchaseData?.discount_amount,
              shipping_fee: purchaseData?.shipping_fee,
              total_tax: purchaseData?.total_tax,
              total: Number(purchaseData?.total).toFixed(2),
              deposit: Number(purchaseData?.total)?.toFixed(2),
              due_total: 0,
              description: termsCondition,
              supplier_uid: selectedSupplier?.uid,
              payment_method_uid: data?.payment_method?.uid,
              payment_account_uid: data?.deposit_to?.uid,
              purchase_uids: [res?.uid],
            };

            Post(`we/expenses`, { body: ExpenseData, token }).then(
              (res: any) => {
                setIsPending(false);
                toast.success("Expense Created.");
                router.push("/dashboard/expenses/expenses?tbl=expense");
              },
            );
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
      console.log(err);
    }
  };

  const OnSupplierSelect = (supplier: any) => {
    setEmails({ ...emails, email: supplier?.email });
    const number = generateBillNumber(supplier?.first_name || "");
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
      bill_no: number,
    });
  };

  useEffect(() => {
    if (!Permissions?.includes("add_expense")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleAddClick = async (uid: string) => {
    setIsPurchaseLoading(true);
    setIsOpen(false);
    try {
      const PurchaseData = await GetData(`we/purchases/${uid}`, token);
      const PurchaseItems = await GetData(`we/purchases/${uid}/items`, token);
      const TagList = await GetData(`we/purchases/${uid}/tags`, token);
      const FileList = await GetData(`we/purchases/${uid}/files`, token);
      setFileList(FileList.results);
      const tagsList = TagList?.results?.map((tag: any) => tag?.title);
      setTags(tagsList);
      const email = JSON.parse(PurchaseData.email || "{}");
      setTermsCondition(PurchaseData?.description);
      setEmails({
        ...emails,
        email: email?.email,
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
      const { PurchaseArray, CategoryArray } = convertToUsableArr(
        PurchaseItems,
        PurchaseData,
      );

      setPurchaseItems(PurchaseArray);
      setCategoryItems(CategoryArray);
    } catch (err) {
      toast.error("Couldn't retrieve data.");
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

  // derived for the summary rail (display only — does not change any payload)
  const supplierName = `${selectedSupplier?.first_name || ""} ${
    selectedSupplier?.last_name || ""
  }`.trim();
  const expenseTotal = Number(purchaseData?.total) || 0;
  const expenseTax = Number(purchaseData?.total_tax) || 0;
  const expenseSubtotal = Math.max(0, expenseTotal - expenseTax);

  return (
    <div className="relative flex flex-row-reverse font-jakarta text-v-ink900">
      <AutofillSidebar
        files={files}
        setFiles={setFiles}
        setCategoryItems={setCategoryItems}
        CategoryItems={CategoryItems}
        isExpanded={isSidebarExpanded}
        onToggle={setIsSidebarExpanded}
      />
      <div className="min-w-0 flex-1 transition-all duration-300">
        {(isPurchaseLoading || isPending) && (
          <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
            <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
            {isPending && (
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
            )}
          </div>
        )}

        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Expenses", href: "/dashboard/expenses/expenses" },
            { label: "New expense" },
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
              New expense
            </h1>
            <button
              type="button"
              onClick={() => setIsSidebarExpanded(true)}
              title="AI autofill"
              className="flex h-9 items-center gap-1.5 rounded-[11px] border border-v-border bg-v-tint150 pl-1 pr-2.5 text-[12px] font-bold text-v-primary transition-colors hover:bg-v-tint100"
            >
              <Image
                src={AI_GIF}
                alt="AI autofill"
                width={40}
                height={40}
                className="h-6 w-6 object-contain"
              />
              AI autofill
            </button>
            {data?.bill_no && <Chip tone="violet">{data.bill_no}</Chip>}
            <Chip tone="neutral">Draft</Chip>
          </div>

          {/* two-column body */}
          <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* LEFT — work column */}
            <div className="flex min-w-0 flex-col gap-4">
              {/* Paid-from card */}
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-4 flex items-center gap-2.5">
                  <IconChip tone="violet">
                    <Wallet />
                  </IconChip>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-v-ink900">
                      Paid from
                    </div>
                    <div className="text-[11.5px] text-v-ink400">
                      Who you paid and the account it came out of.
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
                    <label className={V_LABEL}>Payee</label>
                    <SupplierSelectDropDown
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={setSelectedSupplier}
                      value={selectedSupplier}
                      OnSelect={OnSupplierSelect}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>
                      Payment account <span className="text-v-primary">*</span>
                    </label>
                    <AccountSelectDropDown
                      filters={{
                        kind: "ASSETS",
                        account_type__title: "Bank",
                      }}
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={(e: any) => setData({ ...data, deposit_to: e })}
                      value={data?.deposit_to}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Balance</label>
                    <input
                      value={` ${data?.deposit_to?.opening_balance || 0} ${
                        data?.deposit_to?.currency || ""
                      }`}
                      readOnly
                      className={cn(V_FIELD, "bg-v-card-subtle text-v-ink500")}
                      type="text"
                    />
                  </div>
                  <div>
                    <CurrencySelect
                      customerCurrency={selectedSupplier?.currency}
                      setRate={setCurrency}
                      rate={currency}
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Payment date</label>
                    <DatePicker
                      value={billDate}
                      onChange={setBillDate}
                      ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Ref no</label>
                    <input
                      value={data.reference_no}
                      onChange={(e) =>
                        setData({ ...data, reference_no: e.target.value })
                      }
                      placeholder="Reference number"
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={V_LABEL}>
                      Payment method <span className="text-v-primary">*</span>
                    </label>
                    <PayMethodSelectDropdown
                      filters={{ status: "ACTIVE" }}
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={(e: any) =>
                        setData({ ...data, payment_method: e })
                      }
                      value={data.payment_method}
                    />
                  </div>
                </div>
              </div>

              {/* Category + item details */}
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-1 text-[13.5px] font-bold text-v-ink900">
                  Category &amp; item details
                </div>
                <div className="mb-3 text-[11.5px] text-v-ink400">
                  Spread this expense across accounts and add any items.
                </div>
                <ExpenseTable
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
                    <Paperclip className="h-3.5 w-3.5" /> Attachments
                  </div>
                  <FileUpload
                    fileList={fileList}
                    onLinkedFilesChange={setAttachmentList}
                    onFilesChange={handleFilesChange}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT — summary rail */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-0">
              {/* amount hero */}
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
                    Expense total
                  </div>
                  <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                    {money(expenseTotal)}
                  </div>
                  <div className="mt-1 text-[11.5px] text-white/60">
                    {selectedSupplier?.uid
                      ? `Paid to ${supplierName}`
                      : "No payee selected yet"}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <Receipt className="h-3.5 w-3.5" />
                    {data?.deposit_to?.title
                      ? `From ${data.deposit_to.title}${
                          data?.payment_method?.title
                            ? ` · ${data.payment_method.title}`
                            : ""
                        }`
                      : "Choose a payment account"}
                  </div>
                </div>
              </div>

              {/* totals + actions */}
              <div className="rounded-v-card bg-white p-5 shadow-v-card">
                <TotalRow label="Subtotal" value={money(expenseSubtotal)} />
                <TotalRow label="Sales tax" value={money(expenseTax)} />
                <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
                <TotalRow label="Total paid" value={money(expenseTotal)} violet />

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
                    {isPending ? "Saving…" : "Save expense"}
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
                    Save &amp; close
                  </VioletButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* preview  */}
        <div className={` ${Preview ? "" : "hidden"}`}>
          <ExpensePreview
            handleSubmit={handleSend}
            isLoading={isPending}
            PurchaseData={{
              allDates: { billDate },
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
      </div>

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>

      <SupplierPurchaseList
        IsOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Add to bill"}
        uid={selectedSupplier?.uid}
        handleAddClick={handleAddClick}
      />
    </div>
  );
};
export default Expense;
