'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconChip } from './IconChip';
import type { VioletTone } from './tokens';

/** White rounded card with the signature soft floating shadow. */
export const VioletCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-v-card bg-white font-jakarta shadow-v-card', className)}
      {...props}
    />
  )
);
VioletCard.displayName = 'VioletCard';

export interface VioletCardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  iconTone?: VioletTone;
  title: React.ReactNode;
  sub?: React.ReactNode;
  /** Right-aligned slot (chip / search / button). */
  right?: React.ReactNode;
}

export function VioletCardHeader({
  icon,
  iconTone = 'violet',
  title,
  sub,
  right,
  className,
  ...props
}: VioletCardHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2.5 px-[22px] py-3.5', className)} {...props}>
      {icon && <IconChip tone={iconTone}>{icon}</IconChip>}
      <div className="min-w-0">
        <div className="text-sm font-bold text-v-ink900">{title}</div>
        {sub && <div className="text-[11.5px] text-v-ink400">{sub}</div>}
      </div>
      {right != null && (
        <>
          <span className="flex-1" />
          {right}
        </>
      )}
    </div>
  );
}

/** Hairline divider used between card sections. */
export function VioletCardDivider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-[rgba(22,23,42,0.07)]', className)} />;
}
