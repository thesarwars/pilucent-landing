'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check, ArrowLeftRight, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetCookies } from '@/lib/cookies/Cookies';
import { toast } from '@/lib/ToastService';
import { fetchWorkspaceMemberships, selectWorkspaceCompany } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';

interface Membership {
  company_uid: string;
  name: string;
  type?: string;
  ein?: string;
  role?: string;
  is_owner?: boolean;
  avatar_seed?: string;
}

const GRADS = [
  'linear-gradient(140deg,#7C4DFF,#A78BFF)',
  'linear-gradient(140deg,#1FA97A,#46C79A)',
  'linear-gradient(140deg,#0EA5C4,#5BD4E8)',
  'linear-gradient(140deg,#F5B22E,#FBD27A)',
  'linear-gradient(140deg,#EC4899,#F9A8D4)',
  'linear-gradient(140deg,#4F46E5,#818CF8)',
];
const gradOf = (seed: string) =>
  GRADS[Math.abs([...String(seed || '?')].reduce((a, c) => a + c.charCodeAt(0), 0)) % GRADS.length];

const initials = (name: string) =>
  (name || '?').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const ROLE_FALLBACK = (m: Membership) => m.role || (m.is_owner ? 'Owner' : 'Member');

const WorkspaceSwitcher = () => {
  const router = useRouter();
  const { Company } = useAppSelector((state: any) => state?.CompanyData);
  const [open, setOpen] = useState(false);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const currentUid = Company?.uid;
  const currentName = Company?.name || '—';
  const currentMembership = memberships.find((m) => m.company_uid === currentUid);
  const currentRole = currentMembership ? ROLE_FALLBACK(currentMembership) : Company?.is_owner ? 'Owner' : '';

  /* load the user's companies once */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchWorkspaceMemberships();
        if (alive) setMemberships(res?.memberships || []);
      } catch {
        /* silent — header should never block on this */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* close on outside click */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (open && !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const switchTo = async (m: Membership) => {
    if (busyId) return;
    if (m.company_uid === currentUid) {
      setOpen(false);
      return;
    }
    setBusyId(m.company_uid);
    try {
      const res = await selectWorkspaceCompany({ company_uid: m.company_uid });
      if (res?.success && res?.access) {
        localStorage.setItem('access_token', res.access);
        if (res.refresh) localStorage.setItem('refresh_token', res.refresh);
        // Remember which company was opened so the no-subscription redirect can
        // pass company_uid to the pricing site even if /we omits it.
        localStorage.setItem('company_uid', m.company_uid);
        try {
          await SetCookies(res.access);
        } catch {
          /* cookie best-effort */
        }
        toast.success(`Switched to ${m.name}`);
        // full reload so all company-scoped data re-initializes
        window.location.assign('/dashboard');
      } else {
        toast.error('Could not switch company.');
      }
    } catch {
      toast.error("You don't have access to this company, or it isn't active yet.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative max-md:hidden" ref={ref}>
      {/* trigger pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2.5 rounded-full border border-v-border bg-white px-2 py-1.5 transition-colors hover:border-[#B49AFF]',
          open && 'border-v-primary'
        )}
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
          style={{
            backgroundImage: gradOf(currentName),
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.4)',
          }}
        >
          {initials(currentName)}
        </span>
        <div className="hidden min-w-0 pr-0.5 text-left lg:block">
          <div className="max-w-[140px] truncate text-[12.5px] font-bold leading-tight text-v-ink900">
            {currentName}
          </div>
          {currentRole && (
            <div className="max-w-[140px] truncate text-[10.5px] text-v-ink400">{currentRole}</div>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-v-ink400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-[200] w-[300px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white shadow-v-modal">
          <div className="px-3.5 pb-2 pt-3 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-v-ink400">
            Your companies
          </div>

          {/* list — ~4 rows tall, the rest scrolls */}
          <div className="max-h-[248px] overflow-y-auto px-1.5">
            {loading && memberships.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-v-primary" />
              </div>
            ) : memberships.length === 0 ? (
              <div className="px-2.5 py-6 text-center text-[12.5px] text-v-ink400">
                No companies found.
              </div>
            ) : (
              memberships.map((m) => {
                const isCurrent = m.company_uid === currentUid;
                const busy = busyId === m.company_uid;
                return (
                  <button
                    key={m.company_uid}
                    type="button"
                    onClick={() => switchTo(m)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors',
                      isCurrent ? 'bg-v-tint100' : 'hover:bg-v-wash'
                    )}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[12px] font-extrabold text-white"
                      style={{
                        backgroundImage: gradOf(m.avatar_seed || m.name),
                        boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.4)',
                      }}
                    >
                      {initials(m.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-v-ink900">{m.name}</div>
                      <div className="truncate text-[11px] text-v-ink400">{ROLE_FALLBACK(m)}</div>
                    </div>
                    {busy ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-v-primary" />
                    ) : isCurrent ? (
                      <Check className="h-4 w-4 shrink-0 text-v-primary" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {/* footer actions */}
          <div className="mt-1 border-t border-v-border p-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push('/workspace');
              }}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-v-wash"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-v-wash2 text-v-ink500">
                <ArrowLeftRight className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-v-ink900">Switch workspace</div>
                <div className="text-[11px] text-v-ink400">See all companies you can access</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push('/workspace');
              }}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-v-wash"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-v-tint100 text-v-primary">
                <Plus className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-v-ink900">Add company</div>
                <div className="text-[11px] text-v-ink400">Create, join or sign in to another</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
