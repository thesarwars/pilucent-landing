'use client'

import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const principles = [
	{
		number: '01.',
		title: 'Clarity Over Complexity',
		description:
			'Every feature must reduce friction — not add to it. We design for the operator who does not have time to read a manual. If it is not intuitive on day one, it is not done.',
	},
	{
		number: '02.',
		title: 'Security Without Compromise',
		description:
			'SOC 2 infrastructure, end-to-end encryption, and role-based access controls are table stakes — not premium features. Your financial data is too important to treat otherwise.',
	},
	{
		number: '03.',
		title: 'Built to Grow With You',
		description:
			'We design for where you are going, not just where you are. A platform that needs to be replaced at 75 employees is not a platform — it is a stopgap.',
	},
	{
		number: '04.',
		title: 'Honest Business Practices',
		description:
			'Transparent pricing. No lock-in clauses buried in fine print. No artificial limits designed to force upgrades. You pay $39/mo and you get the full platform.',
	},
	{
		number: '05.',
		title: 'Speed as a Feature',
		description:
			'Your month-end close should not take a week. Your payroll run should not take an afternoon. Speed is not a nice-to-have — it is a core part of what we deliver.',
	},
	{
		number: '06.',
		title: 'Real Support, Real People',
		description:
			'When something goes wrong, you talk to a person who knows your account — not a chatbot or a ticketing system.',
	},
]

const Principles = () => {
	return (
		<section className="relative overflow-hidden bg-[#070611] px-4 py-14 sm:py-16 lg:py-20">
			{/* Background gradient */}
			{/* <div className="pointer-events-none absolute left-0 top-0 h-full w-[40%] bg-[radial-gradient(circle_at_left_center,rgba(50,28,96,0.45),rgba(7,6,17,0)_70%)]" />
			<div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-gradient-to-r from-[#321C60] via-[#1E123F] to-[#0B0919]" /> */}

			<div className="relative z-10 mx-auto max-w-7xl">
				<div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 lg:mb-12">
					<AnimateOnScroll>
						<div className="mx-auto mb-5 inline-flex rounded-full border border-white/25 px-5 py-1.5 text-[11px] font-medium text-white/80">
							Our Values
						</div>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-3xl font-semibold leading-[1.18] tracking-[-0.03em] text-[#F4F1FF] sm:text-4xl lg:text-[46px]">
							The principles behind every decision <br className="hidden sm:block" />
							we make.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{principles.map((item, idx) => (
						<AnimateOnScroll
							key={item.number}
							delay={idx * 100}
							className="group relative min-h-[210px] overflow-hidden rounded-2xl border border-white bg-[linear-gradient(145deg,rgba(50,28,96,0.20),rgba(11,9,25,0.85))] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#703ED5] hover:shadow-[0_24px_50px_-20px_rgba(112,62,213,0.45)] sm:min-h-[240px]"
						>
							{/* Glow accent on hover */}
							<div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#703ED5]/0 blur-2xl transition-all duration-500 group-hover:bg-[#703ED5]/25" />

							<div className="relative z-10">
								<p className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-white bg-clip-text bg-gradient-to-br from-[#F4F1FF] to-[#8B5CF6] sm:text-[40px]">
									{item.number}
								</p>

								{/* Accent divider */}
								<div className="my-5 h-px w-10 bg-gradient-to-r from-[#703ED5] to-transparent transition-all duration-500 group-hover:w-16" />

								<h3 className="mb-2.5 text-sm font-semibold leading-tight text-[#F4F1FF]">
									{item.title}
								</h3>

								<p className="text-[12px] leading-[1.7] text-[#F4F1FF]/65">
									{item.description}
								</p>
							</div>
						</AnimateOnScroll>
					))}
				</div>
			</div>
		</section>
	)
}

export default Principles