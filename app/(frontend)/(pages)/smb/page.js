import React from 'react'
import Hero from './_components/hero'
import Benefits from './_components/benefits'
import Features from './_components/features'
import CTA from './_components/cta'

export const metadata = {
	title: 'For SMBs | Pilucent',
	description:
		'Accounting, payroll, and business operations simplified for growing SMBs. Manage finances, employees, payroll, taxes, and daily operations from one unified platform.',
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
