'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="Case Studies"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="See How Businesses Streamline Operations with Pilucent"
			description="Discover how organizations improve payroll accuracy, increase efficiency, and gain greater control over business operations."
			buttons={[{ label: 'Explore Success Stories', href: '/contact' }]}
		/>
	)
}

export default Hero
