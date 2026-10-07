import { USStates } from "@/lib/helpers/UsaStates";
import React, { FormEvent } from "react";
import {
  onboardingNativeSelectClassName as nativeSelectClassName,
  onboardingSelectEmptyTextClass,
  onboardingTextInputClassName as textInputClassName,
} from "./onboardingInputStyles";
const holdingChoices = [
  {
    title: "Single Or Married Filing Separatley",
    value: "SINGLE_OR_MARRIED_FILING_SEPARATLEY",
  },
  {
    title: "Married Filing Jointly Or Qualifying Widow",
    value: "MARRIED_FILING_JOINTLY_OR_QUALIYING_WIDOW",
  },
  {
    title: "Head Of Houshold",
    value: "HEAD_OF_HOUSHOLD",
  },
  {
    title: "Exempt",
    value: "EXEMPT",
  },
];

const TaxInfo = ({
  setStateTaxInfo,
  stateTaxInfo,
  setFederalTaxInfo,
  federalTaxInfo,
  prev,
  next,
  currentStep,
  steps,
  onSkipForNow,
  onTaxInteraction,
}: {
  setStateTaxInfo: any;
  stateTaxInfo: any;
  setFederalTaxInfo: any;
  federalTaxInfo: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
  onSkipForNow?: () => void;
  onTaxInteraction?: () => void;
}) => {
  const handleNext = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleNext}
      onInput={() => onTaxInteraction?.()}
      className="text-sm"
    >
      <div className="rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <h1 className="mb-2 text-xl font-medium">State other Income Tax</h1>
        <p className="my-2 mb-4 text-[13px]">
          All employees must complete a{" "}
          <a
            target="_blank"
            href="https://www.irs.gov/pub/irs-pdf/fw4.pdf"
            className="border-b border-accent_soft_blue text-accent_soft_blue"
          >
            W4 Form
          </a>
          . This help ua calculate how much money to withhold from their
          paycheck for federal income taxes.
        </p>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              State where the employee lives{" "}
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={stateTaxInfo.state}
              onChange={(e) =>
                setStateTaxInfo({ ...stateTaxInfo, state: e.target.value })
              }
              className={`${nativeSelectClassName} ${!stateTaxInfo.state ? onboardingSelectEmptyTextClass : ""}`}
            >
              <option value="">Select</option>
              {USStates?.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Marital Status
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={stateTaxInfo.martial_status}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  martial_status: e.target.value,
                })
              }
              className={`${nativeSelectClassName} ${!stateTaxInfo.martial_status ? onboardingSelectEmptyTextClass : ""}`}
            >
              <option value="">Select</option>
              <option value="MARRIED">Married</option>
              <option value="UN_MARRIED">Unmarried</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Total number of allowances (box f)
            </label>
            <input
              maxLength={40}
              value={stateTaxInfo.total_allowance}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  total_allowance: e.target.value,
                })
              }
              type="number"
              className={textInputClassName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Additional with holding (Line 2)
            </label>
            <input
              maxLength={40}
              value={stateTaxInfo.additional_with_holdings}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  additional_with_holdings: e.target.value,
                })
              }
              type="text"
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Amount</label>
            <input
              maxLength={40}
              type="number"
              value={stateTaxInfo.total}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  total: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Exempt from with holding (section 2){" "}
              <span className="text-base text-red-500">*</span>
            </label>

            <select
              value={stateTaxInfo.exempt}
              onChange={(e) =>
                setStateTaxInfo({ ...stateTaxInfo, exempt: e.target.value })
              }
              className={`${nativeSelectClassName} ${!stateTaxInfo.exempt ? onboardingSelectEmptyTextClass : ""}`}
              required
            >
              <option value="">Select</option>
              <option value="EXEMPT">Exempt</option>
              <option value="NOT_EXEMPT">Not Exempt</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Does the employees work in the state where the lives?
            </label>
            <select
              value={stateTaxInfo.is_the_employee_work_in_the_state_where_live}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  is_the_employee_work_in_the_state_where_live: e.target.value,
                })
              }
              className={nativeSelectClassName}
              required
            >
              <option value={"true"}>YES</option>
              <option value={"false"}>NO</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Is this employee exempt from any state taxes
            </label>
            <select
              value={stateTaxInfo.is_the_employee_exempt_from_any_state_taxes}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  is_the_employee_exempt_from_any_state_taxes: e.target.value,
                })
              }
              className={nativeSelectClassName}
              required
            >
              <option value={"true"}>YES</option>
              <option value={"false"}>NO</option>
            </select>
          </div>
        </div>
      </div>

      {/* federal */}
      <div className="mt-7 rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <h1 className="mb-2 text-xl font-medium">Federal With Holdings</h1>
        <p className="my-2 mb-4 text-[13px]">
          All employees must complete a{" "}
          <a
            target="_blank"
            href="https://www.irs.gov/pub/irs-pdf/fw4.pdf"
            className="border-b border-accent_soft_blue text-accent_soft_blue"
          >
            W4 Form
          </a>
          . This help ua calculate how much money to withhold from their
          paycheck for federal income taxes.
        </p>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Which W-4 does employee have
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={federalTaxInfo.employee_W_4_kind}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  employee_W_4_kind: e.target.value,
                })
              }
              className={nativeSelectClassName}
              required
            >
              <option value={"YEAR_2019_OR_EARLY"}>Year 2019 Or Earlier</option>
              <option value={"YEAR_2020_OR_LETTER"}>Year 2020 Or Later</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              With holding status(Step 1C)
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={federalTaxInfo.holding_status}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  holding_status: e.target.value,
                })
              }
              className={`${nativeSelectClassName} ${!federalTaxInfo.holding_status ? onboardingSelectEmptyTextClass : ""}`}
              required
            >
              <option value={""}>Select</option>
              {holdingChoices?.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Multiple jobs or spouse works (step 2c){" "}
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={federalTaxInfo.is_multiple_jobs_or_spouse_works}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  is_multiple_jobs_or_spouse_works: e.target.value,
                })
              }
              className={nativeSelectClassName}
              required
            >
              <option value={"true"}>YES</option>
              <option value={"false"}>NO</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Claim depends(Step 3)
            </label>
            <input
              maxLength={40}
              type="text"
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Other Income Amount(Step 4a)
            </label>
            <input
              maxLength={40}
              type="number"
              value={federalTaxInfo.total_other_income}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  total_other_income: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Deductions(step 4b)
            </label>
            <input
              maxLength={40}
              type="number"
              value={federalTaxInfo.deduction}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  deduction: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Extra with holding (step 4c)
            </label>
            <input
              maxLength={40}
              type="number"
              value={federalTaxInfo.extra_with_holding}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  extra_with_holding: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Exempt from with holding
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={40}
              type="text"
              value={federalTaxInfo.exempt_from_with_holding}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  exempt_from_with_holding: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Is this employee exempt from federal tax
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={federalTaxInfo.is_employee_exempt_from_federal_tax}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  is_employee_exempt_from_federal_tax: e.target.value,
                })
              }
              className={nativeSelectClassName}
              required
            >
              <option value={"false"}>NO</option>
              <option value={"true"}>YES</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-2">
          {onSkipForNow && (
            <button
              type="button"
              onClick={onSkipForNow}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          )}
          <button
            type="submit"
            onClick={next}
            className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaxInfo;
