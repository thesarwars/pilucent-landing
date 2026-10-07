import type { STone } from './ui';

export interface ApiCoupon {
  uid: string;
  code: string;
  status: string;
  discount_kind: string;
  discount_value: string;
  max_redemptions: number | null;
  redemption_count: number;
  max_redemptions_per_company?: number;
  valid_from?: string;
  valid_until?: string;
  is_stackable?: boolean;
  applies_to_subscriptions?: { uid: string; title: string; slug: string }[];
}

export interface ApiOffer {
  uid: string;
  code: string;
  title: string;
  description: string;
  status: string;
  coupon: string | null;
  is_retention_offer: boolean;
  valid_from?: string;
  valid_until?: string;
}

export interface CouponTableRow {
  uid: string;
  code: string;
  type: string;
  value: string;
  eligibility: string;
  redemptions: { used: number; max: number };
  status: { label: string; tone: STone };
  ends: string;
  stackable: string;
}

export interface OfferTableRow {
  uid: string;
  code: string;
  title: string;
  description: string;
  status: { label: string; tone: STone };
  retention: string;
  linkedCoupon: string;
  ends: string;
}

export const normalizeList = (data: unknown) => {
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  const payload = data as { count?: number; next?: string | null; previous?: string | null; results?: unknown[]; data?: unknown[] };
  if (Array.isArray(payload?.results)) {
    return {
      count: payload.count ?? payload.results.length,
      next: payload.next ?? null,
      previous: payload.previous ?? null,
      results: payload.results,
    };
  }
  if (Array.isArray(payload?.data)) {
    return {
      count: payload.count ?? payload.data.length,
      next: payload.next ?? null,
      previous: payload.previous ?? null,
      results: payload.data,
    };
  }
  return { count: 0, next: null, previous: null, results: [] };
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const prettyStatus = (status?: string) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const couponStatusTone = (label: string): STone => {
  const key = label.toLowerCase();
  if (key === 'active') return 'good';
  if (key === 'scheduled') return 'info';
  if (key === 'depleted') return 'mute';
  if (key === 'inactive' || key === 'expired') return 'bad';
  return 'brand';
};

const resolveCouponStatus = (coupon: ApiCoupon) => {
  const now = Date.now();
  const from = coupon.valid_from ? new Date(coupon.valid_from).getTime() : null;
  const until = coupon.valid_until ? new Date(coupon.valid_until).getTime() : null;
  const max = coupon.max_redemptions;
  const used = coupon.redemption_count ?? 0;

  if (max != null && max > 0 && used >= max) {
    return { label: 'Depleted', tone: 'mute' as STone };
  }
  if (from && from > now) {
    return { label: 'Scheduled', tone: 'info' as STone };
  }
  if (until && until < now) {
    return { label: 'Expired', tone: 'bad' as STone };
  }
  const label = prettyStatus(coupon.status);
  return { label, tone: couponStatusTone(label) };
};

const formatDiscountKind = (kind?: string) => {
  const key = (kind ?? '').toUpperCase();
  if (key === 'FLAT') return 'Fixed';
  if (key === 'PERCENT' || key === 'PERCENTAGE') return 'Percentage';
  if (key === 'FREE_PERIOD') return 'Free period';
  return kind ?? '—';
};

const formatDiscountValue = (kind: string | undefined, value: string | undefined) => {
  const key = (kind ?? '').toUpperCase();
  const num = Number(value ?? 0);
  if (key === 'FLAT') return `$${num.toFixed(2)}`;
  if (key === 'PERCENT' || key === 'PERCENTAGE') return `${num}%`;
  return value ?? '—';
};

export const mapCouponRows = (items: ApiCoupon[]): CouponTableRow[] =>
  items.map(coupon => {
    const plans = coupon.applies_to_subscriptions ?? [];
    const eligibility =
      plans.length === 0
        ? 'All plans'
        : plans.length <= 2
          ? plans.map(p => p.title).join(', ')
          : `${plans.length} plans`;

    return {
      uid: coupon.uid,
      code: coupon.code,
      type: formatDiscountKind(coupon.discount_kind),
      value: formatDiscountValue(coupon.discount_kind, coupon.discount_value),
      eligibility,
      redemptions: {
        used: coupon.redemption_count ?? 0,
        max: coupon.max_redemptions ?? 0,
      },
      status: resolveCouponStatus(coupon),
      ends: fmtDate(coupon.valid_until),
      stackable: coupon.is_stackable ? 'Yes' : 'No',
    };
  });

export const mapOfferRows = (items: ApiOffer[]): OfferTableRow[] =>
  items.map(offer => {
    const label = prettyStatus(offer.status);
    return {
      uid: offer.uid,
      code: offer.code,
      title: offer.title,
      description: offer.description || '—',
      status: { label, tone: couponStatusTone(label) },
      retention: offer.is_retention_offer ? 'Yes' : 'No',
      linkedCoupon: offer.coupon ?? '—',
      ends: fmtDate(offer.valid_until),
    };
  });

export const mapCouponsTableData = (data: unknown) => {
  const list = normalizeList(data);
  return {
    ...list,
    results: mapCouponRows(list.results as ApiCoupon[]),
  };
};

export const mapOffersTableData = (data: unknown) => {
  const list = normalizeList(data);
  return {
    ...list,
    results: mapOfferRows(list.results as ApiOffer[]),
  };
};

export interface CouponFormState {
  code: string;
  status: string;
  discount_kind: string;
  discount_value: string;
  max_redemptions: string;
  max_redemptions_per_company: string;
  valid_from: string;
  valid_until: string;
  is_stackable: boolean;
  notes: string;
  plan_uids: string[];
}

export interface OfferFormState {
  code: string;
  title: string;
  description: string;
  status: string;
  coupon: string;
  is_retention_offer: boolean;
  valid_from: string;
  valid_until: string;
}

export const emptyCouponForm = (): CouponFormState => ({
  code: '',
  status: 'ACTIVE',
  discount_kind: 'FLAT',
  discount_value: '',
  max_redemptions: '',
  max_redemptions_per_company: '',
  valid_from: '',
  valid_until: '',
  is_stackable: false,
  notes: '',
  plan_uids: [],
});

export const emptyOfferForm = (): OfferFormState => ({
  code: '',
  title: '',
  description: '',
  status: 'DRAFT',
  coupon: '',
  is_retention_offer: false,
  valid_from: '',
  valid_until: '',
});

const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const couponFormFromApi = (coupon: ApiCoupon): CouponFormState => ({
  code: coupon.code ?? '',
  status: (coupon.status ?? 'ACTIVE').toUpperCase(),
  discount_kind: (coupon.discount_kind ?? 'FLAT').toUpperCase(),
  discount_value: coupon.discount_value != null ? String(coupon.discount_value) : '',
  max_redemptions: coupon.max_redemptions != null ? String(coupon.max_redemptions) : '',
  max_redemptions_per_company:
    coupon.max_redemptions_per_company != null ? String(coupon.max_redemptions_per_company) : '',
  valid_from: toLocalInput(coupon.valid_from),
  valid_until: toLocalInput(coupon.valid_until),
  is_stackable: Boolean(coupon.is_stackable),
  notes: '',
  plan_uids: (coupon.applies_to_subscriptions ?? []).map(p => p.uid),
});

export const offerFormFromApi = (offer: ApiOffer): OfferFormState => ({
  code: offer.code ?? '',
  title: offer.title ?? '',
  description: offer.description ?? '',
  status: (offer.status ?? 'DRAFT').toUpperCase(),
  coupon: offer.coupon ?? '',
  is_retention_offer: Boolean(offer.is_retention_offer),
  valid_from: toLocalInput(offer.valid_from),
  valid_until: toLocalInput(offer.valid_until),
});

const toIsoOrNull = (local: string) => {
  if (!local.trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

export const buildCouponPayload = (form: CouponFormState) => {
  const payload: Record<string, unknown> = {
    code: form.code.trim(),
    status: form.status,
    discount_kind: form.discount_kind,
    discount_value: form.discount_value.trim(),
    is_stackable: form.is_stackable,
    notes: form.notes.trim(),
  };

  const validFrom = toIsoOrNull(form.valid_from);
  const validUntil = toIsoOrNull(form.valid_until);
  if (validFrom) payload.valid_from = validFrom;
  if (validUntil) payload.valid_until = validUntil;

  if (form.max_redemptions.trim()) {
    payload.max_redemptions = Number(form.max_redemptions);
  }
  if (form.max_redemptions_per_company.trim()) {
    payload.max_redemptions_per_company = Number(form.max_redemptions_per_company);
  }
  if (form.plan_uids.length > 0) {
    payload.applies_to_subscription_uids = form.plan_uids;
  }

  return payload;
};

export const buildOfferPayload = (form: OfferFormState) => {
  const payload: Record<string, unknown> = {
    code: form.code.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    is_retention_offer: form.is_retention_offer,
  };

  const validFrom = toIsoOrNull(form.valid_from);
  const validUntil = toIsoOrNull(form.valid_until);
  if (validFrom) payload.valid_from = validFrom;
  if (validUntil) payload.valid_until = validUntil;
  if (form.coupon.trim()) payload.coupon = form.coupon.trim();

  return payload;
};
