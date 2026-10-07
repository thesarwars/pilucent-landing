'use client';

import * as React from 'react';

/** SSR-safe portal target: #modal-root if present, else document.body. */
export function usePortalNode(): HTMLElement | null {
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setNode((document.getElementById('modal-root') as HTMLElement) ?? document.body);
  }, []);
  return node;
}

/** Lock page scroll while `active` is true. */
export function useLockScroll(active: boolean): void {
  React.useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/** Call `onClose` on Escape while `active` is true. */
export function useEscape(active: boolean, onClose: () => void): void {
  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);
}
