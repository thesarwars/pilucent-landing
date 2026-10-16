'use client';

/**
 * Photo studio (§11): crop, adjust, and the DPI the photo will print at --
 * the figure that catches real defects. The crop frame is locked to the
 * photo element's aspect, so what is cropped is what prints. Crop and
 * adjustments are stored as parameters; the original is always kept.
 *
 * Background removal is not built yet: the studio says so rather than
 * offering a control that does nothing.
 */

import * as React from 'react';
import { type El, effectiveDpi } from './engine';
import { useEmployee, useGallery } from './hooks';
import { useShared } from './IdCards';
import { Empty, Loading, StatusPill, useWrite } from './parts';
import * as api from './api';
import type { Asset } from './types';

type Crop = { x: number; y: number; w: number; h: number };

export function PhotoStudio() {
  const { nav, q } = useShared();
  const g = useGallery(q, 'ALL');
  const rows = g.data?.rows || [];
  const code = nav.emp || rows.find((r) => !r.hasPhoto)?.code || rows[0]?.code || null;
  return (
    <div className="idc-split" style={{ gridTemplateColumns: '260px minmax(0,1fr)' }}>
      <aside className="idc-side-panel" style={{ borderLeft: 0, borderRight: '1px solid var(--idc-bd)', order: -1 }} aria-label="Employees">
        <div className="idc-panel-h"><span className="idc-sub">Employees</span><span className="idc-spacer" /><span className="idc-tiny idc-muted">{rows.filter((r) => !r.hasPhoto).length} without a photo</span></div>
        {g.isLoading ? <Loading /> : rows.map((r) => (
          <button key={r.code} type="button" className={`idc-layer${code === r.code ? ' on' : ''}`} style={{ height: 40 }} onClick={() => nav.go('photos', { emp: r.code })}>
            <span style={{ width: 24, height: 30, borderRadius: 3, background: '#ECECEC', overflow: 'hidden', flex: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.photo?.url && <img src={api.mediaUrl(r.photo.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="idc-ellipsis" style={{ display: 'block' }}>{r.nameEn}</span>
              <span className="idc-mono idc-tiny" style={{ color: r.hasPhoto ? 'var(--idc-ink-3)' : '#9C1F1F' }}>{r.code}{r.hasPhoto ? '' : ' · no photo'}</span>
            </span>
          </button>
        ))}
      </aside>
      {code ? <Studio key={code} code={code} /> : <div className="idc-scroll"><Empty title="Nobody on the roster" /></div>}
    </div>
  );
}

function photoElement(t: { front?: { elements: El[] }; back?: { elements: El[] } | null } | null): El | null {
  if (!t) return null;
  for (const side of [t.front, t.back]) {
    if (!side) continue;
    const stack: El[] = [...side.elements];
    while (stack.length) {
      const el = stack.shift()!;
      if (el.type === 'photo') return el;
      if (el.children) stack.push(...el.children);
    }
  }
  return null;
}

function Studio({ code }: { code: string }) {
  const { setup } = useShared();
  const q = useEmployee(code);
  const write = useWrite();
  const fileRef = React.useRef<HTMLInputElement>(null);
  if (q.isLoading || !q.data) return <Loading what="Loading the photo" />;
  const { employee, photo, template, cards } = q.data;
  const el = photoElement(template);
  const placed = el ? el.frame : { w: 24, h: 30 };
  const upload = async (f: File | undefined) => { if (f) await write.run(() => api.uploadPhoto(code, f), 'Photo uploaded'); };
  const live = cards.find((c) => ['ISSUED', 'ACTIVE'].includes(c.status));
  return (
    <div className="idc-scroll">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 className="idc-h1">{employee.nameEn}</h2>
          <span className="idc-mono idc-small idc-muted">{employee.code}</span>
          {live && <StatusPill status={live.effectiveStatus} />}
          <span className="idc-spacer" />
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
          <button type="button" className="idc-btn" disabled={!setup.can.photos || write.busy} onClick={() => fileRef.current?.click()}>{photo ? 'Replace photo' : 'Upload photo'}</button>
          {employee.hasProfilePhoto && <button type="button" className="idc-btn" disabled={!setup.can.photos || write.busy} onClick={() => write.run(() => api.importProfilePhoto(code), 'Profile photo brought in')}>Use the profile photo</button>}
        </div>
        {write.error && <div className="idc-banner err">{write.error}</div>}
        {live && photo && <div className="idc-banner">{live.number} keeps the photo it was issued with. A new photo reaches a card when it is replaced.</div>}
        {!photo ? (
          <div className="idc-panel"><Empty title="No photo yet">Upload a JPEG, PNG or WebP of at least {Math.ceil((placed.w / 25.4) * 300)} px across — that is 300 DPI at the {placed.w} mm the template places it.{!setup.can.photos && ' Changing photos needs the manage card photos permission.'}</Empty></div>
        ) : (
          <Editor key={photo.uid + (photo.crop ? JSON.stringify(photo.crop) : '')} photo={photo} placed={placed} canEdit={setup.can.photos} templateName={template?.name} />
        )}
      </div>
    </div>
  );
}

function initialCrop(p: Asset, aspect: number): Crop {
  if (p.crop) return p.crop;
  let w = p.width, h = Math.round(w / aspect);
  if (h > p.height) { h = p.height; w = Math.round(h * aspect); }
  return { x: Math.round((p.width - w) / 2), y: Math.round((p.height - h) / 2), w, h };
}

function Editor({ photo, placed, canEdit, templateName }: { photo: Asset; placed: { w: number; h: number }; canEdit: boolean; templateName?: string }) {
  const aspect = placed.w / placed.h;
  const [crop, setCrop] = React.useState<Crop>(() => initialCrop(photo, aspect));
  const [adj, setAdj] = React.useState({ brightness: photo.adjustments.brightness || 0, contrast: photo.adjustments.contrast || 0, saturation: photo.adjustments.saturation || 0 });
  const write = useWrite();
  const maxW = 440, maxH = 460;
  const k = Math.min(maxW / photo.width, maxH / photo.height, 1);
  const dpi = effectiveDpi(crop.w, placed.w);
  const filter = `brightness(${1 + adj.brightness / 100}) contrast(${1 + adj.contrast / 100}) saturate(${1 + adj.saturation / 100})`;
  const dirty = JSON.stringify(crop) !== JSON.stringify(photo.crop || initialCrop(photo, aspect)) || adj.brightness !== (photo.adjustments.brightness || 0) || adj.contrast !== (photo.adjustments.contrast || 0) || adj.saturation !== (photo.adjustments.saturation || 0) || !photo.crop;

  const drag = (e: React.PointerEvent, mode: 'move' | 'size') => {
    if (!canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    const start = { ...crop }, sx = e.clientX, sy = e.clientY;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / k, dy = (ev.clientY - sy) / k;
      if (mode === 'move') {
        setCrop({ ...start, x: Math.round(Math.max(0, Math.min(photo.width - start.w, start.x + dx))), y: Math.round(Math.max(0, Math.min(photo.height - start.h, start.y + dy))) });
      } else {
        // Locked to the element's aspect: the crop is what prints.
        let w = Math.max(40, start.w + Math.max(dx, dy * aspect));
        w = Math.min(w, photo.width - start.x, (photo.height - start.y) * aspect);
        setCrop({ ...start, w: Math.round(w), h: Math.round(w / aspect) });
      }
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const save = () => write.run(() => api.adjustAsset(photo.uid, { crop, adjustments: adj }), 'Photo saved');
  const checks: [boolean | null, string][] = [
    [dpi >= 300 ? true : dpi >= 150 ? null : false, `${dpi} DPI at ${placed.w} mm wide${dpi >= 300 ? '' : dpi >= 150 ? ': below 300, it may print soft' : ': too low to print'}`],
    [true, `Crop locked to the photo element, ${placed.w} × ${placed.h} mm${templateName ? ` on ${templateName}` : ''}`],
    [photo.width >= 600 ? true : null, `Original ${photo.width} × ${photo.height} px, ${(photo.bytes / 1024).toFixed(0)} KB ${photo.mime.replace('image/', '').toUpperCase()}`],
    [null, 'Background removal is not available yet: use a plain, light background when taking the photo'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${Math.round(photo.width * k)}px minmax(260px, 1fr)`, gap: 18, alignItems: 'start' }}>
      <div>
        <div className="idc-crop" style={{ width: photo.width * k, height: photo.height * k }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={api.mediaUrl(photo.originalUrl)} alt="The original photo" draggable={false} style={{ width: photo.width * k, height: photo.height * k, filter }} />
          <div className="frame" style={{ left: crop.x * k, top: crop.y * k, width: crop.w * k, height: crop.h * k }} onPointerDown={(e) => drag(e, 'move')} aria-label="Crop frame">
            {canEdit && <div className="grip" onPointerDown={(e) => drag(e, 'size')} aria-label="Resize the crop" />}
          </div>
        </div>
        <div className="idc-hint" style={{ marginTop: 6 }}>Drag the frame to move it; the corner resizes it. Crop {crop.w} × {crop.h} px from {crop.x}, {crop.y}.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="idc-panel">
          <div className="idc-panel-h"><span className="idc-sub">As it prints</span><span className="idc-spacer" /><span className="idc-mono idc-small" style={{ color: dpi >= 300 ? '#1F7A4C' : dpi >= 150 ? '#8A5A00' : '#9C1F1F' }}>{dpi} DPI</span></div>
          <div className="idc-panel-b" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: placed.w * 4, height: placed.h * 4, overflow: 'hidden', borderRadius: 4, border: '1px solid var(--idc-bd)', flex: 'none', background: '#ececec' }}>
              {/* §11: below 200 dpi the preview is visibly soft -- a number alone gets dismissed. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={api.mediaUrl(photo.originalUrl)} alt="Preview at the printed size" draggable={false}
                style={{ width: (photo.width / crop.w) * placed.w * 4, height: (photo.height / crop.h) * placed.h * 4, marginLeft: -(crop.x / crop.w) * placed.w * 4, marginTop: -(crop.y / crop.h) * placed.h * 4, filter: `${filter}${dpi < 200 ? ' blur(0.8px)' : ''}`, maxWidth: 'none' }} />
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {checks.map(([ok, text], i) => (
                <li key={i} className="idc-small" style={{ display: 'flex', gap: 6, lineHeight: 1.4 }}>
                  <span aria-hidden="true" style={{ color: ok === true ? '#1F7A4C' : ok === false ? '#9C1F1F' : '#8A5A00', width: 12, flex: 'none' }}>{ok === true ? '✓' : ok === false ? '✕' : '!'}</span>{text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="idc-panel">
          <div className="idc-panel-h"><span className="idc-sub">Adjust</span><span className="idc-spacer" /><button type="button" className="idc-btn sm ghost" disabled={!canEdit} onClick={() => setAdj({ brightness: 0, contrast: 0, saturation: 0 })}>Reset</button></div>
          <div className="idc-panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['brightness', 'contrast', 'saturation'] as const).map((key) => (
              <label key={key} className="idc-field">
                <span className="idc-label" style={{ display: 'flex' }}>{key[0].toUpperCase() + key.slice(1)}<span className="idc-spacer" /><span className="idc-mono">{adj[key] > 0 ? '+' : ''}{adj[key]}</span></span>
                <input type="range" className="idc-range" min={-50} max={50} value={adj[key]} disabled={!canEdit} onChange={(e) => setAdj({ ...adj, [key]: +e.target.value })} />
              </label>
            ))}
          </div>
        </div>
        {write.error && <div className="idc-banner err">{write.error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="idc-btn primary" disabled={!canEdit || write.busy || !dirty} onClick={save}>{write.busy ? 'Saving…' : 'Save photo'}</button>
          <span className="idc-hint" style={{ alignSelf: 'center' }}>The original is kept; the crop and adjustments are applied when a card renders.</span>
        </div>
      </div>
    </div>
  );
}

