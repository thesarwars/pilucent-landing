/**
 * Shared Employee Tax Info / W-4 configuration.
 *
 * Implements the data layer described in
 * "Balanzify Employee Tax Info UI & W-4 Compliance Logic 2026":
 *  - W-4 PDF field map (Tax Info input -> generated Form W-4 field id)
 *  - State tax adapter registry (NY / MN) so the UI is rule-driven, not a
 *    single hard-coded form
 *  - Derived tax-location resolver (resident vs work jurisdiction)
 *  - Tax Profile Summary badge logic
 *  - W-4 payload builder used by the Documents tab W-4 generator
 *
 * Note: effective-dated certificates, lock-in letters, audit trail and the
 * actual withholding math live on the backend. This module covers the
 * frontend rule layer only.
 */
import React from "react";

/* ------------------------------------------------------------------ *
 * 1. W-4 PDF field map
 * ------------------------------------------------------------------ */

export interface W4FieldRef {
  /** Field id inside the generated Form W-4 PDF template. */
  id: string;
  /** Short human label for the helper chip / tooltip. */
  label: string;
}

/**
 * Maps a logical Tax Info input to its Form W-4 PDF field id.
 * The Documents tab W-4 generator and the helper chips both read this.
 */
export const W4_FIELDS = {
  firstMiddleName: { id: "f1_01[0]", label: "Step 1(a) name" },
  lastName: { id: "f1_02[0]", label: "Step 1(a) last name" },
  address: { id: "f1_03[0]", label: "Step 1(a) address" },
  cityStateZip: { id: "f1_04[0]", label: "Step 1(a) city/state/ZIP" },
  ssn: { id: "f1_05[0]", label: "Step 1(b) SSN" },
  filingSingle: { id: "c1_1[0]", label: "Step 1(c) Single/MFS" },
  filingMarried: { id: "c1_1[1]", label: "Step 1(c) MFJ" },
  filingHead: { id: "c1_1[2]", label: "Step 1(c) HoH" },
  multipleJobs: { id: "c1_2[0]", label: "Step 2(c)" },
  // IRS 2025 fw4.pdf — Page 1 field map.
  // Corrected based on live rendering evidence (screenshot):
  //   f1_14 renders in the "First date of employment" cell (NOT Step 5 date).
  //   f1_15 renders in the "Employer identification number (EIN)" cell.
  //   f1_16 renders in the "Employer name and address" cell.
  //   f1_17 is used for the Step 5 signed-date (not always visible as a
  //          fillable field; the bitmap signature handles Step 5).
  //
  //   Step 3:  f1_06 (children × $2,000) · f1_07 (other deps × $500) · f1_09 (total)
  //   Step 4:  f1_10 (4a) · f1_11 (4b) · f1_12 (4c)
  //   Step 5:  f1_13 (signature text) · f1_17 (date)
  //   Employer: f1_14 (first date of employment) · f1_15 (EIN) · f1_16 (name/address)
  step3Children: { id: "f1_06[0]", label: "Step 3 qualifying children" },
  step3Dependents: { id: "f1_07[0]", label: "Step 3 other dependents" },
  step3Total: { id: "f1_09[0]", label: "Step 3 total credits" },
  otherIncome: { id: "f1_10[0]", label: "Step 4(a) other income" },
  deductions: { id: "f1_11[0]", label: "Step 4(b) deductions" },
  extraWithholding: { id: "f1_12[0]", label: "Step 4(c) extra withholding" },
  fedAdditional: { id: "f3_04[0]", label: "Federal additional" },
  stateAdditional: { id: "f3_05[0]", label: "State additional withholding" },
  fedExempt: { id: "f3_06[0]", label: "Federal exempt" },
  stateExempt: { id: "f3_07[0]", label: "State exempt" },
  fedAmount: { id: "f3_08[0]", label: "Federal amount" },
  stateAmount: { id: "f3_09[0]", label: "State amount" },
  fedStatus: { id: "f3_10[0]", label: "Federal withholding status" },
  stateStatus: { id: "f3_11[0]", label: "State withholding status" },
  signature: { id: "f1_13[0]", label: "Step 5 signature" },
  signedDate: { id: "f1_17[0]", label: "Step 5 date" },
  employer: { id: "f1_16[0]", label: "Employer name/address" },
  firstEmployment: { id: "f1_14[0]", label: "First date of employment" },
  ein: { id: "f1_15[0]", label: "Employer EIN" },
} as const;

