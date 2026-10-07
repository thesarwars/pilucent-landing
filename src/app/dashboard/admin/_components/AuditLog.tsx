"use client";

import React from "react";
import moment from "moment";
import { History, ScrollText } from "lucide-react";
import { useFetch } from "@/app/helpers/hooks";
import { fetchAuditLogs } from "@/app/helpers/backend";
import {
  Avatar,
  Breadcrumb,
  Chip,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from "@/components/violet";

/* ── action → chip tone (UI only; API values unchanged) ──────────────────── */
const actionTone = (a?: string): VioletTone => {
  const v = `${a || ""}`.toLowerCase();
  if (v.includes("create") || v.includes("add")) return "success";
  if (v.includes("delete") || v.includes("remove")) return "danger";
  if (v.includes("update") || v.includes("edit") || v.includes("change"))
    return "warn";
  return "violet";
};

const AuditLog = () => {
  const { data, isPending, setQueryParams } = useFetch(
    ["audit_logs"],
    fetchAuditLogs,
  );

  const columns: VListColumn[] = [
    {
      key: "timestamp",
      label: "Date changed",
      w: "minmax(0,1.2fr)",
      locked: true,
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-bold tabular-nums text-v-ink900">
            {row?.timestamp
              ? moment(row.timestamp).format("DD MMM, YYYY")
              : "—"}
          </div>
          <div className="truncate text-[11px] tabular-nums text-v-ink400">
            {row?.timestamp ? moment(row.timestamp).format("hh:mm:ss A") : ""}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      w: "minmax(0,1.1fr)",
      render: (row) => {
        const name = row?.created_by?.name || "—";
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={name} size={32} />
            <span className="truncate text-[12.5px] font-semibold text-v-ink900">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      key: "action",
      label: "Event",
      w: "150px",
      render: (row) =>
        row?.action ? (
          <Chip tone={actionTone(row.action)}>{row.action}</Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
    {
      key: "content_name",
      label: "Content",
      w: "minmax(0,1.3fr)",
      render: (row) => (
        <span className="line-clamp-1 text-[12.5px] text-v-ink700">
          {row?.content_name || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin", href: "#" },
          { label: "Audit Log" },
        ]}
      />

      <VioletListTable
        icon={<ScrollText />}
        title="Audit Log List"
        subtitle={(shown, total) =>
          `${shown} of ${total} ${total === 1 ? "event" : "events"}`
        }
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search audit log"
        emptyIcon={<History className="h-[19px] w-[19px]" />}
        emptyTitle="No audit records"
        emptySub="Activity will appear here as changes are made."
      />
    </div>
  );
};

export default AuditLog;
