import {
  putBankAccountVerify,
  postBankAccountVerify,
} from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { collectErrorMessages } from "@/utils/flattenErrors";
import { X } from "lucide-react";
import Image from "next/image";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { FaRegClock } from "react-icons/fa";

const VerifyBankAccount = ({
  bankRefetch,
  status,
  BankAccountID,
  setIsOpen,
}: {
  bankRefetch: any;
  setIsOpen: any;
  status?: string;
  BankAccountID: string;
}) => {
  const [isVerificationCompleted, setIsVerificationCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<any>(undefined);
  const [code, setCode] = useState("");

  const handleError = (error: any) => {
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
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (BankAccountID && status != "PENDING") {
      const fn = async () => {
        if (ref.current) return;
        try {
          ref.current = true;
          const res = await postBankAccountVerify(BankAccountID);
          if (res?.success) {
            bankRefetch();
            //success
          }
        } catch (error) {
          handleError(error);
        } finally {
          ref.current = false;
        }
      };
      fn();
    }
  }, [BankAccountID]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const result = await putBankAccountVerify(BankAccountID, { code });
      if (result?.success) {
        toast.success("Bank account verified successfully!");
        setIsVerificationCompleted(true);
        bankRefetch();
      }
    } catch (error) {
      //   toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isVerificationCompleted ? (
        <div className="mx-auto mb-4 w-full rounded-lg bg-[#fff]">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-black">
              Check your bank account now
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          {/* Description */}
          <div className="mb-6 text-sm leading-relaxed text-[#6B6B6B]">
            You should see a{" "}
            <span className="font-medium text-[#969696]">$0.01 deposit</span>{" "}
            with a 4-digit verification code in your bank account. Look for{" "}
            <span className="font-medium text-[#969696]">MV</span> followed by 4
            numbers, usually found in the transaction description.
          </div>

          {/* Example Transaction */}
          <div className="mb-6">
            <Image
              src={"/images/image.png"}
              width={700}
              height={200}
              alt="image"
              className="h-24 w-full rounded-md lg:h-[120px]"
            />
          </div>
          <form onSubmit={handleSubmit}>
            {/* Input Section */}
            <div className="mb-6 px-4">
              <label className="mb-3 block text-sm text-gray-700">
                Enter the code
              </label>
              <div className="relative mx-auto max-w-40">
                <p className="absolute left-4 top-[50%] translate-y-[-50%] text-black">
                  MV
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    if (
                      code &&
                      code?.length > 3 &&
                      e.target.value &&
                      e.target.value?.length > 3
                    ) {
                      // setCode(e.target.value);
                    } else {
                      setCode(e.target.value);
                    }
                  }}
                  required
                  placeholder=" • • • •"
                  className="w-full rounded-md border border-gray-300 bg-[#fff] py-2.5 pl-12 pr-4 text-black outline-none placeholder:text-[#717171] focus:border-accent_soft_blue"
                  maxLength={4}
                  minLength={4}
                />
              </div>
            </div>

            {/* Verify Button */}
            <button
              disabled={ref.current || isLoading}
              className="flex w-full items-center justify-center gap-1 rounded-lg bg-green-500 px-4 py-3 font-medium text-black transition-colors hover:bg-green-600"
            >
              {isLoading ? (
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
                  Processing...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-white py-7">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 16 16"
            fill="#000000"
          >
            <path
              fill="#000000"
              d="m9.585.52l.929.68c.153.112.331.186.518.215l1.138.175a2.678 2.678 0 0 1 2.24 2.24l.174 1.139c.029.187.103.365.215.518l.68.928a2.677 2.677 0 0 1 0 3.17l-.68.928a1.174 1.174 0 0 0-.215.518l-.175 1.138a2.678 2.678 0 0 1-2.241 2.241l-1.138.175a1.17 1.17 0 0 0-.518.215l-.928.68a2.677 2.677 0 0 1-3.17 0l-.928-.68a1.174 1.174 0 0 0-.518-.215L3.83 14.41a2.678 2.678 0 0 1-2.24-2.24l-.175-1.138a1.17 1.17 0 0 0-.215-.518l-.68-.928a2.677 2.677 0 0 1 0-3.17l.68-.928c.112-.153.186-.331.215-.518l.175-1.14a2.678 2.678 0 0 1 2.24-2.24l1.139-.175c.187-.029.365-.103.518-.215l.928-.68a2.677 2.677 0 0 1 3.17 0ZM7.303 1.728l-.927.68a2.67 2.67 0 0 1-1.18.489l-1.137.174a1.179 1.179 0 0 0-.987.987l-.174 1.136a2.677 2.677 0 0 1-.489 1.18l-.68.928a1.18 1.18 0 0 0 0 1.394l.68.927c.256.348.424.753.489 1.18l.174 1.137c.078.509.478.909.987.987l1.136.174a2.67 2.67 0 0 1 1.18.489l.928.68c.414.305.979.305 1.394 0l.927-.68a2.67 2.67 0 0 1 1.18-.489l1.137-.174a1.18 1.18 0 0 0 .987-.987l.174-1.136a2.67 2.67 0 0 1 .489-1.18l.68-.928a1.176 1.176 0 0 0 0-1.394l-.68-.927a2.686 2.686 0 0 1-.489-1.18l-.174-1.137a1.179 1.179 0 0 0-.987-.987l-1.136-.174a2.677 2.677 0 0 1-1.18-.489l-.928-.68a1.176 1.176 0 0 0-1.394 0ZM11.28 6.78l-3.75 3.75a.75.75 0 0 1-1.06 0L4.72 8.78a.751.751 0 0 1 .018-1.042a.751.751 0 0 1 1.042-.018L7 8.94l3.22-3.22a.751.751 0 0 1 1.042.018a.751.751 0 0 1 .018 1.042Z"
            />
          </svg>
          <h1 className="text-center text-3xl font-normal">
            Your linked bank is now verified.
          </h1>
          <Button
            onClick={() => setIsOpen(false)}
            className="my-7 rounded-md bg-accent_soft_black px-4 py-2 text-white"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerifyBankAccount;
