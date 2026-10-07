"use client";

import { getBankOverview } from "@/app/helpers/backend";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

// const bankAccounts = [
//   {
//     id: 1,
//     name: "PayPoint",
//     logo: "PP",
//     balance: "$4,345.67",
//     change: 7,
//     isPositive: true,
//     bgColor: "bg-[#FEFBEB]",
//     logoColor: "text-blue-600",
//   },
//   {
//     id: 2,
//     name: "eway",
//     logo: "e",
//     balance: "$18,345.67",
//     change: 7,
//     isPositive: false,
//     bgColor: "bg-[#F2E7FF]",
//     logoColor: "text-gray-800",
//   },
//   {
//     id: 3,
//     name: "WEPAY",
//     logo: "WEPAY",
//     balance: "$12,345.67",
//     change: 7,
//     isPositive: false,
//     bgColor: "bg-[#E8E9F6]",
//     logoColor: "text-blue-500",
//   },
//   {
//     id: 4,
//     name: "sage",
//     logo: "sage",
//     balance: "$8,345.67",
//     change: 7,
//     isPositive: true,
//     bgColor: "bg-[#E9F6EB]",
//     logoColor: "text-green-600",
//   },
// ];

export default function BankAccountsGrid() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const { data, isPending, refetch } = useQuery({
    queryKey: ["bank-overview"],
    queryFn: () => getBankOverview(),
  });

  useEffect(() => {
    if (data && !isPending) {
      const bankData = [
        {
          id: 1,
          name: data?.results?.[0]?.title,
          logo: data?.results?.[0]?.title[0],
          balance: `$ ${data?.results?.[0]?.opening_balance || 0}`,
          change: 7,
          isPositive: true,
          bgColor: "bg-[#FEFBEB]",
          logoColor: "text-blue-600",
        },
        {
          id: 2,
          name: data?.results?.[1]?.title,
          logo: data?.results?.[1]?.title?.[0],
          balance: `$ ${data?.results?.[1]?.opening_balance || 0}`,
          change: 7,
          isPositive: false,
          bgColor: "bg-[#F2E7FF]",
          logoColor: "text-gray-800",
        },
        {
          id: 3,
          name: data?.results?.[2]?.title,
          logo: data?.results?.[2]?.title?.[0],
          balance: `$ ${data?.results?.[2]?.opening_balance || 0}`,
          change: 7,
          isPositive: false,
          bgColor: "bg-[#E8E9F6]",
          logoColor: "text-blue-500",
        },
        {
          id: 4,
          name: data?.results?.[3]?.title,
          logo: data?.results?.[3]?.title?.[0],
          balance: `$ ${data?.results?.[3]?.opening_balance || 0}`,
          change: 7,
          isPositive: true,
          bgColor: "bg-[#E9F6EB]",
          logoColor: "text-green-600",
        },
      ];

      setBankAccounts(bankData);
    }
  }, [data]);

  return (
    <div className="md:h-[315px] md:max-h-[315px]">
      <Card
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="h-full border-0 bg-white p-4 shadow-sm"
      >
        <CardHeader className="p-0 pb-4">
          <h2 className="text-base font-normal text-accent_charcoal_indigo">
            All Attach Bank Account
          </h2>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 transition-all duration-1000 gap-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`${account.bgColor} transition-all duration-1000 relative rounded-xl px-4 py-3`}
              >
                {/* Logo and Percentage */}
                <div className="mb-1 flex flex-col items-start transition-all duration-1000 justify-between md:flex-row">
                  <div className="flex items-center gap-2">
                    {/* {account.name === "PayPoint" && (
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-blue-600">
                          PP
                        </span>
                        <span className="ml-1 text-sm font-bold text-yellow-500">
                          Pay
                        </span>
                        <span className="text-sm font-bold text-yellow-600">
                          Point
                        </span>
                      </div>
                    )} */}
                    <div className="flex items-center">
                      <div
                        className={`mr-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-sm font-bold text-white ${account?.logoColor} ${account?.bg_color}`}
                      >
                        {account?.logo || ''}
                      </div>
                      <span className="font-medium line-clamp-1 text-gray-800">
                        {account?.name || ''}
                      </span>
                      <span className="ml-1 text-xs text-gray-600">™</span>
                    </div>
                    {/* )}
                    {account.name === "WEPAY" && (
                      <span className="text-lg font-bold text-blue-500">
                        WEPAY
                      </span>
                    )}
                    {account.name === "sage" && (
                      <span className="text-lg font-bold text-green-600">
                        sage
                      </span>
                    )} */}
                  </div>

                  {/* <div className="flex items-center gap-1">
                    <div
                      className={`rounded-full p-1 ${account.isPositive ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {account.isPositive ? (
                        <ChevronUp className="h-3 w-3 text-white" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {account.change}%
                    </span>
                  </div> */}
                </div>

                {/* Balance */}
                <div className="space-y-1">
                  <p className="text-sm font-light text-accent_granite">
                    Balance
                  </p>
                  <p className="text-base font-normal text-accent_charcoal_indigo">
                    {account?.balance || '$ 0'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
