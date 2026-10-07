/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import LeaveTypeDropdown from '../../employee-leaves/_components/LeaveTypeDropdown';

const FIELD =
  'w-full rounded-v-input border border-v-border bg-white px-3 py-2 text-[13px] font-medium text-v-ink900 outline-none transition-shadow focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';

const LeaveEncashmentTable = ({
  uid = '',
  setLeaveItems,
  leaveItems,
}: {
  uid?: string;
  leaveItems: any;
  setLeaveItems: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedRows = leaveItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };
        updatedRow = { ...row, [field]: value };
        if (field === 'amount_per_day' || field === 'encashment_days') {
          updatedRow.total_amount =
            Number(updatedRow.amount_per_day || 0) * Number(updatedRow.encashment_days || 0);
        }
        return updatedRow;
      }
      return row;
    });
    setLeaveItems(updatedRows);
  };

  const removeLine = (id: number) => {
    const updatedRows = leaveItems.filter((item: any, idx: number) => idx !== id);

    setLeaveItems(updatedRows);
  };

  const addLine = () => {
    setLeaveItems([
      ...leaveItems,
      {
        leave_type: '',
        leave_balance: '',
        actual_encashable_days: '',
        encashment_days: '',
        amount_per_day: '',
        total_amount: '',
      },
    ]);
  };

  const handleSelectedType = (index: number, product: any) => {
    const updatedRows = leaveItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        row.product_service = product;
        row.description = product.description;
        row.price = product.sale_price;
        row.amount = product.sale_price * row.qty;
      }
      return row;
    });

    setLeaveItems(updatedRows);
  };

  return (
    <div className="font-jakarta">
      <div className="rounded-[16px] bg-white shadow-v-card">
        {/* Header Row - Only visible on desktop */}
        <div className="hidden grid-cols-12 gap-2 rounded-t-[16px] border-b border-[rgba(22,23,42,0.07)] bg-[#FBFAFE] px-4 py-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.04em] text-v-ink400 md:grid">
          <div className="col-span-3">Leave Type</div>
          <div className="col-span-1 text-center">Balance</div>
          <div className="col-span-2 text-center">Actual Encashable</div>
          <div className="col-span-2 text-center">Encashment Days</div>
          <div className="col-span-2 text-center">Amount / Day</div>
          <div className="col-span-1 text-center">Total</div>
          <div className="col-span-1 text-center">Action</div>
        </div>

        {/* Table Body */}
        {leaveItems.map((row: any, index: number) => (
          <div key={row.id ?? index} className="border-b border-[rgba(22,23,42,0.06)]">
            {/* Desktop View */}
            <div className="my-1.5 hidden grid-cols-12 items-center gap-2 px-4 md:grid">
              <div className="col-span-3">
                <LeaveTypeDropdown
                  setValue={(v: any) => handleInputChange(v, 'leave_type', index)}
                  value={row?.leave_type}
                  parentClassName="max-w-80"
                  ClassName={FIELD}
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  className={`${FIELD} text-center tabular-nums`}
                  onChange={(e) => handleInputChange(e.target.value, 'leave_balance', index)}
                  value={row?.leave_balance}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  className={`${FIELD} text-center tabular-nums`}
                  onChange={(e) =>
                    handleInputChange(e.target.value, 'actual_encashable_days', index)
                  }
                  value={row?.actual_encashable_days}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  className={`${FIELD} text-center tabular-nums`}
                  onChange={(e) => handleInputChange(e.target.value, 'encashment_days', index)}
                  value={row?.encashment_days}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  className={`${FIELD} text-center tabular-nums`}
                  onChange={(e) => handleInputChange(e.target.value, 'amount_per_day', index)}
                  value={row?.amount_per_day}
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number"
                  className={`${FIELD} cursor-not-allowed bg-v-card-subtle text-center tabular-nums`}
                  readOnly
                  disabled
                  value={row?.total_amount}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
                  aria-label="Remove line"
                >
                  <Trash2 className="h-[15px] w-[15px]" />
                </button>
              </div>
            </div>

            {/* Mobile View */}
            <div className="p-4 md:hidden">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[13px] font-bold text-v-ink900">Line {index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
                  aria-label="Remove line"
                >
                  <Trash2 className="h-[15px] w-[15px]" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                    Leave Type
                  </label>
                  <LeaveTypeDropdown
                    setValue={(v: any) => handleInputChange(v, 'leave_type', index)}
                    value={row?.leave_type}
                    parentClassName="max-w-80"
                    ClassName={FIELD}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                    Leave Balance
                  </label>
                  <input
                    type="number"
                    className={`${FIELD} tabular-nums`}
                    onChange={(e) => handleInputChange(e.target.value, 'leave_balance', index)}
                    value={row?.leave_balance}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                    Actual Encashable Days
                  </label>
                  <input
                    type="number"
                    className={`${FIELD} tabular-nums`}
                    onChange={(e) =>
                      handleInputChange(e.target.value, 'actual_encashable_days', index)
                    }
                    value={row?.actual_encashable_days}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                    Encashment Days
                  </label>
                  <input
                    type="number"
                    className={`${FIELD} tabular-nums`}
                    onChange={(e) => handleInputChange(e.target.value, 'encashment_days', index)}
                    value={row?.encashment_days}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                    Amount Per Day
                  </label>
                  <input
                    type="number"
                    className={`${FIELD} tabular-nums`}
                    onChange={(e) => handleInputChange(e.target.value, 'amount_per_day', index)}
                    value={row?.amount_per_day}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    readOnly
                    disabled
                    className={`${FIELD} cursor-not-allowed bg-v-card-subtle tabular-nums`}
                    value={row?.total_amount}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {leaveItems.length === 0 && (
          <div className="px-4 py-6 text-center text-[12.5px] text-v-ink400">
            No lines yet — add a leave type to start the calculation.
          </div>
        )}

        {/* Action Buttons */}
        {!uid && (
          <div className="p-3">
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F1FF] px-3.5 py-2 text-[12.5px] font-bold text-v-primary transition-colors hover:bg-v-tint100"
            >
              <Plus className="h-4 w-4" />
              Add new
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveEncashmentTable;
