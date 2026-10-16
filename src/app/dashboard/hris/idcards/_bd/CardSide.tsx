'use client';

/**
 * One renderer for thumbnail, canvas, card detail and preview (§16.3): a
 * resolved side drawn at `ppmm` pixels per millimetre. Geometry stays in mm
 * until this file multiplies it out, so a thumbnail cannot disagree with the
 * card. The server's `render.node_html` draws the same tree for print.
 */

import * as React from 'react';
import QRCode from 'react-qr-code';
import { encode128 } from './code128';
import { type Artboard, type Ctx, type Measurer, type Node, type Resolved, type Side, type TextStyle, ptToMm, resolveSide, walkNodes } from './engine';
import { canvasMeasurer, cssStack, nearestWeight } from './fonts';
import { mediaUrl } from './api';

export interface CardSideProps {
  side: Side;
  ab: Artboard;
  ctx: Ctx;
  ppmm: number;
  measurer?: Measurer;
  resolved?: Resolved;
  /** Draw the bleed around the trim (the designer); otherwise clip to the rounded card. */
  bleed?: boolean;
  dimmed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const px = (mm: number, ppmm: number) => `${(mm * ppmm).toFixed(3)}px`;

function textCss(style: TextStyle, ppmm: number, size?: number): React.CSSProperties {
  const fam = style.fontFamily;
  return {
    fontFamily: cssStack(fam),
    fontWeight: nearestWeight(fam, style.fontWeight),
    fontSize: px(ptToMm(size ?? style.fontSize ?? 8), ppmm),
    lineHeight: style.lineHeight || 1.2,
    letterSpacing: px(ptToMm(style.letterSpacing || 0), ppmm),
    color: style.color || '#141414',
    textAlign: style.align || 'left',
    fontStyle: style.italic ? 'italic' : undefined,
    textDecoration: style.underline ? 'underline' : undefined,
  };
}

/** QR version for a byte payload at M: the quiet zone is in modules. */
function qrModules(payload: string) {
  const caps = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412];
  const n = new TextEncoder().encode(payload || ' ').length;
  const v = caps.findIndex((c) => n <= c);
  return 17 + 4 * ((v < 0 ? caps.length : v) + 1);
}

function Barcode({ value, quiet, colour }: { value: string; quiet: number; colour: string }) {
  const bars = encode128(value);
  if (!bars) return null;
  const total = bars.reduce((s, [, m]) => s + m, 0) + 2 * quiet;
  let x = quiet;
  const rects: React.ReactNode[] = [];
  bars.forEach(([isBar, m], i) => {
    if (isBar) rects.push(<rect key={i} x={x} y={0} width={m} height={1} />);
    x += m;
  });
  return (
    <svg viewBox={`0 0 ${total} 1`} width="100%" height="100%" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <g fill={colour}>{rects}</g>
    </svg>
  );
}

