'use client';

import { useAppSelector } from '@/app/redux/store';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, IdCard, BriefcaseBusiness, ArrowUpRight } from 'lucide-react';
import { avatarGradient, initials } from '@/components/violet';

const UserProfile = () => {
  const { UserData: user } = useAppSelector((state) => state.userData);
  const name = user?.name || '—';

  const rows = [
    { icon: BriefcaseBusiness, label: 'Designation', value: user?.designation?.title || '—' },
    { icon: Mail, label: 'Email', value: user?.email || '—' },
    { icon: Phone, label: 'Phone', value: user?.phone || '—' },
    { icon: IdCard, label: 'Employee ID', value: user?.employee?.code || '—' },
  ];

  return (
    <Link
      href={`/dashboard/hris/employee/employees/profile?uid=${user?.employee?.uid}`}
      className="group block font-jakarta"
    >
      <div className="relative animate-v-rise overflow-hidden rounded-v-card bg-white p-5 shadow-v-card transition-shadow hover:shadow-v-tile-hover">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundImage: 'linear-gradient(90deg,#7C4DFF,#A78BFF)' }}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-[72px] w-[72px] shrink-0">
            {user?.image?.original ? (
              <Image
                src={user.image.original}
                alt={name}
                fill
                className="rounded-[18px] object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center rounded-[18px] text-2xl font-extrabold text-white"
                style={{ backgroundImage: avatarGradient(name) }}
              >
                {initials(name)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-v-ink400">
              Your profile
            </div>
            <div className="truncate text-[20px] font-extrabold tracking-[-0.02em] text-v-ink900">
              {name}
            </div>
            <div className="truncate text-[13px] text-v-ink500">
              {user?.designation?.title || 'No designation'}
            </div>
          </div>

          <span className="flex-1" />

          <span className="hidden items-center gap-1.5 self-start rounded-full bg-v-tint150 px-3 py-1.5 text-[12px] font-bold text-v-primary transition-colors group-hover:bg-v-tint100 sm:inline-flex">
            View profile
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-[rgba(22,23,42,0.07)] pt-4 sm:grid-cols-2">
          {rows.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500">
                  <Icon className="h-[15px] w-[15px]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-v-ink400">
                    {r.label}
                  </div>
                  <div className="truncate text-[13px] font-semibold text-v-ink900">{r.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
};

export default UserProfile;
