import Button from "@/components/ui/RawButton";
import { Trash2 } from "lucide-react";
import React from "react";
import { BiTrash } from "react-icons/bi";

const PayKindChoices = [
  { value: "ALLOWANCE", title: "Allowance" },
  { value: "REIMBURSEMENT", title: "Reimbursement" },
  { value: "CASH_TIPS", title: "Cash Tips" },
  { value: "PAYCHECK_TIPS", title: "Paycheck Tips" },
  { value: "CLERGY_HOUSING_CASH", title: "Clergy Housing (Cash)" },
  { value: "CLERGY_HOUSING_IN_KIND", title: "Clergy Housing (In-Kind)" },
  { value: "NONTAXABLE_PER_DIEM", title: "Nontaxable Per Diem" },
  { value: "GROUP_TERM_LIFE_INSURANCE", title: "Group-Term Life Insurance" },
  {
    value: "S_CORP_OWNERS_HEALTH_INSURANCE",
    title: "S-Corp Owners Health Insurance",
  },
  { value: "COMPANY_HSA_CONTRIBUTION", title: "Company HSA Contribution" },
  {
    value: "PERSONAL_USE_OF_COMPANY_CAR",
    title: "Personal Use of Company Car",
  },
  { value: "BEREAVEMENT_PAY", title: "Bereavement Pay" },
  { value: "OTHER_EARNINGS", title: "Other Earnings" },
  {
    value: "NEW_YORK_HWB_BONUS_PROGRAM",
    title: "New York (HWB) Worker Bonus Program",
  },
];

const EarningsTable = ({
  earningItems,
  setEarningsItems,
}: {
  earningItems: any[];
  setEarningsItems: any;
}) => {
  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedRows = earningItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };

        updatedRow = { ...row, [field]: value };

        return updatedRow;
      }
      return row;
    });
    setEarningsItems(updatedRows);
  };

  const removeLine = (id: number) => {
    const updatedRows = earningItems.filter(
      (item: any, idx: number) => idx !== id,
    );

    setEarningsItems(updatedRows);
  };

  const addLine = () => {
    setEarningsItems([
      ...earningItems,
      {
        pay_kind: "ALLOWANCE",
        total_recurring_amount: "",
        description: "",
      },
    ]);
  };

  return (
    <div>
      <div className="mb-8 overflow-auto rounded-lg bg-white p-6">
        <h3 className="mb-2 text-lg font-medium">Earning</h3>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50 py-2">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Pay Type
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
                Recurring Amount
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
            {earningItems.map((earning, index) => (
              <tr key={earning.no}>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={earning.pay_kind}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "pay_kind", index)
                    }
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  >
                    {PayKindChoices?.map((p) => {
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
                    value={earning.total_recurring_amount}
                    onChange={(e) =>
                      handleInputChange(
                        e.target.value,
                        "total_recurring_amount",
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

export default EarningsTable;
