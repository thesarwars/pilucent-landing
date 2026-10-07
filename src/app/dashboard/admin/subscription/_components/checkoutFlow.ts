import {
  fetchSubscriptionBillingCurrent,
  postSubscriptionBillingPreview,
  postSubscriptionCheckout,
} from '@/app/helpers/backend';

/** sessionStorage flag set before Stripe redirect; cleared when billing status is ACTIVE|TRIALING */
export const CHECKOUT_PENDING_KEY = 'bz-subscription-checkout-pending';
/** Path (+ query, no origin) to restore after Stripe checkout */
export const CHECKOUT_RETURN_PATH_KEY = 'bz-subscription-checkout-return';

export const SUBSCRIPTION_PAGE_PATH = '/dashboard/admin/subscription';
export type SubscriptionCheckoutTab = 'plans' | 'addons';

export type CheckoutSelectors = {
  subscription_price_slug?: string;
  plan_title?: string;
  billing_frequency?: 'MONTHLY' | 'ANNUAL';
  employee_count?: number;
  user_count?: number;
  tax_rate?: number;
  coupon_code?: string;
  referral_code?: string;
  start_trial?: boolean;
  currency?: string;
  success_url?: string;
  cancel_url?: string;
  return_url?: string;
  /** Tell backend where to send the user after payment (if success_url is a marketing page). */
  return_to?: string;
  /** Which subscription tab initiated checkout (plans | addons). */
  subscription_tab?: SubscriptionCheckoutTab;
};

/** App origin for Stripe return URLs (localhost in dev, dashboard host in prod). */
export const getAppOrigin = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
  if (fromEnv) {
    if (/^https?:\/\//i.test(fromEnv)) return fromEnv;
    return `https://${fromEnv}`;
  }
  if (typeof window !== 'undefined' && window.location.origin) return window.location.origin;
  return 'http://localhost:3000';
};

