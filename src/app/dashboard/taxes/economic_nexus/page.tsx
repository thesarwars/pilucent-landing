'use client';

import * as React from 'react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  RefreshCw,
  BarChart3,
  Info,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Landmark,
  ChevronRight,
  Search,
  Check,
  Minus,
  Lock,
  X,
} from 'lucide-react';
import {
  Breadcrumb,
  Chip,
  StatTile,
  VioletButton,
  IconChip,
  money,
  type VioletTone,
} from '@/components/violet';
import { cn } from '@/lib/utils';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchNexusDashboard,
  fetchNexusAlerts,
  recalculateNexus,
  startNexusAgencySetup,
  markNexusState,
  unmarkNexusState,
  acknowledgeNexusAlert,
} from '@/app/helpers/backend';
import {
  DEMO_STATES,
  mapNexusStates,
  mapNexusAlerts,
  type NexusStatus,
  type Segment,
  type NexusAlert,
  statusOf,
  statusMeta,
  meterTone,
  isMet,
  pct,
  resolveRegistered,
  shortMoney,
  METER_COLOR,
} from './_components/nexus-data';
import { StateDetailDrawer } from './_components/StateDetailDrawer';
import { AlertsDrawer } from './_components/AlertsDrawer';
import { ExposureDrawer } from './_components/ExposureDrawer';
import { RegistrationWizard, type WizardForm } from './_components/RegistrationWizard';
import { LearnModal } from './_components/LearnModal';

// State-tile aligned with the row grid so the column strip + rows line up.
const GRID = 'minmax(0,1.4fr) 140px minmax(160px,1.2fr) 116px 122px 30px';

// The screen is API-driven (nexus_frontend.md §3). Flip to `true` only to preview
// the UI locally without a backend — it substitutes the bundled demo states.
const PREVIEW_WITH_DEMO_DATA = false;

const STATUS_ICON: Record<NexusStatus, React.ReactNode> = {
  registered: <Check className="h-3 w-3" strokeWidth={3} />,
  met: <AlertTriangle className="h-3 w-3" />,
  approaching: <TrendingUp className="h-3 w-3" />,
  monitored: <Activity className="h-3 w-3" />,
  na: <Minus className="h-3 w-3" />,
};

