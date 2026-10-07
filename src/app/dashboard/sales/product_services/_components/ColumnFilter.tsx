import Label from "@/components/ui/RawLabel";
import React from "react";

const ColumnFilter = () => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Emp.code</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Product/Service Name</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">SKU</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Sales Description</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Type</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Sales Price/Rate</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Tax on Sale</span>
            </label>
          </div>

          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Price/Rate includes Tax</span>
            </label>
          </div>

          <div className="pl-1">
            <Label className="block text-[#111928]">Rows</Label>
            <select
              className={`mt-2 h-10 w-16 rounded-lg border px-1 text-black outline-none`}
            >
              <option className="defaultChecked">5</option>
              <option>10</option>
              <option>15</option>
              <option>20</option>
              <option>25</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Income Amount</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Purchase Description </span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Purchase Cost Includes Tax</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">code</span>
            </label>
          </div>

          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Expense Amount</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Quantity on Hand</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Reorder Point</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Inventory Asset Account</span>
            </label>
          </div>
          <div className="flex">
            <label className="label flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="checkbox" />
              <span className="text-[#111928]">Quantity as of Date</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnFilter;
