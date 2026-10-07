import { deleteFederalPaySchedule, deleteStateTaxItem } from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const FrequencyChoices = [
  { value: 'SEMI_WEEKLY', title: 'Semi-Weekly (Recommended)' },
  { value: 'MONTHLY', title: 'Monthly' },
  { value: 'QUARTERLY', title: 'Quarterly' },
  { value: 'ANNUALLY', title: 'Annually' },
  { value: '3_DAYS_AFTER_PAYROLL', title: '3 Days after Payroll' },
  { value: '5_DAYS_AFTER_PAYROLL', title: '5 Days after Payroll' },
];

const PaySchedulesTable = ({
  uid,
  newRow,
  setNewRow,
  rows,
  RenderAgain,
  setRenderAgain,
  frequencyChoices = FrequencyChoices,
}: {
  uid: string;
  newRow: any;
  setNewRow: any;
  rows: any[];
  RenderAgain: any;
  setRenderAgain: any;
  frequencyChoices?: { value: string; title: string }[];
}) => {
  const [edit, setEdit] = useState(false);

  const DeletePaySchedule = (dUID: string) => {
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
          const response = await deleteStateTaxItem(dUID);
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

  useEffect(() => {
    setEdit(false);
  }, [RenderAgain]);

  return (
    <div className="my-4 border-y py-7">
      {!edit ? (
        <div>
          <p className="mb-2 font-light text-gray-900">How often do you pay your taxes?</p>
          <div className="flex items-center gap-4">
            {rows?.[0] && (
              <h1>
                {rows?.[0]?.payment_frequency?.split('_')?.join(' ') || '_'} since{' '}
                {rows?.[0]?.effective_date || '_'}{' '}
              </h1>
            )}
            <Button
              onClick={() => setEdit(true)}
              className="py-2 text-sm text-accent_soft_blue hover:bg-gray-200"
            >
              {rows?.[0] ? 'Edit' : 'Add'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="h-full max-w-2xl rounded-lg">
          <div className="mb-2 flex items-center justify-start gap-7">
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                How often do you pay your taxes?
                <span className="text-base text-red-500">*</span>
              </label>
              <select
                value={newRow.payment_frequency}
                onChange={(e) =>
                  setNewRow({
                    ...newRow,
                    payment_frequency: e.target.value,
                  })
                }
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                <option value="">Select one</option>
                {frequencyChoices?.map((option) => {
                  return (
                    <option value={option.value} key={option.value}>
                      {option.title}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                Effective date
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                value={newRow?.effective_date}
                onChange={(e) => setNewRow({ ...newRow, effective_date: e.target.value })}
                type="date"
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-accent_soft_black"
              />
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200 overflow-x-auto border">
            <thead className="bg-gray-50 py-2">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Payment Schedule
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Effective date
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-6 py-4">
                    {row.payment_frequency?.split('_')?.join(' ')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{row.effective_date}</td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <Button onClick={() => DeletePaySchedule(row?.uid)}>
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
  );
};

export default PaySchedulesTable;
