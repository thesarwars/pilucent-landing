import { getTaxConfig } from "@/app/helpers/backend";

/* =========================================================
   2026 TAX CONFIGURATION
========================================================= */

/** IRS Pub. 15-T Worksheet 1A row (annualized percentage method). */
type Pub15TRow = {
	atLeast: number;
	lessThan: number;
	subtract: number;
	rate: number;
	baseTax: number;
};

/** IRS SSA: OASDI taxable maximum for calendar year 2026 */
export const SOCIAL_SECURITY_WAGE_BASE_2026 = 184_500;

/** Minnesota Paid Family & Medical Leave: 0.44% of gross wages (2026). */
export const MN_PAID_LEAVE_RATE = 0.0044;

/** Minnesota 2026 UI taxable-wage base. */
export const MN_UI_WAGE_BASE_2026 = 44_000;

/**
 * Minnesota 2026 UI base tax rate (0.44%) — the QBO-matching default used by
 * the JS reference calculator's MN sample (`mnUiRate = 0.44`). This is the
 * system default FALLBACK; the employer's actual MN Tax Rate Determination
 * notice (which can vary materially by experience rating / NAICS, e.g. 1.08%
 * for Professional, Scientific, and Technical Services) should always override
 * this default at the call site. Keep this in sync with
 * `taxConfig.MN.json` → `uiBaseTaxRate` / `uiDefaultRate`.
 */
export const MN_UI_BASE_TAX_RATE_2026 = 0.0044;

/** Minnesota 2026 UI Additional Assessment rate (14% of UI Employer tax). */
export const MN_UI_ADDITIONAL_ASSESSMENT_RATE_2026 = 0.14;

/** Minnesota 2026 UI Federal Loan Interest Assessment rate (currently 0%). */
export const MN_UI_FEDERAL_LOAN_INTEREST_RATE_2026 = 0;

/** Minnesota 2026 Workforce Development Fee rate (0.10%). */
export const MN_UI_WORKFORCE_DEVELOPMENT_FEE_RATE_2026 = 0.001;

/* =========================================================
   NEW YORK 2026 UNEMPLOYMENT INSURANCE CONSTANTS
   Per Balanzify Payroll Tax Calculation & Compliance Update
   2026 (NY DOL): UI taxable wage base is $17,600. UI is
   employer-only at an employer-assigned rate (range 1.625% –
   9.425%; new-employer default 4.025%). The Re-employment
   Service Fund (RSF) is a SEPARATE 0.075% employer line and
   must NOT be blended into the UI rate.
========================================================= */

/** NY 2026 UI taxable wage base. */
export const NY_UI_WAGE_BASE_2026 = 17_600;

/** NY 2026 new-employer UI contribution rate (excludes RSF). */
export const NY_UI_NEW_EMPLOYER_RATE_2026 = 0.04025;

/** NY 2026 lowest published UI contribution rate (excludes RSF). */
export const NY_UI_LOWEST_RATE_2026 = 0.01625;

/** NY 2026 highest published UI contribution rate (excludes RSF). */
export const NY_UI_HIGHEST_RATE_2026 = 0.09425;

/**
 * NY 2026 default UI contribution rate used when the employer has not
 * configured an experience-rated value on their tax record. Matches the
 * QBO blended maximum (9.425% published max + 0.4% subsidiary effect)
 * surfaced by `loadQboNYMatch()` in `payroll-calculator.js`, so the
 * employer-tax screens line up with QuickBooks Online by default
 * (17,600 × 9.825% = $1,729.20). It also matches the upper bound of the
 * UITable validation (`StateTaxTables/UITable.tsx`), so a saved rate
 * value is always within the accepted range.
 */
export const NY_UI_DEFAULT_RATE_2026 = 0.09825;

/** NY 2026 Re-employment Service Fund rate — calculated separately. */
export const NY_RSF_RATE_2026 = 0.00075;

/**
 * The last-shipped hard-coded 2026 tables. This is the offline / first-paint /
 * SSR net: `CONFIG` starts here and payroll still runs on these if the backend
 * fetch fails. Do NOT read `FALLBACK_CONFIG` directly in calculators — always
 * read the live `CONFIG` below, which `loadTaxConfig()` replaces at bootstrap.
 */
const FALLBACK_CONFIG = {
	year: 2026,
	federal: {
		ssRate: 0.062,
		ssWageBase: SOCIAL_SECURITY_WAGE_BASE_2026,
		medicareRate: 0.0145,
		addMedicareRate: 0.009,
		addMedicareThreshold: 200_000,
		futaRate: 0.006,
		futaGrossRate: 0.06,
		futaDefaultCreditRate: 0.054,
		futaWageBase: 7_000,
		// 2026 IRS Publication 15-T standard deduction (used by annualized
		// helpers, kept for backward-compat with older callers).
		standardDeduction: { single: 16100, married: 32200, mfj: 32200, mfs: 16100, hoh: 24150 } as Record<string, number>,
		// Annual tax-return brackets (kept for legacy callers / annual logic).
		// IMPORTANT: NOT used for live payroll withholding — see
		// `percentageMethodTables` below for the IRS Pub. 15-T (2026)
		// Worksheet 1A annualized thresholds that drive `pub15tFederalIncomeTax`.
		brackets: {
			single: [
				[0, 12400, 0.10], [12400, 50400, 0.12], [50400, 105700, 0.22], [105700, 201775, 0.24],
				[201775, 256225, 0.32], [256225, 640600, 0.35], [640600, Infinity, 0.37],
			],
			mfs: [
				[0, 12400, 0.10], [12400, 50400, 0.12], [50400, 105700, 0.22], [105700, 201775, 0.24],
				[201775, 256225, 0.32], [256225, 384350, 0.35], [384350, Infinity, 0.37],
			],
			married: [
				[0, 24800, 0.10], [24800, 100800, 0.12], [100800, 211400, 0.22], [211400, 403550, 0.24],
				[403550, 512450, 0.32], [512450, 768700, 0.35], [768700, Infinity, 0.37],
			],
			mfj: [
				[0, 24800, 0.10], [24800, 100800, 0.12], [100800, 211400, 0.22], [211400, 403550, 0.24],
				[403550, 512450, 0.32], [512450, 768700, 0.35], [768700, Infinity, 0.37],
			],
			hoh: [
				[0, 17700, 0.10], [17700, 67450, 0.12], [67450, 105700, 0.22], [105700, 201775, 0.24],
				[201775, 256200, 0.32], [256200, 640600, 0.35], [640600, Infinity, 0.37],
			],
		} as Record<string, number[][]>,
		supplementalRate: 0.22,
		// Federal supplemental wage rate for separately identified wages
		// over $1,000,000 YTD (IRS Pub. 15 / Pub. 15-T 2026).
		highSupplementalRate: 0.37,
		highSupplementalThreshold: 1_000_000,
		// IRS Publication 15-T (2026), Worksheet 1A — automated percentage
		// method tables. `standard` is used when Form W-4 Step 2 is
		// unchecked; `step2` is used when Step 2(c) is checked (or two
		// jobs / spouse works adjustment is requested).
		percentageMethodTables: {
			standard: {
				married: [
					{ atLeast: 0,      lessThan: 19300,    subtract: 0,      rate: 0,    baseTax: 0 },
					{ atLeast: 19300,  lessThan: 44100,    subtract: 19300,  rate: 0.10, baseTax: 0 },
					{ atLeast: 44100,  lessThan: 120100,   subtract: 44100,  rate: 0.12, baseTax: 2480 },
					{ atLeast: 120100, lessThan: 230700,   subtract: 120100, rate: 0.22, baseTax: 11600 },
					{ atLeast: 230700, lessThan: 422850,   subtract: 230700, rate: 0.24, baseTax: 35932 },
					{ atLeast: 422850, lessThan: 531750,   subtract: 422850, rate: 0.32, baseTax: 82048 },
					{ atLeast: 531750, lessThan: 788000,   subtract: 531750, rate: 0.35, baseTax: 116896 },
					{ atLeast: 788000, lessThan: Infinity, subtract: 788000, rate: 0.37, baseTax: 206583.50 },
				],
				single: [
					{ atLeast: 0,      lessThan: 7500,     subtract: 0,      rate: 0,    baseTax: 0 },
					{ atLeast: 7500,   lessThan: 19900,    subtract: 7500,   rate: 0.10, baseTax: 0 },
					{ atLeast: 19900,  lessThan: 57900,    subtract: 19900,  rate: 0.12, baseTax: 1240 },
					{ atLeast: 57900,  lessThan: 113200,   subtract: 57900,  rate: 0.22, baseTax: 5800 },
					{ atLeast: 113200, lessThan: 209275,   subtract: 113200, rate: 0.24, baseTax: 17966 },
					{ atLeast: 209275, lessThan: 263725,   subtract: 209275, rate: 0.32, baseTax: 41024 },
					{ atLeast: 263725, lessThan: 648100,   subtract: 263725, rate: 0.35, baseTax: 58448 },
					{ atLeast: 648100, lessThan: Infinity, subtract: 648100, rate: 0.37, baseTax: 192979.25 },
				],
				hoh: [
					{ atLeast: 0,      lessThan: 15550,    subtract: 0,      rate: 0,    baseTax: 0 },
					{ atLeast: 15550,  lessThan: 33250,    subtract: 15550,  rate: 0.10, baseTax: 0 },
					{ atLeast: 33250,  lessThan: 83000,    subtract: 33250,  rate: 0.12, baseTax: 1770 },
					{ atLeast: 83000,  lessThan: 121250,   subtract: 83000,  rate: 0.22, baseTax: 7740 },
					{ atLeast: 121250, lessThan: 217300,   subtract: 121250, rate: 0.24, baseTax: 16155 },
					{ atLeast: 217300, lessThan: 271750,   subtract: 217300, rate: 0.32, baseTax: 39207 },
					{ atLeast: 271750, lessThan: 656150,   subtract: 271750, rate: 0.35, baseTax: 56631 },
					{ atLeast: 656150, lessThan: Infinity, subtract: 656150, rate: 0.37, baseTax: 191171 },
				],
			} as Record<string, Pub15TRow[]>,
			step2: {
				married: [
					{ atLeast: 0,      lessThan: 16100,    subtract: 0,      rate: 0,    baseTax: 0 },
					{ atLeast: 16100,  lessThan: 28500,    subtract: 16100,  rate: 0.10, baseTax: 0 },
					{ atLeast: 28500,  lessThan: 66500,    subtract: 28500,  rate: 0.12, baseTax: 1240 },
					{ atLeast: 66500,  lessThan: 121800,   subtract: 66500,  rate: 0.22, baseTax: 5800 },
					{ atLeast: 121800, lessThan: 217875,   subtract: 121800, rate: 0.24, baseTax: 17966 },
					{ atLeast: 217875, lessThan: 272325,   subtract: 217875, rate: 0.32, baseTax: 41024 },
					{ atLeast: 272325, lessThan: 400450,   subtract: 272325, rate: 0.35, baseTax: 58448 },
					{ atLeast: 400450, lessThan: Infinity, subtract: 400450, rate: 0.37, baseTax: 103291.75 },
				],
				single: [
					{ atLeast: 0,      lessThan: 8050,     subtract: 0,      rate: 0,    baseTax: 0 },
					{ atLeast: 8050,   lessThan: 14250,    subtract: 8050,   rate: 0.10, baseTax: 0 },
					{ atLeast: 14250,  lessThan: 33250,    subtract: 14250,  rate: 0.12, baseTax: 620 },
					{ atLeast: 33250,  lessThan: 60900,    subtract: 33250,  rate: 0.22, baseTax: 2900 },
					{ atLeast: 60900,  lessThan: 108938,   subtract: 60900,  rate: 0.24, baseTax: 8983 },
					{ atLeast: 108938, lessThan: 136163,   subtract: 108938, rate: 0.32, baseTax: 20512 },
					{ atLeast: 136163, lessThan: 328350,   subtract: 136163, rate: 0.35, baseTax: 29224 },
					{ atLeast: 328350, lessThan: Infinity, subtract: 328350, rate: 0.37, baseTax: 96489.63 },
				],
				hoh: [
					{ atLeast: 0,      lessThan: 12075,    subtract: 0,      rate: 0,    baseTax: 0 },
					{ atLeast: 12075,  lessThan: 20925,    subtract: 12075,  rate: 0.10, baseTax: 0 },
					{ atLeast: 20925,  lessThan: 45800,    subtract: 20925,  rate: 0.12, baseTax: 885 },
					{ atLeast: 45800,  lessThan: 64925,    subtract: 45800,  rate: 0.22, baseTax: 3870 },
					{ atLeast: 64925,  lessThan: 112950,   subtract: 64925,  rate: 0.24, baseTax: 8077.50 },
					{ atLeast: 112950, lessThan: 140175,   subtract: 112950, rate: 0.32, baseTax: 19603.50 },
					{ atLeast: 140175, lessThan: 332375,   subtract: 140175, rate: 0.35, baseTax: 28315.50 },
					{ atLeast: 332375, lessThan: Infinity, subtract: 332375, rate: 0.37, baseTax: 95585.50 },
				],
			} as Record<string, Pub15TRow[]>,
		},
		// Pub. 15-T Step 4(b) annual auto-adjustment applied when Form W-4
		// Step 2 is UNCHECKED (subtracted from annualized wages).
		step4bAdjustmentWhenStep2Unchecked: {
			married: 12900,
			single: 8600,
			hoh: 8600,
			mfj: 12900,
			mfs: 8600,
		} as Record<string, number>,
	},
	mn: {
		standardDeduction: { single: 15300, married: 30600, mfj: 30600, mfs: 15300, hoh: 23000 } as Record<string, number>,
		allowanceValue: 5300,
		supplementalRate: 0.0625,
		paidLeaveWageBase: SOCIAL_SECURITY_WAGE_BASE_2026,
		paidLeaveEmployeeRate: MN_PAID_LEAVE_RATE,
		paidLeaveEmployerStandardRate: MN_PAID_LEAVE_RATE,
		paidLeaveEmployerSmallRate: 0.0022,
		uiWageBase: MN_UI_WAGE_BASE_2026,
		// Default UI Tax Rate (from MN Tax Rate Determination). Does NOT
		// include the 14% Additional Assessment.
		uiBaseTaxRate: MN_UI_BASE_TAX_RATE_2026,
		uiAdditionalAssessmentRate: MN_UI_ADDITIONAL_ASSESSMENT_RATE_2026,
		uiFederalLoanInterestAssessmentRate: MN_UI_FEDERAL_LOAN_INTEREST_RATE_2026,
		uiWorkforceDevelopmentFeeRate: MN_UI_WORKFORCE_DEVELOPMENT_FEE_RATE_2026,
		// Legacy alias kept for back-compat in older callers.
		uiDefaultRate: MN_UI_BASE_TAX_RATE_2026,
		// MN 2026 income-tax brackets per MN DOR. MFS uses half-of-MFJ
		// thresholds (24,350 / 96,740 / 168,965), not the Single schedule,
		// per the 2026 Federal+MN Payroll Tax Guide (Appendix A2).
		brackets: {
			single: [[0, 33310, 0.0535], [33310, 109430, 0.068], [109430, 203150, 0.0785], [203150, Infinity, 0.0985]],
			married: [[0, 48700, 0.0535], [48700, 193480, 0.068], [193480, 337930, 0.0785], [337930, Infinity, 0.0985]],
			mfj: [[0, 48700, 0.0535], [48700, 193480, 0.068], [193480, 337930, 0.0785], [337930, Infinity, 0.0985]],
			mfs: [[0, 24350, 0.0535], [24350, 96740, 0.068], [96740, 168965, 0.0785], [168965, Infinity, 0.0985]],
			hoh: [[0, 41010, 0.0535], [41010, 164800, 0.068], [164800, 270060, 0.0785], [270060, Infinity, 0.0985]],
		} as Record<string, number[][]>,
	},
	ny: {
		// NYS-50-T-NYS Method II annual rate schedules (after deduction + exemptions)
		exemptionBase: { single: 7400, married: 7950, mfj: 7950, mfs: 7400, hoh: 7400 } as Record<string, number>,
		exemptionPerAllowance: 1000,
		stateSupplementalRate: 0.117,
		uiWageBase: NY_UI_WAGE_BASE_2026,
		// NY UI 2026 default rate. Defaults to the QBO blended max (9.825%)
		// so the saved-payroll screens match QuickBooks Online out-of-the
		// box; call sites should pass the employer's NY DOL rate-notice
		// value (or saved `ui_rate` on the tax record) when available.
		uiDefaultRate: NY_UI_DEFAULT_RATE_2026,
		uiNewEmployerRate: NY_UI_NEW_EMPLOYER_RATE_2026,
		uiLowestRate: NY_UI_LOWEST_RATE_2026,
		uiHighestRate: NY_UI_HIGHEST_RATE_2026,
		// NY Re-employment Service Fund — separate from UI per NYS-45.
		rsfRate: NY_RSF_RATE_2026,
		pflRate: 0.00432,
		pflAnnualCap: 411.91,
		dblWeeklyCap: 0.60,
		dblRate: 0.005,
		nysAnnualMethodII: {
			single: [
				[0, 8500, 0, 0.039, 0], [8500, 11700, 8500, 0.044, 332], [11700, 13900, 11700, 0.0515, 472],
				[13900, 80650, 13900, 0.054, 586], [80650, 96800, 80650, 0.059, 4190], [96800, 107650, 96800, 0.0703, 5143],
				[107650, 157650, 107650, 0.0753, 5906], [157650, 215400, 157650, 0.064, 9673], [215400, 265400, 215400, 0.1144, 13369],
				[265400, 1077550, 265400, 0.0735, 19091],
			],
			married: [
				[0, 8500, 0, 0.039, 0], [8500, 11700, 8500, 0.044, 332], [11700, 13900, 11700, 0.0515, 472],
				[13900, 80650, 13900, 0.054, 586], [80650, 96800, 80650, 0.059, 4190], [96800, 107650, 96800, 0.0657, 5143],
				[107650, 157650, 107650, 0.0707, 5855], [157650, 211550, 157650, 0.0801, 9388], [211550, 323200, 211550, 0.064, 13708],
				[323200, 373200, 323200, 0.1349, 20854], [373200, 1077550, 373200, 0.0735, 27600], [1077550, 2155350, 1077550, 0.0765, 79369],
			],
		} as Record<string, number[][]>,
		nycExemptionBase: { single: 5000, married: 5500, mfj: 5500, mfs: 5000, hoh: 5000 } as Record<string, number>,
		nycExemptionPerAllowance: 1000,
		nycSupplementalRate: 0.0425,
		nycAnnualMethodII: {
			single: [[0, 8000, 0, 0.0205, 0], [8000, 8700, 8000, 0.028, 164], [8700, 15000, 8700, 0.0325, 184], [15000, 25000, 15000, 0.0395, 388], [25000, 60000, 25000, 0.0415, 783], [60000, Infinity, 60000, 0.0425, 2236]],
			married: [[0, 8000, 0, 0.0205, 0], [8000, 8700, 8000, 0.028, 164], [8700, 15000, 8700, 0.0325, 184], [15000, 25000, 15000, 0.0395, 388], [25000, 60000, 25000, 0.0415, 783], [60000, Infinity, 60000, 0.0425, 2236]],
		} as Record<string, number[][]>,
		mctmtThreshold: 312_500,
		mctmtRates: {
			zone1: [[0, 375000, 0.00055], [375000, 437500, 0.00115], [437500, 2500000, 0.006], [2500000, Infinity, 0.00895]],
			zone2: [[0, 375000, 0.00055], [375000, 437500, 0.00115], [437500, 2500000, 0.0034], [2500000, Infinity, 0.00635]],
		} as Record<string, number[][]>,
	},
};

