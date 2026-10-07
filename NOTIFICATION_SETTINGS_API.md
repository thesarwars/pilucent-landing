# Notification settings — backend spec

The **Notifications** tab in Company Settings is built and working, but it has no
API yet — Save commits to local component state only. This document specifies the
endpoint the frontend needs, modelled on the existing **Expenses** settings
endpoint.

- Frontend: [`src/components/Company_Setting/Notifications.tsx`](src/components/Company_Setting/Notifications.tsx)
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

**Read** — `GET we/purchases/settings` returns one flat object of booleans:

```jsonc
{
  "is_purchase_item": true,
  "is_tag": false,
  "is_track_expense_and_items_by_customer": true,
  "is_expense_and_item_billable": false,
  "is_purchase_order": true
}
```

**Write** — `PATCH we/purchases/settings` with the whole object on every save,
even when only one toggle changed. The frontend re-fetches after success.

> **For this endpoint, use JSON**, not multipart. Every field here is a boolean,
> and multipart turns `false` into the truthy string `"false"` — an easy source
> of bugs. `we/sales/settings` already uses plain JSON `PATCH`, so there is
> precedent. Section 5 shows both shapes in case you prefer to match Expenses
> exactly.

---

## 2. Proposed endpoint

```
GET   /api/v1/me/notification-settings
PATCH /api/v1/me/notification-settings
```

### ⚠️ This is **per-user**, not per-company

Unlike every other settings tab, these preferences belong to the **signed-in
person**, not the company. Two accountants in the same company must be able to
have different alerts on. The tab itself says so: *"Working with a team? Everyone
gets new assignments and due dates, but each person tunes the rest here."*

Hence the `me/` prefix rather than `we/`.

### ⚠️ Path collision to avoid

`me/notifications` is **already in use** as the paginated in-app notification
feed, and `GET me/notifications/{uid}` marks a single notification as read
(see [`src/components/DashboardHeader/Notification.tsx`](src/components/DashboardHeader/Notification.tsx)).

So **do not** mount this at `me/notifications/settings` — it would be
indistinguishable from a notification whose `uid` is the literal string
`"settings"`. `me/notification-settings` keeps the two routes cleanly apart.
Any non-colliding path is fine; just confirm which one you pick.

---

## 3. Fields

Seven booleans, one per toggle row on screen, all in the "Project change alerts"
card.

| UI label | UI description | Field | Type | Default |
|---|---|---|---|---|
| New assignments | When a task or project is assigned to you. | `is_notify_new_assignments` | bool | `true` |
| Due dates | Reminders as deadlines approach. | `is_notify_due_dates` | bool | `true` |
| Details | Edits to descriptions, notes, or attachments. | `is_notify_details` | bool | `false` |
| Status | When a project or task changes status. | `is_notify_status` | bool | `false` |
| Project name | When a project is renamed. | `is_notify_project_name` | bool | `false` |
| Assignees | When people are added or removed. | `is_notify_assignees` | bool | `false` |
| Deletions | When a task or project is deleted. | `is_notify_deletions` | bool | `false` |

Plus the usual audit columns: `created_at`, `updated_at`.

Naming follows the existing `is_*` boolean convention (`is_purchase_item`,
`is_tag`, `is_track_expense_and_items_by_customer`).

### Delivery address is **not** part of this payload

The tab shows a "Delivered to" card with the user's email and a **Verified**
chip, but both are read-only here — the frontend already reads them from the
existing user object (`getUser()` → redux `userData.UserData`):

- `email` → the address shown
- `is_email_verified` → whether the Verified chip renders

Changing the address happens on the profile page, which the card links to. So no
email field is needed on this endpoint.

*Optional convenience:* if you'd rather the tab not depend on redux, echo
`delivery_email` and `is_email_verified` in the `GET` response and the frontend
will prefer those. Not required.

---

## 4. `GET` response

