'use client';

/**
 * The designer (§6). Millimetres are the unit of record: every position,
 * size and nudge is in mm, zoom only multiplies at draw time, so a template
 * designed at 50% and at 200% is the same template. Snapping tolerance is
 * set in screen pixels and converted to mm, so it feels the same at every
 * zoom; a tie breaks by kind before distance (§6.2).
 *
 * Saving a draft edits it in place. Saving a published or printed version
 * makes the next draft -- the server answers with it -- and the version
 * that printed stays exactly as it printed.
 */

import * as React from 'react';
import { CardSide } from './CardSide';
import {
  type Artboard, type Cond, type Ctx, type El, type Finding, type Formatter, type Frame, type Side, type Source, type TextStyle,
  CSS_PX_PER_MM, FORMATTERS, PRESETS, applySnap, artboardOf, checkExpression, effectiveDpi, equalSpacing, getPath,
  populationBand, preflightSide, reorder, resolveSide, round2, snapTargets, summarise, tickStepMm,
} from './engine';
import { FAMILIES, canvasMeasurer } from './fonts';
import { useContexts, useTemplate } from './hooks';
import { useShared } from './IdCards';
import { Dim, Empty, Field, Findings, Loading, Modal, plural, useWrite } from './parts';
import { ConditionEditor, sampleContext } from './Templates';
import * as api from './api';
import type { Template, TemplatePreflight } from './types';

interface Doc {
  name: string; preset: string; widthMm: number; heightMm: number; bleedMm: number; safeAreaMm: number; cornerRadiusMm: number;
  front: Side; back: Side | null;
}
type Face = 'front' | 'back';
type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const PAD = 56; // px around the bleed, so handles at the edge stay reachable
const RULER = 20;
const SNAP_PX = 6;
const GUIDE_COLOUR: Record<string, string> = { artboard: '#0E6C93', safe: '#2E7D32', bleed: '#C62828', element: '#D81B60', guide: '#6A1B9A', grid: '#9E9E9E' };
const TYPE_MARK: Record<string, string> = { text: 'T', photo: '◫', qr: '▦', barcode: '║', shape: '■', image: '▣', kvTable: '≡', group: '⧉', signature: '✎' };

const uid = () => `el-${Math.random().toString(36).slice(2, 8)}`;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const docOf = (t: Template): Doc => ({
  name: t.name, preset: t.preset, widthMm: t.widthMm, heightMm: t.heightMm, bleedMm: t.bleedMm, safeAreaMm: t.safeAreaMm,
  cornerRadiusMm: t.cornerRadiusMm, front: clone(t.front!), back: t.back ? clone(t.back) : null,
});
const baseStyle = (o: Partial<TextStyle> = {}): TextStyle => ({
  fontFamily: 'IBM Plex Sans', fontSize: 8, fontWeight: 400, italic: false, color: '#141414', letterSpacing: 0, lineHeight: 1.2,
  align: 'left', verticalAlign: 'top', textTransform: 'none', underline: false, numerals: 'latin', ...o,
});

function newElement(kind: string, ab: Artboard): El {
  const at = (w: number, h: number): Frame => ({ x: round2((ab.width - w) / 2), y: round2((ab.height - h) / 2), w, h, rotation: 0 });
  const base = { id: uid(), opacity: 1, hidden: false, locked: false };
  switch (kind) {
    case 'field': return { ...base, name: 'Employee name', type: 'text', frame: at(40, 5), content: { kind: 'binding', path: 'employee.fullName', formatters: [] }, style: baseStyle({ fontSize: 10, fontWeight: 600 }), overflow: { mode: 'shrink', minFontSize: 6 }, emptyBehaviour: 'placeholder', placeholder: '—' };
    case 'text': return { ...base, name: 'Text', type: 'text', frame: at(30, 4), content: { kind: 'literal', value: 'Text' }, style: baseStyle(), overflow: { mode: 'wrap', maxLines: 2, minFontSize: 6 }, emptyBehaviour: 'hide' };
    case 'photo': return { ...base, name: 'Photo', type: 'photo', frame: at(20, 25), path: 'employee.photo', fit: 'cover', fallback: 'initials', minDpi: 300, shape: { kind: 'rect', radius: 1 }, border: { width: 0.3, color: '#DCDCDC' } };
    case 'qr': return { ...base, name: 'Verification QR', type: 'qr', frame: at(14, 14), payload: { kind: 'url' }, errorCorrection: 'M', quietZoneModules: 1, moduleColor: '#141414', backgroundColor: '#FFFFFF' };
    case 'barcode': return { ...base, name: 'Barcode', type: 'barcode', frame: at(40, 9), value: { kind: 'binding', path: 'employee.employeeCode', formatters: [] }, symbology: 'code128', showHumanReadable: true, quietZone: 2, barColor: '#141414' };
    case 'kv': return { ...base, name: 'Details', type: 'kvTable', frame: at(34, 11), rows: [{ label: { kind: 'literal', value: 'ID' }, value: { kind: 'binding', path: 'employee.employeeCode' } }, { label: { kind: 'literal', value: 'Dept' }, value: { kind: 'binding', path: 'employee.department.name' } }], labelStyle: baseStyle({ fontSize: 5.8, color: '#8F8F8F', textTransform: 'upper' }), valueStyle: baseStyle({ fontSize: 6.6, fontWeight: 500 }), labelWidth: 9, rowGap: 0.7, collapseEmptyRows: true };
    default: return { ...base, name: 'Shape', type: 'shape', frame: at(20, 10), shape: 'rect', fill: { kind: 'solid', color: '#DCDCDC' }, cornerRadius: 0 };
  }
}

export function Designer() {
  const { nav } = useShared();
  if (!nav.template) {
    return (
      <div className="idc-scroll">
        <Empty title="Choose a template to design">Open one from the template list, or create a new one there.</Empty>
        <div style={{ textAlign: 'center' }}><button type="button" className="idc-btn" onClick={() => nav.go('templates')}>Go to the template list</button></div>
      </div>
    );
  }
  return <DesignerFor uid={nav.template} />;
}

function DesignerFor({ uid: templateUid }: { uid: string }) {
  const q = useTemplate(templateUid);
  if (q.isLoading) return <Loading what="Loading the template" />;
  if (q.error || !q.data) return <div className="idc-scroll"><div className="idc-banner err">{(q.error as Error)?.message || 'Not found.'}</div></div>;
  return <Editor key={q.data.uid} template={q.data} />;
}

