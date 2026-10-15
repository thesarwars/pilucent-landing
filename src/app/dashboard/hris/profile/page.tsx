'use client';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, Mail, Phone, Globe, Hash } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchEmployee } from '@/app/helpers/backend';
import Overview from '../employee/employees/[code]/_components/Overview';
import JoiningInfo from '../employee/employees/[code]/_components/JoiningInfo';
import Address from '../employee/employees/[code]/_components/Address';
import Payment from '../employee/employees/[code]/_components/Payment';
import Attendance from '../employee/employees/[code]/_components/Attendance';
import TaxInfo from '../employee/employees/[code]/_components/Taxinfo';
import PayrollInfo from '../employee/employees/[code]/_components/Payroll';
import Education from '../employee/employees/[code]/_components/Education';
import Documentation from '../employee/employees/[code]/_components/Documentation';
import DotSpinner from '../employee/employees/_components/dot-spinner';
import { formatWorkLocationLine } from '@/components/ui/ScrollSelectDropDowns/WorkLocationSelectDropDown';

const TabOptions = [
  { key: 'Overview', label: 'General' },
  { key: 'Joining', label: 'Job' },
  { key: 'Contact', label: 'Contact' },
  { key: 'Payment', label: 'Payment' },
  { key: 'Attendance', label: 'Attendance' },
  { key: 'Taxes', label: 'Tax Info' },
  { key: 'Payroll', label: 'Payroll' },
  { key: 'Education', label: 'Education' },
  { key: 'Documents', label: 'Documents' },
];

const EmployeeProfile = () => {
  const router = useRouter();
  const uid = useSearchParams().get('uid');
  const [selectedTab, setSelectedTab] = useState('Overview');
  const { data: employee, isPending, refetch } = useFetch(['employee_profile', uid], () =>
    fetchEmployee(uid)
  );

  const fullName = [employee?.user?.first_name, employee?.user?.middle_name, employee?.user?.last_name]
    .filter(Boolean)
    .join(' ');

  if (!uid || isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 mt-5">
        <button onClick={() => router.back()} className="rounded-lg p-1 transition-colors hover:bg-gray-100">
          <ChevronLeft className="size-6 text-[#111827]" />
        </button>
        <h1 className="text-2xl font-bold text-[#111827]">Detail Employee</h1>
      </div>

      <div className="flex flex-col gap-6 pb-6 lg:flex-row">
        <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-white bg-white/60 p-6 lg:w-[324px] lg:shrink-0">
          <div className="relative size-[100px] overflow-hidden rounded-full">
            {employee?.image ? (
              <Image src={employee.image} alt={fullName || 'Employee'} fill className="object-cover" priority />
            ) : (
              <div className="flex size-full items-center justify-center bg-gray-200 text-2xl font-bold text-gray-500">
                {employee?.user?.first_name?.[0] || '?'}
              </div>
            )}
          </div>

          <div className="flex w-full flex-col items-center gap-2 text-center">
            <p className="text-xl font-bold text-[#111827]">{fullName || '—'}</p>
            <p className="text-sm text-[#687588]">
              {employee?.company_role?.name ||
                employee?.designation?.title ||
                employee?.designation?.name ||
                '—'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-lg px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${
                employee?.status === 'ACTIVE'
                  ? 'bg-[#E7F7EF] text-[#0CAF60]'
                  : employee?.status === 'IN_ACTIVE'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {employee?.status || '—'}
            </span>
            <ChevronDown className="size-4 text-[#687588]" />
          </div>

          <div className="h-px w-full bg-[#F1F2F4]" />

          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Mail className="size-5 shrink-0 text-[#687588]" />
              <span className="truncate text-sm font-semibold text-[#111827]">
                {employee?.company_email || employee?.user?.email || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="size-5 shrink-0 text-[#687588]" />
              <span className="text-sm font-semibold text-[#111827]">
                {employee?.company_phone_number || employee?.phone_number || '—'}
              </span>
            </div>
            {/* <div className="flex items-center gap-2.5">
              <Hash className="size-5 shrink-0 text-[#687588]" />
              <span className="text-sm font-semibold text-[#111827]">{employee?.employee_id || '—'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe className="size-5 shrink-0 text-[#687588]" />
              <span className="text-sm font-semibold text-[#111827]">{employee?.timezone || '—'}</span>
            </div> */}
          </div>

          <div className="h-px w-full bg-[#F1F2F4]" />

          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-[#687588]">Department</span>
                <span className="text-sm font-semibold text-[#111827]">
                  {employee?.department?.title || employee?.department?.name || '—'}
                </span>
              </div>
              <ChevronRight className="size-4 text-[#687588]" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-[#687588]">Office</span>
                <span className="text-sm font-semibold text-[#111827]">
                  {formatWorkLocationLine(employee?.work_locations) ||
                    employee?.work_locations?.title ||
                    employee?.work_locations?.name ||
                    '—'}
                </span>
              </div>
              <ChevronRight className="size-4 text-[#687588]" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-[#687588]">Line Manager</span>
                <div className="flex items-center gap-3">
                  {employee?.report_to?.image ? (
                    <Image
                      src={employee.report_to.image}
                      alt="Manager"
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500">
                      {(employee?.report_to?.name || employee?.report_to?.full_name || '?')[0]}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-[#111827]">
                    {employee?.report_to?.name || employee?.report_to?.full_name || '—'}
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 text-[#687588]" />
            </div>
          </div>

          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#111827] text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#1f2937]">
            Action
            <ChevronDown className="size-[18px]" />
          </button>
        </div>

        <div className="min-w-0 flex flex-1 flex-col gap-6 rounded-2xl border border-white bg-white/60 p-6">
          <div className="flex border-b border-[#F1F2F4]">
            {TabOptions.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`w-[100px] pb-2.5 text-center text-sm font-semibold transition-colors ${
                  selectedTab === tab.key
                    ? 'border-b-2 border-[#27A376] font-bold text-[#27A376]'
                    : 'text-[#111827] hover:text-[#27A376]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedTab === 'Overview' && (
            <Overview view={true} Employee={employee} isPending={isPending} refetch={refetch} uid={uid} />
          )}
          {selectedTab === 'Joining' && (
            <JoiningInfo view={true} Employee={employee} isPending={isPending} refetch={refetch} uid={uid} />
          )}
          {selectedTab === 'Contact' && (
            <Address view={true} Employee={employee} isPending={isPending} refetch={refetch} uid={uid} />
          )}
          {selectedTab === 'Payment' && (
            <Payment
              view={true}
              Employee={employee}
              isPending={isPending}
              refetch={refetch}
              uid={selectedTab === 'Payment' ? uid : ''}
            />
          )}
          {selectedTab === 'Attendance' && (
            <Attendance view={true} Employee={employee} isPending={isPending} refetch={refetch} uid={uid} />
          )}
          {selectedTab === 'Taxes' && (
            <TaxInfo view={true} Employee={employee} isPending={isPending} refetch={refetch} uid={uid} />
          )}
          {selectedTab === 'Payroll' && (
            <PayrollInfo view={true} Employee={employee} isPending={isPending} refetch={refetch} uid={uid} />
          )}
          {selectedTab === 'Education' && <Education uid={uid} />}
          {selectedTab === 'Documents' && <Documentation view={true} employee={employee} uid={uid} />}
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<DotSpinner />}>
      <EmployeeProfile />
    </Suspense>
  );
};

export default Page;