```jsonc
{
  "is_notify_new_assignments": true,
  "is_notify_due_dates": true,
  "is_notify_details": false,
  "is_notify_status": false,
  "is_notify_project_name": false,
  "is_notify_assignees": false,
  "is_notify_deletions": false,
  "created_at": "2026-08-10T09:12:44Z",
  "updated_at": "2026-08-10T09:12:44Z"
}
```

If no row exists for this user yet, return the defaults from §3 with `200` rather
than `404` — same as `we/purchases/settings` does for a fresh company. The
frontend coerces every field with `!!`, so `null` is survivable but please send
real booleans.

---

## 5. `PATCH` request

The frontend sends **all seven fields on every save**, matching Expenses. Please
also accept partial payloads (any subset of keys).

### Recommended — JSON

```http
PATCH /api/v1/me/notification-settings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```jsonc
{
  "is_notify_new_assignments": true,
  "is_notify_due_dates": true,
  "is_notify_details": true,
  "is_notify_status": true,
  "is_notify_project_name": false,
  "is_notify_assignees": false,
  "is_notify_deletions": false
}
```

### Alternative — multipart, if you prefer to mirror Expenses exactly

```http
PATCH /api/v1/me/notification-settings
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

```
is_notify_new_assignments=true
is_notify_due_dates=true
is_notify_details=true
is_notify_status=true
is_notify_project_name=false
is_notify_assignees=false
is_notify_deletions=false
```

Values arrive as the **strings** `"true"` / `"false"` in this mode — parse them
server-side, don't truthiness-test them.

**Response:** the full updated object, same shape as §4. The frontend re-fetches
after a successful save anyway, so `204` also works.

---

## 6. Validation

| Case | Expected |
|---|---|
| non-boolean value for any field | `400` |
| unknown field in payload | ignore, or `400` — your call |
| no auth token / expired | `401` |

Error body:

```jsonc
{ "detail": "is_notify_status must be a boolean." }
```

or DRF-style per-field:

```jsonc
{ "is_notify_status": ["Must be a valid boolean."] }
```

The client shows a generic toast on failure, so either works.

---

## 7. Open questions

1. **Multi-company users.** If one person can belong to more than one company,
   should these preferences be per-user or per (user, company) membership? The
   frontend sends no company identifier — it relies on the bearer token's
   session. If it needs to be per-membership, say so and we'll scope the request.

2. **Are New assignments / Due dates meant to be mandatory?** The source design
   says *"Everyone gets new assignments and due dates, but each person tunes the
   rest here"*, which reads as though those two are always-on for team members.
   The current UI lets you switch all seven off. If those two should be locked,
   tell us and we'll render them as fixed rows like the "Category — Required"
   row on the Accounting tab.

3. **Channels.** The tab is email-only today ("…land in your inbox", "Delivered
   to"). If you plan in-app or push channels later, we should decide now whether
   to name these `is_email_notify_*` and add a parallel set, or move to a
   channel matrix (`{ event, email, in_app, push }`). Flat booleans are fine for
   now — just don't want to rename later.

4. **What actually emits these?** This endpoint only stores preferences. Whatever
   service sends project-change emails needs to read them. Worth confirming that
   consumer exists or is planned.

---

## 8. Frontend work once this lands

Small and contained — `Notifications.tsx` already uses the same saved/draft split
as Expenses:

1. `useQuery` on `GET me/notification-settings` → seed `saved` and `draft`.
2. Replace the local `persist()` with a `useMutation` calling
   `Patch('me/notification-settings', draft, token)`.
3. Map the component's camelCase `AlertKey` union (`newAssignments`, `dueDates`,
   …) to the API's `is_notify_*` names — one lookup object, or rename the union.
4. Add the `MainLoader` loading state the other tabs use while the query is
   pending.

No layout or component changes required. The dirty-state bar, the alerts-on ring,
and the summary line all already derive from `draft` vs `saved`.
