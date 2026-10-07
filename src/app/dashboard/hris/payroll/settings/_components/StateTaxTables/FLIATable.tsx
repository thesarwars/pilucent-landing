import { deleteFederalPaySchedule, deleteStateTaxItem } from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const FLIATable = ({
  isWorkforce = false,
  uid,
  setRenderAgain,
  RenderAgain,
  data,
  setData,
  rows,
}: {
  isWorkforce?: boolean;
  uid: string;
  setRenderAgain: any;
  RenderAgain: any;
  data: any;
  setData: any;
  rows: any[];
}) => {
  const [edit, setEdit] = useState(false);

  const deleteRow = (dUID: string) => {
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
          <p className="mb-2 font-light text-gray-900">Federal Loan Interest Assessment rate</p>
          <div className="flex items-center gap-4">
            {rows?.[0] && (
              <h1>
                {rows?.[0]?.reemployment_or_workforce_fund_rate || '_'}% since{' '}
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
                Federal Loan Interest Assessment rate
                <span className="text-base text-red-500">*</span>
              </label>
              <select
                value={data.ui_rate}
                onChange={(e) =>
                  setData({
                    ...data,
                    ui_rate: e.target.value,
                  })
                }
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                <option value="">Select one</option>
                <option value={0}>0%</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                Effective date
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                value={data?.effective_date}
                onChange={(e) => setData({ ...data, effective_date: e.target.value })}
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
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Tax Rate
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
                <tr key={row}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {row?.reemployment_or_workforce_fund_rate}%
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">{row?.effective_date}</td>

                  <td className="whitespace-nowrap px-6 py-3">
                    <Button onClick={() => deleteRow(row?.uid)}>
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

export default FLIATable;
