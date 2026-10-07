import Button from "@/components/ui/RawButton";
import DedContributionSelect from "@/components/ui/ScrollSelectDropDowns/DedContributionSelect";
import { Trash2 } from "lucide-react";
import React from "react";

interface DCItem {
  tax_option: string;
  employee_deduction_kind: string;
  total_employee_deduction_per_pay_check: string;
  total_maximum_annual_employee_deduction: string;
  company_contribution_kind: string;
  total_company_contribution_per_pay_check: string;
  total_maximum_annual_company_contribution: string;
  deduction_and_contribution_uid: string;
}

interface DCTableProps {
  dcItems: DCItem[];
  setDCItems: React.Dispatch<React.SetStateAction<DCItem[]>>;
}

const DeductionKindChoices = [
  { value: "FLAT_AMOUNT", title: "Flat Amount" },
  { value: "PERCENT_OF_GROSS_PAY", title: "Percent Of Gross Pay" },
  { value: "PER_HOUR_WORKED", title: "Per Hour Worked" },
];

const DCTable: React.FC<DCTableProps> = ({ dcItems, setDCItems }) => {
  const handleInputChange = (
    value: string,
    field: keyof DCItem,
    index: number,
  ) => {
    const updatedRows = dcItems.map((row, rowIndex) => {
      if (rowIndex === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setDCItems(updatedRows);
  };

  const removeLine = (id: number) => {
    const updatedRows = dcItems.filter((_, idx) => idx !== id);
    setDCItems(updatedRows);
  };

  const addLine = () => {
    setDCItems([
      ...dcItems,
      {
        tax_option: "",
        employee_deduction_kind: "FLAT_AMOUNT",
        total_employee_deduction_per_pay_check: "",
        total_maximum_annual_employee_deduction: "",
        company_contribution_kind: "FLAT_AMOUNT",
        total_company_contribution_per_pay_check: "",
        total_maximum_annual_company_contribution: "",
        deduction_and_contribution_uid: "",
      },
    ]);
  };

  return (
    <div>
      <div className="mb-8 rounded-lg bg-white p-6">
        <h3 className="mb-2 text-lg font-medium">Deduction & Contribution</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50 py-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Deduction/Contribution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employee Deduction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tax Option
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Company Contribution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-x-2 divide-y divide-gray-300 bg-white">
            {dcItems.map((item, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-2 py-1">
                  <DedContributionSelect
                    setValue={(v: any) =>
                      handleInputChange(
                        v,
                        "deduction_and_contribution_uid",
                        index,
                      )
                    }
                    parentClassName="max-w-80"
                    value={item?.deduction_and_contribution_uid}
                    ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="px-3 py-1 text-center">
                  <div className="flex flex-row gap-1">
                    <select
                      value={item.employee_deduction_kind}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          "employee_deduction_kind",
                          index,
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    >
                      {DeductionKindChoices.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Per Paycheck"
                      value={item.total_employee_deduction_per_pay_check}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          "total_employee_deduction_per_pay_check",
                          index,
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                    <input
                      type="number"
                      placeholder="Annual Max"
                      value={item.total_maximum_annual_employee_deduction}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          "total_maximum_annual_employee_deduction",
                          index,
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                  </div>
                </td>

                <td className="whitespace-nowrap px-2 py-1">
                  <input
                    type="text"
                    placeholder="Tax Option"
                    value={item.tax_option}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "tax_option", index)
                    }
                    className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>

                <td className="whitespace-nowrap px-2 py-1">
                  <div className="flex flex-row gap-1">
                    <select
                      value={item.company_contribution_kind}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          "company_contribution_kind",
                          index,
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    >
                      {DeductionKindChoices.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Per Paycheck"
                      value={item.total_company_contribution_per_pay_check}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          "total_company_contribution_per_pay_check",
                          index,
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                    <input
                      type="number"
                      placeholder="Annual Max"
                      value={item.total_maximum_annual_company_contribution}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          "total_maximum_annual_company_contribution",
                          index,
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                  </div>
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

export default DCTable;
