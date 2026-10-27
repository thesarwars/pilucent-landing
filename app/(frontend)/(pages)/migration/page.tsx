import React from 'react'
import Hero from './_components/hero'
import Stats from './_components/stats'
import Steps from './_components/steps'
import Features from './_components/features'
import Guarantee from './_components/guarantee'
import Comparison from './_components/comparison'
import Faq from './_components/faq'
import Cta from './_components/cta'

export const metadata = {
	title: 'Migration | Balanzify',
	description:
		'Switch from QuickBooks, Xero, or spreadsheets to Balanzify in one afternoon. Free migration included — your data, fully transferred with zero data loss.',
}

const MigrationPage = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Stats />
			<Steps />
			<Features />
			<Guarantee />
			<Comparison />
			<Faq />
		</div>
	)
}

export default MigrationPage
