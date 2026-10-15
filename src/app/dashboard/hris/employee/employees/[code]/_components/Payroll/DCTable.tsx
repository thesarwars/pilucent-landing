import {
  deleteEmployeeDCItems,
  fetchEmployeeDCItems,
  fetchEmployeeEarningsItems,
  patchEmployeeDCItems,
  postEmployeeDCItems,
} from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import DedContributionSelect from '@/components/ui/ScrollSelectDropDowns/DedContributionSelect';
import { toast } from '@/lib/ToastService';
import { useQuery } from '@tanstack/react-query';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import Swal from 'sweetalert2';

interface DCItem {
  tax_option: string;
  employee_deduction_kind: string;
  total_employee_deduction_per_pay_check: string;
  total_maximum_annual_employee_deduction: string;
  company_contribution_kind: string;
  total_company_contribution_per_pay_check: string;
  total_maximum_annual_company_contribution: string;
  deduction_and_contribution_uid: string;
}

interface DCTableProps {
  uid: string;
  view?: boolean;
}

const DeductionKindChoices = [
  { value: 'FLAT_AMOUNT', title: 'Flat Amount' },
  { value: 'PERCENT_OF_GROSS_PAY', title: 'Percent Of Gross Pay' },
  { value: 'PER_HOUR_WORKED', title: 'Per Hour Worked' },
];

