"use client";

import type React from "react";
import { FormEvent, useEffect, useState } from "react";
import {
  format,
  addDays,
  getDaysInMonth,
  subDays,
  parseISO,
  isValid,
  parse,
} from "date-fns";

import {
  fetchPaySchedule,
  patchPaySchedule,
  postPaySchedule,
} from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";
import moment from "moment";
import { cn } from "@/lib/utils";
import { IconChip, Toggle, VioletButton } from "@/components/violet";
import { CalendarRange, CalendarCheck, ChevronDown, Loader2 } from "lucide-react";

/* violet field + label styles for the drawer form */
const FIELD =
  "w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF] disabled:bg-v-wash2";
const LABEL = "mb-1.5 block text-xs font-semibold text-v-ink700";
const SELECT = cn(FIELD, "cursor-pointer appearance-none pr-9");
const FORM_ID = "pay-schedule-form";

/* maps the existing backend frequency values to spec labels + runs/year */
const FREQUENCY_TILES = [
  { value: "EVERY_WEEK", label: "Weekly", sub: "52 / yr" },
  { value: "OTHER_WEEK", label: "Bi-weekly", sub: "26 / yr" },
  { value: "TWICE_A_MONTH", label: "Semi-monthly", sub: "24 / yr" },
  { value: "EVERY_MONTH", label: "Monthly", sub: "12 / yr" },
] as const;

/* select wrapper with a chevron, violet-styled */
function VSelect({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} disabled={disabled} className={SELECT}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-v-ink400" />
    </div>
  );
}

const PayScheduleMonthChoice = [
  { value: "SAME", title: "Same" },
  { value: "PREVIOUS", title: "Previous" },
  { value: "NEXT", title: "Next" },
];

const PayFrequencyChoice = [
  { value: "EVERY_WEEK", title: "Every Week" },
  { value: "OTHER_WEEK", title: "Other Week" },
  { value: "TWICE_A_MONTH", title: "Twice A Month" },
  { value: "EVERY_MONTH", title: "Every Month" },
];

const EndDayChoice = [
  { value: "END_DAY", title: "End Day" },
  { value: "BEFORE_END_DAY", title: "Before end day" },
];

// --- Utility Functions ---

interface PayPeriod {
  no: string;
  payDate: string;
  periodRange: string;
}

// Format date to MM/DD/YY
const formatShortDate = (date: Date): string => {
  return format(date, "MM/dd/yy");
};

// Format date range
const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
};

// Get day number from day string (e.g., "15th" -> 15)
const getDayFromString = (dayString: string): number => {
  if (dayString === "END_OF_MONTH") {
    return 31; // Will be adjusted to actual end of month later
  }
  return Number.parseInt(dayString?.replace(/[^0-9]/g, "")) || 1;
};

// Get a date for a specific day of the current/next/previous month
const getDateForMonthDay = (
  day: number,
  monthOffset = 0,
  monthType = "SAME",
): Date => {
  const today = new Date();
  // Apply month type adjustment
  let adjustedMonthOffset = monthOffset;
  if (monthType === "PREVIOUS") {
    adjustedMonthOffset -= 1;
  } else if (monthType === "NEXT") {
    adjustedMonthOffset += 1;
  }

  const targetYear =
    today.getFullYear() +
    Math.floor((today.getMonth() + adjustedMonthOffset) / 12);
  const adjustedMonth = (today.getMonth() + adjustedMonthOffset) % 12;
  // If day is greater than days in month, use last day of month
  const daysInMonth = getDaysInMonth(new Date(targetYear, adjustedMonth));
  const adjustedDay = Math.min(day, daysInMonth);
  return new Date(targetYear, adjustedMonth, adjustedDay);
};

// Get the last day of a month
const getLastDayOfMonth = (monthOffset = 0, monthType = "SAME"): Date => {
  const today = new Date();
  // Apply month type adjustment
  let adjustedMonthOffset = monthOffset;
  if (monthType === "PREVIOUS") {
    adjustedMonthOffset -= 1;
  } else if (monthType === "NEXT") {
    adjustedMonthOffset += 1;
  }
  const targetYear =
    today.getFullYear() +
    Math.floor((today.getMonth() + adjustedMonthOffset) / 12);
  const adjustedMonth = (today.getMonth() + adjustedMonthOffset) % 12;
  return new Date(targetYear, adjustedMonth + 1, 0); // Last day of month
};

