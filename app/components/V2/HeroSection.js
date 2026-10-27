'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { GradientBadge } from './review'
import AnimateOnScroll from './AnimateOnScroll'

const HeroSection = ({
	badge,
	title,
	description,
	bgImage = '/V2/section_banner.png',
	titleClassName = 'text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-snug lg:leading-[1.05] mt-2',
	contentMaxWidth = 'max-w-3xl',
	buttons = [],
	stats = [],
	trustItems = [],
}) => {
	const router = useRouter()

	const handleButtonClick = (btn) => {
		if (btn.onClick) return btn.onClick()
		if (btn.href) return router.push(btn.href)
	}

	return (
		<section
			className="relative w-full overflow-hidden pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4"
			style={{
				backgroundImage: `url('${bgImage}')`,
				backgroundSize: 'cover',
				backgroundPosition: 'top center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<div className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 lg:h-64 bg-gradient-to-b from-transparent via-[#0B0919]/70 to-[#0B0919] pointer-events-none" />
			<div className="container mx-auto max-w-6xl relative z-10">
				<div className={`text-center mx-auto ${contentMaxWidth}`}>
					{badge && (
						<AnimateOnScroll>
							<GradientBadge>{badge}</GradientBadge>
						</AnimateOnScroll>
					)}

					{title && (
						<AnimateOnScroll delay={100}>
							<h1 className={titleClassName}>{title}</h1>
						</AnimateOnScroll>
					)}

					{description && (
						<AnimateOnScroll delay={200}>
							<p className="text-white/70 text-sm mt-5 sm:mt-6 leading-relaxed px-2 max-w-2xl mx-auto">
								{description}
							</p>
						</AnimateOnScroll>
					)}

					{buttons.length > 0 && (
						<AnimateOnScroll delay={300}>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
								{buttons.map((btn, idx) =>
									btn.variant === 'secondary' ? (
										<button
											key={idx}
											onClick={() => handleButtonClick(btn)}
											className="w-full sm:w-auto border border-white/30 text-white text-sm font-semibold px-7 sm:px-9 py-3.5 rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300"
										>
											{btn.label}
										</button>
									) : (
										<button
											key={idx}
											onClick={() => handleButtonClick(btn)}
											className="w-full sm:w-auto bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-7 sm:px-9 py-3.5 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-105 transition-all duration-300"
										>
											{btn.label}
										</button>
									)
								)}
							</div>
						</AnimateOnScroll>
					)}

					{trustItems.length > 0 && (
						<AnimateOnScroll delay={420}>
							<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-8 sm:mt-10">
								{trustItems.map((item, idx) => (
									<div
										key={item.label || idx}
										className="flex items-center gap-2 text-white/60 text-xs sm:text-sm"
									>
										{item?.icon}
										<span>{item.label}</span>
									</div>
								))}
							</div>
						</AnimateOnScroll>
					)}
				</div>

				{stats.length > 0 && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14 lg:mt-16">
						{stats.map((stat, idx) => (
							<AnimateOnScroll
								key={stat.label || idx}
								delay={idx * 120}
								className="rounded-3xl p-5 sm:p-6 h-[150px] sm:h-[170px] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(112,62,213,0.4)] transition-all duration-500"
								style={{
									background: 'linear-gradient(145deg, #321C6033 0%, #703ED533 100%)',
									border: '1px solid #4E3186',
								}}
							>
								<p className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold">
									{stat.value}
								</p>
								<p className="text-[#F9F9F9] opacity-80 text-xs sm:text-sm leading-relaxed">
									{stat.label}
								</p>
							</AnimateOnScroll>
						))}
					</div>
				)}
			</div>
		</section>
	)
}

export default HeroSection
