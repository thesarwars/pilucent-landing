import SmoothCheckbox from "@/components/ui/SmoothCheckbox";
import React, { FormEvent } from "react";
const EmployeeNoticePeriodChoices = [
  { value: "ONE_DAY", title: "One Day" },
  { value: "FIVE_DAYS", title: "Five Days" },
  { value: "SEVEN_DAYS", title: "Seven Days" },
  { value: "FIFTEEN_DAYS", title: "Fifteen Days" },
  { value: "THIRTY_DAYS", title: "Thirty Days" },
  { value: "FORTY_FIVE_DAYS", title: "Forty-Five Days" },
  { value: "SIXTY_DAYS", title: "Sixty Days" },
  { value: "NINETY_DAYS", title: "Ninety Days" },
];

const JoiningInfo = ({
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
  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  return (
    <form onSubmit={handleNext} className="mx-auto text-sm">
      <div className="rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Hiring Info</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Confirmation Date{" "}
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.confirmation_date}
              onChange={(e) =>
                setData({ ...data, confirmation_date: e.target.value })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Offer Date
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              required
              value={data.offer_date}
              onChange={(e) => setData({ ...data, offer_date: e.target.value })}
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Notice Day</label>
            <select
              value={data.notice_period}
              onChange={(e) =>
                setData({ ...data, notice_period: e.target.value })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select</option>
              {EmployeeNoticePeriodChoices?.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Contract End Date</label>
            <input
              value={data.contract_end_date}
              onChange={(e) =>
                setData({ ...data, contract_end_date: e.target.value })
              }
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
      </div>

      <div className="my-7 rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Terminate</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Terminate Date</label>
            <input
              value={data.terminate_date}
              onChange={(e) =>
                setData({ ...data, terminate_date: e.target.value })
              }
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Last Date Worked</label>
            <input
              type="date"
              value={data.last_date_of_work}
              onChange={(e) =>
                setData({ ...data, last_date_of_work: e.target.value })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Terminate Type</label>
            <select
              value={data.terminate_kind}
              onChange={(e) =>
                setData({ ...data, terminate_kind: e.target.value })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select</option>
              <option value="FULL">Full</option>
              <option value="PARTIALLY">Partially</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Terminate Desc</label>
            <input
              type="text"
              maxLength={40}
              value={data.terminate_description}
              onChange={(e) =>
                setData({ ...data, terminate_description: e.target.value })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
      </div>
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
          //   disabled={currentStep === steps.length}
          className={`rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700`}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </form>
  );
};

export default JoiningInfo;
