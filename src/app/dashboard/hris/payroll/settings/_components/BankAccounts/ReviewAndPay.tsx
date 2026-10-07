import React, { useState } from "react";
import PopupModal from "../../../payment/_components/PopupModal";
import RootPopup from "./PopupModal";
import BankAccountForm from "./bank-account-form";
import { useFetch } from "@/app/helpers/hooks";
import { delBankAccount, fetchLinkedBankAccount } from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import DotSpinner from "@/app/dashboard/hris/employee/employees/_components/dot-spinner";
import VerifyBankAccount from "./VerifyBankAccount";
import { toast } from "@/lib/ToastService";
import { collectErrorMessages } from "@/utils/flattenErrors";

const ReviewAndPay = ({ handleNext }: { handleNext: any }) => {
  const { isPending, data, error, isError, refetch } = useFetch(
    ["source-bank-account"],
    fetchLinkedBankAccount,
    {},
    { retry: 1 },
  );
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const handleDeleteBank = async () => {
    try {
      setIsDeleting(true);
      console.log("object");
      const res = await delBankAccount(data?.results?.[0]?.bank_account_uid);
      if (res?.success) {
        toast.success("Bank account unlinked and deleted!");
        refetch()
        setIsDeleteOpen(false)
      }
    } catch (error: any) {
      try {
        if (error?.response?.data?.message) {
          const errors = JSON.parse(error?.response?.data?.message);
          const messages = collectErrorMessages(errors);
          messages?.map((message) => {
            return toast.error(message);
          });
        }
      } catch (err) {
        // console.log(err);
        toast.error("Something Went Wrong");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmEnabled = confirmText.toLowerCase() === "delete";

  if (isPending) {
    return (
      <div className="flex h-48 w-full items-center justify-center py-12">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 text-gray-600 transition-all delay-100 duration-500">
        This is the account we'll use to pay your employees
      </p>

      <div className="space-y-4">
        {/* Existing Bank Account Option */}
        {data?.results?.[0]?.uid && (
          <div className="rounded-lg border border-gray-300 p-4 transition-all duration-300 ease-out hover:border-gray-400">
            <div className="flex cursor-pointer items-center justify-between">
              <span className="ml-3 text-sm font-light text-gray-700">
                <span className="text-base text-accent_soft_black">
                  {data?.results?.[0]?.account_holder_name} - (
                  {data?.results?.[0]?.account_type})
                </span>
                <br />
                {"******" + data?.results?.[0].account_number}
              </span>
              <Button
                type="button"
                onClick={() => setIsOpen(true)}
                className="max-w-32 rounded-md px-3 py-1 text-accent_soft_black hover:bg-gray-100"
              >
                View
              </Button>
              {data?.results?.[0]?.status != "ACTIVE" ? (
                // <Button
                //   type="button"
                //   onClick={() => setIsVerificationOpen(true)}
                //   className="max-w-32 rounded-md px-3 bg-purple-500 py-1 text-accent_soft_black hover:bg-gray-100"
                // >
                //   Verify
                // </Button>
                <p onClick={() => setIsVerificationOpen(true)} className="rounded-md bg-red-600 px-3 py-1 text-sm font-light text-white shadow-2xl">
                  Verify
                </p>
              ) : (
                <p className="rounded-md bg-green-500 px-3 py-1 text-sm font-light text-white shadow-2xl">
                  Verified
                </p>
              )}
              {/* <Button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="max-w-32 rounded-md px-3 py-1 text-red-500 hover:bg-red-100"
              >
                Remove
              </Button> */}
            </div>
          </div>
        )}

        {/* Different Bank Account Option */}
        {!data?.results?.[0]?.uid && (
          <div
            className={`rounded-lg border border-accent_soft_blue bg-blue-50 p-4 transition-all duration-300 ease-out hover:border-gray-400`}
          >
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center">
                <span className="ml-3 text-sm text-gray-700">
                  Add bank account
                </span>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="transform rounded-md border border-accent_soft_blue bg-white px-4 py-2 text-sm font-medium text-accent_soft_blue transition-all duration-300 ease-out hover:scale-105 hover:bg-blue-50"
              >
                Add
              </button>
            </label>
          </div>
        )}
      </div>

      <RootPopup
        isOpen={isDeleteOpen}
        title={"Confirm"}
        onClose={() => setIsDeleteOpen(false)}
      >
        <div className="relative w-full rounded-xl bg-card duration-200 animate-in fade-in-0">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-5 w-5 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">
                Delete Confirmation
              </h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this linked bank account?
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm font-medium leading-relaxed text-accent_soft_black">
              This action cannot be undone. This will{" "}
              <span className="text-red-500">permanently delete</span> the
              selected bank account. It  <span className="text-red-500">may affect</span> some of your transactions and
              transfers.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Type{" "}
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                delete
              </span>{" "}
              to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'delete' here..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-card-foreground transition-colors placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="off"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsDeleteOpen(false);
              }}
              disabled={isDeleting}
              className="flex-1 rounded-lg bg-secondary px-4 py-2.5 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBank}
              disabled={!isConfirmEnabled || isDeleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </RootPopup>
      <RootPopup
        widthClass="w-full md:max-w-[500px]"
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        title={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 28 28"
            fill="#000000"
          >
            <path
              fill="#000000"
              d="M14.001 8.999a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3Zm.89-6.706a1.5 1.5 0 0 0-1.78 0L3.613 9.298c-1.165.86-.558 2.708.89 2.708h.499v7.242c-1.175.49-2 1.65-2 3.002v1.5c0 .414.336.75.75.75h9.582a4.727 4.727 0 0 1-.326-1.5H4.502v-.75c0-.967.783-1.75 1.75-1.75h7.315a4.771 4.771 0 0 1 1.268-1.5h-.084v-6.994h2.75v6a4.15 4.15 0 0 1 .25-.007H19v-5.993h2.5v5.993H23v-5.993h.498c1.448 0 2.055-1.848.89-2.708L14.89 2.293Zm-8.39 16.706v-6.993h2.5v6.993h-2.5Zm6.75-6.993v6.993h-2.75v-6.993h2.75Zm-8.748-1.5L14 3.5l9.498 7.005H4.503ZM17.75 20.5a2.25 2.25 0 0 0 0 4.5h.5a.75.75 0 0 1 0 1.5h-.5a3.75 3.75 0 0 1 0-7.5h.5a.75.75 0 0 1 0 1.5h-.5ZM17 22.75a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75ZM23.25 25a2.25 2.25 0 0 0 0-4.5h-.5a.75.75 0 0 1 0-1.5h.5a3.75 3.75 0 0 1 0 7.5h-.5a.75.75 0 0 1 0-1.5h.5Z"
            />
          </svg>
        }
      >
        <div>
          <BankAccountForm
            setIsVerificationOpen={setIsVerificationOpen}
            setIsOpen={setIsOpen}
            bankAccount={data?.results?.[0]}
            isPending={isPending}
            refetch={refetch}
          />
        </div>
      </RootPopup>
      <RootPopup
        widthClass="w-full md:max-w-[580px]"
        // classNames="bg-[#252525]"
        // onClose={() => setIsOpen(false)}
        isOpen={isVerificationOpen}
        // title="Check your bank account now"
      >
        {isVerificationOpen && (
          <VerifyBankAccount
            bankRefetch={refetch}
            setIsOpen={setIsVerificationOpen}
            BankAccountID={data?.results?.[0]?.bank_account_uid}
            status={data?.results?.[0]?.status}
          />
        )}
      </RootPopup>
    </div>
  );
};

export default ReviewAndPay;
