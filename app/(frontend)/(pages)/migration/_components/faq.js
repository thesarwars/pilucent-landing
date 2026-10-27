'use client'
import React, { useState } from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const faqs = [
	{
		question: 'Do I need to prepare anything before the session?',
		answer:
			'Just have your current tool logins ready. Your specialist will tell you exactly what to export or connect. No technical preparation required on your end.',
	},
	{
		question: 'What if my data is in multiple places?',
		answer:
			'Most businesses have data in QuickBooks, Gusto, and a spreadsheet or two. We migrate all of it in the same session. Your specialist coordinates the full picture.',
	},
	{
		question: 'Will my historical data come over?',
		answer:
			'Yes — years of it. Transaction history, payroll history, reconciliation records, customer history. You do not start from scratch. Everything comes with you.',
	},
	{
		question: 'How long does the session actually take?',
		answer:
			'Most migrations complete in 2–4 hours. More complex setups with multiple data sources may take a full afternoon. Either way, you are live the same day.',
	},
	{
		question: 'What if something does not look right after migration?',
		answer:
			'Your specialist verifies everything before the session ends. If anything is off, we fix it on the call. The migration is not complete until you both confirm everything is correct.',
	},
	{
		question: 'Is migration really free?',
		answer:
			'Yes — fully included in both Starter and Growth plans. No setup fee, no migration fee, no consulting charges. It is part of what you pay for.',
	},
]

const ChevronIcon = ({ open }) => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
	>
		<path d="M5 7.5l5 5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const FaqItem = ({ question, answer, index }) => {
	const [open, setOpen] = useState(index < 4)

	return (
		<AnimateOnScroll delay={index * 80}>
			<div
				className="cursor-pointer group"
				onClick={() => setOpen(!open)}
			>
				<div className="flex items-start gap-4 sm:gap-6 py-5">
					{/* Number */}
					<span className="text-white/40 text-sm font-mono w-6 shrink-0 pt-0.5">
						{String(index + 1).padStart(2, '0')}.
					</span>

					{/* Question + Answer */}
					<div className="flex-1 min-w-0">
						<p className="text-[#F9F9F9] font-semibold text-base sm:text-lg leading-snug pr-4">
							{question}
						</p>
						{open && (
							<p className="text-white/55 text-xs sm:text-sm leading-relaxed mt-3 max-w-lg">
								{answer}
							</p>
						)}
					</div>

					{/* Toggle button */}
					<button
						className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
						style={{
							background: open ? '#5B3FD4' : 'rgba(255,255,255,0.08)',
						}}
						aria-label="Toggle answer"
					>
						<ChevronIcon open={open} />
					</button>
				</div>

				{/* Divider */}
				<div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
			</div>
		</AnimateOnScroll>
	)
}

const Faq = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
					{/* Left: heading */}
					<AnimateOnScroll animation="animate-fade-in-left" className="lg:sticky lg:top-32">
						<GradientBadge>FAQ</GradientBadge>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-tight mt-2">
							Migration Ask Question
						</h2>
						<p className="text-white/50 text-sm leading-relaxed mt-4">
							Everything you need to know before switching to Balanzify.
						</p>
					</AnimateOnScroll>

					{/* Right: accordion */}
					<div>
						{/* Top divider */}
						<div className="h-px w-full mb-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
						{faqs.map((faq, idx) => (
							<FaqItem key={faq.question} question={faq.question} answer={faq.answer} index={idx} />
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default Faq