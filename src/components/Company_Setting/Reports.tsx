'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Info, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Chip, VioletButton, VioletSelect } from '@/components/violet';


type Align = 'Left' | 'Center' | 'Right';
type NegStyle = '-100' | '(100)' | '100-';
type Density = 'Compact view' | 'Normal view' | 'Cozy view' | 'Comfort view';

interface ReportPrefs {
  hdrLogo: boolean;
  hdrPeriod: boolean;
  hdrName: boolean;
  hdrAlign: Align;
  hdrLayout: 'name' | 'title';
  ftDate: boolean;
  ftTime: boolean;
  ftBasis: boolean;
  ftAlign: Align;
  colHiOn: boolean;
  colHiColor: string;
  bandOn: boolean;
  bandColor: string;
  emptyMode: 'dash' | 'blank';
  borders: string;
  divide1000: boolean;
  hideZero: boolean;
  hideCurrency: boolean;
  negStyle: NegStyle;
  negRed: boolean;
  decMode: 'round' | 'places';
  decPlaces: number;
  viewDensity: Density;
}

const DEFAULTS: ReportPrefs = {
  hdrLogo: false,
  hdrPeriod: false,
  hdrName: false,
  hdrAlign: 'Center',
  hdrLayout: 'name',
  ftDate: false,
  ftTime: false,
  ftBasis: false,
  ftAlign: 'Center',
  colHiOn: false,
  colHiColor: '#DDE7F5',
  bandOn: false,
  bandColor: '#E7EAED',
  emptyMode: 'blank',
  borders: 'Default',
  divide1000: false,
  hideZero: false,
  hideCurrency: false,
  negStyle: '-100',
  negRed: false,
  decMode: 'places',
  decPlaces: 2,
  viewDensity: 'Compact view',
};

const SWATCHES = [
  '#DDE7F5',
  '#D7EFEA',
  '#DDF0D8',
  '#E7F3CE',
  '#FBF0C9',
  '#FBE2CC',
  '#F7D9DE',
  '#F3D9EC',
  '#E4DBF3',
  '#E7EAED',
];

const BORDER_OPTS = [
  'Default',
  'No borders',
  'Horizontal borders',
  'Vertical borders',
  'Inner borders',
  'Outer borders',
  'Horizontal and outer borders',
  'Vertical and outer borders',
  'All borders',
];

const ALIGN_OPTS: Align[] = ['Left', 'Center', 'Right'];
const DENSITY_OPTS: Density[] = ['Compact view', 'Normal view', 'Cozy view', 'Comfort view'];
const DENSITY_PAD: Record<Density, string> = {
  'Compact view': '4px',
  'Normal view': '7px',
  'Cozy view': '11px',
  'Comfort view': '15px',
};

type RowKind = 'group' | 'line' | 'sub' | 'total' | 'gp' | 'grand';

/** Sample Profit & Loss used by the preview: [kind, label, amount, indent]. */
const SAMPLE_PL: [RowKind, string, number | null, number][] = [
  ['group', 'Income', null, 0],
  ['line', 'Design income', 0, 1],
  ['line', 'Discounts given', -89.5, 1],
  ['sub', 'Landscaping Services', 1477.5, 1],
  ['sub', 'Job Materials', 4736.47, 2],
  ['line', 'Fountains and Garden Lighting', 2246.5, 3],
  ['line', 'Plants and Soil', 2351.97, 3],
  ['line', 'Sprinklers and Drip Systems', 138.0, 3],
  ['total', 'Total for Job Materials', 4736.47, 2],
  ['sub', 'Labor', 300.0, 2],
  ['line', 'Installation', 250.0, 3],
  ['line', 'Maintenance and Repair', 50.0, 3],
  ['total', 'Total for Labor', 300.0, 2],
  ['total', 'Total for Landscaping Services', 6513.97, 1],
  ['line', 'Pest Control Services', 110.0, 1],
  ['line', 'Sales of Product Income', 912.75, 1],
  ['line', 'Services', 503.55, 1],
  ['total', 'Total for Income', 10200.77, 0],
  ['group', 'Cost of Goods Sold', null, 0],
  ['line', 'Cost of Goods Sold', 405.0, 1],
  ['total', 'Total for Cost of Goods Sold', 405.0, 0],
  ['gp', 'Gross Profit', 9795.77, 0],
  ['group', 'Expenses', null, 0],
  ['line', 'Advertising', 74.86, 1],
  ['sub', 'Automobile', 463.37, 1],
  ['line', 'Fuel', 349.41, 2],
  ['total', 'Total for Automobile', 463.37, 1],
  ['line', 'Equipment Rental', 112.0, 1],
  ['line', 'Insurance', 241.23, 1],
  ['sub', 'Legal & Professional Fees', 1170.0, 1],
  ['line', 'Accounting', 640.0, 2],
  ['line', 'Bookkeeper', 55.0, 2],
  ['line', 'Lawyer', 400.0, 2],
  ['total', 'Total for Legal & Professional Fees', 1170.0, 1],
  ['line', 'Rent or Lease', 900.0, 1],
  ['sub', 'Utilities', 331.39, 1],
  ['line', 'Gas and Electric', 200.53, 2],
  ['line', 'Telephone', 130.86, 2],
  ['total', 'Total for Utilities', 331.39, 1],
  ['total', 'Total for Expenses', 3292.85, 0],
  ['grand', 'Net Income', 6502.92, 0],
];

