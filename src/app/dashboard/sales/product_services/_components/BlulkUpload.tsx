"use client";
import BulkImportSteps from "@/components/BulkImportSteps/BulkImportSteps";
import FileUpload from "@/components/FileUpload/FileUpload";
import Button from "@/components/ui/RawButton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiDownload } from "react-icons/fi";

const BulkUploded = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    // console.log(event);

    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // console.log(event);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="font-lexend">
      <BulkImportSteps step={1} title={'Bulk Import'} 
      des={'Import Products and Services'} />
      <div className="w-[586px] mx-auto mt-10">
          <p className="text-[18px] text-accent_text_dark_black">Column Mapping</p>
          <p className="text-sm text-accent_gray_500">Specify Column Mapping Between Excel Sheet and The list.</p>
          <div className='w-[586px]'>
            <div className=" flex justify-between items-center mt-5">
                <h4 className='text-[18px] font-medium'>List Columns: </h4>
                <h4 className='text-[18px] font-medium'>Excel Columns: </h4>
            </div>
            {/* Data */}
            <div className="mt-6">
            <div className='flex justify-between items-center mt-2'>
            <p className='text-sm'>Supplier/Company </p>
            <select
            className="border p-2 w-[207px] h-[42px]"

          >
            <option value="1">Supplier/Company </option>
            <option value="1">Supplier/Company </option>
            <option value="1">Supplier/Company </option>
            <option value="1">Supplier/Company </option>
          </select>
            </div>
            <div className='flex justify-between items-center mt-2'>
            <p className='text-sm'>Address </p>
            <select
            className="border p-2 w-[207px] h-[42px]"

          >
            <option value="1">Address </option>
            <option value="1">Address </option>
            <option value="1">Address </option>
            <option value="1">Address </option>
          </select>
            </div>
            <div className='flex justify-between items-center mt-2'>
            <p className='text-sm'>Phone </p>
            <select
            className="border p-2 w-[207px] h-[42px]"

          >
            <option value="1">Phone</option>
            <option value="1">Phone</option>
            <option value="1">Phone</option>
            <option value="1">Phone</option>
          </select>
            </div>
            <div className='flex justify-between items-center mt-2'>
            <p className='text-sm'>Email </p>
            <select
            className="border p-2 w-[207px] h-[42px]"

          >
            <option value="1">Email </option>
            <option value="1">Email </option>
            <option value="1">Email </option>
            <option value="1">Email </option>
          </select>
            </div>
            <div className='flex justify-between items-center mt-2'>
            <p className='text-sm'>Open Balance </p>
            <select
            className="border p-2 w-[207px] h-[42px]"

          >
            <option value="1">Open Balance </option>
            <option value="1">Open Balance </option>
            <option value="1">Open Balance </option>
            <option value="1">Open Balance </option>
          </select>
            </div>
            </div>
          </div>
      </div>

      <div className="flex gap-12 justify-center mt-24">
        <Button
          type="button"
          className=" text-[#6A6EF6] border w-36 text-sm font-semibold border-[#6A6EF6]"
        >
          Cancel
        </Button>
        <Button
          onClick={() =>
            router.push(
              "bulk-verify"
            )
          }
          type="button"
          className="bg-[#00035F] font-semibold text-sm w-36 text-white "
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BulkUploded;
