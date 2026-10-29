'use client'
import React from 'react'
import HeroSection from '../../../../components/V2/HeroSection'

const Hero = () => {
	return (
		<HeroSection
			bgImage="/V2/section_banner.png"
			badge="Careers"
			contentMaxWidth="max-w-7xl"
			title="Build the financial infrastructure for America's real businesses."
			description="We are a small team doing consequential work. If you want your code, your design, or your ideas to matter — and to matter quickly — Pilucent is where that happens."
			buttons={[{ label: 'View open roles', href: '#openings' }]}
		/>
	)
}

export default Hero
