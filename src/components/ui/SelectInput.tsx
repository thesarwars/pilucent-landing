import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

const SelectInput = ({
  className,
  selectName,
  options,
  value,
  name,
  defaultValue = "",
  disableSelectName = true,
  required = false,
  onChange,
}: {
  className?: string;
  selectName: string;
  options?: Array<{ label: string; value: string | number }>;
  value?: string | number;
  name?: string;
  defaultValue?: string | number;
  disableSelectName?: boolean;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}) => {
  return (
    <select
      className={cn(
        "h-full w-full rounded-lg border px-6 text-sm outline-none bg-transparent",
        className
      )}
      value={value}
      defaultValue={value ? undefined : defaultValue} 
      name={name}
      onChange={onChange}
      required={required}
    >
      <option defaultChecked disabled={disableSelectName} value={disableSelectName ? "" : value}>
        {selectName}
      </option>
      {options?.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectInput;


