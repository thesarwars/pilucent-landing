'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import {
  Layers,
  Search,
  Plus,
  Star,
  LogIn,
  LogOut,
  Building2,
  X,
  ArrowRight,
  List,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SetCookies } from '@/lib/cookies/Cookies';
import { toast } from '@/lib/ToastService';
import {
  fetchWorkspaceMemberships,
  selectWorkspaceCompany,
  pinWorkspaceCompany,
  joinWorkspaceByCode,
  getUserProfile,
} from '@/app/helpers/backend';

/* ── helpers ─────────────────────────────────────────────────────────── */
const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

type Role = 'Owner' | 'Accountant' | 'Admin' | 'Viewer';

const ROLE_BADGE: Record<string, { fg: string; bg: string }> = {
  Owner: { fg: '#137A57', bg: '#DEF5E9' },
  Accountant: { fg: '#5B3BC4', bg: '#EEE9FF' },
  Admin: { fg: '#0E7490', bg: '#E0F2F7' },
  Viewer: { fg: '#6F6A85', bg: '#F0EEF6' },
};

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

const humanizeType = (t?: string) =>
  !t ? '—' : t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const badgeOf = (role?: string) => ROLE_BADGE[role || 'Viewer'] || ROLE_BADGE.Viewer;

const INPUT =
  'w-full rounded-[12px] border border-[#E2DDF0] bg-white px-3.5 py-2.5 text-[13.5px] text-[#16172A] outline-none transition-shadow placeholder:text-[#9A95AE] focus:border-[#7C4DFF] focus:shadow-[0_0_0_3px_#EEE9FF]';

interface Membership {
  company_uid: string;
  name: string;
  type?: string;
  ein?: string;
  role?: string;
  is_owner?: boolean;
  is_pinned?: boolean;
  last_opened_at?: string | null;
  avatar_seed?: string;
}

