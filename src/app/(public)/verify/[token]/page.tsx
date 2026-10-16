'use client';

/**
 * The public card verification a QR code opens (docs/frontend/id-cards-done.md
 * §12). Unauthenticated, outside the dashboard: it reads the public API and
 * shows only what the server returns -- which is nothing an unauthenticated
 * viewer should not see.
 */

import * as React from 'react';
import { useParams } from 'next/navigation';
import { baseURL } from '@/app/helpers/api';
import { VerifyView } from '@/app/dashboard/hris/idcards/_bd/VerifyView';
import type { Verification } from '@/app/dashboard/hris/idcards/_bd/types';

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const [v, setV] = React.useState<Verification | null>(null);
  React.useEffect(() => {
    document.title = 'Card verification';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.appendChild(robots);
    fetch(`${baseURL}/public/idcards/verify/${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (r) => setV((await r.json()) as Verification))
      .catch(() => setV({ status: 'UNKNOWN', message: 'The check could not reach the server. Try again.' }));
    return () => robots.remove();
  }, [token]);
  return (
    <div className="idc-verify-page">
      {v ? <VerifyView v={v} /> : <div style={{ fontFamily: 'system-ui', fontSize: 13, color: '#666' }}>Checking the card…</div>}
    </div>
  );
}
