'use client';
import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Boxes,
  CalendarDays,
  Info,
  Lock,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import {
  Chip,
  FloatingActionBar,
  IconChip,
  VioletButton,
  VioletInput,
  VioletSelect,
  VioletTextarea,
  V,
} from '@/components/violet';

/**
 * Posting policy.
 *
 * UI only — there is no posting-policy endpoint yet, so Save commits to local
 * component state. The saved/draft split already matches how the other settings
 * tabs post, so wiring a mutation in later is a one-function change.
 */

/** Circumference of the auto-post ring (r = 25). */
const RING_C = 157.08;

/** Recent transaction amounts, used to project how many would be held. */
const TXNS = [
  18, 24, 32, 38, 45, 52, 58, 64, 72, 79, 85, 92, 104, 110, 126, 132, 148, 155, 168, 175, 188, 199,
  210, 225, 236, 248, 262, 275, 289, 301, 318, 332, 347, 362, 381, 399, 415, 434, 452, 480, 512,
  548, 590, 635, 680, 725, 790, 845, 910, 975, 1040, 1120, 1210, 1310, 1395, 1520, 1610, 1725,
  1840, 1950, 2080, 2210, 2390, 2650, 2890, 3150, 3480, 3920, 4350, 4980, 5600, 6800, 8200, 11500,
  18400,
];

type RuleMode = 'history' | 'always' | 'never';

const RULE_LABEL: Record<RuleMode, string> = {
  history: 'Based on history',
  always: 'Always required',
  never: 'Never required',
};

interface PolicyState {
  fromTo: RuleMode;
  location: RuleMode;
  threshold: string;
  effectiveDate: string;
  notes: string;
  fixedAssets: string;
  prepaid: string;
}

const DEFAULTS: PolicyState = {
  fromTo: 'history',
  location: 'history',
  threshold: '2,500.00',
  effectiveDate: '2024-08-05',
  notes: '',
  fixedAssets: '2,500.00',
  prepaid: '2,500.00',
};

/** "1234.5" → "1,234.50". */
const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Whole numbers stay whole: "2500" not "2,500.00". */
const disp = (n: number) => (n % 1 ? fmt(n) : n.toLocaleString('en-US'));

/** Strips $ and separators. NaN for blank, non-numeric, or negative. */
const parse = (s: string): number => {
  const cleaned = String(s ?? '').replace(/[$,\s]/g, '');
  if (cleaned === '') return NaN;
  const n = Number(cleaned);
  return isFinite(n) && n >= 0 ? n : NaN;
};

