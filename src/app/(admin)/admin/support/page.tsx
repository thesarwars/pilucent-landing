"use client";
import { useFetch } from "@/app/helpers/hooks";
import Table from "../../_components/Table";
import SupportOverview from "./_components/SupportOverview";
import { fetchSupportTickets } from "@/app/helpers/backend";
import moment from "moment";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data, isPending, setQueryParams, refetch } = useFetch(
    ["/support/tickets/"],
    fetchSupportTickets,
  );
  const router = useRouter();

  const columns = [
    {
      text: "TICKET NUMBER",
      dataField: "ticket_noumber", // Note: matches the JSON property name (potential typo)
      formatter: (cell: any, row: any) => (
        <p
          className="cursor-pointer text-accent_soft_blue hover:underline"
          onClick={() => router.push(`/admin/support/${row?.uid}`)}
        >
          {cell}
        </p>
      ),
    },
    {
      text: "ISSUER",
      dataField: "user.name",
      formatter: (cell: any, row: any) =>
        row?.user?.is_agent != "True"
          ? row?.user?.name
          : row?.target?.name || "NO AGENT",
    },
    {
      text: "ISSUE DATE",
      dataField: "user.name",
      formatter: (cell: any, row: any) =>
        moment(row?.created_at).format("DD-MM-YYYY"),
    },
    {
      text: "Type",
      dataField: "kind",
      formatter: (cell: any, row: any) => cell.split("_").join(" "),
    },
    {
      text: "SUBJECT",
      dataField: "title",
    },
    {
      text: "Agent",
      dataField: "target.name",
      formatter: (cell: any, row: any) =>
        row?.user?.is_agent == "True"
          ? row?.user?.name
          : row?.target?.name || "NO AGENT",
    },
    {
      text: "Status",
      dataField: "status",
      formatter: (cell: any, row: any) => (
        <div className="flex items-center justify-center">
          {cell == "ON_GOING" ? (
            <p className="rounded-lg border bg-orange-100 px-4 py-2 text-sm text-orange-600">
              ON GOING
            </p>
          ) : cell == "COMPLETED" ? (
            <p className="rounded-lg border bg-green-100 px-4 py-2 text-sm text-green-600">
              COMPLETED
            </p>
          ) : cell == "PENDING" ? (
            <p className="rounded-lg border bg-red-100 px-4 py-2 text-sm text-red-600">
              PENDING
            </p>
          ) : cell == "OPEN" ? (
            <p className="rounded-lg border bg-green-100 px-4 py-2 text-sm text-green-600">
              OPEN
            </p>
          ) : (
            <p className="rounded-lg border bg-gray-100 px-4 py-2 text-sm text-gray-600">
              CLOSED
            </p>
          )}
        </div>
      ),
    },
    {
      text: "Seen",
      dataField: "is_seen",
      formatter: (cell: any, row: any) => (row?.is_seen ? "Yes" : "No"),
    },
  ];

  return (
    <div className="font-lexend">
      <h1 className="pb-4 text-2xl font-semibold">Support & Tickets</h1>
      <SupportOverview />
      <Table
        loading={isPending}
        columns={columns}
        refetch={refetch}
        setParams={setQueryParams}
        data={data}
        title="List of Ticket"
      />
    </div>
  );
};

export default Page;
