"use client";

import React from "react";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Employee {
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
  amount: string;
}

interface PayrollSection {
  type: "Weekly" | "Monthly";
  totalAmount: string;
  startDate: string;
  endDate: string;
  payDate: string;
  employees: Employee[];
}

const payrollData: PayrollSection[] = [
  {
    type: "Weekly",
    totalAmount: "$10,500",
    startDate: "05 Mar 2024",
    endDate: "07 Mar 2024",
    payDate: "07 Mar 2024",
    employees: [
      {
        name: "Talha",
        startDate: "05 Mar 2024",
        endDate: "07 Mar 2024",
        payDate: "07 Mar 2024",
        amount: "$10,500",
      },
      {
        name: "Jarif",
        startDate: "07 Mar 2024",
        endDate: "07 Mar 2024",
        payDate: "07 Mar 2024",
        amount: "$400",
      },
      {
        name: "Nazirul",
        startDate: "07 Mar 2024",
        endDate: "07 Mar 2024",
        payDate: "07 Mar 2024",
        amount: "$800",
      },
    ],
  },
  {
    type: "Monthly",
    totalAmount: "$10,000",
    startDate: "05 Mar 2024",
    endDate: "05 Mar 2024",
    payDate: "07 Mar 2024",
    employees: [
      {
        name: "Sarwar",
        startDate: "05 Mar 2024",
        endDate: "05 Mar 2024",
        payDate: "07 Mar 2024",
        amount: "$10,000",
      },
      {
        name: "Kamrul",
        startDate: "07 Mar 2024",
        endDate: "07 Mar 2024",
        payDate: "07 Mar 2024",
        amount: "$500",
      },
      {
        name: "Sabbir",
        startDate: "07 Mar 2024",
        endDate: "07 Mar 2024",
        payDate: "07 Mar 2024",
        amount: "$900",
      },
    ],
  },
];

export default function PayrollTable() {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    Weekly: true,
    Monthly: true,
  });
  const [activeTab, setActiveTab] = useState<"process" | "archive">("process");

  const toggleSection = (sectionType: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionType]: !prev[sectionType],
    }));
  };

  return (
    <div className="mx-auto my-7 w-full rounded-xl border bg-white p-6">
      {/* Tabs */}
      <div className="mb-6 flex gap-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("process")}
          className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
            activeTab === "process"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          On process
        </button>
        <button
          onClick={() => setActiveTab("archive")}
          className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
            activeTab === "archive"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Archive
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Pay Schedule/ Emp Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Start Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                End Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Pay Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Bank Account Number
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Amount
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Action/Status
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {payrollData.map((section) => (
              <React.Fragment key={section.type}>
                {/* Section Header Row */}
                <tr className="border  border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSection(section.type)}
                        className="rounded p-1 transition-colors hover:bg-gray-200"
                      >
                        {expandedSections[section.type] ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                        <span className="font-medium text-gray-900">
                          {section.type}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                   
                  </td>
                  <td className="px-4 py-3 text-gray-700"></td>
                  <td className="px-4 py-3 text-gray-700"></td>
                  <td className="px-4 py-3 text-gray-700"></td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {/* {section.totalAmount} */}
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700">
                      Send
                    </button>
                  </td>
                </tr>

                {/* Employee Rows */}
                {expandedSections[section.type] &&
                  section.employees.map((employee, index) => (
                    <tr
                      key={`${section.type}-${index}`}
                      className="border text-sm font-light border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4  py-3 pl-12">
                        <span className="text-gray-700">{employee.name}</span>
                      </td>
                      <td className="px-4 py-3 border text-gray-700">
                        {employee.startDate}
                      </td>
                      <td className="px-4 border py-3 text-gray-700">
                        {employee.endDate}
                      </td>
                      <td className="px-4 border py-3 text-gray-700">
                        {employee.payDate}
                      </td>
                      <td className="px-4 py-3 border text-gray-700">*********123</td>
                      <td className="px-4 py-3 border text-gray-700">
                        {employee.amount}
                      </td>
                      <td className="px-4 border py-3">
                        <button className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700">
                          Send
                        </button>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
