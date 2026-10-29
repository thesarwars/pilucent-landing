'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const milestones = [
	{
		year: '2019',
		title: 'Pilucent Founded',
		description: 'Started with a simple belief—financial tools should work for businesses, not against them.',
	},
	{
		year: '2020',
		title: 'Core Platform Launched',
		description: 'Released our first accounting and invoicing engine, trusted by early-stage teams.',
	},
	{
		year: '2022',
		title: 'Full Operations Suite Added',
		description: 'Expanded into payroll, HR, and reporting to become a true all-in-one platform.',
	},
	{
		year: '2024',
		title: 'Early Access Opened',
		description: 'AI-powered automation reaches thousands of growing businesses worldwide.',
	},
]

const Timeline = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-4xl">
				<AnimateOnScroll className="text-center mb-12 sm:mb-16 lg:mb-20">
					<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-[120%]">
						Company Timeline
					</h2>
				</AnimateOnScroll>

				<div className="relative">
					{/* Center vertical line (desktop) / left line (mobile) */}
					<div className="absolute top-0 bottom-0 left-[7px] sm:left-1/2 sm:-translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

					<div className="flex flex-col gap-8 sm:gap-12">
						{milestones.map((item, idx) => {
							const isLeft = idx % 2 === 0
							return (
								<AnimateOnScroll
									key={item.year}
									animation={isLeft ? 'animate-fade-in-left' : 'animate-fade-in-right'}
									delay={idx * 120}
									className="relative flex items-center"
								>
									{/* Node on the line */}
									<span className="absolute z-10 left-[7px] sm:left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#4F23B4] ring-4 ring-[#4F23B4]/20 shadow-[0_0_12px_rgba(79,35,180,0.6)]" />

									{/* Card */}
									<div
										className={`w-full pl-10 sm:w-1/2 sm:pl-0 ${
											isLeft ? 'sm:pr-10 sm:text-right' : 'sm:ml-auto sm:pl-10'
										}`}
									>
										<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 hover:border-[#8B5CF6]/40 transition-colors duration-300">
											<p className="text-[#8B5CF6] text-sm sm:text-base font-semibold mb-1">{item.year}</p>
											<p className="text-[#F9F9F9] text-base sm:text-lg font-medium mb-2">{item.title}</p>
											<p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm leading-relaxed">{item.description}</p>
										</div>
									</div>
								</AnimateOnScroll>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Timeline