export type W4FieldKey = keyof typeof W4_FIELDS;

/**
 * Subtle helper chip rendered beside a Tax Info input so it is clear which
 * W-4 PDF field that input feeds. See `Balanzify ... W-4 Compliance Logic`
 * section 6, "Form W-4 generation mapping".
 */
export const W4Chip = ({ field }: { field: W4FieldKey }) => {
  const f = W4_FIELDS[field];
  if (!f) return null;
  return (
    <span
      title={`Feeds generated Form W-4 field ${f.id} (${f.label})`}
      className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-indigo-600"
    >
      W-4 · {f.id}
    </span>
  );
};

/* ------------------------------------------------------------------ *
 * 2. Location constants (NYC boroughs / MCTD zones)
 * ------------------------------------------------------------------ */

/** Cities/boroughs that count as New York City residence. */
export const NYC_LOCALITIES = [
  "new york",
  "new york city",
  "nyc",
  "manhattan",
  "brooklyn",
  "bronx",
  "queens",
  "staten island",
];

/** MCTD Zone 1 counties (highest MCTMT exposure). */
export const MCTD_ZONE1_COUNTIES = [
  "new york",
  "manhattan",
  "bronx",
  "kings",
  "brooklyn",
  "queens",
  "richmond",
  "staten island",
];

/** MCTD Zone 2 counties. */
export const MCTD_ZONE2_COUNTIES = [
  "rockland",
  "nassau",
  "suffolk",
  "orange",
  "putnam",
  "dutchess",
  "westchester",
];

const norm = (v: any) => String(v ?? "").trim().toLowerCase();

/* ------------------------------------------------------------------ *
 * 3. State tax adapter registry
 * ------------------------------------------------------------------ */

export interface StateExtraField {
  /** Property name persisted on the state tax certificate. */
  key: string;
  label: string;
  type: "select" | "number" | "text";
  options?: { value: string; title: string }[];
  required?: boolean;
  help?: string;
  /** When true, only show if the employee is an NYC resident. */
  nycResidentOnly?: boolean;
  /** When true, only show if the employee works in / lives in Yonkers. */
  yonkersOnly?: boolean;
}

/** A single state payroll-program checkbox (PFL, SDI, PFML, …). */
export interface StateProgramCheckbox {
  /** Boolean property persisted on the state tax certificate. */
  key: string;
  label: string;
}

export type StateNoteTone = "info" | "warn" | "good";

/** An inline explanatory note shown inside a state program block. */
export interface StateProgramNote {
  text: string;
  tone: StateNoteTone;
}

/**
 * State-specific payroll program block (NY PFL/DBL, CA SDI, MA PFML, …).
 * Mirrors the dynamic "programs" section of the QBO-style withholdings UI.
 */
export interface StateProgramBlock {
  title: string;
  checkboxes: StateProgramCheckbox[];
  notes: StateProgramNote[];
}

/** A single selectable local-jurisdiction tax (NY MCTMT, OH municipality, …). */
export interface StateLocalTaxOption {
  /** Value persisted to the `local_tax` field (e.g. "MCTMT"). */
  value: string;
  label: string;
}

/**
 * Local tax block (city / county / metropolitan jurisdiction taxes).
 * Rendered as a checklist; the selected option is persisted on `local_tax`.
 * Use `{name}` in `description` to interpolate the employee's name.
 */
export interface StateLocalTaxBlock {
  title: string;
  description: string;
  learnMoreUrl?: string;
  options: StateLocalTaxOption[];
}

