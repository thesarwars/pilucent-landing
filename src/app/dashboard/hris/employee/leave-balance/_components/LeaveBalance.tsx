'use client';
import type React from 'react';
import { useState, useEffect, FormEvent } from 'react';
import { Scale, Loader2, Check } from 'lucide-react';
import {
  fetchEmployeeBalanceList,
  fetchLeaveBalance,
  patchLeaveBalance,
  patchLeaveBalanceItem,
  postLeaveBalance,
} from '@/app/helpers/backend';
import EmployeeLeaveTable from './BalanceListTable';
import { toast } from '@/lib/ToastService';
import { useQuery } from '@tanstack/react-query';
import { Drawer, VioletButton, IconChip } from '@/components/violet';
import LogoLoader from '@/components/MainLoader/logo-loader';

const FORM_ID = 'leave-balance-form';

const FIELD =
  'w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};
const getLastDayOfYear = () => {
  const year = new Date().getFullYear();
  const lastDay = new Date(year, 11, 31); // December 31st
  return lastDay.toISOString().split('T')[0];
};

const LeaveBalance = ({
  isOpen,
  setIsOpen,
  refetch,
  uid,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  uid?: string;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    leave_year: getCurrentYear(),
    from_date: getToday(),
    to_date: getLastDayOfYear(),
    status: 'ACTIVE',
    is_active: true,
    allocations: [] as any,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);

  const {
    data,
    isPending,
    refetch: ListRefetch,
  } = useQuery({
    queryKey: ['balance-list-table'],
    queryFn: () => fetchEmployeeBalanceList(),
    enabled: !uid && isOpen,
  });

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchLeaveBalance(uid);
          if (res) {
            setFormData({
              ...data,
              from_date: res?.from_date,
              is_active: res?.is_active,
              leave_year: res?.leave_year,
              to_date: res?.to_date,
              title: res?.title,
            });
            setAllocations(res?.employee_leave_types);
          }
        } catch (error) {
          //err
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [uid]);

  useEffect(() => {
    if (!isPending && data && !uid) {
      setAllocations(data?.data || []);
    }
  }, [data, isPending]);

  const handleFormatAllocations = () => {
    //filter the changed data
    const data1 = allocations?.filter((allocation) => {
      const leaves = allocation?.leaveTypes?.filter((type: any) => {
        if (type?.totalDays)
          return {
            leave_type_uid: type?.leaveTypeUid,
            allocated_days: type?.totalDays || 0,
          };
      });
      if (leaves?.length)
        return {
          employee_uid: allocation?.employeeUid,
          allocation_item: leaves,
        };
    });

    //map to format data
    const data = data1?.map((allocation) => {
      const leaves = allocation?.leaveTypes?.map((type: any) => {
        return {
          leave_type_uid: type?.leaveTypeUid,
          allocated_days: type?.totalDays || 0,
        };
      });
      return {
        employee_uid: allocation?.employeeUid,
        allocation_item: leaves,
      };
    });

    return data;
  };
  const handleFormatAllocationsForUpdate = () => {
    //map to format data
    let array: any[] = [];
    //map to format data
    allocations?.map((allocation) => {
      const leaves = allocation?.leaveTypes?.map((type: any) => {
        return {
          uid: type?.uid,
          leave_type_uid: type?.leaveTypeUid,
          allocated_days: type?.totalDays || 0,
        };
      });
      array.push(...leaves);
    });

    return array;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = handleFormatAllocations();
    if (!data?.length) return toast.error('Add leave balance to save!');

    try {
      setIsSubmitting(true);
      if (uid) {
        const res = await patchLeaveBalance(uid, formData);
        if (res?.success) {
          const data = handleFormatAllocationsForUpdate();

          const updatePromises = data?.map((payload) =>
            patchLeaveBalanceItem(payload?.uid, payload)
          );
          const results = await Promise.allSettled([...updatePromises]);
          const allSuccess = results.every(
            (res) => res.status === 'fulfilled' && Boolean(res.value)
          );

          if (allSuccess) {
            toast.success('Leave balance updated.');
            refetch && refetch();
            setIsOpen(false);
          } else {
            toast.warning('Some items failed to update. Please check.');
          }
        }
      } else {
        const res = await postLeaveBalance({ ...formData, allocations: data });
        if (res?.success) {
          toast.success('Leave balance created.');
          refetch && refetch();
          setIsOpen(false);
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<Scale />}
      title={uid ? 'Edit leave balance' : 'New leave balance'}
      sub="Allocate leaves to employees for a period"
      width={620}
      className="bg-[#F4F2FA]"
      footer={
        <>
          <span className="flex-1" />
          <VioletButton
            type="button"
            variant="outline"
            className="min-w-[120px]"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </VioletButton>
          <VioletButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            className="min-w-[150px]"
            disabled={isSubmitting || !formData.title?.trim()}
            leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          >
            {isSubmitting ? 'Saving…' : uid ? 'Save changes' : 'Create balance'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <LogoLoader size={120} color={'#16151c'} />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Balance details */}
            <div className="rounded-[16px] bg-white p-5 shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet" size="md">
                  <Scale />
                </IconChip>
                <span className="text-[13.5px] font-extrabold text-v-ink900">Balance details</span>
              </div>
              <div className="grid grid-cols-1 gap-x-[18px] gap-y-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL}>
                    Title <span className="text-v-primary">*</span>
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    type="text"
                    required
                    placeholder="e.g. Annual leave 2026"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL}>From date</label>
                  <input
                    required
                    value={formData.from_date}
                    min={`${formData.leave_year}-01-01`}
                    max={`${formData.leave_year}-12-31`}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                    type="date"
                    className={`${FIELD} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL}>Leave year</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.leave_year}
                    className={`${FIELD} cursor-not-allowed bg-[#F7F5FC] tabular-nums`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL}>To date</label>
                  <input
                    type="date"
                    required
                    value={formData.to_date}
                    min={`${formData.leave_year}-01-01`}
                    max={`${formData.leave_year}-12-31`}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                    className={`${FIELD} tabular-nums`}
                  />
                </div>
              </div>
            </div>

            {isPending && !allocations?.length ? (
              ''
            ) : (
              <EmployeeLeaveTable data={allocations} setData={setAllocations} />
            )}
          </form>
      )}
    </Drawer>
  );
};

export default LeaveBalance;
