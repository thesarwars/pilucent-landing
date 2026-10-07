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

const ProductImport = ({
  setData,
  setStep,
  setFile,
}: {
  setData: any;
  setStep: any;
  setFile: any;
}) => {
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
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    setFile(selectedFile);
  }, [selectedFile, setFile]);

  const handleNext = () => {
    if (!selectedFile) {
      return toast.error("Select CSV OR Excel File First");
    }

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: JsonData[] = XLSX.utils.sheet_to_json(sheet);
        setData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
    }
    setStep(2);
  };

  return (
    <div>
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="rounded-xl border-2 bg-white p-3 px-5"
      >
        <div className="w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
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
        <a href="/product_bulk.xlsx" download="product_bulk.xlsx">
          Download a sample file
        </a>
        <FiDownload className="text-lg" />
      </div>

      <div className="mt-24 flex justify-center gap-12">
        <Button
          onClick={() => router.push("/dashboard/sales/product_services")}
          type="button"
          className="w-36 border border-accent_soft_black bg-white text-sm font-semibold text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
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

export default ProductImport;
