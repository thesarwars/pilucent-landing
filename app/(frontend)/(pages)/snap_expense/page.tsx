import React from 'react'
import Hero from './_components/hero'
import Stats from './_components/stats'
import HowItWorks from './_components/how_it_works'
import Features from './_components/features'
import Showcase from './_components/showcase'
import Capture from "./_components/capture"

export const metadata = {
	title: 'Snap Expense | Balanzify',
	description:
		'Snap a receipt, and Balanzify logs it instantly. AI-powered expense tracking that reads, categorizes, and syncs every receipt to your ledger in seconds.',
}

const SnapExpensePage = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Stats />
			<HowItWorks />
			<Capture />
			<Features />
			<Showcase />
		</div>
	)
}

export default SnapExpensePage
