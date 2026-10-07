# Report settings — backend spec

The **Reports** tab in Company Settings is built and working, but it has no API
yet — Save commits to local component state only. This document specifies the
endpoint the frontend needs, modelled on the existing **Expenses** settings
endpoint.

- Frontend: [`src/components/Company_Setting/Reports.tsx`](src/components/Company_Setting/Reports.tsx)
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
company. **Write** — `PATCH` the whole object on every save. The frontend
re-fetches after success.

> **For this endpoint, use JSON.** There are 23 fields of mixed type — booleans,
> enums, hex color strings and an integer. Multipart flattens everything to
> strings and turns `false` into the truthy `"false"`. `we/sales/settings`
> already uses plain JSON `PATCH`, so there is precedent.

---

## 2. Proposed endpoint

```
GET   /api/v1/we/reports/settings
PATCH /api/v1/we/reports/settings
```

**Company-scoped** (`we/`), one row per company, like Expenses and Sales. Report
styling is a company-wide presentation choice, not a personal preference — the
tab's own banner says *"These customizations apply to standard and custom
reports."*

I checked: no `we/reports…` path is currently in use anywhere in the frontend, so
this doesn't collide with anything.

Auto-create the row with the §3 defaults on first read.

---

## 3. Fields

23 fields, grouped by the accordion panel they live in.

### Header panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Company logo | `is_header_logo` | bool | `false` |
| Report period | `is_header_period` | bool | `false` |
| Company name | `is_header_company_name` | bool | `false` |
| Header alignment | `header_alignment` | enum | `CENTER` |
| Header layout | `header_layout` | enum | `COMPANY_NAME_FIRST` |

- `header_alignment` — `LEFT` \| `CENTER` \| `RIGHT`
- `header_layout` — `COMPANY_NAME_FIRST` \| `REPORT_TITLE_FIRST`.
  Only meaningful when `is_header_company_name` is true; the UI hides the control
  otherwise. Store it regardless so the choice survives toggling the name off and
  back on.

### Footer panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Date prepared | `is_footer_date_prepared` | bool | `false` |
| Time prepared | `is_footer_time_prepared` | bool | `false` |
| Report basis (cash vs. accrual) | `is_footer_report_basis` | bool | `false` |
| Footer alignment | `footer_alignment` | enum | `CENTER` |

- `footer_alignment` — `LEFT` \| `CENTER` \| `RIGHT`

### Column highlights panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Show column highlights in key columns | `is_column_highlight` | bool | `false` |
| (swatch) | `column_highlight_color` | char(7) | `#DDE7F5` |

### Banded rows panel

| UI label | Field | Type | Default |
|---|---|---|---|
| (swatch on/off) | `is_banded_rows` | bool | `false` |
| Banded row color | `banded_row_color` | char(7) | `#E7EAED` |

Both color pickers are one control in the UI: choosing the crossed-out swatch
sets the `is_*` flag to `false`; choosing a color sets it `true` **and** stores
the color. Keep the last color when switching off so re-enabling restores it.

### Empty cells panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Show empty cells as | `empty_cell_mode` | enum | `BLANK` |

- `empty_cell_mode` — `DASH` \| `BLANK`

### Gridlines panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Report borders | `report_borders` | enum | `DEFAULT` |

`report_borders` — nine values. Frontend label → enum:

| UI option | Enum |
|---|---|
| Default | `DEFAULT` |
| No borders | `NONE` |
| Horizontal borders | `HORIZONTAL` |
| Vertical borders | `VERTICAL` |
| Inner borders | `INNER` |
| Outer borders | `OUTER` |
| Horizontal and outer borders | `HORIZONTAL_AND_OUTER` |
| Vertical and outer borders | `VERTICAL_AND_OUTER` |
| All borders | `ALL` |

### Number panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Divide by 1000 | `is_divide_by_1000` | bool | `false` |
| Don't show zero amounts | `is_hide_zero_amounts` | bool | `false` |
| Don't show currency symbol | `is_hide_currency_symbol` | bool | `false` |
| Negative numbers | `negative_number_format` | enum | `MINUS_PREFIX` |
| Show in red | `is_negative_in_red` | bool | `false` |
| Decimals (mode) | `decimal_mode` | enum | `PLACES` |
| Show decimals up to … places | `decimal_places` | int | `2` |

