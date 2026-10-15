'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/RawButton';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import Modal from '@/app/(admin)/_components/Modal';
import { Pencil } from 'lucide-react';
import ContributionDifferentType from './CompanyContributionExpenses/ContributionDifferent';
import CompanyExpensePerEmp from './CompanyContributionExpenses/PerEmployee';
import { postAccountingPreference } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';

const CompanyExpense = ({ APData, refetch }: { APData: any; refetch: any }) => {
  const [selectedOption, setSelectedOption] = useState<string>(
    'COMPANY_CONTRIBUTION_SINGLE_ACCOUNT'
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [perEmpAccounts, setPerEmpAccounts] = useState<any[]>([]);
  const [differentPerAccounts, setDifferentPerAccounts] = useState<any[]>([
    {
      account_type: 'HEALTH_INSURANCE',
      expense_account: '',
      payroll_accounting_preferences_type: 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE',
    },
  ]);
  const [healthInsuranceAccount, setHealthInsuranceAccount] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  // Define multiple account type titles as comma-separated string
  const accountTypeFilter =
    'Expense,Other Expense,Other Current Liability,Cost of Sold Goods(COGS)';

  useEffect(() => {
    if (APData?.global_contribution_expense_account?.uid) {
      setHealthInsuranceAccount(APData?.global_contribution_expense_account);
    }
    if (APData?.uid) {
      setSelectedOption(APData?.company_contribution_expense_type);
    }
  }, [APData]);

  const handleApply = () => {
    if (selectedOption === 'COMPANY_CONTRIBUTION_SINGLE_ACCOUNT') {
      handleSingleSubmit();
    } else if (selectedOption === 'COMPANY_CONTRIBUTION_PER_EMPLOYEE') {
      handlePerEmployeeSubmit();
    } else if (selectedOption === 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE') {
      handlePerDifferentTypeSubmit();
    }
  };

  const handleSingleSubmit = async () => {
    try {
      setIsPending(true);

      const data: any = {
        global_contribution_expense_account_uid: healthInsuranceAccount?.uid,
        company_contribution_expense_type: 'COMPANY_CONTRIBUTION_SINGLE_ACCOUNT',
      };
      if (APData?.uid) {
        data.uid = APData?.uid;
      }
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

  const handlePerEmployeeSubmit = async () => {
    const expense_account_components = perEmpAccounts?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          employee: acc?.employee?.uid,
          expense_account: acc?.expense_account?.uid,
          payroll_accounting_preferences_type: 'COMPANY_CONTRIBUTION_PER_EMPLOYEE',
        };
      } else {
        return {
          employee: acc?.employee?.uid,
          expense_account: acc?.expense_account?.uid,
          payroll_accounting_preferences_type: 'COMPANY_CONTRIBUTION_PER_EMPLOYEE',
        };
      }
    });

    try {
      const data: any = {
        company_contribution_expense_type: 'COMPANY_CONTRIBUTION_PER_EMPLOYEE',
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

  const handlePerDifferentTypeSubmit = async () => {
    const expense_account_components = differentPerAccounts?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        company_contribution_expense_type: 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE',
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

  return (
    <div className="w-full">
      {/* Company Contribution Expense Accounts */}
      <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800">
              Company Contribution Expense Accounts
            </h2>
            <div className="mt-1 text-sm text-gray-600">Health Insurance</div>
          </div>
          <div className="flex-1 text-sm text-gray-500">
            Payroll Expenses: Company Contributions: Health Insurance
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
        title={'Company Contribution Expense Accounts'}
      >
        <div className="rounded-lg">
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="mb-6">
              <p className="mb-4 text-sm text-gray-700">
                <span className="mr-1 font-medium">1.</span>
                Where do you track employer contributions in your Pilucent chart of accounts?
              </p>

              <div className="space-y-5">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="companyContributionExpense"
                    checked={selectedOption === 'COMPANY_CONTRIBUTION_SINGLE_ACCOUNT'}
                    onChange={() => setSelectedOption('COMPANY_CONTRIBUTION_SINGLE_ACCOUNT')}
                    className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                  />
                  <span className="mt-1 text-sm text-gray-700">
                    Company contributions of the same type are posted to one expense account
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    disabled={true}
                    name="companyContributionExpense"
                    checked={selectedOption === 'COMPANY_CONTRIBUTION_PER_EMPLOYEE'}
                    onChange={() => setSelectedOption('COMPANY_CONTRIBUTION_PER_EMPLOYEE')}
                    className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                  />
                  <span className="mt-1 text-sm text-gray-700">
                    Company contributions for each employee are posted to their own expense account{' '}
                    <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                      (Coming Soon)
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    disabled={true}
                    name="companyContributionExpense"
                    checked={selectedOption === 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE'}
                    onChange={() => setSelectedOption('COMPANY_CONTRIBUTION_DIFFERENT_TYPE')}
                    className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                  />
                  <span className="mt-1 text-sm text-gray-700">
                    Company contributions of different type are posted to different accounts (ex:
                    salary, contractor, and so on){' '}
                    <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                      (Coming Soon)
                    </span>
                  </span>
                </label>
              </div>
            </div>{' '}
            {selectedOption == 'COMPANY_CONTRIBUTION_SINGLE_ACCOUNT' && (
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Health Insurance Accounts</p>
                <AccountSelectDropDown
                  ClassName="border-b-2 focus:border-accent_soft_blue"
                  parentClassName=""
                  setValue={setHealthInsuranceAccount}
                  filters={{
                    status: 'ACTIVE',
                    account_type__title: accountTypeFilter,
                  }}
                  value={healthInsuranceAccount}
                />
              </div>
            )}
            {selectedOption == 'COMPANY_CONTRIBUTION_PER_EMPLOYEE' && (
              <CompanyExpensePerEmp
                APData={APData}
                perEmpAccounts={perEmpAccounts}
                setPerEmpAccounts={setPerEmpAccounts}
              />
            )}
            {selectedOption == 'COMPANY_CONTRIBUTION_DIFFERENT_TYPE' && (
              <ContributionDifferentType
                APData={APData}
                data={differentPerAccounts}
                setData={setDifferentPerAccounts}
              />
            )}
            <div className="mt-7 flex items-center justify-center gap-4">
              <Button
                type="button"
                className="flex w-[142px] cursor-pointer items-center justify-center rounded-lg border border-black py-2.5 text-center font-semibold text-black transition-all hover:bg-accent_soft_black hover:text-white"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="w-[142px] bg-black py-2.5 text-white"
                type="button"
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

export default CompanyExpense;