function Editor({ template }: { template: Template & { liveCards?: number } }) {
  const { nav, setup, fontsTick } = useShared();
  const ro = !setup.can.edit;
  const [doc, setDoc] = React.useState<Doc>(() => docOf(template));
  const [dirty, setDirty] = React.useState(false);
  const hist = React.useRef<{ past: Doc[]; future: Doc[] }>({ past: [], future: [] });
  const [face, setFace] = React.useState<Face>('front');
  const [sel, setSel] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(2);
  const [snap, setSnap] = React.useState(true);
  const [show, setShow] = React.useState({ trim: true, safe: true, bleed: true });
  const [previewCode, setPreviewCode] = React.useState<string>('');
  const [worst, setWorst] = React.useState(false);
  const [panel, setPanel] = React.useState<'none' | 'findings'>('none');
  const [flash, setFlash] = React.useState<string | null>(null);
  const [roster, setRoster] = React.useState<TemplatePreflight | null>(null);
  const [publishAsk, setPublishAsk] = React.useState<TemplatePreflight | null>(null);
  const contexts = useContexts(template.uid);
  const write = useWrite();

  const { widthMm, heightMm, bleedMm, safeAreaMm, cornerRadiusMm } = doc;
  const ab: Artboard = React.useMemo(() => artboardOf({ widthMm, heightMm, bleedMm, safeAreaMm, cornerRadiusMm }), [widthMm, heightMm, bleedMm, safeAreaMm, cornerRadiusMm]);
  const side: Side | null = face === 'front' ? doc.front : doc.back;
  const elements = side?.elements || [];
  const selected = elements.find((e) => e.id === sel) || null;

  // ------------------------------------------------------------- history
  const [histN, setHistN] = React.useState({ past: 0, future: 0 });
  const syncHist = () => setHistN({ past: hist.current.past.length, future: hist.current.future.length });
  const commit = (next: Doc, before?: Doc) => {
    hist.current.past.push(before || doc);
    if (hist.current.past.length > 80) hist.current.past.shift();
    hist.current.future = [];
    syncHist();
    setDoc(next);
    setDirty(true);
  };
  const undo = () => { const p = hist.current.past.pop(); if (p) { hist.current.future.push(doc); setDoc(p); setDirty(true); syncHist(); } };
  const redo = () => { const f = hist.current.future.pop(); if (f) { hist.current.past.push(doc); setDoc(f); setDirty(true); syncHist(); } };
  const setSideEls = (els: El[], before?: Doc) => {
    const next = { ...doc, [face]: { ...(side || { kind: face, elements: [] }), elements: els } } as Doc;
    commit(next, before);
  };
  const updateEl = (id: string, patch: Partial<El>) => setSideEls(elements.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // ----------------------------------------------------------- preview
  const emps = React.useMemo(() => contexts.data?.employees || [], [contexts.data]);
  const fieldStats = contexts.data?.fieldStats;
  const sample = React.useMemo(() => sampleContext(setup.company), [setup.company]);
  // The scans below run on a deferred copy: dragging stays smooth.
  const lagged = React.useDeferredValue(doc);
  const worstCode = React.useMemo(() => {
    if (!worst || !emps.length) return '';
    let best = { code: emps[0].code, score: -1 };
    for (const e of emps) {
      const r = summarise([...preflightSide('front', lagged.front, ab, e.context, canvasMeasurer).findings,
        ...(lagged.back ? preflightSide('back', lagged.back, ab, e.context, canvasMeasurer).findings : [])]);
      const score = r.errors * 1000 + r.warnings * 10 + String(getPath(e.context, 'employee.fullName') || '').length / 100;
      if (score > best.score) best = { code: e.code, score };
    }
    return best.code;
  }, [worst, emps, lagged, ab]);  
  const shownCode = worst ? worstCode : previewCode || emps[0]?.code || '';
  const ctx: Ctx = emps.find((e) => e.code === shownCode)?.context || sample;

  const live = React.useMemo(() => summarise([
    ...preflightSide('front', lagged.front, ab, ctx, canvasMeasurer, fieldStats).findings,
    ...(lagged.back ? preflightSide('back', lagged.back, ab, ctx, canvasMeasurer, fieldStats).findings : []),
  ]), [lagged, ab, ctx, fieldStats, fontsTick]);  

  const population = React.useMemo(() => {
    const out: Record<string, number> = {};
    if (!emps.length) return out;
    for (const g of setup.catalogue) for (const f of g.fields) {
      if (f.path.startsWith('card.')) { out[f.path] = 100; continue; }
      const n = emps.filter((e) => { const v = getPath(e.context, f.path); return v !== null && v !== '' && !(Array.isArray(v) && !v.length); }).length;
      out[f.path] = Math.round((100 * n) / emps.length);
    }
    return out;
  }, [emps, setup.catalogue]);

  // -------------------------------------------------------------- stage
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = React.useState({ x: 0, y: 0, w: 800, h: 600 });
  const s = CSS_PX_PER_MM * zoom; // px per mm on screen
  const b = ab.bleed;
  const origin = { x: PAD + RULER + b * s, y: PAD + RULER + b * s }; // trim's top-left in stage content px
  const contentW = (ab.width + 2 * b) * s + 2 * PAD + RULER;
  const contentH = (ab.height + 2 * b) * s + 2 * PAD + RULER;

  const fit = React.useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const z = Math.min((el.clientWidth - 2 * PAD - RULER) / ((ab.width + 2 * b) * CSS_PX_PER_MM), (el.clientHeight - 2 * PAD - RULER) / ((ab.height + 2 * b) * CSS_PX_PER_MM));
    setZoom(Math.max(0.25, Math.min(8, Math.floor(z * 20) / 20)));
  }, [ab.width, ab.height, b]);
  React.useLayoutEffect(() => { fit(); }, []);  
  const onScroll = () => { const el = stageRef.current; if (el) setScroll({ x: el.scrollLeft, y: el.scrollTop, w: el.clientWidth, h: el.clientHeight }); };
  React.useEffect(() => { onScroll(); }, [zoom]);
  const zoomBy = (f: number) => setZoom((z) => Math.max(0.25, Math.min(8, Math.round(z * f * 20) / 20)));

  // --------------------------------------------------------------- drag
  const [drag, setDrag] = React.useState<null | { guides: ReturnType<typeof applySnap>['guides']; spacing: ReturnType<typeof equalSpacing>; frame: Frame }>(null);
  const [cursor, setCursor] = React.useState<{ x: number; y: number } | null>(null);

  const startDrag = (e: React.PointerEvent, el: El, handle: Handle | null) => {
    if (ro || el.locked || e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setSel(el.id);
    const before = doc;
    const start = { ...el.frame };
    const sx = e.clientX, sy = e.clientY;
    const others = elements.filter((o) => o.id !== el.id && !o.hidden);
    const targets = snapTargets(elements, ab, [el.id]);
    let moved = false;
    let latest = before;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / s, dy = (ev.clientY - sy) / s;
      if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 2) return;
      moved = true;
      let f: Frame = { ...start };
      if (!handle) { f.x = start.x + dx; f.y = start.y + dy; } else {
        if (handle.includes('w')) { f.x = Math.min(start.x + dx, start.x + start.w - 0.5); f.w = start.w - (f.x - start.x); }
        if (handle.includes('e')) f.w = Math.max(0.5, start.w + dx);
        if (handle.includes('n')) { f.y = Math.min(start.y + dy, start.y + start.h - 0.5); f.h = start.h - (f.y - start.y); }
        if (handle.includes('s')) f.h = Math.max(0.5, start.h + dy);
      }
      let guides: ReturnType<typeof applySnap>['guides'] = { v: null, h: null };
      let spacing: ReturnType<typeof equalSpacing> = [];
      if (snap && !ev.altKey) {
        const tol = SNAP_PX / s;
        if (!handle) {
          const out = applySnap(f, targets, tol);
          f = out.frame; guides = out.guides;
          spacing = [...equalSpacing(f, others, tol, 'x'), ...equalSpacing(f, others, tol, 'y')];
        } else {
          const edges = { v: handle.includes('w') ? [0] : handle.includes('e') ? [2] : [], h: handle.includes('n') ? [0] : handle.includes('s') ? [2] : [] };
          const out = applySnap(f, targets, tol, edges);
          if (out.guides.v) { if (handle.includes('w')) { f.w -= out.guides.v.delta; f.x += out.guides.v.delta; } else f.w += out.guides.v.delta; }
          if (out.guides.h) { if (handle.includes('n')) { f.h -= out.guides.h.delta; f.y += out.guides.h.delta; } else f.h += out.guides.h.delta; }
          guides = out.guides;
        }
      }
      f = { ...f, x: round2(f.x), y: round2(f.y), w: round2(f.w), h: round2(f.h) };
      latest = { ...before, [face]: { ...before[face]!, elements: before[face]!.elements.map((x) => (x.id === el.id ? { ...x, frame: f } : x)) } } as Doc;
      setDoc(latest);
      setDrag({ guides, spacing, frame: f });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDrag(null);
      if (moved) commit(latest, before);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onStageMove = (e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCursor({ x: (e.clientX - r.left + el.scrollLeft - origin.x) / s, y: (e.clientY - r.top + el.scrollTop - origin.y) / s });
  };

  // ----------------------------------------------------------- keyboard
  const duplicate = () => {
    if (!selected || ro) return;
    const copy = { ...clone(selected), id: uid(), name: `${selected.name} copy`, frame: { ...selected.frame, x: round2(selected.frame.x + 2), y: round2(selected.frame.y + 2) } };
    setSideEls([...elements, copy]);
    setSel(copy.id);
  };
  const remove = () => { if (selected && !ro && !selected.locked) { setSideEls(elements.filter((e) => e.id !== selected.id)); setSel(null); } };
  const onKey = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomBy(1.25); return; }
    if (mod && e.key === '-') { e.preventDefault(); zoomBy(0.8); return; }
    if (mod && e.key === '0') { e.preventDefault(); fit(); return; }
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(); return; }
    if (e.key === 'Escape') { setSel(null); return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); remove(); return; }
    if (selected && !ro && !selected.locked && e.key.startsWith('Arrow')) {
      e.preventDefault();
      // §14: nudges are millimetres, never pixels.
      const d = e.shiftKey ? 0.1 : e.altKey ? 5 : 0.5;
      const f = { ...selected.frame };
      if (e.key === 'ArrowLeft') f.x = round2(f.x - d);
      if (e.key === 'ArrowRight') f.x = round2(f.x + d);
      if (e.key === 'ArrowUp') f.y = round2(f.y - d);
      if (e.key === 'ArrowDown') f.y = round2(f.y + d);
      updateEl(selected.id, { frame: f });
    }
  };

  // --------------------------------------------------------------- save
  const sides = () => ({ front: doc.front, back: doc.back });
  const save = async (navigate = true): Promise<string | null> => {
    const out = await write.run(() => api.saveTemplate(template.uid, {
      name: doc.name, preset: doc.preset, widthMm: doc.widthMm, heightMm: doc.heightMm, bleedMm: doc.bleedMm,
      safeAreaMm: doc.safeAreaMm, cornerRadiusMm: doc.cornerRadiusMm, ...sides(),
    }), (o) => (o.versioned ? `Saved as v${o.version} draft — v${template.version} is unchanged` : 'Draft saved'));
    if (!out) return null;
    setDirty(false);
    if (navigate && out.uid !== template.uid) nav.go('designer', { t: out.uid });
    return out.uid;
  };
  const checkRoster = async () => {
    const r = await write.run(() => api.preflightTemplate(template.uid, sides()));
    if (r) setRoster(r);
  };
  // Saving first may make a new draft; the version published is that one,
  // and the editor moves to it only once the publish is through.
  const [publishTarget, setPublishTarget] = React.useState<string | null>(null);
  const publish = async (ack = false) => {
    let target = publishTarget || template.uid;
    if (!publishTarget && (dirty || template.status !== 'DRAFT')) { const saved = await save(false); if (!saved) return; target = saved; }
    setPublishTarget(target);
    const out = await write.run(() => api.publishTemplate(target, ack), (o) => `v${o.version} published`);
    if (out) { setPublishAsk(null); setPublishTarget(null); nav.go('designer', { t: out.uid }); }
  };
  const canPublish = setup.can.publish && (template.status === 'DRAFT' || dirty);
  React.useEffect(() => {
    if (write.consequence && (write.consequence as unknown as TemplatePreflight).findings) setPublishAsk(write.consequence as unknown as TemplatePreflight);
  }, [write.consequence]);

  const jump = (f: Finding) => {
    setFace(f.side === 'back' ? 'back' : 'front');
    if (f.elementId) { setSel(f.elementId); setFlash(f.elementId); setTimeout(() => setFlash(null), 1000); }
  };

  // ------------------------------------------------------------- render
  const resolved = React.useMemo(() => (side ? resolveSide(side, ctx, canvasMeasurer) : null), [side, ctx, fontsTick]);  
  const step = tickStepMm(zoom);
  const n = live.errors + live.warnings;
  const versionNote = template.status === 'PUBLISHED'
    ? `v${template.version} is published${template.locked ? ' and locked by a print' : ''}. Saving makes the next version a draft; v${template.version} stays as it is.`
    : template.status === 'ARCHIVED' ? `v${template.version} is archived. Saving makes a new draft from it.` : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} onKeyDown={onKey}>
      <div className="idc-destool" role="toolbar" aria-label="Designer">
        <AddMenu disabled={ro || !side} onAdd={(k) => { const el = newElement(k, ab); setSideEls([...elements, el]); setSel(el.id); }} />
        <span className="sep" />
        <button type="button" className={`idc-btn sm${snap ? ' on' : ''}`} aria-pressed={snap} onClick={() => setSnap(!snap)} title="Snap to edges, centres and elements (hold Alt to skip)">Snap</button>
        <button type="button" className="idc-btn sm" disabled={!selected || ro} onClick={duplicate} title="Duplicate (⌘D)">Duplicate</button>
        <button type="button" className="idc-btn sm" disabled={!selected || ro || selected.locked} onClick={remove} title="Delete">Delete</button>
        <button type="button" className="idc-btn sm ghost" disabled={!histN.past} onClick={undo} title="Undo (⌘Z)" aria-label="Undo">↶</button>
        <button type="button" className="idc-btn sm ghost" disabled={!histN.future} onClick={redo} title="Redo (⇧⌘Z)" aria-label="Redo">↷</button>
        <span className="sep" />
        {(['trim', 'safe', 'bleed'] as const).map((k) => (
          <button key={k} type="button" className={`idc-btn sm${show[k] ? ' on' : ''}`} aria-pressed={show[k]} onClick={() => setShow({ ...show, [k]: !show[k] })}>{k[0].toUpperCase() + k.slice(1)}</button>
        ))}
        <span className="sep" />
        <button type="button" className="idc-btn sm icon" aria-label="Zoom out" onClick={() => zoomBy(0.8)}>−</button>
        <span className="idc-mono idc-small" style={{ width: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button type="button" className="idc-btn sm icon" aria-label="Zoom in" onClick={() => zoomBy(1.25)}>+</button>
        <button type="button" className="idc-btn sm" onClick={fit} title="Fit (⌘0)">Fit</button>
        <span className="sep" />
        <label className="idc-small idc-muted" htmlFor="idc-preview">Preview</label>
        <select id="idc-preview" className="idc-select" style={{ width: 170, height: 24, fontSize: 12 }} value={shownCode} disabled={worst || !emps.length}
          onChange={(e) => setPreviewCode(e.target.value)}>
          {!emps.length && <option value="">Sample data</option>}
          {emps.map((e) => <option key={e.code} value={e.code}>{e.nameEn} · {e.code}</option>)}
        </select>
        <button type="button" className={`idc-btn sm${worst ? ' on' : ''}`} aria-pressed={worst} disabled={!emps.length} onClick={() => setWorst(!worst)}
          title="Show the employee whose card comes out worst: most findings, longest name">Worst case</button>
        <span className="sep" />
        <div className="idc-seg" role="group" aria-label="Side">
          <button type="button" className={face === 'front' ? 'on' : ''} onClick={() => { setFace('front'); setSel(null); }}>Front</button>
          <button type="button" className={face === 'back' ? 'on' : ''} onClick={() => { setFace('back'); setSel(null); }}>Back</button>
        </div>
        <span className="idc-spacer" />
        <button type="button" className={`idc-btn sm${panel === 'findings' ? ' on' : ''}`} onClick={() => setPanel(panel === 'findings' ? 'none' : 'findings')}>
          {n ? plural(n, live.errors ? 'finding' : 'warning') : 'No findings'}
          {live.errors > 0 && <span className="idc-badge err">{live.errors}</span>}
          {live.warnings > 0 && <span className="idc-badge warn">{live.warnings}</span>}
        </button>
        <button type="button" className="idc-btn sm" disabled={write.busy} onClick={checkRoster} title="Run the server's measured preflight against everyone on the roster">Check roster</button>
        <button type="button" className="idc-btn sm" disabled={ro || write.busy || !dirty} onClick={() => save()}>{dirty ? 'Save draft' : 'Saved'}</button>
        <button type="button" className="idc-btn sm primary" disabled={!canPublish || write.busy} onClick={() => publish(false)}
          title={!setup.can.publish ? 'Publishing needs the publish card templates permission' : !canPublish ? `v${template.version} is already published: change something first` : undefined}>Publish</button>
      </div>
      {(versionNote || write.error) && (
        <div style={{ padding: '6px 10px', background: 'var(--idc-surface)', borderBottom: '1px solid var(--idc-bd-light)', display: 'flex', gap: 8 }}>
          {versionNote && <span className="idc-small idc-muted">{versionNote}</span>}
          {write.error && !publishAsk && <span className="idc-error-text">{write.error}</span>}
        </div>
      )}
      <div className="idc-des">
        <Layers elements={elements} sel={sel} setSel={setSel} ro={ro}
          onToggle={(id, k) => { const el = elements.find((e) => e.id === id)!; updateEl(id, { [k]: !el[k] }); }}
          onReorder={(id, op) => setSideEls(reorder(elements, id, op))} face={face} hasBack={!!doc.back}
          onAddBack={() => commit({ ...doc, back: { kind: 'back', background: { type: 'solid', color: '#FFFFFF' }, elements: [] } })}
          onRemoveBack={() => { commit({ ...doc, back: null }); setFace('front'); }} />
        <div className="idc-stage-wrap">
          <div ref={stageRef} className="idc-stage" tabIndex={0} onScroll={onScroll} onPointerMove={onStageMove} onPointerLeave={() => setCursor(null)}
            onPointerDown={() => setSel(null)} aria-label="Card canvas. Arrow keys nudge the selected element by half a millimetre.">
            <div style={{ position: 'relative', width: Math.max(contentW, scroll.w), height: Math.max(contentH, scroll.h) }}>
              {side && resolved ? (
                <div style={{ position: 'absolute', left: origin.x - b * s, top: origin.y - b * s }} className="idc-artboard-shadow">
                  <CardSide side={side} ab={ab} ctx={ctx} ppmm={s} bleed resolved={resolved} />
                </div>
              ) : (
                <div style={{ position: 'absolute', left: origin.x, top: origin.y, width: ab.width * s, height: ab.height * s, border: '1px dashed #A3A3A3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                  <button type="button" className="idc-btn" disabled={ro} onClick={() => commit({ ...doc, back: { kind: 'back', background: { type: 'solid', color: '#FFFFFF' }, elements: [] } })}>Add a back side</button>
                </div>
              )}
              <Guides ab={ab} s={s} origin={origin} show={show} />
              {side && (
                <div className="idc-overlay">
                  {elements.map((el) => !el.hidden && (
                    <div key={el.id} className={`idc-hit${el.locked ? ' locked' : ''}${flash === el.id ? ' idc-flash' : ''}`}
                      style={{ left: origin.x + el.frame.x * s, top: origin.y + el.frame.y * s, width: Math.max(4, el.frame.w * s), height: Math.max(4, el.frame.h * s), background: flash === el.id ? 'rgba(14,108,147,.25)' : undefined }}
                      onPointerDown={(e) => { e.stopPropagation(); stageRef.current?.focus({ preventScroll: true }); setSel(el.id); startDrag(e, el, null); }} title={el.name} />
                  ))}
                  {selected && !selected.hidden && (
                    <Selection el={selected} s={s} origin={origin} ro={ro || !!selected.locked} onHandle={(e, h) => startDrag(e, selected, h)} />
                  )}
                  {drag && <DragMarks drag={drag} s={s} origin={origin} ab={ab} />}
                </div>
              )}
            </div>
          </div>
          <Rulers s={s} origin={origin} scroll={scroll} step={step} cursor={cursor} />
          <div className="idc-statusbar">
            <span>{cursor ? `x ${cursor.x.toFixed(1)}  y ${cursor.y.toFixed(1)} mm` : 'x —  y — mm'}</span>
            {selected && <span>{selected.name}: {selected.frame.w.toFixed(1)} × {selected.frame.h.toFixed(1)} mm at {selected.frame.x.toFixed(1)}, {selected.frame.y.toFixed(1)}</span>}
            <span className="idc-spacer" />
            <span>{ab.width} × {ab.height} mm · bleed {ab.bleed} · safe {ab.safe}</span>
            <span>ticks {step} mm</span>
            <span title="The canvas measures text with the browser's fonts; the server re-measures with HarfBuzz before anything prints.">canvas metrics</span>
          </div>
          {panel === 'findings' && (
            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 34, maxHeight: '45%', overflow: 'auto', zIndex: 5, boxShadow: '0 8px 30px rgba(0,0,0,.18)', borderRadius: 7 }}>
              <div className="idc-panel">
                <div className="idc-panel-h"><b className="idc-small">Preflight for {emps.find((e) => e.code === shownCode)?.nameEn || 'sample data'}</b><span className="idc-hint">measured on the canvas; the roster check measures on the server</span><span className="idc-spacer" /><button type="button" className="idc-btn sm ghost" onClick={() => setPanel('none')}>Close</button></div>
                <Findings findings={live.findings} onJump={jump} />
              </div>
            </div>
          )}
        </div>
        <Props key={`${face}:${sel || 'card'}`} doc={doc} face={face} el={selected} ab={ab} ctx={ctx} ro={ro} population={population}
          onEl={(patch) => selected && updateEl(selected.id, patch)} onDoc={(patch) => commit({ ...doc, ...patch })} liveCards={template.liveCards || 0} />
      </div>
      {roster && (
        <Modal title={`Roster check · ${plural(roster.roster, 'employee')}`} wide onClose={() => setRoster(null)} footer={<button type="button" className="idc-btn" onClick={() => setRoster(null)}>Close</button>}>
          <div className="idc-hint">The server&apos;s preflight, measured with the print fonts, for every employee on the roster: each finding once, with how many it affects.</div>
          <Findings findings={roster.findings} onJump={(f) => { setRoster(null); jump(f); }} empty="No findings for anyone on the roster." />
        </Modal>
      )}
      {publishAsk && (
        <Modal title="Publish with errors?" wide onClose={() => { setPublishAsk(null); if (publishTarget && publishTarget !== template.uid) nav.go('designer', { t: publishTarget }); setPublishTarget(null); }} footer={<>
          <button type="button" className="idc-btn" onClick={() => { setPublishAsk(null); if (publishTarget && publishTarget !== template.uid) nav.go('designer', { t: publishTarget }); setPublishTarget(null); }}>Go back and fix</button>
          <button type="button" className="idc-btn danger solid" disabled={write.busy} onClick={() => publish(true)}>Publish anyway — record my name</button>
        </>}>
          <div className="idc-banner err">The roster preflight found {plural(publishAsk.errors, 'error')}. Cards with errors are skipped at print. Publishing anyway is recorded with your name.</div>
          <Findings findings={publishAsk.findings} onJump={(f) => { setPublishAsk(null); jump(f); }} />
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------- canvas parts

function Guides({ ab, s, origin, show }: { ab: Artboard; s: number; origin: { x: number; y: number }; show: { trim: boolean; safe: boolean; bleed: boolean } }) {
  const r = (x: number, y: number, w: number, h: number, style: React.CSSProperties) => (
    <div style={{ position: 'absolute', left: origin.x + x * s, top: origin.y + y * s, width: w * s, height: h * s, pointerEvents: 'none', ...style }} />
  );
  return (
    <>
      {show.bleed && r(-ab.bleed, -ab.bleed, ab.width + 2 * ab.bleed, ab.height + 2 * ab.bleed, { outline: '1px dashed rgba(198,40,40,.7)' })}
      {show.trim && r(0, 0, ab.width, ab.height, { outline: '1px solid rgba(14,108,147,.8)', borderRadius: ab.radius * s })}
      {show.safe && r(ab.safe, ab.safe, ab.width - 2 * ab.safe, ab.height - 2 * ab.safe, { outline: '1px dashed rgba(46,125,50,.75)' })}
    </>
  );
}

function Selection({ el, s, origin, ro, onHandle }: { el: El; s: number; origin: { x: number; y: number }; ro: boolean; onHandle: (e: React.PointerEvent, h: Handle) => void }) {
  const f = el.frame;
  const L = origin.x + f.x * s, T = origin.y + f.y * s, W = f.w * s, H = f.h * s;
  const pos: Record<Handle, [number, number, string]> = {
    nw: [0, 0, 'nwse-resize'], n: [0.5, 0, 'ns-resize'], ne: [1, 0, 'nesw-resize'], e: [1, 0.5, 'ew-resize'],
    se: [1, 1, 'nwse-resize'], s: [0.5, 1, 'ns-resize'], sw: [0, 1, 'nesw-resize'], w: [0, 0.5, 'ew-resize'],
  };
  return (
    <>
      <div className="idc-sel" style={{ left: L, top: T, width: W, height: H }} />
      {!ro && HANDLES.map((h) => (
        <div key={h} className="idc-handle" style={{ left: L + pos[h][0] * W - 4, top: T + pos[h][1] * H - 4, cursor: pos[h][2] }}
          onPointerDown={(e) => { e.stopPropagation(); onHandle(e, h); }} />
      ))}
      <div className="idc-dimtag" style={{ left: L + W / 2, top: T + H + 6 }}>{f.w.toFixed(1)} × {f.h.toFixed(1)}</div>
    </>
  );
}

function DragMarks({ drag, s, origin, ab }: { drag: { guides: { v: { line: number; kind: string } | null; h: { line: number; kind: string } | null }; spacing: ReturnType<typeof equalSpacing>; frame: Frame }; s: number; origin: { x: number; y: number }; ab: Artboard }) {
  const { guides, spacing, frame } = drag;
  const ext = 12;
  return (
    <>
      {guides.v && <div className="idc-guide v" style={{ left: origin.x + guides.v.line * s, top: origin.y - (ab.bleed + ext) * s, height: (ab.height + 2 * (ab.bleed + ext)) * s, borderColor: GUIDE_COLOUR[guides.v.kind] }} />}
      {guides.h && <div className="idc-guide h" style={{ top: origin.y + guides.h.line * s, left: origin.x - (ab.bleed + ext) * s, width: (ab.width + 2 * (ab.bleed + ext)) * s, borderColor: GUIDE_COLOUR[guides.h.kind] }} />}
      {spacing.map((sp, i) => sp.spans.map(([a, z], j) => sp.axis === 'x' ? (
        <div key={`${i}${j}`} className="idc-space" style={{ left: origin.x + a * s, top: origin.y + (frame.y + frame.h / 2) * s - 6, width: (z - a) * s, borderTop: '1px solid #C2185B', textAlign: 'center', paddingTop: 1 }}>{sp.gap.toFixed(1)}</div>
      ) : (
        <div key={`${i}${j}`} className="idc-space" style={{ top: origin.y + a * s, left: origin.x + (frame.x + frame.w / 2) * s, height: (z - a) * s, borderLeft: '1px solid #C2185B', paddingLeft: 2, display: 'flex', alignItems: 'center' }}>{sp.gap.toFixed(1)}</div>
      )))}
    </>
  );
}

function Rulers({ s, origin, scroll, step, cursor }: { s: number; origin: { x: number; y: number }; scroll: { x: number; y: number; w: number; h: number }; step: number; cursor: { x: number; y: number } | null }) {
  const ticks = (axis: 'x' | 'y') => {
    const o = axis === 'x' ? origin.x - scroll.x : origin.y - scroll.y;
    const len = axis === 'x' ? scroll.w : scroll.h;
    const from = Math.floor((RULER - o) / s / step) * step;
    const to = Math.ceil((len - o) / s / step) * step;
    const out: React.ReactNode[] = [];
    for (let mm = from; mm <= to; mm += step / 2) {
      const p = o + mm * s - RULER;
      if (p < 0) continue;
      const major = Math.abs(mm / step - Math.round(mm / step)) < 1e-6;
      out.push(axis === 'x' ? (
        <React.Fragment key={mm}>
          <div style={{ position: 'absolute', left: p, bottom: 0, width: 1, height: major ? 8 : 4, background: '#A3A3A3' }} />
          {major && <span className="idc-tick" style={{ left: p + 2, top: 1 }}>{round2(mm)}</span>}
        </React.Fragment>
      ) : (
        <React.Fragment key={mm}>
          <div style={{ position: 'absolute', top: p, right: 0, height: 1, width: major ? 8 : 4, background: '#A3A3A3' }} />
          {major && <span className="idc-tick" style={{ top: p + 1, left: 1, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{round2(mm)}</span>}
        </React.Fragment>
      ));
    }
    return out;
  };
  return (
    <>
      <div className="idc-ruler-corner" aria-hidden="true" />
      <div className="idc-ruler-h" aria-hidden="true">
        {ticks('x')}
        {cursor && <div style={{ position: 'absolute', left: origin.x - scroll.x + cursor.x * s - RULER, top: 0, bottom: 0, width: 1, background: '#0E6C93' }} />}
      </div>
      <div className="idc-ruler-v" aria-hidden="true">
        {ticks('y')}
        {cursor && <div style={{ position: 'absolute', top: origin.y - scroll.y + cursor.y * s - RULER, left: 0, right: 0, height: 1, background: '#0E6C93' }} />}
      </div>
    </>
  );
}

function AddMenu({ disabled, onAdd }: { disabled: boolean; onAdd: (k: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const items: [string, string][] = [['field', 'Field'], ['text', 'Fixed text'], ['photo', 'Photo'], ['qr', 'Verification QR'], ['barcode', 'Barcode'], ['kv', 'Key-value block'], ['shape', 'Shape']];
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="idc-btn sm" disabled={disabled} aria-expanded={open} onClick={() => setOpen(!open)}>Add ▾</button>
      {open && (
        <div className="idc-panel" style={{ position: 'absolute', top: 30, left: 0, zIndex: 20, width: 180, padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,.14)' }} onMouseLeave={() => setOpen(false)}>
          {items.map(([k, l]) => <button key={k} type="button" className="idc-layer" onClick={() => { onAdd(k); setOpen(false); }}><span className="t">{TYPE_MARK[k === 'field' ? 'text' : k === 'kv' ? 'kvTable' : k] || '■'}</span>{l}</button>)}
        </div>
      )}
    </div>
  );
}

function Layers({ elements, sel, setSel, ro, onToggle, onReorder, face, hasBack, onAddBack, onRemoveBack }: {
  elements: El[]; sel: string | null; setSel: (id: string) => void; ro: boolean; face: Face; hasBack: boolean;
  onToggle: (id: string, k: 'hidden' | 'locked') => void; onReorder: (id: string, op: 'forward' | 'backward' | 'front' | 'back') => void;
  onAddBack: () => void; onRemoveBack: () => void;
}) {
  const top = [...elements].reverse();
  return (
    <aside className="idc-layers" aria-label="Layers">
      <div className="idc-panel-h"><span className="idc-sub">Layers · {face}</span><span className="idc-spacer" /><span className="idc-tiny idc-muted">{elements.length}</span></div>
      {/* A keyboard-reachable element list: the canvas alone is not (§17 defect 2). */}
      <div role="listbox" aria-label="Elements, top of the stack first">
        {top.map((el) => (
          <button key={el.id} type="button" role="option" aria-selected={sel === el.id} className={`idc-layer${sel === el.id ? ' on' : ''}`} onClick={() => setSel(el.id)}
            style={{ opacity: el.hidden ? 0.5 : 1 }}>
            <span className="t" aria-hidden="true">{TYPE_MARK[el.type]}</span>
            <span className="idc-ellipsis">{el.name}</span>
            {!ro && (
              <span className="act">
                <span role="button" tabIndex={-1} title="Bring forward" onClick={(e) => { e.stopPropagation(); onReorder(el.id, 'forward'); }}>↑</span>
                <span role="button" tabIndex={-1} title="Send backward" onClick={(e) => { e.stopPropagation(); onReorder(el.id, 'backward'); }}>↓</span>
                <span role="button" tabIndex={-1} title={el.hidden ? 'Show' : 'Hide'} onClick={(e) => { e.stopPropagation(); onToggle(el.id, 'hidden'); }}>{el.hidden ? '◌' : '◉'}</span>
                <span role="button" tabIndex={-1} title={el.locked ? 'Unlock' : 'Lock'} onClick={(e) => { e.stopPropagation(); onToggle(el.id, 'locked'); }}>{el.locked ? '🔒︎' : '⊙'}</span>
              </span>
            )}
          </button>
        ))}
        {!elements.length && <div className="idc-hint" style={{ padding: 12 }}>Nothing on this side yet. Add an element from the toolbar.</div>}
      </div>
      {!ro && (
        <div style={{ padding: 10, borderTop: '1px solid var(--idc-bd-light)' }}>
          {hasBack
            ? <button type="button" className="idc-btn sm ghost danger" onClick={onRemoveBack}>Remove the back side</button>
            : <button type="button" className="idc-btn sm" onClick={onAddBack}>Add a back side</button>}
        </div>
      )}
    </aside>
  );
}

// --------------------------------------------------------------- properties

function Props({ doc, face, el, ab, ctx, ro, population, onEl, onDoc, liveCards }: {
  doc: Doc; face: Face; el: El | null; ab: Artboard; ctx: Ctx; ro: boolean; population: Record<string, number>;
  onEl: (p: Partial<El>) => void; onDoc: (p: Partial<Doc>) => void; liveCards: number;
}) {
  if (!el) return <CardProps doc={doc} face={face} ro={ro} onDoc={onDoc} liveCards={liveCards} />;
  const f = el.frame;
  const setF = (k: keyof Frame, v: number) => onEl({ frame: { ...f, [k]: k === 'w' || k === 'h' ? Math.max(0.5, v) : v } });
  return (
    <aside className="idc-props" aria-label="Properties">
      <fieldset disabled={ro} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <div className="grp">
          <Field label="Name" htmlFor="p-name"><input id="p-name" className="idc-input" value={el.name} onChange={(e) => onEl({ name: e.target.value })} /></Field>
          <div className="row"><Dim label="X" value={f.x} onChange={(v) => setF('x', v)} /><Dim label="Y" value={f.y} onChange={(v) => setF('y', v)} /></div>
          <div className="row"><Dim label="W" value={f.w} onChange={(v) => setF('w', v)} /><Dim label="H" value={f.h} onChange={(v) => setF('h', v)} /></div>
          <div className="row"><Dim label="↻" unit="°" step={1} value={f.rotation || 0} onChange={(v) => setF('rotation', v)} title="Rotation" /><Dim label="α" unit="%" step={5} value={Math.round((el.opacity ?? 1) * 100)} onChange={(v) => onEl({ opacity: Math.max(0, Math.min(100, v)) / 100 })} title="Opacity" /></div>
          <div className="idc-hint">Inside the safe area: {round2(ab.safe)} to {round2(ab.width - ab.safe)} mm across, {round2(ab.safe)} to {round2(ab.height - ab.safe)} mm down.</div>
        </div>
        {el.type === 'text' && <TextProps el={el} ctx={ctx} population={population} onEl={onEl} />}
        {el.type === 'photo' && <PhotoProps el={el} ctx={ctx} onEl={onEl} />}
        {el.type === 'qr' && <QrProps el={el} onEl={onEl} />}
        {el.type === 'barcode' && (
          <div className="grp">
            <div className="idc-sub">Barcode · Code 128</div>
            <SourceEditor value={el.value} ctx={ctx} population={population} onChange={(v) => onEl({ value: v })} />
            <label className="idc-check"><input type="checkbox" checked={!!el.showHumanReadable} onChange={(e) => onEl({ showHumanReadable: e.target.checked })} />Print the value under the bars</label>
            <div className="row"><Dim label="Q" unit="mod" step={1} value={el.quietZone ?? 2} onChange={(v) => onEl({ quietZone: Math.max(0, Math.round(v)) })} title="Quiet zone in modules" /><Colour label="Bars" value={el.barColor || '#141414'} onChange={(v) => onEl({ barColor: v })} /></div>
          </div>
        )}
        {el.type === 'shape' && (
          <div className="grp">
            <div className="idc-sub">Shape</div>
            <div className="idc-seg"><button type="button" className={el.shape !== 'ellipse' ? 'on' : ''} onClick={() => onEl({ shape: 'rect' })}>Rectangle</button><button type="button" className={el.shape === 'ellipse' ? 'on' : ''} onClick={() => onEl({ shape: 'ellipse' })}>Ellipse</button></div>
            <div className="row"><Colour label="Fill" value={el.fill?.color || '#DCDCDC'} onChange={(v) => onEl({ fill: { kind: 'solid', color: v } })} />{el.shape !== 'ellipse' && <Dim label="R" value={el.cornerRadius || 0} onChange={(v) => onEl({ cornerRadius: Math.max(0, v) })} title="Corner radius" />}</div>
            <div className="row"><Dim label="Stroke" value={el.stroke?.width || 0} onChange={(v) => onEl({ stroke: { width: Math.max(0, v), color: el.stroke?.color || '#141414' } })} /><Colour label="Stroke" value={el.stroke?.color || '#141414'} onChange={(v) => onEl({ stroke: { width: el.stroke?.width || 0.3, color: v } })} /></div>
            <div className="idc-hint">A shape touching the card edge is a bleed band: extend it past the trim so trimming never leaves a white sliver.</div>
          </div>
        )}
        {el.type === 'kvTable' && <KvProps el={el} ctx={ctx} population={population} onEl={onEl} />}
        <div className="grp">
          <div className="idc-sub">Show only when</div>
          <ConditionEditor value={el.visibleWhen || null} onChange={(c: Cond | null) => onEl({ visibleWhen: c || undefined })} />
          {el.visibleWhen && <div className="idc-hint">Hidden for employees where this is false. In the preview it is {resolveCondition(el, ctx) ? 'shown' : 'hidden'}.</div>}
        </div>
      </fieldset>
    </aside>
  );
}

const resolveCondition = (el: El, ctx: Ctx) => !resolveSide({ kind: 'front', elements: [el] }, ctx).notes.some((n) => n.kind === 'hidden-by-condition');

function CardProps({ doc, face, ro, onDoc, liveCards }: { doc: Doc; face: Face; ro: boolean; onDoc: (p: Partial<Doc>) => void; liveCards: number }) {
  const side = face === 'front' ? doc.front : doc.back;
  const bg = side?.background || { type: 'solid', color: '#FFFFFF' };
  const setBg = (color: string) => side && onDoc({ [face]: { ...side, background: { type: 'solid', color } } } as Partial<Doc>);
  return (
    <aside className="idc-props" aria-label="Card properties">
      <fieldset disabled={ro} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <div className="grp">
          <div className="idc-sub">Card</div>
          <Field label="Template name" htmlFor="c-name"><input id="c-name" className="idc-input" value={doc.name} onChange={(e) => onDoc({ name: e.target.value })} /></Field>
          <Field label="Size" htmlFor="c-size">
            <select id="c-size" className="idc-select" value={doc.preset} onChange={(e) => {
              const p = PRESETS[e.target.value];
              onDoc(p ? { preset: e.target.value, widthMm: p.w, heightMm: p.h, cornerRadiusMm: p.r } : { preset: 'CUSTOM' });
            }}>
              {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label} · {p.w} × {p.h} mm</option>)}
              <option value="CUSTOM">Custom</option>
            </select>
          </Field>
          {doc.preset === 'CUSTOM' && <div className="row"><Dim label="W" value={doc.widthMm} onChange={(v) => onDoc({ widthMm: Math.max(20, v) })} /><Dim label="H" value={doc.heightMm} onChange={(v) => onDoc({ heightMm: Math.max(20, v) })} /></div>}
          <div className="row3">
            <Dim label="Bleed" value={doc.bleedMm} onChange={(v) => onDoc({ bleedMm: Math.max(0, v) })} />
            <Dim label="Safe" value={doc.safeAreaMm} onChange={(v) => onDoc({ safeAreaMm: Math.max(0, v) })} />
            <Dim label="R" value={doc.cornerRadiusMm} onChange={(v) => onDoc({ cornerRadiusMm: Math.max(0, v) })} title="Corner radius" />
          </div>
          <div className="idc-hint">CR80 is ISO/IEC 7810 ID-1: 85.6 × 54 mm with a 3.18 mm corner, the size every card printer takes. Bleed 2 mm beyond the trim; safe area 3 mm inside it.</div>
        </div>
        {side && (
          <div className="grp">
            <div className="idc-sub">{face === 'front' ? 'Front' : 'Back'} background</div>
            <Colour label="Colour" value={bg.color || '#FFFFFF'} onChange={setBg} />
            <div className="idc-hint">A solid background fills the bleed by itself.</div>
          </div>
        )}
        <div className="grp">
          <div className="idc-sub">Keyboard</div>
          <div className="idc-hint" style={{ lineHeight: 1.7 }}>
            Arrows nudge 0.5 mm · Shift 0.1 mm · Alt 5 mm<br />⌘D duplicate · Delete removes · ⌘Z undo<br />⌘= / ⌘− zoom · ⌘0 fit · Esc deselects · Alt while dragging skips snapping
          </div>
          {liveCards > 0 && <div className="idc-hint">{plural(liveCards, 'live card')} use this version. They keep it: an edit is a new version.</div>}
        </div>
      </fieldset>
    </aside>
  );
}

function Colour({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(value);
  React.useEffect(() => setText(value), [value]);
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#141414';
  return (
    <label className="idc-dim" title={label}>
      <input type="color" value={hex} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={`${label} colour`} style={{ width: 28, padding: 0, border: 0, height: 26, flex: 'none' }} />
      <input value={text} onChange={(e) => setText(e.target.value)} onBlur={() => (/^#[0-9a-f]{6}$/i.test(text) || /^rgba?\(/.test(text) ? onChange(text) : setText(value))} aria-label={label} />
    </label>
  );
}

function BindingPicker({ path, population, onPick }: { path?: string; population: Record<string, number>; onPick: (p: string) => void }) {
  const { setup } = useShared();
  const [q, setQ] = React.useState('');
  const needle = q.toLowerCase();
  return (
    <div>
      <input className="idc-input" placeholder="Find a field" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a field" style={{ marginBottom: 6 }} />
      <div className="idc-picker" role="listbox" aria-label="Fields">
        {setup.catalogue.map((g) => {
          const fields = g.fields.filter((f) => f.type !== 'image' && !f.pii && f.printable !== false && (!needle || f.label.toLowerCase().includes(needle) || f.path.includes(needle)));
          if (!fields.length) return null;
          return (
            <React.Fragment key={g.id}>
              <div className="g">{g.label}</div>
              {fields.map((f) => {
                const pct = population[f.path];
                const band = populationBand(pct);
                return (
                  <button key={f.path} type="button" role="option" aria-selected={path === f.path} className={path === f.path ? 'on' : ''} onClick={() => onPick(f.path)} title={f.path}>
                    <span className="idc-ellipsis">{f.label}</span>
                    {pct !== undefined && <span className="idc-pop" style={{ color: band.fg, background: band.bg }} title={`${pct}% of the roster have it`}>{pct}%</span>}
                  </button>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function FormatterList({ value, onChange }: { value: Formatter[]; onChange: (v: Formatter[]) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {value.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 4 }}>
          <select className="idc-select" value={f.fn} onChange={(e) => onChange(value.map((x, j) => (j === i ? { fn: e.target.value, arg: null } : x)))} aria-label="Formatter">
            {Object.entries(FORMATTERS).map(([k, m]) => <option key={k} value={k}>{m.sig}</option>)}
          </select>
          {['date', 'truncate', 'default', 'pad', 'numerals'].includes(f.fn) && (
            <input className="idc-input mono" style={{ width: 110 }} value={String(f.arg ?? '')} placeholder={f.fn === 'date' ? 'dd MMM yyyy' : f.fn === 'numerals' ? 'bengali' : ''}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, arg: e.target.value } : x)))} aria-label="Argument" />
          )}
          <button type="button" className="idc-btn sm icon ghost" aria-label="Remove formatter" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="idc-btn sm ghost" style={{ alignSelf: 'flex-start' }} onClick={() => onChange([...value, { fn: 'upper' }])}>+ Formatter</button>
      {value.length > 0 && <div className="idc-hint">{value.map((f) => FORMATTERS[f.fn]?.help).filter(Boolean).join(' · ')}</div>}
    </div>
  );
}

function SourceEditor({ value, ctx, population, onChange }: { value?: Source; ctx: Ctx; population: Record<string, number>; onChange: (v: Source) => void }) {
  const { setup } = useShared();
  const kind = value?.kind || 'binding';
  const known = React.useMemo(() => setup.catalogue.flatMap((g) => g.fields.map((f) => f.path)).concat(['card.token', 'card.status']), [setup.catalogue]);
  const exprCheck = value?.kind === 'expression' ? checkExpression(value.expr, ctx, known) : null;
  return (
    <>
      <div className="idc-seg" role="group" aria-label="Content">
        <button type="button" className={kind === 'binding' ? 'on' : ''} onClick={() => onChange({ kind: 'binding', path: value?.kind === 'binding' ? value.path : 'employee.fullName', formatters: [] })}>Field</button>
        <button type="button" className={kind === 'expression' ? 'on' : ''} onClick={() => onChange({ kind: 'expression', expr: value?.kind === 'binding' ? value.path : 'employee.fullName | upper' })}>Expression</button>
        <button type="button" className={kind === 'literal' ? 'on' : ''} onClick={() => onChange({ kind: 'literal', value: value?.kind === 'literal' ? value.value : 'Text' })}>Fixed text</button>
      </div>
      {value?.kind === 'binding' && (
        <>
          <BindingPicker path={value.path} population={population} onPick={(p) => onChange({ ...value, path: p })} />
          <div className="idc-hint">Bound to <span className="idc-mono">{value.path}</span>{population[value.path] !== undefined ? ` · ${population[value.path]}% of the roster have it` : ''}. Preview: <b>{String(getPath(ctx, value.path) ?? '—')}</b></div>
          <FormatterList value={value.formatters || []} onChange={(fm) => onChange({ ...value, formatters: fm })} />
        </>
      )}
      {value?.kind === 'expression' && (
        <>
          <input className={`idc-input mono${exprCheck && !exprCheck.ok && !exprCheck.empty ? ' bad' : ''}`} value={value.expr} onChange={(e) => onChange({ kind: 'expression', expr: e.target.value })} aria-label="Expression" spellCheck={false} />
          {exprCheck?.ok ? <div className="idc-hint">Gives: <b>{exprCheck.result || '(empty)'}</b></div> : <div className="idc-error-text">{exprCheck?.message}
            {exprCheck && 'suggestion' in exprCheck && exprCheck.suggestion && <button type="button" className="idc-btn sm ghost" onClick={() => onChange({ kind: 'expression', expr: value.expr.replace(/^[^|]+/, exprCheck.suggestion as string) })}>Use it</button>}</div>}
          <div className="idc-hint">A field path, then formatters: <span className="idc-mono">employee.fullName | upper</span>, <span className="idc-mono">card.expiryDate | date(&apos;dd MMM yyyy&apos;)</span>.</div>
        </>
      )}
      {value?.kind === 'literal' && <textarea className="idc-textarea" value={value.value} onChange={(e) => onChange({ kind: 'literal', value: e.target.value })} aria-label="Text" />}
    </>
  );
}

function StyleEditor({ style, onChange, compact }: { style: TextStyle; onChange: (s: TextStyle) => void; compact?: boolean }) {
  const set = (p: Partial<TextStyle>) => onChange({ ...style, ...p });
  return (
    <>
      <select className="idc-select" value={style.fontFamily || 'IBM Plex Sans'} onChange={(e) => set({ fontFamily: e.target.value })} aria-label="Font">
        {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <div className="row3">
        <Dim label="Size" unit="pt" value={style.fontSize || 8} onChange={(v) => set({ fontSize: Math.max(3, v) })} />
        <select className="idc-select" value={style.fontWeight || 400} onChange={(e) => set({ fontWeight: +e.target.value })} aria-label="Weight">
          {[400, 500, 600, 700].map((w) => <option key={w} value={w}>{({ 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold' } as Record<number, string>)[w]}</option>)}
        </select>
        <Colour label="Colour" value={style.color || '#141414'} onChange={(v) => set({ color: v })} />
      </div>
      {!compact && (
        <>
          <div className="row">
            <div className="idc-seg" role="group" aria-label="Align">{(['left', 'center', 'right'] as const).map((a) => <button key={a} type="button" className={(style.align || 'left') === a ? 'on' : ''} onClick={() => set({ align: a })} aria-label={`Align ${a}`}>{a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}</button>)}</div>
            <div className="idc-seg" role="group" aria-label="Vertical align">{(['top', 'middle', 'bottom'] as const).map((a) => <button key={a} type="button" className={(style.verticalAlign || 'top') === a ? 'on' : ''} onClick={() => set({ verticalAlign: a })} aria-label={`Align ${a}`}>{a === 'top' ? '⤒' : a === 'middle' ? '↕' : '⤓'}</button>)}</div>
          </div>
          <div className="row">
            <Dim label="Track" unit="pt" value={style.letterSpacing || 0} onChange={(v) => set({ letterSpacing: v })} title="Letter spacing" />
            <Dim label="Line" unit="×" value={style.lineHeight || 1.2} step={0.05} onChange={(v) => set({ lineHeight: Math.max(0.8, v) })} title="Line height" />
          </div>
          <div className="row">
            <select className="idc-select" value={style.textTransform || 'none'} onChange={(e) => set({ textTransform: e.target.value as TextStyle['textTransform'] })} aria-label="Case">
              <option value="none">As written</option><option value="upper">UPPER CASE</option><option value="lower">lower case</option><option value="title">Title Case</option>
            </select>
            <select className="idc-select" value={style.numerals || 'latin'} onChange={(e) => set({ numerals: e.target.value as TextStyle['numerals'] })} aria-label="Numerals">
              <option value="latin">0123 numerals</option><option value="bengali">০১২৩ numerals</option>
            </select>
          </div>
        </>
      )}
    </>
  );
}

function TextProps({ el, ctx, population, onEl }: { el: El; ctx: Ctx; population: Record<string, number>; onEl: (p: Partial<El>) => void }) {
  const ov = el.overflow || {};
  const node = resolveSide({ kind: 'front', elements: [el] }, ctx, canvasMeasurer).nodes[0];
  return (
    <>
      <div className="grp"><div className="idc-sub">Content</div><SourceEditor value={el.content} ctx={ctx} population={population} onChange={(v) => onEl({ content: v })} /></div>
      <div className="grp"><div className="idc-sub">Typography</div><StyleEditor style={el.style || baseStyle()} onChange={(s) => onEl({ style: s })} /></div>
      <div className="grp">
        <div className="idc-sub">When it does not fit</div>
        <select className="idc-select" value={ov.mode || 'overflow'} onChange={(e) => onEl({ overflow: { ...ov, mode: e.target.value as NonNullable<El['overflow']>['mode'] } })} aria-label="Overflow">
          <option value="shrink">Shrink to one line</option><option value="wrap">Wrap, then shrink</option><option value="truncate">Cut with an ellipsis</option><option value="overflow">Report it, change nothing</option>
        </select>
        <div className="row">
          {(ov.mode === 'shrink' || ov.mode === 'wrap') && <Dim label="Min" unit="pt" value={ov.minFontSize || el.style?.fontSize || 6} onChange={(v) => onEl({ overflow: { ...ov, minFontSize: Math.max(3, v) } })} title="Smallest size" />}
          {ov.mode === 'wrap' && <Dim label="Lines" unit="" step={1} value={ov.maxLines || 2} onChange={(v) => onEl({ overflow: { ...ov, maxLines: Math.max(1, Math.round(v)) } })} />}
        </div>
        {node?.fit && <div className={node.fit.clipped ? 'idc-error-text' : 'idc-hint'}>
          {node.fit.clipped ? `Does not fit: ${node.fit.widthMm.toFixed(1)} mm of text in ${el.frame.w.toFixed(1)} mm.` : node.fit.shrunk ? `Shrunk from ${node.fit.shrunkFrom}pt to ${node.fit.fontSize.toFixed(1)}pt for this employee.` : `Fits at ${node.fit.fontSize}pt for this employee.`}
        </div>}
        <select className="idc-select" value={el.emptyBehaviour || 'placeholder'} onChange={(e) => onEl({ emptyBehaviour: e.target.value as El['emptyBehaviour'] })} aria-label="When empty">
          <option value="hide">When empty: hide it</option><option value="placeholder">When empty: show a placeholder</option>
        </select>
        {el.emptyBehaviour !== 'hide' && <input className="idc-input" value={el.placeholder || ''} placeholder="—" onChange={(e) => onEl({ placeholder: e.target.value })} aria-label="Placeholder" />}
      </div>
    </>
  );
}

function PhotoProps({ el, ctx, onEl }: { el: El; ctx: Ctx; onEl: (p: Partial<El>) => void }) {
  const photo = getPath(ctx, el.path || 'employee.photo') as { width?: number } | null;
  const dpi = photo?.width ? effectiveDpi(photo.width, el.frame.w) : null;
  const shape = typeof el.shape === 'object' ? el.shape : { kind: 'rect', radius: 0 };
  return (
    <div className="grp">
      <div className="idc-sub">Photo</div>
      <div className="idc-seg"><button type="button" className={el.fit !== 'contain' ? 'on' : ''} onClick={() => onEl({ fit: 'cover' })}>Fill</button><button type="button" className={el.fit === 'contain' ? 'on' : ''} onClick={() => onEl({ fit: 'contain' })}>Fit</button></div>
      <div className="row">
        <select className="idc-select" value={shape.kind} onChange={(e) => onEl({ shape: { ...shape, kind: e.target.value } })} aria-label="Shape"><option value="rect">Rectangle</option><option value="ellipse">Ellipse</option></select>
        {shape.kind !== 'ellipse' && <Dim label="R" value={shape.radius || 0} onChange={(v) => onEl({ shape: { ...shape, radius: Math.max(0, v) } })} title="Corner radius" />}
      </div>
      <div className="row">
        <Dim label="Border" value={el.border?.width || 0} onChange={(v) => onEl({ border: { width: Math.max(0, v), color: el.border?.color || '#DCDCDC' } })} />
        <Colour label="Border" value={el.border?.color || '#DCDCDC'} onChange={(v) => onEl({ border: { width: el.border?.width || 0.3, color: v } })} />
      </div>
      <select className="idc-select" value={el.fallback || 'initials'} onChange={(e) => onEl({ fallback: e.target.value as El['fallback'] })} aria-label="No photo">
        <option value="initials">No photo: show initials</option><option value="hide">No photo: hide it</option>
      </select>
      <div className={dpi !== null && dpi < 300 ? (dpi < 150 ? 'idc-error-text' : 'idc-banner warn') : 'idc-hint'}>
        {dpi !== null ? `${dpi} DPI at ${el.frame.w.toFixed(1)} mm wide for this employee. ${dpi < 150 ? 'Too low to print.' : dpi < 300 ? 'Below 300: it may print soft.' : 'Sharp.'}` : 'No photo for this employee: the card shows the fallback.'}
      </div>
    </div>
  );
}

function QrProps({ el, onEl }: { el: El; onEl: (p: Partial<El>) => void }) {
  return (
    <div className="grp">
      <div className="idc-sub">Verification QR</div>
      <div className="idc-hint">Encodes the card&apos;s verification link: a random token, never the employee code — a sequential id in a URL is an enumeration attack.</div>
      <div className="row">
        <select className="idc-select" value={el.errorCorrection || 'M'} onChange={(e) => onEl({ errorCorrection: e.target.value as El['errorCorrection'] })} aria-label="Error correction">
          <option value="L">L · 7%</option><option value="M">M · 15%</option><option value="Q">Q · 25%</option><option value="H">H · 30%</option>
        </select>
        <Dim label="Quiet" unit="mod" step={1} value={el.quietZoneModules ?? 1} onChange={(v) => onEl({ quietZoneModules: Math.max(0, Math.round(v)) })} />
      </div>
      <div className="row"><Colour label="Modules" value={el.moduleColor || '#141414'} onChange={(v) => onEl({ moduleColor: v })} /><Colour label="Background" value={el.backgroundColor || '#FFFFFF'} onChange={(v) => onEl({ backgroundColor: v })} /></div>
      {el.frame.w < 10 && <div className="idc-banner warn">Under 10 mm a phone camera struggles at a gate.</div>}
    </div>
  );
}

function KvProps({ el, ctx, population, onEl }: { el: El; ctx: Ctx; population: Record<string, number>; onEl: (p: Partial<El>) => void }) {
  const rows = el.rows || [];
  const [open, setOpen] = React.useState<number | null>(null);
  const node = resolveSide({ kind: 'front', elements: [el] }, ctx).nodes[0];
  const setRow = (i: number, p: Partial<NonNullable<El['rows']>[number]>) => onEl({ rows: rows.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  return (
    <>
      <div className="grp">
        <div className="idc-sub">Rows</div>
        {rows.map((r, i) => (
          <div key={i} className="idc-panel" style={{ padding: 6 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input className="idc-input" style={{ width: 70 }} value={r.label.kind === 'literal' ? r.label.value : ''} onChange={(e) => setRow(i, { label: { kind: 'literal', value: e.target.value } })} aria-label="Label" />
              <button type="button" className="idc-btn sm" style={{ flex: 1, justifyContent: 'flex-start', overflow: 'hidden' }} onClick={() => setOpen(open === i ? null : i)}>
                <span className="idc-ellipsis idc-mono">{r.value.kind === 'binding' ? r.value.path : r.value.kind === 'literal' ? `“${r.value.value}”` : r.value.expr}</span>
              </button>
              <button type="button" className="idc-btn sm icon ghost" aria-label="Remove row" onClick={() => onEl({ rows: rows.filter((_, j) => j !== i) })}>✕</button>
            </div>
            {open === i && <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}><SourceEditor value={r.value} ctx={ctx} population={population} onChange={(v) => setRow(i, { value: v })} /></div>}
          </div>
        ))}
        <button type="button" className="idc-btn sm ghost" style={{ alignSelf: 'flex-start' }} onClick={() => onEl({ rows: [...rows, { label: { kind: 'literal', value: 'Label' }, value: { kind: 'binding', path: 'employee.bloodGroup' } }] })}>+ Row</button>
        <label className="idc-check"><input type="checkbox" checked={!!el.collapseEmptyRows} onChange={(e) => onEl({ collapseEmptyRows: e.target.checked })} />Drop a row whose value is empty</label>
        <div className="row"><Dim label="Label" value={el.labelWidth || 10} onChange={(v) => onEl({ labelWidth: Math.max(2, v) })} title="Label column width" /><Dim label="Gap" value={el.rowGap || 0} onChange={(v) => onEl({ rowGap: Math.max(0, v) })} title="Row gap" /></div>
        {node?.kvNeededMm !== undefined && <div className={node.kvOverflow ? 'idc-error-text' : 'idc-hint'}>{node.rows?.length} rows need {node.kvNeededMm.toFixed(1)} mm; the box is {el.frame.h.toFixed(1)} mm.{node.kvOverflow ? ' The last row will be cut in half.' : ''}</div>}
      </div>
      <div className="grp"><div className="idc-sub">Labels</div><StyleEditor compact style={el.labelStyle || baseStyle({ fontSize: 6 })} onChange={(s) => onEl({ labelStyle: s })} /></div>
      <div className="grp"><div className="idc-sub">Values</div><StyleEditor compact style={el.valueStyle || baseStyle({ fontSize: 7 })} onChange={(s) => onEl({ valueStyle: s })} /></div>
    </>
  );
}