const DCTable: React.FC<DCTableProps> = ({ uid, view = false }) => {
  const [dcItems, setDCItems] = useState<any[]>([]);
  const [RenderAgain, setRenderAgain] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    isPending: isDCPending,
    data: dedC,
    refetch,
  } = useQuery({
    queryKey: ['dc_items', uid],
    queryFn: () => fetchEmployeeDCItems(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!isDCPending && dedC?.results) {
      const DC = dedC?.results?.map((res: any) => {
        return {
          uid: res?.uid,
          tax_option: res?.tax_option,
          employee_deduction_kind: res?.employee_deduction_kind,
          total_employee_deduction_per_pay_check: res?.total_employee_deduction_per_pay_check,
          total_maximum_annual_employee_deduction: res?.total_maximum_annual_employee_deduction,
          company_contribution_kind: res?.company_contribution_kind,
          total_company_contribution_per_pay_check: res?.total_company_contribution_per_pay_check,
          total_maximum_annual_company_contribution: res?.total_maximum_annual_company_contribution,
          deduction_and_contribution_uid: res?.deduction_and_contribution,
        };
      });
      setDCItems(DC);
    }
  }, [isDCPending, dedC, RenderAgain]);

  const handleInputChange = (value: any, field: keyof DCItem, index: number) => {
    const updatedRows = dcItems.map((row, rowIndex) => {
      if (rowIndex === index) {
        if (field === 'deduction_and_contribution_uid') {
          return { ...row, [field]: value, tax_option: value?.tax_type };
        } else {
          return { ...row, [field]: value };
        }
      }
      return row;
    });
    setDCItems(updatedRows);
  };

  const removeLine = (id: number, eUID?: string) => {
    if (eUID) {
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
            const response = await deleteEmployeeDCItems(uid, eUID);
            if (response.success) {
              refetch();
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
            text: 'Has been deleted.',
            icon: 'success',
            color: 'white',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    } else {
      const updatedRows = dcItems.filter((item: any, idx: number) => idx !== id);
      setDCItems(updatedRows);
    }
  };

  const addLine = () => {
    setDCItems([
      ...dcItems,
      {
        tax_option: '',
        employee_deduction_kind: 'FLAT_AMOUNT',
        total_employee_deduction_per_pay_check: '',
        total_maximum_annual_employee_deduction: '',
        company_contribution_kind: 'FLAT_AMOUNT',
        total_company_contribution_per_pay_check: '',
        total_maximum_annual_company_contribution: '',
        deduction_and_contribution_uid: '',
      },
    ]);
  };

  const handleSaveEarning = async () => {
    try {
      setIsUpdating(true);
      const earningsPromises = dcItems?.map((arr: any) =>
        arr?.uid
          ? patchEmployeeDCItems(uid, arr?.uid, {
              tax_option: arr?.tax_option,
              employee_deduction_kind: arr?.employee_deduction_kind,
              total_employee_deduction_per_pay_check:
                arr?.total_employee_deduction_per_pay_check || 0,
              total_maximum_annual_employee_deduction:
                arr?.total_maximum_annual_employee_deduction || 0,
              company_contribution_kind: arr?.company_contribution_kind,
              total_company_contribution_per_pay_check:
                arr?.total_company_contribution_per_pay_check || 0,
              total_maximum_annual_company_contribution:
                arr?.total_maximum_annual_company_contribution || 0,

              deduction_and_contribution_uid: arr?.deduction_and_contribution_uid?.uid,
            })
          : postEmployeeDCItems(uid, {
              employee_deduction_kind: arr?.employee_deduction_kind,
              total_employee_deduction_per_pay_check: arr?.total_employee_deduction_per_pay_check || 0,
              total_maximum_annual_employee_deduction:
                arr?.total_maximum_annual_employee_deduction || 0,
              company_contribution_kind: arr?.company_contribution_kind,
              total_company_contribution_per_pay_check:
                arr?.total_company_contribution_per_pay_check || 0,
              total_maximum_annual_company_contribution:
                arr?.total_maximum_annual_company_contribution || 0,

              tax_option: arr?.tax_option,
              deduction_and_contribution_uid: arr?.deduction_and_contribution_uid?.uid,
            })
      );
      const results = await Promise.allSettled([...earningsPromises]);

      // Check if all requests were successful
      const allSuccess = results.every((res) => res.status === 'fulfilled' && Boolean(res.value));
      if (allSuccess) {
        // setIsUpdating(false);
        refetch();
        setRenderAgain(!RenderAgain);
        toast.success('DC updated.');
        setIsDisabled(true);
      } else {
        refetch();
        setRenderAgain(!RenderAgain);
        // setIsUpdating(false);
        toast.warning('Some items failed to update. Please Check.');
      }
    } catch (error) {
      //
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <div className="mb-8 rounded-lg bg-white p-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-medium">Deductions and Contributions</h3>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-1 text-accent_soft_black transition-colors hover:bg-gray-200"
                >
                  <InfoIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-xs rounded-lg border bg-white px-2 py-2 text-sm text-white shadow-lg"
                sideOffset={5}
              >
                <div className="flex items-start gap-2">
                  <InfoIcon color="#000" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p className="text-left text-[13px] font-light leading-relaxed text-accent_soft_black">
                    These may include health insurance, retirement plans, loan repayments, and more.
                    Learn about deductions and contributions
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          {isDisabled && !view && (
            <Button
              onClick={() => {
                setIsDisabled(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50 py-2">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Deduction/Contribution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employee Deduction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tax Option
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Company Contribution
              </th>
              {!isDisabled && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-x-2 divide-y divide-gray-300 bg-white">
            {dcItems.map((item, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-2 py-1">
                  <DedContributionSelect
                    setValue={(v: any) =>
                      handleInputChange(v, 'deduction_and_contribution_uid', index)
                    }
                    view={isDisabled}
                    parentClassName="max-w-80"
                    value={item?.deduction_and_contribution_uid}
                    ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>
                <td className="px-3 py-1 text-center">
                  <div className="flex flex-row flex-wrap gap-1">
                    <select
                      disabled={isDisabled}
                      value={item.employee_deduction_kind}
                      onChange={(e) =>
                        handleInputChange(e.target.value, 'employee_deduction_kind', index)
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    >
                      {DeductionKindChoices.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.title}
                        </option>
                      ))}
                    </select>
                    <input
                      disabled={isDisabled}
                      type="number"
                      placeholder="Per Paycheck"
                      value={item.total_employee_deduction_per_pay_check}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'total_employee_deduction_per_pay_check',
                          index
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                    <input
                      disabled={isDisabled}
                      type="number"
                      placeholder="Annual Max"
                      value={item.total_maximum_annual_employee_deduction}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'total_maximum_annual_employee_deduction',
                          index
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                  </div>
                </td>

                <td className="whitespace-nowrap px-2 py-1">
                  <input
                    disabled={true}
                    type="text"
                    placeholder="Tax Option"
                    value={item.tax_option}
                    // onChange={(e) =>
                    //   handleInputChange(e.target.value, "tax_option", index)
                    // }
                    readOnly
                    className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                </td>

                <td className="whitespace-nowrap px-2 py-1">
                  <div className="flex flex-row flex-wrap gap-1">
                    <select
                      disabled={isDisabled}
                      value={item.company_contribution_kind}
                      onChange={(e) =>
                        handleInputChange(e.target.value, 'company_contribution_kind', index)
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    >
                      {DeductionKindChoices.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.title}
                        </option>
                      ))}
                    </select>
                    <input
                      disabled={isDisabled}
                      type="number"
                      placeholder="Per Paycheck"
                      value={item.total_company_contribution_per_pay_check}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'total_company_contribution_per_pay_check',
                          index
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                    <input
                      disabled={isDisabled}
                      type="number"
                      placeholder="Annual Max"
                      value={item.total_maximum_annual_company_contribution}
                      onChange={(e) =>
                        handleInputChange(
                          e.target.value,
                          'total_maximum_annual_company_contribution',
                          index
                        )
                      }
                      className="max-w-40 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                  </div>
                </td>

                {!isDisabled && (
                  <td className="whitespace-nowrap px-6 py-4">
                    <Button variant="ghost" size="sm" onClick={() => removeLine(index, item?.uid)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!isDisabled && (
          <div className="mt-4 flex justify-start space-x-2">
            <Button
              type="button"
              className="rounded-md border border-accent_soft_blue px-7 py-1 text-sm text-accent_soft_blue"
              onClick={addLine}
            >
              Add
            </Button>
          </div>
        )}

        {!isDisabled && (
          <div className="flex items-center justify-end gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveEarning}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCTable;
