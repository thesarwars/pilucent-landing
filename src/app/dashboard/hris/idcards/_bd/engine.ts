/**
 * The card engine (docs/frontend/id-cards-done.md §5-§7), a port of the server's
 * `idcardio/services/engine.py`, itself a port of the design's
 * `idcard-core.js`. Pure: no React, no I/O. Text is measured through a
 * `Measurer`, so the canvas runs on real browser font metrics and the
 * server re-measures with its own before anything prints.
 *
 * Millimetres and points are the unit of record. Pixels appear only in the
 * conversion helpers: zoom never touches the model.
 */

export const MM_PER_INCH = 25.4;
export const CSS_PX_PER_MM = 96 / MM_PER_INCH; // 3.779527559…

export const mmToStage = (mm: number, zoom: number, ppmm = CSS_PX_PER_MM) => mm * ppmm * zoom;
export const stageToMm = (px: number, zoom: number, ppmm = CSS_PX_PER_MM) => px / (ppmm * zoom);
export const ptToMm = (pt: number) => (pt * MM_PER_INCH) / 72;
export const mmToPt = (mm: number) => (mm * 72) / MM_PER_INCH;

/** Python's round(): half to even, so 190.5 dpi reads 190 on both sides. */
export function roundHalfEven(x: number): number {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

/** 300 px at 25 mm is 305 dpi and fine; at 40 mm, 190 dpi and soft. */
export const effectiveDpi = (pixelW: number, placedWmm: number) =>
  placedWmm ? roundHalfEven(pixelW / (placedWmm / MM_PER_INCH)) : 0;
export const pxAt = (mm: number, dpi: number) => roundHalfEven((mm / MM_PER_INCH) * dpi);

export const PRESETS: Record<string, { w: number; h: number; r: number; label: string }> = {
  CR80: { w: 85.6, h: 54, r: 3.18, label: 'CR80 landscape' },
  CR79: { w: 83.9, h: 51, r: 3.18, label: 'CR79' },
  CR100: { w: 98.5, h: 67, r: 3.18, label: 'CR100' },
  BADGE_PORTRAIT: { w: 54, h: 85.6, r: 3.18, label: 'CR80 portrait' },
};

/** §6.1: tick density adapts to zoom so labels never collide. */
export function tickStepMm(zoom: number, ppmm = CSS_PX_PER_MM) {
  for (const c of [0.5, 1, 2, 5, 10, 20, 50]) if (c * ppmm * zoom >= 44) return c;
  return 100;
}

// ================================================================== types

export type Ctx = Record<string, unknown>;
export interface Frame { x: number; y: number; w: number; h: number; rotation?: number }
export interface Formatter { fn: string; arg?: string | number | null }
export type Source =
  | { kind: 'literal'; value: string }
  | { kind: 'binding'; path: string; formatters?: Formatter[] }
  | { kind: 'expression'; expr: string };
export interface Cond { op: string; path?: string; value?: unknown; children?: Cond[]; child?: Cond }
export interface TextStyle {
  fontFamily?: string; fontSize?: number; fontWeight?: number; italic?: boolean; color?: string;
  letterSpacing?: number; lineHeight?: number; align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom'; textTransform?: 'none' | 'upper' | 'lower' | 'title';
  underline?: boolean; numerals?: 'latin' | 'bengali';
}
export interface Overflow { mode?: 'wrap' | 'shrink' | 'condense' | 'truncate' | 'overflow'; minFontSize?: number; maxLines?: number; ellipsis?: string }
export interface KvRow { label: Source; value: Source; visibleWhen?: Cond }
export interface El {
  id: string; name: string; type: 'text' | 'photo' | 'qr' | 'barcode' | 'shape' | 'image' | 'kvTable' | 'group' | 'signature';
  frame: Frame; opacity?: number; hidden?: boolean; locked?: boolean; visibleWhen?: Cond;
  content?: Source; style?: TextStyle; overflow?: Overflow; emptyBehaviour?: 'hide' | 'placeholder' | 'blank'; placeholder?: string;
  path?: string; shape?: string | { kind: string; radius?: number }; fit?: 'cover' | 'contain'; fallback?: 'initials' | 'silhouette' | 'hide';
  minDpi?: number; border?: { width: number; color: string };
  payload?: { kind: 'url' | 'signed' | 'value'; source?: Source }; errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  quietZoneModules?: number; moduleColor?: string; backgroundColor?: string;
  value?: Source; symbology?: string; showHumanReadable?: boolean; quietZone?: number; barColor?: string;
  fill?: { kind: 'solid'; color: string }; stroke?: { width: number; color: string }; cornerRadius?: number;
  source?: { kind: 'binding'; path: string } | { kind: 'asset'; assetId: string };
  rows?: KvRow[]; labelStyle?: TextStyle; valueStyle?: TextStyle; labelWidth?: number; rowGap?: number; collapseEmptyRows?: boolean;
  children?: El[]; flow?: boolean; flowGap?: number;
}
export interface Background { type: 'solid' | 'image'; color?: string; assetId?: string; extendToBleed?: boolean }
export interface Side { kind: 'front' | 'back'; background?: Background; elements: El[] }
export interface Artboard { width: number; height: number; bleed: number; safe: number; radius: number }
export interface Fit { lines: string[]; fontSize: number; shrunk: boolean; shrunkFrom?: number; clipped: boolean; widthMm: number }
export interface Node {
  id: string; name: string; type: El['type']; frame: Frame; opacity: number; el: El;
  text?: string; fit?: Fit; style?: TextStyle; usedFallback?: boolean; binding?: string | null; formatters?: Formatter[];
  photo?: { assetId: string; width: number; height: number; url?: string } | null; fallbackKind?: string; initials?: string; dpi?: number;
  payload?: string; value?: string; src?: unknown;
  rows?: { label: string; value: string; valueBinding: string | null }[]; kvNeededMm?: number; kvOverflow?: boolean;
  labelStyle?: TextStyle; valueStyle?: TextStyle; children?: Node[];
}
export interface Note { elementId: string; name: string; kind: string; detail: string }
export interface Resolved { nodes: Node[]; notes: Note[]; background: Background }
export interface Finding { severity: 'error' | 'warning' | 'info'; side: string; element: string; elementId?: string | null; message: string; fix?: string | null; affected?: number; employees?: string[] }
export interface Report { findings: Finding[]; errors: number; warnings: number }

// ================================================================ bindings

const BN = '০১২৩৪৫৬৭৮৯';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const toBengaliNumerals = (s: unknown) => String(s).replace(/[0-9]/g, (d) => BN[+d]);
export const toLatinNumerals = (s: unknown) => String(s).replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));

