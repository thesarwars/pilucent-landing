export function extractIncomeAndPayPeriods(emp: any) {
	const salary = parseFloat(emp?.total_salary);
	const frequency = emp?.pay_frequency;
	let payPeriods = 12; // Default monthly
	let incomePerPeriod = salary;
  
	switch (frequency) {
	  case "EVERY_MONTH":
		payPeriods = 12;
		incomePerPeriod = salary;
		break;
	  case "EVERY_WEEK":
		payPeriods = 52;
		incomePerPeriod = salary;
		break;
	  case "EVERY_DAY":
		payPeriods = 260; // Approx working days
		incomePerPeriod = salary;
		break;
	  case "EVERY_YEAR":
		payPeriods = 1;
		incomePerPeriod = salary;
		break;
	  default:
		payPeriods = 12;
		incomePerPeriod = salary;
	}
  
	return { incomePerPeriod, payPeriods };
  }
  
  export function estimateFederalWithholding_(
	incomePerPeriod: any,
	filingStatus = "single",
	payPeriods = 26,
  ) {
	const standardDeductions: any = {
	  single: 15000,
	  married: 30000,
	  hoh: 22500,
	};
  
	const standardDeduction =
	  standardDeductions[filingStatus.toLowerCase()] || standardDeductions.single;
	const annualWages = incomePerPeriod * payPeriods;
	const taxableIncome = Math.max(0, annualWages - standardDeduction);
  
	const taxBrackets: any = {
	  single: [
		{ cap: 11925, rate: 0.1 },
		{ cap: 48475, rate: 0.12 },
		{ cap: 103350, rate: 0.22 },
		{ cap: 197300, rate: 0.24 },
		{ cap: 250525, rate: 0.32 },
		{ cap: 626350, rate: 0.35 },
		{ cap: Infinity, rate: 0.37 },
	  ],
	  married: [
		{ cap: 23850, rate: 0.1 },
		{ cap: 96950, rate: 0.12 },
		{ cap: 206700, rate: 0.22 },
		{ cap: 394600, rate: 0.24 },
		{ cap: 501050, rate: 0.32 },
		{ cap: 751600, rate: 0.35 },
		{ cap: Infinity, rate: 0.37 },
	  ],
	  hoh: [
		{ cap: 17400, rate: 0.1 },
		{ cap: 63100, rate: 0.12 },
		{ cap: 100500, rate: 0.22 },
		{ cap: 191950, rate: 0.24 },
		{ cap: 243700, rate: 0.32 },
		{ cap: 609350, rate: 0.35 },
		{ cap: Infinity, rate: 0.37 },
	  ],
	};
  
	const brackets =
	  taxBrackets[filingStatus.toLowerCase()] || taxBrackets.single;
  
	let tax = 0;
	let lastCap = 0;
  
	for (let { cap, rate } of brackets) {
	  if (taxableIncome > lastCap) {
		const amountTaxed = Math.min(taxableIncome, cap) - lastCap;
		tax += amountTaxed * rate;
		lastCap = cap;
	  } else {
		break;
	  }
	}
  
	const withholdingPerPeriod = tax / payPeriods;
  
	return {
	  filingStatus,
	  annualWages: annualWages.toFixed(2),
	  estimatedAnnualTax: tax.toFixed(2),
	  estimatedWithholdingPerPeriod: withholdingPerPeriod.toFixed(2),
	  effectiveTaxRate: ((tax / annualWages) * 100).toFixed(2) + "%",
	};
  }
  
  export const estimate_socialSecurityTax = (income: any) => {
	const taxRate = 0.062;
	const estimatedTax: any = (income * taxRate).toFixed(2);
	const effectiveTaxRate: any =
	  ((estimatedTax / income) * 100).toFixed(2) + "%";
	return {
	  estimatedTax: estimatedTax,
	  effectiveTaxRate: effectiveTaxRate,
	};
  };
  
  export const estimate_medicareTax = (income: any) => {
	const taxRate = 0.0145;
	const estimatedTax: any = (income * taxRate).toFixed(2);
	const effectiveTaxRate: any =
	  ((estimatedTax / income) * 100).toFixed(2) + "%";
	console.log(estimatedTax, effectiveTaxRate, "medicare", income);
  
	return {
	  estimatedTax: estimatedTax,
	  effectiveTaxRate: effectiveTaxRate,
	};
  };
  export const estimate_aditionalMedicareTax = (income: any) => {
	if (income * 12 > 200000) {
	  const taxRate = 0.009;
	  const estimatedTax: any = (income * taxRate).toFixed(2);
	  const effectiveTaxRate: any =
		((estimatedTax / income) * 100).toFixed(2) + "%";
	  return {
		estimatedTax: estimatedTax,
		effectiveTaxRate: effectiveTaxRate,
	  };
	} else {
	  return {
		estimatedTax: 0,
		effectiveTaxRate: 0,
	  };
	}
  };
  
  export const estimate_FutaTax = (income: any) => {
	if (income > 7000) {
	  const taxRate = 0.006;
	  const estimatedTax: any = (7000 * taxRate).toFixed(2);
	  const effectiveTaxRate: any =
		((estimatedTax / income) * 100).toFixed(2) + "%";
	  return {
		estimatedTax: estimatedTax,
		effectiveTaxRate: effectiveTaxRate,
	  };
	} else {
	  const taxRate = 0.06;
	  const estimatedTax: any = (income * taxRate).toFixed(2);
	  const effectiveTaxRate: any =
		((estimatedTax / income) * 100).toFixed(2) + "%";
	  return {
		estimatedTax: estimatedTax,
		effectiveTaxRate: effectiveTaxRate,
	  };
	}
  };
  
  // export function calculateNYStateTaxForEmployee(incomePerPeriod:any,payPeriods:any, filingStatus = "single",frequency = "PER_MONTH") {
  
  //   const nyTaxBrackets:any = {
  //     single: [
  //       { cap: 8500, rate: 0.04 },
  //       { cap: 11700, rate: 0.045 },
  //       { cap: 13900, rate: 0.0525 },
  //       { cap: 21400, rate: 0.0585 },
  //       { cap: 80650, rate: 0.0625 },
  //       { cap: 112000, rate: 0.0685 },
  //       // { cap: 1077550, rate: 0.0685 },
  //       // { cap: 5000000, rate: 0.0965 },
  //       // { cap: 25000000, rate: 0.103 },
  //       // { cap: Infinity, rate: 0.109 }
  //     ],
  //     married: [
  //       { cap: 17150, rate: 0.04 },
  //       { cap: 23600, rate: 0.045 },
  //       { cap: 27900, rate: 0.0525 },
  //       { cap: 161550, rate: 0.055 },
  //       { cap: 323200, rate: 0.06 },
  //       { cap: 2155350, rate: 0.0685 },
  //       { cap: 5000000, rate: 0.0965 },
  //       { cap: 25000000, rate: 0.103 },
  //       { cap: Infinity, rate: 0.109 }
  //     ],
  //     hoh: [
  //       { cap: 12800, rate: 0.04 },
  //       { cap: 17650, rate: 0.045 },
  //       { cap: 20900, rate: 0.0525 },
  //       { cap: 107650, rate: 0.055 },
  //       { cap: 269300, rate: 0.06 },
  //       { cap: 1616450, rate: 0.0685 },
  //       { cap: 5000000, rate: 0.0965 },
  //       { cap: 25000000, rate: 0.103 },
  //       { cap: Infinity, rate: 0.109 }
  //     ],
  
  //     // You can add more statuses: married, hoh, etc.
  //   };
  //   const frequencyInNumber = frequency === "PER_MONTH" ? 12 : frequency === "PER_WEEK"?52:1;
  //   const annualIncome = (incomePerPeriod * payPeriods)-8000;
  
  //   const brackets = nyTaxBrackets[filingStatus] || nyTaxBrackets.single;
  //   let tax = 0;
  //   let lastCap = 0;
  
  //   for (const { cap, rate } of brackets) {
  //     if (annualIncome > lastCap) {
  //       const amountTaxed = Math.min(annualIncome, cap) - lastCap;
  //       tax += amountTaxed * rate;
  //       lastCap = cap;
  //     } else {
  //       break;
  //     }
  //   }
  //   console.log({
  //     nyStateTax: (tax/frequencyInNumber).toFixed(2),
  //     effectiveRate: ((tax / annualIncome) * 100).toFixed(2) + "%"
  //   }, incomePerPeriod, payPeriods, filingStatus, frequencyInNumber,annualIncome);
  
  //   return {
  //     nyStateTax: (tax/frequencyInNumber).toFixed(2),
  //     effectiveRate: ((tax / annualIncome) * 100).toFixed(2) + "%"
  //   };
  // }
  
  export function calculateNYStateTaxForEmployee(
	incomePerPeriod: number,
	payPeriods: number,
	filingStatus: "single" | "married" | "hoh" = "single",
	frequency: "EVERY_MONTH" | "EVERY_WEEK" = "EVERY_MONTH",
  ) {
	// 2025 NY State Tax Brackets (NerdWallet)
	const nyTaxBrackets: Record<string, { cap: number; rate: number }[]> = {
	  single: [
		{ cap: 8500, rate: 0.04 },
		{ cap: 11700, rate: 0.045 },
		{ cap: 13900, rate: 0.0525 },
		{ cap: 21400, rate: 0.0585 },
		{ cap: 80650, rate: 0.0625 },
		{ cap: 215400, rate: 0.0685 },
		{ cap: 1077550, rate: 0.0965 },
		{ cap: 5000000, rate: 0.103 },
		{ cap: Infinity, rate: 0.109 },
	  ],
	  married: [
		{ cap: 17150, rate: 0.04 },
		{ cap: 23600, rate: 0.045 },
		{ cap: 27900, rate: 0.0525 },
		{ cap: 161550, rate: 0.055 },
		{ cap: 323200, rate: 0.06 },
		{ cap: 2155350, rate: 0.0685 },
		{ cap: 5000000, rate: 0.0965 },
		{ cap: 25000000, rate: 0.103 },
		{ cap: Infinity, rate: 0.109 },
	  ],
	  hoh: [
		{ cap: 12800, rate: 0.04 },
		{ cap: 17650, rate: 0.045 },
		{ cap: 20900, rate: 0.0525 },
		{ cap: 107650, rate: 0.055 },
		{ cap: 269300, rate: 0.06 },
		{ cap: 1616450, rate: 0.0685 },
		{ cap: 5000000, rate: 0.0965 },
		{ cap: 25000000, rate: 0.103 },
		{ cap: Infinity, rate: 0.109 },
	  ],
	};
  
	const frequencyInNumber =
	  frequency === "EVERY_MONTH" ? 12 : frequency === "EVERY_WEEK" ? 52 : 1;
  
	const annualIncome = incomePerPeriod * payPeriods - 8000;
	const brackets = nyTaxBrackets[filingStatus] || nyTaxBrackets.single;
  
	// === Calculate NY state income tax ===
	let tax = 0;
	let lastCap = 0;
	for (const { cap, rate } of brackets) {
	  if (annualIncome > lastCap) {
		const taxableAtRate = Math.min(annualIncome, cap) - lastCap;
		tax += taxableAtRate * rate;
		lastCap = cap;
	  } else {
		break;
	  }
	}
  
	// === SDI (State Disability Insurance) ===
	const sdiPerWeek = 0.6;
	const sdiAnnualMax = 31.2;
	const sdiAnnual = sdiAnnualMax; //Math.min(sdiPerWeek * 52, sdiAnnualMax);
	const sdiPerPeriod = parseFloat((sdiAnnual / frequencyInNumber).toFixed(2));
  
	// === PFL (Paid Family Leave) ===
	const pflRate = 0.00388;
	const pflAnnualMax = 354.53;
	const pflAnnual = incomePerPeriod * pflRate * payPeriods; //Math.min(annualIncome * pflRate, pflAnnualMax);
	const pflPerPeriod = parseFloat((pflAnnual / frequencyInNumber).toFixed(2));
  
	const result = {
	  nyStateTax:
		parseFloat((tax / frequencyInNumber).toFixed(2)) -
		sdiPerPeriod -
		pflPerPeriod,
	  nyStateTaxWD: parseFloat((tax / frequencyInNumber).toFixed(2)),
	  sdiPerPeriod,
	  payPeriods,
	  pflPerPeriod,
	  sdiAnnual,
	  pflAnnual,
	  totalPerPeriodTax: parseFloat(
		(tax / frequencyInNumber + sdiPerPeriod + pflPerPeriod).toFixed(2),
	  ),
	  effectiveRate: ((tax / annualIncome) * 100).toFixed(2) + "%",
	};
  
	console.log(result);
	return result;
  }
  
  export function calculateNYStateTax({
	gross,
	payFrequency,
	state,
	filingStatus,
	pflYTD,
	method,
	allowances,
  }: {
	gross: number;
	payFrequency:
	  | "EVERY_WEEK"
	  | "EVERY_BIWEEK"
	  | "EVERY_SEMIMONTH"
	  | "EVERY_MONTH"
	  | "EVERY_YEAR";
	state: string;
	filingStatus: string;
	pflYTD?: number;
	method?: string;
	allowances?: number;
  }) {
	console.log("State", state, gross);
  
	if (state !== "NY" && state !== "MN") state = "NY";
  
	const periodsMap: any = {
	  EVERY_WEEK: 52,
	  EVERY_BIWEEK: 26,
	  EVERY_SEMIMONTH: 24,
	  EVERY_MONTH: 12,
	  EVERY_YEAR: 1,
	};
  
	const periods = periodsMap[payFrequency];
	if (!periods)
	  throw new Error(
		"payFrequency must be 'EVERY_WEEK' | 'EVERY_BIWEEK' | 'EVERY_SEMIMONTH' | 'EVERY_MONTH' | 'EVERY_YEAR'",
	  );
  
	const round = (n: any) => Math.round((n + Number.EPSILON) * 100) / 100;
  
	// ---- NY: tables & allowances (NYS-50-T-NYS 1/23)
	const NY_STD: any = {
	  single: 8000,
	  mfs: 8000,
	  hoh: 11200,
	  mfj: 16050,
	  qs: 16050,
	}; // annual std deduction
	const NY_BR_SINGLE = [
	  [8500, 0.04],
	  [11700, 0.045],
	  [13900, 0.0525],
	  [80650, 0.055],
	  [215400, 0.06],
	  [1077550, 0.0685],
	  [5000000, 0.0965],
	  [25000000, 0.103],
	  [Infinity, 0.109],
	];
	// Method II Table A (Monthly): deduction 616.70 + 83.30 per allowance (Single)
	const NY_ALLOW_MONTHLY_SINGLE = 616.7 + 83.3 * (allowances || 0); // Table A/B/C
	// Method II Table II-D (Monthly, Single): [min, max, subtract, rate, add]
	const NY_MII_MONTHLY_SINGLE = [
	  [0, 708, 0, 0.04, 0.0],
	  [708, 975, 708, 0.045, 28.33],
	  [975, 1158, 975, 0.0525, 40.33],
	  [1158, 6721, 1158, 0.055, 50.0],
	  [6721, 8067, 6721, 0.06, 355.92],
	  [8067, 8971, 8067, 0.0714, 436.67],
	  [8971, 13138, 8971, 0.0764, 501.17],
	  [13138, 17950, 13138, 0.065, 819.33],
	  [17950, 22117, 17950, 0.1101, 1132.17],
	  [22117, 89796, 22117, 0.0735, 1591.0],
	]; // Source table & allowances: NYS-50-T-NYS (1/23) p.14 & p.17. :contentReference[oaicite:0]{index=0}
  
	// ---- MN setup (annual estimate)
	const MN_STD: any = {
	  single: 14950,
	  mfs: 14950,
	  mfj: 29900,
	  hoh: 22500,
	  qs: 29900,
	};
	const MN_BR_SINGLE = [
	  [32570, 0.0535],
	  [106990, 0.068],
	  [198630, 0.0785],
	  [Infinity, 0.0985],
	];
	const MN_BR_MFJ = [
	  [47620, 0.0535],
	  [189180, 0.068],
	  [330410, 0.0785],
	  [Infinity, 0.0985],
	];
	const MN_BR_MFS = [
	  [23810, 0.0535],
	  [94590, 0.068],
	  [165205, 0.0785],
	  [Infinity, 0.0985],
	];
	const MN_BR_HOH = [
	  [40100, 0.0535],
	  [161130, 0.068],
	  [264050, 0.0785],
	  [Infinity, 0.0985],
	];
  
	const progressiveTax = (taxable: any, brackets: any) => {
	  let tax = 0,
		prev = 0;
	  for (const [lim, rate] of brackets) {
		const top = Math.min(taxable, lim);
		if (top > prev) tax += (top - prev) * rate;
		if (taxable <= lim) break;
		prev = lim;
	  }
	  return tax;
	};
  
	const annual = payFrequency === "EVERY_YEAR" ? gross : gross * periods;
  
	// --- pick state config
	let stateIncomeTax = 0;
	if (state === "NY") {
	  if (
		method === "withholding" &&
		payFrequency === "EVERY_MONTH" &&
		filingStatus === "single"
	  ) {
		// Method II exact (Monthly, Single)
		const net = Math.max(0, gross - NY_ALLOW_MONTHLY_SINGLE); // Table A
		const row: any =
		  NY_MII_MONTHLY_SINGLE.find(([min, max]) => net >= min && net < max) ||
		  NY_MII_MONTHLY_SINGLE.at(-1);
		const [, , sub, rate, add] = row;
		stateIncomeTax = round((net - sub) * rate + add); // Table II-D math
	  } else {
		// annual estimate (other frequencies/statuses stay with bracket estimate)
		const std = NY_STD[filingStatus] ?? NY_STD.single;
		const annualTax = progressiveTax(
		  Math.max(0, annual - std),
		  filingStatus === "mfj" || filingStatus === "qs"
			? NY_BR_SINGLE /*placeholder*/
			: NY_BR_SINGLE,
		);
		const weeksInPeriod: number = (
		  {
			EVERY_WEEK: 1,
			EVERY_BIWEEK: 2,
			EVERY_SEMIMONTH: 52 / 24,
			EVERY_MONTH: 52 / 12,
			EVERY_YEAR: 52,
		  } as const
		)[payFrequency];
	  }
	} else if (state === "MN") {
	  const std: any = MN_STD[filingStatus] ?? MN_STD.single;
	  const br =
		filingStatus === "mfj" || filingStatus === "qs"
		  ? MN_BR_MFJ
		  : filingStatus === "mfs"
			? MN_BR_MFS
			: filingStatus === "hoh"
			  ? MN_BR_HOH
			  : MN_BR_SINGLE;
	  const annualTax = progressiveTax(Math.max(0, annual - std), br);
	  stateIncomeTax = round(
		annualTax / (payFrequency === "EVERY_YEAR" ? 1 : periods),
	  );
	} else {
	  console.log(state);
  
	  throw new Error("state must be 'NY'|'NYC' or 'MN'");
	}
  
	// ---- SDI & FLI
	let sdi = 0,
	  fli = 0;
	const weeksInPeriod: any = {
	  EVERY_WEEK: 1,
	  EVERY_BIWEEK: 2,
	  EVERY_SEMIMONTH: 52 / 24,
	  EVERY_MONTH: 52 / 12,
	  EVERY_YEAR: 52,
	}[payFrequency];
	if (state === "NY") {
	  sdi = round(Math.min(gross * 0.005, 0.6 * weeksInPeriod)); // NY SDI cap per week
	  const remaining = Math.max(0, 354.53 - (pflYTD || 0)); // 2025 PFL cap
	  fli = round(Math.min(gross * 0.00388, remaining));
	}
	console.log({ stateIncomeTax, sdi, fli, d: 12121 });
	return { nyStateTax: stateIncomeTax, sdi, fli };
  }
  
  export function calculateNYSUI(
	annualWage: number,
	employerRate = 0.041, // 4.1% default
	taxableWageBase = 12500,
  ) {
	const taxableIncome = Math.min(annualWage, taxableWageBase);
	const suiTax = taxableIncome * employerRate;
  
	return {
	  taxableIncome,
  
	  employerRate: (employerRate * 100).toFixed(2) + "%",
	  suiTax: suiTax.toFixed(2),
	};
  }
  
  // Types
  type PayPeriod = {
	no: string;
	payDate: string;
	periodRange: string;
  };
  
  type PaySchedule = {
	pay_frequency: "EVERY_MONTH" | "EVERY_WEEK" | "EVERY_YEAR";
	first_payday?: string | null;
	first_day?: string | null;
	first_month?: "SAME" | "PREVIOUS" | "NEXT";
	next_pay_date: string;
	end_of_next_pay_period: string;
  };
  
  // Helper Functions
  const parseDate = (dateString: string): Date | null => {
	const date = new Date(dateString);
	return isNaN(date.getTime()) ? null : date;
  };
  
  const formatShortDate = (date: Date): string => {
	return date.toLocaleDateString("en-US", {
	  month: "2-digit",
	  day: "2-digit",
	  year: "2-digit",
	});
  };
  
  const formatDateRange = (start: Date, end: Date): string => {
	return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  };
  
  const addDays = (date: Date, days: number): Date => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
  };
  
  const getDayFromString = (dayStr: string | null): number => {
	if (!dayStr) return 1;
	if (dayStr === "END_OF_MONTH") return -1;
	const match = dayStr.match(/\d+/);
	return match ? parseInt(match[0], 10) : 1;
  };
  
  const getLastDayOfMonth = (
	baseDate: Date,
	offset: number,
	relativeTo: "SAME" | "PREVIOUS" | "NEXT" = "SAME",
  ): Date => {
	let year = baseDate.getFullYear();
	let month = baseDate.getMonth();
  
	if (relativeTo === "PREVIOUS") month -= 1;
	else if (relativeTo === "NEXT") month += 1;
  
	const targetMonth = new Date(year, month + offset + 1, 0); // Last day
	return targetMonth;
  };
  
  const getDateForMonthDay = (
	day: number,
	baseDate: Date,
	offset: number,
	relativeTo: "SAME" | "PREVIOUS" | "NEXT" = "SAME",
  ): Date => {
	let year = baseDate.getFullYear();
	let month = baseDate.getMonth();
  
	if (relativeTo === "PREVIOUS") month -= 1;
	else if (relativeTo === "NEXT") month += 1;
  
	const date = new Date(year, month + offset, day);
	// Handle invalid dates (e.g., Feb 30)
	if (date.getDate() !== day) {
	  return new Date(year, month + offset + 1, 0); // Last day of month
	}
	return date;
  };
  
  // Main Function
  export const calculateUpcomingPayPeriodsRange = (
	schedule: PaySchedule,
  ): PayPeriod[] => {
	const periods: PayPeriod[] = [];
  
	const nextPayDateObj = parseDate(schedule.next_pay_date);
	const endDateObj = parseDate(schedule.end_of_next_pay_period);
  
	if (!nextPayDateObj || !endDateObj) {
	  console.error("Invalid dates in schedule");
	  return [];
	}
  
	// Gap between period end and payday (e.g., paid 2 days after period ends)
	const dayGap = Math.round(
	  (nextPayDateObj.getTime() - endDateObj.getTime()) / (1000 * 60 * 60 * 24),
	);
  
	const now = new Date(); // Use as base for month/year calculations
  
	switch (schedule.pay_frequency) {
	  case "EVERY_MONTH": {
		const payDayStr = schedule.first_payday || "1";
		const endDayStr = schedule.first_day || schedule.first_payday || "1";
		const relativeMonth: "SAME" | "PREVIOUS" | "NEXT" =
		  schedule.first_month || "SAME";
  
		const payDayNum = getDayFromString(payDayStr);
		const endDayNum = getDayFromString(endDayStr);
  
		for (let i = 0; i < 4; i++) {
		  // Pay Date
		  let payDate: Date;
		  if (payDayNum === -1) {
			payDate = getLastDayOfMonth(now, i);
		  } else {
			payDate = getDateForMonthDay(payDayNum, now, i);
		  }
  
		  // Period End Date
		  let periodEndDate: Date;
		  if (endDayNum === -1) {
			periodEndDate = getLastDayOfMonth(now, i, relativeMonth);
		  } else {
			periodEndDate = getDateForMonthDay(endDayNum, now, i, relativeMonth);
		  }
  
		  // Period Start Date
		  let periodStartDate: Date;
		  if (i === 0) {
			// First period: day after previous period ended
			const prevEnd =
			  endDayNum === -1
				? getLastDayOfMonth(now, -1, relativeMonth)
				: getDateForMonthDay(endDayNum, now, -1, relativeMonth);
			periodStartDate = addDays(prevEnd, 1);
		  } else {
			// Subsequent: day after last period ended
			const prevEnd =
			  endDayNum === -1
				? getLastDayOfMonth(now, i - 1, relativeMonth)
				: getDateForMonthDay(endDayNum, now, i - 1, relativeMonth);
			periodStartDate = addDays(prevEnd, 1);
		  }
  
		  periods.push({
			no: (i + 1).toString().padStart(2, "0"),
			payDate: formatShortDate(payDate),
			periodRange: formatDateRange(periodStartDate, periodEndDate),
		  });
		}
		break;
	  }
  
	  case "EVERY_WEEK": {
		// First period
		const startDate = addDays(endDateObj, -6); // 7-day week
  
		periods.push({
		  no: "01",
		  payDate: formatShortDate(nextPayDateObj),
		  periodRange: formatDateRange(startDate, endDateObj),
		});
  
		// Next 3 periods
		let currentEndDate = new Date(endDateObj);
		let currentPayDate = new Date(nextPayDateObj);
  
		for (let i = 1; i < 4; i++) {
		  const nextStartDate = addDays(currentEndDate, 1);
		  const nextEndDate = addDays(nextStartDate, 6);
		  const nextPayDate = addDays(nextEndDate, dayGap);
  
		  periods.push({
			no: (i + 1).toString().padStart(2, "0"),
			payDate: formatShortDate(nextPayDate),
			periodRange: formatDateRange(nextStartDate, nextEndDate),
		  });
  
		  currentEndDate = nextEndDate;
		  currentPayDate = nextPayDate;
		}
		break;
	  }
  
	  case "EVERY_YEAR": {
		// Yearly: one period per year, e.g., bonus on Dec 15
		const startDate = addDays(endDateObj, -364); // ~1 year (non-leap)
  
		periods.push({
		  no: "01",
		  payDate: formatShortDate(nextPayDateObj),
		  periodRange: formatDateRange(startDate, endDateObj),
		});
  
		let currentEndDate = new Date(endDateObj);
		let currentPayDate = new Date(nextPayDateObj);
  
		for (let i = 1; i < 4; i++) {
		  // Add ~365 days
		  const nextEndDate = addDays(currentEndDate, 365);
		  const nextStartDate = addDays(currentEndDate, 1);
		  const nextPayDate = addDays(nextEndDate, dayGap);
  
		  // Handle leap years (optional: add logic if needed)
		  periods.push({
			no: (i + 1).toString().padStart(2, "0"),
			payDate: formatShortDate(nextPayDate),
			periodRange: formatDateRange(nextStartDate, nextEndDate),
		  });
  
		  currentEndDate = nextEndDate;
		  currentPayDate = nextPayDate;
		}
		break;
	  }
  
	  default:
		console.warn("Unsupported pay frequency:", schedule.pay_frequency);
		return [];
	}
  
	return periods;
  };
  