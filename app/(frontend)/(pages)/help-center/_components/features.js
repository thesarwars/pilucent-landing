'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const topics = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M3 21H21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
				<path d="M5 21V7L13 3V21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M19 21V11L13 7" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M9 9V9.01M9 13V13.01M9 17V17.01" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Company Setup',
		description: 'Configure your organization, branding, and core settings.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<rect x="2" y="5" width="20" height="14" rx="2" stroke="#C27AFF" strokeWidth="2" />
				<path d="M2 10H22" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
				<path d="M6 15H10" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Payroll Processing',
		description: 'Run, review, and approve payroll step by step.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Employee Management',
		description: 'Add, organize, and manage your people and profiles.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M8 2V6M16 2V6" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
				<rect x="3" y="4" width="18" height="18" rx="2" stroke="#C27AFF" strokeWidth="2" />
				<path d="M3 10H21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
				<path d="M9 16L11 18L15 14" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Attendance Tracking',
		description: 'Set up time, shifts, and leave tracking for your team.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M3 3V21H21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<rect x="7" y="12" width="3" height="5" stroke="#C27AFF" strokeWidth="2" strokeLinejoin="round" />
				<rect x="14" y="8" width="3" height="9" stroke="#C27AFF" strokeWidth="2" strokeLinejoin="round" />
			</svg>
		),
		title: 'Reports & Analytics',
		description: 'Build and read the reports that matter to your business.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M12 2L4 6V12C4 16.5 7.5 19.5 12 21C16.5 19.5 20 16.5 20 12V6L12 2Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M9 12L11 14L15 10" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'User Roles & Permissions',
		description: 'Control who can access and change what across the platform.',
	},
]

const Features = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Popular Topics</GradientBadge>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-tight">
							Start with the most-asked questions.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
					{topics.map((item, idx) => (
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