/** Parse app path or absolute URL safely (env origin may omit https://). */
const parseAppUrl = (pathOrUrl: string, origin = getAppOrigin()): URL => {
  const raw = pathOrUrl?.trim() || SUBSCRIPTION_PAGE_PATH;
  if (/^https?:\/\//i.test(raw)) return new URL(raw);
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return new URL(path, origin);
};

export const getCurrentReturnPath = (): string => {
  if (typeof window === 'undefined') return SUBSCRIPTION_PAGE_PATH;
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
};

/** Return path for Plans / Add-ons checkout on accounting.balanzify.com (tab in query). */
export const buildSubscriptionCheckoutReturnPath = (tab: SubscriptionCheckoutTab): string => {
  const params = new URLSearchParams({ tab });
  return `${SUBSCRIPTION_PAGE_PATH}?${params.toString()}`;
};

const withCheckoutOutcome = (returnPath: string, outcome: 'success' | 'cancel') => {
  const url = parseAppUrl(returnPath);
  url.searchParams.set('subscription_checkout', outcome);
  return url;
};

/** Full absolute URL for Stripe success_url / cancel_url. */
export const buildCheckoutReturnUrl = (
  returnPath: string,
  outcome: 'success' | 'cancel' = 'success'
): string => withCheckoutOutcome(returnPath, outcome).toString();

/** App-relative route for Next.js router.replace (no origin). */
export const buildCheckoutReturnRoute = (
  returnPath: string,
  outcome: 'success' | 'cancel' = 'success'
): string => {
  const url = withCheckoutOutcome(returnPath, outcome);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const markCheckoutPending = (returnPath?: string) => {
  try {
    const path = returnPath ?? getCurrentReturnPath();
    sessionStorage.setItem(CHECKOUT_PENDING_KEY, String(Date.now()));
    sessionStorage.setItem(CHECKOUT_RETURN_PATH_KEY, path);
  } catch {
    /* ignore */
  }
};

export const getCheckoutReturnPath = (): string | null => {
  try {
    return sessionStorage.getItem(CHECKOUT_RETURN_PATH_KEY);
  } catch {
    return null;
  }
};

export const clearCheckoutPending = () => {
  try {
    sessionStorage.removeItem(CHECKOUT_PENDING_KEY);
    sessionStorage.removeItem(CHECKOUT_RETURN_PATH_KEY);
  } catch {
    /* ignore */
  }
};

export const isCheckoutPending = () => {
  try {
    return sessionStorage.getItem(CHECKOUT_PENDING_KEY) != null;
  } catch {
    return false;
  }
};

/** Compare paths ignoring subscription_checkout query param. */
export const sameReturnPath = (stored: string, current: string) => {
  try {
    const a = parseAppUrl(stored);
    const b = parseAppUrl(current);
    a.searchParams.delete('subscription_checkout');
    b.searchParams.delete('subscription_checkout');
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  } catch {
    return false;
  }
};

const num = (v: unknown) => Number(v ?? 0) || 0;

/** Build v2 preview/checkout body from billing snapshot + add-on quantities (extra beyond plan limits). */
export const buildCheckoutBodyFromAddons = (
  billing: Record<string, any> | undefined | null,
  quantities: Record<string, number>,
  extras?: Partial<CheckoutSelectors>
): CheckoutSelectors => {
  const empLimit = num(billing?.limits?.EMPLOYEE?.included_quantity);
  const usrLimit = num(billing?.limits?.USER?.included_quantity);

  const employee_count = empLimit + num(quantities.employees);
  const user_count = usrLimit + num(quantities.users);

  return {
    plan_title: billing?.plan?.title,
    billing_frequency: (billing?.plan?.billing_frequency as 'MONTHLY' | 'ANNUAL') ?? 'MONTHLY',
    employee_count,
    user_count,
    currency: billing?.plan?.currency,
    ...extras,
  };
};

export type PreviewLine = { label: string; amount: number };

export const mapPreviewLines = (preview: Record<string, any> | undefined | null): PreviewLine[] => {
  if (!preview || !Array.isArray(preview.lines)) return [];
  return preview.lines.map((l: any) => ({
    label: l.description ?? l.line_type ?? '',
    amount: num(l.amount),
  }));
};

export const previewTotal = (preview: Record<string, any> | undefined | null) =>
  num(preview?.total);

export const previewMonthlyTotal = (preview: Record<string, any> | undefined | null) => {
  const subtotal = num(preview?.subtotal);
  if (subtotal) return subtotal;
  const base = Array.isArray(preview?.lines)
    ? preview.lines.find((l: any) => l.line_type === 'BASE')
    : undefined;
  return num(base?.amount);
};

export const runBillingPreview = (body: CheckoutSelectors) => postSubscriptionBillingPreview(body);

/**
 * Start Stripe checkout. Pass `tab` from Plans ('plans') or Add-ons ('addons') so
 * success returns to accounting.balanzify.com/dashboard/admin/subscription?tab=...
 */
export const runCheckout = async (
  body: CheckoutSelectors,
  tab?: SubscriptionCheckoutTab
) => {
  const returnPath = tab ? buildSubscriptionCheckoutReturnPath(tab) : getCurrentReturnPath();
  if (tab) {
    try {
      localStorage.setItem('bz-subscription-route', tab);
    } catch {
      /* ignore */
    }
  }
  markCheckoutPending(returnPath);
  const successUrl = buildCheckoutReturnUrl(returnPath, 'success');
  const cancelUrl = buildCheckoutReturnUrl(returnPath, 'cancel');

  return postSubscriptionCheckout({
    ...body,
    success_url: successUrl,
    cancel_url: cancelUrl,
    return_url: successUrl,
    return_to: successUrl,
    subscription_tab: tab,
  });
};

const ACTIVE_STATUSES = new Set(['ACTIVE', 'TRIALING']);

type BillingSnapshot = {
  status: string;
  planTitle?: string;
  periodEnd?: string;
  previewTotal: number;
};

const snapshotBilling = async (): Promise<BillingSnapshot> => {
  const d = await fetchSubscriptionBillingCurrent();
  return {
    status: String(d?.status ?? '').toUpperCase(),
    planTitle: d?.plan?.title,
    periodEnd: d?.billing_period?.end ?? d?.lifecycle?.current_period_end,
    previewTotal: num(d?.preview?.total),
  };
};

const billingChanged = (before: BillingSnapshot, after: BillingSnapshot) => {
  if (before.status === 'PENDING' && ACTIVE_STATUSES.has(after.status)) return true;
  if (before.planTitle !== after.planTitle) return true;
  if (before.periodEnd !== after.periodEnd) return true;
  if (before.previewTotal !== after.previewTotal) return true;
  return false;
};

export type StripeCheckoutResult = {
  ok: boolean;
  usedPopup: boolean;
  cancelled?: boolean;
};

/**
 * Frontend-only checkout: open Stripe in a popup so the user stays on
 * accounting.balanzify.com (Plans / Add-ons tab). Poll billing/current until
 * the subscription updates — no reliance on Stripe success_url / backend redirect.
 */
export const startStripeCheckout = async (
  checkoutUrl: string,
  tab?: SubscriptionCheckoutTab
): Promise<StripeCheckoutResult> => {
  const returnPath = tab ? buildSubscriptionCheckoutReturnPath(tab) : getCurrentReturnPath();
  if (tab) {
    try {
      localStorage.setItem('bz-subscription-route', tab);
    } catch {
      /* ignore */
    }
  }
  markCheckoutPending(returnPath);

  const before = await snapshotBilling();

  const popup = window.open(
    checkoutUrl,
    'balanzify_stripe_checkout',
    'popup=yes,width=640,height=720,scrollbars=yes,resizable=yes'
  );

  if (!popup) {
    window.location.href = checkoutUrl;
    return { ok: false, usedPopup: false };
  }

  const maxMs = 10 * 60 * 1000;
  const graceAfterCloseMs = 45_000;
  const start = Date.now();
  let closedAt: number | null = null;

  return new Promise((resolve) => {
    const finish = (result: StripeCheckoutResult) => {
      clearInterval(timer);
      clearCheckoutPending();
      try {
        popup.close();
      } catch {
        /* ignore */
      }
      resolve(result);
    };

    const timer = setInterval(async () => {
      if (Date.now() - start > maxMs) {
        finish({ ok: false, usedPopup: true, cancelled: true });
        return;
      }

      try {
        const after = await snapshotBilling();
        if (billingChanged(before, after)) {
          finish({ ok: true, usedPopup: true });
          return;
        }
      } catch {
        /* keep polling */
      }

      if (popup.closed) {
        if (!closedAt) closedAt = Date.now();
        if (Date.now() - closedAt > graceAfterCloseMs) {
          finish({ ok: false, usedPopup: true, cancelled: true });
        }
      }
    }, 2000);
  });
};

/** Poll billing/current until subscription is active (full-page redirect fallback). */
export const pollUntilSubscriptionActive = async (
  maxAttempts = 30,
  intervalMs = 2000
): Promise<{ ok: boolean; status?: string }> => {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await fetchSubscriptionBillingCurrent();
    const status = String(data?.status ?? '').toUpperCase();
    if (ACTIVE_STATUSES.has(status)) {
      clearCheckoutPending();
      return { ok: true, status };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { ok: false };
};
