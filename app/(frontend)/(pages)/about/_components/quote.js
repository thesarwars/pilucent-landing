'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const Quote = () => {
	return (
		<section className="relative py-12 sm:py-16 lg:py-20 px-4">
			<div className="container mx-auto max-w-6xl">
				<AnimateOnScroll
					className="relative rounded-3xl overflow-hidden"
					style={{
						backgroundImage: 'url(/V2/quote.png)',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				>
					<div className="relative z-10 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 sm:gap-10 p-6 sm:p-10 md:p-12 items-center">
						<AnimateOnScroll animation="animate-fade-in-left" className="shrink-0">
							<img
								src="/V2/abdullah.jpeg"
								alt="Abdallah Aden"
								// className="w-60 h-60 sm:w-full sm:h-auto sm:max-w-[290px] lg:max-h-[320px] aspect-square object-cover rounded-2xl mx-auto shadow-[0_20px_40px_-15px_rgba(79,35,180,0.45)]"
							/>
						</AnimateOnScroll>

						<AnimateOnScroll animation="animate-fade-in-right" delay={150}>
							<p className="text-white/70 text-sm sm:text-base lg:text-sm font-medium leading-relaxed mb-6">
								Most business software was built to solve one problem at a time. The result is a
								patchwork of disconnected tools that business owners spend more time managing than
								running their business. Pilucent was built differently, from the ground up as a single
								platform where accounting, payroll, HR, compliance, and payments share one data layer.
								No re-entry, no reconciliation gaps, no system blame game.
								<br />
								<br />
								For SMBs that want to operate with the precision of a larger company without hiring a
								team to stitch software together, that is the difference Pilucent makes. When the
								operational noise goes away, owners stop reacting and start leading, making faster
								hiring decisions, catching margin leaks before they compound, and scaling without the
								growing pains that stall most businesses at exactly the wrong moment.
							</p>
							<p className="text-white font-semibold text-base sm:text-lg">Abdallah Aden</p>
							<p className="text-white/60 text-sm font-medium">Founder &amp; CEO</p>
							<p className="text-white/60 text-xs sm:text-sm mt-1">
								Operations, accounting, or fintech. Specific experience that led to building Pilucent
							</p>
						</AnimateOnScroll>
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Quote
