"use client";
import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Modal from "@/app/(admin)/_components/Modal";
import PayrollTaxForm from "./_components/payroll_tax";
import WageExpenses from "./_components/wage_expense";
import CompanyExpense from "./_components/company_expense";
import EmployerExpense from "./_components/employer_expense";
import TaxLiabilities from "./_components/tax_liabilities";
import OtherLiabilities from "./_components/other_liabilities";
import UpdateTransaction from "./_components/update_transaction";
import { useFetch } from "@/app/helpers/hooks";
import {
  fetchAccountingPreference,
  fetchWorkLocations,
} from "@/app/helpers/backend";
import { isPending } from "@reduxjs/toolkit";

const AccountingPreferenceComponent = () => {
  const [type, setType] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [states, setStates] = useState<any[]>([]);
  const { data: locations, isPending: isLocationPending } = useFetch(
    ["state-list"],
    fetchWorkLocations,
  );
  const { data, refetch, isPending } = useFetch(
    ["accounting-preference"],
    fetchAccountingPreference,
    {},
    { refetchOnWindowFocus: false },
  );

  useEffect(() => {
    if (!isLocationPending && locations?.length > 0) {
      const uniqueStates = Array.from(
        new Set(locations.map((item: any) => item.location_state)),
      );
      setStates(uniqueStates);
    }
  }, [isLocationPending, locations]);

  return (
    <div className="mb-7">
      <h2 className="py-4 text-xl font-semibold text-gray-800">
        Accounting Preference
      </h2>
      <div className="">
        <div className="space-y-4">
          {/* Payroll */}

          {isPending ? (
            <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <PayrollTaxForm APData={data?.[0]} refetch={refetch} />
          )}

          {isPending ? (
            <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <WageExpenses refetch={refetch} APData={data?.[0]} />
          )}

          {isPending ? (
            <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <CompanyExpense refetch={refetch} APData={data?.[0]} />
          )}

          {/* Employer Tax Expenses */}
          {isPending ? (
            <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <EmployerExpense refetch={refetch} APData={data?.[0]} />
          )}

          {/* Tax Liability Accounts (First Instance) */}
          {isPending ? (
            <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1 space-y-1.5">
                  <div className="h-5 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <TaxLiabilities
              isAPPending={isPending}
              refetch={refetch}
              APData={data?.[0]}
              states={states}
            />
          )}
          {isPending ? (
            <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
              <div className="flex items-center justify-between p-5">
                <div className="flex-1">
                  <div className="h-5 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="my-1 h-5 w-40 animate-pulse rounded bg-gray-200"></div>
                  {/* <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div> */}
                  <div className="mt-1 h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <OtherLiabilities refetch={refetch} APData={data?.[0]} />
          )}

          {/* Class Tracking */}
          {/* <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <h2 className="text-base font-medium text-gray-800">Class Tracking</h2>
                <div className="mt-1 text-sm text-gray-600">Off</div>
              </div>
              <div className="flex-1 text-sm text-gray-500">
              </div>
              <div className="flex items-center">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil size={16} onClick={() => {
                    setIsOpen(true)
                    setType("class_tracking")
                  }} />
                </button>
              </div>
            </div>
          </div> */}

          {/* Tax Liability Accounts (Second Instance) */}
          {/* <div className="bg-white rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <h2 className="text-base font-medium text-gray-800">Tax Liability Accounts</h2>
                <div className="mt-1 text-sm text-gray-600">Federal Taxes (941/943/944)</div>
                <div className="mt-1 text-sm text-gray-600">Federal Unemployment (940)</div>
                <div className="mt-1 text-sm text-gray-600">CA PIT / SDI</div>
                <div className="mt-1 text-sm text-gray-600">CA SUI / ETT</div>
              </div>
              <div className="flex-1 text-sm text-gray-500">
                <div>Payroll Liabilities: Federal Taxes (941/943/944)</div>
                <div>Federal Liabilities: Unemployment (940)</div>
                <div>Federal Liabilities: CA PIT / SDI</div>
                <div>Federal Liabilities: CA SUI / ETT</div>
              </div>
              <div className="flex items-center">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil size={16} onClick={() => {
                    setIsOpen(true)
                    setType("tax_liability_accounts_2")
                  }} />
                </button>
              </div>
            </div>
          </div> */}

          {/* Other Liability and assets */}

          {/* Update Transactions */}
          {/* <div className="rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex-1">
                <h2 className="text-base font-medium text-gray-800">
                  Update Transactions
                </h2>
                <div className="mt-1 text-sm text-gray-600">
                  Update Accounting preference for past transactions according
                  to current preference settings (we&apos;ll update all accounts
                  except the bank account section).
                </div>
              </div>
              <div className="flex-1 text-sm text-gray-500"></div>
              <div className="flex items-center">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Pencil
                    size={16}
                    onClick={() => {
                      setIsOpen(true);
                      setType("update_transactions");
                      setTitle("Update Transactions");
                    }}
                  />
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        widthClass="w-full md:w-[550px]"
        title={title}
      >
        {type === "update_transactions" && (
          <UpdateTransaction setIsOpen={setIsOpen} />
        )}
      </Modal>
    </div>
  );
};

export default AccountingPreferenceComponent;
