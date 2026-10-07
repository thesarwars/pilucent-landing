import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  isLoading?: boolean;
};

const Button = ({
  variant = "default",
  className,
  children,
  isLoading = false,
  ...rest
}: ButtonProps) => {
  const variantStyles: Record<typeof variant, string> = {
    default: "bg-accent_bg_blue",
    outline:
      " border-[1px] border-[#6A6EF6] bg-transparent text-accent_soft_blue",
  };
  return (
    <button
      className={cn(
        "w-[142px] font-semibold text-[14px] leading-[21px] text-white h-[48px] inline-flex justify-center items-center rounded-[8px]",
        variantStyles[variant],
        className
      )}
      disabled={isLoading}
      {...rest}
    >
        {isLoading && (
          <p
            className={cn(
              "mr-1 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white border-t-[#6A6EF6]",
              
            )}
          />
        )}
      {children}
    </button>
  );
};

export default Button;
