"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaCheck, FaRegClock, FaUserPlus, FaHeadset } from "react-icons/fa";
import { useProvider } from "../../context/ProviderContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  postOTP,
  postPlanSubscription,
  postSubscription,
  captureSubscriptionCompanyUid,
  getSubscriptionCompanyUid,
  withSubscriptionCompany,
  clearSubscriptionCompanyUid,
} from "../helpers/backend";
import AnimateOnScroll from "./V2/AnimateOnScroll";

const BILLING_TABS = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Half Yearly", value: "HALF_YEARLY" },
];

const featureGroups = [
  {
    label: "General",
    features: [
      { key: "is_chart_of_account", name: "Chart of Account" },
      { key: "is_chart_of_account_tree", name: "Chart of Account Tree" },
      { key: "is_journal_entry", name: "Journal Entry" },
      { key: "is_bank_transaction", name: "Bank Transaction" },
      { key: "is_company_setting", name: "Company Settings" },
      { key: "is_configuration", name: "Configuration" },
      { key: "is_user_profile", name: "User Profile" },
      { key: "is_attachment", name: "Attachments" },
      { key: "is_user_role_management", name: "User Role Management" },
      { key: "is_audit_log", name: "Audit Log" },
    ],
  },
  {
    label: "Payroll",
    features: [
      { key: "is_employees", name: "Employees" },
      { key: "is_payroll", name: "Payroll" },
      { key: "is_attendance", name: "Attendance" },
      { key: "is_punch_data_import", name: "Punch Data Import" },
    ],
  },
  {
    label: "Sales & Inventory",
    features: [
      { key: "is_sales", name: "Sales" },
      { key: "is_customer", name: "Customer Management" },
      { key: "is_inventory", name: "Inventory" },
      { key: "is_warehouse", name: "Warehouse" },
    ],
  },
  {
    label: "Expenses",
    features: [
      { key: "is_expense", name: "Expense" },
      { key: "is_supplier_management", name: "Supplier Management" },
    ],
  },
  {
    label: "Reports",
    features: [
      { key: "is_standard_report", name: "Standard Reports" },
      { key: "is_agency_tax", name: "Agency Tax" },
    ],
  },
  {
    label: "Features",
    features: [
      { key: "is_multicurrency", name: "Multi-currency" },
      { key: "is_terms", name: "Terms" },
      { key: "is_payment_management", name: "Payment Management" },
      { key: "is_support_ticket", name: "Support Ticket" },
      { key: "is_ai_finzify", name: "AI Finzify" },
    ],
  },
];

// ── Hardcoded data for the "Full Feature Comparison" table ──
const COMPARE_PLANS = [
  {
    title: "Core",
    monthly: 8,
    annual: 6,
    unit: "/employee/month",
    trialNote: "2 Months free",
    save: "Save 20%",
    cta: "Start Free Trial",
    ctaStyle: "outline",
    href: "/auth?action=sign-in",
  },
  {
    title: "Professional",
    monthly: 149,
    annual: 119,
    unit: "/month",
    trialNote: "2 Months free",
    save: "Save 20%",
    cta: "Start Free Trial",
    ctaStyle: "solid",
    popular: true,
    href: "/auth?action=sign-in",
  },
  {
    title: "Plus",
    monthly: 299,
    annual: 239,
    unit: "/month",
    trialNote: "2 Months free",
    save: "Save 20%",
    cta: "Contact Us",
    ctaStyle: "white",
    href: "/contact",
  },
];

