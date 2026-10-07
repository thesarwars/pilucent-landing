import PDFModal from "@/app/dashboard/reports/_components/PDFModal";
import Button from "@/components/ui/RawButton";
import TopModal from "@/components/ui/ScrollSelectDropDowns/TopModal";
import { useState } from "react";
import TaxPaymentForm from "./RecordPayment";
import TaxAdjustmentForm from "./tax-adjustment-form";

const ReviewDueSalesTax = ({ onClose, rowData, refetch }: { onClose?: any; rowData?: any; refetch?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDueOpen, setIsDueOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");

  const reasons = [
    { id: "credit-discount", label: "Credit / Discount" },
    { id: "prior-prepayments", label: "Prior prepayments" },
    { id: "pre-payments", label: "Pre payments" },
    {
      id: "other",
      label: "Other (penalties, interest, use tax, rounding)",
      description:
        "Includes penalties, interest, use tax, and rounding adjustments",
    },
  ];
  return (
    <>
      <div className="mt-8 rounded border border-accent_soft_black bg-white p-6">
        {/* Header */}
        <div className="mb-4 border-b border-b-accent_soft_black">
          <h2 className="mb-1 text-2xl font-semibold text-gray-900">
            {rowData?.agency || "Agency Name"}
          </h2>
          <div className="mb-3 text-gray-600">Tax Period: {rowData?.period || "Period"}</div>
        </div>
        <div className="mb-4 flex flex-col border-b pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div>
              <div className="mb-0.5 font-semibold text-gray-900">
                Craig's Design and Landscaping Services
              </div>
              <div className="text-sm text-gray-700">123 Sierra Way</div>
              <div className="text-sm text-gray-700">San Pablo, CA 87999</div>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              When your tax is due
            </h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
              <li>
                Review and save your{" "}
                <a
                  href="#"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tax liability report
                </a>
                .
              </li>
              <li>Use your report to prepare your return.</li>
              <li>
                Follow the{" "}
                <a
                  href="#"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  tax agency's instructions
                </a>{" "}
                to file and pay.
              </li>
              <li>
                Select Review Sales Tax to come back here, add any adjustments,
                and record the payment in QuickBooks.
              </li>
            </ol>
          </div>
        </div>

        {/* Table */}
        <div className="rounded border p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-2 font-medium">LEVEL</th>
                  <th className="py-2 font-medium">GROSS SALES</th>
                  <th className="py-2 font-medium">NONTAXABLE SALES</th>
                  <th className="py-2 font-medium">TAXABLE SALES</th>
                  <th className="py-2 font-medium">TAX AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No transactions available for this period.
                  </td>
                </tr>
                <tr className="border-t font-semibold">
                  <td className="py-2">Total tax</td>
                  <td />
                  <td />
                  <td />
                  <td className="text-right text-gray-900">{rowData?.tax_amount || "$0.00"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 pl-1">
            <button
              onClick={() => setIsOpen(true)}
              className="text-sm text-blue-600 hover:underline"
              type="button"
            >
              + Add an adjustment and/or prepayment
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-semibold text-gray-700">
              Total after adjustments and/or prepayment
            </span>
            <span className="text-lg font-semibold text-gray-900">{rowData?.tax_amount || "$0.00"}</span>
          </div>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-8">
        <Button
          onClick={() => onClose && onClose()}
          className="mt-8 rounded-3xl border border-accent_soft_black bg-white py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white hover:brightness-100"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            onClose();
            setTimeout(() => {
              setIsDueOpen(true);
            }, 500);
          }}
          className="mt-8 rounded-3xl border border-accent_soft_black bg-accent_soft_black py-2 text-white transition-all hover:bg-accent_soft_black hover:text-white hover:brightness-100"
        >
          Record Payment
        </Button>
      </div>
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Chart Of Account"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[550px]"
      >
        <TaxAdjustmentForm
          rowData={rowData}
          onClose={() => {
            setIsOpen(false);
            refetch?.();
          }}
        />
      </TopModal>
      <PDFModal
        isOpen={isDueOpen}
        onClose={() => setIsDueOpen(false)}
        title="Review Sales Tax"
      >
        <TaxPaymentForm onClose={() => setIsDueOpen(false)} />
      </PDFModal>
    </>
  );
};

export default ReviewDueSalesTax;
