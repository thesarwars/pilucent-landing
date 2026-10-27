'use client'

import React from 'react'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const icon = (path) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{path}
	</svg>
)

const features = [
	{
		icon: icon(
			<>
				<rect x="2" y="4" width="20" height="6" rx="2" />
				<rect x="2" y="14" width="20" height="6" rx="2" />
				<path d="M6 7h.01M6 17h.01" />
			</>
		),
		title: 'Infrastructure Security',
		description:
			'Hosted on AWS with multi-region redundancy. All infrastructure provisioned via code with no manual access to production environments. Immutable deployments with full rollback capability.',
	},
	{
		icon: icon(
			<>
				<rect x="3" y="11" width="18" height="11" rx="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</>
		),
		title: 'Data Encryption',
		description:
			'All data encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys managed with automatic rotation. Sensitive fields (SSNs, bank account numbers) receive additional application-level encryption.',
	},
	{
		icon: icon(
			<>
				<circle cx="12" cy="8" r="3" />
				<path d="M12 11v6M9 17l3 3 3-3" />
			</>
		),
		title: 'Access Controls',
		description:
			'Role-based access control across the entire platform. Principle of least privilege enforced for all internal systems. No Balanzify employee can access your data without an explicit, time-limited, audited authorization.',
	},
	{
		icon: icon(
			<>
				<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
				<circle cx="12" cy="12" r="3" />
			</>
		),
		title: 'Audit Logging',
		description:
			'Every action — every login, every data change, every export — is logged with timestamp, user identity, and IP address. Audit logs are immutable and retained for 7 years.',
	},
	{
		icon: icon(
			<>
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3 2" />
			</>
		),
		title: 'Penetration Testing',
		description:
			'Annual third-party penetration tests by an independent security firm. Quarterly internal vulnerability scanning. Critical findings remediated within 24 hours.',
	},
	{
		icon: icon(
			<>
				<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
			</>
		),
		title: 'Incident Response',
		description:
			'Documented incident response plan with defined roles and escalation paths. Customers notified of any material security incident within 72 hours.',
	},
	{
		icon: icon(
			<>
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
			</>
		),
		title: 'Network Security',
		description:
			'All traffic flows through a Web Application Firewall with DDoS protection. Internal services communicate over private networks. No public endpoints for internal infrastructure.',
	},
	{
		icon: icon(
			<>
				<ellipse cx="12" cy="5" rx="8" ry="3" />
				<path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
			</>
		),
		title: 'Backup & Recovery',
		description:
			'Continuous database backups with 15-minute recovery point objective. Backups encrypted and stored in a separate region. Recovery time objective under 4 hours.',
	},
	{
		icon: icon(
			<>
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			</>
		),
		title: 'Employee Security',
		description:
			'All employees complete security awareness training on hire and annually. Background checks required. Access revoked within hours of offboarding.',
	},
]

const Secure = () => {
	return (
		<section className="relative overflow-hidden bg-[#0B0919] px-4 py-14 sm:py-16 lg:py-20">
			<div className="relative z-10 mx-auto max-w-7xl">
				<div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-14">
					<AnimateOnScroll>
						<div className="mx-auto mb-5 inline-flex rounded-full border border-white/25 px-5 py-1.5 text-[11px] font-medium text-white/80">
							Security Architecture
						</div>
					</AnimateOnScroll>

					<AnimateOnScroll delay={100}>
						<h2 className="text-3xl font-semibold leading-[1.18] tracking-[-0.03em] text-[#F4F1FF] sm:text-4xl lg:text-[46px]">
							Built secure from the ground up.
						</h2>
					</AnimateOnScroll>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((item, idx) => (
						<AnimateOnScroll
							key={item.title}
							delay={idx * 80}
							className="group relative overflow-hidden rounded-2xl border border-[#312F41] bg-[#100E22] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#703ED5] hover:shadow-[0_24px_50px_-20px_rgba(112,62,213,0.45)]"
						>
							<div className="relative z-10">
								<div className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#312F41] bg-[#1A1730] text-[#A78BFF]">
									{item.icon}
								</div>

								<h3 className="mb-2.5 mt-5 text-[15px] font-semibold leading-tight text-[#F4F1FF]">
									{item.title}
								</h3>

								<p className="text-[12px] leading-[1.7] text-[#F4F1FF]/65">
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

export default Secure