/**
 * The LIVE tax configuration read by every calculator (`CONFIG.federal.…`,
 * `CONFIG[state].…`). Starts on the bundled fallback and is REPLACED in place
 * by `loadTaxConfig()` once the backend fetch resolves — function names and
 * signatures never change, so nothing breaks before the fetch (first paint,
 * SSR, offline). Because the calculators close over this module variable and
 * read it at call time, reassigning it is immediately visible to all of them.
 */
let CONFIG: any = FALLBACK_CONFIG;

/* =========================================================
   SERVER-DRIVEN TAX CONFIG (2026+) — fetch, rehydrate, replace
   See PAYROLL_TAX_CONFIG_FRONTEND.md §2–§4.
========================================================= */

/**
 * Rehydrate `null → Infinity` on OBJECT rows (`percentageMethodTables.*`), which
 * carry the open-ended upper bound on the named `lessThan` key. JSON has no
 * `Infinity`, so the server stores those open bounds as `null`. Walk the whole
 * tree; only a `lessThan === null` is revived.
 */
function reviveInfinity(node: any): any {
	if (Array.isArray(node)) return node.map(reviveInfinity);
	if (node && typeof node === "object") {
		const out: any = {};
		for (const key of Object.keys(node)) {
			if (key === "lessThan" && node[key] === null) out[key] = Infinity;
			else out[key] = reviveInfinity(node[key]);
		}
		return out;
	}
	return node;
}

/** Tuple-row tables whose open-ended upper bound lives at POSITIONAL index 1. */
const TUPLE_UPPER_KEYS = new Set([
	"brackets",
	"nysAnnualMethodII",
	"nycAnnualMethodII",
	"mctmtRates",
]);

/** Map each tuple row: `row[1] === null → Infinity` (leaves every other cell). */
function fixTupleTable(table: any): any {
	if (!table || typeof table !== "object") return table;
	const out: any = {};
	for (const name of Object.keys(table)) {
		const rows = table[name];
		out[name] = Array.isArray(rows)
			? rows.map((row: any) =>
					Array.isArray(row)
						? row.map((v: any, i: number) => (i === 1 && v === null ? Infinity : v))
						: row,
				)
			: rows;
	}
	return out;
}

/**
 * Rehydrate `null → Infinity` on TUPLE rows (`brackets`, `nysAnnualMethodII`,
 * `nycAnnualMethodII`, `mctmtRates`) — the positional upper bound at index 1.
 * Applied in addition to `reviveInfinity`; never substitute a big sentinel
 * number, `progressiveTax()` special-cases `Infinity` (see spec §3).
 */
function reviveTupleUppers(node: any): any {
	if (Array.isArray(node)) return node.map(reviveTupleUppers);
	if (node && typeof node === "object") {
		const out: any = {};
		for (const key of Object.keys(node)) {
			if (TUPLE_UPPER_KEYS.has(key)) out[key] = fixTupleTable(node[key]);
			else out[key] = reviveTupleUppers(node[key]);
		}
		return out;
	}
	return node;
}

/** Result of a `loadTaxConfig()` call — pin `versions` onto the saved run for audit. */
export type LoadTaxConfigResult = {
	/** Requested jurisdictions with no PUBLISHED row for the year — cannot compute their withholding. */
	unavailable: string[];
	/** Per-jurisdiction version map (`{ FEDERAL: 3, NY: 2 }`) — cache-bust key + audit trail. */
	versions: Record<string, number>;
	/** True when server tables replaced the fallback; false means still on FALLBACK_CONFIG. */
	loaded: boolean;
};

/**
 * Fetch the statutory tax tables for `year` + the run's `states` from the
 * backend, rehydrate `null → Infinity`, and REPLACE the live `CONFIG`. Call
 * once at payroll bootstrap, BEFORE the first calculation.
 *
 * Federal always comes back; only the requested states are included. On any
 * failure it keeps `FALLBACK_CONFIG` so payroll still runs on the last-shipped
 * tables. Resolve `year` from the PAY DATE (not "today") so recomputing an old
 * run reproduces with the tables in force then.
 */
export async function loadTaxConfig(
	year: number,
	states: string[] = [],
): Promise<LoadTaxConfigResult> {
	try {
		const res: any = await getTaxConfig(year, states);
		if (res?.success && res?.data) {
			const revived: any = reviveTupleUppers(reviveInfinity(res.data)) || {};
			// MERGE over the bundled fallback — never wholesale-replace. The server
			// only returns federal + the requested states, so states we didn't ask
			// for (and a malformed/partial payload) must keep their fallback tables.
			// This is also the crash guard: `CONFIG.federal.percentageMethodTables`
			// must always resolve, so federal falls back if the payload omits it or
			// sends a broken block.
			const merged: any = { ...FALLBACK_CONFIG };
			for (const key of Object.keys(revived)) {
				const val = revived[key];
				// Only take NON-EMPTY jurisdiction objects / scalar `year`. Ignore
				// null/undefined/`{}`/arrays so a stub payload (e.g. `{ ny: {} }`
				// from a half-built backend) can't clobber a working fallback block.
				if (val && typeof val === "object" && !Array.isArray(val)) {
					if (Object.keys(val).length > 0) merged[key] = val;
				} else if (val !== null && val !== undefined) {
					merged[key] = val;
				}
			}
			if (!merged.federal || !merged.federal.percentageMethodTables) {
				merged.federal = FALLBACK_CONFIG.federal;
			}
			CONFIG = merged;
			// A jurisdiction is only TRULY unavailable if we have no usable tables
			// for it AFTER the merge. FEDERAL / NY / MN always resolve from the
			// bundled fallback, so they compute even when the backend hasn't
			// published their row yet — drop them from the user-facing warning.
			// Only states with no tables anywhere (e.g. NJ, PA, CA) stay.
			const rawUnavailable = Array.isArray(res.unavailable) ? res.unavailable : [];
			const trulyUnavailable = rawUnavailable.filter(
				(j: any) => !merged[String(j || "").toLowerCase()],
			);
			return {
				unavailable: trulyUnavailable,
				versions: res.versions ?? {},
				loaded: true,
			};
		}
	} catch {
		/* keep FALLBACK_CONFIG — payroll still runs on last-shipped tables */
	}
	return { unavailable: [], versions: {}, loaded: false };
}

/** Read-only access to the live config (e.g. to inspect which states are loaded). */
export function getActiveTaxConfig(): any {
	return CONFIG;
}

/**
 * Distinct tax/work-location states for a set of employee records, upper-cased.
 * Feed this to `loadTaxConfig(payDateYear, states)` — one request per run, not
 * per employee. Reads the tax record's `state` (the payroll state of record).
 */
export function collectRunStates(employees: any[]): string[] {
	if (!Array.isArray(employees)) return [];
	return [
		...new Set(
			employees
				.map((e) => getTaxRecord(e?.taxes)?.state ?? e?.taxes?.state)
				.map((s: any) => String(s || "").trim().toUpperCase())
				.filter(Boolean),
		),
	];
}

/**
 * A deduction definition is pre-tax when EITHER the explicit tax option /
 * tax type says so ("PRETAX" / "Pre-tax"), OR the sub_type carries the
 * pre-tax marker — HSA plans come from the backend with an empty tax_type
 * and encode taxability in sub_type instead: "pretaxHSA" vs "taxableHSA".
 * Values are trimmed and case-insensitive (the backend sends e.g.
 * "pretaxHSA " with a trailing space).
 */
export function isPreTaxDeduction(def: any): boolean {
	if (!def || typeof def !== "object") return false;
	const norm = (v: any) => String(v || "").replace(/[\s_-]/g, "").toLowerCase();
	if (norm(def.tax_option) === "pretax" || norm(def.tax_type) === "pretax") return true;
	return norm(def.sub_type).startsWith("pretax");
}

/**
 * Sum of the employee's Section 125 (pre-tax) deductions per paycheck —
 * health, dental, vision, HSA, etc. (see `isPreTaxDeduction` for how a
 * deduction qualifies). Subtract this from gross to get the FICA /
 * income-tax wage base (the EMPLOYEE deduction reduces taxable wages;
 * company contributions never come out of the employee's gross).
 * Paid-leave premiums (e.g. MN Paid Leave) stay on FULL gross.
 */
export function collectPreTaxDeductionPerPaycheck(allinfo: any): number {
	const items = allinfo?.deduction_contributions;
	if (!Array.isArray(items)) return 0;
	return items.reduce((sum: number, item: any) => {
		if (!isPreTaxDeduction(item?.deduction_and_contribution)) return sum;
		const amt = Number(item?.total_employee_deduction_per_pay_check);
		return sum + (Number.isFinite(amt) && amt > 0 ? amt : 0);
	}, 0);
}

/* =========================================================
   INTERNAL HELPERS
========================================================= */

const clamp = (x: number, min = 0, max = Infinity) =>
	Math.max(min, Math.min(max, x));

const round2 = (x: number) =>
	Math.round((Number.isFinite(x) ? x : 0) * 100) / 100;

/** Walk a [lower, upper, rate] bracket table progressively. */
function progressiveTax(
	taxable: number,
	brackets: number[][],
	scaleThresholds: number = 1,
): number {
	let tax = 0;
	const income = Math.max(0, taxable);
	for (const [lower, upper, rate] of brackets) {
		const lo = lower * scaleThresholds;
		const hi = upper === Infinity ? Infinity : upper * scaleThresholds;
		if (income > lo) tax += (Math.min(income, hi) - lo) * rate;
		if (income <= hi) break;
	}
	return tax;
}

/** NYS / NYC Method II table walker: [lower, upper, subtract, rate, add]. */
function tableTax(taxable: number, rows: number[][]): number {
	const income = Math.max(0, taxable);
	for (const [lower, upper, subtract, rate, add] of rows) {
		if (income >= lower && income < upper) return (income - subtract) * rate + add;
	}
	const last = rows[rows.length - 1];
	return (income - last[2]) * last[3] + last[4];
}

/** YTD-aware wage-base limiter. */
function ytdTaxable(current: number, ytdBefore: number, wageBase: number): number {
	const room = wageBase - Math.max(0, ytdBefore);
	return clamp(Math.min(current, room), 0, current);
}

/** Normalise a filing-status string to one of our internal keys. */
function normalizeFilingStatus(fs?: string): string {
	const s = (fs || "single").toLowerCase();
	if (s === "mfj" || s === "married") return "married";
	if (s === "mfs") return "mfs";
	if (s === "hoh") return "hoh";
	return "single";
}

