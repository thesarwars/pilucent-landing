"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import moment from "moment"
import { useQuery } from "@tanstack/react-query"
import { GetData } from "@/services/FetchMethods"
import { useAppDispatch } from "@/app/redux/store"
import { setUser } from "@/app/redux/UserData/UserData"
import GetToken from "@/hooks/getToken"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  aggregateSummaries,
  summarisePayroll,
  sumCurrent as sumCurrentShared,
  sumYtd as sumYtdShared,
} from "@/utils/payrollSummary"
import {
  Chip,
  IconChip,
  VioletButton,
  avatarGradient,
  initials,
  V,
  type VioletTone,
} from "@/components/violet"
import {
  Check,
  Clock,
  DollarSign,
  Banknote,
  Landmark,
  ShieldCheck,
  Users,
  Receipt,
} from "lucide-react"

const formatCurrency = (amount: any) => {
  const n = Number(amount) || 0
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n)
}

const prettyLabel = (s: any) => {
  if (!s) return "-"
  return String(s)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const sumCurrent = (arr: any[]) => sumCurrentShared(arr)
const sumYtd = (arr: any[]) => sumYtdShared(arr)

/**
 * Every component row is currently persisted with `ytd: 0` (the run builder
 * never populates prior-year-to-date figures), so printing $0.00 here asserts
 * something false on a document the employee relies on. Show a dash until real
 * YTD is carried through, and format it normally the moment it is.
 */
const formatYtd = (amount: any) => {
  const n = Number(amount)
  return Number.isFinite(n) && n !== 0 ? formatCurrency(n) : "—"
}

function methodMeta(kind: any): { tone: VioletTone; label: string } {
  const k = String(kind || "").toUpperCase()
  if (k.includes("CHECK")) return { tone: "warn", label: "Paper check" }
  if (k === "BANK_TRANSFER") return { tone: "success", label: "Bank transfer" }
  return { tone: "success", label: "Direct deposit" }
}

function transformPayrollData(data: any[], company: any) {
  return (data || []).map((item: any) => {
    const employeeInfoAll = item?.employeeInfo?.allinfo || {}
    const employeeUser = employeeInfoAll?.user || {}
    const shippingAddr =
      (employeeInfoAll?.addresses || []).find((a: any) => a?.is_shipping) ||
      (employeeInfoAll?.addresses || [])[0] ||
      {}

    const payPeriodStr: string = item?.employeeInfo?.selectedPayPeriod || ""
    const [beginning = "", ending = ""] = payPeriodStr.includes(" - ")
      ? payPeriodStr.split(" - ")
      : payPeriodStr.split(" to ")

    // Recurring earnings are part of gross but had no home on the stub, so they
    // were paid, taxed and then invisible on the document. Print them alongside
    // the other PAY rows.
    // Not `> 0`: a refund or correction line is legitimately negative and has to
    // appear on the stub AND in the totals. Only true zeros and non-numbers go.
    const isPosted = (row: any) =>
      Number.isFinite(Number(row?.current)) && Number(row?.current) !== 0

    const payList = [...(item?.pay || []), ...(item?.earnings || [])].filter(isPosted)

    const employeeDeductions = (item?.deductionContribution || []).filter(
      (d: any) => d?.payroll_category === "EMPLOYEE_DEDUCTIONS" && isPosted(d),
    )
    const companyContributions = (item?.deductionContribution || []).filter(
      (d: any) => d?.payroll_category === "COMPANY_PAID_CONTRIBUTIONS" && isPosted(d),
    )

    const garnishments = (item?.gharnishment || []).filter(isPosted)

    const employeeTaxes = (item?.employee || []).filter(isPosted)
    const employerTaxes = (item?.employeer || []).filter(isPosted)

    // Derive every figure from the SAME rows this stub prints. Previously gross
    // and net were read off employeeInfo — numbers the review screen had produced
    // by a different route, and with `||` fallbacks that silently switched
    // formula whenever a value was legitimately 0 — so the SUMMARY block did not
    // reconcile against the lines above it.
    const derived = summarisePayroll({
      pay: payList,
      employee: employeeTaxes,
      employeer: employerTaxes,
      deductionContribution: [...employeeDeductions, ...companyContributions],
      gharnishment: garnishments,
    })

    const companyAddr =
      (company?.addresses || []).find((a: any) => a?.is_shipping) ||
      (company?.addresses || [])[0] ||
      {}

    return {
      company: {
        name: company?.name || company?.company_name || "-",
        address: companyAddr?.full_address || company?.address || "",
        city:
          [companyAddr?.city, companyAddr?.province, companyAddr?.postal_code]
            .filter(Boolean)
            .join(", ") || "",
      },
      checkNumber:
        item?.employeeInfo?.checkNumber ||
        item?.employeeInfo?.bankInfo?.title ||
        "—",
      employee: {
        name: employeeUser?.name || item?.employeeInfo?.employeeName || "-",
        address: shippingAddr?.full_address || "",
        city:
          [shippingAddr?.city, shippingAddr?.province, shippingAddr?.postal_code]
            .filter(Boolean)
            .join(", ") || "",
        ssn: employeeUser?.ssn || "",
        employeeId: employeeInfoAll?.employee_id || "",
      },
      payPeriod: {
        beginning,
        ending,
        payDate: item?.employeeInfo?.payDate
          ? moment(item.employeeInfo.payDate).format("MM/DD/YYYY")
          : "",
        payType: item?.employeeInfo?.payType || "",
      },
      pay: payList,
      employeeDeductions,
      companyContributions,
      garnishments,
      employeeTaxes,
      employerTaxes,
      summary: {
        grossPay: derived.grossPay,
        totalPay: derived.grossPay,
        totalEmployeeTaxes: derived.employeeTaxes,
        totalEmployerTaxes: derived.employerTaxes,
        totalEmployeeDeductions: derived.employeeDeductions,
        totalCompanyContributions: derived.companyContributions,
        totalGarnishments: derived.garnishments,
        totalWithheld: derived.totalWithheld,
        netPay: derived.netPay,
        employerCost: derived.employerCost,
        totalCost: derived.totalCost,
      },
      derived,
      memo: item?.employeeInfo?.memo || "Check created out of sequence in a prior quarter",
      role: employeeInfoAll?.designation?.title || "",
      bankingKind:
        item?.employeeInfo?.allinfo?.banaking_informations?.[0]?.kind ||
        item?.employeeInfo?.bankInfo?.kind ||
        "",
    }
  })
}

export default function PayrollStub() {
  const stubRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const token = GetToken()
  const { previewpayroll } = useSelector((state: any) => state.employee)
  const { Company } = useSelector((state: any) => state.CompanyData)
  const [payStabData, setpayStabData] = useState<any[]>([])
  const [showStubs, setShowStubs] = useState(false)
  const router = useRouter()

  const { data: meData } = useQuery({
    queryKey: ["user_profile_data"],
    queryFn: async () => {
      const response = await GetData(`me`, token)
      dispatch(setUser(response))
      return response
    },
    enabled: !!token,
  })

  const companyForStub = Company || meData?.company || {}

  const handleDownloadPDF = async () => {
    if (!stubRef.current) return

    try {
      const { toPng } = await import("html-to-image")
      const jsPDF = (await import("jspdf")).default

      const pdf = new jsPDF("p", "mm", "a4")

      const cardElements = stubRef.current.querySelectorAll(".payroll-card")

      // A4 in mm. The stub was previously drawn at full page width from (0,0)
      // with no height check, so any card taller than the page ran off the
      // bottom — the SUMMARY block was the first thing to be cut. Fit the whole
      // card inside the page instead, scaling by whichever axis binds.
      const pageWidth = 210
      const pageHeight = 297
      const margin = 6
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2

      for (let i = 0; i < cardElements.length; i++) {
        const el = cardElements[i] as HTMLElement
        const imgData = await toPng(el, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: "#ffffff",
        })

        const ratio = el.offsetHeight / el.offsetWidth
        let imgWidth = maxWidth
        let imgHeight = maxWidth * ratio
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight
          imgWidth = maxHeight / ratio
        }

        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, "PNG", (pageWidth - imgWidth) / 2, margin, imgWidth, imgHeight)
      }

      pdf.save("payroll-stubs.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  useEffect(() => {
    if (previewpayroll && previewpayroll.length > 0) {
      const transformed = transformPayrollData(previewpayroll as any, companyForStub)
      setpayStabData(transformed)
    }
  }, [previewpayroll, companyForStub])

  if (!previewpayroll || previewpayroll.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">No payroll data to display. Please submit a payroll first.</p>
      </div>
    )
  }

  // Run-level totals are the per-employee summaries added up — the same numbers
  // the stubs and the PDF print, never a second derivation.
  const N = payStabData.length
  const run = aggregateSummaries(payStabData.map((p: any) => p?.derived).filter(Boolean))
  const grossTotal = run.grossPay
  const netTotal = run.netPay
  const employerTotal = run.employerCost
  // What actually left the employees' gross: taxes + deductions + garnishments.
  const taxesTotal = run.totalWithheld
  const totalCost = run.totalCost
  const payDate = payStabData[0]?.payPeriod?.payDate || ""
  const period = [payStabData[0]?.payPeriod?.beginning, payStabData[0]?.payPeriod?.ending]
    .filter(Boolean)
    .join(" – ")
  const account = payStabData[0]?.checkNumber || "the funding account"

  const timeline: { icon: any; tone: VioletTone; title: string; tag: string; date: string; sub: string }[] = [
    {
      icon: <DollarSign className="h-4 w-4" />,
      tone: "teal",
      title: "Funds debited",
      tag: "Processing",
      date: payDate,
      sub: `${formatCurrency(totalCost)} withdrawn from ${account}`,
    },
    {
      icon: <Check className="h-4 w-4" />,
      tone: "violet",
      title: "Employees paid",
      tag: "Scheduled",
      date: payDate,
      sub: `${formatCurrency(netTotal)} via direct deposit & check`,
    },
    {
      icon: <Landmark className="h-4 w-4" />,
      tone: "warn",
      title: "Payroll taxes filed & paid",
      tag: "Handled",
      date: "Automatic",
      sub: "Federal Form 941, state withholding & FUTA/SUI deposits",
    },
  ]
  const compliance: { icon: any; title: string; sub: string; tone: VioletTone; tag: string }[] = [
    { icon: <ShieldCheck />, title: "Federal income tax & FICA", sub: "Form 941 deposit scheduled", tone: "success", tag: "Handled" },
    { icon: <Landmark />, title: "State income tax withholding", sub: "Remitted to state", tone: "success", tag: "Filed" },
    { icon: <Clock />, title: "Unemployment (FUTA & SUI)", sub: "Accrued for quarterly filing", tone: "warn", tag: "Scheduled" },
  ]

  return (
    <div className="relative pb-28 font-jakarta text-v-ink900">
      {/* success moment */}
      <div className="mt-9 flex flex-col items-center text-center">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-[-14px] animate-v-float rounded-full"
            style={{ background: V.orb.violet }}
          />
          <span
            className="relative flex h-[74px] w-[74px] animate-v-pop items-center justify-center rounded-full text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.primary }}
          >
            <Check className="h-9 w-9" strokeWidth={2.5} />
          </span>
        </div>
        <h1 className="mt-5 text-[30px] font-extrabold tracking-[-0.02em] text-v-ink900">
          Payroll submitted
        </h1>
        <p className="mt-2 max-w-[540px] text-[14px] leading-[1.55] text-v-ink500">
          You paid {N} employee{N === 1 ? "" : "s"} for {period}. Direct deposits land {payDate} and
          all payroll taxes are filed automatically.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-v-ink900 shadow-v-card">
            <span className="h-1.5 w-1.5 rounded-full bg-v-primary" />
            {formatCurrency(totalCost)} total cost
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v-success-bg px-3 py-1.5 text-[13px] font-semibold text-v-success-fg">
            ↑ {formatCurrency(netTotal)} to employees
          </span>
        </div>
      </div>

      {/* timeline + right rail */}
      <div className="mt-7 grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* money movement */}
        <div className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card">
          <div className="mb-4 flex items-center gap-2.5">
            <IconChip tone="violet">
              <Clock />
            </IconChip>
            <div className="flex-1 text-[14px] font-bold text-v-ink900">Money movement</div>
            <Chip tone="success">On track</Chip>
          </div>
          <div className="flex flex-col gap-0">
            {timeline.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      s.tone === "teal"
                        ? "bg-v-teal-bg text-v-teal-fg"
                        : s.tone === "warn"
                          ? "bg-v-warn-bg text-v-warn-fg"
                          : "bg-v-tint100 text-v-primary",
                    )}
                  >
                    {s.icon}
                  </span>
                  {i < timeline.length - 1 && <span className="my-1 w-px flex-1 bg-v-border" />}
                </div>
                <div className="flex-1 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-bold text-v-ink900">{s.title}</span>
                    <Chip tone={s.tone}>{s.tag}</Chip>
                    <span className="flex-1" />
                    <span className="text-[12px] tabular-nums text-v-ink400">{s.date}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-v-ink500">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 rounded-v-tile bg-v-wash px-3.5 py-2.5 text-[12px] text-v-ink500">
            Employees can view pay stubs in their portal the moment deposits land.
          </div>
        </div>

        {/* right rail */}
        <div className="flex flex-col gap-4">
          {/* run summary dark */}
          <div
            className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroViolet }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[50px] -top-[50px] h-[180px] w-[180px] animate-v-float rounded-full"
              style={{ background: V.orb.violet }}
            />
            <div className="relative">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-white/55">
                Run summary · {period}
              </div>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Net to employees</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(netTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Taxes &amp; withholdings</span>
                  <span className="font-semibold tabular-nums text-[#F9A8C7]">
                    {formatCurrency(taxesTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Employer contributions</span>
                  <span className="font-semibold tabular-nums text-[#A7F3D0]">
                    {formatCurrency(employerTotal)}
                  </span>
                </div>
              </div>
              <div className="my-3 border-t border-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold">Total cost</span>
                <span className="text-[18px] font-extrabold tabular-nums">
                  {formatCurrency(totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* US tax compliance */}
          <div className="rounded-v-card bg-white p-5 shadow-v-card">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              US tax compliance
            </div>
            <div className="flex flex-col gap-3">
              {compliance.map((c, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <IconChip tone={c.tone}>{c.icon}</IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold text-v-ink900">{c.title}</div>
                    <div className="text-[11px] text-v-ink400">{c.sub}</div>
                  </div>
                  <Chip tone={c.tone}>{c.tag}</Chip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* employees paid */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Users />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-v-ink900">Employees paid</div>
            <div className="text-[11.5px] text-v-ink400">
              {N} · net deposits arriving {payDate}
            </div>
          </div>
          <span className="flex-1" />
          <VioletButton
            variant="outline"
            size="sm"
            leftIcon={<Receipt className="h-4 w-4" />}
            onClick={() => setShowStubs(true)}
          >
            View pay stubs
          </VioletButton>
        </div>
        {payStabData.map((p: any, i: number) => {
          const m = methodMeta(p?.bankingKind)
          return (
            <div
              key={i}
              className="flex animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 transition-colors hover:bg-[#F7F5FC]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ backgroundImage: avatarGradient(p?.employee?.name || String(i)) }}
              >
                {initials(p?.employee?.name || "?")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-v-ink900">
                  {p?.employee?.name || "—"}
                </div>
                {p?.role && <div className="truncate text-[11px] text-v-ink400">{p.role}</div>}
              </div>
              <Chip tone={m.tone}>{m.label}</Chip>
              <div className="w-[120px] text-right">
                <div className="text-[14px] font-extrabold tabular-nums text-v-ink900">
                  {formatCurrency(p?.summary?.netPay)}
                </div>
                <div className="text-[10.5px] text-v-ink400">net pay</div>
              </div>
              <button
                type="button"
                onClick={() => setShowStubs(true)}
                className="flex h-8 items-center rounded-[9px] bg-v-tint100 px-3 text-[12.5px] font-semibold text-v-primary transition-colors hover:bg-v-primary hover:text-white"
              >
                Pay stub
              </button>
            </div>
          )
        })}
      </div>

      {/* sticky action bar */}
      <div className="sticky bottom-[14px] z-[60] mt-4">
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-v-ink900 px-5 py-3.5 text-white shadow-[0_24px_50px_-18px_rgba(22,23,42,0.6)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-v-success-solid text-white">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-[13px] font-semibold">
            All set — {N} paid for {period}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => setShowStubs(true)}
            className="rounded-v-btn px-4 py-2.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            View pay stubs
          </button>
          <VioletButton
            variant="primary"
            onClick={() => router.push("/dashboard/hris/payroll/salary_process")}
          >
            Back to Run payroll →
          </VioletButton>
        </div>
      </div>

      {/* pay stubs modal */}
      {showStubs && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black/50 p-3 sm:p-4"
          onClick={() => setShowStubs(false)}
        >
          <div
            className="mx-auto flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-v-card bg-white font-jakarta"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-v-border px-5 py-3">
              <h2 className="text-[16px] font-bold text-v-ink900">Pay stubs</h2>
              <div className="flex items-center gap-2">
                <VioletButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </VioletButton>
                <button
                  type="button"
                  onClick={() => setShowStubs(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-wash2"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div ref={stubRef}>
        {payStabData &&
          payStabData.map((payrollData: any, index: any) => (
            <Card key={index} className="payroll-card bg-white border-2 mb-5">
              <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="border-b-4 border-blue-900 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {payrollData.company.name}
                      </h2>
                      <p className="text-sm text-gray-700">{payrollData.company.address}</p>
                      <p className="text-sm text-gray-700">{payrollData.company.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        Check No.: {payrollData.checkNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{payrollData.employee.name}</p>
                      <p className="text-sm text-gray-700">{payrollData.employee.address}</p>
                      <p className="text-sm text-gray-700">{payrollData.employee.city}</p>
                      {payrollData.employee.employeeId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Employee ID: {payrollData.employee.employeeId}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Pay Stub Detail</p>
                      <p className="text-sm">PAY DATE: {payrollData.payPeriod.payDate}</p>
                      <p className="text-sm">NET PAY: {formatCurrency(payrollData.summary.netPay)}</p>
                    </div>
                  </div>
                </div>

                {/* Employer / Employee / Pay Period */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-sm mb-2">EMPLOYER</h3>
                    <p className="text-sm">{payrollData.company.name}</p>
                    <p className="text-sm">{payrollData.company.address}</p>
                    <p className="text-sm">{payrollData.company.city}</p>

                    <h3 className="font-bold text-sm mt-4 mb-2">EMPLOYEE</h3>
                    <p className="text-sm">{payrollData.employee.name}</p>
                    <p className="text-sm">{payrollData.employee.address}</p>
                    <p className="text-sm">{payrollData.employee.city}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold">PAY PERIOD</span>
                      <span className="font-bold">Check No.: {payrollData.checkNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Period Beginning:</span>
                      <span>{payrollData.payPeriod.beginning}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Period Ending:</span>
                      <span>{payrollData.payPeriod.ending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pay Date:</span>
                      <span>{payrollData.payPeriod.payDate}</span>
                    </div>
                    {payrollData.payPeriod.payType && (
                      <div className="flex justify-between text-sm">
                        <span>Pay Frequency:</span>
                        <span>{prettyLabel(payrollData.payPeriod.payType)}</span>
                      </div>
                    )}

                    {/* Company Contributions */}
                    <div className="mt-4">
                      <table className="w-full text-sm border">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left font-bold py-2 px-2">
                              OTHER PAY/CONTRIBUTIONS
                            </th>
                            <th className="text-right font-bold px-2">Current</th>
                            <th className="text-right font-bold px-2">YTD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrollData.companyContributions.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-2 px-2 text-gray-400 text-center">
                                No contributions
                              </td>
                            </tr>
                          ) : (
                            payrollData.companyContributions.map((c: any, i: number) => (
                              <tr key={i} className="border-b last:border-b-0">
                                <td className="py-1 px-2">
                                  {prettyLabel(c?.payroll_type || c?.type)}
                                </td>
                                <td className="text-right px-2">{formatCurrency(c?.current)}</td>
                                <td className="text-right px-2">{formatYtd(c?.ytd)}</td>
                              </tr>
                            ))
                          )}
                          {payrollData.companyContributions.length > 0 && (
                            <tr className="font-bold bg-gray-50">
                              <td className="py-1 px-2">Total</td>
                              <td className="text-right px-2">
                                {formatCurrency(payrollData.summary.totalCompanyContributions)}
                              </td>
                              <td className="text-right px-2">
                                {formatYtd(sumYtd(payrollData.companyContributions))}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between font-bold">
                        <span>NET PAY:</span>
                        <span>{formatCurrency(payrollData.summary.netPay)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Memo */}
                <div className="border-t pt-4">
                  <p className="font-bold text-sm">MEMO:</p>
                  <p className="text-sm">{payrollData.memo}</p>
                </div>

                {/* Pay and Employee Deductions */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Pay Section */}
                  <div>
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left font-bold py-2 px-2">PAY</th>
                          <th className="text-center font-bold px-2">Hours</th>
                          <th className="text-center font-bold px-2">Rate</th>
                          <th className="text-right font-bold px-2">Current</th>
                          <th className="text-right font-bold px-2">YTD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData.pay.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-2 px-2 text-gray-400 text-center">
                              No pay items
                            </td>
                          </tr>
                        ) : (
                          payrollData.pay.map((payItem: any, i: number) => (
                            <tr key={i} className="border-b last:border-b-0">
                              <td className="py-1 px-2">{prettyLabel(payItem?.payroll_type)}</td>
                              <td className="text-center px-2">
                                {Number(payItem?.hours || 0).toFixed(2)}
                              </td>
                              <td className="text-center px-2">
                                {formatCurrency(payItem?.rate)}
                              </td>
                              <td className="text-right px-2">
                                {formatCurrency(payItem?.current)}
                              </td>
                              <td className="text-right px-2">
                                {formatYtd(payItem?.ytd)}
                              </td>
                            </tr>
                          ))
                        )}
                        <tr className="font-bold bg-gray-50">
                          <td className="py-1 px-2" colSpan={3}>
                            Total Pay
                          </td>
                          <td className="text-right px-2">
                            {formatCurrency(payrollData.summary.totalPay)}
                          </td>
                          <td className="text-right px-2">
                            {formatYtd(sumYtd(payrollData.pay))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Deductions + Garnishments Section */}
                  <div>
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left font-bold py-2 px-2">DEDUCTIONS</th>
                          <th className="text-right font-bold px-2">Current</th>
                          <th className="text-right font-bold px-2">YTD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData.employeeDeductions.length === 0 &&
                        payrollData.garnishments.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-2 px-2 text-gray-400 text-center">
                              No deductions
                            </td>
                          </tr>
                        ) : (
                          <>
                            {payrollData.employeeDeductions.map((d: any, i: number) => (
                              <tr key={`d-${i}`} className="border-b last:border-b-0">
                                <td className="py-1 px-2">
                                  {prettyLabel(d?.payroll_type || d?.type)}
                                </td>
                                <td className="text-right px-2">{formatCurrency(d?.current)}</td>
                                <td className="text-right px-2">{formatYtd(d?.ytd)}</td>
                              </tr>
                            ))}
                            {payrollData.garnishments.map((g: any, i: number) => (
                              <tr key={`g-${i}`} className="border-b last:border-b-0">
                                <td className="py-1 px-2">
                                  {prettyLabel(g?.payroll_type)} (Garnishment)
                                </td>
                                <td className="text-right px-2">{formatCurrency(g?.current)}</td>
                                <td className="text-right px-2">{formatYtd(g?.ytd)}</td>
                              </tr>
                            ))}
                          </>
                        )}
                        <tr className="font-bold bg-gray-50">
                          <td className="py-1 px-2">Total Deductions</td>
                          <td className="text-right px-2">
                            {formatCurrency(
                              payrollData.summary.totalEmployeeDeductions +
                                payrollData.summary.totalGarnishments,
                            )}
                          </td>
                          <td className="text-right px-2">
                            {formatYtd(
                              sumYtd(payrollData.employeeDeductions) +
                                sumYtd(payrollData.garnishments),
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Employee Taxes Section */}
                <div>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left font-bold py-2 px-2">EMPLOYEE TAXES</th>
                        <th className="text-right font-bold px-2">Current</th>
                        <th className="text-right font-bold px-2">YTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.employeeTaxes.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-2 px-2 text-gray-400 text-center">
                            No employee taxes
                          </td>
                        </tr>
                      ) : (
                        payrollData.employeeTaxes.map((t: any, i: number) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="py-1 px-2">{prettyLabel(t?.payroll_type)}</td>
                            <td className="text-right px-2">{formatCurrency(t?.current)}</td>
                            <td className="text-right px-2">{formatYtd(t?.ytd)}</td>
                          </tr>
                        ))
                      )}
                      <tr className="font-bold bg-gray-50">
                        <td className="py-1 px-2">Total Employee Taxes</td>
                        <td className="text-right px-2">
                          {formatCurrency(payrollData.summary.totalEmployeeTaxes)}
                        </td>
                        <td className="text-right px-2">
                          {formatYtd(sumYtd(payrollData.employeeTaxes))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Employer Taxes Section */}
                <div>
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left font-bold py-2 px-2">EMPLOYER TAXES</th>
                        <th className="text-right font-bold px-2">Current</th>
                        <th className="text-right font-bold px-2">YTD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.employerTaxes.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-2 px-2 text-gray-400 text-center">
                            No employer taxes
                          </td>
                        </tr>
                      ) : (
                        payrollData.employerTaxes.map((t: any, i: number) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="py-1 px-2">{prettyLabel(t?.payroll_type)}</td>
                            <td className="text-right px-2">{formatCurrency(t?.current)}</td>
                            <td className="text-right px-2">{formatYtd(t?.ytd)}</td>
                          </tr>
                        ))
                      )}
                      <tr className="font-bold bg-gray-50">
                        <td className="py-1 px-2">Total Employer Taxes</td>
                        <td className="text-right px-2">
                          {formatCurrency(payrollData.summary.totalEmployerTaxes)}
                        </td>
                        <td className="text-right px-2">
                          {formatYtd(sumYtd(payrollData.employerTaxes))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Summary Section */}
                <div className="border-2 border-gray-800 p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-bold">SUMMARY</th>
                        <th className="text-right font-bold">Current</th>
                      </tr>
                    </thead>
                    {/* Reads top to bottom as the actual arithmetic: gross, less
                        each withholding, equals net. Employer-side amounts sit
                        below the net line because they are a company cost and
                        never come out of this cheque. */}
                    <tbody>
                      <tr>
                        <td className="py-1">Gross Pay</td>
                        <td className="text-right">
                          {formatCurrency(payrollData.summary.grossPay)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Less: Employee Taxes</td>
                        <td className="text-right">
                          −{formatCurrency(payrollData.summary.totalEmployeeTaxes)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Less: Employee Deductions</td>
                        <td className="text-right">
                          −{formatCurrency(payrollData.summary.totalEmployeeDeductions)}
                        </td>
                      </tr>
                      {payrollData.summary.totalGarnishments > 0 && (
                        <tr>
                          <td className="py-1">Less: Garnishments</td>
                          <td className="text-right">
                            −{formatCurrency(payrollData.summary.totalGarnishments)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t font-semibold">
                        <td className="py-1">Total Withheld</td>
                        <td className="text-right">
                          −{formatCurrency(payrollData.summary.totalWithheld)}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-gray-800 font-bold">
                        <td className="py-2">Net Pay</td>
                        <td className="text-right">
                          {formatCurrency(payrollData.summary.netPay)}
                        </td>
                      </tr>
                      <tr>
                        <td className="pt-4 text-xs uppercase text-gray-500" colSpan={2}>
                          Employer cost — not withheld from the employee
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Company Contributions</td>
                        <td className="text-right">
                          {formatCurrency(payrollData.summary.totalCompanyContributions)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Employer Taxes</td>
                        <td className="text-right">
                          {formatCurrency(payrollData.summary.totalEmployerTaxes)}
                        </td>
                      </tr>
                      <tr className="border-t font-bold">
                        <td className="py-2">Total Cost to Employer</td>
                        <td className="text-right">
                          {formatCurrency(payrollData.summary.totalCost)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
