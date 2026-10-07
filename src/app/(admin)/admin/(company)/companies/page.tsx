"use client";
import Button from "@/components/ui/RawButton";
import CompanyOverview from "./_components/CompanyOverview";
import Table from "@/app/(admin)/_components/Table";
import { useRef, useState } from "react";
import Modal from "@/app/(admin)/_components/Modal";
import Label from "@/components/ui/RawLabel";
import Company from "./_components/Company";
import { useFetch } from "@/app/helpers/hooks";
import {
  deleteCompany,
  fetchCompanies,
  patchCompany,
} from "@/app/helpers/backend";
import Image from "next/image";
import { IoMdMore } from "react-icons/io";
import Swal from "sweetalert2";

const columns = [
  {
    text: "Company",
    dataField: "name",
    formatter: (cell: any, row: any) =>
      row?.logo ? (
        <div className="flex items-center gap-2">
          <Image
            src={row?.logo}
            alt="logo"
            width={100}
            height={100}
            className="size-10 rounded-full border-2 border-accent_soft_blue object-cover"
          />
          <div className="flex flex-col text-left text-sm">
            <p>{row?.name}</p>
            <p className="text-[10px]">{row?.slug}</p>
          </div>
        </div>
      ) : (
        cell
      ),
  },
  {
    text: "Legal Name",
    dataField: "legal_name",
  },
  {
    text: "Status",
    dataField: "status",
  },
  {
    text: "Company Type",
    dataField: "kind",
  },
  {
    text: "Email",
    dataField: "email",
  },
  {
    text: "Phone",
    dataField: "phone",
  },
];

const Page = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>();
  const popupRef = useRef<HTMLDivElement>(null);
  const { data, isPending, setQueryParams, refetch } = useFetch(
    ["company_list"],
    fetchCompanies,
  );
  const [uid, setUid] = useState<string | null>(null);

  const handleDeactivate = async (uid: string, status: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${status == "ACTIVE" ? "Activate" : "Deactivate"}`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await patchCompany(uid, { status: status });
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
          text: "Company has been Deactivated.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDelete = async (uid: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, Delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteCompany(uid, { status: status });
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
          text: "Company has been Deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const Action = (row: any) => {
    return (
      <div className="relative">
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
              <button
                onClick={() => {
                  setUid(row?.uid);
                  setIsOpen(true);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                View/Edit
              </button>
              <button
                onClick={() =>
                  handleDeactivate(
                    row?.uid,
                    row?.status == "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  )
                }
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {row?.status == "ACTIVE" ? "Deactivate" : "Make Active"}
              </button>
              <button
                onClick={() => {
                  handleDelete(row?.uid);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-inter">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-semibold">Company Overview</h1>
        <Button
          className="bg-accent_dark_blue text-white"
          onClick={() => {
            setIsOpen(true);
            setUid(null);
          }}
        >
          Add Company
        </Button>
      </div>
      <CompanyOverview />

      <Table
        isIconsShow={false}
        columns={columns}
        setParams={setQueryParams}
        refetch={refetch}
        loading={isPending}
        title="List Of Companies"
        data={{ results: data?.data, count: 0, next: null, previous: null }}
        pagination={false}
        ActionFormatter={(row: any) => Action(row)}
        // onFilter={() => setIsFilterOpen(true)}
      />

      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter"
        widthClass="w-11/12 md:w-[550px]"
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-3 flex flex-col gap-4"
        >
          <div>
            {" "}
            <Label className="block font-medium text-accent_text_gray">
              Status
            </Label>
            <select
              // value={filterData.status}
              // onChange={(e) =>
              //   setFilterData({
              //     ...filterData,
              //     status: e.target.value,
              //   })
              // }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>

          <div className="mx-auto mt-14 flex max-w-[325px] items-center justify-center gap-10">
            <Button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="w-[142px] cursor-pointer rounded-lg border border-[#6A6EF6] py-3 text-center font-semibold text-[#6A6EF6]"
            >
              Cancel
            </Button>
            <Button
              className="w-[142px] bg-[#00035F] text-white"
              type="submit"
              isLoading={false}
              onClick={() => {
                setIsFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </form>
      </Modal>
      <Company
        refetch={refetch}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        uid={uid}
      />
    </div>
  );
};

export default Page;
