'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Wallet,
  FileText,
  Sparkles,
  Headphones,
  Database,
  Check,
  Package,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn, Badge, Card, Eyebrow, Stepper, Toggle, IconChip } from '../ui';
import { addons, currency } from '../data';
import { useNav } from '../nav';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSubscriptionBillingCurrent, validateSubscriptionCoupon } from '@/app/helpers/backend';
import { Drawer } from '../overlays';
import {
  buildCheckoutBodyFromAddons,
  mapPreviewLines,
  previewMonthlyTotal,
  previewTotal,
  runBillingPreview,
  runCheckout,
  startStripeCheckout,
} from '../checkoutFlow';

/* ---- per-addon icon map ---- */
const addonIcon: Record<string, any> = {
  employees: Users,
  users: UserPlus,
  payroll: Wallet,
  tax: FileText,
  ai: Sparkles,
  support: Headphones,
  storage: Database,
};

const TOGGLE_ONLY_ADDONS = new Set(['payroll', 'tax', 'support']);

const num = (v: unknown) => Number(v ?? 0) || 0;

/* ------------------------------------------------------------------ */

export default function Addons() {
  const nav = useNav();
  const queryClient = useQueryClient();

  const { data: billing } = useFetch(['subscription-billing-current'], fetchSubscriptionBillingCurrent);

  const empLimit = num(billing?.limits?.EMPLOYEE?.included_quantity);
  const usrLimit = num(billing?.limits?.USER?.included_quantity);
  const empUsed = num(billing?.usage?.EMPLOYEE);
  const usrUsed = num(billing?.usage?.USER);
  const planTitle = billing?.plan?.title ?? 'Growth';
  const basePlanPrice = previewMonthlyTotal(billing?.preview) || num(billing?.plan?.price);

  const initialQuantities = useMemo(
    () =>
      Object.fromEntries(
        addons.map((a) => {
          if (a.id === 'employees') return [a.id, Math.max(0, empUsed - empLimit)];
          if (a.id === 'users') return [a.id, Math.max(0, usrUsed - usrLimit)];
          return [a.id, a.start ?? 0];
        })
      ),
    [empUsed, empLimit, usrUsed, usrLimit]
  );

  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  useEffect(() => {
    setQuantities(initialQuantities);
  }, [initialQuantities]);

  const setQty = (id: string, v: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, v) }));

  const apiBody = useMemo(
    () =>
      buildCheckoutBodyFromAddons(billing, quantities, {
        coupon_code: couponApplied ? couponCode.trim().toUpperCase() : undefined,
      }),
    [billing, quantities, couponApplied, couponCode]
  );

  const hasApiSelection = num(quantities.employees) > 0 || num(quantities.users) > 0;
  const hasToggleSelection = addons.some(
    (a) => TOGGLE_ONLY_ADDONS.has(a.id) && num(quantities[a.id]) > 0
  );
  const hasSelection = hasApiSelection || hasToggleSelection;

  const localAddonsSum = addons.reduce((acc, a) => acc + a.price * (quantities[a.id] ?? 0), 0);
  const localTotal = basePlanPrice + localAddonsSum;

  const { mutate: runPreview, data: previewData, isPending: previewLoading } = useMutation({
    mutationFn: () => runBillingPreview(apiBody),
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        'Could not load billing preview.';
      setCheckoutError(msg);
    },
  });

  const { mutate: applyCoupon, isPending: couponLoading } = useMutation({
    mutationFn: (c: string) => validateSubscriptionCoupon({ coupon_code: c }),
    onSuccess: (res: any) => {
      const ok = res?.valid ?? res?.success ?? false;
      if (ok) {
        setCouponApplied(true);
        setCouponError('');
        runPreview();
      } else {
        setCouponApplied(false);
        setCouponError(res?.message || "That code isn't valid.");
      }
    },
    onError: (err: any) => {
      setCouponApplied(false);
      const body = err?.response?.data;
      setCouponError(
        body?.message ?? body?.detail ?? err?.message ?? "That code isn't valid."
      );
    },
  });

  const { mutate: startCheckout, isPending: checkoutLoading } = useMutation({
    mutationFn: () => runCheckout(apiBody, 'addons'),
    onSuccess: async (res) => {
      if (res?.checkout_url) {
        setConfirmingPayment(true);
        const result = await startStripeCheckout(res.checkout_url, 'addons');
        setConfirmingPayment(false);
        if (!result.usedPopup) return;
        if (result.ok) {
          queryClient.invalidateQueries({ queryKey: ['subscription-billing-current'] });
          queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });
          nav.toast({
            tone: 'success',
            title: 'Add-ons updated',
            msg: 'Your subscription has been updated.',
          });
          setReviewOpen(false);
        } else if (!result.cancelled) {
          nav.toast({
            tone: 'info',
            title: 'Still processing',
            msg: 'Payment may take a moment. Refresh if add-ons do not update.',
          });
        }
        return;
      }
      nav.toast({
        tone: 'success',
        title: 'Add-ons updated',
        msg: 'Your subscription has been updated.',
      });
      setReviewOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        'Checkout failed. Please try again.';
      setCheckoutError(msg);
      nav.toast({ tone: 'error', title: 'Checkout failed', msg });
    },
  });

  const openReview = () => {
    setCheckoutError('');
    setReviewOpen(true);
    if (hasApiSelection) runPreview();
  };

  const previewLines = mapPreviewLines(previewData);
  const previewDueToday = previewTotal(previewData);
  const previewRecurring = previewMonthlyTotal(previewData) || localTotal;

  const applyBundle = () => {
    setQuantities((prev) => ({ ...prev, payroll: 1, tax: 1 }));
  };

  return (
    <div className="space-y-[22px]">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.8px] text-[#16172A]">Add-ons</h1>
          <p className="mt-1 text-[14.5px] text-[#6F6A85]">
            Extend your plan with exactly what you need — pay only for what you add.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Btn
            variant="secondary"
            size="sm"
            onClick={() => nav.toast({ tone: 'info', title: 'No active add-ons yet' })}
          >
            Current Add-ons
          </Btn>
          <Btn variant="primary" size="sm" onClick={() => nav.go('plans')}>
            Upgrade Plan
          </Btn>
        </div>
      </div>

      {/* ---- Main grid ---- */}
      <div className="grid gap-[22px] lg:grid-cols-[1fr_360px]">
        {/* ---- LEFT: add-on cards ---- */}
        <div className="grid auto-rows-auto grid-cols-1 gap-5 xl:grid-cols-2">
          {addons.map((addon) => {
            const qty = quantities[addon.id] ?? 0;
            const active = qty > 0;
            const Icon = addonIcon[addon.id] ?? Package;
            const lineTotal = addon.price * qty;

            return (
              <Card
                key={addon.id}
                className={cn(
                  'flex flex-col gap-4 p-5 transition-shadow',
                  active && 'ring-[1.5px] ring-[#7C4DFF]'
                )}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <IconChip icon={Icon} active={active} />
                    <div>
                      <p className="text-[15px] font-bold text-[#16172A]">{addon.name}</p>
                      <Badge tone={active ? 'primary' : 'neutral'} className="mt-0.5">
                        {active ? 'Added' : 'Available'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[22px] font-extrabold tracking-[-0.5px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                      {currency(addon.price, 0)}
                    </p>
                    <p className="text-[12px] text-[#9A95AE]">{addon.unit}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13.5px] leading-[1.55] text-[#6F6A85]">{addon.desc}</p>

                {/* Benefits */}
                <ul className="space-y-1.5">
                  {addon.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-[13px] text-[#16172A]">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#7C4DFF]" />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="border-t border-[rgba(22,23,42,0.07)]" />

                {/* Control row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {addon.control === 'stepper' && (
                      <Stepper
                        value={qty}
                        onChange={(v) => setQty(addon.id, v)}
                        min={0}
                        step={addon.step ?? 1}
                      />
                    )}

                    {addon.control === 'chips' && (
                      <div className="flex items-center gap-1.5">
                        {[1, 5, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => setQty(addon.id, qty + n)}
                            className="h-9 rounded-[11px] border border-[#D8D2EC] px-3 text-[13px] font-semibold text-[#16172A] transition-colors hover:border-[#7C4DFF] hover:text-[#7C4DFF]"
                          >
                            +{n}
                          </button>
                        ))}
                        {qty > 0 && (
                          <button
                            onClick={() => setQty(addon.id, 0)}
                            className="h-9 rounded-[11px] px-3 text-[13px] font-semibold text-[#9A95AE] transition-colors hover:text-[#EF4444]"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}

                    {addon.control === 'toggle' && (
                      <Toggle
                        checked={qty > 0}
                        onChange={(v) => setQty(addon.id, v ? 1 : 0)}
                      />
                    )}
                  </div>

                  {/* Live line total */}
                  <span
                    className={cn(
                      'text-[15px] font-bold [font-variant-numeric:tabular-nums]',
                      active ? 'text-[#16172A]' : 'text-[#9A95AE]'
                    )}
                  >
                    {active ? currency(lineTotal) : '—'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ---- RIGHT: sticky summary rail ---- */}
        <div className="flex flex-col gap-5 lg:self-start lg:sticky lg:top-4">
          {/* Summary card */}
          <Card className="flex flex-col gap-4">
            <Eyebrow>Your selection</Eyebrow>

            {/* Base plan line */}
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-medium text-[#16172A]">{planTitle} plan</span>
              <span className="font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                {currency(basePlanPrice, 0)}
              </span>
            </div>

            {/* Selected add-ons */}
            {addons
              .filter((a) => (quantities[a.id] ?? 0) > 0)
              .map((a) => {
                const qty = quantities[a.id];
                return (
                  <div key={a.id} className="flex items-center justify-between text-[13.5px]">
                    <span className="text-[#6F6A85]">
                      {a.name}
                      {qty > 1 ? ` ×${qty}` : ''}
                    </span>
                    <span className="font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                      {currency(a.price * qty)}
                    </span>
                  </div>
                );
              })}

            {/* Dashed divider */}
            <div className="border-t border-dashed border-[#D8D2EC]" />

            {/* New total */}
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-[#16172A]">New monthly total</span>
              <span className="text-[22px] font-extrabold tracking-[-0.5px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {currency(localTotal, 0)}
              </span>
            </div>

            {/* Add-ons sub-line */}
            <p className="text-[12.5px] text-[#9A95AE] [font-variant-numeric:tabular-nums]">
              +{currency(localAddonsSum)}/mo in add-ons
            </p>

            {/* CTA */}
            <Btn
              variant="primary"
              className="w-full"
              disabled={!hasSelection}
              onClick={openReview}
            >
              Review &amp; confirm
            </Btn>

            {/* Prorate note */}
            <p className="text-center text-[11.5px] text-[#9A95AE]">
              Charges are prorated to your current cycle.
            </p>
          </Card>

          {/* Bundle & save dark card */}
          <div className="rounded-2xl bg-[linear-gradient(135deg,#13142a,#2a1f55)] p-6 text-white">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#A78BFF]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#A78BFF]">
                Bundle &amp; save
              </p>
            </div>
            <h3 className="text-[18px] font-extrabold tracking-[-0.4px]">Payroll + Tax Filing</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[rgba(255,255,255,0.65)]">
              Get both Payroll Automation and Tax Filing together. Save time and keep compliance
              on autopilot — bundled for one seamless workflow.
            </p>
            <div className="mt-4">
              <Btn
                variant="secondary"
                className="bg-white text-[#16172A] hover:bg-white/90 ring-0 w-full"
                onClick={applyBundle}
              >
                Add bundle
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Review drawer (v2 preview → checkout) ---- */}
      <Drawer
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review add-ons"
        subtitle="Billing preview before checkout"
        width={520}
        footer={
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Btn
                variant="primary"
                className="flex-1"
                disabled={checkoutLoading || confirmingPayment || !hasApiSelection}
                onClick={() => startCheckout()}
              >
                {checkoutLoading || confirmingPayment ? 'Processing…' : 'Confirm & pay'}
              </Btn>
              <Btn variant="secondary" onClick={() => setReviewOpen(false)}>
                Cancel
              </Btn>
            </div>
            {hasToggleSelection && !hasApiSelection && (
              <p className="text-center text-[12px] text-[#6F6A85]">
                Feature add-ons like Payroll require a plan upgrade — use the Plans tab.
              </p>
            )}
            <p className="text-center text-[11px] text-[#9A95AE]">
              <ShieldCheck className="mb-0.5 mr-1 inline h-3 w-3" />
              Secured by Balanzify Payments · PCI-DSS
            </p>
          </div>
        }
      >
        <div className="space-y-5">
          {checkoutError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-[#FEECEC] px-4 py-3 text-[#EF4444]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-[13px]">{checkoutError}</p>
            </div>
          )}

          {hasToggleSelection && (
            <div className="flex items-start gap-2.5 rounded-xl bg-[#E6EEFE] px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1d4ed8]" />
              <p className="text-[13px] text-[#1d4ed8]">
                Payroll, Tax Filing, and Premium Support are enabled on higher plans. Employee and
                user overage can be purchased here; for feature modules, visit Plans.
              </p>
            </div>
          )}

          {/* Coupon */}
          <div className="space-y-2">
            <p className="text-[12.5px] font-bold uppercase tracking-[0.6px] text-[#6F6A85]">
              Coupon code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponApplied(false);
                  setCouponError('');
                }}
                placeholder="Enter code"
                className="flex-1 rounded-xl border border-[#D8D2EC] px-3 py-2.5 text-[14px] outline-none focus:border-[#7C4DFF]"
              />
              <Btn
                variant="secondary"
                size="sm"
                disabled={!couponCode.trim() || couponLoading}
                onClick={() => applyCoupon(couponCode.trim().toUpperCase())}
              >
                Apply
              </Btn>
            </div>
            {couponApplied && (
              <p className="text-[12.5px] font-semibold text-[#1FA97A]">Coupon applied</p>
            )}
            {couponError && <p className="text-[12.5px] text-[#EF4444]">{couponError}</p>}
          </div>

          {/* Charge summary from POST billing/preview */}
          <div
            className={cn(
              'overflow-hidden rounded-xl border border-[#E9E5F5] bg-white',
              previewLoading && 'opacity-60'
            )}
          >
            <div className="space-y-3 px-5 py-4">
              {previewLoading && previewLines.length === 0 ? (
                <p className="text-[13px] text-[#9A95AE]">Loading preview…</p>
              ) : previewLines.length > 0 ? (
                previewLines.map((line, idx) => (
                  <div
                    key={`${line.label}-${idx}`}
                    className="flex items-center justify-between text-[13.5px]"
                  >
                    <span className="text-[#6F6A85]">{line.label}</span>
                    <span
                      className={cn(
                        '[font-variant-numeric:tabular-nums]',
                        line.amount < 0
                          ? 'font-semibold text-[#1FA97A]'
                          : line.amount === 0
                            ? 'text-[#9A95AE]'
                            : 'text-[#16172A]'
                      )}
                    >
                      {line.amount < 0
                        ? `−${currency(Math.abs(line.amount))}`
                        : currency(line.amount)}
                    </span>
                  </div>
                ))
              ) : (
                addons
                  .filter((a) => (quantities[a.id] ?? 0) > 0)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-[13.5px]"
                    >
                      <span className="text-[#6F6A85]">
                        {a.name}
                        {quantities[a.id] > 1 ? ` ×${quantities[a.id]}` : ''}
                      </span>
                      <span className="text-[#16172A] [font-variant-numeric:tabular-nums]">
                        {currency(a.price * quantities[a.id])}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="mx-5 border-t border-dashed border-[#D8D2EC]" />

            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-[14px] font-bold text-[#16172A]">Total due today</span>
              <span className="text-[24px] font-extrabold tracking-[-0.6px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                {currency(previewDueToday || localAddonsSum)}
              </span>
            </div>
          </div>

          <p className="text-center text-[12.5px] text-[#6F6A85] [font-variant-numeric:tabular-nums]">
            Then{' '}
            <span className="font-semibold text-[#16172A]">
              {currency(previewRecurring, 0)}/mo
            </span>{' '}
            starting next billing cycle.
          </p>
        </div>
      </Drawer>
    </div>
  );
}
