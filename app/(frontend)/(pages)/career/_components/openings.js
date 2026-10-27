'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const roles = [
	{
		category: 'Engineering',
		title: 'Senior Backend Engineer — Payments Infrastructure',
		tags: ['Remote (US)', 'Full time', 'Competitive + Equity'],
	},
	{
		category: 'Design',
		title: 'Lead UX Designer — Mobile Apps',
		tags: ['San Francisco, CA', 'Full time', 'Competitive + Stock Options'],
	},
	{
		category: 'Marketing',
		title: 'Content Strategist — Growth Marketing',
		tags: ['Remote (Global)', 'Contract', 'Hourly + Bonuses'],
	},
	{
		category: 'Product',
		title: 'Product Manager — AI Tools',
		tags: ['New York, NY', 'Full time', 'Competitive + Equity'],
	},
	{
		category: 'Customer Success',
		title: 'Customer Success Manager — Enterprise Clients',
		tags: ['Remote (US & Canada)', 'Full time', 'Competitive + Commission'],
	},
	{
		category: 'Data Science',
		title: 'Data Scientist — Predictive Analytics',
		tags: ['Austin, TX', 'Full time', 'Competitive + Equity'],
	},
	{
		category: 'Engineering',
		title: 'Frontend Engineer — Web Applications',
		tags: ['Remote (Europe)', 'Part time', 'Competitive + Benefits'],
	},
	{
		category: 'HR',
		title: 'Talent Acquisition Specialist — Tech Hiring',
		tags: ['Remote (US)', 'Full time', 'Competitive + Bonus'],
	},
	{
		category: 'Finance',
		title: 'Financial Analyst — Corporate Strategy',
		tags: ['Chicago, IL', 'Full time', 'Competitive + Equity'],
	},
]

const Openings = () => {
	return (
		<section id="openings" className="relative bg-[#0B0919] font-jakarta py-12 sm:py-16 lg:py-20 px-4 scroll-mt-24 overflow-hidden">
			<div className="container mx-auto max-w-4xl">
				<div className="mb-10 sm:mb-12">
					<AnimateOnScroll>
						<GradientBadge>Our Roles</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
							Current openings.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={200}>
						<p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm mt-4 leading-relaxed">
							All roles are remote-eligible unless noted. We hire across the US.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="space-y-3 sm:space-y-4">
					{roles.map((role, idx) => (
						<AnimateOnScroll
							key={role.title}
							delay={idx * 70}
							tag="a"
							href="#"
							className="group flex items-center gap-4 sm:gap-5 rounded-xl p-4 sm:p-5 hover:-translate-y-0.5 hover:border-[#8B5CF6]/50 transition-all duration-300"
							style={{
								background: 'linear-gradient(145deg, #13102280, #1a163a)',
								border: '1px solid rgba(249,249,249,0.12)',
							}}
						>
							{/* Code icon */}
							<div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#AD46FF1A] flex items-center justify-center">
								<svg
									className="w-4 h-4 sm:w-5 sm:h-5 text-[#C27AFF]"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="16 18 22 12 16 6" />
									<polyline points="8 6 2 12 8 18" />
								</svg>
							</div>

							{/* Content */}
							<div className="flex-1 min-w-0">
								<p className="text-[#F9F9F9] opacity-50 text-[11px] sm:text-xs mb-1">{role.category}</p>
								<h3 className="text-[#F9F9F9] text-sm sm:text-base font-semibold mb-2.5">{role.title}</h3>
								<div className="flex flex-wrap gap-2">
									{role.tags.map((tag) => (
										<span
											key={tag}
											className="text-[#F9F9F9] opacity-70 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border border-white/15"
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							{/* Arrow */}
							<svg
								className="flex-shrink-0 w-5 h-5 text-[#C27AFF] group-hover:translate-x-1 transition-transform duration-300"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M5 12h14M13 6l6 6-6 6" />
							</svg>
						</AnimateOnScroll>
					))}
				</div>
			</div>
		</section>
	)
}

export default Openings
