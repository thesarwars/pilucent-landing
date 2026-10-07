import { ChangeEvent } from "react";
import "./checkbox.css";
import { cn } from "@/lib/utils";
const Checkbox = ({
  value,
  onChange,
  checked,
  labelText,
  className,
  checkboxClass,
  ...props
}: {
  value?: boolean | undefined;
  checked?: boolean | undefined;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  labelText?: string;
  className?: string;
  checkboxClass?: string;
  checkboxBorder?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <input
        id={labelText}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange && onChange(e)}
        className={cn("checkbox-check h-6 w-6 rounded-lg", checkboxClass)}
      />
      {labelText && (
        <label htmlFor={labelText} className="cursor-pointer capitalize">
          {labelText}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
