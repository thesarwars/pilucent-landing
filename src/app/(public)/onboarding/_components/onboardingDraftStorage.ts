const DRAFT_VERSION = 1;

export type OnboardingDraftPayload = {
  v: typeof DRAFT_VERSION;
  currentStep: number;
  data: Record<string, unknown>;
  shippingAddress: Record<string, unknown>;
  mailingAddress: Record<string, unknown>;
  paymentInfo: Record<string, unknown>;
  stateTaxInfo: Record<string, unknown>;
  federalTaxInfo: Record<string, unknown>;
  skippedPayment: boolean;
  skippedTaxes: boolean;
  savedAt: string;
};

export function onboardingDraftKey(empUid: string | null) {
  if (!empUid) return null;
  return `onboarding_draft_${empUid}`;
}

function stripFilesFromData(data: Record<string, unknown>) {
  const { image, w4_signature, ...rest } = data;
  return {
    ...rest,
    __imageStub:
      image instanceof File ? { name: image.name, size: image.size, type: image.type } : null,
    __w4Stub:
      w4_signature instanceof File
        ? { name: w4_signature.name, size: w4_signature.size }
        : typeof w4_signature === 'string' && w4_signature
          ? '__string__'
          : null,
  };
}

export function buildOnboardingDraft(
  currentStep: number,
  data: Record<string, unknown>,
  shippingAddress: Record<string, unknown>,
  mailingAddress: Record<string, unknown>,
  paymentInfo: Record<string, unknown>,
  stateTaxInfo: Record<string, unknown>,
  federalTaxInfo: Record<string, unknown>,
  skippedPayment: boolean,
  skippedTaxes: boolean
): OnboardingDraftPayload {
  return {
    v: DRAFT_VERSION,
    currentStep,
    data: stripFilesFromData(data),
    shippingAddress: { ...shippingAddress },
    mailingAddress: { ...mailingAddress },
    paymentInfo: { ...paymentInfo },
    stateTaxInfo: { ...stateTaxInfo },
    federalTaxInfo: { ...federalTaxInfo },
    skippedPayment,
    skippedTaxes,
    savedAt: new Date().toISOString(),
  };
}

export function loadOnboardingDraft(empUid: string | null): OnboardingDraftPayload | null {
  const key = onboardingDraftKey(empUid);
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraftPayload;
    if (parsed?.v !== DRAFT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(empUid: string | null, payload: OnboardingDraftPayload) {
  const key = onboardingDraftKey(empUid);
  if (!key || typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

export function clearOnboardingDraft(empUid: string | null) {
  const key = onboardingDraftKey(empUid);
  if (!key || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function mergeRestoredData(
  serverData: Record<string, unknown>,
  draftData: Record<string, unknown>
) {
  const { __imageStub, __w4Stub, ...draftRest } = draftData;

  return {
    ...draftRest,
    ...serverData,
    image: '',
    w4_signature: '',
  } as Record<string, unknown>;
}
