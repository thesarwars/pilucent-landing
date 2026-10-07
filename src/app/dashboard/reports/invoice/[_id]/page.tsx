"use client"

import React, { useState } from "react"
import { FaChevronDown, FaChevronRight } from "react-icons/fa"

interface Transaction {
  date: string
  type: string
  memo?: string
  no?: string
  amount: number
}

interface GroupData {
  name: string
  transactions: Transaction[]
}

const InvoiceReport = () => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Nijum: true,
    Suzon: true,
  })

  const data: GroupData[] = [
    {
      name: "Nijum",
      transactions: [
        { date: "03/01/2025", type: "Payment", amount: 0 },
        { date: "14/10/2024", type: "Invoice", no: "1007", amount: 750000.0 },
        { date: "20/11/2024", type: "Journal Entry", no: "7", amount: -10.0 },
        { date: "03/01/2025", type: "Credit Note", no: "1021", amount: -600.0 },
      ],
    },
    {
      name: "Suzon",
      transactions: [
        { date: "06/01/2025", type: "Payment", amount: 4438.38 },
        { date: "16/12/2024", type: "Invoice", no: "1017", amount: 250000.0 },
        { date: "06/01/2025", type: "Credit Note", no: "1023", amount: -250000.0 },
        { date: "28/01/2025", type: "Payment", amount: -55.18 },
        { date: "28/01/2025", type: "Invoice", no: "1024", amount: 250000.0 },
        { date: "06/01/2025", type: "Credit Note", no: "1023", amount: -250000.0 },
      ],
    },
  ]

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Binary Burst</h1>
        <h2 className="text-xl mb-1">Invoices and Received Payments</h2>
        <p className="text-gray-600">1 January - 3 February, 2025</p>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b px-4 py-2 text-left">DATE</th>
              <th className="border-b px-4 py-2 text-left">TRANSACTION TYPE</th>
              <th className="border-b px-4 py-2 text-left">MEMO/DESCRIPTION</th>
              <th className="border-b px-4 py-2 text-left">NO.</th>
              <th className="border-b px-4 py-2 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {data.map((group) => (
              <React.Fragment key={group.name}>
                {/* Group Header */}
                <tr className="bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={() => toggleGroup(group.name)}>
                  <td colSpan={5} className="px-4 py-2 font-semibold">
                    <div className="flex items-center gap-2">
                      {expandedGroups[group.name] ? (
                        <FaChevronDown className="w-4 h-4" />
                      ) : (
                        <FaChevronRight className="w-4 h-4" />
                      )}
                      {group.name}
                    </div>
                  </td>
                </tr>
                {/* Group Transactions */}
                {expandedGroups[group.name] &&
                  group.transactions.map((transaction, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border-b px-4 py-2">{transaction.date}</td>
                      <td className="border-b px-4 py-2">{transaction.type}</td>
                      <td className="border-b px-4 py-2">{transaction.memo || ""}</td>
                      <td className="border-b px-4 py-2">{transaction.no || ""}</td>
                      <td className="border-b px-4 py-2 text-right">{formatAmount(transaction.amount)}</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InvoiceReport

