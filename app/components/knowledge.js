'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const MarketingSection = () => {
	const router = useRouter();
	return (
		<main className="bg-gray-50 py-16">
			<div className="container mx-auto px-4">
				<div className="bg-white rounded-3xl shadow-lg overflow-hidden">
					<div className="flex flex-col md:flex-row">
						{/* Left Image Section */}
						<div className="md:w-1/2 relative">
							<img
								src="/image1.png"
								alt="Professional at work"
								className="rounded-l-3xl object-cover w-full h-full"
							/>
						</div>

						{/* Right Content Section */}
						<div className="md:w-1/2 bg-[#6366F1] p-8 md:p-12 flex flex-col justify-between">
							<div>
								<h2 className="text-4xl font-bold text-white mb-6">
									Grow Stronger With <br /> Balanzify
								</h2>

								<p className="text-lg text-white/90 leading-relaxed mb-8">
								Expand your potential with seamless integrations, AI-powered automation, and a thriving partner ecosystem. Whether you're an accounting professional, developer, or business owner, Balanzify offers the tools you need to scale effortlessly.
								</p>

								<button
									onClick={() => router.push('/demo')}
									className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-3 
                            rounded-lg text-base font-medium transition-colors duration-200"
								>
									Get Demo
								</button>
							</div>

							<div className="mt-12">
								<div className="text-4xl font-bold text-white mb-2">5K+</div>
								<div className="text-base text-white/90">
									Businesses have partnered with Balanzify
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default MarketingSection;