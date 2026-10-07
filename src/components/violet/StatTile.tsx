'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconChip } from './IconChip';
import type { VioletTone } from './tokens';

const BAR_COLOR: Record<VioletTone, string> = {
  violet: '#7C4DFF',
  success: '#1FA97A',
  warn: '#B97608',
  danger: '#D2483E',
  rose: '#B43A6B',
  teal: '#0E7490',
  neutral: '#9A95AE',
};

export interface StatTileProps {
  icon: React.ReactNode;
  tone?: VioletTone;
  value: React.ReactNode;
  label: React.ReactNode;
  sub?: React.ReactNode;
  /** Small right-aligned share chip (e.g. "38%" or a count). */
  share?: React.ReactNode;
  /** Bottom progress edge width, 0–100 (omit to hide). */
  bar?: number;
  /** Override the bottom edge color (defaults to the tone color). */
  barColor?: string;
  active?: boolean;
  onClick?: () => void;
  /** Entrance stagger delay in seconds. */
  delay?: number;
  className?: string;
}

export function StatTile({
  icon,
  tone = 'violet',
  value,
  label,
  sub,
  share,
  bar,
  barColor,
  active,
  onClick,
  delay = 0,
  className,
}: StatTileProps) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative animate-v-pop overflow-hidden rounded-v-tile border-[1.5px] bg-white px-3.5 pb-4 pt-3.5 font-jakarta transition-all duration-200',
        active ? 'border-v-primary' : 'border-[rgba(22,23,42,0.09)]',
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-v-tile-hover',
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center">
        <IconChip tone={tone}>{icon}</IconChip>
        <span className="flex-1" />
        {share != null && (
          <span
            className={cn(
              'rounded-full px-2 py-[3px] text-[10px] font-extrabold tabular-nums',
              tone === 'neutral' ? 'bg-v-wash2 text-v-ink500' : 'bg-v-tint100 text-v-primary'
            )}
            style={
              tone !== 'neutral' && tone !== 'violet'
                ? { color: BAR_COLOR[tone], backgroundColor: `${BAR_COLOR[tone]}1F` }
                : undefined
            }
          >
            {share}
          </span>
        )}
      </div>
      <div className="mt-2.5 text-lg font-extrabold tabular-nums tracking-[-0.02em] text-v-ink900">
        {value}
      </div>
      <div className="mt-px truncate text-[11.5px] font-bold text-v-ink700">{label}</div>
      {sub && <div className="mt-0.5 truncate text-[11px] text-v-ink400">{sub}</div>}

      {bar != null && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-v-wash2">
          <div
            className="h-full origin-left animate-v-grow"
            style={{
              width: `${Math.max(0, Math.min(100, bar))}%`,
              background: barColor ?? BAR_COLOR[tone],
              animationDelay: `${delay}s`,
            }}
          />
        </div>
      )}
    </div>
  );
}