export interface StateAdapter {
  code: string;
  name: string;
  /** State withholding certificate(s) this state uses. */
  certificateForms: string;
  /** Legal default applied when no certificate is on file. */
  defaultRule: string;
  /** Per-state relabelling of the shared generic certificate fields. */
  labels: {
    martial_status: string;
    total_allowance: string;
    additional_with_holdings: string;
    total: string;
    exempt: string;
  };
  help: Partial<Record<string, string>>;
  /** Genuinely state-specific fields beyond the shared generic set. */
  extraFields: StateExtraField[];
  /** Display-only local / employer tax notes. */
  localTaxNotes: string[];
  /**
   * State / employer payroll-tax exemptions the employee may be subject to.
   * Rendered as the dynamic "Tax exemptions" checklist.
   */
  taxExemptions: string[];
  /** State-specific payroll program block (paid leave, disability, local). */
  programs: StateProgramBlock | null;
  /** Local jurisdiction taxes (city / county / metro) the employee may opt into. */
  localTaxes: StateLocalTaxBlock | null;
}

const NY_ADAPTER: StateAdapter = {
  code: "NY",
  name: "New York",
  certificateForms: "IT-2104 / IT-2104-E / IT-2104.1",
  defaultRule:
    "If a 2020+ federal W-4 exists and no IT-2104 is filed, New York uses zero allowances.",
  labels: {
    martial_status: "NY filing / marital status (IT-2104)",
    total_allowance: "NY total allowances (IT-2104)",
    additional_with_holdings: "Additional NYS withholding (IT-2104)",
    total: "NY withholding amount",
    exempt: "NY exemption (IT-2104-E)",
  },
  help: {
    total_allowance:
      "More allowances generally reduce NY withholding. Zero is the conservative default required for a 2020+ federal W-4 with no IT-2104.",
    exempt:
      "NY withholding is suppressed only while a valid IT-2104-E exemption certificate is active.",
  },
  extraFields: [
    {
      key: "ny_certificate_type",
      label: "NY certificate type",
      type: "select",
      required: true,
      help: "IT-2104 for standard withholding, IT-2104-E for exemption, IT-2104.1 for nonresident / Yonkers allocation.",
      options: [
        { value: "IT_2104", title: "IT-2104 (standard)" },
        { value: "IT_2104_E", title: "IT-2104-E (exempt)" },
        { value: "IT_2104_1", title: "IT-2104.1 (nonresident allocation)" },
      ],
    },
    {
      key: "nyc_residency_override",
      label: "NYC residency (manual override)",
      type: "select",
      help: "Overrides the automatic NYC-residency detection that reads the employee's home address. Use 'Exempt — not NYC resident' when the employee lives at a NYC address but qualifies as a statutory non-resident (e.g. domicile outside NYC, present <183 days). Use 'Force NYC resident' when the address is outside NYC but the employee is actually a full-year NYC resident.",
      options: [
        { value: "", title: "Auto-detect from home address (default)" },
        { value: "nyc", title: "Force NYC resident — apply NYC tax" },
        { value: "none", title: "Exempt — not NYC resident (no NYC tax)" },
      ],
    },
    {
      key: "additional_nyc_withholding",
      label: "Additional NYC withholding",
      type: "number",
      nycResidentOnly: true,
      help: "Extra NYC resident tax withheld per paycheck. Only applies to NYC residents.",
    },
    {
      key: "yonkers_nonresident_allocation",
      label: "Yonkers nonresident allocation (%)",
      type: "number",
      yonkersOnly: true,
      help: "Percentage of wages allocated to Yonkers for the nonresident earnings tax (IT-2104.1).",
    },
  ],
  localTaxNotes: [
    "NYC resident withholding applies only to NYC residents — never because of an NYC work location alone.",
    "Yonkers resident tax applies to Yonkers residents; Yonkers nonresident earnings tax applies via wage allocation.",
    "Employer-side MCTMT is evaluated from the work location zone and is not deducted from employee pay.",
  ],
  programs: {
    title: "New York Paid Family Leave & Disability Benefits",
    checkboxes: [
      { key: "ny_pfl_exempt", label: "Employee is exempt from NY Paid Family Leave (PFL)" },
      {
        key: "ny_dbl_exempt",
        label: "Employee is exempt from NY SDI / Disability Benefits (DBL)",
      },
    ],
    notes: [
      {
        tone: "info",
        text: "NY PFL is normally an employee deduction unless the employer elects to pay it. NY SDI/DBL may be collected from the employee if the employer elects to collect it. Keep PFL and SDI separate in the payroll tax breakdown.",
      },
    ],
  },
  localTaxes: {
    title: "Local taxes",
    description:
      "Select the local taxes {name} is subject to. This list is based on where {name} lives and works.",
    learnMoreUrl: "https://www.tax.ny.gov/bus/mctmt/default.htm",
    options: [
      { value: "MCTMT", label: "New York MCTMT Er, New York County" },
    ],
  },
  taxExemptions: [
    "FUTA",
    "Social Security and Medicare",
    "NY SUI and Re-Employment",
  ],
};

