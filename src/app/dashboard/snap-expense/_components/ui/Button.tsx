import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children?: React.ReactNode;
};

function Button({
  variant = 'default',
  size = 'medium',
  className,
  children,
  ...props
}: ButtonProps) {
  const variantStyles: Record<typeof variant, string> = {
    default: 'bg-white text-snap_grey',
    outline: 'border border-snap_grey bg-transparent text-snap_grey',
  };
  const sizeStyles: Record<typeof size, string> = {
    small: 'text-xs rounded-md px-3 py-2',
    medium: 'text-sm rounded-lg px-4 py-2',
    large: 'text-base rounded-xl px-5 py-2.5',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center bg-white text-snap_grey',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
