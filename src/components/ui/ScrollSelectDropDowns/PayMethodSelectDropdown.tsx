import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import TopModal from "./TopModal";
import PaymentMethod from "@/app/dashboard/admin/payment_management/PaymentMethod";

const PayMethodSelectDropdown = ({
  required = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = { status: "ACTIVE" },
}: {
  required?: boolean;
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
        valueFormatter={(item: any) => item?.title || ""}
        apiEndPoint="/we/payment-methods"
        setValue={(e: any) => {
          setValue(e);
        }}
        required={required}
        filters={filters}
        view={view}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) => (
          <p className=" w-full px-4">
            {item?.title || ""}
          </p>
        )}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a Method"
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Payment Method"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[500px]"
      >
        <PaymentMethod
          setIsOpen={setIsOpen}
          onSuccess={(e: any) => {
            setIsRefetchAgain(true);
            setValue(e);
          }}
        />
      </TopModal>
    </>
  );
};

export default PayMethodSelectDropdown;
