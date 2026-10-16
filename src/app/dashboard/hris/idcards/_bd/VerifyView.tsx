'use client';

/**
 * What a guard sees after scanning a card's QR (§12): photo, name, code,
 * designation, validity, the employer -- and nothing else. Shared by the
 * public `/verify/[token]` page and the settings preview, so the preview
 * cannot show something the page does not.
 */

import './idcards.css';
import * as React from 'react';
import { mediaUrl } from './api';
import { plexMono, plexSans } from './fonts';
import type { Verification } from './types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso?: string | null) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : '—';
};

const BANDS: Record<string, { bg: string; title: string; tone: string }> = {
  ACTIVE: { bg: '#1F7A4C', title: 'This card is valid', tone: 'Valid' },
  ISSUED: { bg: '#1F7A4C', title: 'This card is valid', tone: 'Valid' },
  EXPIRING: { bg: '#1F7A4C', title: 'This card is valid', tone: 'Valid, expiring soon' },
  EXPIRED: { bg: '#9C3A2B', title: 'This card has expired', tone: 'Expired' },
  REVOKED: { bg: '#8C2020', title: 'This card was revoked', tone: 'Revoked' },
  LOST: { bg: '#8C2020', title: 'This card was reported lost', tone: 'Lost' },
  REPLACED: { bg: '#5C5C5C', title: 'This card was replaced', tone: 'Replaced' },
  NOT_ISSUED: { bg: '#5C5C5C', title: 'This card was never issued', tone: 'Not issued' },
  UNKNOWN: { bg: '#5C5C5C', title: 'Unknown card', tone: 'Unknown' },
  THROTTLED: { bg: '#5C5C5C', title: 'Too many checks', tone: 'Try again later' },
};

export function VerifyView({ v, preview }: { v: Verification; preview?: boolean }) {
  const band = BANDS[v.status] || BANDS.UNKNOWN;
  const valid = ['ACTIVE', 'ISSUED', 'EXPIRING'].includes(v.status);
  return (
    <div className={`idc-verify ${plexSans.variable} ${plexMono.variable}`} style={{ fontFamily: 'var(--idc-sans), sans-serif', fontSize: 13, color: '#1F1F1F' }} role="main" aria-live="polite">
      <div className="idc-verify-band" style={{ background: band.bg }}>
        <div className="k">{v.employer || 'Card verification'}</div>
        <h1>{band.title}</h1>
        {v.status === 'REVOKED' || v.status === 'LOST' ? (
          <div style={{ marginTop: 4, fontSize: 13 }}>{v.status === 'LOST' ? 'Reported lost' : 'Revoked'} on {longDate(v.revokedOn)}. Do not accept it.</div>
        ) : v.status === 'REPLACED' ? (
          <div style={{ marginTop: 4, fontSize: 13 }}>Replaced by card {v.replacedBy}. Ask for the new card.</div>
        ) : v.status === 'EXPIRED' ? (
          <div style={{ marginTop: 4, fontSize: 13 }}>Expired on {longDate(v.expiresOn)}.</div>
        ) : v.message && !valid ? <div style={{ marginTop: 4, fontSize: 13 }}>{v.message}</div> : null}
      </div>
      {v.employeeName && (
        <div className="idc-verify-body">
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {valid && (v.photoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img className="idc-verify-photo" src={mediaUrl(v.photoUrl)} alt={`Photo of ${v.employeeName}`} />
              : <div className="idc-verify-photo" aria-hidden="true" />)}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>{v.employeeName}</div>
              {v.employeeNameBn && <div lang="bn" style={{ fontFamily: 'var(--font-bengali), sans-serif', fontSize: 14, color: '#4D4D4D', marginTop: 2 }}>{v.employeeNameBn}</div>}
              {v.designation && <div style={{ marginTop: 6, color: '#4D4D4D' }}>{v.designation}</div>}
            </div>
          </div>
          {valid && (
            <dl className="idc-kv" style={{ gridTemplateColumns: '110px 1fr' }}>
              <dt>Employee code</dt><dd className="idc-mono">{v.employeeCode}</dd>
              <dt>Card number</dt><dd className="idc-mono">{v.cardNumber}</dd>
              <dt>Issued</dt><dd>{longDate(v.issuedOn)}</dd>
              <dt>Valid until</dt><dd style={{ color: v.status === 'EXPIRING' ? '#96600A' : undefined }}>{longDate(v.expiresOn)}</dd>
              {(v.custom || []).map((c) => (<React.Fragment key={c.label}><dt>{c.label}</dt><dd>{Array.isArray(c.value) ? c.value.join(', ') : String(c.value)}</dd></React.Fragment>))}
            </dl>
          )}
        </div>
      )}
      <div className="idc-verify-foot">
        {preview ? 'Preview. ' : ''}Checked against the employer&apos;s records just now. This page shows only what is needed to recognise the card holder.
      </div>
    </div>
  );
}
