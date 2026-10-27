import React from 'react'
import Hero from './_components/hero'
import Highlights from './_components/highlights'
import Principles from './_components/principles'
import Integrations from './_components/integrations'

export const metadata = {
	title: 'Features | Balanzify',
	description:
		'Accounting, payroll, HR, sales, and inventory in one platform. See your real numbers in real time and run your whole business without switching tabs.',
}

const FeaturePage = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Highlights />
			<Principles />
			{/* <Integrations /> */}
		</div>
	)
}

export default FeaturePage
