/**
 * Bank Register — row model.
 *
 * Bound to the shipped contract of `GET /we/chart-of-accounts/{uid}/sessions`
 * as documented in `FRONTEND_INSTRUCTIONS_CHART_OF_ACCOUNT_REGISTER.md`
 * (written 2026-08-31 against the running code). Every field read below is a
 * real serializer field, not a guess.
 *
 * A row is a *ledger leg* (journal-entry connector), not a document:
 *
 *   uid                   the leg
 *   document_uid          the journal entry it belongs to — several legs share one
 *   date                  the leg's business date (NOT `journal.date`)
 *   entry_number          "#JE-######", minted; not a bill/invoice number
 *   model_kind            the transaction type — this is the Type column
 *   kind                  the posting side, only ever DEBIT | CREDIT
 *   request_kind          the audit action, almost always CREATED
 *   deposit / payment     money in / out **already signed for this account**
 *   debit / credit        the raw posting amounts behind them
 *   total                 the *document* total repeated on every leg — never sum it
 *   running_balance       correct under every filter and across pages
 *   last_balance          byte-identical duplicate of running_balance (legacy)
 *   reconciliation_status "U" | "C" | "R" — the only truth about reconcile state
 *
 * Money arrives as a *string* with three decimals ("450.000"); `num()` parses.
 */

/* ── transaction kind ────────────────────────────────────────────────── */

/**
 * Three unrelated fields are called "kind" on a register row, and binding the
 * wrong one is the single most common way to get this screen wrong:
 *
 *   `model_kind`   the transaction type (SALE, PAY_BILL, EXPENSE, …) — the Type column
 *   `kind`         the posting side, only ever DEBIT | CREDIT
 *   `request_kind` the audit action (CREATED / UPDATED / DELETED)
 *
 * A Type column showing "Created" on every row is bound to `request_kind`.
 */
const POSTING_SIDES = new Set(['DEBIT', 'CREDIT']);

/** Mirrors `formatKind` in `src/app/dashboard/reports/journal/page.tsx`. */
export function formatKind(kind: string): string {
  switch (kind) {
    case 'SALE_PAYMENT_RECEIVE':
      return 'Payment';
    case 'SALE':
      return 'Invoice';
    case 'PURCHASE':
      return 'Bill';
    case 'CHART_OF_ACCOUNT':
      return 'Deposit';
    // The API misspells "receipt"; keep both spellings working.
    case 'SALE_RECEPT':
    case 'SALE_RECEIPT':
      return 'Sale Receipt';
    default:
      // `model_kind` is a closed enum server-side, but title-casing the tail
      // keeps a newly added member readable (JOURNAL_ENTRY was added this
      // month) instead of shouting the raw token.
      return kind
        .split('_')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
  }
}

/* ── raw → normalised ────────────────────────────────────────────────── */

/** `U` unreconciled · `C` cleared · `R` reconciled. Always present on a row. */
export type RegisterStatus = 'U' | 'C' | 'R';
export type PostingSide = 'DEBIT' | 'CREDIT' | '';

