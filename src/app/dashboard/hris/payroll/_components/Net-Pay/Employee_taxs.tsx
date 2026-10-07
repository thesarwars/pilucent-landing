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
import {
    buildEmployeePriorYtd,
    buildFederalW4InputsFromTaxRecord,
    calculateMnUnemploymentTax,
    calculateNYSUI,
    collectPreTaxDeductionPerPaycheck,
    estimate_FutaTax,
    estimate_medicareTax,
    estimate_mnPaidLeave,
    estimate_socialSecurityTax,
    estimateFederalWithholding_,
    extractIncomeAndPayPeriods,
    getTaxRecord,
    getTaxExemptions,
    isMnPaidLeaveApplicable,
    mapHoldingStatusToFilingStatus,
    getEmployeePayrollComponents,
    getEmployeeYtdComponentSum,
    getPayrollComponentYtd,
} from "@/utils/SalaryProcess";

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
    { id: 1, type: "FUTA Employer", current: "$4,166.67", ytd: "$5,689.11" },
    { id: 2, type: "Social Security Employer", current: "$0.00", ytd: "$7,212.20" },
    { id: 3, type: "Medicare Employer", current: "$0.00", ytd: "$480.80" },
    { id: 4, type: "AL SUI Employer", current: "$0.00", ytd: "$2,403.85" },
    { id: 5, type: "AL Employment Security Assessment Tax ", current: "$0.00", ytd: "$50.00" },
    { id: 5, type: "Total", current: "$0.00", ytd: "$50.00" },
];