const MN_ADAPTER: StateAdapter = {
  code: "MN",
  name: "Minnesota",
  certificateForms: "W-4MN / MWR",
  defaultRule:
    "If no valid W-4MN is on file, Minnesota defaults to Single with zero allowances.",
  labels: {
    martial_status: "MN filing status (W-4MN)",
    total_allowance: "MN allowances (W-4MN Section 1)",
    additional_with_holdings: "Additional MN withholding (W-4MN)",
    total: "MN withholding amount",
    exempt: "MN exemption (W-4MN Section 2)",
  },
  help: {
    total_allowance: "Allowance count used in Minnesota regular-wage withholding.",
    exempt:
      "Minnesota withholding is suppressed only while a valid W-4MN Section 2 exemption is active.",
  },
  extraFields: [
    {
      key: "mwr_reciprocity_state",
      label: "MWR reciprocity (Form MWR)",
      type: "select",
      help: "Minnesota withholding is suppressed when the employee lives in MI or ND and a valid MWR is on file.",
      options: [
        { value: "", title: "Not applicable" },
        { value: "MI", title: "Michigan resident (MWR)" },
        { value: "ND", title: "North Dakota resident (MWR)" },
      ],
    },
    {
      key: "is_employee_exempt_from_family_paid_leave",
      label: "Exempt from MN Family & Medical Leave",
      type: "select",
      required: true,
      help: "Minnesota Paid Leave premium share. Not part of Form W-4.",
      options: [
        { value: "false", title: "NO" },
        { value: "true", title: "YES" },
      ],
    },
  ],
  localTaxNotes: [
    "Minnesota UI is an employer-only tax and is never deducted from employee pay.",
    "Minnesota Paid Leave premium shares follow employer settings and the wage cap.",
  ],
  programs: {
    title: "Minnesota Paid Family and Medical Leave",
    checkboxes: [],
    notes: [
      {
        tone: "info",
        text: "Minnesota Paid Leave premium shares follow employer policy settings and the wage cap. Manage covered individuals and policy effective dates in Minnesota payroll settings.",
      },
    ],
  },
  localTaxes: null,
  taxExemptions: [
    "FUTA",
    "Social Security and Medicare",
    "MN SUI & Workforce Development Fee",
  ],
};

/** State adapter registry. Add new states here instead of hard-coding the UI. */
export const STATE_TAX_ADAPTERS: Record<string, StateAdapter> = {
  NY: NY_ADAPTER,
  MN: MN_ADAPTER,
};

export const getStateAdapter = (code?: string): StateAdapter | null =>
  (code && STATE_TAX_ADAPTERS[code]) || null;