// values map to [Core, Professional, Plus]
const COMPARE_GROUPS = [
  {
    label: "Payroll & Tax",
    features: [
      { name: "Payroll Automation", values: [true, true, true] },
      { name: "Tax Filing (940/941/W-2)", values: [true, true, true] },
      { name: "W-4 Support", values: [true, true, true] },
      { name: "Direct Deposit", values: [true, true, true] },
      { name: "Multi-State Payroll", values: [false, true, true] },
    ],
  },
  {
    label: "HR & Workforce",
    features: [
      { name: "Employee Self-Service Portal", values: [true, true, true] },
      { name: "PTO Tracking", values: [false, true, true] },
      { name: "HR Management", values: [false, true, true] },
      { name: "Approval Workflows", values: [false, true, true] },
      { name: "Custom Roles & Permissions", values: [false, false, true] },
    ],
  },
  {
    label: "Accounting & Finance",
    features: [
      { name: "Native Accounting Ledger", values: [false, true, true] },
      { name: "Bank Reconciliation", values: [false, true, true] },
      { name: "Expense Management", values: [false, true, true] },
      { name: "Inventory Management", values: [false, false, true] },
    ],
  },
  {
    label: "Reporting & Admin",
    features: [
      { name: "Standard Reports", values: [true, true, true] },
      { name: "Audit Logs", values: [false, true, true] },
      { name: "Multi-Company Support", values: [false, false, true] },
    ],
  },
  {
    label: "Integrations & Support",
    features: [
      { name: "API Access", values: [false, false, true] },
      { name: "Custom Integrations", values: [false, false, true] },
      { name: "Dedicated Account Manager", values: [false, false, true] },
      { name: "SLA Guarantee", values: [false, false, true] },
    ],
  },
];

// ── Add-on / value cards shown below the comparison table ──
const EXTRA_CARDS = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
  <path d="M13.3333 0C20.6973 0 26.6667 5.96933 26.6667 13.3333C26.6667 20.6973 20.6973 26.6667 13.3333 26.6667C5.96933 26.6667 0 20.6973 0 13.3333C0 5.96933 5.96933 0 13.3333 0ZM13.3333 2.66667C10.5044 2.66667 7.79125 3.79047 5.79086 5.79086C3.79047 7.79125 2.66667 10.5044 2.66667 13.3333C2.66667 16.1623 3.79047 18.8754 5.79086 20.8758C7.79125 22.8762 10.5044 24 13.3333 24C16.1623 24 18.8754 22.8762 20.8758 20.8758C22.8762 18.8754 24 16.1623 24 13.3333C24 10.5044 22.8762 7.79125 20.8758 5.79086C18.8754 3.79047 16.1623 2.66667 13.3333 2.66667ZM13.3333 5.33333C13.6599 5.33338 13.9751 5.45327 14.2192 5.67029C14.4632 5.8873 14.6191 6.18633 14.6573 6.51067L14.6667 6.66667V12.7813L18.276 16.3907C18.5151 16.6306 18.654 16.9526 18.6643 17.2912C18.6746 17.6298 18.5557 17.9596 18.3317 18.2137C18.1076 18.4678 17.7953 18.6271 17.458 18.6592C17.1208 18.6913 16.784 18.5939 16.516 18.3867L16.3907 18.276L12.3907 14.276C12.1834 14.0686 12.0504 13.7987 12.012 13.508L12 13.3333V6.66667C12 6.31304 12.1405 5.97391 12.3905 5.72386C12.6406 5.47381 12.9797 5.33333 13.3333 5.33333Z" fill="white"/>
