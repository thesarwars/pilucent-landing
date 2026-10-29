'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const stats = [
	{ value: '$401M+', label: 'Processed Through Pilucent' },
	{ value: '8+', label: 'Years Building Fintech' },
	{ value: '$0', label: 'Hidden Fees, Ever' },
	{ value: '14-Day', label: 'Free Trial, No Card' },
]

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/hero_banner.png"
			badge="About Pilucent"
			contentMaxWidth="max-w-3xl"
			titleClassName="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[60px] leading-tight sm:leading-snug lg:leading-[1]"
			title={
				<>
					Built for the people who<br className="hidden sm:block" /> keep businesses growing.
				</>
			}
			description="Pilucent brings accounting, payroll, HR, and reporting into one platform—so the founders, finance teams, and operators behind every growing company can focus on what matters instead of fighting their tools."
			stats={stats}
		/>
	)
}

export default Hero
