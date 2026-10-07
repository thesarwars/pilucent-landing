'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight, FileText, ClipboardList } from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Data Migration',
    href: '/dashboard/admin/migrate',
    icon: ArrowLeftRight,
    matchPaths: ['/dashboard/admin/migrate', '/dashboard/admin/migrate/new'],
  },
  {
    label: 'Mapping Templates',
    href: '/dashboard/admin/migrate/templates',
    icon: FileText,
    matchPaths: ['/dashboard/admin/migrate/templates'],
  },
  // {
  //   label: 'Audit Logs',
  //   href: '/dashboard/admin/migrate/audit-logs',
  //   icon: ClipboardList,
  //   matchPaths: ['/dashboard/admin/migrate/audit-logs'],
  // },
];

const isActive = (pathname: string, matchPaths: string[]) => {
  return matchPaths.some((p) => pathname === p || pathname.endsWith(`${p}/`));
};

const MigrateLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col items-start font-lexend">
      {!pathname.endsWith('new') && (
        <aside className="sticky top-1 inline-flex h-fit max-w-full shrink-0 rounded-2xl border border-accent_border_gray bg-white p-3 shadow-sm md:block">
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.matchPaths);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent_bg_light_blue text-accent_soft_blue'
                      : 'text-accent_text_black hover:bg-accent_bg_gray'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="w-full min-w-0 flex-1">{children}</div>
    </div>
  );
};

export default MigrateLayout;
