"use client";
import React, { useEffect, useState } from "react";
import ReportFilter from "../../payroll/report/_components/filter2";
import moment from "moment";
import { useFetch } from "@/app/helpers/hooks";
import { fetchAttendances } from "@/app/helpers/backend";
import { baseURL } from "@/app/helpers/api";
// Define the type for attendance data
interface AttendanceData {
  slNo: number;
  empId: string;
  name: string;
  designation: string;
  shift: string;
  status: string;
  inTime: string;
  outTime: string;
  late: number;
  workHours: number;
  otHours: number;
}

const attendanceData: AttendanceData[] = [
  { slNo: 1, empId: 'None', name: 'Mossaddak', designation: '', shift: '08:00:00 to 16:00:00', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 2, empId: 'None', name: 'None', designation: '', shift: 'to', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 3, empId: 'None', name: 'None', designation: '', shift: 'to', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 4, empId: 'None', name: 'None', designation: '', shift: 'to', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 5, empId: 'None', name: 'None', designation: '', shift: 'to', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 6, empId: 'None', name: 'Mossaddak', designation: '', shift: '08:00:00 to 16:00:00', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 7, empId: 'None', name: 'None', designation: '', shift: 'to', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
  { slNo: 8, empId: 'None', name: 'None', designation: '', shift: 'to', status: 'ABSENT', inTime: 'None', outTime: 'None', late: 0, workHours: 0, otHours: 0 },
];

const Page = () => {
  // const { data, setQueryParams, isPending, refetch } = useFetch(
  //   ["attendance_data"],
  //   fetchAttendances,
  // );
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const token = localStorage.getItem("access_token");
  const [issGenerating, setissGenerating] = useState(false);

  // Keep start & end date as single source of truth
  const [filters, setFilters] = useState<{ start_date?: string; end_date?: string }>({});

const getData = async () => {
  try {
    let data;

    if (filters.start_date && filters.end_date) {
      //date rage set
      data = await fetchAttendances({
        start_date: moment(filters.start_date).format("YYYY-MM-DD"),
        end_date: moment(filters.end_date).format("YYYY-MM-DD"),
      });
    } else {
      //fatching data api
      data = await fetchAttendances({});
    }

    setAttendanceData(data.results || []);
    setNextUrl(data.next);
    setPrevUrl(data.previous);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
};

  // Call getData when filters change
  useEffect(() => {
    //get data
    getData();
  }, [filters]);

  const handleFilterChange = (params: any) => {
    setFilters({
      start_date: params?.start_date,
      end_date: params?.end_date,
    });
  };

  // pagination stays the same
  const handlePageChange = async (url: string | null) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const json = await response.json();
      setAttendanceData(json.results || []);
      setNextUrl(json.next);
      setPrevUrl(json.previous);
    } catch (err) {
      console.error("Pagination fetch failed:", err);
    }
  };

  const DeletePdf = async (uid: string) => {
    // PDF generation logic here
    try {
      const res = await fetch(baseURL + "/we/attachments/" + uid, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // Add other headers if necessary
        },
      })
      const result = await res.json();
      console.log(result, 2211);

    } catch (error) {
      console.log(error);

    }
  }
  const DownloadPdf = (fileUrl: string, uid: string) => {
    const pdfUrl = fileUrl;

    const fileName = pdfUrl.split("/").pop() || `report_${Date.now()}.pdf`;
    //downlad pdf api
    fetch(pdfUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl); // cleanup
        DeletePdf(uid)
      })
      .catch((err) => console.error("Download failed", err));
  }

  const generatrePdf = async () => {
    // PDF generation logic here
    try {
      console.log(token);

      setissGenerating(true)
      const res = await fetch(baseURL + "/we/attendances?is_pdf=true", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // Add other headers if necessary
        },
      })
      const result = await res.json();
      setissGenerating(false)
      console.log(result, 2211);
      await DownloadPdf(result.url, result.file_uid)

    } catch (error) {
      console.log(error);
      setissGenerating(false)
    }
  }



  // const handlePageChange = async (url: string | null) => {
  //   if (!url) return;

  //   try {
  //     const response = await fetch(url);
  //     const json = await response.json();

  //     setAttendanceData(json.results || []);
  //     setNextUrl(json.next);
  //     setPrevUrl(json.previous);
  //   } catch (err) {
  //     console.error("Pagination fetch failed:", err);
  //   }
  // };



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

  return (
    <div>
      <ReportFilter
        defaultRange="this_month"
        params={{
          created_at_after: moment().startOf("week").format("YYYY-MM-DD"),
          created_at_before: moment().endOf("week").format("YYYY-MM-DD"),
        }}
        setParams={handleFilterChange}
        onFilterChange={() => {
          console.log("filter changed");
        }}
      />
      <div className="mb-4 flex items-center justify-end">
        <button
          // onClick={printReport}
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
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
            <p className="text-sm text-gray-600 mt-1">Mossaddak ORG -1.0</p>
            <p className="text-sm text-gray-600">All Dates</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">SL NO.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">EMP ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">NAME</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">DESIGNATION</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">SHIFT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">IN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">OUT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">LATE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">W. HR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">OT HR</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {
                  attendanceData &&
                  attendanceData.map((item: any, index: number) => (
                    <tr key={item.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.employee?.employee_id || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {[
                          item.employee?.first_name,
                          item.employee?.middle_name,
                          item.employee?.last_name,
                        ]
                          .filter(Boolean) // removes nulls
                          .join(" ")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.employee?.designation?.title || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.shift?.title || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600 uppercase">
                        {item.status}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.shift?.in_time || item.check_in || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.shift?.out_time || item.check_out || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.late_hour_count ?? "0"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.worked_hour_count?.parsedValue ?? 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.ot_hour_count?.parsedValue ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                        {/* Example: total hours */}
                        {(
                          (item.worked_hour_count?.parsedValue || 0) +
                          (item.ot_hour_count?.parsedValue || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>

            </table>
            <div className="flex justify-between mt-6 mx-4 mb-4">
              <button
                disabled={!prevUrl}
                onClick={() => handlePageChange(prevUrl)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${prevUrl ? "bg-gray-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Previous
              </button>

              <button
                disabled={!nextUrl}
                onClick={() => handlePageChange(nextUrl)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${nextUrl ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
