import React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const logos = [
	{ id: 1, src: '/V2/partner_1.png' },
	{ id: 2, src: '/V2/partner_2.png' },
	{ id: 3, src: '/V2/partner_3.png' },
	// { id: 4, src: '/moov.svg' },
	// { id: 5, src: '/plaid.webp' },
];

const stats = [
	{ value: "$401", label: "Saved per month vs. the alternative stack" },
	{ value: "6 hrs", label: "Average month-end close (was 4 days)" },
	{ value: "1 Day", label: "Average time to go fully live" },
	{ value: "5 to 1", label: "Tools replaced by Balanzify" },
];

const Collaboration = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">

				<div className="w-full max-w-7xl mx-auto mb-10 px-4">
					<div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
						{stats.map((stat, idx) => (
							<AnimateOnScroll
								key={stat.label}
								delay={idx * 120}
								className="w-full rounded-3xl p-6 sm:p-7 h-[190px] sm:h-[180px] flex flex-col justify-between items-start text-left hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(112,62,213,0.4)] transition-all duration-500"
								style={{
									background: 'linear-gradient(145deg, #321C6033 0%, #703ED533 100%)',
									border: '1px solid #4E3186',
								}}
							>
								<p className="text-white text-[44px] leading-none font-normal tracking-[-0.04em]">
									{stat.value}
								</p>

								<p className="max-w-[90%] text-[#F9F9F9] opacity-80 text-sm sm:text-base leading-[1.45]">
									{stat.label}
								</p>
							</AnimateOnScroll>
						))}
					</div>
				</div>

				<AnimateOnScroll className="mb-10" delay={200}>
					<h2 className="text-center text-[#BFBFBF] text-lg leading-[120%] mb-8">
						Trusted by growing teams replacing their disconnected tool stacks
					</h2>
				</AnimateOnScroll>

				<div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 sm:gap-8 md:gap-4 max-w-5xl mx-auto opacity-60">
					{logos.map((logo, idx) => (
						<AnimateOnScroll
							key={logo.id}
							className="flex items-center gap-2 hover:opacity-100 hover:scale-110 transition-all duration-300"
							delay={idx * 100}
						>
							<img
								src={logo.src}
								alt={`Partner ${logo.id}`}
								className="h-8 w-auto object-contain"
							/>
						</AnimateOnScroll>
					))}
				</div>

			</div>
		</section>
	);
};

export default Collaboration;