'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'
import FeatureCard from '../../../../components/V2/FeatureCard'

const benefits = [
	{
		title: 'Competitive Salary + Equity',
		description: 'Market-rate compensation benchmarked quarterly. Meaningful equity for every employee — not just executives.',
		icon: (
			<>
				<path d="M12 2v20" />
				<path d="M17 6.5C17 4.567 14.76 3 12 3S7 4.567 7 6.5 9.24 10 12 10s5 1.567 5 3.5S14.76 17 12 17s-5-1.567-5-3.5" />
			</>
		),
	},
	{
		title: 'Full Health Coverage',
		description: '100% employer-paid medical, dental, and vision for employees. 75% covered for dependents. HSA contribution included.',
		icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
	},
	{
		title: 'Remote-First',
		description: 'Work from wherever you do your best work. Offices in Chicago and Austin — but the majority of the team is fully remote.',
		icon: (
			<>
				<path d="M12 21s-7-5.686-7-11a7 7 0 0 1 14 0c0 5.314-7 11-7 11Z" />
				<circle cx="12" cy="10" r="2.5" />
			</>
		),
	},
	{
		title: 'Unlimited PTO (Real)',
		description: 'With a 2-week minimum expectation. Leadership takes time off too — because sustainable performance requires rest.',
		icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21l8.84-8.61a5.5 5.5 0 0 0 0-7.78Z" />,
	},
	{
		title: '$2,000 Learning Budget',
		description: 'Annual budget for courses, conferences, books, and certifications.',
		icon: (
			<>
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
				<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
			</>
		),
	},
	{
		title: 'Home Office Stipend',
		description: '$1,500 setup stipend for new hires, plus $75/month for internet and phone.',
		icon: (
			<>
				<path d="M3 11.5 12 4l9 7.5" />
				<path d="M5 10v10h14V10" />
			</>
		),
	},
	{
		title: '16 Weeks Parental Leave',
		description: 'Fully paid for all new parents. Birth, adoption, or foster. Available from day one.',
		icon: (
			<>
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3 2" />
			</>
		),
	},
	{
		title: '401(k) with 4% Match',
		description: "Vesting immediately. We believe in your financial future, not just the company's.",
		icon: (
			<>
				<rect x="3" y="8" width="18" height="13" rx="1" />
				<path d="M3 12h18M12 8v13" />
				<path d="M12 8S10.5 3.5 8 4.5 9.5 8 12 8Zm0 0s1.5-4.5 4-3.5S14.5 8 12 8Z" />
			</>
		),
	},
	{
		title: 'No-BS Culture',
		description: 'No forced fun. No performative culture decks. We communicate directly, disagree openly, and ship work we are proud of.',
		icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />,
	},
]

const Benefits = () => {
	return (
		<section className="relative bg-[#0B0919] font-jakarta py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Benefits & Perks</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
							Great work deserves great support.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={200}>
						<p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm mt-4 sm:mt-5 leading-relaxed px-2">
							We invest in the people who build Balanzify — with compensation, time, and support that
							let you do the best work of your career.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
					{benefits.map((benefit, idx) => (
						<FeatureCard
							key={benefit.title}
							icon={benefit.icon}
							title={benefit.title}
							description={benefit.description}
							delay={idx * 100}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default Benefits
