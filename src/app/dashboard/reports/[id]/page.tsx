"use client"
import { useState } from "react"
import { FaCalendar, FaChevronDown, FaMinus, FaPlus } from "react-icons/fa"

type Section = {
  id: string
  title: string
  isExpanded: boolean
  children?: Section[]
  amount?: string
  previousAmount?: string
}

const ReportDetails = () => {
  const [reportPeriod, setReportPeriod] = useState("Today")
  const [displayColumns, setDisplayColumns] = useState("Other")
  const [dateRange, setDateRange] = useState("DD-MM-YY - DD-MM-YY")
  const [accountingMethod, setAccountingMethod] = useState("Accrual")
  const [showNonZero, setShowNonZero] = useState(true)

  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      title: "Fixed Asset",
      isExpanded: true,
      children: [
        {
          id: "1.1",
          title: "Total Fixed Asset",
          isExpanded: true,
          children: [
            {
              id: "1.1.1",
              title: "Cash at bank and in hand",
              isExpanded: true,
              children: [
                {
                  id: "1.1.1.1",
                  title: "Cash on hand",
                  amount: "127,290.00",
                  previousAmount: "0.0",
                  isExpanded: true,
                },
              ],
            },
            {
              id: "1.1.2",
              title: "Debtors - BDT",
              amount: "-250.00",
              previousAmount: "0.0",
              isExpanded: true,
            },
          ],
        },
        {
          id: "1.2",
          title: "Total Debtors",
          amount: "$265,890.00",
          previousAmount: "$0.00",
          isExpanded: true,
        },
        {
          id: "1.3",
          title: "Total Current Assets",
          amount: "$37,891,666.71",
          previousAmount: "$0.00",
          isExpanded: true,
        },
      ],
    },
    {
      id: "2",
      title: "NET CURRENT ASSETS",
      amount: "$36,284,566.71",
      previousAmount: "$0.00",
      isExpanded: true,
      children: [
        {
          id: "2.1",
          title: "Creditors: amounts falling due within one year",
          isExpanded: true,
          children: [
            {
              id: "2.1.1",
              title: "Trade Creditors",
              isExpanded: true,
              children: [
                {
                  id: "2.1.1.1",
                  title: "Creditors",
                  amount: "1,256,996.67",
                  previousAmount: "0.0",
                  isExpanded: true,
                },
              ],
            },
          ],
        },
        {
          id: "2.2",
          title: "Total Trade Creditors",
          amount: "$1,256,996.67",
          previousAmount: "$0.00",
          isExpanded: true,
        },
        {
          id: "2.3",
          title: "Current Liabilities",
          isExpanded: true,
          children: [
            {
              id: "2.3.1",
              title: "Current Year Control",
              amount: "17,916.67",
              previousAmount: "0.0",
              isExpanded: true,
            },
            {
              id: "2.3.2",
              title: "VAT Control",
              amount: "165,273.24",
              previousAmount: "0.0",
              isExpanded: true,
            },
          ],
        },
        {
          id: "2.4",
          title: "Total Current Liabilities",
          amount: "$1,607,100.00",
          previousAmount: "$0.00",
          isExpanded: true,
        },
      ],
    },
    {
      id: "3",
      title: "Capital and Reserves",
      isExpanded: true,
      children: [
        {
          id: "3.1",
          title: "Opening Balance Equity",
          amount: "35,500,500.00",
          previousAmount: "0.0",
          isExpanded: true,
        },
        {
          id: "3.2",
          title: "Retained Earnings",
          amount: "",
          previousAmount: "0.0",
          isExpanded: true,
        },
        {
          id: "3.3",
          title: "Profit for the year",
          amount: "1,474,898.38",
          previousAmount: "0.0",
          isExpanded: true,
        },
        {
          id: "3.4",
          title: "Total Capital and Reserves",
          amount: "$37,175,308.38",
          previousAmount: "$0.00",
          isExpanded: true,
        },
      ],
    },
  ])

  const toggleSection = (sectionId: string) => {
    setSections((prevSections) => {
      const updateSection = (sections: Section[]): Section[] => {
        return sections.map((section) => {
          if (section.id === sectionId) {
            return { ...section, isExpanded: !section.isExpanded }
          }
          if (section.children) {
            return {
              ...section,
              children: updateSection(section.children),
            }
          }
          return section
        })
      }
      return updateSection(prevSections)
    })
  }

  const printReport = () => {
    const printContents = document.getElementById("report-content")?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const renderSection = (section: Section, level = 0) => {
    const hasChildren = section.children && section.children.length > 0

    return (
      <div key={section.id} className="w-full">
        <div
          className={`grid grid-cols-3 text-sm hover:bg-gray-50 ${level > 0 ? "pl-4" : ""} ${section.title.startsWith("Total") ? "font-semibold" : ""}`}
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <div className="col-span-1 flex items-center py-1">
            {hasChildren && (
              <button onClick={() => toggleSection(section.id)} className="mr-2 p-1 hover:bg-gray-200 rounded">
                {section.isExpanded ? (
                  <FaMinus className="h-3 w-3 text-gray-600" />
                ) : (
                  <FaPlus className="h-3 w-3 text-gray-600" />
                )}
              </button>
            )}
            <span>{section.title}</span>
          </div>
          <div className="col-span-1 text-right pr-4">{section.amount}</div>
          <div className="col-span-1 text-right pr-4">{section.previousAmount}</div>
        </div>

        {section.isExpanded && section.children && (
          <div className="w-full">{section.children.map((child) => renderSection(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="">
      {/* Form Section */}
      <div className="bg-[#F8F8FF] rounded-lg shadow-sm mb-8 p-4">
        <h1 className="text-xl font-semibold mb-6">Balance Sheet Comparison Report</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Report Period</label>
            <div className="flex items-center border rounded-md p-2 bg-white">
              <input type="text" value={reportPeriod} readOnly className="flex-1 outline-none" />
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Date Range</label>
            <div className="flex items-center border rounded-md p-2 bg-white">
              <input type="text" value={dateRange} readOnly className="flex-1 outline-none" />
              <FaCalendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Display Columns by</label>
            <div className="flex items-center border rounded-md p-2 bg-white">
              <input type="text" value={displayColumns} readOnly className="flex-1 outline-none" />
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Accounting Method</label>
            <div className="flex items-center border rounded-md p-2 bg-white">
              <input type="text" value={accountingMethod} readOnly className="flex-1 outline-none" />
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showNonZero}
              onChange={(e) => setShowNonZero(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Show Non-Zero Active Only</span>
          </label> */}

          <button
            //   onClick={handleSubmit}
            type="submit"
            value="Submit"
            //   disabled={isLoadings}
            className="rounded-lg bg-accent_dark_blue px-6 py-2 text-sm font-semibold leading-[21px] text-white"
          >
            Run Report
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <div>
        </div>
        <div className="justify-end">
          {/* print button */}
          <button onClick={printReport} className="rounded-lg bg-gray-300 px-6 py-2 text-sm font-semibold leading-[21px] text-white">
            Print
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content" className="bg-white shadow-sm p-6">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xl font-semibold text-gray-800">Binary Burst</div>
          <p className="text-sm text-gray-600">Balance Sheet Comparison</p>
          <p className="text-sm text-gray-600">As of November 30, 2024</p>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-3 border-y-2 border-black">
            <div className="col-span-1"></div>
            <div className="col-span-2 text-center border-l-2 border-black">
              <h1 className="py-2">Total</h1>
              <div className="grid grid-cols-2 border-t-2 border-black py-2 bg-gray-100">
                <p className="text-right px-4">AS OF NOV 30, 2024</p>
                <p className="px-4">AS OF NOV 30, 2023 (PY)</p>
              </div>
            </div>
          </div>

          {sections.map((section) => renderSection(section))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          Accrual basis, Monday, 9 December 2024, 04:21 pm GMT+06:00
        </div>
      </div>
    </div>
  )
}

export default ReportDetails

