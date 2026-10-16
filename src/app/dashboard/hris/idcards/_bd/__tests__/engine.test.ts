import {
  type Artboard, type El, type Side, CSS_PX_PER_MM, applySnap, approxMeasurer, checkExpression, effectiveDpi, equalSpacing,
  evalCondition, fitText, mmToStage, preflightSide, ptToMm, pxAt, resolveSide, resolveValue, snapTargets, stageToMm, tickStepMm,
} from '../engine';
import { encode128 } from '../code128';

const AB: Artboard = { width: 85.6, height: 54, bleed: 2, safe: 3, radius: 3.18 };
const style = { fontFamily: 'IBM Plex Sans', fontSize: 8, lineHeight: 1.2 };
const text = (id: string, frame: El['frame'], content: El['content'], extra: Partial<El> = {}): El =>
  ({ id, name: id, type: 'text', frame, content, style, overflow: { mode: 'wrap' }, ...extra });
const side = (...elements: El[]): Side => ({ kind: 'front', background: { type: 'solid', color: '#fff' }, elements });
const ctx = (employee: Record<string, unknown> = {}) => ({ employee: { fullName: 'Md. Karim Uddin', ...employee }, company: {}, card: { verifyUrl: 'https://x/verify/abc', token: 'abc' }, custom: {} });

describe('golden vectors (backend spec §10.1, shared with the server)', () => {
  it('C1: CR80 at 300 dpi is 1011 × 638', () => {
    expect(Math.abs(pxAt(85.6, 300) - 1011)).toBeLessThanOrEqual(1);
    expect(Math.abs(pxAt(54, 300) - 638)).toBeLessThanOrEqual(1);
  });
  it('C2: 10pt is 3.528 mm', () => expect(ptToMm(10).toFixed(3)).toBe('3.528'));
  it('C3/C4: a 300 px photo is 305 dpi at 25 mm and 190 at 40 mm, half to even as on the server', () => {
    expect(effectiveDpi(300, 25)).toBe(305);
    expect(effectiveDpi(300, 40)).toBe(190);
    const photo = (w: number): El => ({ id: 'p', name: 'Photo', type: 'photo', frame: { x: 10, y: 5, w, h: w * 1.33 }, path: 'employee.photo' });
    const at = (w: number) => preflightSide('front', side(photo(w)), { ...AB, height: 80 }, ctx({ photo: { assetId: 'a', width: 300, height: 400 } }), approxMeasurer).findings.filter((f) => f.message.includes('DPI'));
    expect(at(25)).toEqual([]);
    expect(at(40).map((f) => f.severity)).toEqual(['warning']);
  });
  it('C5: an image background short of the bleed is an error', () => {
    const f = preflightSide('front', { ...side(), background: { type: 'image', assetId: 'x', extendToBleed: false } }, AB, ctx(), approxMeasurer).findings;
    expect(f.map((x) => x.severity)).toEqual(['error']);
  });
  it('C6: five rows in 14 mm name both measurements', () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({ label: { kind: 'literal' as const, value: `R${i}` }, value: { kind: 'literal' as const, value: 'v' } }));
    const kv: El = { id: 'kv', name: 'Details', type: 'kvTable', frame: { x: 5, y: 5, w: 40, h: 14 }, rows, labelStyle: { fontSize: 8 }, valueStyle: { fontSize: 9 }, rowGap: 1 };
    const f = preflightSide('front', side(kv), AB, ctx(), approxMeasurer).findings.find((x) => x.element === 'Details')!;
    expect(f.severity).toBe('error');
    expect(f.message).toMatch(/needs \d+\.\dmm .* box is 14\.0mm/);
  });
  it('C7: 1.4 mm outside the safe area says 1.4mm', () => {
    const f = preflightSide('front', side(text('Code', { x: 1.6, y: 10, w: 20, h: 4 }, { kind: 'literal', value: 'EMP' })), AB, ctx(), approxMeasurer).findings;
    expect(f).toHaveLength(1);
    expect(f[0].message).toContain('1.4mm outside the safe area');
  });
  it('C8: a binding on 40% of the roster is sparse', () => {
    const f = preflightSide('front', side(text('Blood', { x: 5, y: 5, w: 20, h: 4 }, { kind: 'binding', path: 'employee.bloodGroup' })), AB, ctx({ bloodGroup: 'B+' }), approxMeasurer, { 'employee.bloodGroup': 40 }).findings;
    expect(f[0].message).toContain('Only 40% of employees');
  });
});

describe('units', () => {
  it('stage and mm round-trip at every zoom', () => {
    for (const z of [0.25, 0.5, 1, 1.37, 2, 4, 8]) for (const x of [0, 0.1, 3.18, 85.6]) expect(stageToMm(mmToStage(x, z), z)).toBeCloseTo(x, 10);
  });
  it('ticks adapt to zoom (§6.1): 20 mm at 100%, 10 mm at 200%', () => {
    expect(10 * CSS_PX_PER_MM).toBeLessThan(44);
    expect(tickStepMm(1)).toBe(20);
    expect(tickStepMm(2)).toBe(10);
    expect(tickStepMm(8)).toBe(2);
  });
});

