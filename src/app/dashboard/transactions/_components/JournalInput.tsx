import React, { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";

const JournalEntryTable = () => {
  const [rows, setRows] = useState([
    { account: '', description: '', debit: '', credit: '', amount: '', tax: '' }
  ]);
  const [dropdownOpen, setDropdownOpen] = useState<{[key: string]: boolean}>({});

  const addRow = () => {
    setRows([...rows, { account: '', description: '', debit: '', credit: '', amount: '', tax: '' }]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, idx) => idx !== index);
    setRows(newRows);
  };

  const toggleDropdown = (field: string, index: number) => {
    setDropdownOpen({
      ...dropdownOpen,
      [`${field}-${index}`]: !dropdownOpen[`${field}-${index}`]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(rows);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#F8F8FF] text-sm text-accent_text_gray">
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Tax</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-right">Debits (USD)</th>
              <th className="px-4 py-3 text-right">Credits (USD)</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="bg-[#F8F8FF]">
                <td className="px-4 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full cursor-pointer border-none bg-transparent px-3 py-2 outline-none"
                      placeholder="Select Account"
                      onClick={() => toggleDropdown('account', index)}
                    />
                    <IoIosArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 transform" />
                    {dropdownOpen[`account-${index}`] && (
                      <div className="absolute left-0 top-full z-10 w-full rounded-md border bg-white shadow-lg">
                        <div className="p-2">
                          <div className="cursor-pointer p-2 hover:bg-gray-100">Account 1</div>
                          <div className="cursor-pointer p-2 hover:bg-gray-100">Account 2</div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    className="w-full border-none bg-transparent px-3 py-2 outline-none"
                    placeholder="Enter description"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full cursor-pointer border-none bg-transparent px-3 py-2 outline-none"
                      placeholder="Select Tax"
                      onClick={() => toggleDropdown('tax', index)}
                    />
                    <IoIosArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 transform" />
                    {dropdownOpen[`tax-${index}`] && (
                      <div className="absolute left-0 top-full z-10 w-full rounded-md border bg-white shadow-lg">
                        <div className="p-2">
                          <div className="cursor-pointer p-2 hover:bg-gray-100">20% VAT</div>
                          <div className="cursor-pointer p-2 hover:bg-gray-100">Custom Rate</div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full cursor-pointer border-none bg-transparent px-3 py-2 outline-none"
                      placeholder="Select Location"
                      onClick={() => toggleDropdown('location', index)}
                    />
                    <IoIosArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 transform" />
                    {dropdownOpen[`location-${index}`] && (
                      <div className="absolute left-0 top-full z-10 w-full rounded-md border bg-white shadow-lg">
                        <div className="p-2">
                          <div className="cursor-pointer p-2 hover:bg-gray-100">Main</div>
                          <div className="cursor-pointer p-2 hover:bg-gray-100">Branch</div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="w-full border-none bg-transparent px-3 py-2 text-right outline-none"
                    placeholder="0.0"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="w-full border-none bg-transparent px-3 py-2 text-right outline-none"
                    placeholder="0.0"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-[#6A6EF6] hover:underline"
          >
            + Add a section
          </button>
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-[#6A6EF6] hover:underline"
          >
            + Add an account
          </button>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="mr-8">Subtotal</span>
            <span className="inline-block w-32 text-right">$100.00</span>
          </div>
          <div className="mb-2">
            <span className="mr-8">VAT @ 25% on 125.00</span>
            <input
              type="text"
              className="w-32 rounded border px-2 py-1 text-right"
              placeholder="0.0"
            />
          </div>
          <div>
            <span className="mr-8 font-bold">Total</span>
            <span className="inline-block w-32 text-right font-bold">$100.00</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default JournalEntryTable;