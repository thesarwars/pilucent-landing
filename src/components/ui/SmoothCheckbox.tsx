"use client";

import { cn } from "@/lib/utils";

interface SmoothCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  htmlFor?: string;
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  bgClassName?: string;
}

export default function SmoothCheckbox({
  htmlFor,
  checked,
  onCheckedChange,
  className,
  bgClassName = "",
  ...props
}: SmoothCheckboxProps) {
  return (
    <label className="cursor-pointer">
      <input
        // id={htmlFor}
        type="checkbox"
        checked={checked}
        {...props}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={cn(
          "relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#090e4f29] transition-all duration-200 ease-in-out before:absolute before:left-1/2 before:top-1/2 before:h-3.5 before:w-3.5 before:-translate-x-1/2 before:-translate-y-1/2 before:transform before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDZMOSAxN0w0IDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] before:bg-contain before:bg-center before:bg-no-repeat before:opacity-0 before:transition-opacity before:duration-200 before:content-[''] checked:border-[#3462FA] checked:bg-blue-500 checked:before:opacity-100 hover:bg-gray-100 checked:hover:bg-[#3462FA] focus:outline-none",
          className,
          bgClassName,
        )}
      />
    </label>
  );
}
