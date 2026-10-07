'use client';

import React, { useMemo, useState } from 'react';
import { Search, X, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_MODULES,
  type DashboardCard,
  type DashboardModule,
} from './dashboard-cards';

const MODULE_CHIP: Record<DashboardModule, string> = {
  Finance: 'bg-[#EBEBFF] text-[#6B5CE7]',
  HR: 'bg-[#E6FBEF] text-[#0BAC24]',
  Payroll: 'bg-[#EAF1FF] text-[#3462FA]',
  Sales: 'bg-[#FFF3DF] text-[#F0A541]',
  Banking: 'bg-[#E2F4FF] text-[#3FA9F5]',
  Tax: 'bg-[#FFE8EC] text-[#E03137]',
  AI: 'bg-[#F0EBFF] text-[#7C5CE7]',
  Support: 'bg-[#FFEFE6] text-[#E5732B]',
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-[#6B5CE7]' : 'bg-accent_text_black/15'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function ManageCardsDrawer({
  open,
  onClose,
  cards,
  visibility,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  cards: DashboardCard[];
  visibility: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [module, setModule] = useState<DashboardModule | 'All'>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      const matchesModule = module === 'All' || c.module === module;
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.module.toLowerCase().includes(q);
      return matchesModule && matchesQuery;
    });
  }, [cards, query, module]);

  const visibleCount = cards.filter((c) => visibility[c.id] !== false).length;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] transition-opacity duration-200',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      )}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-accent_text_black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-[380px] flex-col bg-white shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Manage cards"
      >
        <div className="flex items-start justify-between gap-3 border-b border-accent_text_black/10 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBEBFF] text-[#6B5CE7]">
              <LayoutGrid size={18} />
            </span>
            <div>
              <h2 className="text-sm font-normal text-accent_text_black">Manage Cards</h2>
              <p className="mt-0.5 text-xs font-normal text-accent_text_black/55">
                {visibleCount} of {cards.length} cards visible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-accent_text_black/60 transition-colors hover:bg-accent_text_black/5 hover:text-accent_text_black"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 border-b border-accent_text_black/10 p-4 sm:p-5">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-accent_text_black/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards…"
              className="w-full rounded-xl border border-accent_text_black/10 bg-white py-2 pl-9 pr-3 text-sm font-normal text-accent_text_black outline-none transition-colors placeholder:text-accent_text_black/40 focus:border-[#6B5CE7]/50"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...DASHBOARD_MODULES] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModule(m)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-normal transition-colors',
                  module === m
                    ? 'bg-[#6B5CE7] text-white'
                    : 'bg-accent_text_black/5 text-accent_text_black/70 hover:bg-accent_text_black/10'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm font-normal text-accent_text_black/50">
              No cards match your search.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {filtered.map((card) => {
                const isVisible = visibility[card.id] !== false;
                return (
                  <li
                    key={card.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-accent_text_black/10 bg-white p-3 transition-colors hover:border-[#6B5CE7]/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-md',
                            isVisible
                              ? 'bg-[#EBEBFF] text-[#6B5CE7]'
                              : 'bg-accent_text_black/5 text-accent_text_black/40'
                          )}
                        >
                          {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                        </span>
                        <h3 className="truncate text-sm font-normal text-accent_text_black">
                          {card.title}
                        </h3>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-normal',
                            MODULE_CHIP[card.module]
                          )}
                        >
                          {card.module}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-normal leading-relaxed text-accent_text_black/55">
                        {card.description}
                      </p>
                    </div>
                    <Toggle
                      checked={isVisible}
                      onChange={() => onToggle(card.id, !isVisible)}
                      label={`Toggle ${card.title}`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
