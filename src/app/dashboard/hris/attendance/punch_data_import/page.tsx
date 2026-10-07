"use client";

import { useState } from "react";
import UploadFile from "./components/UploadFile";
import DataHistoryTable from "./components/DataHistoryTable";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";

const Page = () => {
  const [files, setFiles] = useState<any[]>();

  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: "HRIS", href: "#" },
          {
            label: "Punch Data Import",
            href: "/dashboard/hris/attendance/punch_data_import",
          },
        ]}
        className="mb-5 mt-0"
      />
      <UploadFile setFiles={setFiles} />
      <DataHistoryTable />
    </div>
  );
};

export default Page;
