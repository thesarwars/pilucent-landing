import React from 'react'
import Hero from './_components/hero'
import Benefits from './_components/benefits'
import Features from './_components/features'
import CTA from './_components/cta'

export const metadata = {
	title: 'For Agencies | Balanzify',
	description:
		'Manage teams, payroll, and finances across every client project. Streamline workforce management, payroll processing, expense tracking, and reporting from one platform.',
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