</svg>,
    title: "Time Tracking",
    description:
      "Clock-in/out, shift scheduling, overtime calculation, and timesheet approvals. Syncs directly to payroll.",
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M32 8V32H0V8H8.07812C8.05729 7.83333 8.04167 7.66667 8.03125 7.5C8.02083 7.33333 8.01042 7.16667 8 7C8 6.03125 8.18229 5.125 8.54688 4.28125C8.91146 3.4375 9.41146 2.69271 10.0469 2.04688C10.6823 1.40104 11.4219 0.901042 12.2656 0.546875C13.1094 0.192708 14.0208 0.0104167 15 0C15.9688 0 16.875 0.182292 17.7188 0.546875C18.5625 0.911458 19.3073 1.41146 19.9531 2.04688C20.599 2.68229 21.099 3.42188 21.4531 4.26562C21.8073 5.10938 21.9896 6.02083 22 7C22 7.16667 21.9948 7.33333 21.9844 7.5C21.974 7.66667 21.9531 7.83333 21.9219 8H32ZM15 2C14.3125 2 13.6667 2.13021 13.0625 2.39062C12.4583 2.65104 11.9271 3.01042 11.4688 3.46875C11.0104 3.92708 10.651 4.45833 10.3906 5.0625C10.1302 5.66667 10 6.3125 10 7C10 7.6875 10.1302 8.33333 10.3906 8.9375C10.651 9.54167 11.0052 10.0729 11.4531 10.5312C11.901 10.9896 12.4323 11.349 13.0469 11.6094C13.6615 11.8698 14.3125 12 15 12C15.6875 12 16.3333 11.8698 16.9375 11.6094C17.5417 11.349 18.0677 10.9948 18.5156 10.5469C18.9635 10.099 19.3229 9.56771 19.5938 8.95312C19.8646 8.33854 20 7.6875 20 7C20 6.3125 19.8698 5.66667 19.6094 5.0625C19.349 4.45833 18.9896 3.93229 18.5312 3.48438C18.0729 3.03646 17.5417 2.67708 16.9375 2.40625C16.3333 2.13542 15.6875 2 15 2ZM30 10H21.3281C21.0677 10.5417 20.7448 11.0469 20.3594 11.5156C19.974 11.9844 19.5312 12.3854 19.0312 12.7188C20.1042 13.1354 21.0729 13.6875 21.9375 14.375C22.8021 15.0625 23.5312 15.8542 24.125 16.75C24.7188 17.6458 25.1823 18.625 25.5156 19.6875C25.849 20.75 26.0104 21.8542 26 23V24H24V23C24 21.7188 23.7708 20.5312 23.3125 19.4375C22.8542 18.3438 22.224 17.3906 21.4219 16.5781C20.6198 15.7656 19.6719 15.1354 18.5781 14.6875C17.4844 14.2396 16.2917 14.0104 15 14C13.8438 14 12.75 14.1979 11.7188 14.5938C10.6875 14.9896 9.77083 15.5469 8.96875 16.2656C8.16667 16.9844 7.51042 17.8281 7 18.7969C6.48958 19.7656 6.17188 20.8333 6.04688 22H16.1719L12.5781 18.4062L14 17L20 23L14 29L12.5781 27.5938L16.1719 24H4V23C4 21.8542 4.16146 20.7552 4.48438 19.7031C4.80729 18.651 5.27604 17.6771 5.89062 16.7812C6.50521 15.8854 7.23958 15.0938 8.09375 14.4062C8.94792 13.7188 9.91146 13.1615 10.9844 12.7344C9.96354 12.0156 9.19271 11.1042 8.67188 10H2V30H30V10Z" fill="white"/>
</svg>,
    title: "Custom Onboarding",
    description:
      "A dedicated implementation specialist configures your account, migrates historical data, and walks your team through the platform.",
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M9 10.9992C9 9.14271 9.7375 7.36223 11.0503 6.04948C12.363 4.73672 14.1435 3.99923 16 3.99923C17.8565 3.99923 19.637 4.73672 20.9497 6.04948C22.2625 7.36223 23 9.14271 23 10.9992C23 11.2644 23.1054 11.5188 23.2929 11.7063C23.4804 11.8939 23.7348 11.9992 24 11.9992C24.2652 11.9992 24.5196 11.8939 24.7071 11.7063C24.8946 11.5188 25 11.2644 25 10.9992C24.9999 9.46436 24.6072 7.95502 23.8593 6.61468C23.1114 5.27435 22.0332 4.14754 20.7271 3.34138C19.421 2.53521 17.9304 2.07647 16.397 2.00876C14.8637 1.94105 13.3384 2.26662 11.9664 2.95452C10.5943 3.64243 9.42091 4.6698 8.5578 5.939C7.69469 7.20821 7.17052 8.67705 7.0351 10.2059C6.89968 11.7348 7.15751 13.2729 7.7841 14.6741C8.41068 16.0752 9.38519 17.2929 10.615 18.2112C11.6696 18.999 12.8841 19.5458 14.173 19.8132C14.352 20.2148 14.6584 20.5462 15.0448 20.7562C15.4311 20.9661 15.8759 21.0429 16.3102 20.9746C16.7446 20.9063 17.1443 20.6968 17.4476 20.3785C17.751 20.0602 17.9409 19.6507 17.9881 19.2136C18.0353 18.7764 17.9372 18.3359 17.7088 17.9602C17.4805 17.5844 17.1347 17.2944 16.7249 17.135C16.3151 16.9755 15.8642 16.9556 15.442 17.0782C15.0197 17.2008 14.6497 17.4591 14.389 17.8132C12.8546 17.4504 11.4876 16.5801 10.5096 15.3434C9.53148 14.1067 8.99957 12.576 9 10.9992ZM10 10.9992C10.0004 9.89542 10.3053 8.81311 10.8811 7.87139C11.4569 6.92967 12.2813 6.16505 13.2637 5.66165C14.246 5.15825 15.3482 4.9356 16.4489 5.01818C17.5496 5.10076 18.6062 5.48538 19.5024 6.12972C20.3987 6.77405 21.0998 7.65313 21.5286 8.67023C21.9575 9.68732 22.0975 10.803 21.9331 11.8945C21.7688 12.986 21.3066 14.0111 20.5973 14.8568C19.888 15.7026 18.9592 16.3363 17.913 16.6882C17.375 16.2429 16.6984 15.9992 16 15.9992C15.273 15.9992 14.607 16.2582 14.087 16.6882C12.8958 16.2875 11.8604 15.5228 11.1271 14.5021C10.3938 13.4813 9.99955 12.2561 10 10.9992ZM16 6.99923C14.9391 6.99923 13.9217 7.42065 13.1716 8.1708C12.4214 8.92095 12 9.93836 12 10.9992C12 12.0601 12.4214 13.0775 13.1716 13.8277C13.9217 14.5778 14.9391 14.9992 16 14.9992C17.0609 14.9992 18.0783 14.5778 18.8284 13.8277C19.5786 13.0775 20 12.0601 20 10.9992C20 9.93836 19.5786 8.92095 18.8284 8.1708C18.0783 7.42065 17.0609 6.99923 16 6.99923ZM7.5 17.9992H8.859C9.66287 18.8205 10.6023 19.4971 11.636 19.9992H7.5C7.10218 19.9992 6.72064 20.1573 6.43934 20.4386C6.15804 20.7199 6 21.1014 6 21.4992V21.9992C6 23.4722 6.94 24.9482 8.759 26.1052C10.566 27.2552 13.123 27.9992 15.999 27.9992C18.877 27.9992 21.434 27.2552 23.241 26.1052C25.061 24.9492 26 23.4712 26 21.9992V21.4992C26 21.1014 25.842 20.7199 25.5607 20.4386C25.2794 20.1573 24.8978 19.9992 24.5 19.9992H18.83C19.0588 19.3522 19.0588 18.6463 18.83 17.9992H24.5C25.4283 17.9992 26.3185 18.368 26.9749 19.0244C27.6313 19.6807 28 20.571 28 21.4992V21.9992C28 24.3922 26.477 26.4162 24.315 27.7922C22.141 29.1762 19.198 29.9992 16 29.9992C12.802 29.9992 9.86 29.1762 7.685 27.7922C5.523 26.4162 4 24.3922 4 21.9992V21.4992C4 20.571 4.36875 19.6807 5.02513 19.0244C5.6815 18.368 6.57174 17.9992 7.5 17.9992Z" fill="white"/>
</svg>,
    title: "Premium Support",
    description:
      "Priority queue access and a named support contact. 4-hour response guarantee during business hours.",
  },
];

