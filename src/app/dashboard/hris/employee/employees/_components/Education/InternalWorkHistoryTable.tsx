import Button from "@/components/ui/RawButton";
import { Trash2 } from "lucide-react";
import React from "react";
import { FiPlus } from "react-icons/fi";

const InternalWorkHistoryTable = ({
  internalWorkItems,
  setInternalWorkItems,
}: {
  internalWorkItems: any[];
  setInternalWorkItems: any;
}) => {
  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedRows = internalWorkItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };

        updatedRow = { ...row, [field]: value };

        return updatedRow;
      }
      return row;
    });
    setInternalWorkItems(updatedRows);
  };

  const removeLine = (id: number) => {
    const updatedRows = internalWorkItems.filter(
      (item: any, idx: number) => idx !== id,
    );

    setInternalWorkItems(updatedRows);
  };

  const addLine = () => {
    setInternalWorkItems([
      ...internalWorkItems,
      {
        kind: "HISTORY",
        designation: "",
        start_date: "",
        end_date: "",
        total_salary: "",
        branch_name: "",
        department: "",
      },
    ]);
  };

  return (
    <div>
      <div className="mb-8 overflow-auto rounded-lg bg-white p-6">
        <h3 className="mb-2 text-lg font-medium">Internal Work History</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50 py-2">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Branch
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Designation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Start Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                End Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Total Salary
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {internalWorkItems.map((earning, index) => (
              <tr key={earning.no}>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.branch_name}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "branch_name", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.department}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "department", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.designation}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "designation", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="date"
                    value={earning.start_date}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "start_date", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="date"
                    value={earning.end_date}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "end_date", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="number"
                    value={earning.total_salary}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "total_salary", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-start space-x-2">
          <Button
            type="button"
            className="flex items-center gap-1 px-4 py-2 text-sm text-accent_soft_blue hover:bg-gray-100"
            onClick={addLine}
          >
            <FiPlus className="text-lg" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InternalWorkHistoryTable;
