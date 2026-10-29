'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="For Agencies"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="Manage Teams, Payroll & Finances Across Every Client Project"
			description="Pilucent helps agencies streamline workforce management, payroll processing, expense tracking, and financial reporting from a single platform."
			buttons={[{ label: 'Book a Demo', href: '/contact' }]}
		/>
	)
}

export default Hero
