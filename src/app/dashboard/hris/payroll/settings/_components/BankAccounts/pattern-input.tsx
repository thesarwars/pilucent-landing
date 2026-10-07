"use client";

import type React from "react";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export function PatternInput({
  value,
  setValue,
}: {
  value: string;
  setValue: any;
}) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // The regex pattern from your image
  const pattern = /^\d{3}[-]\d{2}[-]\d{4}$/;

  const formatValue = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Format as XXX-XX-XXXX automatically
    if (digits.length >= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    } else if (digits.length >= 4) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}`;
    } else if (digits.length >= 1) {
      return digits.slice(0, 3);
    }
    return digits;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatValue(input);
    setValue(formatted);

    if (formatted === "") {
      setIsValid(null);
    } else {
      setIsValid(pattern.test(formatted));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, arrow keys
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) {
      return;
    }

    // Only allow numbers
    if (
      (e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const formatted = formatValue(paste);
    setValue(formatted);
    setIsValid(pattern.test(formatted));
  };

  return (
    <div className="">
      <div className="relative">
        <input
          id="pattern-input"
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="123-45-6789"
          className={`max-w-sm w-full rounded-md border border-gray-300 px-4 py-2.5 pr-10 outline-none focus:border-accent_soft_black ${
            isValid === true
              ? "border-green-500 focus:border-green-500"
              : isValid === false
                ? "border-red-500 focus:border-red-500"
                : ""
          }`}
          maxLength={11}
        />

        {isValid !== null && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
{/* 
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Pattern:{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            \d{"{3}"}[-]\d{"{2}"}[-]\d{"{4}"}$
          </code>
        </p>
        {isValid === false && value && (
          <p className="text-red-500">Value must match format: XXX-XX-XXXX</p>
        )}
        {isValid === true && <p className="text-green-500">Valid format!</p>}
      </div> */}
    </div>
  );
}
