"use client";

import { useState } from "react";
import { FiCloud } from "react-icons/fi";
import LinkButton from "./LinkButton";
import AccountSelection from "./AccountSelection";
import DataFormatMapping from "./dataFormatMapping";
import PreviewTransactions from "./PreviewTransactions";
import OCR from "./OCR";
import ImportCompleted from "./Success";
import Link from "next/link";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import { toast } from "@/lib/ToastService";

export default function TransactionImport() {
  const [selectedOption, setSelectedOption] = useState<
    "manual" | "automatic" | null
  >("manual");

  const handleOptionSelect = (option: "manual" | "automatic") => {
    setSelectedOption(option);
  };
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<any>();
  const [isPDF, setIsPDF] = useState<boolean>(false);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    const isPDF = file?.name.endsWith(".pdf") || file?.name.endsWith(".PDF");
    if (isPDF) {
      setIsPDF(true);
    } else {
      setIsPDF(false);
    }
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const isPDF = file.name.endsWith(".pdf") || file.name.endsWith(".PDF");
    if (isPDF) {
      setIsPDF(true);
    } else {
      setIsPDF(false);
    }
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleNext = () => {
    if (selectedFile) {
      setStep(2);
    } else {
      toast.info("Please select a valid excel or csv");
    }
  };

  return (
    <div className="">
      <ManualBreadcrumbs
        items={[
          { label: "Transactions", href: "#" },
          {
            label: "Bank Transactions",
            href: "/dashboard/transactions/banking",
          },
          {
            label: "Transactions Import",
            href: "/dashboard/transactions/banking?act=import",
          },
        ]}
        className="mb-7 mt-0"
      />
      {step == 1 && (
        <>
          {" "}
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Manual Upload Option */}
            <div
              className={`flex-1 cursor-pointer rounded-lg border bg-white p-6 ${selectedOption === "manual" ? "border-gray-400" : "border-gray-200"}`}
              onClick={() => handleOptionSelect("manual")}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Manually upload your transactions
              </h2>

              <p className="mb-4 text-gray-600">How it works</p>

              <div className="mb-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                    1
                  </div>
                  <p className="text-gray-700">
                    Open a new tab and sign in to your online bank account.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                    2
                  </div>
                  <p className="text-gray-700">
                    Export your bank statement in a .CSV, .XLSX, .XLS .PDF
                    format.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                    3
                  </div>
                  <p className="text-gray-700">Upload your bank statement.</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded border border-dashed border-gray-300 p-6">
                <label
                  htmlFor="file-upload"
                  className="mt-2 flex cursor-pointer flex-col items-center rounded-xl px-16 py-8 text-[#7E84A3]"
                >
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-accent_soft_blue">
                    <FiCloud size={32} />
                  </div>
                  <p className="text-gray-700">
                    Drag and drop or{" "}
                    <span className="cursor-pointer text-accent_soft_blue">
                      select files
                    </span>
                  </p>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  name="files"
                  accept=".csv, .xls, .xlsx, application/pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-700">{selectedFile.name}</p>
                )}
              </div>
            </div>

            {/* OR Divider */}
            <div className="flex items-center justify-center">
              <div className="hidden font-medium text-gray-500 md:block">
                OR
              </div>
              <div className="my-4 w-full border-t border-gray-200 md:hidden"></div>
            </div>

            {/* Automatic Import Option */}
            <div
              className={`relative flex-1 cursor-pointer rounded-lg border bg-white p-6 ${selectedOption === "automatic" ? "border-gray-400" : "border-gray-200"}`}
              onClick={() => handleOptionSelect("automatic")}
            >
              <div className="absolute right-2 top-2 rounded bg-accent_soft_blue px-2 py-1 text-xs text-white">
                RECOMMENDED
              </div>

              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Bring in transactions automatically
              </h2>

              <p className="mb-16 text-gray-700">
                Link your accounts to save time on entering bank transactions.
              </p>

              <p className="mb-8 text-sm text-gray-600">
                Select from these popular banks or search 10,000+ local and
                international banks.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Bank logos */}
                <div className="flex h-20 items-center justify-center rounded-md border border-gray-200 p-4">
                  <div className="text-xl font-bold text-blue-500">citi</div>
                </div>

                <div className="flex h-20 items-center justify-center rounded-md border border-gray-200 p-4">
                  <div className="font-bold text-blue-800">CHASE</div>
                </div>

                <div className="flex h-20 items-center justify-center rounded-md border border-gray-200 p-4">
                  <div className="font-bold text-red-600">
                    <div className="flex flex-col items-center">
                      <div className="flex space-x-1">
                        <div className="h-3 w-3 bg-red-600"></div>
                        <div className="h-3 w-3 bg-red-600"></div>
                        <div className="h-3 w-3 bg-red-600"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-20 items-center justify-center rounded-md border border-gray-200 p-4">
                  <div className="font-bold text-red-600">WELLS FARGO</div>
                </div>

                <div className="flex h-20 items-center justify-center rounded-md border border-gray-200 p-4">
                  <div className="font-bold text-blue-700">Capital One</div>
                </div>

                <div className="flex h-20 items-center justify-center rounded-md border border-gray-200 p-4">
                  <div className="font-bold text-red-600">US bank</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Link
              href="/dashboard/transactions/banking"
              className="rounded-md border border-accent_soft_black px-6 py-2 font-medium text-accent_soft_black transition-colors hover:bg-accent_soft_black hover:text-white"
            >
              Back
            </Link>
            {selectedOption == "automatic" ? (
              <LinkButton className="rounded-md bg-accent_soft_black px-6 py-2 font-medium text-white transition-colors" />
            ) : (
              <button
                onClick={handleNext}
                className="rounded-md bg-accent_soft_black px-6 py-2 font-medium text-white transition-colors"
                disabled={!selectedOption}
              >
                Continue
              </button>
            )}
          </div>
        </>
      )}
      {step == 2 && (
        <>
          <AccountSelection
            account={account}
            setAccount={setAccount}
            selectedFile={selectedFile}
            setStep={setStep}
            step={step}
          />
        </>
      )}
      {step == 3 && (
        <>
          {isPDF ? (
            <OCR
              account={account}
              data={data}
              setData={setData}
              selectedFile={selectedFile}
              step={step}
              setStep={setStep}
            />
          ) : (
            <DataFormatMapping
              setProcessedData={setProcessedData}
              processedData={processedData}
              data={data}
              setData={setData}
              selectedFile={selectedFile}
              step={step}
              setStep={setStep}
            />
          )}
        </>
      )}
      {step == 4 && (
        <>
          <PreviewTransactions
            account={account}
            setProcessedData={setProcessedData}
            processedData={processedData}
            step={step}
            setStep={setStep}
          />
        </>
      )}
      {step == 5 && (
        <>
          <ImportCompleted />
        </>
      )}
    </div>
  );
}
