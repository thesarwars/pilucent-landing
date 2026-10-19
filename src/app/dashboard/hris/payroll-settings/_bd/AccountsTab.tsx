'use client';

/**
 * GL mapping for every scheme (§11): 5xxx expense, 2xxx liability, in the
 * company's own chart of accounts -- not free text (§15 defect 3). An
 * applying scheme without an expense account blocks the journal. Group
 * insurance has no liability: a premium is paid, not accrued.
 */

import * as React from 'react';
import { LoadingBlock } from '@/app/dashboard/hris/employee/employees/_bd/ui';
import { useWrite } from '@/app/dashboard/hris/pay-library/_bd/parts';
import * as api from './api';
import { useAccounts } from './hooks';
import type { Gl, Scheme, Summary } from './types';

export function AccountsTab({ s }: { s: Summary }) {
  const accounts = useAccounts(true);
  const write = useWrite();
  const missing = s.schemes.some((x) => !x.expense || (x.hasLiability && !x.liability));
  return (
    <div className="ps-stack">
      <section className="bd-card ps-card" aria-labelledby="ps-gl">
        <div className="pl-row-between">
          <div>
            <h2 id="ps-gl" className="ps-section-title">Accounts <span lang="bn" className="ps-gloss">হিসাবের খাত</span></h2>
            <p className="ps-desc">Where each scheme posts. The journal stays blocked until every scheme that applies has its expense account.</p>
          </div>
          {s.can.gl && missing && (
            <button type="button" className="bd-btn" disabled={write.busy} onClick={() => write.run(() => api.createAccounts(), (r) => (r.created.length ? `Created ${r.created.join(', ')}` : 'Mapped to existing accounts'))}>
              Create the missing accounts
            </button>
          )}
        </div>
        {write.error && <div className="bd-note bd-tone-blocked" role="alert">{write.error}</div>}
        {accounts.isLoading ? <LoadingBlock /> : (
          <div className="pl-scrollx">
            <table className="bd-table ps-gl-table">
              <thead><tr><th scope="col">Scheme</th><th scope="col">Expense</th><th scope="col">Liability</th></tr></thead>
              <tbody>
                {s.schemes.map((x) => <GlRow key={x.uid} scheme={x} accounts={accounts.data?.accounts ?? []} canMap={s.can.gl} />)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function GlRow({ scheme, accounts, canMap }: { scheme: Scheme; accounts: Gl[]; canMap: boolean }) {
  const write = useWrite();
  const pick = (field: 'expenseUid' | 'liabilityUid', uid: string) => write.run(() => api.mapGl(scheme.code, { [field]: uid || null }), `${scheme.label} mapped`);
  const blocked = scheme.applies && !scheme.expense;
  return (
    <tr>
      <th scope="row">
        {scheme.label}
        {!scheme.applies && <span className="ps-hint"> · does not apply</span>}
        {write.error && <div className="bd-error" role="alert">{write.error}</div>}
      </th>
      <td>
        <select aria-label={`${scheme.label} expense account`} className={`bd-input bd-mono ps-gl${blocked ? ' is-invalid' : ''}`} disabled={!canMap || write.busy} value={scheme.expense?.uid ?? ''} onChange={(e) => pick('expenseUid', e.target.value)}>
          <option value="">{blocked ? 'Not mapped — blocks the journal' : `Not mapped (suggested ${scheme.suggested.expense})`}</option>
          {accounts.map((a) => <option key={a.uid} value={a.uid}>{a.label}</option>)}
        </select>
      </td>
      <td>
        {scheme.hasLiability ? (
          <select aria-label={`${scheme.label} liability account`} className="bd-input bd-mono ps-gl" disabled={!canMap || write.busy} value={scheme.liability?.uid ?? ''} onChange={(e) => pick('liabilityUid', e.target.value)}>
            <option value="">{`Not mapped (suggested ${scheme.suggested.liability})`}</option>
            {accounts.map((a) => <option key={a.uid} value={a.uid}>{a.label}</option>)}
          </select>
        ) : <span className="ps-hint">None — a premium is paid, not accrued</span>}
      </td>
    </tr>
  );
}