describe('bindings', () => {
  it('formats through the pipeline and reports fallbacks', () => {
    expect(resolveValue({ kind: 'binding', path: 'employee.fullName', formatters: [{ fn: 'upper' }] }, ctx()).text).toBe('MD. KARIM UDDIN');
    expect(resolveValue({ kind: 'expression', expr: "card.issueDate | date('dd MMM yyyy')" }, { card: { issueDate: '2026-10-15' } }).text).toBe('15 Oct 2026');
    const fb = resolveValue({ kind: 'binding', path: 'employee.bloodGroup', formatters: [{ fn: 'default', arg: 'N/A' }] }, ctx());
    expect([fb.text, fb.usedFallback]).toEqual(['N/A', true]);
    expect(resolveValue({ kind: 'binding', path: 'employee.fullName', formatters: [{ fn: 'numerals', arg: 'bengali' }] }, ctx({ fullName: '2026' })).text).toBe('২০২৬');
  });
  it('explains a typo with a did-you-mean', () => {
    const r = checkExpression('employee.fulName | upper', ctx(), ['employee.fullName', 'employee.employeeCode']);
    expect(r.ok).toBe(false);
    expect(r.message).toContain('Did you mean employee.fullName?');
    expect(checkExpression('employee.fullName | uper', ctx(), ['employee.fullName']).message).toContain('Did you mean upper?');
  });
  it('conditions read lists and cases', () => {
    const c = { employee: { type: 'WORKER' }, custom: { zones: ['Plant floor'] } };
    expect(evalCondition({ op: 'eq', path: 'employee.type', value: 'worker' }, c)).toBe(true);
    expect(evalCondition({ op: 'includes', path: 'custom.zones', value: 'plant floor' }, c)).toBe(true);
    expect(evalCondition({ op: 'and', children: [{ op: 'isEmpty', path: 'employee.none' }, { op: 'neq', path: 'employee.type', value: 'staff' }] }, c)).toBe(true);
  });
});

describe('fitting', () => {
  it('shrinks to fit and says from what', () => {
    const fit = fitText('Mohammad Ashraful Alam Siddiqui', { x: 0, y: 0, w: 30, h: 5 }, { ...style, fontSize: 11 }, { mode: 'shrink', minFontSize: 6 }, approxMeasurer);
    expect(fit.shrunk).toBe(true);
    expect(fit.shrunkFrom).toBe(11);
    expect(fit.fontSize).toBeLessThan(11);
  });
  it('a hidden empty field leaves a note, not a box', () => {
    const r = resolveSide(side(text('BN', { x: 5, y: 5, w: 20, h: 4 }, { kind: 'binding', path: 'employee.fullNameBn' }, { emptyBehaviour: 'hide' })), ctx());
    expect(r.nodes).toHaveLength(0);
    expect(r.notes[0].kind).toBe('hidden-empty');
  });
  it('the QR encodes the verification link, never the employee code', () => {
    const qr: El = { id: 'q', name: 'QR', type: 'qr', frame: { x: 5, y: 5, w: 12, h: 12 }, payload: { kind: 'url' } };
    expect(resolveSide(side(qr), ctx({ employeeCode: 'EMP-0001' })).nodes[0].payload).toBe('https://x/verify/abc');
  });
});

describe('snapping (§6.2)', () => {
  const els: El[] = [text('a', { x: 10, y: 10, w: 20, h: 5 }, { kind: 'literal', value: 'a' })];
  it('kind wins before distance: the card centre beats a nearer element edge', () => {
    const targets = snapTargets([text('b', { x: 33.2, y: 30, w: 5, h: 5 }, { kind: 'literal', value: 'b' })], AB, []);
    // Frame centre at 41.6 is 1.2 mm from the card centre (42.8); its left edge 31.6 is 1.6 from b's left (33.2)...
    const out = applySnap({ x: 31.6, y: 40, w: 20, h: 4 }, targets, 2);
    expect(out.guides.v?.kind).toBe('artboard');
    expect(out.frame.x + out.frame.w / 2).toBeCloseTo(42.8, 6);
  });
  it('equal spacing is reported only with the moving box in the triple', () => {
    const others = [{ id: 'a', frame: { x: 0, y: 0, w: 10, h: 5 } }, { id: 'c', frame: { x: 40, y: 0, w: 10, h: 5 } }];
    expect(equalSpacing({ x: 20, y: 0, w: 10, h: 5 }, others, 0.5, 'x')).toHaveLength(1);
    expect(equalSpacing({ x: 22, y: 0, w: 10, h: 5 }, others, 0.5, 'x')).toHaveLength(0);
    expect(els).toHaveLength(1);
  });
});

describe('Code 128', () => {
  it('matches the server: start B, data, checksum, stop', () => {
    const bars = encode128('EMP-0001')!;
    const modules = bars.reduce((s, [, m]) => s + m, 0);
    expect(modules).toBe(11 * (1 + 8 + 1) + 13);
    expect(encode128('বাংলা')).toBeNull();
  });
});
