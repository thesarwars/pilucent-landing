import React from 'react'
import { GradientBadge } from './review'
import AnimateOnScroll from './AnimateOnScroll'

const rows = [
	{ tool: 'Accounting (QuickBooks Online)', cost: '$180/mo' },
	{ tool: 'Payroll — 30 employees (Gusto)', cost: '$220/mo' },
	{ tool: 'Inventory Management', cost: '$150/mo' },
	{ tool: 'HR Software', cost: '$150/mo' },
	{ tool: 'Expense Management', cost: '$100/mo' },
]

const CheckIcon = () => (
	<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2.5 7L5.5 10L11.5 4" stroke="#4ADE80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const Operation = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="w-full max-w-4xl mx-auto">  {/* ← changed from container mx-auto max-w-3xl */}

				{/* Header */}
				<div className="text-center mb-10 sm:mb-12">
					<AnimateOnScroll>
						<GradientBadge>Why Businesses Choose Pilucent</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-3">
							You&apos;re paying $800/mo for tools<br className="hidden sm:block" /> that don&apos;t talk to each other.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={150}>
						<p className="text-white/50 text-sm sm:text-base">
							Pilucent replaces the entire stack — for half the price.
						</p>
					</AnimateOnScroll>
				</div>

				{/* Comparison table */}
				<AnimateOnScroll delay={200}>
					<div
						className="rounded-2xl sm:rounded-3xl overflow-hidden"
						style={{
							background: 'linear-gradient(145deg, rgba(19,16,34,0.85), #141028)',
							border: '1px solid rgba(249,249,249,0.08)',
						}}
					>
						{/* Table header */}
						<div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_130px_130px] px-5 sm:px-7 py-4 border-b border-white/[0.08]">
							<div />
							<div className="text-white/50 text-xs sm:text-sm font-medium text-center">
								What You Pay Today
							</div>
							<div className="text-[#4ADE80] text-xs sm:text-sm font-semibold text-center">
								Pilucent
							</div>
						</div>

						{/* Data rows */}
						{rows.map((row, idx) => (
							<div
								key={idx}
								className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_130px_130px] px-5 sm:px-7 py-4 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
							>
								<span className="text-white/70 text-xs sm:text-sm">{row.tool}</span>
								<span className="text-white/50 text-xs sm:text-sm text-center">{row.cost}</span>
								<div className="flex items-center justify-center gap-1.5">
									<CheckIcon />
									<span className="text-[#4ADE80] text-xs sm:text-sm">Included</span>
								</div>
							</div>
						))}

						{/* Total row */}
						<div
							className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_130px_130px] px-5 sm:px-7 py-5"
							style={{
								background: 'linear-gradient(90deg, rgba(139,92,246,0.12), rgba(79,35,180,0.18))',
								borderTop: '1px solid rgba(139,92,246,0.25)',
							}}
						>
							<span className="text-white font-bold text-sm sm:text-base">Total Monthly Cost</span>
							<span className="text-[#F87171] font-bold text-sm sm:text-base text-center">$800/mo</span>
							<span className="text-[#4ADE80] font-bold text-sm sm:text-base text-center">$399/mo</span>
						</div>
					</div>
				</AnimateOnScroll>

				{/* Bottom note */}
				<AnimateOnScroll delay={300} className="mt-6 text-center">
					<p className="text-white/45 text-xs sm:text-sm leading-relaxed">
						You save{' '}
						<span className="text-[#4ADE80] font-semibold">$401 every month</span>
						{' '}—{' '}
						<span className="text-[#4ADE80] font-semibold">$4,812 every year</span>
						. One platform. One login. Everything connected.
					</p>
				</AnimateOnScroll>

			</div>
		</section>
	)
}

export default Operation