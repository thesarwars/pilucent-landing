'use client'
import React from 'react'
import AnimateOnScroll from './AnimateOnScroll'

// Shared icon + title + description card used by the Snap Expense "Capture"
// grid and the Career benefits grid. `icon` is the inner SVG paths/shapes.
const FeatureCard = ({ icon, title, description, delay = 0 }) => (
	<AnimateOnScroll
		delay={delay}
		className="rounded-xl p-6 sm:p-7 min-h-[220px] sm:min-h-[240px] flex flex-col hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(79,35,180,0.4)] transition-all duration-500"
		style={{
			background: 'linear-gradient(145deg, #13102280, #1a163a)',
			border: '1px solid rgba(249,249,249,0.12)',
		}}
	>
		<div className="w-8 h-8 rounded-full bg-[#AD46FF1A] flex items-center justify-center mb-auto">
			<svg
				className="w-4 h-4 text-[#C27AFF]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{icon}
			</svg>
		</div>
		<div className="mt-8">
			<p className="text-[#F9F9F9] text-base sm:text-lg font-semibold mb-2">{title}</p>
			<p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm leading-relaxed">{description}</p>
		</div>
	</AnimateOnScroll>
)

export default FeatureCard