// Calculate upcoming pay periods for "Number of days before payday" option
const calculateDaysBeforePaydayPeriods = (
  payFrequency: string,
  payDay: string,
  daysBeforeValue: string,
  secondPayDay?: string,
  secondDaysBeforeValue?: string,
): PayPeriod[] => {
  const periods: PayPeriod[] = [];
  const daysBefore = Number.parseInt(daysBeforeValue) || 0;
  const secondDaysBefore = Number.parseInt(secondDaysBeforeValue || "0") || 0;

  if (payFrequency === "EVERY_MONTH") {
    // For monthly frequency with "END_OF_MONTH" payday and days before
    let previousEndDate: Date | null = null;
    for (let i = 0; i < 4; i++) {
      // Get the pay date (last day of month)
      const payDate = getLastDayOfMonth(i);
      // END_DAY is 'daysBefore' days before pay date
      const periodEndDate = subDays(payDate, daysBefore);
      // Start date calculation
      let periodStartDate: Date;
      if (i === 0) {
        // For the first period, start date is one month before the end date
        periodStartDate = new Date(periodEndDate);
        periodStartDate.setMonth(periodStartDate.getMonth() - 1);
      } else {
        // For subsequent periods, start date is the day after the previous period's end date
        periodStartDate = addDays(previousEndDate!, 1);
      }
      // Save this period's end date for the next iteration
      previousEndDate = periodEndDate;
      periods.push({
        no: (i + 1).toString().padStart(2, "0"),
        payDate: formatShortDate(payDate),
        periodRange: formatDateRange(periodStartDate, periodEndDate),
      });
    }
  } else if (payFrequency === "TWICE_A_MONTH") {
    // For twice a month frequency
    let previousEndDate: Date | null = null;
    // Generate 4 periods
    for (let i = 0; i < 4; i++) {
      let payDate: Date;
      let periodEndDate: Date;
      if (i % 2 === 0) {
        // First period of month (15th)
        const firstDayNum = getDayFromString(payDay || "15th");
        payDate = getDateForMonthDay(firstDayNum, Math.floor(i / 2));
        // END_DAY is 'daysBefore' days before pay date
        periodEndDate = subDays(payDate, daysBefore);
      } else {
        // Second period of month (end of month)
        if (secondPayDay === "END_OF_MONTH") {
          payDate = getLastDayOfMonth(Math.floor(i / 2));
        } else {
          const secondDayNum = getDayFromString(secondPayDay || "END_OF_MONTH");
          payDate = getDateForMonthDay(secondDayNum, Math.floor(i / 2));
        }
        // END_DAY is 'secondDaysBefore' days before pay date
        periodEndDate = subDays(payDate, secondDaysBefore);
      }
      // Start date calculation
      let periodStartDate: Date;
      if (i === 0) {
        // For the first period, start from the first day of the month
        periodStartDate = new Date(
          payDate.getFullYear(),
          payDate.getMonth(),
          1,
        );
      } else {
        // For subsequent periods, start from the day after the previous period's end date
        periodStartDate = addDays(previousEndDate!, 1);
      }
      // Save this period's end date for the next iteration
      previousEndDate = periodEndDate;
      periods.push({
        no: (i + 1).toString().padStart(2, "0"),
        payDate: formatShortDate(payDate),
        periodRange: formatDateRange(periodStartDate, periodEndDate),
      });
    }
  }
  return periods;
};

