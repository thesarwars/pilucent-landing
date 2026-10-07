"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Button from "@/components/ui/RawButton";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { BsEye, BsPrinter, BsThreeDotsVertical } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { RiFileExcel2Line, RiFilePdf2Line } from "react-icons/ri";
import Pagination from "@/components/Pagination/Pagination";
import { TbFilter } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io";
import AddTaxModal from "./AddTaxModal";
import EditHourModal from "./EditHourModal";
import { BiBullseye, BiEdit } from "react-icons/bi";
import Link from "next/link";
import AddTaxModalEmpty from "./AddTaxModalempty";
import { FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";
import PayStubGenerator from "./PrintStab";
import { useSelector } from "react-redux";
import { set } from "lodash";

// Define types for salary process data
interface SalaryProcessItem {
  id: number;
  name: string;
  workingHrs: string;
  salary: string;
  rate: string;
  ot: string;
  pto: string;
  doubleOt: string;
  holydayPay: string;
  bonus: string;
  commission: string;
  total: string;
  grossPay: string;
  status?: string;
  isSelected?: boolean;
  account?: string;
}

const PreviewDetails = () => {
  // Sample data with 20 items
  const [salaryProcessData, setSalaryProcessData] = useState<SalaryProcessItem[]>([]);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [buttonText, setButtonText] = useState("print");

  const [showDetailBoxMenu, setshowDetailBoxMenu] = useState<Number | null>(0);
  const [selectedModalFor, setselectedModalFor] = useState<String | null>(null);
  const router = useRouter()
  const { previewpayroll } = useSelector((state: any) => state.employee);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Select all states for each table
  const [isSalaryProcessAllSelected, setIsSalaryProcessAllSelected] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(salaryProcessData.length / itemsPerPage);

  // Get current page items
  const getCurrentPageItems = (data: SalaryProcessItem[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Handle select all change for Salary Process table
  const handleSalaryProcessSelectAllChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updatedData = salaryProcessData.map((item:any) => ({
      ...item,
      isSelected: isChecked
    }));
    setSalaryProcessData(updatedData);
    console.log(updatedData);
    
    setIsSalaryProcessAllSelected(isChecked);
  };



  // Toggle individual row selection for Salary Process table
  const handleSalaryProcessRowSelectionChange = (id: number, e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updatedData = salaryProcessData.map(item =>
      item.id === id ? { ...item, isSelected: isChecked } : item
    );
    setSalaryProcessData(updatedData);

    // Check if all items are selected
    const allSelected = updatedData.every(item => item.isSelected);
    setIsSalaryProcessAllSelected(allSelected);
  };

  // Toggle individual row selection for Process History table



  // useEffect(() => {
  //   console.log(showDetailBoxMenu);

  //   document.addEventListener('mousedown',()=>{
  //     if(showDetailBoxMenu!=0){
  //       setshowDetailBoxMenu(0);
  //     }
  //   })

  // }, [showDetailBoxMenu]);

  useEffect(() => {
    setshowDetailBoxMenu(0);
    console.log(previewpayroll,223232);
    
  }, [selectedModalFor]);

  useEffect(() => {
    if(!previewpayroll){
      return router.push("/dashboard/hris/payroll/salary_process")
    }
    setSalaryProcessData(previewpayroll);
  }, [salaryProcessData]);

  const modalContoll = () => {
    setselectedModalFor(null)
  }

  return (
    <div className="font-inter">
      {/* Salary Process Section */}
      <div className="mb-4 mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-accent_text_black">
          Run Payroll: Every Month 2
        </h1>
        <div className="mt-8 flex justify-end space-x-3">
          {salaryProcessData&&<PayStubGenerator />}
          {/* <Button
            className="bg-[#ffffff] text-[#00035F] border-[#00035F] border-2"
            type="submit"
            isLoading={false}
          >
            Print Pay Stab
          </Button> */}

        </div>
      </div>

      <div className="rounded-[20px] px-4 py-8">
        <form>
         
          {/* main table */}
          <Table className="font-inter">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 w-[50px]">
                  <Checkbox
                    value={isSalaryProcessAllSelected}
                    onChange={handleSalaryProcessSelectAllChange}
                  />
                </TableHead>
                <TableHead className="py-5 pl-6">Name</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Check Number</TableHead>
                

              </TableRow>
            </TableHeader>

            <TableBody>
              {salaryProcessData&&
              salaryProcessData.map((item:any) => (
                <TableRow className="cursor-pointer" key={item.id}>
                  <TableCell className="pl-5 w-[50px]">
                    <Checkbox
                      value={item.isSelected}
                      onChange={(e) => handleSalaryProcessRowSelectionChange(item.id, e)}
                    />
                  </TableCell>
                  <TableCell className="py-5 pl-6">
                    {item.employeeName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <p>{item.netPay}</p>
                      <p onClick={() => router.push("/dashboard/hris/payroll/run_payroll2/net-pay-details?uid=" + item.id)} className="text-blue-600 cursor-pointer"> <BsEye /> </p>
                      {/* <Link href="/dashboard/hris/payroll/run_payroll2/net-pay-details">
                      <FaEye size={20} className="text-[#1e24d3] cursor-pointer" /></Link> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <input type="text" value={''} className="bg-transparent w-[100px] border border-gray-600 p-1" />
                  </TableCell>
                  
                </TableRow>
              ))}

            </TableBody>
          </Table>
        </form>
      </div>



      {/* Pagination */}
      {/* <div className="mt-5 flex items-center justify-between">
        <Pagination
          totalItems={salaryProcessData.length}
          currentPage={currentPage}
          handlePageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div> */}



      {selectedModalFor === "tax" && <div className="bg-black bg-opacity-40 fixed top-0 left-0 right-0 bottom-0 h-screen w-full flex justify-center items-center z-[9999999]">
        <AddTaxModalEmpty modalContoll={modalContoll} />
      </div>}
      {selectedModalFor === "hours" && <div className="bg-black bg-opacity-40 fixed top-0 left-0 right-0 bottom-0 h-screen w-full flex justify-end items-center z-[9999999]">
        <EditHourModal modalContoll={modalContoll} />
      </div>}
      {/* Ride side PreviewPanel */}
    </div>
  );
};

export default PreviewDetails;