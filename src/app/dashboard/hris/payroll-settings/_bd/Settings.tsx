'use client';

/**
 * Payroll settings (docs/frontend/payroll-settings-done.md): the seven
 * decisions a Bangladeshi payroll cannot run without, and the schemes it
 * runs under. Five tabs -- elections, schedule, schemes, accounts, changelog.
 *
 * Departures from the spec, each from its own defects table (§15): every
 * consequence comes from the live roster (defect 1); the s.123 deadline from
 * the establishment's published calendar (2); GL accounts are the company's
 * chart of accounts (3); figures are announced (4); the proration example is
 * a real 31-day month (5); the shell is the house BD shell (6); the
 * breadcrumb carries its Bangla gloss (7); the gloss ink is #6E6883 (8).
 */

import '@/app/dashboard/hris/pay-library/_bd/paylib.css';
import './payset.css';
import * as React from 'react';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useSummary } from './hooks';
import { ElectionsTab } from './ElectionsTab';
import { ScheduleTab } from './ScheduleTab';
import { SchemesTab } from './SchemesTab';
import { AccountsTab } from './AccountsTab';
import { ChangelogTab } from './ChangelogTab';
import type { Summary, Tab } from './types';

const TABS: { id: Tab; en: string; bn: string }[] = [
  { id: 'elections', en: 'Elections', bn: 'নির্বাচন' },
  { id: 'schedule', en: 'Schedule', bn: 'বেতনের সময়সূচি' },
  { id: 'schemes', en: 'Schemes', bn: 'প্রকল্প' },
  { id: 'accounts', en: 'Accounts', bn: 'হিসাব' },
  { id: 'changelog', en: 'Changelog', bn: 'পরিবর্তনের খতিয়ান' },
];

export function PayrollSettings() {
  return (
    <LangProvider>
      <Screen />
    </LangProvider>
  );
}

function Screen() {
  const { lang } = useLang();
  const [tab, setTab] = React.useState<Tab>('elections');
  const [site, setSite] = React.useState<string | null>(null);
  const summary = useSummary(site);
  const s = summary.data;
  return (
    <div className="bd ps" lang={lang}>
      <div className="bd-page ps-page">
        <header className="bd-list-head">
          <div className="min-w-0 flex-1">
            <div className="ps-crumb">HRIS · Payroll · Settings <span lang="bn" className="ps-gloss">বেতন · নিয়ম</span></div>
            <h1 className="bd-title !text-[22px]">Payroll settings <span lang="bn" className="ps-gloss">বেতন নির্ধারণের নিয়ম</span></h1>
            <p className="bd-lede !max-w-[680px] !text-[12.5px]">
              The Labour Act sets a floor and leaves the method open. An election is not a preference: it is a number the company has to defend to an inspector. Each one shows what it costs on this payroll, and the section it rests on.
            </p>
          </div>
          {s && <HeadStatus s={s} site={site} setSite={setSite} />}
        </header>
        {s && <Blockers s={s} onTab={setTab} />}
        <nav className="ps-tabs" role="tablist" aria-label="Payroll settings">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" id={`ps-tab-${t.id}`} aria-selected={tab === t.id} aria-controls="ps-panel" className="ps-tab" onClick={() => setTab(t.id)}>
              {lang === 'bn' ? <span lang="bn">{t.bn}</span> : t.en}
              {t.id === 'elections' && s && s.answered < s.total && <span className="ps-tab-count" title="Unanswered elections">{s.total - s.answered}</span>}
              {t.id === 'elections' && s && s.pendingAll.length > 0 && <span className="ps-tab-count ps-tab-pending" title="Awaiting approval">{s.pendingAll.length}</span>}
              {t.id === 'accounts' && s && s.readiness.blockers.some((b) => b.kind === 'UNMAPPED_SCHEME') && <span className="ps-tab-count" title="Schemes without an expense account">!</span>}
            </button>
          ))}
        </nav>
        <div className="ps-body" id="ps-panel" role="tabpanel" aria-labelledby={`ps-tab-${tab}`} key={tab}>
          {summary.isLoading ? <LoadingBlock /> : summary.error || !s ? <ErrorBlock error={summary.error} onRetry={() => summary.refetch()} /> : (
            <>
              {tab === 'elections' && <ElectionsTab s={s} site={site} />}
              {tab === 'schedule' && <ScheduleTab s={s} site={site} />}
              {tab === 'schemes' && <SchemesTab s={s} />}
              {tab === 'accounts' && <AccountsTab s={s} />}
              {tab === 'changelog' && <ChangelogTab s={s} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HeadStatus({ s, site, setSite }: { s: Summary; site: string | null; setSite: (v: string | null) => void }) {
  return (
    <div className="ps-head-status">
      <div className="ps-counter" aria-live="polite">
        <span className="bd-mono ps-counter-fig">{s.answered} of {s.total}</span>
        <span>elections answered</span>
      </div>
      {s.sites.length > 1 && (
        <label className="ps-scope">
          <span className="bd-label">Scope</span>
          <select className="bd-input" value={site ?? ''} onChange={(e) => setSite(e.target.value || null)}>
            <option value="">Company-wide</option>
            {s.sites.map((x) => <option key={x.uid} value={x.uid}>{x.name} (override)</option>)}
          </select>
        </label>
      )}
      <button type="button" className="bd-btn" onClick={() => window.print()}>Print elections</button>
    </div>
  );
}

const TAB_OF: Record<string, Tab> = { UNANSWERED_ELECTION: 'elections', UNMAPPED_SCHEME: 'accounts', NO_SCHEDULE: 'schedule', PAYMENT_AFTER_DEADLINE: 'schedule', NO_CALENDAR: 'schedule' };

/** §4.2: a refusal, not a warning. */
function Blockers({ s, onTab }: { s: Summary; onTab: (t: Tab) => void }) {
  const r = s.readiness;
  if (r.runnable) {
    return <div className="bd-note bd-tone-ok ps-ready" role="status">Payroll for {r.period} can run: every election is answered, every scheme is mapped and the payment day meets s.123.</div>;
  }
  return (
    <section className="bd-note bd-tone-blocked ps-ready" aria-labelledby="ps-block-title">
      <div className="min-w-0">
        <div id="ps-block-title" className="ps-block-title">Payroll for {r.period} is blocked — {r.blockers.length} {r.blockers.length === 1 ? 'reason' : 'reasons'}</div>
        <ul className="ps-block-list">
          {r.blockers.map((b, i) => (
            <li key={i}>
              {b.message}
              {b.citation && <span className="ps-cite"> {b.citation}</span>}
              {TAB_OF[b.kind] && <button type="button" className="pl-link ps-link-inline" onClick={() => onTab(TAB_OF[b.kind])}>Resolve</button>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