/** "2024-08-05" → "Aug 5, 2024", built from parts so SSR and client agree. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const prettyDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''));
  if (!m) return iso || 'Not set';
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
};

const Accounting = () => {
  const [saved, setSaved] = useState<PolicyState>(DEFAULTS);
  const [draft, setDraft] = useState<PolicyState>(DEFAULTS);
  /** Each card unlocks independently, as in the design. */
  const [editing, setEditing] = useState({ fields: false, timing: false, policy: false });

  const set = (key: keyof PolicyState, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const savedThreshold = parse(saved.threshold);
  const draftThreshold = parse(draft.threshold);
  const thresholdValid = !isNaN(draftThreshold);
  const fixedValid = !isNaN(parse(draft.fixedAssets));
  const prepaidValid = !isNaN(parse(draft.prepaid));

  /** Held/posted split against the live threshold, falling back to the saved one. */
  const { held, postedPct } = useMemo(() => {
    const active = thresholdValid ? draftThreshold : savedThreshold;
    const heldCount = TXNS.filter((a) => a > active).length;
    return {
      held: heldCount,
      postedPct: Math.round(((TXNS.length - heldCount) / TXNS.length) * 100),
    };
  }, [thresholdValid, draftThreshold, savedThreshold]);

  const dirty = useMemo(
    () => (Object.keys(DEFAULTS) as (keyof PolicyState)[]).some((k) => draft[k] !== saved[k]),
    [draft, saved]
  );
  const canSave = dirty && thresholdValid && fixedValid && prepaidValid;
  const isProjection = thresholdValid && draftThreshold !== savedThreshold;

  const closeAll = () => setEditing({ fields: false, timing: false, policy: false });

  const reset = () => {
    setDraft(saved);
    closeAll();
  };

  const persist = () => {
    if (!canSave) return;
    const normalized: PolicyState = {
      ...draft,
      threshold: fmt(parse(draft.threshold)),
      fixedAssets: fmt(parse(draft.fixedAssets)),
      prepaid: fmt(parse(draft.prepaid)),
    };
    setSaved(normalized);
    setDraft(normalized);
    closeAll();
    toast.success('Policy saved. Applies to new transactions from here on.');
  };

  /** Re-format a money field to two decimals once the user leaves it. */
  const normalizeOnBlur = (key: keyof PolicyState) => () => {
    const n = parse(draft[key] as string);
    if (!isNaN(n)) set(key, fmt(n));
  };

  return (
    <div className="flex flex-col gap-5 font-jakarta">
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        {/* ── Summary aside ────────────────────────────────────────────── */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:sticky lg:top-0 lg:w-[320px]">
          <div
            className="relative animate-v-rise overflow-hidden rounded-v-card p-6 text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroViolet }}
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#A78BFF,#7C4DFF_45%,#6EE7B7)]" />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[70px] -top-[70px] h-[190px] w-[190px] animate-v-float rounded-full"
              style={{ background: V.orb.violet }}
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-v-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-[17px] font-extrabold tracking-[-0.01em] text-white">
                    Accounting
                  </div>
                  <div className="text-[11.5px] text-white/55">Posting &amp; capitalization</div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="relative h-[92px] w-[92px] shrink-0">
                  <svg width="92" height="92" viewBox="0 0 60 60" className="-rotate-90">
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="rgba(255,255,255,0.13)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="#A78BFF"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={RING_C}
                      strokeDashoffset={(RING_C * (1 - postedPct / 100)).toFixed(1)}
                      style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.22,1,0.36,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-[20px] font-extrabold tabular-nums text-white">
                      {postedPct}%
                    </span>
                    <span className="mt-0.5 text-[8.5px] tracking-[0.04em] text-white/55">
                      AUTO-POST
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[20px] font-extrabold tabular-nums text-white">
                      {held}
                    </span>
                    <span className="text-[12px] font-bold text-v-300">held</span>
                  </div>
                  <div className="mt-1 text-[11.5px] leading-[1.4] text-white/55">
                    of {TXNS.length} recent transactions wait for your review
                    {isProjection && <span className="text-v-300"> · projection</span>}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-4">
                <SummaryRow
                  label="From / To"
                  value={RULE_LABEL[draft.fromTo]}
                  spark={draft.fromTo === 'history'}
                />
                <SummaryRow
                  label="Location"
                  value={RULE_LABEL[draft.location]}
                  spark={draft.location === 'history'}
                />
                <SummaryRow
                  label="Hold over"
                  value={`$${thresholdValid ? disp(draftThreshold) : '0'}`}
                  mono
                />
                <SummaryRow label="Effective" value={prettyDate(draft.effectiveDate)} mono />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-v-tile border border-v-border bg-white px-4 py-3 text-[12px] leading-[1.45] text-v-ink500">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-v-warn-fg" />
            Older history stays untouched — rules only apply going forward.
          </div>
        </aside>

        {/* ── Policy cards ─────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <PolicyCard
            title="Required fields"
            sub="What Pilucent insists on before a transaction can post."
            isEditing={editing.fields}
            onEdit={() => setEditing((p) => ({ ...p, fields: true }))}
            delay="0.06s"
          >
            <div className="flex items-center gap-3.5 py-3">
              <IconChip tone="neutral" size="lg">
                <Lock />
              </IconChip>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-v-ink900">Category</div>
                <div className="mt-0.5 text-[12px] text-v-ink400">
                  Always asked — keeps your books explainable.
                </div>
              </div>
              <Chip tone="neutral" icon={<Lock className="h-3 w-3" />}>
                Required
              </Chip>
            </div>

            <RuleRow
              icon={<ArrowLeftRight />}
              title="From / To"
              desc="Customer or vendor on the transaction."
              value={draft.fromTo}
              onChange={(v) => set('fromTo', v)}
              disabled={!editing.fields}
              hint="Pilucent checks how you’ve booked this payee before."
            />
            <RuleRow
              icon={<MapPin />}
              title="Location"
              desc="Store, department, or property."
              value={draft.location}
              onChange={(v) => set('location', v)}
              disabled={!editing.fields}
              hint="Pilucent checks how you’ve booked transactions like this before."
            />
          </PolicyCard>

          <PolicyCard
            title="Review & timing"
            sub="When a transaction pauses for a human, and from what date."
            isEditing={editing.timing}
            onEdit={() => setEditing((p) => ({ ...p, timing: true }))}
            delay="0.12s"
          >
            <div className="grid grid-cols-1 gap-3.5 pt-1 sm:grid-cols-2">
              <div className="rounded-v-tile border border-v-border p-4">
                <div className="flex items-center gap-2 text-[12.5px] font-bold text-v-ink900">
                  <ShieldCheck className="h-[15px] w-[15px] text-v-warn-fg" />
                  Hold for review
                </div>
                <VioletInput
                  money
                  wrapClassName="mt-2.5"
                  aria-label="Hold for review threshold"
                  inputMode="decimal"
                  value={draft.threshold}
                  disabled={!editing.timing}
                  onChange={(e) => set('threshold', e.target.value)}
                  onBlur={normalizeOnBlur('threshold')}
                  className={cn(!thresholdValid && 'border-v-danger-fg')}
                />
                <div
                  className={cn(
                    'mt-2 text-[12px]',
                    thresholdValid ? 'text-v-ink400' : 'text-v-danger-fg'
                  )}
                >
                  {thresholdValid
                    ? `${held} recent transactions would wait.`
                    : 'Enter $0 or more.'}
                </div>
              </div>

              <div className="rounded-v-tile border border-v-border p-4">
                <div className="flex items-center gap-2 text-[12.5px] font-bold text-v-ink900">
                  <CalendarDays className="h-[15px] w-[15px] text-v-primary" />
                  Effective date
                </div>
                <VioletInput
                  wrapClassName="mt-2.5"
                  type="date"
                  aria-label="Effective date"
                  value={draft.effectiveDate}
                  disabled={!editing.timing}
                  onChange={(e) => set('effectiveDate', e.target.value)}
                />
                <div className="mt-2 text-[12px] text-v-ink400">Applies on or after this day.</div>
              </div>
            </div>

            <div className="mt-4">
              <VioletTextarea
                label="Posting notes"
                rows={2}
                placeholder="Anything else a reviewer should check before posting?"
                value={draft.notes}
                disabled={!editing.timing}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </PolicyCard>

          <PolicyCard
            icon={<Boxes />}
            title="Asset & expense policy"
            sub="When a purchase is capitalized instead of expensed."
            isEditing={editing.policy}
            onEdit={() => setEditing((p) => ({ ...p, policy: true }))}
            delay="0.18s"
          >
            <div className="grid grid-cols-1 gap-3.5 pt-1 sm:grid-cols-2">
              <div className="rounded-v-tile border border-v-border p-4">
                <div className="text-[12.5px] font-bold text-v-ink900">Fixed assets</div>
                <VioletInput
                  money
                  wrapClassName="mt-2.5"
                  aria-label="Fixed assets threshold"
                  inputMode="decimal"
                  value={draft.fixedAssets}
                  disabled={!editing.policy}
                  onChange={(e) => set('fixedAssets', e.target.value)}
                  onBlur={normalizeOnBlur('fixedAssets')}
                  className={cn(!fixedValid && 'border-v-danger-fg')}
                />
                <div
                  className={cn('mt-2 text-[12px]', fixedValid ? 'text-v-ink400' : 'text-v-danger-fg')}
                >
                  {fixedValid
                    ? 'At or above this, purchases become fixed assets.'
                    : 'Enter $0 or more.'}
                </div>
              </div>

              <div className="rounded-v-tile border border-v-border p-4">
                <div className="text-[12.5px] font-bold text-v-ink900">Prepaid expenses</div>
                <VioletInput
                  money
                  wrapClassName="mt-2.5"
                  aria-label="Prepaid expenses threshold"
                  inputMode="decimal"
                  value={draft.prepaid}
                  disabled={!editing.policy}
                  onChange={(e) => set('prepaid', e.target.value)}
                  onBlur={normalizeOnBlur('prepaid')}
                  className={cn(!prepaidValid && 'border-v-danger-fg')}
                />
                <div
                  className={cn(
                    'mt-2 text-[12px]',
                    prepaidValid ? 'text-v-ink400' : 'text-v-danger-fg'
                  )}
                >
                  {prepaidValid
                    ? 'At or above this, expenses are spread over time.'
                    : 'Enter $0 or more.'}
                </div>
              </div>
            </div>
          </PolicyCard>
        </div>
      </div>

      {dirty && (
        <FloatingActionBar label="Posting policy" value="Unsaved changes">
          <VioletButton variant="ghost" size="sm" className="text-white/70" onClick={reset}>
            Reset
          </VioletButton>
          <VioletButton variant="primary" size="sm" onClick={persist} disabled={!canSave}>
            Save changes
          </VioletButton>
        </FloatingActionBar>
      )}
    </div>
  );
};

/* ── Presentational primitives ───────────────────────────────────────── */

const SummaryRow = ({
  label,
  value,
  spark,
  mono,
}: {
  label: string;
  value: string;
  spark?: boolean;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between gap-2.5">
    <span className="text-[12.5px] text-white/55">{label}</span>
    <span
      className={cn(
        'flex items-center gap-1.5 text-[12.5px] font-bold text-white',
        mono && 'tabular-nums'
      )}
    >
      {value}
      {spark && <Sparkles className="h-3 w-3 text-v-300" />}
    </span>
  </div>
);

interface PolicyCardProps {
  icon?: React.ReactNode;
  title: string;
  sub: string;
  isEditing: boolean;
  onEdit: () => void;
  delay?: string;
  children: React.ReactNode;
}

const PolicyCard = ({ icon, title, sub, isEditing, onEdit, delay, children }: PolicyCardProps) => (
  <section
    className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card"
    style={delay ? { animationDelay: delay } : undefined}
  >
    <div className="flex items-start gap-3">
      {icon && (
        <IconChip tone="warn" size="lg">
          {icon}
        </IconChip>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-[15px] font-bold tracking-[-0.01em] text-v-ink900">{title}</h3>
        <p className="mt-0.5 text-[12px] text-v-ink400">{sub}</p>
      </div>
      {isEditing ? (
        <Chip tone="violet" dot>
          Editing
        </Chip>
      ) : (
        <VioletButton
          variant="outline"
          size="sm"
          onClick={onEdit}
          leftIcon={<Pencil className="h-3.5 w-3.5" />}
        >
          Edit
        </VioletButton>
      )}
    </div>
    <div className="mt-3">{children}</div>
  </section>
);

const RuleRow = ({
  icon,
  title,
  desc,
  value,
  onChange,
  disabled,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: RuleMode;
  onChange: (next: RuleMode) => void;
  disabled: boolean;
  hint: string;
}) => (
  <div className="border-t border-v-border/60 py-3">
    <div className="flex flex-wrap items-center gap-3.5">
      <IconChip tone="violet" size="lg">
        {icon}
      </IconChip>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-bold text-v-ink900">{title}</div>
        <div className="mt-0.5 text-[12px] text-v-ink400">{desc}</div>
      </div>
      <VioletSelect
        wrapClassName="w-full sm:w-[190px]"
        aria-label={title}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as RuleMode)}
      >
        {(Object.keys(RULE_LABEL) as RuleMode[]).map((m) => (
          <option key={m} value={m}>
            {RULE_LABEL[m]}
          </option>
        ))}
      </VioletSelect>
    </div>
    {value === 'history' && (
      <div className="mt-2 flex items-start gap-1.5 pl-[50px] text-[12px] text-v-ink400">
        <Sparkles className="mt-px h-3 w-3 shrink-0 text-v-warn-fg" />
        {hint}
      </div>
    )}
  </div>
);

export default Accounting;
