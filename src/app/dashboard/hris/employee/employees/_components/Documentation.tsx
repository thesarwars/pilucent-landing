import Button from '@/components/ui/RawButton';
import React, { useEffect, useRef, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import {
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  VideoIcon,
} from 'lucide-react';
import { IoMdCloudUpload } from 'react-icons/io';
import DotSpinner from './dot-spinner';
import SignaturePad from './signature';

const getFileIcon = (kind: string, title: string) => {
  const fileType = kind;
  const fileName = title;

  if (
    fileType.includes('pdf') ||
    fileName.endsWith('.pdf') ||
    fileType.includes('word') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return <FileTextIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes('zip') ||
    fileType.includes('archive') ||
    fileName.endsWith('.zip') ||
    fileName.endsWith('.rar')
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  } else if (fileType.includes('video/')) {
    return <VideoIcon className="size-4 opacity-60" />;
  } else if (fileType.includes('audio/')) {
    return <HeadphonesIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith('image/')) {
    return <ImageIcon className="size-4 opacity-60" />;
  }
  return <FileIcon className="size-4 opacity-60" />;
};

interface SignaturePadRef {
  clear: () => void;
}

const Documentation = ({
  files,
  setFiles,
  prev,
  next,
  currentStep,
  steps,
  isGenerating,
  handleGenerateW4,
}: {
  files: any[];
  setFiles: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
  isGenerating: boolean;
  handleGenerateW4: any;
}) => {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = Array.from(event.dataTransfer.files);

    if (droppedFile) {
      setFiles([...files, ...droppedFile]);
    }
  };

  console.log('files', files);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = Array.from(event?.target?.files as any);
    if (selectedFile) {
      setFiles([...files, ...selectedFile]);
    }
  };

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const signaturePadRef = useRef<SignaturePadRef | null>(null);
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setFiles('');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 text-sm text-accent_soft_black">
      {/* Header */}
      {isGenerating && (
        <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-white bg-opacity-50">
          <DotSpinner />
        </div>
      )}

      {/* <div className="flex items-center justify-end">
        <Button
          onClick={handleGenerateW4}
          disabled={isGenerating}
          className="border transition-all hover:bg-gray-100"
        >
          {isGenerating ? "Generating..." : "Generate W4 Form"}
        </Button>
      </div> */}

      {/* <div className="flex justify-center">
        <div className="w-[90%] rounded-lg bg-[#ffffff] p-2 lg:w-[40%]">
          <div
            className="flex flex-col items-center justify-center rounded-md"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <h1 className="mb-2 text-base text-accent_soft_black">
              Upload your Documents
            </h1>
            <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed border-[#3B9DF8] bg-white py-6 dark:border-slate-700 dark:bg-slate-900 md:w-[90%]">
              <IoMdCloudUpload className="text-[3rem] text-primary" />
              <p className="text-text mt-2 dark:text-[#abc2d3]">
                Drag and drop here
              </p>
              <p className="text-text dark:text-[#abc2d3]">or</p>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className="px-6 py-1.5 text-[#3B9DF8]"
                >
                  Browse files
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="left-0 top-0 hidden h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start">
        {files.map((file: any, index: number) => (
          <div
            key={index}
            className="flex w-full items-center justify-center space-x-2 pb-4"
          >
            <p className="inline-block text-left text-xs font-light md:text-sm">
              {file?.name} - {(file?.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-xs text-red-500">
              <span>
                {file?.size > 5 * 1024 * 1024
                  ? "File size limit exceeded - ( Max 5MB )"
                  : ""}
              </span>
            </p>

            <Button
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
              onClick={() =>
                setFiles(files.filter((_: any, i: any) => i !== index))
              }
            >
              <RxCross1 className="text-sm text-black" />
            </Button>
          </div>
        ))}
      </div> */}

      <div className="my-2 rounded-lg bg-white">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Signature and Agreement</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
              Signature
            </label>
            <div
              className={`border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
            >
              <SignaturePad ref={signaturePadRef} onEnd={(data: string) => setFiles(data)} />
            </div>
            <button
              type="button"
              onClick={clearSignature}
              className="mt-2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Signature
            </button>
            {errors.signature && <p className="text-sm text-red-500">Signature is required.</p>}
          </div>
        </div>
      </div>

      <div>
        <div className="mt-8 flex justify-between">
          <button
            onClick={prev}
            disabled={currentStep === 1}
            className={`rounded-md border px-6 py-2 ${
              currentStep === 1
                ? 'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400'
                : 'border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50'
            } `}
          >
            Previous
          </button>

          <button
            type="submit"
            onClick={next}
            className={`rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700`}
          >
            {currentStep === steps.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
