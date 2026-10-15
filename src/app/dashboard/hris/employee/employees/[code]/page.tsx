'use client';

import { use } from 'react';
import { EmployeeProfile } from '../_bd/Profile';

/** The BD employee profile, keyed by business code (`EMP-0142`). */
export default function Page(props: { params: Promise<{ code: string }> }) {
  const { code } = use(props.params);
  return <EmployeeProfile code={decodeURIComponent(code)} />;
}
