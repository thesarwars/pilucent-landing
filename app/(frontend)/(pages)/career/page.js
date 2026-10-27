import React from 'react'
import Hero from './_components/hero'
import Benefits from './_components/benefits'
import Openings from './_components/openings'
import HiringProcess from './_components/hiring_process'

const Page = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Benefits />
			<Openings />
			<HiringProcess />
		</div>
	)
}

export default Page