export type FilingStatusKey = "single" | "married" | "hoh";
export type StateFilingStatusKey = "single" | "married" | "mfj" | "mfs" | "hoh";

/**
 * Map the API's W-4 `holding_status` code to the federal + state filing-status
 * keys used by the withholding helpers. Tolerant of misspellings present in
 * the form options and stored tax records:
 *   - `QUALIYING_WIDOW`   (instead of QUALIFYING_WIDOW)
 *   - `HEAD_OF_HOUSHOLD`  (instead of HEAD_OF_HOUSEHOLD)
 *   - `SEPARATLEY`        (instead of SEPARATELY)
 */
export function mapHoldingStatusToFilingStatus(holdingStatus?: string): {
	filingStatus: FilingStatusKey;
	stateFilingStatus: StateFilingStatusKey;
} {
	const s = String(holdingStatus || "").toUpperCase();
	// Match QUALIFYING_WIDOW and QUALIYING_WIDOW with one prefix.
	if (s.includes("MARRIED_FILING_JOINTLY") || s.includes("QUALI")) {
		return { filingStatus: "married", stateFilingStatus: "mfj" };
	}
	// Match HEAD_OF_HOUSEHOLD and HEAD_OF_HOUSHOLD.
	if (s.includes("HEAD_OF_HOUS")) {
		return { filingStatus: "hoh", stateFilingStatus: "hoh" };
	}
	// Match MARRIED_FILING_SEPARATELY and MARRIED_FILING_SEPARATLEY.
	if (s.includes("MARRIED_FILING_SEPARAT")) {
		return { filingStatus: "single", stateFilingStatus: "mfs" };
	}
	return { filingStatus: "single", stateFilingStatus: "single" };
}

/* =========================================================
   PAY-FREQUENCY HELPERS
========================================================= */

/** Convert a pay-frequency code into number of pay periods per year. */
function periodsFromFrequency(frequency?: string): number {
	switch (frequency) {
		case "EVERY_WEEK":
			return 52;
		case "EVERY_BIWEEK":
			return 26;
		case "EVERY_SEMIMONTH":
			return 24;
		case "EVERY_MONTH":
			return 12;
		case "EVERY_DAY":
			return 260;
		case "EVERY_YEAR":
			return 1;
		default:
			return 12;
	}
}

/** Convert a pay-frequency code into the number of weeks per period. */
function weeksFromFrequency(frequency?: string): number {
	switch (frequency) {
		case "EVERY_WEEK":
			return 1;
		case "EVERY_BIWEEK":
			return 2;
		case "EVERY_SEMIMONTH":
			return 52 / 24;
		case "EVERY_MONTH":
			return 52 / 12;
		case "EVERY_YEAR":
			return 52;
		case "EVERY_DAY":
			return 1 / 5;
		default:
			return 52 / 12;
	}
}

/* =========================================================
   PUBLIC: TAX-RECORD HELPERS (unchanged signatures)
========================================================= */

/**
 * Estimate Minnesota Paid Family & Medical Leave for a single pay-period
 * gross wage.
 */
export const estimate_mnPaidLeave = (gross: number) => {
	const g = Math.max(0, Number(gross) || 0);
	const estimatedTax = (g * MN_PAID_LEAVE_RATE).toFixed(2);
	return { estimatedTax };
};

/**
 * Normalise the `taxes` field which may be a plain object or an array.
 * Returns the first relevant tax record, or null.
 */
export const getTaxRecord = (taxes: any): any | null => {
	if (!taxes) return null;
	if (Array.isArray(taxes)) return taxes[0] ?? null;
	if (typeof taxes === "object") return taxes;
	return null;
};

/**
 * Returns true when the employee is in MN AND is NOT exempt from family
 * paid leave. Handles both array and plain-object formats for the `taxes`
 * field.
 */
export const isMnPaidLeaveApplicable = (taxes: any): boolean => {
	if (!taxes) return false;

	let stateTax: any = null;
	if (Array.isArray(taxes)) {
		stateTax = taxes.find(
			(t: any) => t?.is_the_state_other_income_tax === true,
		);
	} else if (typeof taxes === "object") {
		stateTax = taxes?.is_the_state_other_income_tax ? taxes : null;
	}

	if (!stateTax || stateTax.state !== "MN") return false;
	const exempt = stateTax.is_employee_exempt_from_family_paid_leave;
	return !(exempt === true || exempt === "true");
};

/* =========================================================
   PUBLIC: TAX-EXEMPTION HELPERS
========================================================= */

/**
 * Normalised per-employee tax exemptions. Each flag, when true, means the
 * corresponding tax must NOT be calculated or emitted as a payroll-component
 * line in the salary process.
 *
 * Sourced from the tax record's `exempt_fields` map — which carries both
 * human-readable keys ("FUTA", "NY SUI and Re-Employment", "NY PFL",
 * "NY SDI", "Social Security and Medicare") and snake_case aliases
 * (`ny_pfl_exempt`, `ny_dbl_exempt`) — plus the explicit federal/state
 * exemption booleans stored on the tax record itself.
 */
export type TaxExemptions = {
	/** Exempt from Federal Unemployment Tax (FUTA). */
	futa: boolean;
	/** Exempt from Social Security + Medicare (FICA), employee and employer. */
	socialSecurityMedicare: boolean;
	/** Exempt from state unemployment (NY SUI + Re-employment Service Fund / MN UI). */
	stateUnemployment: boolean;
	/** Exempt from NY Paid Family Leave (PFL). */
	nyPfl: boolean;
	/** Exempt from NY State Disability Insurance (SDI / DBL). */
	nySdi: boolean;
	/** Exempt from federal income-tax withholding. */
	federalIncomeTax: boolean;
	/** Exempt from state income-tax withholding. */
	stateIncomeTax: boolean;
};

/**
 * Read the per-employee tax exemptions from a `taxes` field (object or
 * array). Tolerant of the mixed key styles present in `exempt_fields`.
 */
export function getTaxExemptions(taxes: any): TaxExemptions {
	const rec = getTaxRecord(taxes);
	const ef = rec?.exempt_fields ?? {};
	const truthy = (v: any) => v === true || v === "true";
	const anyKey = (...keys: string[]) => keys.some((k) => truthy(ef?.[k]));

	return {
		futa: anyKey("FUTA", "futa", "futa_exempt"),
		socialSecurityMedicare: anyKey(
			"Social Security and Medicare",
			"social_security_and_medicare",
			"fica_exempt",
		),
		stateUnemployment: anyKey(
			"NY SUI and Re-Employment",
			"ny_sui_and_re_employment",
			"ny_sui_exempt",
			"sui_exempt",
		),
		nyPfl: anyKey("NY PFL", "ny_pfl", "ny_pfl_exempt"),
		nySdi: anyKey("NY SDI", "ny_sdi", "ny_sdi_exempt", "ny_dbl_exempt"),
		federalIncomeTax:
			truthy(rec?.is_employee_exempt_from_federal_tax) ||
			anyKey("Federal Income Tax", "federal_income_tax_exempt"),
		stateIncomeTax:
			truthy(rec?.is_the_employee_exempt_from_any_state_taxes) ||
			anyKey("State Income Tax", "state_income_tax_exempt"),
	};
}

/* =========================================================
   PUBLIC: YTD AGGREGATION FROM SAVED PAYROLL HISTORY
========================================================= */

/**
 * Year-to-date wage / tax buckets used by the wage-base-capped
 * calculations (Social Security, FUTA, MN UI, NY UI/RSF, Additional
 * Medicare $200k threshold, PFL annual cap).
 *
 * All values are calendar-YTD as of BEFORE the current pay period
 * being calculated. The current pay period should be ADDED on top.
 */
export type PayrollYtdBuckets = {
	gross: number;
	socialSecurityWages: number;
	medicareWages: number;
	additionalMedicareWages: number;
	futaWages: number;
	nyUiWages: number;
	mnUiWages: number;
	pflWithheld: number;
	mnPaidLeaveWages: number;
	federalIncomeTax: number;
	socialSecurityTax: number;
	medicareTax: number;
	additionalMedicareTax: number;
	supplementalWages: number;
};

const EMPTY_YTD: PayrollYtdBuckets = {
	gross: 0,
	socialSecurityWages: 0,
	medicareWages: 0,
	additionalMedicareWages: 0,
	futaWages: 0,
	nyUiWages: 0,
	mnUiWages: 0,
	pflWithheld: 0,
	mnPaidLeaveWages: 0,
	federalIncomeTax: 0,
	socialSecurityTax: 0,
	medicareTax: 0,
	additionalMedicareTax: 0,
	supplementalWages: 0,
};

const SS_KEYS = new Set([
	"social_security",
	"social security",
	"social security employer",
	"social_security_employer",
]);
const MED_KEYS = new Set(["medicare", "medicare employer", "medicare_employer"]);
const ADD_MED_KEYS = new Set([
	"additional medicare",
	"additional_medicare",
	"add_medicare",
]);
const FIT_KEYS = new Set(["federal income tax", "federal_income_tax", "fit"]);
const FUTA_KEYS = new Set(["futa", "futa employer", "futa_employer"]);
const NY_UI_KEYS = new Set([
	"ny sui",
	"ny_sui",
	"new york sui",
	"ny re-employment",
	"ny_re_employment",
	"ny rsf",
	"ny state unemployment",
]);
const MN_UI_KEYS = new Set([
	"mn ui",
	"mn_ui",
	"minnesota ui",
	"mn state unemployment",
	"state unemployment",
]);
const PFL_KEYS = new Set(["ny pfl", "ny_pfl", "ny paid family leave"]);

/**
 * Aggregate a stream of saved `payroll_components` (e.g. from
 * `getSavedSalary`) into a `PayrollYtdBuckets` snapshot for a single
 * employee in the current calendar year.
 */
export function aggregateYtdFromPayrolls(
	payrolls: any[],
	employeeId: string | number,
	currentYear?: number,
): PayrollYtdBuckets {
	const year = currentYear ?? new Date().getFullYear();
	const buckets: PayrollYtdBuckets = { ...EMPTY_YTD };
	if (!Array.isArray(payrolls)) return buckets;

	for (const run of payrolls) {
		const runDate = run?.pay_date || run?.payroll_date || run?.created_at;
		if (runDate && new Date(runDate).getFullYear() !== year) continue;
		const employees = Array.isArray(run?.employees)
			? run.employees
			: Array.isArray(run?.payroll_employees)
			? run.payroll_employees
			: [];
		const match = employees.find(
			(e: any) =>
				String(e?.employee_id ?? e?.id ?? e?.user_id) === String(employeeId),
		);
		if (!match) continue;
		const gross = Number(match?.gross_pay ?? match?.totalgross ?? 0) || 0;
		buckets.gross += gross;
		buckets.socialSecurityWages += gross;
		buckets.medicareWages += gross;
		buckets.futaWages += gross;
		buckets.nyUiWages += gross;
		buckets.mnUiWages += gross;
		buckets.mnPaidLeaveWages += gross;

		const comps = Array.isArray(match?.payroll_components)
			? match.payroll_components
			: [];
		for (const c of comps) {
			const name = String(c?.title ?? c?.name ?? "").toLowerCase().trim();
			const cur = Number(c?.current ?? c?.amount ?? 0) || 0;
			if (FIT_KEYS.has(name)) buckets.federalIncomeTax += cur;
			else if (SS_KEYS.has(name)) buckets.socialSecurityTax += cur;
			else if (MED_KEYS.has(name)) buckets.medicareTax += cur;
			else if (ADD_MED_KEYS.has(name)) buckets.additionalMedicareTax += cur;
			else if (PFL_KEYS.has(name)) buckets.pflWithheld += cur;
			else if (FUTA_KEYS.has(name)) {
				// FUTA tax line implies the gross was subject to FUTA;
				// don't double-count, we already added `gross` above.
			} else if (NY_UI_KEYS.has(name) || MN_UI_KEYS.has(name)) {
				// Same as FUTA — UI wages were already counted as gross.
			}
		}
	}
	buckets.additionalMedicareWages = buckets.medicareWages;
	buckets.supplementalWages = 0;
	return buckets;
}

/* =========================================================
   PUBLIC: NYC RESIDENCY DETECTION
========================================================= */

/** Lower-cased NYC borough / county / city aliases. */
const NYC_LOCALITY_ALIASES = new Set([
	"new york",
	"new york city",
	"nyc",
	"manhattan",
	"new york county",
	"bronx",
	"the bronx",
	"bronx county",
	"brooklyn",
	"kings",
	"kings county",
	"queens",
	"queens county",
	"staten island",
	"richmond",
	"richmond county",
]);

/** Lower-case + collapse whitespace. */
const normLocality = (v: any): string =>
	String(v ?? "")
		.toLowerCase()
		.trim()
		.replace(/\s+/g, " ");

/** Returns true if the given (city, state) pair refers to NYC. */
export function isNycLocality(city?: any, state?: any): boolean {
	const stateStr = normLocality(state);
	if (stateStr && stateStr !== "ny" && stateStr !== "new york") return false;
	const cityStr = normLocality(city);
	if (!cityStr) return false;
	return NYC_LOCALITY_ALIASES.has(cityStr);
}

/**
 * Determine NYC residency from an employee record per the Balanzify
 * 2026 compliance update (§5) and Pub. NYS-50-T-NYC: NYC RESIDENT tax
 * applies ONLY when the employee's HOME ADDRESS is in NYC.
 *
 * Looks at (in order):
 *  1) explicit `residentCity` / `tax_record.resident_city` flags
 *  2) the first address in `emp.addresses` with `is_work_address` false
 *  3) the explicit `home_address` field if present
 *  4) any `addresses` entry with a NYC city in NY state
 */
export function detectNycResidentFromEmployee(emp: any): boolean {
	if (!emp) return false;
	const taxRec = getTaxRecord(emp?.taxes);

	// --- Manual override (stored inside exempt_fields JSON on the tax record) ---
	// "none"  → HR explicitly exempted the employee from NYC resident tax
	// "nyc"   → HR explicitly forced NYC residency (overrides address detection)
	// ""      → auto-detect from address (default, fall through)
	// Primary source: exempt_fields.nyc_residency_override (new path).
	// Fallback:       taxRec.nyc_residency_override (legacy top-level field).
	const exemptFieldsObj =
		taxRec?.exempt_fields && typeof taxRec.exempt_fields === "object"
			? taxRec.exempt_fields
			: (() => {
					try {
						return typeof taxRec?.exempt_fields === "string"
							? JSON.parse(taxRec.exempt_fields)
							: {};
					} catch {
						return {};
					}
				})();
	const override = String(
		exemptFieldsObj?.nyc_residency_override ??
		taxRec?.nyc_residency_override ??
		""
	).toLowerCase().trim();
	if (override === "none") return false;
	if (override === "nyc") return true;

	const explicit = String(
		emp?.residentCity ?? emp?.resident_city ?? taxRec?.resident_city ?? "",
	)
		.toLowerCase()
		.trim();
	if (explicit === "nyc" || explicit === "new york city") return true;

	const tryAddr = (addr: any) => {
		if (!addr) return false;
		const state = addr.state ?? addr.state_name ?? addr.state_code;
		const city = addr.city ?? addr.locality ?? addr.town;
		return isNycLocality(city, state);
	};

	// Direct home_address object
	if (tryAddr(emp?.home_address)) return true;

	const addresses: any[] = Array.isArray(emp?.addresses) ? emp.addresses : [];
	const home = addresses.find(
		(a) => a && (a.is_work_address === false || a.address_kind === "HOME"),
	);
	if (tryAddr(home)) return true;

	// Last resort: any non-explicitly-work address in NYC
	for (const a of addresses) {
		if (a?.is_work_address === true) continue;
		if (tryAddr(a)) return true;
	}
	return false;
}

