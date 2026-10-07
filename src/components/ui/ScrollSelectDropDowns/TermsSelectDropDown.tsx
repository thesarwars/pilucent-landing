import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import Term from "@/app/dashboard/admin/terms/Term";
import TopModal from "./TopModal";

const TermSelectDropDown = ({
  required = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = { is_active: true },
}: {
  required?: boolean;
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
        apiEndPoint="/we/terms"
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
          <p className="flex w-full items-center justify-between gap-12 px-4">
            <span>{item?.title || ""}</span>{" "}
            <span> {item?.days || ""} Days</span>
          </p>
        )}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a Term"
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Term"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[500px]"
      >
        <Term
          setValue={setValue}
          setIsOpen={setIsOpen}
          onSuccess={() => setIsRefetchAgain(true)}
        />
      </TopModal>
    </>
  );
};

export default TermSelectDropDown;