const Employee_taxs = ({ data: taxData, dataYtd, stateName, taxes }: any) => {
    const [data, setData] = useState(initialData);
    const [showBody, setShowBody] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    useEffect(() => {

        // Section 125 (PRETAX) employee deductions reduce the FICA /
        // FUTA / SUI wage base; MN Paid Leave stays on FULL gross
        // (mirrors the Run-payroll2 save path).
        const preTax = collectPreTaxDeductionPerPaycheck(taxData?.allinfo);
        const grossPay = Number(taxData?.grossPay);
        const taxableGross = Math.max(0, grossPay - preTax);
        const { incomePerPeriod, payPeriods } = extractIncomeAndPayPeriods({ ...taxData?.allinfo, total_salary: taxableGross });
        const taxRecord = getTaxRecord(taxes ?? taxData?.allinfo?.taxes);
        const exemptions = getTaxExemptions(taxes ?? taxData?.allinfo?.taxes);
        const { filingStatus } = mapHoldingStatusToFilingStatus(taxRecord?.holding_status);

        // PRIOR-YTD snapshot built by aggregating every prior payroll
        // run for the employee in the current tax year. This is the
        // trustworthy YTD source because the saved per-component `ytd`
        // field was historically persisted as 0.
        const priorYtd = buildEmployeePriorYtd(taxData?.allinfo);

        const w4 = buildFederalW4InputsFromTaxRecord(taxRecord);
        const { annualWages, estimatedAnnualTax, estimatedWithholdingPerPeriod, effectiveTaxRate } = estimateFederalWithholding_(incomePerPeriod, filingStatus, payPeriods, w4);
        const stateForUi = (stateName || taxRecord?.state || "NY").toUpperCase();
        const isMN = stateForUi === "MN";

        const mnUiRateInput =
            Number(taxRecord?.mn_ui_rate) ||
            Number(taxRecord?.ui_rate) ||
            Number(taxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
            0;

        // State Unemployment exemption covers MN UI breakdown as well as
        // NY SUI + RSF (per `exempt_fields["NY SUI and Re-Employment"]`).
        const mnUi = isMN && !exemptions.stateUnemployment
            ? calculateMnUnemploymentTax(taxableGross, {
                uiRate: mnUiRateInput || undefined,
                ytdWages: priorYtd.mnUiWages,
                ytdTaxPaid: priorYtd.mnUiTotal,
            })
            : null;

        // NY 2026 defaults: $17,600 wage base, 9.825% QBO blended default
        // UI rate (matches `payroll-calculator.js` `loadQboNYMatch`). RSF
        // (0.075%) is computed separately and surfaced as its own row per
        // NYS-45 (not blended into the SUI rate). NY UI is computed on
        // the CURRENT pay-period gross (with YTD-aware wage-base
        // capping), mirroring `nyUnemploymentTax(currentGross, ...)` in
        // the standalone calculator — so a $4k pay period yields $393.00
        // NY SUI on the default rate, not $1,729.20.
        const nyUiRateInput =
            Number(taxRecord?.ny_ui_rate) ||
            Number(taxRecord?.ui_rate) ||
            Number(taxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
            0;
        const nyBreakdown = !isMN && !exemptions.stateUnemployment
            ? calculateNYSUI(
                taxableGross,
                nyUiRateInput || undefined,
                undefined,
                undefined,
                priorYtd.nyUiWages,
                {
                    suiTaxPaid: priorYtd.nySuiTax,
                    rsfTaxPaid: priorYtd.nyRsfTax,
                },
            )
            : null;

        const mnPLApplies = isMnPaidLeaveApplicable(taxes ?? taxData?.allinfo?.taxes);
        const mnPLAmt = mnPLApplies
            ? Number(estimate_mnPaidLeave(grossPay).estimatedTax)
            : 0;

        // Per-tax YTD = prior aggregated YTD (from saved history) +
        // this period's current value. We don't rely on the saved
        // `ytd` field because the legacy save path persisted ytd=0.
        const ytdMnUiBreakdown = (key: string) =>
            getEmployeeYtdComponentSum(taxData?.allinfo, [key]);

        // When the employee has no saved payroll history yet, the YTD
        // column must display $0 — the current pay-period is a PREVIEW
        // and has not been recorded as a YTD contribution. The current
        // calculations themselves (especially FUTA's $7,000 wage-base
        // cap, NY UI's $17,600 cap, MN UI caps) keep their YTD-aware
        // existing logic untouched; only the displayed YTD column is
        // zeroed for first-time payrolls.
        const hasPayrollHistory =
            Array.isArray(taxData?.allinfo?.payroll_salary_process) &&
            taxData.allinfo.payroll_salary_process.length > 0;
        const ytdOrZero = (priorVal: number, currentVal: number) =>
            hasPayrollHistory ? Number(priorVal) + Number(currentVal) : 0;

        if (taxData) {
            // Per-employee tax exemptions: when an exemption flag is true the
            // matching row is omitted from this modal — neither calculated
            // nor displayed — matching `fedExempt` / `stateExempt` /
            // `exempt_fields` handling in `payroll-calculator.js` and the
            // saved-payroll write path in Run-payroll2.tsx.
            const rows: SalaryProcessItem[] = [];
            let nextId = 1;
            let totalTaxCurrent = 0;
            let totalYtd = 0;
            const fmt2 = (n: any) =>
                (Math.round(Number(n) * 100) / 100).toFixed(2);

            if (!exemptions.futa) {
                // FUTA: must be calculated on CURRENT pay-period gross with
                // YTD-aware $7,000 wage-base capping (Pub. 15 §11). YTD
                // FUTA-taxable wages come from saved payroll history.
                const futaCreditInput =
                    Number(taxRecord?.futa_credit_rate) ||
                    Number(taxData?.allinfo?.employer_tax_profile?.futa_credit_rate);
                const futaCurrent = Number(
                    estimate_FutaTax(taxableGross, {
                        ytdSubjectWages: priorYtd.futaWages,
                        ytdTaxPaid: priorYtd.futaTax,
                        creditRate:
                            Number.isFinite(futaCreditInput) && futaCreditInput > 0
                                ? futaCreditInput
                                : undefined,
                    }).estimatedTax,
                );
                const futaYtd = ytdOrZero(priorYtd.futaTax, futaCurrent);
                totalTaxCurrent += futaCurrent;
                totalYtd += futaYtd;
                rows.push({
                    id: nextId++,
                    type: "FUTA Employer",
                    current: fmt2(futaCurrent),
                    ytd: fmt2(futaYtd),
                });
            }

            if (!exemptions.socialSecurityMedicare) {
                // SS: 6.2% capped at the annual wage base ($184,500 for
                // 2026) using YTD subject-wage capping (Pub. 15 §10).
                const ssCurrent = Number(
                    estimate_socialSecurityTax(taxableGross, {
                        ytdSubjectWages: priorYtd.socialSecurityWages,
                        ytdTaxPaid: priorYtd.socialSecurityTaxEmployer,
                    }).estimatedTax,
                );
                const ssYtd = ytdOrZero(
                    priorYtd.socialSecurityTaxEmployer,
                    ssCurrent,
                );
                totalTaxCurrent += ssCurrent;
                totalYtd += ssYtd;
                rows.push({
                    id: nextId++,
                    type: "Social Security Employer",
                    current: fmt2(ssCurrent),
                    ytd: fmt2(ssYtd),
                });

                const medCurrent = Number(
                    estimate_medicareTax(taxableGross).estimatedTax,
                );
                const medYtd = ytdOrZero(priorYtd.medicareTax, medCurrent);
                totalTaxCurrent += medCurrent;
                totalYtd += medYtd;
                rows.push({
                    id: nextId++,
                    type: "Medicare Employer",
                    current: fmt2(medCurrent),
                    ytd: fmt2(medYtd),
                });
            }

            if (!exemptions.stateUnemployment) {
                if (isMN && mnUi) {
                    const mnRows = [
                        {
                            type: "MN UI Employer",
                            key: "MN_UI_EMPLOYER",
                            current: Number(mnUi.uiEmployer),
                        },
                        {
                            type: "MN Workforce Development Fee",
                            key: "MN_WORKFORCE_DEVELOPMENT_FEE",
                            current: Number(mnUi.workforceDevelopmentFee),
                        },
                        {
                            type: "MN Federal Loan Interest Assessment",
                            key: "MN_FEDERAL_LOAN_INTEREST_ASSESSMENT",
                            current: Number(mnUi.federalLoanInterestAssessment),
                        },
                        {
                            type: "MN Additional Assessment",
                            key: "MN_ADDITIONAL_ASSESSMENT",
                            current: Number(mnUi.additionalAssessment),
                        },
                    ];
                    mnRows.forEach((row) => {
                        const ytdVal = ytdOrZero(
                            ytdMnUiBreakdown(row.key),
                            row.current,
                        );
                        totalTaxCurrent += row.current;
                        totalYtd += ytdVal;
                        rows.push({
                            id: nextId++,
                            type: row.type,
                            current: fmt2(row.current),
                            ytd: fmt2(ytdVal),
                        });
                    });
                } else if (!isMN && nyBreakdown) {
                    const suiCurrent = Number(nyBreakdown.suiTax);
                    const suiYtd = ytdOrZero(priorYtd.nySuiTax, suiCurrent);
                    totalTaxCurrent += suiCurrent;
                    totalYtd += suiYtd;
                    rows.push({
                        id: nextId++,
                        type: stateForUi + " SUI Employer",
                        current: fmt2(suiCurrent),
                        ytd: fmt2(suiYtd),
                    });
                    if (stateForUi === "NY") {
                        const rsfCurrent = Number(nyBreakdown.rsfTax);
                        const rsfYtd = ytdOrZero(priorYtd.nyRsfTax, rsfCurrent);
                        totalTaxCurrent += rsfCurrent;
                        totalYtd += rsfYtd;
                        rows.push({
                            id: nextId++,
                            type: "NY Re-employment Service Fund",
                            current: fmt2(rsfCurrent),
                            ytd: fmt2(rsfYtd),
                        });
                    }
                }
            }

            if (mnPLApplies) {
                const mnPlYtdVal = ytdOrZero(
                    priorYtd.mnPaidLeaveEmployee,
                    mnPLAmt,
                );
                totalTaxCurrent += mnPLAmt;
                totalYtd += mnPlYtdVal;
                rows.push({
                    id: nextId++,
                    type: "MN Paid Leave - Employer",
                    current: fmt2(mnPLAmt),
                    ytd: fmt2(mnPlYtdVal),
                });
            }

            rows.push({
                id: nextId++,
                type: "Total",
                current: fmt2(totalTaxCurrent),
                ytd: fmt2(totalYtd),
            });
            setData(rows);
        }
    }, [taxData, dataYtd, stateName, taxes]);

    const getCurrentPageItems = () => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };

    const handleChange = (rowIndex: number, key: keyof SalaryProcessItem, value: string) => {
        const updated = [...data];
        updated[rowIndex] = { ...updated[rowIndex], [key]: value };
        setData(updated);
    };

    return (
        <div className="font-inter">
            <div className="rounded-[20px] px-4 py-8">
                <div className="mb-4 flex items-center cursor-pointer" onClick={() => setShowBody((prev) => !prev)}>
                    <h1 className="text-md font-semibold text-accent_text_black">Employeer Taxes</h1>
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

export default Employee_taxs;
