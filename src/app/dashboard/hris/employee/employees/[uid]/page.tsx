/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
'use client';

import Image from 'next/image';
import { useState, use } from 'react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchEmployee } from '@/app/helpers/backend';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  MapPin,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarGradient, initials } from '@/components/violet';
import DotSpinner from '../_components/dot-spinner';
import { formatWorkLocationLine } from '@/components/ui/ScrollSelectDropDowns/WorkLocationSelectDropDown';
import Overview from './_components/Overview';
import JoiningInfo from './_components/JoiningInfo';
import Address from './_components/Address';
import Payment from './_components/Payment';
import Attendance from './_components/Attendance';
import TaxInfo from './_components/Taxinfo';
import PayrollInfo from './_components/Payroll';
import Education from './_components/Education';
import Documentation from './_components/Documentation';

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

const Page = (props: { params: Promise<{ uid: string }> }) => {
  const params = use(props.params);
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Overview');
  const {
    data: Employee,
    isPending,
    refetch,
  } = useFetch(['employee_profile', params?.uid], () => fetchEmployee(params?.uid));

  const fullName = [Employee?.first_name, Employee?.middle_name, Employee?.last_name]
    .filter(Boolean)
    .join(' ');

  const role =
    Employee?.company_roles?.map((r: any) => r?.name).join(', ') ||
    Employee?.designation?.title ||
    Employee?.designation?.name ||
    '—';
  const email = Employee?.company_email || Employee?.email || '—';
  const phone = Employee?.company_phone_number || Employee?.phone_number || '—';
  const department = Employee?.department?.title || Employee?.department?.name || '—';
  const office =
    formatWorkLocationLine(Employee?.work_locations) ||
    Employee?.work_locations?.title ||
    Employee?.work_locations?.name ||
    '—';
  const lineManager = Employee?.report_to?.name || Employee?.report_to?.full_name || '—';
  const isActive = Employee?.status === 'ACTIVE';

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      {/* page header */}
      <div className="flex animate-v-rise items-center gap-2.5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-v-border bg-white/70 text-v-ink500 backdrop-blur transition-colors hover:border-v-primary hover:text-v-primary"
        >
          <ChevronLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[21px] font-extrabold tracking-[-0.02em] text-v-ink900">
          Detail Employee
        </h1>
      </div>

      <div className="grid items-start gap-[18px] lg:grid-cols-[330px_minmax(0,1fr)]">
        {/* ── LEFT profile card ─────────────────────────────────────────── */}
        <div className="animate-v-rise self-start overflow-hidden rounded-[22px] bg-white shadow-v-card lg:sticky lg:top-4">
          {/* gradient banner */}
          <div
            className="relative h-[84px]"
            style={{ backgroundImage: 'linear-gradient(135deg,#7C4DFF,#A78BFF)' }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 h-[120px] w-[120px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)' }}
            />
          </div>

          <div className="px-5 pb-5">
            {/* avatar overlapping */}
            <div className="-mt-[42px] flex justify-center">
              <span className="relative flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full ring-4 ring-white">
                {Employee?.image ? (
                  <Image src={Employee.image} alt={fullName || 'Employee'} fill className="object-cover" priority />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-[24px] font-extrabold text-white"
                    style={{ backgroundImage: avatarGradient(fullName || params?.uid || '?') }}
                  >
                    {initials(fullName || '?')}
                  </span>
                )}
              </span>
            </div>

            {/* name + role + status */}
            <div className="mt-3 text-center">
              <div className="text-[19px] font-extrabold text-v-ink900">{fullName || '—'}</div>
              <div className="mt-0.5 text-[12.5px] text-v-ink400">{role}</div>
              <button
                type="button"
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide"
                style={
                  isActive
                    ? { backgroundColor: '#DEF5E9', color: '#137A57' }
                    : { backgroundColor: '#F0EEF6', color: '#6F6A85' }
                }
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isActive ? '#137A57' : '#6F6A85' }} />
                {Employee?.status ? `${Employee.status}`.replace(/_/g, ' ') : '—'}
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            {/* contact tiles */}
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 rounded-[12px] bg-[#FBFAFE] p-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-v-tint100 text-v-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10.5px] text-v-ink400">Email</div>
                  <div className="truncate text-[13px] font-bold text-v-ink900">{email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-[12px] bg-[#FBFAFE] p-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-v-success-bg text-v-success-fg">
                  <Phone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10.5px] text-v-ink400">Phone</div>
                  <div className="truncate text-[13px] font-bold tabular-nums text-v-ink900">{phone}</div>
                </div>
              </div>
            </div>

            {/* meta tiles */}
            <div className="mt-3 flex flex-col">
              {[
                { icon: <Building2 className="h-4 w-4" />, chip: 'bg-v-tint100 text-v-primary', label: 'Department', value: department },
                { icon: <MapPin className="h-4 w-4" />, chip: 'bg-v-teal-bg text-v-teal-fg', label: 'Office', value: office },
                { icon: <User className="h-4 w-4" />, chip: 'bg-v-warn-bg text-v-warn-fg', label: 'Line manager', value: lineManager },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  className="flex items-center gap-2.5 rounded-[12px] px-1.5 py-2 text-left transition-colors hover:bg-v-wash"
                >
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]', m.chip)}>
                    {m.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] text-v-ink400">{m.label}</div>
                    <div className="truncate text-[13px] font-bold text-v-ink900">{m.value}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-v-ink400" />
                </button>
              ))}
            </div>

            {/* action */}
            <button
              type="button"
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#16172A] text-[13px] font-bold tracking-wide text-white transition-colors hover:bg-[#2A2440]"
            >
              Action
              <ChevronDown className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* ── RIGHT detail column ───────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* sticky tab pill-bar */}
          <div className="sticky top-4 z-10 flex gap-1 overflow-x-auto rounded-[20px] border border-v-border bg-white p-1.5 shadow-v-card">
            {TabOptions.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTab(tab.key)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-colors',
                  selectedTab === tab.key
                    ? 'bg-[#16172A] text-white shadow-[0_8px_18px_-8px_rgba(22,23,42,0.5)]'
                    : 'text-v-ink500 hover:text-v-ink900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* tab content */}
          <div className="animate-v-rise">
            {selectedTab === 'Overview' && (
              <Overview Employee={Employee} isPending={isPending} refetch={refetch} uid={params?.uid} />
            )}
            {selectedTab === 'Joining' && (
              <JoiningInfo Employee={Employee} isPending={isPending} refetch={refetch} uid={params?.uid} />
            )}
            {selectedTab === 'Contact' && (
              <Address Employee={Employee} isPending={isPending} refetch={refetch} uid={params?.uid} />
            )}
            {selectedTab === 'Payment' && (
              <Payment
                Employee={Employee}
                isPending={isPending}
                refetch={refetch}
                uid={selectedTab === 'Payment' ? params?.uid : ''}
              />
            )}
            {selectedTab === 'Attendance' && (
              <Attendance Employee={Employee} isPending={isPending} refetch={refetch} uid={params?.uid} />
            )}
            {selectedTab === 'Taxes' && (
              <TaxInfo Employee={Employee} isPending={isPending} refetch={refetch} uid={params?.uid} />
            )}
            {selectedTab === 'Payroll' && (
              <PayrollInfo Employee={Employee} isPending={isPending} refetch={refetch} uid={params?.uid} />
            )}
            {selectedTab === 'Education' && <Education uid={params?.uid} />}
            {selectedTab === 'Documents' && <Documentation employee={Employee} uid={params?.uid} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
