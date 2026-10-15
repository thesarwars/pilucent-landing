/**
 * Enum values and labels, generated from the backend's `employeeio/choices.py`
 * — the contract's own strings. A renamed value is a silently wrong payslip,
 * so regenerate rather than edit by hand.
 */

export interface Option {
  value: string;
  label: string;
}

export const ENUMS = {
  gender: [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "THIRD_GENDER", label: "Third gender" },
  ],
  marital: [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  ],
  blood: [
  { value: "", label: "Not recorded" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  ],
  religion: [
  { value: "", label: "Not recorded" },
  { value: "ISLAM", label: "Islam" },
  { value: "HINDU", label: "Hindu" },
  { value: "BUDDHIST", label: "Buddhist" },
  { value: "CHRISTIAN", label: "Christian" },
  { value: "OTHER", label: "Other" },
  ],
  division: [
  { value: "DHAKA", label: "Dhaka" },
  { value: "CHATTOGRAM", label: "Chattogram" },
  { value: "KHULNA", label: "Khulna" },
  { value: "RAJSHAHI", label: "Rajshahi" },
  { value: "SYLHET", label: "Sylhet" },
  { value: "BARISHAL", label: "Barishal" },
  { value: "RANGPUR", label: "Rangpur" },
  { value: "MYMENSINGH", label: "Mymensingh" },
  ],
  relation: [
  { value: "SPOUSE", label: "Spouse" },
  { value: "SON", label: "Son" },
  { value: "DAUGHTER", label: "Daughter" },
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "BROTHER", label: "Brother" },
  { value: "SISTER", label: "Sister" },
  { value: "OTHER", label: "Other" },
  ],
  classification: [
  { value: "WORKER", label: "Worker" },
  { value: "NON_WORKER", label: "Non-worker" },
  ],
  workerCategory: [
  { value: "PERMANENT", label: "Permanent" },
  { value: "PROBATIONER", label: "Probationer" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "CASUAL", label: "Casual" },
  { value: "BADLI", label: "Badli" },
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "SEASONAL", label: "Seasonal" },
  ],
  establishment: [
  { value: "FACTORY", label: "Factory" },
  { value: "SHOP", label: "Shop" },
  { value: "COMMERCIAL_ESTABLISHMENT", label: "Commercial establishment" },
  { value: "INDUSTRIAL_ESTABLISHMENT", label: "Industrial establishment" },
  { value: "ROAD_TRANSPORT", label: "Road transport" },
  { value: "TEA_PLANTATION", label: "Tea plantation" },
  { value: "NEWSPAPER", label: "Newspaper" },
  ],
  employmentType: [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  ],
  grade: [
  { value: "G1", label: "Grade 1" },
  { value: "G2", label: "Grade 2" },
  { value: "G3", label: "Grade 3" },
  { value: "G4", label: "Grade 4" },
  { value: "G5", label: "Grade 5" },
  { value: "G6", label: "Grade 6" },
  { value: "G7", label: "Grade 7" },
  ],
  separationType: [
  { value: "TERMINATION", label: "Termination" },
  { value: "RETRENCHMENT", label: "Retrenchment" },
  { value: "DISCHARGE", label: "Discharge" },
  { value: "DISMISSAL", label: "Dismissal" },
  { value: "RESIGNATION", label: "Resignation" },
  { value: "RETIREMENT", label: "Retirement" },
  { value: "DEATH", label: "Death" },
  ],
  gratuityBasis: [
  { value: "BASIC", label: "Basic" },
  { value: "GROSS", label: "Gross" },
  ],
  gratuityMethod: [
  { value: "MONTHLY_PROVISION", label: "Monthly provision" },
  { value: "FUNDED", label: "Funded" },
  ],
  taxpayerCategory: [
  { value: "GENERAL", label: "General" },
  { value: "FEMALE", label: "Female" },
  { value: "SENIOR_CITIZEN_65_PLUS", label: "Senior citizen (65+)" },
  { value: "PERSON_WITH_DISABILITY", label: "Person with disability" },
  { value: "THIRD_GENDER", label: "Third gender" },
  { value: "WAR_WOUNDED_FREEDOM_FIGHTER", label: "War-wounded freedom fighter" },
  { value: "NON_RESIDENT_FOREIGN", label: "Non-resident foreign" },
  ],
  vehicle: [
  { value: "NONE", label: "None" },
  { value: "UPTO_2500", label: "Up to 2500cc" },
  { value: "ABOVE_2500", label: "Above 2500cc" },
  ],
  instrument: [
  { value: "DPS", label: "DPS" },
  { value: "LIFE_INSURANCE_PREMIUM", label: "Life insurance premium" },
  { value: "SANCHAYAPATRA", label: "Sanchayapatra" },
  { value: "LISTED_SHARES", label: "Listed shares" },
  { value: "MUTUAL_FUND", label: "Mutual fund" },
  { value: "RECOGNISED_PROVIDENT_FUND", label: "Recognised provident fund" },
  { value: "APPROVED_DONATION", label: "Approved donation" },
  { value: "OTHER", label: "Other" },
  ],
  paymentMethod: [
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "MFS", label: "Mobile financial service" },
  { value: "CASH", label: "Cash" },
  ],
  mfsProvider: [
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "ROCKET", label: "Rocket" },
  { value: "UPAY", label: "Upay" },
  ],
  walletType: [
  { value: "SALARY", label: "Salary" },
  { value: "PERSONAL", label: "Personal" },
  ],
  trackedField: [
  { value: "classification", label: "Classification" },
  { value: "designation", label: "Designation" },
  { value: "grade", label: "Grade" },
  { value: "department", label: "Department" },
  { value: "shift", label: "Shift" },
  { value: "section", label: "Section" },
  { value: "salary", label: "Salary" },
  { value: "separation", label: "Separation" },
  ],
  revisionMethod: [
  { value: "PERCENTAGE_INCREASE", label: "Percentage increase" },
  { value: "FIXED_INCREASE", label: "Fixed increase" },
  { value: "NEW_GROSS", label: "New gross" },
  { value: "NEW_BASIC", label: "New basic" },
  { value: "CHANGE_TEMPLATE", label: "Change template" },
  ],
  revisionType: [
  { value: "INCREMENT", label: "Increment" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "STRUCTURE_CHANGE", label: "Structure change" },
  { value: "CORRECTION", label: "Correction" },
  { value: "GRADE_REVISION", label: "Grade revision" },
  { value: "MINIMUM_WAGE_ADJUSTMENT", label: "Minimum wage adjustment" },
  ],
  arrearsRun: [
  { value: "NEXT_RUN", label: "Next payroll run" },
  { value: "SEPARATE_RUN", label: "Separate arrears run" },
  ],
  documentKind: [
  { value: "SERVICE_BOOK", label: "Service book" },
  { value: "APPOINTMENT_LETTER", label: "Appointment letter" },
  { value: "ID_CARD", label: "ID card" },
  ],
  salaryComponent: [
  { value: "BASIC", label: "Basic salary" },
  { value: "HRA", label: "House rent allowance" },
  { value: "MED", label: "Medical allowance" },
  { value: "CONV", label: "Conveyance allowance" },
  { value: "DA", label: "Dearness allowance" },
  { value: "FOOD", label: "Food allowance" },
  ],
} satisfies Record<string, Option[]>;

export type EnumKey = keyof typeof ENUMS;

export function enumLabel(key: EnumKey, value: string | null | undefined, fallback = '—'): string {
  if (!value) return fallback;
  return ENUMS[key].find((o) => o.value === value)?.label ?? value;
}
