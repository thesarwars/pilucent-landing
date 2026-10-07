import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import TopModal from "./TopModal";
import WarehouseLocation from "@/app/dashboard/sales/warehouse_location/_components/WarehouseLocation";

const LocationSelectDropDown = ({
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters={}
}: {
  required?: boolean;
  isAddNew?: boolean;
  filters?:any
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
        valueFormatter={(item: any) => item?.title || ""}
        apiEndPoint="/we/warehouses"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={filters}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) => (
          <p className="px-4">{item?.title || ""}
          </p>
        )}
        required={required}
        isAddNew={isAddNew}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a Location"
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Warehouse Location"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[550px]"
      >
        <WarehouseLocation
          setValue={setValue}
          setIsOpen={setIsOpen}
          onSuccess={() => setIsRefetchAgain(true)}
        />
      </TopModal>
    </>
  );
};

export default LocationSelectDropDown;
