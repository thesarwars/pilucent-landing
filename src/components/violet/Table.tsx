'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * CSS-grid table. `cols` is a grid-template-columns string shared by the head
 * and every row, e.g. `minmax(0,1.4fr) 130px 110px 150px`.
 *
 *   <VTable cols="minmax(0,2fr) 120px 110px">
 *     <VTableHead>
 *       <VTableHeadCell>Account</VTableHeadCell>
 *       <VTableHeadCell align="right">Balance</VTableHeadCell>
 *       …
 *     </VTableHead>
 *     {rows.map((r, i) => (
 *       <VTableRow key={r.id} index={i}>…</VTableRow>
 *     ))}
 *   </VTable>
 */
const ColsContext = React.createContext<string>('');

export interface VTableProps extends React.HTMLAttributes<HTMLDivElement> {
  cols: string;
}

export function VTable({ cols, className, children, ...props }: VTableProps) {
  return (
    <ColsContext.Provider value={cols}>
      <div
        className={cn('overflow-hidden rounded-v-card bg-white font-jakarta shadow-v-card', className)}
        {...props}
      >
        {children}
      </div>
    </ColsContext.Provider>
  );
}

export function VTableHead({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const cols = React.useContext(ColsContext);
  return (
    <div
      className={cn(
        'grid items-center gap-3 border-y border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2',
        className
      )}
      style={{ gridTemplateColumns: cols }}
      {...props}
    >
      {children}
    </div>
  );
}

type Align = 'left' | 'right' | 'center';
const ALIGN: Record<Align, string> = { left: '', right: 'text-right', center: 'text-center' };

export function VTableHeadCell({
  align = 'left',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: Align }) {
  return (
    <div
      className={cn(
        'text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-v-ink400',
        ALIGN[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface VTableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Entrance stagger index. */
  index?: number;
  active?: boolean;
}

export function VTableRow({ index = 0, active, className, children, onClick, style, ...props }: VTableRowProps) {
  const cols = React.useContext(ColsContext);
  return (
    <div
      onClick={onClick}
      className={cn(
        'grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 transition-colors',
        onClick && 'cursor-pointer',
        active
          ? 'bg-v-tint150'
          : 'hover:bg-v-card-subtle hover:shadow-[inset_3px_0_0_#7C4DFF]',
        className
      )}
      style={{ gridTemplateColumns: cols, animationDelay: `${index * 0.04}s`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function VTableCell({
  align = 'left',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: Align }) {
  return (
    <div
      className={cn('min-w-0 text-[13px] text-v-ink900', ALIGN[align], className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Centered empty-state row. */
export function VTableEmpty({
  icon,
  title,
  sub,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-[22px] py-9 text-center', className)}>
      {icon}
      <div className="text-[13px] font-bold text-v-ink700">{title}</div>
      {sub && <div className="text-xs text-v-ink400">{sub}</div>}
    </div>
  );
}
