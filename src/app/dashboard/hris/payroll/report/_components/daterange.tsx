import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface DateRangePickerProps {
  value: {
    startDate: string | null;
    endDate: string | null;
  };
  setValue: (value: {
    startDate: string | null | undefined;
    endDate: string | null | undefined;
  }) => void;
  minDate?: string;
  defaultFilter?: string;
  isApplyHidden?: boolean;
  className?: string;
}

export const getPredefinedRange = (
  range: string,
): { startDate: string; endDate: string } | null => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  switch (range) {
    case "this_week": {
      const day = now.getDay();
      const diff = date - day + (day === 0 ? -6 : 0);
      const start = new Date(year, month, diff);
      const end = new Date(year, month, diff + 6);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }

    case "this_month": {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }

    case "this_year": {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }

    case "previous_week": {
      const prevWeek = new Date(now);
      prevWeek.setDate(date - 7);
      const day = prevWeek.getDay();
      const diff = prevWeek.getDate() - day + (day === 0 ? -6 : 0);
      const start = new Date(prevWeek.setDate(diff));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }

    case "previous_month": {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }

    case "previous_year": {
      const start = new Date(year - 1, 0, 1);
      const end = new Date(year - 1, 11, 31);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    }

    default:
      return null;
  }
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  setValue,
  minDate,
  defaultFilter,
  isApplyHidden = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const dateRangeRef = useRef<any>(undefined);
  const [selectedManual, setSelectedManual] = useState("");
  // Current visible months (dual calendar display)
  const [leftMonth, setLeftMonth] = useState(new Date().getMonth());
  const [leftYear, setLeftYear] = useState(new Date().getFullYear());
  const [rightMonth, setRightMonth] = useState(
    (new Date().getMonth() + 1) % 12,
  );
  const [rightYear, setRightYear] = useState(
    new Date().getMonth() === 11
      ? new Date().getFullYear() + 1
      : new Date().getFullYear(),
  );

  // Dropdown states
  const [isLeftYearDropdownOpen, setIsLeftYearDropdownOpen] = useState(false);
  const [isRightYearDropdownOpen, setIsRightYearDropdownOpen] = useState(false);
  const [isLeftMonthDropdownOpen, setIsLeftMonthDropdownOpen] = useState(false);
  const [isRightMonthDropdownOpen, setIsRightMonthDropdownOpen] =
    useState(false);

  // Parse minDate if provided
  const parsedMinDate = minDate ? new Date(minDate) : null;

  // Generate years array for dropdown (50 years back, 50 years ahead)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Predefined date ranges
  const dateRanges = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "This Week", days: 7 },
    // { label: 'Last 7 Days', days: 7 },
    { label: "Last 30 Days", days: 30 },
    { label: "This Month", days: "month" },
    { label: "Last Month", days: "lastMonth" },
    // { label: 'This Quarter', days: 'quarter' },
    // { label: 'Last Quarter', days: 'lastQuarter' },
    { label: "This Year", days: "year" },
    { label: "Last Year", days: "lastYear" },
  ];

  useEffect(() => {
    if (defaultFilter) {
      const range = getPredefinedRange(defaultFilter);
      setValue({ startDate: range?.startDate, endDate: range?.endDate });
    }
  }, []);

  useEffect(() => {
    // If value is provided externally, update the selection state
    if (value.startDate && !value.endDate) {
      setSelectingStartDate(false);
    } else if (!value.startDate) {
      setSelectingStartDate(true);
    }

    // Update calendar views based on selected dates
    if (value.startDate) {
      const startDate = new Date(value.startDate);
      setLeftMonth(startDate.getMonth());
      setLeftYear(startDate.getFullYear());

      // Set right calendar to next month
      if (startDate.getMonth() === 11) {
        setRightMonth(0);
        setRightYear(startDate.getFullYear() + 1);
      } else {
        setRightMonth(startDate.getMonth() + 1);
        setRightYear(startDate.getFullYear());
      }
    }
  }, [value]);

  // Sync right calendar when left changes
  useEffect(() => {
    if (leftMonth === 11) {
      setRightMonth(0);
      setRightYear(leftYear + 1);
    } else {
      setRightMonth(leftMonth + 1);
      setRightYear(leftYear);
    }
  }, [leftMonth, leftYear]);

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsLeftYearDropdownOpen(false);
      setIsRightYearDropdownOpen(false);
      setIsLeftMonthDropdownOpen(false);
      setIsRightMonthDropdownOpen(false);
    };

    if (
      isLeftYearDropdownOpen ||
      isRightYearDropdownOpen ||
      isLeftMonthDropdownOpen ||
      isRightMonthDropdownOpen
    ) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [
    isLeftYearDropdownOpen,
    isRightYearDropdownOpen,
    isLeftMonthDropdownOpen,
    isRightMonthDropdownOpen,
  ]);

  // Check if a date is the selected start date
  const isSelectedStart = (dateStr: string) => {
    return dateStr === value.startDate;
  };

  // Check if a date is the selected end date
  const isSelectedEnd = (dateStr: string) => {
    return dateStr === value.endDate;
  };

  // Check if a date is in the selected range
  const isInRange = (dateStr: string) => {
    if (!value.startDate || !value.endDate) {
      if (value.startDate && hoverDate && !selectingStartDate) {
        const date = new Date(dateStr);
        const start = new Date(value.startDate);
        const hover = new Date(hoverDate);
        return date >= start && date <= hover;
      }
      return false;
    }

    const date = new Date(dateStr);
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);

    return date >= start && date <= end;
  };

  // Check if date is today
  const isToday = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date.getTime() === today.getTime();
  };

  // Check if a date is disabled (before minDate)
  const isDisabled = (dateStr: string) => {
    if (!parsedMinDate) return false;
    return new Date(dateStr) < new Date(parsedMinDate.setHours(0, 0, 0, 0));
  };

  // Determine if a year is a leap year
  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Get the number of days in a month
  const getDaysInMonth = (month: number, year: number) => {
    const daysInMonth = [
      31,
      isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    return daysInMonth[month];
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayDateRange = () => {
    if (!value.startDate && !value.endDate) return "Select Date Range";
    if (value.startDate && !value.endDate)
      return formatDisplayDate(value.startDate);
    return `${formatDisplayDate(value.startDate)} - ${formatDisplayDate(value.endDate)}`;
  };

  // Generate days for a specific month and year
  const generateDays = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(month, year);
    const daysArray = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(
        <div key={`empty-${month}-${i}`} className="h-8 w-8"></div>,
      );
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const disabled = isDisabled(dateStr);

      daysArray.push(
        <button
          key={dateStr}
          onClick={() => handleDateSelect(dateStr)}
          onMouseEnter={() => handleDateHover(dateStr)}
          disabled={disabled}
          className={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm ${isSelectedStart(dateStr) || isSelectedEnd(dateStr) ? "bg-blue-500 text-white" : ""} ${isInRange(dateStr) && !isSelectedStart(dateStr) && !isSelectedEnd(dateStr) ? "bg-blue-100 text-blue-600" : ""} ${isToday(dateStr) && !isSelectedStart(dateStr) && !isSelectedEnd(dateStr) && !isInRange(dateStr) ? "font-bold text-blue-500" : ""} ${disabled ? "cursor-not-allowed text-gray-300" : "hover:bg-gray-100"} ${!isSelectedStart(dateStr) && !isSelectedEnd(dateStr) && !isInRange(dateStr) && !isToday(dateStr) ? "text-gray-700" : ""} `}
        >
          {day}
          {isSelectedStart(dateStr) && value.endDate && (
            <div className="absolute -right-4 bottom-0 top-0 w-4 bg-blue-100"></div>
          )}
          {isSelectedEnd(dateStr) && value.startDate && (
            <div className="absolute -left-4 bottom-0 top-0 w-4 bg-blue-100"></div>
          )}
        </button>,
      );
    }

    return daysArray;
  };

  const handleDateSelect = (dateStr: string) => {
    if (selectingStartDate) {
      setValue({ startDate: dateStr, endDate: null });
      setSelectingStartDate(false);
    } else {
      if (value.startDate && new Date(dateStr) < new Date(value.startDate)) {
        setValue({ startDate: dateStr, endDate: value.startDate });
      } else {
        setValue({ ...value, endDate: dateStr });
      }
      setSelectingStartDate(true);
    }
  };

  const handleDateHover = (dateStr: string) => {
    if (!selectingStartDate) {
      setHoverDate(dateStr);
    }
  };

  const handlePrevMonth = () => {
    if (leftMonth === 0) {
      setLeftMonth(11);
      setLeftYear(leftYear - 1);
    } else {
      setLeftMonth(leftMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (rightMonth === 11) {
      setRightMonth(0);
      setRightYear(rightYear + 1);
    } else {
      setRightMonth(rightMonth + 1);
    }
    // Left calendar will be automatically adjusted by the useEffect
  };

  const toggleCalendar = () => {
    setIsOpen(!isOpen);
    // Close all dropdowns
    setIsLeftYearDropdownOpen(false);
    setIsRightYearDropdownOpen(false);
    setIsLeftMonthDropdownOpen(false);
    setIsRightMonthDropdownOpen(false);
  };

  const toggleDropdownWithoutPropagation = (
    event: React.MouseEvent,
    dropdownSetter: React.Dispatch<React.SetStateAction<boolean>>,
    currentState: boolean,
  ) => {
    event.stopPropagation();

    // Close all dropdowns first
    setIsLeftYearDropdownOpen(false);
    setIsRightYearDropdownOpen(false);
    setIsLeftMonthDropdownOpen(false);
    setIsRightMonthDropdownOpen(false);

    // Then open the selected one
    dropdownSetter(!currentState);
  };

  const handleYearSelect = (
    year: number,
    side: "left" | "right",
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    if (side === "left") {
      setLeftYear(year);
      setIsLeftYearDropdownOpen(false);
    } else {
      setRightYear(year);
      setIsRightYearDropdownOpen(false);
    }
  };

  const handleMonthSelect = (
    monthIndex: number,
    side: "left" | "right",
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    if (side === "left") {
      setLeftMonth(monthIndex);
      setIsLeftMonthDropdownOpen(false);
    } else {
      setRightMonth(monthIndex);
      setIsRightMonthDropdownOpen(false);
    }
  };

  const handlePresetRange = (preset: {
    label: string;
    days: number | string;
  }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate: Date;
    let endDate: Date = new Date(today);

    if (preset.days === 0) {
      // Today
      startDate = new Date(today);
    } else if (preset.days === 1) {
      // Yesterday
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(startDate);
    } else if (preset.days === "month") {
      // This month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset.days === "lastMonth") {
      // Last month
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset.days === "quarter") {
      // This quarter
      const quarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), quarter * 3, 1);
      endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
    } else if (preset.days === "lastQuarter") {
      // Last quarter
      const quarter = Math.floor(today.getMonth() / 3);
      if (quarter === 0) {
        startDate = new Date(today.getFullYear() - 1, 9, 1);
        endDate = new Date(today.getFullYear() - 1, 12, 0);
      } else {
        startDate = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3, 0);
      }
    } else if (preset.days === "year") {
      // This year
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 12, 0);
    } else if (preset.days === "lastYear") {
      // Last year
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 12, 0);
    } else {
      // N days ago
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (preset.days as number) + 1);
    }

    setValue({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });

    setIsOpen(false);
  };

  const handleClearDates = () => {
    setValue({ startDate: null, endDate: null });
    setSelectingStartDate(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateRangeRef.current &&
        !dateRangeRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl">
      {/* Date Input Display */}
      <div
        className="flex cursor-pointer items-center rounded-md border border-accent_soft_black p-2"
        onClick={toggleCalendar}
      >
        <Calendar className="mr-2 text-accent_soft_black" size={18} />
        <div className="flex-1 md:min-w-60 md:max-w-60">
          <span className="text-accent_soft_black">{displayDateRange()}</span>
        </div>
        {value.startDate && value.endDate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClearDates();
            }}
            className="mr-2 p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600"
          >
            <X size={16} className="text-accent_soft_black" />
          </button>
        )}
        <ChevronDown className="text-accent_soft_black" size={18} />
      </div>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div
          ref={dateRangeRef}
          className={`absolute z-50 mt-1 rounded-md border border-gray-200 bg-white p-4 shadow-lg ${className}`}
          style={{ width: "600px" }}
        >
          {/* Top Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevMonth}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Left Calendar Header */}
              <div className="flex items-center space-x-1">
                {/* Month Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center rounded px-2 py-1 hover:bg-gray-100"
                    onClick={(e) =>
                      toggleDropdownWithoutPropagation(
                        e,
                        setIsLeftMonthDropdownOpen,
                        isLeftMonthDropdownOpen,
                      )
                    }
                  >
                    <span>{months[leftMonth]}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {isLeftMonthDropdownOpen && (
                    <div
                      className="absolute left-0 top-full z-10 mt-1 rounded border border-gray-200 bg-white p-2 shadow-lg"
                      style={{ width: "150px" }}
                    >
                      <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto">
                        {months.map((month, index) => (
                          <button
                            key={`left-${month}`}
                            onClick={(e) => handleMonthSelect(index, "left", e)}
                            className={`rounded p-2 text-left ${index === leftMonth ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center rounded px-2 py-1 hover:bg-gray-100"
                    onClick={(e) =>
                      toggleDropdownWithoutPropagation(
                        e,
                        setIsLeftYearDropdownOpen,
                        isLeftYearDropdownOpen,
                      )
                    }
                  >
                    <span>{leftYear}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {isLeftYearDropdownOpen && (
                    <div
                      className="absolute left-0 top-full z-10 mt-1 rounded border border-gray-200 bg-white p-2 shadow-lg"
                      style={{
                        width: "150px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="grid grid-cols-3 gap-1">
                        {years.map((year) => (
                          <button
                            key={`left-${year}`}
                            onClick={(e) => handleYearSelect(year, "left", e)}
                            className={`rounded p-1 text-center ${year === leftYear ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Calendar Header */}
              <div className="flex items-center space-x-1">
                {/* Month Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center rounded px-2 py-1 hover:bg-gray-100"
                    onClick={(e) =>
                      toggleDropdownWithoutPropagation(
                        e,
                        setIsRightMonthDropdownOpen,
                        isRightMonthDropdownOpen,
                      )
                    }
                  >
                    <span>{months[rightMonth]}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {isRightMonthDropdownOpen && (
                    <div
                      className="absolute left-0 top-full z-10 mt-1 rounded border border-gray-200 bg-white p-2 shadow-lg"
                      style={{ width: "150px" }}
                    >
                      <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto">
                        {months.map((month, index) => (
                          <button
                            key={`right-${month}`}
                            onClick={(e) =>
                              handleMonthSelect(index, "right", e)
                            }
                            className={`rounded p-2 text-left ${index === rightMonth ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center rounded px-2 py-1 hover:bg-gray-100"
                    onClick={(e) =>
                      toggleDropdownWithoutPropagation(
                        e,
                        setIsRightYearDropdownOpen,
                        isRightYearDropdownOpen,
                      )
                    }
                  >
                    <span>{rightYear}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>

                  {isRightYearDropdownOpen && (
                    <div
                      className="absolute left-0 top-full z-10 mt-1 rounded border border-gray-200 bg-white p-2 shadow-lg"
                      style={{
                        width: "150px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="grid grid-cols-3 gap-1">
                        {years.map((year) => (
                          <button
                            key={`right-${year}`}
                            onClick={(e) => handleYearSelect(year, "right", e)}
                            className={`rounded p-1 text-center ${year === rightYear ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleNextMonth}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Preset date ranges */}
            <div className="relative">
              <select
                value={selectedManual}
                className="appearance-none rounded border border-gray-300 p-1 pr-8 text-sm"
                onChange={(e) => {
                  setSelectedManual(e.target.value);
                  if (!e.target.value) return;
                  const selected = dateRanges.find(
                    (r) => r.label === e.target.value,
                  );
                  if (selected) handlePresetRange(selected);
                }}
              >
                <option value="">Select</option>
                {dateRanges.map((range) => (
                  <option key={range.label} value={range.label}>
                    {range.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2 top-2 text-gray-500"
              />
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="flex space-x-4">
            {/* Left Calendar */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={`left-${day}`}
                    className="flex h-6 items-center justify-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {generateDays(leftMonth, leftYear)}
              </div>
            </div>

            {/* Right Calendar */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={`right-${day}`}
                    className="flex h-6 items-center justify-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {generateDays(rightMonth, rightYear)}
              </div>
            </div>
          </div>

          {/* Selected Range Display */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm">
              {value.startDate && (
                <span>
                  {formatDisplayDate(value.startDate)}
                  {value.endDate && ` - ${formatDisplayDate(value.endDate)}`}
                </span>
              )}
            </div>

            {!isApplyHidden && (
              <div className="flex space-x-2">
                <button
                  onClick={handleClearDates}
                  className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage component
// const DateRangePickerExample = () => {
//   const [dateRange, setDateRange] = useState<{
//     startDate: string | null;
//     endDate: string | null;
//   }>({
//     startDate: '2025-04-08',
//     endDate: '2025-04-26'
//   });

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">Date Range Picker</h1>
//       <DateRangePicker
//         value={dateRange}
//         setValue={setDateRange}
//         minDate="2020-01-01"
//       />
//       <div className="mt-4">
//         <p className="text-sm">Selected Range:</p>
//         <pre className="bg-gray-100 p-2 rounded mt-1">
//           {JSON.stringify(dateRange, null, 2)}
//         </pre>
//       </div>
//     </div>
//   );
// };

export default DateRangePicker;
