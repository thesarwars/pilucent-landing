import Button from "@/components/ui/RawButton";
import { Trash2 } from "lucide-react";
import React from "react";
import { BiTrash } from "react-icons/bi";

const Choices = [
  { value: "CHILD_SPOUSAL_SUPPORT", title: "Child/Spousal Support" },
  { value: "FEDERAL_TAX_LEVY", title: "Federal tax Levy" },
  { value: "OTHER_GARNISHMENT", title: "Other Garnishment" },
];

const GarnishmentTable = ({
  garnishItems,
  setGarnishItems,
}: {
  garnishItems: any[];
  setGarnishItems: any;
}) => {
  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedRows = garnishItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };

        updatedRow = { ...row, [field]: value };

        return updatedRow;
      }
      return row;
    });
    setGarnishItems(updatedRows);
  };

  const removeLine = (id: number) => {
    const updatedRows = garnishItems.filter(
      (item: any, idx: number) => idx !== id,
    );

    setGarnishItems(updatedRows);
  };

  const addLine = () => {
    setGarnishItems([
      ...garnishItems,
      {
        kind: "ALLOWANCE",
        total_requsted_amount: "",
        total_maximum_percentage_of_disposal_income: "",
        description: "",
      },
    ]);
  };

  return (
    <div>
      <div className="mb-8 overflow-auto rounded-lg bg-white p-6">
        <h3 className="mb-2 text-lg font-medium">Garnishment</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50 py-2">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Garnishment Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Amount Requested
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Maximum Percentage of Disposal Income
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
            {garnishItems.map((earning, index) => (
              <tr key={earning.no}>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={earning.kind}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "kind", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  >
                    {Choices?.map((p) => {
                      return (
                        <option key={p.value} value={p.value}>
                          {p.title}
                        </option>
                      );
                    })}
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={earning.description}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "description", index)
                    }
                    placeholder="description"
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="number"
                    value={earning.total_requsted_amount}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        "total_requsted_amount",
                        index,
                      )
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="number"
                    value={earning.total_maximum_percentage_of_disposal_income}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        "total_maximum_percentage_of_disposal_income",
                        index,
                      )
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
            className="rounded-md border border-accent_soft_blue px-7 py-1 text-sm text-accent_soft_blue"
            onClick={addLine}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GarnishmentTable;
