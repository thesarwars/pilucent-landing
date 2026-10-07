import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-base font-bold leading-[1.5] tracking-[0.3px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Figma solid — Greyscale/900 bg, white text
        default:
          "bg-greyscale_900 text-white hover:bg-greyscale_900/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Figma outline — border Greyscale/900, transparent bg, dark text
        outline:
          "border border-greyscale_900 bg-transparent text-greyscale_900 hover:bg-greyscale_100",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-greyscale_100 hover:text-greyscale_900",
        link: "text-greyscale_900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm font-medium",
        sm: "h-8 rounded-[8px] px-3 text-xs font-medium",
        // Figma size — px-[24px] py-[21px], 16px bold
        lg: "h-[52px] rounded-[10px] px-6 py-[21px] text-base font-bold tracking-[0.3px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
