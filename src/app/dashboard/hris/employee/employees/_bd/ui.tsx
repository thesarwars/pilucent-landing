'use client';

/**
 * Shared pieces for the BD employee screens, on the Violet Suite tokens.
 *
 * Inputs carry the prototype's ids (`f-nid`, `f-etin`, ...) because compliance
 * findings and API errors are addressed by them: the client opens the tab and
 * focuses the field (backend §3.3, §9).
 */

import * as React from 'react';
import { AlertCircle, Clock3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chip, FloatingActionBar, VioletButton, type VioletTone } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import { ApiError } from './api';
import type { Option } from './enums';
import type { Confidence, TabState } from './types';

/* ── inputs ───────────────────────────────────────────────────────── */

export const inputClass = (invalid?: boolean) =>
  cn(
    'w-full rounded-v-input border bg-white px-3.5 py-2.5 font-jakarta text-[13.5px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 disabled:cursor-not-allowed disabled:bg-v-wash disabled:text-v-ink400 focus:shadow-[0_0_0_3px_#EEE9FF]',
    invalid ? 'border-[#F43F5E] focus:border-[#F43F5E]' : 'border-v-border focus:border-v-primary'
  );

type InputBase = { id?: string; invalid?: boolean; className?: string };

export function TextInput({
  value,
  onChange,
  invalid,
  className,
  ...props
}: InputBase & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string | null | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <input
      {...props}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass(invalid), className)}
    />
  );
}

export function DateInput({
  value,
  onChange,
  invalid,
  className,
  ...props
}: InputBase & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}) {
  return (
    <input
      {...props}
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn(inputClass(invalid), 'font-mono text-[13px]', className)}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  invalid,
  className,
  ...props
}: InputBase & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> & {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string | null;
}) {
  const hasBlank = options.some((o) => o.value === '');
  return (
    <select
      {...props}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass(invalid), 'cursor-pointer appearance-none pr-8', className)}
    >
      {!hasBlank && placeholder !== null && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  value,
  onChange,
  invalid,
  className,
  rows = 2,
  ...props
}: InputBase & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string | null | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      {...props}
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass(invalid), 'resize-y', className)}
    />
  );
}

/** Switch row: a toggle with its state label beside it. */
export function SwitchRow({
  id,
  checked,
  onChange,
  label,
  disabled,
  title,
}: {
  id?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5" title={title}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-[22px] w-10 shrink-0 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-v-tint100',
          checked ? 'bg-v-primary' : 'bg-[rgba(22,23,42,0.16)]',
          disabled && 'cursor-not-allowed opacity-45'
        )}
      >
        <span
          className="absolute top-[2.5px] h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all duration-200"
          style={{ left: checked ? '21px' : '2.5px' }}
        />
      </button>
      {label && <span className="text-[12.5px] font-semibold text-v-ink700">{label}</span>}
    </div>
  );
}

/* ── layout ───────────────────────────────────────────────────────── */

const SPAN: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  6: 'md:col-span-6',
};

export function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-6', className)}>{children}</div>;
}

/** Label, input, help and errors for one field. */
export function Field({
  htmlFor,
  label,
  required,
  span = 2,
  help,
  errors,
  onClock,
  suggested,
  children,
  className,
}: {
  htmlFor?: string;
  label: React.ReactNode;
  required?: boolean;
  span?: 1 | 2 | 3 | 4 | 6;
  help?: React.ReactNode;
  errors?: string[];
  onClock?: () => void;
  suggested?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', SPAN[span], className)}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-v-ink700">
          {label}
        </label>
        {required && (
          <span aria-hidden="true" className="text-xs font-bold text-v-primary">
            *
          </span>
        )}
        {suggested && (
          <span className="rounded-full bg-v-tint100 px-2 py-px text-[10px] font-bold text-v-primary">Suggested</span>
        )}
        {onClock && (
          <button
            type="button"
            onClick={onClock}
            title="View change timeline"
            aria-label="View change timeline"
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-[8px] text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary"
          >
            <Clock3 className="h-[13px] w-[13px]" />
          </button>
        )}
      </div>
      {children}
      {errors && errors.length > 0 ? (
        <div role="alert" className="mt-1.5 flex items-start gap-1.5 text-[11.5px] font-semibold text-[#E11D48]">
          <AlertCircle className="mt-px h-3 w-3 shrink-0" />
          <span>{errors.join(' ')}</span>
        </div>
      ) : (
        help && <div className="mt-1.5 text-[11.5px] leading-snug text-v-ink400">{help}</div>
      )}
    </div>
  );
}