/** Returns true if the employee's WORK location is inside NYC (MCTMT Zone 1 candidate). */
export function detectWorksInNyc(emp: any): boolean {
	if (!emp) return false;
	const tryAddr = (addr: any) => {
		if (!addr) return false;
		const state = addr.state ?? addr.state_name ?? addr.state_code;
		const city = addr.city ?? addr.locality ?? addr.town;
		return isNycLocality(city, state);
	};
	if (tryAddr(emp?.work_address)) return true;
	const addresses: any[] = Array.isArray(emp?.addresses) ? emp.addresses : [];
	const work = addresses.find(
		(a) => a && (a.is_work_address === true || a.address_kind === "WORK"),
	);
	return tryAddr(work);
}

/* =========================================================
   PUBLIC: PAY-PERIOD EXTRACTION
========================================================= */

/**
 * Extract the per-period income and the number of pay periods per year
 * for a given employee record. Always returns numbers.
 */
export function extractIncomeAndPayPeriods(emp: any) {
	const salary =
		parseFloat(emp?.total_salary) ||
		parseFloat(emp?.salary) ||
		0;
	const frequency = emp?.pay_frequency;
	const payPeriods = periodsFromFrequency(frequency);
	const incomePerPeriod = salary;

	return { incomePerPeriod, payPeriods };
}

/* =========================================================
   PUBLIC: FEDERAL INCOME TAX (2026) - IRS Pub. 15-T Worksheet 1A
========================================================= */

/** Walk the Pub. 15-T Worksheet 1A table for an adjusted annualized wage. */
function pub15tScheduleTax(adjustedAnnualWages: number, rows: Pub15TRow[]): number {
	const income = Math.max(0, adjustedAnnualWages);
	const row =
		rows.find((r) => income >= r.atLeast && income < r.lessThan) ||
		rows[rows.length - 1];
	return Math.max(0, row.baseTax + (income - row.subtract) * row.rate);
}

/**
 * Per-employee W-4 inputs used by the IRS Pub. 15-T Worksheet 1A
 * automated percentage method. All currency fields are ANNUAL amounts
 * (just like Form W-4 itself) — pay-period extras like 4(c) are added
 * back to the per-pay withholding below.
 */
export type FederalW4Inputs = {
	/** Federal filing status from W-4 Step 1(c). */
	filingStatus?: string;
	/** True if W-4 Step 2(c) (multiple jobs / spouse works) is checked. */
	multipleJobsOrSpouseWorks?: boolean;
	/** W-4 Step 3 dependent / credit ANNUAL amount (subtracted from annual tax). */
	step3DependentsAmount?: number;
	/** W-4 Step 4(a) ANNUAL other income added to taxable wages. */
	step4aOtherIncome?: number;
	/** W-4 Step 4(b) ANNUAL deductions subtracted from taxable wages. */
	step4bDeductions?: number;
	/** W-4 Step 4(c) extra withholding PER PAY PERIOD (not annual). */
	step4cExtraWithholding?: number;
	/** True when the employee claims federal exempt → FIT = 0 (FICA still calculates). */
	federalIncomeTaxExempt?: boolean;
	/** True for pre-2020 W-4 (computational-bridge / legacy fallback). */
	isLegacyW4?: boolean;
	/** Separately identified supplemental wages (bonus/commission) for this pay. */
	supplementalThisPeriod?: number;
	/** Calendar YTD supplemental wages used to apply the 37% over-$1M rule. */
	supplementalYtd?: number;
	/** When true, use the supplemental wage rate on `supplementalThisPeriod`. */
	separateSupplemental?: boolean;
};

/**
 * IRS Publication 15-T (2026), Worksheet 1A — automated percentage
 * method federal income-tax withholding for ONE pay period.
 *
 * This is the live-payroll formula referenced by Pub. 15-T. It is NOT
 * the same as applying annual return brackets to gross wages × periods.
 *
 * Returns numeric (not string) values; the legacy `estimateFederalWithholding_`
 * wrapper coerces these to the original string-returning shape.
 */
export function pub15tFederalIncomeTax({
	incomePerPeriod,
	payPeriods,
	w4,
}: {
	incomePerPeriod: number;
	payPeriods: number;
	w4?: FederalW4Inputs;
}) {
	const inputs = w4 || {};
	if (inputs.federalIncomeTaxExempt) {
		return {
			annualWages: 0,
			adjustedAnnualWages: 0,
			tentativeAnnualTax: 0,
			annualTaxAfterCredits: 0,
			withholdingPerPeriod: 0,
			method: "EXEMPT" as const,
			tableUsed: "EXEMPT" as const,
		};
	}

	const fs = normalizeFilingStatus(inputs.filingStatus);
	const periods = payPeriods > 0 ? payPeriods : 1;
	const per = Math.max(0, Number(incomePerPeriod) || 0);
	const annualWages = per * periods;
	const useStep2 = inputs.multipleJobsOrSpouseWorks === true;

	const tableGroup = useStep2
		? CONFIG.federal.percentageMethodTables.step2
		: CONFIG.federal.percentageMethodTables.standard;
	const rows = tableGroup[fs] || tableGroup.single;

	const step4aOther = Math.max(0, Number(inputs.step4aOtherIncome) || 0);
	const step4bDeduct = Math.max(0, Number(inputs.step4bDeductions) || 0);
	// Pub. 15-T applies a $12,900 (married) / $8,600 (single, HoH)
	// annual auto-adjustment to Step 4(b) ONLY when Step 2 is unchecked.
	const step4bAuto = useStep2
		? 0
		: CONFIG.federal.step4bAdjustmentWhenStep2Unchecked[fs] ??
		  CONFIG.federal.step4bAdjustmentWhenStep2Unchecked.single;
	const adjustedAnnualWages = Math.max(
		0,
		annualWages + step4aOther - step4bDeduct - step4bAuto,
	);

	const tentativeAnnualTax = pub15tScheduleTax(adjustedAnnualWages, rows);
	const step3Credits = Math.max(0, Number(inputs.step3DependentsAmount) || 0);
	const annualTaxAfterCredits = Math.max(0, tentativeAnnualTax - step3Credits);

	const step4cExtra = Math.max(0, Number(inputs.step4cExtraWithholding) || 0);
	let withholdingPerPeriod = annualTaxAfterCredits / periods + step4cExtra;

	if (inputs.separateSupplemental && (inputs.supplementalThisPeriod || 0) > 0) {
		const supp = Math.max(0, Number(inputs.supplementalThisPeriod) || 0);
		const suppYtd = Math.max(0, Number(inputs.supplementalYtd) || 0);
		// IRS Pub. 15 mandatory flat-rate for supplemental wages over $1M
		// YTD; standard 22% otherwise (employer election). The portion of
		// this pay-period supplemental crossing $1M YTD gets 37%.
		const newSupplemental = suppYtd + supp;
		const overMillion = Math.max(
			0,
			newSupplemental - CONFIG.federal.highSupplementalThreshold,
		);
		const priorOverMillion = Math.max(
			0,
			suppYtd - CONFIG.federal.highSupplementalThreshold,
		);
		const highPortion = Math.max(0, overMillion - priorOverMillion);
		const lowPortion = Math.max(0, supp - highPortion);
		withholdingPerPeriod +=
			lowPortion * CONFIG.federal.supplementalRate +
			highPortion * CONFIG.federal.highSupplementalRate;
	}

	withholdingPerPeriod = Math.max(0, round2(withholdingPerPeriod));
	return {
		annualWages: round2(annualWages),
		adjustedAnnualWages: round2(adjustedAnnualWages),
		tentativeAnnualTax: round2(tentativeAnnualTax),
		annualTaxAfterCredits: round2(annualTaxAfterCredits),
		withholdingPerPeriod,
		method: "PUB_15T_WORKSHEET_1A" as const,
		tableUsed: (useStep2 ? "STEP_2" : "STANDARD") as "STEP_2" | "STANDARD",
	};
}

/**
 * Legacy wrapper used by older callers (Run-payroll.tsx, Run-payroll2.tsx,
 * AddTaxModalempty.tsx, salary_process/page.tsx). Signature preserved —
 * only adds optional `w4` Step 2/3/4 inputs.
 *
 * IMPORTANT 2026 behaviour change: the per-period withholding is now
 * computed via the IRS Pub. 15-T Worksheet 1A automated percentage
 * method (see `pub15tFederalIncomeTax`) instead of applying the annual
 * tax-return brackets to (annualWages - standardDeduction). The Pub.
 * 15-T method is what live US payroll is required to use, and it
 * produces results aligned with QuickBooks Online / Gusto / ADP for
 * the same W-4 inputs.
 *
 * Returns the original string-typed shape so existing destructuring
 * keeps working.
 */
export function estimateFederalWithholding_(
	incomePerPeriod: any,
	filingStatus: string = "single",
	payPeriods: number = 26,
	w4?: FederalW4Inputs,
) {
	const result = pub15tFederalIncomeTax({
		incomePerPeriod: Number(incomePerPeriod) || 0,
		payPeriods,
		w4: { ...(w4 || {}), filingStatus },
	});

	const annual = result.annualWages;
	const annualTax = result.annualTaxAfterCredits;
	const perPeriod = result.withholdingPerPeriod;

	return {
		filingStatus,
		annualWages: annual.toFixed(2),
		estimatedAnnualTax: annualTax.toFixed(2),
		estimatedWithholdingPerPeriod: perPeriod.toFixed(2),
		effectiveTaxRate:
			annual > 0 ? ((annualTax / annual) * 100).toFixed(2) + "%" : "0%",
		method: result.method,
		tableUsed: result.tableUsed,
	};
}

/**
 * Build a `FederalW4Inputs` object directly from a stored tax record
 * (the `taxes` field on the employee API response). Handles the
 * mixed string / number / boolean shapes the backend currently returns,
 * including the misspelt enum `SINGLE_OR_MARRIED_FILING_SEPARATLEY`.
 */
export function buildFederalW4InputsFromTaxRecord(taxRecord: any): FederalW4Inputs {
	if (!taxRecord) return {};
	const { filingStatus } = mapHoldingStatusToFilingStatus(
		taxRecord?.holding_status,
	);
	const num = (v: any) => {
		const n = Number(v);
		return Number.isFinite(n) ? n : 0;
	};
	const truthy = (v: any) => v === true || v === "true";

	// Tax record stores Step 3 credits as `total_credits` (sum of children
	// + other dependents + other credits). Step 4(a) other income lives
	// on `total_other_income`. Step 4(b) deductions are stored on
	// `deduction`. Step 4(c) extra withholding is stored on
	// `extra_with_holding` (annualized in some tenants — guarded below).
	return {
		filingStatus,
		multipleJobsOrSpouseWorks: truthy(taxRecord?.is_multiple_jobs_or_spouse_works),
		step3DependentsAmount: num(taxRecord?.total_credits),
		step4aOtherIncome: num(taxRecord?.total_other_income),
		step4bDeductions: num(taxRecord?.deduction),
		step4cExtraWithholding: num(taxRecord?.extra_with_holding),
		federalIncomeTaxExempt: truthy(taxRecord?.is_employee_exempt_from_federal_tax),
		isLegacyW4:
			String(taxRecord?.employee_W_4_kind || "").toUpperCase() ===
			"YEAR_BEFORE_2020",
	};
}

/* =========================================================
   PUBLIC: SOCIAL SECURITY (OASDI) - 2026
========================================================= */

export type SocialSecurityTaxOptions = {
	/** Calendar YTD wages already subject to OASDI (Box 3 definition). */
	ytdSubjectWages?: number;
	/** Defaults to SOCIAL_SECURITY_WAGE_BASE_2026 ($184,500). */
	wageBase?: number;
	/**
	 * Calendar YTD OASDI tax already withheld for this employee
	 * (employee side OR employer side — pass whichever side this call
	 * represents). Provides a defense-in-depth ceiling at
	 * `wageBase × 6.2%` per employee per year.
	 */
	ytdTaxPaid?: number;
};

/** Employee OASDI: 6.2% on taxable wages up to annual wage base (2026: $184,500). */
export const estimate_socialSecurityTax = (
	income: number,
	options?: SocialSecurityTaxOptions,
) => {
	const taxRate = CONFIG.federal.ssRate;
	const wageBase = options?.wageBase ?? CONFIG.federal.ssWageBase;
	const ytd = Math.max(0, Number(options?.ytdSubjectWages) || 0);
	const ytdTax = Math.max(0, Number(options?.ytdTaxPaid) || 0);
	const gross = Math.max(0, Number(income) || 0);
	const taxableByWage = ytdTaxable(gross, ytd, wageBase);

	// Defensive max-annual-tax cap (per side): `wageBase × ssRate`.
	const maxAnnualTax = wageBase * taxRate;
	const remainingTaxRoom = Math.max(0, maxAnnualTax - ytdTax);

	const tax = Math.min(taxableByWage * taxRate, remainingTaxRoom);
	const estimatedTax = tax.toFixed(2);
	const effectiveTaxRate =
		gross > 0
			? ((Number(estimatedTax) / gross) * 100).toFixed(2) + "%"
			: "0%";
	return { estimatedTax, effectiveTaxRate };
};

/* =========================================================
   PUBLIC: MEDICARE - 2026
========================================================= */

/** Employee + Employer Medicare share: 1.45% of gross wages (no wage cap). */
export const estimate_medicareTax = (income: any) => {
	const taxRate = CONFIG.federal.medicareRate;
	const gross = Math.max(0, Number(income) || 0);
	const estimatedTax = (gross * taxRate).toFixed(2);
	const effectiveTaxRate =
		gross > 0
			? ((Number(estimatedTax) / gross) * 100).toFixed(2) + "%"
			: "0%";
	return { estimatedTax, effectiveTaxRate };
};

const ADDITIONAL_MEDICARE_ANNUAL_THRESHOLDS: Record<string, number> = {
	single: 200_000,
	mfs: 200_000,
	hoh: 200_000,
	married: 250_000,
	mfj: 250_000,
};

/**
 * Additional Medicare Tax 0.9% on wages above the filing-status threshold
 * once cumulative (YTD + current period) exceeds the threshold.
 */
