'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VioletButton } from './Button';

export interface Crumb {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <div
      className={cn(
        'flex animate-v-rise items-center gap-2 font-jakarta text-[12.5px] text-v-ink500',
        className
      )}
    >
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-v-ink400">›</span>}
            {last ? (
              <span className="font-semibold text-v-ink900">{c.label}</span>
            ) : (
              <a
                href={c.href}
                onClick={c.onClick}
                className="cursor-pointer transition-colors hover:text-v-ink900"
              >
                {c.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export interface PageHeaderProps {
  crumbs?: Crumb[];
  title: React.ReactNode;
  /** Renders a glass back button before the title. */
  onBack?: () => void;
  /** Status chips after the title. */
  chips?: React.ReactNode;
  /** Right-aligned actions / hint. */
  right?: React.ReactNode;
  /** Optional descriptive line under the title row. */
  sub?: React.ReactNode;
  className?: string;
}

export function PageHeader({ crumbs, title, onBack, chips, right, sub, className }: PageHeaderProps) {
  return (
    <div className={cn('font-jakarta', className)}>
      {crumbs && crumbs.length > 0 && <Breadcrumb items={crumbs} />}
      <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
        {onBack && (
          <VioletButton variant="secondary" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft className="h-[15px] w-[15px]" />
          </VioletButton>
        )}
        <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
          {title}
        </h1>
        {chips}
        {right != null && (
          <>
            <span className="flex-1" />
            {right}
          </>
        )}
      </div>
      {sub && <p className="mt-2 text-[13.5px] text-v-ink500">{sub}</p>}
    </div>
  );
}
