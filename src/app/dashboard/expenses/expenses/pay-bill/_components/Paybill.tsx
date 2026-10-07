"use client";
import { useEffect, useState } from "react";
import Label from "@/components/ui/RawLabel";
import { IoIosArrowBack } from "react-icons/io";
import Button from "@/components/ui/RawButton";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import Link from "next/link";
import FileUpload from "@/app/dashboard/sales/all_sales/_components/FileUpload";
import { MdKeyboardArrowDown } from "react-icons/md";
import TagInput from "@/app/dashboard/sales/all_sales/_components/TagInput";
import { PostMultipart } from "@/services/FetchMethods";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import TextAnimation from "@/app/dashboard/sales/all_sales/_components/CustomTypewritter";
import PayBillsTable from "./PayBillsTable";
import PayBillDetails from "./PayBillDetails";
import PayBillPreview from "./PayBillPreview";
import { useAppSelector } from "@/app/redux/store";

const TextEditor = dynamic(
  () => import("../../../../sales/all_sales/_components/TextEditor"),
  {
    ssr: false,
  },
);

const PayBill = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [Items, setItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>();
  const [PaymentData, setPaymentData] = useState<any>({
    mailing_address: "",
    reference_no: "",
    total: 0,
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
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [isPending, setIsPending] = useState(false);

  const handleConvertData = () => {
    let CrArr: any[] = [];

    Items.map((data: any) => {
      if (data?.total_amount) {
        CrArr.push({
          applied_credit: Number(data?.credit_applied).toFixed(2),
          total: Number(data?.payment).toFixed(2),
          supplier_uid: data?.uid,
        });
      }
    });
    return { CrArr };
  };

  useEffect(() => {
    if (!Permissions?.includes("add_paybill")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleSend = () => {
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
      formData.append("payees", Data.payees);
      formData.append("currency_rate", currency);
      if (files.length) {
        files.map((file) => {
          formData.append("files", file);
        });
      }
      PostMultipart(`we/pay-bills`, formData)
        .then((response) => {
          if (response) {
            setIsPending(false);
            toast.success("Bill Payment Successful", {
              autoClose: 4000,
            });
            setTimeout(() => {
              router.replace("/dashboard/expenses/expenses?tbl=payBill");
            }, 1000);
          }
        })
        .catch((error) => {
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
        });
    } catch (err: any) {
      setIsPending(false);
      // toast.error("An Error Occurred");
    }
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  return (
    <>
      <div className="font-lexend">
        {isPending && (
          <div className="absolute left-0 top-0 z-[100] h-full w-full rounded-xl bg-white bg-opacity-70">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
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
          </div>
        )}
        <div className={`${Preview ? "hidden" : ""}`}>
          <div>
            <Button
              onClick={() => router.back()}
              className="mb-4 mt-5 flex items-center gap-1 p-1 text-accent_soft_blue"
            >
              <IoIosArrowBack /> Back
            </Button>
            <PayBillDetails
              PaymentData={PaymentData}
              setCurrency={setCurrency}
              currency={currency}
              paymentDate={paymentDate}
              setPaymentData={setPaymentData}
              setPaymentDate={setPaymentDate}
            />
          </div>

          <PayBillsTable
            setItems={setItems}
            PaymentData={PaymentData}
            setPaymentData={setPaymentData}
          />

          <div className="mt-5">
            <Label className="mb-2 block font-medium text-accent_text_gray">
              Tags
            </Label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          <div className="relative mt-5">
            <Label className="mb-2 block font-medium text-accent_text_gray">
              Terms and Conditions
            </Label>
            <TextEditor setTermsCondition={setTermsCondition} />
          </div>

          <div className="mb-8 mt-10 flex items-end justify-between">
            <FileUpload
              onLinkedFilesChange={setAttachmentList}
              onFilesChange={handleFilesChange}
            />
            <div className="flex items-center gap-8">
              <Button
                type="button"
                onClick={() => setPreview(true)}
                className="w-[142px] border border-accent_soft_blue bg-accent_bg_light_violet px-1 font-semibold text-accent_soft_blue"
              >
                Preview
              </Button>

              <div className="relative flex items-center justify-between rounded-lg border-none bg-accent_dark_blue text-[#fff] outline-none">
                <Button
                  onClick={handleSend}
                  isLoading={isPending}
                  className="px-6 py-2 text-[1rem] transition-all duration-500"
                >
                  Save & Send
                </Button>

                <div
                  onClick={() => setIsSend(!isSend)}
                  className="publishButton flex w-[50px] cursor-pointer items-center justify-center rounded-r-lg border-l bg-accent_dark_blue py-2"
                >
                  <MdKeyboardArrowDown className="text-[2rem]" />
                </div>

                <ul
                  className={`${isSend ? "z-20 translate-y-0 opacity-100" : "z-[-1] translate-y-[-5px] opacity-0"} publishButtonOptions text-text absolute right-0 top-[50px] flex w-full flex-col rounded-lg bg-accent_dark_blue py-1 text-[0.9rem] transition-all duration-500`}
                >
                  <Button
                    onClick={handleSend}
                    isLoading={isPending}
                    className="rounded-lg px-6 py-2 text-[1rem] transition-all duration-500"
                  >
                    Save & Close
                  </Button>
                </ul>
              </div>
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
export default PayBill;
