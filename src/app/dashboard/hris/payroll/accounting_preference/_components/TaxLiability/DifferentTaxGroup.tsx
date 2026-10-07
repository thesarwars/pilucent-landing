import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import React, { useEffect, useState } from "react";

const TaxGroupAccounts = [
  {
    account_type: "FEDERAL_TAXES_(941/943/944)",
    expense_account: "",
    payroll_accounting_preferences_type:
      "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
  },
  {
    account_type: "FEDERAL_UNEMPLOYMENT_(940)",
    expense_account: "",
    payroll_accounting_preferences_type:
      "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
  },
];

const NYCLiabilityTaxGroup = [
  {
    account_type: "NYS_INCOME_TAX",
    expense_account: "",
    payroll_accounting_preferences_type:
      "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
  },
  {
    account_type: "NYS_EMPLOYMENT_TAXES",
    expense_account: "",
    payroll_accounting_preferences_type:
      "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
  },
];

const MNLiabilityTaxGroup = [
  {
    account_type: "MN_INCOME_TAX",
    expense_account: "",
    payroll_accounting_preferences_type:
      "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
  },
  {
    account_type: "MN_UNEMPLOYMENT_TAXES",
    expense_account: "",
    payroll_accounting_preferences_type:
      "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
  },
];

const LiabilityDifferentTaxGroup = ({
  isAPPending,
  APData,
  data,
  setData,
  states,
}: {
  isAPPending: any;
  APData: any;
  data: any[];
  setData: any;
  states: any[];
}) => {
  const handleChange = (value: any, index: number) => {
    const newPerEmpAccounts = [...data];
    newPerEmpAccounts[index].expense_account = value;
    setData(newPerEmpAccounts);
  };

  useEffect(() => {
    if (!isAPPending) {
      let filteredArr = [];
      if (APData?.expense_accounts?.length > 0) {
        filteredArr = APData?.expense_accounts?.filter((acc: any) => {
          console.log(acc);
          if (
            acc?.payroll_accounting_preferences_type ==
            "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP"
          ) {
            return acc;
          }
        });
      }
     
      // Step 1: reduce to unique by account_type
      const combined = [
        ...TaxGroupAccounts,
        ...filteredArr,
        ...(states.includes("NY") ? NYCLiabilityTaxGroup : []),
        ...(states.includes("MN") ? MNLiabilityTaxGroup : []),
      ];

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
            payroll_accounting_preferences_type:
              "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
          };
        } else {
          return {
            account_type: acc?.account_type,
            expense_account: "",
            payroll_accounting_preferences_type:
              "DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP",
          };
        }
      });

      setData(finalArr);
    }
  }, [APData]);

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {data.map((emp: any, index: number) => (
          <div key={index} className="">
            <p className="mb-1 text-sm capitalize text-black">
              {emp?.account_type?.split("_").join(" ")?.toLowerCase()}
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

export default LiabilityDifferentTaxGroup;
