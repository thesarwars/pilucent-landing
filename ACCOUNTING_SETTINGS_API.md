# Accounting (Posting Policy) settings — backend spec

The **Accounting** tab in Company Settings is built and working, but it has no API
yet — Save currently commits to local component state only. This document
specifies the endpoint the frontend needs, modelled exactly on the existing
**Expenses** settings endpoint so it drops into the same pattern.

- Frontend: [`src/components/Company_Setting/Accounting.tsx`](src/components/Company_Setting/Accounting.tsx)
- Reference implementation: [`src/components/Company_Setting/Expenses.tsx`](src/components/Company_Setting/Expenses.tsx)

---

## 1. How the existing Expenses tab works (the pattern to copy)

Base URL: `https://balanzifyapi.jumatechs.xyz/api/v1/`
Auth: `Authorization: Bearer <access_token>` on every request.

| | Expenses | Sales | Advanced / Company |
|---|---|---|---|
| Path | `we/purchases/settings` | `we/sales/settings` | `we/settings` |
| Read | `GET` | `GET` | `GET` |
| Write | `PATCH` `multipart/form-data` | `PATCH` `application/json` | `PATCH` `multipart/form-data` |

**Read** — `GET we/purchases/settings` returns one flat object for the caller's
company. The frontend coerces each field with `!!` and holds it in local state:

```jsonc
{
  "is_purchase_item": true,
  "is_tag": false,
  "is_track_expense_and_items_by_customer": true,
  "is_expense_and_item_billable": false,
  "is_purchase_order": true
}
```

**Write** — `PATCH we/purchases/settings`. The frontend builds a `FormData` from
every key it holds and sends the whole object on each save, even when only one
toggle changed:

```js
const payload = new FormData();
Object.keys(draft).forEach((key) => payload.append(key, draft[key].toString()));
// → is_purchase_item=true&is_tag=false&...  (booleans arrive as the STRINGS "true"/"false")
```

The response body is re-fetched via `GET` immediately after a successful `PATCH`.

> **Note for this new endpoint:** the Accounting tab has no file upload, so
> plain **JSON** (`PATCH` with `Content-Type: application/json`) is the better
> fit — same as `we/sales/settings`. That avoids the string-coercion problem
> where `false` arrives as the truthy string `"false"`. The frontend is ready to
> send either; **JSON is the recommendation**. Section 5 gives both shapes.

---

## 2. Proposed endpoint

```
GET   /api/v1/we/accounting/settings
PATCH /api/v1/we/accounting/settings
```

Scoped to the authenticated user's company, exactly like `we/purchases/settings`.
One settings row per company, auto-created with the defaults in §3 on first read.

---

## 3. Fields

Every field below maps 1:1 to a control already on screen. Column **UI** is the
visible label; **Card** is which of the three cards it sits in.

| Card | UI label | Field | Type | Default | Constraints |
|---|---|---|---|---|---|
| Required fields | From / To | `from_to_requirement` | enum | `HISTORY` | one of `HISTORY`, `ALWAYS`, `NEVER` |
| Required fields | Location | `location_requirement` | enum | `HISTORY` | one of `HISTORY`, `ALWAYS`, `NEVER` |
| Review & timing | Hold for review | `review_threshold` | decimal(12,2) | `2500.00` | `>= 0`, not null |
| Review & timing | Effective date | `effective_date` | date | today | `YYYY-MM-DD`, not null |
| Review & timing | Posting notes | `posting_notes` | text | `""` | nullable, max 1000 chars |
| Asset & expense policy | Fixed assets | `fixed_asset_threshold` | decimal(12,2) | `2500.00` | `>= 0`, not null |
| Asset & expense policy | Prepaid expenses | `prepaid_expense_threshold` | decimal(12,2) | `2500.00` | `>= 0`, not null |

Plus the usual audit columns already present on the other settings models:
`created_at`, `updated_at`.

### Notes on individual fields

**`from_to_requirement` / `location_requirement`** — three-state rule for whether
that field is mandatory before a transaction can post:

| Value | Meaning |
|---|---|
| `HISTORY` | Required only when Balanzify has categorization history for this payee / transaction type. This is the default and the "smart" option. |
| `ALWAYS` | Always required. |
| `NEVER` | Never required. |

Enum naming follows the existing convention in this codebase (`ACCRUAL` / `CASH`
on `accounting_method`, `PRINT_LATER` / `SEND_LATER` on
`preferred_delivery_method`).

**Category is deliberately not a field.** The UI shows it as permanently
`Required` with a lock icon — it is not configurable, so it needs no column.

**`review_threshold`** — transactions **strictly greater than** this amount are
held for human review instead of auto-posting. `0` means hold everything above
zero; there is no "hold nothing" sentinel. The frontend blocks Save when this is
blank, non-numeric, or negative.

