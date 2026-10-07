import Modal from '@/app/(admin)/_components/Modal';
import { fetchChartOfAccount, fetchChartOfAccounts, postTaxPayment } from '@/app/helpers/backend';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/RawButton';
import Input from '@/components/ui/RawInput';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { toast } from '@/lib/ToastService';
import { ArrowDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`;
};

const getTitle = (title: string) => {
  if (title == 'NY Income Tax') {
    return 'Nys Income Tax';
  } else {
    return title;
  }
};

const TaxPayModal = ({
  isOpen,
  setIsOpen,
  data,
  refetch,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  data: any;
  refetch: () => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [taxData, setTaxData] = useState<any>({});

  const getLiabilityAccount = async () => {
    try {
      const res = await fetchChartOfAccounts({
        title: getTitle(data?.tax_type),
      });
      if (res?.results?.length > 0) {
        return res?.results?.[0];
      } else {
        return {};
      }
    } catch (error) {
      return {};
    }
  };

  console.log(data);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setIsPending(true);
      const liabilityAccount = await getLiabilityAccount();
      if (!liabilityAccount?.uid) {
        setIsPending(false);
        return toast.error('Liability Account not found!');
      }
      const payloadData = {
        tax_amount: data?.tax_breakdown?.total_state_taxes,
        tax_liability_account_uid: liabilityAccount?.uid,
        tax_record_account_uid: taxData?.tax_record_account_uid?.uid,
        payment_date: taxData?.payment_date,
        check_number: taxData?.check_number,
        notes: taxData?.notes,

        liability_period_uid: `${data?.period_start}-${data?.period_end}`,
        is_paid: true,
        // "check_number": "",
        // "notes": "",
        // "is_inside_balanzify": "",
      };
      const res = await postTaxPayment(payloadData);
      if (res?.success) {
        setIsOpen(false);
        refetch && refetch();
        toast.success('Tax payment successful.');
      }
    } catch (error) {
      //error
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      widthClass="w-full md:max-w-[550px]"
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      title="Tax Payment"
    >
      {isOpen && data && (
        <div className="px-5 text-sm">
          <h1 className="mb-5 text-base font-light">PAYMENT</h1>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{data?.account_type}</h1>
            <p className="text-xl font-semibold">$ {data?.tax_breakdown?.total_state_taxes}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="flex flex-col text-sm text-gray-700">
              <span className="font-medium">Liability Period</span>
              {data?.period_label}
            </p>
            <p className="flex flex-col text-sm text-gray-700">
              <span className="font-medium">Due Date</span>
              {data?.due_date}
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="my-7 flex w-full items-center justify-between px-4 py-2 hover:bg-gray-100"
            >
              Show breakdown{' '}
              <ChevronUp
                className={`${isExpanded && 'rotate-180'} transition-all duration-300 ease-in-out`}
              />
            </button>
            <div>
              {' '}
              {/* Breakdown Section */}
              {isExpanded && (
                <div
                  className={`border-t border-gray-200 bg-gray-50 transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-full overflow-y-auto' : 'max-h-0 overflow-hidden'}`}
                >
                  <div className="space-y-3 p-4">
                    {/* Federal Tax Breakdown */}
                    {data.tax_breakdown.federal_income_tax !== undefined && (
                      <>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">Federal Income Tax</span>
                          <span className="font-medium text-gray-900">
                            ${data.tax_breakdown.federal_income_tax}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">Social Security</span>
                          <span className="font-medium text-gray-900">
                            ${data.tax_breakdown.social_security}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">Social Security Employer</span>
                          <span className="font-medium text-gray-900">
                            ${data.tax_breakdown.social_security_employer}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">Medicare</span>
                          <span className="font-medium text-gray-900">
                            ${data.tax_breakdown.medicare}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">Medicare Employer</span>
                          <span className="font-medium text-gray-900">
                            ${data.tax_breakdown.medicare_employer}
                          </span>
                        </div>
                      </>
                    )}

                    {/* State Tax Breakdown */}
                    {data.tax_breakdown.state_income_tax !== undefined && (
                      <>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">State Income Tax</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(data.tax_breakdown.state_income_tax)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">State Unemployment Tax</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(data.tax_breakdown.state_unemployment_tax)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">State Disability Tax</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(data.tax_breakdown.state_disability_tax)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded border bg-white px-4 py-2">
                          <span className="text-gray-700">
                            State Employment Security Assessment
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(
                              data.tax_breakdown.state_employment_security_assessment
                            )}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between rounded border-2 border-gray-300 bg-white px-4 py-3 font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        {formatCurrency(
                          data.tax_breakdown.total_federal_taxes ||
                            data.tax_breakdown.total_state_taxes ||
                            0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <hr className="my-5" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="" className="mb-2 block">
                Record to
              </label>
              <AccountSelectDropDown
                required
                setValue={(value: any) => {
                  setTaxData({ ...taxData, tax_record_account_uid: value });
                }}
                filters={{ account_type__title: 'Bank' }}
                ClassName="border rounded-md "
                value={taxData.tax_record_account_uid}
              />
              {taxData.tax_record_account_uid && (
                <p className="mt-1.5 text-sm font-light text-gray-500">
                  Balance: ${taxData?.tax_record_account_uid?.opening_balance}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="" className="mb-2 block">
                Payment Date
              </label>
              <DatePicker
                required={true}
                onChange={(value) => {
                  setTaxData({ ...taxData, payment_date: value });
                }}
                ClassName="w-full rounded-md border "
                value={taxData.payment_date}
              />
            </div>
            <div>
              <label htmlFor="" className="mb-2 block">
                Check number (optional)
              </label>
              <input
                type="text"
                onChange={(e) => {
                  setTaxData({ ...taxData, check_number: e.target.value });
                }}
                className="w-full rounded-md border px-4 py-2.5"
                value={taxData.check_number}
              />
            </div>
            <div>
              <label htmlFor="" className="mb-2 block">
                Note (optional)
              </label>
              <input
                type="text"
                onChange={(e) => {
                  setTaxData({ ...taxData, notes: e.target.value });
                }}
                className="w-full rounded-md border px-4 py-2.5"
                value={taxData.notes}
              />
            </div>
            <div>
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
                  className="w-[142px] bg-black py-2.5 text-white"
                  isLoading={isPending}
                  disabled={isPending}
                >
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default TaxPayModal;