export interface RegisterRow {
  /** Stable React key; synthesised when the row carries no uid. */
  key: string;
  /** The ledger leg's own uid. **Never** send this to Reconcile. */
  uid: string;
  /**
   * The journal entry this leg belongs to. Several rows share one, and this —
   * not `uid` — is what `/reconcile/{uid}/lines` and `/complete` expect.
   */
  documentUid: string;
  /** ISO `YYYY-MM-DD`, the leg's business date. Not `journal.date`. */
  date: string;
  /** The row's `created_at` as ISO — audit only; the grid shows `date`. */
  createdAt: string;
  /** Human transaction type: `model_kind` run through `formatKind`. */
  kind: string;
  /** Raw `model_kind`, for filtering without re-deriving the label. */
  kindRaw: string;
  /** The posting side (`DEBIT` / `CREDIT`) — never the transaction type. */
  side: PostingSide;
  /** Audit action: CREATED / UPDATED / DELETED. */
  requestKind: string;
  /**
   * True on a delta or reversing leg. Raising a $100 payment to $150 appends a
   * $50 leg rather than rewriting the original, and a void appends reversing
   * legs — both are real ledger events and both appear in the register.
   */
  isAdjustment: boolean;
  /** `entry_number` — a minted `#JE-######` token, nullable. */
  refNo: string;
  /** `payee.name`, already resolved server-side. */
  payee: string;
  /** `payee.kind` — SUPPLIER / CUSTOMER / … */
  payeeKind: string;
  memo: string;
  /** Contra account title, `-Split-`, or '' — `null` is normal, not a failure. */
  category: string;
  /** `warehouse.title`. Null on most bank rows by design. */
  store: string;
  /** Money in, in this account's own direction. On a credit card, a charge. */
  deposit: number;
  /** Money out, in this account's own direction. */
  payment: number;
  /** Raw posting amounts behind deposit/payment; shown in the detail panel. */
  debit: number;
  credit: number;
  /** The **document's** total, repeated on every leg. Never sum this column. */
  documentTotal: number;
  /** `running_balance` — correct under every filter and across pages. */
  balance: number | null;
  status: RegisterStatus;
  /**
   * Set even on a line stranded by an undone session, so it does **not** mean
   * "reconciled". `status` is the only truth.
   */
  reconciliationUid: string;
  clearedOn: string;
  /** The parent journal entry, as serialized on the row. */
  journal: any;
  /** The untouched API row — used by the detail panel and the export. */
  raw: any;
}

const firstString = (...vals: any[]): string => {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
};

