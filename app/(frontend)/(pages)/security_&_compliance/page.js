import React from 'react'
import Hero from './_components/hero'
import Secure from './_components/secure'
import Compliance from './_components/compliance'


export const metadata = {
	title: 'Migration | Balanzify',
	description:
		'Switch from QuickBooks, Xero, or spreadsheets to Balanzify in one afternoon. Free migration included — your data, fully transferred with zero data loss.',
}

const Page = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Secure />
			<Compliance />
		</div>
	)
}

export default Page
