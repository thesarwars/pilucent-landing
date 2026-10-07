import { useState } from "react";
import InfiniteSelect from "@/components/ui/ScrollSelectDropDowns/InfiniteSelect";
import TopModal from "./TopModal";
import WarehouseLocation from "@/app/dashboard/sales/warehouse_location/_components/WarehouseLocation";
import AddCustomRate from "@/app/dashboard/taxes/_components/AddCustomRate";

const TaxSelectDropDown = ({
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = {},
  storedAutoTax = null,
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
  storedAutoTax?: any;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);

  return (
    <>
      <InfiniteSelect
        valueFormatter={(item: any) => {
          // Handle auto-calculated tax display
          if (item?.auto_calculated) {
            const rate = item?.total_rate ? (item.total_rate) : (item?.rate * 100);
            return `${item?.label || "Automatic Calculation"} (${rate?.toFixed(3)}%)`;
          }
          return item?.title || "";
        }}
        apiEndPoint="/we/agencies/taxes/combines"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={{ ...filters }}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(item: any) => (
          <p className="flex w-full items-center font-normal text-accent_soft_black flex-wrap justify-between  px-4">
            {item?.auto_calculated ? (
              <>
                <span>{item?.label || "Automatic Calculation"}</span> 
                <span className="text-green-600">✓ {item?.total_rate?.toFixed(3) || (item?.rate * 100)?.toFixed(3)}%</span>
              </>
            ) : (
              <>
                <span>{item?.title || ""}</span> 
                <span> {item?.total_rate || ""}%</span>
              </>
            )}
          </p>
        )}
        required={required}
        isAddNew={isAddNew}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a Rate"
      />
      
      {/* Show automatic calculation re-selection option when available but not selected */}
      {storedAutoTax && (!value || !value?.auto_calculated) && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setValue(storedAutoTax)}
            className="w-full text-left px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <span className="flex items-center justify-between">
              <span>📍 Select Automatic Calculation</span>
              <span className="text-green-600 font-medium">
                {storedAutoTax?.total_rate?.toFixed(3)}%
              </span>
            </span>
            <span className="block text-xs text-blue-600 mt-1">
              Based on customer address ({storedAutoTax?.county} County, NY)
            </span>
          </button>
        </div>
      )}
      
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Rate"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[550px]"
      >
        <AddCustomRate
          setIsOpen={setIsOpen}
          onSuccess={(e: any) => {
            setIsRefetchAgain(true);
            e?.uid && setValue(e);
          }}
        />
      </TopModal>
    </>
  );
};

export default TaxSelectDropDown;
