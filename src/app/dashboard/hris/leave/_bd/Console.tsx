'use client';

/**
 * The leave console (docs/frontend/leave-frontend.md): seven tabs over one
 * ledger. A balance is three numbers, not one -- what is on the ledger, what
 * undecided requests hold, and what approved future leave has booked -- and
 * only the remainder can be spent. Every figure on this screen comes from
 * the server's spendable(); none is computed here.
 */

import './leave.css';
import * as React from 'react';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { fmtDays } from './defs';
import { AccrualDrawer, ApplyDrawer, BulkDrawer, EncashDrawer, GrantDrawer, HistoryDrawer, MaternityDrawer } from './Drawers';
import { useSummary } from './hooks';
import { MaternityCaseDrawer, MaternityTab, StatementDrawer, StatementsTab } from './Lifecycle';
import { ApplicationsTab, ApprovalsTab, AwayTab, BalancesTab, EncashmentTab, PolicyTab, YearEndTab } from './Tabs';
import type { Tab } from './types';

type Drawer =
  | { kind: 'apply'; code?: string }
  | { kind: 'grant'; code?: string }
  | { kind: 'bulk' }
  | { kind: 'accrual' }
  | { kind: 'encash'; code?: string }
  | { kind: 'history'; code: string }
  | { kind: 'maternity'; code?: string }
  | { kind: 'case'; reference: string }
  | { kind: 'statement'; uid: string }
  | null;

const TABS: { id: Tab; label: string; count?: 'applications' | 'approvals' | 'encashment' }[] = [
  { id: 'balances', label: 'Balances' },
  { id: 'applications', label: 'Applications', count: 'applications' },
  { id: 'approvals', label: 'Approvals', count: 'approvals' },
  { id: 'away', label: 'Who is away' },
  { id: 'encashment', label: 'Encashment', count: 'encashment' },
  { id: 'maternity', label: 'Maternity' },
  { id: 'statements', label: 'Statements' },
  { id: 'yearend', label: 'Year-end' },
  { id: 'policy', label: 'Policy' },
];

export function LeaveConsole() {
  return (
    <LangProvider>
      <Screen />
    </LangProvider>
  );
}

function Screen() {
  const { lang } = useLang();
  const [tab, setTab] = React.useState<Tab>('balances');
  const [drawer, setDrawer] = React.useState<Drawer>(null);
  const summary = useSummary();
  const s = summary.data;
  const can = s?.can;
  const close = () => setDrawer(null);
  const openHistory = React.useCallback((code: string) => setDrawer({ kind: 'history', code }), []);

  const stats = s
    ? [
        { label: 'On the roster', value: String(s.roster) },
        { label: 'Awaiting a decision', value: String(s.awaiting), tone: s.awaiting ? '#8A6215' : undefined },
        { label: 'Reserved by holds', value: fmtDays(s.held), title: 'Days undecided requests hold: why a balance and what can be spent disagree' },
        { label: 'Days granted this year', value: fmtDays(s.grantedThisYear) },
      ]
    : [];

  return (
    <div className="lc" lang={lang}>
      <header className="lc-head">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-[240px] flex-1">
            <h1 className="lc-title">
              Leave{' '}
              <span lang="bn" className="text-[15px] font-semibold text-[#6E6883]">
                ছুটি
              </span>
            </h1>
            <p className="lc-lead">
              A balance is three numbers: what is on the ledger, what undecided requests hold, and what approved future leave has booked. Only the remainder can be spent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can?.apply && (
              <button type="button" className="lc-btn-primary" onClick={() => setDrawer({ kind: 'apply' })}>
                Apply for an employee
              </button>
            )}
            {can?.grant && (
              <>
                <button type="button" className="lc-btn" onClick={() => setDrawer({ kind: 'grant' })}>
                  Grant or debit
                </button>
                <button type="button" className="lc-btn" onClick={() => setDrawer({ kind: 'bulk' })}>
                  Bulk credit
                </button>
              </>
            )}
          </div>
        </div>
        <div className="lc-stats" aria-live="polite">
          {stats.map((x) => (
            <div key={x.label} className="lc-stat" title={x.title}>
              <div className="lc-stat-figure" style={{ color: x.tone }}>
                {x.value}
              </div>
              <div className="lc-stat-caption">{x.label}</div>
            </div>
          ))}
        </div>
        <nav className="lc-tabs" aria-label="Leave">
          {TABS.map((t) => (
            <button key={t.id} type="button" className="lc-tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              {t.label}
              {t.count && s && <span className="lc-tab-count">{s.counts[t.count]}</span>}
            </button>
          ))}
        </nav>
      </header>
      <div key={tab} className="lc-body">
        {tab === 'balances' && <BalancesTab onOpen={openHistory} />}
        {tab === 'applications' && <ApplicationsTab can={can} onOpen={openHistory} />}
        {tab === 'approvals' && <ApprovalsTab can={can} />}
        {tab === 'away' && <AwayTab onOpen={openHistory} />}
        {tab === 'encashment' && <EncashmentTab onEncash={() => setDrawer({ kind: 'encash' })} />}
        {tab === 'maternity' && <MaternityTab onNew={() => setDrawer({ kind: 'maternity' })} onOpen={(reference) => setDrawer({ kind: 'case', reference })} />}
        {tab === 'statements' && <StatementsTab onPrint={(uid) => setDrawer({ kind: 'statement', uid })} />}
        {tab === 'yearend' && <YearEndTab can={can} onAccrual={() => setDrawer({ kind: 'accrual' })} />}
        {tab === 'policy' && <PolicyTab />}
      </div>

      {drawer?.kind === 'apply' && <ApplyDrawer code={drawer.code} onClose={close} onMaternity={(code) => setDrawer({ kind: 'maternity', code })} />}
      {drawer?.kind === 'grant' && <GrantDrawer code={drawer.code} onClose={close} />}
      {drawer?.kind === 'bulk' && <BulkDrawer onClose={close} />}
      {drawer?.kind === 'accrual' && <AccrualDrawer onClose={close} />}
      {drawer?.kind === 'encash' && <EncashDrawer code={drawer.code} onClose={close} />}
      {drawer?.kind === 'maternity' && <MaternityDrawer code={drawer.code} onClose={close} />}
      {drawer?.kind === 'case' && <MaternityCaseDrawer reference={drawer.reference} onClose={close} />}
      {drawer?.kind === 'statement' && <StatementDrawer uid={drawer.uid} onClose={close} />}
      {drawer?.kind === 'history' && (
        <HistoryDrawer code={drawer.code} onClose={close} onApply={(code) => setDrawer({ kind: 'apply', code })} onGrant={(code) => setDrawer({ kind: 'grant', code })} />
      )}
    </div>
  );
}
