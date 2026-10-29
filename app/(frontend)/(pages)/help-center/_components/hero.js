'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="Help Center"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="Get the Help You Need, When You Need It"
			description="Find answers, learn platform features, and access step-by-step guidance to make the most of Pilucent."
			buttons={[{ label: 'Visit Help Center', href: '/contact' }]}
		/>
	)
}

export default Hero
