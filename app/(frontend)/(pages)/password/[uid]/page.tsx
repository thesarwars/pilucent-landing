"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import { patchPassword } from "../../../../helpers/backend";
import PasswordInput from "../../auth/_components/PasswordInput";

const PageContent = ({ uid }: { uid: string }) => {
  const token = useSearchParams().get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isValid, setIsValid] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      return toast.error("Password doesn't meet the requirements");
    }
    setIsLoading(true);
    try {
      const result = await patchPassword(uid, token, { password: password });
      if (result?.success) {
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error("Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-2 font-inter h-[80vh] bg-[#5A5FEE] w-full flex items-center justify-center flex-col mx-auto">
      <div className="text-center transition-all max-w-md bg-white p-8 rounded-md">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-600 text-sm mt-2">
            Try Pilucent free for 30 days. No credit card required. Cancel
            anytime.
          </p>
        </div>
        <form className="space-y-4 w-full mt-8" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="workEmail"
              className="block text-sm text-left font-medium text-gray-700"
            >
              Enter your new Password <span className="text-red-500">*</span>
            </label>
            <PasswordInput
              password={password}
              setPassword={setPassword}
              setIsValid={setIsValid}
            />
          </div>

          <button
            type="submit"
            className="relative overflow-hidden w-full font-semibold text-base px-4 py-2 border rounded-md mt-8 
                                 bg-[#F7D435] text-gray-900 transition-all duration-300 
                                  hover:shadow-lg 
                                 active:scale-95
                                 before:absolute before:inset-0 before:bg-gradient-to-r 
                                 before:from-white/50 before:to-transparent before:-translate-x-full 
                                 before:transition-transform before:duration-300 
                                 hover:before:translate-x-full"
          >
            {isLoading ? (
              <p className="inline-block h-6 w-6 animate-spin rounded-full border-[2px] border-gray-100 border-t-[#6A6EF6]" />
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <FaCheckCircle className="mx-auto mb-4 text-green-500 text-5xl" />
              <h2 className="text-2xl font-bold mb-4">Password Changed!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been changed. Please login from the login or
                signin page
              </p>
              <button
                onClick={() => {
                  router.push("/auth?action=sign-in");
                  setIsModalOpen(false);
                }}
                className="bg-[#5A5FEE] text-white px-6 py-2 rounded-md hover:bg-[#4A4FDE] transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Page = ({ params }: { params: any }) => {
  return (
    <Suspense fallback={<p>'loading'</p>}>
      <PageContent uid={params?.uid} />
    </Suspense>
  );
};

export default Page;
