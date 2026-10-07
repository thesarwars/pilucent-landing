"use client"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import moment from "moment"
import html2pdf from "html2pdf.js"
import { GetData } from "@/services/FetchMethods"
import { useAppDispatch } from "@/app/redux/store"
import { useQuery } from "@tanstack/react-query"
import { setUser } from "@/app/redux/UserData/UserData"
import GetToken from "@/hooks/getToken"
import { Breadcrumb, VioletButton } from "@/components/violet"
import { ArrowLeft, Download } from "lucide-react"

const PreviewPayroll = () => {
  const dispatch = useAppDispatch();
  const { previewpayroll } = useSelector((state: any) => state.employee)
  const router = useRouter()
  const token = GetToken();

  const { data, refetch } = useQuery({
    queryKey: ["user_profile_data"],
    queryFn: async () => {
      const response = await GetData(`me`, token);
      dispatch(setUser(response));
      return response;
    },
  });


  const [payrollData, setPayrollData] = useState<any[]>(previewpayroll || [])

  useEffect(() => {
    if (previewpayroll && previewpayroll.length > 0) {
      setPayrollData(previewpayroll)
    }
  }, [previewpayroll])

  // Define pay types mapping
  const payTypes = [
    { label: "Salary", key: "Salary" },
    { label: "Overtime", key: "Overtime" },
    { label: "Double OT", key: "Double Overtime Pay" },
    { label: "Holiday Pay", key: "Holiday Pay" },
    { label: "Bonus", key: "Bonus" },
    { label: "Commission", key: "Commission" },
  ]

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Calculate period string
  const calculatePeriod = (payDate: string, payType: string) => {
    const date = moment(payDate)
    if (payType === "EVERY_MONTH") {
      const startDate = date.clone().startOf("month").format("MM/DD/YYYY")
      const endDate = date.clone().endOf("month").format("MM/DD/YYYY")
      return `${startDate} - ${endDate}`
    }
    return `${date.format("MM/DD/YYYY")} - ${date.format("MM/DD/YYYY")}`
  }

  const handlePrintPDF = () => {
    const element = document.getElementById("payroll-table-container")
    const opt = {
      margin: 0.5,
      filename: `payroll-preview-${moment().format("YYYY-MM-DD")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "landscape",
      },
    }

    // Temporarily hide the watermark for PDF
    const watermark = document.querySelector(".watermark")
    if (watermark) {
      ;(watermark as HTMLElement).style.display = "none"
    }

    html2pdf()
      .set(opt)
      .from(element as any)
      .save()
      .then(() => {
        // Restore watermark after PDF generation
        if (watermark) {
          ;(watermark as HTMLElement).style.display = "flex"
        }
      })
  }

  if (!payrollData || payrollData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "HRIS", href: "#" },
          { label: "Run payroll", href: "/dashboard/hris/payroll/salary_process" },
          { label: "Preview" },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Preview payroll details
        </h1>
        <span className="flex-1" />
        <VioletButton
          variant="primary"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handlePrintPDF}
        >
          Print as PDF
        </VioletButton>
      </div>

      <div
        id="payroll-table-container"
        className="relative mt-[18px] overflow-hidden rounded-v-card bg-white p-5 shadow-v-card"
      >
        {/* watermark */}
        <div className="watermark pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
          <span className="rotate-[-30deg] text-6xl font-extrabold text-v-tint100">Preview only</span>
        </div>

        {/* company header */}
        <div className="relative mb-4">
          <h2 className="text-[15px] font-bold text-v-ink900">{data?.company?.name}</h2>
          <p className="text-[12.5px] text-v-ink400">Preview payroll details</p>
        </div>

        {/* payroll table */}
        <div className="relative overflow-x-auto rounded-v-input border border-v-border text-[11px]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-v-card-subtle text-[10.5px] font-bold uppercase tracking-[0.04em] text-v-ink400 [&>th]:border [&>th]:border-v-border [&>th]:px-3 [&>th]:py-2.5">
                <th>Employee</th>
                <th className="border-r-0">Pay</th>
                <th>Hours</th>
                <th className="border-l-0">Amount</th>
                <th className="border-r-0">Deductions</th>
                <th className="border-l-0">Amount</th>
                <th className="border-r-0">Contributions</th>
                <th className="border-l-0">Amount</th>
                <th className="border-r-0">Employee Taxes</th>
                <th className="border-l-0">Amount</th>
                <th className="border-r-0">Employer Taxes</th>
                <th className="border-l-0">Amount</th>
              </tr>
            </thead>
            <tbody className="text-v-ink700">
              {payrollData.map((employee: any, employeeIdx: number) => (
                <React.Fragment key={employeeIdx}>
                  {/* Employee Info Row */}
                  <tr className="bg-v-card-subtle">
                    <td
                      rowSpan={payTypes.length + 2}
                      className="whitespace-nowrap border border-v-border px-3 py-2 align-top"
                    >
                      <p className="text-[12px] font-bold text-v-ink900">
                        {employee.employeeInfo.employeeName}
                      </p>
                      <p className="mt-1 text-[10.5px] tabular-nums text-v-ink500">
                        Pay Date: {moment(employee.employeeInfo.payDate).format("MM/DD/YYYY")}
                      </p>
                      <p className="text-[10.5px] tabular-nums text-v-ink500">
                        Next Pay:{" "}
                        {moment(employee.employeeInfo.payDate).add(1, "month").format("MM/DD/YYYY")}
                      </p>
                      <p className="text-[10.5px] tabular-nums text-v-ink400">
                        {calculatePeriod(employee.employeeInfo.payDate, employee.employeeInfo.payType)}
                      </p>
                    </td>
                  </tr>

                  {/* Pay Rows */}
                  {payTypes.map((payType, payIdx) => {
                    const payData = employee.pay.find((p: any) =>
                      p.payroll_type.toLowerCase().includes(payType.key.toLowerCase()),
                    )

                    const employeeTax = employee.employee[payIdx] || {}
                    const employerTax = employee.employeer[payIdx] || {}

                    // Get deductions for this row
                    const employeeDeductions =
                      employee.deductionContribution?.filter(
                        (item: any) => item.payroll_category === "EMPLOYEE_DEDUCTIONS",
                      ) || []
                    const deduction = employeeDeductions[payIdx] || {}

                    // Get contributions for this row
                    const companyContributions =
                      employee.deductionContribution?.filter(
                        (item: any) => item.payroll_category === "COMPANY_PAID_CONTRIBUTIONS",
                      ) || []
                    const contribution = companyContributions[payIdx] || {}

                    return (
                      <tr
                        key={payIdx}
                        className="border-b border-v-border [&>td]:border [&>td]:border-v-border [&>td]:px-3 [&>td]:py-1.5"
                      >
                        <td className="font-medium text-v-ink900">{payType.label}</td>
                        <td className="tabular-nums">{Number(payData?.hours || 0).toFixed(2)}</td>
                        <td className="border-l-0 tabular-nums">{formatCurrency(payData?.current || 0)}</td>

                        {/* Deductions */}
                        <td className="border-r-0">{deduction.type || "-"}</td>
                        <td className="border-l-0 tabular-nums">
                          {deduction.total_employee_deduction_per_pay_check
                            ? formatCurrency(Number.parseFloat(deduction.total_employee_deduction_per_pay_check))
                            : "$0.00"}
                        </td>

                        {/* Contributions */}
                        <td className="border-r-0">{contribution.type || "-"}</td>
                        <td className="border-l-0 tabular-nums">
                          {contribution.total_company_contribution_per_pay_check
                            ? formatCurrency(Number.parseFloat(contribution.total_company_contribution_per_pay_check))
                            : "$0.00"}
                        </td>

                        {/* Employee Taxes */}
                        <td className="border-r-0 text-[10.5px]">{employeeTax.payroll_type || "-"}</td>
                        <td className="border-l-0 tabular-nums">{formatCurrency(employeeTax.current || 0)}</td>

                        {/* Employer Taxes */}
                        <td className="border-r-0 text-[10.5px]">{employerTax.payroll_type || "-"}</td>
                        <td className="border-l-0 tabular-nums">{formatCurrency(employerTax.current || 0)}</td>
                      </tr>
                    )
                  })}

                  {/* Totals Row */}
                  <tr className="bg-v-wash2 font-bold text-v-ink900 [&>td]:border [&>td]:border-v-border [&>td]:px-3 [&>td]:py-2">
                    <td>TOTALS</td>
                    <td className="tabular-nums">{Number(employee.employeeInfo.total || 0).toFixed(2)}</td>
                    <td className="border-l-0 tabular-nums">
                      {formatCurrency(employee.employeeInfo.grossPay)}
                    </td>
                    <td className="border-r-0">Total Deductions</td>
                    <td className="border-l-0 tabular-nums">
                      {formatCurrency(employee.employeeInfo.employeeDeduction)}
                    </td>
                    <td className="border-r-0">Total Contributions</td>
                    <td className="border-l-0 tabular-nums">
                      {formatCurrency(employee.employeeInfo.employeeContribution)}
                    </td>
                    <td className="border-r-0">Employee Total</td>
                    <td className="border-l-0 tabular-nums text-v-primary">
                      {formatCurrency(
                        employee.employee.reduce(
                          (sum: number, tax: any) => sum + (Number(tax.current) || 0),
                          0,
                        ),
                      )}
                    </td>
                    <td className="border-r-0">Employer Total</td>
                    <td className="border-l-0 tabular-nums text-v-primary">
                      {formatCurrency(
                        employee.employeer.reduce(
                          (sum: number, tax: any) => sum + (Number(tax.current) || 0),
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(22,23,42,0.07)] pt-4 text-[13px] text-v-ink700">
          <p className="font-semibold">
            Net pay:{" "}
            <span className="font-extrabold tabular-nums text-v-primary">
              {formatCurrency(
                payrollData.reduce(
                  (sum: number, emp: any) => sum + (Number(emp?.employeeInfo?.netPay) || 0),
                  0,
                ),
              )}
            </span>
          </p>
          <p className="tabular-nums text-v-ink500">
            Pay date: {moment(payrollData[0].employeeInfo.payDate).format("MM/DD/YYYY")}
          </p>
          <p className="tabular-nums text-v-ink500">
            Period:{" "}
            {calculatePeriod(payrollData[0].employeeInfo.payDate, payrollData[0].employeeInfo.payType)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PreviewPayroll
