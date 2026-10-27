'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const team = [
	{ name: 'Khalid Jamal', role: 'Founder & CEO', photo: '/daniel.png' },
	{ name: 'Amanda Lee', role: 'Head of Product', photo: '/james.png' },
	{ name: 'David Cruz', role: 'Lead Engineer', photo: '/david.png' },
	{ name: 'Emily Stone', role: 'Customer Success', photo: '/emily.png' },
]

const Team = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Our Team</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-[120%]">
							The team behind the platform.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					{team.map((member, idx) => (
						<AnimateOnScroll
							key={member.name}
							delay={idx * 120}
							className="rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(79,35,180,0.4)] transition-all duration-500"
							style={{ background: 'linear-gradient(145deg, #13102280, #1a163a)', border: '1px solid rgba(249,249,249,0.12)' }}
						>
							<div className="aspect-square w-full overflow-hidden bg-[#1a163a]">
								<img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
							</div>
							<div className="p-4 sm:p-5">
								<p className="text-[#F9F9F9] text-sm sm:text-base font-semibold">{member.name}</p>
								<p className="text-[#F9F9F9] opacity-60 text-xs sm:text-sm mt-0.5">{member.role}</p>
							</div>
						</AnimateOnScroll>
					))}
				</div>
			</div>
		</section>
	)
}

export default Team
