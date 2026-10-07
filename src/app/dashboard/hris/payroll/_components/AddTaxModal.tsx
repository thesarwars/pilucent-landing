import Button from "@/components/ui/RawButton"
import React from 'react'
import { BiTime } from 'react-icons/bi'
import { TiTimes } from 'react-icons/ti'

export default function AddTaxModal({modalContoll, data}:any) { 
    return (
        <div className='bg-white p-4 w-1/3 h-screen'>
            <div className='flex justify-between items-center border-b border-b-gray-300 pb-3 '>
                <p className='text-2xl font-bold'>Add tax-exempt pay</p>
                <p onClick={modalContoll}><TiTimes className='text-2xl' /></p>
            </div>

            <div className='text-gray-500 p-4 bg-gray-50 rounded mt-8 space-y-5 text-sm'>
                <p>There’s a new overtime law that applies to Alabama employees for the 2024 tax
                    year. Starting October 1, 20245, if a salaried employee works more than 40 hours in
                    a week, the pay from those extra hours is a tax-exempt. The exemption includes
                    nonexempt salary employees. </p>

                <p>
                    Calculate the number of hours worked past 40, and total the pay for those hours.
                    Then enter their tax-exempt pay to withhold the correct amount from their
                    paycheck.
                </p>
                <p>
                    Example: An employee worked 42 hours in a week and is paid $20/hr. They worked 2 hours over 40.2 hours at a rate of $20/hr makes their tax-exempt overtime pay
                    $40.

                </p>
            </div>

            <div className="mt-8">
                <p>Tax-exempt pay</p>
                <input type="text" className="p-3 border border-gray-400 rounded " placeholder='$00.00' />
            </div>
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
