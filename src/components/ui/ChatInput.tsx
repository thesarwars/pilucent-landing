import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { Paperclip, Smile, Send } from "lucide-react";
import Button from "./RawButton";
import { RxCross1 } from "react-icons/rx";

const ChatInput = ({
  files,
  setFiles,
  isLoading,
  message,
  setMessage,
  handleSendMessage,
}: {
  files: any;
  setFiles: any;
  isLoading: boolean;
  message: any;
  setMessage: any;
  handleSendMessage: any;
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<any>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev: any) => prev + emoji.native);
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="max-h-40 space-y-1 overflow-auto">
        {files.map((file: any, index: number) => (
          <div key={index} className="flex w-full items-center space-x-2 pb-4">
            <p className="inline-block text-xs md:text-base">
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
      </div>
      <form
        className="relative flex items-center rounded-full bg-gray-100 px-2 py-2 shadow-sm md:px-4"
        onSubmit={(e) => handleSendMessage(e)}
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Smile size={20} />
        </button>

        {showEmojiPicker && (
          <div
            ref={dropdownRef}
            className="absolute bottom-12 left-0 overflow-auto max-md:max-w-[300px]"
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mx-2 w-full bg-transparent outline-none md:flex-1"
        />

        <button
          type="button"
          onClick={handleFileUpload}
          className="text-gray-500 hover:text-gray-700"
        >
          <Paperclip size={20} />
        </button>
        <input
          accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e: any) => setFiles([...files, ...e.target.files])}
          multiple
        />

        <button
          type="submit"
          disabled={isLoading}
          className="ml-2 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          {isLoading ? (
            <p className="h-5 w-5 animate-spin rounded-full border-[2px] border-gray-100 border-t-[#6A6EF6]" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
