'use client';

/**
 * Device ID mapping (§7): the screen that makes "never discard a punch"
 * real. Held punches wait against their device ID; mapping the ID attaches
 * them and says how many. A last-four-digits match is offered as a
 * suggestion, never applied: a coincidence would give one person's
 * attendance to another.
 */

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listEmployees } from '@/app/dashboard/hris/employee/employees/_bd/api';
import { ErrorBlock, LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useDeviceIds } from './hooks';
import { Drawer, Empty, Field, Tag, useNum, useWrite } from './parts';
import { shortDate } from './defs';
import * as api from './api';
import type { Mapping, Summary, Unmapped } from './types';

export function MappingTab({ summary }: { summary: Summary }) {
  const can = summary.can;
  const q = useDeviceIds();
  const roster = useQuery({ queryKey: ['bd-intake', 'roster'], queryFn: () => listEmployees({ limit: 1000 }) });
  const employees = roster.data?.results || [];
  const [picked, setPicked] = React.useState<Record<string, string>>({});
  const [from, setFrom] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<string | null>(null);
  const [closing, setClosing] = React.useState<Mapping | null>(null);
  const write = useWrite();
  const num = useNum();
  if (q.isLoading) return <LoadingBlock />;
  if (q.error || !q.data) return <ErrorBlock error={q.error} onRetry={() => q.refetch()} />;
  const { unmapped, mappings } = q.data;
  const key = (u: Unmapped) => `${u.deviceLabel}|${u.deviceUserId}`;
  const suggested = unmapped.filter((u) => u.suggestion && !picked[key(u)]);
  const fillSuggestions = () => {
    const next = { ...picked };
    for (const u of suggested) next[key(u)] = u.suggestion!.code;
    setPicked(next);
  };
  const map = async (u: Unmapped) => {
    const code = picked[key(u)];
    const out = await write.run(() => api.createMapping({ deviceLabel: u.deviceLabel, deviceUserId: u.deviceUserId, employeeCode: code, effectiveFrom: from[key(u)] || u.firstSeen }));
    if (out) setResult(out.message);
  };
  return (
    <div className="ai-stack">
      {unmapped.length > 0 ? (
        <div className="ai-note ai-tone-warn ai-orphan">
          <div>
            <b>{num(unmapped.reduce((s, u) => s + u.punches, 0))} punches for {num(unmapped.length)} device IDs are held.</b>{' '}
            Nothing was discarded. These punches are held against the device ID and attach themselves the moment you map it.
          </div>
          {suggested.length > 0 && <button type="button" className="ai-btn-warn" onClick={fillSuggestions}>Fill in {num(suggested.length)} suggestions</button>}
        </div>
      ) : <div className="ai-note ai-tone-pos">Every device ID is mapped. No punch is waiting.</div>}
      {result && <div className="ai-note ai-tone-pos" role="status">{result}</div>}
      {write.error && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}

      {unmapped.length > 0 && (
        <div className="ai-card ai-scrollx">
          <table className="ai-table">
            <thead><tr><th scope="col">Device user ID</th><th scope="col">Device</th><th scope="col" className="num">Held</th><th scope="col">Seen</th><th scope="col">Status</th><th scope="col">Map to</th><th scope="col">From</th><th /></tr></thead>
            <tbody>
              {unmapped.map((u) => {
                const id = `ai-map-${u.deviceLabel}-${u.deviceUserId}`.replace(/\W+/g, '-');
                const k = key(u);
                return (
                  <tr key={k}>
                    <th scope="row" className="ai-mono" style={{ fontWeight: 600 }}>{u.deviceUserId}</th>
                    <td>{u.deviceLabel}</td>
                    <td className="num ai-mono">{num(u.punches)}</td>
                    <td className="ai-mono ai-small">{u.firstSeen === u.lastSeen ? u.firstSeen : `${u.firstSeen} → ${u.lastSeen}`}<div className="ai-caption">{u.batches.join(', ')}</div></td>
                    <td><Tag tone="warn">Held</Tag>{u.suggestion && !picked[k] && <div className="ai-caption">suggests {u.suggestion.code}</div>}</td>
                    <td>
                      <label htmlFor={id} className="ai-sr">Employee for device ID {u.deviceUserId}</label>
                      <select id={id} className="ai-select ai-select-row" value={picked[k] || ''} disabled={!can.map} onChange={(e) => setPicked({ ...picked, [k]: e.target.value })}>
                        <option value="">Choose an employee</option>
                        {employees.map((e) => <option key={e.code} value={e.code}>{e.code} · {e.nameEn}</option>)}
                      </select>
                    </td>
                    <td>
                      <label htmlFor={`${id}-from`} className="ai-sr">Mapping starts</label>
                      <input id={`${id}-from`} type="date" className="ai-input ai-select-row" value={from[k] || u.firstSeen} disabled={!can.map} onChange={(e) => setFrom({ ...from, [k]: e.target.value })} />
                    </td>
                    <td><button type="button" className="ai-btn-primary ai-btn-row" disabled={!picked[k] || !can.map || write.busy} onClick={() => map(u)}>Map</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!can.map && <div className="ai-caption">Mapping needs the map device users permission.</div>}

      <h2 className="ai-section-title">Mappings</h2>
      {!mappings.length ? <Empty title="No mappings yet">A mapping links a device user ID to an employee from a date. When a slot is given to someone new, close the old mapping first — the old employee keeps their history.</Empty> : (
        <div className="ai-card ai-scrollx">
          <table className="ai-table">
            <thead><tr><th scope="col">Device user ID</th><th scope="col">Device</th><th scope="col">Employee</th><th scope="col">Effective</th><th scope="col" className="num">Attached</th><th /></tr></thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.uid} style={{ opacity: m.effectiveTo ? 0.6 : 1 }}>
                  <th scope="row" className="ai-mono" style={{ fontWeight: 600 }}>{m.deviceUserId}</th>
                  <td>{m.deviceLabel}</td>
                  <td>{m.employee.nameEn} <span className="ai-mono ai-caption">{m.employee.code}</span></td>
                  <td className="ai-mono ai-small">{m.effectiveFrom} → {m.effectiveTo || 'open'}</td>
                  <td className="num ai-mono">{num(m.relinked)}</td>
                  <td>{!m.effectiveTo && <button type="button" className="ai-link" disabled={!can.map} onClick={() => setClosing(m)}>Close</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {closing && <CloseMapping m={closing} onClose={() => setClosing(null)} />}
    </div>
  );
}

function CloseMapping({ m, onClose }: { m: Mapping; onClose: () => void }) {
  const [to, setTo] = React.useState('');
  const write = useWrite();
  return (
    <Drawer id="ai-close-map" title={`Close device ID ${m.deviceUserId}`} sub={`${m.deviceLabel} · ${m.employee.nameEn}`} onClose={onClose}>
      <p className="ai-small" style={{ margin: 0 }}>
        Use this when the device slot is given to someone else. Punches up to the last day stay with {m.employee.nameEn}; a new mapping for the next person starts the day after.
      </p>
      <Field label="Last day it holds" htmlFor="ai-close-to" hint={`Opened ${shortDate(m.effectiveFrom)}.`}>
        <input id="ai-close-to" type="date" min={m.effectiveFrom} className="ai-input" value={to} onChange={(e) => setTo(e.target.value)} />
      </Field>
      {write.error && <div className="ai-note ai-tone-neg" role="alert">{write.error}</div>}
      <div className="ai-actions">
        <button type="button" className="ai-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="ai-btn-ink" disabled={!to || write.busy} onClick={async () => { if (await write.run(() => api.closeMapping(m.uid, to), 'Mapping closed')) onClose(); }}>Close the mapping</button>
      </div>
    </Drawer>
  );
}
