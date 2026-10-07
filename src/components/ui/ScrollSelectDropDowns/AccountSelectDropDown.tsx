import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import Term from "@/app/dashboard/admin/terms/Term";
import TopModal from "./TopModal";
import AddAccountForm from "@/app/dashboard/transactions/coa_tree/_components/AddAccountForm";

const AccountSelectDropDown = ({
  removeItemUIDS = [],
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = {},
  defaultValue,
}: {
  removeItemUIDS?: any[];
  required?: boolean;
  isAddNew?: boolean;
  filters?: any;
  view?: boolean;
  OnSelect?: any;
  value: any;
  setValue: any;
  ClassName?: string;
  parentClassName?: string;
  defaultValue?: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  return (
    <>
      <InfiniteSelect
        valueFormatter={(item: any) => item?.title || ""}
        apiEndPoint="/we/chart-of-accounts"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={filters}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) =>
          !removeItemUIDS?.includes(item?.uid) && (
            <p className="flex w-full items-center text-wrap flex-wrap justify-between px-4">
              <span>{item?.title || ""}</span>{" "}
              <span className="text-right text-xs">
                {" "}
                {item?.account_type?.title || ""}
              </span>
            </p>
          )
        }
        required={required}
        isAddNew={isAddNew}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select an Account"
      />
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Chart Of Account"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[550px]"
      >
        <AddAccountForm
          setValue={setValue}
          setIsOpen={setIsOpen}
          onSuccess={() => setIsRefetchAgain(true)}
        />
      </TopModal>
    </>
  );
};

export default AccountSelectDropDown;
