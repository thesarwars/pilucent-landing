'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'
import FeatureCard from '../../../../components/V2/FeatureCard'

const features = [
	{
		title: 'Camera capture',
		description: 'Photograph paper receipts in the field',
		icon: (
			<>
				<path d="M3 7a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
				<circle cx="12" cy="13" r="3.5" />
			</>
		),
	},
	{
		title: 'Email forwarding',
		description: 'Send to receipts@yourdomain.balanzify.com',
		icon: (
			<>
				<rect x="3" y="5" width="18" height="14" rx="2" />
				<path d="m3 7 9 6 9-6" />
			</>
		),
	},
	{
		title: 'PDF Upload',
		description: 'Drag-and-drop from desktop',
		icon: (
			<>
				<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
				<path d="M14 3v5h5" />
			</>
		),
	},
	{
		title: 'Credit card feed',
		description: 'Auto-import transactions from linked corporate cards',
		icon: (
			<>
				<rect x="2" y="5" width="20" height="14" rx="2" />
				<path d="M2 10h20" />
			</>
		),
	},
	{
		title: 'Mileage tracking',
		description: 'GPS-based mileage log with IRS rate applied automatically',
		icon: (
			<>
				<path d="M12 21s-7-5.686-7-11a7 7 0 0 1 14 0c0 5.314-7 11-7 11Z" />
				<circle cx="12" cy="10" r="2.5" />
			</>
		),
	},
	{
		title: 'Per diem',
		description: 'Daily allowances by city or role with automatic calculation',
		icon: (
			<>
				<path d="M12 2v20" />
				<path d="M17 6.5C17 4.567 14.76 3 12 3S7 4.567 7 6.5 9.24 10 12 10s5 1.567 5 3.5S14.76 17 12 17s-5-1.567-5-3.5" />
			</>
		),
	},
]

const Capture = () => {
	return (
		<section className="relative bg-[#0B0919] font-jakarta py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<h2 className="text-[#F9F9F9] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
							Capture receipts any way they come.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm mt-4 sm:mt-5 leading-relaxed px-2">
							Receipts don&apos;t always come on paper. Snap Expense handles every format your team
							encounters.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
					{features.map((feature, idx) => (
						<FeatureCard
							key={feature.title}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
							delay={idx * 100}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default Capture
