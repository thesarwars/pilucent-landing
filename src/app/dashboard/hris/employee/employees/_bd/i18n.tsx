'use client';

/**
 * Language and numerals for the BD screens. The API sends English defaults
 * plus keys; the client swaps the chrome at runtime (backend §10). Amounts in
 * words come from the API in both languages. The Bangla strings below are the
 * prototype's, machine-drafted and awaiting a native speaker's review.
 */

import * as React from 'react';
import { digits, formatBDT, formatDate } from './format';

export type Lang = 'en' | 'bn';

const BN: Record<string, string> = {
  personal: 'ব্যক্তিগত তথ্য',
  employment: 'কর্মসংস্থান',
  salary: 'বেতন',
  statutory: 'বিধিবদ্ধ সুবিধা',
  tax: 'কর প্রোফাইল',
  payment: 'পরিশোধ',
  documents: 'নথিপত্র',
  history: 'ইতিহাস',
  worker: 'শ্রমিক',
  nonWorker: 'অ-শ্রমিক',
  active: 'কর্মরত',
  grossMonthly: 'মাসিক মোট বেতন',
  basic: 'মূল বেতন',
  employerCost: 'নিয়োগকর্তার মোট ব্যয়',
  effectiveFrom: 'কার্যকর তারিখ',
  reconciled: 'সমন্বিত',
  revise: 'সংশোধন করুন',
  inWords: 'কথায়',
  structure: 'বেতন কাঠামো',
  assignCta: 'বেতন কাঠামো নির্ধারণ করুন',
  overtime: 'অতিরিক্ত সময়',
  pf: 'ভবিষ্য তহবিল',
  gratuity: 'গ্র্যাচুইটি',
  bonus: 'উৎসব ভাতা',
  encash: 'ছুটি নগদায়ন',
  incomeTax: 'আয়কর',
  arrears: 'বকেয়া',
  employees: 'কর্মী',
};

interface LangValue {
  lang: Lang;
  banglaNumerals: boolean;
  setLang: (lang: Lang) => void;
  toggleNumerals: () => void;
  /** English default, or the Bangla string for `key` when the language is Bangla. */
  t: (en: string, key?: string) => string;
  /** Digits transliterated when Bangla numerals (or Bangla) are on. */
  n: (value: string | number) => string;
  money: (value: string | number | null | undefined, places?: number) => string;
  date: (iso: string | null | undefined) => string;
}

const LangContext = React.createContext<LangValue | null>(null);
const STORAGE_KEY = 'pilucent.bd.lang';

/**
 * Provides the language state, or reuses the one above it: the dashboard
 * shell provides it once, so the rail's switch and a screen's own switch are
 * the same state and the interface is never half-translated.
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const parent = React.useContext(LangContext);
  if (parent) return <>{children}</>;
  return <LangStateProvider>{children}</LangStateProvider>;
}

function LangStateProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>('en');
  const [banglaNumerals, setNumerals] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.lang === 'bn' || saved.lang === 'en') setLangState(saved.lang);
      if (typeof saved.banglaNumerals === 'boolean') setNumerals(saved.banglaNumerals);
    } catch {
      /* a missing or unreadable preference is the default */
    }
  }, []);

  const persist = (next: { lang: Lang; banglaNumerals: boolean }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked: the preference lasts for this page only */
    }
  };

  const value = React.useMemo<LangValue>(() => {
    const bangla = banglaNumerals || lang === 'bn';
    return {
      lang,
      banglaNumerals,
      setLang: (next) => {
        setLangState(next);
        persist({ lang: next, banglaNumerals });
      },
      toggleNumerals: () => {
        setNumerals(!banglaNumerals);
        persist({ lang, banglaNumerals: !banglaNumerals });
      },
      t: (en, key) => (lang === 'bn' && key && BN[key]) || en,
      n: (v) => digits(v, bangla),
      money: (v, places) => formatBDT(v, { places, bangla }),
      date: (iso) => formatDate(iso, bangla),
    };
  }, [lang, banglaNumerals]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = React.useContext(LangContext);
  if (!value) throw new Error('useLang must be used inside <LangProvider>.');
  return value;
}
