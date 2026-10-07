"use client";

import type React from "react";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { X, Upload, ImageIcon, ChevronRight } from "lucide-react";
import { postOCR } from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";
import Image from "next/image";
import Loader from "../../../../../helpers/animations/Loader-2.json";
import Lottie from "lottie-react";

interface AutofillSidebarProps {
  setCategoryItems: any;
  CategoryItems: any[];
  setFiles: any;
  files: any[];
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
}

export default function AutofillSidebar({
  setFiles,
  files,
  setCategoryItems,
  CategoryItems,
  isExpanded,
  onToggle,
}: AutofillSidebarProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [File, setFile] = useState<any>("");
  const [image, setImage] = useState<any>(null);
  const [data, setData] = useState({});
  const pasteRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0] && e.dataTransfer.files.length > 0) {
      if (!e.dataTransfer.files?.[0].type.startsWith("image/")) {
        alert("Please drop only image files.");
        return;
      }

      handleFiles(e.dataTransfer.files?.[0]);
      handleImageChange(e.dataTransfer.files?.[0]);
      e.dataTransfer.clearData();
    }
    setIsDragActive(false);
  };

  const handleFiles = async (file: any) => {
    if (!file) return toast.error("File not found!");
    handleImageChange(file);
    setFiles([...files, file]);
    setFile(file);
    try {
      setIsPending(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await postOCR(formData);
      if (res?.success) {
        // console.log(res);
        if (res?.data?.items?.length) {
          const formatted = res?.data?.items?.map((d: any) => {
            return {
              type: "category",
              category: d?.category?.title,
              category_uid: d?.category?.uid,
              description: d?.description,
              amount: d?.amount,
              tax: 0,
              productTaxInfo: { rate: 0, title: "", uid: "" },
              productTaxRate: 0,
              productTaxType: "NO_TAX",
              isPopupOpen: false,
            };
          });
          setCategoryItems([...CategoryItems, ...formatted]);
        }
        console.log(CategoryItems);
        setData(JSON.stringify(res));
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  const handleImageChange = (file: any) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            handleFiles(blob);
          }
        }
      }
    };

    // Attach globally so focus isn't needed
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    if (pasteRef.current) pasteRef.current.focus();
  }, []);

  if (!isExpanded) {
    return (
      <div className="absolute bottom-0 right-0 top-16 flex w-0 flex-col items-center justify-center bg-white pt-7 transition-all duration-300">
        {/* <button
          onClick={() => onToggle(true)}
          className="flex size-[50px] items-center justify-center border border-accent_soft_blue rounded-lg p-2 transition-colors hover:bg-gray-100"
          title="Expand sidebar"
        >
          <Image
            src={
              "https://i.ibb.co.com/tPPFJjgj/Star-AI-loader-activated-state.gif"
            }
            alt="ai"
            width={200}
            height={200}
            className="size-[50px] object-contain"
          />
        </button> */}
      </div>
    );
  }

  return (
    <div className="sticky top-0 flex h-screen w-0 flex-col overflow-hidden overflow-y-auto border-l-4 border-accent_soft_blue bg-white p-4 transition-all duration-300 max-xl:hidden xl:w-[380px]">
      <div
        ref={pasteRef}
        tabIndex={0} // makes the div focusable
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragActive(false);
        }}
      >
        {/* Header */}
        {isPending && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#ffffff54]">
            <Lottie animationData={Loader} loop={true} />
          </div>
        )}
        {/* Autofill Section */}
        <div className="mb-6 mt-4">
          <div className="mb-4 mt-7 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Autofill this expense with
            </h3>
            <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
              BETA
            </span>
            <button
              onClick={() => onToggle(false)}
              className="ml-auto text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* File and Image Buttons */}
          {/* <div className="mb-4 flex gap-3">
            <button className="flex items-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
              <Upload size={18} />
              Files
            </button>
            <button className="flex items-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
              <ImageIcon size={18} />
              Images
            </button>
          </div> */}
        </div>

        {/* Drag and Drop Area */}
        <label htmlFor="file-upload-ocr">
          <div
            className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <h4 className="mb-4 flex w-full items-center justify-center gap-2 rounded bg-accent_soft_blue px-4 py-2 font-bold text-white transition-colors hover:bg-accent_soft_blue">
              <span>+</span>
              Autofill from file
            </h4>
            <p className="mb-1 text-sm text-gray-600">or drag and drop here</p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, PNG, JPEG
            </p>

            <input
              name="file-upload-ocr"
              id="file-upload-ocr"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target?.files?.[0])}
            />
            {/* )} */}
          </div>
        </label>

        {/* Try with Receipts Section */}
        {File && image ? (
          <Image
            src={image}
            width={400}
            height={700}
            alt="avatar"
            className="h-full max-h-96 w-full object-contain"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center border-t border-gray-200 py-8">
            <p className="mb-4 text-sm font-medium text-gray-700">Try with</p>
            <p className="mb-6 text-sm font-bold text-gray-900">receipts</p>

            <div className="relative mb-6 h-32 w-32">
              <div className="absolute inset-0 -rotate-12 transform rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 opacity-60" />
              <div className="absolute inset-0 flex rotate-6 transform items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mb-2 text-2xl">🧾</div>
                  <p className="text-xs text-gray-500">Receipt</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              Review before you save.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
