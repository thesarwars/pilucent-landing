'use client';

import type React from 'react';

import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem as UIBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface ManualBreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export function ManualBreadcrumbs({
  items,
  showHome = true,
  homeHref = '/dashboard',
  className,
}: ManualBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex items-center gap-2 pt-4 lg:mb-5 lg:pt-8">
        {showHome && (
          <>
            <UIBreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={homeHref}
                  className="text-[#696A90] transition-colors hover:text-gray-700 hover:underline"
                >
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </UIBreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M7.5 14.9997C7.5 14.9997 12.5 11.3173 12.5 9.99972C12.5 8.68213 7.5 4.99976 7.5 4.99976"
                  stroke="#090E4F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </BreadcrumbSeparator>
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              <UIBreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="flex cursor-pointer items-center gap-1 text-base font-medium text-[#090E4F]">
                    {item.icon}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="flex cursor-pointer items-center gap-1 text-base font-light text-accent_granite transition-colors hover:text-gray-700 hover:underline"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </UIBreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator className="text-[#696A90]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M7.5 14.9997C7.5 14.9997 12.5 11.3173 12.5 9.99972C12.5 8.68213 7.5 4.99976 7.5 4.99976"
                      stroke="#090E4F"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </BreadcrumbSeparator>
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
