'use client';

/**
 * Shared pieces for the BD employee screens, on the values in
 * docs/frontend/employee-profile.md (classes in `bd.css`).
 *
 * Inputs carry the prototype's ids (`f-nid`, `f-etin`, ...) because compliance
 * findings and API errors are addressed by them: the client opens the tab and
 * focuses the field (backend §3.3, §9).
 */

import * as React from 'react';
import { AlertCircle, Clock3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloatingActionBar, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import { ApiError } from './api';
import type { Option } from './enums';
import type { Confidence, TabState } from './types';
import './bd.css';

/* ── tones ────────────────────────────────────────────────────────── */

/** The six meanings a chip, note or pill can carry (spec §4.2). */
export type Tone = 'ok' | 'warn' | 'blocked' | 'violet' | 'neutral' | 'bd';

/** The fill/border/ink triple for a tone. A new chip cannot invent a fourth green. */
export const tone = (t: Tone) => `bd-tone-${t}`;

/** A derived fact or a status, as a pill. */
export function Chip({
  tone: t = 'neutral',
  dot,
  icon,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean; icon?: React.ReactNode }) {
  return (
    <span className={cn('bd-chip', tone(t), className)} {...props}>
      {icon ?? (dot ? <span aria-hidden="true" className="bd-chip-dot" /> : null)}
      {children}
    </span>
  );
}

/* ── inputs ───────────────────────────────────────────────────────── */

/** The input class, for the few lists that render their own inputs. */
export const inputClass = (invalid?: boolean) => cn('bd-input', invalid && 'is-invalid');

/** What a `Field` tells the control inside it: its id and what describes it. */
const FieldContext = React.createContext<{ id?: string; describedBy?: string; invalid: boolean; required?: boolean }>({
  invalid: false,
});

/** id, `aria-describedby` and `aria-invalid` for a control inside a `Field`. */
function useControl(id: string | undefined, invalid: boolean | undefined) {
  const ctx = React.useContext(FieldContext);
  const bad = !!invalid || ctx.invalid;
  return {
    id: id ?? ctx.id,
    'aria-describedby': ctx.describedBy,
    'aria-invalid': bad || undefined,
    'aria-required': ctx.required || undefined,
  };
}

type InputBase = { id?: string; invalid?: boolean; className?: string };

export function TextInput({
  id,
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
      {...useControl(id, invalid)}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn('bd-input', className)}
    />
  );
}

export function DateInput({
  id,
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
      {...useControl(id, invalid)}
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn('bd-input', className)}
    />
  );
}

export function SelectInput({
  id,
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
      {...useControl(id, invalid)}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn('bd-input', className)}
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
  id,
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
      {...useControl(id, invalid)}
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn('bd-input', className)}
    />
  );
}

/** A checkbox drawn to match the inputs. */
export function Checkbox({
  id,
  checked,
  onChange,
  children,
}: {
  id?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <button id={id} type="button" role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)} className="bd-check">
      <span className="bd-check-box" aria-hidden="true">
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5 9-10" />
          </svg>
        )}
      </span>
      {children}
    </button>
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
        aria-label={typeof label === 'string' ? undefined : title}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-[22px] w-10 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4DFF]',
          checked ? 'bg-[#7C4DFF]' : 'bg-[rgba(22,23,42,0.16)]',
          disabled && 'cursor-not-allowed opacity-45'
        )}
      >
        <span
          className="absolute top-[2.5px] h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all duration-200"
          style={{ left: checked ? '21px' : '2.5px' }}
        />
      </button>
      {label && <span className="text-[12.5px] font-semibold text-[#44405C]">{label}</span>}
    </div>
  );
}

/* ── layout ───────────────────────────────────────────────────────── */

/** Six columns; a field spans 2 (a third), 3 (half), 4 or 6. Spans sum to 6 per row. */
export function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bd-grid', className)}>{children}</div>;
}

/** An empty cell, to end a row early. */
export function Gap({ span }: { span: 1 | 2 | 3 | 4 }) {
  return <span aria-hidden="true" className={`bd-span-${span} max-md:hidden`} />;
}

/**
 * One field, top to bottom: label row (label, required mark, clock), the
 * control, derived chips (announced politely), help, error. The control
 * inside is wired to the help and error by `aria-describedby`.
 */
