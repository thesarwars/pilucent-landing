'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/RawButton';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { BsEye, BsPrinter, BsThreeDotsVertical } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { RiFileExcel2Line, RiFilePdf2Line } from 'react-icons/ri';
import Pagination from '@/components/Pagination/Pagination';
import { TbFilter } from 'react-icons/tb';
import { IoIosArrowDown } from 'react-icons/io';
import {
  Banknote,
  CalendarDays,
  Wallet,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Receipt,
  Search,
} from 'lucide-react';
import AddTaxModal from './AddTaxModal';
import EditHourModal from './EditHourModal';
import { BiEdit } from 'react-icons/bi';
import Link from 'next/link';
import AddTaxModalEmpty from './AddTaxModalempty';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import GetToken from '@/hooks/getToken';
import { toast } from 'react-toastify';
import { addpreview, addsalaryproccess, payrollInfoAdd } from '@/app/redux/Employee/EmployeeSlice';
import { useAppSelector } from '@/app/redux/store';
import { savedSalary } from '@/app/helpers/backend';
import {
  buildEmployeePriorYtd,
  buildFederalW4InputsFromTaxRecord,
  calculateMnUnemploymentTax,
  calculateNYStateTax,
  calculateNYStateTaxForEmployee,
  calculateNYSUI,
  collectPreTaxDeductionPerPaycheck,
  collectRunStates,
  detectNycResidentFromEmployee,
  estimate_additionalMedicareTaxForPeriod,
  estimate_FutaTax,
  estimate_medicareTax,
  estimate_mnPaidLeave,
  estimate_socialSecurityTax,
  estimateFederalWithholding_,
  extractIncomeAndPayPeriods,
  getTaxRecord,
  isMnPaidLeaveApplicable,
  loadTaxConfig,
  mapHoldingStatusToFilingStatus,
} from '@/utils/SalaryProcess';
import { round2, summarisePayroll } from '@/utils/payrollSummary';
import { parse } from 'path';
import moment from 'moment';
import { MdDangerous } from 'react-icons/md';
import { baseURL } from '@/app/helpers/api';
import MainNetPay from './Net-Pay/Main_netpay';
import { GrClose } from 'react-icons/gr';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  money,
  avatarGradient,
  initials,
  V,
} from '@/components/violet';

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

