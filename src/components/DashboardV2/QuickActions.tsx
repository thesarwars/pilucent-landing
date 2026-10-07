'use client';

import React from 'react';
import {
  ArrowRight,
  Banknote,
  CreditCard,
  FileText,
  Package,
  ReceiptText,
  Users,
  WalletCards,
} from 'lucide-react';
import { dashboardData } from '@/lib/dashboard-data';
import { CARD_TONE, Panel, TONE_ICON, type Tone } from './primitives';

const actionIcons = [
  <ReceiptText key="1" size={20} />,
  <CreditCard key="2" size={20} />,
  <WalletCards key="3" size={20} />,
  <Banknote key="4" size={20} />,
  <Package key="5" size={20} />,
  <FileText key="6" size={20} />,
  <Users key="7" size={20} />,
];

export default function QuickActions() {
  return (
    <Panel title="Quick Actions" eyebrow="Most used workflows" action="View all actions" tone="purple">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {dashboardData.quickActions.map((action, index) => (
          <button
            key={action.title}
            className={`group flex flex-col gap-2 rounded-xl border p-4 text-left shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,24,40,0.1)] ${CARD_TONE[action.tone as Tone] ?? CARD_TONE.purple}`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${TONE_ICON[action.tone as Tone] ?? TONE_ICON.purple}`}
            >
              {actionIcons[index]}
            </div>
            <span className="text-sm font-normal text-accent_text_black">{action.title}</span>
            <small className="text-[11px] font-normal text-accent_text_black/60">
              {action.description}
            </small>
            <ArrowRight
              size={15}
              className="text-[#6B5CE7] transition-transform group-hover:translate-x-1"
            />
          </button>
        ))}
      </div>
    </Panel>
  );
}
