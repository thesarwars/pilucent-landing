import { postAttachment } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { useState } from 'react';

const Upload = ({ file, setFile, refetch }: { file: any; setFile: any; refetch: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePostFile = async (file: any) => {
    try {
      setIsLoading(true);
      if (file?.size > 500 * 1024 * 1024) return toast.info('Max upload size is 500 MB');
      const formData = new FormData();
      formData.append('file', file);

      const result = await postAttachment(formData, {
        timeout: 600000,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });
      if (result?.success) {
        refetch();
        setFile([]);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      handlePostFile(droppedFile);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handlePostFile(selectedFile);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h1 className="text-accent_black mb-2 mt-3 text-2xl font-semibold">Attachments</h1>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-30">
            <div className="w-full max-w-md rounded-lg bg-white/60 p-8 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold">Uploading...</h3>

              {/* Progress Bar */}
              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              {/* Progress Percentage */}
              <div className="mt-2 text-center text-sm text-gray-600">
                {uploadProgress}% Complete
              </div>
            </div>
          </div>
        )}
        <p className="max-md:text-sm">
          Looking for shared documents? <span className="text-[#7E84A3]">Go to </span>
          <a href="#" className="text-accent_soft_blue">
            My Accountant
          </a>
        </p>
      </div>
      <div className="mb-4 mt-4 rounded-lg">
        {file && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Selected file: {file.name}</p>
          </div>
        )}
      </div>

      <div className="mb-6 rounded-lg">
        <div
          style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
          className="rounded-xl border-2 bg-white/60 px-6 py-5"
        >
          <h1 className="mb-2 font-semibold text-[#414042]">Upload your Documents</h1>
          <div className="flex w-full max-w-lg items-center gap-4">
            <div className="" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              <p className="text-gray-500">Click to browse or drag and drop your files or </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className="mt-2 cursor-pointer rounded-xl border border-[#7E84A3] px-2 py-1 text-[#7E84A3]"
                >
                  Browse files
                </label>
                <input
                  id="file-upload"
                  type="file"
                  // multiple
                  className="left-0 top-0 hidden h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                  // onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
