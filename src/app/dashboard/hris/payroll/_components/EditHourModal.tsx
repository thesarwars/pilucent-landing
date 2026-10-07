import { addsalaryproccess } from "@/app/redux/Employee/EmployeeSlice";
import Button from "@/components/ui/RawButton";
import React, { useEffect, useState } from "react";
import { BiTime } from "react-icons/bi";
import { TiTimes } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";

export default function EditHourModal({ modalContoll, data }: any) {
  const [selectedOption, setselectedOption] = useState("only");
  const dispatch = useDispatch();
  let { salaryProccess } = useSelector((state: any) => state.employee);
  const [reducehour, setreducehour] = useState(0);
  const [showerror, setshowerror] = useState<any>(null);
  const calculateSalary = () => {
    let salaryData = salaryProccess.map((item: any) => {
      if (item.id === data?.id) {
        let updatedWorkingHrs = Number(item?.workingHrs);
        let updatedSalary = Number(item?.Salary);
        if (Number(item?.workingHrs) > Number(reducehour)) {
          updatedWorkingHrs = Number(item?.workingHrs) - Number(reducehour);
          updatedSalary = updatedWorkingHrs * Number(item?.Rate);
        } else {
          setshowerror("You can't reduce more than working hours");
        }

        // Return a new object (immutability)
        return {
          ...item,
          workingHrs: updatedWorkingHrs < 0 ? 0 : updatedWorkingHrs,
          Salary: updatedSalary < 0 ? 0 : updatedSalary,
        };
      }
      return item; // unchanged
    });

    dispatch(addsalaryproccess(salaryData));
    console.log(salaryData);
    // Dispatch updated data back to Redux if needed
    // dispatch(updateSalaryData(salaryData)); // example
  };

  useEffect(() => {
    setshowerror(null);
  }, [reducehour]);
  return (
    <div className="h-screen w-1/3 bg-white p-4">
      <div className="flex items-center justify-between border-b border-b-gray-300 pb-3">
        <p className="text-2xl font-bold">Edit hours worked this pay period</p>
        <p onClick={modalContoll}>
          <TiTimes className="text-2xl" />
        </p>
      </div>

      <div className="mt-8 space-y-5 rounded bg-gray-50 p-4 text-sm text-gray-500">
        <p className="my-4 font-bold">
          Total Salary ${selectedOption === "skip" ? 0 : data?.Salary}
        </p>
        <div>
          <input
            value={"only"}
            onChange={(e) => setselectedOption(e.target.value)}
            name="salary"
            type="radio"
            className="rounded border border-blue-700 p-3"
          />
          <label> Pay regular salary</label>
        </div>
        <div>
          <input
            value={"skip"}
            onChange={(e) => setselectedOption(e.target.value)}
            name="salary"
            type="radio"
            className="rounded border border-blue-700 p-3"
          />
          <label> Skip salary this time only</label>
        </div>
        <div>
          <input
            value={"edit"}
            onChange={(e) => setselectedOption(e.target.value)}
            name="salary"
            type="radio"
            className="rounded border border-blue-700 p-3"
          />
          <label> Edit employee hours for this pay period</label>

          {selectedOption === "edit" && (
            <div className="mt-4 pl-4">
              <label>Reduce total hours by </label>
              <input
                type="number"
                className="w-[40px] border-b border-gray-400"
                placeholder="0 hr"
                value={reducehour}
                onChange={(e: any) => setreducehour(e.target.value)}
              />
            </div>
          )}
        </div>
        {showerror && <p className="text-xs text-red-500">{showerror}</p>}
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="border-2 border-[#00035F] bg-[#ffffff] text-[#00035F]"
          type="button"
          onClick={modalContoll}
          isLoading={false}
        >
          Cancel
        </Button>
        <Button
          className="bg-black text-white"
          type="submit"
          onClick={calculateSalary}
          isLoading={false}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
