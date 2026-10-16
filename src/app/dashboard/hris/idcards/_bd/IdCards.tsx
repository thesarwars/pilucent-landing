'use client';

/**
 * ID cards (docs/frontend/id-cards-done.md): ten screens in three groups under
 * two bars -- a 40px group bar and a 34px screen bar (§2.1). The screen and
 * what it shows live in the URL (`?s=designer&t=<uid>`), so every screen
 * deep-links and the back button works.
 */

import './idcards.css';
import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { plexMono, plexSans } from './fonts';
import { useFontsReady, useJobs, useSetup } from './hooks';
import type { Screen, Setup } from './types';
import { Loading } from './parts';
import { Gallery } from './Gallery';
import { CardDetail } from './CardDetail';
import { PrintWizard, PrintJobs } from './Print';
import { TemplateList } from './Templates';
import { Designer } from './Designer';
import { CustomFields, OutputProfiles, VerificationPreview } from './Settings';
import { PhotoStudio } from './PhotoStudio';

type Group = 'cards' | 'templates' | 'settings';
const GROUPS: { id: Group; label: string; screens: { id: Screen; label: string }[] }[] = [
  { id: 'cards', label: 'ID cards', screens: [
    { id: 'gallery', label: 'Gallery' }, { id: 'card', label: 'Card detail' }, { id: 'print', label: 'Print wizard' }, { id: 'jobs', label: 'Print jobs' },
  ] },
  { id: 'templates', label: 'Templates', screens: [{ id: 'templates', label: 'Template list' }, { id: 'designer', label: 'Designer' }] },
  { id: 'settings', label: 'Settings', screens: [
    { id: 'fields', label: 'Custom fields' }, { id: 'photos', label: 'Photo studio' }, { id: 'profiles', label: 'Output profiles' }, { id: 'verify', label: 'Verification page' },
  ] },
];
const groupOf = (s: Screen) => GROUPS.find((g) => g.screens.some((x) => x.id === s))!.id;

export interface Nav {
  screen: Screen;
  card: string | null;
  emp: string | null;
  template: string | null;
  job: string | null;
  go: (screen: Screen, params?: Partial<Record<'card' | 'emp' | 't' | 'job', string | null>>) => void;
}

interface Shared {
  nav: Nav;
  setup: Setup;
  q: string;
  /** Employee codes picked in the gallery, for the print wizard and bulk issue. */
  picked: string[];
  setPicked: (codes: string[]) => void;
  fontsTick: number;
}
const Ctx = React.createContext<Shared | null>(null);
export const useShared = () => {
  const v = React.useContext(Ctx);
  if (!v) throw new Error('useShared outside <IdCards>');
  return v;
};

function useNav(): Nav {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const screen = (sp.get('s') as Screen) || 'gallery';
  const go: Nav['go'] = (s, params = {}) => {
    const next = new URLSearchParams();
    next.set('s', s);
    const keep = { card: sp.get('card'), emp: sp.get('emp'), t: sp.get('t'), job: sp.get('job') };
    for (const [k, v] of Object.entries({ ...keep, ...params })) if (v) next.set(k, v);
    router.push(`${path}?${next.toString()}`, { scroll: false });
  };
  return { screen, card: sp.get('card'), emp: sp.get('emp'), template: sp.get('t'), job: sp.get('job'), go };
}

export function IdCards() {
  const nav = useNav();
  const setup = useSetup();
  const jobs = useJobs();
  const fontsTick = useFontsReady();
  const [q, setQ] = React.useState('');
  const [picked, setPicked] = React.useState<string[]>([]);
  const group = groupOf(nav.screen);
  const pending = jobs.data?.jobs.filter((j) => j.status === 'QUEUED' || j.status === 'RENDERING' || j.status === 'READY').length || 0;

  return (
    <div className={`idc ${plexSans.variable} ${plexMono.variable}`} data-screen-label="ID cards">
      <div className="idc-groupbar">
        {GROUPS.map((g) => (
          <button key={g.id} type="button" className={`idc-gtab${group === g.id ? ' on' : ''}`} aria-current={group === g.id ? 'page' : undefined}
            onClick={() => nav.go(g.screens[0].id)}>
            {g.label}
          </button>
        ))}
        <span className="idc-spacer" />
        <div className="idc-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" /><path d="m15.8 15.8 4.2 4.2" />
          </svg>
          <input value={q} onChange={(e) => { setQ(e.target.value); if (nav.screen !== 'gallery') nav.go('gallery'); }}
            placeholder="Search employees" aria-label="Search employees" />
        </div>
      </div>
      <div className="idc-screenbar" role="tablist" aria-label="Screens">
        {GROUPS.find((g) => g.id === group)!.screens.map((s) => {
          const badge = s.id === 'jobs' && pending ? pending : s.id === 'print' && picked.length ? picked.length : null;
          return (
            <button key={s.id} type="button" role="tab" aria-selected={nav.screen === s.id} className={`idc-stab${nav.screen === s.id ? ' on' : ''}`}
              onClick={() => nav.go(s.id)}>
              {s.label}
              {badge !== null && <span className="idc-badge">{badge}</span>}
            </button>
          );
        })}
      </div>
      <div className="idc-body">
        {setup.isLoading || !setup.data ? (
          setup.error ? <div className="idc-scroll"><div className="idc-banner err">{String((setup.error as Error).message)}</div></div> : <Loading />
        ) : (
          <Ctx.Provider value={{ nav, setup: setup.data, q, picked, setPicked, fontsTick }}>
            <Body screen={nav.screen} />
          </Ctx.Provider>
        )}
      </div>
    </div>
  );
}

function Body({ screen }: { screen: Screen }) {
  switch (screen) {
    case 'gallery': return <Gallery />;
    case 'card': return <CardDetail />;
    case 'print': return <PrintWizard />;
    case 'jobs': return <PrintJobs />;
    case 'templates': return <TemplateList />;
    case 'designer': return <Designer />;
    case 'fields': return <CustomFields />;
    case 'photos': return <PhotoStudio />;
    case 'profiles': return <OutputProfiles />;
    case 'verify': return <VerificationPreview />;
    default: return <Gallery />;
  }
}
