'use client';

import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import ReportFilter from '../_components/filter';
import moment from 'moment';

interface Transaction {
  date: string;
  type: string;
  num: string;
  customerName: string;
  lineDescription: string;
  quantity: number;
  salesPrice: number;
  amount: number;
  balance: number;
}

interface SubItem {
  id: string;
  name: string;
  count: number;
  transactions: Transaction[];
  totalQuantity: number;
  totalAmount: number;
  subItems?: SubItem[];
}

interface Category {
  id: string;
  name: string;
  count: number;
  subItems: SubItem[];
  totalQuantity: number;
  totalAmount: number;
}

const TaxableSalesDetail: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(['landscaping', 'design', 'sod', 'fountains', 'rock-fountain'])
  );

  const salesData = [
    {
      id: 'landscaping',
      name: 'Landscaping',
      count: 1,
      totalQuantity: 15.0,
      totalAmount: 131.25,
      subItems: [
        {
          id: 'sod',
          name: 'Sod',
          count: 1,
          totalQuantity: 15.0,
          totalAmount: 131.25,
          transactions: [
            {
              date: '02/08/2025',
              type: 'Invoice',
              num: '1030',
              customerName: 'Freeman Sporting Goods:0969 ...',
              lineDescription: 'Sod',
              quantity: 15.0,
              salesPrice: 8.75,
              amount: 131.25,
              balance: 131.25,
            },
          ],
        },
      ],
    },
    {
      id: 'design',
      name: 'Design',
      count: 1,
      totalQuantity: 1.0,
      totalAmount: 275.0,
      subItems: [
        {
          id: 'fountains',
          name: 'Fountains',
          count: 1,
          totalQuantity: 1.0,
          totalAmount: 275.0,
          subItems: [
            {
              id: 'rock-fountain',
              name: 'Rock Fountain',
              count: 1,
              totalQuantity: 1.0,
              totalAmount: 275.0,
              transactions: [
                {
                  date: '03/11/2025',
                  type: 'Invoice',
                  num: '1031',
                  customerName: 'Freeman Sporting Goods:0969 ...',
                  lineDescription: 'Rock Fountain',
                  quantity: 1.0,
                  salesPrice: 275.0,
                  amount: 275.0,
                  balance: 275.0,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const SortIcon: React.FC = () => (
    <div className="ml-1 flex flex-col">
      <FiChevronUp className="h-3 w-3 text-gray-400" />
      <FiChevronDown className="-mt-1 h-3 w-3 text-gray-400" />
    </div>
  );

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatQuantity = (quantity: number) => {
    return quantity.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderSubItem = (subItem: SubItem, level = 0): React.ReactNode => {
    const paddingLeft = `${(level + 1) * 20}px`;
    const isExpanded = expandedItems.has(subItem.id);

    return (
      <React.Fragment key={subItem.id}>
        {/* Sub-item header */}
        <tr
          className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
          onClick={() => toggleItem(subItem.id)}
        >
          <td
            className="border-r border-gray-200 px-4 py-2 text-sm text-gray-700"
            style={{ paddingLeft }}
          >
            <div className="flex items-center">
              {isExpanded ? (
                <FiChevronDown className="mr-2 h-4 w-4 text-gray-600" />
              ) : (
                <FiChevronRight className="mr-2 h-4 w-4 text-gray-600" />
              )}
              {subItem.name} ({subItem.count})
            </div>
          </td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="border-r border-gray-200 px-4 py-2"></td>
          <td className="px-4 py-2 text-right text-sm text-gray-700">
            {formatCurrency(subItem.totalAmount)}
          </td>
        </tr>

        {/* Render nested sub-items if expanded */}
        {isExpanded &&
          subItem.subItems?.map((nestedSubItem) => renderSubItem(nestedSubItem, level + 1))}

        {/* Render transactions if expanded */}
        {isExpanded &&
          subItem.transactions?.map((transaction, index) => (
            <tr
              key={`${subItem.id}-transaction-${index}`}
              className="hover:bg-gray-25 border-t border-gray-50"
            >
              <td
                className="border-r border-gray-200 px-4 py-2 text-sm text-gray-600"
                style={{ paddingLeft: `${(level + 2) * 20}px` }}
              >
                {transaction.date}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-sm text-gray-600">
                {transaction.type}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-sm text-gray-600">
                {transaction.num}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-sm text-gray-600">
                {transaction.customerName}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-sm text-gray-600">
                {transaction.lineDescription}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-right text-sm text-gray-600">
                {formatQuantity(transaction.quantity)}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-right text-sm text-gray-600">
                {formatCurrency(transaction.salesPrice)}
              </td>
              <td className="border-r border-gray-200 px-4 py-2 text-right text-sm text-gray-600">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="px-4 py-2 text-right text-sm text-gray-600">
                {formatCurrency(transaction.balance)}
              </td>
            </tr>
          ))}

        {/* Sub-item total */}
        {isExpanded && (
          <tr className="border-t border-gray-200 bg-gray-50">
            <td
              className="border-r border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
              style={{ paddingLeft: `${(level + 1) * 20}px` }}
            >
              Total for {subItem.name}
            </td>
            <td className="border-r border-gray-200 px-4 py-2"></td>
            <td className="border-r border-gray-200 px-4 py-2"></td>
            <td className="border-r border-gray-200 px-4 py-2"></td>
            <td className="border-r border-gray-200 px-4 py-2"></td>
            <td className="border-r border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">
              {formatQuantity(subItem.totalQuantity)}
            </td>
            <td className="border-r border-gray-200 px-4 py-2"></td>
            <td className="border-r border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">
              ${formatCurrency(subItem.totalAmount)}
            </td>
            <td className="px-4 py-2"></td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const grandTotalQuantity = salesData.reduce((sum, category) => sum + category.totalQuantity, 0);
  const grandTotalAmount = salesData.reduce((sum, category) => sum + category.totalAmount, 0);

  const printReport = () => {
    const printContent = document.getElementById('report-content')?.innerHTML;
    const printWindow = window.open('', '_blank');

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');

      printWindow.document.write(`
        <html>
          <head>
            <style>${styles}</style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <>
      <ReportFilter
        defaultRange="this_month"
        params={{
          created_at_after: moment().startOf('week').format('YYYY-MM-DD'),
          created_at_before: moment().endOf('week').format('YYYY-MM-DD'),
        }}
        setParams={(newParams: any) => {}}
        onFilterChange={() => {}}
      />
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={printReport}
          className="black-2 rounded-lg bg-gray-400 p-2 px-6 text-sm font-semibold text-white"
        >
          Print
        </button>
      </div>
      <div
        style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
        className="my-8 rounded-xl border bg-white/40 p-6"
        id="report-content"
      >
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">Taxable Sales Detail</h1>
          <p className="text-gray-600">Craig's Design and Landscaping Services</p>
          <p className="text-gray-600">January-March, 2025</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white/60">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-50 text-base">
              <tr>
                <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                  <div className="flex items-center">Transaction date</div>
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                  <div className="flex items-center">Transaction type</div>
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                  <div className="flex items-center">Num</div>
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                  <div className="flex items-center">Customer full name</div>
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-left font-medium text-gray-700">
                  <div className="flex items-center">Line description</div>
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-right font-medium text-gray-700">
                  <div className="flex items-center justify-end">Quantity</div>
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-right font-medium text-gray-700">
                  Sales price
                </th>
                <th className="border-r border-gray-200 px-4 py-3 text-right font-medium text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Balance</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className=" text-sm">
              {salesData.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Category Header */}
                  <tr
                    className="cursor-pointer border-t border-gray-200 bg-gray-50 hover:bg-gray-100"
                    onClick={() => toggleItem(category.id)}
                  >
                    <td className="border-r border-gray-200 px-4 py-3 text-sm font-medium text-gray-800">
                      <div className="flex items-center">
                        {expandedItems.has(category.id) ? (
                          <FiChevronDown className="mr-2 h-4 w-4 text-gray-600" />
                        ) : (
                          <FiChevronRight className="mr-2 h-4 w-4 text-gray-600" />
                        )}
                        {category.name} ({category.count})
                      </div>
                    </td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="border-r border-gray-200 px-4 py-3"></td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-800">
                      {formatCurrency(category.totalAmount)}
                    </td>
                  </tr>

                  {/* Render sub-items */}
                  {expandedItems.has(category.id) &&
                    category.subItems.map((subItem: any) => renderSubItem(subItem, 0))}

                  {/* Category Total */}
                  {expandedItems.has(category.id) && (
                    <tr className="border-t border-gray-300 bg-gray-100">
                      <td className="border-r border-gray-200 px-4 py-3 pl-5 text-sm font-medium text-gray-800">
                        Total for {category.name} with sub-items
                      </td>
                      <td className="border-r border-gray-200 px-4 py-3"></td>
                      <td className="border-r border-gray-200 px-4 py-3"></td>
                      <td className="border-r border-gray-200 px-4 py-3"></td>
                      <td className="border-r border-gray-200 px-4 py-3"></td>
                      <td className="border-r border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-800">
                        {formatQuantity(category.totalQuantity)}
                      </td>
                      <td className="border-r border-gray-200 px-4 py-3"></td>
                      <td className="border-r border-gray-200 px-4 py-3 text-right text-sm font-medium text-gray-800">
                        ${formatCurrency(category.totalAmount)}
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {/* Grand Total */}
              <tr className="border-t bg-gray-50 font-bold">
                <td className="border-r border-gray-200 px-4 py-4 text-sm text-gray-900">TOTAL</td>
                <td className="border-r border-gray-200 px-4 py-4"></td>
                <td className="border-r border-gray-200 px-4 py-4"></td>
                <td className="border-r border-gray-200 px-4 py-4"></td>
                <td className="border-r border-gray-200 px-4 py-4"></td>
                <td className="border-r border-gray-200 px-4 py-4 text-right text-sm text-gray-900">
                  {formatQuantity(grandTotalQuantity)}
                </td>
                <td className="border-r border-gray-200 px-4 py-4"></td>
                <td className="border-r border-gray-200 px-4 py-4 text-right text-sm text-gray-900">
                  ${formatCurrency(grandTotalAmount)}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Accrual basis | Saturday, June 21, 2025 09:45 PM GMT+06:00
          </p>
        </div>
      </div>
    </>
  );
};

export default TaxableSalesDetail;
