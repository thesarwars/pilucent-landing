'use client';

import React, { useState } from 'react';
import { Tag, Gift, Copy, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn, Badge, Card, Eyebrow, Avatar, IconChip, type Tone } from '../ui';
import { COUPON, offers, referral, referralRows, currency } from '../data';
import { useNav } from '../nav';
import { useFetch } from '@/app/helpers/hooks';
import { useMutation } from '@tanstack/react-query';
import {
  fetchSubscriptionReferral,
  validateSubscriptionCoupon,
  fetchSubscriptionOffers,
} from '@/app/helpers/backend';
// coupon/referral response fields are best-effort per SUBSCRIPTION_ENGINE.md.

/* ------------------------------------------------------------------ */
/* Status tone map                                                       */
/* ------------------------------------------------------------------ */
const statusTone: Record<string, Tone> = {
  Paid: 'success',
  Approved: 'info',
  Pending: 'warning',
};

/* ------------------------------------------------------------------ */
/* Referral screen                                                       */
/* ------------------------------------------------------------------ */
export default function Referral() {
  const nav = useNav();

  /* Referral data */
  const { data: referralData } = useFetch(['subscription-referral'], fetchSubscriptionReferral);

  /* Active offers (admin offers catalog) — falls back to static offers. */
  // const { data: offersResp } = useFetch(['subscription-offers'], fetchSubscriptionOffers);
  // const apiOffers: any[] = Array.isArray(offersResp)
  //   ? offersResp
  //   : Array.isArray(offersResp?.results)
  //     ? offersResp.results
  //     : [];
  // const activeApiOffers = apiOffers.filter((o) => !o.status || o.status === 'ACTIVE');
  // const displayOffers =
  //   activeApiOffers.length > 0
  //     ? activeApiOffers.map((o) => ({
  //         key: o.uid,
  //         icon: o.is_retention_offer ? Gift : Tag,
  //         title: o.title,
  //         desc: o.description,
  //         code: o.code as string | null,
  //         cta: 'Claim',
  //         variant: 'ghost' as const,
  //         onClick: () => {
  //           if (o.code) setCode(o.code);
  //           nav.toast({ tone: 'success', title: 'Offer claimed', msg: o.title });
  //         },
  //       }))
  //     : offers.map((o) => ({
  //         key: o.id,
  //         icon: o.cta === 'Switch' ? Tag : Gift,
  //         title: o.title,
  //         desc: o.desc,
  //         code: null as string | null,
  //         cta: o.cta,
  //         variant: (o.cta === 'Switch' ? 'primary' : 'ghost') as 'primary' | 'ghost',
  //         onClick: () => {
  //           nav.go('plans');
  //           nav.toast({
  //             tone: 'success',
  //             title: o.cta === 'Switch' ? 'Switched' : 'Offer claimed',
  //           });
  //         },
  //       }));

  /* Coupon state */
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const couponMessage = (res: any) =>
    res?.message ?? res?.detail ?? "That code isn't valid.";

  const { mutate: applyCoupon, isPending: couponLoading } = useMutation({
    mutationFn: (c: string) => validateSubscriptionCoupon({ coupon_code: c }),
    onSuccess: (res: any) => {
      const ok = res?.valid === true || (res?.success === true && res?.valid !== false);
      if (ok) {
        setApplied(true);
        setCouponError('');
      } else {
        setApplied(false);
        setCouponError(couponMessage(res));
      }
    },
    onError: (err: any) => {
      setApplied(false);
      setCouponError(couponMessage(err?.response?.data) || err?.message || "That code isn't valid.");
    },
  });

  function handleApply() {
    applyCoupon(code.trim().toUpperCase());
  }

  function handleRemove() {
    setApplied(false);
    setCode('');
    setCouponError('');
  }

  function fillSuggestion() {
    setCode(COUPON.code);
    setCouponError('');
  }

  return (
    <div className="space-y-[22px]">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-[-0.8px] text-[#16172A]">
            Coupons &amp; Referrals
          </h1>
          <p className="mt-1 text-[14.5px] text-[#6F6A85]">
            Apply discount codes, claim active offers, and earn credits by referring new customers.
          </p>
        </div>
        <Btn variant="secondary" onClick={() => nav.go('plans')} className="shrink-0">
          View Plans
        </Btn>
      </div>

      {/* ---- Top grid: Coupon + Active Offers ---- */}
      <div className="grid gap-[22px] lg:grid-cols-2">

        {/* A) Coupon card */}
        <Card>
          <Eyebrow icon={Tag}>Coupon</Eyebrow>
          <p className="mt-3 text-[16px] font-semibold text-[#16172A]">Have a coupon?</p>
          <p className="mt-0.5 text-[13.5px] text-[#6F6A85]">
            Enter a discount code below to apply it to your subscription.
          </p>

          {applied ? (
            /* Applied success panel */
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#1FA97A]/30 bg-[#E4F6EF] p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#1FA97A]" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[13.5px] font-bold text-[#16172A]">
                  {COUPON.code} applied
                </p>
                <p className="mt-0.5 text-[13px] text-[#1FA97A]">
                  {COUPON.label} · saves ~{currency(135, 0)}
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="shrink-0 text-[13px] font-semibold text-[#1FA97A] hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {/* Input row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  placeholder="ENTER CODE"
                  className={cn(
                    'h-11 flex-1 min-w-0 rounded-[14px] border px-4 font-mono text-[13.5px] uppercase tracking-wider text-[#16172A] placeholder:text-[#9A95AE] outline-none transition-colors focus:border-[#7C4DFF] focus:ring-2 focus:ring-[#7C4DFF]/20',
                    couponError ? 'border-[#EF4444]' : 'border-[#D8D2EC]'
                  )}
                />
                <Btn variant="primary" onClick={handleApply} disabled={couponLoading} className="shrink-0">
                  {couponLoading ? 'Applying…' : 'Apply'}
                </Btn>
              </div>

              {/* Inline error */}
              {couponError && (
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-[#EF4444]" />
                  <p className="text-[13px] font-medium text-[#EF4444]">{couponError}</p>
                </div>
              )}

              {/* Suggestion chip */}
              <button
                onClick={fillSuggestion}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#D8D2EC] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#6F6A85] transition-colors hover:border-[#7C4DFF] hover:text-[#7C4DFF]"
              >
                Try{' '}
                <span className="font-mono font-bold tracking-wider text-[#7C4DFF]">
                  BALANZIFY20
                </span>
              </button>
            </div>
          )}
        </Card>

        {/* B) Active Offers card */}
        {/* <Card>
          <Eyebrow icon={Gift}>Offers</Eyebrow>
          <p className="mt-3 text-[16px] font-semibold text-[#16172A]">Active offers</p>
          <p className="mt-0.5 text-[13.5px] text-[#6F6A85]">
            Exclusive discounts available on your account right now.
          </p>

          <div className="mt-4 divide-y divide-[rgba(22,23,42,0.07)]">
            {displayOffers.length === 0 && (
              <p className="py-4 text-[13px] text-[#9A95AE]">No active offers right now.</p>
            )}
            {displayOffers.map((offer) => (
              <div key={offer.key} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                <IconChip icon={offer.icon} className="h-10 w-10 shrink-0 rounded-[10px]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#16172A] leading-snug">
                    {offer.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#6F6A85]">{offer.desc}</p>
                  {offer.code && (
                    <p className="mt-1 font-mono text-[11.5px] font-bold uppercase tracking-wider text-[#7C4DFF]">
                      {offer.code}
                    </p>
                  )}
                </div>
                <Btn variant={offer.variant} size="sm" className="shrink-0" onClick={offer.onClick}>
                  {offer.cta}
                </Btn>
              </div>
            ))}
          </div>
        </Card> */}
      </div>

      {/* ---- Referral card (full width) ---- */}
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1px_1fr] gap-0">

          {/* LEFT: Referral info + link + stats */}
          <div className="p-2 lg:pr-8">
            {/* Headline */}
            <div className="flex items-start gap-4">
              <IconChip icon={Gift} active className="shrink-0" />
              <div>
                <h2 className="text-[22px] font-extrabold tracking-[-0.5px] text-[#16172A]">
                  Earn $50 per referral
                </h2>
                <p className="mt-1 text-[14px] text-[#6F6A85]">
                  $50 after their first paid invoice.
                </p>
              </div>
            </div>

            {/* Referral link row */}
            <div className="mt-5 flex items-center gap-2">
              <div className="min-w-0 flex-1 rounded-xl bg-[#F4F1FF] px-4 py-3">
                <span className="block truncate font-mono text-[13px] font-medium text-[#16172A]">
                  {referralData?.link ?? (referralData?.code ? `https://balanzify.com/ref/${referralData.code}` : referral.link)}
                </span>
              </div>
              <Btn
                variant="secondary"
                size="sm"
                icon={Copy}
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(referralData?.link ?? (referralData?.code ? `https://balanzify.com/ref/${referralData.code}` : referral.link));
                  nav.toast({
                    tone: 'success',
                    title: 'Link copied',
                    msg: 'Share it to start earning.',
                  });
                }}
              >
                Copy
              </Btn>
            </div>

            {/* Stat tiles */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Invited', value: referral.invited },
                { label: 'Converted', value: referral.converted },
                { label: 'Credits', value: currency(referral.credits, 0) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center rounded-xl bg-[#E9E5F5] px-3 py-4 text-center"
                >
                  <span className="text-[22px] font-extrabold tracking-[-0.5px] text-[#16172A] [font-variant-numeric:tabular-nums]">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 text-[12px] font-semibold text-[#9A95AE] uppercase tracking-[0.4px]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE: vertical hairline */}
          <div className="hidden lg:block bg-[rgba(22,23,42,0.07)] w-px" />

          {/* RIGHT: referral table */}
          <div className="mt-6 lg:mt-0 lg:pl-8 p-2">
            <p className="text-[15px] font-bold text-[#16172A]">Referral Activity</p>

            {/* Table header */}
            <div className="mt-3 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 pb-2 border-b border-[rgba(22,23,42,0.07)]">
              {['Company', 'Date', 'Reward', 'Status'].map((h) => (
                <span
                  key={h}
                  className="text-[11.5px] font-bold uppercase tracking-[0.5px] text-[#9A95AE]"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Table rows */}
            <div className="divide-y divide-[rgba(22,23,42,0.07)]">
              {referralRows.map((row) => (
                <div
                  key={row.company}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 py-3"
                >
                  {/* Company */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={row.company} size={32} />
                    <span className="truncate text-[13.5px] font-semibold text-[#16172A]">
                      {row.company}
                    </span>
                  </div>
                  {/* Date */}
                  <span className="whitespace-nowrap text-[13px] text-[#6F6A85]">{row.date}</span>
                  {/* Reward */}
                  <span className="whitespace-nowrap text-[13.5px] font-semibold text-[#16172A] [font-variant-numeric:tabular-nums]">
                    {currency(row.reward, 0)}
                  </span>
                  {/* Status */}
                  <Badge tone={statusTone[row.status] ?? 'neutral'} dot>
                    {row.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
