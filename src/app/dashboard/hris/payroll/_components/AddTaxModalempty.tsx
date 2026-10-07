import Button from "@/components/ui/RawButton"
import React, { useEffect, useState } from 'react'
import { BiTime } from 'react-icons/bi'
import { TiTimes } from 'react-icons/ti'
import { calculateNYStateTaxForEmployee, estimate_medicareTax, estimate_socialSecurityTax, estimateFederalWithholding_, extractIncomeAndPayPeriods, getTaxRecord, mapHoldingStatusToFilingStatus } from "@/utils/SalaryProcess";

// const payrollData = [
//     {
//         category: 'Compensation',
//         label: 'Salary',
//         amount: '$5,298.29',
//         current: '$4,166.67',
//         title: true
//     },
//     {
//         category: 'Salary',
//         label: 'Salary',
//         amount: '$5,298.29',
//         current: '$4,166.67',
//     },
//     {
//         category: 'Deductions',
//         label: 'Medical Insurance',
//         amount: '$50.00',
//         current: '$50.00',
//         title: true
//     },
//     {
//         category: 'Medical Insurance',
//         label: 'Medical Insurance',
//         amount: '$50.00',
//         current: '$50.00',
//     },
//     {
//         category: 'Child/Spouse Support',
//         label: 'Child/Spouse Support',
//         amount: '--',
//         current: '$50.00',
//     },
//     {
//         category: 'Contributions',
//         label: 'Medical Insurance',
//         amount: '$264.91',
//         current: '$208.33',
//         title: true
//     },
//     {
//         category: 'Medical Insurance',
//         label: 'Medical Insurance',
//         amount: '$264.91',
//         current: '$208.33',
//     },
//     {
//         category: 'Taxes',
//         label: 'Federal Income Tax',
//         amount: '$468.79',
//         current: '$330.33',
//         title: true
//     },
//     {
//         category: 'Federal Income Tax',
//         label: 'Taxes',
//         amount: '$468.79',
//         current: '$330.33',
//     },
//     {
//         category: 'Social Security',
//         label: 'Taxes',
//         amount: '$338.49',
//         current: '$258.34',
//     },
//     {
//         category: 'Medicare',
//         label: 'Taxes',
//         amount: '$76.03',
//         current: '$60.41',
//     },
//     {
//         category: 'AL Income Tax',
//         label: 'Taxes',
//         amount: '$221.57',
//         current: '$171.83',
//     },
// ];

