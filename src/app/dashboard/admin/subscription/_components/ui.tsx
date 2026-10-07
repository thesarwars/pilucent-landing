'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ *
 * Shared violet/glass primitives for the Subscription module.
 * ------------------------------------------------------------------ */

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';

export const toneBadge: Record<Tone, string> = {
  success: 'bg-[#E4F6EF] text-[#1FA97A]',
  warning: 'bg-[#FDF2DE] text-[#B97608]',
  error: 'bg-[#FCE8E8] text-[#EF4444]',
  info: 'bg-[#E6EEFE] text-[#1d4ed8]',
  primary: 'bg-[#EEE9FF] text-[#7C4DFF]',
  neutral: 'bg-[rgba(22,23,42,0.05)] text-[#6F6A85]',
};

export const toneDot: Record<Tone, string> = {
  success: 'bg-[#1FA97A]',
  warning: 'bg-[#F59E0B]',
  error: 'bg-[#EF4444]',
  info: 'bg-[#3B82F6]',
  primary: 'bg-[#7C4DFF]',
  neutral: 'bg-[#6F6A85]',
};

export const Badge = ({
  tone = 'neutral',
  dot,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex h-[26px] items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold',
      toneBadge[tone],
      className
    )}
  >
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', toneDot[tone])} />}
    {children}
  </span>
);

export const Card = ({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-2xl border border-white/90 bg-white p-6 shadow-[0_1px_2px_rgba(22,23,42,.04),0_18px_40px_-24px_rgba(22,23,42,.26)]',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

export const Eyebrow = ({
  icon: Icon,
  children,
}: {
  icon?: any;
  children: React.ReactNode;
}) => (
  <p className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.6px] text-[#6F6A85]">
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </p>
);

/* ---- Button ---- */
type BtnVariant = 'primary' | 'dark' | 'secondary' | 'ghost' | 'danger' | 'dangerghost';
type BtnSize = 'sm' | 'md' | 'lg';

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-[#7C4DFF] text-white shadow-[0_8px_22px_-8px_rgba(124,77,255,.7)] hover:bg-[#8B5CF6]',
  dark: 'bg-[#0E1020] text-white hover:bg-[#1b1d33]',
  secondary: 'bg-white text-[#16172A] ring-1 ring-inset ring-[#D8D2EC] hover:ring-[#7C4DFF] hover:text-[#7C4DFF]',
  ghost: 'bg-[rgba(124,77,255,.08)] text-[#7C4DFF] hover:bg-[rgba(124,77,255,.14)]',
  danger: 'bg-[#EF4444] text-white shadow-[0_8px_22px_-8px_rgba(239,68,68,.6)] hover:bg-[#dc2626]',
  dangerghost: 'bg-[#FCE8E8] text-[#EF4444] hover:bg-[#fbd5d5]',
};

const btnSizes: Record<BtnSize, string> = {
  sm: 'h-9 px-[15px] text-[13.5px] rounded-[11px]',
  md: 'h-11 px-5 text-[14.5px] rounded-[14px]',
  lg: 'h-[52px] px-[26px] text-[15.5px] rounded-[14px]',
};

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: any;
  iconRight?: any;
}

export const Btn = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  ...rest
}: BtnProps) => {
  const iSize = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-[9px] font-semibold tracking-[-0.1px] transition-all duration-150 active:translate-y-[.5px] active:scale-[.994] disabled:opacity-45 disabled:pointer-events-none',
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...rest}
    >
      {Icon && <Icon className={iSize} />}
      {children}
      {IconRight && <IconRight className={iSize} />}
    </button>
  );
};

/* ---- Progress bar (usage) ---- */
export const ProgressBar = ({
  used,
  limit,
  className,
}: {
  used: number;
  limit: number;
  className?: string;
}) => {
  const pct = Math.min(100, (used / limit) * 100);
  const over = used > limit;
  const warn = !over && pct >= 85;
  const fill = over ? '#EF4444' : warn ? '#F59E0B' : '#7C4DFF';
  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-[#E9E5F5]', className)}>
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: over
            ? 'repeating-linear-gradient(45deg,#EF4444 0 8px,#f6726f 8px 16px)'
            : fill,
        }}
      />
    </div>
  );
};

/* ---- Stepper ---- */
export const Stepper = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="inline-flex h-11 w-[132px] items-center justify-between rounded-[13px] border border-[#D8D2EC] bg-white px-1">
    <button
      onClick={() => onChange(Math.max(min, value - step))}
      disabled={value <= min}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#6F6A85] transition-colors hover:bg-[#F4F1FF] disabled:opacity-30"
    >
      <Minus className="h-4 w-4" />
    </button>
    <span className="text-[15px] font-bold text-[#16172A] [font-variant-numeric:tabular-nums]">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + step))}
      disabled={value >= max}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#6F6A85] transition-colors hover:bg-[#F4F1FF] disabled:opacity-30"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

/* ---- Segmented control ---- */
export const Segmented = ({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) => (
  <div className={cn('inline-flex items-center gap-1 rounded-[13px] bg-[#E9E5F5] p-1', className)}>
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={cn(
          'flex h-9 items-center gap-2 rounded-[10px] px-4 text-[13.5px] font-semibold transition-all',
          value === o.value
            ? 'bg-white text-[#16172A] shadow-[0_4px_12px_-6px_rgba(22,23,42,.4)]'
            : 'text-[#6F6A85] hover:text-[#16172A]'
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ---- Toggle ---- */
export const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      'relative h-7 w-12 rounded-[14px] transition-colors',
      checked ? 'bg-[#7C4DFF]' : 'bg-[#D8D2EC]'
    )}
  >
    <span
      className={cn(
        'absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all duration-200',
        checked ? 'left-[23px]' : 'left-[3px]'
      )}
    />
  </button>
);

/* ---- Icon chip ---- */
export const IconChip = ({
  icon: Icon,
  active,
  className,
}: {
  icon: any;
  active?: boolean;
  className?: string;
}) => (
  <span
    className={cn(
      'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
      active ? 'bg-[#7C4DFF] text-white' : 'bg-[#EEE9FF] text-[#7C4DFF]',
      className
    )}
  >
    <Icon className="h-5 w-5" />
  </span>
);

/* ---- Avatar ---- */
export const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className="flex items-center justify-center bg-[linear-gradient(140deg,#7C4DFF,#A78BFF)] font-bold text-white"
      style={{ width: size, height: size, borderRadius: size * 0.32, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
};
