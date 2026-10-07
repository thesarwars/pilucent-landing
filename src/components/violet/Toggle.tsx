'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** 32×18 switch with a sliding 14px knob. */
export function Toggle({ checked, onChange, disabled, className, ...aria }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-v-primary' : 'bg-v-border',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      {...aria}
    >
      <span
        className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all duration-200"
        style={{ left: checked ? '16px' : '2px' }}
      />
    </button>
  );
}
