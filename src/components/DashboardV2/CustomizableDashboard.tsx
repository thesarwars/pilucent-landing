'use client';

import 'react-grid-layout/css/styles.css';

import React, { useCallback, useEffect, useState } from 'react';
import { Responsive, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import {
  GripVertical,
  EyeOff,
  Sliders,
  LayoutGrid,
  Save,
  X,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ManageCardsDrawer from './ManageCardsDrawer';
import {
  DASHBOARD_CARDS,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_MARGIN,
  GRID_ROW_HEIGHT,
  getDefaultLayouts,
  getDefaultVisibility,
} from './dashboard-cards';
import {
  getDashboardLayout,
  resetDashboardLayout,
  saveDashboardLayout,
  syncWithServer,
  type DashboardLayouts,
} from '@/lib/dashboard-layout';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

interface Snapshot {
  layouts: DashboardLayouts;
  visibility: Record<string, boolean>;
}

export default function CustomizableDashboard({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}) {
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });

  const [mounted, setMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [backup, setBackup] = useState<Snapshot | null>(null);

  const [layouts, setLayouts] = useState<DashboardLayouts>(() => getDefaultLayouts());
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    getDefaultVisibility()
  );

  // Load any persisted customization once we're on the client.
  useEffect(() => {
    const stored = getDashboardLayout(userId, companyId);
    if (stored) {
      setLayouts(stored.layouts);
      setVisibility({ ...getDefaultVisibility(), ...stored.visibility });
    } else {
      setLayouts(getDefaultLayouts());
      setVisibility(getDefaultVisibility());
    }
    setMounted(true);
  }, [userId, companyId]);

  const onLayoutChange = useCallback((_current: unknown, all: unknown) => {
    setLayouts(all as DashboardLayouts);
  }, []);

  const setCardVisible = useCallback((id: string, next: boolean) => {
    setVisibility((prev) => ({ ...prev, [id]: next }));
  }, []);

  const enterCustomize = useCallback(() => {
    setBackup({ layouts: clone(layouts), visibility: { ...visibility } });
    setEditMode(true);
  }, [layouts, visibility]);

  const handleCancel = useCallback(() => {
    if (backup) {
      setLayouts(backup.layouts);
      setVisibility(backup.visibility);
    }
    setBackup(null);
    setEditMode(false);
    setDrawerOpen(false);
  }, [backup]);

  const handleSave = useCallback(async () => {
    const saved = saveDashboardLayout(userId, companyId, { layouts, visibility });
    setBackup(null);
    setEditMode(false);
    setDrawerOpen(false);
    try {
      await syncWithServer(userId, companyId, saved);
    } catch {
      // Local save already succeeded; server sync can be retried later.
    }
  }, [userId, companyId, layouts, visibility]);

  const handleReset = useCallback(() => {
    resetDashboardLayout(userId, companyId);
    setLayouts(getDefaultLayouts());
    setVisibility(getDefaultVisibility());
    setBackup(null);
    setResetOpen(false);
    setEditMode(false);
    setDrawerOpen(false);
    void syncWithServer(userId, companyId).catch(() => undefined);
  }, [userId, companyId]);

  const visibleCards = DASHBOARD_CARDS.filter((c) => visibility[c.id] !== false);

  return (
    <div>
      <style>{`
        .balanzify-rgl .react-grid-item.react-grid-placeholder {
          background: #6B5CE7;
          opacity: 0.12;
          border-radius: 16px;
        }
        .balanzify-rgl.is-editing .react-grid-item > .react-resizable-handle { opacity: 1; }
        .balanzify-rgl.is-editing .react-grid-item > .react-resizable-handle::after {
          right: 5px; bottom: 5px; width: 7px; height: 7px;
          border-color: #6B5CE7;
        }
        .balanzify-rgl .react-grid-item.react-draggable-dragging { z-index: 40; }
        .balanzify-rgl .react-grid-item.resizing { z-index: 40; }
      `}</style>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[2rem]">
          {editMode && (
            <p className="flex items-center gap-1.5 text-xs font-normal text-accent_text_black/55">
              <Sliders size={13} className="text-[#6B5CE7]" />
              Drag cards by their handle, resize from the corner, or hide them.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-accent_text_black/15 bg-white px-3 py-2 text-sm font-normal text-accent_text_black transition-colors hover:border-[#6B5CE7]/40 hover:text-[#6B5CE7]"
              >
                <LayoutGrid size={15} />
                Manage Cards
              </button>
              <button
                onClick={() => setResetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E03137]/20 bg-white px-3 py-2 text-sm font-normal text-[#E03137] transition-colors hover:bg-[#FFEEF1]"
              >
                <RotateCcw size={15} />
                Reset
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-xl border border-accent_text_black/15 bg-white px-3 py-2 text-sm font-normal text-accent_text_black transition-colors hover:bg-accent_text_black/5"
              >
                <X size={15} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6B5CE7] px-3.5 py-2 text-sm font-normal text-white transition-colors hover:bg-[#5B4CD9]"
              >
                <Save size={15} />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={enterCustomize}
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent_text_black/15 bg-white px-3.5 py-2 text-sm font-normal text-accent_text_black transition-colors hover:border-[#6B5CE7]/40 hover:text-[#6B5CE7]"
            >
              <Sliders size={15} />
              Customize Dashboard
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative">
        {editMode && (
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(107,92,231,0.08) 1px, transparent 1px)',
              backgroundSize: `calc(100% / ${GRID_COLS.lg}) 100%`,
            }}
          />
        )}

        {mounted && (
          <Responsive
            className={cn('balanzify-rgl relative z-10', editMode && 'is-editing')}
            width={width}
            breakpoints={GRID_BREAKPOINTS}
            cols={GRID_COLS}
            layouts={layouts}
            rowHeight={GRID_ROW_HEIGHT}
            margin={GRID_MARGIN}
            containerPadding={[0, 0]}
            compactor={verticalCompactor}
            dragConfig={{ enabled: editMode, handle: '.dnd-handle', threshold: 4 }}
            resizeConfig={{ enabled: editMode, handles: ['se'] }}
            onLayoutChange={onLayoutChange}
          >
            {visibleCards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  'relative h-full w-full overflow-hidden rounded-2xl',
                  editMode && 'ring-2 ring-[#6B5CE7]/30'
                )}
              >
                {editMode && (
                  <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 rounded-t-2xl bg-gradient-to-b from-[#6B5CE7]/12 to-transparent px-2.5 py-2">
                    <span className="dnd-handle inline-flex cursor-move items-center gap-1.5 rounded-lg bg-white/95 px-2 py-1 text-xs font-normal text-accent_text_black shadow-sm">
                      <GripVertical size={13} className="text-[#6B5CE7]" />
                      <span className="max-w-[160px] truncate">{card.title}</span>
                    </span>
                    <button
                      onClick={() => setCardVisible(card.id, false)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-xs font-normal text-accent_text_black shadow-sm transition-colors hover:text-[#E03137]"
                    >
                      <EyeOff size={13} />
                      Hide
                    </button>
                  </div>
                )}
                <div
                  className={cn(
                    'h-full w-full [&>*]:h-full',
                    editMode && 'pointer-events-none'
                  )}
                  style={{ overflow: 'auto', scrollbarWidth: 'none' }}
                >
                  {card.render()}
                </div>
              </div>
            ))}
          </Responsive>
        )}

        {visibleCards.length === 0 && mounted && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-accent_text_black/15 bg-white/60 py-16 text-center">
            <LayoutGrid size={28} className="text-accent_text_black/30" />
            <p className="mt-3 text-sm font-normal text-accent_text_black/60">
              All cards are hidden.
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#6B5CE7] px-3.5 py-2 text-sm font-normal text-white transition-colors hover:bg-[#5B4CD9]"
            >
              <LayoutGrid size={15} />
              Manage Cards
            </button>
          </div>
        )}
      </div>

      <ManageCardsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cards={DASHBOARD_CARDS}
        visibility={visibility}
        onToggle={setCardVisible}
      />

      {resetOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-accent_text_black/40 backdrop-blur-[1px]"
            onClick={() => setResetOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFEEF1] text-[#E03137]">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-base font-normal text-accent_text_black">
                  Reset dashboard to default?
                </h3>
                <p className="mt-1.5 text-sm font-normal leading-relaxed text-accent_text_black/60">
                  This restores the original card layout and visibility, and clears your saved
                  customization. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setResetOpen(false)}
                className="inline-flex items-center rounded-xl border border-accent_text_black/15 bg-white px-4 py-2 text-sm font-normal text-accent_text_black transition-colors hover:bg-accent_text_black/5"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E03137] px-4 py-2 text-sm font-normal text-white transition-colors hover:bg-[#C92A2F]"
              >
                <RotateCcw size={15} />
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
