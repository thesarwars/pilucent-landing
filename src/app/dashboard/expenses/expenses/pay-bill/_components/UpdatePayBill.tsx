"use client";
import { useEffect, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import {
  GetData,
  PatchMultipart,
  PostMultipart,
} from "@/services/FetchMethods";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import { convertPayBillDataForFrontend } from "@/utils/ConvertExpenseData";
import PayBillDetails from "./PayBillDetails";
import PayBillUpdateTable from "./PayBillUpdateTable";
import { patchPayBillItem } from "@/app/helpers/backend";
import PayBillPreview from "./PayBillPreview";
import { useAppSelector } from "@/app/redux/store";
import { ArrowLeft, Wallet, ListPlus, Paperclip, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  money,
  V,
} from "@/components/violet";
import moment from "moment";

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

const UpdatePayBill = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [Items, setItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [PaymentData, setPaymentData] = useState<any>({
    mailing_address: "",
    reference_no: "",
    total: 0,
    payment_method: { title: "", uid: "" },
    deposit_to: { title: "", uid: "" },
    currency: "USD",
  });
  const [paymentDate, setPaymentDate] = useState<any>(todayDate);
  const [files, setFiles] = useState<File[]>([]);
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles); // Parent manages and stores the new file list
  };
  const [isPurchaseLoading, setIsPurchaseLoading] = useState<boolean>(true);
  const [fileList, setFileList] = useState<any>([]);
  const [isPending, setIsPending] = useState(false);
  const view = useSearchParams().get("view");
  const [isView, setIsView] = useState<any>();
  const router = useRouter()

  const handleConvertData = () => {
    let CrArr: any[] = [];

    Items.map((data: any) => {
      if (data?.total_amount) {
        CrArr.push({
          uid: data?.item_uid,
          applied_credit: Number(data?.credit_applied).toFixed(2),
          total: Number(data?.payment).toFixed(2),
          supplier_uid: data?.uid,
        });
      }
    });
    return { CrArr };
  };


  useEffect(() => {
    if (!Permissions?.includes("change_paybill")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleSend = async () => {
    const { CrArr } = handleConvertData();

    if (!CrArr) {
      return toast.error("Select Supplier to make Payment");
    }
    const linkedFiles = attachmentList.map((file) => file.uid);
    const Data = {
      date: paymentDate,
      tracking_number: PaymentData?.reference_no,
      status: "OPEN",
      total: Number(PaymentData.total).toFixed(2),
      description: termsCondition,
      tag_title_list: JSON.stringify(tags),
      payees: JSON.stringify(CrArr),
      files: files,
      payment_account_uid: PaymentData?.deposit_to?.uid,
      currency: PaymentData.currency,
    };
    if (currency < 0)
      return toast.error("Currency is Required", { autoClose: 4000 });
    if (!Data?.payment_account_uid || !Data?.tracking_number) {
      const loopArr = [
        {
          property: "payment_account_uid",
          message: "Please Select A Payment Account",
        },
        { property: "tracking_number", message: "Ref Number is Required" },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { autoClose: 3000 + 1000 * idx });
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
      formData.append("tracking_number", Data.tracking_number);
      formData.append("total", Data.total);
      formData.append("description", Data.description);
      formData.append("tag_title_list", Data.tag_title_list);
      formData.append("currency_kind", Data.currency);
      formData.append("payment_account_uid", Data.payment_account_uid);
      // formData.append("payees", Data.payees);
      formData.append("currency_rate", currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }

      const PayBillPromise = PatchMultipart(`we/pay-bills/${uid}`, formData);
      //Handle purchase items
      const itemPromises = CrArr.map(
        (arr: any) =>
          arr?.uid && patchPayBillItem(uid, arr?.uid, JSON.stringify(arr)),
      );
      // Wait for all API calls to complete
      const results = await Promise.allSettled([
        PayBillPromise,
        ...itemPromises,
      ]);

      // Check if all requests were successful
      const allSuccess = results.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );
      if (allSuccess) {
        setIsPending(false);
        toast.success("Pay Bill Updated");
        // router.push("/dashboard/expenses/expenses");
      } else {
        setIsPending(false);
        toast.warning("Some Items Failed to Update. Please Check.");
      }
    } catch (error: any) {
      setIsPending(false);
      try {
        let errors: any;
        setIsPending(false);
        if (error?.message) errors = JSON.parse(error?.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(
              `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
              {
                autoClose: 5000,
              },
            );
          });
        });
      } catch (error) {
        toast.error("Something went Wrong");
      }
    }
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    const loadData = () => {
      setIsPurchaseLoading(true);
      try {
        GetData(`we/pay-bills/${uid}`)
          .then(async (PayBillsData) => {
            const PayBillsItems = await GetData(`we/pay-bills/${uid}/items`);
            const TagList = await GetData(`we/pay-bills/${uid}/tags`);
            const FileList = await GetData(`we/pay-bills/${uid}/files`);

            setFileList(FileList?.results);
            const tags = TagList?.results?.map((tag: any) => tag?.title);
            setTags(tags);
            setPaymentDate(PayBillsData?.date);
            setTermsCondition(PayBillsData?.description);

            setPaymentData({
              reference_no: PayBillsData?.tracking_number,
              total: PayBillsData?.total,
              deposit_to: PayBillsData?.payment_account,
              currency: PayBillsData?.currency?.kind || "USD",
            });
            const FormattedData = convertPayBillDataForFrontend(
              PayBillsItems.results,
            );
            setItems(FormattedData);
          })
          .then(() => {
            setIsPurchaseLoading(false);
          })
          .catch((err) => {
            console.log(err);
            toast.error("An Error Occurred While Getting The Data", {
              autoClose: 5000,
            });
          });
      } catch (err) {
        console.log(err);
        toast.error("An Error Occurred While Getting The Data", {
          autoClose: 5000,
        });
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (view == "true") {
      setIsView(true);
    } else {
      setIsView(false);
    }
  }, [view]);

  return (
    <>
      <div
        className={cn(
          "relative font-jakarta text-v-ink900",
          Preview ? "hidden" : "",
        )}
      >
        {isPurchaseLoading && (
          <div className="absolute left-0 top-0 z-[10] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white">
            <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          </div>
        )}
        {isPending && (
          <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
            <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
            <div className="mt-2">
              <TextAnimation
                messages={[
                  "Updating Payment",
                  "Saving Changes",
                  "Uploading Attachments",
                ]}
                start={isPending}
              />
            </div>
          </div>
        )}

        {/* header */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Expenses", href: "/dashboard/expenses/expenses" },
            { label: "Pay Bill" },
          ]}
        />
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
            Pay Bill
            {PaymentData?.reference_no ? ` · ${PaymentData.reference_no}` : ""}
          </h1>
          <Chip tone={isView ? "neutral" : "warn"}>
            {isView ? "Viewing" : "Editing"}
          </Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {/* Payment account + details */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <Wallet />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Payment details
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Account, currency &amp; payment date.
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <PayBillDetails
                  PaymentData={PaymentData}
                  setCurrency={setCurrency}
                  currency={currency}
                  paymentDate={paymentDate}
                  setPaymentData={setPaymentData}
                  setPaymentDate={setPaymentDate}
                  view={isView}
                />
              </div>
            </div>

            {/* Bills */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <ListPlus />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">
                    Bills
                  </div>
                  <div className="text-[11.5px] text-v-ink400">
                    Totals update live as you edit.
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <PayBillUpdateTable
                  Items={Items}
                  view={isView}
                  setItems={setItems}
                  PaymentData={PaymentData}
                  setPaymentData={setPaymentData}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <label className={V_LABEL}>Tags</label>
              <TagInput view={isView} tags={tags} onChange={setTags} />
            </div>

            {/* Terms + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Terms &amp; conditions
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
                  apiEndpoint={`we/pay-bills/${uid}/files`}
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
            {/* amount-paying hero */}
            <div
              className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
              style={{ backgroundImage: V.gradients.heroViolet }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] rounded-full"
                style={{ background: V.orb.violet }}
              />
              <div className="relative">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Amount paying
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(Number(PaymentData?.total) || 0)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {moment(paymentDate).format("DD MMMM, YYYY")}
                  {PaymentData?.currency ? ` · ${PaymentData.currency}` : ""}
                </div>
                {PaymentData?.deposit_to?.title && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <Wallet className="h-3.5 w-3.5" />
                    {PaymentData.deposit_to.title}
                  </div>
                )}
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="font-semibold text-v-ink500">Total</span>
                <span className="font-extrabold tabular-nums text-v-ink900">
                  {money(Number(PaymentData?.total) || 0)}
                </span>
              </div>

              {!isView && (
                <div className="mt-4 flex flex-col gap-2 border-t border-[rgba(22,23,42,0.07)] pt-4">
                  <VioletButton
                    variant="outline"
                    className="w-full"
                    onClick={() => setPreview(true)}
                  >
                    Preview
                  </VioletButton>
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
        <PayBillPreview
          handleSubmit={handleSend}
          isLoading={isPending}
          PurchaseData={{
            allDates: { paymentDate },
            Data: PaymentData,
            tags,
            files,
            attachmentList,
          }}
          Items={Items}
          setPreview={setPreview}
        />
      </div>
    </>
  );
};
export default UpdatePayBill;
