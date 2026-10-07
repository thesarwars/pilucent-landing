'use client';

import React from 'react';
import { Card } from '../ui/card';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NavItem {
  label: string;
  href?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Sales',
    href:  "/dashboard/sales/all_sales",
  },
  {
    label: 'Classify your bank transactions',
    href: "/dashboard/transactions/banking",
  },
  {
    label: 'Expenses',
    href: "/dashboard/expenses/expenses",
  },
  {
    label: 'Payroll',
    href: "/dashboard/hris/payroll/salary_process",
  },
  {
    label: 'Reports',
    href: "/dashboard/reports",
  },
];

const Navigation = () => {
  return (
    <Card
      style={{ borderRadius: '24px' }}
      className="w-full flex-1 p-4 min-w-0"
    >
      <h1 className="mb-6 text-lg font-medium text-[#796E87]">
        Quick Navigation
      </h1>

      <div className="space-y-3">
        {navItems.map((item) => (
          <Link
            href={item.href || '#'}
            key={item.label}
            className="flex w-full cursor-pointer items-center overflow-hidden rounded-xl bg-[#F9F5FF] transition-colors"
          >
            <span className="block w-[6px] self-stretch rounded-r-full bg-[#B277FF]" />
            <div className="flex flex-1 items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                {/* <img src={item.icon as string} alt={item.label} width={24} height={24} className='object-contain' /> */}
                <span className="text-sm font-normal text-[#090E4F]">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="size-4 text-[#090E4FB3]" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default Navigation;
