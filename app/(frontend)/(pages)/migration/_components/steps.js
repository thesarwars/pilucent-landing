'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const steps = [
	{
		number: '01',
		title: 'Book your session in 2 minutes.',
		description:
			'Pick a time that works. We send a calendar invite with everything you need. Just have your current tool logins handy.',
	},
	{
		number: '02',
		title: 'A specialist joins your call.',
		description:
			'A real Pilucent team member joins you on a video call. They have done this hundreds of times. You are in good hands from minute one.',
	},
	{
		number: '03',
		title: 'Your data comes over.',
		description:
			'Connect your accounts or upload your files. Your specialist walks you through every step — chart of accounts, transaction history, employee records, payroll history, inventory, customers, vendors. Everything.',
	},
	{
		number: '04',
		title: 'We verify everything together.',
		description:
			'Before the call ends, your specialist checks that every number matches, every account is mapped correctly, and every record came over clean. Nothing gets signed off until it is right.',
	},
	{
		number: '05',
		title: 'You are live. Same afternoon.',
		description:
			'Your team gets access. Payroll is configured. Bank feeds are connected. You run your first report and see your real business data — in Pilucent, not in five tabs.',
	},
]

const BADGE_GRADIENT = 'linear-gradient(140deg, #000 12.44%, #8B5CF6 125.92%)'

const Steps = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4">
			<div className="container mx-auto max-w-3xl">
				<div className="text-center mb-12 sm:mb-16">
					<AnimateOnScroll>
						<GradientBadge>How Migration Works</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-tight sm:leading-snug lg:leading-[1.15] mt-4">
							Five steps. One afternoon.{' '}
							<br className="hidden sm:block" />
							Everything comes with you.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<p className="text-white/50 text-sm sm:text-base mt-4 leading-relaxed max-w-lg mx-auto">
							Like a moving company that packs, transports, and unpacks everything. You direct,
							we do the heavy lifting.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="relative flex justify-center items-center">
					{/* Vertical connector line */}
					<div
						className="absolute left-[40px] sm:left-[426px] top-0 bottom-0 w-px hidden sm:block"
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
									className="flex-shrink-0 w-12 h-12 sm:w-[80px] sm:h-[80px] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xs sm:text-sm relative z-10"
									style={{ background: BADGE_GRADIENT }}
								>
									{step.number}
								</div>

								{/* Content */}
								<div className="flex-1 pt-1">
									<h3 className="text-[#F9F9F9] font-semibold text-base sm:text-lg mb-2">
										{step.title}
									</h3>
									<p className="text-white/50 text-sm leading-relaxed max-w-[450px]">{step.description}</p>
								</div>
							</AnimateOnScroll>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Steps
