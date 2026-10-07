"use client";

import Button from "@/components/ui/RawButton"
import React, { useState } from 'react'
import { BsPrinter } from 'react-icons/bs'
import { FiSearch } from 'react-icons/fi'
import { IoIosArrowDown } from 'react-icons/io';
import { IoSettingsOutline } from 'react-icons/io5'
import { RiFileExcel2Line, RiFilePdf2Line } from 'react-icons/ri'
import { TbFilter } from 'react-icons/tb';
import Checkbox from "@/components/ui/Checkbox/Checkbox";
// import  RecordPaymentModal from "./RecordPaymentModal"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import ModalSM, { handleOpenModalSM } from '@/components/ModalSM/ModalSM';
import RecordPaymentModal from './RecordPaymentModal';

interface TaxItem {
    id: number;
    taxType: string;
    period: string;
    dueDate: string;
    payType: string;
    amount: number;
    status: string;
    isSelected: boolean;
    actionStatus?: string; // Optional field for the "Paid" status in the filing table
}

interface TaxTableProps {
    title: string;
    data: TaxItem[];
    isAllSelected: boolean;
    handleSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRowSelectionChange: (id: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    setModalTitle: (title: string) => void;
    setModalContent: (content: string) => void;
    actionType: 'pay' | 'file';
}

// Reusable Tax Table Component
const TaxTable: React.FC<TaxTableProps> = ({
    title,
    data,
    isAllSelected,
    handleSelectAllChange,
    handleRowSelectionChange,
    setModalTitle,
    setModalContent,
    actionType
}) => {
    return (
        <>
            <div className="mt-9 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-accent_text_black">
                    {title}
                </h1>
            </div>
            <div className="mt-4 px-4 w-full overflow-x-auto">
                <Table className="font-inter w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="pl-5">
                                <Checkbox
                                    value={isAllSelected}
                                    onChange={handleSelectAllChange}
                                />
                            </TableHead>
                            <TableHead className="">Tax Type</TableHead>
                            <TableHead className="">Due Date</TableHead>
                            <TableHead className="">Amount</TableHead>
                            <TableHead className="">Status</TableHead>
                            <TableHead className="">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="pl-5">
                                    <Checkbox
                                        value={item.isSelected}
                                        onChange={(e) => handleRowSelectionChange(item.id, e)}
                                    />
                                </TableCell>
                                <TableCell className="">
                                    <div>
                                        <p className="font-medium">{item.taxType}</p>
                                        <p className="text-sm text-gray-500">{item.period}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="">
                                    <div>
                                        <p>{item.dueDate}</p>
                                        <p className="text-sm text-gray-500">{item.payType}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="">
                                    <div className="">
                                        <span className="text-gray-500">$</span>
                                        <span>{item.amount.toFixed(2)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="">{item.status}</TableCell>
                                <TableCell>
                                    {actionType === 'pay' ? (
                                        <div className="mt-4 flex justify-center">
                                            <Button
                                                className="border-2 border-[#6A6EF6] text-[#6A6EF6] hover:bg-[#f5f5ff] "
                                                type="button"
                                                onClick={() => {
                                                    setModalTitle("Record Payment");
                                                    setModalContent("pay");
                                                    handleOpenModalSM();
                                                }}
                                            >
                                                Pay
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center">
                                            <span className="inline-block rounded-md bg-green-100 px-8 py-3 text-green-600">
                                                {item.actionStatus || 'Paid'}
                                            </span>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

const PayrollTax = () => {
    // Initial tax data state
    const [taxData, setTaxData] = useState<TaxItem[]>([
        {
            id: 1,
            taxType: 'AL Income Tax',
            period: '01-01-2025 - 03-31-2025 (Q1)',
            dueDate: '04-30-2025',
            payType: 'pay manually',
            amount: 221.57,
            status: 'Accruing',
            isSelected: false
        },
        {
            id: 2,
            taxType: 'Federal unemployment (940)',
            period: '01-01-2025 - 12-31-2025 (Q4)',
            dueDate: '02-02-2026',
            payType: 'pay by 02-02-2026',
            amount: 31.79,
            status: 'Accruing',
            isSelected: false
        }
    ]);

    // Filing data state - separate selection state for each table
    const [filingData, setFilingData] = useState<TaxItem[]>([
        {
            id: 1,
            taxType: 'AL Income Tax',
            period: '01-01-2025 - 03-31-2025 (Q1)',
            dueDate: '04-30-2025',
            payType: 'file manually',
            amount: 221.57,
            status: 'Accruing',
            isSelected: false,
            actionStatus: 'Paid'
        },
        {
            id: 2,
            taxType: 'Federal unemployment (940)',
            period: '01-01-2025 - 12-31-2025 (Q4)',
            dueDate: '02-02-2026',
            payType: 'file by 02-02-2026',
            amount: 31.79,
            status: 'Accruing',
            isSelected: false,
            actionStatus: 'Paid'
        }
    ]);

    // Search state
    const [searchTerm, setSearchTerm] = useState("");
    const [isButtonActive, setIsButtonActive] = useState(false);
    const [buttonText, setButtonText] = useState("print");

    // Separate selection states for each table
    const [isTaxAllSelected, setIsTaxAllSelected] = useState(false);
    const [isFilingAllSelected, setIsFilingAllSelected] = useState(false);

    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("pay");

    // Handle select all change for tax table
    const handleTaxSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const updatedData = taxData.map(item => ({
            ...item,
            isSelected: isChecked
        }));
        setTaxData(updatedData);
        setIsTaxAllSelected(isChecked);
    };

    // Handle select all change for filing table
    const handleFilingSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const updatedData = filingData.map(item => ({
            ...item,
            isSelected: isChecked
        }));
        setFilingData(updatedData);
        setIsFilingAllSelected(isChecked);
    };

    // Handle individual row selection for tax table
    const handleTaxRowSelectionChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const updatedData = taxData.map(item =>
            item.id === id ? { ...item, isSelected: isChecked } : item
        );
        setTaxData(updatedData);
        setIsTaxAllSelected(updatedData.every(item => item.isSelected));
    };

    // Handle individual row selection for filing table
    const handleFilingRowSelectionChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const updatedData = filingData.map(item =>
            item.id === id ? { ...item, isSelected: isChecked } : item
        );
        setFilingData(updatedData);
        setIsFilingAllSelected(updatedData.every(item => item.isSelected));
    };

    // Search handler
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Implement search logic
    };

    return (
        <div className="font-inter">
            <div className="mb-4 mt-5 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-accent_text_black">
                    Payroll Tax Centre
                </h1>
            </div>
            <div className="mt-9 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-accent_text_black">
                    Coming up
                </h1>
                <div className="flex items-center gap-4">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex h-12 w-64 max-w-64 items-center gap-1 overflow-hidden rounded-3xl border border-accent_border_gray px-6 py-3"
                    >
                        <button type="submit">
                            <FiSearch className="text-2xl text-accent_text_slate" />
                        </button>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search"
                            type="text"
                            className="h-full flex-1 bg-transparent outline-none placeholder:text-accent_text_light_gray"
                        />
                    </form>
                    <Button type="button" className="p-1">
                        <TbFilter className="text-2xl text-[#7E84A3]" />
                    </Button>
                    <Button type="button" className="p-1">
                        <IoSettingsOutline className="text-2xl text-[#7E84A3]" />
                    </Button>
                    <div className="relative flex items-center justify-between rounded-lg border outline-none">
                        <button className="cursor-auto px-3 py-2 text-[1rem] transition-all duration-500">
                            {buttonText === "print" ? (
                                <BsPrinter className="text-2xl text-[#7E84A3]" />
                            ) : (
                                <RiFileExcel2Line className="text-2xl text-[#7E84A3]" />
                            )}
                        </button>

                        <div
                            onClick={() => setIsButtonActive(!isButtonActive)}
                            className="cursor-pointer border-l px-1"
                        >
                            <IoIosArrowDown className="text-xl text-[#7E84A3]" />
                        </div>

                        <ul
                            className={`${isButtonActive ? "z-20 translate-y-0 border opacity-100" : "z-[-1] translate-y-[-5px] opacity-0"} absolute right-0 top-[46px] flex w-full flex-col rounded bg-white py-1 duration-500`}
                        >
                            <li
                                className="flex cursor-pointer justify-center gap-[5px] rounded-t px-3 py-2 hover:bg-gray-100"
                                onClick={() => {
                                    setButtonText("print");
                                    setIsButtonActive(false);
                                }}
                            >
                                <BsPrinter className="text-2xl text-[#7E84A3]" />
                            </li>
                            <li
                                className="flex cursor-pointer justify-center gap-[5px] rounded-t px-3 py-2 hover:bg-gray-100"
                                onClick={() => {
                                    setButtonText("excel");
                                    setIsButtonActive(false);
                                }}
                            >
                                <RiFileExcel2Line className="text-2xl text-[#7E84A3]" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tax Obligations Table - Using the reusable component */}
            <TaxTable
                title=""
                data={taxData}
                isAllSelected={isTaxAllSelected}
                handleSelectAllChange={handleTaxSelectAllChange}
                handleRowSelectionChange={handleTaxRowSelectionChange}
                setModalTitle={setModalTitle}
                setModalContent={setModalContent}
                actionType="pay"
            />

            {/* Tax Filing Table - Using the reusable component */}
            <TaxTable
                title="Tax Filing"
                data={filingData}
                isAllSelected={isFilingAllSelected}
                handleSelectAllChange={handleFilingSelectAllChange}
                handleRowSelectionChange={handleFilingRowSelectionChange}
                setModalTitle={setModalTitle}
                setModalContent={setModalContent}
                actionType="file"
            />

            {/* Modal */}
            <ModalSM title={modalTitle} edit={false}>
                 <RecordPaymentModal/>
            </ModalSM>
        </div>
    )
}

export default PayrollTax