"use client";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";

interface JsonData {
  [key: string]: any;
}

const CustomerImport = ({
  setData,
  setStep,
  setFile
}: {
  setData: any;
  setStep: any;
  setFile: any
}) => {
  // const [step, setStep] = useState<number>(1);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

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

    if (file) {
      const fileName = file.name;
      const fileExtension = fileName?.split('.')?.pop()?.toLowerCase();

      const mimeType = file.type;

      if (
        fileExtension === 'xlsx' ||
        fileExtension === 'xls' ||
        mimeType === 'application/vnd.ms-excel' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        fileExtension === 'csv' ||
        mimeType === 'text/csv' 
      ) {
        setSelectedFile(file);
      } else {
     toast.error("File Type Must be Excel Or CSV")
      }
    }

    // if (file) {
    // }
  };

  useEffect(()=>{
    setFile(selectedFile)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedFile])

  const handleNext = () => {
    if (!selectedFile) {
      return toast.error("Select CSV or Excel file to proceed");
    }

 
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const parsedData: JsonData[] = XLSX.utils.sheet_to_json(sheet);
        setData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
    }
    setStep(2)
  };



  return (
    <div>
      <div className="rounded-xl px-5  border-2 bg-white p-3">
        <div
          className="w-full"
          onDragOver={(e) => {
            handleDragOver(e);
            e.preventDefault();
          }}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <label
              htmlFor="file-upload"
              className="mt-2 flex cursor-pointer flex-col items-center rounded-xl px-16 py-8 text-accent_soft_black"
            >
              <Image
                src="/images/icons/upload.png"
                width={40}
                height={40}
                alt="upload"
                className="mb-2 h-10 w-10 object-contain"
              />
              <p>
                Drag and drop file to upload or{" "}
                <span className="font-semibold text-accent_soft_blue">
                  Browse
                </span>
              </p>
              <p className="text-sm">Upload CSV file or Excel file </p>
            </label>
            <input
              id="file-upload"
              type="file"
              name="files"
              accept=".csv, .xls, .xlsx"
              className="hidden"
              onChange={handleFileInputChange}
            />
            {selectedFile && (
              <p className="text-sm text-gray-700">{selectedFile.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1 text-accent_soft_blue">
        <a href="/customer_bulk.xlsx" className="hover:underline" download="customer_bulk.xlsx">Download a sample file</a>
        <FiDownload className="text-lg" />
      </div>

      <div className="mt-24 flex justify-center gap-12">
        <Button
          onClick={() => router.push("/dashboard/sales/customers")}
          type="button"
          className="w-36 border border-accent_soft_black text-sm font-semibold text-accent_soft_black bg-white hover:bg-accent_soft_black transition-all hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          type="button"
          className="w-36 bg-accent_soft_black text-sm font-semibold text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CustomerImport;
