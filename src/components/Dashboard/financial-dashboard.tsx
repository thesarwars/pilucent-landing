"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BiSolidDownArrow,
  BiSolidRightArrow,
  BiSolidUpArrow,
} from "react-icons/bi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ProgressBar } from "./progress-bar";
import { useQuery } from "@tanstack/react-query";
import { getProfitLossesDashboard } from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";

export const getDateRange = (filter: string) => {
  const today = new Date();
  const endDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  let startDate;

  switch (filter) {
    case "last-7-days":
      startDate = new Date(today.setDate(today.getDate() - 6)); // includes today
      break;
    case "last-30-days":
      startDate = new Date(today.setDate(today.getDate() - 29));
      break;
    case "last-90-days":
      startDate = new Date(today.setDate(today.getDate() - 89));
      break;
    default:
      throw new Error("Invalid option");
  }

  return {
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate,
  };
};
export default function FinancialSummary() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("last-30-days");
  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    const date = getDateRange(filter);
    setDateRange(date);
  }, [filter]);

  const { data, isPending, refetch } = useQuery({
    queryKey: [
      "profit-losses-overview-dashboard",
      dateRange?.end_date,
      dateRange?.start_date,
    ],
    queryFn: () => getProfitLossesDashboard(dateRange),
    enabled: !!dateRange?.start_date,
  });

  // console.log()

  return (
    <div className="h-[315px] max-h-[315px]">
      <Card className="h-full bg-white shadow-sm">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-accent_charcoal_indigo">
              Profit & Loss
            </h2>
            <div className="flex items-center gap-2">
              <Select
                value={filter}
                onValueChange={(e) => {
                  setFilter(e);
                }}
                // defaultValue="last-30-days"
                open={isOpen}
                onOpenChange={setIsOpen}
              >
                <SelectTrigger className="w-32 rounded-full border border-accent_cloud_gray px-4 py-2 text-accent_granite shadow-sm hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer rounded-full border border-accent_cloud_gray p-2 shadow-sm transition-colors duration-150 hover:bg-gray-200 active:scale-95"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </CardHeader>
        <div className="relative h-1 w-full bg-accent_bluish_gray">
          <div className="absolute -left-3 -top-3 size-6 rounded-full border-r bg-accent_bluish_gray"></div>
          <div className="absolute -right-3 -top-3 size-6 rounded-full border-l bg-accent_bluish_gray"></div>
        </div>

        <CardContent className="space-y-6 p-4">
          {/* Net Profit Section */}
          <div>
            <p className="mb-1 text-sm text-accent_granite">
              Net profit for {filter?.split("-").join(" ")}
              {/* for May */}
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold text-accent_charcoal_indigo">
                $ {data?.total_net_profit}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 rounded-full bg-accent_soft_green px-2 py-1 ${data?.prior_month_growth == 0 ? "bg-yellow-500" : data?.prior_month_growth < 0 ? "bg-red-500" : ""}`}
                >
                  {data?.prior_month_growth == 0 ? (
                    <BiSolidRightArrow className="h-3 w-3 text-white" />
                  ) : data?.prior_month_growth > 0 ? (
                    <BiSolidUpArrow className="h-3 w-3 text-white" />
                  ) : (
                    <BiSolidDownArrow className="h-3 w-3 text-white" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {Number(data?.prior_month_growth || 0).toFixed(2) || 0}%
                  </span>
                </div>
                <span className="text-xs font-light text-accent_granite">
                  From prior month
                </span>
              </div>
            </div>
          </div>

          {/* Income and Expenses */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-md bg-accent_azure_blue"></div>
                <span className="text-sm text-accent_granite">Income</span>
              </div>
              <span className="text-base font-semibold text-accent_charcoal_indigo">
                $ {data?.total_income}
              </span>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-md bg-accent_sunset_orange"></div>
                <span className="text-sm text-accent_granite">Expenses</span>
              </div>
              <span className="text-base font-semibold text-accent_charcoal_indigo">
                $ {data?.total_expense}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-2">
            <div className="space-y-2">
              {/* Income bar (blue) */}
              <ProgressBar
                value={(data?.total_expense / 350000) * 100}
                variant="orange"
                className="h-4"
                animated
              />
              {/* Expenses bar (orange with stripes) */}
              <ProgressBar
                value={(data?.total_income / 350000) * 100}
                variant="blue"
                className="h-4"
                animated
              />
            </div>

            {/* Chart labels */}
            <div className="flex justify-between px-1 text-xs text-gray-500">
              <span>0</span>
              <span>50k</span>
              <span>100k</span>
              <span className="max-md:hidden">150k</span>
              <span className="font-medium">200k</span>
              <span className="max-md:hidden">300k</span>
              <span>400k</span>
              <span className="max-md:hidden">500k</span>
              <span>700k</span>
              <span className="max-md:hidden">800k</span>
              <span>1M</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