export function estimate_additionalMedicareTaxForPeriod(
	currentGross: number,
	ytdMedicareWages: number,
	filingStatus: string,
) {
	const fs = (filingStatus || "single").toLowerCase();
	const threshold =
		ADDITIONAL_MEDICARE_ANNUAL_THRESHOLDS[fs] ??
		ADDITIONAL_MEDICARE_ANNUAL_THRESHOLDS.single;
	const ytd = Math.max(0, Number(ytdMedicareWages) || 0);
	const gross = Math.max(0, Number(currentGross) || 0);
	const cumAfter = ytd + gross;
	const excessBefore = Math.max(0, ytd - threshold);
	const excessAfter = Math.max(0, cumAfter - threshold);
	const additionalTaxable = Math.max(0, excessAfter - excessBefore);
	const estimatedTax = (additionalTaxable * CONFIG.federal.addMedicareRate).toFixed(2);
	const effectiveTaxRate =
		gross > 0
			? ((Number(estimatedTax) / gross) * 100).toFixed(2) + "%"
			: "0%";
	return { estimatedTax, effectiveTaxRate };
}

/* =========================================================
   PUBLIC: FUTA - 2026
========================================================= */

export type FutaTaxOptions = {
	/** Calendar YTD FUTA-taxable wages already paid this year. */
	ytdSubjectWages?: number;
	/**
	 * Calendar YTD FUTA tax already paid for this employee. Used as a
	 * defense-in-depth cap so the cumulative annual tax can never
	 * exceed `wageBase × netRate` (i.e. $42 per employee at the
	 * default 0.6% net rate), even when `ytdSubjectWages` is stale or
	 * unavailable. The user's invariant: "Maximum yearly FUTA tax per
	 * employee = $42" — this option enforces it directly.
	 */
	ytdTaxPaid?: number;
	/** Override wage base (defaults to $7,000). */
	wageBase?: number;
	/** Employer SUTA credit (default 5.4% per IRS Pub. 15 / 940). */
	creditRate?: number;
	/** When true, returns the GROSS 6.0% FUTA (no credit). */
	gross?: boolean;
};

/**
 * Federal Unemployment Tax (employer-paid).
 *
 * The correct 2026 calculation (per IRS Pub. 15 and the Balanzify
 * compliance update §4.4) is:
 *   futa_taxable_current = max(0, min(currentGross, 7000 - ytdFutaPrior))
 *   futa_net             = futa_taxable_current × (6.0% − employerCreditRate)
 *
 * The historical signature (`estimate_FutaTax(income)`) capped the
 * passed-in `income` directly at $7,000, which is correct only on the
 * very first paycheck of the year. We now:
 *  - Accept an optional second argument with YTD wages so the wage
 *    base is correctly amortised across pay periods.
 *  - Stay 100% backward-compatible when no options are passed:
 *    ytd = 0 → the cap is `min(income, 7000)` as before.
 */
export const estimate_FutaTax = (income: any, options?: FutaTaxOptions) => {
	const gross = Math.max(0, Number(income) || 0);
	const ytdWages = Math.max(0, Number(options?.ytdSubjectWages) || 0);
	const ytdTax = Math.max(0, Number(options?.ytdTaxPaid) || 0);
	const wageBase = options?.wageBase ?? CONFIG.federal.futaWageBase;
	const grossRate = CONFIG.federal.futaGrossRate;
	const credit = Math.max(
		0,
		options?.creditRate ?? CONFIG.federal.futaDefaultCreditRate,
	);
	const netRate = options?.gross ? grossRate : Math.max(0, grossRate - credit);

	// Cap 1: wage-base capping on the CURRENT pay-period gross.
	const taxableByWage = ytdTaxable(gross, ytdWages, wageBase);

	// Cap 2: defensive remaining-tax-room cap. The max annual FUTA per
	// employee equals `wageBase × netRate` (e.g. 7000 × 0.6% = $42).
	// Once that amount has already been paid YTD, every subsequent
	// payroll's FUTA tax MUST be $0 for the rest of the calendar year.
	const maxAnnualTax = wageBase * netRate;
	const remainingTaxRoom = Math.max(0, maxAnnualTax - ytdTax);

	// The actual tax for this period is the minimum of the two caps.
	// Both caps independently enforce the same year-end ceiling; using
	// the tighter one keeps the calculation robust even when only ONE
	// of `ytdSubjectWages` / `ytdTaxPaid` is supplied.
	const taxByWage = taxableByWage * netRate;
	const tax = Math.min(taxByWage, remainingTaxRoom);
	const taxable = netRate > 0 ? tax / netRate : 0;

	const estimatedTax = tax.toFixed(2);
	const effectiveTaxRate =
		gross > 0 ? ((tax / gross) * 100).toFixed(2) + "%" : "0%";
	return {
		estimatedTax,
		effectiveTaxRate,
		taxableWages: round2(taxable),
		remainingWageBase: Math.max(0, round2(wageBase - ytdWages - taxable)),
		remainingTaxRoom: round2(Math.max(0, remainingTaxRoom - tax)),
		netRate,
	};
};

/* =========================================================
   NY STATE INCOME TAX (NYS-50-T-NYS Method II annual)
========================================================= */

/**
 * Legacy helper that returns a richer breakdown of NY state withholding
 * along with SDI / PFL components. Kept for AddTaxModalempty.tsx.
 */
export function calculateNYStateTaxForEmployee(
	incomePerPeriod: number,
	payPeriods: number,
	filingStatus: "single" | "married" | "hoh" = "single",
	frequency: "EVERY_MONTH" | "EVERY_WEEK" = "EVERY_MONTH",
) {
	const fs = filingStatus === "married" ? "married" : "single";
	const periods = payPeriods > 0 ? payPeriods : 1;
	const annual = Math.max(0, Number(incomePerPeriod) || 0) * periods;
	const exemption = CONFIG.ny.exemptionBase[fs];
	const annualTaxable = Math.max(0, annual - exemption);
	const rows = CONFIG.ny.nysAnnualMethodII[fs] || CONFIG.ny.nysAnnualMethodII.single;
	const annualTax = tableTax(annualTaxable, rows);

	const frequencyInNumber = periodsFromFrequency(frequency);

	const sdiAnnualMax = 31.2;
	const sdiAnnual = sdiAnnualMax;
	const sdiPerPeriod = parseFloat((sdiAnnual / frequencyInNumber).toFixed(2));

	const pflAnnual = annual * CONFIG.ny.pflRate;
	const pflPerPeriod = parseFloat(
		(Math.min(pflAnnual, CONFIG.ny.pflAnnualCap) / frequencyInNumber).toFixed(2),
	);

	const taxPerPeriod = parseFloat((annualTax / frequencyInNumber).toFixed(2));

	return {
		nyStateTax: taxPerPeriod - sdiPerPeriod - pflPerPeriod,
		nyStateTaxWD: taxPerPeriod,
		sdiPerPeriod,
		payPeriods,
		pflPerPeriod,
		sdiAnnual,
		pflAnnual,
		totalPerPeriodTax: parseFloat(
			(taxPerPeriod + sdiPerPeriod + pflPerPeriod).toFixed(2),
		),
		effectiveRate: annualTaxable > 0
			? ((annualTax / annualTaxable) * 100).toFixed(2) + "%"
			: "0%",
	};
}

/**
 * Main NY/MN state income-tax + SDI + PFL calculator used by Run-payroll2.
 *
 * State must be "NY" / "NYC" / "MN". To enable NYC RESIDENT withholding
 * (per NYS-50-T-NYC) pass `residentCity: "nyc"` — note that NYC tax is
 * driven by HOME-address residency, not work location (see Balanzify
 * compliance update §5).
 *
 * Returned `nyStateTax` is NYS withholding only; NYC resident
 * withholding is returned separately as `nycTax`. Some legacy callers
 * still expect `nyStateTax` to include NYC — to stay compatible we keep
 * `nyStateTax` pure (NYS only) and add `nycTax` as additive.
 */
export function calculateNYStateTax({
	gross,
	payFrequency,
	state,
	filingStatus,
	pflYTD,
	method,
	allowances,
	residentCity,
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
	residentCity?: "nyc" | "none" | null;
}) {
	let st = (state || "NY").toUpperCase();
	if (st === "NYC") st = "NY";
	if (st !== "NY" && st !== "MN") st = "NY";

	const periods = periodsFromFrequency(payFrequency);
	const weeksInPeriod = weeksFromFrequency(payFrequency);
	const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
	const grossNum = Math.max(0, Number(gross) || 0);
	const annual = payFrequency === "EVERY_YEAR" ? grossNum : grossNum * periods;
	const allow = Math.max(0, Math.floor(Number(allowances) || 0));

	let stateIncomeTax = 0;
	let nycTax = 0;
	let sdi = 0;
	let fli = 0;

	if (st === "NY") {
		const fs = normalizeFilingStatus(filingStatus);
		const exemption =
			(CONFIG.ny.exemptionBase[fs] ?? CONFIG.ny.exemptionBase.single) +
			allow * CONFIG.ny.exemptionPerAllowance;
		const annualTaxable = Math.max(0, annual - exemption);
		const rows =
			CONFIG.ny.nysAnnualMethodII[fs === "married" ? "married" : "single"] ||
			CONFIG.ny.nysAnnualMethodII.single;
		const annualTax = tableTax(annualTaxable, rows);
		stateIncomeTax = round(annualTax / periods);

		// NYC RESIDENT withholding (NYS-50-T-NYC Method II). Apply only when
		// the employee's home address is in NYC — never on the basis of
		// work location alone.
		if (residentCity === "nyc") {
			const nycExemption =
				(CONFIG.ny.nycExemptionBase[fs] ??
					CONFIG.ny.nycExemptionBase.single) +
				allow * CONFIG.ny.nycExemptionPerAllowance;
			const nycTaxable = Math.max(0, annual - nycExemption);
			const nycRows =
				CONFIG.ny.nycAnnualMethodII[fs === "married" ? "married" : "single"] ||
				CONFIG.ny.nycAnnualMethodII.single;
			const nycAnnual = tableTax(nycTaxable, nycRows);
			nycTax = round(nycAnnual / periods);
		}

		// NY SDI: 0.5% of gross, capped at $0.60 per week.
		sdi = round(
			Math.min(grossNum * CONFIG.ny.dblRate, CONFIG.ny.dblWeeklyCap * weeksInPeriod),
		);

		// NY PFL: 0.432% of gross, capped at $411.91/year.
		const pflRoom = Math.max(0, CONFIG.ny.pflAnnualCap - (Number(pflYTD) || 0));
		fli = round(Math.min(grossNum * CONFIG.ny.pflRate, pflRoom));
	} else if (st === "MN") {
		const fs = normalizeFilingStatus(filingStatus);
		const std =
			CONFIG.mn.standardDeduction[fs] ?? CONFIG.mn.standardDeduction.single;
		const allowanceAmt = allow * CONFIG.mn.allowanceValue;
		const annualTaxable = Math.max(0, annual - std - allowanceAmt);
		const brackets =
			CONFIG.mn.brackets[fs] || CONFIG.mn.brackets.single;
		const annualTax = progressiveTax(annualTaxable, brackets);
		stateIncomeTax = round(annualTax / periods);
	}

	return { nyStateTax: stateIncomeTax, nycTax, sdi, fli };
}

/* =========================================================
   STATE UNEMPLOYMENT INSURANCE (SUI)
========================================================= */

/**
 * NY 2026 SUI + RSF calculation. Mirrors `nyUnemploymentTax()` in
 * `payroll-calculator.js` so the saved-payroll screens line up with the
 * standalone calculator output.
 *
 * - `currentGross` is the gross wages for THIS pay period (NOT
 *   annualised). The taxable amount is capped against the remaining
 *   room in the wage base via `ytdTaxable(currentGross, ytdWages,
 *   wageBase)`, exactly like the calculator's
 *   `ytdTaxable(currentGross, num('nyUiYtd'), CONFIG.ny.uiWageBase)`.
 *   Examples on the QBO blended default rate of 9.825%:
 *     • $4,000 pay period, $0 YTD  → 4,000 × 9.825% = $393.00
 *     • $40,000 pay period, $0 YTD → 17,600 × 9.825% = $1,729.20
 * - Defaults to the 2026 NY UI default rate (9.825%, the QBO blended
 *   max) on the 2026 NY UI wage base ($17,600). Pass the employer's
 *   actual NY DOL rate-notice value (decimal or percentage) to override.
 * - Per the 2026 NYS-45 specification, the Re-employment Service Fund
 *   (0.075%) is calculated SEPARATELY from UI and returned as `rsfTax`.
 *   It is NOT blended into the UI rate.
 * - `rateOutOfRange` is true when the supplied UI rate falls outside the
 *   published 2026 range (1.625% – 9.425%) — call sites should surface a
 *   warning rather than silently accept the value. The QBO default
 *   (9.825%) is intentionally above the published max because it is a
 *   blended rate; callers using the default may ignore this flag.
 *
 * Existing call sites that destructure `suiTax`, `employerRate`, and
 * `taxableIncome` continue to work; the new `rsfTax` / `totalTax` /
 * `rateOutOfRange` fields are additive.
 */
export function calculateNYSUI(
	currentGross: number,
	employerRate: number = CONFIG.ny.uiDefaultRate,
	taxableWageBase: number = CONFIG.ny.uiWageBase,
	rsfRate: number = CONFIG.ny.rsfRate,
	ytdWages: number = 0,
	priorTax?: { suiTaxPaid?: number; rsfTaxPaid?: number },
) {
	const gross = Math.max(0, Number(currentGross) || 0);
	const ytd = Math.max(0, Number(ytdWages) || 0);
	const wageBase = Math.max(0, Number(taxableWageBase) || CONFIG.ny.uiWageBase);
	const taxableIncome = ytdTaxable(gross, ytd, wageBase);
	const uiRate = coerceRate(employerRate, CONFIG.ny.uiDefaultRate);
	const rsf = coerceRate(rsfRate, CONFIG.ny.rsfRate);

	// Defense-in-depth: even if ytdWages is stale, the cumulative
	// annual tax can never exceed `wageBase × rate` per employee.
	// Once `priorTax.{suiTaxPaid|rsfTaxPaid}` reaches that ceiling
	// every subsequent payroll's contribution must be $0.
	const ytdSuiTax = Math.max(0, Number(priorTax?.suiTaxPaid) || 0);
	const ytdRsfTax = Math.max(0, Number(priorTax?.rsfTaxPaid) || 0);
	const suiRoom = Math.max(0, wageBase * uiRate - ytdSuiTax);
	const rsfRoom = Math.max(0, wageBase * rsf - ytdRsfTax);

	const suiTax = round2(Math.min(taxableIncome * uiRate, suiRoom));
	const rsfTax = round2(Math.min(taxableIncome * rsf, rsfRoom));
	const totalTax = round2(suiTax + rsfTax);

	const rateOutOfRange =
		uiRate < CONFIG.ny.uiLowestRate ||
		uiRate > CONFIG.ny.uiHighestRate;

	return {
		taxableIncome,
		employerRate: (uiRate * 100).toFixed(3) + "%",
		rsfEmployerRate: (rsf * 100).toFixed(3) + "%",
		suiTax: suiTax.toFixed(2),
		rsfTax: rsfTax.toFixed(2),
		totalTax: totalTax.toFixed(2),
		rateOutOfRange,
	};
}

