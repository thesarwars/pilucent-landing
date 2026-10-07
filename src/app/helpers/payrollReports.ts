/**
 * Shared client helpers for the payroll standard reports — payroll summary by employee
 * (/we/payroll/reports/payroll/summary-by-employee/) and payroll details
 * (/we/payroll/reports/payroll/details/).
 *
 * Both return every figure as a plain unformatted string, both apply their signs
 * server-side, and both want date presets computed client-side rather than sent as
 * `date_range` (which filters created_at, not pay_date). Keeping that logic here is what
 * stops the two screens — and their PDFs — from drifting apart.
 */
import { baseURL } from "./api";

export type ReportValueFormat = "money" | "hours" | string;

/**
 * Values arrive as `-16847.87`: always 2dp, no currency symbol, no thousands separators,
 * a leading ASCII minus for negatives, and never `-0.00`.
 *
 *   money -> -$16,847.87   (sign outside the symbol)
 *   hours -> 173.33h
 *
 * Signs are already applied — employee taxes and deductions come back negative, employer
 * costs and net pay positive — so nothing here negates. `null`/`""` renders as `fallback`
 * (an Adjusted gross line has no hours; an empty breakdown has no value at all).
 */
export const formatReportValue = (
  raw: string | number | null | undefined,
  format: ReportValueFormat = "money",
  fallback = "-",
) => {
  if (raw === null || raw === undefined || raw === "") return fallback;

  const trimmed = String(raw).trim();
  const isNegative = trimmed.startsWith("-");
  const amount = Number(trimmed.replace(/^-/, ""));
  if (!Number.isFinite(amount)) return trimmed;

  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = isNegative ? "-" : "";

  return format === "hours" ? `${sign}${formatted}h` : `${sign}$${formatted}`;
};

/**
 * Local-parts ISO date. Avoids toISOString(), which rolls a local-midnight date back a
 * day for every timezone east of UTC and would send the wrong month end.
 */
export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export const PAYROLL_REPORT_PRESETS = [
  { value: "last_pay_date", label: "Last pay date" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "this_quarter", label: "This quarter" },
  { value: "last_quarter", label: "Last quarter" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom" },
];

/**
 * Presets resolve to concrete pay_date bounds here rather than being sent as
 * `date_range=this_month`: that param filters created_at — when the run was *entered* —
 * in server local time, so an August run keyed in September would land in September.
 * The details report doesn't accept it at all.
 */
export const getPayDatePresetRange = (preset: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarter = Math.floor(month / 3);

  switch (preset) {
    case "this_month":
      return {
        date_from: toISODate(new Date(year, month, 1)),
        date_to: toISODate(new Date(year, month + 1, 0)),
      };
    case "last_month":
      return {
        date_from: toISODate(new Date(year, month - 1, 1)),
        date_to: toISODate(new Date(year, month, 0)),
      };
    case "this_quarter":
      return {
        date_from: toISODate(new Date(year, quarter * 3, 1)),
        date_to: toISODate(new Date(year, quarter * 3 + 3, 0)),
      };
    case "last_quarter":
      return {
        date_from: toISODate(new Date(year, quarter * 3 - 3, 1)),
        date_to: toISODate(new Date(year, quarter * 3, 0)),
      };
    case "this_year":
      return { date_from: `${year}-01-01`, date_to: `${year}-12-31` };
    case "last_year":
      return { date_from: `${year - 1}-01-01`, date_to: `${year - 1}-12-31` };
    default:
      return { date_from: "", date_to: "" };
  }
};

/**
 * A malformed date comes back 400 as `{ error: "Invalid start date format…" }`, and the
 * summary report's created_at filters use a different shape again
 * (`{ created_at_after: "Invalid date format…" }`), so unwrap either.
 */
export const getReportErrorMessage = (error: unknown, fallback = "Could not load the report") => {
  if (!error) return "";

  const payload = (error as any)?.response?.data;
  if (!payload) return (error as any)?.message || fallback;
  if (typeof payload === "string") return payload;
  if (payload.error) return String(payload.error);

  const first = Object.values(payload)[0];
  if (Array.isArray(first)) return String(first[0]);
  return first ? String(first) : fallback;
};

/**
 * Both reports serve `?is_pdf=true` as a real PDF with an *inline* disposition, so it
 * would preview instead of downloading — naming the blob here forces the download.
 */
export const downloadReportPdf = async (
  path: string,
  params: Record<string, string>,
  filename: string,
) => {
  const token = localStorage.getItem("access_token");
  const search = new URLSearchParams({ ...params, is_pdf: "true" }).toString();

  const response = await fetch(`${baseURL}${path}?${search}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Could not export the PDF (${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
