"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

// Define dynamic column structure
interface Column {
    key: keyof SalaryProcessItem;
    label: string;
}

interface SalaryProcessItem {
    id: number;
    type: string;
    current: string;
    ytd: string;
}

const columns: Column[] = [
    { key: "type", label: "Type" },
    { key: "current", label: "Current" },
    { key: "ytd", label: "YTD" },
];

const initialData: SalaryProcessItem[] = [

    { id: 2, type: "Medical Insurance", current: "$0.00", ytd: "$0.00" },

    { id: 5, type: "Total", current: "$0.00", ytd: "$00.00" },
];

const CompanyPaid = ({ contribution_data }: any) => {
    const [data, setData] = useState<any>([]);
    const [showBody, setShowBody] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const getCurrentPageItems = () => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };

    const handleChange = (rowIndex: number, key: keyof SalaryProcessItem, value: string) => {
        const updated = [...data];
        updated[rowIndex] = { ...updated[rowIndex], [key]: value };
        setData(updated);
    };

    useEffect(() => {
        if (contribution_data) {
            console.log(11,contribution_data);
            setData([]);
            contribution_data
            .forEach((item: any) => {
                setData((prevData:any) => [
                    ...prevData,
                    {
                        id: item.id,
                        type: item?.deduction_and_contribution?.title,
                        current: item?.total_company_contribution_per_pay_check,
                        ytd: '0',
                    },
                ]);
            })
        }
    }, [contribution_data]);

    return (
        <div className="font-inter">
            <div className="rounded-[20px] px-4 py-8">
                <div className="mb-4 flex items-center cursor-pointer" onClick={() => setShowBody((prev) => !prev)}>
                    <h1 className="text-md font-semibold text-accent_text_black">Employeer Contribution</h1>
                    {showBody ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
                </div>

                {showBody && (
                    <form>
                        <Table className="font-inter text-left w-full">
                            <TableHeader>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableHead key={col.key as string} className="py-5 pl-6 text-left">
                                            {col.label}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {getCurrentPageItems().map((row: any, rowIndex: any) => (
                                    <TableRow key={row.id}>
                                        {columns.map((col: any) => {
                                            if (col.key === 'type') {
                                                return <TableCell key={rowIndex as string} className="py-4 pl-6 text-left">
                                                    {row[col.key]}
                                                </TableCell>
                                            }
                                            return <TableCell key={rowIndex as string} className="py-4 pl-6 text-left">
                                                <input
                                                    type="text"
                                                    value={row[col.key]}
                                                    onChange={(e) => handleChange(rowIndex, col.key, e.target.value)}
                                                    className="bg-transparent w-[100px] border-b border-gray-300 focus:outline-none"
                                                />
                                            </TableCell>
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CompanyPaid;
