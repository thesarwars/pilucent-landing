import { del, get, patch, post } from "./api";

export const postUserRegister = (data: any) => post("/accounts/register", data);
export const postCompany = (data: any) => post("/we/companies", data);
export const postUserSingIn = (data: any) => post("/accounts/auth/token", data);
export const fetchCompany = async () => {
  try {
    const res = await get("/we");
    return { success: true, ...res };
  } catch (error) {
    return { success: false };
  }
};
export const fetchUser = ()=>get("/me")

export const postPlanSubscription = (data:any)=> post('/we/subscriptions', data)
export const patchPlanSubscription = (uid:string, data:any)=> patch(`/we/subscriptions/${uid}`, data)

//forgot password
export const postForgotPassword = (data:any) =>post("/accounts/forget-password/sent-link", data);
export const patchPassword = (uid:string, token:string, data:any) =>patch(`/accounts/forget-password/${uid}/${token}`, data);

export const postDemo = (data:any)=>post('/public/live-demo', data)

//verify email
export const postOTP = ()=>post('/accounts/email-verifications/send-otp',{})
export const verifyOTP = (data:any)=>post('/accounts/email-verifications',data)


export const postSubscription = (data:any)=> post('/we/subscriptions/checkout', data)

// ── Multi-company billing ────────────────────────────────────────────────
// accounting.balanzify.com hands off the company being subscribed via
// `?company_uid=<uid>`. We persist it to localStorage so it survives the auth
// round-trip (sign-in redirects back to /pricing WITHOUT the query param), then
// attach it to every pay/checkout body so the RIGHT company is billed
// regardless of token state.
const SUBSCRIPTION_COMPANY_UID_KEY = "subscription_company_uid";

// Call once when a pricing/checkout screen mounts: reads ?company_uid from the
// URL and, if present, stashes it. Returns the effective uid (url ?? stored).
export const captureSubscriptionCompanyUid = () => {
  if (typeof window === "undefined") return null;
  const uid = new URLSearchParams(window.location.search).get("company_uid");
  if (uid) localStorage.setItem(SUBSCRIPTION_COMPANY_UID_KEY, uid);
  return uid || localStorage.getItem(SUBSCRIPTION_COMPANY_UID_KEY);
};

export const getSubscriptionCompanyUid = () => {
  if (typeof window === "undefined") return null;
  const uid = new URLSearchParams(window.location.search).get("company_uid");
  return uid || localStorage.getItem(SUBSCRIPTION_COMPANY_UID_KEY);
};

export const clearSubscriptionCompanyUid = () => {
  if (typeof window !== "undefined") localStorage.removeItem(SUBSCRIPTION_COMPANY_UID_KEY);
};

// Merge the handed-off company_uid into a subscription/checkout body. No-op for
// a normal balanzify.com visitor buying for their own company (uid absent).
export const withSubscriptionCompany = (data: any) => {
  const uid = getSubscriptionCompanyUid();
  return uid ? { ...data, company_uid: uid } : data;
};