/**
 * NY 2026 Re-employment Service Fund (RSF) — employer-only, 0.075% of the
 * NY UI taxable wages. Provided as a standalone helper so call sites can
 * emit RSF as a discrete employer-tax line on NYS-45. `currentGross` is
 * THIS pay period's gross (capped against `wageBase - ytdWages`), to
 * match `nyUnemploymentTax()` in `payroll-calculator.js`.
 */
export function calculateNYRsf(
	currentGross: number,
	taxableWageBase: number = CONFIG.ny.uiWageBase,
	rsfRate: number = CONFIG.ny.rsfRate,
	ytdWages: number = 0,
) {
	const gross = Math.max(0, Number(currentGross) || 0);
	const ytd = Math.max(0, Number(ytdWages) || 0);
	const wageBase = Math.max(0, Number(taxableWageBase) || CONFIG.ny.uiWageBase);
	const taxableIncome = ytdTaxable(gross, ytd, wageBase);
	const rsf = coerceRate(rsfRate, CONFIG.ny.rsfRate);
	const rsfTax = round2(taxableIncome * rsf);
	return {
		taxableIncome,
		rsfRate: (rsf * 100).toFixed(3) + "%",
		rsfTax: rsfTax.toFixed(2),
	};
}

/* =========================================================
   MINNESOTA UNEMPLOYMENT INSURANCE - 2026
   Mirrors `mnUnemploymentTax()` in payroll-calculator (1).js:
     • UI Employer base tax    = taxable * uiRate
     • Additional Assessment   = uiEmployer * 14%
     • Federal Loan Interest   = (uiEmployer + addAssess) * federalLoanRate
     • Workforce Development   = taxable * 0.10%
     • Total                   = sum of all four
========================================================= */

export type MnUnemploymentTaxOptions = {
	/** Calendar YTD wages already subject to MN UI (for wage-base capping). */
	ytdWages?: number;
	/**
	 * Employer's actual UI Tax Rate from the MN Tax Rate Determination.
	 * NOTE: do NOT include the 14% Additional Assessment in this rate.
	 * Pass either as a decimal (0.0044) or as a percentage (0.44).
	 * Defaults to 0.4% if omitted.
	 */
	uiRate?: number;
	/** Defaults to 14% (the standard MN Additional Assessment rate). */
	additionalAssessmentRate?: number;
	/** Defaults to 0% (no Federal Loan Interest Assessment in 2026). */
	federalLoanInterestRate?: number;
	/** Defaults to 0.10% (the standard Workforce Development Fee). */
	workforceDevelopmentRate?: number;
	/** Defaults to MN_UI_WAGE_BASE_2026 ($44,000). */
	wageBase?: number;
	/**
	 * Calendar YTD MN UI tax already paid (UI Employer + breakdown).
	 * Defense-in-depth cap: tax can never exceed `wageBase × uiRate`
	 * per employee per calendar year.
	 */
	ytdTaxPaid?: number;
};

/** Coerce a rate input that may be a decimal (0.0044) or a percentage (0.44). */
function coerceRate(value: number | undefined, fallback: number): number {
	if (value == null || !Number.isFinite(value)) return fallback;
	const v = Math.max(0, Number(value));
	// Heuristic: anything > 1 is treated as a percentage and scaled down.
	return v > 1 ? v / 100 : v;
}

export function calculateMnUnemploymentTax(
	currentGross: number,
	options?: MnUnemploymentTaxOptions,
) {
	const wageBase = options?.wageBase ?? CONFIG.mn.uiWageBase;
	const ytd = Math.max(0, Number(options?.ytdWages) || 0);
	const gross = Math.max(0, Number(currentGross) || 0);
	const taxable = ytdTaxable(gross, ytd, wageBase);

	const uiRate = coerceRate(options?.uiRate, CONFIG.mn.uiBaseTaxRate);
	const additionalAssessmentRate = coerceRate(
		options?.additionalAssessmentRate,
		CONFIG.mn.uiAdditionalAssessmentRate,
	);
	const federalLoanInterestRate = coerceRate(
		options?.federalLoanInterestRate,
		CONFIG.mn.uiFederalLoanInterestAssessmentRate,
	);
	const workforceDevelopmentRate = coerceRate(
		options?.workforceDevelopmentRate,
		CONFIG.mn.uiWorkforceDevelopmentFeeRate,
	);

	// Defense-in-depth: total MN UI tax (all four sub-rows combined)
	// is capped at `wageBase × effective rate` per employee per year.
	// Once `ytdTaxPaid` reaches that ceiling all current-period
	// contributions are forced to $0.
	const ytdTaxPaid = Math.max(0, Number(options?.ytdTaxPaid) || 0);
	const effectiveRate =
		uiRate * (1 + additionalAssessmentRate) * (1 + federalLoanInterestRate) +
		workforceDevelopmentRate;
	const maxAnnualTax = wageBase * effectiveRate;
	const remainingRoom = Math.max(0, maxAnnualTax - ytdTaxPaid);

	let uiEmployer = round2(taxable * uiRate);
	let additionalAssessment = round2(uiEmployer * additionalAssessmentRate);
	let federalLoanInterestAssessment = round2(
		(uiEmployer + additionalAssessment) * federalLoanInterestRate,
	);
	let workforceDevelopmentFee = round2(taxable * workforceDevelopmentRate);
	let total = round2(
		uiEmployer +
			additionalAssessment +
			federalLoanInterestAssessment +
			workforceDevelopmentFee,
	);

	// Apply the room cap proportionally across all four sub-rows so
	// the cumulative annual MN UI total stays at exactly `maxAnnualTax`.
	if (total > remainingRoom && total > 0) {
		const scale = remainingRoom / total;
		uiEmployer = round2(uiEmployer * scale);
		additionalAssessment = round2(additionalAssessment * scale);
		federalLoanInterestAssessment = round2(
			federalLoanInterestAssessment * scale,
		);
		workforceDevelopmentFee = round2(workforceDevelopmentFee * scale);
		total = round2(
			uiEmployer +
				additionalAssessment +
				federalLoanInterestAssessment +
				workforceDevelopmentFee,
		);
	}

	return {
		taxable,
		uiRate,
		additionalAssessmentRate,
		federalLoanInterestAssessmentRate: federalLoanInterestRate,
		workforceDevelopmentRate,
		uiEmployer: uiEmployer.toFixed(2),
		additionalAssessment: additionalAssessment.toFixed(2),
		federalLoanInterestAssessment: federalLoanInterestAssessment.toFixed(2),
		workforceDevelopmentFee: workforceDevelopmentFee.toFixed(2),
		total: total.toFixed(2),
		// Numeric copies for callers that prefer raw numbers.
		amounts: {
			uiEmployer,
			additionalAssessment,
			federalLoanInterestAssessment,
			workforceDevelopmentFee,
			total,
		},
		employerRate: (uiRate * 100).toFixed(3) + "%",
	};
}

/* =========================================================
   STATE-AWARE UNEMPLOYMENT INSURANCE WRAPPER
========================================================= */

export type UnemploymentTaxOptions = {
	state?: string;
	currentGross: number;
	annualWage?: number;
	ytdWages?: number;
	/** NY: experience rate. MN: UI Tax Rate from MN Tax Rate Determination. */
	rate?: number;
	wageBase?: number;
	mn?: Omit<MnUnemploymentTaxOptions, "ytdWages" | "uiRate" | "wageBase">;
};

/**
 * Convenience helper that picks the right SUI calculation per state.
 * For MN it returns the full assessment breakdown; for NY (and any other
 * non-MN state) it returns the standard single-line `calculateNYSUI`
 * result. Both responses include a numeric `total` for easy summing.
 */
export function calculateUnemploymentTax(opts: UnemploymentTaxOptions) {
	const state = (opts.state || "NY").toUpperCase();

	if (state === "MN") {
		const mn = calculateMnUnemploymentTax(opts.currentGross, {
			ytdWages: opts.ytdWages,
			uiRate: opts.rate,
			wageBase: opts.wageBase,
			additionalAssessmentRate: opts.mn?.additionalAssessmentRate,
			federalLoanInterestRate: opts.mn?.federalLoanInterestRate,
			workforceDevelopmentRate: opts.mn?.workforceDevelopmentRate,
		});
		return {
			state: "MN",
			isBreakdown: true,
			total: mn.amounts.total,
			breakdown: mn,
			// Compatibility fields so callers can read suiTax like NY.
			suiTax: mn.uiEmployer,
			employerRate: mn.employerRate,
		};
	}

	// NY UI is calculated on the CURRENT pay-period gross (with YTD-aware
	// wage-base capping), matching `nyUnemploymentTax()` in
	// `payroll-calculator.js`. Older callers that only have an annual
	// figure (`opts.annualWage`) still work — they get the full wage-base
	// cap because `min(annualWage, wageBase)` falls out of `ytdTaxable`
	// when YTD is 0.
	const grossForNY = Math.max(
		0,
		Number(opts.currentGross ?? opts.annualWage) || 0,
	);
	const ny = calculateNYSUI(
		grossForNY,
		opts.rate ?? CONFIG.ny.uiDefaultRate,
		opts.wageBase ?? CONFIG.ny.uiWageBase,
		CONFIG.ny.rsfRate,
		Number(opts.ytdWages) || 0,
	);
	return {
		state,
		isBreakdown: false,
		// Total employer unemployment-side burden for NY is UI + RSF.
		total: Number(ny.suiTax) + Number(ny.rsfTax),
		breakdown: null as null | ReturnType<typeof calculateMnUnemploymentTax>,
		suiTax: ny.suiTax,
		rsfTax: ny.rsfTax,
		employerRate: ny.employerRate,
		rsfEmployerRate: ny.rsfEmployerRate,
		rateOutOfRange: ny.rateOutOfRange,
	};
}

/* =========================================================
   PAY-PERIOD DATE HELPERS (unchanged from previous impl)
========================================================= */

type PayPeriod = {
	no: string;
	payDate: string;
	periodRange: string;
};

type PaySchedule = {
	pay_frequency:
		| "EVERY_MONTH"
		| "EVERY_WEEK"
		| "EVERY_YEAR"
		| "TWICE_A_MONTH"
		| "OTHER_WEEK";
	first_payday?: string | null;
	first_end_day?: "END_DAY" | "BEFORE_END_DAY" | null;
	first_day?: string | null;
	first_month?: "SAME" | "PREVIOUS" | "NEXT";
	second_payday?: string | null;
	second_end_day?: "END_DAY" | "BEFORE_END_DAY" | null;
	second_day?: string | null;
	second_month?: "SAME" | "PREVIOUS" | "NEXT";
	next_pay_date: string;
	end_of_next_pay_period: string;
};

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

const formatDateRange = (start: Date, end: Date): string =>
	`${formatShortDate(start)} - ${formatShortDate(end)}`;

const addDays = (date: Date, days: number): Date => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

const getDayFromString = (dayStr: string | null | undefined): number => {
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
	const year = baseDate.getFullYear();
	let month = baseDate.getMonth();
	if (relativeTo === "PREVIOUS") month -= 1;
	else if (relativeTo === "NEXT") month += 1;
	return new Date(year, month + offset + 1, 0);
};

const getDateForMonthDay = (
	day: number,
	baseDate: Date,
	offset: number,
	relativeTo: "SAME" | "PREVIOUS" | "NEXT" = "SAME",
): Date => {
	const year = baseDate.getFullYear();
	let month = baseDate.getMonth();
	if (relativeTo === "PREVIOUS") month -= 1;
	else if (relativeTo === "NEXT") month += 1;
	const date = new Date(year, month + offset, day);
	if (date.getDate() !== day) {
		return new Date(year, month + offset + 1, 0);
	}
	return date;
};

