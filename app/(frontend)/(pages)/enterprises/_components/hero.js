'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="For Enterprises"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="Enterprise-Grade Financial & Workforce Management"
			description="Power large-scale operations with advanced payroll, workforce management, compliance controls, and business reporting."
			buttons={[{ label: 'Talk to an Expert', href: '/contact' }]}
		/>
	)
}

export default Hero
