'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/RawButton';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { Pencil } from 'lucide-react';
import Modal from '@/app/(admin)/_components/Modal';
import { fetchDCList, fetchGarnishments, postAccountingPreference } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { useFetch } from '@/app/helpers/hooks';

interface OtherLiabilitiesProps {
  APData: any;
  refetch: any;
}

const OtherLiabilities: React.FC<OtherLiabilitiesProps> = ({ APData, refetch }) => {
  // Define multiple account type titles as comma-separated string
  const [OtherLiabilitiesAccounts, setOtherLiabilitiesAccounts] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: garnishments,
    refetch: refetchGarnishments,
    isPending: isGarnishmentsPending,
  } = useFetch(['garnishment-list'], fetchGarnishments);

  // const {
  //   data: earnings,
  //   refetch: refetchEarnings,
  //   isPending: isEarningsPending,
  // } = useFetch(["garnishment-list"], fetchGarnishments);

  const {
    data: DCList,
    refetch: refetchDCList,
    isPending: isDCListPending,
  } = useFetch(['dc-list'], fetchDCList);

  const handleChange = (value: any, index: number) => {
    const newPerEmpAccounts = [...OtherLiabilitiesAccounts];
    newPerEmpAccounts[index].expense_account = value;
    setOtherLiabilitiesAccounts(newPerEmpAccounts);
  };

  useEffect(() => {
    if (!isDCListPending && !isGarnishmentsPending) {
      const filteredArr = APData?.expense_accounts?.filter((acc: any) => {
        if (acc?.payroll_accounting_preferences_type == 'OTHER_LIABILITY_ASSETS_TYPE') {
          return acc;
        }
      });

      const finalArray = filteredArr?.map((acc: any) => {
        if (acc?.employee_garnishment?.uid) {
          return {
            ...acc,
            employee_garnishment: acc?.employee_garnishment?.uid,
            // kind: "GARNISHMENT",
          };
        } else if (acc?.deduction_and_contribution?.uid) {
          return {
            ...acc,
            deduction_and_contribution: acc?.deduction_and_contribution?.uid,
            // kind: "DEDUCTION_AND_CONTRIBUTION",
          };
        }
      });

      const formattedGarnishment = garnishments?.map((g: any) => {
        return {
          employee_garnishment: g?.uid, // for last options
          account_type: g?.description ? g?.description?.split(' ')?.join('_')?.toUpperCase() : '',
          // kind: "GARNISHMENT",
          expense_account: '',
          payroll_accounting_preferences_type: 'OTHER_LIABILITY_ASSETS_TYPE',
        };
      });
      const formattedDC = DCList?.map((d: any) => {
        return {
          deduction_and_contribution: d?.uid, // for last options
          account_type: d?.title ? d?.title?.split(' ')?.join('_')?.toUpperCase() : '',
          expense_account: '',
          // kind: "DEDUCTION_AND_CONTRIBUTION",
          payroll_accounting_preferences_type: 'OTHER_LIABILITY_ASSETS_TYPE',
        };
      });

      const filteredGarnishments = formattedGarnishment?.filter((acc: any) => {
        const findOne = finalArray?.find(
          (arr: any) => arr?.employee_garnishment == acc?.employee_garnishment
        );
        if (!findOne?.uid) {
          return acc;
        }
      });
      const filteredDC = formattedDC?.filter((acc: any) => {
        const findOne = finalArray?.find(
          (arr: any) => arr?.deduction_and_contribution == acc?.deduction_and_contribution
        );
        if (!findOne?.uid) {
          return acc;
        }
      });

      // Step 1: reduce to unique by account_type
      const combined = [
        ...(finalArray?.length ? finalArray : []),
        ...filteredGarnishments,
        ...filteredDC,
      ];
      setOtherLiabilitiesAccounts(combined);
    }
  }, [APData, isDCListPending, isGarnishmentsPending, garnishments, DCList]);

  const handleApply = async () => {
    const expense_account_components = OtherLiabilitiesAccounts?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          ...acc,
          uid: acc?.uid,
          payroll_accounting_preferences_type: 'OTHER_LIABILITY_ASSETS_TYPE',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          ...acc,
          payroll_accounting_preferences_type: 'OTHER_LIABILITY_ASSETS_TYPE',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        expense_account_components: expenseAccounts,
      };
      if (APData?.uid) {
        data.uid = APData?.uid;
      }
      setIsPending(true);
      const res = await postAccountingPreference(data);
      if (res?.success) {
        setIsOpen(false);
        refetch();
        toast.success('Account updated.');
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  if (isDCListPending || isGarnishmentsPending) {
    return (
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
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800">Other Liability and assets</h2>
            <div className="mt-1 text-sm text-gray-600">Health Insurance</div>
            <div className="mt-1 text-sm text-gray-600">Child/spouse support</div>
          </div>
          <div className="flex-1 text-sm text-gray-500">
            <div>Payroll Liabilities: Health Insurance</div>
            <div>Federal Liabilities: Child/spouse support</div>
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
        title="Other Liabilities/Assets?"
        widthClass="w-full md:w-[550px]"
      >
        <div className="rounded-lg">
          <div className="rounded-lg">
            <div className="mb-6">
              <p className="mb-6 text-sm text-gray-700">
                Which Account do you use for the following liabilities/assets?
              </p>

              <div className="space-y-6">
                {OtherLiabilitiesAccounts.map((emp: any, index: number) => (
                  <div key={index} className="">
                    <p className="mb-1 text-sm capitalize text-black">
                      {emp?.account_type?.split('_').join(' ')}
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

            <div className="mt-7 flex items-center justify-center gap-4">
              <Button
                className="flex w-[142px] cursor-pointer items-center justify-center rounded-lg border border-black py-2.5 text-center font-semibold text-black"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-[142px] bg-black py-2.5 text-white"
                onClick={handleApply}
                isLoading={isPending}
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OtherLiabilities;