/** White card with a title and a one-line description. */
export function Section({
  title,
  desc,
  right,
  children,
  className,
  id,
}: {
  title: React.ReactNode;
  desc?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn('rounded-v-card bg-white p-[22px] font-jakarta shadow-v-card', className)}>
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em] text-v-ink900">{title}</h2>
          {desc && <p className="mt-1 text-[12.5px] leading-relaxed text-v-ink500">{desc}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/** A tinted note: info, warn, danger or success. */
export function Note({
  tone = 'violet',
  children,
  className,
  icon = true,
}: {
  tone?: VioletTone;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  const tones: Record<string, string> = {
    violet: 'bg-[rgba(124,77,255,0.07)] border-[rgba(124,77,255,0.22)] text-[#5A2BE0]',
    warn: 'bg-[rgba(245,178,46,0.1)] border-[rgba(245,178,46,0.3)] text-[#8A5A06]',
    danger: 'bg-[rgba(244,63,94,0.07)] border-[rgba(244,63,94,0.26)] text-[#E11D48]',
    success: 'bg-[rgba(31,169,122,0.1)] border-[rgba(31,169,122,0.28)] text-[#157A5B]',
    neutral: 'bg-[rgba(22,23,42,0.045)] border-[rgba(22,23,42,0.11)] text-v-ink700',
  };
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-semibold leading-relaxed',
        tones[tone] ?? tones.violet,
        className
      )}
    >
      {icon && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Citation({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <div className="mt-3 text-[11px] font-medium text-v-ink400">{children}</div>;
}

/* ── status ───────────────────────────────────────────────────────── */

export const TAB_STATE: Record<TabState, { dot: string; ring: string; glyph: string; title: string }> = {
  complete: { dot: '#1FA97A', ring: '#1FA97A', glyph: '', title: 'Complete' },
  partial: { dot: 'rgba(245,178,46,0.25)', ring: '#F5B22E', glyph: '', title: 'Partly filled' },
  empty: { dot: 'transparent', ring: 'rgba(22,23,42,0.22)', glyph: '', title: 'Empty' },
  blocked: { dot: '#F43F5E', ring: '#F43F5E', glyph: '!', title: 'Blocks payroll' },
};

export function TabDot({ state }: { state: TabState }) {
  const s = TAB_STATE[state] ?? TAB_STATE.empty;
  return (
    <span
      title={s.title}
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[9px] font-extrabold leading-none text-white"
      style={{ background: s.dot, borderColor: s.ring }}
    >
      {s.glyph}
    </span>
  );
}

const CONFIDENCE_TONE: Record<Confidence, VioletTone> = {
  DRAFTED: 'warn',
  DISPUTED: 'rose',
  CORROBORATED: 'teal',
  VERIFIED: 'success',
  LIVE: 'neutral',
};

/** How sure the rule book is. Below VERIFIED it may be shown, never released. */
export function ConfidenceTag({ value }: { value: Confidence | null | undefined }) {
  if (!value || value === 'LIVE') return null;
  return (
    <Chip tone={CONFIDENCE_TONE[value]} className="px-2 py-px text-[10px] uppercase tracking-[0.04em]">
      {value.toLowerCase()}
    </Chip>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin text-v-primary', className)} />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-[13px] font-semibold text-v-ink400">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong.';
  return (
    <div className="rounded-v-card bg-white p-8 text-center shadow-v-card">
      <div className="text-sm font-bold text-v-ink900">This could not be loaded</div>
      <div className="mt-1 text-[12.5px] text-v-ink500">{message}</div>
      {onRetry && (
        <VioletButton variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </VioletButton>
      )}
    </div>
  );
}

/* ── focus routing ────────────────────────────────────────────────── */

/** Scroll a field into view, focus it, and flash a ring around it. */
export function focusField(id: string | null | undefined) {
  if (!id) return;
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id) as HTMLElement | null;
    if (!el) {
      if (tries++ < 20) window.setTimeout(attempt, 60);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
    el.animate(
      [
        { boxShadow: '0 0 0 0 rgba(124,77,255,0)' },
        { boxShadow: '0 0 0 4px rgba(124,77,255,0.35)' },
        { boxShadow: '0 0 0 0 rgba(124,77,255,0)' },
      ],
      { duration: 1400 }
    );
  };
  attempt();
}

/* ── section forms ────────────────────────────────────────────────── */

type Errors = Record<string, string[]>;

function errorsFrom(err: ApiError): Errors {
  const out: Errors = {};
  for (const e of err.errors) {
    out[e.path] = [...(out[e.path] ?? []), ...e.messages];
    if (e.field && e.field !== e.path) out[e.field] = out[e.path];
  }
  return out;
}

/**
 * Draft state for one PATCHed section. `values` start from the server copy
 * and reset to it whenever the server copy changes and nothing is unsaved.
 * `submit` sends only the changed keys; a refusal maps errors onto keys.
 */
export function useSectionForm<T extends Record<string, any>>(
  server: T,
  save: (changes: Partial<T>) => Promise<unknown>,
  { successMessage = 'Saved' }: { successMessage?: string } = {}
) {
  const [values, setValues] = React.useState<T>(server);
  const [errors, setErrors] = React.useState<Errors>({});
  const [saving, setSaving] = React.useState(false);
  const serverJson = JSON.stringify(server);

  const changes = React.useMemo(() => {
    const out: Partial<T> = {};
    for (const key of Object.keys(values) as (keyof T)[]) {
      if (JSON.stringify(values[key]) !== JSON.stringify(server[key])) out[key] = values[key];
    }
    return out;
     
  }, [values, serverJson]);
  const dirty = Object.keys(changes).length > 0;

  React.useEffect(() => {
    if (!dirty) setValues(server);
     
  }, [serverJson]);

  const set = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }, []);

  const submit = async () => {
    if (!dirty) return true;
    setSaving(true);
    try {
      await save(changes);
      setErrors({});
      toast.success(successMessage);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(errorsFrom(err));
        const first = err.errors[0];
        if (first) focusField(first.field);
        else toast.error(err.message);
      } else {
        toast.error('Something went wrong. Try again.');
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setValues(server);
    setErrors({});
  };

  return { values, set, changes, dirty, errors, saving, submit, reset, setValues };
}

/** The dark sticky bar that appears while a section has unsaved changes. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  label = 'Unsaved changes',
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  label?: string;
}) {
  if (!dirty) return null;
  return (
    <FloatingActionBar label="Edit" value={label} className="mt-4">
      <VioletButton variant="ghost" size="sm" className="text-white/70 hover:text-white" onClick={onDiscard} disabled={saving}>
        Discard
      </VioletButton>
      <VioletButton size="sm" onClick={onSave} disabled={saving} leftIcon={saving ? <Spinner className="text-white" /> : undefined}>
        Save changes
      </VioletButton>
    </FloatingActionBar>
  );
}

/** Errors for a key, by payload path or UI id. */
export const errs = (errors: Errors, ...keys: string[]) => keys.flatMap((k) => errors[k] ?? []);