const Reports = () => {
  const [prefs, setPrefs] = useState<ReportPrefs>(DEFAULTS);
  const [saved, setSaved] = useState<ReportPrefs>(DEFAULTS);
  const [panels, setPanels] = useState<Record<string, boolean>>({ header: true });
  const [infoOpen, setInfoOpen] = useState(true);

  const set = <K extends keyof ReportPrefs>(key: K, value: ReportPrefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));
  const toggle = (key: keyof ReportPrefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const togglePanel = (key: string) => setPanels((p) => ({ ...p, [key]: !p[key] }));

  const dirty = useMemo(
    () => (Object.keys(DEFAULTS) as (keyof ReportPrefs)[]).some((k) => prefs[k] !== saved[k]),
    [prefs, saved]
  );

  const persist = () => {
    if (!dirty) return;
    setSaved(prefs);
    toast.success('Report settings saved. They apply to standard and custom reports.');
  };

  /* ── Preview derivations ──────────────────────────────────────────── */

  /** Formats one amount under the current number rules. */
  const money = (a: number | null): string => {
    if (a === null) return prefs.emptyMode === 'dash' ? '—' : '';
    if (a === 0 && prefs.hideZero) return '';
    let v = prefs.divide1000 ? a / 1000 : a;
    const neg = v < 0;
    v = Math.abs(v);
    const str =
      prefs.decMode === 'round'
        ? Math.round(v).toLocaleString('en-US')
        : v.toLocaleString('en-US', {
            minimumFractionDigits: prefs.decPlaces,
            maximumFractionDigits: prefs.decPlaces,
          });
    let body = (prefs.hideCurrency ? '' : '$') + str;
    if (neg) {
      if (prefs.negStyle === '(100)') body = `(${body})`;
      else if (prefs.negStyle === '100-') body = `${body}-`;
      else body = `-${body}`;
    }
    return body;
  };

  const b = prefs.borders;
  const hBorder = ['Default', 'Horizontal borders', 'Inner borders', 'All borders', 'Horizontal and outer borders'].includes(b);
  const vBorder = ['Vertical borders', 'Inner borders', 'All borders', 'Vertical and outer borders'].includes(b);
  const outerBorder = ['Outer borders', 'Horizontal and outer borders', 'Vertical and outer borders', 'All borders'].includes(b);
  const colVBorder = vBorder ? '1px solid #EAEDE9' : 'none';
  const pad = DENSITY_PAD[prefs.viewDensity];

  const rows = useMemo(() => {
    let lineIdx = 0;
    return SAMPLE_PL.map(([kind, label, amount, indent], i) => {
      const isLine = kind === 'line';
      if (isLine) lineIdx++;
      const banded = prefs.bandOn && isLine && lineIdx % 2 === 0;
      const shaded = kind === 'group' || kind === 'gp';
      const rowBg = banded ? prefs.bandColor : shaded ? '#F4F6F4' : 'transparent';
      const keyCol = kind === 'total' || kind === 'gp' || kind === 'grand' || kind === 'group';
      return {
        id: i,
        label,
        amount: money(amount),
        indent,
        bold: !isLine,
        heavy: kind === 'group' || kind === 'gp' || kind === 'grand',
        negative: amount !== null && amount < 0,
        rowBg,
        amountBg: prefs.colHiOn && keyCol ? prefs.colHiColor : rowBg,
      };
    });
  }, [prefs]);

  const headerLines = useMemo(() => {
    const title = 'Profit and Loss';
    const name = 'Grasshopper Landscapes';
    const period = '1 January 2024 – 11 June 2025';
    const lines: { text: string; size: string; weight: number; muted: boolean }[] = [];
    if (prefs.hdrName && prefs.hdrLayout === 'name') {
      lines.push({ text: name, size: '19px', weight: 800, muted: false });
      lines.push({ text: title, size: '15px', weight: 600, muted: true });
    } else {
      lines.push({ text: title, size: '19px', weight: 800, muted: false });
      if (prefs.hdrName) lines.push({ text: name, size: '15px', weight: 600, muted: true });
    }
    if (prefs.hdrPeriod) lines.push({ text: period, size: '12.5px', weight: 500, muted: true });
    return lines;
  }, [prefs.hdrName, prefs.hdrLayout, prefs.hdrPeriod]);

  const footerText = useMemo(() => {
    const parts: string[] = [];
    if (prefs.ftDate) parts.push('Prepared on Jun 11, 2025');
    if (prefs.ftTime) parts.push('9:42 AM');
    if (prefs.ftBasis) parts.push('Accrual basis');
    return parts.join('  ·  ');
  }, [prefs.ftDate, prefs.ftTime, prefs.ftBasis]);

  const justify =
    prefs.hdrAlign === 'Left' ? 'flex-start' : prefs.hdrAlign === 'Right' ? 'flex-end' : 'center';

  return (
    <div className="flex flex-col items-start gap-5 font-jakarta xl:flex-row">
      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div className="flex w-full min-w-0 animate-v-rise flex-col rounded-v-card bg-white shadow-v-card xl:w-[460px] xl:shrink-0">
        <div className="px-6 pb-4 pt-5">
          <h2 className="m-0 text-[18px] font-extrabold tracking-[-0.02em] text-v-ink900">
            Report settings
          </h2>
          <p className="mt-1 text-[12px] text-v-ink400">
            Style every standard and custom report — changes preview live.
          </p>
        </div>

        {infoOpen && (
          <div className="mx-6 mb-4 flex items-center gap-2.5 rounded-v-input border border-v-teal-bg bg-v-teal-bg/50 px-3.5 py-3">
            <Info className="h-4 w-4 shrink-0 text-v-teal-fg" />
            <span className="flex-1 text-[12.5px] text-v-ink700">
              These customizations apply to standard and custom reports.
            </span>
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
              aria-label="Dismiss"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-v-ink400 transition-colors hover:bg-v-wash2 hover:text-v-ink900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <GroupLabel>Visual</GroupLabel>

        <Panel title="Header" open={!!panels.header} onToggle={() => togglePanel('header')}>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <CheckRow label="Company logo" checked={prefs.hdrLogo} onChange={() => toggle('hdrLogo')} />
            <CheckRow label="Report period" checked={prefs.hdrPeriod} onChange={() => toggle('hdrPeriod')} />
            <CheckRow label="Company name" checked={prefs.hdrName} onChange={() => toggle('hdrName')} />
          </div>
          <VioletSelect
            wrapClassName="mt-4 max-w-[220px]"
            label="Header alignment"
            value={prefs.hdrAlign}
            onChange={(e) => set('hdrAlign', e.target.value as Align)}
          >
            {ALIGN_OPTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </VioletSelect>
          {prefs.hdrName && (
            <div className="mt-4 animate-v-rise">
              <div className="text-[12px] text-v-ink500">Header layout</div>
              <RadioRow
                label="Company name first"
                checked={prefs.hdrLayout === 'name'}
                onChange={() => set('hdrLayout', 'name')}
              />
              <RadioRow
                label="Report title first"
                checked={prefs.hdrLayout === 'title'}
                onChange={() => set('hdrLayout', 'title')}
              />
            </div>
          )}
        </Panel>

        <Panel title="Footer" open={!!panels.footer} onToggle={() => togglePanel('footer')}>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <CheckRow label="Date prepared" checked={prefs.ftDate} onChange={() => toggle('ftDate')} />
            <CheckRow label="Time prepared" checked={prefs.ftTime} onChange={() => toggle('ftTime')} />
            <CheckRow
              label="Report basis (cash vs. accrual)"
              checked={prefs.ftBasis}
              onChange={() => toggle('ftBasis')}
            />
          </div>
          <VioletSelect
            wrapClassName="mt-4 max-w-[220px]"
            label="Footer alignment"
            value={prefs.ftAlign}
            onChange={(e) => set('ftAlign', e.target.value as Align)}
          >
            {ALIGN_OPTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </VioletSelect>
        </Panel>

        <Panel title="Column highlights" open={!!panels.colHi} onToggle={() => togglePanel('colHi')}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13.5px] text-v-ink700">
              Show column highlights in key columns
            </span>
            <ColorPicker
              on={prefs.colHiOn}
              color={prefs.colHiColor}
              label="Column highlight color"
              onPick={(c) => {
                if (c === null) set('colHiOn', false);
                else setPrefs((p) => ({ ...p, colHiOn: true, colHiColor: c }));
              }}
            />
          </div>
        </Panel>

        <Panel title="Banded rows" open={!!panels.band} onToggle={() => togglePanel('band')}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13.5px] text-v-ink700">Banded row color</span>
            <ColorPicker
              on={prefs.bandOn}
              color={prefs.bandColor}
              label="Banded row color"
              onPick={(c) => {
                if (c === null) set('bandOn', false);
                else setPrefs((p) => ({ ...p, bandOn: true, bandColor: c }));
              }}
            />
          </div>
        </Panel>

        <Panel
          title="Empty cells"
          badge="NEW"
          open={!!panels.empty}
          onToggle={() => togglePanel('empty')}
        >
          <div className="text-[12px] text-v-ink500">Show empty cells as</div>
          <div className="flex gap-8">
            <RadioRow
              label="Dash"
              checked={prefs.emptyMode === 'dash'}
              onChange={() => set('emptyMode', 'dash')}
            />
            <RadioRow
              label="Blank"
              checked={prefs.emptyMode === 'blank'}
              onChange={() => set('emptyMode', 'blank')}
            />
          </div>
        </Panel>

        <Panel title="Gridlines" open={!!panels.grid} onToggle={() => togglePanel('grid')}>
          <VioletSelect
            label="Report borders"
            value={prefs.borders}
            onChange={(e) => set('borders', e.target.value)}
          >
            {BORDER_OPTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </VioletSelect>
        </Panel>

        <GroupLabel>Formatting</GroupLabel>

        <Panel title="Number" open={!!panels.number} onToggle={() => togglePanel('number')}>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <CheckRow
              label="Divide by 1000"
              checked={prefs.divide1000}
              onChange={() => toggle('divide1000')}
            />
            <CheckRow
              label="Don’t show zero amounts"
              checked={prefs.hideZero}
              onChange={() => toggle('hideZero')}
            />
            <CheckRow
              label="Don’t show currency symbol"
              checked={prefs.hideCurrency}
              onChange={() => toggle('hideCurrency')}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <VioletSelect
              wrapClassName="w-[130px]"
              label="Negative numbers"
              value={prefs.negStyle}
              onChange={(e) => set('negStyle', e.target.value as NegStyle)}
            >
              {(['-100', '(100)', '100-'] as NegStyle[]).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </VioletSelect>
            <div className="pb-2.5">
              <CheckRow label="Show in red" checked={prefs.negRed} onChange={() => toggle('negRed')} />
            </div>
          </div>

          <div className="mt-4 text-[12.5px] font-bold text-v-ink900">Decimals</div>
          <RadioRow
            label="Round to the nearest whole number"
            checked={prefs.decMode === 'round'}
            onChange={() => set('decMode', 'round')}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <RadioRow
              label="Show decimals up to"
              checked={prefs.decMode === 'places'}
              onChange={() => set('decMode', 'places')}
            />
            <VioletSelect
              wrapClassName="w-[76px]"
              aria-label="Decimal places"
              value={String(prefs.decPlaces)}
              onChange={(e) => set('decPlaces', Number(e.target.value))}
            >
              <option value="0">0</option>
              <option value="2">2</option>
            </VioletSelect>
            <span className="text-[13.5px] text-v-ink500">places</span>
          </div>
        </Panel>

        <Panel title="View" open={!!panels.view} onToggle={() => togglePanel('view')} last>
          <VioletSelect
            wrapClassName="max-w-[220px]"
            label="Default view of the reports"
            value={prefs.viewDensity}
            onChange={(e) => set('viewDensity', e.target.value as Density)}
          >
            {DENSITY_OPTS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </VioletSelect>
        </Panel>

        <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-b-v-card border-t border-v-border/70 bg-white px-6 py-3.5">
          <VioletButton variant="outline" size="sm" onClick={() => setPrefs(DEFAULTS)}>
            Reset
          </VioletButton>
          <VioletButton variant="primary" size="sm" onClick={persist} disabled={!dirty}>
            Save
          </VioletButton>
        </div>
      </div>

      {/* ── Live preview ───────────────────────────────────────────────── */}
      <div
        className="w-full min-w-0 animate-v-rise overflow-x-auto rounded-v-card bg-v-ink900 p-6 shadow-v-card xl:sticky xl:top-0"
        style={{ animationDelay: '0.06s' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Chip tone="violet" dot>
            Live preview
          </Chip>
          <span className="text-[11.5px] text-white/45">Sample Profit and Loss</span>
        </div>

        <div className="relative mx-auto min-w-[520px] max-w-[760px] overflow-hidden rounded-md bg-white px-9 pb-7 pt-8 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.5)]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 -rotate-[26deg] whitespace-nowrap text-[40px] font-bold tracking-[0.14em] text-v-primary/10"
          >
            SAMPLE REPORT
          </div>

          {/* Header */}
          <div className="flex items-center gap-4" style={{ justifyContent: justify }}>
            {prefs.hdrLogo && (
              <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-lg bg-v-primary text-[16px] font-extrabold tracking-[0.04em] text-white/90">
                GL
              </div>
            )}
            <div className="min-w-0" style={{ textAlign: prefs.hdrAlign.toLowerCase() as any }}>
              {headerLines.map((h, i) => (
                <div
                  key={i}
                  className={cn('leading-[1.3] tracking-[-0.01em]', h.muted ? 'text-v-ink500' : 'text-v-ink900')}
                  style={{ fontSize: h.size, fontWeight: h.weight }}
                >
                  {h.text}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div
            className="mt-6 overflow-hidden rounded-[3px]"
            style={{ border: outerBorder ? '1px solid #D7DCD7' : 'none' }}
          >
            <div
              className="grid items-center border-b-2 border-[#E4E9E2] bg-[#FBFBFA]"
              style={{ gridTemplateColumns: '1fr 168px' }}
            >
              <div
                className="px-3.5 text-[12.5px] font-extrabold text-v-ink500"
                style={{ paddingTop: pad, paddingBottom: pad }}
              >
                Account
              </div>
              <div
                className="px-3.5 text-right text-[12.5px] font-extrabold text-v-ink500"
                style={{
                  paddingTop: pad,
                  paddingBottom: pad,
                  borderLeft: colVBorder,
                  background: prefs.colHiOn ? prefs.colHiColor : '#FBFBFA',
                }}
              >
                Total
              </div>
            </div>

            {rows.map((r) => (
              <div
                key={r.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: '1fr 168px',
                  background: r.rowBg,
                  borderBottom: hBorder ? '1px solid #EAEDE9' : 'none',
                }}
              >
                <div
                  className={cn(
                    'pr-3.5 text-[13px]',
                    r.heavy ? 'font-extrabold' : r.bold ? 'font-bold' : 'font-normal',
                    r.bold ? 'text-v-ink900' : 'text-v-ink700'
                  )}
                  style={{
                    paddingTop: pad,
                    paddingBottom: pad,
                    paddingLeft: `${14 + r.indent * 18}px`,
                  }}
                >
                  {r.label}
                </div>
                <div
                  className={cn(
                    'px-3.5 text-right text-[12.5px] tabular-nums',
                    r.heavy ? 'font-extrabold' : r.bold ? 'font-bold' : 'font-normal',
                    r.negative && prefs.negRed ? 'text-v-danger-fg' : 'text-v-ink900'
                  )}
                  style={{
                    paddingTop: pad,
                    paddingBottom: pad,
                    borderLeft: colVBorder,
                    background: r.amountBg,
                  }}
                >
                  {r.amount}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {footerText && (
            <div
              className="mt-4 border-t border-[#EFF2EE] pt-3 text-[11.5px] leading-[1.6] text-v-ink400"
              style={{ textAlign: prefs.ftAlign.toLowerCase() as any }}
            >
              {footerText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Presentational primitives ───────────────────────────────────────── */

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 pb-1 pt-3 text-[15px] font-extrabold tracking-[-0.01em] text-v-ink900">
    {children}
  </div>
);

const Panel = ({
  title,
  badge,
  open,
  onToggle,
  last,
  children,
}: {
  title: string;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  last?: boolean;
  children: React.ReactNode;
}) => (
  <div className={cn('border-t border-v-border/70', last && 'border-b')}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center gap-2.5 px-6 py-4 text-left text-[13.5px] font-bold text-v-ink900"
    >
      <span>{title}</span>
      {badge && (
        <span className="rounded-full bg-v-warn-fg px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.06em] text-white">
          {badge}
        </span>
      )}
      <span className="flex-1" />
      <ChevronDown
        className={cn('h-4 w-4 text-v-ink400 transition-transform', open && 'rotate-180')}
      />
    </button>
    {open && <div className="animate-v-rise px-6 pb-5">{children}</div>}
  </div>
);

const CheckRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className="flex items-center gap-2.5 text-left"
  >
    <span
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors',
        checked ? 'border-v-primary bg-v-primary' : 'border-v-ink300 bg-white'
      )}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </span>
    <span className="text-[13.5px] text-v-ink900">{label}</span>
  </button>
);

const RadioRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    onClick={onChange}
    className="flex items-center gap-2.5 py-1.5 text-left"
  >
    <span
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors',
        checked ? 'border-v-primary' : 'border-v-ink300'
      )}
    >
      {checked && <span className="h-[9px] w-[9px] rounded-full bg-v-primary" />}
    </span>
    <span className="text-[13.5px] text-v-ink900">{label}</span>
  </button>
);

/** Swatch button + popover. `onPick(null)` turns the highlight off. */
const ColorPicker = ({
  on,
  color,
  label,
  onPick,
}: {
  on: boolean;
  color: string;
  label: string;
  onPick: (color: string | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (c: string | null) => {
    onPick(c);
    setOpen(false);
  };

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="relative h-[30px] w-[30px] overflow-hidden rounded-[7px] border border-v-border"
        style={{ background: on ? color : '#FFFFFF' }}
      >
        {!on && (
          <svg width="30" height="30" viewBox="0 0 30 30" className="absolute inset-0">
            <line x1="4" y1="26" x2="26" y2="4" stroke="#D2483E" strokeWidth="1.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 animate-v-pop rounded-[14px] border border-v-border bg-white p-3 shadow-v-modal">
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              aria-label="No highlight"
              onClick={() => pick(null)}
              className={cn(
                'relative flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-md border bg-white',
                !on ? 'border-v-primary' : 'border-v-border'
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <line x1="4" y1="20" x2="20" y2="4" stroke="#D2483E" strokeWidth="1.5" />
              </svg>
            </button>
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => pick(c)}
                className={cn(
                  'flex h-[26px] w-[26px] items-center justify-center rounded-md border',
                  on && c === color ? 'border-v-primary' : 'border-v-border'
                )}
                style={{ background: c }}
              >
                {on && c === color && (
                  <Check className="h-3.5 w-3.5 text-v-ink900" strokeWidth={2.4} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
