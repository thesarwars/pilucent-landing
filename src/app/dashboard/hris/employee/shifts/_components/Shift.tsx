'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  CalendarClock,
  Clock,
  Loader2,
  Sandwich,
  CupSoda,
  EyeOff,
} from 'lucide-react';
import {
  Drawer,
  VioletButton,
  VioletInput,
  VioletSelect,
  VioletTextarea,
  IconChip,
  Toggle,
} from '@/components/violet';
import type { VioletTone } from '@/components/violet';
import { getShift, patchShift, postShifts } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { cn } from '@/lib/utils';
import { SHIFT_TYPES, kindMeta } from './shiftUtils';

interface ShiftFormProps {
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  uid?: string | undefined | null;
  refetch?: any;
}

const EMPTY = {
  title: '',
  status: 'ACTIVE',
  code: '',
  description: '',
  kind: '',
  regular_hour: '',
  grace_time: '',
  in_time: '',
  out_time: '',
  lunch_time: '',
  lunch_in_time: '',
  lunch_out_time: '',
  tiffin_time: '',
  tiffin_in_time: '',
  tiffin_out_time: '',
};

/* ── section eyebrow ─────────────────────────────────────────────────── */

function Section({
  icon,
  tone,
  title,
  delay,
  children,
}: {
  icon: React.ReactNode;
  tone: VioletTone;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-v-rise" style={{ animationDelay: `${delay}s` }}>
      <div className="mb-3 flex items-center gap-2">
        <IconChip tone={tone} size="sm">
          {icon}
        </IconChip>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-v-ink500">
          {title}
        </span>
        <span className="h-px flex-1 bg-[rgba(22,23,42,0.08)]" />
      </div>
      {children}
    </section>
  );
}

/* ── shift-type tiles ────────────────────────────────────────────────── */

