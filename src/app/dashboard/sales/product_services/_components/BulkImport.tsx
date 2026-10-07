"use client";
import BulkImportSteps from "@/components/BulkImportSteps/BulkImportSteps";
import Button from "@/components/ui/RawButton";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

interface BulkImportProps {
  setData: any;
  setStep: any;
  setFile: any;
}

const BulkImport = ({ setData, setStep, setFile }: BulkImportProps) => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      return toast.error("Select CSV OR Excel File First", { autoClose: 4000 });
    }

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
    }
    setStep(2);
  };

  return (
    <div className="font-lexend">
      <BulkImportSteps step={1} title={'Bulk Import'} des={'Import Products and Services'} />
      
      <div className="rounded-xl border border-dashed border-accent_soft_blue bg-[#F8F8FF] p-3">
        {/* // ...existing code for file upload UI... */}
      </div>

      <div className="flex gap-1 text-[#6A6EF6] items-center mt-6">
        <a href="/product_bulk.xlsx" download="product_bulk.xlsx">Download a sample file</a>
        <FiDownload className="text-lg" />
      </div>

      <div className="flex gap-12 justify-center mt-24">
        <Button
          onClick={() => router.push("/dashboard/sales/product_services")}
          type="button"
          className="text-[#6A6EF6] border w-36 text-sm font-semibold border-[#6A6EF6]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          type="button"
          className="bg-[#00035F] font-semibold text-sm w-36 text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BulkImport;