- `negative_number_format` — `MINUS_PREFIX` (`-$100.00`) \| `PARENTHESES`
  (`($100.00)`) \| `MINUS_SUFFIX` (`$100.00-`)
- `decimal_mode` — `ROUND` (nearest whole number) \| `PLACES` (use
  `decimal_places`)
- `decimal_places` — the UI offers `0` and `2` only. Accepting `0–4` server-side
  is fine and future-proof; see open question 2.

### View panel

| UI label | Field | Type | Default |
|---|---|---|---|
| Default view of the reports | `report_density` | enum | `COMPACT` |

- `report_density` — `COMPACT` \| `NORMAL` \| `COZY` \| `COMFORT`

Plus the usual audit columns: `created_at`, `updated_at`.

---

## 4. Rendering rules (important — the exports must match the preview)

The tab renders a **live preview** that applies every rule above. Whatever
generates the real reports (PDF, XLSX, on-screen) has to apply them identically
or the preview lies. The exact logic is in `Reports.tsx` — here it is in prose:

**Amount formatting**, in this order:
1. `null` amount → `—` if `empty_cell_mode = DASH`, else empty string.
2. Amount is exactly `0` and `is_hide_zero_amounts` → empty string.
3. If `is_divide_by_1000`, divide by 1000.
4. Take the absolute value; format with `decimal_places` decimals, or round to a
   whole number if `decimal_mode = ROUND`. Thousands separators always on.
5. Prefix `$` unless `is_hide_currency_symbol`.
6. If the original was negative, apply `negative_number_format` **around the
   currency symbol** — `-$100.00`, `($100.00)`, `$100.00-`.
7. If negative and `is_negative_in_red`, render in red.

**Banded rows** — when `is_banded_rows`, fill **every second detail line** with
`banded_row_color`. The count runs over detail lines only; subtotal, total,
group-header, gross-profit and grand-total rows are skipped in the count and
never banded.

**Column highlights** — when `is_column_highlight`, fill the *amount* cell with
`column_highlight_color` on group-header, subtotal, total, gross-profit and
grand-total rows, plus the "Total" column header. Detail-line amount cells are
not highlighted.

**Borders** — from `report_borders`:

| Enum | Horizontal row rules | Vertical column rule | Outer frame |
|---|---|---|---|
| `DEFAULT` | ✓ | — | — |
| `NONE` | — | — | — |
| `HORIZONTAL` | ✓ | — | — |
| `VERTICAL` | — | ✓ | — |
| `INNER` | ✓ | ✓ | — |
| `OUTER` | — | — | ✓ |
| `HORIZONTAL_AND_OUTER` | ✓ | — | ✓ |
| `VERTICAL_AND_OUTER` | — | ✓ | ✓ |
| `ALL` | ✓ | ✓ | ✓ |

**Density** — vertical cell padding: `COMPACT` 4px, `NORMAL` 7px, `COZY` 11px,
`COMFORT` 15px.

**Header composition** — if `is_header_company_name` and
`header_layout = COMPANY_NAME_FIRST`: company name (large), then report title
(smaller, muted). Otherwise report title (large), then company name (smaller,
muted) if enabled. Then the period line if `is_header_period`. The whole block is
aligned per `header_alignment`, with the logo beside it if `is_header_logo`.

**Footer** — joins the enabled parts with `·`, in this order: date prepared, time
prepared, report basis. Hidden entirely when none are enabled.

---

## 5. `GET` response