const RunPayroll2 = () => {
  const router = useRouter();
  const { salaryProccess, payrollInfo } = useAppSelector((state: any) => state.employee);
  const [allProccessdData, setallProccessdData] = useState([]);
  const [page, setPage] = useState(1);
  const [grossTotal, setgrossTotal] = useState<any>(0);
  const [deductioncontritotal, setdeductioncontritotal] = useState(0);
  const token = GetToken();
  const [selectedData, setselectedData] = useState<any>([]);
  const [taxExemptOfaUser, settaxExemptOfaUser] = useState({});
  const [issaving, setissaving] = useState(false);
  // Server-driven 2026+ tax tables: load once on this step too (a hard refresh
  // lands here without page 1 having run), so the review totals + saved paycheck
  // components use backend rates. Falls back to the bundled tables on failure.
  const [isTaxConfigLoaded, setIsTaxConfigLoaded] = useState(false);
  const [unavailableTaxStates, setUnavailableTaxStates] = useState<string[]>([]);
  const { gen_settings } = useAppSelector((state) => state?.employee);
  const [selectedSalary, setselectedSalary] = useState<any>({});

  const dispatch = useDispatch();

  const [allbanks, setallbanks] = useState<any>(null);
  const [selectedbank, setselectedbank] = useState('');
  const [selectedBankInfoFulll, setselectedBankInfoFulll] = useState<any>(null);
  const { Company } = useAppSelector((state: any) => state?.CompanyData);
  const [storTemporaryCalculatedDara, setstorTemporaryCalculatedDara] = useState<any>([]);
  const [totalEmployeerContribution, settotalEmployeerContribution] = useState(0);

  //when select a new bank
  const handleBankChange = (v: any) => {
    console.log(JSON.parse(v));
    const objs = v ? JSON.parse(v) : {};
    setselectedBankInfoFulll(objs);
    dispatch(payrollInfoAdd({ ...payrollInfo, bankInfo: objs } as any));
    setselectedbank(objs?.title);
  };
  //fetch all banks
  const getAllBanks = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response: any = await fetch(
        baseURL + '/we/chart-of-accounts?page=1&limit=100&search=bank',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      console.log(result, 123);
      setallbanks(result?.results);
      result?.results?.map((item: any) => {
        if (item?.title === 'Savings Account') {
          setselectedBankInfoFulll(item);
          setselectedbank(item?.title);
          dispatch(payrollInfoAdd({ ...payrollInfo, bankInfo: item } as any));
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!allbanks) {
      getAllBanks();
    }
    if (payrollInfo?.bankInfo) {
      setselectedbank(payrollInfo?.bankInfo?.title);
      setselectedBankInfoFulll(payrollInfo?.bankInfo);
    }
  }, [allbanks]);

  //create and check non number value
  const toNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  //saving data to api
  const handleSave = async (newonj: any, preview: any) => {
    try {
      if (!selectedbank) {
        toast.error('Please select a bank');
        return;
      }
      setissaving(true);
      //deduction and contribution
      let deductionContribution: any = [];
      // Section 125 (PRETAX) employee deductions — the amount that comes out
      // of the employee's gross and reduces the FICA / income-tax wage base.
      const preTax = collectPreTaxDeductionPerPaycheck(newonj?.allinfo);
      newonj?.allinfo?.deduction_contributions.forEach((item: any) => {
        deductionContribution = [
          ...deductionContribution,
          {
            payroll_category: 'COMPANY_PAID_CONTRIBUTIONS',
            payroll_type: item?.deduction_and_contribution?.title,
            type: item?.deduction_and_contribution?.deduction_type,
            tax_type: item?.deduction_and_contribution?.tax_type,
            tax_option: item?.deduction_and_contribution?.tax_option,
            current: parseFloat(
              toNumber(item?.total_company_contribution_per_pay_check).toFixed(2)
            ),
          },
          {
            payroll_category: 'EMPLOYEE_DEDUCTIONS',
            payroll_type: item?.deduction_and_contribution?.title,
            type: item?.deduction_and_contribution?.deduction_type,
            tax_type: item?.deduction_and_contribution?.tax_type,
            tax_option: item?.deduction_and_contribution?.tax_option,
            current: parseFloat(
              toNumber(item?.total_employee_deduction_per_pay_check).toFixed(2)
            ),
          },
        ];
      });

      //garnishment
      let gharnishment: any = [];
      newonj?.allinfo?.garnishment.forEach((item: any) => {
        gharnishment = [
          ...gharnishment,
          {
            payroll_category: 'EMPLOYEE_DEDUCTIONS',
            payroll_type: item?.description
              ? item?.description?.replace(/ /g, '_').toUpperCase()
              : '',
            current: Number(item?.total_requsted_amount),
            total_maximum_percentage_of_disposal_income: Number(
              item?.total_maximum_percentage_of_disposal_income
            ),
          },
        ];
      });

      //earnings
      let earnings: any = [];
      newonj?.allinfo?.earnings.forEach((item: any) => {
        earnings = [
          ...earnings,
          {
            payroll_category: 'PAY',
            payroll_type: item?.description
              ? item?.description?.replace(/ /g, '_').toUpperCase()
              : '',
            current: Number(item?.total_recurring_amount),
          },
        ];
      });

      const totalEarnings = earnings
        .reduce((sum: number, item: any) => sum + toNumber(item.current), 0)
        .toFixed(2);
      const TotalSalary = parseFloat(
        (toNumber(newonj?.workingHrs) * toNumber(newonj?.rate)).toFixed(2)
      );
      console.log(TotalSalary, 2211, preTax);

      // These rows ARE the stub's PAY table, and their sum is the wage base every
      // tax below is computed on. They must therefore reproduce, line for line,
      // the gross the user approved on the review table — `calculatePayroll` in
      // Run-payroll.tsx. Keep the multipliers in step with that function.
      const payRate = toNumber(newonj?.rate);
      const pay = [
        {
          payroll_type: 'Salary',
          payroll_category: 'PAY',
          hours: toNumber(newonj?.workingHrs),
          rate: round2(payRate),
          current: TotalSalary,
          ytd: 0,
        },
        {
          payroll_type: 'Overtime',
          payroll_category: 'PAY',
          hours: toNumber(newonj?.OT),
          rate: round2(payRate * 1.5),
          current: round2(toNumber(newonj?.OT) * 1.5 * payRate),
          ytd: 0,
        },
        {
          payroll_type: 'Double Overtime Pay',
          payroll_category: 'PAY',
          hours: toNumber(newonj?.doubleOT),
          // 1.5 × 1.5 — mirrors `doubleOtPay` in calculatePayroll. This used to
          // be 3×, which put more on the stub than the reviewed gross carried.
          rate: round2(payRate * 1.5 * 1.5),
          current: round2(toNumber(newonj?.doubleOT) * 1.5 * 1.5 * payRate),
          ytd: 0,
        },
        {
          payroll_type: 'PTO',
          payroll_category: 'PAY',
          hours: toNumber(newonj?.PTO),
          rate: round2(payRate),
          // PTO counts toward the reviewed gross but had no row here at all, so
          // it vanished from the stub and from the wage base.
          current: round2(toNumber(newonj?.PTO) * payRate),
          ytd: 0,
        },
        {
          payroll_type: 'Holiday Pay',
          payroll_category: 'PAY',
          // Holiday pay is entered as a flat amount, not hours. `current` used to
          // read `newonj.holydayPay` — a key that does not exist on newonj (it is
          // spelled `holidayPay`) — so it silently resolved to 0 while the amount
          // was written into `hours`.
          hours: 0,
          rate: 0,
          current: round2(toNumber(newonj?.holidayPay)),
          ytd: 0,
        },
        {
          payroll_type: 'Bonus',
          payroll_category: 'PAY',
          hours: 0,
          rate: 0,
          current: round2(toNumber(newonj?.bonus)),
          ytd: 0,
        },
        {
          payroll_category: 'PAY',
          payroll_type: 'Commission',
          hours: 0,
          rate: 0,
          current: round2(toNumber(newonj?.commission)),
          ytd: 0,
        },
      ];

      // FULL gross pay for the period (what the stub shows as Gross Pay, and
      // the base for paid-leave premiums — ADP computes MN Paid Leave on full
      // gross). `totalgross` is the Section 125-reduced FICA / income-tax
      // wage base ("federal taxable wages" on an ADP stub).
      // Sum every PAY row we are about to print, not just the base salary —
      // overtime, double overtime, holiday, bonus and commission are all on the
      // stub's PAY table and all belong in the wage base. Using TotalSalary
      // alone left the stub's "Total Pay" line larger than the gross its own
      // taxes were computed on.
      const totalPayRows = pay.reduce((sum: number, row: any) => sum + toNumber(row?.current), 0);
      const fullGross = parseFloat((Number(totalEarnings) + totalPayRows).toFixed(2));
      const totalgross = Math.max(0, parseFloat((fullGross - preTax).toFixed(2)));
      const payFrequency =
        newonj?.allinfo?.pay_schedule?.pay_frequency ??
        newonj?.allinfo?.pay_frequency ??
        'EVERY_MONTH';
      const { incomePerPeriod, payPeriods } = extractIncomeAndPayPeriods({
        ...newonj?.allinfo,
        pay_frequency: payFrequency,
        total_salary: totalgross,
      });

      const saveTaxRecord = getTaxRecord(newonj?.allinfo?.taxes);
      const { filingStatus, stateFilingStatus } = mapHoldingStatusToFilingStatus(
        saveTaxRecord?.holding_status
      );

      // Use the same prior-YTD + W-4 inputs the Net-pay drawer
      // (Employee_tax.tsx) uses so the saved payroll components — and
      // therefore the pay stub — match the on-screen preview.
      const priorYtd = buildEmployeePriorYtd(newonj?.allinfo);
      const ssForPeriod = estimate_socialSecurityTax(totalgross, {
        ytdSubjectWages: priorYtd.socialSecurityWages,
        ytdTaxPaid: priorYtd.socialSecurityTax,
      });
      const additionalMedicare = estimate_additionalMedicareTaxForPeriod(
        totalgross,
        priorYtd.medicareWages,
        filingStatus === 'married' ? 'mfj' : filingStatus
      );

      const w4 = buildFederalW4InputsFromTaxRecord(saveTaxRecord);
      const { annualWages, estimatedAnnualTax, estimatedWithholdingPerPeriod, effectiveTaxRate } =
        estimateFederalWithholding_(incomePerPeriod, filingStatus, payPeriods, w4);
      // Normalise once. `?? 'NY'` let an empty string through and the missing
      // .toUpperCase() meant a stored 'mn' took the MN branch on the review
      // screen and the NY branch here — two different taxes for one employee.
      const stateName = String(saveTaxRecord?.state || 'NY').toUpperCase();
      const nycResident = detectNycResidentFromEmployee(newonj?.allinfo);
      const { nyStateTax, nycTax, sdi, fli } = calculateNYStateTax({
        gross: totalgross,
        payFrequency,
        state: stateName ?? 'NY',
        filingStatus: stateFilingStatus,
        pflYTD: priorYtd.pflWithheld,
        method: 'withholding',
        allowances: 0,
        residentCity: nycResident ? 'nyc' : null,
      });
      const nyStateTaxAmount = Number(nyStateTax);
      const nycResidentTaxAmount = Number(nycTax || 0);

      const mnPaidLeaveApplies = isMnPaidLeaveApplicable(newonj?.allinfo?.taxes);
      // Paid-leave premium is on FULL gross — Section 125 deductions do not
      // reduce the MN Paid Leave wage base.
      const mnPaidLeaveAmt = mnPaidLeaveApplies
        ? parseFloat(estimate_mnPaidLeave(fullGross).estimatedTax)
        : 0;

      // MN UI breakdown: when state is MN, replace the single SUI line with
      // the four MN UI components (UI Employer, Workforce Development Fee,
      // Federal Loan Interest Assessment, Additional Assessment) using the
      // employer's UI rate from the saved tax record (falls back to 0.4%).
      const isMN = stateName === 'MN';
      const mnUiRateInput =
        Number(saveTaxRecord?.mn_ui_rate) ||
        Number(saveTaxRecord?.ui_rate) ||
        Number(saveTaxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
        0;
      const mnUi = isMN
        ? calculateMnUnemploymentTax(totalgross, {
            uiRate: mnUiRateInput || undefined,
            ytdWages: Number(saveTaxRecord?.ytd_mn_ui_wages) || 0,
          })
        : null;

      // For non-MN states default to the NY-style single SUI line. When the
      // state is NY (2026), also emit a separate NY_RSF (0.075%) employer
      // line per the NYS-45 specification. NY UI is computed on the
      // CURRENT pay-period gross (with YTD-aware wage-base capping),
      // mirroring `nyUnemploymentTax(currentGross, ...)` in
      // `payroll-calculator.js`:
      //   • $40k pay period, $0 YTD  → 17,600 × 9.825% = $1,729.20
      //   • $4k pay period,  $0 YTD  →  4,000 × 9.825% =   $393.00
      // The employer's saved NY UI rate (`ny_ui_rate` ▸ `ui_rate`, in
      // percent units e.g. 9.825) overrides the QBO-blended default.
      const nyUiRateInput =
        Number(saveTaxRecord?.ny_ui_rate) ||
        Number(saveTaxRecord?.ui_rate) ||
        Number(saveTaxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
        0;
      const nyUiYtdWages =
        Number(saveTaxRecord?.ytd_ny_ui_wages) || Number(saveTaxRecord?.ytd_ui_wages) || 0;
      const nySuiBreakdown = !isMN
        ? calculateNYSUI(
            Number(totalgross),
            nyUiRateInput || undefined,
            undefined,
            undefined,
            nyUiYtdWages
          )
        : null;
      const stateUnemploymentRows = isMN
        ? [
            {
              payroll_category: 'EMPLOYER_TAXES',
              payroll_type: 'MN_UI_EMPLOYER',
              current: parseFloat(mnUi!.uiEmployer),
              ytd: 0,
            },
            {
              payroll_category: 'EMPLOYER_TAXES',
              payroll_type: 'MN_WORKFORCE_DEVELOPMENT_FEE',
              current: parseFloat(mnUi!.workforceDevelopmentFee),
              ytd: 0,
            },
            {
              payroll_category: 'EMPLOYER_TAXES',
              payroll_type: 'MN_FEDERAL_LOAN_INTEREST_ASSESSMENT',
              current: parseFloat(mnUi!.federalLoanInterestAssessment),
              ytd: 0,
            },
            {
              payroll_category: 'EMPLOYER_TAXES',
              payroll_type: 'MN_ADDITIONAL_ASSESSMENT',
              current: parseFloat(mnUi!.additionalAssessment),
              ytd: 0,
            },
          ]
        : [
            {
              payroll_category: 'EMPLOYER_TAXES',
              payroll_type:
                stateName === 'NY' ? 'NYS_EMPLOYMENT_TAXES' : stateName + '_UNEMPLOYMENT_TAXES',
              current: Number(nySuiBreakdown?.suiTax),
              ytd: 0,
            },
            ...(stateName === 'NY'
              ? [
                  {
                    payroll_category: 'EMPLOYER_TAXES',
                    payroll_type: 'NY_RSF',
                    current: Number(nySuiBreakdown?.rsfTax),
                    ytd: 0,
                  },
                ]
              : []),
          ];

      const employeer = [
        {
          payroll_type: 'FUTA_EMPLOYER',
          payroll_category: 'EMPLOYER_TAXES',
          current: parseFloat(estimate_FutaTax(totalgross).estimatedTax),
          ytd: 0,
        },
        {
          payroll_type: 'SOCIAL_SECURITY_EMPLOYER',
          payroll_category: 'EMPLOYER_TAXES',
          current: parseFloat(ssForPeriod.estimatedTax),
          ytd: 0,
        },
        {
          payroll_type: 'MEDICARE_EMPLOYER',
          payroll_category: 'EMPLOYER_TAXES',
          current: parseFloat(estimate_medicareTax(totalgross).estimatedTax),
          ytd: 0,
        },
        ...stateUnemploymentRows,
        ...(mnPaidLeaveApplies
          ? [
              {
                payroll_category: 'EMPLOYER_TAXES',
                payroll_type: 'MN_PAID_LEAVE_EMPLOYER',
                current: mnPaidLeaveAmt,
                ytd: 0,
              },
            ]
          : []),
      ];

      const isNyForEmployee =
        String(stateName || 'NY').toUpperCase() === 'NY' ||
        String(stateName || 'NY').toUpperCase() === 'NYC';

      const employee = [
        {
          payroll_category: 'EMPLOYEE_TAXES',
          payroll_type: 'FEDERAL_INCOME_TAX',
          // `estimateFederalWithholding_` returns a formatted string; every other
          // row is a number. It only survived the arithmetic by coercion.
          current: round2(estimatedWithholdingPerPeriod),
          ytd: 0,
        },
        {
          payroll_category: 'EMPLOYEE_TAXES',
          payroll_type: 'SOCIAL_SECURITY',
          current: parseFloat(ssForPeriod.estimatedTax),
          ytd: 0,
        },
        {
          payroll_category: 'EMPLOYEE_TAXES',
          payroll_type: 'MEDICARE',
          current: parseFloat(estimate_medicareTax(totalgross).estimatedTax),
          ytd: 0,
        },
        ...(Number(additionalMedicare.estimatedTax) > 0
          ? [
              {
                payroll_category: 'EMPLOYEE_TAXES',
                payroll_type: 'ADDITIONAL_MEDICARE',
                current: parseFloat(additionalMedicare.estimatedTax),
                ytd: 0,
              },
            ]
          : []),
        // NY State income tax — mirrors payroll-calculator.js `stateTax` (NY only).
        {
          payroll_category: 'EMPLOYEE_TAXES',
          payroll_type: stateName === 'NY' ? '_INCOME_TAX' : stateName + '_INCOME_TAX',
          current: nyStateTaxAmount,
          ytd: 0,
        },
        // NYC Resident income tax — separate line, mirrors payroll-calculator.js
        // `localTax`. Only emitted when the employee's home address is in NYC.
        ...(nycResidentTaxAmount > 0
          ? [
              {
                payroll_category: 'EMPLOYEE_TAXES',
                payroll_type: 'NYC_RESIDENT_TAX',
                current: nycResidentTaxAmount,
                ytd: 0,
              },
            ]
          : []),
        // NY-specific employee withholdings shown in the Net-pay drawer
        // (Employee_tax.tsx). Emit them here so the pay stub mirrors the
        // preview row-for-row.
        ...(isNyForEmployee && Number(sdi || 0) > 0
          ? [
              {
                payroll_category: 'EMPLOYEE_TAXES',
                payroll_type: 'SDI',
                current: Number(sdi || 0),
                ytd: 0,
              },
            ]
          : []),
        ...(isNyForEmployee && Number(fli || 0) > 0
          ? [
              {
                payroll_category: 'EMPLOYEE_TAXES',
                payroll_type: 'FLI',
                current: Number(fli || 0),
                ytd: 0,
              },
            ]
          : []),
        ...(mnPaidLeaveApplies
          ? [
              {
                payroll_category: 'EMPLOYEE_TAXES',
                payroll_type: 'MN_PAID_LEAVE',
                current: mnPaidLeaveAmt,
                ytd: 0,
              },
            ]
          : []),
      ];

      const datasetArr = [
        ...pay,
        ...employeer,
        ...employee,
        ...deductionContribution,
        ...gharnishment,
        ...earnings,
      ]
        // Not `> 0`: a refund or correction line is legitimately negative and
        // must reach the server and the stub. Only genuine zeros are dropped.
        .filter((item: any) => Number.isFinite(Number(item?.current)) && Number(item.current) !== 0)
        .map((item: any) => ({ ...item, current: round2(item.current) }));

      console.log(datasetArr, 2211);
      // setissaving(false);
      // return 0;

      // Reconcile the run against the rows we are about to persist. Everything
      // downstream — the server record, the redux preview, the pay stub and its
      // PDF — reads these numbers, so gross/net can no longer disagree with the
      // itemised lines the employee sees.
      const summary = summarisePayroll({
        pay,
        earnings,
        employee,
        employeer,
        deductionContribution,
        gharnishment,
      });

      const salarydata = {
        title: 'monthly salary process',
        employee_uid: newonj?.profileId,
        pay_date: payrollInfo?.payDate || '2025-07-31', // use selected date if available
        pay_period: payrollInfo?.selectedPayPeriod || '2025-07-22 to 2025-07-28',
        payment_account_uid: selectedBankInfoFulll?.uid || '',
        pay_method: 'PAPER_CHECK',
        project: '',
        memo: '',
        status: 'FINALIZED',
        accrue_time_off: false,
        // parseInt truncated the cents off every payroll that was ever saved.
        gross_pay: summary.grossPay,
        // These were sending the review table's raw `employeeDeduction` /
        // `employeeContribution` inputs — neither of which is a run total — so
        // the saved record's employer figure bore no relation to the employer
        // taxes actually computed. Send the reconciled totals.
        EMPLOYER_TAXES_deductions: summary.totalWithheld,
        employer_taxes_contributions: summary.employerCost,
        net_pay: summary.netPay,
        payroll_components: datasetArr,
      };
      console.log(salarydata, 9988);
      if (!preview) {
        // console.log(salarydata,9988);

        const response = await savedSalary(salarydata);
        if (response?.success) {
          toast.success('Payroll saved successfully');
        } else {
          toast.error('Failed to save payroll');
          setissaving(false);
          return null;
        }
      }
      setissaving(false);
      return {
        employeeInfo: {
          ...newonj,
          ...payrollInfo,
          // Override the review-table estimates with the reconciled figures so
          // the stub never prints a gross or net that its own rows contradict.
          grossPay: summary.grossPay,
          netPay: summary.netPay,
        },
        summary,
        pay,
        employeer,
        employee,
        deductionContribution,
        gharnishment,
        earnings,
      };
    } catch (error) {
      console.log(error);
      setissaving(false);
      toast.error('Error saving payroll');
    }
  };

  const totalTaxCalculate = (newonj: any) => {
    const earnings = newonj?.allinfo?.earnings
      ?.reduce((sum: number, item: any) => sum + toNumber(item?.total_recurring_amount), 0)
      .toFixed(2);
    const totalEarnings = Number(newonj?.Salary) + Number(earnings);

    // Section 125 (PRETAX) employee deductions reduce the FICA and
    // federal/state income-tax wage base; paid leave and the displayed
    // gross stay on FULL gross (mirrors handleSave).
    const preTax = collectPreTaxDeductionPerPaycheck(newonj?.allinfo);

    const payFrequency =
      newonj?.allinfo?.pay_schedule?.pay_frequency ??
      newonj?.allinfo?.pay_frequency ??
      'EVERY_MONTH';

    // Federal withholding is owed on the whole taxable gross. `totalEarnings`
    // is only base salary plus recurring earnings, so overtime, PTO, holiday,
    // bonus and commission escaped this screen's federal tax entirely while
    // handleSave taxed them on the stub — the same paycheck, two wage bases.
    const { incomePerPeriod, payPeriods } = extractIncomeAndPayPeriods({
      ...newonj?.allinfo,
      pay_frequency: payFrequency,
      total_salary: Math.max(0, Number(newonj?.grossPay) - preTax),
    });

    const calcTaxRecord = getTaxRecord(newonj?.allinfo?.taxes);
    const { filingStatus, stateFilingStatus } = mapHoldingStatusToFilingStatus(
      calcTaxRecord?.holding_status
    );

    // Mirror the Net-pay drawer (Employee_tax.tsx): drive federal
    // withholding with W-4 Step 2/3/4 inputs and prior-YTD-aware SS /
    // Medicare so the table's Net Pay column lines up with the drawer
    // and pay stub.
    const calcW4 = buildFederalW4InputsFromTaxRecord(calcTaxRecord);
    const calcPriorYtd = buildEmployeePriorYtd(newonj?.allinfo);

    const { annualWages, estimatedAnnualTax, estimatedWithholdingPerPeriod, effectiveTaxRate } =
      estimateFederalWithholding_(incomePerPeriod, filingStatus, payPeriods, calcW4);

    const grossPay = Number(newonj?.grossPay);
    const taxableGross = Math.max(0, grossPay - preTax);
    const ssCalc = estimate_socialSecurityTax(taxableGross, {
      ytdSubjectWages: calcPriorYtd.socialSecurityWages,
      ytdTaxPaid: calcPriorYtd.socialSecurityTax,
    });
    const addMedCalc = estimate_additionalMedicareTaxForPeriod(
      taxableGross,
      calcPriorYtd.medicareWages,
      filingStatus === 'married' ? 'mfj' : filingStatus
    );

    const calcNycResident = detectNycResidentFromEmployee(newonj?.allinfo);
    const { nyStateTax, nycTax, sdi, fli } = calculateNYStateTax({
      gross: taxableGross,
      payFrequency,
      state: calcTaxRecord?.state || 'NY',
      filingStatus: stateFilingStatus,
      pflYTD: calcPriorYtd.pflWithheld,
      method: 'withholding',
      allowances: 0,
      residentCity: calcNycResident ? 'nyc' : null,
    });
    // NY State and NYC Resident taxes are kept separate — matching
    // payroll-calculator.js which returns stateTax and localTax as distinct values.
    const calcNyStateTax = Number(nyStateTax);
    const calcNycResidentTax = Number(nycTax || 0);
    // Combined total used only for the net-pay subtotal row.
    const calcStateIncomeTax = calcNyStateTax + calcNycResidentTax;

    const calcStateForUi = (calcTaxRecord?.state || 'NY').toUpperCase();
    const calcIsNy = calcStateForUi === 'NY' || calcStateForUi === 'NYC';
    const calcSdi = calcIsNy ? Number(sdi || 0) : 0;
    const calcFli = calcIsNy ? Number(fli || 0) : 0;

    const totalTax =
      Number(calcStateIncomeTax) +
      Number(estimatedWithholdingPerPeriod) +
      Number(ssCalc.estimatedTax) +
      Number(estimate_medicareTax(taxableGross).estimatedTax) +
      Number(addMedCalc.estimatedTax) +
      calcSdi +
      calcFli;

    //employee deduction
    const gurnishment = newonj?.allinfo?.garnishment
      .reduce((sum: number, item: any) => sum + toNumber(item?.total_requsted_amount), 0)
      .toFixed(2);

    // console.log(earnings,1212,newonj?.allinfo?.earnings);

    //employee deduction like garnishment
    const employeeDeduction = newonj?.allinfo?.deduction_contributions
      .reduce(
        (sum: number, item: any) => sum + toNumber(item?.total_employee_deduction_per_pay_check),
        0
      )
      .toFixed(2);

    //employeer contribution
    const employeerContribution = newonj?.allinfo?.deduction_contributions
      .reduce(
        (sum: number, item: any) => sum + toNumber(item.total_company_contribution_per_pay_check),
        0
      )
      .toFixed(2);

    // State unemployment: branch on state. MN gets the four-line breakdown
    // (UI Employer + Workforce Development Fee + Federal Loan Interest
    // Assessment + Additional Assessment); other states fall back to the
    // single-line NY SUI formula.
    const stateForUi = (calcTaxRecord?.state || 'NY').toUpperCase();
    const isMnUi = stateForUi === 'MN';
    const mnUiRateForCalc =
      Number(calcTaxRecord?.mn_ui_rate) ||
      Number(calcTaxRecord?.ui_rate) ||
      Number(calcTaxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
      0;
    const mnUiCalc = isMnUi
      ? calculateMnUnemploymentTax(taxableGross, {
          uiRate: mnUiRateForCalc || undefined,
          ytdWages: Number(calcTaxRecord?.ytd_mn_ui_wages) || 0,
        })
      : null;

    // NY 2026 defaults: $17,600 wage base, 9.825% QBO blended default UI
    // rate (matches `payroll-calculator.js` `loadQboNYMatch`). RSF
    // (0.075%) is computed separately and added to the employer tax
    // total below as its own line per NYS-45. NY UI is computed on the
    // CURRENT pay-period gross (with YTD-aware wage-base capping),
    // mirroring `nyUnemploymentTax(currentGross, ...)` in the
    // standalone calculator. The employer's saved NY UI rate (percent
    // units, e.g. 9.825) overrides the default when set.
    const nyUiRateForCalc =
      Number(calcTaxRecord?.ny_ui_rate) ||
      Number(calcTaxRecord?.ui_rate) ||
      Number(calcTaxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
      0;
    const nyUiYtdWagesForCalc =
      Number(calcTaxRecord?.ytd_ny_ui_wages) || Number(calcTaxRecord?.ytd_ui_wages) || 0;
    const nyBreakdown = !isMnUi
      ? calculateNYSUI(
          Number(taxableGross),
          nyUiRateForCalc || undefined,
          undefined,
          undefined,
          nyUiYtdWagesForCalc
        )
      : null;
    const suiTax = isMnUi ? String(mnUiCalc!.amounts.total) : String(nyBreakdown!.suiTax);
    // Re-employment Service Fund is New York only. Charging it to every non-MN
    // state added a line here that handleSave never emitted onto the stub.
    const nyRsfTax = stateForUi === 'NY' ? Number(nyBreakdown!.rsfTax) : 0;

    // FUTA is a per-pay-period tax on the period's taxable wages, wage-base
    // capped inside `estimate_FutaTax`. Passing `annualWages` here handed it a
    // full year of pay, which pinned it to the $7,000 base every single run —
    // $42 instead of the period's real liability — and made this screen
    // disagree with the amount handleSave writes onto the stub.
    const futaTax = estimate_FutaTax(taxableGross).estimatedTax;

    const mnPLApplies = isMnPaidLeaveApplicable(newonj?.allinfo?.taxes);
    const mnPLAmt = mnPLApplies ? Number(estimate_mnPaidLeave(grossPay).estimatedTax) : 0;

    //employeer contribution in tax
    const employeerTax =
      Number(futaTax) +
      Number(ssCalc.estimatedTax) +
      Number(estimate_medicareTax(taxableGross).estimatedTax) +
      Number(suiTax) +
      nyRsfTax +
      mnPLAmt;

    //employee total taxable ammount
    const employeeTax =
      Number(calcStateIncomeTax) +
      Number(estimatedWithholdingPerPeriod) +
      Number(ssCalc.estimatedTax) +
      Number(estimate_medicareTax(taxableGross).estimatedTax) +
      Number(addMedCalc.estimatedTax) +
      calcSdi +
      calcFli +
      mnPLAmt;

    //employee will pay
    const employeeDeductionTotal =
      Number(employeeDeduction) + Number(gurnishment) + Number(employeeTax);

    // Round at the cent, never ceil. Ceiling each subtotal pushed this screen's
    // totals dollars above the stub's — with one employee it looked like a
    // rounding quirk; across a run it compounded per line, per employee.
    return {
      employeerTax: round2(employeerTax),
      employeeTax: round2(employeeTax),
      employeerContribution: round2(employeerContribution),
      employeerContributionTotal: round2(Number(employeerContribution) + Number(employeerTax)),
      employeeDeductionTotal: round2(employeeDeductionTotal),
      earnings: round2(earnings),
    };
  };

  /**
   * Hours in ONE pay period. Must stay identical to `calculateHours` /
   * `periodsPerYear` in Run-payroll.tsx, which produce the hours the user
   * reviews and the gross derived from them.
   *
   * The previous version only recognised EVERY_MONTH (12) and EVERY_WEEK (52)
   * and fell through to `1` for everything else — so a biweekly or semi-monthly
   * schedule returned 52 × 8 × 5 = 2080 hours, a whole year, and any pay derived
   * from it was an annual figure wearing a pay-period label.
   */
  function periodsPerYear(frequency: any) {
    switch (frequency) {
      case 'EVERY_WEEK':
        return 52;
      case 'OTHER_WEEK':
      case 'EVERY_BIWEEK':
        return 26;
      case 'TWICE_A_MONTH':
      case 'EVERY_SEMIMONTH':
        return 24;
      case 'EVERY_MONTH':
        return 12;
      case 'EVERY_YEAR':
        return 1;
      default:
        return 12;
    }
  }

  function calculateHours(
    frequency: any,
    salary: any,
    workingHrsPerDay: any,
    daysPerWeek: any,
    paytype: any
  ) {
    const hoursPerDay = workingHrsPerDay > 0 ? workingHrsPerDay : 8;
    const daysWeek = daysPerWeek > 0 ? daysPerWeek : 5;
    return (52 * hoursPerDay * daysWeek) / periodsPerYear(frequency);
  }

  const createCalculrationFun = async (preview?: boolean) => {
    try {
      if (!selectedbank) {
        return toast.error('Select Bank First');
      }
      if (selectedData.length === 0) {
        return toast.error('Select Row To Create Calculation');
      }

      const calculateddataArr: any = await Promise.all(
        selectedData.map(async (item: any) => {
          // Hours shown in (and edited on) the review table are the basis for
          // item.grossPay — see `calculatePayroll` in Run-payroll.tsx. Recomputing
          // them here made handleSave run every tax on a DIFFERENT number of hours
          // than the gross the user approved: calculateHours falls back to
          // frequencyInNumber = 1 for any schedule that isn't monthly or weekly,
          // which annualises to 52 × 8 × 5 = 2080 hours. The stub then printed a
          // pay-period gross next to employer taxes computed on a full year's pay.
          // Use the reviewed hours; only derive them when the row carries none.
          const derivedHours: any =
            gen_settings?.payroll_working_days === 'CALENDAR_DAYS'
              ? calculateHours(
                  item.allinfo?.pay_schedule?.pay_frequency,
                  item.allinfo?.total_salary,
                  Number(item.allinfo?.total_hour_per_day),
                  Number(item.allinfo?.total_day_per_week),
                  'SALARY'
                ).toFixed(2)
              : toNumber(item.allinfo?.worked_hour_count).toFixed(2);
          const reviewedHours = toNumber(item?.workingHrs);
          const hours: any = reviewedHours > 0 ? reviewedHours.toFixed(2) : derivedHours;
          const newonj = {
            employeeName: item.allinfo.user.name,
            allinfo: item.allinfo,
            profileId: item.id ?? '',
            companyID: Company?.uid,
            workingHrs: hours,
            rate: item.Rate ?? 0,
            salary: item.Salary,
            OT: item.OT ?? 0,
            doubleOT: item.doubleOT ?? 0,
            PTO: item.PTO ?? 0,
            holidayPay: item.holydayPay ?? 0,
            bonus: item.bonus,
            commission: item.commission ?? 0,
            total: item.total,
            employeeContribution: item.employeeContribution ?? 0,
            employeeDeduction: item.employeeDeduction ?? 0,
            grossPay: item.grossPay ?? 0,
            netPay: round2(
              round2(item.grossPay) - (totalTaxCalculate(item)?.employeeDeductionTotal || 0)
            ),
            netPaySummary: JSON.stringify(item.netPaySummary),
          };

          const calculatedData = await handleSave(newonj, preview);
          return calculatedData;
        })
      );

      // Check if all saves were successful (no null values)
      const allSuccessful = calculateddataArr.every((item: any) => item !== null);

      if (!allSuccessful) {
        toast.error('Some payroll entries failed to save');
        setissaving(false);
        return;
      }

      dispatch(addpreview(calculateddataArr));
      if (preview) {
        createPreview(calculateddataArr);
        return 0;
      }
      toast.success('Payroll submitted successfully');
      router.push('/dashboard/hris/payroll/paystab');
    } catch (error) {
      console.error(error);
      toast.error('Calculation Error');
    }
  };

  const createPreview = async (data: any) => {
    try {
      if (data.length == 0) return toast.error('Select Row To Create Preview');
      // await createCalculation({ variables: { input: JSON.stringify(selectedData) } })
      dispatch(addpreview(data));
      // toast.success("Calculation Created Successfully")
      router.push('/dashboard/hris/payroll/preview_details/previewpayroll');
    } catch (error) {
      toast.error('Calculation Error');
    }
  };
  const createPreviewPaystab = async (data: any) => {
    try {
      if (data.length == 0) return toast.error('Select Row To Create Preview');
      // await createCalculation({ variables: { input: JSON.stringify(selectedData) } })
      dispatch(addpreview(data));
      // toast.success("Calculation Created Successfully")
      router.push('/dashboard/hris/payroll/preview_details/previewpayroll');
    } catch (error) {
      toast.error('Calculation Error');
    }
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setallProccessdData((prev) => {
      const updated: any = prev.map((item: any) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          return updatedItem;
        }
        return item;
      });
      dispatch(addsalaryproccess(updated)); // Sync Redux
      return updated;
    });
  };

  useEffect(() => {
    console.log(salaryProccess, 11);

    if (!salaryProccess || salaryProccess.length === 0 || !salaryProccess[0]?.id) {
      //router.push("/dashboard/hris/payroll/salary_process")
    } else {
      setallProccessdData(salaryProccess);
    }
  }, [salaryProccess]);

  // Load the server-driven statutory tax tables for this run's distinct states.
  // Year is pinned to the pay date so an old run recomputes with the tables in
  // force then. `loadTaxConfig` mutates the module-global CONFIG the calculators
  // read; flipping `isTaxConfigLoaded` re-renders the table with server rates.
  useEffect(() => {
    if (!allProccessdData || allProccessdData.length === 0) return;
    const employees = allProccessdData.map((i: any) => i?.allinfo).filter(Boolean);
    const states = collectRunStates(employees);
    const payDateYear = new Date(payrollInfo?.payDate || new Date()).getFullYear();
    let active = true;
    setIsTaxConfigLoaded(false);
    loadTaxConfig(payDateYear, states)
      .then(({ unavailable }) => {
        if (!active) return;
        setUnavailableTaxStates(unavailable);
        if (unavailable.length) {
          toast.error(
            `State tax tables for ${unavailable.join(', ')} aren't available for ${payDateYear} yet — state withholding for those employees can't be computed.`
          );
        }
      })
      .finally(() => {
        if (active) setIsTaxConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [allProccessdData, payrollInfo?.payDate]);
  // Sample data with 20 items
  const [salaryProcessData, setSalaryProcessData] = useState<SalaryProcessItem[]>([]);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [buttonText, setButtonText] = useState('print');

  const [showDetailBoxMenu, setshowDetailBoxMenu] = useState<Number | null>(0);
  const [selectedModalFor, setselectedModalFor] = useState<String | null>(null);
  const [selectedId, setselectedId] = useState<any>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Select all states for each table
  const [isSalaryProcessAllSelected, setIsSalaryProcessAllSelected] = useState<any>(false);

  // Calculate total pages
  const totalPages = Math.ceil(salaryProcessData.length / itemsPerPage);

  // Get current page items
  const getCurrentPageItems = (data: SalaryProcessItem[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Handle select all change for Salary Process table
  const handleSalaryProcessSelectAllChange = (_checked: boolean) => {
    setIsSalaryProcessAllSelected((prev: any) => {
      if (prev) {
        setselectedId([]);
        return !prev;
      } else {
        const arrayOfid: any = [];
        allProccessdData &&
          allProccessdData.map((item: any) => {
            if (
              item?.allinfo?.payroll_salary_process?.length > 0 &&
              item?.allinfo?.payroll_salary_process[0]?.pay_period ===
                payrollInfo?.selectedPayPeriod
            ) {
              return; //onlY thos prsone can be selected who has no salary process yet in this selected period
            }
            arrayOfid.push(item?.id);
          });
        setselectedId(arrayOfid);
        // Must mirror arrayOfid, which skips employees already processed for
        // this pay period. Selecting every row here inflated the hero by the
        // gross and employer cost of people the run would never pay.
        setselectedData(
          (allProccessdData || []).filter((row: any) => arrayOfid.includes(row?.id))
        );
        return !prev;
      }
    });
  };
  const calaculateGross = () => {
    setgrossTotal(0);
    setdeductioncontritotal(0);
    settotalEmployeerContribution(0);
    selectedData.map((item: any) => {
      console.log(item, 3333);

      // if (selectedId?.includes(item?.id)) {
      settotalEmployeerContribution((prev: any) => {
        return Number(prev) + totalTaxCalculate(item)?.employeerContributionTotal;
      });
      setgrossTotal((prev: any) => {
        return Number(prev) + Number(item?.grossPay);
      });
      setdeductioncontritotal((prev: any) => {
        return Number(prev) + Number(item?.employeeContribution);
      });

      // }
    });
  };

  useEffect(() => {
    calaculateGross();
    // Totals iterate selectedData, and every rate changes when the server tax
    // tables resolve — keying on selectedId alone left the hero on fallback
    // rates while the per-row columns re-rendered with the real ones.
  }, [selectedData, isTaxConfigLoaded]);

  // Toggle individual row selection for Salary Process table
  const handleSalaryProcessRowSelectionChange = (item: any) => {
    const itemId = item?.id;
    const isSelected = selectedId?.includes(itemId);

    if (
      item?.allinfo?.payroll_salary_process?.length > 0 &&
      item?.allinfo?.payroll_salary_process[0]?.pay_period === payrollInfo?.selectedPayPeriod
    ) {
      return toast.error('This employee already has a salary process in this selected period');
    }

    if (isSelected) {
      setselectedId((prev: any[]) => prev.filter((id) => id !== itemId));

      setselectedData((prev: any[]) => prev.filter((dataItem) => dataItem?.id !== itemId));
    } else {
      setselectedId((prev: any[]) => [...prev, itemId]);
      setselectedData((prev: any[]) => [...prev, item]);
    }
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
  }, [selectedModalFor]);

  const modalContoll = () => {
    setselectedModalFor(null);
  };

  const formatFrequency = (f?: string) =>
    f
      ? f
          .split('_')
          .join(' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'N/A';

  const totalAmount = round2(grossTotal + totalEmployeerContribution).toFixed(2);
  const selectedCount = selectedId?.length || 0;
  const totalEmployees = allProccessdData?.length || 0;

  // derived for the violet summary (display only — no payload change)
  const empDeductionTotal = round2(
    (selectedData || []).reduce(
      (s: number, item: any) => s + (totalTaxCalculate(item)?.employeeDeductionTotal || 0),
      0
    )
  );
  const netTakeHome = round2(grossTotal - empDeductionTotal);
  const bankBalance = Number(selectedBankInfoFulll?.opening_balance) || 0;
  // The funding account is debited gross PLUS employer cost, not gross alone —
  // the "covers this run" banner and the "left after payday" figure were using
  // two different definitions of what the run costs.
  const insufficientBalance = selectedBankInfoFulll && bankBalance < Number(totalAmount);
  const leftAfter = bankBalance - Number(totalAmount);

  // Statutory payroll taxes are all wage-base capped, so no correctly computed
  // run can cost more in employer contributions than it pays out in gross, and
  // no employee can have more withheld than they earned. When either happens the
  // cause is a deduction/contribution amount entered in the wrong unit (an annual
  // figure, or a percentage typed as dollars) — it is never a rounding problem.
  // Surface it here rather than letting it reach a pay stub.
  const impossibleEmployerCost = grossTotal > 0 && totalEmployeerContribution > grossTotal;
  const impossibleWithholding = grossTotal > 0 && empDeductionTotal > grossTotal;
  const hasImpossibleTotals = impossibleEmployerCost || impossibleWithholding;
  const acctLast4 = `${
    selectedBankInfoFulll?.account_number || selectedBankInfoFulll?.title || ''
  }`
    .replace(/\D/g, '')
    .slice(-4);
  const filteredRows = (allProccessdData || []).filter((item: any) =>
    `${item?.name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative pb-28 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Run payroll', href: '/dashboard/hris/payroll/salary_process' },
          { label: 'Review & submit' },
        ]}
      />

      {/* header + stepper */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/hris/payroll/run_payroll')}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Review &amp; submit
        </h1>
        {payrollInfo?.payType && <Chip tone="violet">{formatFrequency(payrollInfo?.payType)}</Chip>}
        <span className="flex-1" />
        <div className="flex items-center gap-2 text-[12.5px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-v-success-fg">
            <CheckCircle2 className="h-4 w-4" /> Pick team
          </span>
          <span className="text-v-ink300">›</span>
          <span className="inline-flex items-center gap-1.5 text-v-primary">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-v-primary text-[11px] font-bold text-white">
              2
            </span>{' '}
            Review &amp; submit
          </span>
          <span className="text-v-ink300">›</span>
          <span className="inline-flex items-center gap-1.5 text-v-ink400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-v-wash2 text-[11px] font-bold text-v-ink400">
              3
            </span>{' '}
            Done
          </span>
        </div>
      </div>
      <p className="mt-2 text-[14px] text-v-ink500">
        Confirm totals, choose the funding account and submit this period's payroll.
      </p>

      {/* server tax-table gap warning — a missing table must never read as "no tax due" */}
      {unavailableTaxStates.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-v-card bg-v-danger-bg px-4 py-3 text-[12.5px] text-v-danger-fg">
          <MdDangerous className="mt-0.5 shrink-0 text-base" />
          <span>
            State tax tables for <strong>{unavailableTaxStates.join(', ')}</strong> aren&apos;t
            published for {new Date(payrollInfo?.payDate || new Date()).getFullYear()} yet. Federal
            still computes, but state withholding for those employees can&apos;t be calculated —
            verify before submitting.
          </span>
        </div>
      )}

      {/* impossible-totals guard — catches deduction/contribution amounts entered
          in the wrong unit before they reach a pay stub */}
      {hasImpossibleTotals && (
        <div className="mt-3 flex items-start gap-2 rounded-v-card bg-v-danger-bg px-4 py-3 text-[12.5px] text-v-danger-fg">
          <MdDangerous className="mt-0.5 shrink-0 text-base" />
          <span>
            <strong>These totals can&apos;t be right.</strong>{' '}
            {impossibleEmployerCost && (
              <>
                Employer contributions ({money(round2(totalEmployeerContribution))}) exceed the gross
                pay ({money(round2(grossTotal))}).{' '}
              </>
            )}
            {impossibleWithholding && (
              <>
                Employee deductions ({money(empDeductionTotal)}) exceed the gross pay (
                {money(round2(grossTotal))}).{' '}
              </>
            )}
            Every statutory tax is wage-base capped, so this comes from a deduction or contribution
            amount saved in the wrong unit — check each employee&apos;s Deductions &amp;
            Contributions for an annual figure or a percentage entered as dollars. Don&apos;t submit
            until it reconciles.
          </span>
        </div>
      )}

      {/* top row: total cost hero + funding */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* dark total cost hero */}
        <div
          className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
          style={{ backgroundImage: V.gradients.heroViolet }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[50px] -top-[50px] h-[190px] w-[190px] animate-v-float rounded-full"
            style={{ background: V.orb.violet }}
          />
          <div className="relative">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-white/55">
              Total payroll cost
            </div>
            <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
              {money(Number(totalAmount))}
            </div>
            <div className="text-[11.5px] text-white/55">
              {selectedCount} employee{selectedCount === 1 ? '' : 's'} · gross plus employer costs
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Gross pay</span>
                <span className="font-semibold tabular-nums">{money(round2(grossTotal))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Employee deductions</span>
                <span className="font-semibold tabular-nums text-[#F9A8C7]">
                  −{money(empDeductionTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Net take-home</span>
                <span className="font-semibold tabular-nums">{money(netTakeHome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Employer taxes &amp; contributions</span>
                <span className="font-semibold tabular-nums text-[#A7F3D0]">
                  +{money(round2(totalEmployeerContribution))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* funding account */}
        <div className="rounded-v-card bg-white p-5 shadow-v-card">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-v-ink900">Funding account</span>
            {selectedbank && (
              <span className="text-[12.5px] font-semibold text-v-success-fg">
                Balance {money(bankBalance)}
              </span>
            )}
          </div>
          <div className="relative mt-2">
            <Banknote className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-v-ink400" />
            <select
              value={JSON.stringify(selectedBankInfoFulll)}
              onChange={(v) => handleBankChange(v.target.value)}
              className="w-full cursor-pointer rounded-v-input border border-v-border bg-white py-2.5 pl-9 pr-3 text-[13.5px] font-medium text-v-ink900 outline-none focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]"
            >
              <option value="">Select account</option>
              {allbanks?.map((item: any) => (
                <option key={item?.id} value={JSON.stringify(item)}>
                  {item?.title}
                </option>
              ))}
            </select>
          </div>
          {!selectedbank && (
            <p className="mt-1 text-[11px] font-medium text-v-danger-fg">Please select an account.</p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-v-tile bg-v-card-subtle px-3 py-2.5">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-v-ink400">
                <CalendarDays className="h-3 w-3" /> Pay period
              </div>
              <div className="mt-0.5 text-[12.5px] font-bold tabular-nums text-v-ink900">
                {payrollInfo?.selectedPayPeriod || '—'}
              </div>
            </div>
            <div className="rounded-v-tile bg-v-card-subtle px-3 py-2.5">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-v-ink400">
                <Wallet className="h-3 w-3" /> Pay date
              </div>
              <div className="mt-0.5 text-[12.5px] font-bold tabular-nums text-v-ink900">
                {payrollInfo?.payDate
                  ? moment(payrollInfo.payDate).format('MMM D, YYYY')
                  : '—'}
              </div>
            </div>
          </div>

          {selectedbank &&
            (insufficientBalance ? (
              <div className="mt-3 flex items-start gap-2 rounded-v-tile bg-v-danger-bg px-3.5 py-2.5 text-[12.5px] text-v-danger-fg">
                <MdDangerous className="mt-0.5 shrink-0 text-base" />
                <span>
                  Insufficient balance — reduce employees or deposit more before submitting.
                </span>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-v-tile bg-v-success-bg px-3.5 py-2.5 text-[12.5px] text-v-success-fg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Covers this run — {money(leftAfter)} left after payday.</span>
              </div>
            ))}
        </div>
      </div>

      {/* Net pay drawer */}
      {selectedSalary.id && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="net-pay-drawer-title"
          className="fixed inset-0 z-[100] flex items-stretch justify-end bg-black/40 p-3 sm:p-4 sm:pl-8"
          onClick={() => setselectedSalary({})}
        >
          <div
            className="flex h-full max-h-full w-full max-w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:max-w-md md:max-w-lg lg:max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <h2 id="net-pay-drawer-title" className="text-base font-semibold text-gray-900">
                Net pay
              </h2>
              <button
                type="button"
                onClick={() => setselectedSalary({})}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500"
                aria-label="Close net pay"
              >
                <GrClose className="text-xl" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <MainNetPay salarydata={selectedSalary} />
            </div>
          </div>
        </div>
      )}

      {/* per-employee breakdown */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Receipt />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-v-ink900">Per-employee breakdown</div>
            <div className="text-[11.5px] text-v-ink400">
              Net pay &amp; employer costs from the 2026 tax engine · click a row for the full payslip
            </div>
          </div>
          <Chip tone="violet">
            {selectedCount} of {totalEmployees} employees
          </Chip>
          <span className="flex-1" />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee"
              className="w-[220px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>
        </div>

        {/* column strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400"
          style={{ gridTemplateColumns: '30px minmax(0,1.5fr) 80px 110px 150px 130px 150px minmax(0,1fr)' }}
        >
          <SmoothCheckbox
            checked={!!isSalaryProcessAllSelected}
            onCheckedChange={handleSalaryProcessSelectAllChange}
          />
          <div>Employee</div>
          <div className="text-center">Hours</div>
          <div className="text-right">Gross pay</div>
          <div className="text-right">Deductions</div>
          <div className="text-right">Net pay</div>
          <div className="text-right">Employer cost</div>
          <div>Memo</div>
        </div>

        {/* body */}
        {!allProccessdData || filteredRows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Receipt className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">No salary processes to display</div>
            <div className="text-[13px] text-v-ink400">Go back and pick your team to continue.</div>
          </div>
        ) : (
          filteredRows.map((item: any) => {
            const isSelected = selectedId?.includes(item.id);
            const taxes = totalTaxCalculate(item);
            const grossPay = round2(item.grossPay);
            const netPay = round2(grossPay - (taxes?.employeeDeductionTotal || 0));
            const role = item?.allinfo?.designation?.title || '';
            const loc = item?.allinfo?.taxes?.state || '';
            const sub = [role, loc].filter(Boolean).join(' · ');
            return (
              <div
                key={item.id}
                className={cn(
                  'grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors hover:bg-[#F7F5FC]',
                  !isSelected && 'opacity-60'
                )}
                style={{ gridTemplateColumns: '30px minmax(0,1.5fr) 80px 110px 150px 130px 150px minmax(0,1fr)' }}
              >
                <SmoothCheckbox
                  checked={!!isSelected}
                  onCheckedChange={() => handleSalaryProcessRowSelectionChange(item)}
                />
                {/* employee */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ backgroundImage: avatarGradient(item.name || item.id) }}
                  >
                    {initials(item.name || '?')}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-v-ink900" title={item.name}>
                      {item.name}
                    </div>
                    {sub && <div className="truncate text-[11px] text-v-ink400">{sub}</div>}
                  </div>
                </div>
                {/* hours */}
                <div className="text-center text-[12.5px] tabular-nums text-v-ink700">
                  {item.workingHrs}
                </div>
                {/* gross */}
                <div className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
                  {money(grossPay)}
                </div>
                {/* deductions (computed) */}
                <div className="flex items-center justify-end gap-1.5">
                  <span className="inline-flex w-[96px] items-center gap-1 rounded-[9px] border border-v-border bg-v-card-subtle px-2 py-1.5">
                    <span className="text-[11px] text-v-ink400">$</span>
                    <span className="flex-1 text-right text-[12.5px] font-semibold tabular-nums text-v-danger-fg">
                      {round2(taxes?.employeeDeductionTotal).toFixed(2)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setselectedModalFor('tax');
                      settaxExemptOfaUser(item);
                    }}
                    aria-label="Tax-exempt"
                    className="flex h-7 w-7 items-center justify-center rounded-[8px] text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* net + payslip */}
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[13px] font-extrabold tabular-nums text-v-success-fg">
                    {money(netPay)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setselectedSalary(item)}
                    aria-label="View payslip"
                    className="flex h-7 w-7 items-center justify-center rounded-[8px] text-v-primary transition-colors hover:bg-v-tint100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* employer cost (computed) */}
                <div className="flex justify-end">
                  <span className="inline-flex w-[110px] items-center gap-1 rounded-[9px] border border-v-border bg-v-card-subtle px-2 py-1.5">
                    <span className="text-[11px] text-v-ink400">$</span>
                    <span className="flex-1 text-right text-[12.5px] font-semibold tabular-nums text-v-ink900">
                      {round2(taxes?.employeerContributionTotal).toFixed(2)}
                    </span>
                  </span>
                </div>
                {/* memo */}
                <input
                  onChange={(e: any) => handleInputChange(item.id, 'memo', e.target.value)}
                  placeholder="Add a memo…"
                  className="w-full rounded-[9px] border border-v-border bg-white px-2.5 py-2 text-[12.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]"
                />
              </div>
            );
          })
        )}
      </div>

      {/* sticky submit bar */}
      <div className="sticky bottom-[14px] z-[60] mt-4">
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-v-ink900 px-5 py-3.5 text-white shadow-[0_24px_50px_-18px_rgba(22,23,42,0.6)]">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/55">
              Submitting
            </div>
            <div className="text-[22px] font-extrabold leading-tight tabular-nums">
              {money(Number(totalAmount))}
            </div>
            <div className="truncate text-[11.5px] text-white/55">
              {selectedCount} employee{selectedCount === 1 ? '' : 's'}
              {payrollInfo?.payDate ? ` · pays ${moment(payrollInfo.payDate).format('MMM D, YYYY')}` : ''}
              {selectedbank ? ` · ${selectedbank}${acctLast4 ? ` ·· ${acctLast4}` : ''}` : ''}
            </div>
          </div>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => router.push('/dashboard/hris/payroll/run_payroll')}
            className="rounded-v-btn px-4 py-2.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => createCalculrationFun(true)}
            className="rounded-v-btn border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
          >
            Preview details
          </button>
          <VioletButton
            variant="primary"
            disabled={
              selectedId?.length === 0 ||
              insufficientBalance ||
              issaving ||
              !isTaxConfigLoaded ||
              hasImpossibleTotals
            }
            onClick={() => createCalculrationFun(false)}
          >
            {issaving
              ? 'Submitting…'
              : !isTaxConfigLoaded
                ? 'Loading tax tables…'
                : hasImpossibleTotals
                  ? 'Totals don’t reconcile'
                  : 'Submit payroll'}
          </VioletButton>
        </div>
      </div>

      {/* Modals */}
      {selectedModalFor === 'tax' && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[9999999] flex h-screen w-full items-center justify-center bg-black bg-opacity-40">
          <AddTaxModalEmpty modalContoll={modalContoll} data={taxExemptOfaUser} />
        </div>
      )}
      {selectedModalFor === 'hours' && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[9999999] flex h-screen w-full items-center justify-end bg-black bg-opacity-40">
          <EditHourModal modalContoll={modalContoll} />
        </div>
      )}

      <div className="h-20" />
    </div>
  );
};

export default RunPayroll2;
