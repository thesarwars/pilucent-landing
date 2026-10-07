import Modal from "@/app/(admin)/_components/Modal";
import {
  fetchDeductionContribution,
  patchDeductionContribution,
  postDeductionContribution,
} from "@/app/helpers/backend";
import LogoLoader from "@/components/MainLoader/logo-loader";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { set } from "lodash";
import React, { FormEvent, useEffect, useState } from "react";

const benefits = [
  {
    category: "Health Insurance",
    items: [
      { value: "medical", title: "Medical Insurance" },
      { value: "vision", title: "Vision Insurance" },
      { value: "dental", title: "Dental Insurance" },
    ],
  },
  {
    category: "Flexible Spending Accounts",
    items: [
      { value: "dependentCareFSA", title: "Dependent Care FSA" },
      { value: "medicalExpenseFSA", title: "Medical Expense FSA" },
    ],
  },
  {
    category: "HSA Plans",
    items: [
      { value: "pretaxHSA", title: "Pretax HSA" },
      { value: "taxableHSA", title: "Taxable HSA" },
    ],
  },
  {
    category: "Other Deductions",
    items: [
      { value: "wageGarnishment", title: "Wage Garnishment" },
      { value: "cashAdvanceRepayment", title: "Cash Advance Repayment" },
      { value: "loanRepayment", title: "Loan Repayment" },
      { value: "otherAfterTaxDeductions", title: "Other after tax deductions" },
    ],
  },
  {
    category: "Retirement Plans",
    items: [
      { value: "_401k", title: "401(k)" },
      { value: "_401kCatchUp", title: "401(k) Catch-up" },
      { value: "_401kCatchUp6063", title: "401(k) Catch-up (60-63)" },
      { value: "_403b", title: "403(b)" },
      { value: "_403bCatchUp", title: "403(b) Catch-up" },
      { value: "_403bCatchUp6063", title: "403(b) Catch-up (60-63)" },
      { value: "sarsep", title: "SARSEP" },
      { value: "sarsepCatchUp", title: "SARSEP Catch-up" },
      { value: "sarsepCatchUp6063", title: "SARSEP Catch-up (60-63)" },
      { value: "simple401k", title: "SIMPLE 401(k)" },
      { value: "simple401kHigherLimit", title: "SIMPLE 401(k) Higher Limit" },
      { value: "simple401kCatchUp", title: "SIMPLE 401(k) Catch-up" },
      {
        value: "simple401kCatchUpHigherLimit",
        title: "SIMPLE 401(k) Catch-up Higher Limit",
      },
      {
        value: "simple401kCatchUp6063",
        title: "SIMPLE 401(k) Catch-up (60-63)",
      },
      {
        value: "simple401kCatchUp6063HigherLimit",
        title: "SIMPLE 401(k) Catch-up (60-63) Higher Limit",
      },
      { value: "simpleIRA", title: "SIMPLE IRA" },
      { value: "simpleIRAHigherLimit", title: "SIMPLE IRA Higher Limit" },
      { value: "simpleIRACatchUp", title: "SIMPLE IRA Catch-up" },
      {
        value: "simpleIRACatchUpHigherLimit",
        title: "SIMPLE IRA Catch-up Higher Limit",
      },
      { value: "simpleIRACatchUp6063", title: "SIMPLE IRA Catch-up (60-63)" },
      {
        value: "simpleIRACatchUp6063HigherLimit",
        title: "SIMPLE IRA Catch-up (60-63) Higher Limit",
      },
      { value: "afterTaxRoth401k", title: "After-tax Roth 401(k)" },
      {
        value: "afterTaxRoth401kCatchUp",
        title: "After-tax Roth 401(k) Catch-up",
      },
      {
        value: "afterTaxRoth401kCatchUp6063",
        title: "After-tax Roth 401(k) Catch-up (60-63)",
      },
      { value: "afterTaxRoth403b", title: "After-tax Roth 403(b)" },
      { value: "companyOnlyPlan", title: "Company-only plan" },
    ],
  },
];

const DEDUCTION_TYPES = [
  "Health Insurance",
  "Flexible Spending Accounts",
  "HSA Plans",
  "Other Deductions",
  "Retirement Plans",
];

const DeductionContribution = ({
  isOpen,
  setIsOpen,
  uid,
  refetch,
}: {
  isOpen: boolean;
  setIsOpen: any;
  uid?: string;
  refetch?: any;
}) => {
  const [data, setData] = useState({
    title: "",
    deduction_type: "",
    sub_type: "",
    tax_type: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchDeductionContribution(uid);
          if (res) {
            setData({ ...res });
          }
        } catch (error) {
          //error
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [uid]);


  const handleReset = () => {
    setData({
      title: "",
      deduction_type: "",
      sub_type: "",
      tax_type: "",
    });
  };

  useEffect(() => {
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      if (uid) {
        const res = await patchDeductionContribution(uid, data);
        if (res?.success) {
          toast.success("Deduction/Contribution updated.");
          setIsOpen(false);
          handleReset();
          refetch && refetch();
        }
      } else {
        const res = await postDeductionContribution(data);
        if (res?.success) {
          toast.success("Deduction/Contribution created.");
          setIsOpen(false);
          handleReset();
          refetch && refetch();
        }
      }
    } catch (error) {
      //error here
    } finally {
      setIsPending(false);
    }
  };

  const SubTypes = benefits?.filter(
    (d) => d.category === data.deduction_type,
  )?.[0]?.items;

  return (
    <Modal
      title={uid ? "Add" : "Edit"}
      isOpen={isOpen}
      widthClass="w-full md:w-[550px]"
      onClose={() => setIsOpen(false)}
    >
      {isLoading ? (
        <div className="flex h-[80vh] items-center justify-center">
          <LogoLoader size={100} color={"#16151c"} />
        </div>
      ) : (
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[#5A607F]">Title</label>
            <input
              placeholder="Enter title"
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              name="title"
              value={data?.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[#5A607F]">Deduction Type</label>
            <select
              name="deductionContributionType"
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-2"
              required
              value={data?.deduction_type || ""}
              onChange={(e) =>
                setData({ ...data, deduction_type: e.target.value })
              }
            >
              <option value="" disabled>
                Select a type
              </option>
              {DEDUCTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sub Type
            </label>
            <div className="relative">
              <select
                name="type"
                value={data?.sub_type || ""}
                onChange={(e) => setData({ ...data, sub_type: e.target.value })}
                className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {SubTypes?.map((d, i) => (
                  <option key={i} value={d.value}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax Options */}
          {data.deduction_type === "Health Insurance" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tax Options
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={data.tax_type == "PRETAX"}
                    onChange={() => setData({ ...data, tax_type: "PRETAX" })}
                  />
                  <label
                    htmlFor="pretax"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Pretax: Premium is deducted before taxes.
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={data.tax_type == "POST_TAX"}
                    onChange={() => setData({ ...data, tax_type: "POST_TAX" })}
                  />
                  <label
                    htmlFor="post-tax"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Post-tax: Premium is deducted after taxes.
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mx-auto flex max-w-[325px] items-center justify-center gap-x-3">
            <a
              onClick={() => setIsOpen(false)}
              className="flex h-[48px] w-[142px] cursor-pointer items-center justify-center rounded-lg border border-[#6A6EF6] text-center font-semibold text-[#6A6EF6]"
            >
              Cancel
            </a>
            <Button
              className="w-[142px] bg-black text-white"
              type="submit"
              disabled={isPending}
              isLoading={isPending}
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default DeductionContribution;
