'use client';

import type React from 'react';
import { type FormEvent, useEffect, useState } from 'react';
import { Banknote, Loader2, Check } from 'lucide-react';
import EmployeeSelectDropdown from '@/components/ui/ScrollSelectDropDowns/EmployeeSelectDropdown';
import LeaveEncashmentTable from './LeaveEncashmentTable';
import DatePicker from '@/components/ui/DatePicker';
import moment from 'moment';
import LeaveBalanceSelectDropdown from '@/components/ui/ScrollSelectDropDowns/LeaveBalanceSelectDropdown';
import {
  fetchLeaveEncashment,
  patchLeaveEncashment,
  patchLeaveEncashmentItem,
  postLeaveEncashment,
} from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { Drawer, VioletButton, IconChip, money } from '@/components/violet';
import LogoLoader from '@/components/MainLoader/logo-loader';

const FORM_ID = 'leave-encashment-form';

const FIELD =
  'w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13px] font-medium text-v-ink900 outline-none transition-shadow focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

const LeaveEncashment = ({
  isOpen,
  setIsOpen,
  uid,
  refetch,
}: {
  isOpen: boolean;
  setIsOpen: any;
  uid?: string;
  refetch?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [encashmentItems, setEncashmentItems] = useState<any[]>([]);
  const [data, setData] = useState({
    employee_uid: '' as any,
    encashment_date: moment(new Date()).format('YYYY-MM-DD'),
    leave_balance_uid: '' as any,
    total_encashment_amount: '',
    status: 'ACTIVE',
    items: [],
  });

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchLeaveEncashment(uid);
          if (res) {
            setData({
              employee_uid: res?.employee,
              encashment_date: res?.encashment_date,
              leave_balance_uid: res?.leave_balance,
              total_encashment_amount: res?.total_encashment_amount,
              status: 'ACTIVE',
              items: [],
            });
            if (res?.items?.length) {
              const itemArr = res?.items?.map((i: any) => {
                return {
                  uid: i?.uid,
                  leave_type: i?.leave_type,
                  leave_balance: i?.leave_balance,
                  actual_encashable_days: i?.actual_encashable_days,
                  encashment_days: i?.encashment_days,
                  amount_per_day: i?.amount_per_day,
                  total_amount: i?.total_amount,
                };
              });
              setEncashmentItems(itemArr);
            }
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
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  const handleReset = () => {
    setData({
      employee_uid: '' as any,
      encashment_date: moment(new Date()).format('YYYY-MM-DD'),
      leave_balance_uid: '' as any,
      total_encashment_amount: '',
      status: 'ACTIVE',
      items: [],
    });
    setEncashmentItems([]);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      if (uid) {
        const totalEncashmentAmount = encashmentItems?.reduce(
          (prev, row) => Number(prev) + Number(row?.total_amount),
          0
        );
        const res = await patchLeaveEncashment(uid, {
          ...data,
          employee_uid: data?.employee_uid?.uid,
          leave_balance_uid: data?.leave_balance_uid?.uid,
          total_encashment_amount: totalEncashmentAmount,
        });
        if (res?.success) {
          const Items = encashmentItems?.map((item) => {
            return {
              ...item,
              uid: item?.uid,
              leave_type_uid: item?.leave_type?.uid,
              leave_type: '',
            };
          });
          const updatePromises = Items?.map((payload) =>
            patchLeaveEncashmentItem(payload?.uid, payload)
          );
          const results = await Promise.allSettled([...updatePromises]);
          const allSuccess = results.every(
            (res) => res.status === 'fulfilled' && Boolean(res.value)
          );

          if (allSuccess) {
            toast.success('Leave encashment updated.');
            refetch && refetch();
            setIsOpen(false);
          } else {
            toast.warning('Some items failed to update. Please check.');
          }
        }
      } else {
        const Items = encashmentItems?.map((item) => {
          return {
            ...item,
            leave_type_uid: item?.leave_type?.uid,
            leave_type: '',
          };
        });
        const totalEncashmentAmount = encashmentItems?.reduce(
          (prev, row) => Number(prev) + Number(row?.total_amount),
          0
        );
        const payloadData = {
          ...data,
          employee_uid: data?.employee_uid?.uid,
          leave_balance_uid: data?.leave_balance_uid?.uid,
          total_encashment_amount: totalEncashmentAmount,
          items: Items,
        };
        const res = await postLeaveEncashment(payloadData);
        if (res?.success) {
          toast.success('Encashment created.');
          refetch && refetch();
          handleReset();
          setIsOpen(false);
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  const runningTotal = encashmentItems?.reduce(
    (prev, row) => Number(prev) + Number(row?.total_amount || 0),
    0
  );

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<Banknote />}
      title={uid ? 'Edit leave encashment' : 'New leave encashment'}
      sub="Encash unused leaves for an employee"
      width={720}
      className="bg-[#F4F2FA]"
      footer={
        <>
          <span className="hidden text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400 sm:inline">
            Total encashment
          </span>
          <span className="text-[17px] font-extrabold tabular-nums text-v-ink900">
            {money(Number(runningTotal) || 0)}
          </span>
          <span className="flex-1" />
          <VioletButton
            type="button"
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="min-w-[120px]"
          >
            Cancel
          </VioletButton>
          <VioletButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            className="min-w-[160px]"
            disabled={isPending || !data?.employee_uid?.uid || !(Number(runningTotal) > 0)}
            leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          >
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Create encashment'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <LogoLoader size={100} color={'#16151c'} />
        </div>
      ) : (
        <form id={FORM_ID} className="flex flex-col gap-5" onSubmit={handleSave}>
            {/* Form Section */}
            <div className="rounded-[16px] bg-white p-5 shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet" size="md">
                  <Banknote />
                </IconChip>
                <span className="text-[13.5px] font-extrabold text-v-ink900">Encashment details</span>
              </div>
              <div className="grid grid-cols-1 gap-x-[18px] gap-y-3.5 md:grid-cols-[minmax(0,1.4fr)_1fr_1fr]">
                <div>
                  <label className={LABEL}>Employee</label>
                  <EmployeeSelectDropdown
                    value={data.employee_uid}
                    setValue={(value: any) => {
                      setData({ ...data, employee_uid: value });
                    }}
                    ClassName={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL}>Encashment date</label>
                  <DatePicker
                    value={data.encashment_date}
                    onChange={(e) => setData({ ...data, encashment_date: e })}
                    ClassName={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL}>Leave balance</label>
                  <LeaveBalanceSelectDropdown
                    value={data.leave_balance_uid}
                    setValue={(e: any) => setData({ ...data, leave_balance_uid: e })}
                    ClassName={FIELD}
                  />
                </div>
              </div>
            </div>

            <LeaveEncashmentTable
              uid={uid}
              leaveItems={encashmentItems}
              setLeaveItems={setEncashmentItems}
            />
          </form>
      )}
    </Drawer>
  );
};

export default LeaveEncashment;
