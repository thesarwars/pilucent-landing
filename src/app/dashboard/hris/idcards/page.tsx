'use client';

import { Suspense } from 'react';
import { IdCards } from './_bd/IdCards';

/** BD ID cards: gallery, cards, print, templates and the designer, settings. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <IdCards />
    </Suspense>
  );
}
