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
		title: 'Payroll Management',
		description: 'Run accurate payroll with automated tax calculations and direct deposit.',
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
		title: 'Employee Attendance',
		description: 'Track time, shifts, and leave with clear, audit-ready records.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M12 1V23" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
				<path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		),
		title: 'Expense Tracking',
		description: 'Capture, categorize, and approve every expense in one place.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M14 2V8H20" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M9 13H15M9 17H15" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Invoicing & Billing',
		description: 'Send branded invoices and accept online payments faster.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<path d="M3 3V21H21" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				<rect x="7" y="12" width="3" height="5" stroke="#C27AFF" strokeWidth="2" strokeLinejoin="round" />
				<rect x="14" y="8" width="3" height="9" stroke="#C27AFF" strokeWidth="2" strokeLinejoin="round" />
			</svg>
		),
		title: 'Financial Reporting',
		description: 'Real-time P&L, cash flow, and reports ready whenever you need them.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
				<rect x="4" y="2" width="16" height="20" rx="2" stroke="#C27AFF" strokeWidth="2" />
				<path d="M8 7H16M8 11H16M8 15H13" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" />
			</svg>
		),
		title: 'Tax Management',
		description: 'Calculate, organize, and file taxes with confidence and accuracy.',
	},
]

const Features = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-10 sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<GradientBadge>Features SMBs Love</GradientBadge>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold leading-tight">
							One platform for your entire operation.
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
