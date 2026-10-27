'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const stats = [
	{ value: '1', label: 'Afternoon to complete your full migration' },
	{ value: '6', label: 'Accounting systems we migrate from, seamlessly' },
	{ value: '$0', label: 'Migration fee — included in every plan' },
	{ value: '100%', label: 'Data accuracy guaranteed or we fix it free' },
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
								border: idx === 0 ? 'none' : '1px solid #4E3186',
								background: 'linear-gradient(180deg, #321C60 0%, rgba(112, 62, 213, 0.20) 100%)',
								backdropFilter: idx === 0 ? 'none' : 'blur(8px)',
								WebkitBackdropFilter: idx === 0 ? 'none' : 'blur(8px)',
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