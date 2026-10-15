'use client';

/**
 * One employee's profile (backend §2–§9, spec §8–§9): identity card,
 * compliance pill, eight tabs with their completion state, and the gated
 * operations.
 *
 * Mounted with `key={code}`, so opening another employee starts from nothing:
 * no field of one record can survive into the next (backend §1.3, test 1).
 *
 * Always embedded: the dashboard shell draws the navigation rail, the
 * background gradient and the ambient blobs, so this screen draws neither its
 * own sidebar nor the "Employees" link (spec §2.3).
 */

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/ToastService';
import * as api from './api';
import { enumLabel } from './enums';
import { initials } from './format';
import { useCompliance, useEmployeeMutation, useProfile } from './hooks';
import { LangProvider, useLang } from './i18n';
import type { DocumentKind, Profile as ProfileT, TabId, TabState } from './types';
import { Chip, ErrorBlock, LoadingBlock, Note, TAB_STATE, TabDot, focusField, type Tone } from './ui';
import { ClassificationModal, ComplianceDrawer, SeparationModal, TimelineModal } from './modals';
import { PersonalTab } from './tabs/PersonalTab';
import { EmploymentTab } from './tabs/EmploymentTab';
import { SalaryTab } from './tabs/SalaryTab';
import { StatutoryTab } from './tabs/StatutoryTab';
import { TaxTab } from './tabs/TaxTab';
import { PaymentTab } from './tabs/PaymentTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { HistoryTab } from './tabs/HistoryTab';

const TABS: { id: TabId; en: string }[] = [
  { id: 'personal', en: 'Personal' },
  { id: 'employment', en: 'Employment' },
  { id: 'salary', en: 'Salary' },
  { id: 'statutory', en: 'Statutory' },
  { id: 'tax', en: 'Tax profile' },
  { id: 'payment', en: 'Payment' },
  { id: 'documents', en: 'Documents' },
  { id: 'history', en: 'History' },
];
const isTab = (v: string | null): v is TabId => !!v && TABS.some((t) => t.id === v);
const ROSTER = '/dashboard/hris/employee/employees';

export function EmployeeProfile({ code }: { code: string }) {
  return (
    <LangProvider>
      <React.Suspense fallback={<LoadingBlock label="Loading the employee…" />}>
        <ProfileScreen key={code} code={code} />
      </React.Suspense>
    </LangProvider>
  );
}

function ProfileScreen({ code }: { code: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const { lang } = useLang();
  const profile = useProfile(code);
  const compliance = useCompliance(code);
  const [tab, setTab] = React.useState<TabId>(() => (isTab(params.get('tab')) ? (params.get('tab') as TabId) : 'personal'));
  const [drawer, setDrawer] = React.useState(false);
  const [classifyTo, setClassifyTo] = React.useState<string | null>(null);
  const [separating, setSeparating] = React.useState(false);
  const [timeline, setTimeline] = React.useState<string | null>(null);

  const goTo = React.useCallback((next: TabId, field?: string | null) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url.toString());
    if (field) focusField(field);
  }, []);
  const back = () => router.push(ROSTER);

  if (profile.isPending || profile.isError) {
    return (
      <div className="bd" lang={lang}>
        <div className="bd-page">
          <ChromeRow onBack={back} />
          <div className="px-4 pt-4 max-md:px-3">
            {profile.isPending ? <LoadingBlock label="Loading the employee…" /> : <ErrorBlock error={profile.error} onRetry={() => void profile.refetch()} />}
          </div>
        </div>
      </div>
    );
  }
  const p = profile.data;

  return (
    <div className="bd" lang={lang}>
      <div className="bd-page">
        <ChromeRow onBack={back} />
        <div className="space-y-3.5 px-4 pt-3.5 max-md:px-3">
          <IdentityCard
            profile={p}
            blocks={compliance.data?.blocks.length ?? null}
            risks={compliance.data?.risks.length ?? null}
            onCompliance={() => setDrawer(true)}
            onSeparate={() => setSeparating(true)}
            goTo={goTo}
          />
          <TabBar tab={tab} states={compliance.data?.tabStates} onSelect={(t) => goTo(t)} onBlocked={() => setDrawer(true)} />
          <Note tone="violet" className="!text-[12px] !font-medium">
            Statutory figures come from the rule book, not the screen. A value below Verified is labelled where it appears, may drive a preview, and
            cannot reach a released payslip. Bangla labels are machine-drafted and await a native speaker&apos;s review.
          </Note>

          <div role="tabpanel" aria-label={TABS.find((x) => x.id === tab)?.en}>
            {tab === 'personal' && <PersonalTab profile={p} />}
            {tab === 'employment' && <EmploymentTab profile={p} onClock={setTimeline} onClassify={setClassifyTo} />}
            {tab === 'salary' && <SalaryTab profile={p} />}
            {tab === 'statutory' && <StatutoryTab profile={p} goTo={goTo} />}
            {tab === 'tax' && <TaxTab profile={p} />}
            {tab === 'payment' && <PaymentTab profile={p} />}
            {tab === 'documents' && <DocumentsTab code={code} goTo={goTo} />}
            {tab === 'history' && <HistoryTab code={code} />}
          </div>
        </div>
      </div>

      {drawer && compliance.data && <ComplianceDrawer compliance={compliance.data} onClose={() => setDrawer(false)} goTo={goTo} />}
      {classifyTo && <ClassificationModal profile={p} to={classifyTo} onClose={() => setClassifyTo(null)} />}
      {separating && <SeparationModal profile={p} onClose={() => setSeparating(false)} />}
      {timeline && <TimelineModal code={code} field={timeline} onClose={() => setTimeline(null)} />}
    </div>
  );
}

