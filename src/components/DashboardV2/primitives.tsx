'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const PURPLE = '#6B5CE7';

export type Tone = 'purple' | 'green' | 'blue' | 'orange' | 'rose' | 'cyan';

export const TONES: Tone[] = ['purple', 'green', 'blue', 'orange', 'rose', 'cyan'];

export const TONE_CHIP: Record<Tone, string> = {
  purple: 'bg-[#EBEBFF] text-[#6B5CE7]',
  green: 'bg-[#E6FBEF] text-[#0BAC24]',
  blue: 'bg-[#EAF1FF] text-[#3462FA]',
  orange: 'bg-[#FFF3DF] text-[#F0A541]',
  rose: 'bg-[#FFE8EC] text-[#E03137]',
  cyan: 'bg-[#E2F4FF] text-[#3FA9F5]',
};

export const TONE_ICON: Record<Tone, string> = {
  purple: 'text-[#6B5CE7]',
  green: 'text-[#0BAC24]',
  blue: 'text-[#3462FA]',
  orange: 'text-[#F0A541]',
  rose: 'text-[#E03137]',
  cyan: 'text-[#3FA9F5]',
};

export const CARD_TONE: Record<Tone, string> = {
  purple: 'border-[#E6E1FB] bg-gradient-to-br from-[#F3F0FF] to-white/70',
  green: 'border-[#CFEFDD] bg-gradient-to-br from-[#ECFCF3] to-white/70',
  blue: 'border-[#D7E5FF] bg-gradient-to-br from-[#EEF4FF] to-white/70',
  orange: 'border-[#FBE7C6] bg-gradient-to-br from-[#FFF7EA] to-white/70',
  rose: 'border-[#FBD7DD] bg-gradient-to-br from-[#FFEEF1] to-white/70',
  cyan: 'border-[#CFE9FB] bg-gradient-to-br from-[#EAF7FF] to-white/70',
};

export const PANEL_BASE =
  'rounded-2xl border shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-all duration-200 ';

/** Modern chart palette (solid + matching gradient stops). */
export const CHART_COLORS = ['#6D5DE7', '#22C55E', '#F59E0B', '#3B82F6', '#F43F5E', '#06B6D4'];

export const CHART_GRADIENT_STOPS: [string, string][] = [
  ['#8B7CF6', '#6D5DE7'],
  ['#4ADE80', '#22C55E'],
  ['#FBBF24', '#F59E0B'],
  ['#60A5FA', '#3B82F6'],
  ['#FB7185', '#F43F5E'],
  ['#22D3EE', '#06B6D4'],
];

export const chartColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];
export const chartGradId = (prefix: string, i: number) =>
  `${prefix}-${i % CHART_GRADIENT_STOPS.length}`;

/** Returns an SVG <defs> with vertical gradients; inline directly inside a recharts chart. */
export function gradientDefs(prefix: string) {
  return (
    <defs>
      {CHART_GRADIENT_STOPS.map(([from, to], i) => (
        <linearGradient key={i} id={`${prefix}-${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      ))}
    </defs>
  );
}

export const toneByIndex = (i: number) => TONE_CHIP[TONES[i % TONES.length]];

export function Panel({
  title,
  eyebrow,
  action,
  tone = 'purple',
  children,
  actionHref,
  className,
  bodyClassName,
}: {
  title?: string;
  eyebrow?: string;
  action?: string;
  actionHref?: string;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(PANEL_BASE, CARD_TONE[tone], 'flex flex-col p-4 text-sm sm:p-5', className)}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-normal text-accent_text_black">{title}</h2>
            )}
            {eyebrow && (
              <p className="mt-0.5 text-xs font-normal text-accent_text_black/45">{eyebrow}</p>
            )}
          </div>
          {action && (
            <Link
              href={actionHref || '#'}
              className="group inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-xs font-normal text-accent_text_black/70 transition-colors hover:text-accent_text_black"
            >
              {action}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}

const GRADIENT_SOLID: Record<string, string> = {
  plRevenue: '#6D5DE7',
  plExpense: '#F59E0B',
  ieIncome: '#6D5DE7',
  ieExpense: '#F43F5E',
  taxViolet: '#6D5DE7',
  taxAmber: '#F59E0B',
  taxEmerald: '#10B981',
  v2Inflow: '#6D5DE7',
  v2InflowStroke: '#6D5DE7',
  v2Outflow: '#F43F5E',
  v2OutflowStroke: '#F43F5E',
};

function resolveColor(color?: string) {
  if (!color) return '#6B5CE7';
  const match = /url\(#(.+?)\)/.exec(color);
  if (match) return GRADIENT_SOLID[match[1]] ?? '#6B5CE7';
  return color;
}

export function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white bg-white px-3 py-2 shadow-md">
      {label && <p className="mb-1 text-xs font-normal text-accent_text_black">{label}</p>}
      {payload.map((entry) => (
        <div
          key={`${entry.name}-${entry.value}`}
          className="flex items-center gap-2 text-xs font-normal text-accent_text_black/70"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: resolveColor(entry.color || entry.fill) }}
          />
          <span>{entry.name}:</span>
          <span className="font-normal text-accent_text_black">
            ${Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LegendList({
  items,
}: {
  items: Array<{ name: string; value: string; color: string }>;
}) {
  return (
    <div className="flex-1 space-y-2.5">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-2 text-[13px]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
          <p className="flex-1 truncate font-normal text-accent_text_black/60">{item.name}</p>
          <strong className="font-normal text-accent_text_black">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function TrendText({
  trend,
  trendDirection,
}: {
  trend: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}) {
  console.log(trendDirection);
  return (
    <span
      className={`text-xs font-normal text-accent_text_black ${trendDirection === 'up' ? 'text-green-500' : trendDirection === 'down' ? 'text-red-500' : trendDirection === 'neutral' ? 'text-blue-500' : 'text-accent_text_black'}`}
    >
      {trend}
    </span>
  );
}
