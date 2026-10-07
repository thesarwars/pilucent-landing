"use client";

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
import Image from "next/image";
import { BsPrinter } from "react-icons/bs";

interface PaySlipProps {
  payslip: any;
}

const PaySlip = ({ payslip }: PaySlipProps) => {
  if (!payslip) return <div>No payslip data found.</div>;
  const profile = payslip.profile || {};
  let netPaySummary: any = {};
  try {
    netPaySummary = payslip.netPaySummary ? JSON.parse(payslip.netPaySummary) : {};
  } catch (e) {}

  return (
    <div className="font-lexend">
      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-accent_text_black">
          Payslips
        </h1>
        <div className="flex items-center gap-4">
          <input
            defaultValue={payslip.createdAt ? payslip.createdAt.slice(0, 7) : ""}
            onChange={() => {}}
            placeholder=""
            className="h-11 rounded-lg border border-accent_text_slate px-4 text-accent_text_slate placeholder:text-sm placeholder:text-accent_text_slate"
            type="month"
          />
          <Button type="button" className="p-1">
            <BsPrinter className="text-2xl text-accent_text_light_gray" />
          </Button>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-5">
        <div className="flex max-w-[700px] flex-1 items-start gap-9 rounded-2xl p-5 shadow-sm">
          <div>
            <Image
              src={profile.imageUrl || "/images/profile_image2.png"}
              alt="profile"
              width={200}
              height={200}
              className="h-24 w-24 rounded-full border-2 border-accent_border_red object-cover p-2"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-2 font-medium text-accent_text_gray">
              <p>Name</p>
              <p>Role Name</p>
              <p>Employee ID</p>
              <p>Designation</p>
              <p>Department</p>
              <p>Office Location</p>
              <p>Join Date</p>
              <p>Release Date</p>
            </div>
            <div className="flex flex-col gap-2 text-accent_text_light_gray">
              <p>
                <span className="font-medium text-accent_text_gray">:</span>{" "}
                {profile.employeeName || payslip.employeeName}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span> {profile.roleName || "-"}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span>{" "}
                {profile.employeeID || payslip.profileId || "-"}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span>{" "}
                {profile.designation || "-"}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span> {profile.department || "-"}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span> {profile.officeLocation || "-"}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span> {profile.hireDate ? new Date(profile.hireDate).toLocaleDateString() : "-"}
              </p>
              <p>
                <span className="font-medium text-accent_text_gray">:</span> {profile.releaseDate ? new Date(profile.releaseDate).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex max-w-[500px] flex-1 flex-col gap-7 rounded-2xl bg-accent_soft_blue px-20 py-[70px] text-center text-accent_bg_gray">
          <p className="text-center font-semibold">Employee Net Pay</p>
          <h1 className="text-5xl font-semibold">${payslip.netPay?.toLocaleString()}</h1>
          <p className="text-lg font-medium">Paid Days: {payslip.workingHrs || "-"} | LOP Days: {payslip.PTO || "0"}</p>
        </div>
      </div>
      <div className="mt-8 w-full overflow-x-auto">
        <Table className="font-lexend">
          <TableHeader className="">
            <TableRow>
              <TableHead className="py-5">Earnings</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>YTD</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>YTD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-5">Basic</TableCell>
              <TableCell>${parseFloat(payslip.salary || 0).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(payslip.salary || 0).toFixed(2)}</TableCell>
              <TableCell>Employee Deduction</TableCell>
              <TableCell>${parseFloat(payslip.employeeDeduction || 0).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(payslip.employeeDeduction || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-5">Bonus</TableCell>
              <TableCell>${parseFloat(payslip.bonus || 0).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(payslip.bonus || 0).toFixed(2)}</TableCell>
              <TableCell>Employee Contribution</TableCell>
              <TableCell>${parseFloat(payslip.employeeContribution || 0).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(payslip.employeeContribution || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-5">Commission</TableCell>
              <TableCell>${parseFloat(payslip.commission || 0).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(payslip.commission || 0).toFixed(2)}</TableCell>
              <TableCell>Holiday Pay</TableCell>
              <TableCell>${parseFloat(payslip.holidayPay || 0).toFixed(2)}</TableCell>
              <TableCell>${parseFloat(payslip.holidayPay || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-5">
                <p className="text-lg font-semibold text-accent_text_black">
                  Gross Earnings
                </p>
              </TableCell>
              <TableCell>
                <p className="text-lg font-semibold text-accent_text_black">
                  ${parseFloat(payslip.grossPay || 0).toFixed(2)}
                </p>
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <p className="text-lg font-semibold text-accent_text_black">
                  Total Deductions
                </p>
              </TableCell>
              <TableCell>
                <p className="text-lg font-semibold text-accent_text_black">
                  ${parseFloat(payslip.employeeDeduction || 0).toFixed(2)}
                </p>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="w-full overflow-x-auto">
        <Table className="font-lexend">
          <TableHeader>
            <TableRow>
              <TableHead className="py-5">Net Pay</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-5">Total Deductions</TableCell>
              <TableCell>${parseFloat(payslip.employeeDeduction || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-5">Other Additions</TableCell>
              <TableCell>${parseFloat(payslip.bonus || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-5">Total Additions</TableCell>
              <TableCell>${parseFloat(payslip.total || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="py-5"></TableCell>
              <TableCell>
                <p className="gap-4 text-lg font-semibold text-accent_text_black">
                  <span>Total Net Payable</span> <span>${parseFloat(payslip.netPay || 0).toFixed(2)}</span>
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaySlip;
