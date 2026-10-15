'use client';

/**
 * One employee's profile (backend §2–§9): header, compliance pill, eight tabs
 * with their completion state, and the gated operations.
 *
 * Mounted with `key={code}`, so opening another employee starts from nothing:
 * no field of one record can survive into the next (backend §1.3, test 1).
 */

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Camera, ChevronDown, Info, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb, VioletButton, VioletSurface, avatarGradient } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from './api';
import { enumLabel } from './enums';
import { initials, plural } from './format';
import { useCompliance, useEmployeeMutation, useProfile } from './hooks';
import { LangProvider, useLang } from './i18n';
import type { DocumentKind, Profile as ProfileT, TabId } from './types';
import { ErrorBlock, LoadingBlock, TAB_STATE, TabDot, focusField } from './ui';
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

  if (profile.isPending) {
    return (
      <VioletSurface className="min-h-screen p-6">
        <LoadingBlock label="Loading the employee…" />
      </VioletSurface>
    );
  }
  if (profile.isError) {
    return (
      <VioletSurface className="min-h-screen p-6">
        <ErrorBlock error={profile.error} onRetry={() => void profile.refetch()} />
        <div className="mt-4 text-center">
          <VioletButton variant="outline" size="sm" onClick={() => router.push('/dashboard/hris/employee/employees')}>
            All employees
          </VioletButton>
        </div>
      </VioletSurface>
    );
  }
  const p = profile.data;

  return (
    <VioletSurface className="min-h-screen px-4 pb-16 pt-5 md:px-6">
      <div className="mx-auto max-w-[1280px] space-y-4">
        <TopBar onBack={() => router.push('/dashboard/hris/employee/employees')} name={p.personal.nameEn} />
        <Header
          profile={p}
          blocks={compliance.data?.blocks.length ?? null}
          risks={compliance.data?.risks.length ?? null}
          onCompliance={() => setDrawer(true)}
          onSeparate={() => setSeparating(true)}
          goTo={goTo}
        />
        <TabBar tab={tab} states={compliance.data?.tabStates} onSelect={(t) => goTo(t)} />
        <RuleBookNotice />

        {tab === 'personal' && <PersonalTab profile={p} />}
        {tab === 'employment' && <EmploymentTab profile={p} onClock={setTimeline} onClassify={setClassifyTo} />}
        {tab === 'salary' && <SalaryTab profile={p} />}
        {tab === 'statutory' && <StatutoryTab profile={p} />}
        {tab === 'tax' && <TaxTab profile={p} />}
        {tab === 'payment' && <PaymentTab profile={p} />}
        {tab === 'documents' && <DocumentsTab code={code} goTo={goTo} />}
        {tab === 'history' && <HistoryTab code={code} />}
      </div>

      {drawer && compliance.data && <ComplianceDrawer compliance={compliance.data} onClose={() => setDrawer(false)} goTo={goTo} />}
      {classifyTo && <ClassificationModal profile={p} to={classifyTo} onClose={() => setClassifyTo(null)} />}
      {separating && <SeparationModal profile={p} onClose={() => setSeparating(false)} />}
      {timeline && <TimelineModal code={code} field={timeline} onClose={() => setTimeline(null)} />}
    </VioletSurface>
  );
}

function TopBar({ onBack, name }: { onBack: () => void; name: string }) {
  const { lang, setLang, banglaNumerals, toggleNumerals, t } = useLang();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <VioletButton variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />} onClick={onBack}>
        All {t('employees', 'employees').toLowerCase()}
      </VioletButton>
      <Breadcrumb items={[{ label: 'HRIS' }, { label: 'Employees', href: '/dashboard/hris/employee/employees' }, { label: name }]} />
      <span className="flex-1" />
      <div className="flex items-center gap-1.5">
        <span title="Bangladesh compliance mode" className="rounded-lg bg-v-ink900 px-2 py-1 text-[10.5px] font-extrabold tracking-[0.06em] text-white">
          BD
        </span>
        <div className="flex rounded-[11px] bg-white/60 p-0.5">
          {(['en', 'bn'] as const).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              onClick={() => setLang(l)}
              className={cn('rounded-[9px] px-2.5 py-1 text-[12px] font-bold', lang === l ? 'bg-white text-v-primary-deep shadow-sm' : 'text-v-ink500')}
            >
              {l === 'en' ? 'EN' : 'বাংলা'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleNumerals}
          title="Use Bangla numerals"
          aria-pressed={banglaNumerals}
          className={cn(
            'rounded-[11px] border px-2.5 py-1 text-[12px] font-bold',
            banglaNumerals ? 'border-v-primary bg-v-primary text-white' : 'border-white/80 bg-white/55 text-v-ink500'
          )}
        >
          ০১২৩
        </button>
      </div>
    </div>
  );
}