const CheckCell = ({ value }) =>
  value ? (
    <span className="block text-center text-white/80 text-sm select-none">Yes</span>
  ) : (
    <span className="block text-center text-white/30 text-sm select-none">No</span>
  );

const SubscriptionPlans = () => {
  const [planKind, setPlanKind] = useState("MONTHLY");
  const [compareBilling, setCompareBilling] = useState("annual");
  const [hydrated, setHydrated] = useState(false);
  const [plans, setPlans] = useState([]);
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [yearlyPlans, setYearlyPlans] = useState([]);
  const [halfYearlyPlans, setHalfYearlyPlans] = useState([]);
  const [quarterlyPlans, setQuarterlyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [checkoutSlug, setCheckoutSlug] = useState(null);
  const hasFetched = useRef(false);
  const router = useRouter();
  const { user, company, setUser, setCompany } = useProvider();
  const action = useSearchParams().get("action");

  useEffect(() => {
    setHydrated(true);
    // Persist the company handed off from accounting.balanzify.com (?company_uid)
    // so the right company is billed even after the sign-in round-trip drops the param.
    captureSubscriptionCompanyUid();
    if (!hasFetched.current) {
      fetchSubscriptionPlans(1);
      hasFetched.current = true;
    }
  }, []);

  useEffect(() => {
    if (action == "logout") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("company_id");
      setUser({});
      setCompany({});
      router.push("/auth?action=sign-in");
    }
  }, [action]);

  const fetchSubscriptionPlans = async (page = 1) => {
    try {
      const data = await fetch(
        `https://balanzifyapi.jumatechs.xyz/api/v1/public/subscription-plans?kind=COMPANY_SUBSCRIPTION&page=${page}`
      );
      if (!data.ok) throw new Error("Failed to fetch subscription plans");
      const response = await data.json();
      if (response.next == null) setHasMore(false);
      else setHasMore(true);
      if (!response?.detail) setPlans((prev) => [...prev, ...response.results]);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const getPlans = async () => {
      if (plans.length > 0) {
        await Promise.all(plans?.map((plan) => fetchSubscriptionPrices(plan.slug)));
        getSpecificPlans();
        setLoading(false);
      }
    };
    getPlans();
  }, [plans]);

  const getSpecificPlans = () => {
    setHalfYearlyPlans([]);
    setMonthlyPlans([]);
    setQuarterlyPlans([]);
    setYearlyPlans([]);
    plans?.map((plan) => {
      plan?.prices?.map((price) => {
        if (price.billing_frequency === "MONTHLY") setMonthlyPlans((prev) => [...prev, { ...plan, price }]);
        else if (price.billing_frequency === "YEARLY") setYearlyPlans((prev) => [...prev, { ...plan, price }]);
        else if (price.billing_frequency === "HALF_YEARLY") setHalfYearlyPlans((prev) => [...prev, { ...plan, price }]);
        else if (price.billing_frequency === "QUARTERLY") setQuarterlyPlans((prev) => [...prev, { ...plan, price }]);
      });
    });
  };

  const fetchSubscriptionPrices = async (planSlug) => {
    try {
      const response = await fetch(
        `https://balanzifyapi.jumatechs.xyz/api/v1/public/subscription-plans/${planSlug}/prices`
      );
      if (!response.ok) throw new Error(`Failed to fetch prices for ${planSlug}`);
      const data = await response.json();
      plans?.map((plan) => {
        if (plan.slug === planSlug) {
          const updatedPlans = [...plans];
          const planIndex = updatedPlans.findIndex((p) => p.slug === planSlug);
          if (planIndex !== -1) updatedPlans[planIndex].prices = data.results;
          return updatedPlans;
        }
      });
    } catch (err) {
      console.error(`Error fetching prices for ${planSlug}:`, err);
    }
  };

  const getPlan = () => {
    if (planKind === "MONTHLY") return monthlyPlans;
    if (planKind === "YEARLY") return yearlyPlans;
    if (planKind === "HALF_YEARLY") return halfYearlyPlans;
    if (planKind === "QUARTERLY") return quarterlyPlans;
    return [];
  };

  const handleChoosePlan = async (plan) => {
    if (!user?.uid) { router.push("/auth?action=sign-in"); return; }
    if (!user?.is_email_verified) {
      const res = await postOTP();
      if (res?.success) router.push("/auth?action=verify-email&from=registration");
      return;
    }
    // Only block on the token-resolved company's plan status when there is NO
    // handed-off company. With a company_uid handoff we're subscribing a
    // specific (no-subscription) company from accounting — a *different*
    // company already having a plan must not block it.
    if (!getSubscriptionCompanyUid() && user?.uid && company?.is_company_subscription) {
      toast.info("You already have a running plan. If you want to cancel please contact support from your company dashboard.", { duration: 4000 });
      return;
    }
    if (checkoutSlug) return;
    try {
      setCheckoutSlug(plan?.price?.slug);
      // 1) create the subscription for the chosen price (bill the handed-off company)
      await postPlanSubscription(
        withSubscriptionCompany({ subscription_price_slug: plan?.price?.slug })
      );
      // 2) start Stripe checkout and redirect to the hosted checkout page
      const res = await postSubscription(
        withSubscriptionCompany({
          billing_frequency: plan?.price?.billing_frequency,
          plan_title: plan?.title,
        })
      );
      if (res?.success && res?.checkout_url) {
        // handoff consumed — clear so a later unrelated purchase isn't mis-billed
        clearSubscriptionCompanyUid();
        window.location.href = res.checkout_url;
      } else {
        toast.error("Something went wrong. Please try again.");
        setCheckoutSlug(null);
      }
    } catch (err) {
      toast.error("Error occurred. Please try again.");
      setCheckoutSlug(null);
    }
  };

  if (!hydrated) return null;

  if (loading) {
    return (
      <div className="py-20 w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-white/10 border-t-[#8B5CF6]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-4 text-center">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  const activePlans = getPlan();

  return (
    <div>
      {/* ── Section header ── */}
      {/* <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-[#F9F9F9] text-2xl sm:text-3xl font-semibold mb-5">Pricing Plan</h2>

        <div
          className="inline-flex items-center gap-1 p-1 rounded-full"
          style={{
            background: "linear-gradient(145deg, rgba(19,16,34,0.8), #1a163a)",
            border: "1px solid rgba(249,249,249,0.12)",
          }}
        >
          {BILLING_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPlanKind(tab.value)}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                planKind === tab.value
                  ? "bg-[#8B5CF6] text-white shadow-[0_4px_14px_-4px_rgba(139,92,246,0.6)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div> */}

      {/* ── Plan cards ── */}
      {/* <div className={`grid gap-5 ${activePlans.length <= 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : activePlans.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {activePlans.map((plan, index) => {
          const isPopular = index === 1;
          const finalPrice = (Number(plan?.price?.price) - Number(plan?.price?.discount)).toFixed(2);
          const originalPrice = Number(plan?.price?.price).toFixed(2);
          const hasDiscount = Number(plan?.price?.discount) > 0;
          const billingLabel = plan?.price?.billing_frequency?.split("_").join(" ").toLowerCase();

          return (
            <AnimateOnScroll
              key={index}
              delay={index * 80}
              className="rounded-3xl p-6 sm:p-7 flex flex-col hover:-translate-y-1 transition-all duration-500"
              style={
                isPopular
                  ? {
                      background: "linear-gradient(180deg, #321C60 0%, rgba(112,62,213,0.35) 100%)",
                      border: "1px solid #7C5BFF",
                      boxShadow: "0 20px 60px -20px rgba(124,91,255,0.4)",
                    }
                  : {
                      background: "linear-gradient(145deg, rgba(19,16,34,0.7), #1a163a)",
                      border: "1px solid rgba(249,249,249,0.10)",
                    }
              }
            >
              {isPopular && (
                <div className="mb-4">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ background: "rgba(139,92,246,0.4)", border: "1px solid rgba(139,92,246,0.6)" }}
                  >
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-[#F9F9F9] font-semibold text-lg mb-1">{plan.title || "Plan"}</h3>
                {plan.description && (
                  <p className="text-white/50 text-xs leading-relaxed">{plan.description}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[#F9F9F9] text-4xl font-bold">${finalPrice}</span>
                  <span className="text-white/40 text-sm">/ {billingLabel}</span>
                </div>
                {hasDiscount && (
                  <span className="text-white/35 text-sm line-through">${originalPrice}</span>
                )}
                {plan.trial_period > 0 && (
                  <p className="text-white/40 text-xs mt-1">{plan.trial_period} days free trial</p>
                )}
              </div>

              <button
                onClick={() => handleChoosePlan(plan)}
                disabled={checkoutSlug != null}
                className={`w-full py-3 px-5 rounded-full text-sm font-semibold mb-4 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isPopular
                    ? "bg-[#8B5CF6] text-white shadow-[0_6px_20px_-6px_rgba(139,92,246,0.6)] hover:bg-[#7c3aed]"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {checkoutSlug === plan?.price?.slug ? "Processing..." : "Get Started"}
              </button>

              {plan.trial_period > 0 && (
                <button
                  onClick={() => router.push("/demo")}
                  className="text-xs text-white/40 hover:text-[#8B5CF6] transition-colors mb-5 text-center"
                >
                  or Try it Free
                </button>
              )}

              <div className="border-t border-white/10 pt-5 mt-auto">
                <p className="text-white/50 text-xs font-medium mb-3">Features included:</p>
                <ul className="space-y-2.5">
                  {featureGroups.flatMap((g) => g.features).filter((f) => plan[f.key]).slice(0, 8).map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                        <FaCheck className="w-2 h-2 text-[#8B5CF6]" />
                      </div>
                      <span className="text-white/65 text-xs">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>
          );
        })}
      </div> */}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => { fetchSubscriptionPlans(currentPage + 1); setCurrentPage(currentPage + 1); }}
            className="text-sm text-[#8B5CF6] hover:text-white transition-colors"
          >
            Load more plans →
          </button>
        </div>
      )}

      {/* ── Comparison table ── */}
      <div className="mt-16 sm:mt-20">
        <AnimateOnScroll className="text-center mb-10">
          <span
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-4 text-white/70"
            style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.30)" }}
          >
            Compare Plans
          </span>
          <h2 className="text-[#F9F9F9] text-2xl sm:text-3xl font-semibold mb-3">
            Full Feature Comparison
          </h2>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            Compare every feature across all plans so you can choose the exact right fit for your business.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll
          className="rounded-3xl overflow-x-auto"
          style={{
            background: "linear-gradient(145deg, rgba(19,16,34,0.8), #1a163a)",
            border: "1px solid rgba(249,249,249,0.10)",
          }}
        >
          <div className="min-w-[640px]">
            {/* Table header */}
            <div
              className="grid items-end px-5 sm:px-8 pt-6"
              style={{ gridTemplateColumns: `1fr repeat(${COMPARE_PLANS.length}, minmax(120px, 1fr))` }}
            >
              <div className="flex items-end pb-6">
                <div
                  className="inline-flex items-center gap-1 p-1 rounded-full"
                  style={{
                    background: "linear-gradient(145deg, rgba(19,16,34,0.8), #1a163a)",
                    border: "1px solid rgba(249,249,249,0.12)",
                  }}
                >
                  {["Monthly", "Annual"].map((label) => {
                    const value = label.toLowerCase();
                    return (
                      <button
                        key={value}
                        onClick={() => setCompareBilling(value)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                          compareBilling === value
                            ? "bg-white text-[#1a163a]"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {COMPARE_PLANS.map((plan, i) => {
                const price = compareBilling === "annual" ? plan.annual : plan.monthly;
                return (
                  <div
                    key={i}
                    className={`text-center px-3 pt-5 pb-6 ${i === 1 ? "bg-[#221941] rounded-t-2xl" : ""}`}
                  >
                    <p className="text-[#F9F9F9] font-semibold text-base mb-2">{plan.title}</p>
                    <div className="flex items-center justify-center flex-wrap gap-1.5 mb-1">
                      <p className="text-white/60 text-xs">
                        <span className="text-[#F9F9F9] font-bold text-lg">${price}</span>
                        <span className="text-white/40">{plan.unit}</span>
                      </p>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full text-[#8B5CF6]"
                        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)" }}
                      >
                        {plan.save}
                      </span>
                    </div>
                    <p className="text-white/35 text-[11px] mb-3">{plan.trialNote}</p>
                    <button
                      onClick={() => router.push(plan.href)}
                      className={`w-full text-xs px-4 py-2 rounded-full font-semibold transition-all hover:scale-[1.02] ${
                        plan.ctaStyle === "solid"
                          ? "bg-[#8B5CF6] text-white shadow-[0_6px_20px_-6px_rgba(139,92,246,0.6)] hover:bg-[#7c3aed]"
                          : plan.ctaStyle === "white"
                          ? "bg-white text-[#1a163a] hover:bg-white/90"
                          : "border border-white/20 text-white hover:bg-white/10"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Feature rows */}
            {COMPARE_GROUPS.map((group, gi) => (
              <div key={gi}>
                {/* Group label — highlight column stays continuous through the band */}
                <div
                  className="grid items-stretch border-t border-white/[0.07]"
                  style={{ gridTemplateColumns: `1fr repeat(${COMPARE_PLANS.length}, minmax(120px, 1fr))` }}
                >
                  <div className="px-5 sm:px-8 py-3 bg-white/[0.03]">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{group.label}</p>
                  </div>
                  {COMPARE_PLANS.map((_, ci) => (
                    <div key={ci} className={ci === 1 ? "bg-[#221941]" : "bg-white/[0.03]"} />
                  ))}
                </div>
                {group.features.map((feature, fi) => (
                  <div
                    key={fi}
                    className="grid items-center border-t border-white/[0.06]"
                    style={{ gridTemplateColumns: `1fr repeat(${COMPARE_PLANS.length}, minmax(120px, 1fr))` }}
                  >
                    <p className="text-white/65 text-sm py-3.5 px-5 sm:px-8">{feature.name}</p>
                    {feature.values.map((val, pi) => (
                      <div
                        key={pi}
                        className={`flex justify-center py-3.5 ${pi === 1 ? "bg-[#221941]" : ""}`}
                      >
                        <CheckCell value={val} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Bottom cap so the highlighted column rounds off cleanly */}
            <div
              className="grid"
              style={{ gridTemplateColumns: `1fr repeat(${COMPARE_PLANS.length}, minmax(120px, 1fr))` }}
            >
              <div />
              {COMPARE_PLANS.map((_, i) => (
                <div key={i} className={`h-5 ${i === 1 ? "bg-[#221941] rounded-b-2xl" : ""}`} />
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      {/* pricing card */}
      <div className="mt-14 sm:mt-16 flex flex-col md:flex-row md:items-stretch gap-4 sm:gap-5">
        {EXTRA_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <AnimateOnScroll
              key={i}
              className="relative flex-1 min-h-[280px] hover:-translate-y-2 transition-transform duration-500"
              delay={i * 120}
            >
              <Image
                src="/V2/pricing_card.png"
                alt=""
                fill
                className="object-fill pointer-events-none select-none"
              />
              <div className="relative h-full min-h-[230px] flex flex-col justify-between p-5 sm:p-6">
                {/* top icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  {Icon}
                </div>

                {/* bottom text */}
                <div className="mt-8">
                  <h4 className="text-[#F9F9F9] font-semibold text-base mb-1.5">{card.title}</h4>
                  <p className="text-[#FFFFFFA3] text-xs leading-relaxed">{card.description}</p>
                </div>
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
