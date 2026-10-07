"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBankOverview } from "@/app/helpers/backend";
import Link from "next/link";

const chartData = [
  { value: 100 },
  { value: 120 },
  { value: 80 },
  { value: 90 },
  { value: 110 },
  { value: 160 },
  { value: 140 },
  { value: 90 },
  { value: 130 },
  { value: 120 },
  { value: 140 },
  { value: 100 },
  { value: 110 },
  { value: 100 },
];

export default function BankBalanceCard() {
  const [chartData, setChartData] = useState<any[]>([]);
  const { data, isPending, refetch } = useQuery({
    queryKey: ["bank-overview-data"],
    queryFn: () => getBankOverview(),
  });

  useEffect(() => {
    if (data && !isPending) {
      const formatted = data?.current_year?.map((data: any) => {
        const key = Object.keys(data)?.[0];
        return { value: data?.[key] || 0 };
      });
      setChartData(formatted);
    }
  }, [data]);

  return (
    <div className="h-[315px] max-h-[315px]">
      <Card
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="h-full border-0 bg-white p-4 shadow-sm"
      >
        <CardHeader className="p-0">
          <h2 className="mb-1 text-base font-medium text-accent_charcoal_indigo">
            Total Bank Balance
          </h2>

          <div className="space-y-1">
            <p className="text-sm font-normal text-accent_granite">Balance</p>
            <p className="text-base font-semibold text-accent_charcoal_indigo">
              $ {data?.total}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="rounded-full bg-accent_soft_green p-1">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-light text-accent_granite">
              Updated from all accounts
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-0 pt-2">
          {/* Chart */}
          <div className="mb-4 h-24">
            {chartData?.length ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Balance",
                    color: "#60a5fa",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#60a5fa"
                      strokeWidth={3}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : ''}
          </div>

          {/* Review Button */}
          <Link href="/dashboard/transactions/banking">
          <Button
            variant="secondary"
            className="h-auto w-full rounded-xl border-0 bg-accent_ice_gray py-3 font-medium text-accent_secondary hover:bg-gray-200"
          >
            Review Transactions
          </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
