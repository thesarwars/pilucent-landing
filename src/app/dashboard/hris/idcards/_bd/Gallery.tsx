'use client';

/**
 * Gallery (§8): everyone on the roster with their card, status filters with
 * live counts, grid or list. Thumbnails render through the same resolveSide
 * as the designer -- one renderer, so the thumbnail cannot disagree with
 * the card. A revoked card stays here, greyed, with its reason (§9).
 */

import * as React from 'react';
import { CardThumb } from './CardSide';
import { artboardOf } from './engine';
import { useGallery } from './hooks';
import { useShared } from './IdCards';
import { Check, Empty, Loading, StatusPill, fmtDate, plural, useWrite } from './parts';
import * as api from './api';
import type { GalleryFilter, GalleryRow, Template } from './types';

const CHIPS: { id: GalleryFilter; label: string }[] = [
  { id: 'ALL', label: 'All cards' },
  { id: 'NOT_ISSUED', label: 'Not issued' },
  { id: 'EXPIRING', label: 'Expiring or expired' },
  { id: 'MISSING', label: 'Missing data' },
  { id: 'REVOKED', label: 'Revoked or lost' },
];

const MISSING: Record<string, string> = { photo: 'No photo', designation: 'No designation' };

export function Gallery() {
  const { nav, q, picked, setPicked, setup, fontsTick } = useShared();
  const [filter, setFilter] = React.useState<GalleryFilter>('ALL');
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [result, setResult] = React.useState<{ issued: number; refused: { code: string; messages: string[] }[] } | null>(null);
  const g = useGallery(q, filter);
  const write = useWrite();
  const rows = g.data?.rows || [];
  const templates = g.data?.templates || {};
  const open = (r: GalleryRow) => nav.go('card', { card: r.card?.uid || null, emp: r.code });
  const toggle = (code: string) => setPicked(picked.includes(code) ? picked.filter((c) => c !== code) : [...picked, code]);
  const allOn = rows.length > 0 && rows.every((r) => picked.includes(r.code));
  const pickedRows = rows.filter((r) => picked.includes(r.code));
  const issuable = pickedRows.filter((r) => !r.card || !['ISSUED', 'ACTIVE', 'EXPIRING'].includes(r.card.effectiveStatus));
  const printable = pickedRows.filter((r) => r.card && ['ISSUED', 'ACTIVE', 'EXPIRING'].includes(r.card.effectiveStatus));

  const bulkIssue = async () => {
    const out = await write.run(() => api.issueBulk(issuable.map((r) => r.code)), (o) => `${plural(o.issued.length, 'card')} issued`);
    if (out) setResult({ issued: out.issued.length, refused: out.refused });
  };

  return (
    <>
      <div className="idc-strip">
        {CHIPS.map((c) => (
          <button key={c.id} type="button" className={`idc-chip${filter === c.id ? ' on' : ''}`} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.label} <span className="n">{g.data?.counts[c.id] ?? '·'}</span>
          </button>
        ))}
        <span className="idc-spacer" />
        <span className="idc-small idc-muted">{plural(rows.length, 'employee')}{q ? ` matching “${q}”` : ''}</span>
        <div className="idc-seg" role="group" aria-label="View">
          <button type="button" className={view === 'grid' ? 'on' : ''} aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
          </button>
          <button type="button" className={view === 'list' ? 'on' : ''} aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="1" y="2" width="14" height="2" rx="1" /><rect x="1" y="7" width="14" height="2" rx="1" /><rect x="1" y="12" width="14" height="2" rx="1" /></svg>
          </button>
        </div>
      </div>

      {picked.length > 0 && (
        <div className="idc-selbar" role="region" aria-label="Selection">
          <span>{plural(picked.length, 'employee')} selected</span>
          <span className="idc-spacer" />
          {write.error && <span style={{ color: '#ffb4b4' }}>{write.error}</span>}
          <button type="button" className="idc-btn sm" disabled={!issuable.length || !setup.can.issue || write.busy} onClick={bulkIssue}
            title={!setup.can.issue ? 'Issuing needs the issue cards permission' : undefined}>
            Issue {issuable.length || ''} {issuable.length === 1 ? 'card' : 'cards'}
          </button>
          <button type="button" className="idc-btn sm" disabled={!printable.length} onClick={() => nav.go('print')}>Print {printable.length || ''}</button>
          <button type="button" className="idc-btn sm ghost" style={{ color: '#fff' }} onClick={() => setPicked([])}>Clear</button>
        </div>
      )}
      {result && (
        <div style={{ padding: '10px 14px 0' }}>
          <div className={`idc-banner ${result.refused.length ? 'warn' : 'ok'}`}>
            {plural(result.issued, 'card')} issued.
            {result.refused.map((r) => <div key={r.code}><b className="idc-mono">{r.code}</b>: {r.messages.join(' ')}</div>)}
            <button type="button" className="idc-btn sm ghost" style={{ marginLeft: 8 }} onClick={() => setResult(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="idc-scroll">
        {g.isLoading ? <Loading what="Loading the roster" /> : g.error ? (
          <div className="idc-banner err">{(g.error as Error).message}</div>
        ) : !rows.length ? (
          <Empty title={filter === 'ALL' ? 'Nobody on the roster yet' : 'Nobody here'}>
            {filter === 'ALL' ? 'Employees appear here once they are added to the employee register.' : 'No employee matches this filter.'}
          </Empty>
        ) : view === 'grid' ? (
          <div className="idc-tiles" data-fonts={fontsTick}>
            {rows.map((r) => <Tile key={r.code} r={r} templates={templates} on={picked.includes(r.code)} toggle={() => toggle(r.code)} open={() => open(r)} />)}
          </div>
        ) : (
          <div className="idc-panel" style={{ overflow: 'auto' }}>
            <table className="idc-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th style={{ width: 36 }}><Check on={allOn} label="Select all" onClick={() => setPicked(allOn ? [] : rows.map((r) => r.code))} /></th>
                  <th>Employee</th><th>Designation</th><th>Department</th><th>Template</th><th>Card number</th><th>Expires</th><th>Status</th><th>Data</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.code} className={`click${picked.includes(r.code) ? ' sel' : ''}`} onClick={() => open(r)}>
                    <td><Check on={picked.includes(r.code)} label={`Select ${r.nameEn}`} onClick={() => toggle(r.code)} /></td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.nameEn}</div>
                      <div className="idc-mono idc-tiny idc-muted">{r.code}</div>
                    </td>
                    <td>{r.designation || '—'}</td>
                    <td>{r.department || '—'}</td>
                    <td>{(r.card?.template.name || r.template?.name) ?? <span className="idc-muted">No template</span>}{r.rule && <div className="idc-tiny idc-muted">by rule: {r.rule}</div>}</td>
                    <td className="idc-mono" style={{ color: r.card ? undefined : 'var(--idc-faint)' }}>{r.card?.number || '—'}</td>
                    <td style={{ color: r.status === 'EXPIRED' ? '#9C3A2B' : r.status === 'EXPIRING' ? '#96600A' : undefined }}>{fmtDate(r.card?.expiresOn)}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td style={{ color: r.missing.length ? '#96600A' : 'var(--idc-ink-3)' }}>{r.missing.length ? r.missing.map((m) => MISSING[m] || m).join(', ') : 'Complete'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Tile({ r, templates, on, toggle, open }: { r: GalleryRow; templates: Record<string, Template>; on: boolean; toggle: () => void; open: () => void }) {
  const t = templates[r.card?.template.uid || r.template?.uid || ''];
  const dimmed = ['REVOKED', 'LOST', 'REPLACED', 'EXPIRED'].includes(r.status);
  return (
    <div className={`idc-tile${on ? ' sel' : ''}`} onClick={open} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && open()} aria-label={`${r.nameEn}, ${r.status}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Check on={on} label={`Select ${r.nameEn}`} onClick={toggle} />
        {r.missing.length > 0 && <span className="idc-tiny" style={{ color: '#96600A' }}>{r.missing.map((m) => MISSING[m] || m).join(' · ')}</span>}
      </div>
      <div className="idc-tile-art">
        {t?.front ? (
          <CardThumb side={t.front} ab={artboardOf(t)} ctx={r.context} maxW={146} maxH={138} dimmed={dimmed} style={{ boxShadow: '0 1px 2px rgba(0,0,0,.15)' }} />
        ) : <span className="idc-tiny idc-muted">No template</span>}
        {!r.card && <span className="tag">Not issued</span>}
      </div>
      <div className="idc-ellipsis" style={{ marginTop: 8, fontSize: 13, fontWeight: 500 }}>{r.nameEn}</div>
      <div className="idc-ellipsis idc-small idc-muted" style={{ marginTop: 1 }}>{r.designation || '—'}</div>
      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
        <StatusPill status={r.status} />
        <span className="idc-mono idc-tiny idc-muted idc-ellipsis">{r.code}</span>
      </div>
    </div>
  );
}
