'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { V } from './tokens';

export type HeroTone = 'violet' | 'amber' | 'green' | 'rose';

const HERO_BG: Record<HeroTone, string> = {
  violet: V.gradients.heroViolet,
  amber: V.gradients.heroAmber,
  green: V.gradients.heroGreen,
  rose: V.gradients.heroRose,
};
const HERO_SHADOW: Record<HeroTone, string> = {
  violet: 'shadow-v-hero',
  amber: 'shadow-v-hero-amber',
  green: 'shadow-v-hero-green',
  rose: 'shadow-v-hero-rose',
};
const HERO_ORB: Record<HeroTone, string> = {
  violet: V.orb.violet,
  amber: V.orb.amber,
  green: V.orb.green,
  rose: V.orb.rose,
};

export interface HeroRow {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Color the value: positive (mint), negative (rose), or default (white). */
  tone?: 'pos' | 'neg' | 'default';
}

export interface DarkHeroProps {
  /** Tiny uppercase eyebrow above the number. */
  label: React.ReactNode;
  /** The headline figure. */
  value: React.ReactNode;
  caption?: React.ReactNode;
  tone?: HeroTone;
  /** Optional breakdown rows shown under a hairline. */
  rows?: HeroRow[];
  /** Optional thin progress bar (0–100) + caption. */
  progress?: { value: number; label?: React.ReactNode };
  /** Optional badge in the top-right (e.g. a stamp / "LIVE"). */
  badge?: React.ReactNode;
  /** Free-form footer (e.g. an icon + customer line). */
  footer?: React.ReactNode;
  className?: string;
}

const ROW_VALUE_COLOR: Record<NonNullable<HeroRow['tone']>, string> = {
  pos: 'text-[#A7F3D0]',
  neg: 'text-[#F9A8C7]',
  default: 'text-white',
};

export function DarkHero({
  label,
  value,
  caption,
  tone = 'violet',
  rows,
  progress,
  badge,
  footer,
  className,
}: DarkHeroProps) {
  const clamped = progress ? Math.max(0, Math.min(100, progress.value)) : 0;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-v-card p-[22px] font-jakarta text-white',
        HERO_SHADOW[tone],
        className
      )}
      style={{ backgroundImage: HERO_BG[tone] }}
    >
      {/* glow orb */}
      <div
        className="pointer-events-none absolute -right-[70px] -top-[70px] h-[200px] w-[200px] animate-v-float rounded-full"
        style={{ background: HERO_ORB[tone] }}
      />
      {badge && <div className="absolute right-4 top-4 z-[1]">{badge}</div>}

      <div className="relative">
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white/55">
          {label}
        </div>
        <div className="mt-1.5 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
          {value}
        </div>
        {caption && <div className="mt-1.5 text-xs text-white/60">{caption}</div>}

        {progress && (
          <div className="mt-3.5">
            <div className="h-[5px] overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#A78BFF,#7C4DFF)] transition-[width] duration-300"
                style={{ width: `${clamped}%` }}
              />
            </div>
            {progress.label && (
              <div className="mt-1.5 text-[11px] text-white/55">{progress.label}</div>
            )}
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="mt-3.5 border-t border-white/10 pt-3">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-[3px] text-[12.5px]">
                <span className="text-white/70">{r.label}</span>
                <span className={cn('font-bold tabular-nums', ROW_VALUE_COLOR[r.tone ?? 'default'])}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {footer && (
          <div className="mt-3.5 flex items-center gap-1.5 border-t border-white/10 pt-3 text-xs text-white/75">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
