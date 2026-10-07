'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FIELD_BASE =
  'w-full rounded-v-input border border-v-border bg-white font-jakarta text-[13.5px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-v-ink700">
      {children}
      {required && <span className="text-v-primary"> *</span>}
    </label>
  );
}

/* ── Input ─────────────────────────────────────────────────────────── */

export interface VioletInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  required?: boolean;
  /** Enforce native `required` but hide the label asterisk (e.g. fields the design keeps unmarked). */
  hideRequiredMark?: boolean;
  /** Render a left `$` prefix + right-align the value (tabular). */
  money?: boolean;
  hint?: React.ReactNode;
  wrapClassName?: string;
}

export const VioletInput = React.forwardRef<HTMLInputElement, VioletInputProps>(
  ({ label, required, hideRequiredMark, money, hint, wrapClassName, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const fid = id ?? reactId;
    return (
      <div className={cn('font-jakarta', wrapClassName)}>
        {label && (
          <FieldLabel htmlFor={fid} required={required && !hideRequiredMark}>
            {label}
          </FieldLabel>
        )}
        <div className="relative">
          {money && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-v-ink400">
              $
            </span>
          )}
          <input
            ref={ref}
            id={fid}
            required={required}
            className={cn(
              FIELD_BASE,
              'py-2.5',
              money ? 'pl-7 pr-3.5 text-right tabular-nums' : 'px-3.5',
              className
            )}
            {...props}
          />
        </div>
        {hint && <p className="mt-1 text-[11px] text-v-ink400">{hint}</p>}
      </div>
    );
  }
);
VioletInput.displayName = 'VioletInput';

/* ── Select ────────────────────────────────────────────────────────── */

export interface VioletSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  required?: boolean;
  /** Enforce native `required` but hide the label asterisk. */
  hideRequiredMark?: boolean;
  hint?: React.ReactNode;
  wrapClassName?: string;
}

export const VioletSelect = React.forwardRef<HTMLSelectElement, VioletSelectProps>(
  ({ label, required, hideRequiredMark, hint, wrapClassName, className, id, children, ...props }, ref) => {
    const reactId = React.useId();
    const fid = id ?? reactId;
    return (
      <div className={cn('font-jakarta', wrapClassName)}>
        {label && (
          <FieldLabel htmlFor={fid} required={required && !hideRequiredMark}>
            {label}
          </FieldLabel>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={fid}
            required={required}
            className={cn(FIELD_BASE, 'cursor-pointer appearance-none py-2.5 pl-3.5 pr-8', className)}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-v-ink400" />
        </div>
        {hint && <p className="mt-1 text-[11px] text-v-ink400">{hint}</p>}
      </div>
    );
  }
);
VioletSelect.displayName = 'VioletSelect';

/* ── Textarea ──────────────────────────────────────────────────────── */

export interface VioletTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  required?: boolean;
  /** Enforce native `required` but hide the label asterisk. */
  hideRequiredMark?: boolean;
  hint?: React.ReactNode;
  wrapClassName?: string;
}

export const VioletTextarea = React.forwardRef<HTMLTextAreaElement, VioletTextareaProps>(
  ({ label, required, hideRequiredMark, hint, wrapClassName, className, id, rows = 3, ...props }, ref) => {
    const reactId = React.useId();
    const fid = id ?? reactId;
    return (
      <div className={cn('font-jakarta', wrapClassName)}>
        {label && (
          <FieldLabel htmlFor={fid} required={required && !hideRequiredMark}>
            {label}
          </FieldLabel>
        )}
        <textarea
          ref={ref}
          id={fid}
          required={required}
          rows={rows}
          className={cn(FIELD_BASE, 'resize-y px-3.5 py-2.5', className)}
          {...props}
        />
        {hint && <p className="mt-1 text-[11px] text-v-ink400">{hint}</p>}
      </div>
    );
  }
);
VioletTextarea.displayName = 'VioletTextarea';
