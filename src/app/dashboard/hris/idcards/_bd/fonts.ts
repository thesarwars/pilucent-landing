/**
 * The module's faces (§3): IBM Plex Sans and Mono for the chrome and the
 * card, Noto Sans Bengali (the app's, `--font-bengali`) for Bangla. The card
 * renders in the same three families the server prints with
 * (`idcardio/fonts`), so the canvas and the PDF agree.
 *
 * `canvasMeasurer` measures text in the loaded faces. The server measures
 * again with HarfBuzz before anything prints; this keeps the designer's
 * warnings honest in between (§17 defect 1).
 */

import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { approxMeasurer, ptToMm, type Measurer } from './engine';

export const plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--idc-sans' });
export const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--idc-mono' });

export const FAMILIES = ['IBM Plex Sans', 'IBM Plex Mono', 'Noto Sans Bengali'] as const;
const WEIGHTS: Record<string, number[]> = {
  'IBM Plex Sans': [400, 500, 600, 700],
  'IBM Plex Mono': [400, 500],
  'Noto Sans Bengali': [400, 500, 600, 700],
};

const family = (name?: string) => (name && name in WEIGHTS ? name : 'IBM Plex Sans');

/** The nearest weight the print set has -- the one the server will use. */
export function nearestWeight(fam: string | undefined, w: number | undefined) {
  const have = WEIGHTS[family(fam)];
  const want = Number(w || 400);
  return have.reduce((best, x) => (Math.abs(x - want) < Math.abs(best - want) || (Math.abs(x - want) === Math.abs(best - want) && x > best) ? x : best), have[0]);
}

/** CSS stack: Bangla in a Latin face falls back to Noto Sans Bengali, as on the server. */
export function cssStack(fam?: string) {
  const f = family(fam);
  if (f === 'IBM Plex Mono') return `var(--idc-mono), 'IBM Plex Mono', var(--font-bengali), monospace`;
  if (f === 'Noto Sans Bengali') return `var(--font-bengali), 'Noto Sans Bengali', sans-serif`;
  return `var(--idc-sans), 'IBM Plex Sans', var(--font-bengali), sans-serif`;
}

const canvasFamily = (fam?: string) => {
  const f = family(fam);
  const bn = "'Noto Sans Bengali'";
  if (typeof document === 'undefined') return f;
  const body = getComputedStyle(document.body);
  const pick = (v: string) => body.getPropertyValue(v).trim();
  const bengali = pick('--font-bengali') || bn;
  if (f === 'IBM Plex Mono') return `${plexMono.style.fontFamily}, ${bengali}`;
  if (f === 'Noto Sans Bengali') return bengali;
  return `${plexSans.style.fontFamily}, ${bengali}`;
};

let ctx2d: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

/** mm per pt of `text`, measured once at 100px and scaled -- width is linear in size. */
function perPt(text: string, fam: string | undefined, w: number | undefined): number | null {
  if (typeof document === 'undefined') return null;
  if (!ctx2d) ctx2d = document.createElement('canvas').getContext('2d');
  if (!ctx2d) return null;
  const key = `${family(fam)}|${nearestWeight(fam, w)}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  ctx2d.font = `${nearestWeight(fam, w)} 100px ${canvasFamily(fam)}`;
  const v = (ctx2d.measureText(text).width / 100) * ptToMm(1);
  cache.set(key, v);
  return v;
}

export const canvasMeasurer: Measurer = {
  exact: false,
  measure(text, sizePt, ls, fam, w) {
    const p = perPt(text, fam, w);
    if (p === null) return approxMeasurer.measure(text, sizePt, ls, fam, w);
    // 100px em: width/100 is ems; one em at `sizePt` is ptToMm(sizePt) mm.
    return p * sizePt + ptToMm(ls || 0) * text.length;
  },
};

/** Measurements taken before the faces loaded are wrong: drop them. */
export function resetMeasurements() {
  cache.clear();
}
