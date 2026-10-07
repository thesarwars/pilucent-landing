'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingActionBarProps {
  /** Tiny uppercase eyebrow on the left. */
  label?: React.ReactNode;
  /** Big tabular value under the label. */
  value?: React.ReactNode;
  /** Right-aligned actions. */
  children?: React.ReactNode;
  className?: string;
}

/** Dark sticky action bar that hugs the bottom of a scroll region. */
export function FloatingActionBar({ label, value, children, className }: FloatingActionBarProps) {
  return (
    <div className={cn('sticky bottom-3.5 z-[60] animate-v-rise font-jakarta', className)}>
      <div className="flex items-center gap-3.5 rounded-[18px] bg-v-ink900 py-3 pl-[22px] pr-3.5 shadow-v-bar">
        {(label || value) && (
          <div>
            {label && (
              <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white/50">
                {label}
              </div>
            )}
            {value && (
              <div className="mt-px text-[17px] font-extrabold tabular-nums text-white">{value}</div>
            )}
          </div>
        )}
        <span className="flex-1" />
        {children}
      </div>
    </div>
  );
}
