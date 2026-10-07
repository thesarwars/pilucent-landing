"use client";

import BulkImportSteps from "@/components/BulkImportSteps/BulkImportSteps";
import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import SelectInput from "@/components/ui/SelectInput";
import { useRouter } from "next/navigation";
const MapData = () => {
  const router = useRouter();
  const columns = [
    {
      name: "Product/Service Name",
      options: ["default"],
    },
    {
      name: "Sales Description",
      options: ["default"],
    },
    {
      name: "SKU",
      options: ["default"],
    },
    {
      name: "Type",
      options: ["default"],
    },
    {
      name: "Sales Price / Rate",
      options: ["default"],
    },
    {
      name: "Tax on Sales",
      options: ["default"],
    },
    {
      name: "Price / Rate Includes Tax",
      options: ["default"],
    },
    {
      name: "Income Account",
      options: ["default"],
    },
    {
      name: "Purchase Description",
      options: ["default"],
    },
    {
      name: "Purchase Cost",
      options: ["default"],
    },
    {
      name: "Tax on Purchases",
      options: ["default"],
    },
    {
      name: "Purchase Cost Includes Tax",
      options: ["default"],
    },
    {
      name: "Expense Account",
      options: ["default"],
    },
    {
      name: "Quantity on Hand",
      options: ["default"],
    },

    {
      name: "Reorder Point",
      options: ["default"],
    },
    {
      name: "Inventory Asset Account",
      options: ["default"],
    },
    {
      name: "Quantity as-of Date",
      options: ["default"],
    },
  ];
  return (
    <div className="font-lexend">
      <BulkImportSteps step={2} title={'Bulk Import'} 
      des={'Import Products and Services'} />
      <div className="flex justify-center mt-16">
        <div className="w-[590px] max-w-[590px]">
          <div className="mb-12">
            <h3 className="text-lg font-medium text-[#5A607F] ">
              Column Mapping
            </h3>
            <p className="text-sm text-[#5A607F] ">
              Specify Column Mapping Between Excel Sheet and The list.
            </p>
          </div>

          <div>
            <div className="flex mb-7 justify-between items-center">
              <h1 className="text-lg font-medium text-[#131523] ">
                List Columns:{" "}
              </h1>
              <h1 className=" w-[260px] text-left text-lg font-medium text-[#131523] ">
                Excel Columns
              </h1>
            </div>
            <div className="space-y-5">
              {columns.map((column) => (
                <div
                  key={column.name}
                  className="flex justify-between items-center"
                >
                  <Label className="block text-sm font-medium text-[#5A607F] ">
                    {column.name}
                  </Label>
                  <select
                    className={` mt-2 border text-[#333752] w-[260px]  border-[#A1A7C4] px-6   rounded-lg  h-12 `}
                    
                   
                  >
                    <option value="">{column.name}</option>
                    {column.options.map((option)=> <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-12 justify-center mt-20">
        <Button
          type="button"
          className=" text-[#6A6EF6] border w-36 text-sm font-semibold border-[#6A6EF6]"
        >
          Cancel
        </Button>
        <Button
          onClick={() =>
            router.push("/dashboard/sales/product_services/bulk_import/verify")
          }
          type="button"
          className="bg-[#00035F] font-semibold text-sm w-36 text-white "
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default MapData;
