'use client';

/** Small pieces the leave console shares. */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { fmtDays, spendableShown, type Tone } from './defs';
import { useLeaveInvalidate } from './hooks';
import type { Position } from './types';

export function Tag({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn('lc-tag', `lc-tone-${tone}`, className)}>{children}</span>;
}

export function Note({ tone = 'violet', children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <div className={cn('lc-note', `lc-tone-${tone}`, className)}>{children}</div>;
}

/** §6.3: the spendable figure large, the decomposition beneath. Never the ledger balance alone. */
export function Figure({ p, align = 'left' }: { p: Position | undefined; align?: 'left' | 'right' }) {
  if (!p) return <span className="lc-sub">—</span>;
  if (!p.eligible) {
    return (
      <span className="lc-sub" title={p.reason ?? undefined}>
        Not entitled
      </span>
    );
  }
  const s = spendableShown(p);
  return (
    <span className={cn('block', align === 'right' && 'text-right')}>
      <span className="lc-fig-big" style={{ color: Number(p.spendable) < 0 ? '#BE123C' : undefined }}>
        {s.figure}
      </span>
      <span className="lc-sub block">{s.note}</span>
    </span>
  );
}

/** `2 days available — 7 on the ledger, 5 booked ahead` (§9.1): the position before the action. */
export function PositionLine({ text, p }: { text: string; p?: Position }) {
  return (
    <div className="lc-position" aria-live="polite">
      {text}
      {p && !p.eligible && p.reason && <div className="lc-sub mt-1">{p.reason}</div>}
    </div>
  );
}

export function Field({ label, htmlFor, children, error, hint }: { label: string; htmlFor?: string; children: React.ReactNode; error?: string | null; hint?: React.ReactNode }) {
  return (
    <div className="lc-field">
      <label htmlFor={htmlFor} className="lc-label">
        {label}
      </label>
      {children}
      {hint && <div className="lc-caption">{hint}</div>}
      {error && <div className="lc-error">{error}</div>}
    </div>
  );
}

export const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong.');

/** Run a write: busy state, the error in place, a toast, and the console refreshed behind it. */
export function useWrite() {
  const invalidate = useLeaveInvalidate();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const run = async <T,>(fn: () => Promise<T>, done?: string | ((out: T) => string)): Promise<T | null> => {
    setBusy(true);
    setError(null);
    try {
      const out = await fn();
      void invalidate();
      if (done) toast.success(typeof done === 'function' ? done(out) : done);
      return out;
    } catch (err) {
      setError(errorText(err));
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { run, busy, error, setError };
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="lc-card px-5 py-12 text-center">
      <div className="text-[15px] font-bold">{title}</div>
      {children && <div className="lc-caption mx-auto mt-1 max-w-[520px]">{children}</div>}
    </div>
  );
}

export const days = fmtDays;
