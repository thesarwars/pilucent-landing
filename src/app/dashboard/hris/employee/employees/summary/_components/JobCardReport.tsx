'use client';
import { fetchEmployee, fetchJobCard } from '@/app/helpers/backend';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useEffect } from 'react';
import JobCardSkeleton from './job-card-skeleton';
import moment from 'moment';

const JobCardReport = ({
  uid,
  setCurrentMonth,
  currentMonth,
}: {
  uid: string;
  setCurrentMonth: any;
  currentMonth: any;
}) => {
  const { data: Summary, isPending: summaryPending } = useQuery({
    queryKey: ['job_card_report', uid, currentMonth?.month],
    queryFn: () => fetchJobCard(uid, { ...currentMonth }),
    enabled: !!uid && !!currentMonth?.month,
  });

  const { data, isPending } = useQuery({
    queryKey: ['employee-details', uid],
    queryFn: () => fetchEmployee(uid),
    enabled: !!uid,
  });

  const getMonthData = (monthString: string) => {
    // monthString format: "YYYY-MM"
    const [year, month] = monthString?.split('-')?.map(Number);

    //start of the given month
    const start = new Date(year, month - 1, 1);
    //end of the given month
    const end = new Date(year, month, 0);

    return {
      start_date: moment(start).format('YYYY-MM-DD'),
      end_date: moment(end).format('YYYY-MM-DD'),
      month: monthString,
    };
  };

  useEffect(() => {
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const { start_date, end_date, month } = getMonthData(currentMonth);
    setCurrentMonth({ start_date, end_date, month });
  }, [uid]);

  if (isPending || summaryPending) {
    return <JobCardSkeleton />;
  }
  return (
    <div>
      <div className="mt-7 rounded-xl bg-white p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="relative">
              <input
                type="month"
                value={currentMonth?.month}
                onChange={(e) => {
                  const data = getMonthData(e.target.value);
                  setCurrentMonth(data);
                }}
                className="appearance-none rounded-lg border-0 bg-blue-100 px-4 py-2 font-medium text-blue-600"
              />
            </div>
          </div>

          {/* Main Card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h1 className="text-lg font-semibold text-gray-900">
                Job Card Report || Date Range:{' '}
                {moment(currentMonth?.start_date || new Date()).format('DD MMM')} to{' '}
                {moment(currentMonth?.end_date || new Date()).format('DD MMM YYYY')}
              </h1>
            </div>

            {/* Employee Info Section */}
            <div className="p-6">
              <div className="mb-8 flex items-start gap-6">
                {/* Profile Image */}
                <div className="relative">
                  {data?.image ? (
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-yellow-400">
                      <Image
                        src={data?.image}
                        alt="Employee profile"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 bg-gray-500">
                      <p className="text-center text-5xl uppercase text-white">
                        {data?.user?.first_name?.split('')[0] || '-_-'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Employee Details Grid */}
                <div className="grid flex-1 grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                  <div className="flex">
                    <span className="w-32 text-gray-600">Name</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">
                      {data?.user?.first_name} {data?.user?.middle_name} {data?.user?.last_name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Department</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">{data?.department?.title || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Role Name</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black capitalize">
                      {data?.company_roles?.map((role: any) => role?.name).join(', ')}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Office Location</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">USA</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Employee ID</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">{data?.employee_id || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Join Date</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">{data?.offer_date || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Designation</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">
                      {data?.designation?.title || '-'}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-gray-600">Release Date</span>
                    <span className="mx-2 text-gray-400">:</span>
                    <span className="text-accent_soft_black">{data?.contract_end_date || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {/* Present Days */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {Summary?.present_in_time_count} Days
                    </span>
                    <span className="text-sm font-medium text-red-500">
                      ({Summary?.early_out_count} Early Out's)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Present</p>
                </div>

                {/* Late Days */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.late_count} Days
                  </div>
                  <p className="text-sm text-gray-500">Late</p>
                </div>

                {/* Difference */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {(Summary?.difference_hour_count || 0)?.toFixed(2)} hour
                  </div>
                  <p className="text-sm text-gray-500">Difference</p>
                </div>

                {/* Absent Days */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.absent_count} Days
                  </div>
                  <p className="text-sm text-gray-500">Absent</p>
                </div>

                {/* Leave Days */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.leave_count} Days
                  </div>
                  <p className="text-sm text-gray-500">Leave</p>
                </div>

                {/* Approved OT */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.ot_hour_count} hour
                  </div>
                  <p className="text-sm text-gray-500">Approved OT</p>
                </div>
                {/* <div className="rounded-lg bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.workable_hour_count} hour
                  </div>
                  <p className="text-sm text-gray-500">Workable </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.worked_hour_count} hour
                  </div>
                  <p className="text-sm text-gray-500">Worked </p>
                </div> */}
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.un_paid_hour_count || 0} hour
                  </div>
                  <p className="text-sm text-gray-500">Unpaid </p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4 py-7">
                  <div className="mb-1 text-2xl font-bold text-accent_soft_black">
                    {Summary?.paid_off_hour_count || 0} hour
                  </div>
                  <p className="text-sm text-gray-500">Paid </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCardReport;
