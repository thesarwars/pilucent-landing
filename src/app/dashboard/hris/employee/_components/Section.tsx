"use client";
import React, { useState } from "react";
import Button from "@/components/ui/RawButton";
import ModalSM, { CloseModal } from "@/components/ModalSM/ModalSM";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import { toast, ToastContainer } from "react-toastify";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import Table from "@/app/(admin)/_components/Table";
import { fetchSections, createSection, patchSection, deleteSection, fetchDepartments } from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { useMutation } from "@tanstack/react-query";
import Modal from "@/app/(admin)/_components/Modal";

const Section = () => {
  const [title, setTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>(null);
  const [editUid, setEditUid] = useState<string | null>(null);
  const [selectedDepartmentUid, setSelectedDepartmentUid] = useState<string>("");

  // Fetch sections
  const { data, isPending, refetch, setQueryParams, params } = useFetch(
    ["sections"],
    fetchSections
  );

  // Fetch departments for select input
  const { data: departmentsData, isPending: isDeptLoading } = useFetch(
    ["departments"],
    fetchDepartments
  );

  // Table columns
  const columns = [
    { text: "Section Name", dataField: "title" },
    { text: "Department Code", dataField: "department.code" },
    { text: "Department Name", dataField: "department.title" },
  ];

  // Create mutation
  const {
    mutate: createSectionMutate,
    isPending: isCreating,
  } = useMutation({
    mutationFn: async (data: any) => {
      return await createSection(data);
    },
    onSuccess: () => {
      toast.success("Section created successfully");
      setIsModalOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to create section");
    },
  });

  // Update mutation
  const {
    mutate: updateSectionMutate,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: async ({ uid, data }: { uid: string; data: any }) => {
      return await patchSection(uid, data);
    },
    onSuccess: () => {
      toast.success("Section updated successfully");
      setIsModalOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to update section");
    },
  });

  // Action buttons for each row
  const ActionFormatter = ({ row }: { row: any }) => (
    <div className="flex gap-2 justify-center">
      <Button
        type="button"
        className="rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50"
        onClick={() => handleEditSection(row)}
      >
        <BiEdit className="text-lg" />
      </Button>
      <Button
        type="button"
        className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
        onClick={() => handleDeleteSection(row)}
      >
        <RiDeleteBin6Line className="text-lg" />
      </Button>
    </div>
  );

  // Edit handler
  const handleEditSection = (row: any) => {
    setTitle("Edit Section");
    setEditData(row);
    setEditUid(row.uid);
    setSelectedDepartmentUid(row.department?.uid || "");
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDeleteSection = async (row: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#00035F",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteSection(row.uid);
          if (response.success || response.status === 204) {
            toast.success("Section deleted successfully");
            refetch();
          } else {
            toast.error("Failed to delete section");
          }
        } catch (error) {
          toast.error("Failed to delete section");
        }
      }
    });
  };

  // Modal open for create
  const handleOpenModalForCreate = () => {
    setTitle("Create Section");
    setEditData(null);
    setEditUid(null);
    setSelectedDepartmentUid("");
    setIsModalOpen(true);
  };

  // Modal form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const input = {
      title: formData.get("title"),
      department_uid: selectedDepartmentUid,
    };
    if (editUid) {
      updateSectionMutate({ uid: editUid, data: input });
    } else {
      createSectionMutate(input);
      // empty the form after creation
      form.reset();
      setSelectedDepartmentUid("");
    }
  };

  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: "HRIS", href: "#" },
          { label: "Section", href: "/dashboard/hris/employee/section" },
        ]}
        className="mb-5 mt-0"
      />
      <ToastContainer />
      <Table
        loading={isPending}
        params={params}
        columns={columns}
        data={data}
        setParams={setQueryParams}
        refetch={refetch}
        ActionFormatter={(row: any) => <ActionFormatter row={row} />}
      >
        <Button
          onClick={handleOpenModalForCreate}
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white hover:bg-gray-900"
        >
          <span className="text-sm font-medium">Create Section</span>
        </Button>
      </Table>
      <Modal
        title={title}
        edit={!!editUid}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <Label className="block text-[#5A607F]">Section Name</Label>
            <Input
              defaultValue={editData?.title || ""}
              placeholder=""
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              name="title"
              required
            />
          </div>
          <div>
            <Label className="block text-[#5A607F]">Department</Label>
            <select
              name="department_uid"
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-2"
              required
              value={selectedDepartmentUid}
              onChange={e => setSelectedDepartmentUid(e.target.value)}
            >
              <option value="" disabled>
                {isDeptLoading ? "Loading..." : "Select a Department"}
              </option>
              {departmentsData?.results?.map((dept: any) => (
                <option key={dept.uid} value={dept.uid}>
                  {dept.title} ({dept.code})
                </option>
              ))}
            </select>
          </div>
          <div className="mx-auto flex max-w-[325px] items-center justify-center gap-x-3">
            <a
              onClick={CloseModal}
              className="cursor-pointer rounded-lg border h-[48px] border-[#6A6EF6] flex justify-center items-center w-[142px] text-center font-semibold text-[#6A6EF6]"
            >
              Cancel
            </a>
            <Button
              className="bg-black text-white w-[142px]"
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Section;