'use client';

/**
 * Components & structures (docs/frontend/components-n-structures-frontend-done.md):
 * the library a payroll is assembled from. Four tabs -- the component
 * library and its base flags, structure templates, the minimum wage, and
 * bulk revision.
 *
 * Departures from the spec, each from its own defects table (§15): the
 * constants come from the rule book (defect 1); a deduction is a `kind`, not
 * a code prefix (2); the flag grid is a semantic table with a column header
 * per base (4); the effects panel is announced (5); the gloss is #6E6883 (6).
 */

import './paylib.css';
import * as React from 'react';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useSummary } from './hooks';
import { ComponentsTab } from './ComponentsTab';
import { TemplatesTab } from './TemplatesTab';
import { FloorsTab } from './FloorsTab';
import { BulkTab } from './BulkTab';
import type { Tab } from './types';

const TABS: { id: Tab; en: string; bn: string }[] = [
  { id: 'components', en: 'Component library', bn: 'উপাদান' },
  { id: 'templates', en: 'Structure templates', bn: 'কাঠামো' },
  { id: 'floors', en: 'Minimum wage', bn: 'ন্যূনতম মজুরি' },
  { id: 'bulk', en: 'Bulk revision', bn: 'একযোগে সংশোধন' },
];

export function PayLibrary() {
  return (
    <LangProvider>
      <Screen />
    </LangProvider>
  );
}

function Screen() {
  const { lang } = useLang();
  const [tab, setTab] = React.useState<Tab>('components');
  const [gross, setGross] = React.useState('50000');
  const [template, setTemplate] = React.useState('officer');
  const summary = useSummary(gross || '50000', template);
  const s = summary.data;
  const blocked = s?.readiness.blocked.length || 0;
  return (
    <div className="bd pl" lang={lang}>
      <div className="bd-page pl-page">
        <header className="bd-list-head">
          <div className="min-w-[240px] flex-1">
            <h1 className="bd-title !text-[22px]">Components &amp; structures <span lang="bn" className="pl-gloss">বেতনের উপাদান ও কাঠামো</span></h1>
            <p className="bd-lede !max-w-[660px] !text-[12.5px]">
              The library a payroll is assembled from. Each component declares the bases it counts toward; each template states how a gross or a basic is split.
            </p>
          </div>
        </header>
        <nav className="pl-tabs" role="tablist" aria-label="Pay library">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="pl-tab" onClick={() => setTab(t.id)}>
              {lang === 'bn' ? <span lang="bn">{t.bn}</span> : t.en}
              {t.id === 'components' && blocked > 0 && <span className="pl-tab-count" title="Components without a GL account">{blocked}</span>}
            </button>
          ))}
        </nav>
        <div className="pl-body" key={tab}>
          {summary.isLoading ? <LoadingBlock /> : summary.error || !s ? <ErrorBlock error={summary.error} onRetry={() => summary.refetch()} /> : (
            <>
              {tab === 'components' && <ComponentsTab summary={s} gross={gross} setGross={setGross} template={template} setTemplate={setTemplate} />}
              {tab === 'templates' && <TemplatesTab summary={s} />}
              {tab === 'floors' && <FloorsTab />}
              {tab === 'bulk' && <BulkTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
