'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const beforeItems = [
	'6 years of QuickBooks data you are afraid to leave behind',
	'3 months of migration project on your to-do list',
	'Fear of losing historical records, reports, and reconciliations',
	'No idea how long it will actually take',
	'Staying on tools you hate because switching feels too hard',
]

const afterItems = [
	'Every year of history migrated and verified',
	'Live the same afternoon you start',
	'Chart of accounts, transactions, employees, inventory — all there',
	'A specialist confirmed everything is right before signing off',
	'Running your business on one platform — this afternoon',
]

const XIcon = () => (
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-[2px]">
		<circle cx="9" cy="9" r="8" stroke="#ef4444" strokeWidth="1.2" />
		<path d="M6 6l6 6M12 6l-6 6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
	</svg>
)

const CheckIcon = () => (
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-[2px]">
		<circle cx="9" cy="9" r="8" stroke="#22c55e" strokeWidth="1.2" />
		<path d="M5.5 9l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const Comparison = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Before & After</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight mt-2">
							Migration
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={180}>
						<p className="text-white/60 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
							We transform messy, inconsistent data from your old system into a clean,
							verified, ready-to-use Balanzify setup.
						</p>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
					{/* Before */}
					<AnimateOnScroll animation="animate-fade-in-left">
						<div
							className="rounded-3xl p-6 sm:p-8 h-full"
							style={{
								background: '#78191933',
								border: '1px solid #45353F',
							}}
						>
							<h3 className="text-[#BFBFBF] text-xl sm:text-2xl font-semibold mb-6">Before</h3>
							<ul className="flex flex-col gap-4">
								{beforeItems.map((item, i) => (
									<li key={i} className="flex items-start gap-3">
										<XIcon />
										<span className="text-[#BFBFBF] text-sm sm:text-base leading-relaxed">
											{item}
										</span>
									</li>
								))}
							</ul>
						</div>
					</AnimateOnScroll>

					{/* After */}
					<AnimateOnScroll animation="animate-fade-in-right" delay={150}>
						<div
							className="rounded-3xl p-6 sm:p-8 h-full"
							style={{
								background: '#02CD691A',
								border: '1px solid #265B51',
							}}
						>
							<h3 className="text-[#BFBFBF] text-xl sm:text-2xl font-semibold mb-6">After</h3>
							<ul className="flex flex-col gap-4">
								{afterItems.map((item, i) => (
									<li key={i} className="flex items-start gap-3">
										<CheckIcon />
										<span className="text-[#BFBFBF] text-sm sm:text-base leading-relaxed">
											{item}
										</span>
									</li>
								))}
							</ul>
						</div>
					</AnimateOnScroll>
				</div>
			</div>
		</section>
	)
}

export default Comparison