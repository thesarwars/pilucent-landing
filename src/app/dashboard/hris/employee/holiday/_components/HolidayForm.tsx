"use client";
import { useState, useEffect, type FormEvent } from "react";
import { SlArrowDown } from "react-icons/sl";
import fedHolidays from "@18f/us-federal-holidays";
import CustomSelect from "./CustomSelect";
import { toast } from "@/lib/ToastService";
import Button from "@/components/ui/RawButton";
import {
  fetchSingleHoliday,
  postHoliday,
  patchHoliday,
} from "@/app/helpers/backend";
import moment from "moment";
import HolidayTable from "./holiday-table";

interface HolidayDetail {
  uid: string;
  date: string;
  type: string;
  description: string;
  isEditing?: boolean;
  No?: number;
}

const getFirstDayOfYear = () => {
  const year = new Date().getFullYear();
  const firstDay = new Date(year, 0, 1); // January 1st
  return firstDay.toISOString().split("T")[0];
};

const getLastDayOfYear = () => {
  const year = new Date().getFullYear();
  const lastDay = new Date(year, 11, 31); // December 31st
  return lastDay.toISOString().split("T")[0];
};

const Holiday = ({
  isOpen = false,
  setIsOpen,
  refetch,
  uid,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  uid?: string;
}) => {
  const [formData, setFormData] = useState<any>({
    title: "",
    from_date: getFirstDayOfYear(),
    to_date: getLastDayOfYear(),
    status: "ACTIVE",
    color: "Green",
    country: "",
    total_holidays: "0",
  });
  const [weekend, setWeekend] = useState<string[]>([""]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (uid) {
      const fetchHolidayData = async () => {
        try {
          setIsLoading(true);
          const res = await fetchSingleHoliday(uid);
          if (res) {
            // Map the API response to match our component structure
            const mappedHolidays = res.details.map((detail: any) => ({
              uid: detail.uid,
              date: detail.date,
              type: detail.type,
              description: detail.description,
              isEditing: false,
            }));

            setFormData({
              title: res.title,
              from_date: res.from_date,
              to_date: res.to_date,
              status: res.status,
              color: res.color,
              country: res.country,
              weekend: res.weekend,
              weeklyOffs: Array.isArray(JSON.parse(res.weekend || "[]")),
              total_holidays: res.total_holidays.toString(),
            });
          }
        } catch (error) {
          console.error("Error fetching holiday data:", error);
          toast.error("Failed to fetch holiday data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchHolidayData();
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setFormData({
        title: "",
        from_date: getFirstDayOfYear(),
        to_date: getLastDayOfYear(),
        status: "ACTIVE",
        color: "Green",
        country: "",
        weekend: "[]",
        total_holidays: "0",
      });
    }
  }, [uid]);

  const generateUniqueId = () => {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddWeeklyHolidays = () => {
    if (!formData.from_date || !formData.to_date) {
      toast.error("Please select both From Date and To Date");
      return;
    }

    const start = new Date(formData.from_date);
    const end = new Date(formData.to_date);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      toast.error("From Date cannot be after To Date");
      return;
    }

    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const selectedDays = weekend
      .filter((day) => day)
      .map((day) => dayMap[day])
      .filter((d) => d !== undefined);

    if (selectedDays.length === 0) {
      toast.error("Please select at least one weekly off day");
      return;
    }

    const newHolidays: any[] = [];
    const existingDates = new Set(holidays.map((h) => h.date + h.description));

    selectedDays.forEach((dayNumber) => {
      const currentDate = new Date(start);
      const diff = (dayNumber - currentDate.getDay() + 7) % 7;
      currentDate.setDate(currentDate.getDate() + diff);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split("T")[0];
        const dayName =
          Object.keys(dayMap).find((k) => dayMap[k] === dayNumber) || "";

        if (!existingDates.has(dateString + dayName)) {
          newHolidays.push({
            date: dateString,
            type: "WEEKEND",
            description: dayName,
          });
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }
    });

    if (newHolidays.length === 0) {
      toast.info("No new weekly holidays to add in this date range");
      return;
    }

    setHolidays([...holidays, ...newHolidays]);
    toast.success(`Added ${newHolidays.length} weekly holidays`);
  };

  const handleAddLocalHoliday = () => {
    if (!formData.from_date || !formData.to_date) {
      toast.error("Please select From Date and To Date");
      return;
    }

    if (formData.country === "USA") {
      try {
        const startDate = new Date(formData.from_date);
        const endDate = new Date(formData.to_date);
        const options = {
          shiftSaturdayHolidays: true,
          shiftSundayHolidays: true,
        };

        const usHolidays = fedHolidays.inRange(startDate, endDate, options);
        const filtered = usHolidays.filter((h) => {
          if (h.name.includes("Juneteenth")) {
            return h.date.getFullYear() >= 2021;
          }
          return true;
        });

        const newHolidays = filtered.map((h, index) => ({
          date: h.date.toISOString().split("T")[0],
          type: "HOLIDAY",
          description: h.name,
          isEditing: false,
        }));

        const existingDates = new Set(
          holidays.map((h) => h.date + h.description),
        );
        const uniqueHolidays = newHolidays.filter(
          (h) => !existingDates.has(h.date + h.description),
        );

        setHolidays((prev) => [...holidays, uniqueHolidays]);
        toast.success(`Added ${uniqueHolidays.length} US holidays`);
      } catch (error) {
        toast.error("Failed to fetch US holidays");
        console.error(error);
      }
    }
  };

  const handleWeeklyOffChange = (index: number, value: string) => {
    const updated = [...weekend];
    updated[index] = value;
    setWeekend([...weekend, ...updated]);
  };

  const handleAddWeeklyOffField = () => {
    setWeekend([...weekend, ""]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please enter a holiday list name");
      return;
    }
    if (!formData.from_date || !formData.to_date) {
      toast.error("Please select both From Date and To Date");
      return;
    }
    if (holidays.length === 0) {
      toast.error("Please add at least one holiday to the list");
      return;
    }

    try {
      setIsPending(true);

      if (uid) {
      }

      if (uid) {
        // res = await patchHoliday(uid, payloadData);
        // if (res?.success) {
        //   toast.success("Holiday list updated successfully!");
        // }
      } else {
        // res = await postHoliday(payloadData);
        // if (res?.success) {
        //   toast.success("Holiday created.");
        // }
      }

      // if (res?.success) {
      //   refetch && refetch();
      //   setIsOpen(false);
      // }
    } catch (error: any) {
      console.error("Error saving holiday list:", error);
      toast.error("Failed to save holiday list");
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-inter p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-5">
          {/* Left side - Form fields */}
          <div className="sticky top-0 col-span-2 max-h-screen self-start overflow-y-auto">
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="holidayName"
                  className="mb-1 block font-medium text-gray-700"
                >
                  Holiday List Name
                </label>
                <input
                  id="holidayName"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-none border-b border-gray-300 px-0 py-1 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="color"
                  className="mb-1 block font-medium text-gray-700"
                >
                  Color
                </label>
                <CustomSelect
                  id="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="select-border w-full rounded-none border-gray-300 px-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Green">Green</option>
                  <option value="Red">Red</option>
                </CustomSelect>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fromDate"
                  className="mb-1 block font-medium text-gray-700"
                >
                  From Date
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={formData.from_date}
                  onChange={(e) =>
                    setFormData({ ...formData, from_date: e.target.value })
                  }
                  className="w-full rounded-none border-b border-gray-300 px-0 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="toDate"
                  className="mb-1 block font-medium text-gray-700"
                >
                  To Date
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={formData.to_date}
                  onChange={(e) =>
                    setFormData({ ...formData, to_date: e.target.value })
                  }
                  className="w-full rounded-none border-b border-gray-300 px-0 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Weekly Holidays Section */}
            <div className="mb-6">
              <div className="rounded-lg bg-accent_bg_lavender p-4">
                <div className="flex cursor-pointer items-center justify-between rounded-none border-b border-gray-300 px-0 py-2 focus:border-blue-500 focus:outline-none">
                  <h3 className="font-medium text-gray-700">
                    Add Weekly Holidays
                  </h3>
                </div>

                <div className="mt-4">
                  {weekend?.map((item, idx) => (
                    <div
                      key={idx}
                      className="mb-2 flex items-center justify-between"
                    >
                      <div>
                        <label className="mb-1 block font-medium text-gray-700">
                          Weekly Off
                        </label>
                      </div>
                      <div className="flex items-center justify-between gap-x-3">
                        <CustomSelect
                          id={`weeklyOff-${idx}`}
                          value={item}
                          onChange={(e) =>
                            handleWeeklyOffChange(idx, e.target.value)
                          }
                          className="select-border w-full rounded-none border-gray-300 px-4 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select day</option>
                          <option value="Sunday">Sunday</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                        </CustomSelect>
                        {idx === weekend.length - 1 && (
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-3xl text-blue-500"
                            onClick={handleAddWeeklyOffField}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg border border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600 md:w-auto"
                    onClick={handleAddWeeklyHolidays}
                  >
                    Add to List
                  </button>
                </div>
              </div>
            </div>

            {/* Local Holidays Section */}
            <div className="mb-6">
              <div className="rounded-lg bg-accent_bg_lavender p-4">
                <div className="flex cursor-pointer items-center justify-between rounded-none border-b border-gray-300 px-0 py-2 focus:border-blue-500 focus:outline-none">
                  <h3 className="font-medium text-gray-700">
                    Add Local Holidays
                  </h3>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block font-medium text-gray-700">
                        Local
                      </label>
                    </div>
                    <div>
                      <CustomSelect
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            country: e.target.value,
                          })
                        }
                        className="select-border w-full rounded-none border-gray-300 px-4 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select Country</option>
                        <option value="USA">USA</option>
                      </CustomSelect>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-lg border border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600 md:w-auto"
                  onClick={handleAddLocalHoliday}
                >
                  Add to List
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Holidays table */}
          <HolidayTable
            holidays={holidays}
            setHolidays={setHolidays}
            fromDate={formData.from_date}
            toDate={formData.to_date}
            mainHolidayUid={uid}
          />
        </div>

        <div className="mx-auto mt-6 flex max-w-[325px] items-center justify-center gap-x-3">
          <Button
            type="button"
            className="flex h-[42px] w-[142px] cursor-pointer items-center justify-center rounded-md border border-accent_soft_black text-center font-semibold text-accent_soft_black"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending}
            className="flex h-[42px] w-[142px] items-center justify-center rounded-md bg-accent_soft_black py-0 text-white"
          >
            {uid ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Holiday;