/** Tailwind classes for the inline notes inside a state program block. */
export const STATE_NOTE_CLASS: Record<StateNoteTone, string> = {
  info: "border-blue-100 bg-blue-50/60 text-blue-700",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

/**
 * Builds the `exempt_fields` JSON object persisted on the state tax record.
 * Every exemption the selected state exposes is included with an explicit
 * boolean — `true` when checked, `false` when not — so the payload always
 * carries the full picture (e.g. `{ FUTA: true, "NY SDI": false }`).
 * Covers both the payroll-program exemptions (NY PFL / SDI / DBL …) and the
 * "Tax exemptions" checklist.
 */
export const buildExemptFields = (
  adapter: StateAdapter | null,
  stateTax: any
): Record<string, any> => {
  const isOn = (v: any) => v === true || v === "true";
  const prior = parseExemptFields(stateTax?.exempt_fields);
  const selected = new Set<string>(
    Array.isArray(stateTax?.tax_exemptions) ? stateTax.tax_exemptions : []
  );
  const fields: Record<string, any> = {};
  // State payroll-program exemptions (PFL / SDI / DBL …) — keyed by program key.
  // Fall back to the saved exempt_fields so an untouched checkbox is not lost.
  (adapter?.programs?.checkboxes ?? []).forEach((c) => {
    fields[c.key] = isOn(stateTax?.[c.key] ?? prior[c.key]);
  });
  // "Tax exemptions" checklist — keyed by exemption label.
  (adapter?.taxExemptions ?? []).forEach((item) => {
    fields[item] = selected.has(item);
  });
  // Local jurisdiction tax (NY MCTMT …) — true when a local tax is selected.
  if (adapter?.localTaxes) {
    fields.local_tax = Boolean(stateTax?.local_tax);
  }
  // NYC residency override — stored as a string inside exempt_fields so it
  // lives in the same JSON column and is not a loose top-level field.
  // Values: "" (auto-detect) | "nyc" (force resident) | "none" (exempt).
  if (adapter?.code === "NY") {
    const nycOverride = String(
      stateTax?.nyc_residency_override ?? prior?.nyc_residency_override ?? ""
    );
    fields.nyc_residency_override = nycOverride;
  }
  return fields;
};

/**
 * Normalises a persisted `exempt_fields` value into a plain object.
 * The API may return it as an object or as a JSON-encoded string.
 */
export const parseExemptFields = (raw: any): Record<string, any> => {
  if (raw && typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

/* ------------------------------------------------------------------ *
 * 4. Derived tax-location resolver
 * ------------------------------------------------------------------ */

export interface TaxLocation {
  residentState: string;
  residentCity: string;
  workState: string;
  workCity: string;
  nycResident: boolean;
  worksInNyc: boolean;
  yonkersInvolved: boolean;
  mctmtZone: "Zone 1" | "Zone 2" | null;
  sameState: boolean | null;
}

/**
 * Resolves resident vs work jurisdiction from source-of-truth records.
 * Resident location comes from the employee home address; work location
 * comes from the assigned work location. These are intentionally separate
 * (see compliance doc section 4, "Master location logic").
 */
export const resolveTaxLocation = (
  employee: any,
  stateTax?: any,
): TaxLocation => {
  const home =
    employee?.addresses?.find((a: any) => a?.is_shipping) ||
    employee?.addresses?.find((a: any) => !a?.is_company && !a?.is_work_address) ||
    employee?.addresses?.[0] ||
    {};
  const work =
    employee?.work_locations ||
    employee?.addresses?.find((a: any) => a?.is_work_address) ||
    {};

  const residentState = String(
    home?.province || home?.state || stateTax?.state || "",
  ).toUpperCase();
  const residentCity = String(home?.city || "");
  const workState = String(work?.province || work?.state || "").toUpperCase();
  const workCity = String(work?.city || "");
  const workCounty = String(work?.county || work?.city || "");

  const nycResident =
    residentState === "NY" && NYC_LOCALITIES.includes(norm(residentCity));
  const worksInNyc =
    workState === "NY" && MCTD_ZONE1_COUNTIES.includes(norm(workCounty));
  const yonkersInvolved =
    norm(residentCity) === "yonkers" || norm(workCity) === "yonkers";

  let mctmtZone: TaxLocation["mctmtZone"] = null;
  if (workState === "NY") {
    if (MCTD_ZONE1_COUNTIES.includes(norm(workCounty))) mctmtZone = "Zone 1";
    else if (MCTD_ZONE2_COUNTIES.includes(norm(workCounty))) mctmtZone = "Zone 2";
  }

  const sameState =
    residentState && workState ? residentState === workState : null;

  return {
    residentState,
    residentCity,
    workState,
    workCity,
    nycResident,
    worksInNyc,
    yonkersInvolved,
    mctmtZone,
    sameState,
  };
};

/* ------------------------------------------------------------------ *
 * 5. Federal exempt helpers
 * ------------------------------------------------------------------ */

export const isFederalExempt = (federalTax: any): boolean => {
  if (!federalTax) return false;
  return (
    federalTax.is_employee_exempt_from_federal_tax === true ||
    federalTax.is_employee_exempt_from_federal_tax === "true" ||
    federalTax.holding_status === "EXEMPT" ||
    norm(federalTax.exempt_from_with_holding) === "exempt"
  );
};

/**
 * A W-4 exemption claim expires on February 15 of the following year.
 * Returns the expiry date plus whether it is already past or expiring soon.
 */
export const getFederalExemptExpiry = (federalTax: any) => {
  if (!isFederalExempt(federalTax)) return null;
  const baseYear = federalTax?.exempt_year
    ? Number(federalTax.exempt_year)
    : federalTax?.created_at
      ? new Date(federalTax.created_at).getFullYear()
      : new Date().getFullYear();
  const expiry = new Date(baseYear + 1, 1, 15); // Feb 15 next year
  const now = new Date();
  const days = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
  return {
    date: expiry,
    label: expiry.toLocaleDateString("en-US"),
    expired: days < 0,
    expiringSoon: days >= 0 && days <= 30,
  };
};

/* ------------------------------------------------------------------ *
 * 6. Tax Profile Summary badges
 * ------------------------------------------------------------------ */

export type BadgeTone = "green" | "red" | "amber" | "blue";

export interface TaxBadge {
  label: string;
  tone: BadgeTone;
  hint?: string;
}

export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-600",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
};

const hasFederalCertificate = (federalTax: any) =>
  Boolean(
    federalTax &&
      (federalTax.holding_status ||
        federalTax.employee_W_4_kind ||
        federalTax.uid),
  );

const hasStateCertificate = (stateTax: any) =>
  Boolean(
    stateTax &&
      (stateTax.martial_status ||
        stateTax.total_allowance ||
        stateTax.exempt ||
        stateTax.uid),
  );

/** Builds the read-only Tax Profile Summary badges (compliance doc 3.2). */
export const getTaxProfileBadges = ({
  federalTax,
  stateTax,
  location,
}: {
  federalTax: any;
  stateTax: any;
  location: TaxLocation;
}): TaxBadge[] => {
  const badges: TaxBadge[] = [];

  badges.push(
    hasFederalCertificate(federalTax)
      ? { label: "Federal W-4 Active", tone: "green" }
      : {
          label: "Federal W-4 Missing",
          tone: "red",
          hint: "Apply IRS default withholding and prompt completion.",
        },
  );

  const exempt = getFederalExemptExpiry(federalTax);
  if (exempt) {
    badges.push({
      label: exempt.expired
        ? "Federal Exempt Expired"
        : "Federal Exempt Active",
      tone: exempt.expired ? "red" : "amber",
      hint: `Exemption ${exempt.expired ? "expired" : "expires"} ${exempt.label}.`,
    });
  }

  const stateCode = stateTax?.state || location.residentState;
  if (stateCode) {
    badges.push(
      hasStateCertificate(stateTax)
        ? { label: `${stateCode} Certificate Active`, tone: "green" }
        : {
            label: "State Form Missing",
            tone: "red",
            hint: "Apply the state default rule and alert HR.",
          },
    );
  }

  if (location.nycResident)
    badges.push({
      label: "NYC Resident",
      tone: "blue",
      hint: "NYC resident withholding applies.",
    });

  if (location.worksInNyc)
    badges.push({
      label: "Works in NYC · MCTMT Zone 1",
      tone: "blue",
      hint: "Work-state sourcing and employer MCTMT Zone 1 evaluation.",
    });
  else if (location.mctmtZone === "Zone 2")
    badges.push({ label: "Works in MCTD · Zone 2", tone: "blue" });

  if (location.yonkersInvolved)
    badges.push({ label: "Yonkers Tax Involved", tone: "blue" });

  if (location.sameState === false)
    badges.push({
      label: "Different Work/Resident State",
      tone: "amber",
      hint: "Review reciprocity / nonresident allocation.",
    });

  return badges;
};

/* ------------------------------------------------------------------ *
 * 7. W-4 payload builder (Documents tab generator)
 * ------------------------------------------------------------------ */

const str = (v: any) => (v === undefined || v === null ? "" : String(v));
// Leave the field blank when the backend has no value for it. The earlier
// behaviour of stamping "0" everywhere meant every empty Step 3 / Step 4
// cell on the generated W-4 rendered as "$0", which is misleading on a
// freshly hired employee with nothing filled in yet.
const num = (v: any) =>
  v === undefined || v === null || v === "" ? "" : String(v);

const filingStatusFlags = (status: string) => {
  const s = norm(status);
  return {
    single: s.includes("single") || s.includes("un_married") || s === "other",
    married: s.includes("married") && !s.includes("separat"),
    head: s.includes("head"),
  };
};

/**
 * Builds the generated Form W-4 PDF payload from saved tax certificates
 * instead of hard-coded values. Field ids follow `W4_FIELDS`.
 */
export const buildW4Payload = ({
  employee,
  stateTax,
  federalTax,
  company,
  homeAddress,
}: {
  employee: any;
  stateTax: any;
  federalTax: any;
  company?: any;
  homeAddress?: any;
}) => {
  const user = employee?.user || {};
  const first = str(user.first_name);
  const middle = str(user.middle_name);
  const last = str(user.last_name);

  const home =
    homeAddress ||
    employee?.addresses?.find((a: any) => a?.is_shipping) ||
    employee?.addresses?.[0] ||
    {};
  const cityStateZip = [home.city, home.province || home.state, home.postal_code]
    .filter(Boolean)
    .join(", ");

  const filing = filingStatusFlags(
    federalTax?.holding_status || stateTax?.martial_status || "",
  );
  const today = new Date().toLocaleDateString("en-US");
  // Saved e-signature image URL — surfaced as a dedicated payload key so
  // the backend renderer can stamp the bitmap onto the Step 5 signature
  // box instead of the employee's typed name (the previous behaviour was
  // dumping "First Last" text into the signature cell, which collided
  // visually with neighbouring Step 4 fields on the generated PDF).
  const signatureImageUrl = str(employee?.w4_signature);

  return {
    employee_id: str(employee?.uid),

    // Step 1(a) / 1(b)
    [W4_FIELDS.firstMiddleName.id]: `${first} ${middle}`.trim(),
    [W4_FIELDS.lastName.id]: last,
    [W4_FIELDS.address.id]: str(home.full_address || home.street),
    [W4_FIELDS.cityStateZip.id]: cityStateZip,
    [W4_FIELDS.ssn.id]: str(employee?.ssn || user.ssn || user.personal_tax_id),

    // Step 1(c) filing status
    [W4_FIELDS.filingSingle.id]: filing.single,
    [W4_FIELDS.filingMarried.id]: filing.married,
    [W4_FIELDS.filingHead.id]: filing.head,

    // Step 2(c)
    [W4_FIELDS.multipleJobs.id]:
      federalTax?.is_multiple_jobs_or_spouse_works === true ||
      federalTax?.is_multiple_jobs_or_spouse_works === "true",

    // Step 3 dependents — the W-4 boxes display USD amounts, not the
    // raw counts. The saved record persists the amounts under
    // `children_amount` (children × $2,000) and `dependent_amount`
    // (other deps × $500); `total_credits` is the Step 3 grand total.
    // The `step3_*` keys are form-only state added by hydrateTaxRecord
    // and are not present in the raw API response, so we fall back to
    // the saved amount columns when they're missing.
    [W4_FIELDS.step3Children.id]: num(
      federalTax?.step3_children !== undefined &&
        federalTax?.step3_children !== "" &&
        federalTax?.step3_children !== null
        ? Number(federalTax?.step3_children || 0) * 2000
        : federalTax?.children_amount,
    ),
    [W4_FIELDS.step3Dependents.id]: num(
      federalTax?.step3_other_dependents !== undefined &&
        federalTax?.step3_other_dependents !== "" &&
        federalTax?.step3_other_dependents !== null
        ? Number(federalTax?.step3_other_dependents || 0) * 500
        : federalTax?.dependent_amount,
    ),
    [W4_FIELDS.step3Total.id]: num(
      federalTax?.step3_dependents_amount ||
        federalTax?.total_credits ||
        federalTax?.claim_depends,
    ),

    // Step 4 — these three cells map directly to the saved tax record.
    // `num()` returns "" for missing values so the boxes stay blank on
    // the generated PDF instead of stamping "$0".
    [W4_FIELDS.otherIncome.id]: num(federalTax?.total_other_income),
    [W4_FIELDS.deductions.id]: num(federalTax?.deduction),
    [W4_FIELDS.extraWithholding.id]: num(federalTax?.extra_with_holding),

    // Additional / state crossover fields (f3_*). These map onto the page 3
    // Multiple Jobs / Deductions worksheet cells on the generated PDF, where
    // raw values like "SINGLE_OR_MARRIED_FILING_SEPARATLEY" or "$0.000" render
    // as junk. Blank them for now — the page 1 Step 1–4 boxes already carry the
    // real values, and the worksheet is "keep for your records" only.
    [W4_FIELDS.fedAdditional.id]: "",
    [W4_FIELDS.stateAdditional.id]: "",
    [W4_FIELDS.fedExempt.id]: "",
    [W4_FIELDS.stateExempt.id]: "",
    [W4_FIELDS.fedAmount.id]: "",
    [W4_FIELDS.stateAmount.id]: "",
    [W4_FIELDS.fedStatus.id]: "",
    [W4_FIELDS.stateStatus.id]: "",

    // Step 5 signature — the actual bitmap is stamped via the dedicated
    // `w4_signature` / `signature_image_url` keys below. We deliberately leave
    // the f1_13 text field blank: feeding the S3 URL as text here leaked the
    // raw link into the Employer's name/address box on the generated PDF.
    [W4_FIELDS.signature.id]: "",
    [W4_FIELDS.signedDate.id]: signatureImageUrl ? today : "",
    // Dedicated keys the backend PDF renderer reads to stamp the saved
    // bitmap into the Step 5 signature cell (sent under both common
    // names so we don't depend on a single backend convention).
    w4_signature: signatureImageUrl,
    signature_image_url: signatureImageUrl,

    // Employer section
    [W4_FIELDS.employer.id]: str(company?.name || company?.legal_name),
    [W4_FIELDS.firstEmployment.id]: str(
      employee?.confirmation_date || employee?.offer_date,
    ),
    // EIN lives on the employee record (`ein_number`); the company object only
    // falls back when the employee has none.
    [W4_FIELDS.ein.id]: str(
      employee?.ein_number || company?.ein || company?.tax_id,
    ),
  };
};
