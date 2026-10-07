import { deleteStateTaxItem } from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { toast } from '@/lib/ToastService';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const UITable = ({
  uid,
  setRenderAgain,
  RenderAgain,
  data,
  setData,
  rows,
  minRate = 0.7825,
  maxRate = 9.825,
}: {
  uid: string;
  setRenderAgain: any;
  RenderAgain: any;
  data: any;
  setData: any;
  rows: any[];
  minRate?: number;
  maxRate?: number;
}) => {
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    setEdit(false);
  }, [RenderAgain]);

  const deleteRow = (dUID: string) => {
    console.log(dUID);
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

  return (
    <div className="my-4 border-y py-7">
      {!edit ? (
        <div>
          <p className="mb-2 font-light text-gray-900">Unemployment Insurance (UI) rate</p>
          <div className="flex items-center gap-4">
            {rows?.[0] && (
              <h1>
                {rows?.[0]?.ui_rate || '_'}% since {rows?.[0]?.effective_date || '_'}{' '}
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
              <label className="text-accent_soft_black">Unemployment Insurance (UI) rate</label>
              <input
                value={data?.ui_rate}
                onChange={(e) => {
                  setData({ ...data, ui_rate: e.target.value });
                }}
                required
                type="number"
                className={`max-w-sm rounded-md border border-gray-300 px-4 py-2 outline-none focus:border-accent_soft_black ${
                  (data?.ui_rate && Number(data?.ui_rate || 0) < minRate) ||
                  Number(data?.ui_rate || 0) > maxRate
                    ? 'border-red-500 bg-red-100 focus:border-red-500'
                    : ''
                }`}
              />
              {(data?.ui_rate && Number(data?.ui_rate || 0) < minRate) ||
              Number(data?.ui_rate || 0) > maxRate ? (
                <p className="text-sm font-light text-red-500">
                  Your rate should be between {minRate} and {maxRate}%
                </p>
              ) : (
                ''
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Effective date</label>
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
                <tr key={index}>
                  <td className="whitespace-nowrap px-4 py-3">{row?.ui_rate}%</td>
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

export default UITable;
