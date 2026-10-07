'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * The app canvas behind Violet Suite content: a faint violet gradient wash,
 * Plus Jakarta Sans, and Ink-900 default text. Wrap any Violet page/section so
 * descendants inherit the font + background. (Note: Modal/Drawer portal outside
 * this subtree and set `font-jakarta` themselves.)
 */
export function VioletSurface({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('min-h-full bg-v-canvas font-jakarta text-v-ink900', className)} {...props}>
      {children}
    </div>
  );
}
