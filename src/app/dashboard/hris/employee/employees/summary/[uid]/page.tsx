"use client";
import React, { useEffect, useState, use } from "react";
import JobCardReport from "../_components/JobCardReport";
import Table from "@/app/(admin)/_components/Table";
import { useFetch } from "@/app/helpers/hooks";
import { fetchAttendances } from "@/app/helpers/backend";

const columns = [
  {
    text: "Date",
    dataField: "date",
  },
  {
    text: "Check in",
    dataField: "check_in",
  },
  {
    text: "Check Out",
    dataField: "check_out",
  },
  {
    text: "Late",
    dataField: "late_hour_count",
  },
  {
    text: "Worked",
    dataField: "worked_hour_count",
  },
  {
    text: "Overtime",
    dataField: "overtime",
    formatter: (cell: any, row: any) => {
      if (row?.status == "ABSENT") {
        return "N/A";
      }
      if (row?.shift?.regular_hour) {
        const difference = (
          Number(row?.worked_hour_count) - Number(row?.shift?.regular_hour)
        ).toFixed(2);
        return (
          <p
            className={`font-normal ${Number(difference || 0) < 0 ? "text-black" : "text-green-500"}`}
          >
            {Number(difference) > 0 ? `+${difference}` : 0} hours
          </p>
        );
      } else {
        return "Shift not found";
      }
    },
  },
  {
    text: "Difference",
    dataField: "difference",
    formatter: (cell: any, row: any) => {
      if (row?.status == "ABSENT") {
        return "N/A";
      }
      if (row?.shift?.regular_hour) {
        const difference = (
          Number(row?.worked_hour_count) - Number(row?.shift?.regular_hour)
        ).toFixed(2);
        return (
          <p
            className={`font-normal ${Number(difference || 0) < 0 ? "text-red-500" : "text-green-500"}`}
          >
            {difference} hours
          </p>
        );
      } else {
        return "Shift not found";
      }
    },
  },
  {
    text: "Status",
    dataField: "status",
    formatter: (cell: any, row: any) => (
      <p
        className={`inline-block rounded border px-4 py-1 text-xs ${row?.status == "PRESENT" ? "border-green-600 bg-green-50 text-green-600" : row?.status == "ABSENT" ? "border-red-600 bg-red-50 text-red-600" : ""}`}
      >
        {cell?.split("_")?.join(" ")}
      </p>
    ),
  },
  {
    text: "Remark",
    dataField: "remark",
  },
];

const Page = (props: { params: Promise<{ uid: string }> }) => {
  const params = use(props.params);
  const [currentMonth, setCurrentMonth] = useState({
    start_date: "",
    end_date: "",
    month: "",
  });

  const {
    data,
    isPending,
    refetch,
    params: queryParams,
    setQueryParams,
  } = useFetch(
    ["job-card-table", currentMonth?.start_date, currentMonth?.end_date],
    () => fetchAttendances({ employee__uid: params.uid, ...currentMonth }),
    { enabled: !!currentMonth?.start_date && !!currentMonth?.end_date && !!params?.uid },
  );

  return (
    <div className="mb-7 space-y-7 text-sm">
      <JobCardReport
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        uid={params?.uid}
      />
      <Table
        loading={isPending}
        refetch={refetch}
        setParams={setQueryParams}
        params={queryParams}
        data={data}
        columns={columns}
        isScreen={false}
      />
    </div>
  );
};

export default Page;