const Page = () => {
  // Precomputed dashboard ({ count, rows }) — the real, server-measured data.
  const {
    data: nexusData,
    isPending: nexusLoading,
    error: nexusError,
    refetch: refetchNexus,
  } = useFetch(['nexus_dashboard'], fetchNexusDashboard, {}, { retry: 0 });
  // 403 → the company's plan lacks `is_agency_tax`; hide the feature (§0/§9).
  const featureGated = (nexusError as any)?.response?.status === 403;
  const apiStates = useMemo(() => mapNexusStates(nexusData), [nexusData]);
  const states = useMemo(
    () => apiStates ?? (PREVIEW_WITH_DEMO_DATA ? DEMO_STATES : []),
    [apiStates]
  );

  // Alerts worklist (server-driven when available, else derived from the rows below).
  const { data: alertsData, refetch: refetchAlerts } = useFetch(
    ['nexus_alerts'],
    fetchNexusAlerts,
    {},
    { retry: 0 }
  );

  // ── page state (see spec §10) ──────────────────────────────────────
  const [nxQ, setNxQ] = useState('');
  const [nxSeg, setNxSeg] = useState<Segment>('all');
  const [nxSel, setNxSel] = useState<string | null>(null);
  const [nxMark, setNxMark] = useState<Record<string, boolean>>({});
  const [nxReg, setNxReg] = useState<Record<string, boolean>>({});
  const [nxAck, setNxAck] = useState<Record<string, boolean>>({});
  const [nxWizCode, setNxWizCode] = useState<string | null>(null);
  const [nxAlertsOpen, setNxAlertsOpen] = useState(false);
  const [nxExpOpen, setNxExpOpen] = useState(false);
  const [nxLearnOpen, setNxLearnOpen] = useState(false);
  const [nxSpin, setNxSpin] = useState(false);
  const [updated, setUpdated] = useState('—');
  const [recalcNote, setRecalcNote] = useState<{ evaluated: number; unattributed: number } | null>(
    null
  );

  // client-only stamp (deferred) to avoid a hydration mismatch on the time
  useEffect(() => {
    const t = setTimeout(
      () =>
        setUpdated(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })),
      0
    );
    return () => clearTimeout(t);
  }, []);

  // ── derive resolved rows ────────────────────────────────────────────
  const rows = useMemo(
    () =>
      states.map((s) => {
        const registered = resolveRegistered(s, nxReg);
        const marked = !!nxMark[s.code];
        const status = statusOf(s, registered, marked);
        const salesPct = pct(s.taxableSales, s.rule.salesThreshold);
        return { s, registered, marked, status, isReg: status === 'registered', salesPct, met: isMet(s) };
      }),
    [states, nxReg, nxMark]
  );

  const total = rows.length;
  const cRegistered = rows.filter((r) => r.status === 'registered').length;
  const cAction = rows.filter((r) => r.status === 'met').length;
  const cApproaching = rows.filter((r) => r.status === 'approaching').length;

  // ── alerts (§5) — server list when present, else derived from the rows ──
  const alerts: NexusAlert[] = useMemo(() => {
    const fromApi = mapNexusAlerts(alertsData, states);
    if (fromApi) return fromApi;
    return rows
      .filter((r) => r.status === 'met' || r.status === 'approaching')
      .map((r) => {
        const sp = r.salesPct;
        const tp = r.s.rule.txnThreshold ? pct(r.s.txnCount || 0, r.s.rule.txnThreshold) : 0;
        return {
          code: r.s.code,
          name: r.s.name,
          kind: (r.status === 'met' ? 'crossed' : 'approaching') as NexusAlert['kind'],
          pct: Math.round(Math.max(sp, tp)),
          when: r.status === 'met' ? r.s.since || 'recently' : 'this week',
        };
      });
  }, [alertsData, states, rows]);

  // Acknowledged = server flag OR a local (optimistic) acknowledge, keyed by state.
  const ackMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    alerts.forEach((a) => {
      if (a.acknowledged) m[a.code] = true;
    });
    return { ...m, ...nxAck };
  }, [alerts, nxAck]);
  const unread = alerts.filter((a) => !ackMap[a.code]).length;

  // ── table filter + sort (registered first, then alphabetical) ───────
  const visible = useMemo(() => {
    const q = nxQ.trim().toLowerCase();
    const segMatch = (st: NexusStatus) =>
      nxSeg === 'all' ||
      (nxSeg === 'registered' && st === 'registered') ||
      (nxSeg === 'action' && st === 'met') ||
      (nxSeg === 'approaching' && st === 'approaching');
    return rows
      .filter((r) => segMatch(r.status))
      .filter(
        (r) => !q || r.s.name.toLowerCase().includes(q) || r.s.code.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const ra = a.status === 'registered' ? 0 : 1;
        const rb = b.status === 'registered' ? 0 : 1;
        if (ra !== rb) return ra - rb;
        return a.s.name.localeCompare(b.s.name);
      });
  }, [rows, nxQ, nxSeg]);

  const selected = states.find((s) => s.code === nxSel) || null;
  const wizState = states.find((s) => s.code === nxWizCode) || null;

  // ── handlers ────────────────────────────────────────────────────────
  // Each mutation updates local state optimistically, then fires the API
  // best-effort and refetches. Failures are swallowed so the UI stays usable
  // before the backend exists; once it does, the refetch reconciles.
  const refetchAll = () => {
    refetchNexus();
    refetchAlerts();
  };
  const recalc = async () => {
    if (nxSpin) return;
    setNxSpin(true);
    try {
      const res: any = await recalculateNexus(); // { detail, evaluated_states, unattributed_sales }
      if (res) {
        setRecalcNote({
          evaluated: Number(res.evaluated_states ?? 0),
          unattributed: Number(res.unattributed_sales ?? 0),
        });
      }
      await Promise.allSettled([refetchNexus(), refetchAlerts()]);
    } catch {
      /* swallow — surfaced via the empty/error state */
    }
    setNxSpin(false);
    setUpdated('just now');
  };
  // Physical/manual mark → REGISTERED (POST) / de-register (DELETE) (§4.1–4.2).
  const toggleMark = (code: string) => {
    const willMark = !nxMark[code];
    setNxMark((m) => ({ ...m, [code]: willMark }));
    Promise.resolve(willMark ? markNexusState(code) : unmarkNexusState(code))
      .then(() => refetchAll())
      .catch(() => {});
  };
  // Wizard confirm → record the Sales-Tax handoff and mark registered (§4.3).
  const onRegistered = (code: string, form: WizardForm) => {
    setNxReg((r) => ({ ...r, [code]: true }));
    Promise.resolve(
      startNexusAgencySetup(code, {
        collection_start_date: form.effectiveDate,
        filing_frequency: form.frequency.toUpperCase(),
        sales_tax_permit_number: form.taxId,
        mark_registered: true,
      })
    )
      .then(() => refetchAll())
      .catch(() => {});
  };
  // Acknowledge one alert by uid when we have it (§5.2), else optimistic-only.
  const ack = (code: string) => {
    setNxAck((a) => ({ ...a, [code]: true }));
    const uid = alerts.find((a) => a.code === code)?.uid;
    if (uid) Promise.resolve(acknowledgeNexusAlert(uid)).then(() => refetchAlerts()).catch(() => {});
  };
  // No bulk endpoint — acknowledge each open alert individually.
  const markAll = () => {
    setNxAck(() => alerts.reduce((acc, a) => ({ ...acc, [a.code]: true }), {}));
    const pending = alerts.filter((a) => !ackMap[a.code] && a.uid).map((a) => a.uid as string);
    if (pending.length)
      Promise.allSettled(pending.map((uid) => Promise.resolve(acknowledgeNexusAlert(uid)))).then(
        () => refetchAlerts()
      );
  };
  const viewFromAlert = (code: string) => {
    setNxSel(code);
    setNxAlertsOpen(false);
  };
  const openWizard = (code: string) => setNxWizCode(code);

  const tiles: {
    seg: Segment;
    tone: VioletTone;
    icon: React.ReactNode;
    value: number;
    label: string;
    sub: string;
  }[] = [
    {
      seg: 'registered',
      tone: 'success',
      icon: <CheckCircle2 />,
      value: cRegistered,
      label: 'Registered',
      sub: 'collecting tax',
    },
    {
      seg: 'action',
      tone: 'danger',
      icon: <AlertTriangle />,
      value: cAction,
      label: 'Action needed',
      sub: 'met · not registered',
    },
    {
      seg: 'approaching',
      tone: 'warn',
      icon: <TrendingUp />,
      value: cApproaching,
      label: 'Approaching',
      sub: '≥80% of a threshold',
    },
    {
      seg: 'all',
      tone: 'violet',
      icon: <Activity />,
      value: total,
      label: 'Monitored',
      sub: 'states tracked',
    },
  ];

  const SEGMENTS: { key: Segment; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'registered', label: 'Registered' },
    { key: 'action', label: 'Action needed' },
    { key: 'approaching', label: 'Approaching' },
  ];

  const crumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Taxes', href: '/dashboard/taxes/taxes_agencies' },
    { label: 'Economic nexus' },
  ];

  // Feature-gated (403): the plan lacks `is_agency_tax` — hide the area, show upsell.
  if (featureGated) {
    return (
      <div className="font-jakarta text-v-ink900">
        <Breadcrumb items={crumbs} />
        <div className="mt-6 flex flex-col items-center gap-3 rounded-v-card bg-white px-6 py-16 text-center shadow-v-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-v-tint100 text-v-primary">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="m-0 text-[20px] font-extrabold text-v-ink900">Economic nexus</h1>
          <p className="max-w-[420px] text-[13.5px] text-v-ink500">
            Economic Nexus monitoring isn&apos;t included in your current plan. Upgrade to track
            sales-tax thresholds across every state.
          </p>
          <Link href="/dashboard/admin/subscription">
            <VioletButton variant="primary">View plans</VioletButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb items={crumbs} />

      {/* ── header ── */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Economic nexus
        </h1>
        <Chip tone="violet" className="border border-v-chip-border">
          {total} states tracked
        </Chip>
        <span className="hidden items-center gap-1.5 text-[12.5px] text-v-ink500 sm:inline-flex">
          <CheckCircle2 className="h-4 w-4 text-v-success-solid" />
          Updated {updated}
        </span>

        <span className="flex-1" />

        {/* alerts bell */}
        <button
          type="button"
          onClick={() => setNxAlertsOpen(true)}
          aria-label="Nexus alerts"
          className="relative flex h-10 w-10 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink700 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-v-danger-fg px-1 text-[10px] font-extrabold tabular-nums text-white ring-2 ring-white">
              {unread}
            </span>
          )}
        </button>

        <VioletButton
          variant="secondary"
          leftIcon={<RefreshCw className={cn('h-4 w-4', nxSpin && 'animate-spin')} />}
          onClick={recalc}
        >
          Recalculate
        </VioletButton>
        <VioletButton
          variant="primary"
          leftIcon={<BarChart3 className="h-4 w-4" />}
          onClick={() => setNxExpOpen(true)}
        >
          Exposure report
        </VioletButton>
      </div>

      {/* ── info strip ── */}
      <div
        className="mt-[18px] flex items-center gap-3 rounded-v-card border px-4 py-3"
        style={{
          backgroundImage: 'linear-gradient(120deg,#F4F0FF,#FBFAFF)',
          borderColor: '#ECE7FA',
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-v-tint100 text-v-primary">
          <Info className="h-[16px] w-[16px]" />
        </span>
        <p className="m-0 flex-1 text-[12.5px] leading-relaxed text-v-ink700">
          Selling across state lines can create a sales-tax obligation once you cross a state&apos;s{' '}
          <b className="text-v-ink900">sales</b> or <b className="text-v-ink900">transaction</b>{' '}
          threshold — even with no physical presence. We track sales by ship-to state and flag where
          you&apos;re approaching or have met each threshold.
        </p>
        <button
          type="button"
          onClick={() => setNxLearnOpen(true)}
          className="shrink-0 whitespace-nowrap text-[12.5px] font-bold text-v-primary transition-colors hover:text-v-primary-hover"
        >
          Learn how it works →
        </button>
      </div>

      {/* ── recalculate result: unattributed-sales hint (§3.3) ── */}
      {recalcNote && recalcNote.unattributed > 0 && (
        <div className="mt-3 flex items-center gap-2.5 rounded-v-tile border border-[#F3D9A6] bg-v-warn-bg px-3.5 py-2.5 text-[12.5px] text-v-warn-deep">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            <b className="tabular-nums">{money(recalcNote.unattributed)}</b> of sales couldn&apos;t
            be attributed to a state — add customer addresses to include them in the measurement.
          </span>
          <button
            type="button"
            onClick={() => setRecalcNote(null)}
            aria-label="Dismiss"
            className="flex h-6 w-6 items-center justify-center rounded-[8px] text-v-warn-deep/70 transition-colors hover:bg-v-warn-fg/10 hover:text-v-warn-deep"
          >
            <X className="h-[13px] w-[13px]" />
          </button>
        </div>
      )}

      {/* ── stat tiles ── */}
      <div className="mt-3.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <StatTile
            key={t.seg}
            tone={t.tone}
            icon={t.icon}
            value={t.value}
            label={t.label}
            sub={t.sub}
            bar={total ? Math.round((t.value / total) * 100) : 0}
            active={nxSeg === t.seg}
            onClick={() => setNxSeg(t.seg)}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* ── table ── */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Landmark />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-v-ink900">Nexus by state</div>
            <div className="text-[11.5px] text-v-ink400">
              {visible.length} of {total} states · measured by ship-to
            </div>
          </div>

          <span className="flex-1" />

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
            <input
              value={nxQ}
              onChange={(e) => setNxQ(e.target.value)}
              placeholder="Search state…"
              className="w-[190px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
            {SEGMENTS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setNxSeg(f.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  nxSeg === f.key
                    ? 'bg-white text-v-primary shadow-sm'
                    : 'text-v-ink500 hover:text-v-ink900'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* column strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-v-ink400"
          style={{ gridTemplateColumns: GRID }}
        >
          <span>State</span>
          <span>Measurement window</span>
          <span>Sales</span>
          <span className="text-right">Transactions</span>
          <span>Status</span>
          <span />
        </div>

        {/* rows */}
        {nexusLoading && states.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3.5"
              style={{ gridTemplateColumns: GRID }}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 shrink-0 animate-pulse rounded-[10px] bg-v-wash2" />
                <span className="h-3.5 w-24 animate-pulse rounded bg-v-wash2" />
              </div>
              <span className="h-3 w-28 animate-pulse rounded bg-v-wash2" />
              <span className="h-3 w-full animate-pulse rounded bg-v-wash2" />
              <span className="ml-auto h-3 w-10 animate-pulse rounded bg-v-wash2" />
              <span className="h-6 w-20 animate-pulse rounded-full bg-v-wash2" />
              <span />
            </div>
          ))
        ) : states.length === 0 ? (
          // count === 0 → company has never been recalculated (§3.1)
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-v-tint100 text-v-primary">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div className="text-sm font-bold text-v-ink900">No states measured yet</div>
            <div className="max-w-[360px] text-[13px] text-v-ink400">
              Run a recalculation to measure your sales by ship-to state against every state&apos;s
              thresholds.
            </div>
            <VioletButton
              variant="primary"
              className="mt-1.5"
              leftIcon={<RefreshCw className={cn('h-4 w-4', nxSpin && 'animate-spin')} />}
              onClick={recalc}
            >
              Recalculate now
            </VioletButton>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Search className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-bold text-v-ink900">No states match</div>
            <div className="text-[13px] text-v-ink400">Try a different search or segment.</div>
          </div>
        ) : (
          visible.map((r, i) => {
            const meta = statusMeta(r.status);
            const isNa = r.status === 'na';
            const barColor = METER_COLOR[r.isReg ? 'success' : meterTone(r.salesPct, r.met)];
            const hasTxnRule = r.s.rule.txnThreshold != null;
            const txnPct = hasTxnRule ? pct(r.s.txnCount || 0, r.s.rule.txnThreshold) : 0;
            const txnColor = METER_COLOR[r.isReg ? 'success' : meterTone(txnPct, txnPct >= 100)];
            return (
              <button
                key={r.s.code}
                type="button"
                onClick={() => setNxSel(r.s.code)}
                className={cn(
                  'grid w-full animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3 text-left transition-colors hover:bg-[#F7F5FC]',
                  r.isReg && 'bg-v-tint50'
                )}
                style={{ gridTemplateColumns: GRID, animationDelay: `${i * 0.03}s` }}
              >
                {/* state */}
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-extrabold',
                      metaTileClass(meta.tone)
                    )}
                  >
                    {r.s.code}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'truncate text-[13px] text-v-ink900',
                          r.isReg ? 'font-extrabold' : 'font-bold'
                        )}
                      >
                        {r.s.name}
                      </span>
                      {r.isReg && (
                        <Check
                          className="h-3.5 w-3.5 shrink-0 text-v-success-solid"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <div className="truncate text-[11px] text-v-ink400">
                      {r.s.rule.includableSales === '—'
                        ? 'local only'
                        : r.s.rule.includableSales.toLowerCase()}
                    </div>
                  </div>
                </div>

                {/* measurement window */}
                <div className="truncate text-[12px] tabular-nums text-v-ink500">{r.s.window}</div>

                {/* sales + meter */}
                <div className="min-w-0">
                  <div className="text-[13px] font-bold tabular-nums text-v-ink900">
                    {money(r.s.taxableSales)}
                  </div>
                  {isNa ? (
                    <div className="mt-1 text-[10.5px] text-v-ink400">No statewide tax</div>
                  ) : (
                    <div className="mt-1.5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-v-wash2">
                        <div
                          className="h-full origin-left animate-v-grow rounded-full"
                          style={{
                            width: `${Math.max(2, Math.min(100, r.salesPct))}%`,
                            background: barColor,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-[10.5px] tabular-nums text-v-ink400">
                        {Math.round(r.salesPct)}% of {shortMoney(r.s.rule.salesThreshold)}
                      </div>
                    </div>
                  )}
                </div>

                {/* transactions (+ a second meter for OR/AND states) */}
                <div className="text-right">
                  <div className="text-[12.5px] font-semibold tabular-nums text-v-ink700">
                    {r.s.txnCount != null ? r.s.txnCount.toLocaleString('en-US') : '—'}
                  </div>
                  {hasTxnRule && (
                    <div className="mt-1.5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-v-wash2">
                        <div
                          className="h-full origin-left animate-v-grow rounded-full"
                          style={{
                            width: `${Math.max(2, Math.min(100, txnPct))}%`,
                            background: txnColor,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-[10.5px] tabular-nums text-v-ink400">
                        {Math.round(txnPct)}% of {r.s.rule.txnThreshold?.toLocaleString('en-US')}
                      </div>
                    </div>
                  )}
                </div>

                {/* status */}
                <div>
                  <Chip tone={meta.tone} icon={STATUS_ICON[r.status]}>
                    {meta.label}
                  </Chip>
                </div>

                {/* chevron */}
                <ChevronRight className="h-[16px] w-[16px] justify-self-end text-v-ink300" />
              </button>
            );
          })
        )}

        {/* footer */}
        <div className="px-[22px] py-3.5 text-[12.5px] text-v-ink400">
          Showing {visible.length} of {total} jurisdictions · sorted registered-first, then
          alphabetical.
        </div>
      </div>

      {/* ── drawers & modals ── */}
      <StateDetailDrawer
        state={selected}
        open={!!selected}
        registered={
          !!selected && (resolveRegistered(selected, nxReg) || !!nxMark[selected.code])
        }
        marked={selected ? !!nxMark[selected.code] : false}
        onClose={() => setNxSel(null)}
        onRegister={() => selected && openWizard(selected.code)}
        onToggleMark={() => selected && toggleMark(selected.code)}
      />

      <AlertsDrawer
        open={nxAlertsOpen}
        onClose={() => setNxAlertsOpen(false)}
        alerts={alerts}
        ack={ackMap}
        onAck={ack}
        onMarkAll={markAll}
        onViewState={viewFromAlert}
      />

      <ExposureDrawer
        open={nxExpOpen}
        onClose={() => setNxExpOpen(false)}
        states={states}
        registered={nxReg}
        marked={nxMark}
        onRegister={(code) => openWizard(code)}
      />

      {wizState && (
        <RegistrationWizard
          key={wizState.code}
          open
          onClose={() => setNxWizCode(null)}
          state={wizState}
          onRegistered={onRegistered}
        />
      )}

      <LearnModal open={nxLearnOpen} onClose={() => setNxLearnOpen(false)} />
    </div>
  );
};

/** Status-tinted state-code tile background/text. */
function metaTileClass(tone: VioletTone): string {
  switch (tone) {
    case 'success':
      return 'bg-v-success-bg text-v-success-fg';
    case 'danger':
      return 'bg-v-danger-bg text-v-danger-fg';
    case 'warn':
      return 'bg-v-warn-bg text-v-warn-fg';
    case 'neutral':
      return 'bg-v-wash2 text-v-ink500';
    case 'violet':
    default:
      return 'bg-v-tint100 text-v-primary';
  }
}

export default Page;
