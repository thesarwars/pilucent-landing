'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/RawButton';
import { Pencil, X } from 'lucide-react';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import Modal from '@/app/(admin)/_components/Modal';
import EmployerPerEmpTax from './EmployeerTaxExpense/PerEmployee';
import EmployerDifferentTaxGroup from './EmployeerTaxExpense/DifferentTaxGroup';
import DifferentExpenseTax from './EmployeerTaxExpense/DifferentExpenseTax';
import { postAccountingPreference } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
// import { ALL_PROFILES } from "@/app/dashboard/hris/employee/employee_list/queries"

interface EmployerExpenseProps {
  refetch: any;
  APData: any;
}

const EmployerExpense: React.FC<EmployerExpenseProps> = ({ refetch, APData }) => {
  const [selectedOption, setSelectedOption] = useState<string>('SINGLE_EMPLOYER_TAX_ACCOUNT');
  const [globalAccount, setGlobalAccount] = useState<any>(null);
  const [perEmployeeAccounts, setPerEmployeeAccounts] = useState<any[]>([]);
  const [differentTaxGroups, setDifferentTaxGroups] = useState<any[]>([
    {
      account_type: 'FEDERAL_TAXES_(941/943/944)',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
    },
    {
      account_type: 'FEDERAL_UNEMPLOYMENT_(940)',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
    },
    {
      account_type: 'CA_SUI/ETT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
    },
    {
      account_type: 'NYS_EMPLOYMENT_TAXES',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
    },
  ]);
  const [differentExpenseTax, setDifferentExpenseTax] = useState<any[]>([
    {
      account_type: 'SOCIAL_SECURITY_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'MEDICARE_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'COBRA_PREMIUM_ASSISTANCE',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'HIRE_TAX_CREDIT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'NATIONAL_PAID_SICK_LEAVE_EMPLOYEE',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'NATIONAL_PAID_SICK_LEAVE_FAMILY',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'FAMILY_MEDICAL_LEAVE_EXPANSION_ACT_PAID_LEAVE',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'FMLA_EMPLOYER_HEALTH_PREMIUM',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'CARES_ACT_DEFERRED_FICA_ER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'NATIONAL_PAID_SICK_LEAVE_MEDICARE_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'EMPLOYEE_RETENTION_CREDIT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'NATIONAL_PAID_SICK_LEAVE_SS_EMPLOYER_CREDIT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'FUTA_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'NY_REEMPLOYMENT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'NY_SUI_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'MN_SUI_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'MN_WORKFORCE_DEVELOPMENT_FEE',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'MN_FEDERAL_LOAN_INTEREST_ASSESSMENT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'MN_ADDITIONAL_ASSESSMENT',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'AL_SUI_EMPLOYER',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
    {
      account_type: 'AL_EMPLOYMENT_SECURITY_ASSESSMENT_TAX',
      expense_account: '',
      payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // Define multiple account type titles as comma-separated string
  const accountTypeFilter =
    'Expense,Other Expense,Other Current Liability,Cost of Sold Goods(COGS)';

  useEffect(() => {
    if (APData?.global_employer_tax_expenses?.uid) {
      setGlobalAccount(APData?.global_employer_tax_expenses);
    }
    if (APData?.uid) {
      setSelectedOption(APData?.employer_tax_expense_type);
    }
  }, [APData]);

  const handleApply = () => {
    if (selectedOption === 'SINGLE_EMPLOYER_TAX_ACCOUNT') {
      handleSingleSubmit();
    } else if (selectedOption === 'PER_EMPLOYER_TAX_EXPENSE') {
      handlePerEmployeeSubmit();
    } else if (selectedOption === 'DIFFERENT_TAX_DIFFERENT_GROUP') {
      handleDifferentGroupSubmit();
    } else if (selectedOption == 'DIFFERENT_EXPENSE_DIFFERENT_TAX') {
      handleDifferentExpenseTaxSubmit();
    }
  };

  const handleSingleSubmit = async () => {
    try {
      setIsPending(true);

      const data: any = {
        global_employer_tax_expenses_uid: globalAccount?.uid,
        employer_tax_expense_type: 'SINGLE_EMPLOYER_TAX_ACCOUNT',
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
    const expense_account_components = perEmployeeAccounts?.filter((acc) => {
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
          payroll_accounting_preferences_type: 'PER_EMPLOYER_TAX_EXPENSE',
        };
      } else {
        return {
          employee: acc?.employee?.uid,
          expense_account: acc?.expense_account?.uid,
          payroll_accounting_preferences_type: 'PER_EMPLOYER_TAX_EXPENSE',
        };
      }
    });

    try {
      const data: any = {
        employer_tax_expense_type: 'PER_EMPLOYER_TAX_EXPENSE',
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
  const handleDifferentGroupSubmit = async () => {
    const expense_account_components = differentTaxGroups?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        employer_tax_expense_type: 'DIFFERENT_TAX_DIFFERENT_GROUP',
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
  const handleDifferentExpenseTaxSubmit = async () => {
    const expense_account_components = differentExpenseTax?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        employer_tax_expense_type: 'DIFFERENT_EXPENSE_DIFFERENT_TAX',
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
    <div className="">
      <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-base font-medium text-gray-800">Employer Tax Expenses</h2>
            <div className="mt-1 text-sm text-gray-600">Tax Account</div>
          </div>
          <div className="flex-1 text-sm text-gray-500">Payroll Expenses: Taxes</div>
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
        title="Employer Tax Expenses"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        widthClass="w-full md:w-[550px]"
      >
        <div className="bg-white">
          <div className="">
            <div className="mb-6">
              <p className="mb-4 text-sm text-gray-700">
                Where do you track employer taxes that you have paid (expenses) in your Balanzify
                chart of Accounts
              </p>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    name="taxTracking"
                    checked={selectedOption === 'SINGLE_EMPLOYER_TAX_ACCOUNT'}
                    onChange={() => setSelectedOption('SINGLE_EMPLOYER_TAX_ACCOUNT')}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">
                    All employer taxes are posted to one expense account.
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    disabled={true}
                    name="taxTracking"
                    checked={selectedOption === 'PER_EMPLOYER_TAX_EXPENSE'}
                    onChange={() => setSelectedOption('PER_EMPLOYER_TAX_EXPENSE')}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">
                    Employer taxes are posted to different expense accounts for different employees.{' '}
                    <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                      (Coming Soon)
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    disabled={true}
                    name="taxTracking"
                    checked={selectedOption === 'DIFFERENT_TAX_DIFFERENT_GROUP'}
                    onChange={() => setSelectedOption('DIFFERENT_TAX_DIFFERENT_GROUP')}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">
                    Employer taxes are posted to different expense accounts for different groups of
                    taxes.{' '}
                    <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                      (Coming Soon)
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    name="taxTracking"
                    disabled={true}
                    checked={selectedOption === 'DIFFERENT_EXPENSE_DIFFERENT_TAX'}
                    onChange={() => setSelectedOption('DIFFERENT_EXPENSE_DIFFERENT_TAX')}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">
                    Employer taxes are posted to different expense account for different tax items.{' '}
                    <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                      (Coming Soon)
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {selectedOption === 'SINGLE_EMPLOYER_TAX_ACCOUNT' && (
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Tax Expenses</p>{' '}
                <AccountSelectDropDown
                  ClassName="border-b-2 focus:border-accent_soft_blue"
                  parentClassName=""
                  setValue={setGlobalAccount}
                  filters={{
                    status: 'ACTIVE',
                    account_type__title: accountTypeFilter,
                  }}
                  value={globalAccount}
                />
              </div>
            )}

            {selectedOption === 'PER_EMPLOYER_TAX_EXPENSE' && (
              <EmployerPerEmpTax
                APData={APData}
                perEmpAccounts={perEmployeeAccounts}
                setPerEmpAccounts={setPerEmployeeAccounts}
              />
            )}

            {selectedOption === 'DIFFERENT_TAX_DIFFERENT_GROUP' && (
              <EmployerDifferentTaxGroup
                APData={APData}
                data={differentTaxGroups}
                setData={setDifferentTaxGroups}
              />
            )}

            {selectedOption === 'DIFFERENT_EXPENSE_DIFFERENT_TAX' && (
              <DifferentExpenseTax
                APData={APData}
                data={differentExpenseTax}
                setData={setDifferentExpenseTax}
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

export default EmployerExpense;
