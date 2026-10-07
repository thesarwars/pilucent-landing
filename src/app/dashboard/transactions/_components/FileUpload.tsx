import React, { useState, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { GetData } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  preview?: boolean;
  journalUid?: string;
}

interface APIFile {
  uid: string;
  title: string;
  file: string;
  status: string;
  kind: string;
}

const File_Upload: React.FC<FileUploadProps> = ({ onFilesChange, preview, journalUid }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [apiFiles, setApiFiles] = useState<APIFile[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const token = ''

  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (journalUid) {
        try {
          const response = await GetData(
            `we/journals/${journalUid}/files`,
            token
          );
          
          if (response?.results) {
            setApiFiles(response.results);
          }
        } catch (error) {
          console.error('Error fetching files:', error);
        }
      }
    };

    fetchExistingFiles();
  }, [journalUid]);
  

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    onFilesChange([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (fileToRemove: string | File) => {
    if (fileToRemove instanceof File) {
      // Handle local file removal
      const filteredFiles = uploadedFiles.filter(
        (file) => file.name !== fileToRemove.name
      );
      setUploadedFiles(filteredFiles);
      onFilesChange(filteredFiles);
    } else {
      // Handle API file removal
      setApiFiles(apiFiles.filter(file => file.uid !== fileToRemove));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const getFileNameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div
      className={`rounded-xl ${preview ? "w-72 border-0" : ""
        } border border-dashed border-accent_soft_blue bg-[#F8F8FF] p-3`}
    >
      <h1
        className={`mb-2 font-semibold text-[#414042] ${preview ? "border-b-2" : ""
          }`}
      >
        Upload your Documents
      </h1>
      <div className={`mx-auto flex w-full max-w-lg gap-4`}>
        <div
          className={`relative ${preview ? "hidden" : "flex"} cursor-pointer flex-col items-center rounded-md border border-dashed p-4`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text-gray-500">
            Click to browse or drag and drop your files
          </p>
          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className="mt-2 cursor-pointer rounded-md border px-4 py-2 text-[#7E84A3]"
            >
              Browse files
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              className="left-0 top-0 hidden h-full w-full cursor-pointer opacity-0"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) handleFiles(target.files);
              }}
            />
            <p className="mt-2 text-gray-500">
              {uploadedFiles.length + apiFiles.length}{" "}
              {uploadedFiles.length + apiFiles.length === 1 ? "File" : "Files"}
            </p>
          </div>
        </div>

        {/* File List */}
        <div className={`mt-4 min-w-[160px] space-y-2 ${preview ? "w-full" : ""}`}>
          {/* API Files */}
          {apiFiles.map((file) => (
            <div
              key={file.uid}
              className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-2"
            >
              <span className="text-sm">
                {getFileNameFromUrl(file.file).slice(0, 14)}...
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={file.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  View
                </a>
                {!preview && (
                  <button
                    onClick={() => handleRemoveFile(file.uid)}
                    className="ml-2"
                  >
                    <RxCross1 className="text-lg text-red-500 hover:text-red-700" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Local Files */}
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-2"
            >
              <span className="text-sm">{file.name.slice(0, 14)}...</span>
              <div className="flex items-center gap-2">
                {!preview && (
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="ml-2"
                  >
                    <RxCross1 className="text-lg text-red-500 hover:text-red-700" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedFileContent && (
        <div className="mt-4 rounded-md bg-gray-100 p-3">
          <h2 className="font-semibold text-gray-700">File Content:</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-600">
            {selectedFileContent}
          </pre>
        </div>
      )}
    </div>
  );
};

export default File_Upload;