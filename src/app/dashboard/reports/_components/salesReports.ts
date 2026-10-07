import moment from "moment";

/**
 * Shared plumbing for the four sales reports (see SALES_REPORTS.md and the endpoint
 * comments in helpers/backend.js). All four return the same envelope and describe their
 * own shape in `columns`, so everything here is driven off that metadata rather than
 * hard-coded column lists — which is what lets the two detail reports share one component.
 */

export interface SalesReportColumn {
  key: string;
  label: string;
  align?: "left" | "right";
}

export interface SalesReportRow {
  key: string;
  label?: string;
  depth?: number;
  is_group?: boolean;
  is_total?: boolean;
  customer_uid?: string | null;
  product_uid?: string | null;
  txn_uid?: string | null;
  [field: string]: any;
}

export interface SalesReport {
  title?: string;
  subtitle?: string;
  company_name?: string;
  basis?: string;
  columns?: SalesReportColumn[];
  rows?: SalesReportRow[];
}

export type DateRange = { start_date?: string; end_date?: string };

/** ReportFilter speaks created_at_after/before; every sales report takes date_from/date_to. */
export const toReportParams = (range: DateRange) => ({
  date_from: range.start_date || undefined,
  date_to: range.end_date || undefined,
});

export const rangeFromFilter = (params: any): DateRange => ({
  start_date: params?.created_at_after || undefined,
  end_date: params?.created_at_before || undefined,
});

export const columnsOf = (data?: SalesReport) => (Array.isArray(data?.columns) ? data!.columns! : []);
export const rowsOf = (data?: SalesReport) => (Array.isArray(data?.rows) ? data!.rows! : []);

/** The trailing grand-total row every report ends with. */
export const isGrandTotal = (row: SalesReportRow) => row.key === "total";

// Percent cells arrive as bare numbers already carrying the decimals the reference prints
// ("96.15", "20.0") — append the sign, don't re-round. Quantities never take a currency
// symbol. Everything else right-aligned is money.
const PERCENT_KEYS = new Set(["pct_of_sales", "gross_margin_pct"]);
const PLAIN_NUMBER_KEYS = new Set(["quantity"]);
const DATE_KEYS = new Set(["date", "due_date"]);

export const isBlankValue = (value: any) => value === null || value === undefined || value === "";

export const toNumber = (value: any) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const withSeparators = (amount: number) =>
  Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * A blank cell is not a zero — the API leaves a cell out wherever the measure doesn't
 * apply (a group header has no quantity, a product with no sales has no margin), and the
 * reference report prints those blank. `$` goes on the rows that roll other rows up.
 */
export const formatReportCell = (
  value: any,
  column: SalesReportColumn,
  { isTotal = false }: { isTotal?: boolean } = {},
) => {
  if (isBlankValue(value)) return "";
  if (DATE_KEYS.has(column.key)) return moment(value).format("MM/DD/YYYY");
  if (column.align !== "right") return String(value);
  if (PERCENT_KEYS.has(column.key)) return `${value} %`;

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  const sign = amount < 0 ? "-" : "";
  const symbol = isTotal && !PLAIN_NUMBER_KEYS.has(column.key) ? "$" : "";
  return `${sign}${symbol}${withSeparators(amount)}`;
};

export const isNumericColumn = (column: SalesReportColumn) => column.align === "right";

export const compareRowValues = (
  a: SalesReportRow,
  b: SalesReportRow,
  column: SalesReportColumn,
) => {
  const left = a[column.key];
  const right = b[column.key];

  // Rows missing the measure sink to the bottom either way, rather than sorting as zero.
  if (isBlankValue(left)) return 1;
  if (isBlankValue(right)) return -1;

  if (DATE_KEYS.has(column.key)) return moment(left).valueOf() - moment(right).valueOf();
  if (isNumericColumn(column)) return toNumber(left) - toNumber(right);
  return String(left).localeCompare(String(right), undefined, { numeric: true });
};

/* ── summary reports (customer summary, product/service summary) ──────────────── */

/** A row is a parent when the row after it sits deeper — totals stay at their own depth. */
export const parentRowKeys = (rows: SalesReportRow[]) =>
  new Set(
    rows
      .filter((row, index) => (rows[index + 1]?.depth ?? 0) > (row.depth ?? 0))
      .map((row) => row.key),
  );

/**
 * Hides everything nested under a collapsed row. A "Total for <parent>" row sits at the
 * parent's own depth, so it survives the collapse — the same way the reference report
 * keeps a collapsed group's total on screen.
 */
export const visibleSummaryRows = (rows: SalesReportRow[], collapsed: Set<string>) => {
  const visible: SalesReportRow[] = [];
  let hiddenBelowDepth: number | null = null;

  rows.forEach((row) => {
    const depth = row.depth ?? 0;
    if (hiddenBelowDepth !== null && depth > hiddenBelowDepth) return;

    hiddenBelowDepth = null;
    visible.push(row);
    if (collapsed.has(row.key) && !row.is_total) hiddenBelowDepth = depth;
  });

  return visible;
};

/* ── detail reports (customer detail, product/service detail) ─────────────────── */

export interface DetailSection {
  group: SalesReportRow;
  lines: SalesReportRow[];
  total?: SalesReportRow;
}

/**
 * Folds the flat row list into its three shapes: a group header, its transaction lines and
 * the group's own total row. The trailing grand total comes back separately.
 */
export const toDetailSections = (rows: SalesReportRow[]) => {
  const sections: DetailSection[] = [];
  let grandTotal: SalesReportRow | undefined;

  rows.forEach((row) => {
    if (isGrandTotal(row)) {
      grandTotal = row;
      return;
    }

    if (row.is_group) {
      sections.push({ group: row, lines: [] });
      return;
    }

    const section = sections[sections.length - 1];
    if (!section) return; // a line before any group header — nothing sensible to do with it

    if (row.is_total) section.total = row;
    else section.lines.push(row);
  });

  return { sections, grandTotal };
};

/** `subtitle` off the response when it's there, otherwise describe the picked range. */
export const reportSubtitle = (data: SalesReport | undefined, range: DateRange) => {
  if (data?.subtitle) return data.subtitle;
  if (!range.start_date || !range.end_date) return "All Dates";

  const start = moment(range.start_date);
  const end = moment(range.end_date);
  const wholeMonths =
    start.isSame(start.clone().startOf("month"), "day") &&
    end.isSame(end.clone().endOf("month"), "day");

  if (wholeMonths && start.isSame(end, "year")) {
    return start.isSame(end, "month")
      ? start.format("MMMM, YYYY")
      : `${start.format("MMMM")}-${end.format("MMMM")}, ${end.format("YYYY")}`;
  }

  return `From ${start.format("MMM D, YYYY")} to ${end.format("MMM D, YYYY")}`;
};
