/** Digits only, max 9 */
export function parseSSNDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 9);
}

/** Format as AAA-GG-SSSS from any input */
export function formatSSN(value: string): string {
  const d = parseSSNDigits(value);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

/** SSN optional: empty OK; if any digits, must be exactly 9 */
export function ssnFieldError(ssn: string | undefined): string | null {
  const d = parseSSNDigits(ssn ?? "");
  if (d.length === 0) return null;
  if (d.length !== 9) return "Enter a valid 9-digit SSN (XXX-XX-XXXX).";
  return null;
}

export function emailError(email: string | undefined, required: boolean): string | null {
  const v = (email ?? "").trim();
  if (!v) return required ? "This field is required." : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return null;
}

/** E.164 from react-phone-input; need at least 10 national digits (US typical) */
export function phoneDigits(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function phoneError(value: string | undefined, required: boolean): string | null {
  const d = phoneDigits(value);
  if (d.length === 0) return required ? "Phone number is required." : null;
  if (d.length < 10) return "Enter a complete phone number.";
  return null;
}

export function requiredTextError(value: string | undefined): string | null {
  if (!(value ?? "").trim()) return "This field is required.";
  return null;
}

/** Optional home phone: if partially filled, must be complete */
export function optionalPhoneError(value: string | undefined): string | null {
  const d = phoneDigits(value);
  if (d.length === 0) return null;
  if (d.length < 10) return "Enter a complete phone number or leave blank.";
  return null;
}

export const fieldErrorClass = "border-red-500 ring-1 ring-red-500/30";

/** I-9 step: validate conditional fields */
export function employmentI9FieldErrors(data: {
  citizenship_kind?: string;
  uscis_or_alien_registration_number?: string;
  authorized_to_work_until?: string;
  authorized_to_work_na?: boolean;
  from_i_94?: string;
  country?: string;
}): Record<string, string | null> {
  const e: Record<string, string | null> = {
    citizenship_kind: !data?.citizenship_kind?.trim()
      ? "This field is required."
      : null,
  };

  if (data?.citizenship_kind === "LAWFUL_RESIDENT") {
    e.uscis_lr = requiredTextError(data?.uscis_or_alien_registration_number);
  }

  if (data?.citizenship_kind === "OTHER") {
    const hasAuth =
      data?.authorized_to_work_na ||
      !!(data?.authorized_to_work_until ?? "").trim();
    e.authorized_until = !hasAuth
      ? "Enter the date or mark Not applicable."
      : null;
    e.uscis_other = requiredTextError(data?.uscis_or_alien_registration_number);
    e.from_i_94 = requiredTextError(data?.from_i_94);
    e.country = !(data?.country ?? "").trim() ? "This field is required." : null;
  }

  return e;
}