/** Back, then BD badge, language pair and numerals, in that order (spec §6, §8.1). */
function ChromeRow({ onBack }: { onBack: () => void }) {
  const { lang, setLang, banglaNumerals, toggleNumerals } = useLang();
  return (
    <div className="bd-chrome">
      <button type="button" className="bd-btn" onClick={onBack}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        All employees
      </button>
      <span className="flex-1" />
      <span className={cn('bd-badge', 'bd-tone-bd')} title="Bangladesh compliance mode">
        BD
      </span>
      <div className="bd-langpair" role="group" aria-label="Language">
        <button type="button" lang="en" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
          EN
        </button>
        <button type="button" lang="bn" aria-pressed={lang === 'bn'} onClick={() => setLang('bn')}>
          বাংলা
        </button>
      </div>
      <button type="button" className="bd-btn" onClick={toggleNumerals} title="Use Bangla numerals" aria-label="Use Bangla numerals" aria-pressed={banglaNumerals}>
        <span lang="bn">০১২৩</span>
      </button>
    </div>
  );
}

function IdentityCard({
  profile: p,
  blocks,
  risks,
  onCompliance,
  onSeparate,
  goTo,
}: {
  profile: ProfileT;
  blocks: number | null;
  risks: number | null;
  onCompliance: () => void;
  onSeparate: () => void;
  goTo: (tab: TabId, field?: string | null) => void;
}) {
  const { t, n } = useLang();
  const code = p.code;
  const photoInput = React.useRef<HTMLInputElement>(null);
  const upload = useEmployeeMutation(code, (file: File) => {
    const data = new FormData();
    data.append('photo', file);
    return api.patchSection(code, 'personal', data);
  });
  const issue = useEmployeeMutation(code, (kind: DocumentKind['kind']) => api.issueDocument(code, kind));

  const doIssue = async (kind: DocumentKind['kind'], label: string) => {
    try {
      await issue.mutateAsync(kind);
      toast.success(`${label} issued`);
    } catch (err) {
      if (err instanceof api.ApiError) {
        toast.error(err.errors.flatMap((x) => x.messages).join(' ') || err.message);
        goTo('documents');
      }
    }
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success('Photograph updated');
    } catch (err) {
      if (err instanceof api.ApiError) toast.error(err.messagesFor('photo').join(' ') || err.message);
    }
  };

  const emp = p.employment;
  const isWorker = emp.classification === 'WORKER';
  const meta = [p.code, emp.designation?.title, emp.department?.title].filter(Boolean).join(' · ');
  const separated = !!emp.separatedOn && !emp.finalSettlementOn;
  const classTone: Tone = !emp.classification ? 'warn' : isWorker ? 'violet' : 'neutral';
  const complianceTone: Tone = blocks ? 'blocked' : risks ? 'warn' : 'ok';
  const photoTitle = p.personal.photo ? 'Change photograph' : 'Photograph missing — click to add';

  return (
    <div className="bd-card bd-identity">
      <div className="flex flex-wrap items-start gap-4">
        <button
          id="f-photo"
          type="button"
          onClick={() => photoInput.current?.click()}
          title={photoTitle}
          aria-label={photoTitle}
          className="bd-avatar bd-avatar-lg group relative cursor-pointer border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4DFF]"
        >
          {p.personal.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.personal.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true">{initials(p.personal.nameEn)}</span>
          )}
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </span>
        </button>
        <input ref={photoInput} type="file" accept="image/*" className="hidden" tabIndex={-1} aria-hidden="true" onChange={(e) => void onPhoto(e.target.files?.[0])} />

        {/* At least 200px, so on a phone the name wraps under the avatar instead of under the Actions button. */}
        <div className="min-w-[min(100%,200px)] flex-1">
          <h1 className="bd-name">{p.personal.nameEn}</h1>
          {p.personal.nameBn && (
            <div lang="bn" className="bd-name-bn">
              {p.personal.nameBn}
            </div>
          )}
          <div className="mt-0.5 text-[12.5px] text-[#6F6A85]">{meta}</div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Chip tone={separated ? 'blocked' : 'ok'} dot>
              {separated ? `Separated · ${enumLabel('separationType', emp.separationType)}` : t('Active', 'active')}
            </Chip>
            <Chip
              tone={classTone}
              icon={
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
                </svg>
              }
            >
              {emp.classification ? t(enumLabel('classification', emp.classification), isWorker ? 'worker' : 'nonWorker') : 'Unclassified'}
            </Chip>
            {blocks !== null && risks !== null && (
              <button
                type="button"
                onClick={onCompliance}
                aria-haspopup="dialog"
                className={cn('bd-chip', `bd-tone-${complianceTone}`)}
                title="Open the compliance checklist"
              >
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {blocks || risks ? (
                    <>
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </>
                  ) : (
                    <path d="m5 12 5 5 9-10" />
                  )}
                </svg>
                {blocks
                  ? `${n(blocks)} ${blocks === 1 ? 'item blocks' : 'items block'} payroll`
                  : risks
                    ? `${n(risks)} compliance ${risks === 1 ? 'risk' : 'risks'}`
                    : 'Compliant'}
              </button>
            )}
          </div>
        </div>

        <ActionsMenu
          items={[
            { label: 'Generate service book', onSelect: () => void doIssue('SERVICE_BOOK', 'Service book') },
            { label: 'Issue appointment letter', onSelect: () => void doIssue('APPOINTMENT_LETTER', 'Appointment letter') },
            { label: 'Issue ID card', onSelect: () => void doIssue('ID_CARD', 'ID card') },
            { label: 'View documents', onSelect: () => goTo('documents') },
            { label: 'Record separation', onSelect: onSeparate, danger: true, disabled: !!emp.separatedOn, separated: true },
          ]}
        />
      </div>
      {upload.isPending && (
        <div className="sr-only" role="status">
          Uploading the photograph…
        </div>
      )}
    </div>
  );
}

