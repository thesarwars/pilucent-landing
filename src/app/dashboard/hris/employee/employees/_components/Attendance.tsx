import HolidaySelectDropdown from "@/components/ui/ScrollSelectDropDowns/HolidaySelectDropdown";
import ShiftSelectDropdown from "@/components/ui/ScrollSelectDropDowns/ShiftSelectDropdown";
import React, { FormEvent } from "react";

const Attendance = ({
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
  };

  return (
    <form onSubmit={handleNext} className="text-sm">
      <div className="rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Attendance Info</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Attendance Device ID
            </label>
            <input
              maxLength={40}
              type="text"
              value={data.attendance_device_id}
              onChange={(e) =>
                setData({
                  ...data,
                  attendance_device_id: e.target.value,
                })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Holiday</label>
            <HolidaySelectDropdown
              value={data?.holiday_uid}
              setValue={(v: any) => setData({ ...data, holiday_uid: v })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Shift</label>
            <ShiftSelectDropdown
              value={data?.shift_uid}
              setValue={(value: any) => setData({ ...data, shift_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button
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
          onClick={next}
          //   disabled={currentStep === steps.length}
          className={`rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700`}
        >
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </form>
  );
};

export default Attendance;
