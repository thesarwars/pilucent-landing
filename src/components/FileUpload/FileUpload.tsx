import Image from "next/image";
import { ChangeEvent } from "react";

interface FileUploadProps {
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleFileInputChangeSupplier: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFile: File | null;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  handleDragOver,
  handleDrop,
  handleFileInputChangeSupplier,
  selectedFile,
  required = false,
}) => {
  return (
    <div className="mt-4">
      <p className="pb-2 text-[14px] font-medium">
        Attachment {required && '*'}
      </p>
      <div className="mb-6 mt-4 rounded-lg">
        <div className="rounded-xl border border-dashed border-accent_soft_blue bg-[#F8F8FF] p-3">
          <h1 className="mb-2 font-semibold text-[#414042]">
            Upload your Documents
          </h1>
          <div className="flex w-full max-w-lg items-center gap-4">
            <div
              className="w-full"
              onDragOver={(e) => {
                handleDragOver(e);
                e.preventDefault(); // Prevent default browser behavior
              }}
              onDrop={handleDrop}
            >
              <p className="text-gray-500">
                Click to browse or drag and drop your files or{" "}
              </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload-modal"
                  className="mt-2 cursor-pointer rounded-xl border border-[#7E84A3] px-2 py-1 text-[#7E84A3]"
                >
                  Browse files
                  <input
                    id="file-upload-modal"
                    type="file"
                    name="files" // Changed from 'files' to match the backend expectation
                    accept=".pdf, .csv, .xls, .xlsx"
                    className="hidden"
                    onChange={handleFileInputChangeSupplier}
                    required={required}
                  />
                </label>
                {selectedFile && (
                  <p className="text-sm text-gray-700">{selectedFile.name}</p>
                )}
              </div>
              <p className="mt-2 text-sm text-[#A1A7C4]">
                Accepted formats: PDF, CSV, Excel files
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
