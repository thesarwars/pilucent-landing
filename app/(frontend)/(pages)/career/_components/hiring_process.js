'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const steps = [
	{
		number: '01',
		title: 'Application Review',
		description: 'We review every application personally. You will hear from us within 5 business days — either way.',
	},
	{
		number: '02',
		title: 'Intro Call — 30 minutes',
		description: 'A conversation with your hiring manager. We tell you about the role; you tell us about your experience and goals.',
	},
	{
		number: '03',
		title: 'Skills Assessment',
		description: 'A focused take-home or technical screen — scoped to under 2 hours. We respect your time and compensate for extended assessments.',
	},
	{
		number: '04',
		title: 'Final Interview + Offer',
		description: 'A panel conversation with the team you would work with. Offer decisions made within 48 hours of the final round.',
	},
]

const BADGE_GRADIENT = 'linear-gradient(140deg, #000 12.44%, #8B5CF6 125.92%)'

const HiringProcess = () => {
	return (
		<section className="relative bg-[#0B0919] font-jakarta py-12 sm:py-16 lg:py-24 px-4">
			<div className="container mx-auto max-w-3xl">
				<div className="text-center mb-12 sm:mb-16">
					<AnimateOnScroll>
						<GradientBadge>Our Hiring Process</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-tight sm:leading-snug lg:leading-[1.15] mt-4">
							Transparent, fast, and respectful of your time.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={200}>
						<p className="text-white/50 text-sm sm:text-base mt-4 leading-relaxed max-w-md mx-auto">
							We aim to complete the full process in 3 weeks. You hear from us after every step —
							no ghosting.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="relative flex items-center justify-center">
					{/* Vertical connector line through the badge column */}
					<div
						className="absolute left-[22px] sm:left-[426px] top-0 bottom-0 w-px"
						style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.5), rgba(139,92,246,0.05))' }}
					/>

					<div className="divide-y divide-white/10">
						{steps.map((step, idx) => (
							<AnimateOnScroll
								key={step.number}
								delay={idx * 120}
								className="flex gap-5 sm:gap-7 relative py-8 sm:py-10 first:pt-0"
							>
								{/* Number badge */}
								<div
									className="flex-shrink-0 w-11 h-11 sm:w-[52px] sm:h-[52px] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xs sm:text-sm relative z-10"
									style={{ background: BADGE_GRADIENT }}
								>
									{step.number}
								</div>

								{/* Content */}
								<div className="flex-1 pt-1">
									<h3 className="text-[#F9F9F9] font-semibold text-base sm:text-lg mb-2">
										{step.title}
									</h3>
									<p className="text-white/50 text-sm leading-relaxed max-w-[450px]">
										{step.description}
									</p>
								</div>
							</AnimateOnScroll>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default HiringProcess
