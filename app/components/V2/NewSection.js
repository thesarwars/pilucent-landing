import React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const updates = [
    {
        tag: 'NEW',
        date: 'Apr 22',
        title: 'Snap Expense — Mobile Receipt Capture launched',
    },
    {
        tag: 'NEW',
        date: 'Apr 22',
        title: 'Real-time payment rails live',
    },
    {
        tag: 'IMPROVEMENT',
        date: 'Apr 22',
        title: 'Payroll to GL auto-journal entry',
    },
    {
        tag: 'NEW',
        date: 'Apr 22',
        title: 'Budget vs. Actuals dashboard widget',
    },
];

const tagStyles = {
    NEW: 'text-[#34D399] border-[#34D399]/40 bg-[#34D399]/10',
    IMPROVEMENT: 'text-[#A78BFA] border-[#A78BFA]/40 bg-[#A78BFA]/10',
};

const Arrow = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-[#F9F9F9] opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"
    >
        <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const NewSection = () => {
    return (
        <section
            className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden"
            style={{ background: '#150E2C' }}
        >
            {/* Radial glow overlays */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,60,220,0.38) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 40% at 80% 100%, rgba(155,85,245,0.22) 0%, transparent 60%)
                    `,
                }}
            />

            <div className="relative z-10 w-full max-w-5xl mx-auto">
                <AnimateOnScroll className="text-center mb-8 sm:mb-10">
                    <h2 className="text-[#F9F9F9] font-jakarta font-semibold text-3xl sm:text-4xl lg:text-[42px] mb-2">
                        What&apos;s New
                    </h2>
                    <p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm">
                        We ship every week.
                    </p>
                </AnimateOnScroll>

                <div className="flex flex-col gap-3 space-y-3 sm:gap-4">
                    {updates.map((item, idx) => (
                        <AnimateOnScroll
                            key={item.title}
                            delay={idx * 100}
                            className="group flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[#703ED5]"
                            style={{
                                border: '1px solid rgba(110,60,190,0.55)',
                                background:
                                    'linear-gradient(180deg, rgba(50,28,96,0.25), rgba(112,62,213,0.22))',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <span
                                className={`shrink-0 text-[9px] sm:text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md border ${tagStyles[item.tag]}`}
                            >
                                {item.tag}
                            </span>
                            <span className="shrink-0 text-[#F9F9F9] opacity-50 text-xs sm:text-sm">
                                {item.date}
                            </span>
                            <span className="flex-1 text-[#F9F9F9] text-xs sm:text-sm font-medium">
                                {item.title}
                            </span>
                            <Arrow />
                        </AnimateOnScroll>
                    ))}
                </div>

                <AnimateOnScroll className="flex justify-center mt-8 sm:mt-10" delay={200}>
                    <button
                        type="button"
                        className="text-[#F9F9F9] text-xs sm:text-sm px-7 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                            border: '1px solid rgba(110,60,190,0.55)',
                            background:
                                'linear-gradient(180deg, rgba(50,28,96,0.25), rgba(112,62,213,0.22))',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        See all
                    </button>
                </AnimateOnScroll>
            </div>
        </section>
    );
};

export default NewSection;