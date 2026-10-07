import { CloseModal } from "@/components/ModalSM/ModalSM";
import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import { useState } from "react";

const Filter = ({
  setIsOpen,
  refetch,
  setParams,
  params,
}: {
  setIsOpen: any;
  refetch?: any;
  setParams: any;
  params: any;
}) => {
  const [filterData, setFilterData] = useState({
    status: "",
    discount_kind: "",
    tax_kind: "",
  });

  const handleApply = () => {
    setParams({ ...params, ...filterData });
    setIsOpen(false);
  };

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-3 flex flex-col gap-4"
      >
        <div>
          {" "}
          <Label className="block font-medium text-accent_text_gray">
            Status
          </Label>
          <select
            value={filterData.status}
            onChange={(e) =>
              setFilterData({
                ...filterData,
                status: e.target.value,
              })
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
          >
            <option value="">Select Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          {" "}
          <Label className="block font-medium text-accent_text_gray">
            Discount Type
          </Label>
          <select
            value={filterData.discount_kind}
            onChange={(e) =>
              setFilterData({
                ...filterData,
                discount_kind: e.target.value,
              })
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
          >
            <option value="">Select Discount Type</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat</option>
          </select>
        </div>

        <div>
          {" "}
          <Label className="block font-medium text-accent_text_gray">
            Tax Type
          </Label>
          <select
            value={filterData.tax_kind}
            onChange={(e) =>
              setFilterData({
                ...filterData,
                tax_kind: e.target.value,
              })
            }
            className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
          >
            <option value="">Select Tax Type</option>
            <option value="INCLUSIVE">Inclusive Of Tax</option>
            <option value="EXCLUSIVE">Exclusive Of Tax</option>
            <option value="NO_TAX">No Tax</option>
          </select>
        </div>

        <div className="mx-auto mt-14 flex max-w-[325px] items-center justify-center gap-10">
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-[142px] cursor-pointer rounded-lg border border-[#6A6EF6] py-3 text-center font-semibold text-[#6A6EF6]"
          >
            Cancel
          </Button>
          <Button
            className="w-[142px] bg-[#00035F] text-white"
            type="submit"
            isLoading={false}
            onClick={() => {
              handleApply();
            }}
          >
            Apply
          </Button>
        </div>
      </form>
    </>
  );
};

export default Filter;