**`effective_date`** — the policy applies to transactions dated **on or after**
this day. Older history is never re-evaluated. Backend should treat this as
forward-only and must not retro-apply on save.

**`fixed_asset_threshold`** — purchases **at or above** this amount are
capitalized as fixed assets rather than expensed.

**`prepaid_expense_threshold`** — expenses **at or above** this amount are spread
over time rather than booked in full.

---

## 4. `GET` response

```jsonc
{
  "from_to_requirement": "HISTORY",
  "location_requirement": "HISTORY",
  "review_threshold": "2500.00",
  "effective_date": "2024-08-05",
  "posting_notes": "",
  "fixed_asset_threshold": "2500.00",
  "prepaid_expense_threshold": "2500.00",
  "created_at": "2026-08-10T09:12:44Z",
  "updated_at": "2026-08-10T09:12:44Z"
}
```

Decimals may come back as either JSON numbers or numeric strings — the frontend
parses both. Please **do not** return them pre-formatted with thousands
separators (`"2,500.00"`); the UI applies its own display formatting.

If no row exists yet, return the defaults with `200` rather than `404`, the same
way `we/purchases/settings` behaves for a fresh company.

---

## 5. `PATCH` request

The frontend sends **all seven fields on every save**, matching how Expenses
behaves. Please also accept partial payloads (any subset of keys) so the tab can
later save one card at a time.

### Recommended — JSON

```http
PATCH /api/v1/we/accounting/settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```jsonc
{
  "from_to_requirement": "ALWAYS",
  "location_requirement": "HISTORY",
  "review_threshold": 5000,
  "effective_date": "2026-09-01",
  "posting_notes": "Check PO number on anything over $5k.",
  "fixed_asset_threshold": 2500,
  "prepaid_expense_threshold": 1000
}
```

### Alternative — multipart, if you prefer to mirror Expenses exactly

```http
PATCH /api/v1/we/accounting/settings
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

```
from_to_requirement=ALWAYS
location_requirement=HISTORY
review_threshold=5000
effective_date=2026-09-01
posting_notes=Check PO number on anything over $5k.
fixed_asset_threshold=2500
prepaid_expense_threshold=1000
```

Every value arrives as a **string** in this mode — parse `review_threshold` and
the two thresholds as decimals server-side.

**Response:** the full updated object, same shape as the `GET` in §4. The
frontend re-fetches after a successful save regardless, so a `204` also works,
but returning the object saves a round trip.

---

## 6. Validation

| Case | Expected |
|---|---|
| `review_threshold` / thresholds negative, blank, or non-numeric | `400` |
| enum value outside `HISTORY` / `ALWAYS` / `NEVER` | `400` |
| `effective_date` not `YYYY-MM-DD` | `400` |
| `posting_notes` over 1000 chars | `400` |
| no auth token / expired | `401` |
| user's company has no access | `403` |

Error body in the shape the frontend already surfaces via toast:

```jsonc
{ "detail": "review_threshold must be 0 or greater." }
```

or DRF-style per-field:

```jsonc
{ "review_threshold": ["Ensure this value is greater than or equal to 0."] }
```

The client currently shows a generic toast on failure, so either is fine — but
per-field errors let us wire inline field messages later.

---

## 7. Not in scope for this endpoint (needs a decision)

The Accounting tab's dark summary card shows **"N held of 75 recent
transactions"** and an **auto-post %** ring, which recompute live as you type a
threshold. Right now that is driven by a **hardcoded sample array of 75
transaction amounts** in the frontend — it is illustrative, not real.

To make it real we need one of:

**Option A (preferred) — a small stats endpoint:**

```
GET /api/v1/we/accounting/settings/impact?threshold=5000
→ { "total": 412, "held": 38, "auto_post_pct": 91 }
```

Called on a debounce as the threshold changes.

**Option B — return the raw amounts once** and let the frontend compute:

```
GET /api/v1/we/accounting/recent-transaction-amounts
→ { "amounts": [18, 24, 32, ...] }
```

Option A is less data over the wire and keeps the "recent" window definition
server-side. Either way, please confirm what "recent" should mean (last 90 days?
last 100 transactions?).

Until this exists the ring stays on sample data and is visibly illustrative.

---

## 8. Frontend work once this lands

Small and contained — `Accounting.tsx` already uses the same saved/draft state
split as Expenses, so wiring is:

1. `useQuery` on `GET we/accounting/settings` → seed `saved` and `draft`.
2. Replace the local `persist()` with a `useMutation` calling
   `Patch('we/accounting/settings', draft, token)`.
3. Map the two enums between the API's `HISTORY`/`ALWAYS`/`NEVER` and the
   component's existing `'history' | 'always' | 'never'` union (or just switch
   the union to uppercase).
4. Drop the sample `TXNS` array in favour of §7.

No layout or component changes required.
