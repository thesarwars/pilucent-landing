import React from 'react';
import { GradientBadge } from './review';
import AnimateOnScroll from './AnimateOnScroll';

const beforeItems = [
    'Month-end close takes 4 days — pulling data manually from 4 different tools',
    'Payroll errors because HR and accounting are not synced',
    'Inventory numbers do not match what is on the books',
    'Expense reimbursements take 3 weeks',
    '5 subscriptions, 5 logins, $800/mo',
    'Staying on tools you hate because switching feels too hard',
];

const afterItems = [
    'Month-end close in under 6 hours — books reconcile automatically',
    'Payroll pulls from HR — no manual re-entry, no errors',
    'Inventory movements post to your books in real time',
    'Expenses approved and reimbursed on next payroll run',
    '1 subscription, 1 login, $399/mo',
    'Running your entire business from one dashboard this afternoon',
];

const CrossIcon = () => (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF6B6B]/15">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#FF8585" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    </span>
);

const CheckIcon = () => (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16A57D]/25">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#3DDCAE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
        </svg>
    </span>
);

const Bullet = ({ color }) => (
    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
);

const cardStyles = {
    before: {
        borderRadius: '30px',
        border: '1px solid #2A2350',
        background:
            'linear-gradient(160deg, rgba(28,21,56,0.55) 0%, rgba(13,10,30,0.35) 100%)',
    },
    after: {
        borderRadius: '30px',
        border: '1px solid #26523C',
        background:
            'radial-gradient(120% 90% at 80% 110%, rgba(22,165,125,0.55) 0%, rgba(0,59,0,0.20) 45%, rgba(10,12,25,0.30) 100%)',
    },
};

const Card = ({ variant, icon, label, items, bulletColor, idx }) => (
    <AnimateOnScroll
        animation={idx === 0 ? 'animate-fade-in-left' : 'animate-fade-in-right'}
        delay={idx * 120}
        style={cardStyles[variant]}
        className="relative overflow-hidden h-full min-h-[380px] sm:min-h-[380px] p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-500"
    >
        <div className="mb-6 flex items-center gap-2.5">
            {icon}
            <span className="text-base sm:text-lg font-semibold text-white">{label}</span>
        </div>
        <ul className="space-y-4 sm:space-y-5">
            {items.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                    <Bullet color={bulletColor} />
                    <span className="text-xs sm:text-[13px] leading-relaxed text-[#F9F9F9]/80">
                        {text}
                    </span>
                </li>
            ))}
        </ul>
    </AnimateOnScroll>
);

const SimpliFying = () => {
    return (
        <section
            className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden"
            style={{
                background:
                    'radial-gradient(120% 90% at 50% 0%, #1B1140 0%, #110B26 45%, #0B0919 100%)',
            }}
        >
            <div className="container relative mx-auto max-w-5xl">
                <div className="mb-10 sm:mb-12 lg:mb-14 text-center">
                    <AnimateOnScroll>
                        <GradientBadge>The Problem We Solve</GradientBadge>
                    </AnimateOnScroll>
                    <AnimateOnScroll delay={100}>
                        <h2 className="text-white font-jakarta font-semibold text-3xl sm:text-4xl lg:text-[46px] leading-tight">
                            What changes when you switch.
                        </h2>
                    </AnimateOnScroll>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                    <Card
                        variant="before"
                        icon={<CrossIcon />}
                        label="Before"
                        items={beforeItems}
                        bulletColor="#FF8585"
                        idx={0}
                    />
                    <Card
                        variant="after"
                        icon={<CheckIcon />}
                        label="After"
                        items={afterItems}
                        bulletColor="#3DDCAE"
                        idx={1}
                    />
                </div>
            </div>
        </section>
    );
};

export default SimpliFying;
