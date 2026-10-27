'use client'
import React from 'react'
import Hero from './_components/hero'
import Infrastructure from './_components/infrastructure'
import Timeline from './_components/timeline'
import Principles from './_components/principles'
import Quote from './_components/quote'
import Team from './_components/team'
import Comparison from './_components/comparison'
import Cta from './_components/cta'

const AboutPage = () => {
	return (
		<div className="font-jakarta bg-[#0B0919]">
			<Hero />
			<Infrastructure />
			<Timeline />
			<Principles />
			<Quote />
			<Team />
			<Comparison />
			{/* <Cta /> */}
		</div>
	)
}

export default AboutPage
