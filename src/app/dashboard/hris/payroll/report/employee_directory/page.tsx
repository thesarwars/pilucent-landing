"use client";
import { useAppSelector } from "@/app/redux/store";
import React, { useState, useMemo } from "react";
import moment from "moment";
import ReportFilter from "../_components/filter2";

interface EmployeeData {
  id: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  homeAddress: string;
  workLocation: string;
  hireDate: string;
}

// Static data based on the image
const staticEmployeeData: EmployeeData[] = [
  {
    id: "1",
    name: "Babu, Ab. Rahim",
    birthDate: "04/30/yyyy",
    email: "babu@gmail.com",
    phone: "Work phone: 315-790-5724\nHome phone: 031-722-3401",
    homeAddress: "300 Mercer St Apt 23L, New York, NY 10003-6740",
    workLocation: "300 Mercer St Apt 23L, New York, NY 10003-6740",
    hireDate: "05/01/2025"
  },
  {
    id: "2",
    name: "Frankline, John",
    birthDate: "03/01/yyyy",
    email: "quantiloft@gmail.com",
    phone: "",
    homeAddress: "821 N Main St # 1/2, Washington, IL 61571-1577",
    workLocation: "5396 N Reese Ave, Fresno, CA 93722-6112",
    hireDate: "02/01/2025"
  },
  {
    id: "3",
    name: "Islam, Kamrul",
    birthDate: "03/10/yyyy",
    email: "kamrul@jumatechs.com",
    phone: "",
    homeAddress: "300 Mercer St Apt 23L, New York, NY 10003-6740",
    workLocation: "5396 N Reese Ave, Fresno, CA 93722-6112",
    hireDate: "02/01/2025"
  },
  {
    id: "4",
    name: "Ragib, Abid Israk",
    birthDate: "01/09/yyyy",
    email: "velocity.visions99@gmail.com",
    phone: "",
    homeAddress: "500 S Franklin St, Syracuse, NY 13202",
    workLocation: "5396 N Reese Ave, Fresno, CA 93722-6112",
    hireDate: "03/01/2025"
  },
  {
    id: "5",
    name: "Roberts, James",
    birthDate: "02/02/yyyy",
    email: "kamrul.girbd@gmail.com",
    phone: "",
    homeAddress: "32 N Railroad Ave, Frackville, PA 17931-1413",
    workLocation: "5396 N Reese Ave, Fresno, CA 93722-6112",
    hireDate: "02/01/2025"
  },
  {
    id: "6",
    name: "Sagor, Jim H",
    birthDate: "",
    email: "pm2.jumatechs@gmail.com",
    phone: "Work phone: 031-722-3401\nHome phone: 315-790-5724\nMobile: 019-364-4758",
    homeAddress: "",
    workLocation: "5396 N Reese Ave, Fresno, CA 93722-6112",
    hireDate: "06/01/2025"
  }
];

const EmployeeDirectoryPage = () => {
  const [processedData, setProcessedData] = useState<EmployeeData[]>(staticEmployeeData);
  const [params, setParams] = useState({
    created_at_after: "01/01/2025",
    created_at_before: "12/31/2025"
  });
  
  const { Company } = useAppSelector((state) => state.CompanyData);

  // Handle filter changes
  const handleFilterChange = (newParams: any) => {
    setParams(newParams);
    // Apply any filtering logic here if needed
  };

  const printReport = () => {
    const printContent = document.getElementById("report-content")?.innerHTML;
    const printWindow = window.open("", "_blank");

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            return "";
          }
        })
        .join("\n");

      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Directory Report</title>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const formatPhoneNumbers = (phoneString: string) => {
    if (!phoneString) return "-";
    return phoneString.split('\n').map((phone, index) => (
      <div key={index} className="text-sm">{phone}</div>
    ));
  };

  return (
    <div className="mx-auto p-4">
      {/* Header */}
      <ReportFilter
        params={params}
        setParams={setParams}
        // onFilterChange={handleFilterChange}
      />

      <div id="report-content">
        <div className="mb-8 text-center flex flex-col justify-center">
          <h1 className="mb-2 text-xl font-medium text-gray-600">
            {Company?.name || "Halo Axis"}
          </h1>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Employee directory report
          </h2>
          <p className="text-lg text-gray-600">
            For all employees from all locations
          </p>
          <div className="mt-4 text-center text-sm font-medium text-gray-900">
            From{" "}
            {moment(new Date(params?.created_at_after || "01/01/2025")).format("DD MMMM, YYYY")}
            {"  "} to{" "}
            {moment(new Date(params?.created_at_before || "12/31/2025")).format("DD MMMM, YYYY")}
          </div>
        </div>

        <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Birth date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Home address
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Work location
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Hire date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {processedData?.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                    {employee.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                    {employee.birthDate || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                    {employee.email || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                    {formatPhoneNumbers(employee.phone)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                    {employee.homeAddress || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                    {employee.workLocation || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {employee.hireDate}
                  </td>
                </tr>
              ))}
              
              {!processedData.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No employee records found
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

export default EmployeeDirectoryPage;