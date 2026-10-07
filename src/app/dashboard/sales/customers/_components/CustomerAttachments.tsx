import Link from "next/link";
import { GoArrowUpRight } from "react-icons/go";
import { RxCross1 } from "react-icons/rx";

const CustomerAttachments = ({
  modalOpen,
  setModalOpen,
  isLoading,
  Attachments,
}: {
  modalOpen: boolean;
  setModalOpen: any;
  isLoading: boolean;
  Attachments: any[];
}) => {
  return (
    <>
      <div
        className={`${
          modalOpen ? "scale-[1] opacity-100" : "scale-[0] opacity-0"
        } fixed left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-[#0000002a] transition-all duration-300`}
      >
        <div className="min-h-[60vh] w-[90%] rounded-lg bg-[#ffffff] p-4 lg:w-[40%]">
          <div className="mb-4 flex w-full items-end justify-between">
            <h1 className="text-2xl font-medium">Attachment List</h1>
            <RxCross1
              className="cursor-pointer rounded-full p-2 text-[2.5rem] transition-all duration-300 hover:bg-[#e7e7e7]"
              onClick={() => setModalOpen(false)}
            />
          </div>
          <div className="mb-4 flex items-center justify-center gap-2 text-lg font-medium">
            <p>Total Attachments</p> :{" "}
            {isLoading ? (
              <p className="h-6 w-5 animate-pulse bg-gray-300"></p>
            ) : (
              Attachments?.length
            )}
          </div>
          <div>
            {isLoading
              ? [0, 1, 2].map((value) => (
                  <div
                    key={value}
                    className="my-2 flex items-center justify-between rounded-xl bg-gray-50 p-4"
                  >
                    <div>
                      <p className="mb-2 h-6 w-40 animate-pulse bg-gray-300"></p>
                      <p className="mb h-6 w-40 animate-pulse bg-gray-300"></p>
                    </div>

                    <div className="h-8 w-[76px] animate-pulse rounded-lg bg-accent_soft_blue px-2 py-1"></div>
                  </div>
                ))
              : Attachments?.map((attachment, idx) => (
                  <div
                    key={attachment?.uid}
                    className="my-2 flex items-center justify-between rounded-xl bg-gray-50 p-4"
                  >
                    <div>
                      <p className="mb-1">
                        <span className="font-semibold text-accent_dark_blue">
                          Title:
                        </span>
                        {attachment.title
                          ? attachment.title
                          : `  Attachment - ${idx + 1}`}
                      </p>
                      <p>
                        {" "}
                        <span className="font-semibold text-accent_dark_blue">
                          Status:
                        </span>{" "}
                        <span className="rounded-xl bg-green-100 px-2 py-1 text-sm text-green-600">
                          {attachment.status}
                        </span>
                      </p>
                    </div>

                    <Link
                      href={attachment.file}
                      target="_blank"
                      className="flex items-center gap-1 rounded-lg bg-accent_soft_blue px-2 py-1 text-white hover:underline"
                    >
                      View <GoArrowUpRight className="font-medium" />{" "}
                    </Link>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAttachments;
