'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/RawButton';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import Modal from '@/app/(admin)/_components/Modal';
import { Pencil } from 'lucide-react';
import PerWageEmployeeForm from './PerWageEmployeeForm';
import PerWageTypeForm from './PerWageTypeForm';
import { postAccountingPreference } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';

interface WageExpensesProps {
  APData: any;
  refetch: any;
}

const WageExpenses: React.FC<WageExpensesProps> = ({ APData, refetch }) => {
  const [selectedOption, setSelectedOption] = useState('SINGLE_WAGE_ACCOUNT');
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [globalWAccount, setGlobalWAccount] = useState<any>(null);
  const [perEmpAccounts, setPerEmpAccounts] = useState<any[]>([]);
  const [perWageTypes, setPerWageTypes] = useState<any[]>([
    {
      account_type: 'SALARY',
      expense_account: '',
      payroll_accounting_preferences_type: 'PER_WAGE_TYPE',
    },
    {
      account_type: 'REGULAR_PAY',
      expense_account: '',
      payroll_accounting_preferences_type: 'PER_WAGE_TYPE',
    },
    {
      account_type: 'OVERTIME_PAY',
      expense_account: '',
      payroll_accounting_preferences_type: 'PER_WAGE_TYPE',
    },
    {
      account_type: 'SPECIAL_PAY',
      expense_account: '',
      payroll_accounting_preferences_type: 'PER_WAGE_TYPE',
    },
  ]);

  // Define multiple account type titles as comma-separated string
  const accountTypeFilter =
    'Expense,Other Expense,Other Current Liability,Cost of Sold Goods(COGS)';

  const handleApply = () => {
    if (selectedOption === 'SINGLE_WAGE_ACCOUNT') {
      handleSingleWageSubmit();
    } else if (selectedOption === 'PER_WAGE_EMPLOYEE') {
      handlePerWageEmployeeSubmit();
    } else if (selectedOption === 'PER_WAGE_TYPE') {
      handlePerWageTypeSubmit();
    }
  };

  useEffect(() => {
    if (APData?.global_wage_account?.uid) {
      setGlobalWAccount(APData?.global_wage_account);
    }
    if (APData?.uid) {
      setSelectedOption(APData?.wage_expense_type);
    }
  }, [APData]);

  const handleSingleWageSubmit = async () => {
    try {
      setIsPending(true);

      const data: any = {
        global_wage_account_uid: globalWAccount?.uid,
        wage_expense_type: 'SINGLE_WAGE_ACCOUNT',
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

  const handlePerWageEmployeeSubmit = async () => {
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
          payroll_accounting_preferences_type: 'PER_WAGE_EMPLOYEE',
        };
      } else {
        return {
          employee: acc?.employee?.uid,
          expense_account: acc?.expense_account?.uid,
          payroll_accounting_preferences_type: 'PER_WAGE_EMPLOYEE',
        };
      }
    });

    try {
      const data: any = {
        wage_expense_type: 'PER_WAGE_EMPLOYEE',
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

  const handlePerWageTypeSubmit = async () => {
    const expense_account_components = perWageTypes?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'PER_WAGE_TYPE',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'PER_WAGE_TYPE',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        wage_expense_type: 'PER_WAGE_TYPE',
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
    <div>
      <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800">Wage Expenses</h2>
            <div className="mt-1 text-sm text-gray-600">Wage Account</div>
          </div>
          <div className="flex-1 text-sm text-gray-600">Payroll Expenses: Wages</div>
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
        title="Wage Expenses"
      >
        <div className="w-full">
          <div className="">
            <div className="">
              <div className="mb-6">
                <p className="mb-4 text-lg text-gray-900">
                  <span className="mr-1 font-medium">1.</span> Where do you track employee wages in
                  your Pilucent chart of accounts?
                </p>

                <div className="space-y-5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="wageTracking"
                      // value="SINGLE_WAGE_ACCOUNT"
                      checked={selectedOption === 'SINGLE_WAGE_ACCOUNT'}
                      onChange={() => setSelectedOption('SINGLE_WAGE_ACCOUNT')}
                      className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                    />
                    <span className="mt-1 text-sm text-gray-700">
                      All my employee's wages are posted to one expense account
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      disabled={true}
                      name="wageTracking"
                      // value="PER_WAGE_EMPLOYEE"
                      checked={selectedOption === 'PER_WAGE_EMPLOYEE'}
                      onChange={() => setSelectedOption('PER_WAGE_EMPLOYEE')}
                      className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                    />
                    <span className="mt-1 text-sm text-gray-700">
                      Each employee's wages are posted to their own expense account{' '}
                      <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                        (Coming Soon)
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      disabled={true}
                      name="wageTracking"
                      // value="PER_WAGE_TYPE"
                      checked={selectedOption === 'PER_WAGE_TYPE'}
                      onChange={() => setSelectedOption('PER_WAGE_TYPE')}
                      className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                    />
                    <span className="mt-1 text-sm text-gray-700">
                      Each employee's wages are posted to different types of accounts (ex: salary,
                      contractor and so on){' '}
                      <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                        (Coming Soon)
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {selectedOption === 'SINGLE_WAGE_ACCOUNT' && (
                <div className="mt-6">
                  <p className="mb-2 text-sm text-gray-700">Wage Account</p>
                  <AccountSelectDropDown
                    ClassName="border rounded-md focus:border-accent_soft_blue"
                    parentClassName=""
                    setValue={setGlobalWAccount}
                    filters={{
                      status: 'ACTIVE',
                      account_type__title: accountTypeFilter,
                    }}
                    value={globalWAccount}
                  />
                </div>
              )}

              {selectedOption === 'PER_WAGE_EMPLOYEE' && (
                <PerWageEmployeeForm
                  APData={APData}
                  perEmpAccounts={perEmpAccounts}
                  setPerEmpAccounts={setPerEmpAccounts}
                />
              )}
              {selectedOption === 'PER_WAGE_TYPE' && (
                <PerWageTypeForm
                  APData={APData}
                  perWageTypes={perWageTypes}
                  setPerWageTypes={setPerWageTypes}
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
        </div>
      </Modal>
    </div>
  );
};

export default WageExpenses;
