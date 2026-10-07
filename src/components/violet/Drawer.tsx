'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconChip } from './IconChip';
import type { VioletTone } from './tokens';
import { useEscape, useLockScroll, usePortalNode } from './overlay';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  iconTone?: VioletTone;
  /** Panel width in px. Default 400. */
  width?: number;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Right-hand off-canvas panel, inset 14px from the edges. */
export function Drawer({
  open,
  onClose,
  title,
  sub,
  icon,
  iconTone = 'violet',
  width = 400,
  footer,
  children,
  className,
}: DrawerProps) {
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
        <div className="flex items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] px-5 pb-3.5 pt-[18px]">
          {icon && <IconChip tone={iconTone}>{icon}</IconChip>}
          <div className="min-w-0">
            {title && <div className="text-[14.5px] font-bold text-v-ink900">{title}</div>}
            {sub && <div className="text-[11px] text-v-ink400">{sub}</div>}
          </div>
          <span className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-wash2 hover:text-v-ink900"
          >
            <X className="h-[13px] w-[13px]" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center gap-2.5 border-t border-[rgba(22,23,42,0.07)] px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </>,
    node
  );
}
