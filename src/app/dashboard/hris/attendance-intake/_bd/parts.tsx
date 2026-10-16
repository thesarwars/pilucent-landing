'use client';

/** Small pieces the intake screens share. */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { DrawerHead, SideDrawer } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { SEVERITY } from './defs';
import { useIntakeInvalidate } from './hooks';
import type { FindingGroup } from './types';

export function Tag({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`ai-tag ai-tone-${tone}`}>{children}</span>;
}

export const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong.');

/** Run a write: busy, the error in place (with what the server said it would have done), a toast, and a refresh. */
export function useWrite() {
  const invalidate = useIntakeInvalidate();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [consequence, setConsequence] = React.useState<Record<string, unknown> | null>(null);
  /** `onRefused` sees an `ApiError` first; returning true means it was handled (no inline error). */
  const run = async <T,>(fn: () => Promise<T>, done?: string | ((out: T) => string), onRefused?: (err: ApiError) => boolean): Promise<T | null> => {
    setBusy(true);
    setError(null);
    setConsequence(null);
    try {
      const out = await fn();
      void invalidate();
      if (done) toast.success(typeof done === 'function' ? done(out) : done);
      return out;
    } catch (err) {
      if (err instanceof ApiError && onRefused?.(err)) return null;
      setError(errorText(err));
      if (err instanceof ApiError) setConsequence(err.consequence);
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error, setError, consequence, clear: () => { setError(null); setConsequence(null); } };
}

/** Numbers through the shell's numeral setting; storage stays Latin (§10). */
export function useNum() {
  const { n } = useLang();
  return (v: number | string | null | undefined) => (v === null || v === undefined ? '—' : n(String(v)));
}

export function Field({ label, htmlFor, children, hint, error }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: React.ReactNode; error?: string | null }) {
  return (
    <div className="ai-field">
      <label className="ai-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <div className="ai-caption">{hint}</div>}
      {error && <div className="ai-error" role="alert">{error}</div>}
    </div>
  );
}

/** One finding: title, severity pill, count, and -- always -- what will happen, in words (§4.1). */
export function FindingCard({ g, action }: { g: FindingGroup; action?: React.ReactNode }) {
  const [open, setOpen] = React.useState(g.severity === 'BLOCKS');
  const num = useNum();
  const s = SEVERITY[g.severity];
  return (
    <div className={`ai-finding ai-finding-${s.tone}`}>
      <div className="ai-finding-head">
        <span className="ai-finding-title">{g.title}</span>
        <Tag tone={s.tone}>{s.label}</Tag>
        <span className="ai-mono ai-finding-count">{num(g.count)}</span>
        <span className="ai-spacer" />
        {action}
        <button type="button" className="ai-link" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</button>
      </div>
      <div className="ai-finding-behaviour">{g.behaviour}</div>
      {open && (
        <ul className="ai-finding-items">
          {g.items.map((it, i) => (
            <li key={i}><span className="ai-mono">{it.label}</span> <span className="ai-caption">· {it.detail}</span></li>
          ))}
          {g.count > g.items.length && <li className="ai-caption">and {num(g.count - g.items.length)} more</li>}
        </ul>
      )}
    </div>
  );
}

export function Drawer({ id, title, sub, onClose, children, width = 520 }: { id: string; title: React.ReactNode; sub?: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <SideDrawer onClose={onClose} labelledBy={id} width={width}>
      <DrawerHead id={id} title={title} sub={sub} onClose={onClose} />
      <div className="ai-drawer-body">{children}</div>
    </SideDrawer>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="ai-card ai-empty">
      <div className="ai-empty-title">{title}</div>
      {children && <div className="ai-caption" style={{ maxWidth: 520, margin: '4px auto 0' }}>{children}</div>}
    </div>
  );
}

export function Stat({ label, value, accent, sub }: { label: string; value: React.ReactNode; accent: string; sub?: React.ReactNode }) {
  return (
    <div className="ai-stat" style={{ borderLeftColor: accent }}>
      <div className="ai-stat-caption">{label}</div>
      <div className="ai-stat-figure ai-mono">{value}</div>
      {sub && <div className="ai-caption">{sub}</div>}
    </div>
  );
}
