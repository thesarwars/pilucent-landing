import {
  fetchAPEmployees,
  fetchEmployee,
  fetchEmployees,
} from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import Button from "@/components/ui/RawButton";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import React, { useEffect, useState } from "react";

const PerWageEmployeeForm = ({
  setPerEmpAccounts,
  perEmpAccounts,
  APData,
}: {
  setPerEmpAccounts: any;
  perEmpAccounts: any;
  APData: any;
}) => {
  const { data, isPending } = useFetch(
    ["employee-list"],
    fetchAPEmployees,
    {},
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (data?.length && !isPending) {
  
      let Array: any[] = [];

      //data from backend accounting preference
      if (APData?.expense_accounts?.length > 0) {
        const filteredArr = APData?.expense_accounts?.filter((acc: any) => {
          if (acc?.payroll_accounting_preferences_type == "PER_WAGE_EMPLOYEE") {
            const found = perEmpAccounts?.find(
              (emp: any) => !acc?.employee?.uid == emp?.employee?.uid,
            );
            if (!found?.uid) {
              return acc;
            }
          }
        });

        if (filteredArr?.length > 0) {
          filteredArr?.map((acc: any) => {
            Array.push({
              uid: acc?.uid,
              employee: acc?.employee,
              expense_account: acc?.expense_account,
              payroll_accounting_preferences_type: "PER_WAGE_EMPLOYEE",
            });
          });
        }
      }

      data?.map((emp: any) => {
        const findEmployee = Array?.find(
          (empAC: any) => empAC?.employee?.uid == emp?.uid,
        );
        if (!findEmployee?.uid) {
          Array.push({
            employee: emp,
            expense_account: "",
            payroll_accounting_preferences_type: "PER_WAGE_EMPLOYEE",
          });
        }
      });
      setPerEmpAccounts(Array);
      Array = [];
    }
  }, [data, isPending]);

  const handleChange = (value: any, index: number) => {
    const newPerEmpAccounts = [...perEmpAccounts];
    newPerEmpAccounts[index].expense_account = value;
    setPerEmpAccounts(newPerEmpAccounts);
  };

  return (
    <div>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {perEmpAccounts.map((emp: any, index: number) => (
          <div key={index} className="">
            <p className="mb-1 text-sm text-black">
              {emp?.employee?.user?.first_name || ""}{" "}
              {emp?.employee?.user?.middle_name || ""}{" "}
              {emp?.employee?.user?.last_name || ""}
              {!emp?.employee?.user?.uid && (
                <>
                  {emp?.employee?.first_name} {emp?.employee?.middle_name}{" "}
                  {emp?.employee?.last_name}{" "}
                </>
              )}
            </p>
            <AccountSelectDropDown
              ClassName="border rounded-md text-sm focus:border-accent_soft_blue"
              parentClassName=""
              setValue={(value: any) => handleChange(value, index)}
              value={emp?.expense_account}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerWageEmployeeForm;
