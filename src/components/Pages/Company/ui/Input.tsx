import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {};

const Input = ({ className, ...rest }: InputProps) => {
  return (
    <input
      className={cn(
        " pl-2 py-3 text-sm text-black placeholder:text-accent_text_slate bg-transparent rounded-[4px] border-[1px] border-[#A1A7C4]",
        className
      )}
      {...rest}
    />
  );
};

export default Input;