/* ── page ────────────────────────────────────────────────────────────── */
const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<'picker' | 'entering'>('picker');

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [summary, setSummary] = useState<{ total: number; owned: number; managed: number } | null>(null);
  const [user, setUser] = useState<any>(null);

  const [pickQ, setPickQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | Role>('All');
  const [pinOverride, setPinOverride] = useState<Record<string, boolean>>({});

  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<'create' | 'join' | 'signin'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [siUser, setSiUser] = useState('');
  const [siPass, setSiPass] = useState('');
  const [joining, setJoining] = useState(false);

  const [enterId, setEnterId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  /* load memberships + profile */
  useEffect(() => {
    let alive = true;
    (async () => {
      // If login handed us tokens in the URL (?tkn=&rt=), persist them to
      // localStorage (+ cookie) BEFORE any authed request — same as the
      // dashboard layout does. Without this, fetchWorkspaceMemberships() runs
      // with no token and errors out.
      try {
        const params = new URLSearchParams(window.location.search);
        const tkn = params.get('tkn');
        const rt = params.get('rt');
        if (tkn) {
          await swapTokens(tkn, rt || undefined);
          // strip tokens from the URL so they aren't left in history
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch {
        /* ignore — fall back to whatever is already in localStorage */
      }

      try {
        const res = await fetchWorkspaceMemberships();
        if (alive) {
          setMemberships(res?.memberships || []);
          setSummary(res?.summary || null);
        }
      } catch {
        if (alive) toast.error('Could not load your companies.');
      } finally {
        if (alive) setLoading(false);
      }
      try {
        const u = await getUserProfile();
        if (alive) setUser(u);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* hand-off → dashboard */
  useEffect(() => {
    if (screen !== 'entering') return;
    const t = setTimeout(() => router.push('/dashboard'), 1900);
    return () => clearTimeout(t);
  }, [screen, router]);

  const swapTokens = async (access: string, refresh?: string) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    try {
      await SetCookies(access);
    } catch {
      /* cookie best-effort */
    }
  };

  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('company_uid');
    window.location.href = `${redirectUrl}/pricing?action=logout`;
  };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();
  const firstName = user?.first_name || `${user?.name || ''}`.split(' ')[0] || 'there';
  const userName = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account';
  const userEmail = user?.email || '';

  const isPinned = (m: Membership) => pinOverride[m.company_uid] ?? !!m.is_pinned;

  const roleCounts = useMemo(() => {
    const c: Record<string, number> = { Owner: 0, Accountant: 0, Admin: 0 };
    memberships.forEach((m) => {
      if (m.role && c[m.role] !== undefined) c[m.role] += 1;
    });
    return c;
  }, [memberships]);

  const filtered = useMemo(() => {
    const q = pickQ.trim().toLowerCase();
    return memberships.filter((m) => {
      if (roleFilter !== 'All' && m.role !== roleFilter) return false;
      if (!q) return true;
      return `${m.name} ${m.ein || ''} ${m.role || ''} ${m.type || ''}`.toLowerCase().includes(q);
    });
  }, [memberships, pickQ, roleFilter]);

  const pinnedList = filtered.filter((m) => isPinned(m));
  const restList = filtered.filter((m) => !isPinned(m));
  const isFiltering = pickQ.trim() !== '' || roleFilter !== 'All';

  const enteringCo = memberships.find((m) => m.company_uid === enterId);

  /* ── open a company → swap to scoped token → enter ─────────────────── */
  const enterCompany = async (m: Membership) => {
    if (busyId) return;
    setBusyId(m.company_uid);
    try {
      const res = await selectWorkspaceCompany({ company_uid: m.company_uid });
      if (res?.success && res?.access) {
        await swapTokens(res.access, res.refresh);
        // Remember which company was opened so the no-subscription redirect can
        // pass company_uid to the pricing site even if /we omits it.
        localStorage.setItem('company_uid', m.company_uid);
        setEnterId(m.company_uid);
        setScreen('entering');
      } else {
        toast.error('Could not open this company.');
      }
    } catch {
      toast.error("You don't have access to this company, or it isn't active yet.");
    } finally {
      setBusyId(null);
    }
  };

  const togglePin = async (m: Membership, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isPinned(m);
    setPinOverride((p) => ({ ...p, [m.company_uid]: next }));
    try {
      await pinWorkspaceCompany({ company_uid: m.company_uid, is_pinned: next });
    } catch {
      setPinOverride((p) => ({ ...p, [m.company_uid]: !next }));
      toast.error('Could not update pin.');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return toast.info('Enter your invite code.');
    try {
      setJoining(true);
      const res = await joinWorkspaceByCode({ code: joinCode.trim() });
      if (res?.success && res?.access) {
        await swapTokens(res.access, res.refresh);
        if (res.company?.company_uid) localStorage.setItem('company_uid', res.company.company_uid);
        setMemberships(res.memberships || memberships);
        setSummary(res.summary || summary);
        setAddOpen(false);
        setEnterId(res.company?.company_uid || null);
        setScreen('entering');
      } else {
        toast.error('Invalid or expired invite code.');
      }
    } catch {
      toast.error('Invalid or expired invite code.');
    } finally {
      setJoining(false);
    }
  };

  /* ── company card ──────────────────────────────────────────────────── */
  const Card = ({ m, i }: { m: Membership; i: number }) => {
    const badge = badgeOf(m.role);
    const pinned = isPinned(m);
    const busy = busyId === m.company_uid;
    const otherBusy = !!busyId && !busy;
    return (
      <div
        onClick={() => enterCompany(m)}
        aria-busy={busy}
        className={cn(
          'group relative animate-v-pop overflow-hidden rounded-[16px] border p-4 transition-all',
          busy
            ? 'cursor-progress border-[#C9B6FF] shadow-[0_22px_44px_-20px_rgba(124,77,255,0.55)]'
            : 'cursor-pointer border-white/50 hover:-translate-y-[3px] hover:shadow-[0_22px_44px_-20px_rgba(0,0,0,0.55)]',
          otherBusy && 'pointer-events-none opacity-50',
        )}
        style={{ background: 'rgba(255,255,255,0.97)', animationDelay: `${i * 0.04}s` }}
      >
        {busy && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 rounded-[16px]"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(2px)' }}
          >
            <span className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-[3px] border-[#EDE7FF]" />
              <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#7C4DFF]" />
            </span>
            <span className="text-[12px] font-bold tracking-[0.01em] text-[#7C4DFF]">Opening…</span>
          </div>
        )}
        <span
          aria-hidden
          className={cn('pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left', busy ? 'opacity-100' : 'opacity-0')}
          style={{ backgroundImage: 'linear-gradient(90deg,#A78BFF,#7C4DFF)', animation: busy ? 'ws-cardbar 1.1s ease-in-out infinite' : 'none' }}
        />
        <div className="flex items-start gap-3">
          <span
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] text-[15px] font-extrabold text-white"
            style={{ backgroundImage: gradOf(m.avatar_seed || m.company_uid), boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.4)' }}
          >
            {initials(m.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[14.5px] font-extrabold text-[#16172A]">{m.name}</span>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ color: badge.fg, backgroundColor: badge.bg }}>
                {m.role || 'Viewer'}
              </span>
            </div>
            <div className="mt-0.5 truncate text-[12px] text-[#6F6A85]">
              {humanizeType(m.type)}
              {m.ein ? ` · EIN ${m.ein}` : ''}
            </div>
          </div>
          <button
            type="button"
            aria-label={pinned ? 'Unpin' : 'Pin'}
            onClick={(e) => togglePin(m, e)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ color: pinned ? '#F5B22E' : '#C9C4D6', backgroundColor: pinned ? '#FDF2DE' : '#F4F2FA' }}
          >
            <Star className="h-[15px] w-[15px]" fill={pinned ? '#F5B22E' : 'none'} />
          </button>
        </div>
        <div className="mt-3.5 flex items-center border-t border-[rgba(22,23,42,0.07)] pt-2.5">
          <span className="text-[11.5px] text-[#9A95AE]">
            {m.last_opened_at ? `Opened ${moment(m.last_opened_at).fromNow()}` : 'Not opened yet'}
          </span>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#7C4DFF] opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden font-jakarta"
      style={{
        backgroundImage:
          'radial-gradient(1100px 600px at 82% -10%, #ECE5FB, transparent 60%), radial-gradient(820px 560px at 4% 110%, #F1ECFB, transparent 55%)',
        backgroundColor: '#F5F3FB',
      }}
    >
      <style>{`
        @keyframes ws-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes ws-barfill { 0% { width: 4%; } 100% { width: 100%; } }
        @keyframes ws-float { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(-18px,22px) scale(1.06);} }
        @keyframes ws-cardbar { 0% { transform: scaleX(0); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(1); } }
      `}</style>

      <span aria-hidden className="pointer-events-none absolute -right-[120px] -top-[120px] h-[460px] w-[460px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,77,255,0.28), transparent 70%)', animation: 'ws-float 11s ease-in-out infinite' }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-[120px] -left-[110px] h-[360px] w-[360px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)', animation: 'ws-float 13s ease-in-out infinite' }} />

      {/* ── ENTERING ─────────────────────────────────────────────────── */}
      {screen === 'entering' && enteringCo ? (
        <div className="relative flex min-h-screen animate-v-pop flex-col items-center justify-center px-6">
          <div className="relative flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-[24px] text-[26px] font-extrabold text-white" style={{ backgroundImage: gradOf(enteringCo.avatar_seed || enteringCo.company_uid) }}>
            {initials(enteringCo.name)}
            <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)', backgroundSize: '200% 100%', animation: 'ws-shimmer 1.4s linear infinite' }} />
          </div>
          <div className="mt-5 text-[21px] font-extrabold text-[#16172A]">{enteringCo.name}</div>
          <div className="mt-1 text-[13px] text-[#6F6A85]">Preparing your books & securing your session</div>
          <div className="mt-5 h-[5px] w-[230px] overflow-hidden rounded-full bg-[#E7E2F3]">
            <div className="h-full rounded-full" style={{ backgroundImage: 'linear-gradient(90deg,#A78BFF,#7C4DFF)', animation: 'ws-barfill 1.8s cubic-bezier(0.5,0,0.3,1) forwards' }} />
          </div>
        </div>
      ) : (
        /* ── PICKER ───────────────────────────────────────────────────── */
        <div className="relative flex min-h-screen animate-v-pop flex-col">
          {/* top bar */}
          <div className="flex items-center gap-2.5 px-6 py-[22px] sm:px-10">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-white" style={{ backgroundImage: GRADS[0] }}>
              <Layers className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[17px] font-extrabold text-[#16172A]">Balanzify</span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
              title="Log out"
              className="mr-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#ECE9F4] bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#6F6A85] transition-colors hover:border-[#F3C6C0] hover:bg-[#FCE8E8] hover:text-[#D2483E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span className="hidden sm:inline">Log out</span>
            </button>
            <div className="flex items-center gap-2.5 rounded-full border border-[#ECE9F4] bg-white px-2.5 py-1.5">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ backgroundImage: gradOf(userEmail || userName) }}>
                {initials(userName)}
              </span>
              <div className="hidden pr-1.5 sm:block">
                <div className="text-[12.5px] font-bold leading-tight text-[#16172A]">{userName}</div>
                {userEmail && <div className="text-[10.5px] text-[#9A95AE]">{userEmail}</div>}
              </div>
            </div>
          </div>

          {/* centered column */}
          <div className="mx-auto w-full max-w-[940px] flex-1 px-6 pb-16">
            <div className="animate-v-rise">
              <h1 className="text-[32px] font-extrabold tracking-[-0.02em] text-[#16172A]">{greeting}, {firstName}</h1>
              <p className="mt-1.5 text-[14px] text-[#6F6A85]">
                {summary
                  ? `${summary.total} companies · ${summary.owned} you own, ${summary.managed} you manage`
                  : `${memberships.length} companies`}
              </p>
            </div>

            {/* search + add */}
            <div className="mt-5 flex animate-v-rise flex-wrap items-center gap-2.5" style={{ animationDelay: '0.05s' }}>
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#9A95AE]" />
                <input value={pickQ} onChange={(e) => setPickQ(e.target.value)} placeholder="Search companies, EIN or role" className="w-full rounded-[13px] border border-[#E2DDF0] bg-white/80 py-3 pl-10 pr-3.5 text-[13.5px] text-[#16172A] outline-none backdrop-blur transition-shadow placeholder:text-[#9A95AE] focus:border-[#7C4DFF] focus:shadow-[0_0_0_3px_#EEE9FF]" />
              </div>
              <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-[13px] border border-white/60 bg-white/70 px-4 py-3 text-[13.5px] font-bold text-[#16172A] backdrop-blur transition-colors hover:bg-white">
                <Plus className="h-4 w-4" /> Add company
              </button>
            </div>

            {/* role pills */}
            <div className="mt-4 flex animate-v-rise flex-wrap items-center gap-2" style={{ animationDelay: '0.1s' }}>
              {(['All', 'Owner', 'Accountant', 'Admin'] as const).map((r) => {
                const active = roleFilter === r;
                const count = r === 'All' ? memberships.length : roleCounts[r] || 0;
                return (
                  <button key={r} type="button" onClick={() => setRoleFilter(r)} className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors', active ? 'bg-[#7C4DFF] text-white' : 'border border-[#E2DDF0] bg-white text-[#44405C] hover:border-[#B49AFF]')}>
                    {r}
                    <span className={cn('rounded-full px-1.5 text-[10.5px] font-extrabold', active ? 'bg-white/25 text-white' : 'bg-[#F0EEF6] text-[#6F6A85]')}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* loading */}
            {loading ? (
              <div className="mt-12 flex items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-[#7C4DFF]" />
              </div>
            ) : memberships.length === 0 ? (
              <div className="mt-8 rounded-[16px] border-2 border-dashed border-[#E2DDF0] bg-white/60 px-6 py-12 text-center">
                <div className="text-[14px] font-bold text-[#16172A]">No companies yet</div>
                <div className="mt-1 text-[13px] text-[#9A95AE]">Create a company or join one with an invite code.</div>
                <button type="button" onClick={() => setAddOpen(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-[12px] bg-[#7C4DFF] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#8B5CF6]">
                  <Plus className="h-4 w-4" /> Add company
                </button>
              </div>
            ) : (
              <>
                {/* pinned */}
                {pinnedList.length > 0 && (
                  <div className="mt-7">
                    <div className="mb-3 flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-[#9A95AE]">
                      <Star className="h-3.5 w-3.5 text-[#F5B22E]" fill="#F5B22E" /> Pinned
                    </div>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {pinnedList.map((m, i) => (
                        <Card key={m.company_uid} m={m} i={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* all / results */}
                <div className="mt-7">
                  <div className="mb-3 flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-[#9A95AE]">
                    <List className="h-3.5 w-3.5" /> {isFiltering ? 'Results' : 'All companies'}
                  </div>
                  {filtered.length === 0 ? (
                    <div className="rounded-[16px] border-2 border-dashed border-[#E2DDF0] bg-white/60 px-6 py-12 text-center">
                      <div className="text-[14px] font-bold text-[#16172A]">No companies match your search</div>
                      <div className="mt-1 text-[13px] text-[#9A95AE]">Try a different name, EIN or role filter.</div>
                    </div>
                  ) : (
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {restList.map((m, i) => (
                        <Card key={m.company_uid} m={m} i={i} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ADD COMPANY MODAL ────────────────────────────────────────── */}
      {addOpen && (
        <>
          <div onClick={() => setAddOpen(false)} className="fixed inset-0 z-[100] animate-v-pop" style={{ background: 'rgba(14,11,26,0.6)', backdropFilter: 'blur(4px)' }} />
          <div className="fixed left-1/2 top-1/2 z-[110] w-[420px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 animate-v-pop rounded-[22px] bg-white p-6" style={{ boxShadow: '0 40px 90px -24px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-white" style={{ backgroundImage: GRADS[0] }}>
                <Building2 className="h-[17px] w-[17px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-extrabold text-[#16172A]">Add a company</div>
                <div className="text-[11.5px] text-[#9A95AE]">Create new, or join with an invite code</div>
              </div>
              <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#F4F2FA] text-[#9A95AE] transition-colors hover:bg-[#FCE8E8] hover:text-[#D2483E]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {[
                { key: 'create', label: 'Create new', sub: 'A fresh company file', icon: <Plus className="h-4 w-4" />, fg: '#7C4DFF', bg: '#EEE9FF' },
                { key: 'join', label: 'Join with code', sub: 'Use an invite from an owner', icon: <LogIn className="h-4 w-4" />, fg: '#0E7490', bg: '#E0F2F7' },
              ].map((o) => {
                const active = addMode === o.key || (o.key === 'join' && addMode === 'signin');
                return (
                  <button key={o.key} type="button" onClick={() => setAddMode(o.key as any)} className={cn('flex flex-col gap-2 rounded-[14px] border-[1.5px] p-3.5 text-left transition-colors', active ? 'border-[#7C4DFF] bg-[#F8F5FF]' : 'border-[#E2DDF0] bg-white hover:border-[#B49AFF]')}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-[9px]" style={{ color: o.fg, backgroundColor: o.bg }}>{o.icon}</span>
                    <div>
                      <div className="text-[13px] font-bold text-[#16172A]">{o.label}</div>
                      <div className="text-[11px] text-[#9A95AE]">{o.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {addMode === 'join' && (
              <div className="mt-4 animate-v-pop">
                <label className="mb-1.5 block text-[12px] font-semibold text-[#44405C]">Invite code</label>
                <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="BLZ-4F2A-9KQ" className={cn(INPUT, 'uppercase tracking-wide')} />
                <button type="button" onClick={() => setAddMode('signin')} className="mt-2 text-[11.5px] font-semibold text-[#7C4DFF] hover:underline">
                  Have a company login instead? Sign in &amp; link
                </button>
              </div>
            )}
            {addMode === 'signin' && (
              <div className="mt-4 flex animate-v-pop flex-col gap-3">
                <div className="rounded-[10px] bg-[#F7F5FC] px-3 py-2 text-[11.5px] text-[#6F6A85]">Link a company by its own login credentials.</div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#44405C]">User ID</label>
                  <input value={siUser} onChange={(e) => setSiUser(e.target.value)} placeholder="company-id" className={INPUT} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-[#44405C]">Password</label>
                  <input type="password" value={siPass} onChange={(e) => setSiPass(e.target.value)} placeholder="••••••••" className={INPUT} />
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={joining}
              onClick={() => {
                if (addMode === 'join') return handleJoin();
                if (addMode === 'create') {
                  setAddOpen(false);
                  return router.push('/company/setup?is_workspace=true');
                }
                return toast.info('Sign in & link is coming soon.');
              }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#7C4DFF] py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#8B5CF6] disabled:opacity-60"
              style={{ boxShadow: '0 12px 26px -10px rgba(124,77,255,0.7)' }}
            >
              {joining && <Loader2 className="h-4 w-4 animate-spin" />}
              {addMode === 'create' ? 'Create company' : addMode === 'join' ? 'Join company' : 'Sign in & link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