function Header({
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
  const { t } = useLang();
  const code = p.code;
  const photoInput = React.useRef<HTMLInputElement>(null);
  const [menu, setMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const upload = useEmployeeMutation(code, (file: File) => {
    const data = new FormData();
    data.append('photo', file);
    return api.patchSection(code, 'personal', data);
  });
  const issue = useEmployeeMutation(code, (kind: DocumentKind['kind']) => api.issueDocument(code, kind));

  React.useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menu]);

  const doIssue = async (kind: DocumentKind['kind'], label: string) => {
    setMenu(false);
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

  return (
    <div className="rounded-v-card bg-white p-5 shadow-v-card md:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <button
          id="f-photo"
          type="button"
          onClick={() => photoInput.current?.click()}
          title={p.personal.photo ? 'Change photograph' : 'Photograph missing — click to add'}
          className="group relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[22px] text-[22px] font-extrabold text-white outline-none focus-visible:ring-2 focus-visible:ring-v-primary"
          style={p.personal.photo ? undefined : { backgroundImage: avatarGradient(p.personal.nameEn || p.code) }}
        >
          {p.personal.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.personal.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(p.personal.nameEn)
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5" />
          </span>
        </button>
        <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={(e) => void onPhoto(e.target.files?.[0])} />

        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-[24px] font-extrabold leading-tight tracking-[-0.025em] text-v-ink900">{p.personal.nameEn}</h1>
          {p.personal.nameBn && (
            <div lang="bn" className="text-[15px] font-semibold text-v-ink700">
              {p.personal.nameBn}
            </div>
          )}
          <div className="mt-0.5 text-[12.5px] font-medium text-v-ink500">{meta}</div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold',
                separated ? 'border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.1)] text-[#E11D48]' : 'border-[rgba(31,169,122,0.3)] bg-[rgba(31,169,122,0.12)] text-[#157A5B]'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {separated ? `Separated · ${enumLabel('separationType', emp.separationType)}` : t('Active', 'active')}
            </span>
            {emp.classification && (
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold',
                  isWorker ? 'border-[rgba(124,77,255,0.3)] bg-[rgba(124,77,255,0.13)] text-v-primary-deep' : 'border-[rgba(22,23,42,0.14)] bg-[rgba(22,23,42,0.07)] text-v-ink700'
                )}
              >
                {t(enumLabel('classification', emp.classification), isWorker ? 'worker' : 'nonWorker')}
              </span>
            )}
            {blocks !== null && risks !== null && (
              <button
                type="button"
                onClick={onCompliance}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold transition-colors',
                  blocks
                    ? 'border-[rgba(244,63,94,0.32)] bg-[rgba(244,63,94,0.12)] text-[#E11D48] hover:bg-[rgba(244,63,94,0.18)]'
                    : risks
                      ? 'border-[rgba(245,178,46,0.36)] bg-[rgba(245,178,46,0.16)] text-[#8A5A06] hover:bg-[rgba(245,178,46,0.22)]'
                      : 'border-[rgba(31,169,122,0.32)] bg-[rgba(31,169,122,0.14)] text-[#157A5B]'
                )}
              >
                {blocks ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                {blocks
                  ? `${plural(blocks, 'item blocks', 'items block')} payroll`
                  : risks
                    ? plural(risks, 'compliance risk', 'compliance risks')
                    : 'Compliant'}
              </button>
            )}
          </div>
        </div>

        <div ref={menuRef} className="relative">
          <VioletButton variant="outline" size="sm" rightIcon={<ChevronDown className="h-3.5 w-3.5" />} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            Actions
          </VioletButton>
          {menu && (
            <div role="menu" className="absolute right-0 top-full z-50 mt-1.5 w-56 animate-v-pop rounded-2xl bg-white p-1.5 shadow-v-modal">
              {[
                ['Generate service book', () => void doIssue('SERVICE_BOOK', 'Service book'), false],
                ['Issue appointment letter', () => void doIssue('APPOINTMENT_LETTER', 'Appointment letter'), false],
                ['Issue ID card', () => void doIssue('ID_CARD', 'ID card'), false],
                ['View documents', () => (setMenu(false), goTo('documents')), false],
                ['Record separation', () => (setMenu(false), onSeparate()), true],
              ].map(([label, onClick, danger]) => (
                <button
                  key={label as string}
                  type="button"
                  role="menuitem"
                  disabled={label === 'Record separation' && !!emp.separatedOn}
                  onClick={onClick as () => void}
                  className={cn(
                    'block w-full rounded-xl px-3 py-2 text-left text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    danger ? 'text-[#E11D48] hover:bg-[rgba(244,63,94,0.07)]' : 'text-v-ink900 hover:bg-v-wash'
                  )}
                >
                  {label as string}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabBar({ tab, states, onSelect }: { tab: TabId; states?: Record<TabId, keyof typeof TAB_STATE>; onSelect: (t: TabId) => void }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav aria-label="Profile sections" className="flex flex-wrap gap-1 rounded-[18px] bg-white/55 p-1 backdrop-blur-md">
        {TABS.map((x) => {
          const active = x.id === tab;
          return (
            <button
              key={x.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(x.id)}
              className={cn(
                'flex items-center gap-2 rounded-[14px] px-3.5 py-2 text-[13px] transition-all',
                active ? 'bg-white font-bold text-v-primary-deep shadow-[0_6px_18px_-10px_rgba(22,23,42,0.45)]' : 'font-medium text-v-ink700 hover:text-v-ink900'
              )}
            >
              {states && <TabDot state={states[x.id]} />}
              {t(x.en, x.id)}
            </button>
          );
        })}
      </nav>
      <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-v-ink500">
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

function RuleBookNotice() {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-[rgba(124,77,255,0.18)] bg-[rgba(124,77,255,0.05)] px-4 py-2.5 text-[12px] leading-relaxed text-v-ink700">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-v-primary" />
      Statutory figures come from the rule book, not the screen. A value below Verified is labelled where it appears, may drive a preview, and cannot reach a released payslip. Bangla labels are machine-drafted and await a native speaker&apos;s review.
    </div>
  );
}
