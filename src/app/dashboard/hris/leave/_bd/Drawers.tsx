'use client';

/**
 * The drawers (spec §9): apply, grant, bulk credit, accrual run, encash,
 * employee history -- and the maternity notice. Every drawer states the
 * position before the action, from the server's spendable() figures; none
 * computes availability itself.
 */

import * as React from 'react';
import { DrawerHead, ErrorBlock, LoadingBlock, SideDrawer } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useDebounced } from '@/app/dashboard/hris/employee/employees/_bd/salary/shared';
import * as api from './api';
import { OUTCOME, fmtDays, longDate, plural, reasonError, shortDate, span, todayISO } from './defs';
import { useBalances, useEncashPreview, useHistory, useTypes } from './hooks';
import { Field, Note, PositionLine, Tag, errorText, useWrite } from './parts';
import type { AccrualRun, BulkResult, LedgerRow, Position, Preview } from './types';

const REVERSIBLE = new Set(['OPENING', 'ACCRUAL', 'ACCRUAL_CAPPED', 'ADJUSTMENT', 'CREDIT_EARNED', 'CREDIT_EXPIRED', 'FORFEITURE']);

/** Everyone on the roster, for the pickers: the balances read carries the roster. */
function useRoster() {
  const b = useBalances('', 'ALL');
  return b.data?.rows ?? [];
}

function EmployeeSelect({ id, value, onChange, filter }: { id: string; value: string; onChange: (code: string) => void; filter?: (r: { gender: string | null }) => boolean }) {
  const rows = useRoster().filter((r) => !filter || filter(r));
  return (
    <select id={id} className="lc-input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose an employee…</option>
      {rows.map((r) => (
        <option key={r.code} value={r.code}>
          {r.nameEn} · {r.code}
          {r.department ? ` · ${r.department}` : ''}
        </option>
      ))}
    </select>
  );
}

function freeSentence(p: Position, verb: string, held = 'reserved') {
  const parts = [`${fmtDays(p.balance)} on the ledger`];
  if (Number(p.held)) parts.push(`${fmtDays(p.held)} ${held}`);
  if (Number(p.committed)) parts.push(`${fmtDays(p.committed)} booked ahead`);
  return `${plural(Math.max(Number(p.spendable), 0), 'day')} ${verb} — ${parts.join(', ')}`;
}

/* ── apply ────────────────────────────────────────────────────────── */