type MenuItem = { label: string; onSelect: () => void; danger?: boolean; disabled?: boolean; separated?: boolean };

/** The actions menu (spec §8.3): opens below its button, closes on outside click, Escape or a choice. */
function ActionsMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const button = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const outside = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', key);
    root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus();
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  /** Up and Down move between the items, wrapping round. */
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const list = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    list[(at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]?.focus();
  };

  return (
    <div ref={root} data-menuroot="actions" className="relative">
      <button
        ref={button}
        type="button"
        className="bd-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
      >
        Actions
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label="Actions" className="bd-menu" onKeyDown={onMenuKey}>
          {items.map((item) => (
            <React.Fragment key={item.label}>
              {item.separated && <div role="separator" className="bd-menu-sep" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn('bd-menu-item', item.danger && 'is-danger')}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The eight tabs, each with its completion dot. A blocked dot is its own
 * button and opens the compliance drawer (spec §12); the label switches tab.
 */
function TabBar({
  tab,
  states,
  onSelect,
  onBlocked,
}: {
  tab: TabId;
  states?: Record<TabId, TabState>;
  onSelect: (t: TabId) => void;
  onBlocked: () => void;
}) {
  const { t } = useLang();
  const nav = React.useRef<HTMLElement>(null);
  // On a phone the strip scrolls sideways; keep the open tab in view.
  React.useEffect(() => {
    nav.current?.querySelector('.is-active')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, [tab]);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <nav ref={nav} aria-label="Profile sections" className="bd-tabs max-w-full">
        {TABS.map((x) => {
          const active = x.id === tab;
          const state = states?.[x.id];
          const label = t(x.en, x.id);
          return (
            <div key={x.id} className={cn('bd-tabitem', active && 'is-active')}>
              {state === 'blocked' ? (
                <button type="button" className="bd-dot-btn" onClick={onBlocked} aria-label={`${x.en}: blocks payroll — see what`} title="Blocks payroll — see what">
                  <TabDot state="blocked" />
                </button>
              ) : (
                state && (
                  <span aria-hidden="true" className="flex">
                    <TabDot state={state} />
                  </span>
                )
              )}
              <button type="button" className="bd-tab" aria-current={active ? 'page' : undefined} onClick={() => onSelect(x.id)}>
                {label}
                {state && <span className="sr-only">, {TAB_STATE[state].title.toLowerCase()}</span>}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-[#6F6A85]" aria-hidden="true">
        {(['complete', 'partial', 'empty', 'blocked'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <TabDot state={s} />
            {TAB_STATE[s].title}
          </span>
        ))}
      </div>
    </div>
  );
}
