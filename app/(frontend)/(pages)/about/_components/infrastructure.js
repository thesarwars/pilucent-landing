'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const Infrastructure = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
					<AnimateOnScroll animation="animate-fade-in-left">
						<GradientBadge>Our Mission</GradientBadge>
						<h2 className="text-[#F9F9F9] text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold mb-5 sm:mb-6 leading-tight">
							Give every growing business enterprise-grade financial infrastructure.
						</h2>
						<p className="text-[#F9F9F9] opacity-70 text-sm leading-relaxed mb-4 max-w-md">
							Powerful finance tools used to be reserved for companies with big budgets and bigger
							teams. We built Pilucent to change that—pairing automation with real-time insight so any
							business can operate with the same precision as the largest enterprises.
						</p>
						<p className="text-[#F9F9F9] opacity-70 text-sm leading-relaxed max-w-md">
							From the first invoice to multi-entity payroll, everything lives in one connected
							platform that scales as you do.
						</p>
					</AnimateOnScroll>

					<AnimateOnScroll
						animation="animate-fade-in-right"
						delay={150}
						className="relative rounded-3xl overflow-hidden"
					>
						<img src="/V2/about_1.png" alt="The Pilucent team at work" className="w-full h-full object-cover" />
						<div className="absolute inset-0 bg-gradient-to-t from-[#0B0919]/60 via-transparent to-transparent" />
					</AnimateOnScroll>
				</div>
			</div>
		</section>
	)
}

export default Infrastructure
