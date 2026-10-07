'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import { NavProvider, type NavApi, type ModalName, type Route, type ToastData } from './nav';
import { Toast } from './overlays';

import Overview from './screens/Overview';
import Plans from './screens/Plans';
import Addons from './screens/Addons';
import Referral from './screens/Referral';
import Invoices from './screens/Invoices';
import Payment from './screens/Payment';
import PastDue from './screens/PastDue';
import DowngradeModal from './modals/DowngradeModal';
import CancellationModal from './modals/CancellationModal';

const TABS: { route: Route; label: string }[] = [
  { route: 'overview', label: 'Overview' },
  { route: 'plans', label: 'Plans' },
  { route: 'addons', label: 'Add-ons' },
  { route: 'referral', label: 'Coupons & Referrals' },
  { route: 'invoices', label: 'Invoices' },
  { route: 'payment', label: 'Payment Method' },
  { route: 'pastdue', label: 'Account Health' },
];

const SCREENS: Record<Route, React.ComponentType> = {
  overview: Overview,
  plans: Plans,
  addons: Addons,
  referral: Referral,
  invoices: Invoices,
  payment: Payment,
  pastdue: PastDue,
};

const STORAGE_KEY = 'bz-subscription-route';

const SubscriptionModule = () => {
  const [route, setRoute] = useState<Route>('overview');
  const [modal, setModal] = useState<ModalName>(null);
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const [upgradeTo, setUpgradeTo] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Restore tab from URL (?tab=plans|addons) after Stripe return, else localStorage.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as Route | null;
    if (tabParam && tabParam in SCREENS) {
      setRoute(tabParam);
      localStorage.setItem(STORAGE_KEY, tabParam);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY) as Route | null;
    if (saved && saved in SCREENS) setRoute(saved);
  }, []);

  const go = (r: Route) => {
    setRoute(r);
    localStorage.setItem(STORAGE_KEY, r);
    bodyRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toast = (t: ToastData) => setToastData(t);

  const nav: NavApi = {
    route,
    go,
    modal,
    openModal: setModal,
    closeModal: () => setModal(null),
    toast,
    upgradeTo,
    setUpgradeTo,
  };

  const Screen = SCREENS[route];

  return (
    <NavProvider value={nav}>
      <div className="w-full pb-12" ref={bodyRef}>
        <ManualBreadcrumbs
          items={[{ label: 'Admin' }, { label: 'Subscription', href: '/dashboard/admin/subscription' }]}
          className="mb-4 mt-0"
        />

        {/* Module tab bar */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/80 bg-white/50 p-1.5 backdrop-blur-md">
          {TABS.map((t) => (
            <button
              key={t.route}
              onClick={() => go(t.route)}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition-all',
                route === t.route
                  ? 'bg-white text-[#16172A] shadow-[0_4px_12px_-6px_rgba(22,23,42,.4)]'
                  : 'text-[#6F6A85] hover:bg-white/60 hover:text-[#16172A]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Routed screen */}
        <div key={route} className="animate-[bzfade_.25s_ease]">
          <Screen />
        </div>

        <style>{`@keyframes bzfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>

      {/* Overlays */}
      <DowngradeModal />
      <CancellationModal />
      <Toast data={toastData} onClose={() => setToastData(null)} />
    </NavProvider>
  );
};

export default SubscriptionModule;
