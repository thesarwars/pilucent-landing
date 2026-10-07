'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlignLeft,
  Bell,
  CalendarDays,
  Check,
  ClipboardCheck,
  Mail,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/app/redux/store';
import { cn } from '@/lib/utils';
import { Chip, IconChip, Toggle, VioletButton, type VioletTone } from '@/components/violet';

/**
 * Notification preferences.
 *
 * UI only — there is no notifications endpoint yet, so Save commits to local
 * component state. Swap `persist()` for a mutation once the API lands; the
 * saved/draft split already matches how the other settings tabs post.
 */

/** Circumference of the completeness ring (r = 26). */
const RING_C = 163.36;

type AlertKey =
  | 'newAssignments'
  | 'dueDates'
  | 'details'
  | 'status'
  | 'projectName'
  | 'assignees'
  | 'deletions';

type AlertPrefs = Record<AlertKey, boolean>;

interface AlertDef {
  key: AlertKey;
  label: string;
  desc: string;
  icon: React.ReactNode;
  tone: VioletTone;
}

const ALERTS: AlertDef[] = [
  {
    key: 'newAssignments',
    label: 'New assignments',
    desc: 'When a task or project is assigned to you.',
    icon: <ClipboardCheck />,
    tone: 'violet',
  },
  {
    key: 'dueDates',
    label: 'Due dates',
    desc: 'Reminders as deadlines approach.',
    icon: <CalendarDays />,
    tone: 'warn',
  },
  {
    key: 'details',
    label: 'Details',
    desc: 'Edits to descriptions, notes, or attachments.',
    icon: <AlignLeft />,
    tone: 'violet',
  },
  {
    key: 'status',
    label: 'Status',
    desc: 'When a project or task changes status.',
    icon: <Activity />,
    tone: 'warn',
  },
  {
    key: 'projectName',
    label: 'Project name',
    desc: 'When a project is renamed.',
    icon: <Tag />,
    tone: 'violet',
  },
  {
    key: 'assignees',
    label: 'Assignees',
    desc: 'When people are added or removed.',
    icon: <Users />,
    tone: 'warn',
  },
  {
    key: 'deletions',
    label: 'Deletions',
    desc: 'When a task or project is deleted.',
    icon: <Trash2 />,
    tone: 'violet',
  },
];

const DEFAULTS: AlertPrefs = {
  newAssignments: true,
  dueDates: true,
  details: false,
  status: false,
  projectName: false,
  assignees: false,
  deletions: false,
};

