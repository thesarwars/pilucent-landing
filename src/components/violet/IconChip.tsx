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

const SIZE = {
  sm: 'h-7 w-7 rounded-[9px] [&_svg]:h-[13px] [&_svg]:w-[13px]',
  md: 'h-8 w-8 rounded-[10px] [&_svg]:h-[15px] [&_svg]:w-[15px]',
  lg: 'h-10 w-10 rounded-xl [&_svg]:h-[18px] [&_svg]:w-[18px]',
};

export interface IconChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: VioletTone;
  size?: keyof typeof SIZE;
}

/** Square tinted chip housing a single functional icon. */
export function IconChip({ tone = 'violet', size = 'md', className, children, ...props }: IconChipProps) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', TONE[tone], SIZE[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
