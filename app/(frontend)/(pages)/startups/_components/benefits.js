'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const benefits = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M3 3V21H21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M7 15L11 11L14 14L20 8" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M20 12V8H16" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Scale Without Operational Chaos',
		description: 'Manage employees, payroll, expenses, and reporting from one place.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M9 18H15M10 22H14" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M12 2C8.68629 2 6 4.68629 6 8C6 10.2208 7.20831 12.1599 9 13.1973V15C9 15.5523 9.44772 16 10 16H14C14.5523 16 15 15.5523 15 15V13.1973C16.7917 12.1599 18 10.2208 18 8C18 4.68629 15.3137 2 12 2Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Make Better Decisions Faster',
		description: 'Access real-time business data that supports growth and investor readiness.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M12 6V12L16 14" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Reduce Administrative Overhead',
		description: 'Automate repetitive processes and focus resources on innovation.',
	},
]

const Benefits = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Key Benefits</GradientBadge>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-tight">
							Grow fast without the operational drag.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
					{benefits.map((item, idx) => (
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