function TypeTiles({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {SHIFT_TYPES.map((t) => {
        const meta = kindMeta(t.value);
        const active = value === t.value;
        const Icon = meta.Icon;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-[13px] border px-2 py-3 text-center transition-all duration-150',
              active
                ? 'border-v-primary bg-v-tint100 text-v-primary shadow-v-btn-sm'
                : 'border-v-border bg-white text-v-ink500 hover:border-v-primary/40 hover:text-v-ink900'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[10px]',
                active ? 'bg-white/70' : 'bg-v-wash2'
              )}
            >
              <Icon className="h-[17px] w-[17px]" />
            </span>
            <span className="text-[12px] font-bold leading-tight">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── form body ───────────────────────────────────────────────────────── */

const FORM_ID = 'shift-form';

const ShiftForm: React.FC<ShiftFormProps> = ({ setIsOpen, isOpen, uid, refetch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY });

  const set = (patch: Partial<typeof EMPTY>) => setFormData((p) => ({ ...p, ...patch }));

  useEffect(() => {
    if (!isOpen) return;
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const data = await getShift(uid);
          if (data) setFormData((p) => ({ ...p, ...data }));
        } catch (error) {
          // handled upstream
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    } else {
      setFormData({ ...EMPTY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      if (uid) {
        const res = await patchShift(uid, formData);
        if (res?.success) {
          refetch && refetch();
          toast.success('Shift updated.');
          setFormData({ ...EMPTY });
          setIsOpen(false);
        }
      } else {
        const res = await postShifts(formData);
        if (res?.success) {
          refetch && refetch();
          toast.success('Shift created.');
          setFormData({ ...EMPTY });
          setIsOpen(false);
        }
      }
    } catch (error) {
      // handled upstream
    } finally {
      setIsPending(false);
    }
  };

  const canSave =
    !!formData.title.trim() && !!formData.code.trim() && !!formData.kind && !isLoading;

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      icon={<CalendarClock />}
      iconTone="violet"
      title={uid ? 'Edit shift' : 'Create shift'}
      sub="Define working hours, breaks & type"
      width={460}
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
            {isPending ? 'Saving…' : uid ? 'Save changes' : 'Create shift'}
          </VioletButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
            <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
          </div>
          <div className="h-20 animate-pulse rounded-v-input bg-v-wash2" />
          <div className="h-24 animate-pulse rounded-v-input bg-v-wash2" />
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* SHIFT INFO */}
          <Section icon={<CalendarClock />} tone="violet" title="Shift info" delay={0.04}>
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <VioletInput
                  label="Shift name"
                  required
                  value={formData.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g. Morning"
                />
                <VioletInput
                  label="Shift code"
                  required
                  hideRequiredMark
                  value={formData.code}
                  onChange={(e) => set({ code: e.target.value })}
                  placeholder="e.g. 10234"
                />
              </div>
              <VioletInput
                label="Description"
                value={formData.description}
                onChange={(e) => set({ description: e.target.value })}
                placeholder="Short note about this shift"
              />
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-v-ink700">
                  Shift type <span className="text-v-primary">*</span>
                </span>
                <TypeTiles value={formData.kind} onChange={(v) => set({ kind: v })} />
              </div>
            </div>
          </Section>

          {/* SHIFT TIME */}
          <Section icon={<Clock />} tone="violet" title="Shift time" delay={0.08}>
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <VioletSelect
                  label="Regular hours"
                  required
                  value={formData.regular_hour}
                  onChange={(e) => set({ regular_hour: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="8">8 Hours</option>
                  <option value="9">9 Hours</option>
                  <option value="10">10 Hours</option>
                  <option value="12">12 Hours</option>
                </VioletSelect>
                <VioletInput
                  label="Shift late (min)"
                  type="number"
                  required
                  value={formData.grace_time}
                  onChange={(e) => set({ grace_time: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <VioletInput
                  label="Shift in"
                  type="time"
                  required
                  value={formData.in_time}
                  onChange={(e) => set({ in_time: e.target.value })}
                />
                <VioletInput
                  label="Shift out"
                  type="time"
                  required
                  value={formData.out_time}
                  onChange={(e) => set({ out_time: e.target.value })}
                />
              </div>
            </div>
          </Section>

          {/* LUNCH TIME */}
          <Section icon={<Sandwich />} tone="warn" title="Lunch time" delay={0.12}>
            <div className="flex flex-col gap-3.5">
              <VioletSelect
                label="Lunch duration"
                value={formData.lunch_time}
                onChange={(e) => set({ lunch_time: e.target.value })}
              >
                <option value="">None</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </VioletSelect>
              <div className="grid grid-cols-2 gap-3">
                <VioletInput
                  label="Lunch in"
                  type="time"
                  value={formData.lunch_in_time}
                  onChange={(e) => set({ lunch_in_time: e.target.value })}
                />
                <VioletInput
                  label="Lunch out"
                  type="time"
                  value={formData.lunch_out_time}
                  onChange={(e) => set({ lunch_out_time: e.target.value })}
                />
              </div>
            </div>
          </Section>

          {/* TIFFIN TIME */}
          <Section icon={<CupSoda />} tone="teal" title="Tiffin time" delay={0.16}>
            <div className="flex flex-col gap-3.5">
              <VioletSelect
                label="Tiffin duration"
                value={formData.tiffin_time}
                onChange={(e) => set({ tiffin_time: e.target.value })}
              >
                <option value="">None</option>
                <option value="15">15 Minutes</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
              </VioletSelect>
              <div className="grid grid-cols-2 gap-3">
                <VioletInput
                  label="Tiffin in"
                  type="time"
                  value={formData.tiffin_in_time}
                  onChange={(e) => set({ tiffin_in_time: e.target.value })}
                />
                <VioletInput
                  label="Tiffin out"
                  type="time"
                  value={formData.tiffin_out_time}
                  onChange={(e) => set({ tiffin_out_time: e.target.value })}
                />
              </div>
            </div>
          </Section>

          {/* MARK AS INACTIVE */}
          <div
            className="flex animate-v-rise items-center justify-between rounded-v-input border border-v-border bg-v-card-subtle px-3.5 py-3"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-2.5">
              <IconChip tone="neutral" size="sm">
                <EyeOff />
              </IconChip>
              <div>
                <div className="text-[13px] font-semibold text-v-ink900">Mark as inactive</div>
                <div className="text-[11px] text-v-ink400">
                  Hidden from scheduling until re-activated
                </div>
              </div>
            </div>
            <Toggle
              checked={formData.status === 'IN_ACTIVE'}
              onChange={(next) => set({ status: next ? 'IN_ACTIVE' : 'ACTIVE' })}
              aria-label="Mark as inactive"
            />
          </div>
        </form>
      )}
    </Drawer>
  );
};

export default ShiftForm;
