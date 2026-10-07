/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, ChangeEvent } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { GrDrag } from 'react-icons/gr';
import Button from '@/components/ui/RawButton';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import PayMethodSelectDropdown from '@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import CustomerSupplierSelectDropdown from '@/components/ui/ScrollSelectDropDowns/CustomerSupplierSelectDropdown';

const AddToFundTable = ({ items, setItems }: { items?: any; setItems?: any }) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const addLine = () => {
    setItems([
      ...items,
      {
        account: '',
        received_from: '',
        amount: '',
        description: '',
        payment_method: '',
        ref_number: '',
        isPopupOpen: false, // Initialize popup state
      },
    ]);
  };

  const removeLine = (index: number, uid?: string) => {
    const updatedRows = items.filter((_: any, rowIndex: any) => rowIndex !== index);

    setItems(updatedRows);
  };

  const removeALLLine = () => {
    setItems([]);
  };

  const handleInputChange = (index: number, field: any, value: any) => {
    const updatedRows = items.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        let updatedRow = { ...row };
        updatedRow = { ...row, [field]: value };

        return updatedRow;
      }
      return row;
    });
    setItems(updatedRows);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const updatedData = [...items];
    const draggedItem = updatedData[draggingIndex];
    updatedData.splice(draggingIndex, 1);
    updatedData.splice(index, 0, draggedItem);
    setDraggingIndex(index);
    setItems(updatedData);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  return (
    <div className="relative my-7 mb-24 overflow-x-scroll rounded-xl border-2 bg-white/60">
      <div className="border-base-300 relative mb-5 rounded-none">
        <div className="max-md:overflow-x-auto">
          <Table className="rounded-t-xl">
            <TableHeader className="text-base font-medium">
              <TableRow className="rounded-t-xl border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                <TableHead className="pl-2">#</TableHead>
                <TableHead className="px-1 text-left">RECEIVED FROM</TableHead>
                <TableHead className="px-1 text-center">ACCOUNT</TableHead>
                <TableHead className="px-1 text-center">DESCRIPTION</TableHead>
                <TableHead className="px-1 text-center">PAYMENT METHOD</TableHead>
                <TableHead className="px-1 text-center">REF NO.</TableHead>
                <TableHead className="px-1 text-center">AMOUNT</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((row: any, index: any) => (
                <TableRow
                  draggable // Enables the drag behavior
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  key={index}
                  className={`border-none bg-white/60 hover:bg-white`}
                >
                  <TableCell className="cursor-pointer border-b pl-2 pr-1 max-md:min-w-10">
                    <GrDrag className="text-2xl" />
                  </TableCell>
                  <TableCell className="w-84 border-b px-1">
                    <CustomerSupplierSelectDropdown
                      key={index * Math.random()}
                      ClassName="rounded-lg border bg-white px-3 py-2 min-w-[250px] outline-none disabled:bg-gray-200"
                      setValue={(e: any) => handleInputChange(index, 'received_from', e)}
                      value={row?.received_from?.uid ? row?.received_from : ''}
                    />
                  </TableCell>
                  <TableCell className="flex items-center justify-center text-center">
                    <AccountSelectDropDown
                      ClassName="rounded-lg border min-w-[180px] px-3 mt-4  outline-none disabled:bg-gray-200"
                      setValue={(e: any) => handleInputChange(index, 'account', e)}
                      value={row?.account}
                    />
                  </TableCell>
                  <TableCell className="border-b px-1">
                    <input
                      type="text"
                      className="w-full min-w-[250px] rounded-lg border py-2 text-center outline-none hover:border-b-2 focus:border-b-2 focus:border-accent_soft_blue disabled:bg-gray-200"
                      value={row.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="border-b px-1">
                    <PayMethodSelectDropdown
                      ClassName="rounded-lg border min-w-[200px]  px-3 py-2 outline-none disabled:bg-gray-200"
                      value={row?.payment_method}
                      setValue={(e: any) => {
                        handleInputChange(index, 'payment_method', e);
                      }}
                    />
                  </TableCell>
                  <TableCell className="border-b px-1">
                    <input
                      type="text"
                      className="w-full rounded-lg border py-2 text-center outline-none hover:border-b-2 focus:border-b-2 focus:border-accent_soft_blue disabled:bg-gray-200 max-md:min-w-32"
                      value={row.ref_number}
                      onChange={(e) => handleInputChange(index, 'ref_number', e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="border-b px-1">
                    <input
                      type="number"
                      className="w-full rounded-lg border py-2 text-center outline-none hover:border-b-2 focus:border-b-2 focus:border-accent_soft_blue disabled:bg-gray-200 max-md:min-w-32"
                      value={row.amount}
                      onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                    />
                  </TableCell>
                  <TableCell
                    onClick={() => removeLine(index, row?.uid)}
                    className="cursor-pointer border-b p-6"
                  >
                    <RiDeleteBin6Line className="text-red-500" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center gap-4 px-4">
            <Button
              onClick={addLine}
              // style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
              className="border px-4 py-2 text-sm font-normal hover:shadow-md"
            >
              Add New
            </Button>
            <Button
              onClick={removeALLLine}
              // style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
              className="border px-4 py-2 text-sm font-normal hover:shadow-md"
            >
              Remove all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToFundTable;
