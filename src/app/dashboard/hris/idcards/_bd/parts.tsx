'use client';

/** Small pieces the ID card screens share. */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import type { Finding } from './engine';
import { useIdInvalidate } from './hooks';
import type { EffectiveStatus, Job } from './types';

/** Card status palette, from the design (`statusOf`). */
export const STATUS: Record<string, { label: string; icon: string; fg: string; bg: string }> = {
  ACTIVE: { label: 'Active', icon: '✓', fg: '#1F7A4C', bg: '#E7F4ED' },
  ISSUED: { label: 'Issued', icon: '●', fg: '#0A5677', bg: '#E9F2F7' },
  DRAFT: { label: 'Draft', icon: '○', fg: '#5C5C5C', bg: '#F0F0F0' },
  NOT_ISSUED: { label: 'Not issued', icon: '○', fg: '#5C5C5C', bg: '#F0F0F0' },
  EXPIRING: { label: 'Expiring', icon: '◔', fg: '#96600A', bg: '#FBF1DF' },
  EXPIRED: { label: 'Expired', icon: '⊘', fg: '#9C3A2B', bg: '#FAEBE8' },
  LOST: { label: 'Lost', icon: '?', fg: '#7A4A94', bg: '#F4EEF8' },
  REVOKED: { label: 'Revoked', icon: '✕', fg: '#8C2020', bg: '#FBE9E9' },
  REPLACED: { label: 'Replaced', icon: '↻', fg: '#5C5C5C', bg: '#F0F0F0' },
};

export const JOB_STATUS: Record<Job['status'], { label: string; icon: string; fg: string; bg: string }> = {
  QUEUED: { label: 'Queued', icon: '…', fg: '#5C5C5C', bg: '#F0F0F0' },
  RENDERING: { label: 'Rendering', icon: '◔', fg: '#0A5677', bg: '#E9F2F7' },
  READY: { label: 'Ready', icon: '✓', fg: '#1F7A4C', bg: '#E7F4ED' },
  PRINTED: { label: 'Printed', icon: '✓', fg: '#1F1F1F', bg: '#EBEBEB' },
  FAILED: { label: 'Failed', icon: '✕', fg: '#8C2020', bg: '#FBE9E9' },
  CANCELLED: { label: 'Cancelled', icon: '–', fg: '#5C5C5C', bg: '#F0F0F0' },
  EXPIRED: { label: 'Expired', icon: '⊘', fg: '#5C5C5C', bg: '#F0F0F0' },
};

