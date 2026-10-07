'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { avatarGradient, initials } from './tokens';

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  name?: string;
  /** Seed for the deterministic gradient (defaults to `name`). */
  seed?: string | number;
  /** Override the gradient entirely. */
  gradient?: string;
  /** Pixel size (width === height). Default 34. */
  size?: number;
  /** Rounded square instead of a circle. */
  square?: boolean;
  /** Override the rendered initials. */
  children?: React.ReactNode;
}

export function Avatar({
  name = '',
  seed,
  gradient,
  size = 34,
  square,
  className,
  style,
  children,
  ...props
}: AvatarProps) {
  const bg = gradient ?? avatarGradient(seed ?? name);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-jakarta font-extrabold text-white',
        square ? 'rounded-[11px]' : 'rounded-full',
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        backgroundImage: bg,
        boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.4)',
        ...style,
      }}
      {...props}
    >
      {children ?? initials(name)}
    </span>
  );
}

export interface AvatarStackItem {
  name?: string;
  seed?: string | number;
  gradient?: string;
}

/** Overlapping ring of avatars. */
export function AvatarStack({
  items,
  size = 22,
  className,
}: {
  items: AvatarStackItem[];
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('flex', className)}>
      {items.map((it, i) => (
        <Avatar
          key={i}
          {...it}
          size={size}
          className="border-[1.5px] border-white"
          style={{ marginLeft: i === 0 ? 0 : -7 }}
        />
      ))}
    </span>
  );
}
