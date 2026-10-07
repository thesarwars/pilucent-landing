import { toast } from 'react-toastify';

/**
 * Normalises the error bodies this API returns, and renders them.
 *
 * Written against `FRONTEND_INSTRUCTIONS_COA.md`. Three body shapes exist:
 *
 *   field-scoped  { "account_type_slug": "'Bank' is not a valid account type…" }
 *   form-scoped   { "message": "Fixed account cannot be modified." }
 *   409 conflict  { "error": true, "message": "…", "detail": "…" }
 *
 * Note there is deliberately no assumption of a `detail` key — DRF's default is
 * not used for these endpoints — but `{ "detail": … }` is still handled because
 * auth/permission failures do use it.
 */

export interface ParsedApiError {
  /** Form-scoped sentence, safe to show on its own. */
  message?: string;
  /** Field-scoped sentences, keyed by the offending field. */
  fields: Record<string, string>;
  /** Extra context carried by the 409 envelope. */
  detail?: string;
  /** The body claimed `error: true` (the 409 envelope). Prefer the HTTP status. */
  isConflictBody: boolean;
}

/** Keys that are part of the envelope rather than a field that failed validation. */
const ENVELOPE_KEYS = new Set(['error', 'message', 'detail', 'success']);

const asText = (value: unknown): string => {
  if (Array.isArray(value)) return value.map((v) => String(v)).join(' ');
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

/**
 * Accepts whatever the transport produced — a parsed object, a JSON string, or
 * a plain-text gateway message — and returns a predictable shape.
 */
export function parseApiErrorBody(raw: unknown): ParsedApiError {
  const out: ParsedApiError = { fields: {}, isConflictBody: false };
  let body: any = raw;

  if (body == null) return out;

  if (typeof body === 'string') {
    const text = body.trim();
    if (!text) return out;
    try {
      body = JSON.parse(text);
    } catch {
      // Not JSON — an HTML error page or a proxy message. Use it as-is.
      out.message = text;
      return out;
    }
  }

  if (Array.isArray(body)) {
    const text = body.map((v) => String(v)).join(' ').trim();
    if (text) out.message = text;
    return out;
  }

  if (typeof body !== 'object') {
    const text = String(body).trim();
    if (text) out.message = text;
    return out;
  }

  if (body.error === true) out.isConflictBody = true;

  const message = asText(body.message).trim();
  if (message) out.message = message;

  const detail = asText(body.detail).trim();
  if (detail) out.detail = detail;

  Object.keys(body).forEach((key) => {
    if (ENVELOPE_KEYS.has(key)) return;
    const text = asText(body[key]).trim();
    if (text) out.fields[key] = text;
  });

  // `{ "detail": "Authentication credentials were not provided." }` — nothing
  // else to show, so promote it.
  if (!out.message && !Object.keys(out.fields).length && out.detail) {
    out.message = out.detail;
    out.detail = undefined;
  }

  return out;
}

/** `account_type_slug` → `Account type`. */
const FIELD_LABELS: Record<string, string> = {
  title: 'Account name',
  code: 'Account code',
  account_type_slug: 'Account type',
  detail_type_slug: 'Detail type',
  parent_uid: 'Parent account',
  opening_balance: 'Opening balance',
  status: 'Status',
};

export function fieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const words = key
    .replace(/_(slug|uid|id)$/i, '')
    .split('_')
    .filter(Boolean)
    .join(' ');
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : key;
}

/**
 * Shows every problem the server reported.
 *
 * `message` wins when present, otherwise each field renders against its label,
 * otherwise the fallback. Mirrors the handling described in the COA doc §1.
 */
export function toastApiError(raw: unknown, fallback = 'Something went wrong.') {
  const parsed = parseApiErrorBody(raw);
  const fieldKeys = Object.keys(parsed.fields);

  if (parsed.message) {
    toast.error(parsed.message, { autoClose: 6000 });
  }
  fieldKeys.forEach((key) => {
    toast.error(`${fieldLabel(key)}: ${parsed.fields[key]}`, { autoClose: 6000 });
  });

  if (!parsed.message && !fieldKeys.length) {
    toast.error(fallback, { autoClose: 6000 });
  }
}

