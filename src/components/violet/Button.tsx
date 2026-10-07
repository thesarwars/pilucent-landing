'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap font-jakarta font-bold outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-v-tint100 disabled:cursor-not-allowed disabled:shadow-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /** Solid violet — the one loud accent. */
        primary:
          'rounded-v-btn bg-v-primary text-white shadow-v-btn hover:bg-v-primary-hover disabled:bg-[#C9C2DD]',
        /** Glass — for actions that sit on the canvas / over heroes. */
        secondary:
          'rounded-v-btn border border-white/75 bg-white/60 text-v-ink700 backdrop-blur-md hover:text-v-primary',
        /** Outline — for actions on white cards. */
        outline: 'rounded-v-btn border border-v-border bg-white text-v-ink900 hover:bg-v-wash',
        /** Soft pill — quiet violet affordance inside cards. */
        soft: 'rounded-full bg-v-tint150 text-v-primary hover:bg-v-tint100',
        /** Ghost — tertiary. */
        ghost: 'rounded-v-btn bg-transparent text-v-ink400 hover:text-v-ink900',
        /** Dark — high-contrast action (e.g. on light toolbars). */
        dark: 'rounded-v-btn bg-v-ink900 text-white hover:bg-[#26273d]',
        /** Danger — destructive. */
        danger: 'rounded-v-btn bg-v-danger-bg text-v-danger-fg hover:brightness-95',
      },
      size: {
        sm: 'px-3.5 py-2 text-xs',
        md: 'px-[18px] py-2.5 text-[13.5px]',
        lg: 'px-6 py-3 text-sm',
        icon: 'h-9 w-9 rounded-[11px] p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface VioletButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const VioletButton = React.forwardRef<HTMLButtonElement, VioletButtonProps>(
  ({ className, variant, size, leftIcon, rightIcon, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
);
VioletButton.displayName = 'VioletButton';

export { buttonVariants };
