import React from 'react'
import Hero from './_components/hero'
import Benefits from './_components/benefits'
import Features from './_components/features'
import CTA from './_components/cta'

export const metadata = {
	title: 'API Documentation | Balanzify',
	description:
		'Integrate Balanzify with your existing business systems. Developer-friendly documentation to connect payroll, HR, accounting, and operations with your preferred tools.',
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
