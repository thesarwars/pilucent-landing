"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BiSolidDownArrow,
  BiSolidRightArrow,
  BiSolidUpArrow,
} from "react-icons/bi";
import { TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getDateRange } from "./financial-dashboard";
import { getExpenseOverview } from "@/app/helpers/backend";
import { useQuery } from "@tanstack/react-query";

const chartConfig = {
  purchases: {
    label: "Purchases",
    color: "#f472b6",
  },
  miscellaneous: {
    label: "Other Miscellaneous Expense",
    color: "#4ade80",
  },
  costOfGoods: {
    label: "Cost of goods sold",
    color: "#60a5fa",
  },
};

export default function ExpensesCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([
    { name: "Cost of goods sold", value: 0, color: "#6AB5EC" },
    { name: "Purchases", value: 0, color: "#F78EB6" },
    { name: "Other Miscellaneous Expense", value: 0, color: "#8AD193" },
  ]);
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
      "expense-overview-dashboard",
      dateRange?.end_date,
      dateRange?.start_date,
    ],
    queryFn: () => getExpenseOverview(dateRange),
    enabled: !!dateRange?.start_date,
  });

  useEffect(() => {
    if (data && !isPending) {
      const expenseData = [
        {
          name: "Cost of goods sold",
          value: (data?.total_cost_of_good / data?.total) * 100 || 1,
          color: "#6AB5EC",
        },
        { name: "Purchases", value: 1, color: "#F78EB6" },
        {
          name: "Other Miscellaneous Expense",
          value: (data?.total_other_miscellaneous / data?.total) * 100,
          color: "#8AD193",
        },
      ];
      setExpenseData(expenseData);
    }
  }, [data]);

  return (
    <div>
      <Card
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="md:h-[315px] md:max-h-[315px] border-0 bg-white pt-4 shadow-sm"
      >
        <CardHeader className="p-5 pb-2">
          <div className="flex flex-col items-start justify-between md:flex-row">
            <div className="flex max-md:items-center max-md:gap-2 md:flex-col">
              <h2 className="mb-1 text-base font-normal text-accent_charcoal_indigo">
                Expenses
              </h2>
              <p className="text-sm font-light text-accent_granite">
                Spending for {filter?.split("-").join(" ")}
              </p>
            </div>

            <div className="flex items-center gap-2 font-lexend text-sm">
              <Select
                value={filter}
                onValueChange={(e) => {
                  setFilter(e);
                }}
                open={isOpen}
                onOpenChange={setIsOpen}
              >
                <SelectTrigger className="w-32 rounded-full border border-accent_cloud_gray px-4 py-2 text-accent_granite shadow-sm hover:bg-gray-200 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="font-lexend" value="last-30-days">
                    Last 30 days
                  </SelectItem>
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

        <CardContent className="px-4 py-3 pt-0">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            {/* Donut Chart */}
            <div className="flex-shrink-0">
              <ChartContainer config={chartConfig} className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      cornerRadius={6}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          radius={100}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Stats and Legend */}
            <div className="flex-1 space-y-2">
              {/* Total Expenses */}
              <div>
                <p className="mb-2 text-sm font-normal text-accent_granite">
                  Total Number of expenses
                </p>
                <p className="mb-2 text-base font-medium text-accent_charcoal_indigo">
                  $ {data?.total || 0}
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[#EE3D26]">
                    {data?.prior_month_growth == 0 ? (
                      <BiSolidRightArrow className="h-3 w-3 text-yellow-500" />
                    ) : data?.prior_month_growth > 0 ? (
                      <BiSolidUpArrow className="h-3 w-3 text-accent_soft_green" />
                    ) : (
                      <BiSolidDownArrow className="h-3 w-3 text-[#EE3D26]" />
                    )}
                    <span
                      className={`text-sm font-medium ${data?.prior_month_growth > 0 ? "text-accent_soft_green" : data?.prior_month_growth < 0 ? "text-[#EE3D26]" : data?.prior_month_growth == 0 ? "text-yellow-500" : 0}`}
                    >
                      {Number(data?.prior_month_growth || 0).toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-xs font-light text-accent_granite">
                    From prior {filter?.split("-").join(" ")}
                  </span>
                </div>
              </div>
              <hr />
              {/* Legend */}
              <div className="space-y-3">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-normal text-gray-600">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
