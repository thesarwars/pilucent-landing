import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import {
  deleteFederalPaySchedule,
  fetchFederalTaxSettings,
  fetchGeneralTaxSettings,
  patchFederalTaxSettings,
  patchGeneralTaxSettings,
  postFederalPaySchedule,
  postFederalTaxSettings,
  postGeneralTaxSettings,
} from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { USStates } from '@/lib/helpers/UsaStates';
import { toast } from '@/lib/ToastService';
import { Pencil, SquarePen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { FormEvent, useEffect, useState } from 'react';
import DotSpinner from '../../../employee/employees/_components/dot-spinner';
import { getYearOptions } from '@/utils/EffectiveDateYear';
import Swal from 'sweetalert2';
import { useFetch } from '@/app/helpers/hooks';

const FrequencyChoices = {
  FORM_941_EACH_QUARTER: [
    { key: 'SEMI_WEEKLY', value: 'Semi-Weekly (Recommended)' },
    {
      key: 'MONTHLY',
      value: 'Monthly',
    },
    {
      key: 'QUARTERLY',
      value: 'Quarterly',
    },
  ],
  FORM_943_EACH_YEAR: [
    { key: 'SEMI_WEEKLY', value: 'Semi-Weekly (Recommended)' },
    {
      key: 'MONTHLY',
      value: 'Monthly',
    },
    {
      key: 'ANNUALLY',
      value: 'Annually',
    },
  ],
  FORM_944_EACH_YEAR: [
    { key: 'SEMI_WEEKLY', value: 'Semi-Weekly' },
    {
      key: 'MONTHLY',
      value: 'Monthly',
    },
    {
      key: 'ANNUALLY',
      value: 'Annually',
    },
  ],
};

const formChoices = [
  {
    key: 'FORM_941_EACH_QUARTER',
    value: 'Form 941 each quarter (most common)',
  },
  {
    key: 'FORM_943_EACH_YEAR',
    value: 'Form 943 each year (agricultural)',
  },
  {
    key: 'FORM_944_EACH_YEAR',
    value: 'Form 944 each year',
  },
];

const FederalTaxSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [RenderAgain, setRenderAgain] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isEdit1, setIsEdit1] = useState(false);
  const [isEdit2, setIsEdit2] = useState(false);
  const [federalData, setFederalData] = useState({
    tax_form: '',
    payment_frequency: '',
    effective_date: '',
  });
  const [data, setData] = useState({
    ein_number: '',
    federal_item: [] as any,
    uid: '',
  });

  const { data: generalTaxData, isPending: isGeneralTaxPending } = useFetch(
    ['general_tax'],
    fetchGeneralTaxSettings
  );

  const Reset = () => {
    setRenderAgain(!RenderAgain);
    setIsEdit1(false);
    setIsEdit2(false);
    setIsOpen(false);
    setFederalData({
      tax_form: '',
      payment_frequency: '',
      effective_date: '',
    });
  };

  useEffect(() => {
    if (generalTaxData?.results?.[0]?.uid && !isGeneralTaxPending) {
      setData({
        ...data,
        ein_number: generalTaxData?.results?.[0]?.ein_number,
      });
    }
  }, [generalTaxData, isGeneralTaxPending]);

  const handleSubmit = async () => {
    try {
      setIsPending(true);
      if (data?.uid) {
        const res = await patchFederalTaxSettings(data?.uid, {
          ...data,
        });
        if (federalData.effective_date && federalData.payment_frequency && federalData.tax_form) {
          const res = await postFederalPaySchedule(data?.uid, {
            ...federalData,
            payroll_federal_tax_info_uid: data?.uid,
          });
        }
        if (res?.success) {
          toast.success('Federal tax settings updated.');
          Reset();
        }
      } else {
        const res = await postFederalTaxSettings({
          ...data,
          federal_items: [federalData],
        });
        if (res?.success) {
          toast.success('Federal tax settings created.');
          Reset();
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const res = await fetchFederalTaxSettings();
        if (res?.[0]?.uid) {
          console.log('hello federal');
          setData({
            ...data,
            ...res?.[0],
          });
        }
      } catch (error) {
        //err
      } finally {
        setIsLoading(false);
      }
    };
    fn();
  }, [RenderAgain]);

  const DeletePaySchedule = (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      timerProgressBar: true,
      timer: 20000,
      theme: 'dark',
      background: '#181640a1',
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteFederalPaySchedule(data?.uid, uid);
          if (response.success) {
            setRenderAgain(!RenderAgain);
            return response;
          }
          throw new Error('Failed');
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          background: '#181640',
          title: 'Success!',
          text: 'Pay schedule has been deleted.',
          icon: 'success',
          color: 'white',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div>
      <div className="border-b border-gray-200 bg-white/60 transition-all duration-300 hover:border-accent_soft_blue hover:bg-gray-100">
        <div className="grid grid-cols-2 px-4 py-7">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-accent_soft_black">Federal Tax</h2>
            <p className="flex-1 text-sm text-accent_soft_black">
              Federal Employer Identification Number, deposit schedule, and filing requirement
            </p>
          </div>
          <div className="flex items-end justify-end">
            <Button
              onClick={() => setIsOpen(true)}
              className="px-3 py-3 text-accent_soft_black hover:bg-gray-200"
            >
              <Pencil className="size-[18px]" />
            </Button>
          </div>
        </div>
      </div>
      <PDFModal
        isPadding={false}
        isOpen={isOpen}
        onClose={() => Reset()}
        title="Federal Tax Settings"
        bgClass="bg-accent_bluish_gray"
      >
        {(isLoading || isPending) && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-white/60 bg-opacity-50">
            <DotSpinner />
          </div>
        )}{' '}
        <div className="text-sm">
          <div className="px-7 py-7">
            {' '}
            <h2 className="text-3xl font-semibold text-accent_soft_black">Federal tax info</h2>
            <p className="text-sm text-accent_soft_black">
              You can find what you need in letters and tax notices you've received from the IRS.
            </p>
          </div>
          <div
            className="flex h-screen flex-col rounded-lg bg-white/60 shadow"
            onSubmit={handleSubmit}
          >
            <div className="h-full flex-1 overflow-y-auto px-8">
              <div className="mb-8 space-y-2">
                <div className="py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-accent_soft_black">
                      Employer Identification Number (EIN)
                      <span className="text-base text-red-500">*</span>
                    </label>
                    <div>
                      <input
                        maxLength={50}
                        type="text"
                        disabled={!isEdit1}
                        value={data?.ein_number}
                        onChange={(e) => setData({ ...data, ein_number: e.target.value })}
                        required
                        className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                      />
                      <Button
                        onClick={() => setIsEdit1(true)}
                        className="ml-1 px-5 py-2 text-sm text-accent_soft_blue hover:bg-gray-200"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-4 border-y py-7">
                {!isEdit2 ? (
                  <div>
                    <p className="mb-2 font-light text-gray-900">
                      How often do you pay your taxes?
                    </p>
                    <div className="flex items-center gap-4">
                      {data?.federal_item?.[0] && (
                        <h1 className="lowercase">
                          {data?.federal_item?.[0]?.tax_form?.split('_')?.join(' ')}, paying{' '}
                          {data?.federal_item?.[0]?.payment_frequency} since{' '}
                          {data?.federal_item?.[0]?.effective_date}{' '}
                        </h1>
                      )}
                      <Button
                        onClick={() => setIsEdit2(true)}
                        className="py-2 text-sm text-accent_soft_blue hover:bg-gray-200"
                      >
                        {data?.federal_item?.[0] ? 'Edit' : 'Add'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full max-w-2xl rounded-lg">
                    <div className="mb-4 flex flex-col items-start justify-start gap-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-accent_soft_black">
                          Which payroll tax form do you file with the IRS?
                          <span className="text-base text-red-500">*</span>
                        </label>
                        <select
                          value={federalData.tax_form}
                          onChange={(e) =>
                            setFederalData({
                              ...federalData,
                              tax_form: e.target.value,
                            })
                          }
                          required
                          className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                        >
                          <option value="">Select one</option>
                          {formChoices?.map((option) => {
                            return (
                              <option value={option.key} key={option.key}>
                                {option.value}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-accent_soft_black">
                          How often do you pay your taxes?
                          <span className="text-base text-red-500">*</span>
                        </label>
                        <select
                          value={federalData.payment_frequency}
                          onChange={(e) =>
                            setFederalData({
                              ...federalData,
                              payment_frequency: e.target.value,
                            })
                          }
                          required
                          className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                        >
                          <option value="">Select one</option>
                          {FrequencyChoices[
                            federalData.tax_form as keyof typeof FrequencyChoices
                          ]?.map((option) => {
                            return (
                              <option value={option.key} key={option.key}>
                                {option.value}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-accent_soft_black">
                            Effective date
                            <span className="text-base text-red-500">*</span>
                          </label>
                          <select
                            value={federalData.effective_date}
                            onChange={(e) =>
                              setFederalData({
                                ...federalData,
                                effective_date: e.target.value,
                              })
                            }
                            required
                            className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                          >
                            <option value="">Select one</option>
                            {getYearOptions()?.map((option) => {
                              return (
                                <option value={option.value} key={option.value}>
                                  {option.label}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 overflow-x-auto border text-sm">
                      <thead className="py-2">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                          >
                            Tax Rate
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                          >
                            Payment Schedule
                          </th>
                          <th
                            scope="col"
                            className="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                          >
                            Effective date
                          </th>

                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white/60">
                        {data?.federal_item?.map((federal: any, index: any) => (
                          <tr key={index} className="">
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-light">
                              {federal?.tax_form?.split('_')?.join(' ')}
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 font-light">
                              {federal?.payment_frequency?.split('_')?.join(' ')}{' '}
                              {index == 0 ? '(Current schedule)' : ''}
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 font-light">
                              {federal?.effective_date}
                            </td>

                            <td className="whitespace-nowrap px-6 py-3">
                              <Button
                                className="hover:bg-gray-200"
                                onClick={() => DeletePaySchedule(federal?.uid)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div
              style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.1)' }}
              className="sticky bottom-0 left-0 right-0 mt-8 flex w-full justify-between space-x-4 border-t bg-white/60 px-7 py-4"
            >
              <Button
                type="button"
                className="rounded border border-accent_soft_black px-12 py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
                onClick={() => {
                  Reset();
                }}
              >
                Cancel
              </Button>
              <Button
                isLoading={isPending}
                disabled={isPending}
                onClick={handleSubmit}
                className="rounded bg-accent_soft_black px-12 py-2 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </PDFModal>
    </div>
  );
};

export default FederalTaxSettings;
