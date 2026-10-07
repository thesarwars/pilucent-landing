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
import { BsPrinter, BsThreeDotsVertical } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { RiFileExcel2Line } from 'react-icons/ri';

import { TbFilter } from 'react-icons/tb';
import {
  CalendarDays,
  Wallet,
  ArrowLeft,
  Users,
  Search,
  ChevronDown,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react';
import AddTaxModal from './AddTaxModal';
import EditHourModal from './EditHourModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  addpreview,
  addsalaryproccess,
  addsetings,
  payrollInfoAdd,
} from '@/app/redux/Employee/EmployeeSlice';
import moment from 'moment';
import { round2 } from '@/utils/payrollSummary';
import { useAppSelector } from '@/app/redux/store';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchPayrollGeneralSettings,
  fetchPaySchedule,
  fetchPayScheduleEmployee,
} from '@/app/helpers/backend';
import { calculateUpcomingPayPeriods, parseDate } from '../pay-schedules/_components/PaySchedules';
import { set } from 'lodash';
import { BiCheckCircle, BiRefresh, BiSolidBank, BiTime, BiXCircle } from 'react-icons/bi';
import {
  buildEmployeePriorYtd,
  buildFederalW4InputsFromTaxRecord,
  calculateNYStateTax,
  calculateNYSUI,
  calculateUpcomingPayPeriodsRange,
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
  getTaxExemptions,
  getTaxRecord,
  isMnPaidLeaveApplicable,
  loadTaxConfig,
  mapHoldingStatusToFilingStatus,
} from '@/utils/SalaryProcess';
import { AiOutlineInfo, AiOutlineInfoCircle } from 'react-icons/ai';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import Pagination from '@/components/ui/Pagination/Pagination';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  money,
  avatarGradient,
  initials,
  type VioletTone,
} from '@/components/violet';

/* violet styles for worksheet inputs */
const V_NUM =
  'w-full min-w-0 rounded-[9px] border border-v-border bg-white px-2 py-1.5 text-[13px] tabular-nums text-v-ink900 outline-none transition-shadow focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF] disabled:cursor-not-allowed disabled:bg-v-card-subtle disabled:text-v-ink400';
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-v-ink700';

function accountMeta(kind: string): { tone: VioletTone; label: string } {
  const k = `${kind || ''}`.toUpperCase();
  if (k === 'DIRECT_DEPOSIT') return { tone: 'success', label: 'Direct deposit' };
  if (k === 'BANK_TRANSFER') return { tone: 'success', label: 'Bank transfer' };
  if (k.includes('CHECK')) return { tone: 'warn', label: 'Paper check' };
  if (k) return { tone: 'neutral', label: k.split('_').join(' ').toLowerCase() };
  return { tone: 'neutral', label: 'No method' };
}

const WORKSHEET_COLS = '30px minmax(0,1.7fr) 110px 90px 120px 120px 150px 34px';

interface SalaryProcessItem {
  id: string;
  employeeId: string;
  name: string;
  profileID: string;
  workingHrs: string;
  Rate: string;
  Salary: string;
  exactSalary: string;
  OT: string;
  doubleOT: string;
  PTO: string;
  holydayPay: string;
  bonus: string;
  commission: string;
  total: string;
  employeeContribution: string;
  employeeDeduction: string;
  grossPay: number;
  netPay: number;
  createdAt: string;
  updatedAt: string;
  isSelected: boolean;
  account: string;
  allinfo: any;
  salary_frequency: string;
}

