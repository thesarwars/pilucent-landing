'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="For SMBs"
			contentMaxWidth="max-w-5xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[56px] leading-tight sm:leading-snug lg:leading-[1.08] mt-2"
			title="Accounting, Payroll & Business Operations — Simplified for Growing SMBs"
			description="Manage finances, employees, payroll, taxes, and daily operations from one unified platform designed to help small and medium-sized businesses scale efficiently."
			buttons={[{ label: 'Book a Demo', href: '/contact' }]}
		/>
	)
}

export default Hero
