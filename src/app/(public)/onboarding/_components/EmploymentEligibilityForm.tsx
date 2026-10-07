"use client";

import { countryList } from "@/lib/helpers/Customer";
import React, { FormEvent, useMemo, useState } from "react";
import {
  employmentI9FieldErrors,
  fieldErrorClass,
} from "./onboardingFormUtils";
import {
  onboardingSelectEmptyTextClass,
  onboardingTextInputClassName as onboardingInputClass,
} from "./onboardingInputStyles";

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

const EmploymentEligibilityForm = ({
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
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const markBlur = (key: string) =>
    setBlurred((b) => ({ ...b, [key]: true }));

  const show = (key: string) => blurred[key] || showAllErrors;

  const i9Errors = useMemo(() => employmentI9FieldErrors(data), [data]);

  const i9Valid = useMemo(
    () => Object.values(i9Errors).every((v) => !v),
    [i9Errors],
  );

  const handleNextNonI9 = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  const handleNextI9 = (e: FormEvent) => {
    e.preventDefault();
    setShowAllErrors(true);
    if (!i9Valid) return;
    next();
  };

  const inputClass = (key: string, err: string | null | undefined) =>
    `${onboardingInputClass} ${show(key) && err ? fieldErrorClass : ""}`;

  if (data?.on_boarding_kind != "SELF_ONBOARD_WITH_I9") {
    return (
      <form
        onSubmit={handleNextNonI9}
        className="flex flex-col text-sm"
        noValidate
      >
        <p className="mb-2 text-lg text-gray-900">
          You are not eligible for I9. Click next or continue.
          <br />
          <a
            href="#"
            className="text-sm text-indigo-500 hover:text-indigo-700"
          >
            Learn more about Form I-9
          </a>
        </p>
        <p className="mb-4 text-sm text-gray-700">
          I am aware that federal law provides for imprisonment and/or fines for
          false statements or use of false documents in connection with the
          completion of this form.
          <br />I attest, under penalty of perjury, that information, including
          my selection of the box attesting to my citizenship or immigration
          status, is true and correct.
        </p>
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
            className="rounded-md bg-[#02143A] px-6 py-2 text-white hover:opacity-95"
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleNextI9}
      className="rounded-lg bg-white/60 p-6 text-sm"
      noValidate
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">
          Lets verify your employment eligibility
        </h2>
        {i9Valid && (
          <span className="text-sm font-medium text-emerald-600">✓ Saved</span>
        )}
      </div>

      <p className="mb-2 text-sm text-gray-700">
        This info will be used to complete Form I-9.{" "}
        <a href="#" className="text-indigo-500 hover:text-indigo-700">
          Learn more about Form I-9
        </a>
      </p>
      <p className="mb-4 text-sm text-gray-700">
        I am aware that federal law provides for imprisonment and/or fines for
        false statements or use of false documents in connection with the
        completion of this form.
        <br />I attest, under penalty of perjury, that information, including my
        selection of the box attesting to my citizenship or immigration status,
        is true and correct.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="mb-2 w-full min-w-0 lg:max-w-md">
          <label
            htmlFor="citizenship"
            className="mb-1 block text-accent_soft_black"
          >
            Citizenship / immigration status
            <ReqOpt required />
          </label>
          <select
            id="citizenship"
            name="citizenship"
            value={data?.citizenship_kind ?? ""}
            onChange={(e) =>
              setData({ ...data, citizenship_kind: e.target.value })
            }
            onBlur={() => markBlur("citizenship_kind")}
            className={`w-full max-w-sm py-2.5 px-5 ${!data?.citizenship_kind ? onboardingSelectEmptyTextClass : ""} ${show("citizenship_kind") && i9Errors.citizenship_kind ? fieldErrorClass : ""}`}
          >
            <option value="">Select Option</option>
            <option value="US_CITIZEN">US citizen</option>
            <option value="LAWFUL_RESIDENT">Lawful permanent resident</option>
            <option value="NONCITIZEN_OF_USA">Noncitizen nation of the U.S</option>
            <option value="OTHER">Other</option>
          </select>
          <FieldError
            message={
              show("citizenship_kind") ? i9Errors.citizenship_kind : null
            }
          />
        </div>

        {data?.citizenship_kind == "LAWFUL_RESIDENT" && (
          <div className="w-full min-w-0 flex-1 lg:max-w-xl">
            <label className="mb-1 block text-accent_soft_black">
              USCIS/Alien Registration Number
              <ReqOpt required />
            </label>
            <input
              type="text"
              value={data?.uscis_or_alien_registration_number ?? ""}
              placeholder="Registration Number"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setData({
                  ...data,
                  uscis_or_alien_registration_number: e.target.value,
                })
              }
              onBlur={() => markBlur("uscis_lr")}
              className={inputClass("uscis_lr", i9Errors.uscis_lr)}
            />
            <FieldError
              message={show("uscis_lr") ? i9Errors.uscis_lr ?? null : null}
            />
          </div>
        )}

        {data?.citizenship_kind == "OTHER" && (
          <div className="w-full min-w-0 flex-1 space-y-4 lg:max-w-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-accent_soft_black">
                  Authorized to work until
                  <ReqOpt required />
                </label>
                <input
                  value={data.authorized_to_work_until ?? ""}
                  disabled={!!data.authorized_to_work_na}
                  onChange={(e) => {
                    setData({
                      ...data,
                      authorized_to_work_until: e.target.value,
                    });
                  }}
                  onBlur={() => markBlur("authorized_until")}
                  type="date"
                  className={`${onboardingInputClass} ${show("authorized_until") && i9Errors.authorized_until ? fieldErrorClass : ""} ${data.authorized_to_work_na ? "opacity-60" : ""}`}
                />
                <FieldError
                  message={
                    show("authorized_until")
                      ? i9Errors.authorized_until
                      : null
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-8 sm:pt-10">
                <input
                  type="checkbox"
                  id="auth-na"
                  className="h-4 w-4"
                  checked={!!data.authorized_to_work_na}
                  onChange={(e) =>
                    setData({
                      ...data,
                      authorized_to_work_na: e.target.checked,
                      ...(e.target.checked
                        ? { authorized_to_work_until: "" }
                        : {}),
                    })
                  }
                />
                <label htmlFor="auth-na" className="text-accent_soft_black">
                  Not applicable
                  <ReqOpt required={false} />
                </label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-accent_soft_black">
                USCIS/Alien Registration Number
                <ReqOpt required />
              </label>
              <input
                value={data?.uscis_or_alien_registration_number ?? ""}
                placeholder="Registration Number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData({
                    ...data,
                    uscis_or_alien_registration_number: e.target.value,
                  })
                }
                onBlur={() => markBlur("uscis_other")}
                type="text"
                className={inputClass("uscis_other", i9Errors.uscis_other)}
              />
              <FieldError
                message={
                  show("uscis_other") ? i9Errors.uscis_other ?? null : null
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-accent_soft_black">
                From I-94
                <ReqOpt required />
              </label>
              <input
                type="text"
                value={data.from_i_94 ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData({
                    ...data,
                    from_i_94: e.target.value,
                  })
                }
                onBlur={() => markBlur("from_i_94")}
                placeholder="Enter I-94 number"
                className={inputClass("from_i_94", i9Errors.from_i_94)}
              />
              <FieldError
                message={show("from_i_94") ? i9Errors.from_i_94 ?? null : null}
              />
            </div>
            <div>
              <label className="mb-1 block text-accent_soft_black">
                Foreign Passport
                <ReqOpt required={false} />
              </label>
              <input
                value={data?.foreign_passport ?? ""}
                placeholder="Passport Number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setData({
                    ...data,
                    foreign_passport: e.target.value,
                  })
                }
                type="text"
                className={onboardingInputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-accent_soft_black">
                Country
                <ReqOpt required />
              </label>
              <select
                value={data?.country ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setData({
                    ...data,
                    country: e.target.value,
                  })
                }
                onBlur={() => markBlur("country")}
                className={`max-w-sm w-full py-2.5 px-5 ${!data?.country ? onboardingSelectEmptyTextClass : ""} ${show("country") && i9Errors.country ? fieldErrorClass : ""}`}
              >
                <option value="">Select Country</option>
                {countryList.map((country) => (
                  <option key={country.tld} value={country.tld}>
                    {country.country}
                  </option>
                ))}
              </select>
              <FieldError
                message={show("country") ? i9Errors.country : null}
              />
            </div>
          </div>
        )}
      </div>

      <div className="my-5 flex items-center">
        <input
          checked={!!data?.is_included_social_security_number_from_i9}
          onChange={(e) =>
            setData({
              ...data,
              is_included_social_security_number_from_i9: e.target.checked,
            })
          }
          type="checkbox"
          id="includeSSN"
          className="mr-2 h-4 w-4"
        />
        <label htmlFor="includeSSN" className="text-sm">
          Include my Social Security number on Form I-9{" "}
          <span className="text-gray-500">(Optional)</span>
        </label>
      </div>

      <h3 className="mb-2 text-lg font-medium">
        Bring documents on your first day
      </h3>
      <p className="mb-4 text-sm text-gray-700">
        Within 3 business days of starting work for pay, you must present to
        your employer documentation that establishes your identity and
        employment authorization.
      </p>

      <div className="grid gap-4 text-left md:grid-cols-2">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4">
          <h4 className="mb-2 font-semibold text-amber-950">
            Required — present one option
          </h4>
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-800">
            <li>
              <strong>List B + List C:</strong> e.g. driver&apos;s license and
              Social Security card
            </li>
            <li>
              <strong>List A:</strong> U.S. passport or passport card
            </li>
            <li>
              <strong>List A:</strong> Employment authorization document (EAD)
              with photo
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200/90 bg-white/50 p-4">
          <h4 className="mb-2 font-semibold text-gray-700">
            Optional reference
          </h4>
          <p className="text-sm text-gray-600">
            Other combinations may be acceptable. Use the official list only to
            choose additional documents you may voluntarily bring; your
            employer cannot limit you to specific documents from the required
            lists above.
          </p>
          <p className="mt-3 text-sm text-gray-700">
            <a href="#" className="text-indigo-600 hover:text-indigo-800">
              See full list of acceptable documents
            </a>
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-800">
        <strong>ANTI-DISCRIMINATION NOTICE:</strong> All employees can choose
        which acceptable documentation to present for Section 1 of Form I-9.
        Employers cannot ask employees for documentation to verify information
        in Section 1, or specify acceptable documentation employees must present
        for Section number 2 or Supplement B; Reverification and rehire.
        Treating employees differently based on their citizenship, immigration
        status, or national origin may be illegal.
      </p>
      {/* {!i9Valid && (
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
          disabled={!i9Valid}
          className={`rounded-md px-6 py-2 text-white ${
            i9Valid
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

export default EmploymentEligibilityForm;
