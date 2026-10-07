"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import {
  patchAccountingPreference,
  postAccountingPreference,
} from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";
import { Pencil } from "lucide-react";
import Modal from "@/app/(admin)/_components/Modal";

interface PayrollTaxFormProps {
  APData: any;
  refetch: any;
}

const PayrollTaxForm: React.FC<PayrollTaxFormProps> = ({ APData, refetch }) => {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isPending, setIsPending] = useState<any>(false);
  const [isOpen, setIsOpen] = useState(false);
  // Define multiple account type titles as comma-separated string
  const accountTypeFilter =
    "Expense,Other Expense,Other Current Liability,Cost of Sold Goods(COGS)";

  useEffect(() => {
    if (APData?.uid) {
      setSelectedAccount(APData?.paycheck_payroll_tax_expense_account);
    }
  }, [APData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const data = {
      paycheck_payroll_tax_expense_account_uid: selectedAccount?.uid,
    };
    try {
      if (APData?.uid) {
        const res = await patchAccountingPreference(APData?.uid, data);
        if (res?.success) {
          setIsOpen(false);
          refetch();
          toast.success("Account updated.");
        }
      } else {
        const res = await postAccountingPreference(data);
        if (res?.success) {
          setIsOpen(false);
          refetch();
          toast.success("Account updated.");
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };
  return (
    <div className="text-sm">
      <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800">
              Paycheck and Payroll Tax Payments
            </h2>
            <div className="mt-1 text-sm text-gray-600">Bank Account</div>
          </div>
          <div className="flex-1 text-sm text-primary">
            A/C:{" "}
            {APData?.paycheck_payroll_tax_expense_account?.title || "Missing"}
          </div>
          <div className="flex items-center">
            <Button
              onClick={() => {
                setIsOpen(true);
              }}
              className="text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            >
              <Pencil size={16} />
            </Button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        widthClass="w-full md:w-[550px]"
        title="Paycheck and Payroll Tax Payments"
      >
        <div className="text-sm">
          <div className="rounded-lg bg-gray-50 p-5">
            <h3 className="text-base font-medium text-gray-700">
              Which Balanzify checking account do you use to pay your
              employees&apos; paychecks & payroll payments?
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="py-6">
                <Label className="font-medium text-gray-600">
                  Bank Account
                </Label>

                <div className="relative mt-2">
                  <AccountSelectDropDown
                    ClassName="border-b-2 focus:border-accent_soft_blue"
                    parentClassName=""
                    setValue={setSelectedAccount}
                    filters={{
                      status: "ACTIVE",
                      account_type__title: "Bank",
                    }}
                    value={selectedAccount}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  type="button"
                  className="flex w-[142px] cursor-pointer items-center justify-center rounded-lg border border-black py-2.5 text-center font-semibold text-black"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="w-[142px] bg-black py-2.5 text-white"
                  type="submit"
                  isLoading={isPending}
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PayrollTaxForm;
