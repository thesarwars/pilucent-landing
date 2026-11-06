'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const certifications = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M20 13.0004C20 18.0004 16.5 20.5005 12.34 21.9505C12.1222 22.0243 11.8855 22.0207 11.67 21.9405C7.5 20.5005 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 12L11 14L15 10" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'SOC 2 Type II',
		description:
			'Audited annually by an independent CPA firm. Covers Security, Availability, and Confidentiality trust service criteria.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15.4768 12.8906L16.9918 21.4166C17.0087 21.517 16.9946 21.6202 16.9514 21.7124C16.9081 21.8046 16.8377 21.8813 16.7497 21.9324C16.6616 21.9835 16.56 22.0065 16.4586 21.9983C16.3571 21.9902 16.2605 21.9512 16.1818 21.8866L12.6018 19.1996C12.4289 19.0705 12.219 19.0007 12.0033 19.0007C11.7875 19.0007 11.5776 19.0705 11.4048 19.1996L7.81875 21.8856C7.74007 21.9501 7.64361 21.989 7.54225 21.9972C7.44088 22.0054 7.33942 21.9825 7.25141 21.9315C7.16341 21.8805 7.09303 21.804 7.04967 21.712C7.00631 21.62 6.99204 21.5169 7.00875 21.4166L8.52275 12.8906" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14Z" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'PCI DSS Compliant',
		description:
			'Payment card data handled in compliance with PCI DSS Level 1 requirements via our payment processing infrastructure.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7L15 2Z" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 2V6C14 6.53043 14.2107 7.03914 14.5858 7.41421C14.9609 7.78929 15.4696 8 16 8H20" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 15L11 17L15 13" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'GLBA Compliant',
		description:
			'Gramm-Leach-Bliley Act safeguards implemented for the protection of nonpublic personal financial information.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 12C8 8.27674 9.43223 4.69615 12 2C14.5678 4.69615 16 8.27674 16 12C16 15.7233 14.5678 19.3038 12 22C9.43223 19.3038 8 15.7233 8 12Z" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 12H22" stroke="#C27AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'GDPR Ready',
		description:
			'Data processing agreements available for international customers on request.',
	},
]

const specs = [
	{
		label: 'Hosting',
		value: 'Amazon Web Services — us-east-1 primary, us-west-2 failover',
	},
	{
		label: 'Encryption at Rest',
		value: 'AES-256 with automatic annual key rotation',
	},
	{
		label: 'Encryption in Transit',
		value: 'TLS 1.3 minimum. TLS 1.0 and 1.1 disabled across all endpoints',
	},
	{
		label: 'Authentication',
		value:
			'Email/password with bcrypt hashing + mandatory MFA for all admin roles. SSO available on Growth plan',
	},
	{
		label: 'Session Management',
		value:
			'Sessions expire after 8 hours of inactivity. Concurrent session limits configurable per organization',
	},
	{
		label: 'Audit Log Retention',
		value: '7 years, immutable, exportable in SIEM-compatible formats',
	},
	{
		label: 'Backup Frequency',
		value: 'Continuous with 15-minute RPO. Daily snapshots retained for 90 days',
	},
	{
		label: 'Uptime',
		value: '99.9%+ historical uptime. Status published at status.pilucent.com',
	},
	{
		label: 'Penetration Testing',
		value:
			'Annual third-party test. Executive summary available to customers on request',
	},
	{
		label: 'Data Deletion',
		value:
			'Customer data deleted within 30 days of account termination. Certificate of deletion available on request',
	},
]

const Compliance = () => {
	return (
		<>
			{/* Certified and audited */}
			<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
				<div className="container mx-auto max-w-6xl">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
						{/* Left: text */}
						<AnimateOnScroll animation="animate-fade-in-left" className="lg:sticky lg:top-32">
							<GradientBadge>Compliance</GradientBadge>
							<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight sm:leading-snug lg:leading-[1.15] mt-2 mb-5">
								Certified and audited.
							</h2>
							<p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
								Independent firms verify our controls so you don&apos;t have to take
								our word for it. Here are the standards we hold ourselves to.
							</p>
						</AnimateOnScroll>

						{/* Right: certification grid */}
						<AnimateOnScroll animation="animate-fade-in-right" delay={150}>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
								{certifications.map((item, idx) => (
									<AnimateOnScroll
										key={item.title}
										delay={idx * 60}
										className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(79,35,180,0.35)] transition-all duration-400"
										style={{
											borderRadius: '24px',
											border: '1px solid #F9F9F9',
											backdropFilter: 'blur(8px)',
											WebkitBackdropFilter: 'blur(8px)',
										}}
									>
										{/* Icon */}
										<div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/15 bg-[#AD46FF1A] text-[#A78BFF]">
											{item.icon}
										</div>
									
									<div className="mt-12">
										
										{/* Title */}
										<p className="text-[#F9F9F9] font-semibold text-base sm:text-lg">
											{item.title}
										</p>

										{/* Description */}
										<p className="text-white/60 mt-3 text-xs sm:text-sm leading-relaxed">
											{item.description}
										</p>
									</div>
									</AnimateOnScroll>
								))}
							</div>
						</AnimateOnScroll>
					</div>
				</div>
			</section>

			{/* Security by the numbers */}
			<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
				<div className="container mx-auto max-w-3xl">
					<div className="text-center mb-10 sm:mb-12 lg:mb-14">
						<AnimateOnScroll>
							<GradientBadge>Technical Specifications</GradientBadge>
						</AnimateOnScroll>

						<AnimateOnScroll delay={100}>
							<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">
								Security by the numbers.
							</h2>
						</AnimateOnScroll>
					</div>

					<AnimateOnScroll delay={150}>
						<div
							className="overflow-hidden rounded-2xl sm:rounded-3xl"
							style={{
								borderRadius: '24px',
								border: '1px solid #7C3AED26',
								backdropFilter: 'blur(8px)',
								WebkitBackdropFilter: 'blur(8px)',
							}}
						>
							{specs.map((item, idx) => (
								<div
									key={item.label}
									className={`grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 px-5 sm:px-8 py-5 ${
										idx !== specs.length - 1 ? 'border-b border-[#7C3AED26]' : ''
									}`}
								>
									<p className="text-[#F9F9F9] font-semibold text-sm">
										{item.label}
									</p>
									<p className="text-[#9280B8] text-xs sm:text-sm leading-relaxed">
										{item.value}
									</p>
								</div>
							))}
						</div>
					</AnimateOnScroll>
				</div>
			</section>
		</>
	)
}

export default Compliance
