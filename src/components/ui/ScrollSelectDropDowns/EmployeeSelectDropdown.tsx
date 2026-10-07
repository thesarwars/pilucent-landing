import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";

/** Label for list rows and the closed input; supports full API rows and nested `report_to`-style objects. */
export const formatEmployeeDisplayName = (item: any): string => {
  if (!item) return "";
  const full =
    typeof item.full_name === "string" ? item.full_name.trim() : "";
  if (full) return full;
  const single = typeof item.name === "string" ? item.name.trim() : "";
  if (single) return single;
  const parts = [
    item?.user?.first_name,
    item?.user?.middle_name,
    item?.user?.last_name,
  ]
    .filter(Boolean)
    .map((p) => String(p).trim());
  return parts.filter(Boolean).join(" ");
};

const EmployeeSelectDropdown = ({
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = {},
  placeholder = "Select an employee",
  excludeUids = [],
}: {
  required?: boolean;
  isAddNew?: boolean;
  filters?: any;
  view?: boolean;
  OnSelect?: any;
  value: any;
  setValue: any;
  ClassName?: string;
  parentClassName?: string;
  placeholder?: string;
  /** Uids hidden from the dropdown (e.g. logged-in employee, employee who cannot report to themselves). */
  excludeUids?: string[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  return (
    <>
      <InfiniteSelect
        valueFormatter={formatEmployeeDisplayName}
        apiEndPoint="/we/employees"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={{ ...filters }}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) => (
          <p className="px-4">{formatEmployeeDisplayName(item)}</p>
        )}
        required={required}
        isAddNew={isAddNew}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder={placeholder}
        excludeUids={excludeUids}
      />
    </>
  );
};

export default EmployeeSelectDropdown;
