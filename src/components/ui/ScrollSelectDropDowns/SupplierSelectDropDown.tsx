import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import TopModal from "./TopModal";
import WarehouseLocation from "@/app/dashboard/sales/warehouse_location/_components/WarehouseLocation";
import SupplierCreateUpdate from "@/app/dashboard/expenses/suppliers/_components/SupplierCreateUpdate";

const SupplierSelectDropDown = ({
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
        valueFormatter={(item: any) =>
          item?.uid && `${item?.first_name || ""} ${item?.middle_name || ""} ${item?.last_name || ""}`
        }
        apiEndPoint="/we/suppliers"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={{ ...filters, status: "ACTIVE" }}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value?.uid ? value : null}
        formatter={(item: any) => (
          <p>
            {item?.first_name || ""} {item?.middle_name || ""}{" "}
            {item?.last_name || ""}
          </p>
        )}
        required={required}
        isAddNew={isAddNew}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a Supplier"
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Supplier"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[980px]"
      >
        <SupplierCreateUpdate
          setValue={setValue}
          setIsOpen={setIsOpen}
          onSuccess={(d: any) => {
            setIsRefetchAgain(true);
            OnSelect && OnSelect(d);
          }}
        />
      </TopModal>
    </>
  );
};

export default SupplierSelectDropDown;
