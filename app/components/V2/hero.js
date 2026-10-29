"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const HeroV2 = () => {
	const router = useRouter();

	return (
		<section
			className="relative w-full font-jakarta overflow-hidden bg-[#0B0919] pt-24 sm:pt-28 lg:pt-32"
			style={{
				backgroundImage: "url('/V2/hero_banner.jpeg')",
				backgroundSize: "cover",
				backgroundPosition: "top center",
				backgroundRepeat: "no-repeat",
			}}
		>
			<div className="absolute bottom-0 left-0 right-0 z-20 h-48 sm:h-64 lg:h-72 bg-gradient-to-b from-transparent via-[#0B0919]/70 to-[#0B0919] pointer-events-none" />
			<div className="container mx-auto relative z-10">
				<div className="text-center pt-4 sm:pt-6 lg:pt-10 max-w-5xl mx-auto">
					<h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[75px] leading-tight sm:leading-snug lg:leading-normal text-center animate-fade-in-up">
						Smarter Accounting &<br className="hidden sm:block" /> Payroll,
						Simplified
					</h1>

					<p className="text-white/70 text-sm sm:text-base lg:text-lg mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:150ms]">
						Manage finances, payroll, HR, and reporting in one powerful
						platform—built to simplify operations and scale with your business.
					</p>
				</div>

				<div className="relative mt-8 sm:mt-10 lg:mt-12">
					<div className="hidden lg:block absolute left-4 xl:left-12 -mt-6 -translate-y-1/2 text-white animate-fade-in-left [animation-delay:300ms]">
						<div className="text-5xl xl:text-6xl font-normal leading-none ">
							50%
						</div>
						<div className="text-xs xl:text-sm text-white/70 mt-2">
							Faster Decisions
						</div>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up [animation-delay:300ms]">
						<button
							onClick={() => router.push("/auth?action=sign-up")}
							className="w-full sm:w-auto bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-6 sm:px-8 py-3.5 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-105 transition-all duration-300"
						>
							Start Managing Smarter
						</button>
						<button
							onClick={() => router.push("/demo")}
							className="w-full sm:w-auto border border-white/30 text-white text-sm font-semibold px-6 sm:px-8 py-3.5 rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300"
						>
							Book a Demo
						</button>
					</div>

					<div className="lg:hidden flex items-center justify-center gap-3 mt-6 sm:mt-8 text-white animate-fade-in-up [animation-delay:450ms]">
						<div className="text-3xl sm:text-4xl font-bold leading-none">50%</div>
						<div className="text-xs text-white/70">Faster Decisions</div>
					</div>
				</div>

				<div className="mt-8 sm:mt-12 lg:mt-16 pb-10 sm:pb-16 lg:pb-24 max-w-6xl mx-auto relative animate-fade-in [animation-delay:500ms]">
					<Image
						src="/V2/based.png"
						alt="Pilucent dashboard preview"
						width={1400}
						height={820}
						priority
						className="w-full h-auto relative z-10"
					/>

					<Image
						src="/V2/profit.png"
						alt="Profit and Loss"
						width={420}
						height={210}
						className="absolute top-0 left-0 lg:-top-6 lg:-left-6 w-[42%] max-w-[380px] h-auto z-20 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-float"
					/>

					<Image
						src="/V2/customer.png"
						alt="Top Customers"
						width={460}
						height={220}
						className="absolute bottom-2 right-0 lg:-bottom-6 lg:-right-6 w-[44%] max-w-[420px] h-auto z-20 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-float [animation-delay:1s]"
					/>
				</div>
			</div>
		</section>
	);
};

export default HeroV2;