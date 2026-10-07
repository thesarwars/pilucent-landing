import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import React, { useEffect, useState } from "react";

const PerWageTypeForm = ({
  APData,
  perWageTypes,
  setPerWageTypes,
}: {
  APData: any;
  perWageTypes: any[];
  setPerWageTypes: any;
}) => {
  const handleChange = (value: any, index: number) => {
    const newPerEmpAccounts = [...perWageTypes];
    newPerEmpAccounts[index].expense_account = value;
    setPerWageTypes(newPerEmpAccounts);
  };

  useEffect(() => {
    if (APData?.expense_accounts?.length > 0) {
      // if PER_WAGE_TYPE
      if (APData?.expense_accounts?.length > 0) {
        const filteredArr = APData?.expense_accounts?.filter((acc: any) => {
          if (acc?.payroll_accounting_preferences_type == "PER_WAGE_TYPE") {
            return acc;
          }
        });

        // Step 1: reduce to unique by account_type
        if (filteredArr?.length > 0) {
          const combined = [...perWageTypes, ...filteredArr];

          // Step 2: reduce to unique by account_type
          const unique = Object.values(
            combined.reduce((acc, item) => {
              const type = item.account_type;

              // If not exists, take it
              if (!acc[type]) {
                acc[type] = item;
              } else {
                // If exists, prefer the one with uid
                if (item.uid) {
                  acc[type] = item;
                }
              }
              return acc;
            }, {}),
          );
          const finalArr = unique?.map((acc: any) => {
            if (acc?.uid) {
              return {
                uid: acc?.uid,
                account_type: acc?.account_type,
                expense_account: acc?.expense_account,
                payroll_accounting_preferences_type: "PER_WAGE_TYPE",
              };
            } else {
              return {
                account_type: acc?.account_type,
                expense_account: "",
                payroll_accounting_preferences_type: "PER_WAGE_TYPE",
              };
            }
          });

          setPerWageTypes(finalArr);
        }
      }
    }
  }, [APData]);

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {perWageTypes.map((emp: any, index: number) => (
          <div key={index} className="">
            <p className="mb-1 text-sm capitalize text-black">
              {emp?.account_type?.split("_").join(" ")}
            </p>
            <AccountSelectDropDown
              ClassName="border rounded-md text-sm focus:border-accent_soft_blue"
              parentClassName="Choose an account"
              setValue={(value: any) => handleChange(value, index)}
              value={emp?.expense_account}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerWageTypeForm;
