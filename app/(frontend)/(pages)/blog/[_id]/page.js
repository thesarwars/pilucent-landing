'use client'
import { useRouter } from 'next/navigation'
import { FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaSquareTwitter, FaLink } from 'react-icons/fa6'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const sections = [
	{
		id: 1,
		heading: 'New Audit Log Report',
		image: '/blog2.png',
		body: "The holiday season is a crucial time for small business owners, many of which rely on holiday sales to hit their financial goals for the year. This holiday season may be particularly challenging — a Pilucent-commissioned survey predicts a significant 34% drop in consumer holiday spending, leading to an $85 billion decrease compared to 2023. Now Audit Log drops you in the right place, every time.",
	},
	{
		id: 2,
		heading: 'New Audit Log Report',
		image: '/blog1.png',
		body: "The holiday season is a crucial time for small business owners, many of which rely on holiday sales to hit their financial goals for the year. This holiday season may be particularly challenging — a Pilucent-commissioned survey predicts a significant 34% drop in consumer holiday spending, leading to a $65 billion decrease compared to 2023. Enter a new Pilucent, it has no problem, register a 34% store.",
	},
	{
		id: 3,
		heading: 'New Audit Log Report',
		image: '/blog2.png',
		body: "The holiday season is a crucial time for small business owners, many of which rely on holiday sales to hit their financial goals for the year. This holiday season may be particularly challenging — a Pilucent-commissioned survey predicts a significant 34% drop in consumer holiday spending, leading to a $65 billion decrease compared to 2023.",
	},
	{
		id: 4,
		heading: 'New Audit Log Report',
		image: '/blog3.png',
		body: "The holiday season is a crucial time for small business owners, many of which rely on holiday sales to hit their financial goals for the year. This holiday season may be particularly challenging — a Pilucent-commissioned survey predicts a significant 34% drop in consumer holiday spending, leading to a $65 billion decrease compared to 2023.",
	},
]

const tableOfContents = [
	'New Audit Log Report',
	'Financial Service Ledger Report',
	'Financial General Ledger Report',
	'Financial Service Ledger Report',
]

