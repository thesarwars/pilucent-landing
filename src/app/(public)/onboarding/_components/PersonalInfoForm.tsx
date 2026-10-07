import Button from "@/components/ui/RawButton";
import Image from "next/image";
import React, { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import {
  onboardingNativeSelectClassName as nativeSelectClassName,
  onboardingSelectEmptyTextClass,
  onboardingTextInputClassName as textInputClassName,
} from "./onboardingInputStyles";
import {
  fieldErrorClass,
  formatSSN,
  requiredTextError,
  ssnFieldError,
} from "./onboardingFormUtils";

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function ReqOpt({ required }: { required: boolean }) {
  return (
    <span className="ml-1 text-xs font-normal text-gray-500">
      ({required ? "Required" : "Optional"})
    </span>
  );
}

const PersonalInfo = ({
  data,
  setData,
  prev,
  next,
  currentStep,
  steps,
}: {
  data: any;
  setData: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const markBlur = (key: string) =>
    setBlurred((b) => ({ ...b, [key]: true }));

  const show = (key: string) => blurred[key] || showAllErrors;

  const errors = useMemo(() => {
    return {
      first_name: requiredTextError(data?.first_name),
      last_name: requiredTextError(data?.last_name),
      gender: !(data?.gender ?? "").trim() ? "This field is required." : null,
      date_of_birth: !(data?.date_of_birth ?? "").trim()
        ? "This field is required."
        : null,
      ssn: ssnFieldError(data?.ssn),
    };
  }, [data]);

  const personalComplete =
    !errors.first_name &&
    !errors.last_name &&
    !errors.gender &&
    !errors.date_of_birth &&
    !errors.ssn;

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    setShowAllErrors(true);
    if (!personalComplete) return;
    next();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setData({ ...data, image: files[0] });
    }
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const inputClass = (key: string, err: string | null) =>
    `${textInputClassName} ${show(key) && err ? fieldErrorClass : ""}`;

  return (
    <form onSubmit={handleNext} className="mx-auto text-sm" noValidate>
      <div className="mt-4 flex flex-col gap-2 rounded-3xl border border-white bg-[#FFFFFF66] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-lg text-accent_soft_black">
            Profile Image
            <ReqOpt required={false} />
          </label>
          {!!(imageSrc || data?.image) && (
            <span className="text-sm font-medium text-emerald-600">✓ Saved</span>
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
                setData({ ...data, image: "" });
              }}
              type="button"
              className="p-1"
            >
              <BiTrash className="text-xl text-red-500" />
            </Button>
          </div>
        </div>
      </div>
      <div className="my-4 rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-medium">Personal Details</h1>
          {personalComplete && (
            <span className="text-sm font-medium text-emerald-600">✓ Saved</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              First Name
              <ReqOpt required />
            </label>
            <input
              type="text"
              value={data?.first_name}
              onChange={(e) => setData({ ...data, first_name: e.target.value })}
              onBlur={() => markBlur("first_name")}
              maxLength={20}
              placeholder="Enter first name"
              className={inputClass("first_name", errors.first_name)}
            />
            <FieldError
              message={show("first_name") ? errors.first_name : null}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Middle Name
              <ReqOpt required={false} />
            </label>
            <input
              type="text"
              value={data?.middle_name}
              onChange={(e) =>
                setData({ ...data, middle_name: e.target.value })
              }
              maxLength={20}
              placeholder="Enter middle name"
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Last Name
              <ReqOpt required />
            </label>
            <input
              maxLength={20}
              type="text"
              value={data?.last_name}
              onChange={(e) => setData({ ...data, last_name: e.target.value })}
              onBlur={() => markBlur("last_name")}
              placeholder="Enter last name"
              className={inputClass("last_name", errors.last_name)}
            />
            <FieldError message={show("last_name") ? errors.last_name : null} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Gender
              <ReqOpt required />
            </label>
            <select
              value={data?.gender ?? ""}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              onBlur={() => markBlur("gender")}
              className={`${nativeSelectClassName} ${!data?.gender ? onboardingSelectEmptyTextClass : ""} ${show("gender") && errors.gender ? fieldErrorClass : ""}`}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHERS">Others</option>
            </select>
            <FieldError message={show("gender") ? errors.gender : null} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Salutation
              <ReqOpt required={false} />
            </label>
            <input
              value={data?.salutation}
              onChange={(e) => setData({ ...data, salutation: e.target.value })}
              type="text"
              maxLength={40}
              placeholder="e.g. Mr., Ms., Dr."
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Date of birth
              <ReqOpt required />
            </label>
            <input
              value={data?.date_of_birth}
              onChange={(e) =>
                setData({ ...data, date_of_birth: e.target.value })
              }
              onBlur={() => markBlur("date_of_birth")}
              type="date"
              placeholder="Select date of birth"
              className={inputClass("date_of_birth", errors.date_of_birth)}
            />
            <FieldError
              message={show("date_of_birth") ? errors.date_of_birth : null}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              SSN
              <ReqOpt required={false} />
            </label>
            <input
              value={data?.ssn ?? ""}
              onChange={(e) =>
                setData({ ...data, ssn: formatSSN(e.target.value) })
              }
              onBlur={() => markBlur("ssn")}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              placeholder="XXX-XX-XXXX"
              className={`${textInputClassName} ${errors.ssn ? fieldErrorClass : ""}`}
            />
            <FieldError message={errors.ssn} />
          </div>
        </div>
      </div>

      {/* {!personalComplete && (
        <p className="mt-2 text-center text-xs text-gray-600">
          Complete all required fields and fix any highlighted errors to continue.
        </p>
      )} */}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={currentStep === 1}
          className={`rounded-md border px-6 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
              : "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
          } `}
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={!personalComplete}
          className={`rounded-md px-6 py-2 text-white ${
            personalComplete
              ? "bg-[#02143A] hover:opacity-95"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </form>
  );
};

export default PersonalInfo;
