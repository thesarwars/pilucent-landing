"use client";

import { useState } from "react";
import { FiPaperclip, FiRefreshCw, FiCircle, FiSlash } from "react-icons/fi";
import { IoFlashSharp } from "react-icons/io5";

interface ToolbarProps {
  onAddAttachment?: any;
  onCreateRule?: () => void;
  onExclude?: () => void;
  onSplit?: () => void;
  onAdd?: () => void;
}

export default function TransactionToolbar({
  onAddAttachment,
  onCreateRule,
  onExclude,
  onSplit,
  onAdd,
}: Partial<ToolbarProps>) {
  return (
    <div className="flex w-full items-center justify-between border-b border-t border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex items-center space-x-4">
        {/* Add attachment button */}
        {onAddAttachment && (
          <button
            className={`flex cursor-pointer items-center text-accent_soft_blue transition-colors hover:underline`}
            //   onClick={() => onAddAttachment && onAddAttachment()}
          >
            <FiPaperclip className="mr-2" />
            <label className="cursor-pointer" htmlFor="file-input">
              Add attachment
            </label>
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept="image/*, .xlsx, .xls, .doc, .docx, .pdf"
              onChange={(e) =>
                e.target.files && onAddAttachment(e.target.files[0])
              }
            />
          </button>
        )}

        {/* Create a rule button */}
        {onCreateRule && (
          <button
            className={`flex items-center text-accent_soft_blue transition-colors hover:underline`}
            onClick={() => onCreateRule && onCreateRule()}
          >
            <IoFlashSharp className="mr-2 rounded-full border border-accent_soft_blue p-0.5 text-lg" />
            <span>Create a rule</span>
          </button>
        )}

        {/* Exclude button */}
        {onExclude && (
          <button
            className={`flex items-center text-accent_soft_blue transition-colors hover:underline`}
            onClick={() => onExclude && onExclude()}
          >
            <FiSlash className="mr-2 text-lg" />
            <span>Exclude</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Split button */}
        {onSplit && (
          <button
            className={`rounded-md border border-accent_soft_blue px-8 py-1.5 text-base text-accent_soft_blue transition-colors hover:bg-accent_soft_blue hover:text-white`}
            onClick={() => onSplit && onSplit()}
          >
            Split
          </button>
        )}

        {/* Add button */}
        {onAdd && (
          <button
            type="button"
            className={`rounded-md bg-accent_soft_blue px-8 py-1.5 text-base text-white transition-colors hover:bg-opacity-95`}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
