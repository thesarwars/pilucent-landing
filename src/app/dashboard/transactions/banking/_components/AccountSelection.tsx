"use client";

import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { toast } from "@/lib/ToastService";

export default function AccountSelection({
  account,
  setAccount,
  selectedFile,
  setStep,
  step,
}: {
  setStep: any;
  step: any;
  account: any;
  setAccount: any;
  selectedFile: any;
}) {
  const handleNext = () => {
    if (account?.uid) {
      setStep(3);
    } else {
      toast.info("Select an account");
    }
  };

  return (
    <div className="p-6 border rounded-md bg-white">
      <div className="mb-10">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Where did these transactions originate from?
        </h1>

        <div className="mb-8">
          <p className="mb-1 text-gray-500">Selected File:</p>
          <p className="text-accent_soft_blue">{selectedFile?.name}</p>
        </div>

        <div className="my-16">
          <p className="mb-3 text-gray-700">
            Select account for the bank file you want to upload
          </p>
          <AccountSelectDropDown setValue={setAccount} value={account} ClassName="border rounded-md text-accent_soft_black placeholder:accent-black border-accent_soft_black" parentClassName="max-w-md"/>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setStep(1)}
            className="rounded-md border-accent_soft_black border px-6 py-2 font-medium text-accent_soft_black transition-colors "
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="rounded-md bg-accent_soft_black px-6 py-2 font-medium text-white transition-colors hover:bg-accent_soft_black"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
