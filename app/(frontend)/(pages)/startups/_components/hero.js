'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="For Startups"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="Built for Fast-Moving Startups"
			description="From your first hire to your growing team, Pilucent helps startups streamline payroll, finance, and operations without adding complexity."
			buttons={[{ label: 'Start Growing Smarter', href: '/contact' }]}
		/>
	)
}

export default Hero
