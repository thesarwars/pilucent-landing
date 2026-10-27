'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const dataItems = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M9 1.5V16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.75 3.75H7.125C6.42881 3.75 5.76113 4.02656 5.26884 4.51884C4.77656 5.01113 4.5 5.67881 4.5 6.375C4.5 7.07119 4.77656 7.73887 5.26884 8.23116C5.76113 8.72344 6.42881 9 7.125 9H10.875C11.5712 9 12.2389 9.27656 12.7312 9.76884C13.2234 10.2611 13.5 10.9288 13.5 11.625C13.5 12.3212 13.2234 12.9889 12.7312 13.4812C12.2389 13.9734 11.5712 14.25 10.875 14.25H4.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Spend Limits',
		description: 'Per-transaction and per-day limits by employee role, department, or expense category. Soft limits warn employees; hard limits block submission entirely.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 15H15C15.3978 15 15.7794 14.842 16.0607 14.5607C16.342 14.2794 16.5 13.8978 16.5 13.5V6C16.5 5.60218 16.342 5.22064 16.0607 4.93934C15.7794 4.65804 15.3978 4.5 15 4.5H9.0525C8.80544 4.49872 8.56252 4.43644 8.34532 4.31868C8.12813 4.20092 7.94338 4.03134 7.8075 3.825L7.1925 2.925C7.05662 2.71866 6.87187 2.54908 6.65468 2.43132C6.43748 2.31356 6.19456 2.25128 5.9475 2.25H3C2.60218 2.25 2.22064 2.40804 1.93934 2.68934C1.65804 2.97064 1.5 3.35218 1.5 3.75V13.5C1.5 14.325 2.175 15 3 15Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 7.5V10.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 7.5V9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 7.5V12" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Category Rules',
		description: 'Configure which categories are allowed for which roles. Block alcohol charges, cap meal amounts per person, require business justification above thresholds.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.70117 15.75C7.83283 15.978 8.02218 16.1674 8.25021 16.299C8.47823 16.4306 8.73688 16.4999 9.00017 16.4999C9.26346 16.4999 9.52212 16.4306 9.75014 16.299C9.97816 16.1674 10.1675 15.978 10.2992 15.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.44595 11.4945C2.34798 11.6019 2.28332 11.7354 2.25984 11.8789C2.23637 12.0223 2.25509 12.1695 2.31373 12.3025C2.37237 12.4356 2.4684 12.5487 2.59014 12.6281C2.71188 12.7075 2.85409 12.7499 2.99945 12.75H14.9995C15.1448 12.7501 15.287 12.7079 15.4089 12.6286C15.5307 12.5493 15.6268 12.4363 15.6856 12.3034C15.7444 12.1705 15.7633 12.0233 15.74 11.8798C15.7167 11.7364 15.6523 11.6028 15.5545 11.4952C14.557 10.467 13.4995 9.37425 13.4995 6C13.4995 4.80653 13.0253 3.66193 12.1814 2.81802C11.3375 1.97411 10.1929 1.5 8.99945 1.5C7.80598 1.5 6.66139 1.97411 5.81747 2.81802C4.97356 3.66193 4.49945 4.80653 4.49945 6C4.49945 9.37425 3.4412 10.467 2.44595 11.4945Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Submission Deadlines',
		description: 'Require expenses within N days of the transaction date. Auto-flag stale submissions before they become year-end surprises.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M10.875 3H7.125L5.25 5.25H3C2.60218 5.25 2.22064 5.40804 1.93934 5.68934C1.65804 5.97064 1.5 6.35218 1.5 6.75V13.5C1.5 13.8978 1.65804 14.2794 1.93934 14.5607C2.22064 14.842 2.60218 15 3 15H15C15.3978 15 15.7794 14.842 16.0607 14.5607C16.342 14.2794 16.5 13.8978 16.5 13.5V6.75C16.5 6.35218 16.342 5.97064 16.0607 5.68934C15.7794 5.40804 15.3978 5.25 15 5.25H12.75L10.875 3Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 12C10.2426 12 11.25 10.9926 11.25 9.75C11.25 8.50736 10.2426 7.5 9 7.5C7.75736 7.5 6.75 8.50736 6.75 9.75C6.75 10.9926 7.75736 12 9 12Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Receipt Requirements',
		description: 'Require a receipt for any expense above your threshold. No image, no reimbursement. Enforced automatically at submission.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.70117 15.75C7.83283 15.978 8.02218 16.1674 8.25021 16.299C8.47823 16.4306 8.73688 16.4999 9.00017 16.4999C9.26346 16.4999 9.52212 16.4306 9.75014 16.299C9.97816 16.1674 10.1675 15.978 10.2992 15.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.44595 11.4945C2.34798 11.6019 2.28332 11.7354 2.25984 11.8789C2.23637 12.0223 2.25509 12.1695 2.31373 12.3025C2.37237 12.4356 2.4684 12.5487 2.59014 12.6281C2.71188 12.7075 2.85409 12.7499 2.99945 12.75H14.9995C15.1448 12.7501 15.287 12.7079 15.4089 12.6286C15.5307 12.5493 15.6268 12.4363 15.6856 12.3034C15.7444 12.1705 15.7633 12.0233 15.74 11.8798C15.7167 11.7364 15.6523 11.6028 15.5545 11.4952C14.557 10.467 13.4995 9.37425 13.4995 6C13.4995 4.80653 13.0253 3.66193 12.1814 2.81802C11.3375 1.97411 10.1929 1.5 8.99945 1.5C7.80598 1.5 6.66139 1.97411 5.81747 2.81802C4.97356 3.66193 4.49945 4.80653 4.49945 6C4.49945 9.37425 3.4412 10.467 2.44595 11.4945Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Project & Cost Center Coding',
		description: 'Require employees to tag expenses to a project or department at submission. Eliminates month-end allocation guesswork.',
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.70117 15.75C7.83283 15.978 8.02218 16.1674 8.25021 16.299C8.47823 16.4306 8.73688 16.4999 9.00017 16.4999C9.26346 16.4999 9.52212 16.4306 9.75014 16.299C9.97816 16.1674 10.1675 15.978 10.2992 15.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.44595 11.4945C2.34798 11.6019 2.28332 11.7354 2.25984 11.8789C2.23637 12.0223 2.25509 12.1695 2.31373 12.3025C2.37237 12.4356 2.4684 12.5487 2.59014 12.6281C2.71188 12.7075 2.85409 12.7499 2.99945 12.75H14.9995C15.1448 12.7501 15.287 12.7079 15.4089 12.6286C15.5307 12.5493 15.6268 12.4363 15.6856 12.3034C15.7444 12.1705 15.7633 12.0233 15.74 11.8798C15.7167 11.7364 15.6523 11.6028 15.5545 11.4952C14.557 10.467 13.4995 9.37425 13.4995 6C13.4995 4.80653 13.0253 3.66193 12.1814 2.81802C11.3375 1.97411 10.1929 1.5 8.99945 1.5C7.80598 1.5 6.66139 1.97411 5.81747 2.81802C4.97356 3.66193 4.49945 4.80653 4.49945 6C4.49945 9.37425 3.4412 10.467 2.44595 11.4945Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Real-Time Alerts',
		description: 'Finance gets notified when high-value expenses are submitted, when policy violations are attempted, and when budgets are near limits.',
	},
]

