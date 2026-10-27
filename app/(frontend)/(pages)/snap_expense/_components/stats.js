'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const stats = [
	{ value: '<60s', label: 'Average time to submit an expense' },
	{ value: '98%', label: 'OCR accuracy on clear receipt photos' },
	{ value: '0', label: 'Manual data entry required from employees' },
	{ value: 'Auto', label: 'Gets verified before you go live' },
]

const Stats = () => {
	return (
		<section className="relative bg-[#0B0919] py-10 sm:py-14 lg:py-16 px-4">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{stats.map((stat, idx) => (
						<AnimateOnScroll
							key={stat.label}
							delay={idx * 100}
							className="p-5 sm:p-6 h-[150px] sm:h-[200px] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(79,35,180,0.4)] transition-all duration-500"
							style={{
								borderRadius: '24px',
								border: '1px solid #4E3186',
								background: 'linear-gradient(180deg, #321C60 0%, rgba(112, 62, 213, 0.20) 100%)',
								backdropFilter: 'blur(8px)',
								WebkitBackdropFilter: 'blur(8px)',
							}}
						>
							<p className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold">{stat.value}</p>
							<p className="text-[#F9F9F9] opacity-80 text-xs sm:text-sm leading-relaxed">{stat.label}</p>
						</AnimateOnScroll>
					))}
				</div>
			</div>
		</section>
	)
}

export default Stats
