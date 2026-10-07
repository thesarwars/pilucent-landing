"use client"

import React from "react"
import { useState } from "react"
import Button from "@/components/ui/RawButton"

interface UpdateTransactionProps {
  setIsOpen: (isOpen: boolean) => void
}

const UpdateTransaction: React.FC<UpdateTransactionProps> = ({ setIsOpen }) => {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  return (
    <div className="w-full">
      <div className="rounded-lg">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-6">
              Which Account do you use for the following liabilities/assets?
            </p>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Important:</span> If you use the Closing the Books feature, set your Starting Date to a more recent date than your Closing date.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-2">
                Select a start and end to date to update your transactions.
              </p>
              <p className="text-sm text-blue-600">
                <span className="font-medium">Note:</span> There's a limit of 200 transactions per date range
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="MM/dd/yyyy"
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-700 focus:border-gray-300 focus:outline-none pr-10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="MM/dd/yyyy"
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-700 focus:border-gray-300 focus:outline-none pr-10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-[120px] cursor-pointer rounded-lg border border-indigo-500 py-2.5 text-center font-medium text-indigo-500 hover:bg-indigo-50"
            >
              Cancel
            </Button>
            <Button
              className="w-[120px] bg-black text-white rounded-lg py-2.5 font-medium hover:bg-[#00024A]"
              type="submit"
              isLoading={false}
              onClick={() => {
                setIsOpen(false)
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateTransaction