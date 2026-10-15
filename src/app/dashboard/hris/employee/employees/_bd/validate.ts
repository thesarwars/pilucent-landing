/**
 * Live hints (backend §4). The server validates again and is the authority;
 * these only stop the user typing blind.
 */

const digitsOnly = (v: string | null | undefined) => String(v ?? '').replace(/\D/g, '');

/** §4.1: 10, 13 or 17 digits once non-digits are stripped. */
export const nidValid = (v: string | null | undefined) => [10, 13, 17].includes(digitsOnly(v).length);

/** §4.2: exactly 11 digits starting 01. Also wallets. */
export const mobileValid = (v: string | null | undefined) => {
  const d = digitsOnly(v);
  return d.length === 11 && d.startsWith('01');
};

export const etinValid = (v: string | null | undefined) => digitsOnly(v).length === 12;

/** §4.4: a gated change needs a reason of at least 10 characters, trimmed. */
export const MIN_REASON = 10;
export const reasonLength = (v: string) => v.trim().length;

/** Σ share, to the thousandth, from decimal strings. */
export function shareTotal(shares: string[]): number {
  const thousandths = shares.reduce((sum, s) => {
    const [whole = '0', frac = ''] = String(s || '0').trim().split('.');
    const n = Number(whole || 0) * 1000 + Number((frac + '000').slice(0, 3));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  return thousandths / 1000;
}

export const sharesComplete = (total: number) => Math.abs(total - 100) <= 0.001;
