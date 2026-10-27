'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const CTA = () => {
	const router = useRouter()

	return (
		<section className="relative bg-[#0B0919] px-4 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<AnimateOnScroll>
					<div
						className="rounded-3xl overflow-hidden text-center px-6 py-14 sm:px-10 sm:py-20"
						style={{
							backgroundImage: 'url(/V2/feature_card.png)',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl lg:text-[40px] leading-tight mb-8 max-w-2xl mx-auto">
							The operational foundation every startup needs to grow confidently.
						</h2>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
							<button
								onClick={() => router.push('/contact')}
								className="bg-white text-[#1a163a] text-sm font-semibold px-8 py-3 rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-300"
							>
								Start Growing Smarter
							</button>
							<button
								onClick={() => router.push('/auth?action=sign-in')}
								className="border border-white/30 text-white text-sm font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-300"
							>
								Get Started
							</button>
						</div>
					</div>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default CTA
