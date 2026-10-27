'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const trustItems = [
	'One login for accounting, payroll, and HR',
	'Real-time numbers, no spreadsheets',
	'Bank-grade security by default',
]

const Hero = () => {
	const router = useRouter()

	return (
		<section
			className="relative w-full overflow-hidden pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4"
			style={{
				backgroundImage: "url('/V2/section_banner.png')",
				backgroundSize: 'cover',
				backgroundPosition: 'top center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<div className="container mx-auto max-w-6xl relative z-10">
				<div className="text-center max-w-4xl mx-auto">
					<AnimateOnScroll>
						<GradientBadge>One platform for your whole business</GradientBadge>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-snug lg:leading-[1.05] mt-2">
							Stop switching tabs.{' '}
							<br className="hidden sm:block" />
							Start running your business.
						</h1>
					</AnimateOnScroll>

					<AnimateOnScroll delay={200}>
						<p className="text-white/70 text-sm mt-5 sm:mt-6 leading-relaxed px-2 max-w-2xl mx-auto">
							Accounting, payroll, HR, sales, and inventory — connected in one place.
							See your real numbers in real time and make confident decisions without
							jumping between five different tools.
						</p>
					</AnimateOnScroll>
				</div>
			</div>
		</section>
	)
}

export default Hero
