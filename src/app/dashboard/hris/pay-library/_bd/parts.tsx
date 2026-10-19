'use client';

/** Small pieces the pay library screens share. */

import * as React from 'react';
import { toast } from '@/lib/ToastService';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { DrawerHead, SideDrawer } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useLibInvalidate } from './hooks';

export const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong.');

/** Run a write: busy, the error in place, a toast, and every reading refreshed. */
export function useWrite() {
  const invalidate = useLibInvalidate();
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

export function Drawer({ id, title, sub, onClose, children, width = 520 }: { id: string; title: React.ReactNode; sub?: React.ReactNode; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <SideDrawer onClose={onClose} labelledBy={id} width={width}>
      <DrawerHead id={id} title={title} sub={sub} onClose={onClose} />
      <div className="pl-drawer">{children}</div>
    </SideDrawer>
  );
}

export function Field({ label, htmlFor, children, hint, error }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: React.ReactNode; error?: string | null }) {
  return (
    <div className="bd-field">
      <label className="bd-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <div className="pl-hint">{hint}</div>}
      {error && <div className="bd-error" role="alert">{error}</div>}
    </div>
  );
}

/** A section heading with its always-visible Bangla gloss (§5.2). */
export function SectionTitle({ en, bn, children }: { en: string; bn: string; children?: React.ReactNode }) {
  return (
    <div className="pl-section-head">
      <h2 className="pl-section-title">{en} <span lang="bn" className="pl-gloss">{bn}</span></h2>
      {children && <p className="pl-desc">{children}</p>}
    </div>
  );
}

export const MIN_REASON = 10;
export const todayISO = () => new Date().toISOString().slice(0, 10);
