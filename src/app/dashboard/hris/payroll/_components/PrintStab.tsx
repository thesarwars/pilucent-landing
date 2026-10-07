"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PayStubGenerator from "./PrintStab";
import { useRouter } from "next/navigation";
import moment from "moment";
import html2pdf from 'html2pdf.js';

const PreviewPayroll = () => {
  const { previewpayroll } = useSelector((state: any) => state.employee);
  const router = useRouter();
  
  // Sample data structure matching your provided data
  const sampleData = [
    {
      "employeeInfo": {
        "employeeName": "Nijum H Niloy",
        "profileId": "d0ed7e2c-f4f5-4401-bbe2-69f65b43f697",
        "companyID": "ae80b3c6-a0e4-4d01-b3ba-1038e85ace86",
        "workingHrs": "173.3",
        "rate": "230.8",
        "salary": "39997.64",
        "OT": "0",
        "doubleOT": "0",
        "PTO": "0",
        "holidayPay": "0",
        "bonus": "0",
        "commission": "0",
        "total": "173.3",
        "employeeContribution": "0",
        "employeeDeduction": "0",
        "grossPay": "39997.64",
        "netPay": 39997,
        "payDate": "2025-08-08",
        "payType": "EVERY_MONTH"
      },
      "pay": [
        {
          "payroll_type": "Salary",
          "payroll_category": "PAY",
          "hours": 173.3,
          "rate": 230.8,
          "current": 39997.64,
          "ytd": 0
        },
        {
          "payroll_type": "Overtime",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 346.2,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "Double Overtime Pay",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 692.4,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "Holiday Pay",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 230.8,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "Bonus",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 0,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_category": "PAY",
          "payroll_type": "Commission",
          "hours": 0,
          "rate": 0,
          "current": 0,
          "ytd": 0
        }
      ],
      "employeer": [
        {
          "payroll_type": "FUTA Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 420,
          "ytd": 0
        },
        {
          "payroll_type": "Social Security Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 2479.85,
          "ytd": 0
        },
        {
          "payroll_type": "Medicare Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 579.97,
          "ytd": 0
        },
        {
          "payroll_type": "AL SUI Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "AL Employment Security Assessment Tax ",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 0,
          "ytd": 0
        }
      ],
      "employee": [
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Federal Income Tax",
          "current": 11023.94,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Social Security",
          "current": 2479.85,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Medicare",
          "current": 579.97,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "State Income Tax",
          "current": 2539.91,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Unemployment Tax",
          "current": 0,
          "ytd": 0
        }
      ]
    },
    {
      "employeeInfo": {
        "employeeName": "None None None",
        "profileId": "04c740cf-c0fe-46b1-9185-06940c380398",
        "companyID": "ae80b3c6-a0e4-4d01-b3ba-1038e85ace86",
        "workingHrs": "173.3",
        "rate": "57.7",
        "salary": "9999.41",
        "OT": "0",
        "doubleOT": "0",
        "PTO": "0",
        "holidayPay": "0",
        "bonus": "0",
        "commission": "0",
        "total": "173.3",
        "employeeContribution": "0",
        "employeeDeduction": "0",
        "grossPay": "9999.41",
        "netPay": 9999,
        "payDate": "2025-08-08",
        "payType": "EVERY_MONTH"
      },
      "pay": [
        {
          "payroll_type": "Salary",
          "payroll_category": "PAY",
          "hours": 173.3,
          "rate": 57.7,
          "current": 9999.41,
          "ytd": 0
        },
        {
          "payroll_type": "Overtime",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 86.55,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "Double Overtime Pay",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 173.1,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "Holiday Pay",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 57.7,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "Bonus",
          "payroll_category": "PAY",
          "hours": 0,
          "rate": 0,
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_category": "PAY",
          "payroll_type": "Commission",
          "hours": 0,
          "rate": 0,
          "current": 0,
          "ytd": 0
        }
      ],
      "employeer": [
        {
          "payroll_type": "FUTA Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 420,
          "ytd": 0
        },
        {
          "payroll_type": "Social Security Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 619.96,
          "ytd": 0
        },
        {
          "payroll_type": "Medicare Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 144.99,
          "ytd": 0
        },
        {
          "payroll_type": "AL SUI Employer",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 0,
          "ytd": 0
        },
        {
          "payroll_type": "AL Employment Security Assessment Tax ",
          "payroll_category": "EMPLOYER_TAXES",
          "current": 0,
          "ytd": 0
        }
      ],
      "employee": [
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Federal Income Tax",
          "current": 1503.78,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Social Security",
          "current": 619.96,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Medicare",
          "current": 144.99,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "State Income Tax",
          "current": 552.61,
          "ytd": 0
        },
        {
          "payroll_category": "EMPLOYEE_TAXES",
          "payroll_type": "Unemployment Tax",
          "current": 0,
          "ytd": 0
        }
      ]
    }
  ];

  const [payrollData, setPayrollData] = useState(sampleData);

  useEffect(() => {
    if (!previewpayroll || previewpayroll.length === 0) {
      // Use sample data for demo, or redirect
      // router.push("/dashboard/hris/payroll/salary_process")
      console.log("Using sample data");
    } else {
      console.log(previewpayroll, 'previewpayroll');
      setPayrollData(previewpayroll);
    }
  }, [previewpayroll]);

  // Define pay types mapping
  const payTypes = [
    { label: "Salary", key: "Salary" },
    { label: "Overtime", key: "Overtime" },
    { label: "Double OT", key: "Double Overtime Pay" },
    { label: "Holiday Pay", key: "Holiday Pay" },
    { label: "Bonus", key: "Bonus" },
    { label: "Commission", key: "Commission" },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate period string
  const calculatePeriod = (payDate: string, payType: string) => {
    const date = moment(payDate);
    if (payType === "EVERY_MONTH") {
      const startDate = date.clone().startOf('month').format('MM/DD/YYYY');
      const endDate = date.clone().endOf('month').format('MM/DD/YYYY');
      return `${startDate} - ${endDate}`;
    }
    return `${date.format('MM/DD/YYYY')} - ${date.format('MM/DD/YYYY')}`;
  };

  const handlePrintPDF = () => {
    const element = document.getElementById('payroll-table-container');
    const opt = {
      margin: 0.5,
      filename: `payroll-preview-${moment().format('YYYY-MM-DD')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'landscape' 
      }
    };
  
    // Temporarily hide the watermark for PDF
    const watermark = document.querySelector('.watermark');
    if (watermark) {
      (watermark as HTMLElement).style.display = 'none';
    }
  
    html2pdf().set(opt).from(element as any).save().then(() => {
      // Restore watermark after PDF generation
      if (watermark) {
        (watermark as HTMLElement).style.display = 'flex';
      }
    });
  };

  if (!payrollData || payrollData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 font-inter bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Preview payroll details</h1>
      <div id="payroll-table-container" className="rounded-xl border bg-white p-4 shadow-md relative">
        {/* Watermark */}
        <div className="watermark absolute inset-0 flex justify-center items-center pointer-events-none opacity-50">
          <span className="text-6xl font-bold text-gray-300 rotate-[-30deg]">
            Preview only
          </span>
        </div>

        {/* Header */}
        <div className="text-left mb-4">
          <h2 className="text-lg font-medium">Jumatech Accounting Firm</h2>
          <p className="text-gray-500">Preview payroll details</p>
        </div>

        {/* Print Button */}
        <div className="text-right mb-4 flex gap-2 justify-end">
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Print as PDF
          </button>
          {/* <PayStubGenerator payrollData={payrollData as any} /> */}
        </div>

        {/* Payroll Table */}
        <div className="overflow-x-auto text-[10px]">
          <table className="w-full border text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Employee</th>
                <th className="px-4 py-2 text-left border border-r-0">Pay</th>
                <th className="px-4 py-2 text-left">Hours</th>
                <th className="px-4 py-2 text-left border border-l-0">Amount</th>
                <th className="px-4 py-2 text-left border border-r-0">Deductions</th>
                <th className="px-4 py-2 text-left border border-l-0">Amount</th>
                <th className="px-4 py-2 text-left border border-r-0">Contributions</th>
                <th className="px-4 py-2 text-left border border-l-0">Amount</th>
                <th className="px-4 py-2 text-left border border-r-0">Employee Taxes</th>
                <th className="px-4 py-2 text-left border border-l-0">Amount</th>
                <th className="px-4 py-2 text-left border border-r-0">Employer Taxes</th>
                <th className="px-4 py-2 text-left border border-l-0">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((employee: any, employeeIdx: number) => (
                <React.Fragment key={employeeIdx}>
                  {/* Employee Info Row */}
                  <tr className="bg-gray-50">
                    <td rowSpan={payTypes.length + 2} className="px-4 py-2 whitespace-nowrap align-top border">
                      <p className="font-semibold">{employee.employeeInfo.employeeName}</p>
                      <p>Pay Date: {moment(employee.employeeInfo.payDate).format("MM/DD/YYYY")}</p>
                      <p>Next Pay: {moment(employee.employeeInfo.payDate).add(1, 'month').format("MM/DD/YYYY")}</p>
                      <p>{calculatePeriod(employee.employeeInfo.payDate, employee.employeeInfo.payType)}</p>
                    </td>
                  </tr>

                  {/* Pay Rows */}
                  {payTypes.map((payType, payIdx) => {
                    const payData = employee.pay.find((p: any) => 
                      p.payroll_type.toLowerCase().includes(payType.key.toLowerCase())
                    );
                    
                    const employeeTax = employee.employee[payIdx] || {};
                    const employerTax = employee.employeer[payIdx] || {};

                    return (
                      <tr key={payIdx} className="border-b">
                        <td className="px-4 p-1 border">{payType.label}</td>
                        <td className="text-left p-1 border">{payData?.hours || 0}</td>
                        <td className="text-left p-1 border border-l-0">
                          {formatCurrency(payData?.current || 0)}
                        </td>
                        
                        {/* Deductions - placeholder since not in data */}
                        <td className="text-left p-1 border border-r-0">-</td>
                        <td className="text-left p-1 border border-l-0">$0.00</td>
                        
                        {/* Contributions - placeholder since not in data */}
                        <td className="text-left p-1 border border-r-0">-</td>
                        <td className="text-left p-1 border border-l-0">$0.00</td>
                        
                        {/* Employee Taxes */}
                        <td className="text-left p-1 border border-r-0">
                          {employeeTax.payroll_type || "-"}
                        </td>
                        <td className="text-left p-1 border border-l-0">
                          {formatCurrency(employeeTax.current || 0)}
                        </td>
                        
                        {/* Employer Taxes */}
                        <td className="text-left p-1 border border-r-0">
                          {employerTax.payroll_type || "-"}
                        </td>
                        <td className="text-left p-1 border border-l-0">
                          {formatCurrency(employerTax.current || 0)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Totals Row */}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-4 p-2 border">TOTALS</td>
                    <td className="text-left p-2 border">{employee.employeeInfo.total}</td>
                    <td className="text-left p-2 border border-l-0">
                      {formatCurrency(employee.employeeInfo.grossPay)}
                    </td>
                    <td className="text-left p-2 border border-r-0">-</td>
                    <td className="text-left p-2 border border-l-0">
                      {formatCurrency(employee.employeeInfo.employeeDeduction)}
                    </td>
                    <td className="text-left p-2 border border-r-0">-</td>
                    <td className="text-left p-2 border border-l-0">
                      {formatCurrency(employee.employeeInfo.employeeContribution)}
                    </td>
                    <td className="text-left p-2 border border-r-0">Employee Total</td>
                    <td className="text-left p-2 border border-l-0">
                      {formatCurrency(employee.employee.reduce((sum: number, tax: any) => sum + (tax.current || 0), 0))}
                    </td>
                    <td className="text-left p-2 border border-r-0">Employer Total</td>
                    <td className="text-left p-2 border border-l-0">
                      {formatCurrency(employee.employeer.reduce((sum: number, tax: any) => sum + (tax.current || 0), 0))}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 text-sm flex justify-between text-gray-800">
          <p>
            <strong>Net pay:</strong> {formatCurrency(payrollData.reduce((sum, emp) => sum + emp.employeeInfo.netPay, 0))}
          </p>
          <p>Pay date: {moment(payrollData[0].employeeInfo.payDate).format("MM/DD/YYYY")}</p>
          <p>Period: {calculatePeriod(payrollData[0].employeeInfo.payDate, payrollData[0].employeeInfo.payType)}</p>
        </div>
      </div>
    </div>
  );
};

export default PreviewPayroll;
