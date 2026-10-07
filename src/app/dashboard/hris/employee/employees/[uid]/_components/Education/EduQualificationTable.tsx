import {
  deleteEmployeeEducationItems,
  fetchEmployeeEducationItems,
  patchEmployeeEducationItems,
  postEmployeeEducationItems,
} from "@/app/helpers/backend";
import LogoLoader from "@/components/MainLoader/logo-loader";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FiEdit, FiPlus } from "react-icons/fi";
import Swal from "sweetalert2";

const EducationTable = ({ uid }: { uid: string }) => {
  const [educationItems, setEducationItems] = useState<any[]>([]);
  const [RenderAgain, setRenderAgain] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { isPending, data, refetch } = useQuery({
    queryKey: ["dc_items", uid],
    queryFn: () => fetchEmployeeEducationItems(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!isPending && data?.results) {
      const Arr = data?.results?.map((res: any) => {
        return {
          uid: res?.uid,
          institute_name: res?.institute_name,
          degree: res?.degree,
          level: res?.level,
          passing_year: res?.passing_year,
          grade: res?.grade,
        };
      });
      setEducationItems(Arr);
    }
  }, [isPending, data, RenderAgain]);

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
            const response = await deleteEmployeeEducationItems(uid, eUID);
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
      const updatedRows = educationItems.filter(
        (item: any, idx: number) => idx !== id,
      );
      setEducationItems(updatedRows);
    }
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

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const earningsPromises = educationItems?.map((arr: any) =>
        arr?.uid
          ? patchEmployeeEducationItems(uid, arr?.uid, arr)
          : postEmployeeEducationItems(uid, arr),
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
          <h3 className="mb-2 text-lg font-medium">Education</h3>
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
          <table className="w-max min-w-[980px] divide-y divide-gray-200 border">
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

export default EducationTable;
