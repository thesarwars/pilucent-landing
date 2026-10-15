import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import "./PhoneInput.module.css";
import PhoneInput from "react-phone-input-2";

// Each country's format string uses "." per digit (dial code + local).
// Counting dots gives the max total digits allowed for that country.
const getMaxDigits = (countryData: any): number | undefined =>
  countryData?.format ? (countryData.format.match(/\./g) ?? []).length : undefined;

// The format string's total character length equals the HTML maxLength we need,
// because react-phone-input-2 always renders the value in that exact format
// (e.g. "+. (...) ...-....", length 17 for US).
// We initialise with the US default so the limit is active from the very first render.
const US_FORMAT_LENGTH = 17;

const PhoneNumberInput = ({
  value,
  setValue,
  disabled = false,
  onCountryChange,
  onboarding = false,
  placeholder,
}: {
  value: any;
  disabled?: boolean;
  setValue: any;
  onCountryChange?: (countryData: any) => void;
  onboarding?: boolean;
  placeholder?: string;
}) => {
  const [formatMaxLength, setFormatMaxLength] = useState<number>(US_FORMAT_LENGTH);

  return (
    <div className="w-full min-w-0">
      <PhoneInput
        containerClass="balanzify-phone-input"
        disabled={disabled}
        inputProps={{
          name: "phone",
          required: true,
          autoFocus: false,
          // Browser-level enforcement: no extra character can ever be entered
          // regardless of typing, paste, or autofill.
          maxLength: formatMaxLength,
          placeholder: onboarding ? placeholder ?? "Enter phone number" : undefined,
        }}
        isValid={(inputValue: string, country: any) => {
          const max = getMaxDigits(country);
          if (!inputValue || max === undefined) return true;
          return inputValue.length <= max;
        }}
        inputStyle={
          onboarding
            ? {
                height: "56px",
                background: "rgba(249, 249, 249, 0.44)",
                borderColor: "#ffffff",
                borderWidth: 1,
                borderRadius: 8,
                width: "100%",
                cursor: disabled ? "default" : "",
              }
            : {
                height: "44px",
                background: "transparent",
                borderColor: "#d1d5db",
                width: "100%",
                cursor: disabled ? "default" : "",
              }
        }
        inputClass={
          onboarding
            ? "!h-14 !rounded-lg !border !border-white !bg-[#F9F9F970] !pl-[6.75rem] !pr-4 text-gray-900 outline-none !placeholder:text-[#525151] focus-visible:!border-white focus-visible:!ring-1 focus-visible:!ring-white/70"
            : "rounded-md border border-gray-300 py-2.5 pl-[6.75rem] pr-4 outline-none focus:border-accent_soft_black"
        }
        country={"us"}
        buttonStyle={
          onboarding
            ? {
                background: "rgba(249, 249, 249, 0.44)",
                borderColor: "#ffffff",
                borderRadius: "8px 0 0 8px",
              }
            : {
                background: "transparent",
                borderColor: "#d1d5db",
              }
        }
        value={value}
        onChange={(phoneValue, countryData: any) => {
          // Sync maxLength with the newly selected country's format on every change
          if (countryData?.format) {
            setFormatMaxLength(countryData.format.length);
          }
          // Secondary digit-count cap as a fallback (e.g. programmatic value sets)
          const max = getMaxDigits(countryData);
          const capped =
            max !== undefined && phoneValue.length > max
              ? phoneValue.slice(0, max)
              : phoneValue;
          setValue(`+${capped}`);
          onCountryChange && onCountryChange(countryData);
        }}
        enableSearch={true}
        disableSearchIcon={true}
      />
    </div>
  );
};

export default PhoneNumberInput;
