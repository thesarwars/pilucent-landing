import { useState } from "react";
import CreateCustomer from "../../../app/dashboard/sales/customers/_components/CreateCustomer";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import TopModal from "./TopModal";

const CustomerSelectDropDown = ({
  OnCustomerSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
}: {
  OnCustomerSelect?: any;
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
        apiEndPoint="/we/customers"
        setValue={(e: any) => {
          setValue(e);
        }}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value?.uid ? value : null}
        formatter={(item: any) => (
          <p>
            {item?.first_name || ""} {item?.middle_name || ""}{" "}
            {item?.last_name || ""}
          </p>
        )}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnCustomerSelect}
        placeholder="Select a customer"
        filters={{ status: "ACTIVE" }}
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Customer"
        widthClass="w-full md:w-[700px]"
      >
        <CreateCustomer
          setValue={setValue}
          setIsOpen={setIsOpen}
          onSuccess={(d:any) => {
            OnCustomerSelect && OnCustomerSelect(d);
            setIsRefetchAgain(true)
          }}
        />
      </TopModal>
    </>
  );
};

export default CustomerSelectDropDown;
