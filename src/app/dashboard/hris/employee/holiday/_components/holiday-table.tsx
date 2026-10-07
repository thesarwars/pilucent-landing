"use client";

import type React from "react";
import { useState } from "react";
import { RiDeleteBin6Line, RiCloseLine } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { FiSettings } from "react-icons/fi";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import CustomSelect from "./CustomSelect";
import { toast } from "@/lib/ToastService";
import {
  postHolidayDetail,
  patchHolidayDetail,
  deleteHolidayDetail,
} from "@/app/helpers/backend";
import moment from "moment";

interface HolidayDetail {
  uid: string;
  date: string;
  type: string;
  description: string;
  isEditing?: boolean;
  No?: number;
}

interface HolidayTableProps {
  holidays: HolidayDetail[];
  setHolidays: React.Dispatch<React.SetStateAction<HolidayDetail[]>>;
  fromDate: string;
  toDate: string;
  mainHolidayUid?: string;
}

const HolidayTable = ({
  holidays,
  setHolidays,
  fromDate,
  toDate,
  mainHolidayUid,
}: HolidayTableProps) => {
  const [editingIDX, setEditingIDX] = useState<any>(null);
  const [deleteIDX, setDeleteIDX] = useState<any>(null);
  const [isPending, setIsPending] = useState<any>(null);

  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // currentEditedValues now stores only the totalDays for each leave type being edited
  const [currentEditedValues, setCurrentEditedValues] = useState<any>({});

  const handleEditClick = (index: number, data: any) => {
    setEditingIDX(index);
    setCurrentEditedValues(data);
  };

  const handleSaveClick = (index: number, uid?: string) => {
    setHolidays((prevData: any) =>
      prevData.map((holiday: any, idx: number) => {
        if (idx == index) {
          return currentEditedValues;
        }
        return holiday;
      }),
    );
    setEditingIDX(null);
    setCurrentEditedValues({});
    // In a real application, you would send this update to your backend API here.
    // console.log("Saving changes for employee:", employeeUid, currentEditedValues);
  };

  const handleCancelClick = () => {
    setEditingIDX(null);
    setCurrentEditedValues({});
  };

  const handleRemoveHoliday = async (idx: number, uid?: string) => {
    // If mainHolidayUid exists and the holiday has a real uid (not temp), delete via API
    setDeleteIDX(idx);
    if (uid) {
      try {
        const response = await deleteHolidayDetail(uid);
      } catch (error) {}
    } else {
      setHolidays((prev) => prev.filter((holiday, id) => id != idx));
    }
  };

  return (
    <div className="col-span-3">
      <div className="rounded bg-white">
        <div className="flex items-center px-3">
          <h3 className="mb-3 text-lg font-medium">Holidays</h3>
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <table className="w-full !rounded-md border !border-gray-300">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b text-sm">
                <th className="p-4 text-left">No</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">
                  <FiSettings className="inline" size={18} />
                </th>
              </tr>
            </thead>
            <tbody>
              {holidays.length > 0 ? (
                holidays
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )
                  .map((holiday, index) => {
                    const isEditing = index == editingIDX;
                    return (
                      <tr
                        key={holiday.uid}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 text-gray-500">{index + 1}</td>
                        <td className="p-2 text-gray-500">
                          {isEditing ? (
                            <input
                              type="date"
                              value={currentEditedValues.date}
                              onChange={(e) =>
                                setCurrentEditedValues({
                                  ...currentEditedValues,
                                  date: e.target.value,
                                })
                              }
                              className="rounded border border-gray-300 px-2 py-1"
                              required
                            />
                          ) : (
                            formatDate(holiday.date)
                          )}
                        </td>
                        <td className="p-2">
                          {isEditing ? (
                            <CustomSelect
                              value={currentEditedValues.type}
                              onChange={(e) =>
                                setCurrentEditedValues({
                                  ...currentEditedValues,
                                  type: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                            >
                              <option value="HOLIDAY">Holiday</option>
                              <option value="WEEKEND">Weekend</option>
                              <option value="SPECIAL">Special</option>
                            </CustomSelect>
                          ) : (
                            <span
                              className={`${holiday.type === "WEEKEND" ? "text-blue-600" : "text-red-600"}`}
                            >
                              {holiday.type}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-gray-700">
                          {isEditing ? (
                            <input
                              type="text"
                              value={currentEditedValues.description}
                              onChange={(e) =>
                                setCurrentEditedValues({
                                  ...currentEditedValues,
                                  description: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1"
                              required
                            />
                          ) : (
                            holiday.description
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={() =>
                                    handleSaveClick(index, holiday?.uid)
                                  }
                                  disabled={isPending}
                                >
                                  {isPending ? (
                                    <FaSpinner
                                      className="animate-spin"
                                      size={16}
                                    />
                                  ) : (
                                    "Update"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleCancelClick()}
                                >
                                  <RiCloseLine size={18} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-blue-600"
                                  onClick={() =>
                                    handleEditClick(index, holiday)
                                  }
                                >
                                  <LuPencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-red-600"
                                  onClick={() =>
                                    handleRemoveHoliday(index, holiday?.uid)
                                  }
                                  disabled={index === editingIDX}
                                >
                                  {deleteIDX === index ? (
                                    <FaSpinner
                                      className="animate-spin"
                                      size={16}
                                    />
                                  ) : (
                                    <RiDeleteBin6Line size={16} />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    {fromDate && toDate
                      ? "No holidays found in the selected date range."
                      : "No holidays found. Add some holidays to see them here."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HolidayTable;
