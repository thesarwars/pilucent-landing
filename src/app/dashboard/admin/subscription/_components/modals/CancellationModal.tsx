'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Clock, CheckCircle, Info, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn } from '../ui';
import type { Tone } from '../ui';
import { useNav } from '../nav';
import { Modal } from '../overlays';
import { useMutation } from '@tanstack/react-query';
import { postSubscriptionCancel } from '@/app/helpers/backend';

/* ------------------------------------------------------------------ */

const REASONS = [
  'Too expensive',
  'Missing a feature',
  'Switching provider',
  'Temporary pause',
  'Business closed',
  'Support issue',
  'Other',
] as const;

type Reason = (typeof REASONS)[number];

const STEP_TITLES = [
  'Why are you cancelling?',
  'Before you go…',
  'Confirm cancellation',
];

/* ---- Step dots ---- */
const StepDots = ({ step }: { step: number }) => (
  <div className="flex items-center gap-2">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={cn(
          'h-2 rounded-full transition-all duration-200',
          i === step
            ? 'w-5 bg-[#7C4DFF]'
            : i < step
            ? 'w-2 bg-[#7C4DFF]'
            : 'w-2 bg-[#D8D2EC]'
        )}
      />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */

export default function CancellationModal() {
  const nav = useNav();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [reason, setReason] = useState<Reason | null>(null);

  // cancel body { at_period_end, reason } per SUBSCRIPTION_ENGINE.md.
  const { mutate: cancelSubscription, isPending: cancelling } = useMutation({
    mutationFn: (body: { at_period_end: boolean; reason: Reason | null }) =>
      postSubscriptionCancel(body),
    onSuccess: () => {
      nav.closeModal();
      nav.toast({
        tone: 'info',
        icon: Clock,
        title: 'Cancellation scheduled',
        msg: 'Access remains until Jul 08, 2026. Reactivate anytime.',
      });
    },
    onError: () =>
      nav.toast({ tone: 'error', title: 'Could not cancel', msg: 'Please try again.' }),
  });

  /* Reset state whenever modal opens */
  useEffect(() => {
    if (nav.modal === 'cancellation') {
      setStep(0);
      setReason(null);
    }
  }, [nav.modal]);

  return (
    <Modal open={nav.modal === 'cancellation'} onClose={nav.closeModal} width={580}>
      {/* ---- Header ---- */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <StepDots step={step} />
          <h2 className="text-[21px] font-extrabold tracking-[-0.3px] text-[#16172A]">
            {STEP_TITLES[step]}
          </h2>
        </div>
        <button
          onClick={nav.closeModal}
          className="rounded-lg p-1.5 text-[#6F6A85] transition-colors hover:bg-[#F4F1FF] flex-shrink-0 mt-0.5"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ---- Step 0: Reason ---- */}
      {step === 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
            {REASONS.map((r) => {
              const selected = reason === r;
              return (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={cn(
                    'rounded-[14px] px-4 py-3.5 text-left text-[14px] font-semibold transition-all duration-150',
                    selected
                      ? 'ring-[1.5px] ring-[#7C4DFF] bg-[#EEE9FF] text-[#7C4DFF]'
                      : 'border border-[#D8D2EC] text-[#16172A] hover:border-[#7C4DFF]'
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
          <div
            className="flex items-center gap-3 pt-4 border-t"
            style={{ borderColor: 'rgba(22,23,42,0.07)' }}
          >
            <Btn
              variant="primary"
              className="flex-1"
              disabled={!reason}
              onClick={() => setStep(1)}
            >
              Continue
            </Btn>
            <Btn variant="secondary" className="flex-1" onClick={nav.closeModal}>
              Keep my plan
            </Btn>
          </div>
        </>
      )}

      {/* ---- Step 1: Retention offer ---- */}
      {step === 1 && (
        <>
          {/* Dark gift card */}
          <div className="mb-7 rounded-2xl p-6 text-white [background:linear-gradient(135deg,#13142a,#2a1f55)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Gift className="h-6 w-6 text-[#c4abff]" />
            </div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.6px] text-white/50 mb-1">
              Exclusive offer
            </p>
            <p className="text-[34px] font-extrabold tracking-[-1px] leading-none text-white mb-1">
              20% off
            </p>
            <p className="text-[16px] font-semibold text-[#c4abff] mb-3">
              for your next 3 months
            </p>
            <p className="text-[13.5px] leading-snug text-white/60">
              Stay and save — your discount applies automatically at the next billing cycle.
              No action required, and you can cancel any time after.
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex flex-col gap-3 pt-4 border-t"
            style={{ borderColor: 'rgba(22,23,42,0.07)' }}
          >
            <Btn
              variant="primary"
              icon={Gift}
              onClick={() => {
                nav.closeModal();
                nav.toast({
                  tone: 'success',
                  icon: Gift,
                  title: 'Offer applied',
                  msg: '20% off for 3 months — your plan stays active.',
                });
              }}
            >
              Accept offer
            </Btn>
            <div className="flex items-center gap-3">
              <Btn
                variant="secondary"
                icon={ChevronLeft}
                onClick={() => setStep(0)}
                className="shrink-0"
              >
                Back
              </Btn>
              <Btn
                variant="dangerghost"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                Continue cancellation
              </Btn>
            </div>
          </div>
        </>
      )}

      {/* ---- Step 2: Confirmation ---- */}
      {step === 2 && (
        <>
          {/* Reassurance list */}
          <ul className="mb-7 flex flex-col gap-3">
            {([
              {
                icon: CheckCircle,
                color: '#1FA97A',
                bg: '#E4F6EF',
                text: 'Access stays until Jul 08, 2026',
              },
              {
                icon: Info,
                color: '#1d4ed8',
                bg: '#E6EEFE',
                text: 'Outstanding invoices remain payable',
              },
              {
                icon: CheckCircle,
                color: '#1FA97A',
                bg: '#E4F6EF',
                text: 'Data export available for 30 days',
              },
            ] as const).map(({ icon: Icon, color, bg, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-[14px] px-4 py-3.5"
                style={{ background: bg }}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" style={{ color }} />
                <span className="text-[14px] font-semibold" style={{ color: '#16172A' }}>
                  {text}
                </span>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div
            className="flex items-center gap-3 pt-4 border-t"
            style={{ borderColor: 'rgba(22,23,42,0.07)' }}
          >
            <Btn
              variant="danger"
              icon={Clock}
              className="flex-1"
              disabled={cancelling}
              onClick={() => cancelSubscription({ at_period_end: true, reason })}
            >
              Cancel at Period End
            </Btn>
            <Btn
              variant="secondary"
              icon={ChevronLeft}
              onClick={() => setStep(1)}
              className="shrink-0"
            >
              Go back
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}
