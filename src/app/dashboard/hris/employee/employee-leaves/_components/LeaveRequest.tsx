'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import LeaveTypeDropdown from './LeaveTypeDropdown';
import EmployeeSelectDropdown from '@/components/ui/ScrollSelectDropDowns/EmployeeSelectDropdown';
import DatePicker from '@/components/ui/DatePicker';
import { Drawer, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import {
  fetchLeaveRequest,
  patchLeaveRequest,
  postLeaveRequest,
} from '@/app/helpers/backend';

const FORM_ID = 'leave-request-form';

const FIELD =
  'w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const READONLY = `${FIELD} cursor-not-allowed bg-v-card-subtle text-v-ink500`;

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold text-v-ink700">{children}</label>;
}

const LeaveRequest = ({
  setIsOpen,
  refetch,
  uid,
  isOpen,
  isAdmin = false,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  uid: string;
  isAdmin?: boolean;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    leave_type_uid: {} as any,
    from_date: '',
    to_date: '',
    total_days: '',
    status: isAdmin ? 'APPROVED' : 'PENDING',
    note: '',
    assigned_to_uid: {} as any,
    is_active: true,
    employee: {} as any,
  });

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchLeaveRequest(uid);
          if (res) {
            setData({
              ...data,
              leave_type_uid: res?.leave_type,
              assigned_to_uid: res?.assigned_to,
              from_date: res?.from_date,
              to_date: res?.to_date,
              total_days: res?.total_days,
              is_active: res?.is_active,
              note: res?.note,
              status: res?.status,
            });
          }
        } catch (error) {
          //error
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
      leave_type_uid: {} as any,
      from_date: '',
      to_date: '',
      total_days: '',
      status: 'PENDING',
      note: '',
      assigned_to_uid: {} as any,
      is_active: true,
      employee: {} as any,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      if (uid) {
        const res = await patchLeaveRequest(uid, {
          ...data,
          leave_type_uid: data.leave_type_uid?.uid,
          assigned_to_uid: data.assigned_to_uid?.uid,
          // When admin is creating/updating, use employee field (not employee_uid)
          ...(isAdmin && data.employee?.uid ? { employee: data.employee?.uid } : {}),
          status: isAdmin ? 'APPROVED' : 'PENDING',
        });
        if (res?.success) {
          toast.success('Leave request updated.');
          refetch && refetch();
          setIsOpen(false);
        }
      } else {
        const res = await postLeaveRequest({
          ...data,
          leave_type_uid: data.leave_type_uid?.uid,
          assigned_to_uid: data.assigned_to_uid?.uid,
          // When admin is creating/updating, use employee field (not employee_uid)
          ...(isAdmin && data.employee?.uid ? { employee: data.employee?.uid } : {}),
          status: isAdmin ? 'APPROVED' : 'PENDING',
        });
        if (res?.success) {
          toast.success('Leave request updated.');
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

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<CalendarDays />}
      iconTone="violet"
      title={!uid ? 'Add leave request' : 'Edit leave request'}
      sub="Request time off & assign a desk cover"
      width={480}
      footer={
        <>
          <VioletButton
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </VioletButton>
          <VioletButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            className="flex-1"
            disabled={isPending || isLoading}
            leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Create request'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
            <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
          </div>
          <div className="h-20 animate-pulse rounded-v-input bg-v-wash2" />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isAdmin && (
            <div>
              <Label>Select employee</Label>
              <EmployeeSelectDropdown
                value={data.employee}
                setValue={(e: any) => setData({ ...data, employee: e })}
                ClassName={FIELD}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
            <div>
              <Label>Select leave</Label>
              <LeaveTypeDropdown
                value={data.leave_type_uid}
                setValue={(e: any) => setData({ ...data, leave_type_uid: e })}
                ClassName={FIELD}
              />
            </div>

            <div>
              <Label>Leave type (auto)</Label>
              <input
                name="selectLeave"
                value={data.leave_type_uid?.leave_type || ''}
                readOnly
                disabled
                className={READONLY}
                placeholder="Auto-set by leave type"
              />
            </div>

            <div>
              <Label>Available leave</Label>
              <input
                type="number"
                value={data.leave_type_uid?.max_consecutive_allowed ?? ''}
                readOnly
                disabled
                className={`${READONLY} tabular-nums`}
              />
            </div>

            <div>
              <Label>Total days</Label>
              <input
                type="number"
                value={data.total_days}
                readOnly
                disabled
                className={`${READONLY} tabular-nums`}
              />
            </div>

            <div>
              <Label>From date</Label>
              <div className="relative">
                <DatePicker
                  calenderClassName="right-0"
                  value={data.from_date}
                  onChange={(e) => {
                    if (data.to_date) {
                      const totalDays =
                        new Date(data.to_date).getDate() - new Date(e).getDate();
                      if (totalDays + 1 > 0) {
                        setData({
                          ...data,
                          from_date: e,
                          total_days: (totalDays + 1) as any,
                        });
                      } else {
                        toast.error('From date must be previous of to date');
                      }
                    } else {
                      setData({ ...data, from_date: e });
                    }
                  }}
                  ClassName={FIELD}
                />
              </div>
            </div>

            <div>
              <Label>To date</Label>
              <div className="relative">
                <DatePicker
                  calenderClassName="right-0"
                  value={data.to_date}
                  onChange={(value) => {
                    if (data.from_date) {
                      const totalDays =
                        new Date(value).getDate() - new Date(data.from_date).getDate();
                      if (totalDays + 1 > 0) {
                        setData({
                          ...data,
                          to_date: value,
                          total_days: (totalDays + 1) as any,
                        });
                      } else {
                        toast.error('To date must be after of from date');
                      }
                    } else {
                      setData({ ...data, to_date: value });
                    }
                  }}
                  ClassName={FIELD}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Note</Label>
            <textarea
              name="note"
              rows={3}
              value={data.note}
              onChange={(e) => setData({ ...data, note: e.target.value })}
              className={`${FIELD} resize-y`}
              placeholder="Reason for the leave (optional)"
            />
          </div>

          <div>
            <Label>Desk look by</Label>
            <EmployeeSelectDropdown
              placeholder="Select"
              setValue={(value: any) => setData({ ...data, assigned_to_uid: value })}
              value={data.assigned_to_uid}
              ClassName={FIELD}
            />
          </div>
        </form>
      )}
    </Drawer>
  );
};

export default LeaveRequest;
