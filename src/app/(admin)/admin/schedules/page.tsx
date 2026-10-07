"use client";
import { useEffect, useRef, useState } from "react";
import Table from "../../_components/Table";
import { IoMdMore } from "react-icons/io";
import { useFetch } from "@/app/helpers/hooks";
import { fetchSchedules, patchSchedule } from "@/app/helpers/backend";
import DemoRequestForm from "./_components/DemoRequestForm";
import Swal from "sweetalert2";

const columns = [
  {
    text: "Name",
    dataField: "full_name",
  },
  {
    text: "Phone",
    dataField: "phone_number",
  },
  {
    text: "Email",
    dataField: "email",
  },
  {
    text: "Work Email",
    dataField: "work_email",
  },
  {
    text: "Company Name",
    dataField: "company_name",
  },
  {
    text: "Agent Count",
    dataField: "agent_count",
  },
  {
    text: "Preferred Version",
    dataField: "preferred_version",
  },
  {
    text: "Preferred Date",
    dataField: "preferred_date",
  },
  {
    text: "Preferred Time",
    dataField: "preferred_time",
  },
  {
    text: "Comment",
    dataField: "comment",
  },
  {
    text: "Status",
    dataField: "status",
    formatter: (cell: any, row: any) =>
      cell == "REQUESTED" ? (
        <span className="rounded-sm bg-orange-100 p-1 px-2 text-orange-500 shadow-sm">
          REQUESTED
        </span>
      ) : cell == "SCHEDULED" ? (
        <span className="rounded-sm bg-blue-100 p-1 px-2 text-blue-500 shadow-sm">
          SCHEDULED
        </span>
      ) : cell == "COMPLETED" ? (
        <span className="rounded-sm bg-green-100 p-1 px-2 text-green-500 shadow-sm">
          COMPLETED
        </span>
      ) : (
        <span className="rounded-sm bg-gray-200 p-1 px-2 text-gray-500 shadow-sm">
          ARCHIVED
        </span>
      ),
  },
];

const Page = () => {
  const [selectedKind, setSelectedKind] = useState("SCHEDULE");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [UID, setUID] = useState("");

  const { data, setQueryParams, isPending, refetch } = useFetch(
    ["/api/v1/schedules"],
    fetchSchedules,
    { request_type: "LIVE_DEMO" },
  );

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest(".action-child-trigger")
      ) {
        setSelectedRowId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMark = async (uid: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, Mark as Completed`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await patchSchedule(uid, {
            status: "COMPLETED",
            is_mail_sent: false,
          });
          if (response.success) {
            setSelectedRowId(null);
            refetch();
            return response;
          }
          throw new Error("Failed");
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Success!",
          text: "Schedule has been completed",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Define the ActionChild component
  const ActionChild = (row: any) => {
    return (
      <div>
        <div
          className="action-child-trigger flex cursor-pointer items-center justify-center"
          onClick={() =>
            setSelectedRowId((prev) => (prev === row.uid ? null : row.uid))
          }
        >
          <IoMdMore className="cursor-pointer rounded-full p-2 text-4xl hover:bg-white" />
        </div>

        {/* Popup Menu */}
        {selectedRowId === row.uid && (
          <div
            ref={popupRef}
            className="absolute right-5 z-[999] mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div className="py-1">
              {row?.status == "REQUESTED" && (
                <button
                  onClick={() => {
                    setUID(row.uid);
                    // console.log("Edit", row);
                    // setSelectedRowId(null);
                    setIsOpen(true);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Send Demo Request
                </button>
              )}
              {row?.status == "SCHEDULED" && (
                <button
                  onClick={() => {
                    handleMark(row?.uid);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                >
                  Mark as completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="font-lexend">
      {/* <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p
            onClick={() => setSelectedKind("SCHEDULE")}
            className={`${selectedKind == "SCHEDULE" ? "border-b-[1px] border-accent_soft_blue font-medium text-accent_soft_blue" : "text-[#7E84A3]"} cursor-pointer text-lg hover:text-accent_soft_blue`}
          >
            Schedule
          </p>
          <span className="rounded-3xl bg-[#1682DF] px-2 py-1 text-white">
            (10)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setSelectedKind("REQUEST")}
            className={`${selectedKind == "REQUEST" ? "border-b-[1px] border-accent_soft_blue font-medium text-accent_soft_blue" : "text-[#7E84A3]"} cursor-pointer text-lg hover:text-accent_soft_blue`}
          >
            Request
          </p>
          <span className="rounded-3xl bg-[#B44BDDBD] px-2 py-1 text-white">
            (10)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p
            onClick={() => setSelectedKind("ARCHIVED")}
            className={`${selectedKind == "ARCHIVED" ? "border-b-[1px] border-accent_soft_blue font-medium text-accent_soft_blue" : "text-[#7E84A3]"} cursor-pointer text-lg hover:text-accent_soft_blue`}
          >
            Archived{" "}
          </p>
          <span className="rounded-3xl bg-[#EF787A] px-3 py-1 text-white">
            (10)
          </span>
        </div>
      </div> */}

      <Table
        isSearch={false}
        ActionFormatter={(e: any) => ActionChild(e)}
        title="List of Live demo"
        columns={columns}
        data={data}
        loading={isPending}
        refetch={refetch}
        setParams={setQueryParams}
      />

      <DemoRequestForm
        refetch={refetch}
        setSelectedRowId={setSelectedRowId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        uid={UID}
      />
    </div>
  );
};

export default Page;
