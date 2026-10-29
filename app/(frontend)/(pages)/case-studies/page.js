import React from 'react'
import Hero from './_components/hero'
import Benefits from './_components/benefits'
import Features from './_components/features'
import CTA from './_components/cta'

export const metadata = {
	title: 'Case Studies | Pilucent',
	description:
		'See how businesses streamline operations with Pilucent. Discover how organizations improve payroll accuracy, increase efficiency, and gain greater control.',
}

const Page = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Benefits />
			<Features />
			<CTA />
		</div>
	)
}

export default Page