export function Field({
  htmlFor,
  label,
  required,
  span = 2,
  help,
  errors,
  chips,
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
  /** Derived consequences of the value: `34 years old`, `Senior citizen (65+)`. */
  chips?: React.ReactNode;
  onClock?: () => void;
  suggested?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const auto = React.useId();
  const id = htmlFor ?? `bd-field${auto}`;
  const hasError = !!errors && errors.length > 0;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = hasError ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  const ctx = React.useMemo(() => ({ id, describedBy, invalid: hasError, required }), [id, describedBy, hasError, required]);

  return (
    <div className={cn('bd-field', `bd-span-${span}`, className)}>
      <div className="bd-label-row">
        <label htmlFor={id} className="bd-label">
          {label}
        </label>
        {required && (
          <span className="bd-req" aria-hidden="true">
            *
          </span>
        )}
        {suggested && <Chip tone="violet" className="!px-2 !py-0 !text-[10px]">Suggested</Chip>}
        {onClock && (
          <button type="button" onClick={onClock} title="View change timeline" aria-label="View change timeline" className="bd-clock">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </button>
        )}
      </div>
      <FieldContext.Provider value={ctx}>{children}</FieldContext.Provider>
      <div className="bd-chips" aria-live="polite">
        {chips}
      </div>
      {help && (
        <div id={helpId} className="bd-help">
          {help}
        </div>
      )}
      {hasError && (
        <div id={errorId} className="bd-error">
          <AlertCircle aria-hidden="true" className="mt-px h-3 w-3 shrink-0" />
          <span>{errors.join(' ')}</span>
        </div>
      )}
    </div>
  );
}

/** A section card: title, a one-line description, and an optional right slot. */
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
    <section id={id} tabIndex={id ? -1 : undefined} className={cn('bd-section outline-none', className)}>
      <div className="bd-section-head">
        <div className="min-w-0 flex-1">
          <h2 className="bd-section-title">{title}</h2>
          {desc && <p className="bd-section-desc">{desc}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/** The old tone names the tabs use, on the spec's six. */
const NOTE_TONE: Record<string, Tone> = {
  violet: 'violet',
  warn: 'warn',
  danger: 'blocked',
  success: 'ok',
  neutral: 'neutral',
  teal: 'bd',
  rose: 'blocked',
};

/** A tinted note: info, warn, danger or success. */
export function Note({
  tone: t = 'violet',
  children,
  className,
  icon = true,
}: {
  tone?: keyof typeof NOTE_TONE;
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}) {
  return (
    <div className={cn('bd-note', tone(NOTE_TONE[t] ?? 'violet'), className)}>
      {icon && <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Citation({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <div className="mt-3 text-[11px] font-medium text-[#6E6883]">{children}</div>;
}

/* ── status ───────────────────────────────────────────────────────── */

/** Four states that differ by more than colour: filled, tinted, hollow, filled with `!` (§9.1). */
export const TAB_STATE: Record<TabState, { dot: string; ring: string; glyph: string; title: string }> = {
  complete: { dot: '#1FA97A', ring: '#1FA97A', glyph: '', title: 'Complete' },
  partial: { dot: 'rgba(245,178,46,0.25)', ring: '#F5B22E', glyph: '', title: 'Partly filled' },
  empty: { dot: 'transparent', ring: 'rgba(22,23,42,0.22)', glyph: '', title: 'Empty' },
  blocked: { dot: '#F43F5E', ring: '#F43F5E', glyph: '!', title: 'Blocks payroll' },
};

export function TabDot({ state }: { state: TabState }) {
  const s = TAB_STATE[state] ?? TAB_STATE.empty;
  return (
    <span title={s.title} className="bd-dot" style={{ background: s.dot, borderColor: s.ring }}>
      <span aria-hidden="true">{s.glyph}</span>
      <span className="sr-only">{s.title}</span>
    </span>
  );
}

const CONFIDENCE_TONE: Record<Confidence, Tone> = {
  DRAFTED: 'warn',
  DISPUTED: 'blocked',
  CORROBORATED: 'bd',
  VERIFIED: 'ok',
  LIVE: 'neutral',
};

/** How sure the rule book is. Below VERIFIED it may be shown, never released. */
export function ConfidenceTag({ value }: { value: Confidence | null | undefined }) {
  if (!value || value === 'LIVE') return null;
  return (
    <Chip tone={CONFIDENCE_TONE[value]} className="!px-2 !py-0 !text-[10px] uppercase tracking-[0.04em]">
      {value.toLowerCase()}
    </Chip>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={cn('h-4 w-4 animate-spin text-[#7C4DFF]', className)} />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-[13px] font-semibold text-[#6F6A85]">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong.';
  return (
    <div role="alert" className="bd-section text-center">
      <div className="text-sm font-bold">This could not be loaded</div>
      <div className="mt-1 text-[12.5px] text-[#6F6A85]">{message}</div>
      {onRetry && (
        <button type="button" className="bd-btn mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/* ── focus routing ────────────────────────────────────────────────── */

/**
 * Scroll a field into view, focus it, and pulse a ring round it for 1.1s
 * (§10.6) — without it, a user sent to a 14-field tab cannot tell which was meant.
 */
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
    const off = { boxShadow: '0 0 0 0 rgba(124,77,255,0)' };
    const on = { boxShadow: '0 0 0 4px rgba(124,77,255,0.35)' };
    el.animate?.(
      [
        { ...off, offset: 0 },
        { ...on, offset: 0.3 },
        { ...on, offset: 0.7 },
        { ...off, offset: 1 },
      ],
      { duration: 1100 }
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