export function ApplyDrawer({ code: initial = '', onClose, onMaternity }: { code?: string; onClose: () => void; onMaternity: (code: string) => void }) {
  const types = useTypes();
  const [code, setCode] = React.useState(initial);
  const [type, setType] = React.useState('CASUAL');
  const [from, setFrom] = React.useState(todayISO());
  const [to, setTo] = React.useState(todayISO());
  const [startHalf, setStartHalf] = React.useState('FULL');
  const [endHalf, setEndHalf] = React.useState('FULL');
  const [note, setNote] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [cover, setCover] = React.useState('');
  const [evidence, setEvidence] = React.useState('');
  const [advance, setAdvance] = React.useState(false);
  const [preview, setPreview] = React.useState<Preview | null>(null);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const w = useWrite();
  const info = types.data?.rows.find((t) => t.code === type);
  const input = { employeeCode: code, type, from, to, startHalf: info?.halfDayAllowed ? startHalf : 'FULL', endHalf: info?.halfDayAllowed ? endHalf : 'FULL' };
  const key = useDebounced(JSON.stringify(input), 300);

  React.useEffect(() => {
    const body = JSON.parse(key);
    if (!body.employeeCode || !body.from || !body.to) {
      setPreview(null);
      return;
    }
    let live = true;
    api
      .previewRequest(body)
      .then((p) => live && (setPreview(p), setPreviewError(null)))
      .catch((err) => live && (setPreview(null), setPreviewError(errorText(err))));
    return () => {
      live = false;
    };
  }, [key]);

  const submit = () =>
    w
      .run(
        () => api.submitRequest({ ...input, note, contact, coverCode: cover, evidence, advance }),
        (r) => `${r.reference} submitted for ${r.employee.nameEn}: ${plural(r.days, 'day')} held until it is decided`
      )
      .then((r) => r && onClose());

  return (
    <SideDrawer onClose={onClose} labelledBy="lc-apply" width={660}>
      <DrawerHead id="lc-apply" title="Apply for leave" sub="Entered by HR for the employee, and recorded as on their behalf." onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <Field label="Employee" htmlFor="ap-emp">
          <EmployeeSelect id="ap-emp" value={code} onChange={setCode} />
        </Field>
        <Field label="Leave type" htmlFor="ap-type">
          <select id="ap-type" className="lc-input" value={type} onChange={(e) => setType(e.target.value)}>
            {(types.data?.rows ?? [])
              .filter((t) => t.code !== 'MATERNITY')
              .map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                  {t.statutory ? '' : ' (company policy)'}
                </option>
              ))}
          </select>
        </Field>
        <button type="button" className="lc-link text-[12.5px]" onClick={() => onMaternity(code)}>
          Maternity leave is granted by recording the notice →
        </button>
        <div className="lc-two">
          <Field label="From" htmlFor="ap-from">
            <input id="ap-from" type="date" className="lc-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" htmlFor="ap-to">
            <input id="ap-to" type="date" className="lc-input" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        {info?.halfDayAllowed && (
          <div className="lc-two">
            <Field label="First day" htmlFor="ap-sh">
              <select id="ap-sh" className="lc-input" value={startHalf} onChange={(e) => setStartHalf(e.target.value)}>
                <option value="FULL">Full day</option>
                <option value="SECOND_HALF">From the second half</option>
              </select>
            </Field>
            <Field label="Last day" htmlFor="ap-eh">
              <select id="ap-eh" className="lc-input" value={endHalf} onChange={(e) => setEndHalf(e.target.value)}>
                <option value="FULL">Full day</option>
                <option value="FIRST_HALF">To the first half</option>
              </select>
            </Field>
          </div>
        )}
        {preview && (
          <>
            <div className="lc-card px-4 py-3 text-[13.5px] leading-[21px]">{preview.breakdown.sentence}</div>
            <PositionLine text={preview.positionSentence} p={preview.position} />
            {preview.short && (
              <Note tone={advance ? 'warn' : 'neg'}>
                Asks for {plural(preview.asked, 'day')} and {fmtDays(Math.max(Number(preview.position.spendable), 0))} can be spent.
                {preview.advanceAllowed ? (
                  <label className="mt-2 flex items-center gap-2 font-semibold">
                    <input type="checkbox" checked={advance} onChange={(e) => setAdvance(e.target.checked)} /> Submit as an advance — it takes the balance below zero
                  </label>
                ) : (
                  ' Reduce the dates.'
                )}
              </Note>
            )}
          </>
        )}
        {previewError && <Note tone="neg">{previewError}</Note>}
        <Field label="Note" htmlFor="ap-note">
          <textarea id="ap-note" className="lc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What the employee said, if anything" />
        </Field>
        <div className="lc-two">
          <Field label="Contact during leave" htmlFor="ap-contact">
            <input id="ap-contact" className="lc-input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="Cover (employee code)" htmlFor="ap-cover">
            <input id="ap-cover" className="lc-input" value={cover} onChange={(e) => setCover(e.target.value.toUpperCase())} placeholder="EMP-0101" />
          </Field>
        </div>
        {info?.requiresMedicalCert && (
          <Field label="Medical certificate" htmlFor="ap-ev" hint="More than two days of sick leave: note the certificate seen.">
            <input id="ap-ev" className="lc-input" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Dr. … , dated …" />
          </Field>
        )}
        {w.error && <div className="lc-error">{w.error}</div>}
        <div className="flex gap-2">
          <button type="button" className="lc-btn-primary" disabled={w.busy || !code || !preview || (preview.short && !advance)} onClick={() => void submit()}>
            {w.busy ? 'Submitting…' : preview ? `Submit ${plural(preview.asked, 'day')}` : 'Submit'}
          </button>
          <button type="button" className="lc-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </SideDrawer>
  );
}

/* ── grant ────────────────────────────────────────────────────────── */