export function StatusPill({ status, palette = STATUS }: { status: EffectiveStatus | Job['status'] | string; palette?: Record<string, { label: string; icon: string; fg: string; bg: string }> }) {
  const s = palette[status] || STATUS.NOT_ISSUED;
  return (
    <span className="idc-status" style={{ background: s.bg, color: s.fg }}>
      <span aria-hidden="true">{s.icon}</span> {s.label}
    </span>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : iso;
}
export function fmtWhen(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${fmtDate(iso.slice(0, 10))}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong.');

/** Run a write: busy state, the error in place, a toast, and every reading refreshed behind it. */
export function useWrite() {
  const invalidate = useIdInvalidate();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [consequence, setConsequence] = React.useState<Record<string, unknown> | null>(null);
  const run = async <T,>(fn: () => Promise<T>, done?: string | ((out: T) => string)): Promise<T | null> => {
    setBusy(true);
    setError(null);
    setConsequence(null);
    try {
      const out = await fn();
      void invalidate();
      if (done) toast.success(typeof done === 'function' ? done(out) : done);
      return out;
    } catch (err) {
      setError(errorText(err));
      if (err instanceof ApiError) setConsequence(err.consequence);
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error, setError, consequence };
}

/** Findings, errors first; an `aria-live` region so a screen reader hears them (§17 defect 3). */
export function Findings({ findings, onJump, empty = 'No findings: the card is ready to print.', limit }: {
  findings: Finding[]; onJump?: (f: Finding) => void; empty?: string; limit?: number;
}) {
  const sorted = [...findings].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
  const shown = limit ? sorted.slice(0, limit) : sorted;
  return (
    <div aria-live="polite">
      {!sorted.length ? (
        <div className="idc-banner ok">{empty}</div>
      ) : (
        <div className="idc-panel" style={{ overflow: 'hidden' }}>
          {shown.map((f, i) => (
            <div key={i} className={`idc-finding ${f.severity}`}>
              <span className="sev">{f.severity}</span>
              <span style={{ minWidth: 0 }}>
                {f.message}
                <span className="idc-muted"> · {f.side}</span>
              </span>
              {onJump && f.elementId && (
                <button type="button" className="idc-btn sm ghost jump" onClick={() => onJump(f)}>Show</button>
              )}
            </div>
          ))}
          {limit && sorted.length > limit && <div className="idc-finding"><span className="idc-muted">{sorted.length - limit} more…</span></div>}
        </div>
      )}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide }: {
  title: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="idc-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`idc-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="idc-modal-h">
          <h2 className="idc-h1">{title}</h2>
          <span className="idc-spacer" />
          <button type="button" className="idc-btn icon ghost" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="idc-modal-b">{children}</div>
        {footer && <div className="idc-modal-f">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Field({ label, children, hint, error, htmlFor }: { label: string; children: React.ReactNode; hint?: React.ReactNode; error?: string | null; htmlFor?: string }) {
  return (
    <div className="idc-field">
      <label className="idc-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <div className="idc-hint">{hint}</div>}
      {error && <div className="idc-error-text">{error}</div>}
    </div>
  );
}

/** A millimetre (or point) input: typed as text so 0.5 and -2 edit cleanly; commits on blur and Enter. */
export function Dim({ label, value, unit = 'mm', step = 0.1, onChange, disabled, title }: {
  label: string; value: number; unit?: string; step?: number; onChange: (v: number) => void; disabled?: boolean; title?: string;
}) {
  const [text, setText] = React.useState(String(round(value)));
  React.useEffect(() => setText(String(round(value))), [value]);
  const commit = () => {
    const v = parseFloat(text);
    if (Number.isFinite(v) && v !== value) onChange(round(v));
    else setText(String(round(value)));
  };
  return (
    <label className="idc-dim" title={title}>
      <span>{label}</span>
      <input value={text} disabled={disabled} inputMode="decimal" aria-label={title || label}
        onChange={(e) => setText(e.target.value)} onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const d = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? step * 10 : step);
            onChange(round((parseFloat(text) || 0) + d));
          }
        }} />
      <em>{unit}</em>
    </label>
  );
}
const round = (v: number) => Math.round(v * 100) / 100;

/** A reason, at least ten characters: the server refuses less (§5.4). */
export function ReasonModal({ title, intro, action, danger, busy, error, onClose, onConfirm }: {
  title: string; intro: React.ReactNode; action: string; danger?: boolean; busy?: boolean; error?: string | null;
  onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState('');
  const short = reason.trim().length < 10;
  return (
    <Modal title={title} onClose={onClose} footer={
      <>
        <button type="button" className="idc-btn" onClick={onClose}>Cancel</button>
        <button type="button" className={`idc-btn ${danger ? 'danger solid' : 'primary'}`} disabled={short || busy} onClick={() => onConfirm(reason.trim())}>
          {busy ? 'Working…' : action}
        </button>
      </>
    }>
      <div className="idc-small" style={{ lineHeight: 1.5 }}>{intro}</div>
      <Field label="Reason" htmlFor="idc-reason" hint={`Recorded in the card's audit. ${Math.max(0, 10 - reason.trim().length) || 'Enough'}${short ? ' more characters needed.' : '.'}`} error={error}>
        <textarea id="idc-reason" className="idc-textarea" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </Field>
    </Modal>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="idc-empty">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--idc-ink)' }}>{title}</div>
      {children && <div className="idc-small" style={{ maxWidth: 520, margin: '6px auto 0', lineHeight: 1.5 }}>{children}</div>}
    </div>
  );
}

export function Loading({ what = 'Loading' }: { what?: string }) {
  return <div className="idc-empty idc-small">{what}…</div>;
}

export function Check({ on, onClick, label }: { on: boolean; onClick: (e: React.MouseEvent) => void; label: string }) {
  return (
    <button type="button" className={`idc-box${on ? ' on' : ''}`} aria-pressed={on} aria-label={label} onClick={(e) => { e.stopPropagation(); onClick(e); }}>
      {on && <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
    </button>
  );
}
