import { uploadPdfOCR } from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import React, { useState } from "react";
import { toast } from "react-toastify";
import OCRTransactionsList from "./OCRTransactionsPreview";
import EditTransaction from "./EditTransaction";

const OCR = ({
  account,
  data,
  setData,
  selectedFile,
  step,
  setStep,
}: {
  account: any;
  data: any[];
  setData: any;
  selectedFile: any;
  step: any;
  setStep: any;
}) => {
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState("");
  const [showClose, setShowClose] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("original");
  const [reversedArray, setReversedArray] = useState<any[]>([]);

  const simulateProcessing = (startProgress: number) => {
    let progress = startProgress;
    const interval = setInterval(() => {
      progress += Math.random() * 1.2; // Slower progression
      setProcessingProgress(Math.floor(Math.min(progress, 99)));
      setProcessingMessage(getProcessingMessage(progress));

      if (progress >= 99) {
        clearInterval(interval);
      }
    }, 800);
  };

  const getProcessingMessage = (progress: number) => {
    if (progress < 30) return "Validating file structure...";
    if (progress < 60) return "Extracting text content...";
    if (progress < 90) return "Parsing transaction data...";
    return "Finalizing results...";
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) => {
      const UpdatedRows = new Set(prev);
      UpdatedRows.add(id);
      return UpdatedRows;
    });
  };

  const handleFileUpload = async (file: File) => {
    setShowClose(false);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setProcessingProgress(0);
    setProcessingMessage("");
    setSelectedRows(new Set());

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await uploadPdfOCR(formData, {
        timeout: 600000,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
          // Transition to processing stage when upload completes
          if (percentCompleted === 100) {
            simulateProcessing(0);
          }
        },
      });
      if (response) {
        response?.transactions?.map((d: any, idx: number) =>
          handleCheckboxChange(idx),
        );
        // When actual response arrives, stop simulation
        setData(response.transactions);
        setProcessingProgress(100);
        setProcessingMessage("Processing complete!");

        // Small delay before showing results
        setTimeout(() => {
          setIsOpen(true);
          setIsUploading(false);
          // setSelectedRows(response.data.map((t: Transaction) => t.id));
        }, 300);
      }
    } catch (error: any) {
      try {
        let errors: any;
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
      } catch (err) {
        toast.error("Gateway Time Out");
      } finally {
        setShowClose(true);
      }
      setUploadError("Data Parsing failed. Please try again.");
    } finally {
      //   clearFileInput();
    }
  };

  const handleSaveEdits = (editedTransaction: any) => {
    if (selectedOption != "reversed") {
      setData((prev: any) =>
        prev.map((transaction: any, idx: any) =>
          idx == editedTransaction.idx ? editedTransaction : transaction,
        ),
      );
    } else {
      setReversedArray((prev) =>
        prev.map((transaction, idx) =>
          idx == editedTransaction.idx ? editedTransaction : transaction,
        ),
      );
    }
    setEditingTransaction(null);
  };

  return (
    <div className="rounded-lg border p-6">
      {/* Step 1 */}
      <h1 className="mb-4 text-3xl font-semibold">Set up your file</h1>
      <h2 className="mb-4 flex items-center gap-1 border-b pb-2 text-lg font-medium">
        Selected File :{" "}
        <span className="line-clamp-1 text-accent_soft_blue">
          {selectedFile?.name}
        </span>
      </h2>
      <div className="my-8">
        <h2 className="mb-4 border-b pb-2 text-lg font-medium text-gray-800">
          Step 1: The AI will automatically extract all transaction data from
          the uploaded PDF.
        </h2>
        <p className="text-sm font-light">
          In this step, the system uses AI to scan the uploaded PDF and
          accurately extract all transaction-related data such as dates,
          amounts, and descriptions for further processing.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="my-4 border-b pb-2 text-lg font-medium text-gray-800">
          Step 2: Review and edit extracted transactions if any mismatches or
          inaccuracies are found.
        </h2>
        <p className="text-sm font-light">
          In this step, users can verify the extracted data and make corrections
          if any transaction details appear incorrect or incomplete.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="mb-4 border-b pb-2 text-lg font-medium text-gray-800">
          Step 3: Select all transactions at once or choose individually, then
          click &apos;Continue&apos; to confirm the import.
        </h2>
        <p className="text-sm font-light">
          This step allows users to review the list of transactions and choose
          whether to import all or only selected entries before proceeding.
        </p>
      </div>
      <div className="my-12 flex items-center justify-between">
        {/* Submit Button */}
        <button
          disabled={isOpen || isUploading}
          onClick={() => handleFileUpload(selectedFile)}
          className="ml-2 mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUploading ? "PROCESSING PDF..." : "PROCESS PDF"}
        </button>
      </div>
      {/* Upload Progress Modal */}
      {isUploading && !showClose && (
        <div className="mx-auto max-w-5xl">
          <div className="w-full rounded-lg border bg-white p-8">
            <h3 className="mb-4 text-lg font-semibold">Uploading PDF...</h3>

            {/* Progress Bar */}
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            {/* Progress Percentage */}
            <div className="mt-2 text-center text-sm text-gray-600">
              {uploadProgress}% Complete
            </div>
            {/* Progress Percentage */}
            {uploadProgress == 100 && !showClose && (
              <div>
                <div>
                  <p className="text-lg">{processingMessage}</p>
                  <div className="my-2 text-sm text-gray-500">
                    {processingProgress}% Complete
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="mt-4 rounded bg-red-100 p-2 text-sm text-red-700">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <OCRTransactionsList
          account={account}
          setStep={setStep}
          reversedArray={reversedArray}
          selectedOption={selectedOption}
          setReversedArray={setReversedArray}
          setSelectedOption={setSelectedOption}
          setEditingTransaction={setEditingTransaction}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          data={data}
        />
      )}
      <div className="my-12 flex items-center justify-between">
        <button
          onClick={() => setStep(2)}
          className="rounded-md border border-green-500 px-6 py-2 font-medium text-green-500 transition-colors"
        >
          Back
        </button>

        {/* Submit Button */}
        <button
          disabled={true}
          onClick={() => {}}
          className="ml-2 mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-300"
        >
          Continue
        </button>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <EditTransaction
          transaction={editingTransaction}
          onSave={handleSaveEdits}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default OCR;