export function GrantDrawer({ code: initial = '', onClose }: { code?: string; onClose: () => void }) {
  const types = useTypes();
  const [code, setCode] = React.useState(initial);
  const [type, setType] = React.useState('EARNED');
  const [sign, setSign] = React.useState<'+' | '-'>('+');
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [effective, setEffective] = React.useState(todayISO());
  const [touched, setTouched] = React.useState(false);
  const history = useHistory(code || null);
  const w = useWrite();
  const p = history.data?.positions[type];
  const rErr = reasonError(reason);
  const aErr = !/^\d+(\.\d{1,4})?$/.test(amount) || Number(amount) === 0 ? 'Days, up to four decimal places.' : null;
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-grant" width={620}>
      <DrawerHead id="lc-grant" title="Grant or debit" sub="An adjustment on the ledger, with a reason the employee can read. A debit is tested against what can be spent." onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <Field label="Employee" htmlFor="gr-emp">
          <EmployeeSelect id="gr-emp" value={code} onChange={setCode} />
        </Field>
        <Field label="Leave type" htmlFor="gr-type">
          <select id="gr-type" className="lc-input" value={type} onChange={(e) => setType(e.target.value)}>
            {(types.data?.rows ?? [])
              .filter((t) => t.code !== 'MATERNITY')
              .map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name}
                </option>
              ))}
          </select>
        </Field>
        {p && <PositionLine text={freeSentence(p, 'free to debit')} p={p} />}
        <div className="lc-two">
          <Field label="Credit or debit" htmlFor="gr-sign">
            <select id="gr-sign" className="lc-input" value={sign} onChange={(e) => setSign(e.target.value as '+' | '-')}>
              <option value="+">Credit — add days</option>
              <option value="-">Debit — take days</option>
            </select>
          </Field>
          <Field label="Days" htmlFor="gr-days" error={touched ? aErr : null}>
            <input id="gr-days" className="lc-input lc-mono" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2" />
          </Field>
        </div>
        <Field label="Effective" htmlFor="gr-eff">
          <input id="gr-eff" type="date" className="lc-input" value={effective} onChange={(e) => setEffective(e.target.value)} />
        </Field>
        <Field label="Reason" htmlFor="gr-reason" error={touched ? rErr : null} hint="Shown to the employee on their ledger.">
          <textarea id="gr-reason" className="lc-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Opening balance carried from the paper register" />
        </Field>
        {w.error && <div className="lc-error">{w.error}</div>}
        <button
          type="button"
          className="lc-btn-primary"
          disabled={w.busy || !code}
          onClick={() => {
            setTouched(true);
            if (rErr || aErr) return;
            void w.run(() => api.grant({ employeeCode: code, type, days: `${sign === '-' ? '-' : ''}${amount}`, reason, effective }), `${sign === '-' ? 'Debited' : 'Granted'} ${plural(amount, 'day')}`).then((out) => out && onClose());
          }}
        >
          {sign === '-' ? 'Debit' : 'Grant'} {amount ? plural(amount, 'day') : ''}
        </button>
      </div>
    </SideDrawer>
  );
}

/* ── bulk credit ──────────────────────────────────────────────────── */

