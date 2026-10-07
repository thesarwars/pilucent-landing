import { cn } from '@/lib/utils';
import { forwardRef, ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  spinnerClassName?: string;
  variant?: any;
  size?: any;
  asChild?: any;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, isLoading, disabled, spinnerClassName, variant, size, asChild = false, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-md px-6 py-3 text-base font-medium hover:bg-opacity-90 active:scale-[0.98]',
          className
        )}
        {...props}
        disabled={isLoading || disabled}
      >
        {isLoading && (
          <p
            className={cn(
              'mr-1 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white border-t-[#6A6EF6]',
              spinnerClassName
            )}
          />
        )}
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
