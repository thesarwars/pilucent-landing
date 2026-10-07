'use client';

import * as React from 'react';
import { GraduationCap } from 'lucide-react';
import { Modal, VioletButton } from '@/components/violet';

export interface LearnModalProps {
  open: boolean;
  onClose: () => void;
}

const CARDS = [
  {
    title: 'Thresholds vary by state',
    body: 'Each state sets its own sales and/or transaction-count threshold — commonly $100k in sales or 200 transactions, though some (like California & Texas) use a higher $500k dollar test and no transaction count.',
  },
  {
    title: 'Measured by ship-to',
    body: 'Nexus is based on where goods are delivered, not where your business sits. We total taxable sales by the destination state over each state’s measurement window.',
  },
  {
    title: 'Approaching vs met',
    body: 'At ≥80% of a threshold a state is “approaching” and we alert you. Once sales or transactions cross the line the state is “met” — you have an obligation to register.',
  },
  {
    title: 'Register & collect',
    body: 'When a state is met, register with its tax agency, then start collecting and remitting on new invoices. We hand the new agency off to Sales tax so filing continues there.',
  },
];

export function LearnModal({ open, onClose }: LearnModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={480}
      icon={<GraduationCap />}
      title="How economic nexus works"
      sub="A quick primer on state thresholds"
      footer={
        <>
          <span className="flex-1" />
          <VioletButton variant="primary" onClick={onClose}>
            Got it
          </VioletButton>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        {CARDS.map((c, i) => (
          <div
            key={c.title}
            className="flex gap-3 rounded-v-tile border border-[rgba(22,23,42,0.09)] bg-white p-3.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-v-tint100 text-[12px] font-extrabold text-v-primary">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-v-ink900">{c.title}</div>
              <div className="mt-0.5 text-[12px] leading-relaxed text-v-ink500">{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