export function NodeView({ n, ppmm }: { n: Node; ppmm: number }) {
  const el = n.el;
  const f = n.frame;
  const box: React.CSSProperties = {
    position: 'absolute', left: px(f.x, ppmm), top: px(f.y, ppmm), width: px(f.w, ppmm), height: px(f.h, ppmm),
    transform: f.rotation ? `rotate(${f.rotation}deg)` : undefined, opacity: n.opacity !== 1 ? n.opacity : undefined,
  };
  if (n.type === 'shape') {
    const radius = el.shape === 'ellipse' ? '50%' : px(Number(el.cornerRadius || 0), ppmm);
    return (
      <div style={{ ...box, background: el.fill?.color || 'transparent', borderRadius: radius, boxSizing: 'border-box',
        border: el.stroke?.width ? `${px(el.stroke.width, ppmm)} solid ${el.stroke.color}` : undefined }} />
    );
  }
  if (n.type === 'text' && n.fit && n.style) {
    const va = n.style.verticalAlign === 'middle' ? 'center' : n.style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start';
    return (
      <div style={{ ...box, display: 'flex', flexDirection: 'column', justifyContent: va, overflow: 'hidden' }}>
        <div style={{ ...textCss(n.style, ppmm, n.fit.fontSize), whiteSpace: 'pre' }} lang={/[ঀ-৿]/.test(n.text || '') ? 'bn' : undefined}>
          {n.fit.lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>)}
        </div>
      </div>
    );
  }
  if (n.type === 'photo') {
    const shape = typeof el.shape === 'object' ? el.shape : undefined;
    const radius = shape?.kind === 'ellipse' ? '50%' : px(Number(shape?.radius || 0), ppmm);
    const url = n.photo?.url ? mediaUrl(n.photo.url) : '';
    // §11: below 200 dpi the preview is visibly soft -- a number alone gets dismissed.
    const soft = n.dpi && n.dpi < 200 ? `blur(${Math.max(0.4, ppmm * 0.09).toFixed(2)}px)` : undefined;
    return (
      <div style={{ ...box, overflow: 'hidden', borderRadius: radius, boxSizing: 'border-box',
        border: el.border?.width ? `${px(el.border.width, ppmm)} solid ${el.border.color}` : undefined }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: el.fit === 'contain' ? 'contain' : 'cover', display: 'block', filter: soft }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECECEC',
            color: '#8F8F8F', fontFamily: cssStack('IBM Plex Sans'), fontWeight: 600, fontSize: px(ptToMm(Math.max(6, f.w * 0.9)), ppmm) }}>
            {n.initials}
          </div>
        )}
      </div>
    );
  }
  if (n.type === 'qr') {
    const quiet = el.quietZoneModules ?? 4;
    const mods = qrModules(n.payload || '');
    const pad = (f.w * quiet) / (mods + 2 * quiet);
    return (
      <div style={{ ...box, background: el.backgroundColor || '#FFFFFF', padding: px(pad, ppmm), boxSizing: 'border-box' }}>
        <QRCode value={n.payload || ' '} level={el.errorCorrection || 'M'} fgColor={el.moduleColor || '#141414'}
          bgColor={el.backgroundColor || '#FFFFFF'} style={{ width: '100%', height: '100%', display: 'block' }} size={256} aria-hidden="true" />
      </div>
    );
  }
  if (n.type === 'barcode') {
    const human = !!el.showHumanReadable;
    return (
      <div style={box}>
        <div style={{ height: px(f.h * (human ? 0.72 : 1), ppmm) }}>
          <Barcode value={n.value || ''} quiet={Number(el.quietZone ?? 2)} colour={el.barColor || '#141414'} />
        </div>
        {human && (
          <div style={{ fontFamily: cssStack('IBM Plex Mono'), fontSize: px(ptToMm(Math.min(7, f.h * 0.6)), ppmm), textAlign: 'center', lineHeight: 1, marginTop: px(0.4, ppmm) }}>
            {n.value}
          </div>
        )}
      </div>
    );
  }
  if (n.type === 'kvTable' && n.rows) {
    const ls = n.labelStyle || {}, vs = n.valueStyle || {};
    return (
      <div style={{ ...box, overflow: 'hidden' }}>
        {n.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', marginBottom: px(Number(el.rowGap || 0), ppmm) }}>
            <div style={{ width: px(Number(el.labelWidth || 10), ppmm), flex: 'none', ...textCss(ls, ppmm), whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {ls.textTransform === 'upper' ? r.label.toUpperCase() : r.label}
            </div>
            <div style={{ flex: 1, ...textCss(vs, ppmm), whiteSpace: 'nowrap', overflow: 'hidden' }} lang={/[ঀ-৿]/.test(r.value) ? 'bn' : undefined}>{r.value}</div>
          </div>
        ))}
      </div>
    );
  }
  if (n.type === 'image' || n.type === 'signature') {
    return <div style={{ ...box, border: `1px dashed #C4C4C4` }} />;
  }
  return null;
}

export function CardSide({ side, ab, ctx, ppmm, measurer = canvasMeasurer, resolved, bleed, dimmed, className, style }: CardSideProps) {
  const res = React.useMemo(() => resolved || resolveSide(side, ctx, measurer), [resolved, side, ctx, measurer]);
  const b = bleed ? ab.bleed : 0;
  const bg = res.background;
  return (
    <div
      className={className}
      style={{
        position: 'relative', width: px(ab.width + 2 * b, ppmm), height: px(ab.height + 2 * b, ppmm), overflow: 'hidden',
        background: bg.type === 'solid' ? bg.color || '#FFFFFF' : '#FFFFFF', borderRadius: bleed ? 0 : px(ab.radius, ppmm),
        opacity: dimmed ? 0.45 : undefined, filter: dimmed ? 'grayscale(1)' : undefined, flex: 'none', ...style,
      }}
    >
      <div style={{ position: 'absolute', left: px(b, ppmm), top: px(b, ppmm), width: px(ab.width, ppmm), height: px(ab.height, ppmm) }}>
        {[...walkNodes(res.nodes)].map((n) => <NodeView key={n.id} n={n} ppmm={ppmm} />)}
      </div>
    </div>
  );
}

/** A side scaled to fit a box `maxW` × `maxH` px. */
export function CardThumb({ maxW, maxH, ...rest }: Omit<CardSideProps, 'ppmm'> & { maxW: number; maxH: number }) {
  const ppmm = Math.min(maxW / rest.ab.width, maxH / rest.ab.height);
  return <CardSide {...rest} ppmm={ppmm} />;
}
