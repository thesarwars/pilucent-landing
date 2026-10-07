import React, { Dispatch, SetStateAction, useState } from "react";
import BoxWrapper from "./BoxWrapper";
import PhoneInput from "react-phone-input-2";
import "./PhoneInput.module.css";
import URLInput from "@/app/company/_components/URLInput";
import { toast } from "@/lib/ToastService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

const textInputClassName =
  "h-14 w-full rounded-lg border border-white bg-[#F9F9F970] px-4 text-gray-900 outline-none placeholder:text-[#525151] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70";

const fieldErrorClass = "border-red-500 ring-1 ring-red-500/30";

type ContactInfoProps = {
  setStep?: Dispatch<SetStateAction<number>>;
  companyData: any;
  setCompanyData: any;
};
const ContactInfo = ({
  setStep,
  companyData,
  setCompanyData,
}: ContactInfoProps) => {
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });

  const validateEmail = (email: string): string => {
    if (!email || email.trim() === "") {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required";
    }
    const digitsOnly = phone.replace(/[+\s-]/g, "");
    if (digitsOnly.length < 10) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const handleEmailBlur = () => {
    const emailError = validateEmail(companyData.email);
    setErrors((prev) => ({ ...prev, email: emailError }));
  };

  const handlePhoneBlur = () => {
    const phoneError = validatePhone(companyData.phone);
    setErrors((prev) => ({ ...prev, phone: phoneError }));
  };

  const handleNext = () => {
    const emailError = validateEmail(companyData?.email);
    const phoneError = validatePhone(companyData?.phone);

    if (emailError || phoneError) {
      setErrors({
        email: emailError,
        phone: phoneError,
      });
      if (emailError) {
        toast.error(emailError);
      } else if (phoneError) {
        toast.error(phoneError);
      }
      return;
    }

    setErrors({
      email: "",
      phone: "",
    });
    setStep && setStep(3);
  };

  return (
    <div className="">
      <BoxWrapper className="flex flex-col">
        <h4 className="mb-4 text-xl font-medium">Contact Information</h4>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_email"
              required={true}
              tooltip="Enter your company's primary email address for official communications."
            >
              Company Email
            </TooltipLabel>
            <input
              id="company_email"
              placeholder="info@atrai.com"
              type="email"
              className={`${textInputClassName} ${errors?.email ? fieldErrorClass : ""}`}
              maxLength={254}
              value={companyData.email}
              onChange={(e) => {
                setCompanyData({ ...companyData, email: e.target.value });
                setErrors({ ...errors, email: "" });
              }}
              onBlur={handleEmailBlur}
            />
            {errors?.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_phone"
              required={true}
              tooltip="Enter your company's primary contact phone number."
            >
              Company Phone
            </TooltipLabel>
            <PhoneInput
              inputProps={{
                name: "phone",
                required: true,
                autoFocus: true,
                onBlur: handlePhoneBlur,
              }}
              isValid={false}
              inputStyle={{
                height: "56px",
                background: "rgba(249,249,249,0.44)",
                borderColor: errors?.phone
                  ? "rgb(239,68,68)"
                  : "rgba(255,255,255,0.8)",
                width: "100%",
                borderRadius: "8px",
              }}
              country={"us"}
              buttonStyle={{
                background: "transparent",
                borderColor: "rgba(255,255,255,0.8)",
                borderRadius: "8px 0 0 8px",
              }}
              value={companyData.phone}
              onChange={(value) => {
                setCompanyData((prev: any) => ({
                  ...prev,
                  phone: `+${value}`,
                }));
                setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              enableSearch={true}
              disableSearchIcon={true}
            />
            {errors?.phone && (
              <span className="text-xs text-red-500">{errors.phone}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_website"
              tooltip="Enter your company's website URL for invoices and documents."
            >
              Website
            </TooltipLabel>
            <URLInput
              value={companyData?.website}
              setValue={(e: any) =>
                setCompanyData({ ...companyData, website: e })
              }
            />
          </div>
        </div>
      </BoxWrapper>

      {setStep && (
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-md border border-indigo-600 bg-white px-6 py-2 text-indigo-600 hover:bg-indigo-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-[#02143A] px-6 py-2 text-white hover:opacity-95"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactInfo;

interface TooltipLabelProps {
  children: React.ReactNode;
  tooltip: string;
  required?: boolean;
  htmlFor?: string;
}

const TooltipLabel = ({
  children,
  tooltip,
  required = false,
  htmlFor,
}: TooltipLabelProps) => {
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-accent_soft_black">
        {children}
        {required && (
          <span className="ml-1 text-xs font-normal text-gray-500">
            (Required)
          </span>
        )}
        {!required && (
          <span className="ml-1 text-xs font-normal text-gray-500">
            (Optional)
          </span>
        )}
      </label>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-1 text-accent_soft_black transition-colors hover:bg-gray-200"
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xs rounded-lg border bg-white px-2 py-2 text-sm text-white shadow-lg"
          sideOffset={5}
        >
          <div className="flex items-start gap-2">
            <InfoIcon color="#000" className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-left text-[13px] font-light leading-relaxed text-accent_soft_black">
              {tooltip}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
