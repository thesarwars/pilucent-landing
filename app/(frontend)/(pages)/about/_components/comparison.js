'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const Comparison = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
					<AnimateOnScroll
						animation="animate-fade-in-left"
						className="relative rounded-3xl overflow-hidden order-2 lg:order-1"
					>
						<img src="/V2/about_2.png" alt="Balanzify dashboard in use" className="w-full h-full object-cover" />
						<div className="absolute inset-0 bg-gradient-to-t from-[#0B0919]/60 via-transparent to-transparent" />
					</AnimateOnScroll>

					<AnimateOnScroll animation="animate-fade-in-right" delay={150} className="order-1 lg:order-2">
						<GradientBadge>Why We Exist</GradientBadge>
						<h2 className="text-[#F9F9F9] text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold mb-5 sm:mb-6 leading-tight">
							Every platform we found was either too simple, too expensive, or built for someone else.
						</h2>
						<p className="text-[#F9F9F9] opacity-70 text-sm leading-relaxed mb-4 max-w-md">
							Spreadsheets break as you grow. Enterprise suites are bloated and overpriced. The tools
							in between never quite fit the way real teams actually work.
						</p>
						<p className="text-[#F9F9F9] opacity-70 text-sm leading-relaxed max-w-md">
							So we built the platform we wished existed—powerful enough for finance teams, simple
							enough for everyone else, and priced for businesses that are still scaling.
						</p>
					</AnimateOnScroll>
				</div>
			</div>
		</section>
	)
}

export default Comparison
