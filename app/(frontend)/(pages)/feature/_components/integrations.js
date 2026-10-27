'use client'
import React from 'react'
import Image from 'next/image'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const partners = [
	'/V2/partner_1.png',
	'/V2/partner_2.png',
	'/V2/partner_3.png',
	'/V2/partner_4.png',
	'/V2/partner_5.png',
]

const Integrations = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Integrations</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight mt-2">
							Works with the tools you are already using.
						</h2>
					</AnimateOnScroll>
					<AnimateOnScroll delay={180}>
						<p className="text-white/60 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
							Connect your banks, payment processors, and favorite apps. Balanzify fits
							into your stack instead of forcing you to rebuild it.
						</p>
					</AnimateOnScroll>
				</div>

				<AnimateOnScroll delay={150}>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
						{partners.map((logo, idx) => (
							<div
								key={logo}
								className="flex items-center justify-center h-[90px] sm:h-[110px] rounded-2xl hover:-translate-y-1 transition-all duration-400"
								style={{
									border: '1px solid #4E3186',
									background: 'linear-gradient(180deg, #321C60 0%, rgba(112,62,213,0.18) 100%)',
									backdropFilter: 'blur(8px)',
									WebkitBackdropFilter: 'blur(8px)',
								}}
							>
								<Image
									src={logo}
									alt={`Integration partner ${idx + 1}`}
									width={120}
									height={40}
									className="h-7 sm:h-8 w-auto object-contain opacity-80"
								/>
							</div>
						))}
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Integrations