export default function AddTaxModalEmpty({ modalContoll, data }: any) {
    console.log(data, "data in modal");
    const [payrollData, setpayrollData] = useState<any>([]);

    useEffect(() => {
        if (data) {
            const { incomePerPeriod, payPeriods } = extractIncomeAndPayPeriods({ ...data?.allinfo, total_salary: data?.salary });
            const taxRecord = getTaxRecord(data?.allinfo?.taxes);
            const { filingStatus } = mapHoldingStatusToFilingStatus(taxRecord?.holding_status);

            const { annualWages, estimatedAnnualTax, estimatedWithholdingPerPeriod, effectiveTaxRate } = estimateFederalWithholding_(incomePerPeriod, filingStatus, payPeriods);

            const { nyStateTax } = calculateNYStateTaxForEmployee(data?.salary, payPeriods, filingStatus, "EVERY_MONTH");


            setpayrollData([
                {
                    category: 'Compensation',
                    label: 'Salary',
                    amount: '$0',
                    current: '$0',
                    title: true
                },
                {
                    category: 'Salary',
                    label: 'Salary',
                    amount: '$' + annualWages,
                    current: '$' + data?.salary,
                },
                {
                    category: 'Deductions',
                    label: 'Medical Insurance',
                    amount: '$0',
                    current: '$0',
                    title: true
                },
                {
                    category: 'Medical Insurance',
                    label: 'Medical Insurance',
                    amount: '$0',
                    current: '$',
                },
                {
                    category: 'Child/Spouse Support',
                    label: 'Child/Spouse Support',
                    amount: '--',
                    current: '$0',
                },
                {
                    category: 'Contributions',
                    label: 'Medical Insurance',
                    amount: '$264.91',
                    current: '$208.33',
                    title: true
                },
                {
                    category: 'Medical Insurance',
                    label: 'Medical Insurance',
                    amount: '$0',
                    current: '$0',
                },
                {
                    category: 'Taxes',
                    label: 'Federal Income Tax',
                    amount: '$'+estimatedAnnualTax,
                    current: '$0',
                    title: true
                },
                {
                    category: 'Federal Income Tax',
                    label: 'Taxes',
                    amount: '$'+estimatedAnnualTax,
                    current: '$0',
                },
                {
                    category: 'Social Security',
                    label: 'Taxes',
                    amount: parseFloat(estimate_socialSecurityTax(data?.salary).estimatedTax),
                    current: '$0',
                },
                {
                    category: 'Medicare',
                    label: 'Taxes',
                    amount: parseFloat(estimate_medicareTax(data?.salary).estimatedTax),
                    current: '$0',
                },
                {
                    category: 'NY Income Tax',
                    label: 'Taxes',
                    amount: '$'+nyStateTax,
                    current: '$0',
                },
            ])
        }
    }, []);

    // Calculate totals
    const calculateTotals = (data: any) => {
        let totalPay = 0;
        let totalTaxesAndDeductions = 0;

        // data.forEach((item: any) => {
        //     if (item.amount !== '--') {
        //         totalPay += parseFloat(item?.amount?.replace('$', ''));
        //     }
        //     if (item.current !== '--') {
        //         totalTaxesAndDeductions += parseFloat(item?.current?.replace('$', ''));
        //     }
        // });

        const netPay = totalPay - totalTaxesAndDeductions;

        return {
            totalPay:0,
            totalTaxesAndDeductions:0,
            netPay:0,
        };
    };

    const { totalPay, totalTaxesAndDeductions, netPay } = calculateTotals(payrollData);

    if(!data?.allinfo){
        return (
            <div className='bg-white p-4 w-3/4 h-[90%] rounded overflow-y-auto'>
                <div className='flex justify-between items-center  border-b border-gray-300 pb-3 mb-3'>
                    <p className='text-2xl font-bold'>Add tax-exempt pay</p>
                    <p onClick={modalContoll}><TiTimes className='text-2xl' /></p>
                </div>
                <p className='text-red-500'>No employee selected</p>
            </div>
        )
    }

    return (
        <div className='bg-white p-4 w-3/4 h-[90%] rounded overflow-y-auto'>
            <div className='flex justify-between items-center  border-b border-gray-300 pb-3 mb-3'>
                <p className='text-2xl font-bold'>Add tax-exempt pay</p>
                <p onClick={modalContoll}><TiTimes className='text-2xl' /></p>
            </div>

            <table className="w-full ">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="p-2   -2 text-left">Employee: {data?.allInfo?.name}</th>

                        <th className="p-2   -2 text-left">Last Payday
                            (01-07-25)</th>
                        <th className="p-2   -2 text-left">Current Payday
                            (06-30-25)</th>
                    </tr>
                </thead>
                <tbody>
                    {payrollData.map((row: any, index: number) => (
                        <tr key={index} className={`${row.title ? "bg-[#EBF4FD] font-bold" : 'bg-white'} py-4`}>
                            <td className="p-2 py-4   ">{row.category}</td>

                            <td className="p-2 py-4   ">{row.amount}</td>
                            <td className="p-2 py-4   ">{row.current}</td>
                        </tr>
                    ))}
                    {/* Totals */}
                    <tr className="bg-white font-bold">
                        <td className="p-2 py-4   ">Total Pay</td>
                        <td className="p-2 py-4   "></td>
                        <td className="p-2 py-4   ">${totalPay.toFixed(2)}</td>
                        <td className="p-2 py-4   "></td>
                    </tr>
                    <tr className="bg-white font-bold">
                        <td className="p-2 py-4   ">Taxes & Deductions</td>
                        <td className="p-2 py-4   "></td>
                        <td className="p-2 py-4   ">${totalTaxesAndDeductions.toFixed(2)}</td>
                        <td className="p-2 py-4   "></td>
                    </tr>
                    <tr className="bg-white font-bold">
                        <td className="p-2 py-4   ">Net Pay</td>
                        <td className="p-2 py-4   "></td>
                        <td className="p-2 py-4   ">${netPay.toFixed(2)}</td>
                        <td className="p-2 py-4   "></td>
                    </tr>
                </tbody>
            </table>




            <div className="mt-8 flex justify-end space-x-3">
                <Button
                    className="bg-[#ffffff] text-[#00035F] border-[#00035F] border-2"
                    type="submit"
                    isLoading={false}
                >
                    Cancel
                </Button>
                <Button
                    className="bg-black text-white"
                    type="submit"
                    isLoading={false}
                >
                    Save
                </Button>
            </div>
        </div>
    )
}
