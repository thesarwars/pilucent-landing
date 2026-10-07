'use client';

/**
 * Seniority-level helpers for the Designations screen.
 * UI-only: the API stores just `title` + `code`. The "level" is derived from the
 * title so the table chips and drawer preview can show seniority without any API change.
 */

import type { VioletTone } from '@/components/violet';

export type Level = 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Manager';

/** Levels offered as tappable tiles in the drawer (Manager is derived-only). */
export const LEVEL_TILES: Level[] = ['Junior', 'Mid', 'Senior', 'Lead'];

export const LEVEL_META: Record<Level, { tone: VioletTone; bg: string; fg: string }> = {
  Junior: { tone: 'teal', bg: '#E0F2F7', fg: '#0E7490' },
  Mid: { tone: 'violet', bg: '#EEE9FF', fg: '#7C4DFF' },
  Senior: { tone: 'warn', bg: '#FDF2DE', fg: '#B97608' },
  Lead: { tone: 'success', bg: '#DEF5E9', fg: '#137A57' },
  Manager: { tone: 'rose', bg: '#FCE7F0', fg: '#B43A6B' },
};

/** Infer a seniority level from a job title. */
export function levelOf(title?: string): Level {
  const t = `${title || ''}`.toLowerCase();
  if (/\blead\b|tech lead|team lead/.test(t)) return 'Lead';
  if (/manager|\bmgr\b|head of|\bhead\b|director|chief|\bvp\b|president/.test(t)) return 'Manager';
  if (/senior|\bsr\b|principal|\bstaff\b|lead /.test(t)) return 'Senior';
  if (/junior|\bjr\b|intern|associate|trainee|entry|assistant/.test(t)) return 'Junior';
  return 'Mid';
}
