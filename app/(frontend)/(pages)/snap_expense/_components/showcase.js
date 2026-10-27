'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const Showcase = () => {
	return (
		<section className="relative bg-[#0B0919] py-10 sm:py-10 lg:py-12 px-4">
			<div className="container mx-auto max-w-6xl">
				<AnimateOnScroll
					className="relative rounded-3xl overflow-hidden text-center px-6 py-6 sm:py-16 lg:py-20"
					style={{
						backgroundImage: 'url(/V2/section_card.png)',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundColor: '#3B1FA3',
					}}
				>
					{/* overlay to ensure text readability */}
					<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

					<div className="relative z-10 max-w-2xl mx-auto lg:-mt-8">
						{/* Pill badge */}
						<AnimateOnScroll delay={80}>
							<span
								className="inline-block text-white/90 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6"
								style={{
									border: '1px solid rgba(255,255,255,0.25)',
									background: 'rgba(255,255,255,0.06)',
									backdropFilter: 'blur(6px)',
								}}
							>
								Approved means posted.
							</span>
						</AnimateOnScroll>

						{/* Title */}
						<AnimateOnScroll delay={160}>
							<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mb-5">
								Approved means posted. Posted means reimbursed.
							</h2>
						</AnimateOnScroll>

						{/* Description */}
						<AnimateOnScroll delay={240}>
							<p className="text-white/70 text-sm sm:text-sm leading-relaxed mb-8 max-w-2xl mx-auto">
								The moment an expense is approved, it posts to your general ledger and queues for reimbursement. No manual journal entries. No separate reimbursement process.
							</p>
						</AnimateOnScroll>

						{/* Footer note */}
						<AnimateOnScroll delay={320}>
							<div className="text-white/70 text-xs sm:text-xs space-y-3 text-left max-w-md mx-auto border-t border-white/10 pt-6">
								<p className='flex items-center gap-1'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
									<circle cx="8.00065" cy="8.00065" r="6.66667" stroke="#39CF84" stroke-width="1.5" />
									<path d="M5.66602 8.33398L6.99935 9.66732L10.3327 6.33398" stroke="#39CF84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg> Approved expenses post automatically to the correct GL account</p>
								<p className='flex items-center gap-1'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
									<circle cx="8.00065" cy="8.00065" r="6.66667" stroke="#39CF84" stroke-width="1.5" />
									<path d="M5.66602 8.33398L6.99935 9.66732L10.3327 6.33398" stroke="#39CF84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg> Reimbursements processed via direct deposit on next payroll run</p>
								<p className='flex items-center gap-1'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
									<circle cx="8.00065" cy="8.00065" r="6.66667" stroke="#39CF84" stroke-width="1.5" />
									<path d="M5.66602 8.33398L6.99935 9.66732L10.3327 6.33398" stroke="#39CF84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg> Or reimburse immediately via Push to Card for same-day payment</p>
								<p className='flex items-center gap-1'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
									<circle cx="8.00065" cy="8.00065" r="6.66667" stroke="#39CF84" stroke-width="1.5" />
									<path d="M5.66602 8.33398L6.99935 9.66732L10.3327 6.33398" stroke="#39CF84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg> Corporate card reconciliation — match card charges to submitted receipts</p>
								<p className='flex items-center gap-1'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
									<circle cx="8.00065" cy="8.00065" r="6.66667" stroke="#39CF84" stroke-width="1.5" />
									<path d="M5.66602 8.33398L6.99935 9.66732L10.3327 6.33398" stroke="#39CF84" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg> Export expense reports to CSV, PDF, or Excel</p>
							</div>
						</AnimateOnScroll>
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Showcase