"use client";
import Button from "@/components/ui/RawButton";
import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { BiChevronDown, BiChevronsDown } from "react-icons/bi";
import { addsalaryproccess } from "@/app/redux/Employee/EmployeeSlice";
import { baseURL } from "@/app/helpers/api";
import { getTaxRecord } from "@/utils/SalaryProcess";
import Employee_tax from "./Employee_tax";
import Pay from "./Pay";
import AddTaxModal from "../AddTaxModal";
import Employee_deduction from "./Employee_deduction";
import Employee_taxs from "./Employee_taxs";
import CompanyPaid from "./Company-Paid";

export default function MainNetPay({salarydata}:any) {
  const { salaryProccess, payrollInfo } = useSelector((state: any) => state.employee);
  const router = useRouter()
 

  const [aProccessdData, setaProccessdData] = useState<any>(salarydata||{});
  const [allbanks, setallbanks] = useState<any>(null);
  const [selectedbank, setselectedbank] = useState('');
  const [selectedBankInfoFulll, setselectedBankInfoFulll] = useState<any>(null);
  const [totalTax, settotalTax] = useState(0);
  const [totalGross, settotalGross] = useState(0);
  const [totalDeduction, settotalDeduction] = useState(0);
  const [showDetail, setshowDetail] = useState(false);
  const dispatch = useDispatch()
  const [storedUpdatedData, setstoredUpdatedData] = useState<any>([]);
  const [memo, setmemo] = useState('');

  const handleBankChange = (v: any) => {
    const objs = v ? JSON.parse(v) : {}
    setselectedBankInfoFulll(objs)
    setselectedbank(objs?.title)
  }

  const getAllBanks = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response: any = await fetch(baseURL + "/we/chart-of-accounts?page=1&limit=100&search=bank", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const result = await response.json()
      setallbanks(result?.results)
    } catch (error) {
      console.log(error);
    }
  }



  useEffect(() => {
    if (!allbanks) {
      getAllBanks()
    }
  }, [allbanks]);

  useEffect(() => {
    if (!aProccessdData) {
      // router.push("/dashboard/hris/payroll/salary_process")
    } else {
      setmemo(aProccessdData?.memo)
    }

  }, [aProccessdData]);

  const [selectedModalFor, setselectedModalFor] = useState<String | null>(null);
  const modalContoll = () => setselectedModalFor(null)

  // if (
  //   !aProccessdData?.allinfo ||
  //   !aProccessdData?.allinfo?.user?.name ||
  //   !aProccessdData?.allinfo?.addresses?.[1]?.full_address
  // ) {
  //   return <div className='flex justify-center items-center h-screen'>Loading...</div>
  // }

  const updateState = (data: any) => {
    const updatedOne = salaryProccess.map((item: any) => {
      if (item.id === aProccessdData.id) {
        console.log(21312323,{ ...item, ...data, grossPay: totalGross });
        const newd = { ...item, ...data, grossPay: totalGross }
        
        return newd
      }
      return item

    })
    dispatch(addsalaryproccess(updatedOne))
    setstoredUpdatedData(updatedOne)
    // updateGlobalState()
  }

  const updateGlobalState = () => {
    const updatedOne = storedUpdatedData.map((item: any) => {
      if (item.id === aProccessdData.id) {
        console.log('34234234dfsdf',{ ...item, grossPay: totalGross });
        setaProccessdData({ ...item, grossPay: totalGross })
        return { ...item, grossPay: totalGross }
      }
      return item

    })
    dispatch(addsalaryproccess(updatedOne))
    setstoredUpdatedData(updatedOne)
    console.log(updatedOne, 22334455);

  }
  const updateGlobalStateWithMemo = (memo: string) => {
    const updatedOne = storedUpdatedData.map((item: any) => {
      if (item.id === aProccessdData.id) {
        return { ...item, memo: memo }
      }
      return { ...item }

    })
    dispatch(addsalaryproccess(updatedOne))
    // setstoredUpdatedData(updatedOne)
    console.log(updatedOne, "memo");
  }

  useEffect(() => {
    setTimeout(() => {
      updateGlobalState()
      console.log(1111111,Number(totalGross));
    }, 1000);
      
      
  }, [totalGross]);

  useEffect(() => {
    if (memo) updateGlobalStateWithMemo(memo)
  }, [memo]);

  useEffect(() => {
    if (salaryProccess && salaryProccess.length > 0) {
      setstoredUpdatedData(salaryProccess);
    }
  }, [salaryProccess]);



  return (
    <div className="bg-white w-full">
      {/* Clients Details */}
      <div className="mx-auto p-8">
        <div className='flex justify-between'>
          <div className="w-fit bg-[#F8F8FF] border-[#E6E9F4] rounded p-4">
            <p className='text-gray-400 text-sm'>Pay To,</p>
            <p className="my-2 text-xl font-bold">{aProccessdData?.allinfo?.user?.name ? aProccessdData?.allinfo?.user?.name : ''}</p>
          </div>
          <div onClick={() => setshowDetail(!showDetail)} className="w-fit bg-[#F8F8FF] border-[#E6E9F4] rounded p-4 text-right">
            <p className='text-gray-400 text-sm'>Net pay,</p>
            <p className="my-2 text-xl font-bold flex items-center">${!totalGross ? aProccessdData?.grossPay - totalTax : totalGross - totalTax - Number(totalDeduction)} <BiChevronDown /></p>

          </div>
        </div>
        {showDetail && <div className="px-4 animate-in broder-t border border-[#E6E9F4] border-t-0">
          <div className="flex justify-between items-center py-2 ">
            <p>Gross Pay</p>
            <p>${totalGross}</p>
          </div>
          <div className="flex justify-between items-center py-2 border-t">
            <p>Total tax</p>
            <p>- ${totalTax}</p>
          </div>
          <div className="flex justify-between items-center py-2 border-t">
            <p>Total Deduction</p>
            <p>- ${totalDeduction}</p>
          </div>
          <div className="flex justify-between items-center py-2 border-t">
            <p>Net Total</p>
            <p>= ${!totalGross ? aProccessdData?.grossPay - totalTax : totalGross - totalTax - Number(totalDeduction)}</p>
          </div>
        </div>}

        <div className="flex justify-between items-center mt-8 bg-[#F8F8FF] border-[#E6E9F4] rounded p-4">
          <div className="w-[45%] space-y-2">
            <div className="flex items-center text-[#5A607F] text-sm font-bold justify-between py-1">
              <span className="mr-2">Employee Address</span>
              <input
                value={aProccessdData?.allinfo?.addresses?.[1]?.full_address ? aProccessdData?.allinfo?.addresses?.[1]?.full_address : ''}
                placeholder='1230 Lonely Oak Drive'
                disabled
                className="border-b border-gray-400 bg-transparent rounded text-gray-500 px-2 py-1 w-[60%]"
              />
            </div>

            <div className="flex items-center text-[#5A607F] text-sm font-bold justify-between py-1">
              <span className="mr-2">Mobile</span>
              <input
                value={aProccessdData?.allinfo?.phone_number ? aProccessdData?.allinfo?.phone_number : ''}
                placeholder='Mobile number'
                disabled
                className="border-b border-gray-400 bg-transparent rounded text-gray-500 px-2 py-1 w-[60%]"
              />
            </div>

            <div className="flex items-center text-[#5A607F] text-sm font-bold justify-between py-1">
              <span className="mr-2">Pay Date</span>
              <input
                value={payrollInfo?.payDate ? payrollInfo?.payDate : ""}
                type="text"
                disabled
                placeholder="DD-MM-YY"
                className="border-b border-gray-400 rounded text-gray-500 bg-transparent px-2 py-1 w-[60%]"
              />
            </div>
          </div>

          <div className="w-[45%] space-y-2">
            <div className="flex items-center text-[#5A607F] text-sm font-bold justify-between py-1">
              <span className="mr-2">Chart of Account</span>
              <input
                value={payrollInfo?.bankInfo?.title ? payrollInfo?.bankInfo?.title : ""}
                type="text"
                disabled
                placeholder="No bank Selected"
                className="border-b border-gray-400 rounded text-gray-500 bg-transparent px-2 py-1 w-[60%]"
              />
            </div>

            {selectedbank && (
              <div className="flex items-center text-[#5A607F] text-sm font-bold justify-between py-1">
                <span className="mr-2">{selectedbank} - ${selectedBankInfoFulll?.opening_balance}</span>
              </div>
            )}

            <div className="flex items-center text-[#5A607F] text-sm font-bold justify-between py-1">
              <span className="mr-2">Pay Period</span>
              <input
                value={payrollInfo?.selectedPayPeriod ? payrollInfo?.selectedPayPeriod : ""}
                type="text"
                disabled
                placeholder="DD-MM-YY"
                className="border-b border-gray-400 rounded text-gray-500 bg-transparent px-2 py-1 w-[60%]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pay */}
      <Pay datatax={aProccessdData} settotalGross={settotalGross} updateState={updateState} />

      {/* Employee Tax */}
      <Employee_tax
        data={aProccessdData}
        stateTax={aProccessdData?.stateTaxValue}
        stateName={getTaxRecord(aProccessdData?.allinfo?.taxes)?.state ?? "NY"}
        settotalTax={settotalTax}
        totalGross={totalGross}
        taxes={aProccessdData?.allinfo?.taxes}
      />

      <div className='flex items-center space-x-2 px-4'>
        <p>All taxes pay the period : $0.00</p>
        <p className='text-blue-700 cursor-pointer' onClick={() => setselectedModalFor("tax")}>Edit</p>
      </div>

      {selectedModalFor === "tax" &&
        <div className="bg-black bg-opacity-40 fixed top-0 left-0 right-0 bottom-0 h-screen w-full flex justify-end items-center z-[9999999]">
          <AddTaxModal modalContoll={modalContoll} />
        </div>}

      {/* Employee Deductions */}
      <Employee_deduction
        settotalDeduction={settotalDeduction}
        garnishment={aProccessdData?.allinfo?.garnishment}
        deduction_data={aProccessdData?.allinfo?.deduction_contributions}
        allinfo={aProccessdData?.allinfo}
      />

      {/* Employer Taxes */}
      <Employee_taxs
        data={aProccessdData}
        stateName={getTaxRecord(aProccessdData?.allinfo?.taxes)?.state}
        dataYtd={aProccessdData?.storeNetPaySummary?.employerDta}
        taxes={aProccessdData?.allinfo?.taxes}
      />

      {/* Company Contributions */}
      <CompanyPaid contribution_data={aProccessdData?.allinfo?.deduction_contributions} />

      <div className='p-4'>
        <p className="mb-4 font-semibold">Memo</p>
        <textarea value={memo} onChange={(e) => setmemo(e.target.value)} className='bg-[#F5F6FA] border w-1/2 p-4 rounded'></textarea>
      </div>

      {/* Save Buttons */}
      {/* <div className="my-8 flex justify-end space-x-3">
        <Button
          className="bg-black text-white"
          type="submit"
          isLoading={false}
          onClick={() => { router.back() }}
        >
          Close Preview
        </Button>
      </div> */}
    </div>
  )
}