/**
 * Generate the next four upcoming pay periods (no/payDate/periodRange)
 * given a pay-schedule definition. Used by Run-payroll.tsx.
 */
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

	const dayGap = Math.round(
		(nextPayDateObj.getTime() - endDateObj.getTime()) / (1000 * 60 * 60 * 24),
	);

	const now = new Date();

	switch (schedule.pay_frequency) {
		case "EVERY_MONTH": {
			const payDayStr = schedule.first_payday || "1";
			const endDayStr = schedule.first_day || schedule.first_payday || "1";
			const relativeMonth: "SAME" | "PREVIOUS" | "NEXT" =
				schedule.first_month || "SAME";
			const payDayNum = getDayFromString(payDayStr);
			const endDayNum = getDayFromString(endDayStr);

			for (let i = 0; i < 4; i++) {
				const payDate =
					payDayNum === -1
						? getLastDayOfMonth(now, i)
						: getDateForMonthDay(payDayNum, now, i);
				const periodEndDate =
					endDayNum === -1
						? getLastDayOfMonth(now, i, relativeMonth)
						: getDateForMonthDay(endDayNum, now, i, relativeMonth);

				const prevEnd =
					endDayNum === -1
						? getLastDayOfMonth(now, i - 1, relativeMonth)
						: getDateForMonthDay(endDayNum, now, i - 1, relativeMonth);
				const periodStartDate = addDays(prevEnd, 1);

				periods.push({
					no: (i + 1).toString().padStart(2, "0"),
					payDate: formatShortDate(payDate),
					periodRange: formatDateRange(periodStartDate, periodEndDate),
				});
			}
			break;
		}

		case "EVERY_WEEK": {
			const startDate = addDays(endDateObj, -6);
			periods.push({
				no: "01",
				payDate: formatShortDate(nextPayDateObj),
				periodRange: formatDateRange(startDate, endDateObj),
			});

			let currentEndDate = new Date(endDateObj);
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
			}
			break;
		}

		case "EVERY_YEAR": {
			const startDate = addDays(endDateObj, -364);
			periods.push({
				no: "01",
				payDate: formatShortDate(nextPayDateObj),
				periodRange: formatDateRange(startDate, endDateObj),
			});
			let currentEndDate = new Date(endDateObj);
			for (let i = 1; i < 4; i++) {
				const nextEndDate = addDays(currentEndDate, 365);
				const nextStartDate = addDays(currentEndDate, 1);
				const nextPayDate = addDays(nextEndDate, dayGap);
				periods.push({
					no: (i + 1).toString().padStart(2, "0"),
					payDate: formatShortDate(nextPayDate),
					periodRange: formatDateRange(nextStartDate, nextEndDate),
				});
				currentEndDate = nextEndDate;
			}
			break;
		}

		case "OTHER_WEEK": {
			const startDate = addDays(endDateObj, -13);
			periods.push({
				no: "01",
				payDate: formatShortDate(nextPayDateObj),
				periodRange: formatDateRange(startDate, endDateObj),
			});
			let currentEndDate = new Date(endDateObj);
			for (let i = 1; i < 4; i++) {
				const nextStartDate = addDays(currentEndDate, 1);
				const nextEndDate = addDays(nextStartDate, 13);
				const nextPayDate = addDays(nextEndDate, dayGap);
				periods.push({
					no: (i + 1).toString().padStart(2, "0"),
					payDate: formatShortDate(nextPayDate),
					periodRange: formatDateRange(nextStartDate, nextEndDate),
				});
				currentEndDate = nextEndDate;
			}
			break;
		}

		case "TWICE_A_MONTH": {
			const firstPayDayStr = schedule.first_payday || "15th";
			const secondPayDayStr = schedule.second_payday || "END_OF_MONTH";
			const firstEndOption = schedule.first_end_day || "END_DAY";
			const secondEndOption = schedule.second_end_day || "END_DAY";
			const firstMonth: "SAME" | "PREVIOUS" | "NEXT" =
				schedule.first_month || "SAME";
			const secondMonth: "SAME" | "PREVIOUS" | "NEXT" =
				schedule.second_month || "SAME";

			const firstPayDayNum = getDayFromString(firstPayDayStr);
			const secondPayDayNum = getDayFromString(secondPayDayStr);

			const firstDaysBefore =
				firstEndOption === "BEFORE_END_DAY"
					? parseInt(schedule.first_day || "0", 10) || 0
					: 0;
			const secondDaysBefore =
				secondEndOption === "BEFORE_END_DAY"
					? parseInt(schedule.second_day || "0", 10) || 0
					: 0;

			let previousEndDate: Date | null = null;
			for (let i = 0; i < 4; i++) {
				const monthOffset = Math.floor(i / 2);
				const isFirstHalf = i % 2 === 0;

				let payDate: Date;
				if (isFirstHalf) {
					payDate =
						firstPayDayNum === -1
							? getLastDayOfMonth(now, monthOffset)
							: getDateForMonthDay(firstPayDayNum, now, monthOffset);
				} else {
					payDate =
						secondPayDayNum === -1
							? getLastDayOfMonth(now, monthOffset)
							: getDateForMonthDay(secondPayDayNum, now, monthOffset);
				}

				let periodEndDate: Date;
				if (isFirstHalf) {
					if (firstEndOption === "BEFORE_END_DAY") {
						periodEndDate = addDays(payDate, -firstDaysBefore);
					} else if (firstPayDayNum === -1) {
						periodEndDate = getLastDayOfMonth(now, monthOffset, firstMonth);
					} else {
						periodEndDate = getDateForMonthDay(
							firstPayDayNum,
							now,
							monthOffset,
							firstMonth,
						);
					}
				} else {
					if (secondEndOption === "BEFORE_END_DAY") {
						periodEndDate = addDays(payDate, -secondDaysBefore);
					} else if (secondPayDayNum === -1) {
						periodEndDate = getLastDayOfMonth(now, monthOffset, secondMonth);
					} else {
						periodEndDate = getDateForMonthDay(
							secondPayDayNum,
							now,
							monthOffset,
							secondMonth,
						);
					}
				}

				let periodStartDate: Date;
				if (previousEndDate) {
					periodStartDate = addDays(previousEndDate, 1);
				} else {
					periodStartDate = new Date(
						now.getFullYear(),
						now.getMonth() + monthOffset,
						1,
					);
				}

				previousEndDate = periodEndDate;
				periods.push({
					no: (i + 1).toString().padStart(2, "0"),
					payDate: formatShortDate(payDate),
					periodRange: formatDateRange(periodStartDate, periodEndDate),
				});
			}
			break;
		}

		default:
			console.warn("Unsupported pay frequency:", schedule.pay_frequency);
			return [];
	}

	return periods;
};

/* =========================================================
   OPTIONAL: FULL PAYROLL ENGINE (2026)
   Mirrors the structure of payroll-calculator.js so other
   parts of the app can opt into the full breakdown if they
   need it. Existing UI does not depend on this directly.
========================================================= */

export type PayrollInput = {
	statePackage?: "MN" | "NYC" | "NY";
	gross: number;
	supplemental?: number;
	preTaxIncome?: number;
	preTaxFica?: number;
	separateSupplemental?: boolean;
	payFrequency: PaySchedule["pay_frequency"] | "EVERY_BIWEEK" | "EVERY_SEMIMONTH";
	filingStatus: string;
	stateFilingStatus?: string;
	stateAllowances?: number;
	residentCity?: "nyc" | "none";
	w4Step2?: boolean;
	fedExtra?: number;
	fedDependents?: number;
	fedOtherIncome?: number;
	fedDeductions?: number;
	stateExtra?: number;
	ssYtd?: number;
	medicareYtd?: number;
	futaYtd?: number;
	futaRate?: number;
	mnUiYtd?: number;
	/** MN UI Tax Rate from MN Tax Rate Determination (decimal or percent). */
	mnUiRate?: number;
	mnUiAdditionalAssessmentRate?: number;
	mnUiFederalLoanInterestRate?: number;
	mnUiWorkforceDevelopmentRate?: number;
	mnPlYtd?: number;
	mnSmallEmployer?: boolean;
	mnPaidLeave?: boolean;
	nyUiYtd?: number;
	nyUiRate?: number;
	nyPflYtd?: number;
	nyCollectPFL?: boolean;
	nyCollectDBL?: boolean;
	mctdQuarterPayroll?: number;
	mctmtZone?: "zone1" | "zone2";
	postTaxDeduction?: number;
	garnishment?: number;
	garnishmentType?: "consumer" | "other";
	garnishmentPct?: number;
};

/**
 * Comprehensive 2026 payroll engine. Returns employee + employer tax
 * components and the resulting net pay. Available for new screens that
 * want a full breakdown without re-implementing every formula.
 */
export function runPayrollCalculation(input: PayrollInput) {
	const periods = periodsFromFrequency(input.payFrequency);
	const weeks = weeksFromFrequency(input.payFrequency);
	const gross = Math.max(0, Number(input.gross) || 0);
	const supplemental = Math.max(0, Number(input.supplemental) || 0);
	const preTaxIncome = Math.max(0, Number(input.preTaxIncome) || 0);
	const preTaxFica = Math.max(0, Number(input.preTaxFica) || 0);
	const incomeTaxableTotal = Math.max(0, gross - preTaxIncome);
	const incomeTaxableRegular = Math.max(0, gross - supplemental - preTaxIncome);
	const ficaWages = Math.max(0, gross - preTaxFica);
	const regularForWithholding = input.separateSupplemental
		? incomeTaxableRegular
		: incomeTaxableTotal;
	const supplementalForWithholding = input.separateSupplemental ? supplemental : 0;

	// --- Federal income tax (IRS Pub. 15-T Worksheet 1A — identical method to
	//     `federalIncomeTax()` in payroll-calculator.js so results match exactly)
	const fitResult = pub15tFederalIncomeTax({
		incomePerPeriod: regularForWithholding,
		payPeriods: periods,
		w4: {
			filingStatus: input.filingStatus,
			multipleJobsOrSpouseWorks: input.w4Step2,
			step3DependentsAmount: input.fedDependents,
			step4aOtherIncome: input.fedOtherIncome,
			step4bDeductions: input.fedDeductions,
			step4cExtraWithholding: input.fedExtra,
			separateSupplemental: input.separateSupplemental,
			supplementalThisPeriod: supplementalForWithholding,
		},
	});
	const fit = fitResult.withholdingPerPeriod;
	const fs = normalizeFilingStatus(input.filingStatus);

	// --- FICA
	const ssTaxable = ytdTaxable(ficaWages, input.ssYtd || 0, CONFIG.federal.ssWageBase);
	const ssEE = round2(ssTaxable * CONFIG.federal.ssRate);
	const ssER = ssEE;
	const medEE = round2(ficaWages * CONFIG.federal.medicareRate);
	const medER = medEE;
	const ytdMedicare = input.medicareYtd || 0;
	const addMedBase =
		Math.max(0, ytdMedicare + ficaWages - CONFIG.federal.addMedicareThreshold) -
		Math.max(0, ytdMedicare - CONFIG.federal.addMedicareThreshold);
	const addMed = round2(Math.max(0, addMedBase) * CONFIG.federal.addMedicareRate);

	// --- FUTA
	const futaTaxable = ytdTaxable(gross, input.futaYtd || 0, CONFIG.federal.futaWageBase);
	const futaRate = input.futaRate != null ? input.futaRate / 100 : CONFIG.federal.futaRate;
	const futa = round2(futaTaxable * futaRate);

	// --- State / city / leave
	let stateTax = 0;
	let localTax = 0;
	let pfl = 0;
	let dbl = 0;
	let mnPLEE = 0;
	let mnPLER = 0;
	let ui = 0;
	let nyRsf = 0;
	let nyUiRateOutOfRange = false;
	let mctmt = 0;
	let mnUiBreakdown: ReturnType<typeof calculateMnUnemploymentTax> | null = null;
	const stateFs = normalizeFilingStatus(input.stateFilingStatus || input.filingStatus);
	const stateAllow = Math.max(0, Math.floor(Number(input.stateAllowances) || 0));

	if (input.statePackage === "MN") {
		const stateStd =
			CONFIG.mn.standardDeduction[stateFs] ?? CONFIG.mn.standardDeduction.single;
		const allowance = stateAllow * CONFIG.mn.allowanceValue;
		const annualTaxable = Math.max(
			0,
			regularForWithholding * periods - stateStd - allowance,
		);
		stateTax = round2(
			progressiveTax(
				annualTaxable,
				CONFIG.mn.brackets[stateFs] || CONFIG.mn.brackets.single,
			) /
				periods +
				(input.stateExtra || 0),
		);
		if (input.separateSupplemental && supplementalForWithholding > 0) {
			stateTax += round2(supplementalForWithholding * CONFIG.mn.supplementalRate);
		}
		if (input.mnPaidLeave) {
			const plTaxable = ytdTaxable(gross, input.mnPlYtd || 0, CONFIG.mn.paidLeaveWageBase);
			mnPLEE = round2(plTaxable * CONFIG.mn.paidLeaveEmployeeRate);
			const erRate = input.mnSmallEmployer
				? CONFIG.mn.paidLeaveEmployerSmallRate
				: CONFIG.mn.paidLeaveEmployerStandardRate;
			mnPLER = round2(plTaxable * erRate);
		}
		// Full MN UI breakdown (UI base + Additional Assessment + Federal
		// Loan Interest + Workforce Development Fee). `ui` represents the
		// UI Employer base only — the other components are surfaced
		// separately on `mnUiBreakdown` below.
		mnUiBreakdown = calculateMnUnemploymentTax(gross, {
			ytdWages: input.mnUiYtd || 0,
			uiRate: input.mnUiRate,
			additionalAssessmentRate: input.mnUiAdditionalAssessmentRate,
			federalLoanInterestRate: input.mnUiFederalLoanInterestRate,
			workforceDevelopmentRate: input.mnUiWorkforceDevelopmentRate,
		});
		ui = mnUiBreakdown.amounts.uiEmployer;
	} else {
		// NY / NYC
		const nyFs = stateFs === "married" ? "married" : "single";
		const exemption =
			(CONFIG.ny.exemptionBase[nyFs] ?? CONFIG.ny.exemptionBase.single) +
			stateAllow * CONFIG.ny.exemptionPerAllowance;
		const annualTaxable = Math.max(0, regularForWithholding * periods - exemption);
		const rows = CONFIG.ny.nysAnnualMethodII[nyFs] || CONFIG.ny.nysAnnualMethodII.single;
		stateTax = round2(tableTax(annualTaxable, rows) / periods + (input.stateExtra || 0));
		if (input.separateSupplemental && supplementalForWithholding > 0) {
			stateTax += round2(supplementalForWithholding * CONFIG.ny.stateSupplementalRate);
		}

		if (input.residentCity === "nyc") {
			const nycExemption =
				(CONFIG.ny.nycExemptionBase[nyFs] ?? CONFIG.ny.nycExemptionBase.single) +
				stateAllow * CONFIG.ny.nycExemptionPerAllowance;
			const nycTaxable = Math.max(0, regularForWithholding * periods - nycExemption);
			localTax = round2(
				tableTax(nycTaxable, CONFIG.ny.nycAnnualMethodII[nyFs]) / periods,
			);
			if (input.separateSupplemental && supplementalForWithholding > 0) {
				localTax += round2(supplementalForWithholding * CONFIG.ny.nycSupplementalRate);
			}
		}

		if (input.nyCollectPFL) {
			const remainingPFL = Math.max(0, CONFIG.ny.pflAnnualCap - (input.nyPflYtd || 0));
			pfl = round2(Math.min(remainingPFL, gross * CONFIG.ny.pflRate));
		}
		if (input.nyCollectDBL) {
			dbl = round2(
				Math.min(gross * CONFIG.ny.dblRate, CONFIG.ny.dblWeeklyCap * weeks),
			);
		}
		const nyUiTaxable = ytdTaxable(gross, input.nyUiYtd || 0, CONFIG.ny.uiWageBase);
		const nyUiRate = input.nyUiRate != null ? input.nyUiRate / 100 : CONFIG.ny.uiDefaultRate;
		ui = round2(nyUiTaxable * nyUiRate);
		// NY 2026: RSF (0.075%) is a SEPARATE employer line on NYS-45, not
		// blended into the UI rate. Exposed via `employerTaxes.nyRsf` below.
		nyRsf = round2(nyUiTaxable * CONFIG.ny.rsfRate);
		nyUiRateOutOfRange =
			nyUiRate < CONFIG.ny.uiLowestRate ||
			nyUiRate > CONFIG.ny.uiHighestRate;

		// MCTMT (NYC only)
		if (input.statePackage === "NYC") {
			const quarterTotal = (input.mctdQuarterPayroll || 0) + gross;
			if (quarterTotal > CONFIG.ny.mctmtThreshold) {
				const zone = input.mctmtZone || "zone1";
				const rateRow =
					CONFIG.ny.mctmtRates[zone].find(
						(r: number[]) => quarterTotal > r[0] && quarterTotal <= r[1],
					) || CONFIG.ny.mctmtRates[zone][CONFIG.ny.mctmtRates[zone].length - 1];
				mctmt = round2(gross * rateRow[2]);
			}
		}
	}

	// --- Garnishment + post-tax + totals
	const mandatoryDeductionsBeforeGarnishment =
		fit + ssEE + medEE + addMed + stateTax + localTax + pfl + dbl + mnPLEE;
	const disposable = Math.max(0, gross - mandatoryDeductionsBeforeGarnishment);
	let garnishmentAllowed = 0;
	const requestedGarnishment = Math.max(0, Number(input.garnishment) || 0);
	if (requestedGarnishment > 0) {
		if (input.garnishmentType === "consumer") {
			const ccpa25 = disposable * 0.25;
			const ccpa30MinWage = Math.max(0, disposable - 30 * 7.25 * weeks);
			garnishmentAllowed = Math.min(ccpa25, ccpa30MinWage);
		} else {
			garnishmentAllowed = disposable * ((Number(input.garnishmentPct) || 0) / 100);
		}
	}
	const garnishment = round2(
		Math.min(requestedGarnishment, Math.max(0, garnishmentAllowed)),
	);
	const postTax = round2(Number(input.postTaxDeduction) || 0);
	const employeeTotal = round2(
		mandatoryDeductionsBeforeGarnishment + garnishment + postTax,
	);
	const netPay = round2(gross - employeeTotal);

	// When MN is selected, the UI line ("ui") is just the UI Employer base.
	// The other three components live on `mnUiBreakdown` and must be added
	// separately to the employer-tax total (matching the new
	// payroll-calculator (1).js logic).
	const mnUiAdditionalAssessment =
		mnUiBreakdown?.amounts.additionalAssessment ?? 0;
	const mnUiFederalLoanInterestAssessment =
		mnUiBreakdown?.amounts.federalLoanInterestAssessment ?? 0;
	const mnUiWorkforceDevelopmentFee =
		mnUiBreakdown?.amounts.workforceDevelopmentFee ?? 0;
	const mnUiTotal = mnUiBreakdown?.amounts.total ?? 0;
	const mnUiEmployerTotal =
		input.statePackage === "MN" ? mnUiTotal : ui;
	// NY 2026: RSF (0.075%) is added to the employer-tax total as its own
	// line. It is only applicable on the NY branch; `nyRsf` stays 0 otherwise.
	const employerTaxes = round2(
		ssER + medER + futa + mnUiEmployerTotal + nyRsf + mnPLER + mctmt,
	);

	return {
		periods,
		weeks,
		bases: {
			incomeTaxableRegular,
			incomeTaxableTotal,
			ficaWages,
			ssTaxable,
			futaTaxable,
			mnUiTaxable: mnUiBreakdown?.taxable ?? 0,
			disposable,
		},
		employeeTaxes: {
			fit,
			ssEE,
			medEE,
			addMed,
			/** NY State income tax only (never includes NYC resident portion). */
			stateTax,
			/** NYC resident income tax — non-zero only when residentCity === "nyc". */
			nycResidentTax: localTax,
			/** @deprecated Use stateTax + nycResidentTax separately. Kept for callers that
			 *  need a combined total (e.g. net-pay subtotals). */
			localTax,
			pfl,
			dbl,
			mnPLEE,
			garnishment,
			postTax,
			employeeTotal,
		},
		employerTaxes: {
			ssER,
			medER,
			futa,
			ui,
			nyRsf,
			nyUiRateOutOfRange,
			mnUiAdditionalAssessment,
			mnUiFederalLoanInterestAssessment,
			mnUiWorkforceDevelopmentFee,
			mnUiTotal,
			mnUiBreakdown,
			mnPLER,
			mctmt,
			employerTaxes,
		},
		netPay,
	};
}

