import { patchEmployee } from '@/app/helpers/backend';
import LogoLoader from '@/components/MainLoader/logo-loader';
import Button from '@/components/ui/RawButton';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import { toast } from '@/lib/ToastService';
import React, { FormEvent, useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';
const EmployeeNoticePeriodChoices = [
  { value: 'ONE_DAY', title: '1 Day' },
  { value: 'FIVE_DAYS', title: '5 Days' },
  { value: 'SEVEN_DAYS', title: '7 Days' },
  { value: 'FIFTEEN_DAYS', title: '15 Days' },
  { value: 'THIRTY_DAYS', title: '30 Days' },
  { value: 'FORTY_FIVE_DAYS', title: '45 Days' },
  { value: 'SIXTY_DAYS', title: '60 Days' },
  { value: 'NINETY_DAYS', title: '90 Days' },
];

const TerminateChoices = [
  { value: 'FULL', title: 'Full' },
  { value: 'PARTIALLY', title: 'Partially' },

  { value: 'RESIGNATION', title: 'Resignation' },
  { value: 'RETIREMENT', title: 'Retirement' },
  { value: 'JOB_ABANDONMENT', title: 'Job Abandonment' },
  { value: 'FAILURE_TO_RETURN', title: 'Failure to Return' },
  { value: 'MUTUAL_SEPARATION', title: 'Mutual Separation' },

  { value: 'LAYOFF', title: 'Layoff' },
  { value: 'POSITION_ELIMINATION', title: 'Position Elimination' },
  { value: 'END_TEMP_ASSIGNMENT', title: 'End Temporary Assignment' },
  { value: 'CONTRACT_END', title: 'Contract End' },

  { value: 'PERFORMANCE', title: 'Performance' },
  { value: 'MISCONDUCT', title: 'Misconduct / Policy Violation' },
  { value: 'ATTENDANCE', title: 'Attendance' },
  { value: 'PROBATIONARY_DISMISSAL', title: 'Probationary Sismissal' },

  { value: 'DEATH', title: 'Death' },
  { value: 'MEDICAL_SEPARATION', title: 'Medical Separation' },
  { value: 'CONSTRUCTIVE_DISCHARGE', title: 'Constructive Discharge' },
];

const JoiningInfo = ({
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
  const [isDisabled1, setIsDisabled1] = useState(true);
  const [isDisabled2, setIsDisabled2] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [data, setData] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setData({
        ...Employee,
        // ...Employee?.user,
      });
    }
  }, [Employee, isPending, RenderAgain]);

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

  const handleSaveHiringInfo = () => {
    const formData = new FormData();
    formData.append('confirmation_date', data?.confirmation_date);
    formData.append('offer_date', data?.offer_date);
    formData.append('notice_period', data?.notice_period);
    formData.append('contract_end_date', data?.contract_end_date);
    UpdateEmployee(formData, 'Hiring info', () => setIsDisabled1(true));
  };

  const handleSaveTerminateInfo = () => {
    const formData = new FormData();
    formData.append('terminate_date', data?.terminate_date);
    formData.append('terminate_kind', data?.terminate_kind);
    formData.append('terminate_description', data?.terminate_description);
    formData.append('last_date_of_work', data?.last_date_of_work);
    UpdateEmployee(formData, 'Terminate info', () => setIsDisabled2(true));
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LogoLoader size={120} color={'#16151c'} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full text-sm">
      <div className="rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Hiring Info</h1>

          {isDisabled1 && !view && (
            <Button
              onClick={() => {
                setIsDisabled2(true);
                setIsDisabled1(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Confirmation Date</label>
            <input
              value={data.confirmation_date}
              disabled={isDisabled1}
              onChange={(e) => setData({ ...data, confirmation_date: e.target.value })}
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Offer Date
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              disabled={isDisabled1}
              required
              value={data.offer_date}
              onChange={(e) => setData({ ...data, offer_date: e.target.value })}
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Notice Day</label>
            <select
              disabled={isDisabled1}
              value={data.notice_period}
              onChange={(e) => setData({ ...data, notice_period: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select</option>
              {EmployeeNoticePeriodChoices?.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Contract End Date</label>
            <input
              disabled={isDisabled1}
              value={data.contract_end_date}
              onChange={(e) => setData({ ...data, contract_end_date: e.target.value })}
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {!isDisabled1 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveHiringInfo}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled1(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="my-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Terminate</h1>
          {isDisabled2 && !view && (
            <Button
              onClick={() => {
                setIsDisabled1(true);
                setIsDisabled2(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Terminate Date</label>
            <input
              value={data.terminate_date}
              onChange={(e) => setData({ ...data, terminate_date: e.target.value })}
              disabled={isDisabled2}
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Last Date Worked</label>
            <input
              disabled={isDisabled2}
              type="date"
              value={data.last_date_of_work}
              onChange={(e) => setData({ ...data, last_date_of_work: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Terminate Type</label>
            <select
              disabled={isDisabled2}
              value={data.terminate_kind}
              onChange={(e) => setData({ ...data, terminate_kind: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select</option>
              {TerminateChoices?.map((t) => {
                return (
                  <option key={t.value} value={t.value}>
                    {t.title}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Terminate Desc</label>
            <input
              disabled={isDisabled2}
              type="text"
              maxLength={40}
              value={data.terminate_description}
              onChange={(e) => setData({ ...data, terminate_description: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {!isDisabled2 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveTerminateInfo}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled2(true);
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

export default JoiningInfo;
