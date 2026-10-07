import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import TopModal from "./TopModal";
import CreateWorkLocation from "@/app/dashboard/sales/product_services/_components/CreateWorkLocation";

/** One line: "address, city, state, zip" (skips empty parts). */
export const formatWorkLocationLine = (item: any): string => {
  if (!item) return "";
  const parts = [item.location_address, item.location_city, item.location_state, item.location_zip]
    .map((p) => (p == null ? "" : String(p).trim()))
    .filter(Boolean);
  return parts.join(", ");
};

const WorkLocationSelectDropDown = ({
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = {},
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
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  return (
    <>
      <InfiniteSelect
        valueFormatter={(item: any) => formatWorkLocationLine(item)}
        apiEndPoint="/we/payroll/work-location"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={{ ...filters, status: "ACTIVE" }}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) => (
          <p className="px-4">{formatWorkLocationLine(item)}</p>
        )}
        required={required}
        isAddNew={isAddNew}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a Work Location"
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Work Location"
        widthClass="w-full md:w-[500px]"
      >
        <CreateWorkLocation
          setValue={setValue}
          setIsOpen={setIsOpen}
          onSuccess={() => setIsRefetchAgain(true)}
        />
      </TopModal>
    </>
  );
};

export default WorkLocationSelectDropDown;
