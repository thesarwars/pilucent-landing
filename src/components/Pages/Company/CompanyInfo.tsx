import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import BoxWrapper from "./BoxWrapper";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";
import { industries } from "@/lib/helpers/companyChoices";
import TimezoneSelect from "react-timezone-select";
import "react-phone-input-2/lib/style.css";
import { toast } from "@/lib/ToastService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import Button from "@/components/ui/RawButton";

const textInputClassName =
  "h-14 w-full rounded-lg border border-white bg-[#F9F9F970] px-4 text-gray-900 outline-none placeholder:text-[#525151] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70";

const selectClassName =
  "h-14 w-full cursor-pointer appearance-none [-webkit-appearance:none] rounded-lg border border-white bg-[#F9F9F970] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat px-4 py-0 pr-10 text-sm leading-[3.5rem] text-gray-900 outline-none [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%2302143A%22%20d%3D%22M12%2015.4L6%209h12z%22/%3E%3C/svg%3E')] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70";

const fieldErrorClass = "border-red-500 ring-1 ring-red-500/30";

type CompanyInfoProps = {
  setStep?: Dispatch<SetStateAction<number>>;
  companyData: any;
  setCompanyData: any;
  imageSrc: any;
  setImageSrc: any;
};

const CompanyInfo = ({
  setStep,
  companyData,
  setCompanyData,
  imageSrc,
  setImageSrc,
}: CompanyInfoProps) => {
  const [errors, setErrors] = useState({
    name: '',
  });

  const validateCompanyName = (name: string): string => {
    if (!name || name.trim() === '') {
      return 'Company name is required';
    }

    if (name.trim().length < 2) {
      return 'Company name must be at least 2 characters';
    }
    return '';
  };

  const handleNameBlur = () => {
    const nameError = validateCompanyName(companyData.name);
    setErrors((prev) => ({ ...prev, name: nameError }));
  };

  const handleNextClick = () => {
    const nameError = validateCompanyName(companyData?.name);
    if (nameError) {
      setErrors({ name: nameError });
      toast.error(nameError);
      return;
    }

    setErrors({ name: '' });
    setStep && setStep(2);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCompanyData({ ...companyData, logo: files[0] });
    }
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="">
      <BoxWrapper className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-lg text-accent_soft_black">
            Company Logo
            <span className="ml-1 text-xs font-normal text-gray-500">
              (Optional)
            </span>
          </label>
          {!!(imageSrc || companyData?.logo) && (
            <span className="text-sm font-medium text-emerald-600">
              ✓ Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-24 w-24 rounded-full bg-[#D9D9D9]">
            {imageSrc && (
              <Image
                src={imageSrc}
                width={93}
                height={85}
                alt="avatar"
                className="h-full w-full rounded-full object-cover"
              />
            )}
          </div>

          <div className="flex items-center">
            <input
              id="picture-upload"
              type="file"
              accept="image/*"
              className="hidden overflow-hidden"
              onChange={handleImageChange}
            />
            <label htmlFor="picture-upload">
              <FiEdit className="ml-4 mr-2 cursor-pointer text-xl text-gray-700" />
            </label>
            <Button
              onClick={() => {
                setImageSrc("");
                setCompanyData({ ...companyData, logo: "" });
              }}
              type="button"
              className="p-1"
            >
              <BiTrash className="text-xl text-red-500" />
            </Button>
          </div>
        </div>
      </BoxWrapper>

      <BoxWrapper className="flex flex-col">
        <h4 className="mb-4 text-xl font-medium">Company Information</h4>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_name"
              required={true}
              tooltip="Enter your official company name as it appears in legal documents."
            >
              Company Name
            </TooltipLabel>
            <input
              id="company_name"
              maxLength={20}
              type="text"
              value={companyData.name}
              onChange={(e) => {
                setCompanyData({ ...companyData, name: e.target.value });
                setErrors({ ...errors, name: "" });
              }}
              placeholder="ABCD Company"
              onBlur={handleNameBlur}
              required
              className={`${textInputClassName} ${errors?.name ? fieldErrorClass : ""}`}
            />
            {errors?.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="legal_name"
              tooltip="The legal name of your company as registered with government authorities."
            >
              Legal Name
            </TooltipLabel>
            <input
              name="legalName"
              id="legal_name"
              placeholder="Same as company name"
              value={companyData?.legal_name}
              maxLength={100}
              onChange={(e) =>
                setCompanyData({ ...companyData, legal_name: e.target.value })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_type"
              required={true}
              tooltip="Select the industry or business type that best describes your company."
            >
              Company Type
            </TooltipLabel>
            <select
              id="company_type"
              value={companyData?.kind}
              onChange={(e) =>
                setCompanyData({ ...companyData, kind: e.target.value })
              }
              className={selectClassName}
            >
              {industries?.map((industry) => (
                <option key={industry?.value} value={industry?.value}>
                  {industry?.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="business_id"
              tooltip="Your company's business identification number assigned by the government."
            >
              Business ID No.
            </TooltipLabel>
            <input
              name="businessId"
              id="business_id"
              placeholder="Business ID No."
              value={companyData?.business_id_no}
              maxLength={100}
              onChange={(e) =>
                setCompanyData({
                  ...companyData,
                  business_id_no: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="vat_number"
              tooltip="Your company's Value Added Tax (VAT) registration number."
            >
              VAT #
            </TooltipLabel>
            <input
              name="vatNumber"
              id="vat_number"
              placeholder="VAT Number"
              className={textInputClassName}
              value={companyData.vat_number}
              onChange={(e) =>
                setCompanyData({ ...companyData, vat_number: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="time_zone"
              tooltip="Select your company's primary time zone for scheduling and operations."
            >
              Time Zone
            </TooltipLabel>
            <div className="select-wrapper">
              <TimezoneSelect
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderColor: "rgba(255,255,255,0.8)",
                    borderRadius: "8px",
                    height: "56px",
                    background: "rgba(249,249,249,0.44)",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.9)",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
                value={companyData?.time_zone}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    time_zone: JSON.stringify(e),
                  })
                }
              />
            </div>
          </div>
        </div>
      </BoxWrapper>

      {setStep && (
        <div className="mt-8 flex justify-between">
          <div />
          <button
            type="button"
            onClick={handleNextClick}
            className="rounded-md bg-[#02143A] px-6 py-2 text-white hover:opacity-95"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyInfo;

interface TooltipLabelProps {
  children: React.ReactNode;
  tooltip: string;
  required?: boolean;
  htmlFor?: string;
}

const TooltipLabel = ({ children, tooltip, required = false, htmlFor }: TooltipLabelProps) => {
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
