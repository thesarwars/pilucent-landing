import React, { FormEvent, use, useEffect, useState } from "react";
import PayScheduleSelectDropdown from "@/components/ui/ScrollSelectDropDowns/PayScheduleSelectDropdown";
import SmoothCheckbox from "@/components/ui/SmoothCheckbox";
import EarningsTable from "./Payroll/EarningsTable";
import DCTable from "./Payroll/DCTable";
import GarnishmentTable from "./Payroll/GarnishmentTable";

const PayrollInfo = ({
  earningsItems,
  setEarningsItems,
  data,
  setData,
  prev,
  next,
  currentStep,
  steps,
  setDCItems,
  dcItems,
  setGarnishItems,
  garnishItems,
}: {
  setDCItems: any;
  dcItems: any[];
  setGarnishItems: any;
  garnishItems: any[];
  earningsItems: any;
  setEarningsItems: any;
  data: any;
  setData: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  return (
    <form onSubmit={handleSubmit} className="text-sm">
      {/* Pay Schedule */}
      <div className="mb-4 flex w-full items-start justify-between gap-12 rounded-lg bg-white p-6">
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <label className="text-accent_soft_black">Pay Schedule</label>
              <PayScheduleSelectDropdown
                value={data.pay_schedule_uid}
                setValue={(v: any) => {
                  setData({ ...data, pay_schedule_uid: v });
                }}
                ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            {/* Pay Type */}
            <div className="flex items-center space-x-2">
              <label className="text-accent_soft_black">Pay Type</label>

              <select
                value={data.pay_kind}
                onChange={(e: any) => {
                  setData({ ...data, pay_kind: e.target.value });
                }}
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                <option value="">Select</option>
                <option value="SALARY">Salary</option>
                <option value="HOURLY">Hourly</option>
                <option value="COMMISSION">Commission only</option>
              </select>
            </div>
          </div>
          {/* monthly pay type */}
          {data.pay_kind === "SALARY" && (
            <div className="mt-7 flex flex-col gap-4">
              <hr />
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="payFrequency"
                  className="text-accent_soft_black"
                >
                  Frequency
                </label>
                <select
                  value={data.salary_frequency}
                  onChange={(e: any) => {
                    setData({ ...data, salary_frequency: e.target.value });
                  }}
                  style={{ borderBottom: "1px solid #d1d5db" }}
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                >
                  <option value="">Select</option>
                  <option value="PER_YEAR">Per year</option>
                  <option value="PER_MONTH">Per Month</option>
                  <option value="PER_WEEK">Per Week</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="salary" className="text-accent_soft_black">
                  Salary
                </label>
                <input
                  type="number"
                  value={data.total_salary}
                  onChange={(e: any) => {
                    setData({ ...data, total_salary: e.target.value });
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
              </div>
            </div>
          )}

          {/* hourly pay type */}
          {data.pay_kind === "HOURLY" && (
            <>
              <hr className="my-7" />
              <div className="my-4 flex items-center justify-between">
                <div className="flex w-full items-center space-x-2">
                  <label
                    htmlFor="hoursPerDay"
                    className="text-accent_soft_black"
                  >
                    Rate Per Hour
                  </label>
                  <input
                    type="number"
                    value={data.total_rate_per_hour}
                    onChange={(e: any) => {
                      setData({ ...data, total_rate_per_hour: e.target.value });
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </div>
              </div>
            </>
          )}

          {/* commission pay type */}
          {data.pay_kind && data.pay_kind !== "COMMISSION" && (
            <div className="mb-4 mt-7 flex flex-col justify-between gap-4">
              <hr />
              <div className="my-b mt-5 w-full">
                <p className="text-base text-accent_soft_black">
                  Set Working hours/day
                </p>
              </div>
              {/* Hours per Day */}
              <div className="flex items-center space-x-2">
                <label htmlFor="hoursPerDay" className="text-accent_soft_black">
                  Hours per day
                </label>
                <input
                  max={16}
                  type="number"
                  value={data.total_hour_per_day}
                  onChange={(e: any) => {
                    setData({ ...data, total_hour_per_day: e.target.value });
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
              </div>

              {/* Day of Week */}
              <div className="flex items-center space-x-2">
                <label htmlFor="dayOfWeek" className="text-accent_soft_black">
                  Days Per Week
                </label>
                <input
                  max={7}
                  type="number"
                  value={data.total_day_per_week}
                  onChange={(e: any) => {
                    setData({ ...data, total_day_per_week: e.target.value });
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
              </div>
            </div>
          )}
        </div>

        {/* Overtime Options */}
        <div className="flex flex-1 flex-wrap items-center gap-7">
          <div className="flex items-center gap-2">
            <SmoothCheckbox
              htmlFor="over_time"
              onCheckedChange={(c) => {
                setData({ ...data, is_over_time: c });
              }}
              checked={data.is_over_time}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="over_time" className="mb-1 text-sm">
              Over time
            </label>
          </div>
          <div className="flex items-center gap-2">
            <SmoothCheckbox
              htmlFor="d_over_time"
              onCheckedChange={(c) => {
                setData({ ...data, is_double_over_time_pay: c });
              }}
              checked={data.is_double_over_time_pay}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="d_over_time" className="mb-1 text-sm">
              Double over time pay
            </label>
          </div>
          <div className="flex items-center gap-2">
            <SmoothCheckbox
              htmlFor="holiday_pay"
              onCheckedChange={(c) => {
                setData({ ...data, is_holiday_pay: c });
              }}
              checked={data.is_holiday_pay}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="holiday_pay" className="mb-1 text-sm">
              Holiday pay
            </label>
          </div>
          <div className="flex items-center gap-2">
            <SmoothCheckbox
              htmlFor="bonus"
              onCheckedChange={(c) => {
                setData({ ...data, is_bonus: c });
              }}
              checked={data.is_bonus}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="bonus" className="mb-1 text-sm">
              Bonus
            </label>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <EarningsTable
        earningItems={earningsItems}
        setEarningsItems={setEarningsItems}
      />
      {/* Deduction & Contribution */}
      <DCTable dcItems={dcItems} setDCItems={setDCItems} />

      {/* Garnishment */}
      <GarnishmentTable
        garnishItems={garnishItems}
        setGarnishItems={setGarnishItems}
      />
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
//payrollInfo

export default PayrollInfo;
