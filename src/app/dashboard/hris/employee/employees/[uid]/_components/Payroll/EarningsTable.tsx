import {
  deleteEmployeeEarningsItems,
  fetchEmployeeEarningsItems,
  patchEmployeeEarningsItems,
  postEmployeeEarningsItems,
} from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";

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

const EarningsTable = ({ uid, view = false }: { uid: string, view?: boolean }) => {
  const [earningItems, setEarningsItems] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [RenderAgain, setRenderAgain] = useState(false);
  const {
    isPending: isEarningPending,
    data: earnings,
    refetch,
  } = useQuery({
    queryKey: ["earningItems", uid],
    queryFn: () => fetchEmployeeEarningsItems(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!isEarningPending && earnings?.results) {
      const earning = earnings?.results?.map((res: any) => {
        return {
          uid: res?.uid,
          pay_kind: res?.pay_kind,
          total_recurring_amount: res?.total_recurring_amount,
          description: res?.description,
        };
      });
      setEarningsItems(earning);
    }
  }, [isEarningPending, earnings, RenderAgain]);

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

  const removeLine = (id: number, eUID?: string) => {
    if (eUID) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        timerProgressBar: true,
        timer: 20000,
        theme: "dark",
        background: "#181640a1",
        confirmButtonColor: "#6A6EF6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, delete`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            const response = await deleteEmployeeEarningsItems(uid, eUID);
            if (response.success) {
              refetch();
              setRenderAgain(!RenderAgain);
              return response;
            }
            throw new Error("Failed");
          } catch (error) {
            Swal.showValidationMessage(`${error}`);
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            background: "#181640",
            title: "Success!",
            text: "Leave encashment has been deleted.",
            icon: "success",
            color: "white",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    } else {
      const updatedRows = earningItems.filter(
        (item: any, idx: number) => idx !== id,
      );
      setEarningsItems(updatedRows);
    }
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

  const handleSaveEarning = async () => {
    try {
      setIsUpdating(true);
      const earningsPromises = earningItems?.map((arr: any) =>
        arr?.uid
          ? patchEmployeeEarningsItems(uid, arr?.uid, arr)
          : postEmployeeEarningsItems(uid, arr),
      );
      const results = await Promise.allSettled([...earningsPromises]);

      // Check if all requests were successful
      const allSuccess = results.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );
      if (allSuccess) {
        // setIsUpdating(false);
        refetch();
        setRenderAgain(!RenderAgain);
        toast.success("Earnings updated.");
        setIsDisabled(true);
      } else {
        refetch();
        setRenderAgain(!RenderAgain);
        // setIsUpdating(false);
        toast.warning("Some items failed to update. Please Check.");
      }
    } catch (error) {
      //
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="mb-8 overflow-auto rounded-lg bg-white p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="mb-2 text-lg font-medium">Earning</h3>

          {(isDisabled && !view) && (
            <Button
              onClick={() => {
                setIsDisabled(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
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
              {!isDisabled && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Action
                </th>
              )}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
                    className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                {!isDisabled && (
                  <td className="whitespace-nowrap px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index, earning?.uid)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!isDisabled && (
          <div className="mt-4 flex justify-start space-x-2">
            <Button
              type="button"
              className="rounded-md border border-accent_soft_blue px-7 py-1 text-sm text-accent_soft_blue"
              onClick={addLine}
            >
              Add
            </Button>
          </div>
        )}
        {!isDisabled && (
          <div className="flex items-center justify-end gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveEarning}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2 text-white"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTable;
