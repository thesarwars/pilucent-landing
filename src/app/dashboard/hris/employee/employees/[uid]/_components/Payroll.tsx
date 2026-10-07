import React, { FormEvent, use, useEffect, useState } from 'react';
import PayScheduleSelectDropdown from '@/components/ui/ScrollSelectDropDowns/PayScheduleSelectDropdown';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import EarningsTable from './Payroll/EarningsTable';
import DCTable from './Payroll/DCTable';
import GarnishmentTable from './Payroll/GarnishmentTable';
import LogoLoader from '@/components/MainLoader/logo-loader';
import { toast } from '@/lib/ToastService';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployeeEarningsItems, patchEmployee } from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { FiEdit } from 'react-icons/fi';

const PayrollInfo = ({
  view = false,
  Employee,
  isPending,
  refetch,
  uid = '',
}: {
  view?: boolean;
  Employee: any;
  isPending?: boolean;
  refetch?: any;
  uid?: string;
}) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [data, setData] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);

  useEffect(() => {
    if (!isPending && Employee) {
      setData({ ...Employee, pay_schedule_uid: Employee?.pay_schedule });
    }
  }, [isPending, Employee, RenderAgain]);

  const UpdateEmployee = async (formData: FormData, preToast = 'Profile image', next: any) => {
    if (!uid) return toast.error('Employee not found!');
    try {
      setIsUpdating(true);
      const res = await patchEmployee(uid, formData);
      if (res?.success) {
        toast.success(`${preToast} updated`);
        refetch && refetch();
        next();
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSavePayrollInfo = () => {
    const formData = new FormData();

    Employee?.pay_schedule?.uid != data?.pay_schedule_uid?.uid &&
      formData.append('pay_schedule_uid', data?.pay_schedule_uid?.uid);
    Employee?.pay_kind != data?.pay_kind && formData.append('pay_kind', data?.pay_kind);
    Employee?.salary_frequency != data?.salary_frequency &&
      formData.append('salary_frequency', data?.salary_frequency);
    Employee?.total_salary != data?.total_salary &&
      formData.append('total_salary', data?.total_salary);
    Employee?.total_rate_per_hour != data?.total_rate_per_hour &&
      formData.append('total_rate_per_hour', data?.total_rate_per_hour);
    Employee?.total_hour_per_day != data?.total_hour_per_day &&
      formData.append('total_hour_per_day', data?.total_hour_per_day);
    Employee?.total_day_per_week != data?.total_day_per_week &&
      formData.append('total_day_per_week', data?.total_day_per_week);
    Employee?.is_over_time != data?.is_over_time &&
      formData.append('is_over_time', data?.is_over_time);
    Employee?.is_double_over_time_pay != data?.is_double_over_time_pay &&
      formData.append('is_double_over_time_pay', data?.is_double_over_time_pay);
    Employee?.is_holiday_pay != data?.is_holiday_pay &&
      formData.append('is_holiday_pay', data?.is_holiday_pay);
    Employee?.is_bonus != data?.is_bonus && formData.append('is_bonus', data?.is_bonus);

    UpdateEmployee(formData, 'Payroll info', () => setIsDisabled(true));
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LogoLoader size={120} color={'#16151c'} />
      </div>
    );
  }
  return (
    <div className="text-sm">
      {/* Pay Schedule */}
      <div className="mb-4 rounded-lg bg-white/60 p-6">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Payroll Info</h1>

          {isDisabled && !view && (
            <Button
              onClick={() => {
                setIsDisabled(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="flex w-full items-start justify-between gap-12">
          <div className="flex-1">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-accent_soft_black">Pay Schedule</label>
                <PayScheduleSelectDropdown
                  view={isDisabled}
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
                  disabled={isDisabled}
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
            {data.pay_kind === 'SALARY' && (
              <div className="mt-7 flex flex-col gap-4">
                <hr />
                <div className="flex items-center space-x-2">
                  <label htmlFor="payFrequency" className="text-accent_soft_black">
                    Frequency
                  </label>
                  <select
                    disabled={isDisabled}
                    value={data.salary_frequency}
                    onChange={(e: any) => {
                      setData({ ...data, salary_frequency: e.target.value });
                    }}
                    style={{ borderBottom: '1px solid #d1d5db' }}
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
                    disabled={isDisabled}
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
            {data.pay_kind === 'HOURLY' && (
              <>
                <hr className="my-7" />
                <div className="my-4 flex items-center justify-between">
                  <div className="flex w-full items-center space-x-2">
                    <label htmlFor="hoursPerDay" className="text-accent_soft_black">
                      Rate Per Hour
                    </label>
                    <input
                      disabled={isDisabled}
                      type="number"
                      value={data.total_rate_per_hour}
                      onChange={(e: any) => {
                        setData({
                          ...data,
                          total_rate_per_hour: e.target.value,
                        });
                      }}
                      className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                  </div>
                </div>
              </>
            )}

            {/* commission pay type */}
            {data.pay_kind && data.pay_kind !== 'COMMISSION' && (
              <div className="mb-4 mt-7 flex flex-col justify-between gap-4">
                <hr />
                <div className="my-b mt-5 w-full">
                  <p className="text-base text-accent_soft_black">Set Working hours/day</p>
                </div>
                {/* Hours per Day */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="hoursPerDay" className="text-accent_soft_black">
                    Hours per day
                  </label>
                  <input
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
          <div className="flex flex-1 flex-col flex-wrap items-start gap-7">
            <div className="flex items-center gap-2">
              <SmoothCheckbox
                disabled={isDisabled}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
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
        {!isDisabled && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSavePayrollInfo}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Earnings */}
      <EarningsTable view={view} uid={uid} />
      {/* Deduction & Contribution */}
      <DCTable view={view} uid={uid} />

      {/* Garnishment */}
      <GarnishmentTable view={view} uid={uid} />
    </div>
  );
};
//payrollInfo

export default PayrollInfo;
