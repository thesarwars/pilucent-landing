import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

import "./input.css";

type InputProps = {
  placeholder?: string;
  type: string;
  className?: string;
  value?: string | number;
  required?: boolean;
  name?: string;
  defaultValue?: string;
  min?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({
  placeholder,
  className,
  type,
  defaultValue,
  value,
  name,
  min,
  required = false,
  onChange,
}: InputProps) => {
  return (
    <input
      type={type}
      name={name}
      defaultValue={value === undefined ? defaultValue : undefined} // Use defaultValue only if value is undefined
      value={value} // Use value if provided
      placeholder={placeholder}
      min={min}
      className={cn(
        "bg-transparent border border-gray-300 outline-none placeholder:text-gray-500",
        className,
      )}
      onChange={onChange}
      required={required}
    />
  );
};

export default Input;