const ShareButton = ({ children, href = '#' }) => (
	<a
		href={href}
		className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-[#8B5CF6] transition-all duration-300"
		style={{ border: '1px solid rgba(255,255,255,0.15)' }}
	>
		{children}
	</a>
)

export default function BlogDetail() {
	const router = useRouter()

	return (
		<div className="font-jakarta bg-[#0B0919] min-h-screen">
			{/* Hero — just the title, clean */}
			<section className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-8 sm:pb-10 px-4">
				<div className="container mx-auto max-w-4xl text-center">
					<AnimateOnScroll>
						<h1 className="text-[#F9F9F9] font-semibold text-2xl sm:text-4xl lg:text-5xl leading-tight sm:leading-snug">
							The SMB Financial Stack in 2026: What Every Operator Needs
						</h1>
					</AnimateOnScroll>
				</div>
			</section>

			<section className="relative px-4 pb-16 sm:pb-20">
				<div className="container mx-auto max-w-5xl">
					{/* Featured Image */}
					<AnimateOnScroll className="rounded-2xl sm:rounded-3xl overflow-hidden mb-7 sm:mb-9">
						<img
							src="/blog_detail.png"
							alt="The SMB Financial Stack in 2026"
							className="w-full object-cover"
						/>
					</AnimateOnScroll>

					{/* Meta Bar */}
					<AnimateOnScroll
						className="rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-5 mb-9 sm:mb-11"
						delay={80}
						style={{
							background: 'linear-gradient(145deg, rgba(19,16,34,0.7), #1a163a)',
							border: '1px solid rgba(249,249,249,0.12)',
						}}
					>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-white/10">
							<div className="pb-4 sm:pb-0 sm:pr-6">
								<p className="text-white/40 text-[11px] uppercase tracking-widest mb-1">Posted By</p>
								<p className="text-[#F9F9F9] font-semibold text-sm">Dana Royer</p>
							</div>
							<div className="py-4 sm:py-0 sm:px-6">
								<p className="text-white/40 text-[11px] uppercase tracking-widest mb-1">Published On</p>
								<p className="text-[#F9F9F9] font-semibold text-sm">March 15, 2024</p>
							</div>
							<div className="pt-4 sm:pt-0 sm:pl-6">
								<p className="text-white/40 text-[11px] uppercase tracking-widest mb-1">Category</p>
								<p className="text-[#F9F9F9] font-semibold text-sm">Payroll</p>
							</div>
						</div>
					</AnimateOnScroll>

					{/* Intro */}
					<AnimateOnScroll delay={100} className="mb-10 sm:mb-12">
						<p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-3xl">
							The holiday season is a crucial time for small business owners, many of which rely on
							holiday sales and revenue to hit their financial goals for the year. This holiday season
							may be particularly challenging — a Pilucent-commissioned survey predicts a significant
							34% drop in consumer holiday spending, leading to an $85 billion decrease compared to 2023.
						</p>
					</AnimateOnScroll>

					{/* Main content + Sidebar */}
					<div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
						{/* Article Body */}
						<div className="lg:w-[65%] space-y-10 sm:space-y-12">
							{sections.map((section, idx) => (
								<AnimateOnScroll key={section.id} delay={idx * 80} id={`section-${section.id}`}>
									<h2 className="text-[#F9F9F9] text-lg sm:text-2xl font-semibold mb-4">
										{section.id}. {section.heading}
									</h2>
									<div className="rounded-2xl overflow-hidden mb-5">
										<img
											src={section.image}
											alt={section.heading}
											className="w-full h-[200px] sm:h-[280px] object-cover"
										/>
									</div>
									<p className="text-white/60 text-sm leading-relaxed">{section.body}</p>
								</AnimateOnScroll>
							))}
						</div>

						{/* Sidebar */}
						<aside className="lg:w-[35%] space-y-4">
							<div className="lg:sticky lg:top-24 space-y-4">
								{/* Table of Contents */}
								<AnimateOnScroll
									className="rounded-2xl sm:rounded-3xl p-6"
									style={{
										background: 'linear-gradient(145deg, rgba(19,16,34,0.7), #1a163a)',
										border: '1px solid rgba(249,249,249,0.12)',
									}}
								>
									<h3 className="text-[#F9F9F9] text-base font-semibold mb-4">Table of Contents</h3>
									<ul className="space-y-3">
										{tableOfContents.map((item, index) => (
											<li key={index} className="flex items-start gap-2.5">
												<span className="text-white/35 text-xs mt-0.5 shrink-0">
													0{index + 1}.
												</span>
												<a
													href={`#section-${index + 1}`}
													className="text-sm text-white/70 hover:text-[#8B5CF6] transition-colors leading-snug"
												>
													{item}
												</a>
											</li>
										))}
									</ul>
								</AnimateOnScroll>

								{/* Share */}
								<AnimateOnScroll
									className="rounded-2xl sm:rounded-3xl p-6"
									delay={80}
									style={{
										background: 'linear-gradient(145deg, rgba(19,16,34,0.7), #1a163a)',
										border: '1px solid rgba(249,249,249,0.12)',
									}}
								>
									<h3 className="text-[#F9F9F9] text-base font-semibold mb-4">Share</h3>
									<div className="flex items-center gap-2">
										<ShareButton><FaFacebook size={15} /></ShareButton>
										<ShareButton><FaSquareTwitter size={15} /></ShareButton>
										<ShareButton><FaLinkedin size={15} /></ShareButton>
										<ShareButton><FaLink size={14} /></ShareButton>
									</div>
								</AnimateOnScroll>
							</div>
						</aside>
					</div>
				</div>
			</section>
		</div>
	)
}