```jsonc
{
  "is_header_logo": false,
  "is_header_period": false,
  "is_header_company_name": false,
  "header_alignment": "CENTER",
  "header_layout": "COMPANY_NAME_FIRST",

  "is_footer_date_prepared": false,
  "is_footer_time_prepared": false,
  "is_footer_report_basis": false,
  "footer_alignment": "CENTER",

  "is_column_highlight": false,
  "column_highlight_color": "#DDE7F5",
  "is_banded_rows": false,
  "banded_row_color": "#E7EAED",

  "empty_cell_mode": "BLANK",
  "report_borders": "DEFAULT",

  "is_divide_by_1000": false,
  "is_hide_zero_amounts": false,
  "is_hide_currency_symbol": false,
  "negative_number_format": "MINUS_PREFIX",
  "is_negative_in_red": false,
  "decimal_mode": "PLACES",
  "decimal_places": 2,

  "report_density": "COMPACT",

  "created_at": "2026-08-10T09:12:44Z",
  "updated_at": "2026-08-10T09:12:44Z"
}
```

If no row exists yet, return these defaults with `200` rather than `404`.

---

## 6. `PATCH` request

The frontend sends **all 23 fields on every save**, matching Expenses. Please
also accept partial payloads.

```http
PATCH /api/v1/we/reports/settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```jsonc
{
  "is_header_logo": true,
  "is_header_company_name": true,
  "header_alignment": "LEFT",
  "header_layout": "COMPANY_NAME_FIRST",
  "is_footer_date_prepared": true,
  "footer_alignment": "RIGHT",
  "is_banded_rows": true,
  "banded_row_color": "#D7EFEA",
  "report_borders": "ALL",
  "negative_number_format": "PARENTHESES",
  "is_negative_in_red": true,
  "decimal_mode": "ROUND",
  "report_density": "NORMAL"
  // …remaining fields sent too
}
```

**Response:** the full updated object, same shape as §5. `204` also works — the
frontend re-fetches after a successful save.

The tab also has a **Reset** button, which restores the §3 defaults locally. It
does **not** call the API on its own — the user still has to press Save. No
separate reset endpoint needed.

---

## 7. Validation

| Case | Expected |
|---|---|
| enum value outside its allowed set | `400` |
| color not a 7-char `#RRGGBB` string | `400` |
| `decimal_places` outside the accepted range | `400` |
| non-boolean for an `is_*` field | `400` |
| no auth token / expired | `401` |
| user's company has no access | `403` |

Error body:

```jsonc
{ "detail": "report_borders must be one of DEFAULT, NONE, HORIZONTAL, …" }
```

or DRF-style per-field:

```jsonc
{ "banded_row_color": ["Enter a valid hex color, e.g. #E7EAED."] }
```

---

## 8. Open questions

1. **Restrict colors to the palette, or allow any hex?** The UI offers 10 fixed
   pastel swatches. Storing `char(7)` hex is flexible enough for a custom picker
   later, so I'd validate the *format* (`#RRGGBB`) rather than membership of the
   palette. Confirm you're happy with that.

2. **`decimal_places` range.** UI offers 0 and 2. Accept `0–4` so we can widen
   the dropdown without a migration?

3. **Who consumes these?** This endpoint only stores preferences. The report
   renderers — on-screen reports under `/dashboard/reports`, plus PDF and Excel
   export — all need to read them and apply §4. Without that consumer the tab is
   decorative. Worth confirming that work is planned and scoped.

4. **Does "standard and custom reports" include saved/custom report overrides?**
   If a saved custom report can override company styling, we'll eventually need
   these same fields nullable on the report record itself. Not needed now, but it
   affects whether you model this as a standalone settings table or a reusable
   embeddable set of columns.

**Not needed:** the preview's Profit & Loss figures are deliberately hardcoded
sample data and should stay that way — it's a styling preview, not live numbers.
No endpoint required for it.

---

## 9. Frontend work once this lands

Contained — `Reports.tsx` already uses the same saved/draft split as Expenses:

1. `useQuery` on `GET we/reports/settings` → seed `prefs` and `saved`.
2. Replace the local `persist()` with a `useMutation` calling
   `Patch('we/reports/settings', prefs, token)`.
3. Map the component's camelCase keys and human-readable enum values
   (`hdrAlign: 'Center'`, `borders: 'Horizontal and outer borders'`,
   `viewDensity: 'Compact view'`) to the API's snake_case names and uppercase
   enums — one lookup table each way.
4. Add the `MainLoader` loading state the other tabs use while the query is
   pending.

No layout or component changes required. The live preview, the dirty-state Save
button and Reset all already derive from `prefs` vs `saved`.
