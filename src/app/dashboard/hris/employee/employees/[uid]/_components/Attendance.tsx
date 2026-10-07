import { patchEmployee } from '@/app/helpers/backend';
import LogoLoader from '@/components/MainLoader/logo-loader';
import Button from '@/components/ui/RawButton';
import HolidaySelectDropdown from '@/components/ui/ScrollSelectDropDowns/HolidaySelectDropdown';
import ShiftSelectDropdown from '@/components/ui/ScrollSelectDropDowns/ShiftSelectDropdown';
import { toast } from '@/lib/ToastService';
import React, { FormEvent, useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';

const Attendance = ({
  view = false,
  Employee,
  isPending,
  refetch,
  uid = '',
}: {
  view?: boolean;
  Employee: any;
  isPending?: boolean;
  refetch?: any;
  uid?: string;
}) => {
  const [data, setData] = useState<any>({});
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [RenderAgain, setRenderAgain] = useState(false);

  useEffect(() => {
    if (!isPending && Employee) {
      setData({
        ...Employee,
        shift_uid: Employee?.shift,
        holiday_uid: Employee?.holiday,
      });
    }
  }, [isPending, Employee, RenderAgain]);

  const UpdateEmployee = async (formData: FormData, preToast = 'Profile image', next: any) => {
    if (!uid) return toast.error('Employee not found!');
    try {
      setIsUpdating(true);
      const res = await patchEmployee(uid, formData);
      if (res?.success) {
        toast.success(`${preToast} updated`);
        refetch && refetch();
        next();
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAttendance = () => {
    const formData = new FormData();
    formData.append('attendance_device_id', data?.attendance_device_id);
    formData.append('shift_uid', data?.shift_uid?.uid);
    formData.append('holiday_uid', data?.holiday_uid?.uid);
    UpdateEmployee(formData, 'Attendance info', () => setIsDisabled(true));
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LogoLoader size={120} color={'#16151c'} />
      </div>
    );
  }
  return (
    <div className="text-sm">
      <div className="rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Attendance Info</h1>

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
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Attendance Device ID</label>
            <input
              disabled={isDisabled}
              maxLength={40}
              type="text"
              value={data?.attendance_device_id}
              onChange={(e) =>
                setData({
                  ...data,
                  attendance_device_id: e.target.value,
                })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Holiday</label>
            <HolidaySelectDropdown
              view={isDisabled}
              value={data?.holiday_uid}
              setValue={(v: any) => setData({ ...data, holiday_uid: v })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Shift</label>
            <ShiftSelectDropdown
              view={isDisabled}
              value={data?.shift_uid}
              setValue={(value: any) => setData({ ...data, shift_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {!isDisabled && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveAttendance}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
