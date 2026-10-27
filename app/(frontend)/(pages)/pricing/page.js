import React, { Suspense } from "react";
import PricingSection from "../../../components/pricing_section";
import PricingCalculator from "../../../components/pricing_calculator";
import Build from "../../../components/V2/build";
import { GradientBadge } from "../../../components/V2/review";
import AnimateOnScroll from "../../../components/V2/AnimateOnScroll";

const faqItems = [
  {
    q: "Is there really no long-term contract?",
    a: "No long-term contract is required. You can cancel your subscription at any time. If you cancel, you will retain access through the end of your current billing period.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains accessible for 30 days after cancellation. You can export everything in standard formats before your account closes.",
  },
  {
    q: "Can I change my plan later?",
    a: "Yes. You can upgrade or downgrade at any time from your dashboard. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial available?",
    a: "Selected plans include a free trial period. You will see the trial duration on the plan card before you commit.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Yes. Annual plans come with a discount compared to paying monthly. The exact savings are shown when you switch the billing toggle to Yearly.",
  },
  {
    q: "Can I add more users to my plan?",
    a: "User limits depend on the plan tier. You can upgrade to a higher tier at any time to get more seats and additional features.",
  },
];

const PricingFaq = () => {
  return (
    <section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <AnimateOnScroll className="mb-10">
          <GradientBadge>Pricing FAQ Questions</GradientBadge>
        </AnimateOnScroll>
        <div className="space-y-0 divide-y divide-white/[0.08]">
          {faqItems.map((item, idx) => (
            <AnimateOnScroll key={idx} delay={idx * 60} className="py-6">
              <div className="flex gap-4">
                <span className="text-white/20 text-xs font-semibold mt-1 shrink-0">
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                <div>
                  <h3 className="text-[#F9F9F9] font-semibold text-sm sm:text-base mb-2">{item.q}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <div className="font-jakarta bg-[#0B0919]">
      {/* Hero */}
      <section
        className="relative w-full overflow-hidden pt-28 sm:pt-32 lg:pt-40 pb-14 sm:pb-18 lg:pb-24 px-4"
        style={{
          backgroundImage: "url('/V2/section_banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container mx-auto max-w-7xl relative z-10 text-center">
          <AnimateOnScroll>
            <GradientBadge>Pricing</GradientBadge>
          </AnimateOnScroll>
          <AnimateOnScroll delay={100}>
            <h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-snug lg:leading-[1.1] max-w-7xl mx-auto">
              Half the cost of what you&apos;re <br /> using now.
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll delay={200}>
            <p className="text-white/60 text-sm sm:text-base lg:text-lg mt-5 sm:mt-6 max-w-2xl mx-auto leading-relaxed px-2">
              The average growing business pays $800/mo across five disconnected tools. Balanzify does
              everything they do — for $399/mo. No per-module fees. No per-seat charges above your limit.
              Everything included.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={300}>
            <div
              className="relative mt-10 sm:mt-12 max-w-2xl mx-auto rounded-3xl overflow-hidden px-6 py-8 sm:px-10 sm:py-10 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(20,16,38,0.85) 0%, rgba(79,35,180,0.55) 100%)",
                border: "1px solid rgba(124,91,255,0.35)",
                boxShadow: "0 30px 70px -30px rgba(124,91,255,0.5)",
              }}
            >
              <div className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-[#7C5BFF]/30 blur-3xl" />
              <div className="relative z-10">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/80 mb-5"
                  style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.4)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                  17 spots remaining
                </span>
                <h2 className="text-[#F9F9F9] text-xl sm:text-2xl lg:text-[28px] font-semibold leading-tight mb-3">
                  Early Access — First 30 Customers Only
                </h2>
                <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                  Lock in 40% off forever. Early Access pricing is guaranteed for life — as long as you stay
                  active. After 30 customers, prices move to full rate.
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Interactive pricing calculator */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Suspense
            fallback={
              <div className="h-[400px] w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-white/10 border-t-[#8B5CF6]" />
              </div>
            }
          >
            <PricingCalculator />
          </Suspense>
        </div>
      </section>

      {/* Plans + Comparison table */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Suspense
            fallback={
              <div className="h-[400px] w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-white/10 border-t-[#8B5CF6]" />
              </div>
            }
          >
            <PricingSection />
          </Suspense>
        </div>
      </section>

      {/* Pricing FAQ */}
      <PricingFaq />

    </div>
  );
};

export default Pricing;
