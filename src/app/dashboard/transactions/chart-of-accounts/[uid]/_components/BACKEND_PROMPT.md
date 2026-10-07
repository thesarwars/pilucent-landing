# Backend prompt: Bank Register data contract

Context for whoever implements/adjusts the API — not for the frontend. The Bank
Register screen (`RegisterHero.tsx` + `RegisterTable.tsx`, fed by
`registerModel.ts`) renders two backend calls today:

- `GET /we/chart-of-accounts/{uid}` — the account header (`RegisterHero`)
- `GET /we/chart-of-accounts/{uid}/sessions` — the ledger lines (`RegisterTable`, paginated)

The frontend already defends against missing fields (falls back to `''` / `0`
/ `null` and renders a dash), so nothing will crash if a field below is
unavailable — but the page will show blanks, "$0.00", or wrong balances where
data is missing. This doc lists exactly what each visible field needs, and
flags the two fields that are currently **guessed** (unconfirmed field names)
because no one has typed this serializer.

Goal: confirm/rename the fields below so every value on screen is fed by a real,
named backend field instead of a fallback default.

---

## 1. Account header — `GET /we/chart-of-accounts/{uid}`

Consumed by `RegisterHero.tsx`. Needed fields:

| Field | Type | Used for |
|---|---|---|
| `title` | string | Account name in the picker |
| `code` | string | Account code shown next to type/currency |
| `account_type.title` | string | "Bank" / "Credit Card" chip + icon choice (regex `/credit\s*card/i` against `account_type.title + detail_type.title` decides the credit-card layout) |
| `detail_type.title` | string | Subtitle line under the account name |
| `currency` | string (ISO 4217) | Currently only *displayed*, defaults to `'USD'` if absent — **not yet used to format `money()`**. If accounts can be non-USD, confirm whether `money()` should localize by this field (see open question #1). |
| `opening_balance` | number | "Opening balance" tile, and used as the header balance when there are no ledger lines yet |
| `is_fixed` | boolean | Shows a "Control account" chip when true |
| `date` | date string | Rendered as "As of {date}" next to the opening balance — confirm this is the account's opening/creation date, not last-modified |
| `uid` | string | Used to build the register URL when switching accounts via the picker |

**Please confirm:** is `opening_balance` guaranteed non-null for every account
(banks, credit cards, and any other type that can reach this screen), or can
it be absent for some account types? The frontend coerces missing/invalid
values to `0`, which would silently understate a real opening balance.

---

## 2. Ledger lines — `GET /we/chart-of-accounts/{uid}/sessions`

Consumed by `RegisterTable.tsx` via `toRegisterRow()` in `registerModel.ts`.
Paginated: response must be `{ count, results: [...] }` (or `{ count, data: [...] }`).

Supported query params today (sent by the frontend, please confirm all are
honored server-side):

| Param | Meaning |
|---|---|
| `page`, `limit` | Pagination |
| `search` | Free-text search — **confirm which columns this matches against** (payee name? memo? ref no? all of them?) |
| `created_at_after`, `created_at_before` | ISO date bounds, filtered against `created_at` (the frontend also re-applies this client-side as a safety net, so if the server ignores it, the UI silently fixes it up — better if the server actually filters) |

Every other filter (category, customer, supplier, store, transaction type,
reconcile status) is applied **client-side only, on the current page of
rows** — there is no server param for these today. If you want these to be
correct across the whole ledger rather than just the current page, they'd
need to become server query params too (open question #2).

### Per-row fields

The row model (`RegisterRow`) tries several candidate keys per field because
the real serializer has never been typed — this is your chance to confirm the
real ones so the frontend can drop the guesswork. "Tried keys" = what the
frontend currently checks in order; the first non-empty one wins.

| Column | Tried keys (first match wins) | Notes |
|---|---|---|
| `uid` | `uid`, `id` | Row identity, used as React key and for the detail-panel `uid` display |
| Date | `date`, `transaction_date`, `created_at` | Displayed as MM/DD/YYYY |
| Created-at | `created_at` | Kept separate from `date` — used only for the date-range filter, not displayed. **Confirm both `date` and `created_at` are always present and can genuinely differ** (e.g. a transaction dated in the past but entered today) |
| Type | `transaction_kind`, `request_kind`, `journal.kind`, else bare `kind` (only if not `DEBIT`/`CREDIT`) | See "kind ambiguity" below — **this is the biggest open question** |
| Ref no. | `ref_no`, `reference_no`, `reference`, `check_number`, `number`, or `journal` (string or `journal.uid`) | |
| Payee | `customer` / `supplier` / `employee` / `payee` object → `first_name middle_name last_name`, else `display_name`/`company_name`/`name`/`title`/`email` | Only one of these is expected to be populated per row |
| Memo | `description`, `memo`, `note`, `narration` | |
| Category | `split`, `category`, `account.title`, `contra_account.title`, `chart_of_account.title` | The contra/offsetting account on this ledger line. Multi-line (split) transactions should send a literal `"-Split-"` string here — the UI highlights that value specially |
| Class | `class_name`, `klass.title`, `department.title` | **Currently not rendered as a column** (no "Class/Department" dimension exists on this ledger per the code comment in `RegisterToolbar.tsx`) — confirm whether this should actually exist as a column, or if the field can be dropped from the model entirely |
| Store | `warehouse.title`, `warehose.title` (sic), `store.title`, `location.title` | Backend's "Store" concept is `Warehouse`. Confirm real key — is it really misspelled `warehose` on this endpoint, or was that only true on a sibling endpoint? |
| Debit | `debit`, `debit_amount` | Money out of a bank / charge on a credit card |
| Credit | `credit`, `credit_amount` | Money into a bank / payment on a credit card |
| Balance | `last_balance`, `running_balance`, `balance` | Running balance **after this row**. Needs to be pre-computed by the server in the row's sort order — see "balance & sort order" below |
| Reconcile status | `is_reconciled`/`reconciled` → `"R"`; `is_cleared`/`cleared` → `"C"`; else `reconcile_status` ("R"/"RECONCILED"/"C"/"CLEARED") | **Confirm whether `/sessions` rows carry this at all.** Today the UI assumes they don't (see below) and hides the whole Status column + legend when no row in the current page has a flag set |
| Attachments | `attachments`/`files`/`documents` (array length), else `attachment_count`/`attachments_count` | Count only, not the file list |
| Posting side | bare `kind` when it's literally `DEBIT`/`CREDIT` | Shown in the row detail panel as "Posting side" when present |

### "kind" ambiguity — please resolve

Three unrelated things in this domain are all called "kind":

- **A. Transaction type** — `SALE`, `PURCHASE`, `SALE_PAYMENT_RECEIVE`,
  `CHART_OF_ACCOUNT`, `SALE_RECEPT`/`SALE_RECEIPT` (note: API has historically
  misspelled "receipt" — confirm current spelling), etc. This is what the
  "Type" column should show (formatted: e.g. `SALE` → "Invoice", `PURCHASE` →
  "Bill").
- **B. Posting side** — `DEBIT` / `CREDIT`.
- **C. Chart-of-account class** — `ASSETS`, `INCOMES`, etc. (not relevant to
  this endpoint, listed only to explain why "kind" is overloaded elsewhere in
  this API).

A `/sessions` row's bare `kind` field could be either A or B depending on
whether the serializer flattens the parent journal. **Please confirm and
document, for this endpoint specifically:**
1. Does each row expose the *transaction type* under a distinct key
   (`transaction_kind` or `request_kind`), separate from a posting-side `kind`?
2. If a row is part of a multi-line journal entry, is there a reliable
   `journal.kind` to fall back to?
3. Is the enum of transaction types fixed, or open-ended? (The frontend
   currently title-cases any unrecognized value as a fallback, which implies
   it expects new values to appear over time — confirm if that's accurate or
   if the type list is actually closed and can be sent as a real enum/choices
   list, which would let the frontend build the "Transaction type" filter from
   the server instead of only from values seen on the current page.)

### Balance & sort order — please resolve

The header's "Running balance" and the table's per-row "Balance" column both
assume the server returns rows in a **consistent, known sort order** with a
running balance already computed per row. Please confirm:

1. What is the default sort order of `/sessions` — oldest-first or
   newest-first?
2. Is `last_balance` (or whichever key wins above) the account's running
   balance *after* that row, computed server-side, taking the full ledger
   history into account (not just the current page)?
3. Given (1), is the *last row of the last page* always the account's true
   current balance? Right now the frontend only claims "balance after the
   last line shown" specifically because it cannot verify this — if the sort
   order is guaranteed old→new, it can safely say "Current balance" instead,
   which is a better label.

### Reconcile status — please resolve

There is currently no known way to *set* reconcile status on a single ledger
line — reconciliation is a separate flow over bank-feed transactions
(`is_cleared` on `/we/transactions/csv/list`, committed via
`POST /we/transactions/reconcile/complete`). The register only *displays*
whatever flag a `/sessions` row happens to carry, and hides the entire
Status column/legend/progress-bar when no row in the current page has one set.

**Please confirm:** do `/sessions` rows carry a reconcile flag at all today?
If yes, name the real field (see candidates above). If no, and there's a plan
to expose reconcile state on the ledger line itself (rather than only on the
bank-feed transaction), flag that as a future contract change — the frontend
will need a real per-line status field plus (ideally) a way to filter/sort by
it server-side, since today's status filter is client-side/page-scoped only.

---

## 3. Open questions summary (please answer explicitly)

1. **Currency**: should `money()` formatting vary by `account.currency`, or is
   every account USD in practice today?
2. **Server-side filters**: should category/customer/supplier/store/type/status
   filters become real query params on `/sessions` (so filtering works across
   the whole ledger, not just the loaded page)? If yes, please specify the
   exact param names so the frontend can wire them up to replace the
   client-side-only filtering in `registerModel.ts`.
3. **`kind` fields**: which keys does `/sessions` actually return for
   transaction type vs. posting side (see "kind ambiguity" above)?
4. **`warehose` spelling**: is the store/warehouse relation on this endpoint
   really misspelled `warehose`, correctly spelled `warehouse`, or nested
   under something else entirely?
5. **Sort order + balance semantics**: is `/sessions` guaranteed old→new (or
   new→old), and is the per-row balance the true running balance across the
   whole account history?
6. **Reconcile status**: does `/sessions` expose a per-line reconcile flag
   today, and if so under what field name?
7. **Search scope**: which fields does `?search=` match against on `/sessions`?

Once these are confirmed, `registerModel.ts`'s `toRegisterRow()` /
`resolveKind()` / `readStatus()` can be simplified to read the real field
names directly instead of trying a list of guesses.
