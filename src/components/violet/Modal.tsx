'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconChip } from './IconChip';
import type { VioletTone } from './tokens';
import { useEscape, useLockScroll, usePortalNode } from './overlay';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  iconTone?: VioletTone;
  /** Panel width in px. Default 480. */
  width?: number;
  /** Sticky footer (typically a button row). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  sub,
  icon,
  iconTone = 'violet',
  width = 480,
  footer,
  children,
  className,
}: ModalProps) {
  const node = usePortalNode();
  useLockScroll(open);
  useEscape(open, onClose);

  if (!open || !node) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[400] flex animate-v-pop items-center justify-center bg-[rgba(22,23,42,0.36)] p-6 backdrop-blur-[3px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        className={cn(
          'flex max-h-[90vh] w-full animate-v-pop flex-col overflow-hidden rounded-v-modal bg-white font-jakarta shadow-v-modal',
          className
        )}
        style={{ maxWidth: width }}
      >
        {(title || icon) && (
          <div className="flex items-center gap-3 border-b border-[rgba(22,23,42,0.07)] px-6 py-4">
            {icon && <IconChip tone={iconTone}>{icon}</IconChip>}
            <div className="min-w-0">
              {title && <div className="text-base font-extrabold text-v-ink900">{title}</div>}
              {sub && <div className="text-[11.5px] text-v-ink400">{sub}</div>}
            </div>
            <span className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
            >
              <X className="h-[15px] w-[15px]" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center gap-2.5 border-t border-[rgba(22,23,42,0.07)] px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    node
  );
}
