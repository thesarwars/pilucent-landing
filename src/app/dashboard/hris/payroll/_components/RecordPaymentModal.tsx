import React, { useState } from 'react';
import { IoInformationCircleOutline, IoCalendarOutline } from 'react-icons/io5';
import Button from "@/components/ui/RawButton";

const RecordPaymentModal = ({ isOpen = true, onClose = () => { } }) => {
  // State for form fields
  const [paymentDate, setPaymentDate] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [addToPrintQueue, setAddToPrintQueue] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Mock tax item data
  const taxItem = {
    taxType: "Federal Estimated Tax",
    amount: 1250.75,
    period: "01-01-2025 - 03-31-2025 (Q1)",
    dueDate: "04-15-2025"
  };

  if (!isOpen || !taxItem) return null;

  // Extract date ranges from period string
  const periodDates = taxItem.period.split(' - ')[0] + ' - ' + taxItem.period.split(' - ')[1].split(' ')[0];

  return (
    <div className='bg-accent_bg_gray rounded-md'>
      <div className='p-6'>
        <div className="mb-4 p-4 bg-blue-50 flex gap-3 border-2 border-[#6A6EF6] rounded-md">
          <IoInformationCircleOutline className="text-[#6A6EF6] text-xl flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Important!</span> You are making this payment before the end of the tax period. This tax should only be paid after all wages have been entered for the period. If you do not want to make this payment now, click <span className="text-blue-600 font-medium">Cancel</span> at the bottom.
          </div>
        </div>

        {/* Payment date info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-md flex gap-3 border-2 border-[#6A6EF6]">
          <IoInformationCircleOutline className="text-blue-500 text-xl flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-600">
            Enter the payment date. Once you click record payment, Pilucent provides specific instructions about how to pay this tax.
          </div>
        </div>

        {/* Tax details */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{taxItem.taxType}</h3>
            <span className="text-xl font-semibold">${taxItem.amount.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Liability Period</p>
              <p>{periodDates}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p>{taxItem.dueDate}</p>
            </div>
          </div>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full text-left p-3 bg-gray-100 rounded flex items-center text-blue-600"
          >
            <span className="mr-2">{showBreakdown ? "▼" : "▶"}</span> Show breakdown
          </button>
          {showBreakdown && (
            <div className="mt-3 p-4 border rounded">
              <p>Tax calculation details would appear here.</p>
              <div className="mt-2">
                <div className="flex justify-between text-sm py-1">
                  <span>Federal Income Tax (Q1)</span>
                  <span>$875.25</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span>Self Employment Tax</span>
                  <span>$375.50</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>${taxItem.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">How this will be paid</h3>
          <p className="text-gray-700 mb-2">Outside of Pilucent</p>
          <p className="text-gray-500 text-sm mb-3">Make the Payment yourself and we`&apos;`ll add it to your books here.</p>

          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="printQueue"
              checked={addToPrintQueue}
              onChange={() => setAddToPrintQueue(!addToPrintQueue)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="printQueue" className="text-gray-700">Add to print check queue</label>
          </div>
        </div>

        {/* Payment details */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Now for details</h3>

          <div className="mb-4">
            <label className="flex items-center text-gray-700 mb-2">
              Record to
              <IoInformationCircleOutline className="ml-2 text-gray-400" />
            </label>
            <div className="relative">
              <select className="w-full p-2 border rounded appearance-none pr-8">
                <option>Bank of America - 2367</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-1">Balance: -$3,334.19</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Payment Date</label>
            <div className="relative">
              <input
                type="text"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                placeholder="MM-DD-YYYY"
                className="w-full p-2 border rounded pl-3 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <IoCalendarOutline className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Check Number (optional)</label>
            <input
              type="text"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <Button
            className="px-6 py-2 border-2 border-[#6A6EF6] rounded-md text-[#6A6EF6] bg-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="px-6 py-2 bg-black text-white rounded-md"
            onClick={() => {
              console.log('Payment recorded', {
                taxItem,
                paymentDate,
                checkNumber,
                notes,
                addToPrintQueue
              });
              onClose();
            }}
          >
            Record Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;