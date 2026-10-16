'use client';

/**
 * Attendance intake (docs/frontend/attendance-intake-done.md): the pipe between a
 * biometric device and the attendance register. Five tabs -- import, device
 * profiles, device ID mapping, period lock, import history.
 *
 * It never shows a day's attendance, only the batch that produced it: a
 * "reverse this import" button does not belong on a screen people open
 * daily (§1.2). Two rules it exists for:
 *   raw punches are immutable -- a correction is a record, never an edit;
 *   an unmapped device ID never discards a punch -- it is held, and attaches
 *   the moment a mapping is made.
 */

import './intake.css';
import * as React from 'react';
import { LangProvider, useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useSummary } from './hooks';
import { useNum } from './parts';
import { ImportTab } from './ImportTab';
import { ProfilesTab } from './ProfilesTab';
import { MappingTab } from './MappingTab';
import { PeriodsTab } from './PeriodsTab';
import { HistoryTab } from './HistoryTab';
import type { Tab } from './types';

const TABS: { id: Tab; label: string; bn: string }[] = [
  { id: 'import', label: 'Import', bn: 'ইমপোর্ট' },
  { id: 'profiles', label: 'Device profiles', bn: 'ডিভাইস প্রোফাইল' },
  { id: 'mapping', label: 'Device ID mapping', bn: 'ডিভাইস আইডি' },
  { id: 'periods', label: 'Period lock', bn: 'সময়কাল লক' },
  { id: 'history', label: 'Import history', bn: 'ইতিহাস' },
];

export function IntakeConsole() {
  return (
    <LangProvider>
      <Screen />
    </LangProvider>
  );
}

function Screen() {
  const { lang, setLang, banglaNumerals, toggleNumerals } = useLang();
  const num = useNum();
  const [tab, setTab] = React.useState<Tab>('import');
  const [resume, setResume] = React.useState<string | null>(null);
  const summary = useSummary();
  const s = summary.data;
  const count = (t: Tab) => (t === 'mapping' ? s?.counts.unmappedIds : t === 'history' ? s?.counts.batches : t === 'import' ? s?.counts.awaiting : undefined);

  return (
    <div className="ai" lang={lang}>
      <header className="ai-head" data-no-print="true">
        <div className="ai-head-row">
          <div style={{ minWidth: 240, flex: 1 }}>
            <h1 className="ai-title">
              Attendance intake <span lang="bn" className="ai-title-bn">উপস্থিতি গ্রহণ</span>
            </h1>
            <p className="ai-lead">
              Raw punches are immutable; a correction is a record, never an edit. An unmapped device ID never discards a punch: it is held, and
              attaches the moment you map it.
            </p>
          </div>
          <div className="ai-switches">
            <div role="radiogroup" aria-label="Language" className="ai-radiogroup">
              {(['en', 'bn'] as const).map((l) => (
                <button key={l} type="button" role="radio" aria-checked={lang === l} onClick={() => setLang(l)} lang={l}>
                  {l === 'en' ? 'English' : 'বাংলা'}
                </button>
              ))}
            </div>
            <button type="button" role="switch" aria-checked={banglaNumerals} aria-label="Bangla numerals" className="ai-switch" onClick={toggleNumerals}>
              <span lang="bn">০১২</span> numerals
            </button>
          </div>
        </div>
        <nav className="ai-tabs" role="tablist" aria-label="Attendance intake">
          {TABS.map((t) => {
            const c = count(t.id);
            return (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="ai-tab" onClick={() => setTab(t.id)}>
                {lang === 'bn' ? <span lang="bn">{t.bn}</span> : t.label}
                {!!c && <span className={`ai-tab-count${t.id === 'mapping' ? ' warn' : ''}`}>{num(c)}</span>}
              </button>
            );
          })}
        </nav>
      </header>
      <div className="ai-body" key={tab}>
        {summary.isLoading ? <LoadingBlock /> : summary.error || !s ? <ErrorBlock error={summary.error} onRetry={() => summary.refetch()} /> : (
          <>
            {tab === 'import' && <ImportTab summary={s} resume={resume} onResumed={() => setResume(null)} onMap={() => setTab('mapping')} onHistory={() => setTab('history')} />}
            {tab === 'profiles' && <ProfilesTab summary={s} />}
            {tab === 'mapping' && <MappingTab summary={s} />}
            {tab === 'periods' && <PeriodsTab summary={s} />}
            {tab === 'history' && <HistoryTab summary={s} onContinue={(uid) => { setResume(uid); setTab('import'); }} />}
          </>
        )}
      </div>
    </div>
  );
}
