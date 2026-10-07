import {
  deleteEmployeeWorkExperiencesItems,
  fetchEmployeeEducationItems,
  fetchEmployeeWorkExperiencesItems,
  patchEmployeeWorkExperiencesItems,
  postEmployeeWorkExperiencesItems,
} from "@/app/helpers/backend";
import LogoLoader from "@/components/MainLoader/logo-loader";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FiEdit, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";

const InternalWorkHistoryTable = ({ uid }: { uid: string }) => {
  const [internalWorkItems, setInternalWorkItems] = useState<any[]>([]);
  const [RenderAgain, setRenderAgain] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { isPending, data, refetch } = useQuery({
    queryKey: ["internal_history", uid],
    queryFn: () => fetchEmployeeWorkExperiencesItems(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!isPending && data?.results) {
      const Arr = data?.results?.filter((res: any) => {
        if (res?.kind == "HISTORY") {
          return res;
        }
      });
      const finalArr = Arr?.map((res: any) => {
        return {
          uid: res?.uid,
          kind: "HISTORY",
          designation: res?.designation,
          start_date: res?.start_date,
          end_date: res?.end_date,
          total_salary: res?.total_salary,
          branch_name: res?.branch_name,
          department: res?.department,
        };
      });
      setInternalWorkItems(finalArr);
    }
  }, [isPending, data, RenderAgain]);

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
            const response = await deleteEmployeeWorkExperiencesItems(
              uid,
              eUID,
            );
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
      const updatedRows = internalWorkItems.filter(
        (item: any, idx: number) => idx !== id,
      );
      setInternalWorkItems(updatedRows);
    }
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

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const earningsPromises = internalWorkItems?.map((arr: any) =>
        arr?.uid
          ? patchEmployeeWorkExperiencesItems(uid, arr?.uid, arr)
          : postEmployeeWorkExperiencesItems(uid, arr),
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
        toast.success("Educations updated.");
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
      <div className="mb-8 rounded-lg bg-white p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="mb-2 text-lg font-medium">History In Company</h3>
          {isDisabled && (
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
        <div className="w-full overflow-x-auto">
          <table className="w-max min-w-[1100px] divide-y divide-gray-200 border">
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
            {internalWorkItems.map((earning, index) => (
              <tr key={earning.no}>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
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
                    disabled={isDisabled}
                    type="number"
                    value={earning.total_salary}
                    onChange={(e) =>
                      handleInputChange(e.target.value, "total_salary", index)
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
        </div>
        {isPending && (
          <div className="flex items-center justify-center bg-white py-7">
            <LogoLoader size={40} color={"#16151c"} />
          </div>
        )}
        {!isDisabled && (
          <div className="mt-4 flex justify-start space-x-2">
            <Button
              type="button"
              className="flex items-center gap-1 px-4 py-2 text-sm text-accent_soft_blue hover:bg-gray-100"
              onClick={addLine}
            >
              <FiPlus className="text-lg" /> Add
            </Button>
          </div>
        )}
        {!isDisabled && (
          <div className="flex items-center justify-end gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSave}
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

export default InternalWorkHistoryTable;
