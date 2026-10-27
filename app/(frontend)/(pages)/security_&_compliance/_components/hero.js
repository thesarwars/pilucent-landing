'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'


const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="Security & Compliance"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-snug lg:leading-[1] mt-2"
			title="Your financial data is held to the highest standard."
			description="Security is not a feature we added. It is the foundation we built everything else on top of. Here is exactly how we protect your business data — in plain language."
		/>
	)
}

export default Hero
