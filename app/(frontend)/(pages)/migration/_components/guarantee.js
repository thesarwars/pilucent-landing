'use client'
import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const Guarantee = () => {
	return (
		<section className="relative bg-[#0B0919] py-10 sm:py-14 lg:py-16 px-4">
			<div className="container mx-auto max-w-6xl">
				<AnimateOnScroll
					className="relative rounded-3xl overflow-hidden text-center px-6 py-12 sm:py-16 lg:py-20"
					style={{
						backgroundImage: 'url(/V2/section_card.png)',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundColor: '#3B1FA3',
					}}
				>
					{/* overlay to ensure text readability */}
					<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

					<div className="relative z-10 max-w-2xl mx-auto">
						{/* Pill badge */}
						<AnimateOnScroll delay={80}>
							<span
								className="inline-block text-white/90 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6"
								style={{
									border: '1px solid rgba(255,255,255,0.25)',
									background: 'rgba(255,255,255,0.06)',
									backdropFilter: 'blur(6px)',
								}}
							>
								We do not leave until it is done.
							</span>
						</AnimateOnScroll>

						{/* Title */}
						<AnimateOnScroll delay={160}>
							<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mb-5">
								The Pilucent Migration Guarantee
							</h2>
						</AnimateOnScroll>

						{/* Description */}
						<AnimateOnScroll delay={240}>
							<p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
								If your data is not fully migrated and verified by the end of your migration session, we schedule a follow-up session — as many as it takes — at no extra cost. We do not close a migration until both you and your specialist confirm everything is correct.
							</p>
						</AnimateOnScroll>

						{/* Footer note */}
						<AnimateOnScroll delay={320}>
							<p className="text-white/80 text-xs sm:text-sm font-semibold tracking-wide">
								No after risk. No fine print. No extra charges. Ever.
							</p>
						</AnimateOnScroll>
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Guarantee