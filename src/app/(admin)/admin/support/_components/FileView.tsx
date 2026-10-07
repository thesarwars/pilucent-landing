import Image from "next/image";
import { useState } from "react";

// Add this new component at the bottom of your file
const FileView = ({
  file_item,
  isAgent,
}: {
  file_item: any;
  isAgent: boolean;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (url: string, filename: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (file_item.kind === "IMAGE") {
    return (
      <div className="relative">
        <div
          className="flex cursor-zoom-in items-center justify-center overflow-hidden rounded-md border"
          onClick={() => setIsFullscreen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            // loader={() => file_item?.file}
            src={file_item.file}
            blurDataURL={file_item.file}
            alt="Shared content"
            width={300}
            height={300}
            placeholder="blur"
            className="max-h-full max-w-full object-cover"
          ></Image>

          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white">Click to expand</span>
            </div>
          )}
        </div>

        {isFullscreen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <button
                className="absolute -right-2 -top-2 z-50 rounded-full bg-white p-1 shadow-lg"
                onClick={() => setIsFullscreen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <button
                className="absolute -right-2 top-8 z-50 rounded-full bg-white p-1 shadow-lg"
                onClick={() =>
                  handleDownload(file_item.file, file_item.title || "image")
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              <Image
                src={file_item.file}
                alt="Fullscreen content"
                width={1920}
                height={1080}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-2 rounded-md border p-2 hover:bg-gray-50 ${isAgent ? "bg-indigo-50" : "bg-gray-100"}`}
    >
      <div className="flex h-8 items-center justify-center rounded bg-gray-200 px-2">
        <span className="text-xs font-medium text-gray-700">
          {file_item.kind}
        </span>
      </div>
      <span className="max-w-[100px] truncate text-sm">
        {file_item.title || file_item.file.split("/").pop()}
      </span>
      <a
        href={file_item.file}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </div>
  );
};

export default FileView;
