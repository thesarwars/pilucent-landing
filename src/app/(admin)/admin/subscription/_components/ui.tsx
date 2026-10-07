'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ *
 * Super Admin · Subscription Management — shared tokens & primitives
 * (figma-design-prompt.md color system)
 * ------------------------------------------------------------------ */
export const ADMIN = {
  ink900: '#0B1020',
  ink800: '#111935',
  surface: '#F5F6FB',
  card: '#FFFFFF',
  line: '#E7E8F2',
  brand: '#5B5BF0',
  violet: '#7C5CFC',
  good: '#0FB67A',
  warn: '#F59E0B',
  bad: '#F2415A',
  info: '#2E8FF2',
  gold: '#C9A227',
};

export type STone = 'good' | 'warn' | 'bad' | 'info' | 'brand' | 'gold' | 'mute';

const toneMap: Record<STone, { fg: string; bg: string; dot: string }> = {
  good: { fg: 'text-[#0B815A]', bg: 'bg-[#E2F7EF]', dot: 'bg-[#0FB67A]' },
  warn: { fg: 'text-[#9A6A0B]', bg: 'bg-[#FDF3E0]', dot: 'bg-[#F59E0B]' },
  bad: { fg: 'text-[#C42A41]', bg: 'bg-[#FCE7EA]', dot: 'bg-[#F2415A]' },
  info: { fg: 'text-[#1E6FCC]', bg: 'bg-[#E6F1FD]', dot: 'bg-[#2E8FF2]' },
  brand: { fg: 'text-[#4B4BD4]', bg: 'bg-[#ECECFE]', dot: 'bg-[#5B5BF0]' },
  gold: { fg: 'text-[#9A7B12]', bg: 'bg-[#FAF3DC]', dot: 'bg-[#C9A227]' },
  mute: { fg: 'text-[#5B6478]', bg: 'bg-[#EEF0F6]', dot: 'bg-[#8A93A6]' },
};

export const SBadge = ({
  tone = 'mute',
  dot = true,
  children,
  className,
}: {
  tone?: STone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const t = toneMap[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold',
        t.fg,
        t.bg,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  );
};

/* Monospace cell for codes / ids / prices */
export const Mono = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn('font-mono text-[13px] tracking-tight text-[#111935]', className)}>
    {children}
  </span>
);

/* Tiny inline progress bar (used in table cells / KPIs) */
export const MiniBar = ({
  value,
  tone = 'brand',
  className,
}: {
  value: number; // 0..100
  tone?: 'brand' | 'good' | 'warn' | 'bad';
  className?: string;
}) => {
  const fill =
    tone === 'good'
      ? 'bg-[#0FB67A]'
      : tone === 'warn'
        ? 'bg-[#F59E0B]'
        : tone === 'bad'
          ? 'bg-[#F2415A]'
          : 'bg-gradient-to-r from-[#5B5BF0] to-[#7C5CFC]';
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0F6]', className)}>
      <div className={cn('h-full rounded-full', fill)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
};

/* Page title block used at the top of each screen */
export const PageHead = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="font-sora text-[21px] font-extrabold tracking-[-0.4px] text-[#0B1020]">{title}</h1>
      {subtitle && <p className="mt-0.5 text-[13px] text-[#5B6478]">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* MRR/ARR-style segmented control */
export const SSegmented = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) => (
  <div className="flex rounded-[11px] bg-[#EEF0F6] p-1 text-[12.5px] font-semibold">
    {options.map(opt => (
      <button
        key={opt.id}
        type="button"
        onClick={() => onChange(opt.id)}
        className={cn(
          'rounded-[9px] px-3 py-1.5 transition-all',
          value === opt.id
            ? 'bg-white text-[#0B1020] shadow-[0_2px_6px_-2px_rgba(16,22,46,.12)]'
            : 'text-[#6B7090] hover:text-[#0B1020]'
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* Primary action button */
export const SBtn = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'soft' | 'danger';
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}) => {
  const styles = {
    primary:
      'bg-gradient-to-r from-[#5B5BF0] to-[#7C5CFC] text-white shadow-[0_8px_20px_-8px_rgba(91,91,240,.7)] hover:brightness-105',
    ghost: 'border border-[#E7E8F2] bg-white text-[#0B1020] hover:border-[#D4D7E8]',
    soft: 'bg-[#ECECFE] text-[#5B5BF0] hover:bg-[#E0E0FC]',
    danger: 'bg-[#FDE5E9] text-[#F2415A] hover:bg-[#FCD5DB]',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1.5 rounded-[11px] px-4 text-[13px] font-semibold transition-all active:translate-y-px disabled:opacity-45',
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

/* Form field */
export const SField = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-[12px] font-semibold text-[#444A66]">{label}</span>
    <div className="mt-1.5">{children}</div>
    {hint && <p className="mt-1 text-[11.5px] text-[#9AA0BF]">{hint}</p>}
  </label>
);

export const SInput = ({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={cn(
      'h-10 w-full rounded-[11px] border border-[#E7E8F2] bg-white px-3 text-[13.5px] text-[#0B1020] outline-none focus:border-[#5B5BF0] focus:ring-[3px] focus:ring-[rgba(91,91,240,.16)]',
      mono && 'font-mono'
    )}
  />
);

export const SSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="h-10 w-full rounded-[11px] border border-[#E7E8F2] bg-white px-3 text-[13.5px] text-[#0B1020] outline-none focus:border-[#5B5BF0] focus:ring-[3px] focus:ring-[rgba(91,91,240,.16)]"
  >
    {options.map(o => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

export const STextarea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <textarea
    value={value}
    rows={rows}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full resize-y rounded-[11px] border border-[#E7E8F2] bg-white px-3 py-2.5 text-[13.5px] text-[#0B1020] outline-none focus:border-[#5B5BF0] focus:ring-[3px] focus:ring-[rgba(91,91,240,.16)]"
  />
);

export const SCheckbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#444A66]">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-[#E7E8F2] text-[#5B5BF0] focus:ring-[#5B5BF0]"
    />
    {label}
  </label>
);

export const SDateTime = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <input
    type="datetime-local"
    value={value}
    onChange={e => onChange(e.target.value)}
    className="h-10 w-full rounded-[11px] border border-[#E7E8F2] bg-white px-3 text-[13.5px] text-[#0B1020] outline-none focus:border-[#5B5BF0] focus:ring-[3px] focus:ring-[rgba(91,91,240,.16)]"
  />
);

/* Ghost text button for card footers / view-all links */
export const SLinkBtn = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'text-[12.5px] font-semibold text-[#5B5BF0] transition-colors hover:text-[#4B4BD4]',
      className
    )}
  >
    {children}
  </button>
);
