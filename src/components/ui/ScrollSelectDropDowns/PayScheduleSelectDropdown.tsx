import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";

const PayScheduleSelectDropdown = ({
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = {},
  placeholder = "Select a pay schedule",
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
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  return (
    <>
      <InfiniteSelect
        valueFormatter={(item: any) => item?.title}
        apiEndPoint="/we/payroll/pay-schedule"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={{ ...filters }}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) => <p className="px-4">{item?.title}</p>}
        required={required}
        isAddNew={isAddNew}
        // onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder={placeholder}
      />
    </>
  );
};

export default PayScheduleSelectDropdown;
