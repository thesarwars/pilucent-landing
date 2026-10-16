'use client';

/**
 * ID card data, all under `['bd-idcards']`: issuing moves the gallery, the
 * card, the template's live count and the print queue together, so one
 * invalidation refreshes every reading.
 */

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/app/dashboard/hris/employee/employees/_bd/api';
import * as api from './api';
import { resetMeasurements } from './fonts';
import type { GalleryFilter } from './types';

export const idKeys = { all: ['bd-idcards'] as const };
const k = (...parts: unknown[]) => [...idKeys.all, ...parts];
const opts = { retry: (n: number, err: unknown) => n < 2 && !(err instanceof ApiError && err.status >= 400 && err.status < 500) };

export const useSetup = () => useQuery({ queryKey: k('setup'), queryFn: api.getSetup, staleTime: 60_000, ...opts });
export const useGallery = (q: string, filter: GalleryFilter) =>
  useQuery({ queryKey: k('gallery', q, filter), queryFn: () => api.getGallery({ q, filter }), placeholderData: (p) => p, ...opts });
export const useEmployee = (code: string | null, template?: string) =>
  useQuery({ queryKey: k('employee', code, template), queryFn: () => api.getEmployee(code!, template), enabled: !!code, ...opts });
export const useCard = (uid: string | null) => useQuery({ queryKey: k('card', uid), queryFn: () => api.getCard(uid!), enabled: !!uid, ...opts });
export const useTemplates = () => useQuery({ queryKey: k('templates'), queryFn: api.getTemplates, ...opts });
export const useTemplate = (uid: string | null) =>
  useQuery({ queryKey: k('template', uid), queryFn: () => api.getTemplate(uid!), enabled: !!uid, ...opts });
export const useContexts = (uid: string | null) =>
  useQuery({ queryKey: k('contexts', uid), queryFn: () => api.getContexts(uid!), enabled: !!uid, staleTime: 30_000, ...opts });
export const useRules = () => useQuery({ queryKey: k('rules'), queryFn: api.getRules, ...opts });
/** A queued or rendering job polls until it settles. */
export const useJobs = () =>
  useQuery({
    queryKey: k('jobs'), queryFn: api.getJobs, ...opts,
    refetchInterval: (q) => (q.state.data?.jobs.some((j) => j.status === 'QUEUED' || j.status === 'RENDERING') ? 2000 : false),
  });
export const useJob = (uid: string | null) => useQuery({ queryKey: k('job', uid), queryFn: () => api.getJob(uid!), enabled: !!uid, ...opts });
export const useFields = () => useQuery({ queryKey: k('fields'), queryFn: api.getFields, ...opts });

export function useIdInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: idKeys.all });
}

/** Re-render once the faces have loaded: a measurement before then is wrong. */
export function useFontsReady() {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      resetMeasurements();
      setN((x) => x + 1);
    });
    const onLoad = () => { resetMeasurements(); setN((x) => x + 1); };
    document.fonts?.addEventListener?.('loadingdone', onLoad);
    return () => { alive = false; document.fonts?.removeEventListener?.('loadingdone', onLoad); };
  }, []);
  return n;
}