// Calculate upcoming pay periods based on frequency and dates
export const calculateUpcomingPayPeriods = (
  payFrequency: string,
  endDate: string | null,
  nextPayPeriod: string | null,
  firstPayDay: string,
  secondPayDay: string,
  firstEndOption: string,
  daysBeforeFirst: string,
  parseDate: (dateString: string) => Date | null,
  dayForEndDate?: string,
  firstPayMonth = "SAME",
  secondPayMonth = "SAME",
  dayForSecondEndDate?: string,
  daysBeforeSecond?: string,
): PayPeriod[] => {
  // If using "Number of days before payday" option, use specialized calculation
  if (firstEndOption === "BEFORE_END_DAY" && daysBeforeFirst) {
    return calculateDaysBeforePaydayPeriods(
      payFrequency,
      firstPayDay,
      daysBeforeFirst,
      secondPayDay,
      daysBeforeSecond,
    );
  }

  const periods: PayPeriod[] = [];
  const today = new Date();

  switch (payFrequency) {
    case "EVERY_WEEK": {
      // For weekly, start with the current week
      const endDateObj = parseDate(endDate || "") || today;
      const nextPayDateObj =
        parseDate(nextPayPeriod || "") || addDays(endDateObj, 3); // Assuming 3-day gap

      // Calculate the gap between end date and pay date for consistency
      const dayGap = Math.round(
        (nextPayDateObj.getTime() - endDateObj.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Calculate first period (current week)
      const startDate = addDays(endDateObj, -6); // 7-day period
      periods.push({
        no: "01",
        payDate: formatShortDate(nextPayDateObj),
        periodRange: formatDateRange(startDate, endDateObj),
      });

      // Calculate next 3 periods
      let currentEndDate = endDateObj;
      let currentPayDate = nextPayDateObj;
      for (let i = 1; i < 4; i++) {
        const nextStartDate = addDays(currentEndDate, 1);
        currentEndDate = addDays(nextStartDate, 6); // 7-day period
        currentPayDate = addDays(currentEndDate, dayGap); // Maintain consistent gap
        periods.push({
          no: (i + 1).toString().padStart(2, "0"),
          payDate: formatShortDate(currentPayDate),
          periodRange: formatDateRange(nextStartDate, currentEndDate),
        });
      }
      break;
    }
    case "OTHER_WEEK": {
      // For bi-weekly, periods are 14 days
      const endDateObj = parseDate(endDate || "") || today;
      const nextPayDateObj =
        parseDate(nextPayPeriod || "") || addDays(endDateObj, 3); // Assuming 3-day gap

      // Calculate the gap between end date and pay date for consistency
      const dayGap = Math.round(
        (nextPayDateObj.getTime() - endDateObj.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Calculate first period (current bi-week)
      const startDate = addDays(endDateObj, -13); // 14-day period
      periods.push({
        no: "01",
        payDate: formatShortDate(nextPayDateObj),
        periodRange: formatDateRange(startDate, endDateObj),
      });

      // Calculate next 3 periods
      let currentEndDate = endDateObj;
      let currentPayDate = nextPayDateObj;
      for (let i = 1; i < 4; i++) {
        const nextStartDate = addDays(currentEndDate, 1);
        currentEndDate = addDays(nextStartDate, 13); // 14-day period
        currentPayDate = addDays(currentEndDate, dayGap); // Maintain consistent gap
        periods.push({
          no: (i + 1).toString().padStart(2, "0"),
          payDate: formatShortDate(currentPayDate),
          periodRange: formatDateRange(nextStartDate, currentEndDate),
        });
      }
      break;
    }
    case "TWICE_A_MONTH": {
      // For twice a month, use the specified days
      const firstDayNum = getDayFromString(firstPayDay);
      const secondDayNum = getDayFromString(secondPayDay);

      // Generate 4 periods (2 months worth)
      for (let i = 0; i < 4; i++) {
        const monthOffset = Math.floor(i / 2);
        const isPeriodFirst = i % 2 === 0; // First or second period of the month

        // Determine pay date based on period
        let payDate: Date;
        if (isPeriodFirst) {
          // First period of month - use firstPayDay
          payDate = getDateForMonthDay(firstDayNum, monthOffset);
        } else {
          // Second period of month - use secondPayDay
          if (secondPayDay === "END_OF_MONTH") {
            payDate = getLastDayOfMonth(monthOffset);
          } else {
            payDate = getDateForMonthDay(secondDayNum, monthOffset);
          }
        }

        // Determine period end date based on the selected day and month type
        let periodEndDate: Date;
        if (isPeriodFirst) {
          // First period ends on the day specified in dayForEndDate (or firstPayDay if not specified)
          const endDayNum = getDayFromString(dayForEndDate || firstPayDay);
          if (dayForEndDate === "END_OF_MONTH") {
            periodEndDate = getLastDayOfMonth(monthOffset, firstPayMonth);
          } else {
            periodEndDate = getDateForMonthDay(
              endDayNum,
              monthOffset,
              firstPayMonth,
            );
          }
        } else {
          // Second period ends on the day specified in dayForSecondEndDate (or secondPayDay if not specified)
          if (
            dayForSecondEndDate === "END_OF_MONTH" ||
            secondPayDay === "END_OF_MONTH"
          ) {
            periodEndDate = getLastDayOfMonth(monthOffset, secondPayMonth);
          } else {
            const endDayNum = getDayFromString(
              dayForSecondEndDate || secondPayDay,
            );
            periodEndDate = getDateForMonthDay(
              endDayNum,
              monthOffset,
              secondPayMonth,
            );
          }
        }

        // Determine period start date
        let periodStartDate: Date;
        if (i === 0) {
          // First period of first month starts on the 1st
          periodStartDate = new Date(
            today.getFullYear(),
            today.getMonth() + monthOffset,
            1,
          );
        } else if (isPeriodFirst) {
          // i % 2 === 0
          // First period of subsequent months starts on the 1st of that month
          periodStartDate = new Date(
            today.getFullYear(),
            today.getMonth() + monthOffset,
            1,
          );
        } else {
          // Second period starts on the day after the first period ends
          const firstPeriodEndDay = getDayFromString(
            dayForEndDate || firstPayDay,
          );
          const firstPeriodEndDate = getDateForMonthDay(
            firstPeriodEndDay,
            monthOffset,
            firstPayMonth,
          );
          periodStartDate = addDays(firstPeriodEndDate, 1);
        }

        periods.push({
          no: (i + 1).toString().padStart(2, "0"),
          payDate: formatShortDate(payDate),
          periodRange: formatDateRange(periodStartDate, periodEndDate),
        });
      }
      break;
    }
    case "EVERY_MONTH": {
      // For monthly, use the specified day of month for pay date
      const payDayNum = getDayFromString(firstPayDay);
      // Get the end day for pay periods
      const endDayNum = dayForEndDate
        ? getDayFromString(dayForEndDate)
        : payDayNum;

      // Generate 4 monthly periods
      for (let i = 0; i < 4; i++) {
        // Pay date is based on the selected payday of the month
        let payDate: Date;
        if (firstPayDay === "END_OF_MONTH") {
          payDate = getLastDayOfMonth(i);
        } else {
          payDate = getDateForMonthDay(payDayNum, i);
        }

        // Period end date is based on the selected day and month type
        let periodEndDate: Date;
        if (dayForEndDate === "END_OF_MONTH") {
          periodEndDate = getLastDayOfMonth(i, firstPayMonth);
        } else {
          periodEndDate = getDateForMonthDay(endDayNum, i, firstPayMonth);
        }

        // Period start date - for monthly, start from the day after the end date of previous month
        let periodStartDate: Date;
        if (i === 0) {
          // For the first period, get the end date of previous month and add 1 day
          const prevMonthEndDate =
            dayForEndDate === "END_OF_MONTH"
              ? getLastDayOfMonth(-1, firstPayMonth)
              : getDateForMonthDay(endDayNum, -1, firstPayMonth);
          periodStartDate = addDays(prevMonthEndDate, 1);
        } else {
          // For subsequent periods, start from the day after the previous period's end date
          const prevMonthEndDate =
            dayForEndDate === "END_OF_MONTH"
              ? getLastDayOfMonth(i - 1, firstPayMonth)
              : getDateForMonthDay(endDayNum, i - 1, firstPayMonth);
          periodStartDate = addDays(prevMonthEndDate, 1);
        }

        periods.push({
          no: (i + 1).toString().padStart(2, "0"),
          payDate: formatShortDate(payDate),
          periodRange: formatDateRange(periodStartDate, periodEndDate),
        });
      }
      break;
    }
    default:
      // Default to weekly if no valid frequency is selected
      const endDateObj = parseDate(endDate || "") || today;
      const nextPayDateObj =
        parseDate(nextPayPeriod || "") || addDays(endDateObj, 3); // Assuming 3-day gap

      // Calculate the gap between end date and pay date for consistency
      const dayGap = Math.round(
        (nextPayDateObj.getTime() - endDateObj.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Calculate first period (current week)
      const startDate = addDays(endDateObj, -6);
      periods.push({
        no: "01",
        payDate: formatShortDate(nextPayDateObj),
        periodRange: formatDateRange(startDate, endDateObj),
      });

      // Calculate next 3 periods
      let currentEndDate = endDateObj;
      let currentPayDate = nextPayDateObj;
      for (let i = 1; i < 4; i++) {
        const nextStartDate = addDays(currentEndDate, 1);
        currentEndDate = addDays(nextStartDate, 6); // 7-day period
        currentPayDate = addDays(currentEndDate, dayGap); // Maintain consistent gap
        periods.push({
          no: (i + 1).toString().padStart(2, "0"),
          payDate: formatShortDate(currentPayDate),
          periodRange: formatDateRange(nextStartDate, currentEndDate),
        });
      }
  }
  return periods;
};

export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  // Try parsing in MM-DD-YYYY format
  let parsedDate = parse(dateString, "MM-dd-yyyy", new Date());
  // If invalid, try ISO format
  if (!isValid(parsedDate)) {
    try {
      parsedDate = parseISO(dateString);
    } catch (e) {
      return null;
    }
  }
  return isValid(parsedDate) ? parsedDate : null;
};

// Format day number with suffix (1st, 2nd, 3rd, etc.)
const formatDayWithSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// --- PaySchedules Component ---

const PaySchedulesForm = ({
  isOpen,
  setIsOpen,
  refetch,
  uid,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  refetch?: any;
  uid?: string;
}) => {
  const [name, setName] = useState<string>("");
  const [payFrequency, setPayFrequency] = useState<string>("EVERY_WEEK");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "MM-dd-yyyy"),
  );
  const [nextPayPeriod, setNextPayPeriod] = useState<string>(
    format(new Date(), "MM-dd-yyyy"),
  );
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [firstPayDay, setFirstPayDay] = useState<string>("END_OF_MONTH");
  const [secondPayDay, setSecondPayDay] = useState<string>("END_OF_MONTH");
  const [daysBeforeFirst, setDaysBeforeFirst] = useState<string>("3");
  const [daysBeforeSecond, setDaysBeforeSecond] = useState<string>("3");
  const [firstPayMonth, setFirstPayMonth] = useState<string>("SAME");
  const [secondPayMonth, setSecondPayMonth] = useState<string>("SAME");
  const [firstEndOption, setFirstEndOption] = useState<string>("END_DAY");
  const [secondEndOption, setSecondEndOption] = useState<string>("END_DAY");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dayForEndDate, setDayForEndDate] = useState<string>("END_OF_MONTH");
  const [dayForSecondEndDate, setDayForSecondEndDate] =
    useState<string>("END_OF_MONTH");

  // Upcoming pay periods
  const [upcomingPayPeriods, setUpcomingPayPeriods] = useState<PayPeriod[]>([]);

  // Parse date string in MM-DD-YYYY format

  // Recalculate pay periods when relevant fields change
  useEffect(() => {
    const periods = calculateUpcomingPayPeriods(
      payFrequency,
      endDate,
      nextPayPeriod,
      firstPayDay,
      secondPayDay,
      firstEndOption,
      daysBeforeFirst,
      parseDate,
      dayForEndDate,
      firstPayMonth,
      secondPayMonth,
      dayForSecondEndDate,
      daysBeforeSecond,
    );
    setUpcomingPayPeriods(periods);
  }, [
    payFrequency,
    endDate,
    nextPayPeriod,
    firstPayDay,
    secondPayDay,
    firstEndOption,
    daysBeforeFirst,
    secondEndOption,
    daysBeforeSecond,
    dayForEndDate,
    firstPayMonth,
    secondPayMonth,
    dayForSecondEndDate,
  ]);

  // Handle date input changes with validation
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
  };
  const handleNextPayPeriodChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setNextPayPeriod(value);
  };
  const changeFrequency = (value: string) => {
    setPayFrequency(value);
    // Reset end option to default when changing frequency

    setFirstEndOption("END_DAY");
    setSecondEndOption("END_DAY");
    // Reset day selections to default "END_OF_MONTH" for monthly/twice a month
    if (value === "EVERY_MONTH" || value === "TWICE_A_MONTH") {
      setFirstPayDay("END_OF_MONTH");
      setSecondPayDay("END_OF_MONTH");
      setDayForEndDate("END_OF_MONTH");
      setDayForSecondEndDate("END_OF_MONTH");
    }
  };

  useEffect(() => {
    if (uid) {
      return;
    }
    if (payFrequency == "EVERY_WEEK" || payFrequency == "OTHER_WEEK") {
      let name = payFrequency?.split("_")?.[0];
      const formattedDate = moment(nextPayPeriod).format("MM-DD-YYYY");

      const dayName = moment(formattedDate, "MM-DD-YYYY").format("dddd");
      setName(name + " " + dayName);
    } else {
      setName("");
    }
  }, [payFrequency, nextPayPeriod]);

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchPaySchedule(uid);
          if (
            res?.pay_frequency == "OTHER_WEEK" ||
            res?.pay_frequency == "EVERY_WEEK"
          ) {
            setName(res?.title);
            setPayFrequency(res?.pay_frequency);
            setEndDate(
              moment(res?.end_of_next_pay_period).format("MM-DD-YYYY"),
            );
            setNextPayPeriod(moment(res?.next_pay_date).format("MM-DD-YYYY"));
            setIsDefault(res?.is_default);
          } else if (payFrequency == "EVERY_MONTH") {
            setName(res?.title);
            setPayFrequency(res?.pay_frequency);
            setEndDate(
              moment(res?.end_of_next_pay_period).format("MM-DD-YYYY"),
            );
            setNextPayPeriod(moment(res?.next_pay_date).format("MM-DD-YYYY"));
            setIsDefault(res?.is_default);
            setFirstPayDay(res?.first_payday);
            setDaysBeforeFirst(
              res?.first_end_day == "BEFORE_END_DAY" ? res?.first_day : "3",
            );
            setFirstPayMonth(res?.first_month);
            setFirstEndOption(res?.first_end_day);
            setDayForEndDate(
              res?.first_end_day != "BEFORE_END_DAY"
                ? res?.first_day
                : "END_OF_MONTH",
            );
          } else {
            setName(res?.title);
            setPayFrequency(res?.pay_frequency);
            setEndDate(
              moment(res?.end_of_next_pay_period).format("MM-DD-YYYY"),
            );
            setNextPayPeriod(moment(res?.next_pay_date).format("MM-DD-YYYY"));
            setIsDefault(res?.is_default);
            setFirstPayDay(res?.first_payday);
            setSecondPayDay(res?.second_payday);
            setDaysBeforeFirst(
              res?.first_end_day == "BEFORE_END_DAY" ? res?.first_day : "3",
            );
            setDaysBeforeSecond(
              res?.second_end_day == "BEFORE_END_DAY" ? res?.second_day : "3",
            );
            setFirstPayMonth(res?.first_month);
            setSecondPayMonth(res?.second_month);
            setFirstEndOption(res?.first_end_day);
            setSecondEndOption(res?.second_end_day);
            setDayForEndDate(
              res?.first_end_day != "BEFORE_END_DAY"
                ? res?.first_day
                : "END_OF_MONTH",
            );
            setDayForSecondEndDate(
              res?.second_end_day != "BEFORE_END_DAY"
                ? res?.second_day
                : "END_OF_MONTH",
            );
          }
        } catch (error) {
          //err
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [uid]);

  const handleReset = () => {
    setName("");
    setPayFrequency("EVERY_WEEK");
    setEndDate(format(new Date(), "MM-dd-yyyy"));
    setNextPayPeriod(format(new Date(), "MM-dd-yyyy"));
    setIsDefault(false);
    setFirstPayDay("END_OF_MONTH");
    setSecondPayDay("END_OF_MONTH");
    setDaysBeforeFirst("3");
    setDaysBeforeSecond("3");
    setFirstPayMonth("SAME");
    setSecondPayMonth("SAME");
    setFirstEndOption("END_DAY");
    setSecondEndOption("END_DAY");
    setDayForEndDate("END_OF_MONTH");
    setDayForSecondEndDate("END_OF_MONTH");
  };

  useEffect(() => {
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  const handleSave = async (e: FormEvent) => {
    // Simulate API call
    e.preventDefault();
    let data;
    if (payFrequency == "EVERY_WEEK" || payFrequency == "OTHER_WEEK") {
      data = {
        title: name,
        pay_frequency: payFrequency,
        status: "ACTIVE",
        is_default: isDefault,
        next_pay_date: moment(nextPayPeriod).format("YYYY-MM-DD"),
        end_of_next_pay_period: moment(endDate).format("YYYY-MM-DD"),
      };
    } else if (payFrequency == "EVERY_MONTH") {
      data = {
        title: name,
        pay_frequency: payFrequency,
        status: "ACTIVE",
        is_default: isDefault,
        first_payday: firstPayDay,
        first_end_day: firstEndOption,
        first_month: firstPayMonth,
        first_day:
          firstEndOption == "BEFORE_END_DAY" ? daysBeforeFirst : dayForEndDate, //backend named this wrong its the day of end of first pay period
        next_pay_date: moment(nextPayPeriod).format("YYYY-MM-DD"),
        end_of_next_pay_period: moment(endDate).format("YYYY-MM-DD"),
      };
    } else {
      data = {
        title: name,
        pay_frequency: payFrequency,
        status: "ACTIVE",
        is_default: isDefault,
        first_payday: firstPayDay,
        first_end_day: firstEndOption,
        first_month: firstPayMonth,
        first_day:
          firstEndOption == "BEFORE_END_DAY" ? daysBeforeFirst : dayForEndDate, //backend named this wrong its the day of end of first pay period
        second_payday: secondPayDay,
        second_end_day: secondEndOption,
        second_month: secondPayMonth,
        second_day:
          secondEndOption == "BEFORE_END_DAY"
            ? daysBeforeSecond
            : dayForSecondEndDate, //backend named this wrong its the day of end of second pay period
        next_pay_date: moment(nextPayPeriod).format("YYYY-MM-DD"),
        end_of_next_pay_period: moment(endDate).format("YYYY-MM-DD"),
      };
    }
    console.log(data, "data");
    try {
      setIsSubmitting(true);
      if (uid) {
        const res = await patchPaySchedule(uid, data);
        if (res?.success) {
          toast.success("Pay schedule updated.");
          refetch && refetch();
          setIsOpen(false);
        }
      } else {
        const res = await postPaySchedule(data);
        if (res?.success) {
          toast.success("Pay schedule created.");
          refetch && refetch();
          handleReset();
          setIsOpen(false);
        }
      }
    } catch (error) {
      //error
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDayOptions = () => {
    const options = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      return (
        <option key={day} value={formatDayWithSuffix(day)}>
          {formatDayWithSuffix(day)}
        </option>
      );
    });
    return [
      <option key="end-of-month" value="END_OF_MONTH">
        End of month
      </option>,
      ...options,
    ];
  };

  const isMonthly = payFrequency === "EVERY_MONTH";
  const isTwice = payFrequency === "TWICE_A_MONTH";

  /* one styled month-of pay-period panel (shared by EVERY_MONTH + the two TWICE_A_MONTH sections) */
  const PeriodPanel = ({
    title,
    payDay,
    setPayDay,
    endOption,
    setEndOption,
    daysBefore,
    setDaysBefore,
    payMonth,
    setPayMonth,
    endDay,
    setEndDay,
  }: {
    title: string;
    payDay: string;
    setPayDay: (v: string) => void;
    endOption: string;
    setEndOption: (v: string) => void;
    daysBefore: string;
    setDaysBefore: (v: string) => void;
    payMonth: string;
    setPayMonth: (v: string) => void;
    endDay: string;
    setEndDay: (v: string) => void;
  }) => (
    <div className="space-y-3 rounded-v-input border border-v-border bg-v-wash2 p-3.5">
      <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
        {title}
      </div>
      <div>
        <label className={LABEL}>Payday of the month</label>
        <VSelect value={payDay} onChange={(e) => setPayDay(e.target.value)} disabled={isSubmitting}>
          {renderDayOptions()}
        </VSelect>
      </div>
      <div>
        <label className={LABEL}>End of pay period</label>
        <VSelect
          value={endOption}
          onChange={(e) => setEndOption(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="END_DAY">End date</option>
          <option value="BEFORE_END_DAY">Number of days before payday</option>
        </VSelect>
      </div>
      {endOption === "BEFORE_END_DAY" ? (
        <div>
          <label className={LABEL}>Days before pay day</label>
          <input
            type="number"
            min={0}
            value={daysBefore}
            onChange={(e) => setDaysBefore(e.target.value)}
            className={FIELD}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Month</label>
            <VSelect
              value={payMonth}
              onChange={(e) => setPayMonth(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="SAME">Same</option>
              <option value="PREVIOUS">Previous</option>
              <option value="NEXT">Next</option>
            </VSelect>
          </div>
          <div>
            <label className={LABEL}>Day</label>
            <VSelect
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              disabled={isSubmitting}
            >
              {renderDayOptions()}
            </VSelect>
          </div>
        </div>
      )}
    </div>
  );

  const freqMeta = FREQUENCY_TILES.find((f) => f.value === payFrequency);
  const freqWord = (freqMeta?.label || "pay").toLowerCase();
  const periods = upcomingPayPeriods.slice(0, 4);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-v-card bg-white shadow-v-card">
        <span className="inline-block h-12 w-12 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
      </div>
    );
  }

  return (
    <div className="grid animate-v-rise items-start gap-4 font-jakarta text-v-ink900 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
      {/* LEFT — form card */}
      <form
        id={FORM_ID}
        onSubmit={handleSave}
        className="min-w-0 rounded-v-card bg-white p-[22px] shadow-v-card"
      >
        {/* header */}
        <div className="mb-5 flex items-center gap-2.5">
          <span
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-white"
            style={{ backgroundImage: "linear-gradient(140deg,#7C4DFF,#A78BFF)" }}
          >
            <CalendarRange className="h-[17px] w-[17px]" />
          </span>
          <div className="min-w-0">
            <div className="text-[16px] font-extrabold leading-tight tracking-[-0.01em] text-v-ink900">
              {uid ? "Edit pay schedule" : "Add pay schedule"}
            </div>
            <div className="text-[12px] text-v-ink400">When and how often your team gets paid</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Schedule name */}
          <div>
            <label className={LABEL}>
              Schedule name <span className="text-v-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly salaried"
              className={FIELD}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Pay frequency tiles */}
          <div>
            <label className={LABEL}>Pay frequency</label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {FREQUENCY_TILES.map((f) => {
                const active = payFrequency === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => changeFrequency(f.value)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-v-input border-[1.5px] px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-v-primary bg-[#F8F5FF]"
                        : "border-v-border bg-white hover:border-[#B49AFF]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[12.5px] font-bold",
                        active ? "text-v-primary" : "text-v-ink900",
                      )}
                    >
                      {f.label}
                    </span>
                    <span className="text-[11px] text-v-ink400">{f.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional cadence fields — same logic as before */}
          {isTwice ? (
            <>
              <PeriodPanel
                title="First pay period of the month"
                payDay={firstPayDay}
                setPayDay={setFirstPayDay}
                endOption={firstEndOption}
                setEndOption={setFirstEndOption}
                daysBefore={daysBeforeFirst}
                setDaysBefore={setDaysBeforeFirst}
                payMonth={firstPayMonth}
                setPayMonth={setFirstPayMonth}
                endDay={dayForEndDate}
                setEndDay={setDayForEndDate}
              />
              <PeriodPanel
                title="Second pay period of the month"
                payDay={secondPayDay}
                setPayDay={setSecondPayDay}
                endOption={secondEndOption}
                setEndOption={setSecondEndOption}
                daysBefore={daysBeforeSecond}
                setDaysBefore={setDaysBeforeSecond}
                payMonth={secondPayMonth}
                setPayMonth={setSecondPayMonth}
                endDay={dayForSecondEndDate}
                setEndDay={setDayForSecondEndDate}
              />
            </>
          ) : isMonthly ? (
            <PeriodPanel
              title="Pay period of the month"
              payDay={firstPayDay}
              setPayDay={setFirstPayDay}
              endOption={firstEndOption}
              setEndOption={setFirstEndOption}
              daysBefore={daysBeforeFirst}
              setDaysBefore={setDaysBeforeFirst}
              payMonth={firstPayMonth}
              setPayMonth={setFirstPayMonth}
              endDay={dayForEndDate}
              setEndDay={setDayForEndDate}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL}>
                  Next pay day <span className="text-v-primary">*</span>
                </label>
                <input
                  type="date"
                  value={nextPayPeriod ? format(parseDate(nextPayPeriod) || new Date(), "yyyy-MM-dd") : ""}
                  onChange={handleNextPayPeriodChange}
                  className={FIELD}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className={LABEL}>End of next pay period</label>
                <input
                  type="date"
                  value={endDate ? format(parseDate(endDate) || new Date(), "yyyy-MM-dd") : ""}
                  onChange={handleEndDateChange}
                  className={FIELD}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Set as default */}
          <div
            onClick={() => {
              if (isSubmitting) return;
              if (!isDefault) {
                toast.warning(
                  "This action will remove the existing default pay schedule and set this one as the new default.",
                );
              }
              setIsDefault(!isDefault);
            }}
            className="flex cursor-pointer items-center gap-3 rounded-v-input bg-v-wash2 px-3.5 py-3"
          >
            <div className="flex-1">
              <div className="text-[12.5px] font-bold text-v-ink900">Set as default</div>
              <div className="text-[11px] text-v-ink400">New employees use this cadence.</div>
            </div>
            <Toggle
              checked={isDefault}
              onChange={(checked) => {
                if (checked) {
                  toast.warning(
                    "This action will remove the existing default pay schedule and set this one as the new default.",
                  );
                }
                setIsDefault(checked);
              }}
              disabled={isSubmitting}
              className={isDefault ? "bg-v-success-solid" : undefined}
              aria-label="Set as default pay schedule"
            />
          </div>

          {/* divider */}
          <div className="border-t border-v-border" />

          {/* actions */}
          <div className="flex gap-2.5">
            <VioletButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </VioletButton>
            <VioletButton
              type="submit"
              variant="primary"
              className="flex-[1.4]"
              disabled={isSubmitting || !name.trim()}
              leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {isSubmitting ? "Saving…" : uid ? "Save changes" : "Add schedule"}
            </VioletButton>
          </div>
        </div>
      </form>

      {/* RIGHT — live preview (sticky) */}
      <div className="min-w-0 overflow-hidden rounded-v-card bg-white shadow-v-card lg:sticky lg:top-0">
        <div className="flex items-center gap-2.5 border-b border-v-border px-[22px] py-[18px]">
          <IconChip tone="success">
            <CalendarCheck />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold tracking-[-0.01em] text-v-ink900">
              Upcoming pay periods
            </div>
            <div className="text-[12px] text-v-ink400">Auto-generated from your settings</div>
          </div>
        </div>

        {/* column strip */}
        <div
          className="grid gap-2.5 border-b border-v-border bg-[#FBFAFE] px-[22px] py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-v-ink400"
          style={{ gridTemplateColumns: "44px 1fr 1.3fr" }}
        >
          <span>No</span>
          <span>Pay date</span>
          <span>Pay period</span>
        </div>

        {/* rows */}
        {periods.length ? (
          periods.map((p, i) => (
            <div
              key={p.no}
              className="grid animate-v-pop items-center gap-2.5 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 last:border-0"
              style={{ gridTemplateColumns: "44px 1fr 1.3fr", animationDelay: `${i * 0.05}s` }}
            >
              <span className="flex h-6 w-7 items-center justify-center rounded-[8px] bg-v-tint100 text-[11.5px] font-extrabold tabular-nums text-v-primary">
                {p.no}
              </span>
              <span className="text-[12.5px] font-bold tabular-nums text-v-ink900">{p.payDate}</span>
              <span className="text-[12px] tabular-nums text-v-ink500">{p.periodRange}</span>
            </div>
          ))
        ) : (
          <div className="px-[22px] py-8 text-center text-[12px] text-v-ink400">
            Set a pay frequency and date to preview upcoming periods.
          </div>
        )}

        {/* note */}
        <div className="m-[14px] rounded-v-input bg-[#F7F5FC] px-3.5 py-2.5 text-[11px] text-v-ink500">
          Showing the next 4 {freqWord} periods. Dates adjust automatically.
        </div>
      </div>
    </div>
  );
};

export default PaySchedulesForm;