const Features = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
					{/* Left: text */}
					<AnimateOnScroll animation="animate-fade-in-left" className="lg:sticky lg:top-32">
						<GradientBadge>What We Migrate</GradientBadge>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight sm:leading-snug lg:leading-[1.15] mt-2 mb-5">
							Bring everything you have.{' '}
							<br className="hidden sm:block" />
							We handle all of it.
						</h2>
						<p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
							Whatever tool you are coming from, whatever format your data is in —
							we have migrated it before.
						</p>
					</AnimateOnScroll>

					{/* Right: feature grid */}
					<AnimateOnScroll animation="animate-fade-in-right" delay={150}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							{dataItems.map((item, idx) => (
								<AnimateOnScroll
									key={item.title}
									delay={idx * 60}
									className="flex flex-col hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(79,35,180,0.35)] transition-all duration-400"
									style={{
										borderRadius: '16px',
										border: '1px solid #fff',
										background: '#0E0C1A',
										padding: '20px',
										minHeight: '240px',
									}}
								>
									{/* Icon — small purple rounded square, top-left */}
									<div
										style={{
											width: '36px',
											height: '36px',
											background: 'rgba(112, 62, 213, 0.35)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0,
										}}
										className='rounded-full'
									>
										{item.icon}
									</div>

									{/* Spacer pushes title+desc to bottom */}
									<div className="flex-1" />

									{/* Title + description at bottom */}
									<div className="mt-6">
										<p className="text-[#F9F9F9] font-semibold text-sm sm:text-base mb-1.5">
											{item.title}
										</p>
										<p className="text-white/50 text-xs leading-relaxed">
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
	)
}

export default Features