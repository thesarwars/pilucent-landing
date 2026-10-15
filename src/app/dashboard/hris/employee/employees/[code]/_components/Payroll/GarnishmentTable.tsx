import {
  deleteEmployeeGarnishmentsItems,
  fetchEmployeeEarningsItems,
  fetchEmployeeGarnishmentsItems,
  patchEmployeeGarnishmentsItems,
  postEmployeeGarnishmentsItems,
} from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";

const Choices = [
  { value: "CHILD_SPOUSAL_SUPPORT", title: "Child/Spousal Support" },
  { value: "FEDERAL_TAX_LEVY", title: "Federal tax Levy" },
  { value: "OTHER_GARNISHMENT", title: "Other Garnishment" },
];

const GarnishmentTable = ({ uid, view = false }: { uid: string, view?: boolean }) => {
  const [garnishItems, setGarnishItems] = useState<any[]>([]);
  const [RenderAgain, setRenderAgain] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    isPending: isGarnishPending,
    data: Garnish,
    refetch,
  } = useQuery({
    queryKey: ["garnishmentItemsList", uid],
    queryFn: () => fetchEmployeeGarnishmentsItems(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!isGarnishPending && Garnish?.results) {
      const garnish = Garnish?.results?.map((res: any) => {
        return {
          uid: res?.uid,
          kind: res?.kind,
          total_requsted_amount: res?.total_requsted_amount,
          total_maximum_percentage_of_disposal_income:
            res?.total_maximum_percentage_of_disposal_income,
          description: res?.description,
        };
      });
      setGarnishItems(garnish);
    }
  }, [isGarnishPending, Garnish, RenderAgain]);

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
            const response = await deleteEmployeeGarnishmentsItems(uid, eUID);
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
            text: "Has been deleted.",
            icon: "success",
            color: "white",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    } else {
      const updatedRows = garnishItems.filter(
        (item: any, idx: number) => idx !== id,
      );
      setGarnishItems(updatedRows);
    }
  };
  const addLine = () => {
    setGarnishItems([
      ...garnishItems,
      {
        kind: "CHILD_SPOUSAL_SUPPORT",
        total_requsted_amount: "",
        total_maximum_percentage_of_disposal_income: "",
        description: "",
      },
    ]);
  };

  const handleSaveGarnish = async () => {
    try {
      setIsUpdating(true);
      const earningsPromises = garnishItems?.map((arr: any) =>
        arr?.uid
          ? patchEmployeeGarnishmentsItems(uid, arr?.uid, {
              ...arr,
              deduction_and_contribution_uid:
                arr?.deduction_and_contribution_uid?.uid,
            })
          : postEmployeeGarnishmentsItems(uid, {
              ...arr,
              deduction_and_contribution_uid:
                arr?.deduction_and_contribution_uid?.uid,
            }),
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
        toast.success("Garnishments updated.");
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
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-medium">Garnishment</h3>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-1 text-accent_soft_black transition-colors hover:bg-gray-200"
                >
                  <InfoIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-xs rounded-lg border bg-white px-2 py-2 text-sm text-white shadow-lg"
                sideOffset={5}
              >
                <div className="flex items-start gap-2">
                  <InfoIcon color="#000" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p className="text-left text-[13px] font-light leading-relaxed text-accent_soft_black">
                    A garnishment is a court order to withhold wages from an employee and send the money to an agency or creditor. Learn about garnishments
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

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
            {garnishItems.map((earning, index) => (
              <tr key={earning.no}>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
              onClick={handleSaveGarnish}
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

export default GarnishmentTable;
