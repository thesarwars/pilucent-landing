import { patchSupport } from "@/app/helpers/backend";
import Image from "next/image";
import { useEffect } from "react";
import Swal from "sweetalert2";

const statusArray = [
  { value: "CLOSED", label: "Closed" },
  { value: "OPEN", label: "Open" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_GOING", label: "On Going" },
  { value: "PENDING", label: "Pending" },
];

const imageBaseURL = "https://balanzifyapi.jumatechs.xyz";

const SupportSidebar = ({
  ticketData,
  isCustomer = false,
  refetch,
}: {
  ticketData: any;
  isCustomer?: boolean;
  refetch?: any;
}) => {
  const handleStatusChange = (status: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, Change`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await patchSupport(ticketData?.uid, {
            status: status,
          });
          if (response.success) {
            refetch && refetch();
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
        // refetch && refetch();
        Swal.fire({
          title: "Success!",
          text: "Support status has been changed.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };


  return (
    <>
      <div className="mb-4 flex flex-col items-center rounded-lg border p-4">
        <div className="w-full">
          <div className="h-[150px] w-full rounded-lg">
            <Image
              src="/images/rainbow-back.png"
              alt="back"
              width={387}
              height={580}
              className="h-full w-full object-cover"
            />
          </div>
          {ticketData?.user?.image ? (
            <div className="mx-auto -mt-14 h-24 w-24 overflow-hidden rounded-full">
              <Image
                src={imageBaseURL + ticketData?.user?.image}
                alt={ticketData?.user?.name}
                width={400}
                height={400}
                className="h-full w-full -space-y-8 object-cover"
              />
            </div>
          ) : (
            <div className="z-10 mx-auto -mt-14 h-24 w-24 overflow-hidden rounded-full border-2 border-accent_soft_blue bg-accent_soft_blue">
              <Image
                src="https://balanzifyapi.jumatechs.xyz/media/media/IMAGE/istockphoto-1290743328-612x612.jpg"
                alt={ticketData?.user?.name}
                width={400}
                height={400}
                className="h-full w-full -space-y-8 object-cover"
              />
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold"> {ticketData?.user?.name}</h3>
          <p className="text-sm text-gray-500">
            {ticketData?.user?.is_agent == "True" ? "Agent" : "Customer"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-8">
          <div className="w-full">
            <div className="h-[150px] w-full rounded-lg">
              <Image
                src="/images/rainbow-back.png"
                alt="back"
                width={387}
                height={580}
                className="h-full w-full object-cover"
              />
            </div>
            {ticketData?.target?.image ? (
              <div className="mx-auto -mt-14 h-24 w-24 overflow-hidden rounded-full">
                <Image
                  src={imageBaseURL + ticketData?.target?.image}
                  alt={ticketData?.target?.name}
                  width={400}
                  height={400}
                  className="h-full w-full -space-y-8 object-cover"
                />
              </div>
            ) : (
              <div className="z-10 mx-auto -mt-14 h-24 w-24 overflow-hidden rounded-full border-2 border-accent_soft_blue bg-accent_soft_blue">
                <Image
                  src="https://balanzifyapi.jumatechs.xyz/media/media/IMAGE/istockphoto-1290743328-612x612.jpg"
                  alt={ticketData?.target?.name}
                  width={400}
                  height={400}
                  className="h-full w-full -space-y-8 object-cover"
                />
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold">
              {" "}
              {ticketData?.target?.name}
            </h3>
            <p className="text-sm text-gray-500">
              {ticketData?.target?.is_agent == "True" ? "Agent" : "Customer"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4 rounded-lg border p-4 py-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Support Type
          </label>
          <input
            value={ticketData?.title}
            type="text"
            placeholder="Example Support type name"
            readOnly
            className="w-full rounded-md border border-gray-300 p-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          {isCustomer ? (
            <div className="flex items-center">
              {ticketData?.status == "ON_GOING" ? (
                <p className="rounded-lg border bg-orange-100 px-4 py-2 text-sm text-orange-600">
                  ON GOING
                </p>
              ) : ticketData?.status == "COMPLETED" ? (
                <p className="rounded-lg border bg-green-100 px-4 py-2 text-sm text-green-600">
                  COMPLETED
                </p>
              ) : ticketData?.status == "PENDING" ? (
                <p className="rounded-lg border bg-red-100 px-4 py-2 text-sm text-red-600">
                  PENDING
                </p>
              ) : ticketData?.status == "OPEN" ? (
                <p className="rounded-lg border bg-green-100 px-4 py-2 text-sm text-green-600">
                  OPEN
                </p>
              ) : (
                <p className="rounded-lg border bg-gray-100 px-4 py-2 text-sm text-gray-600">
                  CLOSED
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              <select
                value={ticketData?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white p-3 text-sm outline-none"
              >
                {statusArray.map((status, index) => (
                  <option key={index} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SupportSidebar;
