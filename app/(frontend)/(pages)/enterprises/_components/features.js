'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const features = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<rect x="2" y="5" width="20" height="14" rx="2" stroke="#C27AFF" strokeWidth="2" />
				<path d="M2 10H22" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
				<path d="M6 15H10" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Advanced Payroll Management',
		description: 'Multi-entity, multi-state payroll with automated tax compliance.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<rect x="3" y="3" width="7" height="7" rx="1" stroke="#C27AFF" strokeWidth="2" />
				<rect x="14" y="3" width="7" height="7" rx="1" stroke="#C27AFF" strokeWidth="2" />
				<rect x="3" y="14" width="7" height="7" rx="1" stroke="#C27AFF" strokeWidth="2" />
				<rect x="14" y="14" width="7" height="7" rx="1" stroke="#C27AFF" strokeWidth="2" />
			</svg>
		),
		title: 'Multi-Department Structure',
		description: 'Model complex org charts across locations and business units.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M12 2L4 6V12C4 16.5 7.5 19.5 12 21C16.5 19.5 20 16.5 20 12V6L12 2Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<circle cx="12" cy="10" r="2" stroke="#C27AFF" strokeWidth="2" />
				<path d="M9 16C9 14.3431 10.3431 13 12 13C13.6569 13 15 14.3431 15 16" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Role-Based Permissions',
		description: 'Granular access controls down to the module and action level.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M14 2V8H20" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M8 13L10 15L13 12" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Audit Logs',
		description: 'Immutable, timestamped records of every action and change.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<rect x="4" y="2" width="16" height="20" rx="2" stroke="#C27AFF" strokeWidth="2" />
				<path d="M8 7H16M8 11H16M8 15H13" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Compliance Reporting',
		description: 'Audit-ready reports that meet regulatory and governance standards.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M3 3V21H21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<rect x="7" y="12" width="3" height="5" stroke="#C27AFF" strokeWidth="2" strokeLinejoin="round" />
				<rect x="14" y="8" width="3" height="9" stroke="#C27AFF" strokeWidth="2" strokeLinejoin="round" />
			</svg>
		),
		title: 'Enterprise Analytics',
		description: 'Consolidated financial and workforce intelligence at scale.',
	},
]

const Features = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Features for Enterprises</GradientBadge>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-tight">
							Power for the most demanding operations.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
					{features.map((item, idx) => (
						<AnimateOnScroll
							key={item.title}
							delay={idx * 70}
							className="rounded-2xl sm:rounded-3xl p-6 sm:p-7 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(79,35,180,0.35)] transition-all duration-400"
							style={{
								borderRadius: '24px',
								border: '1px solid #F9F9F9',
								backdropFilter: 'blur(8px)',
								WebkitBackdropFilter: 'blur(8px)',
							}}
						>
							<div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] border border-white/15 bg-[#AD46FF1A] text-[#A78BFF]">
								{item.icon}
							</div>

							<div>
								<p className="text-[#F9F9F9] font-semibold text-base sm:text-lg mb-2">
									{item.title}
								</p>
								<p className="text-white/60 text-sm leading-relaxed">
									{item.description}
								</p>
							</div>
						</AnimateOnScroll>
					))}
				</div>
			</div>
		</section>
	)
}

export default Features
