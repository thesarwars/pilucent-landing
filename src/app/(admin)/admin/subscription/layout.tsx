'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SBadge } from './_components/ui';
import { SaProvider } from './_components/SaProvider';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Revenue, subscriptions and growth at a glance' },
  plans: { title: 'Plans', subtitle: 'Manage subscription plans and pricing' },
  'modules-features': { title: 'Modules & Features', subtitle: 'Entitlement matrix across plans' },
  'limits-metrics': { title: 'Limits & Usage Metrics', subtitle: 'Billable metrics and enforcement' },
  'add-ons': { title: 'Add-ons', subtitle: 'Optional add-on catalog' },
  'coupons-offers': { title: 'Coupons & Offers', subtitle: 'Discount codes and promotions' },
  'referral-program': { title: 'Referral Program', subtitle: 'Referral rewards and activity' },
  trials: { title: 'Trials', subtitle: 'Active trials and conversion settings' },
  'tenant-subscriptions': { title: 'Tenant Subscriptions', subtitle: 'All company subscriptions' },
  'invoices-payments': { title: 'Invoices & Payments', subtitle: 'Billing ledger and dunning' },
  'audit-logs': { title: 'Audit Logs', subtitle: 'System and billing activity trail' },
};

export default function SubscriptionAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const meta = PAGE_META[segment] ?? PAGE_META.dashboard;

  return (
    <SaProvider>
      <div className="py-2 font-inter text-[#111935]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[21px] font-extrabold tracking-[-0.4px] text-[#0B1020]">{meta.title}</h1>
            <p className="text-[12.5px] text-[#5B6478]">{meta.subtitle}</p>
          </div>
          {segment === 'dashboard' && <SBadge tone="good">Live</SBadge>}
        </div>

        {children}
      </div>
    </SaProvider>
  );
}
