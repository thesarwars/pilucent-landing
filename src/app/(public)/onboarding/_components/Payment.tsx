import React, { FormEvent } from "react";
import {
  onboardingNativeSelectClassName as nativeSelectClassName,
  onboardingSelectEmptyTextClass,
  onboardingTextInputClassName as textInputClassName,
} from "./onboardingInputStyles";
const EmployeeBankingInformationKindChoices = [
  // { value: "PAPER_CHECK", title: "Paper Check" },
  { value: "BANK_TRANSFER", title: "Bank Transfer" },
  { value: "PAPER_CHECK", title: "Cheque" },
  // { value: "CASH", title: "Cash" },
  // { value: "CREDIT_CARD", title: "Credit Card" },
  // { value: "DEBIT_CARD", title: "Debit Card" },
  // { value: "MOBILE_PAYMENT", title: "Mobile Payment" },
  // { value: "DIGITAL_WALLET", title: "Digital Wallet" },
];

const Payment = ({
  paymentInfo,
  setPaymentInfo,
  prev,
  next,
  currentStep,
  steps,
  onSkipForNow,
  onPaymentInteraction,
}: {
  paymentInfo: any;
  setPaymentInfo: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
  /** Optional: skip payroll setup and continue (complete later in profile). */
  onSkipForNow?: () => void;
  /** Clear “skipped” when user edits this step */
  onPaymentInteraction?: () => void;
}) => {
  // Set default payment method to 'CHECK' if not set
  React.useEffect(() => {
    if (!paymentInfo.kind) {
      setPaymentInfo((prev: any) => ({ ...prev, kind: "PAPER_CHECK" }));
    }
  }, [paymentInfo.kind, setPaymentInfo]);

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  return (
    <form onSubmit={handleNext} className="text-sm">
      <div className="rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <h1 className="mb-4 text-xl font-medium">Payment Info</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Payment method</label>
            <select
              value={paymentInfo.kind}
              onChange={(e) => {
                onPaymentInteraction?.();
                setPaymentInfo({
                  ...paymentInfo,
                  kind: e.target.value,
                });
              }}
              required
              className={`${nativeSelectClassName} ${!paymentInfo.kind ? onboardingSelectEmptyTextClass : ""}`}
            >
              <option value="">Select</option>
              {EmployeeBankingInformationKindChoices?.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          {/* Show bank fields only if BANK_TRANSFER is selected */}
          {paymentInfo.kind === "BANK_TRANSFER" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Bank Name</label>
                <input
                  value={paymentInfo.bank_name}
                  onChange={(e) => {
                    onPaymentInteraction?.();
                    setPaymentInfo({
                      ...paymentInfo,
                      bank_name: e.target.value,
                    });
                  }}
                  required
                  maxLength={40}
                  type="text"
                  className={textInputClassName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">
                  Bank Account Number
                </label>
                <input
                  maxLength={40}
                  value={paymentInfo.bank_account_number}
                  onChange={(e) => {
                    onPaymentInteraction?.();
                    setPaymentInfo({
                      ...paymentInfo,
                      bank_account_number: e.target.value,
                    });
                  }}
                  required
                  type="text"
                  className={textInputClassName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Account Type</label>
                <select
                  value={paymentInfo.bank_account_type}
                  onChange={(e) => {
                    onPaymentInteraction?.();
                    setPaymentInfo({
                      ...paymentInfo,
                      bank_account_type: e.target.value,
                    });
                  }}
                  required
                  className={`${nativeSelectClassName} ${!paymentInfo.bank_account_type ? onboardingSelectEmptyTextClass : ""}`}
                >
                  <option value="">Select</option>
                  <option value="SAVINGS">Saving</option>
                  <option value="CHECKING">Checking</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Routing Number</label>
                <input
                  maxLength={40}
                  value={paymentInfo.routing_number}
                  onChange={(e) => {
                    onPaymentInteraction?.();
                    setPaymentInfo({
                      ...paymentInfo,
                      routing_number: e.target.value,
                    });
                  }}
                  required
                  type="text"
                  className={textInputClassName}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={currentStep === 1}
          className={`rounded-md border px-6 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
              : "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
          } `}
        >
          Previous
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onSkipForNow && (
            <button
              type="button"
              onClick={onSkipForNow}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          )}
          <button
            type="submit"
            className="bg-[#02143A] hover:opacity-95 text-white rounded-md px-6 py-2"
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Payment;
