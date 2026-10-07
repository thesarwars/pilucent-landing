import Button from "@/components/ui/RawButton";
import { Trash2 } from "lucide-react";
import React from "react";
import { FiPlus } from "react-icons/fi";

const EducationTable = ({
  educationItems,
  setEducationItems,
}: {
  educationItems: any[];
  setEducationItems: any;
}) => {
  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedRows = educationItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };

        updatedRow = { ...row, [field]: value };

        return updatedRow;
      }
      return row;
    });
    setEducationItems(updatedRows);
  };

  const removeLine = (id: number) => {
    const updatedRows = educationItems.filter(
      (item: any, idx: number) => idx !== id,
    );

    setEducationItems(updatedRows);
  };

  const addLine = () => {
    setEducationItems([
      ...educationItems,
      {
        institute_name: "",
        degree: "",
        level: "",
        passing_year: "",
        grade: "",
      },
    ]);
  };

  return (
    <div>
      <div className="mb-8 overflow-auto rounded-lg bg-white p-6">
        <h3 className="mb-2 text-lg font-medium">Education</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50 py-2">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Institution Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Degree
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Level
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Passing Year
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Grade
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
            {educationItems.map((earning, index) => (
              <tr key={earning.no}>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.institute_name}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "institute_name", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.degree}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "degree", index)
                    }
                    placeholder="description"
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.level}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "level", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="number"
                    value={earning.passing_year}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "passing_year", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="number"
                    value={earning.grade}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "grade", index)
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
            className="px-4 flex items-center gap-1 hover:bg-gray-100 py-2 text-sm text-accent_soft_blue"
            onClick={addLine}
          >
            <FiPlus className="text-lg" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EducationTable;
