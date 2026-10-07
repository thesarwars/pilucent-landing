'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { VioletTone } from './tokens';

const TONE: Record<VioletTone, string> = {
  violet: 'bg-v-tint100 text-v-primary',
  success: 'bg-v-success-bg text-v-success-fg',
  warn: 'bg-v-warn-bg text-v-warn-fg',
  danger: 'bg-v-danger-bg text-v-danger-fg',
  rose: 'bg-v-rose-bg text-v-rose-fg',
  teal: 'bg-v-teal-bg text-v-teal-fg',
  neutral: 'bg-v-wash2 text-v-ink500',
};

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: VioletTone;
  /** Show a leading status dot in the current color. */
  dot?: boolean;
  /** Optional leading icon (overrides the dot). */
  icon?: React.ReactNode;
}

/** Status pill / badge. */
export function Chip({ tone = 'neutral', dot, icon, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-jakarta text-[11.5px] font-bold',
        TONE[tone],
        className
      )}
      {...props}
    >
      {icon ?? (dot ? <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-current" /> : null)}
      {children}
    </span>
  );
}
