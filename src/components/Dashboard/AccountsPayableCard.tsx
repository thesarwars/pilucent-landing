"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SegmentedProgressBar } from "./SegmentedProgressBar";
import { useEffect, useState } from "react";

export default function AccountsPayableCard({ data }: { data: any }) {
  const [payableData, setPayableData] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [animated, setAnimated] = useState(true);
  const [showStripes, setShowStripes] = useState(true);

  useEffect(() => {
    if (data) {
      const formatted = [
        {
          label: "Total Suppliers",
          value: data?.supplier_count,
          color: "#56BADA",
          amount: "516",
          isCount: true,
        },
        {
          label: "Total Customers",
          value: data?.customer_count,
          color: "#A7B8FF",
          amount: "$0.00",
        },
        {
          label: "Total Bill",
          value: data?.bill_count,
          color: "#F5886A",
          amount: "$12,500",
        },
        {
          label: "Total Invoice",
          value: data?.invoice_count,
          color: "#9B88F9",
          amount: "280",
          isCount: true,
        },
      ];
      const total = formatted?.reduce((prev, item) => prev + item?.value, 0);
      const formattedSegments = [
        {
          value: (formatted?.[0]?.value / total) * 100 - 10 || 5,
          color: "bg-[#56BADA]",
          label: "Completed",
        },
        {
          value: (formatted?.[1]?.value / total) * 100 - 10 || 5,
          color: "bg-[#A7B8FF]",
          label: "In Progress",
        },
        {
          value: (formatted?.[2]?.value / total) * 100 - 10 || 5,
          color: "bg-[#F5886A]",
          label: "Review",
        },
        {
          value: (formatted?.[3]?.value / total) * 100 - 10 || 5,
          color: "bg-[#9B88F9]",
          label: "Planning",
        },
      ];
      setSegments(formattedSegments);
      setPayableData(formatted);
    }
  }, [data]);
  return (
    <div>
      <Card
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="border-0 bg-white"
      >
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-1 text-base font-normal text-accent_charcoal_indigo">
                Accounts Payable
              </h2>
              <p className="text-sm font-light text-accent_granite">
                Total A/P amount
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-normal text-accent_charcoal_indigo">
                $ {data?.opening_balance}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          <div className="space-y-6">
            {/* Progress Bar */}
            {segments?.length ? (
              <SegmentedProgressBar
                segments={segments}
                animated={animated}
                showStripes={showStripes}
                height="lg"
              />
            ) : (
              ""
            )}

            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-6">
              {payableData?.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className="mt-1 h-4 w-4 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-light text-accent_granite">
                      {item.label}
                    </p>
                    <p className="text-base font-normal text-accent_charcoal_indigo">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
