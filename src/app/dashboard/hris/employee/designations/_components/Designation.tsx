'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Drawer, VioletButton, VioletInput, avatarGradient, initials } from '@/components/violet';
import { fetchDesignation, patchDesignation, postDesignation } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { LEVEL_META, LEVEL_TILES, levelOf, type Level } from './designationUtils';

const FORM_ID = 'designation-form';

const Designation = ({
  onSuccess,
  isOpen,
  setIsOpen,
  uid,
  refetch,
}: {
  onSuccess?: any;
  isOpen: boolean;
  setIsOpen: any;
  uid?: string;
  refetch?: any;
}) => {
  const [data, setData] = useState({ title: '', code: '' });
  const [level, setLevel] = useState<Level>('Mid');
  const [levelTouched, setLevelTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchDesignation(uid);
          if (res) {
            setData({ title: res?.title ?? '', code: res?.code ?? '' });
            setLevel(levelOf(res?.title));
            setLevelTouched(false);
          }
        } catch (error) {
          // handled upstream
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    } else {
      setData({ title: '', code: '' });
      setLevel('Mid');
      setLevelTouched(false);
    }
  }, [uid, isOpen]);

  // While the user hasn't explicitly picked a level, keep it in sync with the name.
  const shownLevel = levelTouched ? level : levelOf(data.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      // NOTE: API persists only { title, code } — level is a UI-derived display.
      if (uid) {
        const res = await patchDesignation(uid, data);
        if (res?.success) {
          toast.success('Designation updated.');
          refetch && refetch();
          setData({ title: '', code: '' });
          setIsOpen(false);
          onSuccess && onSuccess(res);
        }
      } else {
        const res = await postDesignation(data);
        if (res?.success) {
          toast.success('Designation created.');
          refetch && refetch();
          setData({ title: '', code: '' });
          setIsOpen(false);
          onSuccess && onSuccess(res);
        }
      }
    } catch (error) {
      // handled upstream
    } finally {
      setIsPending(false);
    }
  };

  const canSave = !!data.title.trim() && !isLoading;
  const previewName = data.title.trim() || 'Designation name';
  const previewInitials = useMemo(() => initials(data.title.trim() || '?'), [data.title]);

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<Star />}
      iconTone="violet"
      title={uid ? 'Edit designation' : 'Create designation'}
      sub="A job title employees can hold"
      width={400}
      footer={
        <>
          <VioletButton
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </VioletButton>
          <VioletButton
            type="submit"
            form={FORM_ID}
            variant="primary"
            className="flex-1"
            disabled={!canSave || isPending}
            leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Create designation'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-[88px] animate-pulse rounded-[14px] bg-v-wash2" />
          <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
          <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* live preview */}
          <div
            className="relative animate-v-pop overflow-hidden rounded-[14px] p-4"
            style={{ backgroundImage: 'linear-gradient(135deg,#FBFAFF,#F2EEFB)' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(124,77,255,0.16), transparent 70%)' }}
            />
            <div className="relative flex items-center gap-3">
              <span
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] text-base font-extrabold text-white"
                style={{ backgroundImage: avatarGradient(data.title.trim() || 'preview') }}
              >
                {previewInitials}
              </span>
              <div className="min-w-0">
                <div className="text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-v-ink400">
                  Preview
                </div>
                <div
                  className={cn(
                    'truncate text-[14px] font-extrabold',
                    data.title.trim() ? 'text-v-ink900' : 'text-v-ink400'
                  )}
                >
                  {previewName}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {data.code.trim() && (
                    <span className="rounded-full bg-v-tint100 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-v-primary">
                      {data.code.trim()}
                    </span>
                  )}
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: LEVEL_META[shownLevel].fg }}
                  >
                    {shownLevel} level
                  </span>
                </div>
              </div>
            </div>
          </div>

          <VioletInput
            label="Designation name"
            required
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="e.g. Software Engineer"
          />
          <VioletInput
            label="Designation code"
            value={data.code}
            onChange={(e) => setData({ ...data, code: e.target.value })}
            placeholder="e.g. SE-02"
            className="tabular-nums"
            hint="Optional — a short reference like SE-02"
          />

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-v-ink700">Level</span>
            <div className="grid grid-cols-4 gap-2">
              {LEVEL_TILES.map((lv) => {
                const active = shownLevel === lv;
                const meta = LEVEL_META[lv];
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => {
                      setLevel(lv);
                      setLevelTouched(true);
                    }}
                    className={cn(
                      'rounded-[11px] border px-2 py-2.5 text-[12px] font-bold transition-all duration-150',
                      active
                        ? 'border-transparent'
                        : 'border-v-border bg-white text-v-ink500 hover:text-v-ink900'
                    )}
                    style={active ? { backgroundColor: meta.bg, color: meta.fg } : undefined}
                  >
                    {lv}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      )}
    </Drawer>
  );
};

export default Designation;