const Notifications = () => {
  const user = useAppSelector((s) => s.userData.UserData);
  const deliveryEmail = user?.email || 'Add an email on your profile';

  const [saved, setSaved] = useState<AlertPrefs>(DEFAULTS);
  const [draft, setDraft] = useState<AlertPrefs>(DEFAULTS);

  const dirty = useMemo(
    () => ALERTS.some((a) => draft[a.key] !== saved[a.key]),
    [draft, saved]
  );

  const { onCount, pct, summary } = useMemo(() => {
    const on = ALERTS.filter((a) => draft[a.key]);
    const count = on.length;
    const total = ALERTS.length;
    let text: string;
    if (count === 0) text = 'All alerts are off.';
    else if (count === total) text = 'Every alert is on.';
    else {
      const names = on.map((a) => a.label);
      text = names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2} more` : '');
    }
    return { onCount: count, pct: Math.round((count / total) * 100), summary: text };
  }, [draft]);

  const toggle = (key: AlertKey, next: boolean) => setDraft((p) => ({ ...p, [key]: next }));

  const persist = () => {
    setSaved(draft);
    toast.success('Notification preferences saved.');
  };

  return (
    <div className="flex flex-col gap-5 font-jakarta">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative animate-v-rise overflow-hidden rounded-v-card border border-v-border bg-[linear-gradient(120deg,#FFFFFF_0%,#F5F1FF_100%)] p-6 shadow-v-card">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#7C4DFF,#A78BFF_45%,#5B3BC4)]" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-5">
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[16px] bg-v-tint100 text-v-primary shadow-[inset_0_0_0_1px_rgba(124,77,255,0.14)]">
            <Bell className="h-7 w-7" />
          </div>

          <div className="min-w-[220px] flex-1">
            <h2 className="m-0 text-[24px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
              Work notifications
            </h2>
            <p className="mt-1.5 max-w-[420px] text-[13px] leading-[1.5] text-v-ink500">
              Never miss a work update. Choose which project changes land in your inbox.
            </p>
            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-v-wash2 px-3 py-1.5 text-[12.5px] text-v-ink500">
              <Mail className="h-3.5 w-3.5 shrink-0 text-v-warn-fg" />
              <span className="truncate">{deliveryEmail}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-v-border pl-0 sm:border-l sm:pl-6">
            <div className="relative h-[72px] w-[72px] shrink-0">
              <svg width="72" height="72" viewBox="0 0 60 60" className="-rotate-90">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#EDE9F9" strokeWidth="7" />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="#7C4DFF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={(RING_C * (1 - pct / 100)).toFixed(1)}
                  style={{ transition: 'stroke-dashoffset 0.45s cubic-bezier(0.22,1,0.36,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span className="text-[15px] font-extrabold tabular-nums text-v-ink900">
                  {onCount}
                </span>
                <span className="mt-0.5 text-[9px] text-v-ink400">of {ALERTS.length}</span>
              </div>
            </div>
            <div className="max-w-[160px]">
              <div className="text-[13px] font-bold text-v-ink900">Alerts on</div>
              <div className="mt-1 text-[12px] leading-[1.45] text-v-ink500">{summary}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Delivery address ───────────────────────────────────────────── */}
      <section
        className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card"
        style={{ animationDelay: '0.06s' }}
      >
        <div className="flex items-center gap-3.5">
          <IconChip tone="warn" size="lg" className="h-[42px] w-[42px] rounded-xl">
            <Mail />
          </IconChip>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">
              Delivered to
            </div>
            <div className="mt-0.5 truncate text-[15px] font-bold text-v-ink900">
              {deliveryEmail}
            </div>
          </div>
          {user?.is_email_verified && (
            <Chip tone="success" icon={<Check className="h-3 w-3" />}>
              Verified
            </Chip>
          )}
        </div>
        <div className="mt-3 border-t border-v-border/70 pt-3 text-[12px] text-v-ink400">
          To change this address, edit your profile.{' '}
          <Link href="/dashboard/profile" className="font-semibold text-v-primary hover:underline">
            Go to your profile →
          </Link>
        </div>
      </section>

      {/* ── Alert rows ─────────────────────────────────────────────────── */}
      <section
        className="animate-v-rise rounded-v-card bg-white shadow-v-card"
        style={{ animationDelay: '0.12s' }}
      >
        <div className="px-6 pb-3 pt-5">
          <h3 className="m-0 text-[16px] font-bold tracking-[-0.01em] text-v-ink900">
            Project change alerts
          </h3>
          <p className="mt-1 max-w-[520px] text-[12px] text-v-ink400">
            Working with a team? Everyone gets new assignments and due dates, but each person tunes
            the rest here.
          </p>
        </div>

        {ALERTS.map((a) => (
          <div
            key={a.key}
            className="flex items-center gap-3.5 border-t border-v-border/70 px-6 py-3.5"
          >
            <IconChip tone={a.tone} size="lg">
              {a.icon}
            </IconChip>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold text-v-ink900">{a.label}</div>
              <div className="mt-0.5 text-[12px] text-v-ink400">{a.desc}</div>
            </div>
            <Toggle
              checked={draft[a.key]}
              onChange={(next) => toggle(a.key, next)}
              aria-label={a.label}
            />
          </div>
        ))}

        {dirty && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-3 border-t border-v-border/70 bg-v-warn-bg/50 px-6 py-4',
              'rounded-b-v-card'
            )}
          >
            <span className="flex-1 text-[13px] font-semibold text-v-warn-deep">
              You have unsaved changes.
            </span>
            <VioletButton variant="outline" size="sm" onClick={() => setDraft(saved)}>
              Cancel
            </VioletButton>
            <VioletButton variant="primary" size="sm" onClick={persist}>
              Save changes
            </VioletButton>
          </div>
        )}
      </section>
    </div>
  );
};

export default Notifications;
