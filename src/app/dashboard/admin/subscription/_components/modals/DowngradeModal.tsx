'use client';

import React from 'react';
import {
  AlertTriangle,
  X,
  Users,
  UserCheck,
  Boxes,
  FileText,
  Info,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Btn, Badge, type Tone } from '../ui';
import { useNav } from '../nav';
import { Modal } from '../overlays';

/* ------------------------------------------------------------------ *
 * Local sub-components
 * ------------------------------------------------------------------ */

interface GuardItemProps {
  icon: React.ElementType;
  label: string;
  detail: string;
  badgeTone: Tone;
  badgeLabel: string;
  last?: boolean;
}

const GuardItem = ({ icon: Icon, label, detail, badgeTone, badgeLabel, last }: GuardItemProps) => (
  <>
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E9E5F5] text-[#7C4DFF]">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#16172A] leading-tight">{label}</p>
          <p className="text-[12.5px] text-[#6F6A85] leading-tight mt-0.5">{detail}</p>
        </div>
      </div>
      {/* Right */}
      <Badge tone={badgeTone} className="flex-shrink-0 whitespace-nowrap">
        {badgeLabel}
      </Badge>
    </div>
    {!last && (
      <div className="h-px bg-[rgba(22,23,42,0.07)]" />
    )}
  </>
);

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

export default function DowngradeModal() {
  const nav = useNav();

  return (
    <Modal open={nav.modal === 'downgrade'} onClose={nav.closeModal} width={620}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          {/* Warning icon chip */}
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDF2DE] text-[#B97608] mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2
              className="font-extrabold text-[#16172A] leading-tight tracking-[-0.3px]"
              style={{ fontSize: 22 }}
            >
              Downgrade Review Required
            </h2>
            <p className="mt-1 text-[13.5px] text-[#6F6A85] leading-snug">
              Some usage is above the selected plan&apos;s limits.
            </p>
          </div>
        </div>
        {/* Close X */}
        <button
          onClick={nav.closeModal}
          className="flex-shrink-0 rounded-lg p-1.5 text-[#6F6A85] transition-colors hover:bg-[#F4F1FF]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Guard items */}
      <div className="rounded-2xl border border-[#D8D2EC] bg-white px-4 mb-5">
        <GuardItem
          icon={Users}
          label="Employees"
          detail="30 of 25 included"
          badgeTone="error"
          badgeLabel="5 over limit"
        />
        <GuardItem
          icon={UserCheck}
          label="Users"
          detail="8 of 10 included"
          badgeTone="success"
          badgeLabel="Within limit"
        />
        <GuardItem
          icon={Boxes}
          label="Inventory module"
          detail="Tracking & stock"
          badgeTone="warning"
          badgeLabel="Loses access"
        />
        <GuardItem
          icon={FileText}
          label="Advanced reports"
          detail="Custom report builder"
          badgeTone="warning"
          badgeLabel="Read-only"
          last
        />
      </div>

      {/* Info note pill */}
      <div className="flex items-center gap-2.5 rounded-xl bg-[#E6EEFE] px-4 py-3 mb-6">
        <Info className="h-4 w-4 flex-shrink-0 text-[#1d4ed8]" />
        <p className="text-[13px] font-medium text-[#1d4ed8] leading-snug">
          Changes take effect at your next renewal — Jul 08, 2026.
        </p>
      </div>

      {/* Footer action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left */}
        <Btn
          variant="secondary"
          size="md"
          onClick={() => nav.toast({ tone: 'info', title: 'Support notified' })}
        >
          Contact Support
        </Btn>

        {/* Right group */}
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="secondary" size="md" onClick={() => nav.closeModal()}>
            Keep Current Plan
          </Btn>
          <Btn
            variant="primary"
            size="md"
            onClick={() => {
              nav.closeModal();
              nav.toast({
                tone: 'info',
                icon: Calendar,
                title: 'Downgrade scheduled',
                msg: 'Starter takes effect Jul 08, 2026. Cancel anytime.',
              });
            }}
          >
            Schedule for Renewal
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
