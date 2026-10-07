"use client"
import { useState } from "react"
import { FaCalendar, FaChevronDown, FaMinus, FaPlus } from "react-icons/fa"

type Section = {
  id: string
  title: string
  isExpanded: boolean
  children?: Section[]
  amount?: string
  percentage?: string
}

const ProfitLossReport = () => {
  const [reportPeriod, setReportPeriod] = useState("All Transactions")
  const [displayColumns, setDisplayColumns] = useState("Total Only")
  const [dateRange, setDateRange] = useState("DD-MM-YY - DD-MM-YY")
  const [accountingMethod, setAccountingMethod] = useState("Accrual")

  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      title: "Income",
      isExpanded: true,
      children: [
        {
          id: "1.1",
          title: "Billable Expense Income",
          amount: "-100.00",
          percentage: "-0.01988%",
          isExpanded: true,
        },
        {
          id: "1.2",
          title: "Discounts given",
          amount: "-100.00",
          percentage: "-0.01988%",
          isExpanded: true,
        },
        {
          id: "1.3",
          title: "Sales of Product Income",
          amount: "523,125.01",
          percentage: "104.01625%",
          isExpanded: true,
        }
      ]
    },
    {
      id: "2",
      title: "Cost of Sales",
      isExpanded: true,
      children: [
        {
          id: "2.1",
          title: "Cost of sales",
          amount: "146,559.98",
          percentage: "29.14047%",
          isExpanded: true,
        },
        {
          id: "2.2",
          title: "Stock Shortage",
          amount: "-1,318,333.39",
          percentage: "-262.13319%",
          isExpanded: true,
        }
      ]
    },
    {
      id: "3",
      title: "Total Cost of Sales",
      amount: "$ -1,171,773.37",
      percentage: "-232.06371%",
      isExpanded: true,
    },
    {
      id: "4",
      title: "GROSS PROFIT",
      amount: "$1,674,508.38",
      percentage: "332.06371%",
      isExpanded: true,
    },
    {
      id: "5",
      title: "Expenses",
      isExpanded: true,
      children: [
        {
          id: "5.1",
          title: "Purchases",
          amount: "-100.00",
          percentage: "-0.01988%",
          isExpanded: true,
        }
      ]
    },
    {
      id: "6",
      title: "Uncategorized Expense",
      isExpanded: true,
      children: [
        {
          id: "6.1",
          title: "Biddut Bill DIN",
          amount: "-50.00",
          percentage: "-0.00994%",
          isExpanded: true,
        },
        {
          id: "6.2",
          title: "Total Uncategorized Expenses",
          amount: "-150.00",
          percentage: "-0.02983%",
          isExpanded: true,
        },
        {
          id: "6.3",
          title: "Water Bill DIN",
          amount: "100.00",
          percentage: "0.01988%",
          isExpanded: true,
        }
      ]
    },
    {
      id: "7",
      title: "Total Expenses",
      amount: "$ -150.00",
      percentage: "-0.02983%",
      isExpanded: true,
    },
    {
      id: "8",
      title: "NET OPERATING INCOME",
      amount: "$1,674,508.38",
      percentage: "333.01354%",
      isExpanded: true,
    },
    {
      id: "9",
      title: "Other Expenses",
      isExpanded: true,
      children: [
        {
          id: "9.1",
          title: "Unrealized Gain or Loss",
          amount: "0.0",
          percentage: "0.00%",
          isExpanded: true,
        }
      ]
    },
    {
      id: "10",
      title: "Total Other Expenses",
      amount: "$0.00",
      percentage: "0.00%",
      isExpanded: true,
    },
    {
      id: "11",
      title: "NET OTHER INCOME",
      amount: "$0.00",
      percentage: "0.00%",
      isExpanded: true,
    },
    {
      id: "12",
      title: "NET INCOME",
      amount: "$1,674,508.38",
      percentage: "333.01354%",
      isExpanded: true,
    }
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
    const isTotal = section.title.startsWith("Total") || 
                   section.title === "NET INCOME" || 
                   section.title === "GROSS PROFIT" || 
                   section.title === "NET OPERATING INCOME" ||
                   section.title === "NET OTHER INCOME"

    return (
      <div key={section.id} className="w-full">
        <div
          className={`grid grid-cols-3 text-sm hover:bg-gray-50 ${level > 0 ? "pl-4" : ""} ${isTotal ? "font-semibold" : ""}`}
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
          <div className="col-span-1 text-right pr-4">{section.percentage}</div>
        </div>

        {section.isExpanded && section.children && (
          <div className="w-full">{section.children.map((child) => renderSection(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Form Section */}
      <div className="bg-[#F8F8FF] rounded-lg shadow-sm mb-8 p-4">
        <h1 className="text-xl font-semibold mb-6">Profit and Loss % Total Income Report</h1>

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
          <button
            type="submit"
            className="rounded-lg bg-accent_dark_blue px-6 py-2 text-sm font-semibold leading-[21px] text-white"
          >
            Run Report
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div></div>
        <div>
          <button onClick={printReport} className="rounded-lg bg-gray-300 px-6 py-2 text-sm font-semibold leading-[21px] text-white">
            Print
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content" className="bg-white shadow-sm p-6">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xl font-semibold text-gray-800">Binary Burst</div>
          <p className="text-sm text-gray-600">Profit and Loss % of Total Income</p>
          <p className="text-sm text-gray-600">January - November 2024</p>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-3 border-y-2 border-black">
            <div className="col-span-1"></div>
            <div className="col-span-2 text-center border-l-2 border-black">
              <h1 className="py-2">TOTAL</h1>
              <div className="grid grid-cols-2 border-t-2 border-black py-2 bg-gray-100">
                <p className="text-right px-4">JAN - NOV, 2024</p>
                <p className="text-right px-4">% OF INCOME</p>
              </div>
            </div>
          </div>

          {sections.map((section) => renderSection(section))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          Accrual basis, Monday, 9 December 2024, 04:25 pm GMT+06:00
        </div>
      </div>
    </div>
  )
}

export default ProfitLossReport