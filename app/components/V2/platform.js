import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AnimateOnScroll from './AnimateOnScroll'

const Platform = () => {
	return (
		<section className="relative bg-[#0B0919] py-10 sm:py-14 lg:py-16 px-4">
			<div className="container mx-auto max-w-6xl">
				<AnimateOnScroll className="relative rounded-3xl overflow-hidden">
					{/* Background image */}
					<Image
						src="/V2/build_bg.png"
						alt=""
						fill
						className="object-cover pointer-events-none select-none"
					/>

					{/* Content */}
					<div className="relative z-10 text-center px-6 py-14 sm:py-16 lg:py-20">
						<AnimateOnScroll>
							<p className="text-white/60 text-xs sm:text-sm mb-5 tracking-wide">
								Seamless Migration — Free with Every Plan
							</p>
						</AnimateOnScroll>

						<AnimateOnScroll delay={100}>
							<h2 className="text-white font-semibold text-2xl sm:text-4xl lg:text-[52px] leading-tight max-w-2xl mx-auto mb-5">
								Your data. Fully migrated. In one afternoon.
							</h2>
						</AnimateOnScroll>

						<AnimateOnScroll delay={200}>
							<p className="text-white/55 text-xs sm:text-sm mb-8 max-w-lg mx-auto leading-relaxed">
								QuickBooks · Gusto · Excel · Bank statements · Inventory · All of it. Guaranteed.
							</p>
						</AnimateOnScroll>

						<AnimateOnScroll delay={300}>
							<Link
								href="/migration"
								className="inline-block border border-white/40 text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300"
							>
								See How It Works
							</Link>
						</AnimateOnScroll>
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Platform