export function BulkDrawer({ onClose }: { onClose: () => void }) {
  const types = useTypes();
  const roster = useRoster();
  const [type, setType] = React.useState('EARNED');
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [everyone, setEveryone] = React.useState(true);
  const [picked, setPicked] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<BulkResult | null>(null);
  const w = useWrite();
  const body = (commit: boolean) => ({ employeeCodes: everyone ? null : picked, type, days: amount, reason, commit });
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-bulk" width={660}>
      <DrawerHead id="lc-bulk" title="Bulk credit" sub="The preview writes nothing and says which rows would be refused, and why. Posting needs the preview first." onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className="lc-two">
          <Field label="Leave type" htmlFor="bk-type">
            <select id="bk-type" className="lc-input" value={type} onChange={(e) => (setType(e.target.value), setResult(null))}>
              {(types.data?.rows ?? [])
                .filter((t) => t.code !== 'MATERNITY')
                .map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Days each (negative debits)" htmlFor="bk-days">
            <input id="bk-days" className="lc-input lc-mono" value={amount} onChange={(e) => (setAmount(e.target.value), setResult(null))} placeholder="1" />
          </Field>
        </div>
        <Field label="Reason" htmlFor="bk-reason" error={result?.reasonError ?? null}>
          <textarea id="bk-reason" className="lc-input" value={reason} onChange={(e) => (setReason(e.target.value), setResult(null))} placeholder="e.g. Additional day for the factory's anniversary" />
        </Field>
        <fieldset className="space-y-2">
          <legend className="lc-label">Who</legend>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input type="radio" checked={everyone} onChange={() => (setEveryone(true), setResult(null))} /> Everyone on the roster ({roster.length})
          </label>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input type="radio" checked={!everyone} onChange={() => (setEveryone(false), setResult(null))} /> Chosen people ({picked.length})
          </label>
          {!everyone && (
            <div className="lc-card max-h-[200px] space-y-1 overflow-y-auto px-3 py-2">
              {roster.map((r) => (
                <label key={r.code} className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={picked.includes(r.code)}
                    onChange={(e) => (setPicked(e.target.checked ? [...picked, r.code] : picked.filter((c) => c !== r.code)), setResult(null))}
                  />
                  {r.nameEn} <span className="lc-sub">{r.code}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
        {w.error && <div className="lc-error">{w.error}</div>}
        <div className="flex gap-2">
          <button type="button" className="lc-btn" disabled={w.busy || !amount || (!everyone && !picked.length)} onClick={() => void w.run(() => api.bulkGrant(body(false))).then((r) => r && setResult(r))}>
            Preview
          </button>
          {result && !result.commit && result.ok > 0 && !result.reasonError && (
            <button type="button" className="lc-btn-primary" disabled={w.busy} onClick={() => void w.run(() => api.bulkGrant(body(true)), (r) => `${r.ok} posted, ${r.refused} refused`).then((r) => r && setResult(r))}>
              Post {result.ok}
            </button>
          )}
        </div>
        {result && (
          <div className="lc-card lc-table-wrap">
            <table className="lc-table">
              <caption className="lc-caption px-4 pt-3 text-left">
                {result.commit ? 'Posted' : 'Preview — nothing written'}: {result.ok} {result.commit ? 'posted' : 'would post'}, {result.refused} refused
              </caption>
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Days</th>
                  <th scope="col">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.code}>
                    <td>
                      {r.nameEn} <span className="lc-sub">{r.code}</span>
                    </td>
                    <td className="lc-fig">{fmtDays(r.days)}</td>
                    <td>
                      <Tag tone={r.outcome === 'REFUSED' ? 'neg' : 'pos'}>{r.outcome === 'REFUSED' ? 'Refused' : r.outcome === 'POSTED' ? 'Posted' : 'Will post'}</Tag>
                      {r.why && <div className="lc-sub mt-1">{r.why}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SideDrawer>
  );
}

/* ── accrual run (§10) ────────────────────────────────────────────── */

export function AccrualDrawer({ onClose }: { onClose: () => void }) {
  const [asOf, setAsOf] = React.useState(todayISO());
  const [entered, setEntered] = React.useState<Record<string, string>>({});
  const [run, setRun] = React.useState<AccrualRun | null>(null);
  const w = useWrite();
  const body = (commit: boolean) => ({ asOf, daysWorked: Object.fromEntries(Object.entries(entered).filter(([, v]) => v !== '')), commit });
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-accrual" width={660}>
      <DrawerHead
        id="lc-accrual"
        title="Earned-leave accrual run"
        sub="For each employee, the last completed service year: days worked ÷ the establishment's divisor, floored, up to the cap. Earned in arrears, posted into the next year."
        onClose={onClose}
      />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className="lc-two">
          <Field label="As at" htmlFor="ac-asof" hint="Service years that ended before this date are accrued.">
            <input id="ac-asof" type="date" className="lc-input" value={asOf} onChange={(e) => (setAsOf(e.target.value), setRun(null))} />
          </Field>
        </div>
        <p className="lc-caption m-0">
          Days actually worked in the year, from attendance under the payroll elections, divided by the establishment&apos;s divisor — 18 for a factory, 22 for a tea plantation,
          11 for a newspaper. Where attendance does not cover the year, enter the figure from the register.
        </p>
        {w.error && <div className="lc-error">{w.error}</div>}
        <div className="flex gap-2">
          <button type="button" className="lc-btn" disabled={w.busy} onClick={() => void w.run(() => api.accrualRun(body(false))).then((r) => r && setRun(r))}>
            {w.busy && !run ? 'Working…' : 'Preview'}
          </button>
          {run && !run.commit && run.postable > 0 && (
            <button type="button" className="lc-btn-primary" disabled={w.busy} onClick={() => void w.run(() => api.accrualRun(body(true)), (r) => `${r.counts.OK ?? 0} posted, ${r.counts.CAPPED ?? 0} at the cap`).then((r) => r && setRun(r))}>
              Post {run.postable}
            </button>
          )}
        </div>
        {run && (
          <div className="lc-card lc-table-wrap">
            <table className="lc-table">
              <caption className="lc-caption px-4 pt-3 text-left">{run.commit ? 'Posted.' : 'Preview — nothing written.'} A second run reports every posted row as already posted.</caption>
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Service year</th>
                  <th scope="col">Worked</th>
                  <th scope="col">Granted</th>
                  <th scope="col">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {run.rows.map((r) => (
                  <tr key={r.code}>
                    <td>
                      {r.nameEn}
                      <div className="lc-sub">{r.code}</div>
                    </td>
                    <td className="whitespace-nowrap text-[12.5px]">{r.cycleFrom ? `${shortDate(r.cycleFrom)} – ${longDate(r.cycleTo)}` : '—'}</td>
                    <td>
                      {r.outcome === 'NEEDS_DAYS' || r.source === 'entered' ? (
                        <input
                          aria-label={`Days worked by ${r.nameEn}`}
                          className="lc-input lc-mono !min-h-[32px] !w-[84px]"
                          value={entered[r.code] ?? r.worked ?? ''}
                          onChange={(e) => setEntered({ ...entered, [r.code]: e.target.value })}
                        />
                      ) : (
                        <span className="lc-fig">{r.worked ? fmtDays(r.worked) : '—'}</span>
                      )}
                      {r.source && <div className="lc-sub">{r.source}</div>}
                    </td>
                    <td className="lc-fig">{r.granted !== undefined ? fmtDays(r.granted) : '—'}</td>
                    <td>
                      <Tag tone={OUTCOME[r.outcome].tone}>{OUTCOME[r.outcome].label}</Tag>
                      <div className="lc-sub mt-1 max-w-[260px]">{r.basis ?? r.why}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SideDrawer>
  );
}

/* ── encash ───────────────────────────────────────────────────────── */

export function EncashDrawer({ code: initial = '', onClose }: { code?: string; onClose: () => void }) {
  const [code, setCode] = React.useState(initial);
  const [amount, setAmount] = React.useState('');
  const preview = useEncashPreview(code);
  const w = useWrite();
  const over = preview.data && amount !== '' && Number(amount) > Number(preview.data.ceiling);
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-encash" width={620}>
      <DrawerHead id="lc-encash" title="Encash earned leave" sub="At most half of what can be spent, once a service year. The days come off at approval, not now." onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <Field label="Employee" htmlFor="en-emp">
          <EmployeeSelect id="en-emp" value={code} onChange={setCode} />
        </Field>
        {preview.isError && <Note tone="neg">{errorText(preview.error)}</Note>}
        {preview.data && <PositionLine text={preview.data.sentence} p={preview.data.position} />}
        <Field label="Days" htmlFor="en-days" error={over ? `At most ${fmtDays(preview.data!.ceiling)}.` : null} hint={preview.data ? `A day's wage is gross ÷ ${preview.data.divisor}: the encashment divisor, not the leave-wage one.` : undefined}>
          <input id="en-days" className="lc-input lc-mono" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1" />
        </Field>
        {w.error && <div className="lc-error">{w.error}</div>}
        <button type="button" className="lc-btn-primary" disabled={w.busy || !code || !amount || !!over} onClick={() => void w.run(() => api.requestEncashment(code, amount), (e) => `${e.reference} submitted for approval`).then((e) => e && onClose())}>
          Request encashment
        </button>
      </div>
    </SideDrawer>
  );
}

/* ── maternity notice ─────────────────────────────────────────────── */

export function MaternityDrawer({ code: initial = '', onClose }: { code?: string; onClose: () => void }) {
  const [code, setCode] = React.useState(initial);
  const [noticeDate, setNoticeDate] = React.useState(todayISO());
  const [method, setMethod] = React.useState('WRITTEN');
  const [expected, setExpected] = React.useState('');
  const [children, setChildren] = React.useState('0');
  const [leaveFrom, setLeaveFrom] = React.useState('');
  const w = useWrite();
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-mat" width={620}>
      <DrawerHead id="lc-mat" title="Record a maternity notice" sub="Recording the notice grants the leave: statutory, approved, not refusable (s.46)." onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <Field label="Employee" htmlFor="mt-emp">
          <EmployeeSelect id="mt-emp" value={code} onChange={setCode} filter={(r) => r.gender === 'FEMALE'} />
        </Field>
        <div className="lc-two">
          <Field label="Notice given on" htmlFor="mt-nd">
            <input id="mt-nd" type="date" className="lc-input" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} />
          </Field>
          <Field label="How" htmlFor="mt-m" hint="An oral notice on a past date is a valid notice: s.46 does not require writing.">
            <select id="mt-m" className="lc-input" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="WRITTEN">Written</option>
              <option value="ORAL">Oral</option>
            </select>
          </Field>
        </div>
        <Note tone="violet">The next two are restricted to HR. A line manager sees that she is on approved leave and the dates, and nothing more.</Note>
        <div className="lc-two">
          <Field label="Expected delivery" htmlFor="mt-ed">
            <input id="mt-ed" type="date" className="lc-input" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </Field>
          <Field label="Surviving children" htmlFor="mt-c">
            <input id="mt-c" className="lc-input lc-mono" inputMode="numeric" value={children} onChange={(e) => setChildren(e.target.value)} />
          </Field>
        </div>
        <Field label="Leave starts (optional)" htmlFor="mt-lf" hint="Defaults to the days before the expected delivery the rule book allows.">
          <input id="mt-lf" type="date" className="lc-input" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} />
        </Field>
        <p className="lc-caption m-0">Whether the benefit is paid is a separate question. Where it is not, the leave still stands.</p>
        {w.error && <div className="lc-error">{w.error}</div>}
        <button
          type="button"
          className="lc-btn-primary"
          disabled={w.busy || !code || !expected}
          onClick={() =>
            void w
              .run(
                () => api.openMaternity({ employeeCode: code, noticeDate, noticeMethod: method, expectedDelivery: expected, survivingChildren: children, leaveFrom: leaveFrom || undefined }),
                (c) => `${c.reference}: ${c.totalDays} days of maternity leave, ${span(c.leaveFrom, c.leaveTo)}`
              )
              .then((c) => c && onClose())
          }
        >
          Record the notice
        </button>
      </div>
    </SideDrawer>
  );
}

/* ── employee history (§9.3) ──────────────────────────────────────── */

export function HistoryDrawer({ code, onClose, onApply, onGrant }: { code: string; onClose: () => void; onApply: (code: string) => void; onGrant: (code: string) => void }) {
  const [type, setType] = React.useState('ALL');
  const history = useHistory(code, type);
  const h = history.data;
  return (
    <SideDrawer onClose={onClose} labelledBy="lc-hist" width={760}>
      <DrawerHead id="lc-hist" title={h ? `${h.employee.nameEn} · ${h.employee.code}` : code} sub="Every movement, newest first, with a running balance per leave type and a reason on every line." onClose={onClose} />
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {history.isPending ? (
          <LoadingBlock />
        ) : history.isError ? (
          <ErrorBlock error={history.error} onRetry={() => void history.refetch()} />
        ) : (
          h && (
            <>
              <div className="flex flex-wrap gap-2">
                {h.can.apply && (
                  <button type="button" className="lc-btn-primary" onClick={() => onApply(code)}>
                    Apply for leave
                  </button>
                )}
                {h.can.grant && (
                  <button type="button" className="lc-btn" onClick={() => onGrant(code)}>
                    Grant or debit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
                {Object.entries(h.positions).map(([c, p]) => (
                  <button key={c} type="button" aria-pressed={type === c} onClick={() => setType(type === c ? 'ALL' : c)} className="lc-card px-3 py-2 text-left" style={type === c ? { borderColor: '#6B3FE8' } : undefined}>
                    <div className="lc-label">{p.name}</div>
                    {p.eligible ? (
                      <>
                        <div className="lc-fig-big">{fmtDays(Math.max(Number(p.spendable), 0))}</div>
                        <div className="lc-sub">
                          {fmtDays(p.balance)} on the ledger
                          {Number(p.held) ? ` · ${fmtDays(p.held)} held` : ''}
                          {Number(p.committed) ? ` · ${fmtDays(p.committed)} booked ahead` : ''}
                        </div>
                      </>
                    ) : (
                      <div className="lc-sub mt-1">{p.reason}</div>
                    )}
                  </button>
                ))}
              </div>
              <LedgerTable rows={h.rows} canCorrect={h.can.grant} />
              <p className="lc-caption m-0">A correction is never a deletion: it is a reversal and a replacement, and the original stays on the ledger.</p>
              {h.requests.length > 0 && (
                <div className="lc-card lc-table-wrap">
                  <table className="lc-table">
                    <caption className="lc-label px-4 pt-3 text-left">Requests</caption>
                    <thead>
                      <tr>
                        <th scope="col">Reference</th>
                        <th scope="col">Leave</th>
                        <th scope="col">Days</th>
                        <th scope="col">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.requests.map((r) => (
                        <tr key={r.reference}>
                          <td className="lc-mono text-[12.5px]">{r.reference}</td>
                          <td>
                            {r.typeName}
                            <div className="lc-sub">{span(r.from, r.to)}</div>
                          </td>
                          <td className="lc-fig">{fmtDays(r.days)}</td>
                          <td className="text-[12.5px]">{r.phase.replace('_', ' ').toLowerCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )
        )}
      </div>
    </SideDrawer>
  );
}

function LedgerTable({ rows, canCorrect }: { rows: LedgerRow[]; canCorrect: boolean }) {
  const [open, setOpen] = React.useState<string | null>(null);
  if (!rows.length) return <Note tone="neutral">Nothing on the ledger yet.</Note>;
  return (
    <div className="lc-card lc-table-wrap">
      <table className="lc-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Movement</th>
            <th scope="col" className="text-right">
              Days
            </th>
            <th scope="col" className="text-right">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <React.Fragment key={r.uid}>
              <tr className={r.counts ? undefined : 'lc-greyed'}>
                <td className="whitespace-nowrap text-[12.5px]">
                  {longDate(r.date)}
                  <div className="lc-sub lc-mono">{r.reference}</div>
                </td>
                <td>
                  <div className="text-[13px] font-semibold">
                    {r.reasonLabel} · {r.type.toLowerCase()}
                  </div>
                  <div className="text-[12.5px] leading-[19px] text-[#58536E]">{r.basis}</div>
                  <div className="lc-sub">
                    {r.by ?? 'system'}
                    {r.onBehalf ? ', for the employee' : ''} · rule set {r.ruleSet}
                    {r.reversedBy ? ` — reversed by ${r.reversedBy}, so it no longer counts` : ''}
                  </div>
                  {canCorrect && r.counts && REVERSIBLE.has(r.reason) && (
                    <button type="button" className="lc-link mt-1 text-[12px]" aria-expanded={open === r.uid} onClick={() => setOpen(open === r.uid ? null : r.uid)}>
                      Correct…
                    </button>
                  )}
                </td>
                <td className="lc-fig text-right" style={{ color: Number(r.days) < 0 ? '#BE123C' : Number(r.days) > 0 ? '#157A5B' : undefined }}>
                  {Number(r.days) > 0 ? '+' : ''}
                  {fmtDays(r.days)}
                </td>
                <td className="lc-fig text-right">{fmtDays(r.running)}</td>
              </tr>
              {open === r.uid && (
                <tr>
                  <td colSpan={4}>
                    <CorrectForm row={r} onDone={() => setOpen(null)} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorrectForm({ row, onDone }: { row: LedgerRow; onDone: () => void }) {
  const [reason, setReason] = React.useState('');
  const [replacement, setReplacement] = React.useState(row.days);
  const [touched, setTouched] = React.useState(false);
  const w = useWrite();
  const rErr = reasonError(reason);
  return (
    <div className="space-y-2 py-1">
      <div className="lc-caption">
        Reverses {row.reference} and, if a figure is given, posts a replacement beside it. Leave the figure empty to reverse only.
      </div>
      <div className="lc-two">
        <Field label="Replacement days" htmlFor={`rp-${row.uid}`}>
          <input id={`rp-${row.uid}`} className="lc-input lc-mono" value={replacement} onChange={(e) => setReplacement(e.target.value)} />
        </Field>
      </div>
      <Field label="Reason" htmlFor={`rr-${row.uid}`} error={touched ? rErr : null}>
        <textarea id={`rr-${row.uid}`} className="lc-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Days worked were 324, not 364" />
      </Field>
      {w.error && <div className="lc-error">{w.error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          className="lc-btn-primary"
          disabled={w.busy}
          onClick={() => {
            setTouched(true);
            if (rErr) return;
            void w.run(() => api.reverseEntry(row.uid, reason, replacement === '' ? undefined : replacement), (o) => `Reversed by ${o.reversal}${o.replacement ? `, replaced by ${o.replacement}` : ''}`).then((o) => o && onDone());
          }}
        >
          Reverse{replacement !== '' ? ' and replace' : ''}
        </button>
        <button type="button" className="lc-btn" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
}
