'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const CheckIcon = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="8" cy="8" r="7.5" stroke="white" strokeOpacity="0.4" />
		<path d="M5 8L7 10L11 6" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const trustItems = [
	{ icon: <CheckIcon />, label: 'iOS & Android' },
	{ icon: <CheckIcon />, label: '98% OCR accuracy' },
	{ icon: <CheckIcon />, label: 'Posts to books automatically' },
]

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="Included in both Starter and Growth — no extra cost"
			contentMaxWidth="max-w-7xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[66px] leading-tight sm:leading-snug lg:leading-[1.1] mt-2"
			title={<>Snap a receipt. It&apos;s done.</>}
			description="Employees photograph a receipt. Pilucent reads it, categorizes it, routes it for approval, and posts it to your books — all before they leave the parking lot. No spreadsheets. No expense reports. No 3-week reimbursement wait."
			buttons={[
				{ label: 'Get Started', href: '/auth?action=sign-up' },
				{ label: 'See How it Works', href: '#how-it-works', variant: 'secondary' },
			]}
			trustItems={trustItems}
		/>
	)
}

export default Hero
