'use client'
import React, { useState } from 'react';
import { GradientBadge } from './review';
import AnimateOnScroll from './AnimateOnScroll';

const slides = [
	{
		label: 'Features',
		title: 'Attendance Tracking',
		description: 'Track daily attendance and working hours with accurate and reliable data insights.',
		caption: 'Manage employees, payroll, finances, and operations seamlessly in one unified system.',
		image: '/V2/attendance_slide.png',
	},
	{
		label: 'Features',
		title: 'Payroll Management',
		description: 'Automate salary calculations and payouts with zero manual errors.',
		caption: 'Run payroll in minutes with full compliance and audit-ready records.',
		image: '/V2/attendance_slide.png',
	},
	{
		label: 'Features',
		title: 'Financial Reports',
		description: 'Get real-time insights across expenses, revenue, and cash flow at a glance.',
		caption: 'Make confident decisions backed by live financial data and smart analytics.',
		image: '/V2/attendance_slide.png',
	},
];

const Attendance = () => {
	const [current, setCurrent] = useState(0);

	const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
	const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));

	const slide = slides[current];

	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-end">
					<AnimateOnScroll
						animation="animate-fade-in-left"
						className="relative rounded-3xl overflow-hidden"
					>
						<img
							src="/V2/tracking.png"
							alt="Professional at work"
							className="rounded-l-3xl object-contain w-full h-[320px] sm:h-[480px] lg:h-[650px] hover:scale-105 transition-transform duration-700"
						/>
					</AnimateOnScroll>

					<AnimateOnScroll
						animation="animate-fade-in-right"
						className="flex flex-col justify-between lg:min-h-[420px]"
					>
						<div>
							<GradientBadge>{slide.label}</GradientBadge>
							<h2
								key={slide.title}
								className="text-[#F9F9F9] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 sm:mb-8 transition-all duration-300"
							>
								{slide.title}
							</h2>
							<p
								key={`desc-${current}`}
								className="text-[#F9F9F9] text-xs sm:text-sm opacity-80 mb-5 sm:mb-6 max-w-md"
							>
								{slide.description}
							</p>

							<img src={slide.image} alt={slide.title} className="mb-5 sm:mb-6 w-full max-w-md" />
						</div>

						<div className="flex items-center gap-3 sm:gap-4 mt-4">
							<button
								onClick={prev}
								className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#2a2040] flex items-center justify-center text-white hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:scale-110 transition-all duration-300"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
									<path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							<button
								onClick={next}
								className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white hover:bg-[#7c3aed] hover:scale-110 transition-all duration-300"
							>
								<svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
									<path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</button>
							<div className="flex gap-1.5 ml-2">
								{slides.map((_, i) => (
									<button
										key={i}
										onClick={() => setCurrent(i)}
										className="rounded-full transition-all duration-300"
										style={{
											width: i === current ? '20px' : '6px',
											height: '6px',
											background: i === current ? '#8B5CF6' : '#2a2040',
										}}
									/>
								))}
							</div>
						</div>
					</AnimateOnScroll>
				</div>
			</div>
		</section>
	);
};

export default Attendance;
