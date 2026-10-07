"use client";
import React, { useEffect, useState } from "react";
import ReportFilter from "../../payroll/report/_components/filter2";
import moment from "moment";
import { fetchEmployeeReport } from "@/app/helpers/backend";
import { baseURL } from "@/app/helpers/api";

const Page = () => {
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const token = localStorage.getItem("access_token");
  const [issGenerating, setissGenerating] = useState(false);

  // ✅ keep filters in state
  const [filters, setFilters] = useState<{ start_date?: string; end_date?: string }>({});

  const getData = async () => {
    try {
      let data;
      //get data
      if (filters.start_date && filters.end_date) {
        data = await fetchEmployeeReport({
          start_date: moment(filters.start_date).format("YYYY-MM-DD"),
          end_date: moment(filters.end_date).format("YYYY-MM-DD"),
        });
      } else {
        //set data on var
        data = await fetchEmployeeReport({});
      }

      setEmployeeData(data.results || []);
      setNextUrl(data.next);
      setPrevUrl(data.previous);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    //getting data
    getData();
  }, [filters]);

  const handleFilterChange = (params: any) => {
    setFilters({
      start_date: params?.start_date,
      end_date: params?.end_date,
    });
  };

  const handlePageChange = async (url: string | null) => {
    if (!url) return;

    try {
      const response = await fetch(url);
      const json = await response.json();

      setEmployeeData(json.results || []);
      setNextUrl(json.next);
      setPrevUrl(json.previous);
    } catch (err) {
      console.error("Pagination fetch failed:", err);
    }
  };

  const DeletePdf = async (uid: string) => {
    try {
      const res = await fetch(baseURL + "/we/attachments/" + uid, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      console.log("PDF deleted:", result);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const DownloadPdf = (fileUrl: string, uid: string) => {
    const fileName = fileUrl.split("/").pop() || `report_${Date.now()}.pdf`;

    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
        DeletePdf(uid);
      })
      .catch((err) => console.error("Download failed", err));
  };

  const generatrePdf = async () => {
    try {
      setissGenerating(true);
      // PDF generation logic here
      const res = await fetch(baseURL + "/we/employees?is_pdf=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      setissGenerating(false);
      await DownloadPdf(result.url, result.file_uid);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setissGenerating(false);
    }
  };

  return (
    <div>
      <ReportFilter
        defaultRange="this_month"
        params={{
          created_at_after: moment().startOf("week").format("YYYY-MM-DD"),
          created_at_before: moment().endOf("week").format("YYYY-MM-DD"),
        }}
        setParams={handleFilterChange} // ✅ same as attendance page
        onFilterChange={() => console.log("filter changed")}
      />

      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={generatrePdf}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white"
        >
          {issGenerating ? "Generating..." : "Print"}
        </button>
      </div>

      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="my-8 rounded-xl border bg-white p-6"
        id="report-content"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">Halo Axis</p>
            <h1 className="text-3xl font-bold text-gray-900">Employee details report</h1>
            <p className="text-sm text-gray-600 mt-1">
              For all employees from all locations
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Personal Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Hire date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Work location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Pay Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Tax Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeeData.map((emp, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      {emp.user.first_name} {emp.user.middle_name ? emp.user.middle_name + " " : ""} {emp.user.last_name}
                      <br />
                      ID: {emp.employee_id || "—"}
                      <br />
                      DOB: {emp.user.date_of_birth || "—"}
                      <br />
                      Gender: {emp.user.gender}
                    </td>
                    <td className="border px-4 py-2">{emp.offer_date || "—"}</td>
                    <td className="border px-4 py-2">
                      {emp.work_locations ? (
                        <>
                          {emp.work_locations.location_address},<br />
                          {emp.work_locations.location_city},{" "}
                          {emp.work_locations.location_state}{" "}
                          {emp.work_locations.location_zip}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      Kind: {emp.pay_kind}
                      <br />
                      Salary: {parseFloat(emp.total_salary) > 0 ? `$${emp.total_salary}/yr` : "—"}
                      <br />
                      Hourly: {parseFloat(emp.total_rate_per_hour) > 0 ? `$${emp.total_rate_per_hour}/hr` : "—"}
                    </td>
                    <td className="border px-4 py-2">
                      SSN: {emp.user.ssn || "—"}
                      <br />
                      Citizenship: {emp.citizenship_kind}
                      <br />
                      USCIS: {emp.uscis_or_alien_registration_number || "—"}
                      <br />
                      I-94: {emp.from_i_94 || "—"}
                      <br />
                      Passport: {emp.foreign_passport || "—"}
                      <br />
                      SSN from I-9: {emp.is_included_social_security_number_from_i9 ? "Yes" : "No"}
                    </td>
                    <td className="border px-4 py-2">{emp.terminate_description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between mt-6 mx-4 mb-4">
              <button
                disabled={!prevUrl}
                onClick={() => handlePageChange(prevUrl)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  prevUrl
                    ? "bg-gray-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              <button
                disabled={!nextUrl}
                onClick={() => handlePageChange(nextUrl)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  nextUrl
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
