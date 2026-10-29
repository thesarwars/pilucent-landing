'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const Cta = () => {
	const router = useRouter()

	return (
		<section className="relative bg-[#0B0919] py-10 sm:py-14 lg:py-16 px-4">
			<div className="container mx-auto max-w-6xl">
				<AnimateOnScroll
					className="relative rounded-3xl overflow-hidden text-center px-6 py-12 sm:py-16 lg:py-20"
					style={{
						backgroundImage: 'url(/V2/section_banner.png)',
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundColor: '#4F23B4',
					}}
				>
					<div className="absolute inset-0 bg-gradient-to-br from-[#5A3FE5]/30 to-[#4F23B4]/50" />
					<div className="relative z-10 max-w-2xl mx-auto">
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4 sm:mb-5">
							Your business deserves to feel this organized.
						</h2>
						<p className="text-white/80 text-sm sm:text-base leading-relaxed mb-7 sm:mb-9 max-w-xl mx-auto">
							Switch to Pilucent today. Your data migrated free, your team up and running in
							an afternoon. No card required to start.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
							<button
								onClick={() => router.push('/auth?action=sign-up')}
								className="w-full sm:w-auto bg-white text-[#4F23B4] text-sm font-semibold px-7 sm:px-9 py-3.5 rounded-full hover:opacity-95 hover:scale-105 transition-all duration-300"
							>
								Start Free Trial
							</button>
							<button
								onClick={() => router.push('/demo')}
								className="w-full sm:w-auto border border-white/40 text-white text-sm font-semibold px-7 sm:px-9 py-3.5 rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300"
							>
								Book a Demo
							</button>
						</div>
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Cta
