'use client';
import React, { useState, useEffect, useRef } from 'react';
import { GradientBadge } from './review';

const sections = [
    {
        badge: 'Finance',
        heading: 'Close your books in hours, not days.',
        description:
            'Before Pilucent, month-end took 4 days across 2 weeks. After, under 8 hours, with books that reconcile automatically.',
        cards: [
            {
                number: '01.',
                title: 'Get a real-time P&L right now.',
                description:
                    'Full double-entry accounting with live P&L, balance sheet, and cash flow — always current, never a month behind.',
            },
            {
                number: '02.',
                title: 'Get paid faster. Pay vendors on time.',
                description:
                    'ACH, real-time payments, Push-to-Card, and card acceptance. Expenses auto-post to your books on approval.',
            },
            {
                number: '03.',
                title: 'Show your board real numbers.',
                description:
                    'Custom dashboards, budget vs. actuals, and export-ready reports. Always current. Always accurate.',
            },
        ],
    },
    {
        badge: 'People',
        heading: 'Run payroll in minutes. Onboard a new hire in an afternoon.',
        description:
            'Payroll and HR share the same data — so every hire, raise, and absence flows through without a single manual step.',
        cards: [
            {
                number: '01.',
                title: 'Run payroll in two clicks.',
                description:
                    'Automated payroll, multi-state tax compliance, direct deposit, and W-2/1099 filing — all included, no add-ons.',
            },
            {
                number: '02.',
                title: 'Onboard a new hire today.',
                description:
                    'Offer letters, PTO policies, and compliance docs — all digital, all connected to payroll automatically.',
            },
            {
                number: '03.',
                title: 'Snap a receipt. Done.',
                description:
                    'Employees photograph receipts. Pilucent reads, categorizes, routes for approval, and posts to books.',
            },
        ],
    },
    {
        badge: 'Operations',
        heading: "Know exactly what you have and what you're owed.",
        description:
            'Inventory, customers, and sales feeding the same books — so your numbers are always accurate.',
        cards: [
            {
                number: '01.',
                title: 'Never oversell. Never stockout.',
                description:
                    'Real-time inventory across every location, with reorder alerts and automatic COGS posting to your books.',
            },
            {
                number: '02.',
                title: "See every customer's full history.",
                description:
                    'CRM with transaction history, payment terms, and aging reports — directly connected to AR and collections.',
            },
            {
                number: '03.',
                title: 'Quote to cash in one system.',
                description:
                    'Quotes and invoices flow directly into accounting. Collect faster. Reconcile automatically.',
            },
        ],
    },
];

const AUTO_SLIDE_MS = 5000;

const Tool = () => {
    const [active, setActive] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (paused) return undefined;
        timerRef.current = setInterval(() => {
            setActive((prev) => (prev + 1) % sections.length);
        }, AUTO_SLIDE_MS);
        return () => clearInterval(timerRef.current);
    }, [paused]);

    // Reset hover whenever the slide changes so the next section starts clean.
    useEffect(() => {
        setHovered(null);
    }, [active]);

    const section = sections[active];
    // The first card is purple by default; hovering any card moves the purple to it.
    const purpleIndex = hovered !== null ? hovered : 0;

    return (
        <section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => {
                        setPaused(false);
                        setHovered(null);
                    }}
                >
                    {/* Left: heading that swaps per slide */}
                    <div
                        key={`text-${active}`}
                        className="w-full max-w-[420px] mx-auto lg:mx-0 animate-fade-in-left"
                    >
                        <GradientBadge>{section.badge}</GradientBadge>
                        <h2 className="mb-4 sm:mb-6 text-[#F9F9F9] font-jakarta font-semibold text-3xl sm:text-4xl lg:text-[46px] leading-[1.15]">
    {section.heading}
</h2>
                        <p className="text-[#F9F9F9] opacity-70 text-xs sm:text-sm max-w-sm mb-8">
                            {section.description}
                        </p>

                        {/* Slide indicators */}
                        <div className="flex items-center gap-2">
                            {sections.map((s, i) => (
                                <button
                                    key={s.badge}
                                    type="button"
                                    aria-label={`Show ${s.badge}`}
                                    onClick={() => setActive(i)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        i === active
                                            ? 'w-8 bg-[#7C4DFF]'
                                            : 'w-3 bg-white/25 hover:bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: cards that swap per slide */}
                    <div
                        key={`cards-${active}`}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-fade-in-up"
                    >
                        {section.cards.map((item, idx) => {
                            const isPurple = idx === purpleIndex;
                            return (
                                <div
                                    key={item.number}
                                    onMouseEnter={() => setHovered(idx)}
                                    className={`rounded-3xl p-5 sm:p-6 h-[200px] sm:h-[220px] cursor-pointer transition-all duration-500 ${
                                        idx === 2 ? 'sm:col-span-2' : ''
                                    } ${isPurple ? '-translate-y-1 shadow-[0_20px_40px_-12px_rgba(79,35,180,0.5)]' : ''}`}
                                    style={
                                        isPurple
                                            ? { background: '#4F23B4' }
                                            : {
                                                  background:
                                                      'linear-gradient(145deg, #13102280, #1a163a)',
                                                  border: '1px solid #F9F9F9',
                                              }
                                    }
                                >
                                    <p className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-white">
                                        {item.number}
                                    </p>
                                    <p className="text-[15px] sm:text-[16px] font-semibold mb-2 text-[#F9F9F9]">
                                        {item.title}
                                    </p>
                                    <p className="text-xs leading-relaxed text-[#F9F9F9] opacity-80">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tool;
