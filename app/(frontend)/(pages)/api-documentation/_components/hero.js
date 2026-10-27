'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="API Documentation"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="Integrate Balanzify with Your Existing Business Systems"
			description="Access developer-friendly documentation to connect payroll, HR, accounting, and business operations with your preferred tools."
			buttons={[{ label: 'View Documentation', href: '/contact' }]}
		/>
	)
}

export default Hero
