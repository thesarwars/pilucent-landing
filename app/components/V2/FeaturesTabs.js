"use client";
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

export const FEATURE_TABS = [
    {
        id: "payroll",
        label: "Payroll",
        heading: "Run payroll once. Everything else happens automatically.",
        image: "/V2/feature_1.png",
        bullets: [
            "Automated gross-to-net calculations including federal, state, and local taxes",
            "Unlimited payroll runs — weekly, bi-weekly, semi-monthly, monthly, or off-cycle",
            "Direct deposit via ACH with next-day and same-day options",
            "Multi-state payroll with automatic tax jurisdiction handling",
            "Bonus, commission, and contractor payments in the same run",
            "Real-time payroll preview before submission — no surprises on pay day",
            "W-2 employees and 1099 contractors on a single platform",
        ],
    },
    {
        id: "tax",
        label: "Tax",
        heading: "We file. You don't think about it.",
        image: "/featurers.png",
        bullets: [
            "Federal 940 and 941 e-filing — included in every plan, not an add-on",
            "State payroll tax returns and quarterly filings in all 50 states",
            "W-2 and 1099 generation, e-delivery, and IRS e-filing",
            "New hire reporting to state agencies — automated on every new hire",
            "Tax day monitoring with fund changes and system calculations automatically",
            "Tax notice resolution help with amendment filing support",
        ],
    },
    {
        id: "accounting",
        label: "Accounting",
        heading: "Your books update every time payroll runs. No imports. No exports.",
        image: "/featurers.png",
        bullets: [
            "Native double-entry general ledger — not a QuickBooks integration",
            "Automated payroll journal entries posted on every payroll run",
            "Bank reconciliation with intelligent transaction matching",
            "Accounts payable and receivable tracking",
            "Customizable chart of accounts",
            "Real-time P&L, balance sheet, and cash flow statements",
            "Expense management with receipt capture and approval workflows",
        ],
    },
    {
        id: "hr",
        label: "HR",
        heading: "The people side of your business — handled.",
        image: "/featurers.png",
        bullets: [
            "Digital employee onboarding with e-signature — I-9, W-4, offer letter",
            "Centralized employee records with document storage",
            "PTO accrual, request workflows, and real-time balance tracking",
            "Org chart with reporting structure",
            "Offboarding checklist with final-pay automation",
            "Custom fields on employee profiles",
        ],
    },
    {
        id: "employee-portal",
        label: "Employee Portal",
        heading: "Self-service that actually works.",
        image: "/featurers.png",
        bullets: [
            "Pay stub access — current and historical — on mobile and desktop",
            "W-2 and 1099 download without calling HR",
            "PTO requests and balance visibility",
            "Benefits enrollment and summary",
            "Direct deposit and personal information updates",
            "Mobile-optimized — works on any device without an app download",
        ],
    },
    {
        id: "payments-infrastructure",
        label: "Payments Infrastructure",
        heading: "Enterprise payment rails. SMB price point.",
        image: "/featurers.png",
        bullets: [
        "ACH push and pull for seamless transfers",
        "Real-Time Payments (RTP) for same-day payouts",
        "Push-to-card for instant contractor payments",
        "Payment status tracking with reconciliation",
        "Balanzify operates as a payment facilitator — not a reseller",
    ],
    },
    {
        id: "reports",
        label: "Reports",
        heading: "See everything. Export anything.",
        image: "/featurers.png",
        bullets: [
            "Payroll summary and detail reports by pay period, department, or employee",
            "Tax liability reports by jurisdiction",
            "Headcount and turnover analytics",
            "PTO balance and usage reports",
            "Department-level cost center reporting",
            "Scheduled report delivery by email",
            "Export to CSV, PDF, and Excel — no per-report charges",
        ],
    },
];

const INTEGRATIONS = [
    // {
    //     name: "Plaid",
    //     description:
    //         "Bank account verification and balance checks for all connected accounts. Eliminates manual routing number entry and reduces failed payroll deposits.",
    // },
    // {
    //     name: "Moov Financial",
    //     description:
    //         "ACH, RTP, and card payment processing. Balanzify operates as a payment facilitator — not a marketplace. Full control over payment flow and settlement timing.",
    // },
    // {
    //     name: "TaxBandits",
    //     description:
    //         "Automated e-filing of federal payroll tax forms (940, 941, W-2, and 941). IRS-authorized e-file provider. Included in all plans.",
    // },
    // {
    //     name: "Open API",
    //     description:
    //         "RESTful API with full documentation. Webhooks for real-time event notifications. Supports custom integrations with HRIS, ERP, and accounting platforms. Available on Plus.",
    // },
];

const featurersTabs = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabParam = searchParams.get("tab");
    const activeTab =
        FEATURE_TABS.find((t) => t.id === tabParam) || FEATURE_TABS[0];

    const handleTabClick = (id) => {
        router.replace(`/featurers?tab=${id}`, { scroll: false });
    };

    return (
        <main className="font-jakarta bg-[#0B0919]">
            {/* Hero */}
            <section
                className="relative w-full overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20"
                style={{
                    backgroundImage: "url('/V2/hero_banner.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "top center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 lg:h-64 bg-gradient-to-b from-transparent via-[#0B0919]/70 to-[#0B0919] pointer-events-none" />
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-6xl leading-tight animate-fade-in-up">
                        Stop switching tabs. Start
                        <br className="hidden sm:block" /> running your business.
                    </h1>
                    <p className="text-white/70 text-sm sm:text-base mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:150ms]">
                        Balanzify replaces the five-tool patchwork most growing
                        businesses run on. Finance, People, and Operations —
                        connected, unified, at half the price of running them
                        separately.
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-8">
                    {FEATURE_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabClick(tab.id)}
                            className={`text-sm font-medium px-4 sm:px-5 py-2 rounded-lg border transition-all duration-200 ${
                                activeTab.id === tab.id
                                    ? "bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] border-transparent text-white shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)]"
                                    : "bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Active tab content */}
            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div
                    key={activeTab.id}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center animate-fade-in-up"
                >
                    <div>
                        <h2 className="text-white font-semibold text-2xl sm:text-3xl lg:text-4xl leading-snug">
                            {activeTab.heading}
                        </h2>
                        <ul className="mt-6 sm:mt-8 flex flex-col gap-3">
                            {activeTab.bullets.map((bullet, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 text-white/70 text-sm sm:text-[15px] leading-relaxed"
                                >
                                    <FaCheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#7C5BFF]" />
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <Image
                            src={activeTab.image}
                            alt={activeTab.label}
                            width={720}
                            height={520}
                            priority
                            className="w-full h-auto rounded-2xl border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
                        />
                    </div>
                </div>
            </section>

            {/* Integrations */}
            {/* <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <h2 className="text-white font-semibold text-2xl sm:text-3xl text-center">
                    Integrations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-8 sm:mt-10">
                    {INTEGRATIONS.map((integration) => (
                        <div
                            key={integration.name}
                            className="bg-transparent border border-[#484848] rounded-2xl px-4 py-3 hover:bg-white/[0.04] transition-colors"
                        >
                            <h3 className="text-white text-lg font-semibold">
                                {integration.name}
                            </h3>
                            <p className="text-white/60 text-xs sm:text-[13px] leading-relaxed mt-3">
                                {integration.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section> */}

        </main>
    );
};

export default featurersTabs;