/* =========================================================
   Payroll component YTD helpers (from saved salary process)
========================================================= */

export type PayrollComponentRecord = {
	payroll_type?: string;
	payroll_category?: string;
	ytd?: string | number;
	current?: string | number;
};

/** Latest saved salary-process components for an employee (by pay_date). */
export function getEmployeePayrollComponents(
	allinfo?: { payroll_salary_process?: Array<Record<string, unknown>> } | null,
): PayrollComponentRecord[] {
	const processes = allinfo?.payroll_salary_process ?? [];
	if (!processes.length) return [];

	const sorted = [...processes].sort((a, b) => {
		const dateA = new Date(
			String(a.pay_date ?? a.created_at ?? 0),
		).getTime();
		const dateB = new Date(
			String(b.pay_date ?? b.created_at ?? 0),
		).getTime();
		return dateB - dateA;
	});

	const components = sorted[0]?.payroll_components;
	return Array.isArray(components) ? (components as PayrollComponentRecord[]) : [];
}

const normalizePayrollType = (value: string) =>
	value.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");

/** YTD for the first matching payroll_type alias (case/space insensitive). */
export function getPayrollComponentYtd(
	components: PayrollComponentRecord[],
	...typeKeys: string[]
): string {
	if (!components?.length || !typeKeys.length) return "0";

	const normalizedKeys = typeKeys.map(normalizePayrollType);
	const found = components.find((c) => {
		const pt = normalizePayrollType(String(c.payroll_type ?? ""));
		return normalizedKeys.some(
			(key) => pt === key || pt.endsWith(key) || key.endsWith(pt),
		);
	});

	const ytd = found?.ytd;
	if (ytd === undefined || ytd === null || ytd === "") return "0";
	const num = Number(ytd);
	return Number.isFinite(num) ? String(num) : "0";
}

/** YTD by payroll_category + optional payroll_type filter. */
export function getPayrollComponentYtdByCategory(
	components: PayrollComponentRecord[],
	category: string,
	payrollType?: string,
): string {
	const cat = category.toUpperCase();
	const filtered = components.filter(
		(c) => String(c.payroll_category ?? "").toUpperCase() === cat,
	);
	if (payrollType) {
		return getPayrollComponentYtd(filtered, payrollType);
	}
	const total = filtered.reduce((sum, c) => sum + Number(c.ytd ?? 0), 0);
	return Number.isFinite(total) ? String(total) : "0";
}

/* =========================================================
   CROSS-PAYROLL YTD AGGREGATION (the trusted YTD source)
   ---------------------------------------------------------
   The legacy save path persisted `ytd: 0` on every payroll
   component, so `getPayrollComponentYtd` (which reads the
   latest payroll's `ytd` field) returns 0. The functions below
   walk EVERY saved payroll run for the employee in the current
   tax year and sum the `current` values — giving an accurate
   YTD even when historical rows have ytd=0.
========================================================= */

/** Pull the full saved-payroll history for an employee from the
 *  `allinfo.payroll_salary_process` Redux/API blob. Returns an array
 *  of `{ pay_date, gross_pay, payroll_components[] }` runs (already
 *  scoped to the current employee). */
export function getEmployeePayrollHistory(
	allinfo?: { payroll_salary_process?: Array<Record<string, any>> } | null,
): Array<{
	pay_date: string;
	gross_pay: number;
	payroll_components: PayrollComponentRecord[];
}> {
	const processes = allinfo?.payroll_salary_process ?? [];
	if (!processes.length) return [];
	return processes.map((p) => ({
		pay_date: String(p?.pay_date ?? p?.created_at ?? ""),
		gross_pay: Number(p?.gross_pay ?? 0) || 0,
		payroll_components: Array.isArray(p?.payroll_components)
			? (p.payroll_components as PayrollComponentRecord[])
			: [],
	}));
}

/** Year part of an ISO-ish date string ("2026-04-15…" → 2026). */
const yearOf = (dateStr: string): number => {
	if (!dateStr) return NaN;
	const d = new Date(dateStr);
	const y = d.getFullYear();
	return Number.isFinite(y) ? y : NaN;
};

/**
 * Sum of `gross_pay` across all saved payrolls for the employee in
 * the given calendar year (defaults to current year). Used as a
 * baseline YTD wage figure for FUTA, NY UI, MN UI, and Social
 * Security/Medicare when no tax-specific bucket is tracked.
 *
 * If `excludePayPeriod` is provided, payrolls matching that
 * `pay_period` string are excluded — useful when rendering a payroll
 * being previewed that has already been partially persisted.
 */
export function getEmployeeYtdGrossWages(
	allinfo?: { payroll_salary_process?: Array<Record<string, any>> } | null,
	currentYear?: number,
	excludePayPeriod?: string,
): number {
	const year = currentYear ?? new Date().getFullYear();
	const processes = allinfo?.payroll_salary_process ?? [];
	let total = 0;
	for (const p of processes) {
		const py = yearOf(String(p?.pay_date ?? p?.created_at ?? ""));
		if (!Number.isFinite(py) || py !== year) continue;
		if (
			excludePayPeriod &&
			String(p?.pay_period ?? "") === excludePayPeriod
		)
			continue;
		total += Number(p?.gross_pay ?? 0) || 0;
	}
	return round2(total);
}

/**
 * Sum of `current` values for one or more matching payroll_type
 * keys (case/space insensitive) across all saved payrolls in the
 * given calendar year. This is the trustworthy YTD source for a
 * specific tax/contribution line because it does not rely on the
 * legacy (broken) per-component `ytd` field.
 *
 * Example: `getEmployeeYtdComponentSum(allinfo, 'FUTA_EMPLOYER')`
 * returns the total FUTA paid year-to-date.
 */
export function getEmployeeYtdComponentSum(
	allinfo?: { payroll_salary_process?: Array<Record<string, any>> } | null,
	typeKeys: string[] = [],
	currentYear?: number,
	excludePayPeriod?: string,
): number {
	if (!typeKeys.length) return 0;
	const year = currentYear ?? new Date().getFullYear();
	const normalizedKeys = typeKeys.map(normalizePayrollType);
	const processes = allinfo?.payroll_salary_process ?? [];
	let total = 0;
	for (const p of processes) {
		const py = yearOf(String(p?.pay_date ?? p?.created_at ?? ""));
		if (!Number.isFinite(py) || py !== year) continue;
		if (
			excludePayPeriod &&
			String(p?.pay_period ?? "") === excludePayPeriod
		)
			continue;
		const comps = Array.isArray(p?.payroll_components)
			? (p.payroll_components as PayrollComponentRecord[])
			: [];
		for (const c of comps) {
			const pt = normalizePayrollType(String(c.payroll_type ?? ""));
			const matches = normalizedKeys.some(
				(key) => pt === key || pt.endsWith(key) || key.endsWith(pt),
			);
			if (matches) total += Number(c.current ?? 0) || 0;
		}
	}
	return round2(total);
}

/**
 * Year-to-date subject wages for a specific tax type. We approximate
 * subject wages as the sum of gross_pay for every payroll where the
 * given tax line was present and non-zero. (For an exempt period the
 * matching component would have been dropped by the
 * `.filter(item.current > 0)` step in the save flow, so we correctly
 * treat those gross dollars as NOT subject to that tax.)
 */
export function getEmployeeYtdSubjectWages(
	allinfo: { payroll_salary_process?: Array<Record<string, any>> } | null,
	typeKeys: string[],
	currentYear?: number,
	excludePayPeriod?: string,
): number {
	if (!typeKeys?.length) return 0;
	const year = currentYear ?? new Date().getFullYear();
	const normalizedKeys = typeKeys.map(normalizePayrollType);
	const processes = allinfo?.payroll_salary_process ?? [];
	let total = 0;
	for (const p of processes) {
		const py = yearOf(String(p?.pay_date ?? p?.created_at ?? ""));
		if (!Number.isFinite(py) || py !== year) continue;
		if (
			excludePayPeriod &&
			String(p?.pay_period ?? "") === excludePayPeriod
		)
			continue;
		const comps = Array.isArray(p?.payroll_components)
			? (p.payroll_components as PayrollComponentRecord[])
			: [];
		const hadTax = comps.some((c) => {
			const pt = normalizePayrollType(String(c.payroll_type ?? ""));
			return normalizedKeys.some(
				(key) => pt === key || pt.endsWith(key) || key.endsWith(pt),
			);
		});
		if (hadTax) total += Number(p?.gross_pay ?? 0) || 0;
	}
	return round2(total);
}

/**
 * Convenience: pre-computed PRIOR-YTD buckets used by every
 * wage-base-aware calculation. Computed against `allinfo`
 * (Run-payroll's `newonj.allinfo`) excluding the pay period
 * currently being calculated/saved so the same record can be
 * re-previewed without double-counting.
 */
export type EmployeePriorYtd = {
	year: number;
	grossWages: number;
	socialSecurityWages: number;
	medicareWages: number;
	futaWages: number;
	nyUiWages: number;
	mnUiWages: number;
	pflWithheld: number;
	federalIncomeTax: number;
	socialSecurityTax: number;
	socialSecurityTaxEmployer: number;
	medicareTax: number;
	additionalMedicareTax: number;
	stateIncomeTax: number;
	/** NYC Resident income tax YTD (separate from NY State income tax). */
	nycResidentTax: number;
	nySdi: number;
	nyPfl: number;
	mnPaidLeaveEmployee: number;
	futaTax: number;
	nySuiTax: number;
	nyRsfTax: number;
	mnUiTotal: number;
};

/** Build the PriorYtd snapshot for `allinfo` (one employee). */
export function buildEmployeePriorYtd(
	allinfo?: { payroll_salary_process?: Array<Record<string, any>> } | null,
	currentYear?: number,
	excludePayPeriod?: string,
): EmployeePriorYtd {
	const year = currentYear ?? new Date().getFullYear();
	const safeAllInfo = allinfo ?? null;
	const grossWages = getEmployeeYtdGrossWages(safeAllInfo, year, excludePayPeriod);
	const sum = (keys: string[]) =>
		getEmployeeYtdComponentSum(safeAllInfo, keys, year, excludePayPeriod);
	const subjectWages = (keys: string[]) =>
		getEmployeeYtdSubjectWages(safeAllInfo, keys, year, excludePayPeriod);

	return {
		year,
		grossWages,
		socialSecurityWages: subjectWages([
			"SOCIAL_SECURITY",
			"SOCIAL_SECURITY_EMPLOYER",
		]),
		medicareWages: subjectWages(["MEDICARE", "MEDICARE_EMPLOYER"]),
		futaWages: subjectWages(["FUTA_EMPLOYER"]),
		nyUiWages: subjectWages([
			"NYS_EMPLOYMENT_TAXES",
			"NY_SUI_EMPLOYER",
			"NY_UNEMPLOYMENT_TAXES",
		]),
		mnUiWages: subjectWages([
			"MN_UI_EMPLOYER",
			"MN_UNEMPLOYMENT_TAXES",
		]),
		pflWithheld: sum(["NY_FLI", "FLI", "PFL"]),
		federalIncomeTax: sum(["FEDERAL_INCOME_TAX"]),
		socialSecurityTax: sum(["SOCIAL_SECURITY"]),
		socialSecurityTaxEmployer: sum(["SOCIAL_SECURITY_EMPLOYER"]),
		medicareTax: sum(["MEDICARE"]),
		additionalMedicareTax: sum(["ADDITIONAL_MEDICARE"]),
		stateIncomeTax: sum([
			"_INCOME_TAX",
			"NY_INCOME_TAX",
			"MN_INCOME_TAX",
			"STATE_INCOME_TAX",
		]),
		nycResidentTax: sum(["NYC_RESIDENT_TAX"]),
		nySdi: sum(["SDI", "NY_SDI"]),
		nyPfl: sum(["NY_FLI", "FLI", "PFL"]),
		mnPaidLeaveEmployee: sum(["MN_PAID_LEAVE"]),
		futaTax: sum(["FUTA_EMPLOYER"]),
		nySuiTax: sum([
			"NYS_EMPLOYMENT_TAXES",
			"NY_SUI_EMPLOYER",
			"NY_UNEMPLOYMENT_TAXES",
		]),
		nyRsfTax: sum(["NY_RSF"]),
		mnUiTotal: sum([
			"MN_UI_EMPLOYER",
			"MN_WORKFORCE_DEVELOPMENT_FEE",
			"MN_FEDERAL_LOAN_INTEREST_ASSESSMENT",
			"MN_ADDITIONAL_ASSESSMENT",
		]),
	};
}
