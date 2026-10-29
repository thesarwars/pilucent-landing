'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const steps = [
	{
		number: '01',
		title: 'Snap the Receipt',
		description:
			'Employee opens the Pilucent mobile app and photographs the receipt. Also works with email forwarding and PDF upload.',
	},
	{
		number: '02',
		title: 'OCR Reads & Categorizes',
		description:
			'Our OCR engine extracts merchant name, date, amount, and line items. Suggests a GL account and expense category automatically based on merchant type and your company history.',
	},
	{
		number: '03',
		title: 'Manager Approves',
		description:
			'Expense is routed to the right approver based on your policy rules. Approval takes one tap from phone or desktop.',
	},
	{
		number: '04',
		title: 'Books Update Automatically',
		description:
			'Approved expense posts directly to your general ledger. Employee reimbursed on next payroll run — or same-day via Push to Card.',
	},
]

const BADGE_GRADIENT = 'linear-gradient(140deg, #000 12.44%, #8B5CF6 125.92%)'

const HowItWorks = () => {
	return (
	<section id="how-it-works" className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4">
		<div className="container mx-auto max-w-5xl">
			<div className="text-center mb-12 sm:mb-16 mx-auto">
					<AnimateOnScroll>
						<GradientBadge>How It Works</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[48px] leading-tight sm:leading-snug lg:leading-[1.15] mt-4">
							Four steps. Under a minute.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={200}>
						<p className="text-white/50 text-sm sm:text-base mt-4 leading-relaxed max-w-lg mx-auto">
							Like a mail room that reads, sorts, and files every receipt the moment it arrives —
							Snap Expense handles everything the moment an employee hits submit.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="relative flex items-center justify-center">
					{/* Vertical connector line */}
					<div
						className="absolute left-[22px] sm:left-[426px] top-0 bottom-0 w-px hidden sm:block"
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

export default HowItWorks
