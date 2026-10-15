'use client';

import { use } from 'react';
import { SalaryProfile } from '../_bd/SalaryProfile';

/** One employee's salary profile, keyed by business code (`EMP-0142`). */
export default function Page(props: { params: Promise<{ code: string }> }) {
  const { code } = use(props.params);
  return <SalaryProfile code={decodeURIComponent(code)} />;
}
