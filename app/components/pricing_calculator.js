"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

// ─── Check icon (V2 card style) ──────────────────────────────────────────────
const CheckIcon = ({ white }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke={white ? "white" : "#8B5CF6"} strokeWidth="2" />
    <path
      d="M8.7347 14.8422L5.16156 11.3561C5.05828 11.256 5 11.1196 5 10.9774C5 10.8352 5.05828 10.6988 5.16156 10.5985L5.9381 9.84088H5.93825C6.0417 9.7398 6.18209 9.68295 6.32865 9.68295C6.47505 9.68295 6.61545 9.7398 6.71905 9.84088L9.1251 12.1883L14.2811 7.15793C14.3846 7.05686 14.5249 7 14.6715 7C14.8179 7 14.9583 7.05686 15.0619 7.15793L15.8384 7.91555V7.9157C15.9419 8.01585 16 8.15221 16 8.29443C16 8.43665 15.9419 8.57301 15.8384 8.67332L9.51563 14.8421C9.41219 14.9431 9.27163 15 9.12523 15C8.97868 15 8.83827 14.9431 8.73483 14.8421L8.7347 14.8422Z"
      fill={white ? "white" : "#8B5CF6"}
    />
  </svg>
);

// ─── Billing frequency tabs (match pricing_section) ───────────────────────────
const BILLING_TABS = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Half Yearly", value: "HALF_YEARLY" },
];

// ─── Feature flag → label map (match pricing_section) ─────────────────────────
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

// ─── Plan Card (design preserved, data from API) ──────────────────────────────
function PlanCard({ plan, index, onChoose, checkoutSlug }) {
  const isPopular = index === 1;
  const isProcessing = checkoutSlug === plan?.price?.slug;
  const finalPrice = (Number(plan?.price?.price) - Number(plan?.price?.discount)).toFixed(2);
  const originalPrice = Number(plan?.price?.price).toFixed(2);
  const hasDiscount = Number(plan?.price?.discount) > 0;
  const billingLabel = plan?.price?.billing_frequency?.split("_").join(" ").toLowerCase();
  const planFeatures = featureGroups.flatMap((g) => g.features).filter((f) => plan[f.key]);

  return (
    <AnimateOnScroll
      delay={index * 120}
      className="relative rounded-3xl overflow-hidden hover:-translate-y-1.5 transition-transform duration-500"
      style={{ minHeight: 560 }}
    >
      {/* Background image */}
      <Image
        src={isPopular ? "/V2/pricing_2.png" : "/V2/pricing_1.png"}
        alt=""
        fill
        className="object-fill pointer-events-none select-none"
      />

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-7 flex flex-col h-full">
        {/* Popular badge */}
        {isPopular && (
          <div className="flex justify-end mb-1">
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
              style={{ background: "#8B5CF6" }}
            >
              Most Popular
            </span>
          </div>
        )}

        {/* Plan name + description */}
        <div className="mb-4">
          <h3 className="text-[#F9F9F9] font-semibold text-xl mb-1">{plan.title || "Plan"}</h3>
          {plan.description && (
            <p className="text-white/50 text-xs leading-relaxed">{plan.description}</p>
          )}
        </div>

        {/* Price (from API) */}
        <div className="mb-2">
          <div className="text-[#F9F9F9] text-4xl font-bold leading-tight">
            ${finalPrice}
            <span className="text-white/40 text-sm font-normal ml-1">/ {billingLabel}</span>
          </div>
        </div>

        {/* Original price + trial */}
        {hasDiscount && (
          <p
            className={`text-[11px] font-semibold mb-2 ${
              isPopular ? "text-white" : "text-[#A78BFA]"
            }`}
          >
            <span className="text-white/35 line-through font-normal mr-1.5">${originalPrice}</span>
            Save ${(Number(originalPrice) - Number(finalPrice)).toFixed(2)}
          </p>
        )}
        {plan.trial_period > 0 && (
          <p className="text-white/55 text-xs mb-4 leading-relaxed">
            {plan.trial_period} days free trial included
          </p>
        )}

        {/* CTA */}
        <button
          onClick={() => onChoose(plan)}
          disabled={checkoutSlug != null}
          className={`w-full py-3 rounded-full text-sm font-semibold mb-1.5 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isPopular
              ? "bg-[#8B5CF6] text-white shadow-[0_6px_20px_-6px_rgba(139,92,246,0.6)] hover:bg-[#7c3aed]"
              : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
          }`}
        >
          {isProcessing
            ? "Processing..."
            : plan.trial_period > 0
            ? `Start ${plan.trial_period}–Day Free Trial`
            : "Get Started"}
        </button>
        <p className="text-center text-white/35 text-[11px] mb-5">No credit card required</p>

        {/* Features */}
        <div className="border-t border-white/[0.1] pt-5">
          <p className="text-[#F9F9F9] text-sm font-semibold mb-4">Key Features</p>
          <ul className="space-y-2.5">
            {planFeatures.map((feature, fi) => (
              <li key={fi} className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0 opacity-100">
                  <CheckIcon white={isPopular} />
                </div>
                <span
                  className={`text-xs leading-relaxed ${
                    isPopular ? "text-white/85" : "text-white/75"
                  }`}
                >
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

// ─── Main Calculator ──────────────────────────────────────────────────────────
export default function PricingCalculator() {
  const [planKind, setPlanKind] = useState("MONTHLY");
  const [hydrated, setHydrated] = useState(false);
  const [plans, setPlans] = useState([]);
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [yearlyPlans, setYearlyPlans] = useState([]);
  const [halfYearlyPlans, setHalfYearlyPlans] = useState([]);
  const [quarterlyPlans, setQuarterlyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [checkoutSlug, setCheckoutSlug] = useState(null);
  const hasFetched = useRef(false);
  const router = useRouter();
  const { user, company } = useProvider();
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
    <div className="font-jakarta">
      {/* Header */}
      <AnimateOnScroll className="text-center mb-12">
        <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8B5CF6] mb-4">
          Simple &amp; Transparent Pricing
        </div>
        <h2 className="text-[#F9F9F9] font-semibold text-3xl sm:text-4xl lg:text-[44px] leading-tight mb-4">
          See exactly what{" "}
          <span className="text-[#8B5CF6]">you&apos;ll pay.</span>
        </h2>
        <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
          No base fees. No hidden charges. Pick a billing cycle and choose the plan that fits.
        </p>
      </AnimateOnScroll>

      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
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
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 max-w-7xl mx-auto">
        {activePlans.map((plan, i) => (
          <PlanCard key={i} plan={plan} index={i} onChoose={handleChoosePlan} checkoutSlug={checkoutSlug} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => { fetchSubscriptionPlans(currentPage + 1); setCurrentPage(currentPage + 1); }}
            className="text-sm text-[#8B5CF6] hover:text-white transition-colors"
          >
            Load more plans →
          </button>
        </div>
      )}

      {/* Free trial note */}
      <div className="text-center mt-8 text-sm text-white/40 leading-loose">
        <span className="text-[#8B5CF6] font-semibold">Free trial included.</span> Two full payroll
        cycles, no credit card required.
        <span className="block text-xs mt-1 text-white/25">
          All plans include tax filing (940 / 941 / W-2 / 1099) — not an add-on. Cancel anytime. No
          contract required.
        </span>
      </div>
    </div>
  );
}
