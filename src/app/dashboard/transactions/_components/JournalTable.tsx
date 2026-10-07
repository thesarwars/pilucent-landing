/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import CustomerSupplierSelectDropdown from '@/components/ui/ScrollSelectDropDowns/CustomerSupplierSelectDropdown';
import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { GrDrag } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';

const JournalTable = ({
  view,
  JournalData,
  setJournalData,
  setJournalItems,
  JournalItems,
  deleteItems,
  setDeleteItems,
}: {
  view?: boolean;
  deleteItems?: any;
  setDeleteItems?: any;
  JournalItems: any;
  JournalData: any;
  setJournalData: React.Dispatch<React.SetStateAction<any>>;
  setJournalItems: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [isEqualError, setIsEqualError] = useState<boolean>(false);
  const [shipping, setShipping] = useState({ rate: 10, value: '' });
  const [difference, setDifference] = useState<number>(0);
  const [shippingAmount, setShippingAmount] = useState<number>(0);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Calculate totals
  useEffect(() => {
    const creditTotal = JournalItems.reduce(
      (acc: any, row: any) => acc + Number(row?.credit || 0),
      0
    );
    const debitTotal = JournalItems.reduce(
      (acc: any, row: any) => acc + Number(row?.debit || 0),
      0
    );

    // [
    //   {
    //     debit: "100",
    //     credit: "0.00",
    //     account_uid: "70980e81-29dd-4873-aa14-0bcd4d537d37",
    //     customer_uid: "cf9cc8fd-c6a5-4f57-8dfb-b030ffa16661",
    //     supplier_uid: "8b8f8a89-a8c9-453d-8565-9a9f668a59ec",
    //     description: ''
    //   },
    //   {
    //     debit: "0.00",
    //     credit: "100",
    //     account_uid: "0b1d712b-9899-4acc-8b9e-63d94bd78374",
    //     supplier_uid: "8b8f8a89-a8c9-453d-8565-9a9f668a59ec",
    //   },
    // ];

    const isEqual = Number(debitTotal) == Number(creditTotal);

    setDifference(Math.abs(Number(debitTotal || 0) - Number(creditTotal || 0)));

    if (!isEqual) {
      setIsEqualError(true);
    } else {
      setIsEqualError(false);
    }

    console.log(JournalData, debitTotal, creditTotal);

    setJournalData({
      ...JournalData,
      total_debit: debitTotal,
      total_credit: creditTotal,
    });
  }, [JournalItems]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addInvoiceLine = () => {
    setJournalItems([
      ...JournalItems,
      {
        id: generateId(),
        debit: '',
        credit: '',
        account: {},
        supplier: {},
        customer: {},
      },
    ]);
  };

  const removeInvoiceLine = (id: string) => {
    const updatedRows = JournalItems.filter((item: any) => item.id !== id);
    setJournalItems(updatedRows);
  };

  const removeAllInvoiceLines = () => {
    setJournalItems([]);
  };

  const handleInputChange = (id: string, field: string, value: any) => {
    const updatedRows = JournalItems.map((row: any) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        return updatedRow;
      }
      return row;
    });
    setJournalItems(updatedRows);
  };

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverItem(itemId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropItemId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === dropItemId) {
      handleDragEnd();
      return;
    }

    const draggedIndex = JournalItems.findIndex((item: any) => item.id === draggedItem);
    const dropIndex = JournalItems.findIndex((item: any) => item.id === dropItemId);

    if (draggedIndex === -1 || dropIndex === -1) {
      handleDragEnd();
      return;
    }

    const newItems = [...JournalItems];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItemData);

    setJournalItems(newItems);
    handleDragEnd();
  };

  return (
    <div className="relative">
      {/* Table Container */}
      <div className="mb-5 rounded-lg border bg-white/60 shadow-sm">
        <div className="">
          {/* Header Row - Only visible on desktop */}
          <div className="hidden border-b-2 border-gray-300 bg-gray-50 p-4 text-sm font-medium uppercase text-gray-700 lg:grid lg:grid-cols-12 lg:gap-4">
            <div className="lg:col-span-1">#</div>
            <div className="text-center lg:col-span-3">Account</div>
            <div className="text-center lg:col-span-2">Name</div>
            <div className="text-center lg:col-span-3">Description</div>
            <div className="text-center lg:col-span-1">Debit</div>
            <div className="text-center lg:col-span-1">Credit</div>
            {!view && <div className="text-center lg:col-span-1">Action</div>}
          </div>

          {/* Table Body */}
          {JournalItems.map((row: any, idx: number) => (
            <div
              key={row.id}
              draggable={!view}
              onDragStart={(e) => !view && handleDragStart(e, row.id)}
              onDragEnd={() => !view && handleDragEnd()}
              onDragOver={(e) => !view && handleDragOver(e)}
              onDragEnter={(e) => !view && handleDragEnter(e, row.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => !view && handleDrop(e, row.id)}
              className={`border-b transition-all duration-200 ${
                draggedItem === row.id ? 'bg-blue-100 opacity-50' : ''
              } ${
                dragOverItem === row.id && draggedItem !== row.id
                  ? 'border-t-4 border-t-blue-500 bg-blue-50'
                  : ''
              } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <>
                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-4 lg:p-4">
                  <div className="flex max-w-10 items-center lg:col-span-1">
                    <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                      <GrDrag className="text-2xl text-gray-400" />
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <AccountSelectDropDown
                      ClassName="border focus:border-accent_soft_blue rounded"
                      value={row?.account}
                      view={view}
                      setValue={(e: any) => {
                        handleInputChange(row?.id, 'account', e);
                      }}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <CustomerSupplierSelectDropdown
                      view={view}
                      ClassName="border focus:border-accent_soft_blue px-2 rounded"
                      value={row?.name}
                      setValue={(e: any) => {
                        handleInputChange(row?.id, 'name', e);
                      }}
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <input
                      type="text"
                      disabled={view}
                      className="w-full rounded border px-2 py-2 outline-none focus:border-accent_soft_blue"
                      value={row?.description}
                      onChange={(e) => {
                        handleInputChange(row?.id, 'description', e.target.value);
                      }}
                    />
                  </div>

                  <div className={`lg:col-span-1`}>
                    <input
                      disabled={row?.credit > 0 || view}
                      type="number"
                      className="w-full rounded border px-2 py-2 text-center outline-none focus:border-accent_soft_blue"
                      value={row?.debit}
                      onChange={(e) => {
                        handleInputChange(row?.id, 'debit', e.target.value);
                      }}
                    />
                  </div>
                  <div className={`lg:col-span-1`}>
                    <input
                      disabled={row?.debit > 0 || view}
                      type="number"
                      className="w-full rounded border px-2 py-2 text-center outline-none focus:border-accent_soft_blue"
                      value={row?.credit}
                      onChange={(e) => {
                        handleInputChange(row?.id, 'credit', e.target.value);
                      }}
                    />
                  </div>
                  {!view && (
                    <div className="flex items-center justify-center lg:col-span-1">
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile View */}
                <div className="p-4 lg:hidden">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-lg font-medium">Row {idx + 1}</div>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                      <GrDrag className="text-xl text-gray-400" />
                    </div>
                    <div className="mx-2 text-center font-medium">{row.qty}</div>
                    {!view && (
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-gray-500 transition-colors hover:bg-red-50"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Account
                      </label>
                      <AccountSelectDropDown
                        view={view}
                        ClassName="border focus:border-accent_soft_blue rounded"
                        value={row?.account}
                        setValue={(e: any) => {
                          handleInputChange(row?.id, 'account', e);
                        }}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                      <CustomerSupplierSelectDropdown
                        view={view}
                        ClassName="border px-2 focus:border-accent_soft_blue rounded"
                        value={row?.name}
                        setValue={(e: any) => {
                          handleInputChange(row?.id, 'name', e);
                        }}
                      />
                    </div>
                    <div className="">
                      <input
                        disabled={view}
                        type="text"
                        className="w-full rounded border px-2 py-2 outline-none focus:border-accent_soft_blue"
                        value={row?.description}
                        onChange={(e) => {
                          handleInputChange(row?.id, 'description', e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Debit</label>
                      <input
                        disabled={row?.credit > 0 || view}
                        type="number"
                        className="w-full rounded border px-2 py-2 text-center outline-none focus:border-accent_soft_blue"
                        value={row?.debit}
                        onChange={(e) => {
                          handleInputChange(row?.id, 'debit', e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Credit</label>
                      <input
                        disabled={row?.debit > 0 || view}
                        type="number"
                        className="w-full rounded border px-2 py-2 text-center outline-none focus:border-accent_soft_blue"
                        value={row?.credit}
                        onChange={(e) => {
                          handleInputChange(row?.id, 'credit', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {!view && (
          <div className="border-t p-4">
            <div className="flex flex-wrap gap-4 text-violet-600">
              <button
                onClick={addInvoiceLine}
                className="font-medium transition-colors hover:text-violet-800"
              >
                Add a Row
              </button>

              <button
                onClick={removeAllInvoiceLines}
                className="font-medium transition-colors hover:text-violet-800"
              >
                Remove All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="flex justify-end">
        <div className="w-full max-w-lg rounded-2xl bg-white/60 p-6 text-sm shadow-lg">
          <div className="mb-4 grid w-full grid-cols-3 justify-between">
            <p>#</p>
            <p>Debit</p>
            <p>Credit</p>
          </div>
          <div className="grid grid-cols-3 justify-between">
            <p>Total</p>

            <p>$ {Number(JournalData?.total_debit || 0).toFixed(2) || 0}</p>

            <p>$ {Number(JournalData?.total_credit || 0).toFixed(2) || 0}</p>
          </div>
          {isEqualError && (
            <div className="mt-4 rounded-md border border-red-500 bg-red-50 px-4 py-2 text-xs text-red-500">
              Error: Debit and credit totals must be equal. Current difference: ${' '}
              {Number(difference).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalTable;
