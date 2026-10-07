'use client';

import { Users } from 'lucide-react';
import { toast } from '@/lib/ToastService';
import { Avatar, Chip, IconChip } from '@/components/violet';

interface LeaveType {
  leaveTypeUid: string;
  leaveTypeName: string;
  maximum_allocation: number;
  totalDays: number;
}

interface EmployeeData {
  employeeUid: string;
  employeeName: string;
  leaveTypes: LeaveType[];
}

interface EmployeeLeaveTableProps {
  data: EmployeeData[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function EmployeeLeaveTable({ data, setData }: EmployeeLeaveTableProps) {
  // Unique leave-type names → dynamic columns
  const allLeaveTypeNames = Array.from(
    new Set(data.flatMap((employee) => employee.leaveTypes.map((lt) => lt.leaveTypeName))),
  );

  /* live edit — writes straight into the allocation state (same shape → same payload) */
  const updateValue = (
    employeeUid: string,
    leaveTypeName: string,
    value: any,
    maxAllocation: number,
  ) => {
    if (Number(value || 0) > maxAllocation) {
      return toast.error('Maximum allocation limit exceeded');
    }
    setData((prev) =>
      prev.map((employee) =>
        employee.employeeUid === employeeUid
          ? {
              ...employee,
              leaveTypes: employee.leaveTypes.map((lt: any) =>
                lt.leaveTypeName === leaveTypeName ? { ...lt, totalDays: value } : lt,
              ),
            }
          : employee,
      ),
    );
  };

  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-v-card">
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-v-border px-5 py-3.5">
        <IconChip tone="violet" size="sm">
          <Users />
        </IconChip>
        <span className="text-[13.5px] font-extrabold text-v-ink900">Employee allocation</span>
        <span className="flex-1" />
        <Chip tone="violet">
          {data.length} {data.length === 1 ? 'employee' : 'employees'}
        </Chip>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead className="bg-[#FBFAFE]">
            <tr className="text-left">
              <th className="px-5 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-v-ink400">
                Employee
              </th>
              {allLeaveTypeNames.map((leaveTypeName) => (
                <th
                  key={leaveTypeName}
                  className="px-3 py-2.5 text-center text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-v-ink400"
                >
                  {leaveTypeName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={allLeaveTypeNames.length + 1}
                  className="px-5 py-8 text-center text-[12.5px] text-v-ink400"
                >
                  No employees to allocate.
                </td>
              </tr>
            ) : (
              data.map((employee, i) => {
                const employeeLeaveMap = new Map(
                  employee.leaveTypes.map((lt) => [lt.leaveTypeName, lt]),
                );
                return (
                  <tr
                    key={employee.employeeUid}
                    className="animate-v-pop border-t border-[rgba(22,23,42,0.06)] transition-colors hover:bg-[#F7F5FC]"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="px-5 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={employee.employeeName} size={28} />
                        <span className="truncate text-[13px] font-bold text-v-ink900">
                          {employee.employeeName}
                        </span>
                      </div>
                    </td>
                    {allLeaveTypeNames.map((leaveTypeName) => {
                      const leaveType = employeeLeaveMap.get(leaveTypeName);
                      const maxAllocation = leaveType?.maximum_allocation || 0;
                      const currentTotalDays = leaveType?.totalDays;
                      return (
                        <td
                          key={`${employee.employeeUid}-${leaveTypeName}`}
                          className="px-3 py-2.5 text-center"
                        >
                          <input
                            type="number"
                            min={0}
                            max={maxAllocation || undefined}
                            value={currentTotalDays ?? ''}
                            placeholder="0"
                            onChange={(e) =>
                              updateValue(
                                employee.employeeUid,
                                leaveTypeName,
                                e.target.value,
                                maxAllocation,
                              )
                            }
                            className="mx-auto w-20 rounded-[10px] border border-v-border bg-white px-2.5 py-1.5 text-center text-[12.5px] font-semibold tabular-nums text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