const RunPayroll = () => {
  const paramsId = useSearchParams().get('pay_schedule_id');
  const router = useRouter();
  const dispatch = useDispatch();
  const { gen_settings } = useAppSelector((state) => state?.employee);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [buttonText, setButtonText] = useState('print');
  const [showDetailBoxMenu, setshowDetailBoxMenu] = useState<number | any>(null);
  const [selectedModalFor, setselectedModalFor] = useState<string | null>(null);
  const [selectedItem, setselectedItem] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // UI only — extras panel
  const [processedData, setProcessedData] = useState<SalaryProcessItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [allPayperiods, setallPayperiods] = useState<any[]>([]);
  const [payDate, setpayDate] = useState<any>(new Date());
  const [selectedPayPeriod, setselectedPayPeriod] = useState<any>();
  const [paySchedule, setpaySchedule] = useState<any>(null);
  const [isFetchingData, setisFetchingData] = useState(false);
  // Server-driven 2026+ tax tables: gate calculations until they're loaded so
  // the first paycheck uses backend rates (falls back to the bundled tables on
  // failure). `unavailableTaxStates` = requested states with no published rows.
  const [isTaxConfigLoaded, setIsTaxConfigLoaded] = useState(false);
  const [unavailableTaxStates, setUnavailableTaxStates] = useState<string[]>([]);

  const {
    data: settingData,
    setQueryParams: setSettingQueryParams,
    isPending: settingIsPending,
    refetch: settingRefetch,
  } = useFetch(['generalSettings'], fetchPayrollGeneralSettings);

  useEffect(() => {
    if (settingData) {
      console.log(settingData, 124);

      dispatch(addsetings(settingData));
    } else {
      settingRefetch();
    }
  }, [settingData]);

  //create and check non number value
  const toNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const totalTaxCalculate = (newonj: any) => {
    const earnings = newonj?.allinfo?.earnings
      ?.reduce((sum: number, item: any) => sum + toNumber(item?.total_recurring_amount), 0)
      .toFixed(2);
    const totalEarnings = Number(newonj?.Salary) + Number(earnings);

    // Section 125 (PRETAX) employee deductions reduce the FICA / FUTA /
    // SUI and income-tax wage base; paid-leave premiums stay on FULL
    // gross (mirrors the Run-payroll2 save path).
    const preTax = collectPreTaxDeductionPerPaycheck(newonj?.allinfo);
    const taxableEarnings = Math.max(0, totalEarnings - preTax);
    const taxableGrossPay = Math.max(0, Number(newonj?.grossPay) - preTax);

    const { incomePerPeriod, payPeriods } = extractIncomeAndPayPeriods({
      ...newonj?.allinfo,
      total_salary: taxableEarnings,
    });

    const taxRecord = getTaxRecord(newonj?.allinfo?.taxes);
    const { filingStatus } = mapHoldingStatusToFilingStatus(taxRecord?.holding_status);

    // PRIOR-YTD snapshot drives wage-base caps for SS, Medicare,
    // Additional Medicare, FUTA, NY UI, and the PFL annual cap. We read
    // from `allinfo.payroll_salary_process` (the trustworthy YTD source
    // — the per-component `ytd` field was historically saved as 0).
    const priorYtd = buildEmployeePriorYtd(newonj?.allinfo);

    // Wire Form W-4 Step 2/3/4 + federal-exempt flag from the employee
    // tax record into the IRS Pub. 15-T (2026) percentage method.
    const w4Inputs = buildFederalW4InputsFromTaxRecord(taxRecord);
    const { annualWages, estimatedAnnualTax, estimatedWithholdingPerPeriod, effectiveTaxRate } =
      estimateFederalWithholding_(incomePerPeriod, filingStatus, payPeriods, w4Inputs);

    // NYC resident tax is driven by RESIDENCY (home address), not work
    // location. Detect from the employee's address history.
    const nycResident = detectNycResidentFromEmployee(newonj?.allinfo);
    const { nyStateTax, nycTax, sdi, fli } = calculateNYStateTax({
      gross: taxableGrossPay,
      payFrequency: newonj?.allinfo?.pay_schedule?.pay_frequency ?? 'EVERY_MONTH',
      state: taxRecord?.state || 'NY',
      filingStatus: filingStatus ?? 'single',
      pflYTD: priorYtd.pflWithheld,
      method: 'withholding',
      allowances: 0,
      residentCity: nycResident ? 'nyc' : null,
    });
    // Combined state withholding shown to the employee = NYS + NYC
    // resident (when applicable). NYC is only added when the employee
    // home address is in NYC — never on the basis of work location.
    const stateIncomeTaxCombined = Number(nyStateTax) + Number(nycTax || 0);

    // SS / Medicare with PRIOR YTD so the $184,500 cap and the $200k
    // Additional-Medicare threshold apply on subsequent paychecks.
    // `ytdTaxPaid` is the additional defensive cap — total OASDI tax
    // per side can never exceed `wageBase × 6.2%`.
    const ssEstimate = estimate_socialSecurityTax(taxableEarnings, {
      ytdSubjectWages: priorYtd.socialSecurityWages,
      ytdTaxPaid: priorYtd.socialSecurityTax,
    });
    const medicareEstimate = estimate_medicareTax(taxableEarnings);
    const addMedicareEstimate = estimate_additionalMedicareTaxForPeriod(
      taxableEarnings,
      priorYtd.medicareWages,
      filingStatus === 'married' ? 'mfj' : (filingStatus as any)
    );

    const totalTax =
      stateIncomeTaxCombined +
      Number(estimatedWithholdingPerPeriod) +
      Number(ssEstimate.estimatedTax) +
      Number(medicareEstimate.estimatedTax) +
      Number(addMedicareEstimate.estimatedTax);

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

    // NY 2026: defaults pick up the published wage base ($17,600) and the
    // QBO blended default UI rate (9.825%). RSF (0.075%) is returned
    // separately and added to the employer-tax total as its own line per
    // NYS-45. NY UI is computed on the CURRENT pay-period gross (with
    // YTD-aware wage-base capping), mirroring `nyUnemploymentTax(currentGross,
    // ...)` in `payroll-calculator.js` — so a $4k pay period yields
    // $393.00 NY SUI on the default rate, not $1,729.20.
    const nyUiRateInput =
      Number(taxRecord?.ny_ui_rate) ||
      Number(taxRecord?.ui_rate) ||
      Number(taxRecord?.unemployment_insurance?.[0]?.ui_rate) ||
      0;
    // YTD NY-UI wages come from the saved payroll history; once $17,600
    // is reached the current-period taxable wage becomes 0.
    const { taxableIncome, employerRate, suiTax, rsfTax } = calculateNYSUI(
      taxableGrossPay,
      nyUiRateInput || undefined,
      undefined,
      undefined,
      priorYtd.nyUiWages,
      {
        suiTaxPaid: priorYtd.nySuiTax,
        rsfTaxPaid: priorYtd.nyRsfTax,
      }
    );

    // FUTA: cap on CURRENT pay-period gross with YTD-aware wage base
    // (Pub. 15 §11, Balanzify compliance update §4.4). YTD FUTA wages
    // come from the saved payroll history — once the employee crosses
    // the $7,000 wage base the current-period taxable amount is 0.
    // We also pass `ytdTaxPaid` so the cumulative annual tax can never
    // exceed `wageBase × netRate` (e.g. $42 at the default 0.6% net
    // rate) — defense-in-depth in case YTD wages haven't refreshed.
    const futaCreditRateInput =
      Number(taxRecord?.futa_credit_rate) ||
      Number(newonj?.allinfo?.employer_tax_profile?.futa_credit_rate);
    const futaTax = estimate_FutaTax(taxableGrossPay, {
      ytdSubjectWages: priorYtd.futaWages,
      ytdTaxPaid: priorYtd.futaTax,
      creditRate:
        Number.isFinite(futaCreditRateInput) && futaCreditRateInput > 0
          ? futaCreditRateInput
          : undefined,
    }).estimatedTax;

    const mnPLApplies = isMnPaidLeaveApplicable(newonj?.allinfo?.taxes);
    const mnPLAmt = mnPLApplies
      ? Number(estimate_mnPaidLeave(Number(newonj?.grossPay)).estimatedTax)
      : 0;

    // Per-employee tax exemptions: when a flag is true the matching tax is
    // dropped from the salary process (not calculated, not shown).
    const exemptions = getTaxExemptions(newonj?.allinfo?.taxes);
    const ssAmt = exemptions.socialSecurityMedicare ? 0 : Number(ssEstimate.estimatedTax);
    const medicareAmt = exemptions.socialSecurityMedicare
      ? 0
      : Number(medicareEstimate.estimatedTax);
    const addMedicareAmt = exemptions.socialSecurityMedicare
      ? 0
      : Number(addMedicareEstimate.estimatedTax);
    const futaAmt = exemptions.futa ? 0 : Number(futaTax);
    const suiAmt = exemptions.stateUnemployment ? 0 : Number(suiTax);
    const rsfAmt = exemptions.stateUnemployment ? 0 : Number(rsfTax);
    const fedWithholdingAmt = exemptions.federalIncomeTax
      ? 0
      : Number(estimatedWithholdingPerPeriod);
    const stateTaxAmt = exemptions.stateIncomeTax ? 0 : stateIncomeTaxCombined;

    //employeer contribution in tax
    const employeerTax = futaAmt + ssAmt + medicareAmt + suiAmt + rsfAmt + mnPLAmt;

    //employee total taxable ammount (Additional Medicare is employee-only,
    // no employer match — Pub. 15 §10).
    const employeeTax =
      stateTaxAmt + fedWithholdingAmt + ssAmt + medicareAmt + addMedicareAmt + mnPLAmt;

    //employee will pay
    const employeeDeductionTotal =
      Number(employeeDeduction) + Number(gurnishment) + Number(employeeTax);

    return {
      // Round at the cent. `earnings` in particular is baked straight into
      // item.grossPay below, so ceiling it inflated the gross every downstream
      // tax is then computed on.
      employeerTax: round2(employeerTax),
      employeeTax: round2(employeeTax),
      employeerContribution: round2(employeerContribution),
      employeerContributionTotal: round2(Number(employeerContribution) + Number(employeerTax)),
      employeeDeductionTotal: round2(employeeDeductionTotal),
      earnings: round2(earnings),
    };
  };

  // Fetch employee data
  const [employeesData, setemployeesData] = useState<any[]>([]);

  function formatPayPeriod(input: any) {
    // Split the input by " - " to get start and end date strings
    const [startStr, endStr] = input.split(' - ').map((str: any) => str.trim());

    // Parse each date using moment with format 'MM/DD/YY' (2-digit year)
    const startDate = moment(startStr, 'MM/DD/YY');
    const endDate = moment(endStr, 'MM/DD/YY');

    // Check if both dates are valid
    if (!startDate.isValid() || !endDate.isValid()) {
      throw new Error('Invalid date format');
    }

    // Format both dates to 'MM/DD/YYYY' and join with 'to'
    return `${startDate.format('MM/DD/YYYY')} to ${endDate.format('MM/DD/YYYY')}`;
  }
  const getAllEmployee = async () => {
    if (!paramsId || !selectedPayPeriod) return;
    setisFetchingData(true);
    try {
      const data = await fetchPayScheduleEmployee(
        String(paramsId),
        formatPayPeriod(selectedPayPeriod)
      );
      setemployeesData(data?.employees || []);
      setisFetchingData(false);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employee data.');
      setisFetchingData(false);
    }
  };
  const getThePayscedule = async () => {
    if (!paramsId && paySchedule) return;
    try {
      const data = await fetchPaySchedule(String(paramsId));
      console.log(data, 'Pay Schedule Data');
      setpaySchedule(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employee data.');
    }
  };

  useEffect(() => {
    if (!paySchedule?.uid) {
      getThePayscedule();
    }

    getAllEmployee();
  }, [paramsId, selectedPayPeriod, paySchedule]);

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
    const periods = periodsPerYear(frequency);

    return (52 * hoursPerDay * daysWeek) / periods;
  }

  const calculateEmpleeDeductionContribution = (items: any) => {
    if (!items || items.length === 0) return { totalDeduction: '0.00', totalContribution: '0.00' };
    let totalDeduction = 0;
    let totalContribution = 0;
    items.map((item: any) => {
      totalDeduction += Number(item?.total_employee_deduction_per_pay_check || 0);
      totalContribution += Number(item?.total_company_contribution_per_pay_check || 0);
    });

    return {
      totalDeduction: totalDeduction.toFixed(2),
      totalContribution: totalContribution.toFixed(2),
    };
  };

  // Load the server-driven statutory tax tables for THIS run's distinct states
  // BEFORE the first calculation. Year is pinned to the pay date (not "today")
  // so recomputing an old run reproduces with the tables in force then. On
  // failure `loadTaxConfig` keeps the bundled fallback — payroll still runs.
  useEffect(() => {
    if (!employeesData || employeesData.length === 0) return;
    const states = collectRunStates(employeesData);
    const payDateYear = new Date(payDate || new Date()).getFullYear();
    let active = true;
    setIsTaxConfigLoaded(false);
    loadTaxConfig(payDateYear, states)
      .then(({ unavailable }) => {
        if (!active) return;
        setUnavailableTaxStates(unavailable);
        if (unavailable.length) {
          toast.error(
            `State tax tables for ${unavailable.join(', ')} aren't available for ${payDateYear} yet — those employees' state withholding can't be computed.`
          );
        }
      })
      .finally(() => {
        if (active) setIsTaxConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [employeesData, payDate]);

  // Transform employee data into payroll format
  useEffect(() => {
    if (employeesData.length === 0) return;
    // Wait for the backend tax tables so the first paycheck uses server rates.
    if (!isTaxConfigLoaded) return;
    console.log(employeesData, 'data');

    const transformed = employeesData.map((emp) => {
      const hourlyRate = parseFloat(emp.total_rate_per_hour) || 0;
      const pay_kind = emp.pay_kind;
      const dailyHours = parseFloat(emp.total_hour_per_day) || 0;
      const weeklyDays = parseFloat(emp.total_day_per_week) || 0;
      const monthlyHours = parseFloat(emp.worked_hour_count); //dailyHours * weeklyDays * 4; // Approx

      const frequency = emp?.pay_schedule?.pay_frequency;
      const periods = periodsPerYear(frequency);
      const hoursPerDay = Number(emp?.total_hour_per_day) > 0 ? Number(emp?.total_hour_per_day) : 8;
      const daysPerWeek = Number(emp?.total_day_per_week) > 0 ? Number(emp?.total_day_per_week) : 5;
      const annualHours = 52 * hoursPerDay * daysPerWeek;
      const annualSalary = Number(emp?.total_salary) * 12;

      const hours: any = calculateHours(
        frequency,
        emp?.total_salary,
        Number(emp?.total_hour_per_day),
        Number(emp?.total_day_per_week),
        'SALARY'
      ).toFixed(2);

      const rate: any =
        pay_kind === 'HOURLY' ? hourlyRate.toFixed(2) : (annualSalary / annualHours).toFixed(2);

      const baseSalary =
        pay_kind === 'HOURLY'
          ? (Number(rate) * Number(hours)).toFixed(2)
          : (annualSalary / periods).toFixed(2);

      const initialData: SalaryProcessItem = {
        allinfo: emp,
        id: emp.uid,
        employeeId: emp.employee_id,
        name: emp.user?.first_name + ' ' + emp.user?.last_name || 'Unknown',
        profileID: emp.user?.id || '',
        workingHrs:
          gen_settings?.payroll_working_days === 'CALENDAR_DAYS'
            ? hours
            : emp?.worked_hour_count.toFixed(2), // it will depend on settings hours is var,
        // The setting above chooses WHICH hours to pay, not what the hour is
        // worth. Zeroing the rate here made `salary = rate * hours` zero for
        // every company not on CALENDAR_DAYS, so gross collapsed to holiday +
        // bonus + commission + earnings and the stub printed a $0.00 salary
        // line — base pay was missing from the paycheck entirely.
        Rate: rate,
        Salary: baseSalary,
        exactSalary:
          pay_kind === 'HOURLY'
            ? String(baseSalary)
            : Number(baseSalary).toFixed(2) || '0.00',
        OT: String(emp?.ot_hour_count) || '0',
        doubleOT: '0',
        PTO: String(emp?.paid_leave_hour_count) || '0',
        holydayPay: '0',
        bonus: '0',
        commission: '0',
        total: monthlyHours.toFixed(1),
        employeeContribution: calculateEmpleeDeductionContribution(
          emp?.deduction_contributions || []
        ).totalDeduction,
        employeeDeduction: calculateEmpleeDeductionContribution(emp?.deduction_contributions || [])
          .totalDeduction,
        grossPay: Number(baseSalary),
        netPay: Number(baseSalary),
        createdAt: emp.created_at,
        updatedAt: emp.updated_at,
        isSelected: false,
        account: 'Bank', // default
        salary_frequency: emp?.salary_frequency,
      };

      // Calculate initial gross pay
      return calculatePayroll(initialData);
    });

    setProcessedData(transformed);
    dispatch(addsalaryproccess(transformed as any)); // Sync with Redux
  }, [employeesData, isTaxConfigLoaded]);

  // Handle select all
  const handleSelectAllChange = (isChecked: boolean) => {
    const newSelectedIds = new Set<string>();

    const updatedData = processedData.map((item) => {
      const hasProcessedSalary =
        Array.isArray(item?.allinfo?.payroll_salary_process) &&
        item.allinfo.payroll_salary_process.some((p: any) => p.pay_period === selectedPayPeriod);

      const bankingKind = item?.allinfo?.banaking_informations?.[0]?.kind;
      const isBankVerified = item?.allinfo?.is_banking_info_verified;
      const isTaxCitySelected = item?.allinfo?.taxes?.state;

      const canSelect =
        !hasProcessedSalary &&
        isTaxCitySelected &&
        bankingKind &&
        ((isBankVerified && bankingKind === 'BANK_TRANSFER') || bankingKind !== 'BANK_TRANSFER');

      if (isChecked && canSelect) {
        newSelectedIds.add(item.id);
        return { ...item, isSelected: true };
      }

      return { ...item, isSelected: false };
    });

    setProcessedData(updatedData);
    setSelectedIds(isChecked ? newSelectedIds : new Set());
  };

  // Handle individual row selection
  const handleRowSelectionChange = (id: string, checked: boolean) => {
    const updatedData = processedData.map((item) => {
      if (item.id !== id) return item;

      const hasProcessedSalary =
        Array.isArray(item?.allinfo?.payroll_salary_process) &&
        item.allinfo.payroll_salary_process.some((p: any) => p.pay_period === selectedPayPeriod);

      const bankingKind = item?.allinfo?.banaking_informations?.[0]?.kind;
      const isBankVerified = item?.allinfo?.is_banking_info_verified;
      const isTaxCitySelected = item?.allinfo?.taxes?.state;

      const canSelect =
        !hasProcessedSalary &&
        isTaxCitySelected &&
        bankingKind &&
        ((isBankVerified && bankingKind === 'BANK_TRANSFER') || bankingKind !== 'BANK_TRANSFER');

      if (!canSelect) {
        if (hasProcessedSalary)
          toast.error('This employee already has a salary process in this pay period');
        else if (!bankingKind) toast.error('Banking information not found for this employee');
        else if (!isTaxCitySelected) toast.error('Tax state not found for this employee');
        else if (bankingKind === 'BANK_TRANSFER' && !isBankVerified)
          toast.error('Bank not verified for this employee');
        return item;
      }

      return { ...item, isSelected: checked };
    });

    setProcessedData(updatedData);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  // Handle input change with auto-calculation
  const handleInputChange = (id: string, field: string, value: string) => {
    setProcessedData((prev) => {
      const updated: any = prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          return calculatePayroll(updatedItem);
        }
        return item;
      });
      dispatch(addsalaryproccess(updated)); // Sync Redux
      return updated;
    });
  };

  // Auto-calculate Salary, Total Hrs, Gross Pay
  function calculatePayroll(item: SalaryProcessItem): SalaryProcessItem {
    const toNum = (val: any) => parseFloat(val) || 0;
    const rate = toNum(item.Rate);
    const hours = toNum(item.workingHrs);
    const ot = toNum(item.OT);
    const doubleOT = toNum(item.doubleOT);
    const pto = toNum(item.PTO);
    const holidayPay = toNum(item.holydayPay);
    const bonus = toNum(item.bonus);
    const commission = toNum(item.commission);

    const salary = rate * hours;
    const otPay = rate * 1.5 * ot;
    const doubleOtPay = rate * 1.5 * 1.5 * doubleOT;
    const ptoPay = rate * pto;

    const totalHrs = hours + ot + doubleOT;
    const grossPay = salary + otPay + doubleOtPay + ptoPay + holidayPay + bonus + commission;

    return {
      ...item,
      Salary: String(salary.toFixed(2)),
      total: totalHrs.toFixed(2),
      grossPay: grossPay + totalTaxCalculate(item)?.earnings,
      netPay: Number(grossPay.toFixed(2)), // placeholder
    };
  }

  // Filter and paginate data
  const filteredData = processedData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData: any = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const createCalculrationFun = async () => {
    const selectedRows: any = processedData.filter((item: any) => item.isSelected);
    if (selectedRows.length === 0) {
      return toast.error('Select at least one employee to calculate.');
    }

    try {
      // await createCalculation({
      //   variables: { input: JSON.stringify(selectedRows) },
      // });
      dispatch(
        payrollInfoAdd({
          payDate: moment(payDate).format('YYYY-MM-DD'),
          selectedPayPeriod,
          payType: employeesData[0]?.pay_schedule?.pay_frequency,
        } as any)
      );

      dispatch(addsalaryproccess(selectedRows));
      toast.success('Calculation Created Successfully');
      router.push('/dashboard/hris/payroll/run_payroll2');
    } catch (error) {
      toast.error('Calculation failed. Please try again.');
    }
  };

  const createPreview = () => {
    const selectedRows: any = processedData.filter((item) => item.isSelected);
    if (selectedRows.length === 0) {
      return toast.error('Select at least one employee to preview.');
    }
    dispatch(addpreview(selectedRows));
    router.push('/dashboard/hris/payroll/preview_details/previewpayroll');
  };

  const modalContoll = () => {
    setselectedModalFor(null);
    setselectedItem(null);
  };

  function getPayPeriodByToday(today: any, payPeriods: any[]) {
    const todayDate: any = today;

    // Sort by payDate in case not sorted
    const sortedPeriods: any = [...payPeriods].sort(
      (a: any, b: any) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime()
    );

    for (let period of sortedPeriods) {
      const payDate = new Date(period.payDate);
      if (todayDate < payDate) {
        return period;
      }
    }

    return null; // If today is after all payDates
  }

  useEffect(() => {
    if (!paySchedule) return;
    const payScedules: any = paySchedule;

    // if(!payScedules) return;
    const periods = calculateUpcomingPayPeriodsRange(payScedules);
    console.log(periods, 211, paySchedule);
    setallPayperiods(periods);

    const dd = getPayPeriodByToday(new Date(payDate), periods);
    setselectedPayPeriod(dd?.periodRange ?? allPayperiods[0]?.periodRange); //if not identified set first item
    console.log(22);

    // console.log(dd, "dd");
  }, [paySchedule]);

  const handleHandlePayPeriodChange = (e: any) => {
    const selectedPeriod = JSON.parse(e.target.value);
    setpayDate(selectedPeriod?.payDate);
    // setpayDate(new Date());
    setselectedPayPeriod(selectedPeriod?.periodRange);
    // dispatch(addsalaryproccess(selectedRows));
    // Handle pay period change logic here
  };

  const allSelected = processedData.length > 0 && processedData.every((i) => i.isSelected);
  const eligibleCount = processedData.filter((item) => {
    const hasProcessed =
      Array.isArray(item?.allinfo?.payroll_salary_process) &&
      item.allinfo.payroll_salary_process.some((p: any) => p.pay_period === selectedPayPeriod);
    const bankingKind = item?.allinfo?.banaking_informations?.[0]?.kind;
    const isBankVerified = item?.allinfo?.is_banking_info_verified;
    const isTaxCitySelected = item?.allinfo?.taxes?.state;
    return (
      !hasProcessed &&
      isTaxCitySelected &&
      bankingKind &&
      ((isBankVerified && bankingKind === 'BANK_TRANSFER') || bankingKind !== 'BANK_TRANSFER')
    );
  }).length;
  const selectedCount = selectedIds.size;
  const formatFrequency = (f?: string) =>
    f
      ? f
          .split('_')
          .join(' ')
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'N/A';

  // run-total = sum of selected rows' gross (display only; submit logic unchanged)
  const runTotalSelected = processedData
    .filter((i) => i.isSelected)
    .reduce((s, i) => s + round2(i.grossPay), 0);

  return (
    <div className="relative pb-28 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Run payroll', href: '/dashboard/hris/payroll/salary_process' },
          { label: `${moment(payDate).format('MMMM')} run` },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/hris/payroll/salary_process')}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          {moment(payDate).format('MMMM')} payroll run
        </h1>
        {employeesData[0]?.pay_schedule?.pay_frequency && (
          <Chip tone="violet">
            {formatFrequency(employeesData[0]?.pay_schedule?.pay_frequency)}
          </Chip>
        )}
        {payDate && <Chip tone="neutral">Pays {moment(payDate).format('MMM D, YYYY')}</Chip>}
        <span className="flex-1" />
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-v-success-fg">
          <CheckCircle2 className="h-4 w-4" /> Draft autosaved
        </span>
      </div>
      <p className="mt-2 text-[14px] text-v-ink500">
        Review this period's payroll — pick who gets paid, adjust hours, add extras, then continue.
      </p>

      {/* settings */}
      <div className="mt-[18px] rounded-v-card bg-white p-4 shadow-v-card">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 [&>div]:min-w-0">
          <div>
            <label className={V_LABEL}>
              <CalendarDays className="h-3.5 w-3.5 text-v-primary" /> Pay period
            </label>
            <select
              onChange={handleHandlePayPeriodChange}
              value={
                allPayperiods.find((p) => p.periodRange === selectedPayPeriod)
                  ? JSON.stringify(allPayperiods.find((p) => p.periodRange === selectedPayPeriod))
                  : ''
              }
              className={`${V_FIELD} cursor-pointer`}
            >
              <option value="" disabled>
                Select period
              </option>
              {allPayperiods &&
                allPayperiods.map((period, index) => (
                  <option key={index} value={JSON.stringify(period)}>
                    {period.periodRange}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className={V_LABEL}>
              <Wallet className="h-3.5 w-3.5 text-v-primary" /> Pay date
            </label>
            <input
              onChange={(e: any) => setpayDate(e.target.value)}
              value={moment(payDate).format('YYYY-MM-DD')}
              type="date"
              className={`${V_FIELD} tabular-nums`}
            />
          </div>
          <div>
            <label className={V_LABEL}>
              <BiSolidBank className="h-3.5 w-3.5 text-v-primary" /> Pay schedule
            </label>
            <input
              readOnly
              value={
                paySchedule?.title ||
                formatFrequency(employeesData[0]?.pay_schedule?.pay_frequency)
              }
              className={`${V_FIELD} bg-v-card-subtle text-v-ink500`}
            />
          </div>
        </div>
      </div>

      {/* server tax-table gap warning — a missing table must never read as "no tax due" */}
      {unavailableTaxStates.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-v-card border border-v-danger-fg/25 bg-v-danger-bg px-4 py-3 text-[12.5px] text-v-danger-fg">
          <AiOutlineInfoCircle className="mt-0.5 shrink-0 text-base" />
          <span>
            State tax tables for <strong>{unavailableTaxStates.join(', ')}</strong> aren&apos;t
            published for {new Date(payDate || new Date()).getFullYear()} yet. Federal taxes still
            compute, but state withholding for employees in{' '}
            {unavailableTaxStates.length === 1 ? 'this state' : 'these states'} can&apos;t be
            calculated — verify before submitting.
          </span>
        </div>
      )}

      {/* pay your team */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Users />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold text-v-ink900">Pay your team</div>
            <div className="text-[11.5px] text-v-ink400">
              Untick anyone sitting this run out · open Extras for overtime, PTO &amp; bonuses
            </div>
          </div>
          <Chip tone="violet">
            {selectedCount} of {eligibleCount} selected
          </Chip>
          <span className="flex-1" />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee"
              className="w-[230px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>
        </div>

        {/* column strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400"
          style={{ gridTemplateColumns: WORKSHEET_COLS }}
        >
          <SmoothCheckbox checked={allSelected} onCheckedChange={handleSelectAllChange} />
          <div>Employee</div>
          <div className="text-center">Hours</div>
          <div className="text-center">Rate</div>
          <div className="text-center">Extras</div>
          <div className="text-right">Gross pay</div>
          <div>Account</div>
          <div />
        </div>

        {/* body */}
        {isFetchingData ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3.5"
              style={{ gridTemplateColumns: WORKSHEET_COLS }}
            >
              {Array.from({ length: 8 }).map((__, j) => (
                <div key={j} className="h-4 w-3/4 rounded bg-v-wash2" />
              ))}
            </div>
          ))
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Users className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">No employees for this pay period</div>
            <div className="text-[13px] text-v-ink400">Pick a different pay period above.</div>
          </div>
        ) : (
          paginatedData.map((item: any) => {
            const alreadyProcessed =
              Array.isArray(item?.allinfo?.payroll_salary_process) &&
              item.allinfo.payroll_salary_process.some(
                (p: any) => p.pay_period === selectedPayPeriod
              );
            const taxStateMissing = !item?.allinfo?.taxes?.state;
            const bankKind = item?.allinfo?.banaking_informations?.[0]?.kind;
            const isBankVerified = item?.allinfo?.is_bank_verified;
            const acct = accountMeta(bankKind);
            const isSalary = item?.allinfo?.pay_kind === 'SALARY';
            const base =
              Number(isSalary ? item?.allinfo?.total_salary : item?.allinfo?.total_rate_per_hour) ||
              0;
            const hasExtras = [
              item.OT,
              item.doubleOT,
              item.PTO,
              item.holydayPay,
              item.bonus,
              item.commission,
            ].some((v) => Number(v) > 0);
            const expanded = expandedRow === item.id;
            const EXTRAS = [
              { f: 'OT', label: 'Overtime', mult: '1.5×' },
              { f: 'doubleOT', label: 'Double OT', mult: '2×' },
              { f: 'holydayPay', label: 'Holiday', mult: '1×' },
              { f: 'PTO', label: 'PTO', mult: '1×' },
              { f: 'bonus', label: 'Bonus', mult: '$' },
              { f: 'commission', label: 'Commission', mult: '$' },
            ];
            return (
              <div key={item.id}>
                <div
                  className={cn(
                    'grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 transition-colors hover:bg-[#F7F5FC]',
                    !item.isSelected && 'opacity-60'
                  )}
                  style={{ gridTemplateColumns: WORKSHEET_COLS }}
                >
                  <SmoothCheckbox
                    checked={!!item.isSelected}
                    onCheckedChange={(checked) => handleRowSelectionChange(item.id, checked)}
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
                      <div className="truncate text-[11px] text-v-ink400">
                        base {money(base)}
                        {isSalary ? '/mo' : '/h'} · {Number(item?.allinfo?.total_hour_per_day) || 0}h ×{' '}
                        {Number(item?.allinfo?.total_day_per_week) || 0}d
                      </div>
                      {alreadyProcessed && (
                        <span className="mt-1 inline-block rounded-full bg-v-danger-bg px-2 py-0.5 text-[10px] font-semibold text-v-danger-fg">
                          Already processed
                        </span>
                      )}
                      {taxStateMissing && !alreadyProcessed && (
                        <span className="mt-1 inline-block rounded-full bg-v-danger-bg px-2 py-0.5 text-[10px] font-semibold text-v-danger-fg">
                          Tax state missing
                        </span>
                      )}
                    </div>
                  </div>
                  {/* hours */}
                  <input
                    disabled={!item.isSelected}
                    value={item.workingHrs}
                    onChange={(e) => handleInputChange(item.id, 'workingHrs', e.target.value)}
                    className={`${V_NUM} text-center`}
                  />
                  {/* rate */}
                  <div className="text-center text-[12.5px] font-semibold tabular-nums text-v-ink700">
                    {item.Rate || '—'}
                  </div>
                  {/* extras toggle */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setExpandedRow(expanded ? null : item.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-[9px] border px-2.5 py-1.5 text-[12px] font-semibold transition-colors',
                        expanded
                          ? 'border-v-primary bg-v-tint100 text-v-primary'
                          : 'border-v-border text-v-ink500 hover:border-v-primary/40'
                      )}
                    >
                      Extras
                      {hasExtras && <span className="h-1.5 w-1.5 rounded-full bg-v-primary" />}
                      <ChevronDown
                        className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')}
                      />
                    </button>
                  </div>
                  {/* gross */}
                  <div className="text-right text-[14px] font-extrabold tabular-nums text-v-ink900">
                    {money(round2(item.grossPay))}
                  </div>
                  {/* account */}
                  <div>
                    {bankKind ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Chip tone={acct.tone}>{acct.label}</Chip>
                        {bankKind === 'BANK_TRANSFER' && !isBankVerified && (
                          <span title="Bank not verified" className="text-v-danger-fg">
                            <BiXCircle className="text-base" />
                          </span>
                        )}
                      </span>
                    ) : (
                      <Chip tone="danger">No method</Chip>
                    )}
                  </div>
                  {/* kebab */}
                  <div className="relative flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setshowDetailBoxMenu((prev: any) => (prev === item.id ? null : item.id))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
                    >
                      <MoreVertical className="h-[18px] w-[18px]" />
                    </button>
                    {showDetailBoxMenu === item.id && (
                      <div className="absolute right-0 top-9 z-50 w-44 animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal">
                        <button
                          type="button"
                          onClick={() => {
                            setselectedItem(item);
                            setselectedModalFor('paycheck');
                            setshowDetailBoxMenu(null);
                          }}
                          className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 hover:bg-v-wash hover:text-v-primary"
                        >
                          Edit paycheck
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setselectedItem(item);
                            setselectedModalFor('hours');
                            setshowDetailBoxMenu(null);
                          }}
                          className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 hover:bg-v-wash hover:text-v-primary"
                        >
                          Edit hours worked
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setselectedItem(item);
                            setselectedModalFor('tax');
                            setshowDetailBoxMenu(null);
                          }}
                          className="block w-full px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 hover:bg-v-wash hover:text-v-primary"
                        >
                          Add tax-exempt pay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* extras panel */}
                {expanded && (
                  <div className="grid grid-cols-2 gap-3 border-b border-[rgba(22,23,42,0.06)] bg-v-card-subtle px-[22px] py-4 sm:grid-cols-3 lg:grid-cols-6">
                    {EXTRAS.map((ex) => (
                      <div key={ex.f}>
                        <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-v-ink700">
                          {ex.label}
                          <span className="rounded bg-v-tint100 px-1 text-[9px] font-bold text-v-primary">
                            {ex.mult}
                          </span>
                        </label>
                        <input
                          disabled={!item.isSelected}
                          value={(item as any)[ex.f]}
                          onChange={(e) => handleInputChange(item.id, ex.f, e.target.value)}
                          className={V_NUM}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* footer note + pagination */}
        <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
          <span className="text-[12.5px] text-v-ink400">
            {selectedCount} of {processedData.length} employees · base pay auto-prorates with hours.
          </span>
          <span className="flex-1" />
          <Pagination
            onPageChange={setCurrentPage}
            totalData={filteredData.length}
            currentPage={currentPage}
          />
        </div>
      </div>

      {/* sticky run-total bar */}
      <div className="sticky bottom-[14px] z-[60] mt-4">
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-v-ink900 px-5 py-3.5 text-white shadow-[0_24px_50px_-18px_rgba(22,23,42,0.6)]">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/55">
              This run
            </div>
            <div className="text-[22px] font-extrabold leading-tight tabular-nums">
              {money(runTotalSelected)}
            </div>
            <div className="text-[11.5px] text-white/55">
              {selectedCount} employee{selectedCount === 1 ? '' : 's'}
              {payDate ? ` · pays ${moment(payDate).format('MMM D, YYYY')}` : ''}
            </div>
          </div>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => router.push('/dashboard/hris/payroll/salary_process')}
            className="rounded-v-btn px-4 py-2.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <VioletButton variant="primary" onClick={createCalculrationFun}>
            Continue →
          </VioletButton>
        </div>
      </div>

      {/* Modals */}
      {selectedModalFor === 'tax' && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-end bg-black bg-opacity-40">
          <AddTaxModal data={selectedItem} modalContoll={modalContoll} />
        </div>
      )}
      {selectedModalFor === 'hours' && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-end bg-black bg-opacity-40">
          <EditHourModal data={selectedItem} modalContoll={modalContoll} />
        </div>
      )}
    </div>
  );
};

export default RunPayroll;
