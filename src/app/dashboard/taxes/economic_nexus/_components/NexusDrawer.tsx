'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useEscape, useLockScroll, usePortalNode } from '@/components/violet/overlay';

export interface NexusDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Panel width in px. Default 560. */
  width?: number;
  /**
   * Full-bleed header slot (renders its own close control). Lets each drawer own
   * a status-colored / dark-gradient hero edge-to-edge, unlike the stock Drawer.
   */
  header: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Right-hand off-canvas shell inset 14px from the edges — same chrome/motion as
 * the Violet `Drawer`, but with a caller-owned header so the hero can bleed to
 * the panel edges.
 */
export function NexusDrawer({
  open,
  onClose,
  width = 560,
  header,
  footer,
  children,
  className,
}: NexusDrawerProps) {
  const node = usePortalNode();
  useLockScroll(open);
  useEscape(open, onClose);

  if (!open || !node) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[380] animate-v-pop bg-[rgba(22,23,42,0.30)]"
      />
      <div
        role="dialog"
        aria-modal
        className={cn(
          'fixed bottom-3.5 right-3.5 top-3.5 z-[390] flex max-w-[94vw] animate-v-slide flex-col overflow-hidden rounded-v-modal bg-white font-jakarta shadow-v-modal',
          className
        )}
        style={{ width }}
      >
        <div className="shrink-0">{header}</div>
        <div className="flex-1 overflow-auto bg-v-card-subtle px-5 py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-[rgba(22,23,42,0.07)] bg-white px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </>,
    node
  );
}

/* ── Small shared bits used across the nexus drawers ─────────────────── */

/** Uppercase micro section header. */
export function MicroHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-v-ink400',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Labelled progress meter (value vs threshold), colored by tone. */
export function ThresholdMeter({
  label,
  percentLabel,
  valueLabel,
  ofLabel,
  percent,
  color,
}: {
  label: React.ReactNode;
  percentLabel: React.ReactNode;
  valueLabel: React.ReactNode;
  ofLabel: React.ReactNode;
  percent: number;
  color: string;
}) {
  const w = Math.max(2, Math.min(100, percent));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-semibold text-v-ink700">{label}</span>
        <span className="text-[12px] font-bold tabular-nums" style={{ color }}>
          {percentLabel}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-v-wash2">
        <div
          className="h-full origin-left animate-v-grow rounded-full"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-[15px] font-extrabold tabular-nums tracking-[-0.01em] text-v-ink900">
          {valueLabel}
        </span>
        <span className="text-[11.5px] tabular-nums text-v-ink400">{ofLabel}</span>
      </div>
    </div>
  );
}

/** Definition-style row for rule / summary cards. */
export function RuleRow({
  label,
  value,
  last,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-2.5',
        !last && 'border-b border-[rgba(22,23,42,0.06)]'
      )}
    >
      <span className="shrink-0 text-[12.5px] text-v-ink500">{label}</span>
      <span className="text-right text-[12.5px] font-bold text-v-ink900">{value}</span>
    </div>
  );
}
