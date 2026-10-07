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
  calculateNYStateTax,
  collectPreTaxDeductionPerPaycheck,
  detectNycResidentFromEmployee,
  estimate_additionalMedicareTaxForPeriod,
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
  { id: 1, type: "Federal Income Tax", current: "0", ytd: "0" },
  { id: 2, type: "Social Security", current: "0", ytd: "0" },
  { id: 3, type: "Medicare", current: "0", ytd: "0" },
  { id: 4, type: "Holiday Pay", current: "0", ytd: "0" },
  { id: 5, type: "All Income Tax", current: "0", ytd: "0" },
  { id: 5, type: "Total", current: "0", ytd: "0" },
];

const Employee_tax = ({
  data: taxData,
  totalGross: mainTotal,
  stateTax,
  stateName,
  settotalTax,
  taxes,
}: any) => {
  const [data, setData] = useState(initialData);
  const [showBody, setShowBody] = useState(true);

  // derive total gross directly from props to avoid synchronous setState in effect
  const effectiveTotalGross = taxData?.grossPay ?? mainTotal;

  useEffect(() => {
    const payFrequency =
      taxData?.allinfo?.pay_schedule?.pay_frequency ??
      taxData?.allinfo?.pay_frequency ??
      "EVERY_MONTH";

    // Section 125 (PRETAX) employee deductions reduce the FICA and
    // federal/state income-tax wage base. Paid-leave premiums stay on
    // FULL gross (mirrors the Run-payroll2 save path).
    const preTax = collectPreTaxDeductionPerPaycheck(taxData?.allinfo);

    const { incomePerPeriod, payPeriods } = extractIncomeAndPayPeriods({
      ...taxData?.allinfo,
      pay_frequency: payFrequency,
      total_salary: Math.max(0, Number(mainTotal) - preTax),
    });

    const taxRecord = getTaxRecord(taxes ?? taxData?.allinfo?.taxes);
    const exemptions = getTaxExemptions(taxes ?? taxData?.allinfo?.taxes);
    const { filingStatus: federalFilingStatus, stateFilingStatus } =
      mapHoldingStatusToFilingStatus(taxRecord?.holding_status);

    // Wire W-4 Step 2/3/4 + federal-exempt flag into Pub. 15-T method
    // so the displayed federal-income-tax row matches what payroll
    // actually saved.
    const w4 = buildFederalW4InputsFromTaxRecord(taxRecord);
    const { estimatedWithholdingPerPeriod } = estimateFederalWithholding_(
      incomePerPeriod,
      federalFilingStatus,
      payPeriods,
      w4,
    );

    // PRIOR-YTD snapshot from saved payroll runs — drives SS wage-base
    // cap and Additional Medicare $200k threshold across pay periods.
    const priorYtd = buildEmployeePriorYtd(taxData?.allinfo);

    const gross = Number(mainTotal);
    const taxableGross = Math.max(0, gross - preTax);
    const socialSecurity = estimate_socialSecurityTax(taxableGross, {
      ytdSubjectWages: priorYtd.socialSecurityWages,
      ytdTaxPaid: priorYtd.socialSecurityTax,
    });
    const medicare = estimate_medicareTax(taxableGross);
    const additionalMedicare = estimate_additionalMedicareTaxForPeriod(
      taxableGross,
      priorYtd.medicareWages,
      federalFilingStatus === "married" ? "mfj" : federalFilingStatus,
    );

    const rawState = String(stateName || "NY").toUpperCase();
    const isNy = rawState === "NY" || rawState === "NYC";

    // NYC RESIDENT tax follows home-address residency (NYS-50-T-NYC).
    const nycResidentDisplay = detectNycResidentFromEmployee(taxData?.allinfo);
    const { nyStateTax, nycTax, sdi, fli } = calculateNYStateTax({
      gross: taxableGross,
      payFrequency,
      state: stateName || "NY",
      filingStatus: stateFilingStatus,
      pflYTD: priorYtd.pflWithheld,
      method: "withholding",
      allowances: 0,
      residentCity: nycResidentDisplay ? "nyc" : null,
    });
    // NY State and NYC City tax are displayed as separate rows below —
    // do not combine them here.

    const addMedNum = Number(additionalMedicare.estimatedTax);

    const mnPLApplies = isMnPaidLeaveApplicable(
      taxes ?? taxData?.allinfo?.taxes,
    );
    const mnPLAmt = mnPLApplies
      ? Number(estimate_mnPaidLeave(gross).estimatedTax)
      : 0;

    // Render YTD as `prior YTD (aggregated from saved history) + this
    // pay-period's current value`. This is the trustworthy YTD source
    // because the legacy save path persisted `ytd: 0` on every saved
    // payroll component — reading the latest saved component's `ytd`
    // field returns 0 even when there are multiple prior payrolls.
    const ytdSdi = getEmployeeYtdComponentSum(
      taxData?.allinfo,
      ["SDI", "NY_SDI"],
    );

    // When the employee has no saved payroll history yet, the YTD
    // column must display $0 — the current pay-period is a PREVIEW and
    // has not been recorded as a YTD contribution. Adding `current` to
    // a zero `priorYtd` would otherwise make YTD equal to Current,
    // which is misleading for first-time payrolls.
    const hasPayrollHistory =
      Array.isArray(taxData?.allinfo?.payroll_salary_process) &&
      taxData.allinfo.payroll_salary_process.length > 0;
    const ytdOrZero = (priorVal: number, currentVal: number) =>
      hasPayrollHistory ? Number(priorVal) + Number(currentVal) : 0;

    if (taxData) {
      // Per-employee tax exemptions: a true flag drops the matching row
      // entirely (not calculated, not displayed) — matching the
      // `fedExempt` / `stateExempt` / `exempt_fields` behavior in
      // `payroll-calculator.js` and the saved-payroll write path in
      // Run-payroll2.tsx (`saveExemptions` + `.filter(item.current > 0)`).
      const rows: SalaryProcessItem[] = [];
      let id = 1;
      let totalTaxCurrent = 0;
      let totalYtd = 0;
      const fmt2 = (n: number) =>
        (Math.round(Number(n) * 100) / 100).toFixed(2);

      if (!exemptions.federalIncomeTax) {
        const currentVal = Number(estimatedWithholdingPerPeriod);
        const ytdVal = ytdOrZero(priorYtd.federalIncomeTax, currentVal);
        totalTaxCurrent += currentVal;
        totalYtd += ytdVal;
        rows.push({
          id: id++,
          type: "Federal Income Tax",
          current: fmt2(currentVal),
          ytd: fmt2(ytdVal),
        });
      }

      if (!exemptions.socialSecurityMedicare) {
        const ssCurrent = Number(socialSecurity.estimatedTax);
        const ssYtdVal = ytdOrZero(priorYtd.socialSecurityTax, ssCurrent);
        totalTaxCurrent += ssCurrent;
        totalYtd += ssYtdVal;
        rows.push({
          id: id++,
          type: "Social Security",
          current: fmt2(ssCurrent),
          ytd: fmt2(ssYtdVal),
        });

        const medCurrent = Number(medicare.estimatedTax);
        const medYtdVal = ytdOrZero(priorYtd.medicareTax, medCurrent);
        totalTaxCurrent += medCurrent;
        totalYtd += medYtdVal;
        rows.push({
          id: id++,
          type: "Medicare",
          current: fmt2(medCurrent),
          ytd: fmt2(medYtdVal),
        });

        if (addMedNum > 0) {
          const addMedYtdVal = ytdOrZero(priorYtd.additionalMedicareTax, addMedNum);
          totalTaxCurrent += addMedNum;
          totalYtd += addMedYtdVal;
          rows.push({
            id: id++,
            type: "Additional Medicare",
            current: fmt2(addMedNum),
            ytd: fmt2(addMedYtdVal),
          });
        }
      }

      if (!exemptions.stateIncomeTax) {
        // NY State income tax — always its own row (mirrors payroll-calculator.js
        // "State Income Tax" line, never combined with NYC resident tax).
        const nyStateOnly = Number(nyStateTax);
        const nyStateYtd = ytdOrZero(priorYtd.stateIncomeTax, nyStateOnly);
        totalTaxCurrent += nyStateOnly;
        totalYtd += nyStateYtd;
        rows.push({
          id: id++,
          type: `${stateName || "State"} Income Tax`,
          current: fmt2(nyStateOnly),
          ytd: fmt2(nyStateYtd),
        });

        // NYC City Tax — separate row, only for NYC residents
        // (mirrors payroll-calculator.js "City Tax" line).
        const nycOnly = Number(nycTax || 0);
        if (nycResidentDisplay && nycOnly > 0) {
          const nycYtd = ytdOrZero(priorYtd.nycResidentTax, nycOnly);
          totalTaxCurrent += nycOnly;
          totalYtd += nycYtd;
          rows.push({
            id: id++,
            type: "NYC City Tax",
            current: fmt2(nycOnly),
            ytd: fmt2(nycYtd),
          });
        }
      }

      if (isNy) {
        if (!exemptions.nySdi) {
          const sdiCurrent = Number(sdi || 0);
          const sdiYtdVal = ytdOrZero(ytdSdi, sdiCurrent);
          totalTaxCurrent += sdiCurrent;
          totalYtd += sdiYtdVal;
          rows.push({
            id: id++,
            type: "SDI",
            current: fmt2(sdiCurrent),
            ytd: fmt2(sdiYtdVal),
          });
        }
        if (!exemptions.nyPfl) {
          const fliCurrent = Number(fli || 0);
          const fliYtdVal = ytdOrZero(priorYtd.nyPfl, fliCurrent);
          totalTaxCurrent += fliCurrent;
          totalYtd += fliYtdVal;
          rows.push({
            id: id++,
            type: "FLI",
            current: fmt2(fliCurrent),
            ytd: fmt2(fliYtdVal),
          });
        }
      }

      if (mnPLApplies) {
        const mnPlYtdVal = ytdOrZero(priorYtd.mnPaidLeaveEmployee, mnPLAmt);
        totalTaxCurrent += mnPLAmt;
        totalYtd += mnPlYtdVal;
        rows.push({
          id: id++,
          type: "Minnesota Paid Leave",
          current: fmt2(mnPLAmt),
          ytd: fmt2(mnPlYtdVal),
        });
      }

      rows.push({
        id: id++,
        type: "Total",
        current: fmt2(totalTaxCurrent),
        ytd: fmt2(totalYtd),
      });
      
      // Batch state updates to avoid cascading renders
      setData(rows);
      settotalTax?.(totalTaxCurrent.toFixed(2));
    }
  }, [taxData, settotalTax, mainTotal, stateName, taxes]);

  const getCurrentPageItems = () => {
    return data;
  };

  return (
    <div className="font-inter">
      <div className="rounded-[20px] px-4 py-8">
        <div
          className="mb-4 flex cursor-pointer items-center"
          onClick={() => setShowBody((prev) => !prev)}
        >
          <h1 className="text-md font-semibold text-accent_text_black">
            Employee Tax
          </h1>
          {showBody ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
        </div>

        {showBody && (
          <form>
            <Table className="font-inter w-full text-left">
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key as string}
                      className="py-5 pl-6 text-left"
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {getCurrentPageItems().map((row: any, rowIndex: any) => (
                  <TableRow key={row.id}>
                    {columns.map((col: any) => {
                      if (col.key === "type") {
                        return (
                          <TableCell
                            key={rowIndex as string}
                            className="py-4 pl-6 text-left"
                          >
                            {row[col.key]}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={rowIndex as string}
                          className="py-4 pl-6 text-left"
                        >
                          <input
                            type="text"
                            value={"$" + row[col.key]}
                            disabled
                            className="w-[100px] border-b border-gray-300 bg-transparent focus:outline-none"
                          />
                        </TableCell>
                      );
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

export default Employee_tax;
