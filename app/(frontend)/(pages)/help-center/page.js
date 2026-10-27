import React from 'react'
import Hero from './_components/hero'
import Benefits from './_components/benefits'
import Features from './_components/features'
import CTA from './_components/cta'

export const metadata = {
	title: 'Help Center | Balanzify',
	description:
		'Get the help you need, when you need it. Find answers, learn platform features, and access step-by-step guidance to make the most of Balanzify.',
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
