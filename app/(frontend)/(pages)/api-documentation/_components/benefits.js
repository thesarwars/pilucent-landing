'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const resources = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M16 18L22 12L16 6" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M8 6L2 12L8 18" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Comprehensive API References',
		description: 'Detailed endpoints, authentication methods, and implementation examples.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Faster Integrations',
		description: 'Connect existing software and automate data synchronization.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M20 13.0004C20 18.0004 16.5 20.5005 12.34 21.9505C12.1222 22.0243 11.8855 22.0207 11.67 21.9405C7.5 20.5005 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M9 12L11 14L15 10" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Secure & Scalable',
		description: 'Enterprise-grade security designed for reliable integrations.',
	},
]

const Benefits = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Developer Resources</GradientBadge>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-tight">
							Everything you need to build and ship.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
					{resources.map((item, idx) => (
						<AnimateOnScroll
							key={item.title}
							delay={idx * 80}
							className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(79,35,180,0.35)] transition-all duration-400"
							style={{
								borderRadius: '24px',
								border: '1px solid #F9F9F9',
								backdropFilter: 'blur(8px)',
								WebkitBackdropFilter: 'blur(8px)',
							}}
						>
							<div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] border border-white/15 bg-[#AD46FF1A] text-[#A78BFF]">
								{item.icon}
							</div>

							<div className="mt-8">
								<p className="text-[#F9F9F9] font-semibold text-base sm:text-lg mb-3">
									{item.title}
								</p>
								<p className="text-white/60 text-sm leading-relaxed">
									{item.description}
								</p>
							</div>
						</AnimateOnScroll>
					))}
				</div>
			</div>
		</section>
	)
}

export default Benefits
