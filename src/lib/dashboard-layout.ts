/**
 * Dashboard layout persistence.
 *
 * Stores the customizable dashboard layout (per-breakpoint grid positions +
 * card visibility) in localStorage, keyed per user + company. `syncWithServer`
 * is a thin async boundary so the same calls can later be pointed at a real
 * backend without touching the UI.
 */

export type DashboardBreakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';

export interface DashboardLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export type DashboardLayouts = Partial<Record<DashboardBreakpoint, DashboardLayoutItem[]>>;

export interface DashboardLayoutState {
  version: number;
  layouts: DashboardLayouts;
  visibility: Record<string, boolean>;
  updatedAt: number;
}

export const DASHBOARD_LAYOUT_VERSION = 2;

export const dashboardLayoutKey = (userId: string, companyId: string) =>
  `balanzify_dashboard_layout_${userId}_${companyId}`;

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/** Read a persisted layout for the given user/company, or null if none/invalid. */
export function getDashboardLayout(
  userId: string,
  companyId: string
): DashboardLayoutState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(dashboardLayoutKey(userId, companyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardLayoutState;
    if (!parsed || typeof parsed !== 'object' || !parsed.layouts) return null;
    if (parsed.version !== DASHBOARD_LAYOUT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist a layout for the given user/company. Returns the stored state. */
export function saveDashboardLayout(
  userId: string,
  companyId: string,
  state: Omit<DashboardLayoutState, 'version' | 'updatedAt'>
): DashboardLayoutState {
  const payload: DashboardLayoutState = {
    version: DASHBOARD_LAYOUT_VERSION,
    layouts: state.layouts,
    visibility: state.visibility,
    updatedAt: Date.now(),
  };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(
        dashboardLayoutKey(userId, companyId),
        JSON.stringify(payload)
      );
    } catch {
      // Quota / serialization issues are non-fatal — the in-memory state still applies.
    }
  }
  return payload;
}

/** Remove any persisted customization so the dashboard falls back to defaults. */
export function resetDashboardLayout(userId: string, companyId: string): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(dashboardLayoutKey(userId, companyId));
  } catch {
    // ignore
  }
}

/**
 * Sync boundary for a future backend. Today this resolves with the local state
 * (or what is read back from storage) so callers can `await` it uniformly.
 */
export async function syncWithServer(
  userId: string,
  companyId: string,
  state?: DashboardLayoutState
): Promise<DashboardLayoutState | null> {
  // TODO: replace with a real API call (e.g. POST /dashboard/layout) when available.
  if (state) return state;
  return getDashboardLayout(userId, companyId);
}
