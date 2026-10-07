/**
 * Violet Suite — raw token values + helpers.
 *
 * Most styling lives in Tailwind (`v-*` colors, `shadow-v-*`, `rounded-v-*`,
 * `animate-v-*`, `font-jakarta`). The values here cover the cases Tailwind
 * can't express cleanly as a utility: dark-hero gradients, radial glow orbs,
 * per-person avatar gradients, and money formatting.
 */

export type VioletTone = 'violet' | 'success' | 'warn' | 'danger' | 'rose' | 'teal' | 'neutral';

export const V = {
  gradients: {
    primary: 'linear-gradient(140deg, #7C4DFF, #A78BFF)',
    heroViolet: 'linear-gradient(155deg, #16172A, #33245f)',
    heroOverview: 'linear-gradient(135deg, #2A2440 0%, #4A3B7A 68%, #5B46A0 110%)',
    heroAmber: 'linear-gradient(155deg, #16172A, #4a3318)',
    heroGreen: 'linear-gradient(155deg, #16172A, #1d4035)',
    heroRose: 'linear-gradient(155deg, #16172A, #4a1f2e)',
  },
  /** Radial glow orbs for the corners of dark hero cards. */
  orb: {
    violet: 'radial-gradient(circle, rgba(124,77,255,0.45), transparent 70%)',
    amber: 'radial-gradient(circle, rgba(245,178,46,0.4), transparent 70%)',
    green: 'radial-gradient(circle, rgba(31,169,122,0.45), transparent 70%)',
    rose: 'radial-gradient(circle, rgba(229,112,138,0.4), transparent 70%)',
    white: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)',
  },
} as const;

const AVATAR_GRADIENTS = [
  'linear-gradient(140deg, #7C4DFF, #A78BFF)',
  'linear-gradient(140deg, #0E7490, #22D3EE)',
  'linear-gradient(140deg, #B97608, #F5B22E)',
  'linear-gradient(140deg, #1FA97A, #6EE7B7)',
  'linear-gradient(140deg, #B43A6B, #F77FA1)',
  'linear-gradient(140deg, #33245f, #7C4DFF)',
];

/** Deterministic per-person avatar gradient from a name or numeric seed. */
export function avatarGradient(seed: string | number): string {
  const n =
    typeof seed === 'number'
      ? seed
      : [...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[Math.abs(n) % AVATAR_GRADIENTS.length];
}

/** "Amara Osei" → "AO" (max two letters). */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Money in the Violet Suite convention: `$1,234.56`, two decimals, real minus
 * sign for negatives (`−$1,234.56`). Pair with `tabular-nums` so columns align.
 */
export function money(n: number): string {
  const s = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (n < 0 ? '−$' : '$') + s;
}
