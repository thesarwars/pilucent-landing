'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/RawButton';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import Modal from '@/app/(admin)/_components/Modal';
import { Pencil } from 'lucide-react';
import LiabilityDifferentTaxGroup from './TaxLiability/DifferentTaxGroup';
import LiabilityDifferentTaxItems from './TaxLiability/DifferentTax';
import { postAccountingPreference } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';

interface TaxLiabilitiesProps {
  refetch: any;
  APData: any;
  states: any;
  isAPPending: any;
}

const TaxLiabilities: React.FC<TaxLiabilitiesProps> = ({
  refetch,
  APData,
  states,
  isAPPending,
}) => {
  const [selectedOption, setSelectedOption] = useState('DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP');
  const [differentLiabilityTax, setDifferentLiabilityTax] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [differentLiabilityTaxGroup, setDifferentLiabilityTaxGroup] = useState<any[]>([]);
  // Define multiple account type titles as comma-separated string

  useEffect(() => {
    if (APData?.uid) {
      setSelectedOption(APData?.tax_liability_expense_type);
    }
  }, [APData]);

  const handleApply = () => {
    if (selectedOption === 'DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP') {
      handleSubmitDifferentLiabilityTaxGroup();
    }
    if (selectedOption === 'DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS') {
      handleSubmitDifferentLiabilityTaxItems();
    }
  };

  const handleSubmitDifferentLiabilityTaxGroup = async () => {
    const expense_account_components = differentLiabilityTaxGroup?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        tax_liability_expense_type: 'DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP',
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

  const handleSubmitDifferentLiabilityTaxItems = async () => {
    const expense_account_components = differentLiabilityTax?.filter((acc) => {
      if (acc?.expense_account?.uid) {
        return acc;
      }
    });
    const expenseAccounts = expense_account_components?.map((acc) => {
      if (acc?.uid) {
        return {
          uid: acc?.uid,
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS',
          expense_account: acc?.expense_account?.uid,
        };
      } else {
        return {
          account_type: acc?.account_type,
          payroll_accounting_preferences_type: 'DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS',
          expense_account: acc?.expense_account?.uid,
        };
      }
    });

    try {
      const data: any = {
        tax_liability_expense_type: 'DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS',
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
      <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
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
        title=""
        widthClass="w-full md:w-[550px]"
      >
        <div className="rounded-lg">
          <div className="rounded-lg">
            <div className="mb-6">
              <p className="mb-4 text-sm text-gray-700">
                <span className="mr-1 font-medium">2.</span> Where do you track employer taxes that
                you owe liabilities in your Balanzify Chart of Accounts?
              </p>

              <div className="space-y-5">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="taxLiabilities"
                    checked={selectedOption == 'DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP'}
                    onChange={() => setSelectedOption('DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP')}
                    className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                  />
                  <span className="mt-1 text-sm text-gray-700">
                    Tax liabilities are posted to different accounts for different Tax Groups
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    disabled={true}
                    name="taxLiabilities"
                    checked={selectedOption == 'DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS'}
                    onChange={() => setSelectedOption('DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS')}
                    className="mt-1 h-4 w-4 cursor-pointer accent-indigo-600"
                  />
                  <span className="mt-1 text-sm text-gray-700">
                    Tax liabilities are posted to different accounts for different Tax Items{' '}
                    <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                      (Coming Soon)
                    </span>
                  </span>
                </label>
              </div>

              {selectedOption === 'DIFFERENT_LIABILITY_DIFFERENT_TAX_GROUP' && (
                <LiabilityDifferentTaxGroup
                  isAPPending={isAPPending}
                  APData={APData}
                  states={states}
                  data={differentLiabilityTaxGroup}
                  setData={setDifferentLiabilityTaxGroup}
                />
              )}
            </div>

            {selectedOption === 'DIFFERENT_LIABILITY_DIFFERENT_TAX_ITEMS' && (
              <LiabilityDifferentTaxItems
                isAPPending={isAPPending}
                states={states}
                APData={APData}
                data={differentLiabilityTax}
                setData={setDifferentLiabilityTax}
              />
            )}

            <div className="mt-7 flex items-center justify-center gap-4">
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

export default TaxLiabilities;
