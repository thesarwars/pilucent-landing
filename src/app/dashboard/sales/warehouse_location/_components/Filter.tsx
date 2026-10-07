import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import React, { useState } from "react";

const Filter = ({
  refetch,
  setIsFilterOpen,
  setQueryParams,
  params,
}: {
  refetch?: any;
  setIsFilterOpen?: any;
  setQueryParams?: any;
  params?: any;
}) => {
  const [FilterType, setFilterType] = useState("");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setQueryParams({
            ...params,
            filter: {
              ...params.filter,
              kind: FilterType,
            },
          });
          setIsFilterOpen(false);
        }}
        className={`flex flex-col gap-4`}
      >
        <div className="flex-1">
          <Label className="block font-medium text-accent_text_gray">
            Warehouse Type
          </Label>

          <select
            value={FilterType}
            onChange={(e) => setFilterType(e.target.value)}
            // required
            className="mt-2 h-12 w-full rounded-lg border border-accent_text_slate px-6 text-black outline-none"
          >
            <option value="">Select Type</option>
            <option value="MAIN">Main</option>
            <option value="TEMPORARY">Temporary</option>
          </select>
        </div>

        <div className="mx-auto mt-10 flex max-w-[325px] items-center justify-center gap-10">
          <a
            onClick={() => setIsFilterOpen(false)}
            className="min-w-40 cursor-pointer rounded-lg border border-accent_soft_blue px-6 py-3 text-center font-semibold text-accent_soft_blue"
          >
            Cancel
          </a>
          <Button
            className="flex min-w-40 items-center justify-center gap-1 bg-accent_dark_blue px-6 py-3 text-white"
            type="submit"
            // isLoading={isCreating}
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Filter;