/** Money arrives as a three-decimal *string*; never `+` the raw values. */
const num = (...vals: any[]): number => {
  for (const v of vals) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

const numOrNull = (...vals: any[]): number | null => {
  for (const v of vals) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

/** A person-ish record (customer / supplier / employee) → display name. */
export function personName(p: any): string {
  if (!p) return '';
  if (typeof p === 'string') return p;
  const joined = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ').trim();
  return joined || firstString(p.display_name, p.company_name, p.name, p.title, p.email);
}

/** Anything date-ish → ISO `YYYY-MM-DD`, without timezone shifting. */
export function toISODate(v: any): string {
  if (!v) return '';
  const s = String(v);
  const direct = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (direct) return `${direct[1]}-${direct[2]}-${direct[3]}`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/** `2026-08-11` → `08/11/2026`. */
export function toMDY(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[2]}/${m[3]}/${m[1]}` : '';
}

/**
 * Reconcile state — read-only here.
 *
 * `reconciliation_status` is the only field that means it. A set
 * `reconciliation_uid` does not: a line stranded on an undone session keeps
 * one. Status is a property of a reconciliation session, so it is written in
 * the Reconcile workspace (`POST /we/transactions/reconcile/{uid}/lines`),
 * never from this grid — a line has no status outside an open session.
 */
function readStatus(r: any): RegisterStatus {
  const s = firstString(r?.reconciliation_status).toUpperCase();
  return s === 'R' ? 'R' : s === 'C' ? 'C' : 'U';
}

function resolveKind(r: any): {
  kind: string;
  kindRaw: string;
  side: PostingSide;
  requestKind: string;
} {
  const bare = firstString(r?.kind).toUpperCase();
  const side: PostingSide = POSTING_SIDES.has(bare) ? (bare as PostingSide) : '';
  // `model_kind` is the transaction type. `journal.kind` carries the same value
  // and only backstops a serializer that omits it. A bare `kind` is the posting
  // side and is never the type.
  const raw = firstString(r?.model_kind, r?.journal?.kind);
  return {
    kind: raw ? formatKind(raw) : '',
    kindRaw: raw,
    side,
    requestKind: firstString(r?.request_kind),
  };
}

export function toRegisterRow(r: any, index: number): RegisterRow {
  const uid = firstString(r?.uid);
  const { kind, kindRaw, side, requestKind } = resolveKind(r);
  return {
    key: uid || `row-${index}`,
    uid,
    documentUid: firstString(r?.document_uid, r?.journal?.uid),
    date: toISODate(r?.date),
    createdAt: toISODate(r?.created_at),
    kind,
    kindRaw,
    side,
    requestKind,
    isAdjustment: r?.is_adjustment === true,
    refNo: firstString(r?.entry_number, r?.journal?.entry_number),
    // Already resolved server-side; the customer/supplier objects only backstop
    // a row whose payee the serializer left null.
    payee:
      firstString(r?.payee?.name) ||
      personName(r?.customer) ||
      personName(r?.supplier) ||
      personName(r?.employee),
    payeeKind: firstString(r?.payee?.kind),
    memo: firstString(r?.description),
    category: firstString(r?.category),
    // `warehose` is the API's own misspelling on the journal-report connector;
    // the correct spelling is tried first regardless.
    store: firstString(r?.warehouse?.title, r?.warehouse, r?.warehose?.title),
    deposit: num(r?.deposit),
    payment: num(r?.payment),
    debit: num(r?.debit),
    credit: num(r?.credit),
    documentTotal: num(r?.total),
    // `last_balance` is a byte-identical legacy duplicate; prefer the named one.
    balance: numOrNull(r?.running_balance, r?.last_balance),
    status: readStatus(r),
    reconciliationUid: firstString(r?.reconciliation_uid),
    clearedOn: toISODate(r?.cleared_on),
    journal: r?.journal ?? null,
    raw: r,
  };
}

/* ── account header ──────────────────────────────────────────────────── */

/**
 * The two money columns, named after the row fields they head.
 *
 * The header serves `column_labels` — Bank → Deposit/Payment, Credit Cards →
 * Charge/Payment, everything else → Increase/Decrease. Do **not** regex the
 * account type title to decide these, and do not flip the amounts client-side:
 * `deposit`/`payment` already arrive signed in the account's own direction, so
 * a credit card inverts server-side, which is the point.
 */
export interface ColumnLabels {
  deposit: string;
  payment: string;
}

const BANK_TYPES = new Set(['Bank', 'Credit Cards']);

export function columnLabels(account: any): ColumnLabels {
  const cl = account?.column_labels;
  const deposit = firstString(cl?.deposit);
  const payment = firstString(cl?.payment);
  if (deposit && payment) return { deposit, payment };

  // Mirror of the server's own defaults, for a header that predates the field.
  const type = firstString(account?.account_type?.title);
  if (type === 'Bank') return { deposit: 'Deposit', payment: 'Payment' };
  if (type === 'Credit Cards' || /credit\s*card/i.test(type)) {
    return { deposit: 'Charge', payment: 'Payment' };
  }
  return { deposit: 'Increase', payment: 'Decrease' };
}

/**
 * The server's own money-account predicate.
 *
 * `is_money_account` alone is not enough: seeding never sets it, so it is
 * `false` on every seeded Bank / Credit Card account for a company created
 * after its backfill migration.
 */
export function isMoneyAccount(account: any): boolean {
  if (!account) return false;
  if (account.is_money_account) return true;
  const type = account.account_type;
  if (type === null || type === undefined) return true;
  return BANK_TYPES.has(firstString(type?.title));
}

/** The Reconcile picker also requires ACTIVE — API-created accounts are DRAFT. */
export function canReconcileAccount(account: any): boolean {
  return isMoneyAccount(account) && firstString(account?.status).toUpperCase() === 'ACTIVE';
}

/**
 * Credit-card *presentation* only — the icon and the chip tone.
 *
 * Deliberately not used for amounts or column labels: those come from
 * `column_labels` and from server-signed `deposit` / `payment`.
 */
export function isCreditCardAccount(account: any): boolean {
  const t = `${account?.account_type?.title ?? ''} ${
    account?.detail_type?.title ?? ''
  }`.toLowerCase();
  return /credit\s*card/.test(t);
}

/**
 * "Control account" comes from `is_control_account`, derived from the posting
 * engine's own key. `is_fixed` means "came from the industry seed" — roughly
 * 3,573 of 3,759 live accounts carry it while only 780 are control accounts.
 */
export function isControlAccount(account: any): boolean {
  return account?.is_control_account === true;
}

/* ── derivations ─────────────────────────────────────────────────────── */

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** `2026-08` → `August 2026`. */
export function monthLabel(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || '');
  if (!m) return 'Undated';
  return `${MONTHS[Number(m[2]) - 1] ?? ''} ${m[1]}`.trim();
}

export interface MonthGroup {
  ym: string;
  label: string;
  rows: RegisterRow[];
  /** Net movement for the group, already in the account's own direction. */
  net: number;
}

/**
 * Split the page's rows into month blocks, preserving the server's order
 * (always newest-first — `?ordering=` is silently ignored). Only the rows on
 * screen are grouped, and the header says so, because the server pages.
 */
export function groupByMonth(rows: RegisterRow[]): MonthGroup[] {
  const out: MonthGroup[] = [];
  for (const row of rows) {
    const ym = row.date ? row.date.slice(0, 7) : '';
    const last = out[out.length - 1];
    const delta = row.deposit - row.payment;
    if (last && last.ym === ym) {
      last.rows.push(row);
      last.net += delta;
    } else {
      out.push({ ym, label: ym ? monthLabel(ym) : 'Undated', rows: [row], net: delta });
    }
  }
  return out;
}

/* ── filtering ───────────────────────────────────────────────────────── */

export type Direction = 'ANY' | 'IN' | 'OUT';

export interface RegisterFilters {
  /** Money direction — page-scoped; the endpoint has no equivalent param. */
  direction: Direction;
  /** Reconcile status → `?reconciliation_status=` (spans the whole account). */
  status: RegisterStatus | 'ANY';
  /** Raw `model_kind` values → `?journal__kind=` when exactly one is picked. */
  kinds: string[];
  /** Chart-of-account object — page-scoped; no server param exists. */
  category: any | null;
  /** → `?customer__uid=` */
  customer: any | null;
  /** → `?supplier__uid=` */
  supplier: any | null;
  /** Warehouse object — page-scoped; no server param exists. */
  store: any | null;
  /** ISO `YYYY-MM-DD` → `?date_after=` (the transaction date, inclusive). */
  dateFrom: string;
  /** ISO `YYYY-MM-DD` → `?date_before=` (inclusive). */
  dateTo: string;
}

export const EMPTY_FILTERS: RegisterFilters = {
  direction: 'ANY',
  status: 'ANY',
  kinds: [],
  category: null,
  customer: null,
  supplier: null,
  store: null,
  dateFrom: '',
  dateTo: '',
};

export function countActiveFilters(f: RegisterFilters): number {
  return (
    (f.direction !== 'ANY' ? 1 : 0) +
    (f.status !== 'ANY' ? 1 : 0) +
    (f.kinds.length ? 1 : 0) +
    (f.category ? 1 : 0) +
    (f.customer ? 1 : 0) +
    (f.supplier ? 1 : 0) +
    (f.store ? 1 : 0) +
    (f.dateFrom || f.dateTo ? 1 : 0)
  );
}

/** True when the request is the plain, account-wide view. */
export function isUnfiltered(f: RegisterFilters, search: string): boolean {
  return !search && countActiveFilters(f) === 0;
}

/**
 * The query the endpoint understands, built from the filter state.
 *
 * Deliberately narrow — three params on this endpoint look useful and are not:
 *   `?kind=`     is the posting side; `?kind=SALE` is a **400**, not an empty list
 *   `?ordering=` is silently ignored (order is always `-date, -id`)
 *   `?created_at_after=` is a legacy alias that also filters `date`; sending it
 *                        alongside `date_after` silently discards one of them
 */
export type ServerFilterInput = Pick<
  RegisterFilters,
  'dateFrom' | 'dateTo' | 'status' | 'kinds' | 'customer' | 'supplier'
>;

export function toServerParams(f: ServerFilterInput): Record<string, string | undefined> {
  // `undefined`, not `''`: axios drops an undefined param from the query string
  // entirely, so an inactive filter is never sent as an empty value that a
  // filter backend might read as "match nothing". The keys are always present
  // so that clearing a filter overwrites the previous request's value.
  return {
    date_after: f.dateFrom || undefined,
    date_before: f.dateTo || undefined,
    reconciliation_status: f.status === 'ANY' ? undefined : f.status,
    // `journal__kind` takes a single value. Two or more selected types stay
    // page-scoped rather than risk a 400 on a comma-joined list.
    journal__kind: f.kinds.length === 1 ? f.kinds[0] : undefined,
    customer__uid: f.customer?.uid || undefined,
    supplier__uid: f.supplier?.uid || undefined,
  };
}

const titleOf = (o: any): string => (o?.title ?? '').toString().trim().toLowerCase();

/**
 * Client-side predicates over the rows already on screen.
 *
 * Everything with a server equivalent (date range, status, a single type,
 * customer, supplier, search) is also sent to the server by `toServerParams`;
 * re-applying it here is a no-op that keeps the UI honest if a param is ever
 * ignored. Category, store, direction and a multi-type selection are
 * page-scoped only — the endpoint has no parameter for them — and the toolbar
 * says so.
 */
export function applyClientFilters(rows: RegisterRow[], f: RegisterFilters): RegisterRow[] {
  const cat = titleOf(f.category);
  const store = titleOf(f.store);
  const customer = personName(f.customer).toLowerCase();
  const supplier = personName(f.supplier).toLowerCase();

  return rows.filter((r) => {
    if (f.direction === 'IN' && !(r.deposit > 0)) return false;
    if (f.direction === 'OUT' && !(r.payment > 0)) return false;
    if (f.status !== 'ANY' && r.status !== f.status) return false;
    if (f.kinds.length && !f.kinds.includes(r.kindRaw)) return false;
    // `date_after` / `date_before` filter the transaction date, inclusive both
    // ends — the same field the grid shows, so one predicate covers both.
    if (f.dateFrom && !(r.date && r.date >= f.dateFrom)) return false;
    if (f.dateTo && !(r.date && r.date <= f.dateTo)) return false;
    if (cat && !r.category.toLowerCase().includes(cat)) return false;
    if (store && !r.store.toLowerCase().includes(store)) return false;
    if (customer && !r.payee.toLowerCase().includes(customer)) return false;
    if (supplier && !r.payee.toLowerCase().includes(supplier)) return false;
    return true;
  });
}

/**
 * The transaction types present in the loaded rows.
 *
 * `model_kind` is a closed enum server-side, but deriving the options from the
 * data keeps the filter honest when a member is added — JOURNAL_ENTRY was added
 * this month, and hand-keyed entries used to be mislabelled PURCHASE.
 */
export function kindOptions(rows: RegisterRow[]): { value: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const r of rows) {
    if (r.kindRaw && !seen.has(r.kindRaw)) seen.set(r.kindRaw, r.kind || r.kindRaw);
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export interface StatusCounts {
  reconciled: number;
  cleared: number;
  unreconciled: number;
  total: number;
  /** Every row carries a `reconciliation_status`, so this is simply "has rows". */
  available: boolean;
}

export function countStatuses(rows: RegisterRow[]): StatusCounts {
  let reconciled = 0;
  let cleared = 0;
  for (const r of rows) {
    if (r.status === 'R') reconciled += 1;
    else if (r.status === 'C') cleared += 1;
  }
  return {
    reconciled,
    cleared,
    unreconciled: rows.length - reconciled - cleared,
    total: rows.length,
    available: rows.length > 0,
  };
}

export interface DirectionCounts {
  all: number;
  in: number;
  out: number;
}

export function countDirections(rows: RegisterRow[]): DirectionCounts {
  let inn = 0;
  let out = 0;
  for (const r of rows) {
    if (r.deposit > 0) inn += 1;
    if (r.payment > 0) out += 1;
  }
  return { all: rows.length, in: inn, out };
}

export interface RegisterTotals {
  /** Sum of `deposit` over the visible rows. */
  deposit: number;
  /** Sum of `payment` over the visible rows. */
  payment: number;
  /** Net movement across the visible rows, in the account's own direction. */
  net: number;
  /**
   * The running balance carried by the last visible row.
   *
   * Rows are newest-first, so this is the *oldest* balance on the page — never
   * the account's current balance. That one is `running_balance` on row 0 of an
   * unfiltered page 1, which `BankRegister` captures separately.
   */
  closing: number | null;
}

/**
 * Totals over the rows on screen.
 *
 * Sums `deposit` / `payment`, never `total` — `total` is the *document's* total
 * repeated on every leg, so summing it returns several times the real movement.
 */
export function totalsFor(rows: RegisterRow[]): RegisterTotals {
  let deposit = 0;
  let payment = 0;
  for (const r of rows) {
    deposit += r.deposit;
    payment += r.payment;
  }
  const withBalance = [...rows].reverse().find((r) => r.balance !== null);
  return {
    deposit,
    payment,
    net: deposit - payment,
    closing: withBalance ? withBalance.balance : null,
  };
}