/* ── Chart of Accounts deletion ──────────────────────────────────────── */

const CONTROL_ACCOUNT_COPY =
  'This is a control account the ledger posts to, so it cannot be deleted.';
// A `POST .../deactivate` endpoint now exists (COA doc §5), so "deactivate it
// instead" is real, actionable advice rather than a dead end — the delete
// dialog offers that action directly rather than just naming it in a toast.
const HAS_HISTORY_COPY =
  'This account has transactions posted to it, so it cannot be deleted. You can deactivate it instead — it keeps its balance and history but is hidden from new documents.';
const GENERIC_DELETE_COPY = 'This account could not be deleted.';

export function sanitizeDeleteMessage(message?: string, status?: number): string {
  const text = String(message ?? '').trim();

  // 409 is the "has ledger history" case — see COA doc §2.
  if (status === 409 || /other records depend on it/i.test(text)) return HAS_HISTORY_COPY;
  if (/control account/i.test(text)) return CONTROL_ACCOUNT_COPY;
  return text || GENERIC_DELETE_COPY;
}

/**
 * True when a delete refusal is the "has ledger history" case — the one case
 * where offering "Deactivate instead" as a follow-up action is correct.
 */
export function isDeleteBlockedByHistory(message?: string, status?: number): boolean {
  return status === 409 || /other records depend on it/i.test(String(message ?? ''));
}

/**
 * Renders a Chart of Accounts delete failure, including the `409 Conflict` that
 * this API did not previously use.
 */
export function toastDeleteError(raw: unknown, status?: number) {
  const parsed = parseApiErrorBody(raw);
  const primary = parsed.message || Object.values(parsed.fields)[0];
  toast.error(sanitizeDeleteMessage(primary, status), { autoClose: 7000 });
}

/** Tooltip copy for controls we disable because the account is `is_fixed`. */
export const CONTROL_ACCOUNT_HINT =
  'Control accounts are permanent — the ledger posts to them, so they cannot be edited or deleted.';

/* ── Chart of Accounts deactivation ──────────────────────────────────── */

/**
 * `POST/DELETE /we/chart-of-accounts/{uid}/deactivate` (COA doc §5, corrected
 * by §10.1). Refusals carry a machine-readable `code` — branch on that, not the
 * sentence. **`COA-153` gates on the account's `system_key`, which is not
 * exposed to the client — do NOT pre-empt it by checking `is_fixed`.** Attempt
 * the call and handle whichever code comes back.
 */
export type DeactivateErrorCode = 'COA-150' | 'COA-151' | 'COA-152' | 'COA-153';

export interface DeactivateReference {
  label: string;
  count: number;
  sample: string[];
}

export interface DeactivateChild {
  uid: string;
  title: string;
}

export interface ParsedDeactivateError {
  code?: DeactivateErrorCode;
  message: string;
  /** COA-150 — the balance still held on the account. */
  balance?: number;
  /** COA-151 — settings that still point at this account, with deep-link hints. */
  references?: DeactivateReference[];
  /** COA-152 — active sub-accounts; resend with `{ cascade: true }` to retire them too. */
  children?: DeactivateChild[];
}

/**
 * Parses a deactivate-endpoint failure body. Call with `error.response.data`
 * from a `postDeactivateAccount` / `reactivateAccount` catch block (both use
 * `isReturnError: true`, so the raw axios error reaches the caller — see
 * `src/app/helpers/api.js`'s `post`/`del`).
 */
export function parseDeactivateError(raw: unknown): ParsedDeactivateError {
  const parsed = parseApiErrorBody(raw);
  const body = raw && typeof raw === 'object' ? (raw as any) : {};
  const code: DeactivateErrorCode | undefined = ['COA-150', 'COA-151', 'COA-152', 'COA-153'].includes(
    body.code
  )
    ? body.code
    : undefined;

  return {
    code,
    message: parsed.message || Object.values(parsed.fields)[0] || 'This account could not be deactivated.',
    balance: typeof body.balance === 'number' ? body.balance : undefined,
    references: Array.isArray(body.references) ? body.references : undefined,
    children: Array.isArray(body.children) ? body.children : undefined,
  };
}
