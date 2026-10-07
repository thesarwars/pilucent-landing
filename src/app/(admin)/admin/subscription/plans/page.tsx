"use client";
import Button from "@/components/ui/RawButton";
import { useState } from "react";
import Label from "@/components/ui/RawLabel";
import { useFetch } from "@/app/helpers/hooks";
import { DeleteSubscription, fetchSubscriptions } from "@/app/helpers/backend";
import Swal from "sweetalert2";
import Table from "@/app/(admin)/_components/Table";
import Subscription from "../../subscriptions/_components/Subscription";
import Modal from "@/app/(admin)/_components/Modal";

const Columns = [
  {
    text: "Title",
    dataField: "title",
  },
  {
    text: "Status",
    dataField: "status",
  },
  {
    text: "Currency",
    dataField: "currency",
  },
  {
    text: "User Limit",
    dataField: "user_limit",
  },
  {
    text: "Storage Limit",
    dataField: "storage_limit",
  },
  {
    text: "Trial Period (Days)",
    dataField: "trial_period",
  },
  {
    text: "Auto Renew",
    dataField: "is_auto_renew",
    formatter: (cell: boolean) => (cell ? "Yes" : "No"),
  },
  {
    text: "Plan Type",
    dataField: "kind",
    formatter: (cell: string) => (cell?.split("_")[0]),
  },
  {
    text: "Cancel Policy",
    dataField: "cancel_policy",
  },
];

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data, setQueryParams, isPending, refetch } = useFetch(
    ["subscriptionData"],
    fetchSubscriptions,
  );
  const [uid, setUid] = useState<string | null>(null);

  const handleEdit = (uid: string) => {
    setUid(uid);
    setIsOpen(true);
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
          const response = await DeleteSubscription(uid);
          if (response.success) {
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
          title: "Deleted!",
          text: "Subscription has been Deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };


  return (
    <div>
      <Table
        onDelete={(row)=>handleDelete(row?.uid)}
        onEdit={(row) => handleEdit(row?.uid)}
        data={data}
        setParams={setQueryParams}
        loading={isPending}
        columns={Columns}
        title="List of Subscription"
      >
        <Button
          className="bg-accent_dark_blue text-white"
          onClick={() => {
            setUid(null);
            setIsOpen(true);
          }}
        >
          New Plan
        </Button>
      </Table>
      <Subscription uid={uid} refetch={refetch} isOpen={isOpen} setIsOpen={setIsOpen} />
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter"
        widthClass="w-[550px]"
      >
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="">
            <Label className="block text-[#5A607F]">Billing Frequency </Label>
            <select
              // value={customerData.country}
              // onChange={(e) =>
              //   setCustomerData((prev) => ({
              //     ...prev,
              //     country: e.target.value,
              //   }))
              // }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-sm outline-none"
              required
            >
              <option value="" defaultChecked>
                Monthly
              </option>
            </select>
          </div>
          <div className="">
            <Label className="block text-[#5A607F]">Currency</Label>
            <select
              // value={customerData.country}
              // onChange={(e) =>
              //   setCustomerData((prev) => ({
              //     ...prev,
              //     country: e.target.value,
              //   }))
              // }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-sm outline-none"
              required
            >
              <option value="" defaultChecked>
                USD
              </option>
            </select>
          </div>
          <div className="">
            <Label className="block text-[#5A607F]">Trial Period </Label>
            <select
              // value={customerData.country}
              // onChange={(e) =>
              //   setCustomerData((prev) => ({
              //     ...prev,
              //     country: e.target.value,
              //   }))
              // }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-sm outline-none"
              required
            >
              <option value="" defaultChecked>
                7
              </option>
            </select>
          </div>
          <div className="">
            <Label className="block text-[#5A607F]">Cancellation Policy</Label>
            <select
              // value={customerData.country}
              // onChange={(e) =>
              //   setCustomerData((prev) => ({
              //     ...prev,
              //     country: e.target.value,
              //   }))
              // }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-sm outline-none"
              required
            >
              <option value="" defaultChecked>
                Anytime
              </option>
            </select>
          </div>
          <div className="">
            <Label className="block text-[#5A607F]">Publish Status</Label>
            <select
              // value={customerData.country}
              // onChange={(e) =>
              //   setCustomerData((prev) => ({
              //     ...prev,
              //     country: e.target.value,
              //   }))
              // }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-sm outline-none"
              required
            >
              <option value="" defaultChecked>
                Active
              </option>
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
                setIsOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Page;