export function getPath(ctx: unknown, path?: string | null): unknown {
  let cur: unknown = ctx;
  for (const part of String(path || '').split('.')) {
    if (!part || cur === null || typeof cur !== 'object' || Array.isArray(cur)) return null;
    cur = (cur as Record<string, unknown>)[part];
    if (cur === undefined || cur === null) return null;
  }
  return cur;
}

export function formatDate(value: unknown, pattern?: unknown): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value ?? ''));
  if (!m) return value == null ? '' : String(value);
  const [y, mo, d] = [m[1], +m[2], m[3]];
  return String(pattern || 'dd MMM yyyy')
    .replace(/yyyy/g, y).replace(/MMM/g, MONTHS[mo - 1]).replace(/MM/g, String(mo).padStart(2, '0')).replace(/dd/g, d);
}

export const titleCase = (s: unknown) =>
  String(s).toLowerCase().replace(/(^|\s|[-'])([a-zঀ-৿])/g, (_, p, c) => p + c.toUpperCase());

export function applyFormatter(value: unknown, f: Formatter): string {
  const s = value == null ? '' : String(value);
  const arg = f.arg;
  switch (f.fn) {
    case 'upper': return s.toUpperCase();
    case 'lower': return s.toLowerCase();
    case 'title': return titleCase(s);
    case 'trim': return s.trim();
    case 'initials': return s.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase();
    case 'default': return s === '' ? String(arg ?? '') : s;
    case 'truncate': { const n = parseInt(String(arg ?? 0), 10) || 0; return n && s.length > n ? s.slice(0, n) + '…' : s; }
    case 'date': return s ? formatDate(value, arg) : '';
    case 'pad': return s.padStart(parseInt(String(arg ?? 0), 10) || 0, '0');
    case 'mask': return '•'.repeat(Math.max(0, s.length - 4)) + s.slice(-4);
    case 'numerals': return arg === 'bengali' ? toBengaliNumerals(s) : toLatinNumerals(s);
    default: return s;
  }
}

/** Shown in the binding picker (§6.5). */
export const FORMATTERS: Record<string, { sig: string; help: string }> = {
  upper: { sig: 'upper', help: 'ALL CAPS' },
  lower: { sig: 'lower', help: 'all lowercase' },
  title: { sig: 'title', help: 'Title Case' },
  trim: { sig: 'trim', help: 'drops leading and trailing spaces' },
  initials: { sig: 'initials', help: 'Md. Karim Uddin → MKU' },
  default: { sig: "default('text')", help: 'used when the field is empty' },
  truncate: { sig: 'truncate(n)', help: 'truncate(18) — cuts with an ellipsis' },
  date: { sig: 'date(format)', help: "date('dd MMM yyyy')" },
  pad: { sig: 'pad(n)', help: 'pad(5) — 42 → 00042' },
  mask: { sig: 'mask', help: 'shows only the last four characters' },
  numerals: { sig: "numerals('bengali')", help: '2026 → ২০২৬' },
};

export function parseExpression(expr: unknown): [string, Formatter[]] | null {
  const parts = String(expr ?? '').split('|').map((p) => p.trim());
  if (!parts.length || !/^[A-Za-z_][\w.]*$/.test(parts[0])) return null;
  const fmts: Formatter[] = [];
  for (const p of parts.slice(1)) {
    const m = /^(\w+)(?:\(([^)]*)\))?$/.exec(p);
    if (!m || !FORMATTERS[m[1]]) return null;
    fmts.push({ fn: m[1], arg: m[2] !== undefined ? m[2].replace(/^['"]|['"]$/g, '') : null });
  }
  return [parts[0], fmts];
}

const listText = (raw: unknown) => (Array.isArray(raw) ? raw.map(String).join(', ') : String(raw));

export function resolveValue(src: Source | undefined | null, ctx: Ctx): { text: string; missing: boolean; usedFallback: boolean; raw?: unknown; invalid?: boolean } {
  if (!src) return { text: '', missing: false, usedFallback: false };
  if (src.kind === 'literal') return { text: String(src.value || ''), missing: false, usedFallback: false };
  let b: { path: string; formatters?: Formatter[] };
  if (src.kind === 'expression') {
    const parsed = parseExpression(src.expr);
    if (!parsed) return { text: '', missing: true, usedFallback: false, invalid: true };
    b = { path: parsed[0], formatters: parsed[1] };
  } else if (src.kind === 'binding') b = src;
  else return { text: '', missing: false, usedFallback: false };
  const raw = getPath(ctx, b.path);
  const missing = raw === null || raw === '' || (Array.isArray(raw) && !raw.length);
  let text = missing ? '' : listText(raw);
  let usedFallback = false;
  for (const f of b.formatters || []) {
    if (f.fn === 'default' && text === '') usedFallback = true;
    // A date formats the raw value; everything else the text so far.
    text = f.fn === 'date' ? (missing ? '' : formatDate(raw, f.arg)) : applyFormatter(text, f);
  }
  return { text, missing, usedFallback, raw };
}

// ============================================================== conditions

export function evalCondition(cond: Cond | undefined | null, ctx: Ctx): boolean {
  if (!cond) return true;
  const op = cond.op;
  if (op === 'and') return (cond.children || []).every((c) => evalCondition(c, ctx));
  if (op === 'or') return (cond.children || []).some((c) => evalCondition(c, ctx));
  if (op === 'not') return !evalCondition(cond.child, ctx);
  const v = getPath(ctx, cond.path);
  const t = cond.value;
  const sv = v == null ? '' : listText(v).toLowerCase();
  const st = t == null ? '' : String(t).toLowerCase();
  const items = Array.isArray(v) ? v.map((x) => String(x).toLowerCase()) : null;
  switch (op) {
    case 'eq': return sv === st;
    case 'neq': return sv !== st;
    case 'contains': return sv.includes(st);
    case 'startsWith': return sv.startsWith(st);
    case 'isEmpty': case 'empty': return sv === '';
    case 'isNotEmpty': case 'notEmpty': return sv !== '';
    case 'isTrue': return v === true || sv === 'true';
    case 'isFalse': return v === false || sv === 'false';
    case 'includes': return items ? items.includes(st) : sv.includes(st);
    case 'excludes': return items ? !items.includes(st) : !sv.includes(st);
    case 'gt': case 'lt': {
      const a = Number(v), c = Number(t);
      if (Number.isNaN(a) || Number.isNaN(c) || v === null || t === null || t === '') return op === 'gt' ? sv > st : sv < st;
      return op === 'gt' ? a > c : a < c;
    }
    case 'in': return ((t as unknown[]) || []).map((x) => String(x).toLowerCase()).includes(sv);
    case 'notIn': return !((t as unknown[]) || []).map((x) => String(x).toLowerCase()).includes(sv);
    default: return true;
  }
}

const VERBS: Record<string, string> = {
  eq: 'is', neq: 'is not', contains: 'contains', startsWith: 'starts with', isEmpty: 'is empty', empty: 'is empty',
  isNotEmpty: 'is not empty', notEmpty: 'is present', gt: 'is more than', lt: 'is less than', in: 'is one of',
  includes: 'includes', excludes: 'does not include', isTrue: 'is true', isFalse: 'is false',
};

export function describeCondition(cond?: Cond | null, label: (p: string) => string = (p) => p): string {
  if (!cond) return '';
  if (cond.op === 'and' || cond.op === 'or') return (cond.children || []).map((c) => describeCondition(c, label)).join(` ${cond.op} `);
  if (cond.op === 'not') return `not (${describeCondition(cond.child, label)})`;
  const val = Array.isArray(cond.value) ? cond.value.join(', ') : cond.value;
  return `${label(cond.path || '')} ${VERBS[cond.op] || cond.op}${val === undefined || val === null || val === '' ? '' : ` ${val}`}`;
}

/** §10.10 operators per field type, for the condition builder. */
export const OPERATORS: Record<string, [string, string][]> = {
  text: [['eq', 'is'], ['neq', 'is not'], ['contains', 'contains'], ['startsWith', 'starts with'], ['isEmpty', 'is empty'], ['isNotEmpty', 'is not empty']],
  enum: [['eq', 'is'], ['neq', 'is not'], ['isEmpty', 'is empty'], ['isNotEmpty', 'is not empty']],
  date: [['eq', 'is'], ['gt', 'is after'], ['lt', 'is before'], ['isEmpty', 'is empty']],
  number: [['eq', 'is'], ['neq', 'is not'], ['gt', 'is more than'], ['lt', 'is less than'], ['isEmpty', 'is empty']],
  boolean: [['isTrue', 'is true'], ['isFalse', 'is false']],
  multi: [['includes', 'includes'], ['excludes', 'does not include'], ['isEmpty', 'is empty']],
  image: [['isEmpty', 'is missing'], ['isNotEmpty', 'is present']],
};
export const operatorsFor = (type?: string) => OPERATORS[type === 'multiselect' ? 'multi' : type || 'text'] || OPERATORS.text;
export const operatorNeedsValue = (op: string) => !['isEmpty', 'isNotEmpty', 'empty', 'notEmpty', 'isTrue', 'isFalse'].includes(op);

/** Population bands: the thresholds are the message (§7.2). */
export function populationBand(pct?: number | null) {
  if (pct === undefined || pct === null) return { band: 'unknown', fg: '#666666', bg: 'transparent' };
  if (pct >= 90) return { band: 'ok', fg: '#666666', bg: 'transparent' };
  if (pct >= 50) return { band: 'warn', fg: '#96600A', bg: '#FDF4E3' };
  return { band: 'bad', fg: '#B3261E', bg: '#FDECEA' };
}

export function editDistance(a: string, b: string) {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/** `path | formatter` checked in words, with a did-you-mean (§10.9). */
export function checkExpression(expr: string, ctx: Ctx, known: string[]) {
  const src = String(expr || '').trim();
  if (!src) return { ok: false, empty: true, message: 'Type a field path, for example employee.fullName | upper', result: '' };
  const parts = src.split('|').map((x) => x.trim());
  const path = parts[0];
  if (!/^[A-Za-z_][\w.]*$/.test(path)) return { ok: false, message: `A field path can only contain letters, digits, underscores and dots. Got “${path}”.`, result: '' };
  if (!known.includes(path)) {
    let best: { d: number; path: string } | null = null;
    for (const k of known) {
      const d = editDistance(path.toLowerCase(), k.toLowerCase());
      if (!best || d < best.d) best = { d, path: k };
    }
    const hit = best && best.d <= Math.max(3, Math.round(path.length * 0.34));
    return { ok: false, message: `Unknown field: ${path}.${hit ? ` Did you mean ${best!.path}?` : ''}`, result: '', suggestion: hit ? best!.path : null };
  }
  for (const p of parts.slice(1)) {
    const m = /^(\w+)(?:\(([^)]*)\))?$/.exec(p);
    if (!m) return { ok: false, message: `Cannot read the formatter “${p}”. Write it as name or name(argument).`, result: '' };
    if (!FORMATTERS[m[1]]) {
      let bf: { d: number; k: string } | null = null;
      for (const k of Object.keys(FORMATTERS)) {
        const d = editDistance(m[1].toLowerCase(), k);
        if (!bf || d < bf.d) bf = { d, k };
      }
      return { ok: false, message: `Unknown formatter: ${m[1]}.${bf && bf.d <= 3 ? ` Did you mean ${FORMATTERS[bf.k].sig}?` : ` Available: ${Object.keys(FORMATTERS).join(', ')}.`}`, result: '' };
    }
    if (m[1] === 'truncate' && m[2] !== undefined && Number.isNaN(parseInt(m[2], 10))) return { ok: false, message: 'truncate needs a number, for example truncate(18).', result: '' };
  }
  return { ok: true, message: '', result: resolveValue({ kind: 'expression', expr: src }, ctx).text, empty: false };
}

// ============================================================ measurement

export interface Measurer { exact: boolean; measure(text: string, sizePt: number, letterSpacingPt: number | undefined, family: string | undefined, weight: number | undefined): number }

const NARROW = 'ijltfIr.,:;\'"|!()[]{} ';
const WIDE = 'mwMW@%';
function advance(ch: string) {
  if (ch >= 'ঀ' && ch <= '৿') return 0.58;
  if (NARROW.includes(ch)) return 0.3;
  if (WIDE.includes(ch)) return 0.86;
  if (ch >= 'A' && ch <= 'Z') return 0.63;
  if (ch >= '0' && ch <= '9') return 0.55;
  return 0.52;
}

/** The design's per-character model. Adequate for layout, not for print. */
export const approxMeasurer: Measurer = {
  exact: false,
  measure(text, sizePt, ls, _family, weight) {
    const bold = (weight || 400) >= 600 ? 1.035 : 1;
    let w = 0;
    for (const ch of text) w += advance(ch);
    return w * ptToMm(1) * bold * sizePt + ptToMm(ls || 0) * text.length;
  },
};

export function wrapLines(text: string, maxW: number, size: number, style: TextStyle, m: Measurer, maxLines?: number | null) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (!cur || m.measure(trial, size, style.letterSpacing, style.fontFamily, style.fontWeight) <= maxW) cur = trial;
    else { lines.push(cur); cur = w; }
    if (maxLines && lines.length >= maxLines) break;
  }
  if (cur && (!maxLines || lines.length < maxLines)) lines.push(cur);
  return lines;
}

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Reports the size actually used: "shrank from 11pt to 8.4pt" (§6.4). */
export function fitText(text: string, frame: Frame, style: TextStyle, overflow: Overflow | undefined, m: Measurer): Fit {
  let size = Number(style.fontSize || 10);
  const floor = Number(overflow?.minFontSize || size);
  const mode = overflow?.mode || 'overflow';
  const width = (t: string, s: number) => m.measure(t, s, style.letterSpacing, style.fontFamily, style.fontWeight);
  const lineH = (s: number) => ptToMm(s) * Number(style.lineHeight || 1.2);
  let lines = [text], shrunk = false, clipped = false;
  if (mode === 'wrap') {
    const maxLines = Number(overflow?.maxLines || 2);
    lines = wrapLines(text, frame.w, size, style, m, maxLines);
    while (lines.length * lineH(size) > frame.h && size > floor) {
      size = Math.max(floor, size - 0.2); shrunk = true;
      lines = wrapLines(text, frame.w, size, style, m, maxLines);
    }
    clipped = wrapLines(text, frame.w, size, style, m).length > maxLines || lines.length * lineH(size) > frame.h + 0.05;
  } else if (mode === 'shrink' || mode === 'condense') {
    while (width(text, size) > frame.w && size > floor) { size = Math.max(floor, r4(size - 0.2)); shrunk = true; }
    clipped = width(text, size) > frame.w + 0.01;
  } else if (mode === 'truncate') {
    const ell = overflow?.ellipsis || '…';
    let t = text, cut = false;
    while (t.length > 1 && width(t + ell, size) > frame.w) { t = t.slice(0, -1); cut = true; }
    lines = [cut ? t + ell : text];
  } else {
    clipped = width(text, size) > frame.w + 0.01;
  }
  return { lines, fontSize: Math.round(size * 100) / 100, shrunk, shrunkFrom: style.fontSize, clipped,
    widthMm: Math.round(Math.max(0, ...lines.map((x) => width(x, size))) * 1000) / 1000 };
}

// ============================================================ resolveSide

const frameOf = (el: El, offset = 0): Frame => ({ x: +el.frame.x || 0, y: (+el.frame.y || 0) + offset, w: +el.frame.w || 0, h: +el.frame.h || 0, rotation: +(el.frame.rotation || 0) });

/** One resolved tree for every renderer: thumbnail, canvas, preview (§16.3). */
export function resolveSide(side: Side, ctx: Ctx, m: Measurer = approxMeasurer): Resolved {
  const notes: Note[] = [];
  const walk = (elements: El[], flow: boolean): Node[] => {
    const out: Node[] = [];
    let offset = 0;
    for (const el of elements || []) {
      if (el.hidden) continue;
      const name = el.name || el.id;
      if (el.visibleWhen && !evalCondition(el.visibleWhen, ctx)) {
        notes.push({ elementId: el.id, name, kind: 'hidden-by-condition', detail: describeCondition(el.visibleWhen) });
        if (flow) offset -= frameOf(el).h + Number(el.flowGap || 0);
        continue;
      }
      const frame = frameOf(el, offset);
      const node: Node = { id: el.id, name, type: el.type, frame, opacity: el.opacity ?? 1, el };
      if (el.type === 'text') {
        const rv = resolveValue(el.content, ctx);
        if (rv.text === '' && el.emptyBehaviour === 'hide') {
          notes.push({ elementId: el.id, name, kind: 'hidden-empty', detail: 'Field is empty' });
          if (flow) offset -= frame.h + Number(el.flowGap || 0);
          continue;
        }
        const style = { ...(el.style || {}) };
        let text = rv.text !== '' ? rv.text : el.placeholder || '—';
        const tt = style.textTransform;
        text = tt === 'upper' ? text.toUpperCase() : tt === 'lower' ? text.toLowerCase() : tt === 'title' ? titleCase(text) : text;
        if (style.numerals === 'bengali') text = toBengaliNumerals(text);
        const fit = fitText(text, frame, style, el.overflow, m);
        Object.assign(node, { text, fit, style, usedFallback: rv.usedFallback || rv.missing,
          binding: el.content?.kind === 'binding' ? el.content.path : null,
          formatters: el.content?.kind === 'binding' ? el.content.formatters || [] : [] });
        if (fit.shrunk) notes.push({ elementId: el.id, name, kind: 'shrunk', detail: `Shrunk from ${fit.shrunkFrom}pt to ${fit.fontSize.toFixed(1)}pt to fit` });
        if (fit.clipped) notes.push({ elementId: el.id, name, kind: 'overflow', detail: 'Text does not fit its box' });
      } else if (el.type === 'photo') {
        const photo = getPath(ctx, el.path || 'employee.photo') as Node['photo'];
        node.photo = photo || null;
        node.binding = el.path || 'employee.photo';
        if (!photo) {
          if (el.fallback === 'hide') continue;
          node.fallbackKind = el.fallback || 'initials';
          node.initials = applyFormatter(getPath(ctx, 'employee.fullName') || '', { fn: 'initials' });
          notes.push({ elementId: el.id, name, kind: 'fallback', detail: `No photo — showing ${node.fallbackKind}` });
        } else if (photo.width) {
          node.dpi = effectiveDpi(photo.width, frame.w);
        }
      } else if (el.type === 'qr') {
        const payload = el.payload || { kind: 'url' };
        const card = (ctx.card || {}) as Record<string, string>;
        node.payload = payload.kind === 'signed' ? card.token || '' : payload.kind === 'url' ? card.verifyUrl || '' : resolveValue(payload.source, ctx).text;
        node.binding = 'card.verifyUrl';
      } else if (el.type === 'barcode') {
        node.value = resolveValue(el.value, ctx).text;
        node.binding = el.value?.kind === 'binding' ? el.value.path : null;
      } else if (el.type === 'image' || el.type === 'signature') {
        const s = el.source;
        node.src = s?.kind === 'binding' ? getPath(ctx, s.path) : s?.kind === 'asset' ? s.assetId : null;
        node.binding = s?.kind === 'binding' ? s.path : null;
        if (!node.src) { notes.push({ elementId: el.id, name, kind: 'hidden-empty', detail: 'No image' }); continue; }
      } else if (el.type === 'kvTable') {
        const rows: NonNullable<Node['rows']> = [];
        for (const r of el.rows || []) {
          if (r.visibleWhen && !evalCondition(r.visibleWhen, ctx)) continue;
          const label = resolveValue(r.label, ctx).text, value = resolveValue(r.value, ctx).text;
          if (el.collapseEmptyRows && value === '') continue;
          rows.push({ label, value, valueBinding: r.value?.kind === 'binding' ? r.value.path : null });
        }
        const ls = el.labelStyle || {}, vs = el.valueStyle || {};
        // Rows are laid out by the renderer, so the fit is computed here or the
        // overflow check has a hole and a clipped row ships silently (§7.1).
        const rowH = ptToMm(Math.max(Number(vs.fontSize || 7), Number(ls.fontSize || 6))) * Number(vs.lineHeight || 1.2);
        const need = rows.length * rowH + Math.max(0, rows.length - 1) * Number(el.rowGap || 0);
        Object.assign(node, { rows, kvNeededMm: Math.round(need * 1000) / 1000, kvOverflow: need > frame.h + 0.05, labelStyle: ls, valueStyle: vs });
        if (node.kvOverflow) notes.push({ elementId: el.id, name, kind: 'overflow', detail: `${rows.length} rows need ${need.toFixed(1)}mm but the box is ${frame.h.toFixed(1)}mm` });
      } else if (el.type === 'group') {
        node.children = walk(el.children || [], !!el.flow);
      }
      out.push(node);
    }
    return out;
  };
  return { nodes: walk(side.elements || [], false), notes, background: side.background || { type: 'solid', color: '#FFFFFF' } };
}

export function* walkNodes(nodes: Node[]): Generator<Node> {
  for (const n of nodes) {
    if (n.children?.length) yield* walkNodes(n.children);
    else yield n;
  }
}

/** Every path a side reads. */
export function bindingsOf(side: Side | null | undefined): Set<string> {
  const out = new Set<string>();
  const visit = (s?: Source | null) => {
    if (!s) return;
    if (s.kind === 'binding') out.add(s.path);
    else if (s.kind === 'expression') { const p = parseExpression(s.expr); if (p) out.add(p[0]); }
  };
  const walk = (els?: El[]) => {
    for (const el of els || []) {
      visit(el.content); visit(el.value);
      if (el.type === 'photo') out.add(el.path || 'employee.photo');
      if ((el.type === 'image' || el.type === 'signature') && el.source?.kind === 'binding') out.add(el.source.path);
      for (const r of el.rows || []) { visit(r.label); visit(r.value); if (r.visibleWhen?.path) out.add(r.visibleWhen.path); }
      if (el.visibleWhen?.path) out.add(el.visibleWhen.path);
      walk(el.children);
    }
  };
  walk(side?.elements);
  return out;
}

export const artboardOf = (t: { widthMm: number; heightMm: number; bleedMm: number; safeAreaMm: number; cornerRadiusMm: number }): Artboard =>
  ({ width: t.widthMm, height: t.heightMm, bleed: t.bleedMm, safe: t.safeAreaMm, radius: t.cornerRadiusMm });

// =============================================================== preflight

/** §7. Every finding names its measurement. */
export function preflightSide(kind: 'front' | 'back', side: Side, ab: Artboard, ctx: Ctx, m: Measurer, fieldStats?: Record<string, number> | null) {
  const findings: Finding[] = [];
  const res = resolveSide(side, ctx, m);
  const add = (severity: Finding['severity'], element: string, message: string, fix: string | null = null, elementId: string | null = null) =>
    findings.push({ severity, side: kind, element, elementId, message, fix });
  const bg = res.background;
  if (bg.type === 'image' && !bg.extendToBleed) add('error', 'Background', 'The background does not reach the bleed: trimming may leave a white edge.', 'extendToBleed');
  if (kind === 'back' && !(side.elements || []).length) add('warning', 'Back side', 'The back side has no content.');
  const [sl, st, sr, sb] = [ab.safe, ab.safe, ab.width - ab.safe, ab.height - ab.safe];
  for (const n of walkNodes(res.nodes)) {
    const f = n.frame, name = n.name, id = n.id;
    const bleedShape = n.type === 'shape' && (f.x <= 0 || f.y <= 0 || f.x + f.w >= ab.width || f.y + f.h >= ab.height);
    if (f.x + f.w < 0 || f.y + f.h < 0 || f.x > ab.width || f.y > ab.height) add('error', name, `‘${name}’ is off the card.`, 'move-on', id);
    else if (!bleedShape && (f.x < sl - 0.05 || f.y < st - 0.05 || f.x + f.w > sr + 0.05 || f.y + f.h > sb + 0.05)) {
      const out = Math.max(sl - f.x, st - f.y, f.x + f.w - sr, f.y + f.h - sb);
      add('warning', name, `‘${name}’ is ${out.toFixed(1)}mm outside the safe area and may be clipped.`, 'nudge-in', id);
    }
    if (n.type === 'photo' && n.dpi) {
      if (n.dpi < 150) add('error', name, `‘${name}’ is ${n.dpi} DPI at ${f.w.toFixed(1)}mm: too low to print.`, null, id);
      else if (n.dpi < 300) add('warning', name, `‘${name}’ is ${n.dpi} DPI at ${f.w.toFixed(1)}mm: print quality may be soft.`, null, id);
    }
    if (n.fit?.clipped) add('error', name, `‘${name}’ does not fit its box: ${n.fit.widthMm.toFixed(1)}mm of text in ${f.w.toFixed(1)}mm at ${n.fit.fontSize}pt.`, null, id);
    if (n.kvOverflow) add('error', name, `‘${name}’ needs ${n.kvNeededMm!.toFixed(1)}mm for its rows but the box is ${f.h.toFixed(1)}mm. The last row will be cut in half.`, 'grow-box', id);
    if (n.binding && fieldStats && n.binding in fieldStats && fieldStats[n.binding] < 50) add('warning', name, `Only ${fieldStats[n.binding]}% of employees have ‘${n.binding}’.`, null, id);
    if (n.type === 'text' && /[ঀ-৿]/.test(n.text || '') && !(n.style?.fontFamily || '').includes('Bengali'))
      add('warning', name, `‘${n.style?.fontFamily || 'This font'}’ has no Bangla glyphs: the text falls back to Noto Sans Bengali. Choose it so the layout is measured in it.`, 'font', id);
  }
  return { findings, resolved: res };
}

export const summarise = (findings: Finding[]): Report => ({
  findings, errors: findings.filter((f) => f.severity === 'error').length, warnings: findings.filter((f) => f.severity === 'warning').length,
});

// ================================================================ snapping

/** Kind wins first, then the smaller delta (§6.2). */
export const SNAP_RANK: Record<string, number> = { guide: 0, artboard: 1, safe: 2, element: 3, bleed: 4, grid: 5 };
export interface SnapTarget { pos: number; kind: string; sourceId?: string }
export interface SnapHit { rank: number; d: number; line: number; kind: string; sourceId?: string; delta: number }

export function snapTargets(elements: El[], ab: Artboard, exclude: string[], grid?: { step: number } | null, moving?: Frame) {
  const v: SnapTarget[] = [
    { pos: 0, kind: 'artboard' }, { pos: ab.width / 2, kind: 'artboard' }, { pos: ab.width, kind: 'artboard' },
    { pos: ab.safe, kind: 'safe' }, { pos: ab.width - ab.safe, kind: 'safe' }, { pos: -ab.bleed, kind: 'bleed' }, { pos: ab.width + ab.bleed, kind: 'bleed' },
  ];
  const h: SnapTarget[] = [
    { pos: 0, kind: 'artboard' }, { pos: ab.height / 2, kind: 'artboard' }, { pos: ab.height, kind: 'artboard' },
    { pos: ab.safe, kind: 'safe' }, { pos: ab.height - ab.safe, kind: 'safe' }, { pos: -ab.bleed, kind: 'bleed' }, { pos: ab.height + ab.bleed, kind: 'bleed' },
  ];
  for (const el of elements) {
    if (exclude.includes(el.id) || el.hidden) continue;
    const f = el.frame;
    v.push({ pos: f.x, kind: 'element', sourceId: el.id }, { pos: f.x + f.w / 2, kind: 'element', sourceId: el.id }, { pos: f.x + f.w, kind: 'element', sourceId: el.id });
    h.push({ pos: f.y, kind: 'element', sourceId: el.id }, { pos: f.y + f.h / 2, kind: 'element', sourceId: el.id }, { pos: f.y + f.h, kind: 'element', sourceId: el.id });
  }
  if (grid && moving) {
    v.push({ pos: Math.round(moving.x / grid.step) * grid.step, kind: 'grid' });
    h.push({ pos: Math.round(moving.y / grid.step) * grid.step, kind: 'grid' });
  }
  return { v, h };
}

/** `tolMm` comes from screen pixels, so snapping feels the same at every zoom. */
export function applySnap(frame: Frame, targets: { v: SnapTarget[]; h: SnapTarget[] }, tolMm: number, edges?: { v?: number[]; h?: number[] }) {
  const all = { v: [frame.x, frame.x + frame.w / 2, frame.x + frame.w], h: [frame.y, frame.y + frame.h / 2, frame.y + frame.h] };
  const best: { v: SnapHit | null; h: SnapHit | null } = { v: null, h: null };
  for (const axis of ['v', 'h'] as const) {
    let win: SnapHit | null = null;
    const use = edges?.[axis] ? all[axis].filter((_, i) => edges[axis]!.includes(i)) : all[axis];
    for (const e of use) for (const t of targets[axis]) {
      const d = Math.abs(e - t.pos);
      if (d > tolMm) continue;
      const rank = SNAP_RANK[t.kind] ?? 9;
      if (!win || rank < win.rank || (rank === win.rank && d < win.d)) win = { rank, d, line: t.pos, kind: t.kind, sourceId: t.sourceId, delta: t.pos - e };
    }
    best[axis] = win;
  }
  return { frame: { ...frame, x: frame.x + (best.v?.delta || 0), y: frame.y + (best.h?.delta || 0) }, guides: best };
}

/** A triple whose two gaps agree, reported only when the moving box is in it (§6.3). */
export function equalSpacing(moving: Frame, others: { id: string; frame: Frame }[], tolMm: number, axis: 'x' | 'y') {
  const lo = axis === 'x' ? 'x' : 'y', dim = axis === 'x' ? 'w' : 'h';
  const boxes = others.map((o) => ({ id: o.id, a: o.frame[lo], b: o.frame[lo] + o.frame[dim] }));
  boxes.push({ id: '__moving', a: moving[lo], b: moving[lo] + moving[dim] });
  boxes.sort((p, q) => p.a - q.a);
  const out: { axis: 'x' | 'y'; gap: number; spans: [number, number][] }[] = [];
  for (let i = 0; i + 2 < boxes.length; i++) {
    const g1 = boxes[i + 1].a - boxes[i].b, g2 = boxes[i + 2].a - boxes[i + 1].b;
    if (g1 > 0.2 && g2 > 0.2 && Math.abs(g1 - g2) <= tolMm && [boxes[i], boxes[i + 1], boxes[i + 2]].some((b) => b.id === '__moving'))
      out.push({ axis, gap: (g1 + g2) / 2, spans: [[boxes[i].b, boxes[i + 1].a], [boxes[i + 1].b, boxes[i + 2].a]] });
  }
  return out;
}

/** Index 0 is the bottom of the stack. */
export function reorder<T extends { id: string }>(elements: T[], id: string, op: 'front' | 'back' | 'forward' | 'backward') {
  const arr = elements.slice();
  const i = arr.findIndex((e) => e.id === id);
  if (i < 0) return arr;
  const [el] = arr.splice(i, 1);
  if (op === 'front') arr.push(el);
  else if (op === 'back') arr.unshift(el);
  else if (op === 'forward') arr.splice(Math.min(arr.length, i + 1), 0, el);
  else arr.splice(Math.max(0, i - 1), 0, el);
  return arr;
}

export const round2 = (x: number) => Math.round(x * 100) / 100;
